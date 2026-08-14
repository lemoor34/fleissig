export const ROOM_CONFIG = {
  "1-1.5": { label: "1–1.5 Zimmer", base: 549, normalAreaMax: 40, strongDirt: 100 },
  "2-2.5": { label: "2–2.5 Zimmer", base: 649, normalAreaMax: 65, strongDirt: 150 },
  "3-3.5": { label: "3–3.5 Zimmer", base: 799, normalAreaMax: 90, strongDirt: 200 },
  "4-4.5": { label: "4–4.5 Zimmer", base: 949, normalAreaMax: 115, strongDirt: 250 },
  "5-5.5": { label: "5–5.5 Zimmer", base: 1149, normalAreaMax: 140, strongDirt: 300 },
};

export const LABELS = {
  dirt: {
    light: "Leicht",
    normal: "Normal",
    strong: "Stark",
  },
  pets: {
    no: "Nein",
    yes: "Ja",
  },
  windows: {
    small: "Klein",
    normal: "Normal",
    panorama: "Panoramafenster",
  },
  blinds: {
    none: "Keine",
    roller: "Rollläden",
    lamella: "Lamellenstoren",
    other: "Andere",
  },
  extras: {
    balcony: "Balkon",
    cellar: "Keller",
    garage: "Garage",
  },
};

const roundUpTo50 = (value) => Math.ceil(value / 50) * 50;

export function calculateUmzugsreinigungEstimate(form) {
  const room = ROOM_CONFIG[form.rooms];
  const area = Number(form.area);

  if (!room || !Number.isFinite(area) || area <= 0) return null;

  let raw = room.base;
  const excessArea = Math.max(0, area - room.normalAreaMax);
  if (excessArea > 0) raw += Math.ceil(excessArea / 10) * 50;

  if (form.dirt === "normal") raw += 50;
  if (form.dirt === "strong") raw += room.strongDirt;

  if (form.windows === "panorama") {
    raw += ["1-1.5", "2-2.5", "3-3.5"].includes(form.rooms) ? 100 : 120;
  }

  if (form.blinds === "lamella" || form.blinds === "other") raw += 40;

  const extras = Array.isArray(form.extras) ? form.extras : [];
  if (extras.includes("balcony")) raw += 50;
  if (extras.includes("cellar")) raw += 40;
  if (extras.includes("garage")) raw += 60;

  const lower = roundUpTo50(raw);
  const higherUncertainty =
    form.dirt === "strong" ||
    form.windows === "panorama" ||
    excessArea > 20 ||
    form.pets === "yes" ||
    form.blinds === "other";

  const upper = lower + (higherUncertainty ? 100 : 50);

  return {
    raw,
    lower,
    upper,
    excessArea,
    higherUncertainty,
  };
}

export function isEstimateFormComplete(form) {
  return Boolean(
    ROOM_CONFIG[form.rooms] &&
      Number(form.area) > 0 &&
      form.dirt &&
      form.pets &&
      form.windows &&
      form.blinds &&
      form.handoverDate
  );
}

export function formatSwissDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

export function buildWhatsAppMessage(form, estimate) {
  const room = ROOM_CONFIG[form.rooms];
  const extras = (form.extras || []).map((key) => LABELS.extras[key]).filter(Boolean);

  return [
    "Grüezi! Ich möchte meine Umzugsreinigung zum Fixpreis bestätigen lassen.",
    "",
    `Wohnung: ${room?.label || form.rooms}`,
    `Wohnfläche: ${form.area} m²`,
    `Verschmutzung: ${LABELS.dirt[form.dirt] || form.dirt}`,
    `Haustiere: ${LABELS.pets[form.pets] || form.pets}`,
    `Fenster: ${LABELS.windows[form.windows] || form.windows}`,
    `Storen/Jalousien: ${LABELS.blinds[form.blinds] || form.blinds}`,
    `Zusätzlich: ${extras.length ? extras.join(", ") : "Nichts"}`,
    `Wohnungsabgabe: ${formatSwissDate(form.handoverDate)}`,
    "",
    `Vorläufige Preisschätzung: CHF ${estimate.lower}–${estimate.upper}`,
    "",
    "Ich sende Ihnen gerne Fotos für die verbindliche Fixpreis-Offerte.",
  ].join("\n");
}
