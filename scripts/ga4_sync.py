import hashlib
import os
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo

from google.analytics.admin import AnalyticsAdminServiceClient
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunRealtimeReportRequest,
    RunReportRequest,
)
from googleapiclient.discovery import build

SPREADSHEET_ID = os.environ.get(
    "FLEISSIG_SPREADSHEET_ID",
    "162L8UbKvna-uha_dC8XTsBqo38mlM9iGFIaszZOIHc8",
)
PROPERTY_DISPLAY_NAME = os.environ.get("GA4_PROPERTY_NAME", "Fleissig-Reinigung")
PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "").strip()
PROPERTY_TZ = ZoneInfo("Europe/Zurich")

TARGET_EVENTS = {
    "whatsapp_click",
    "phone_click",
    "calculator_complete",
    "umzug_whatsapp_click",
    "fenster_whatsapp_click",
}

# CRM uses one canonical contact event per action. The specialized WhatsApp
# events remain in GA4 for diagnostics, but are not imported as extra leads.
LEAD_EVENTS = {"whatsapp_click", "phone_click"}
REALTIME_LEAD_EVENTS = {"whatsapp_click", "phone_click"}

UNKNOWN_VALUES = {"", "(not set)"}
CLICK_ID_KEYS = ("gclid", "gbraid", "wbraid")

LEADS_HEADERS = [
    "Дата/время",
    "Lead ID",
    "Источник",
    "Канал",
    "Кампания",
    "Ключевая фраза",
    "ID рекламного клика",
    "Страница входа",
    "Услуга",
    "Город",
    "Клиент",
    "Телефон",
    "Статус",
    "Оценка от CHF",
    "Оценка до CHF",
    "Офер CHF",
    "Заказ CHF",
    "Прямые затраты CHF",
    "Валовая прибыль CHF",
    "Дата работы",
    "Причина отказа",
    "Комментарий",
    "Последнее обновление",
    "Ответственный",
]


def discover_property_id() -> str:
    if PROPERTY_ID:
        return PROPERTY_ID.replace("properties/", "")

    admin = AnalyticsAdminServiceClient()
    for account_summary in admin.list_account_summaries():
        for prop in account_summary.property_summaries:
            if prop.display_name == PROPERTY_DISPLAY_NAME:
                return prop.property.replace("properties/", "")

    raise RuntimeError(
        f"GA4 property '{PROPERTY_DISPLAY_NAME}' was not found for this service account"
    )


def rows_from_report(response):
    rows = []
    for row in response.rows:
        dims = [v.value for v in row.dimension_values]
        metrics = [v.value for v in row.metric_values]
        rows.append(dims + metrics)
    return rows


def ensure_sheet(sheets, title: str):
    spreadsheet = sheets.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    existing = {s["properties"]["title"] for s in spreadsheet.get("sheets", [])}
    if title in existing:
        return
    sheets.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
    ).execute()


def ensure_leads_headers(sheets):
    ensure_sheet(sheets, "Leads")
    sheets.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!A1:X1",
        valueInputOption="RAW",
        body={"values": [LEADS_HEADERS]},
    ).execute()


def replace_sheet(sheets, title: str, values):
    ensure_sheet(sheets, title)
    sheets.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{title}'!A:Z",
        body={},
    ).execute()
    if values:
        sheets.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{title}'!A1",
            valueInputOption="RAW",
            body={"values": values},
        ).execute()


def clean_ga_value(value: str) -> str:
    value = (value or "").strip()
    return "" if value in UNKNOWN_VALUES else value


def parse_url_params(value: str):
    try:
        query = urlsplit(value or "").query
        params = parse_qs(query)
    except Exception:
        return {}
    return {key.lower(): values[0] for key, values in params.items() if values}


def path_plus_query(value: str) -> str:
    try:
        parsed = urlsplit(value or "")
    except Exception:
        return ""
    if not parsed.path and not parsed.query:
        return ""
    result = parsed.path or "/"
    if parsed.query:
        result += f"?{parsed.query}"
    return result[:1000]


def referrer_host(value: str) -> str:
    try:
        return urlsplit(value or "").hostname.lower().removeprefix("www.")
    except Exception:
        return ""


def has_click_id(params: dict) -> bool:
    return any(params.get(key) for key in CLICK_ID_KEYS)


def combine_params(*sources):
    result = {}
    for source in sources:
        for key, value in (source or {}).items():
            if value:
                result[key] = value
    return result


