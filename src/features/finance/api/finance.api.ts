import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  FinanceSummary,
} from "../types/finance.types";

/**
 * Service API Manajemen Keuangan & Termin Proyek
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects/:id/payments, /api/v1/payments/:id, & /api/v1/projects/:id/finance-summary)
 */
export const financeApi = {
  /**
   * Mengambil seluruh daftar termin pembayaran berdasarkan ID proyek dari backend.
   */
  async getPayments(projectId: string): Promise<ApiResponse<Payment[]>> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      `/projects/${projectId}/payments`
    );
    return response.data;
  },

  /**
   * Menambahkan termin pembayaran baru dengan status default Pending.
   */
  async createPayment(
    projectId: string,
    input: CreatePaymentInput
  ): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>(
      `/projects/${projectId}/payments`,
      input
    );
    return response.data;
  },

  /**
   * Memperbarui informasi termin pembayaran (judul, nilai, tanggal jatuh tempo, catatan).
   */
  async updatePayment(
    paymentId: string,
    input: UpdatePaymentInput
  ): Promise<ApiResponse<Payment>> {
    const response = await apiClient.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}`,
      input
    );
    return response.data;
  },

  /**
   * Memverifikasi bukti pembayaran transfer bank oleh Owner (mengubah status ke Verified / Pending).
   */
  async verifyPayment(
    paymentId: string,
    verified: boolean
  ): Promise<ApiResponse<Payment>> {
    const response = await apiClient.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}/verify`,
      { verified }
    );
    return response.data;
  },

  /**
   * Mengunggah berkas foto bukti transfer bank dengan kompresi gambar otomatis di browser
   * dan menyimpannya ke database via backend.
   */
  async uploadProof(
    paymentId: string,
    file: File
  ): Promise<ApiResponse<{ proofUrl: string; proofFileName: string }>> {
    let processedFile: File = file;
    if (file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 1.0, // Kompresi hingga maksimal 1MB
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
      } catch (err) {
        console.warn("Gagal kompresi bukti transfer, memakai file asli:", err);
      }
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(processedFile);
    });

    const response = await apiClient.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}`,
      {
        proofUrl: dataUrl,
        proofFileName: file.name,
      }
    );

    return {
      success: true,
      message: response.data.message || "Bukti transfer berhasil diunggah",
      data: {
        proofUrl: dataUrl,
        proofFileName: file.name,
      },
    };
  },

  /**
   * Menghapus termin pembayaran.
   */
  async deletePayment(paymentId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/payments/${paymentId}`
    );
    return response.data;
  },

  /**
   * Memperbarui total nilai kontrak resmi proyek di backend.
   */
  async updateContractValue(
    projectId: string,
    contractValue: number
  ): Promise<ApiResponse<{ contractValue: number }>> {
    const response = await apiClient.patch<ApiResponse<{ contractValue: number }>>(
      `/projects/${projectId}`,
      { contractValue }
    );

    return {
      success: true,
      message: "Nilai kontrak proyek berhasil diperbarui",
      data: { contractValue: response.data.data.contractValue },
    };
  },

  /**
   * Mengambil ringkasan kalkulasi metrik keuangan proyek langsung dari backend.
   */
  async getFinanceSummary(
    projectId: string,
    _contractValue: number = 0
  ): Promise<FinanceSummary> {
    const response = await apiClient.get<ApiResponse<FinanceSummary>>(
      `/projects/${projectId}/finance-summary`
    );
    return response.data.data;
  },
};
