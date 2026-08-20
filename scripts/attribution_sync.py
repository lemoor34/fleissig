import hashlib
import os
from collections import defaultdict
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit
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

LEAD_EVENTS = {"whatsapp_click", "phone_click"}
TARGET_EVENTS = LEAD_EVENTS | {
    "calculator_complete",
    "conversion_event_contact",
    "umzug_whatsapp_click",
    "fenster_whatsapp_click",
}
UNKNOWN_GA = {"", "(not set)", "(not provided)"}
PAID_MEDIA = {"cpc", "ppc", "paid", "paid_search", "paid_social", "display"}
KNOWN_AUTO_SOURCES = {
    "Google Ads",
    "Google поиск",
    "Прямой заход",
    "Facebook / Instagram",
    "Другой поиск",
    "Другой сайт",
    "Не определено",
    "Ожидает данных",
}

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

ATTR_HEADERS = [
    "Автоисточник",
    "Первый источник",
    "Первый канал",
    "Последний источник",
    "Последний канал",
    "Основание атрибуции",
    "Уверенность",
    "Тип трафика",
    "Путь клиента",
    "Первый вход",
    "Последний вход",
    "ID пути",
    "Автоканал",
]

TOTAL_COLUMNS = 41


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
        dims = [value.value for value in row.dimension_values]
        metrics = [value.value for value in row.metric_values]
        rows.append(dims + metrics)
    return rows


def clean_ga(value: str) -> str:
    value = str(value or "").strip()
    return "" if value in UNKNOWN_GA else value


def ensure_sheet(sheets, title: str):
    meta = sheets.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    existing = {item["properties"]["title"] for item in meta.get("sheets", [])}
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
    # Y:AB stay reserved for Google Ads conversion helper fields.
    sheets.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!AC1:AO1",
        valueInputOption="RAW",
        body={"values": [ATTR_HEADERS]},
    ).execute()


def replace_sheet(sheets, title: str, values, clear_range="A:Z"):
    ensure_sheet(sheets, title)
    sheets.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{title}'!{clear_range}",
        body={},
    ).execute()
    if values:
        sheets.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{title}'!A1",
            valueInputOption="RAW",
            body={"values": values},
        ).execute()


def parse_params(value: str):
    try:
        params = parse_qs(urlsplit(value or "").query)
    except Exception:
        return {}
    return {key.lower(): values[0] for key, values in params.items() if values}


def referrer_host(value: str) -> str:
    try:
        return (urlsplit(value or "").hostname or "").lower().removeprefix("www.")
    except Exception:
        return ""


def normalize_technical(source: str, medium: str):
    source = clean_ga(source)
    medium = clean_ga(medium)

    if source == "(direct)":
        source = "direct"
    if medium == "(none)" and source == "direct":
        medium = "direct"

    return source, medium


def source_from_referrer(referrer: str):
    host = referrer_host(referrer)
    if not host:
        return "", ""
    if "google." in host:
        return "google", "organic"
    if "bing." in host or "duckduckgo." in host:
        return host, "organic"
    if (
        "facebook." in host
        or "instagram." in host
        or host in {"l.facebook.com", "lm.facebook.com"}
    ):
        return host, "social"
    return host, "referral"


def friendly_source(source: str, medium: str) -> str:
    src = (source or "").lower()
    med = (medium or "").lower()

    if src == "google" and med in PAID_MEDIA:
        return "Google Ads"
    if src == "google" and med == "organic":
        return "Google поиск"
    if src == "direct":
        return "Прямой заход"
    if src in {
        "fb", "ig", "facebook", "instagram", "facebook.com", "instagram.com",
        "l.facebook.com", "lm.facebook.com",
    } or "facebook." in src or "instagram." in src:
        return "Facebook / Instagram"
    if med == "organic":
        return "Другой поиск"
    if src:
        return "Другой сайт"
    return "Не определено"


def friendly_medium(source: str, medium: str) -> str:
    src = (source or "").lower()
    med = (medium or "").lower()

    if med in PAID_MEDIA:
        return "Платная реклама"
    if med == "organic":
        return "Бесплатный поиск"
    if med in {"social", "organic_social"}:
        return "Соцсети"
    if med == "referral":
        return "Переход по ссылке"
    if src == "direct" or med == "direct":
        return "Прямой"
    return "Не определено"


