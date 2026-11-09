/**
 * Memformat angka nominal menjadi string mata uang Rupiah Indonesia (`IDR`) tanpa desimal.
 *
 * @param amount - Nominal angka dalam Rupiah.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mengekstrak bagian tanggal `YYYY-MM-DD` dari string ISO atau tanggal kalender.
 */
export function extractDateOnly(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  return "";
}
