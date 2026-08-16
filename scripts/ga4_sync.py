import os
from datetime import datetime, timezone

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
        [
            ["Date", "Event", "Source", "Medium", "Campaign", "Event count", "Users", "Synced at UTC", "Property ID"]
        ]
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
        [
            ["Date", "Landing page", "Source", "Medium", "Campaign", "Sessions", "Users", "Synced at UTC", "Property ID"]
        ]
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

    print(f"Synced GA4 property {property_id} into spreadsheet {SPREADSHEET_ID}")


if __name__ == "__main__":
    main()