def traffic_type(source: str, medium: str) -> str:
    src = (source or "").lower()
    med = (medium or "").lower()

    if med in PAID_MEDIA or source == "Google Ads":
        return "Платный"
    if med == "organic" or source in {"Google поиск", "Другой поиск"}:
        return "Бесплатный поиск"
    if med in {"social", "organic_social"} or source == "Facebook / Instagram":
        return "Соцсети"
    if med == "referral" or source == "Другой сайт":
        return "Переход с сайта"
    if src == "direct" or source == "Прямой заход":
        return "Прямой / неизвестный"
    return "Не определено"


def traffic_type_from_friendly(source: str, fallback: str = "Не определено") -> str:
    mapping = {
        "Google Ads": "Платный",
        "Google поиск": "Бесплатный поиск",
        "Google Organic": "Бесплатный поиск",
        "Facebook / Instagram": "Соцсети",
        "Instagram": "Соцсети",
        "Прямой заход": "Прямой / неизвестный",
        "Direct": "Прямой / неизвестный",
        "Рекомендация": "Рекомендация",
        "Auftrago": "Платформа",
        "Google Business Profile": "Google Business Profile",
        "Не определено": "Не определено",
    }
    return mapping.get(source, fallback)


def manual_channel_for_source(source: str, fallback: str = "") -> str:
    mapping = {
        "Google Ads": "Платная реклама",
        "Google поиск": "Бесплатный поиск",
        "Google Organic": "Бесплатный поиск",
        "Facebook / Instagram": "Соцсети",
        "Instagram": "Соцсети",
        "Прямой заход": "Прямой",
        "Direct": "Прямой",
        "Рекомендация": "Со слов клиента",
        "Auftrago": "Платформа",
        "Google Business Profile": "Google Business Profile",
    }
    return mapping.get(source, fallback or "Вручную")


def strip_internal_params(value: str) -> str:
    if not value:
        return ""
    try:
        parts = urlsplit(value)
        params = parse_qs(parts.query, keep_blank_values=True)
        cleaned = []
        for key, values in params.items():
            if key.startswith("fr_"):
                continue
            for item in values:
                cleaned.append((key, item))
        query = urlencode(cleaned)
        path = parts.path or "/"
        if parts.scheme and parts.netloc:
            return urlunsplit((parts.scheme, parts.netloc, path, query, ""))[:1000]
        return (path + (f"?{query}" if query else ""))[:1000]
    except Exception:
        return str(value)[:1000]


def display_path(value: str) -> str:
    if not value:
        return ""
    try:
        parts = urlsplit(value)
        path = parts.path or "/"
        return (path + (f"?{parts.query}" if parts.query else ""))[:1000]
    except Exception:
        return str(value)[:1000]


def service_name(raw: str, page_context: str, event_name: str) -> str:
    raw = (raw or "").lower()
    page = (page_context or "").lower()

    if raw == "umzugsreinigung" or "umzugsreinigung" in page:
        return "Umzugsreinigung"
    if raw == "fensterreinigung" or "fensterreinigung" in page:
        return "Fensterreinigung"
    if raw == "allgemeine_reinigung":
        return "Reinigungsanfrage"
    if event_name == "phone_click":
        return "Telefonanfrage"
    return "Reinigungsanfrage"


def make_lead_id(property_id: str, date_hour_minute: str, event_name: str, ordinal: int) -> str:
    seed = "|".join([property_id, date_hour_minute, event_name, str(ordinal)])
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()[:8].upper()
    stamp = (
        date_hour_minute
        if len(date_hour_minute) == 12
        else datetime.now(PROPERTY_TZ).strftime("%Y%m%d%H%M")
    )
    return f"FR-{stamp[2:8]}-{stamp[8:12]}-{digest}"


def display_datetime(date_hour_minute: str) -> str:
    try:
        parsed = datetime.strptime(date_hour_minute, "%Y%m%d%H%M")
        return parsed.strftime("%d.%m.%Y %H:%M")
    except Exception:
        return date_hour_minute


def as_number(value):
    if value is None or value == "":
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace("CHF", "").replace("'", "").replace(" ", "")
    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return 0.0