def infer_technical_attribution(
    session_source: str,
    session_medium: str,
    landing_page: str,
    page_location: str,
    page_referrer: str,
):
    source = clean_ga_value(session_source)
    medium = clean_ga_value(session_medium)

    landing_params = parse_url_params(landing_page)
    page_params = parse_url_params(page_location)
    params = combine_params(landing_params, page_params)

    if has_click_id(params):
        source = "google"
        medium = "cpc"
    else:
        source = source or params.get("utm_source", "")
        medium = medium or params.get("utm_medium", "")

    if not source:
        host = referrer_host(page_referrer)
        if host:
            if "google." in host:
                source, medium = "google", medium or "organic"
            elif "bing." in host or "duckduckgo." in host:
                source, medium = host, medium or "organic"
            else:
                source, medium = host, medium or "referral"

    # Preserve a real GA4 direct visit. Unknown remains unknown and must not be
    # silently rewritten as Direct.
    if source == "(direct)":
        source = "direct"
    if medium == "(none)" and source == "direct":
        medium = "direct"

    return source, medium, params


def friendly_source(source: str, medium: str) -> str:
    src = (source or "").lower()
    med = (medium or "").lower()

    if src == "google" and med in {"cpc", "ppc", "paid", "paid_search"}:
        return "Google Ads"
    if src == "google" and med == "organic":
        return "Google поиск"
    if src == "direct":
        return "Прямой заход"
    if src in {"fb", "ig", "facebook", "instagram", "facebook.com", "instagram.com", "l.facebook.com", "lm.facebook.com"}:
        return "Facebook / Instagram"
    if med == "organic":
        return "Другой поиск"
    if med in {"referral", "social", "organic_social"} or src:
        return "Другой сайт"
    return "Не определено"


def friendly_medium(source: str, medium: str) -> str:
    src = (source or "").lower()
    med = (medium or "").lower()

    if med in {"cpc", "ppc", "paid", "paid_search", "paid_social"}:
        return "Платная реклама"
    if med == "organic":
        return "Бесплатный поиск"
    if src == "direct" or med == "direct":
        return "Прямой"
    if med in {"social", "organic_social"}:
        return "Соцсети"
    if med == "referral":
        return "Переход по ссылке"
    return "Не определено"


def choose_effective_landing(landing_page: str, page_location: str, params: dict) -> str:
    landing = (landing_page or "").strip()
    current = path_plus_query(page_location)
    landing_params = parse_url_params(landing)

    # GA4 may expose a clean landing page while the event page still contains
    # the Google click ID. Prefer the event URL in that case so offline
    # conversion attribution can keep the click identifier.
    if current and has_click_id(params) and not has_click_id(landing_params):
        return current
    return landing or current


def service_for_lead(event_name: str, page_context: str) -> str:
    page = (page_context or "").lower()
    if "umzugsreinigung" in page:
        return "Umzugsreinigung"
    if "fensterreinigung" in page:
        return "Fensterreinigung"
    if event_name == "phone_click":
        return "Telefonanfrage"
    return "Reinigungsanfrage"


def make_lead_id(property_id: str, date_hour_minute: str, event_name: str, ordinal: int) -> str:
    seed = "|".join([property_id, date_hour_minute, event_name, str(ordinal)])
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()[:8].upper()
    stamp = date_hour_minute if len(date_hour_minute) == 12 else datetime.now(PROPERTY_TZ).strftime("%Y%m%d%H%M")
    return f"FR-{stamp[2:8]}-{stamp[8:12]}-{digest}"


def display_datetime(date_hour_minute: str) -> str:
    try:
        parsed = datetime.strptime(date_hour_minute, "%Y%m%d%H%M")
        return parsed.strftime("%d.%m.%Y %H:%M")
    except Exception:
        return date_hour_minute


def load_existing_leads(sheets):
    ensure_sheet(sheets, "Leads")
    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!A2:X",
    ).execute()
    existing = {}
    for offset, row in enumerate(response.get("values", []), start=2):
        lead_id = row[1] if len(row) > 1 else ""
        if lead_id and not str(lead_id).startswith("#"):
            existing[lead_id] = {"row": offset, "values": row}
    return existing


def append_leads(sheets, lead_rows):
    if not lead_rows:
        return 0
    sheets.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!A:X",
        valueInputOption="RAW",
        insertDataOption="INSERT_ROWS",
        body={"values": lead_rows},
    ).execute()
    return len(lead_rows)


