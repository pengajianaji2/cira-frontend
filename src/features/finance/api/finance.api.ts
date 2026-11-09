import imageCompression from "browser-image-compression";
import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Payment,
  PaymentTerm,
  CreatePaymentInput,
  UpdatePaymentInput,
  CreateContractInput,
  UpdateTermInput,
  UploadBastInput,
  IssueInvoiceInput,
  FinanceSummary,
} from "../types/finance.types";

/**
 * Service API Manajemen Keuangan, Kontrak & Termin Proyek
 * - /api/v1/projects/:id/contracts
 * - /api/v1/projects/:id/payment-terms
 * - /api/v1/payment-terms/:id
 * - /api/v1/projects/:id/payments
 * - /api/v1/payments/:id
 * - /api/v1/projects/:id/finance-summary
 */
/**
 * Client API Manajemen Keuangan, Kontrak 100%, Pemicu Termin, Upload BAST, Invoice Resmi & Pembayaran Proyek.
 * Terhubung ke endpoint `/projects/:id/contracts`, `/projects/:id/payment-terms`, `/payment-terms/:id`, dan `/payments`.
 */
export const financeApi = {
  /**
   * Mengonfigurasi nilai kontrak dan daftar termin pembayaran berbobot tepat 100% pada suatu proyek.
   */
  async createContract(
    projectId: string,
    input: CreateContractInput
  ): Promise<ApiResponse<{ contractValue: number; terms: PaymentTerm[] }>> {
    const response = await apiClient.post<
      ApiResponse<{ contractValue: number; terms: PaymentTerm[] }>
    >(`/projects/${projectId}/contracts`, input);
    return response.data;
  },

  /** Mengambil daftar seluruh termin pembayaran (`PaymentTerm`) suatu proyek beserta status overdue WIB. */
  async getProjectTerms(projectId: string): Promise<ApiResponse<PaymentTerm[]>> {
    const response = await apiClient.get<ApiResponse<PaymentTerm[]>>(
      `/projects/${projectId}/payment-terms`
    );
    return response.data;
  },

  /** Mengambil detail satu termin pembayaran (`PaymentTerm`) berdasarkan ID. */
  async getTermById(termId: string): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.get<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}`
    );
    return response.data;
  },

  /** Memperbarui judul, catatan, atau pemicu tunggal termin yang belum berstatus `invoiced`/`paid`. */
  async updateTerm(
    termId: string,
    input: UpdateTermInput
  ): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.patch<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}`,
      input
    );
    return response.data;
  },

  /**
   * Menandai termin siap ditagih ('ready') secara manual maupun dengan BAST opsional.
   */
  async markTermReadyWithBast(
    termId: string,
    input: UploadBastInput = {}
  ): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.patch<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}/ready`,
      input
    );
    return response.data;
  },

  /** Mengompresi gambar BAST (jika bertipe image) menjadi Data URL lalu menandai termin siap ditagih. */
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
   * Mencatat/menerbitkan invoice resmi dari termin berstatus 'ready' dengan invoiceDueDate wajib.
   */
  async issueInvoice(
    termId: string,
    input: IssueInvoiceInput
  ): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.post<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}/invoice`,
      input
    );
    return response.data;
  },

  /**
   * Menandai termin berstatus 'invoiced' menjadi Lunas ('paid').
   */
  async markTermPaid(termId: string): Promise<ApiResponse<PaymentTerm>> {
    const response = await apiClient.patch<ApiResponse<PaymentTerm>>(
      `/payment-terms/${termId}/pay`
    );
    return response.data;
  },

  /** Menghapus termin pembayaran yang belum memiliki invoice resmi atau terkunci. */
  async deleteTerm(termId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/payment-terms/${termId}`
    );
    return response.data;
  },

  // =========================================================================
  // Existing Payment Handlers
  // =========================================================================

  async getPayments(projectId: string): Promise<ApiResponse<Payment[]>> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      `/projects/${projectId}/payments`
    );
    return response.data;
  },

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

  async deletePayment(paymentId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/payments/${paymentId}`
    );
    return response.data;
  },

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
   * Mengambil ringkasan kas dan status pembayaran DP proyek.
   */
  async getFinanceSummary(projectId: string): Promise<FinanceSummary> {
    const response = await apiClient.get<ApiResponse<FinanceSummary>>(
      `/projects/${projectId}/finance-summary`
    );
    return response.data.data;
  },
};
