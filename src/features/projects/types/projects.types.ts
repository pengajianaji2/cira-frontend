import { z } from "zod";
import {
  ProjectRepoType,
  ProjectRepositoryLink,
  ProjectRosterMember,
  ProjectStatusRequest,
} from "./governance.types";

export type ProjectStatus = "lead" | "active" | "completed" | "cancelled";

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientContact: string;
  status: ProjectStatus;
  repoType?: ProjectRepoType;
  progress?: number;
  contractValue?: number;
  prdContent: string;
  createdAt: string;
  updatedAt: string;
  roster?: ProjectRosterMember[];
  repositoryLinks?: ProjectRepositoryLink[];
  statusRequests?: ProjectStatusRequest[];
  _count?: {
    tasks?: number;
    payments?: number;
    roster?: number;
    repositoryLinks?: number;
    prdVersions?: number;
  };
}

export const createProjectSchema = z.object({
  name: z.string().min(3, "Nama proyek minimal 3 karakter"),
  clientName: z.string().min(2, "Nama klien minimal 2 karakter"),
  clientContact: z.string().min(5, "Nomor kontak minimal 5 karakter"),
  contractValue: z.number().min(0, "Nilai kontrak tidak boleh negatif").optional(),
  repoType: z.enum(["monorepo", "separate"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export interface UpdateProjectInput {
  name?: string;
  clientName?: string;
  clientContact?: string;
  status?: ProjectStatus;
  progress?: number;
  contractValue?: number;
  prdContent?: string;
  repoType?: ProjectRepoType;
}

export const DEFAULT_PRD_TEMPLATE = (projectName: string, clientName: string) => `# PRD: ${projectName}

## 1. Ringkasan & Tujuan Proyek
- **Nama Proyek:** ${projectName}
- **Nama Klien:** ${clientName}
- **Tujuan Utama:** Menyediakan solusi digital terpadu yang mempermudah proses operasional, meningkatkan akurasi data, dan mempercepat alur kerja harian tim.

## 2. Cakupan & Fitur Utama (Scope of Work)
1. **Modul Manajemen & Dashboard:** Tampilan ringkasan metrik utama, status tugas aktif, dan pipeline progres secara real-time.
2. **Alur Kerja Utama:** Fungsionalitas inti pemrosesan data dengan validasi berlapis dan interface yang ramah pengguna.
3. **Penyimpanan Dokumen & Aset:** Pengunggahan bukti dokumen dan file pendukung dengan kompresi ukuran otomatis.
4. **Laporan & Ekspor Data:** Fitur generate laporan berkala yang siap diunduh dalam format PDF resmi.

## 3. Aturan Bisnis & Batasan (Business Rules)
- Pengerjaan fase pengembangan baru dapat dimulai setelah verifikasi pembayaran termin terkait.
- Semua data pengguna dilindungi dengan enkripsi standar industri dan pembatasan hak akses berbasis peran.
- Perubahan status krusial pada alur operasional akan dicatat secara otomatis dalam riwayat aktivitas.

## 4. Rencana Termin Pembayaran
- **Termin 1 (DP 50%):** Pembayaran uang muka sebelum kick-off sprint implementasi.
- **Termin 2 (Progress 30%):** Dibayarkan setelah verifikasi fitur inti dan demonstrasi sistem.
- **Termin 3 (Pelunasan 20%):** Dibayarkan setelah masa UAT (User Acceptance Testing) selesai dan serah terima dokumen resmi.
`;

export * from "./governance.types";
