import { z } from "zod";

export type PaymentStatus = "pending" | "verified";

// US-3: Tipe Trigger & Status Termin Kontrak
export type TermTriggerType = "date" | "sprint" | "manual";
export type TermStatus = "planned" | "ready" | "invoiced" | "paid";

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

export interface PaymentTerm {
  id: string;
  projectId: string;
  termNumber: number;
  title: string;
  percentage: number;
  amount: number;
  triggerType: TermTriggerType;
  triggerDate?: string | null;
  requiredCompletedSprints?: number | null;
  triggerSprintId?: string | null;
  triggerSprint?: { id: string; name: string; status: string } | null;
  dueDate?: string | null;
  status: TermStatus;
  readyAt?: string | null;
  bastUrl?: string | null;
  bastFileName?: string | null;
  bastUploadedAt?: string | null;
  invoiceNumber?: string | null;
  invoiceIssuedAt?: string | null;
  invoiceDueDate?: string | null;
  paidAt?: string | null;
  invoicePdfUrl?: string | null;
  isLocked: boolean;
  overdue?: boolean;
  notes?: string | null;
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

// US-3: Input DTOs untuk Kontrak, Pemicu Termin & Penerbitan Invoice
export interface TerminInput {
  title: string;
  percentage: number;
  triggerType: TermTriggerType;
  triggerDate?: string | null;
  requiredCompletedSprints?: number | null;
  triggerSprintId?: string | null;
  dueDate?: string | null;
  notes?: string | null;
}

export interface UpdateTermInput {
  title?: string;
  triggerType?: TermTriggerType;
  triggerDate?: string | null;
  requiredCompletedSprints?: number | null;
  notes?: string | null;
}

export interface CreateContractInput {
  contractValue: number;
  terms: TerminInput[];
}

export interface UploadBastInput {
  bastUrl?: string;
  bastFileName?: string;
  notes?: string;
}

export interface IssueInvoiceInput {
  invoiceNumber?: string;
  invoiceDueDate: string;
  notes?: string;
  invoicePdfUrl?: string;
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
  termsCount?: number;
  totalInvoiced?: number;
}
