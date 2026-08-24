export const ROOM_CONFIG = {
  "1-1.5": { label: "1–1.5 Zimmer", bands: [{ maxArea: 40, lower: 390, upper: 450 }, { maxArea: 50, lower: 430, upper: 490 }] },
  "2-2.5": { label: "2–2.5 Zimmer", bands: [{ maxArea: 55, lower: 490, upper: 550 }, { maxArea: 70, lower: 550, upper: 650 }] },
  "3-3.5": { label: "3–3.5 Zimmer", bands: [{ maxArea: 75, lower: 650, upper: 750 }, { maxArea: 90, lower: 700, upper: 850 }] },
  "4-4.5": { label: "4–4.5 Zimmer", bands: [{ maxArea: 95, lower: 850, upper: 950 }, { maxArea: 110, lower: 900, upper: 1050 }] },
  "5-5.5": { label: "5–5.5 Zimmer", bands: [{ maxArea: 120, lower: 1000, upper: 1100 }, { maxArea: 135, lower: 1100, upper: 1250 }] },
};

export const MIN_AREA = 20;
export const MAX_AREA = 300;

const roundUpTo50 = (value) => Math.ceil(value / 50) * 50;

function isValidArea(area) {
  return Number.isFinite(area) && area >= MIN_AREA && area <= MAX_AREA;
}

export function calculateUmzugsreinigungEstimate(form) {
  const room = ROOM_CONFIG[form.rooms];
  const area = Number(form.area);

  if (!room || !isValidArea(area)) return null;

  const directBand = room.bands.find((band) => area <= band.maxArea);
  if (directBand) {
    return {
      lower: directBand.lower,
      upper: directBand.upper,
      excessArea: 0,
    };
  }

  const lastBand = room.bands[room.bands.length - 1];
  const excessArea = area - lastBand.maxArea;
  const surcharge = Math.ceil(excessArea / 10) * 50;
  const lower = roundUpTo50(lastBand.lower + surcharge);
  const upper = roundUpTo50(lastBand.upper + surcharge);

  return {
    lower,
    upper,
    excessArea,
  };
}

export function isEstimateFormComplete(form) {
  const area = Number(form.area);
  return Boolean(ROOM_CONFIG[form.rooms] && isValidArea(area));
}

export function buildWhatsAppMessage(form, estimate) {
  const room = ROOM_CONFIG[form.rooms];

  return [
    "Grüezi! Ich möchte den verbindlichen Fixpreis für meine Umzugsreinigung erhalten.",
    "",
    `Wohnung: ${room?.label || form.rooms}`,
    `Wohnfläche: ${form.area} m²`,
    `Vorläufige Preisschätzung: CHF ${estimate.lower}–${estimate.upper}`,
    "",
    "Ich sende Ihnen gerne Fotos oder ein kurzes Video der Wohnung für die genaue Offerte.",
  ].join("\n");
}
