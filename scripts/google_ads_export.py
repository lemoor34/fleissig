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

HELPER_HEADERS = ["GBRAID", "WBRAID", "Забронирован в", "Выполнен в"]
EXPORT_HEADERS = [
    "Conversion action",
    "GCLID",
    "GBRAID",
    "WBRAID",
    "Conversion date and time",
    "Event source",
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


def parse_milestone_time(value):
    """Parse a CRM milestone timestamp and normalize it to Europe/Zurich.

    Google Ads requires the real conversion time with an explicit timezone.
    CRM users can enter the local Swiss time in a human-readable format; ISO
    timestamps are also accepted for compatibility with previously stored data.
    """
    if value is None or value == "":
        return None

    if isinstance(value, datetime):
        parsed = value
    else:
        text = str(value).strip()
        if not text:
            return None

        parsed = None
        try:
            parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            pass

        if parsed is None:
            for fmt in (
                "%d.%m.%Y %H:%M:%S",
                "%d.%m.%Y %H:%M",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d %H:%M",
                "%d/%m/%Y %H:%M:%S",
                "%d/%m/%Y %H:%M",
            ):
                try:
                    parsed = datetime.strptime(text, fmt)
                    break
                except ValueError:
                    continue

        if parsed is None:
            return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=TZ)
    return parsed.astimezone(TZ)


def format_google_ads_time(value):
    """Return Google Ads click-conversion datetime format with timezone."""
    parsed = parse_milestone_time(value)
    if parsed is None:
        return ""
    compact = parsed.strftime("%Y-%m-%d %H:%M:%S%z")
    return compact[:-2] + ":" + compact[-2:]


def event_source_for_lead(comment):
    """Return a Google Data Manager EventSource value.

    Our CRM leads are created from GA4 contact events. WhatsApp contacts are
    messages, phone contacts are calls; other/manual cases remain OTHER.
    """
    text = str(comment or "").lower()
    if "phone_click" in text:
        return "PHONE"
    if "whatsapp_click" in text:
        return "MESSAGE"
    return "OTHER"


def write_export(sheets, rows):
    ensure_sheet(sheets, EXPORT_SHEET)
    sheets.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{EXPORT_SHEET}'!A:M",
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

    # Y:Z are technical click identifiers. AA:AB are now explicit business
    # milestone fields entered in CRM at the real moment of booking/completion.
    sheets.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{LEADS_SHEET}'!Y1:AB1",
        valueInputOption="RAW",
        body={"values": [HELPER_HEADERS]},
    ).execute()

    response = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{LEADS_SHEET}'!A2:AB",
    ).execute()
    rows = response.get("values", [])

    updates = []
    export_rows = []
    warnings = []

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
        booked_raw = padded[26]
        completed_raw = padded[27]

        if not padded[6] and gclid:
            padded[6] = gclid
            updates.append({"range": f"'{LEADS_SHEET}'!G{sheet_row}", "values": [[gclid]]})
        if not padded[24] and gbraid:
            padded[24] = gbraid
            updates.append({"range": f"'{LEADS_SHEET}'!Y{sheet_row}", "values": [[gbraid]]})
        if not padded[25] and wbraid:
            padded[25] = wbraid
            updates.append({"range": f"'{LEADS_SHEET}'!Z{sheet_row}", "values": [[wbraid]]})

        booked_dt = parse_milestone_time(booked_raw)
        completed_dt = parse_milestone_time(completed_raw)
        lead_dt = parse_milestone_time(padded[0])

        booked_at = format_google_ads_time(booked_dt)
        completed_at = format_google_ads_time(completed_dt)

        booked_valid = bool(booked_at)
        completed_valid = bool(completed_at)

        if booked_dt and lead_dt and booked_dt < lead_dt:
            booked_valid = False
            warnings.append(
                f"{lead_id}: 'Забронирован в' is before the lead time; BOOKED export skipped"
            )
        if completed_dt and lead_dt and completed_dt < lead_dt:
            completed_valid = False
            warnings.append(
                f"{lead_id}: 'Выполнен в' is before the lead time; COMPLETED export skipped"
            )
        if booked_dt and completed_dt and completed_dt < booked_dt:
            completed_valid = False
            warnings.append(
                f"{lead_id}: 'Выполнен в' is before 'Забронирован в'; COMPLETED export skipped"
            )

        if status in {BOOKED_STATUS, COMPLETED_STATUS} and not booked_valid:
            warnings.append(
                f"{lead_id}: status '{status}' requires an exact 'Забронирован в' timestamp"
            )
        if status == COMPLETED_STATUS and not completed_valid:
            warnings.append(
                f"{lead_id}: status '{COMPLETED_STATUS}' requires an exact 'Выполнен в' timestamp"
            )

        # Google Ads-only export: do not send unrelated/direct/Meta leads.
        if not any([gclid, gbraid, wbraid]):
            continue

        service = str(padded[8] or "").strip()
        phone = normalize_phone(padded[11])
        value = as_number(padded[16]) or as_number(padded[15])
        event_source = event_source_for_lead(padded[21])

        def add_conversion(action, conversion_time, suffix):
            if not conversion_time:
                return
            export_rows.append([
                action,
                gclid,
                gbraid,
                wbraid,
                conversion_time,
                event_source,
                value,
                "CHF",
                f"{lead_id}-{suffix}",
                phone,
                lead_id,
                service,
                status,
            ])

        if status in {BOOKED_STATUS, COMPLETED_STATUS} and booked_valid:
            add_conversion(BOOKED_ACTION, booked_at, "BOOKED")
        if status == COMPLETED_STATUS and completed_valid:
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
    if warnings:
        print(f"Skipped/flagged {len(warnings)} milestone issue(s):")
        for warning in warnings[:50]:
            print(f"- {warning}")


if __name__ == "__main__":
    main()
