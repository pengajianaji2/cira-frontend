import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { uploadPrivateFile } from "@/shared/lib/private-file-upload";
import { ApiResponse } from "@/shared/types/api.types";
import { DesignAsset } from "../types/assets.types";

export const assetsApi = {
  async getAssets(projectId: string): Promise<ApiResponse<DesignAsset[]>> {
    const response = await apiClient.get<ApiResponse<DesignAsset[]>>(`/projects/${projectId}/assets`); return response.data;
  },
  async compressAndUpload(projectId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<DesignAsset>> {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("File harus berupa gambar (PNG, JPG, JPEG, WebP).");
    let processed: File = file;
    try { processed = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true }); } catch { /* Validasi ukuran dilakukan server-side. */ }
    const uploaded = await uploadPrivateFile(processed, { category: "DESIGN", projectId, originalSize: file.size }, onProgress);
    const response = await apiClient.post<ApiResponse<DesignAsset>>(`/projects/${projectId}/assets`, { uploadSessionId: uploaded.sessionId }); return response.data;
  },
  async deleteAsset(assetId: string): Promise<ApiResponse<{ id: string }>> { const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/assets/${assetId}`); return response.data; },
};