def run_report_candidates(data, property_id: str, candidates, days="14daysAgo", metrics=None):
    last_error = None
    metrics = metrics or ["eventCount"]
    for dimensions in candidates:
        try:
            response = data.run_report(
                RunReportRequest(
                    property=f"properties/{property_id}",
                    dimensions=[Dimension(name=name) for name in dimensions],
                    metrics=[Metric(name=name) for name in metrics],
                    date_ranges=[DateRange(start_date=days, end_date="today")],
                    limit=100000,
                )
            )
            return dimensions, response
        except Exception as exc:
            last_error = exc
            print(f"Report dimensions unavailable ({', '.join(dimensions)}): {exc}")
    raise RuntimeError(f"No compatible GA4 report dimensions: {last_error}")


def load_existing_leads(sheets):
    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!A2:AO",
    ).execute()
    existing = {}
    for sheet_row, row in enumerate(response.get("values", []), start=2):
        padded = list(row) + [""] * (TOTAL_COLUMNS - len(row))
        lead_id = str(padded[1] or "").strip()
        if lead_id and not lead_id.startswith("#"):
            existing[lead_id] = {"row": sheet_row, "values": padded}
    return existing


def event_report(data, property_id: str):
    return run_report_candidates(
        data,
        property_id,
        [
            ["dateHourMinute", "eventName", "pageLocation", "pageReferrer"],
            ["dateHourMinute", "eventName", "pageLocation"],
            ["dateHourMinute", "eventName"],
        ],
        days="14daysAgo",
    )


def session_report(data, property_id: str):
    return run_report_candidates(
        data,
        property_id,
        [
            [
                "dateHourMinute",
                "eventName",
                "sessionSource",
                "sessionMedium",
                "sessionCampaignName",
                "sessionManualTerm",
                "sessionGoogleAdsKeyword",
                "landingPagePlusQueryString",
            ],
            [
                "dateHourMinute",
                "eventName",
                "sessionSource",
                "sessionMedium",
                "sessionCampaignName",
                "landingPagePlusQueryString",
            ],
        ],
        days="14daysAgo",
    )


def build_session_map(dimension_names, response):
    result = {}
    for raw in rows_from_report(response):
        values = dict(zip(dimension_names + ["eventCount"], raw))
        event_name = values.get("eventName", "")
        if event_name not in LEAD_EVENTS:
            continue
        key = (values.get("dateHourMinute", ""), event_name)
        result[key] = values
    return result