def enrich_existing_leads(sheets, updates):
    if not updates:
        return 0
    data = []
    for row_number, values_c_to_i, synced_at in updates:
        data.append({"range": f"'Leads'!C{row_number}:I{row_number}", "values": [values_c_to_i]})
        data.append({"range": f"'Leads'!W{row_number}", "values": [[synced_at]]})
    sheets.spreadsheets().values().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"valueInputOption": "RAW", "data": data},
    ).execute()
    return len(updates)


def build_lead_row(
    date_hour_minute: str,
    lead_id: str,
    source: str,
    medium: str,
    campaign: str,
    keyword: str,
    click_id: str,
    landing_page: str,
    service: str,
    comment: str,
    synced_at: str,
):
    return [
        display_datetime(date_hour_minute), lead_id, source, medium, campaign, keyword,
        click_id, landing_page, service, "", "", "", "Новый", "", "", "", "",
        "", "", "", "", comment, synced_at, "",
    ]


def run_lead_report(data, property_id: str):
    candidates = [
        [
            "dateHourMinute", "eventName", "sessionSource", "sessionMedium",
            "sessionCampaignName", "sessionManualTerm", "sessionGoogleAdsKeyword",
            "landingPagePlusQueryString", "pageLocation", "pageReferrer",
        ],
        [
            "dateHourMinute", "eventName", "sessionSource", "sessionMedium",
            "sessionCampaignName", "landingPagePlusQueryString", "pageLocation",
            "pageReferrer",
        ],
        [
            "dateHourMinute", "eventName", "sessionSource", "sessionMedium",
            "sessionCampaignName", "landingPagePlusQueryString",
        ],
    ]

    last_error = None
    for dimensions in candidates:
        try:
            response = data.run_report(
                RunReportRequest(
                    property=f"properties/{property_id}",
                    dimensions=[Dimension(name=name) for name in dimensions],
                    metrics=[Metric(name="eventCount")],
                    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
                    limit=100000,
                )
            )
            return dimensions, response
        except Exception as exc:
            last_error = exc
            print(f"Lead report dimensions unavailable ({', '.join(dimensions)}): {exc}")

    raise RuntimeError(f"No compatible GA4 lead report dimensions: {last_error}")


def sync_processed_leads(data, sheets, property_id: str, synced_at: str):
    dimension_names, response = run_lead_report(data, property_id)
    existing = load_existing_leads(sheets)
    new_rows = []
    enrich_updates = []

    for raw_row in rows_from_report(response):
        values = dict(zip(dimension_names + ["eventCount"], raw_row))
        event_name = values.get("eventName", "")
        if event_name not in LEAD_EVENTS:
            continue

        date_hour_minute = values.get("dateHourMinute", "")
        landing_page = values.get("landingPagePlusQueryString", "")
        page_location = values.get("pageLocation", "")
        page_referrer = values.get("pageReferrer", "")

        source_raw, medium_raw, params = infer_technical_attribution(
            values.get("sessionSource", ""),
            values.get("sessionMedium", ""),
            landing_page,
            page_location,
            page_referrer,
        )

        source = friendly_source(source_raw, medium_raw)
        medium = friendly_medium(source_raw, medium_raw)
        campaign = clean_ga_value(values.get("sessionCampaignName", "")) or params.get("utm_campaign", "")
        google_keyword = clean_ga_value(values.get("sessionGoogleAdsKeyword", ""))
        manual_term = clean_ga_value(values.get("sessionManualTerm", ""))
        keyword = google_keyword or manual_term or params.get("utm_term", "")
        click_id = params.get("gclid", "")
        effective_landing = choose_effective_landing(landing_page, page_location, params)
        service = service_for_lead(event_name, effective_landing or page_location)

        try:
            count = max(1, int(float(values.get("eventCount", "1"))))
        except Exception:
            count = 1

        for ordinal in range(1, count + 1):
            lead_id = make_lead_id(property_id, date_hour_minute, event_name, ordinal)
            enrichment = [source, medium, campaign, keyword, click_id, effective_landing, service]

            if lead_id in existing:
                enrich_updates.append((existing[lead_id]["row"], enrichment, synced_at))
                continue

            new_rows.append(
                build_lead_row(
                    date_hour_minute,
                    lead_id,
                    source,
                    medium,
                    campaign,
                    keyword,
                    click_id,
                    effective_landing,
                    service,
                    f"Auto-import aus GA4: {event_name}",
                    synced_at,
                )
            )
            existing[lead_id] = {"row": None, "values": new_rows[-1]}

    added = append_leads(sheets, new_rows)
    enriched = enrich_existing_leads(sheets, enrich_updates)
    return added, enriched


