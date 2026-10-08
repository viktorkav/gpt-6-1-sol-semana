const FAVORITES_KEY = "contramare:favorites:v1";
export function timeMinutes(time) {
  const match = /^(\d{2,}):([0-5]\d)$/.exec(time);
  if (!match) throw new TypeError(`Horário inválido: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}
export function formatTime(time) {
  const minutes = timeMinutes(time);
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
export function getConflicts(shows) {
  const result = [];
  for (let i = 0; i < shows.length; i++) {
    for (let j = i + 1; j < shows.length; j++) {
      const first = shows[i],
        second = shows[j];
      if (first.day !== second.day) continue;
      const minutes =
        Math.min(timeMinutes(first.end), timeMinutes(second.end)) -
        Math.max(timeMinutes(first.start), timeMinutes(second.start));
      if (minutes > 0) result.push({ first, second, minutes });
    }
  }
  return result;
}
const escapeText = (text) =>
  String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
function foldLine(line) {
  const encoder = new TextEncoder();
  const chunks = [];
  let current = "",
    bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      chunks.push(current);
      current = " ";
      bytes = 1;
    }
    current += character;
    bytes += size;
  }
  chunks.push(current);
  return chunks.join("\r\n");
}
function utcTimestamp(day, time) {
  const [year, month, date] = day.split("-").map(Number);
  const utc = new Date(
    Date.UTC(year, month - 1, date, 0, timeMinutes(time) + 180),
  );
  return utc
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
export function buildCalendar(shows, artists) {
  const names = new Map(artists.map((artist) => [artist.id, artist.name]));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Contra-Maré//Festival fictício//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const show of shows) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${encodeURIComponent(show.id)}-${show.day}@contramare.invalid`,
      "DTSTAMP:20270101T000000Z",
      `DTSTART:${utcTimestamp(show.day, show.start)}`,
      `DTEND:${utcTimestamp(show.day, show.end)}`,
      `SUMMARY:${escapeText(`CONTRA-MARÉ — ${names.get(show.artistId) ?? show.artistId} (simulação)`)}`,
      `LOCATION:${escapeText(show.stage === "mare" ? "Palco Maré — Recife (simulação)" : "Palco Mangue — Recife (simulação)")}`,
      "DESCRIPTION:Festival fictício. Agenda de demonstração.",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
export function writeFavorites(storage, ids) {
  try {
    storage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
    return { error: null };
  } catch {
    return { error: "Não foi possível salvar os favoritos neste navegador." };
  }
}
export function readFavorites(storage, validIds) {
  try {
    const raw = storage.getItem(FAVORITES_KEY);
    if (raw === null) return { ids: [], error: null };
    let parsed;
    try {
      parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Formato inválido");
    } catch {
      const repair = writeFavorites(storage, []);
      return {
        ids: [],
        error:
          repair.error ??
          "Os favoritos armazenados estavam corrompidos e foram redefinidos.",
      };
    }
    const valid = new Set(validIds);
    const ids = [
      ...new Set(
        parsed.filter((id) => typeof id === "string" && valid.has(id)),
      ),
    ];
    const error =
      JSON.stringify(parsed) !== JSON.stringify(ids)
        ? writeFavorites(storage, ids).error
        : null;
    return { ids, error };
  } catch {
    return {
      ids: [],
      error: "Não foi possível acessar os favoritos neste navegador.",
    };
  }
}
