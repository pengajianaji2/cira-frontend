import { z } from "zod";

export type PaymentStatus = "pending" | "verified";

export interface PaymentVerifier {
  name: string;
  role: string;
}

export interface Payment {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: PaymentStatus;
  dueDate?: string;
  notes?: string;
  proofUrl?: string;
  proofFileName?: string;
  proofUploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: PaymentVerifier;
  createdAt: string;
  updatedAt: string;
}

export const createPaymentSchema = z.object({
  title: z.string().min(3, "Nama termin minimal 3 karakter"),
  amount: z.number().min(1000, "Nominal pembayaran minimal Rp 1.000"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema> & {
  proofUrl?: string;
  proofFileName?: string;
};

export interface UpdatePaymentInput {
  title?: string;
  amount?: number;
  status?: PaymentStatus;
  dueDate?: string;
  notes?: string;
  proofUrl?: string;
  proofFileName?: string;
}

export interface FinanceSummary {
  contractValue: number;
  totalVerified: number;
  totalPending: number;
  remainingBalance: number;
  paidPercentage: number;
  milestonesCount: number;
  verifiedCount: number;
  pendingCount: number;
  hasVerifiedDp: boolean;
}