def parse_attribution(event_values, session_values):
    page_location = event_values.get("pageLocation", "")
    page_referrer = event_values.get("pageReferrer", "")
    params = parse_params(page_location)

    session_source, session_medium = normalize_technical(
        session_values.get("sessionSource", ""),
        session_values.get("sessionMedium", ""),
    )

    synthetic_source = params.get("fr_src", "")
    synthetic_medium = params.get("fr_med", "")
    gclid = params.get("gclid", "")
    gbraid = params.get("gbraid", "")
    wbraid = params.get("wbraid", "")
    has_click_id = bool(gclid or gbraid or wbraid)

    if synthetic_source:
        source_raw = synthetic_source
        medium_raw = synthetic_medium
        basis = "Путь сайта"
        confidence = "Высокая" if source_raw not in {"direct", "unknown"} else "Средняя"
    elif has_click_id:
        source_raw = "google"
        medium_raw = "cpc"
        basis = "ID рекламного клика"
        confidence = "Высокая"
    elif session_source:
        source_raw = session_source
        medium_raw = session_medium
        basis = "GA4 сессия"
        confidence = "Средняя" if source_raw == "direct" else "Высокая"
    else:
        ref_source, ref_medium = source_from_referrer(page_referrer)
        if ref_source:
            source_raw, medium_raw = ref_source, ref_medium
            basis = "Реферер"
            confidence = "Средняя"
        else:
            source_raw, medium_raw = "", ""
            basis = "Нет данных"
            confidence = "Низкая"

    auto_source = friendly_source(source_raw, medium_raw)
    auto_medium = friendly_medium(source_raw, medium_raw)

    first_source_raw = params.get("fr_first_src", "") or source_raw
    first_medium_raw = params.get("fr_first_med", "") or medium_raw
    last_source_raw = params.get("fr_last_src", "") or source_raw
    last_medium_raw = params.get("fr_last_med", "") or medium_raw

    first_source = friendly_source(first_source_raw, first_medium_raw)
    first_medium = friendly_medium(first_source_raw, first_medium_raw)
    last_source = friendly_source(last_source_raw, last_medium_raw)
    last_medium = friendly_medium(last_source_raw, last_medium_raw)

    session_landing = session_values.get("landingPagePlusQueryString", "")
    first_landing = params.get("fr_first_lp", "") or session_landing or page_location
    last_landing = params.get("fr_last_lp", "") or page_location
    first_landing = display_path(strip_internal_params(first_landing))
    last_landing = display_path(strip_internal_params(last_landing))

    campaign = (
        params.get("utm_campaign", "")
        or clean_ga(session_values.get("sessionCampaignName", ""))
    )
    keyword = (
        params.get("utm_term", "")
        or clean_ga(session_values.get("sessionGoogleAdsKeyword", ""))
        or clean_ga(session_values.get("sessionManualTerm", ""))
    )

    click_landing = first_landing
    if has_click_id and not any(
        parse_params(click_landing).get(key) for key in ("gclid", "gbraid", "wbraid")
    ):
        click_landing = display_path(strip_internal_params(page_location))

    return {
        "auto_source": auto_source,
        "auto_medium": auto_medium,
        "source_raw": source_raw,
        "medium_raw": medium_raw,
        "campaign": campaign,
        "keyword": keyword,
        "gclid": gclid,
        "gbraid": gbraid,
        "wbraid": wbraid,
        "landing": click_landing or first_landing or "/",
        "first_source": first_source,
        "first_medium": first_medium,
        "last_source": last_source,
        "last_medium": last_medium,
        "basis": basis,
        "confidence": confidence,
        "traffic_type": traffic_type(auto_source, medium_raw),
        "touch_path": params.get("fr_path", "")[:500],
        "first_landing": first_landing,
        "last_landing": last_landing,
        "journey_id": params.get("fr_jid", "")[:120],
        "service": service_name(
            params.get("fr_service", ""),
            first_landing or last_landing or page_location,
            event_values.get("eventName", ""),
        ),
    }


def manual_override(existing_row):
    old_source = str(existing_row[2] or "").strip()
    old_auto = str(existing_row[28] or "").strip()
    comment = str(existing_row[21] or "")

    if old_auto:
        return old_source if old_source and old_source != old_auto else ""
    if old_source and "Auto-import" not in comment and old_source not in KNOWN_AUTO_SOURCES:
        return old_source
    return ""


def build_attr_values(attr, final_source, basis, confidence):
    traffic = (
        traffic_type_from_friendly(final_source, attr["traffic_type"])
        if final_source != attr["auto_source"]
        else attr["traffic_type"]
    )
    return [
        attr["auto_source"],
        attr["first_source"],
        attr["first_medium"],
        attr["last_source"],
        attr["last_medium"],
        basis,
        confidence,
        traffic,
        attr["touch_path"],
        attr["first_landing"],
        attr["last_landing"],
        attr["journey_id"],
        attr["auto_medium"],
    ]


def build_new_row(date_hour_minute, lead_id, attr, event_name, synced_at):
    final_source = attr["auto_source"]
    final_medium = attr["auto_medium"]

    base = [
        display_datetime(date_hour_minute),
        lead_id,
        final_source,
        final_medium,
        attr["campaign"],
        attr["keyword"],
        attr["gclid"],
        attr["landing"] or "/",
        attr["service"],
        "",
        "",
        "",
        "Новый",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        f"Auto-import aus GA4: {event_name}",
        synced_at,
        "",
    ]
    google_helpers = [attr["gbraid"], attr["wbraid"], "", ""]
    attr_helpers = build_attr_values(
        attr,
        final_source,
        attr["basis"],
        attr["confidence"],
    )
    return base + google_helpers + attr_helpers


