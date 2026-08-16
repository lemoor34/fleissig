import hashlib
import os
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlsplit

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

TARGET_EVENTS = {
    "whatsapp_click",
    "phone_click",
    "calculator_complete",
    "umzug_whatsapp_click",
    "fenster_whatsapp_click",
}

LEAD_EVENTS = {
    "whatsapp_click",
    "phone_click",
    "umzug_whatsapp_click",
    "fenster_whatsapp_click",
}

NOT_SET_VALUES = {"", "(not set)", "(none)", "(direct)"}


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


def clean_value(value: str) -> str:
    value = (value or "").strip()
    return "" if value in NOT_SET_VALUES else value


def parse_landing_params(landing_page: str):
    try:
        query = urlsplit(landing_page or "").query
        params = parse_qs(query)
    except Exception:
        return {}
    return {key: values[0] for key, values in params.items() if values}


def service_for_lead(event_name: str, landing_page: str) -> str:
    landing = (landing_page or "").lower()
    if event_name == "umzug_whatsapp_click" or "umzugsreinigung" in landing:
        return "Umzugsreinigung"
    if event_name == "fenster_whatsapp_click" or "fensterreinigung" in landing:
        return "Fensterreinigung"
    if event_name == "phone_click":
        return "Telefonanfrage"
    return "Reinigungsanfrage"


def should_create_lead(event_name: str, landing_page: str) -> bool:
    if event_name not in LEAD_EVENTS:
        return False

    # Service pages emit both a generic WhatsApp event and a dedicated event.
    # Ignore the generic one there so one click creates exactly one CRM lead.
    if event_name == "whatsapp_click":
        landing = (landing_page or "").lower()
        if "umzugsreinigung" in landing or "fensterreinigung" in landing:
            return False

    return True


def make_lead_id(
    property_id: str,
    date_hour_minute: str,
    event_name: str,
    source: str,
    medium: str,
    campaign: str,
    landing_page: str,
    ordinal: int,
) -> str:
    seed = "|".join(
        [
            property_id,
            date_hour_minute,
            event_name,
            source,
            medium,
            campaign,
            landing_page,
            str(ordinal),
        ]
    )
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()[:8].upper()
    stamp = date_hour_minute if len(date_hour_minute) == 12 else datetime.now().strftime("%Y%m%d%H%M")
    return f"FR-{stamp[2:8]}-{stamp[8:12]}-{digest}"


def display_datetime(date_hour_minute: str) -> str:
    try:
        parsed = datetime.strptime(date_hour_minute, "%Y%m%d%H%M")
        return parsed.strftime("%d.%m.%Y %H:%M")
    except Exception:
        return date_hour_minute


def existing_lead_ids(sheets):
    ensure_sheet(sheets, "Leads")
    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Leads'!B2:B",
    ).execute()
    return {
        row[0]
        for row in response.get("values", [])
        if row and row[0] and not str(row[0]).startswith("#")
    }


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


def sync_leads(data, sheets, property_id: str, synced_at: str) -> int:
    rich_dimensions = [
        "dateHourMinute",
        "eventName",
        "sessionSource",
        "sessionMedium",
        "sessionCampaignName",
        "sessionManualTerm",
        "sessionGoogleAdsKeyword",
        "landingPagePlusQueryString",
    ]
    fallback_dimensions = [
        "dateHourMinute",
        "eventName",
        "sessionSource",
        "sessionMedium",
        "sessionCampaignName",
        "landingPagePlusQueryString",
    ]

    dimension_names = rich_dimensions
    try:
        response = data.run_report(
            RunReportRequest(
                property=f"properties/{property_id}",
                dimensions=[Dimension(name=name) for name in rich_dimensions],
                metrics=[Metric(name="eventCount")],
                date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
                limit=100000,
            )
        )
    except Exception as exc:
        print(f"Rich lead report unavailable, using fallback dimensions: {exc}")
        dimension_names = fallback_dimensions
        response = data.run_report(
            RunReportRequest(
                property=f"properties/{property_id}",
                dimensions=[Dimension(name=name) for name in fallback_dimensions],
                metrics=[Metric(name="eventCount")],
                date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
                limit=100000,
            )
        )

    known_ids = existing_lead_ids(sheets)
    new_rows = []

    for raw_row in rows_from_report(response):
        values = dict(zip(dimension_names + ["eventCount"], raw_row))
        event_name = values.get("eventName", "")
        landing_page = values.get("landingPagePlusQueryString", "")

        if not should_create_lead(event_name, landing_page):
            continue

        source = clean_value(values.get("sessionSource", "")) or "direct"
        medium = clean_value(values.get("sessionMedium", "")) or "(none)"
        campaign = clean_value(values.get("sessionCampaignName", ""))
        google_keyword = clean_value(values.get("sessionGoogleAdsKeyword", ""))
        manual_term = clean_value(values.get("sessionManualTerm", ""))
        keyword = google_keyword or manual_term
        landing_params = parse_landing_params(landing_page)
        gclid = landing_params.get("gclid", "")

        # If GA4 has no processed campaign dimensions yet, use UTMs from the landing URL.
        source = source or landing_params.get("utm_source", "")
        medium = medium or landing_params.get("utm_medium", "")
        campaign = campaign or landing_params.get("utm_campaign", "")
        keyword = keyword or landing_params.get("utm_term", "")

        try:
            count = max(1, int(float(values.get("eventCount", "1"))))
        except Exception:
            count = 1

        for ordinal in range(1, count + 1):
            lead_id = make_lead_id(
                property_id,
                values.get("dateHourMinute", ""),
                event_name,
                source,
                medium,
                campaign,
                landing_page,
                ordinal,
            )
            if lead_id in known_ids:
                continue

            lead_row = [
                display_datetime(values.get("dateHourMinute", "")),  # A Date/time
                lead_id,                                               # B Lead ID
                source,                                                # C Source
                medium,                                                # D Medium
                campaign,                                              # E Campaign
                keyword,                                               # F Keyword
                gclid,                                                 # G GCLID
                landing_page,                                          # H Landing page
                service_for_lead(event_name, landing_page),            # I Service
                "",                                                    # J City
                "",                                                    # K Client
                "",                                                    # L Phone
                "Новый",                                               # M Status
                "",                                                    # N Estimate low
                "",                                                    # O Estimate high
                "",                                                    # P Offer
                "",                                                    # Q Order value
                "",                                                    # R Direct costs
                "",                                                    # S Gross profit
                "",                                                    # T Work date
                "",                                                    # U Lost reason
                f"Auto-import aus GA4: {event_name}",                  # V Comment
                synced_at,                                             # W Last update
                "",                                                    # X Owner
            ]
            new_rows.append(lead_row)
            known_ids.add(lead_id)

    return append_leads(sheets, new_rows)


def main():
    property_id = discover_property_id()
    data = BetaAnalyticsDataClient()
    sheets = build("sheets", "v4", cache_discovery=False)
    synced_at = datetime.now(timezone.utc).isoformat()

    events_response = data.run_report(
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
    event_rows = [
        row for row in rows_from_report(events_response) if row[1] in TARGET_EVENTS
    ]
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

    leads_added = sync_leads(data, sheets, property_id, synced_at)
    print(
        f"Synced GA4 property {property_id} into spreadsheet {SPREADSHEET_ID}; "
        f"new CRM leads: {leads_added}"
    )


if __name__ == "__main__":
    main()
