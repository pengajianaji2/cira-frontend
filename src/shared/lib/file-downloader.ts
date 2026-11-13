import { resolvePrivateFileUrl } from "./private-file-upload";

/**
 * Mengambil blob berkas berautentikasi dari backend melalui CORS dengan menyertakan credentials (cookie).
 */
async function fetchPrivateFileBlob(
  fileUrl: string | null | undefined,
  mode: "download" | "inline" = "download"
): Promise<Blob> {
  const url = resolvePrivateFileUrl(fileUrl);
  if (!url) {
    throw new Error("URL berkas tidak valid.");
  }

  const separator = url.includes("?") ? "&" : "?";
  const fetchUrl = mode === "download" ? `${url}${separator}mode=download` : url;

  const response = await fetch(fetchUrl, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Gagal mengambil berkas (${response.status}).`;
    try {
      const json = (await response.json()) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // Abaikan jika respons bukan JSON
    }
    throw new Error(message);
  }

  return response.blob();
}

/**
 * Mengunduh berkas private berautentikasi (cookie-based).
 * Mengambil stream melalui fetch authenticated, kemudian mengonversinya menjadi
 * local Object URL sehingga aman dari pembatasan navigasi lintas origin browser.
 */
export async function downloadPrivateFile(
  fileUrl: string | null | undefined,
  filename: string
): Promise<void> {
  const blob = await fetchPrivateFileBlob(fileUrl, "download");
  const objectUrl = window.URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Beri waktu browser untuk memproses unduhan sebelum membebaskan memory
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 15_000);
  }
}

/**
 * Membuka berkas private berautentikasi (misal PDF) pada tab baru via local Object URL.
 */
export async function openPrivateFileInNewTab(
  fileUrl: string | null | undefined
): Promise<void> {
  const blob = await fetchPrivateFileBlob(fileUrl, "inline");
  const objectUrl = window.URL.createObjectURL(blob);

  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
}