def sync_leads(data, sheets, property_id: str, synced_at: str):
    event_dims, event_response = event_report(data, property_id)
    session_dims, session_response = session_report(data, property_id)
    sessions = build_session_map(session_dims, session_response)

    existing = load_existing_leads(sheets)
    new_rows = []
    updates = []

    for raw in rows_from_report(event_response):
        event_values = dict(zip(event_dims + ["eventCount"], raw))
        event_name = event_values.get("eventName", "")
        if event_name not in LEAD_EVENTS:
            continue

        date_hour_minute = event_values.get("dateHourMinute", "")
        session_values = sessions.get((date_hour_minute, event_name), {})
        attr = parse_attribution(event_values, session_values)

        try:
            count = max(1, int(float(event_values.get("eventCount", "1"))))
        except Exception:
            count = 1

        for ordinal in range(1, count + 1):
            lead_id = make_lead_id(property_id, date_hour_minute, event_name, ordinal)

            if lead_id not in existing:
                row = build_new_row(date_hour_minute, lead_id, attr, event_name, synced_at)
                new_rows.append(row)
                existing[lead_id] = {"row": None, "values": row}
                continue

            record = existing[lead_id]
            if record["row"] is None:
                continue

            old = record["values"]
            override = manual_override(old)
            if override:
                final_source = override
                final_medium = manual_channel_for_source(override, old[3])
                basis = "Вручную / со слов клиента"
                confidence = "Высокая"
            else:
                final_source = attr["auto_source"]
                final_medium = attr["auto_medium"]
                basis = attr["basis"]
                confidence = attr["confidence"]

            c_to_i = [
                final_source,
                final_medium,
                attr["campaign"],
                attr["keyword"],
                attr["gclid"],
                attr["landing"] or "/",
                attr["service"],
            ]
            attr_values = build_attr_values(attr, final_source, basis, confidence)

            row_number = record["row"]
            updates.extend([
                {"range": f"'Leads'!C{row_number}:I{row_number}", "values": [c_to_i]},
                {
                    "range": f"'Leads'!Y{row_number}:Z{row_number}",
                    "values": [[attr["gbraid"], attr["wbraid"]]],
                },
                {
                    "range": f"'Leads'!AC{row_number}:AO{row_number}",
                    "values": [attr_values],
                },
                {"range": f"'Leads'!W{row_number}", "values": [[synced_at]]},
            ])

    if new_rows:
        sheets.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range="'Leads'!A:AO",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": new_rows},
        ).execute()

    if updates:
        sheets.spreadsheets().values().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"valueInputOption": "RAW", "data": updates},
        ).execute()

    return len(new_rows), len(updates) // 4


def write_raw_analytics(data, sheets, property_id: str, synced_at: str):
    events = data.run_report(
        RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[
                Dimension(name="date"),
                Dimension(name="eventName"),
                Dimension(name="sessionSource"),
                Dimension(name="sessionMedium"),
                Dimension(name="sessionCampaignName"),
            ],
            metrics=[Metric(name="eventCount"), Metric(name="totalUsers")],
            date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
            limit=100000,
        )
    )
    event_rows = [row for row in rows_from_report(events) if row[1] in TARGET_EVENTS]
    replace_sheet(
        sheets,
        "Analytics Events",
        [[
            "Date", "Event", "Source", "Medium", "Campaign",
            "Event count", "Users", "Synced at UTC", "Property ID",
        ]] + [row + [synced_at, property_id] for row in event_rows],
    )

    pages = data.run_report(
        RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[
                Dimension(name="date"),
                Dimension(name="landingPagePlusQueryString"),
                Dimension(name="sessionSource"),
                Dimension(name="sessionMedium"),
                Dimension(name="sessionCampaignName"),
            ],
            metrics=[Metric(name="sessions"), Metric(name="totalUsers")],
            date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
            limit=100000,
        )
    )
    replace_sheet(
        sheets,
        "Analytics Pages",
        [[
            "Date", "Landing page", "Source", "Medium", "Campaign",
            "Sessions", "Users", "Synced at UTC", "Property ID",
        ]] + [row + [synced_at, property_id] for row in rows_from_report(pages)],
    )

    realtime = data.run_realtime_report(
        RunRealtimeReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")],
            limit=1000,
        )
    )
    replace_sheet(
        sheets,
        "Analytics Realtime",
        [["Event", "Event count (last 30 min)", "Synced at UTC", "Property ID"]]
        + [row + [synced_at, property_id] for row in rows_from_report(realtime)],
    )


def read_all_leads(sheets):
    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!A2:AO",
    ).execute()
    rows = []
    for row in response.get("values", []):
        padded = list(row) + [""] * (TOTAL_COLUMNS - len(row))
        if str(padded[1] or "").strip():
            rows.append(padded)
    return rows


