export const BUSINESS_TIMEZONE = "Asia/Jakarta";

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MS_PER_DAY = 86_400_000;

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
 * Memvalidasi format jam 24-jam lokal `HH:mm` (`00:00` s.d. `23:59`).
 */
export function isValidTimeHHmm(value: string): boolean {
  return TIME_HHMM_REGEX.test(value);
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
 * Mengekstrak tanggal kalender WIB YYYY-MM-DD dari date-only string ataupun ISO timestamp.
 */
export function extractWibDateOnly(input?: string | Date | null): string {
  if (!input) return "";
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (isValidDateOnly(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return "";
    return getBusinessDateWib(parsed);
  }
  if (Number.isNaN(input.getTime())) return "";
  return getBusinessDateWib(input);
}

/**
 * Menghasilkan pasangan { date: YYYY-MM-DD, time: HH:mm } pada timezone Asia/Jakarta.
 */
export function isoToWibDateAndTime(input?: string | Date | null): {
  date: string;
  time: string;
} {
  if (!input) return { date: "", time: "09:00" };
  if (typeof input === "string" && isValidDateOnly(input.trim())) {
    return { date: input.trim(), time: "09:00" };
  }
  const parsed = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "09:00" };

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const rawHour = parts.find((p) => p.type === "hour")?.value ?? "09";
  const hour = rawHour === "24" ? "00" : rawHour;
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

/**
 * Mengonversi pasangan tanggal (YYYY-MM-DD) dan waktu lokal WIB (HH:mm) ke ISO UTC string.
 */
export function wibDateAndTimeToIso(dateOnly: string, timeHHmm: string): string {
  return new Date(`${dateOnly}T${timeHHmm}:00+07:00`).toISOString();
}

/**
 * Menghitung jumlah hari kalender inklusif (from == to => 1 hari).
 */
export function diffDaysInclusive(fromDateOnly: string, toDateOnly: string): number {
  const [fy, fm, fd] = fromDateOnly.split("-").map(Number);
  const [ty, tm, td] = toDateOnly.split("-").map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.floor((toUtc - fromUtc) / MS_PER_DAY) + 1;
}

/**
 * Menambahkan delta hari ke tanggal YYYY-MM-DD tanpa pergeseran timezone lokal.
 */
export function addDaysDateOnly(dateOnly: string, deltaDays: number): string {
  const [y, m, d] = dateOnly.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const ny = next.getUTCFullYear();
  const nm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(next.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

/**
 * Mengembalikan { year, month (1..12) } saat ini dalam timezone Asia/Jakarta.
 */
export function getCurrentYearMonthWib(now: Date = new Date()): {
  year: number;
  month: number;
} {
  const today = getBusinessDateWib(now);
  const [yearStr, monthStr] = today.split("-");
  return {
    year: Number(yearStr),
    month: Number(monthStr),
  };
}

/**
 * Mengembalikan rentang tanggal awal & akhir bulan [YYYY-MM-01, YYYY-MM-last] dalam WIB.
 */
export function getMonthBoundsWib(
  year: number,
  month1to12: number
): { from: string; to: string } {
  const lastDay = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  const y = String(year).padStart(4, "0");
  const m = String(month1to12).padStart(2, "0");
  const dLast = String(lastDay).padStart(2, "0");
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${dLast}`,
  };
}

/**
 * Mengembalikan seluruh string YYYY-MM-DD inklusif dari from s.d. to.
 */
export function enumerateDateRange(fromDateOnly: string, toDateOnly: string): string[] {
  if (!isValidDateOnly(fromDateOnly) || !isValidDateOnly(toDateOnly) || fromDateOnly > toDateOnly) {
    return [];
  }
  const days = diffDaysInclusive(fromDateOnly, toDateOnly);
  const result: string[] = [];
  for (let i = 0; i < days; i += 1) {
    result.push(addDaysDateOnly(fromDateOnly, i));
  }
  return result;
}

/**
 * Label bulan tahun dalam bahasa Indonesia pada timezone WIB (misal "November 2026").
 */
export function formatMonthYearWib(year: number, month1to12: number): string {
  const anchor = new Date(Date.UTC(year, month1to12 - 1, 15, 5, 0, 0));
  return anchor.toLocaleDateString("id-ID", {
    timeZone: BUSINESS_TIMEZONE,
    month: "long",
    year: "numeric",
  });
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

/**
 * Memformat jam WIB (contoh: "14:30 WIB") untuk ISO timestamp; mengembalikan "" bila date-only.
 */
export function formatTimeWibDisplay(input?: string | Date | null): string {
  if (!input) return "";
  if (typeof input === "string" && isValidDateOnly(input.trim())) {
    return "";
  }
  const parsed = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(parsed.getTime())) return "";

  const timeText = parsed.toLocaleTimeString("id-ID", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${timeText.replace(".", ":")} WIB`;
}

/**
 * Memformat tanggal & jam WIB secara ringkas ("10 Nov 2026, 14:30 WIB") atau tanggal saja jika date-only.
 */
export function formatDateTimeWibDisplay(
  input?: string | Date | null,
  options?: { longMonth?: boolean }
): string {
  if (!input) return "-";
  if (typeof input === "string" && isValidDateOnly(input.trim())) {
    return formatDateWibDisplay(input, options);
  }
  const datePart = formatDateWibDisplay(input, options);
  const timePart = formatTimeWibDisplay(input);
  return timePart ? `${datePart}, ${timePart}` : datePart;
}
