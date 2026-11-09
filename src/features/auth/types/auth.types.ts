import { z } from "zod";
export type * from "@/shared/types/auth.types";

export const WHATSAPP_INTERNATIONAL_REGEX = /^\+?[1-9]\d{6,14}$/;
export const INSTAGRAM_HANDLE_REGEX = /^[a-zA-Z0-9._]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  whatsapp: z
    .string()
    .optional()
    .refine((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed === "" || WHATSAPP_INTERNATIONAL_REGEX.test(trimmed);
    }, "Nomor WhatsApp harus format internasional valid (misal: +6281234567890)"),
  instagram: z
    .string()
    .optional()
    .refine((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed === "" || INSTAGRAM_HANDLE_REGEX.test(trimmed);
    }, "Username Instagram hanya boleh huruf, angka, titik, dan garis bawah (tanpa @ atau URL)"),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export interface NormalizedProfilePayload {
  name: string;
  email: string;
  whatsapp: string | null;
  instagram: string | null;
}

export function normalizeProfileInput(input: ProfileInput): NormalizedProfilePayload {
  const whatsapp = input.whatsapp?.trim() ?? "";
  const instagram = input.instagram?.trim() ?? "";
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    whatsapp: whatsapp === "" ? null : whatsapp,
    instagram: instagram === "" ? null : instagram,
  };
}

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").max(72, "Password terlalu panjang"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const activateSchema = z
  .object({
    token: z.string().min(1, "Token aktivasi wajib disertakan"),
    name: z.string().min(2, "Nama minimal 2 karakter"),
    whatsapp: z.string().regex(
      /^\+?[1-9]\d{6,14}$/,
      "Nomor WhatsApp harus berformat internasional valid (contoh: +6281234567890)"
    ),
    instagram: z
      .string()
      .min(1, "Username Instagram wajib diisi")
      .regex(
        /^[a-zA-Z0-9._]+$/,
        "Username Instagram hanya boleh huruf, angka, titik, dan garis bawah (tanpa @ atau URL)"
      ),
    password: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ActivateInput = z.infer<typeof activateSchema>;

export interface InviteInfoResponse {
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
}