def build_attribution_readout(rows, synced_at: str):
    booked_statuses = {"Забронирован", "Выполнен"}
    total_leads = len(rows)
    total_orders = sum(1 for row in rows if str(row[12]) in booked_statuses)
    completed = sum(1 for row in rows if str(row[12]) == "Выполнен")
    revenue = sum(as_number(row[16]) for row in rows)
    high_confidence = sum(1 for row in rows if str(row[34]) == "Высокая")
    unknown = sum(1 for row in rows if str(row[2]) == "Не определено")

    by_source = defaultdict(lambda: {
        "leads": 0,
        "orders": 0,
        "revenue": 0.0,
        "first": 0,
        "last": 0,
        "high": 0,
    })

    for row in rows:
        source = str(row[2] or "Не определено")
        first = str(row[29] or source)
        last = str(row[31] or source)
        status = str(row[12] or "")
        is_order = status in booked_statuses

        by_source[source]["leads"] += 1
        by_source[source]["orders"] += int(is_order)
        by_source[source]["revenue"] += as_number(row[16])
        by_source[source]["high"] += int(str(row[34]) == "Высокая")
        by_source[first]["first"] += 1
        by_source[last]["last"] += 1

    preferred_order = [
        "Google Ads",
        "Google поиск",
        "Facebook / Instagram",
        "Другой поиск",
        "Другой сайт",
        "Прямой заход",
        "Не определено",
        "Auftrago",
        "Рекомендация",
        "Google Business Profile",
    ]
    sources = preferred_order + sorted(
        source for source in by_source if source not in preferred_order
    )
    sources = [source for source in sources if source in by_source]

    values = [
        ["Сквозная аналитика — Fleissig", "Обновлено", synced_at],
        ["Источник истины", "CRM Leads: реальные заказы и выручка", ""],
        ["Модель для решений", "Последний непрямой контакт", "First-touch и last-touch показываются рядом"],
        ["Правило", "Direct ≠ доказанный маркетинговый источник", "Не определено не переписываем в Direct"],
        [],
        ["Метрика", "Значение"],
        ["Лидов", total_leads],
        ["Заказов", total_orders],
        ["Выполнено", completed],
        ["Выручка CHF", round(revenue, 2)],
        ["Источник подтверждён с высокой уверенностью", high_confidence],
        ["Не определено", unknown],
        [],
        ["Источник", "Лиды", "Заказы", "Выручка CHF", "Первое касание", "Последнее касание", "Высокая уверенность"],
    ]

    for source in sources:
        item = by_source[source]
        values.append([
            source,
            item["leads"],
            item["orders"],
            round(item["revenue"], 2),
            item["first"],
            item["last"],
            item["high"],
        ])

    values.extend([
        [],
        ["Как читать", "", "", "", "", "", ""],
        ["Лиды/заказы/выручка", "Берутся только из CRM, не суммируются с Google/Meta.", "", "", "", "", ""],
        ["Первое касание", "Что впервые привело клиента.", "", "", "", "", ""],
        ["Последнее касание", "Последний известный контакт перед обращением.", "", "", "", "", ""],
        ["Источник", "Для решений используем последний непрямой контакт; ручная правка имеет приоритет.", "", "", "", "", ""],
        ["Уверенность", "Высокая: first-party путь или ID клика; средняя: GA4/referrer; низкая: direct/нет данных.", "", "", "", "", ""],
    ])
    return values


def main():
    property_id = discover_property_id()
    data = BetaAnalyticsDataClient()
    sheets = build("sheets", "v4", cache_discovery=False)
    synced_at = datetime.now(timezone.utc).isoformat()

    ensure_leads_headers(sheets)
    write_raw_analytics(data, sheets, property_id, synced_at)
    added, enriched = sync_leads(data, sheets, property_id, synced_at)

    readout = build_attribution_readout(read_all_leads(sheets), synced_at)
    replace_sheet(sheets, "Attribution", readout, clear_range="A:K")

    print(
        f"Attribution sync complete for GA4 property {property_id}; "
        f"new leads={added}, enriched leads={enriched}, spreadsheet={SPREADSHEET_ID}"
    )


if __name__ == "__main__":
    main()
