import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Payment,
  PaymentTerm,
  CreatePaymentInput,
  UpdatePaymentInput,
  CreateContractInput,
  UploadBastInput,
  IssueInvoiceInput,
  FinanceSummary,
} from "../types/finance.types";

/**
 * Service API Manajemen Keuangan, Kontrak & Termin Proyek
 * Terhubung langsung ke Backend API Cira PM:
 * - /api/v1/projects/:id/contracts
 * - /api/v1/projects/:id/payment-terms
 * - /api/v1/payment-terms/:id
 * - /api/v1/projects/:id/payments
 * - /api/v1/payments/:id
 * - /api/v1/projects/:id/finance-summary
 */
export const financeApi = {
  // =========================================================================
  // US-4: Kontrak & Termin Berbobot 100%, BAST, dan Invoice Resmi
  // =========================================================================

  /**
   * Mengonfigurasi kontrak proyek dan seluruh termin pembayaran bertotal tepat 100% (AC-13).
   */
  async createContract(
    projectId: string,
    input: CreateContractInput
  ): Promise<ApiResponse<{ project: unknown; terms: PaymentTerm[] }>> {
    const response = await apiClient.post<ApiResponse<{ project: unknown; terms: PaymentTerm[] }>>(
      `/projects/${projectId}/contracts`,
      input
    );
    return response.data;
  },


  /**
   * Mengambil seluruh daftar termin pembayaran berbobot berdasarkan ID proyek.
   */
  async getProjectTerms(projectId: string): Promise<ApiResponse<PaymentTerm[]>> {
    const response = await apiClient.get<ApiResponse<PaymentTerm[]>>(
      `/projects/${projectId}/payment-terms`
    );
    return response.data;
  },

  /**
   * Mengambil detail satu termin pembayaran berdasarkan ID termin.
   */
  async getTermById(termId: string): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.get<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}`
    );
    return response.data;
  },

  /**
   * Mengunggah bukti BAST dan mengubah status termin menjadi 'ready' / Siap Ditagih (AC-14).
   */
  async markTermReadyWithBast(
    termId: string,
    input: UploadBastInput
  ): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.patch<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}/ready`,
      input
    );
    return response.data;
  },

  /**
   * Mengunggah berkas BAST (PDF, JPG, PNG) dari browser sebagai data URL base64.
   */
  async uploadBastFile(
    termId: string,
    file: File
  ): Promise<ApiResponse<PaymentTerm>> {
    let processedFile: File = file;
    if (file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
      } catch (err) {
        console.warn("Gagal kompresi berkas gambar BAST, memakai file asli:", err);
      }
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(processedFile);
    });

    return this.markTermReadyWithBast(termId, {
      bastUrl: dataUrl,
      bastFileName: file.name,
    });
  },

  /**
   * Menerbitkan invoice resmi bernomor unik INV-YYYY-NNN/Tn dan mengunci termin (AC-15).
   */
  async issueInvoice(
    termId: string,
    input: IssueInvoiceInput = {}
  ): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.post<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}/invoice`,
      input
    );
    return response.data;
  },

  /**
   * Menghapus termin pembayaran yang belum terkunci.
   */
  async deleteTerm(termId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/payment-terms/${termId}`
    );
    return response.data;
  },

  // =========================================================================
  // Existing Payment Handlers
  // =========================================================================

  /**
   * Mengambil seluruh daftar termin pembayaran lama berdasarkan ID proyek.
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
          maxSizeMB: 1.0,
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
      `/projects/${projectId}/contract-value`,
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
    projectId: string
  ): Promise<FinanceSummary> {
    const response = await apiClient.get<ApiResponse<FinanceSummary>>(
      `/projects/${projectId}/finance-summary`
    );
    return response.data.data;
  },
};
