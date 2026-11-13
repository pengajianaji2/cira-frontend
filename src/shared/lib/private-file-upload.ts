import { apiClient } from "./api-client";
import { ApiResponse } from "../types/api.types";

type Category = "AVATAR" | "DESIGN" | "PROOF" | "BAST" | "PRD" | "INVOICE";
type Session = { id: string; offset: number; sizeBytes: number; status: string; chunkBytes: number; fileId?: string };

export async function uploadPrivateFile(file: File, context: { category: Category; projectId?: string; paymentId?: string; termId?: string; description?: string; originalSize?: number }, onProgress?: (progress: number) => void) {
  const key = `cira-upload:${JSON.stringify([context.category, context.projectId, context.paymentId, context.termId, file.name, file.size, file.lastModified])}`;
  let session: Session | null = null;
  const savedId = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  if (savedId) {
    try {
      const resumed = await apiClient.get<ApiResponse<Session>>(`/files/upload-sessions/${savedId}`);
      if (resumed.data.data.sizeBytes === file.size && ["UPLOADING", "UPLOADED", "COMPLETED"].includes(resumed.data.data.status)) session = resumed.data.data;
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      if (status && status >= 500) throw error;
      // Expired or cancelled sessions are replaced below after the server has
      // attempted Drive cleanup when their status was checked.
    }
    if (!session) window.localStorage.removeItem(key);
  }
  if (!session) {
    const created = await apiClient.post<ApiResponse<Session>>("/files/upload-sessions", { ...context, name: file.name, mimeType: file.type, sizeBytes: file.size });
    session = created.data.data;
    window.localStorage.setItem(key, session.id);
  }
  let current: Session = session;
  while (current.offset < file.size) {
    const start = current.offset;
    const end = Math.min(start + current.chunkBytes, file.size);
    const chunk = file.slice(start, end);
    let confirmed = false;
    for (let attempt = 0; attempt < 3 && !confirmed; attempt++) {
      try {
        const chunkResponse = await apiClient.put<ApiResponse<Session>>(`/files/upload-sessions/${current.id}/chunks`, chunk, {
          headers: { "Content-Type": "application/octet-stream", "Content-Range": `bytes ${start}-${end - 1}/${file.size}` },
        });
        current = chunkResponse.data.data;
        confirmed = current.offset > start;
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status && status < 500) throw error;
        // Reconcile after an uncertain response; retry the same chunk only if Drive confirms no progress.
        const reconciled = await apiClient.get<ApiResponse<Session>>(`/files/upload-sessions/${current.id}`);
        current = reconciled.data.data;
        confirmed = current.offset > start;
        if (!confirmed && attempt === 2) throw error;
      }
    }
    if (!confirmed) throw new Error("Upload tidak bergerak; sesi disimpan agar dapat dilanjutkan.");
    onProgress?.(Math.round((current.offset / file.size) * 100));
  }
  const completed = await apiClient.post<ApiResponse<{ fileId: string; url: string }>>(`/files/upload-sessions/${current.id}/complete`);
  window.localStorage.removeItem(key);
  return { ...completed.data.data, sessionId: current.id };
}

export function resolvePrivateFileUrl(url?: string | null) {
  if (!url || /^https?:\/\//i.test(url)) return url ?? undefined;
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  return `${configured.replace(/\/$/, "")}/${url.replace(/^\/?api\/v1\//, "").replace(/^\//, "")}`;
}
