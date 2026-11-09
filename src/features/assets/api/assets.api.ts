import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import { DesignAsset } from "../types/assets.types";

interface CloudinaryUploadAuthorization {
  timestamp: number;
  folder: string;
  public_id: string;
  type: "authenticated";
  signature: string;
  apiKey: string;
  cloudName: string;
}

function uploadToCloudinary(file: Blob, auth: CloudinaryUploadAuthorization, onProgress?: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", auth.apiKey);
    body.append("timestamp", String(auth.timestamp));
    body.append("folder", auth.folder);
    body.append("public_id", auth.public_id);
    body.append("type", auth.type);
    body.append("signature", auth.signature);
    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("Koneksi unggah aset terputus."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Cloudinary menolak unggahan gambar."));
    };
    request.send(body);
  });
}

/**
 * Service API Manajemen Aset Desain & Kompresi Browser
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects/:id/assets & /api/v1/assets/:id)
 */
export const assetsApi = {
  /**
   * Mengambil daftar aset desain berdasarkan ID proyek dari backend.
   */
  async getAssets(projectId: string): Promise<ApiResponse<DesignAsset[]>> {
    const response = await apiClient.get<ApiResponse<DesignAsset[]>>(
      `/projects/${projectId}/assets`
    );
    return response.data;
  },

  /**
   * Mengompresi gambar lalu mengunggah langsung ke penyimpanan privat dengan signature server.
   */
  async compressAndUpload(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<DesignAsset>> {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      throw new Error("File harus berupa gambar (PNG, JPG, JPEG, WebP).");
    }

    const originalSize = file.size;

    // AC-9: Kompresi gambar secara otomatis di sisi browser via browser-image-compression
    const options = {
      maxSizeMB: 1.8,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      onProgress: (p: number) => {
        if (onProgress) onProgress(p);
      },
    };

    let processedFile: File | Blob = file;
    try {
      processedFile = await imageCompression(file, options);
    } catch {
      if (file.size > 2_000_000) throw new Error("Gambar terlalu besar dan gagal dikompresi. Coba file yang lebih kecil.");
      processedFile = file;
    }

    const compressedSize = processedFile.size;
    const mimeType = processedFile.type || file.type;
    if (compressedSize > 2_000_000) throw new Error("Ukuran gambar setelah kompresi harus maksimal 2 MB.");
    const compressionRatio =
      originalSize > compressedSize
        ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
        : 0;

    const authorizationResponse = await apiClient.post<ApiResponse<CloudinaryUploadAuthorization>>(
      `/projects/${projectId}/assets/upload-signature`,
      { name: file.name, originalSize, mimeType }
    );
    const authorization = authorizationResponse.data.data;
    try {
      await uploadToCloudinary(processedFile, authorization, onProgress);
      const response = await apiClient.post<ApiResponse<DesignAsset>>(
        `/projects/${projectId}/assets`,
        {
          name: file.name,
          originalSize,
          compressionRatio,
          mimeType,
          publicId: authorization.public_id,
        }
      );
      return response.data;
    } catch (error) {
      await apiClient.delete(`/projects/${projectId}/assets/upload/${authorization.public_id}`).catch(() => undefined);
      throw error;
    }
  },

  /**
   * Menghapus aset gambar dari galeri proyek di backend.
   */
  async deleteAsset(assetId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/assets/${assetId}`
    );
    return response.data;
  },
};
