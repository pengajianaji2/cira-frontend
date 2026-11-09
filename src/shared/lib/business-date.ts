export const BUSINESS_TIMEZONE = "Asia/Jakarta";

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Validasi string tanggal YYYY-MM-DD secara ketat (kalender nyata).
 */
export function isValidDateOnly(value: string): boolean {
  const match = DATE_ONLY_REGEX.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

/**
 * Mengembalikan string YYYY-MM-DD sesuai tanggal kalender bisnis Asia/Jakarta (WIB).
 */
export function getBusinessDateWib(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Memformat tanggal YYYY-MM-DD atau ISO timestamp ke format lokal Indonesia dalam zona Asia/Jakarta
 * tanpa pergeseran hari akibat perbedaan offset UTC browser.
 */
export function formatDateWibDisplay(
  input?: string | Date | null,
  options?: { longMonth?: boolean }
): string {
  if (!input) return "-";

  const monthStyle = options?.longMonth ? "long" : "short";

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "-";
    if (isValidDateOnly(trimmed)) {
      const anchor = new Date(`${trimmed}T00:00:00+07:00`);
      return anchor.toLocaleDateString("id-ID", {
        timeZone: BUSINESS_TIMEZONE,
        day: "numeric",
        month: monthStyle,
        year: "numeric",
      });
    }
  }

  const parsed = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: monthStyle,
    year: "numeric",
  });
}