def sync_realtime_leads(data, sheets, property_id: str, synced_at: str) -> int:
    response = data.run_realtime_report(
        RunRealtimeReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="eventName"), Dimension(name="minutesAgo")],
            metrics=[Metric(name="eventCount")],
            limit=10000,
        )
    )

    existing = load_existing_leads(sheets)
    now_local = datetime.now(timezone.utc).astimezone(PROPERTY_TZ)
    new_rows = []

    for event_name, minutes_ago_raw, event_count_raw in rows_from_report(response):
        if event_name not in REALTIME_LEAD_EVENTS:
            continue

        try:
            minutes_ago = int(minutes_ago_raw)
        except Exception:
            minutes_ago = 0
        event_time = (now_local - timedelta(minutes=minutes_ago)).replace(second=0, microsecond=0)
        date_hour_minute = event_time.strftime("%Y%m%d%H%M")

        try:
            count = max(1, int(float(event_count_raw)))
        except Exception:
            count = 1

        for ordinal in range(1, count + 1):
            lead_id = make_lead_id(property_id, date_hour_minute, event_name, ordinal)
            if lead_id in existing:
                continue

            new_rows.append(
                build_lead_row(
                    date_hour_minute,
                    lead_id,
                    "Ожидает данных",
                    "Ожидает данных",
                    "",
                    "",
                    "",
                    "",
                    service_for_lead(event_name, ""),
                    f"Auto-import aus GA4 Realtime: {event_name}",
                    synced_at,
                )
            )
            existing[lead_id] = {"row": None, "values": new_rows[-1]}

    return append_leads(sheets, new_rows)


def main():
    property_id = discover_property_id()
    data = BetaAnalyticsDataClient()
    sheets = build("sheets", "v4", cache_discovery=False)
    synced_at = datetime.now(timezone.utc).isoformat()

    ensure_leads_headers(sheets)

    events_response = data.run_report(
        RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[
                Dimension(name="date"), Dimension(name="eventName"),
                Dimension(name="sessionSource"), Dimension(name="sessionMedium"),
                Dimension(name="sessionCampaignName"),
            ],
            metrics=[Metric(name="eventCount"), Metric(name="totalUsers")],
            date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
            limit=100000,
        )
    )
    event_rows = [row for row in rows_from_report(events_response) if row[1] in TARGET_EVENTS]
    replace_sheet(
        sheets,
        "Analytics Events",
        [["Date", "Event", "Source", "Medium", "Campaign", "Event count", "Users", "Synced at UTC", "Property ID"]]
        + [row + [synced_at, property_id] for row in event_rows],
    )

    pages_response = data.run_report(
        RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[
                Dimension(name="date"), Dimension(name="landingPagePlusQueryString"),
                Dimension(name="sessionSource"), Dimension(name="sessionMedium"),
                Dimension(name="sessionCampaignName"),
            ],
            metrics=[Metric(name="sessions"), Metric(name="totalUsers")],
            date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
            limit=100000,
        )
    )
    page_rows = rows_from_report(pages_response)
    replace_sheet(
        sheets,
        "Analytics Pages",
        [["Date", "Landing page", "Source", "Medium", "Campaign", "Sessions", "Users", "Synced at UTC", "Property ID"]]
        + [row + [synced_at, property_id] for row in page_rows],
    )

    realtime_response = data.run_realtime_report(
        RunRealtimeReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")],
            limit=1000,
        )
    )
    realtime_rows = rows_from_report(realtime_response)
    replace_sheet(
        sheets,
        "Analytics Realtime",
        [["Event", "Event count (last 30 min)", "Synced at UTC", "Property ID"]]
        + [row + [synced_at, property_id] for row in realtime_rows],
    )

    processed_added, processed_enriched = sync_processed_leads(data, sheets, property_id, synced_at)
    realtime_added = sync_realtime_leads(data, sheets, property_id, synced_at)

    print(
        f"Synced GA4 property {property_id} into spreadsheet {SPREADSHEET_ID}; "
        f"processed leads added={processed_added}, enriched={processed_enriched}, "
        f"realtime leads added={realtime_added}"
    )


if __name__ == "__main__":
    main()
