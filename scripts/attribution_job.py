from datetime import datetime, timezone

import attribution_sync as core


# Historical analytics QA clicks created while we were wiring the CRM.
# They stay available in the raw Analytics tabs but must never count as CRM leads.
TEST_LEAD_IDS = {
    "FR-260816-1747-22DCF909",
    "FR-260816-1749-D8D31538",
    "FR-260816-1750-B79D00E5",
    "FR-260816-1819-D8D80DEB",
    "FR-260818-2021-D0D98B4E",
}

# GA4 can temporarily return this value while advertising attribution is still
# being processed. It is not a real traffic source and must never be converted
# into "Другой сайт" or treated as confident attribution.
core.UNKNOWN_GA.add("(data not available)")


def ensure_leads_capacity(sheets):
    meta = sheets.spreadsheets().get(spreadsheetId=core.SPREADSHEET_ID).execute()
    leads = next(
        sheet for sheet in meta.get("sheets", [])
        if sheet.get("properties", {}).get("title") == "Leads"
    )
    props = leads["properties"]
    current = props.get("gridProperties", {}).get("columnCount", 0)
    if current >= core.TOTAL_COLUMNS:
        return

    sheets.spreadsheets().batchUpdate(
        spreadsheetId=core.SPREADSHEET_ID,
        body={
            "requests": [{
                "updateSheetProperties": {
                    "properties": {
                        "sheetId": props["sheetId"],
                        "gridProperties": {"columnCount": core.TOTAL_COLUMNS},
                    },
                    "fields": "gridProperties.columnCount",
                }
            }]
        },
    ).execute()


def remove_historical_test_leads(sheets):
    meta = sheets.spreadsheets().get(spreadsheetId=core.SPREADSHEET_ID).execute()
    leads = next(
        sheet for sheet in meta.get("sheets", [])
        if sheet.get("properties", {}).get("title") == "Leads"
    )
    sheet_id = leads["properties"]["sheetId"]

    response = sheets.spreadsheets().values().get(
        spreadsheetId=core.SPREADSHEET_ID,
        range="'Leads'!A2:B",
    ).execute()

    rows_to_delete = []
    for sheet_row, row in enumerate(response.get("values", []), start=2):
        lead_id = str(row[1] if len(row) > 1 else "").strip()
        if lead_id in TEST_LEAD_IDS:
            rows_to_delete.append(sheet_row)

    if not rows_to_delete:
        return 0

    requests = []
    for sheet_row in sorted(rows_to_delete, reverse=True):
        zero_index = sheet_row - 1
        requests.append({
            "deleteDimension": {
                "range": {
                    "sheetId": sheet_id,
                    "dimension": "ROWS",
                    "startIndex": zero_index,
                    "endIndex": zero_index + 1,
                }
            }
        })

    sheets.spreadsheets().batchUpdate(
        spreadsheetId=core.SPREADSHEET_ID,
        body={"requests": requests},
    ).execute()
    return len(rows_to_delete)


def main():
    property_id = core.discover_property_id()
    data = core.BetaAnalyticsDataClient()
    sheets = core.build("sheets", "v4", cache_discovery=False)
    synced_at = datetime.now(timezone.utc).isoformat()

    ensure_leads_capacity(sheets)
    core.ensure_leads_headers(sheets)
    core.write_raw_analytics(data, sheets, property_id, synced_at)

    added, enriched = core.sync_leads(data, sheets, property_id, synced_at)
    removed_tests = remove_historical_test_leads(sheets)

    # Build the business readout only after QA/test rows are removed.
    readout = core.build_attribution_readout(core.read_all_leads(sheets), synced_at)
    core.replace_sheet(sheets, "Attribution", readout, clear_range="A:K")

    print(
        f"Attribution job complete: added={added}, enriched={enriched}, "
        f"historical_test_leads_removed={removed_tests}"
    )


if __name__ == "__main__":
    main()
