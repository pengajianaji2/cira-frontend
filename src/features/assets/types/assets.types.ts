export interface DesignAsset {
  id: string;
  projectId: string;
  name: string;
  originalSize: number; // Dalam bytes
  compressedSize: number; // Dalam bytes
  compressionRatio: number; // Persentase penghematan (misal: 65%)
  dataUrl: string; // Signed authenticated delivery URL
  mimeType: string;
  createdAt: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
