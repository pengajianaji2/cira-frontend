import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import { DesignAsset } from "../types/assets.types";

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
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
   * Mengompresi file gambar secara otomatis di browser dan mengunggahnya ke database backend.
   */
  async compressAndUpload(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<DesignAsset>> {
    if (!file.type.startsWith("image/")) {
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
    } catch (err) {
      console.warn("Gagal melakukan kompresi gambar, menggunakan file asli:", err);
      processedFile = file;
    }

    const compressedSize = processedFile.size;
    const compressionRatio =
      originalSize > compressedSize
        ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
        : 0;

    const dataUrl = await readFileAsDataUrl(processedFile);

    const payload = {
      name: file.name,
      originalSize,
      compressedSize,
      compressionRatio,
      dataUrl,
      mimeType: file.type,
    };

    const response = await apiClient.post<ApiResponse<DesignAsset>>(
      `/projects/${projectId}/assets`,
      payload
    );

    return response.data;
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
