import os
from datetime import datetime
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo

from googleapiclient.discovery import build

SPREADSHEET_ID = os.environ.get(
    "FLEISSIG_SPREADSHEET_ID",
    "162L8UbKvna-uha_dC8XTsBqo38mlM9iGFIaszZOIHc8",
)
LEADS_SHEET = "Leads"
EXPORT_SHEET = "Google Ads Export"
TZ = ZoneInfo("Europe/Zurich")

BOOKED_STATUS = "Забронирован"
COMPLETED_STATUS = "Выполнен"
BOOKED_ACTION = "Fleissig - Auftrag gebucht"
COMPLETED_ACTION = "Fleissig - Auftrag abgeschlossen"

EXPORT_HEADERS = [
    "Conversion action",
    "GCLID",
    "GBRAID",
    "WBRAID",
    "Conversion date and time",
    "Conversion value",
    "Currency",
    "Order ID",
    "Phone number",
    "Lead ID",
    "Service",
    "Status",
]


def ensure_sheet(sheets, title):
    meta = sheets.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    existing = {sheet["properties"]["title"] for sheet in meta.get("sheets", [])}
    if title not in existing:
        sheets.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
        ).execute()


def parse_click_ids(landing_page):
    try:
        query = urlsplit(landing_page or "").query
        params = parse_qs(query)
    except Exception:
        return "", "", ""
    first = lambda key: (params.get(key) or [""])[0]
    return first("gclid"), first("gbraid"), first("wbraid")


def normalize_phone(value):
    raw = (value or "").strip()
    if not raw:
        return ""
    if raw.startswith("00"):
        raw = "+" + raw[2:]
    plus = raw.startswith("+")
    digits = "".join(ch for ch in raw if ch.isdigit())
    if plus:
        normalized = "+" + digits
    elif digits.startswith("0") and len(digits) == 10:
        normalized = "+41" + digits[1:]
    else:
        return ""
    count = len(normalized) - 1
    return normalized if 11 <= count <= 15 else ""


def as_number(value):
    if value is None or value == "":
        return ""
    if isinstance(value, (int, float)):
        return value
    text = str(value).strip().replace("CHF", "").replace("'", "").replace(" ", "")
    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return ""


def write_export(sheets, rows):
    ensure_sheet(sheets, EXPORT_SHEET)
    sheets.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{EXPORT_SHEET}'!A:L",
        body={},
    ).execute()
    sheets.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{EXPORT_SHEET}'!A1",
        valueInputOption="RAW",
        body={"values": [EXPORT_HEADERS] + rows},
    ).execute()


def main():
    sheets = build("sheets", "v4", cache_discovery=False)
    ensure_sheet(sheets, LEADS_SHEET)

    # Internal helper columns keep click IDs and stable milestone timestamps.
    sheets.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{LEADS_SHEET}'!Y1:AB1",
        valueInputOption="RAW",
        body={"values": [["GBRAID", "WBRAID", "Google Ads: gebucht am", "Google Ads: abgeschlossen am"]]},
    ).execute()

    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{LEADS_SHEET}'!A2:AB",
    ).execute()
    rows = response.get("values", [])

    updates = []
    export_rows = []
    now = datetime.now(TZ).isoformat(timespec="seconds")

    for sheet_row, row in enumerate(rows, start=2):
        padded = list(row) + [""] * (28 - len(row))
        lead_id = str(padded[1] or "").strip()
        if not lead_id or lead_id.startswith("#"):
            continue

        landing_page = padded[7]
        parsed_gclid, parsed_gbraid, parsed_wbraid = parse_click_ids(landing_page)
        gclid = str(padded[6] or parsed_gclid or "").strip()
        gbraid = str(padded[24] or parsed_gbraid or "").strip()
        wbraid = str(padded[25] or parsed_wbraid or "").strip()
        status = str(padded[12] or "").strip()
        booked_at = str(padded[26] or "").strip()
        completed_at = str(padded[27] or "").strip()

        if not padded[6] and gclid:
            padded[6] = gclid
            updates.append({"range": f"'{LEADS_SHEET}'!G{sheet_row}", "values": [[gclid]]})
        if not padded[24] and gbraid:
            padded[24] = gbraid
            updates.append({"range": f"'{LEADS_SHEET}'!Y{sheet_row}", "values": [[gbraid]]})
        if not padded[25] and wbraid:
            padded[25] = wbraid
            updates.append({"range": f"'{LEADS_SHEET}'!Z{sheet_row}", "values": [[wbraid]]})

        if status in {BOOKED_STATUS, COMPLETED_STATUS} and not booked_at:
            booked_at = now
            padded[26] = booked_at
            updates.append({"range": f"'{LEADS_SHEET}'!AA{sheet_row}", "values": [[booked_at]]})
        if status == COMPLETED_STATUS and not completed_at:
            completed_at = now
            padded[27] = completed_at
            updates.append({"range": f"'{LEADS_SHEET}'!AB{sheet_row}", "values": [[completed_at]]})

        # Google Ads-only export: do not send unrelated/direct/Meta leads.
        if not any([gclid, gbraid, wbraid]):
            continue

        service = str(padded[8] or "").strip()
        phone = normalize_phone(padded[11])
        value = as_number(padded[16]) or as_number(padded[15])

        def add_conversion(action, conversion_time, suffix):
            if not conversion_time:
                return
            export_rows.append([
                action,
                gclid,
                gbraid,
                wbraid,
                conversion_time,
                value,
                "CHF",
                f"{lead_id}-{suffix}",
                phone,
                lead_id,
                service,
                status,
            ])

        if status in {BOOKED_STATUS, COMPLETED_STATUS}:
            add_conversion(BOOKED_ACTION, booked_at, "BOOKED")
        if status == COMPLETED_STATUS:
            add_conversion(COMPLETED_ACTION, completed_at, "COMPLETED")

    if updates:
        sheets.spreadsheets().values().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"valueInputOption": "RAW", "data": updates},
        ).execute()

    write_export(sheets, export_rows)
    print(
        f"Prepared {len(export_rows)} Google Ads offline conversion rows "
        f"from {len(rows)} CRM leads"
    )


if __name__ == "__main__":
    main()
