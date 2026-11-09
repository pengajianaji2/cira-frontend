"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  InstagramIcon,
  ViewIcon,
  ViewOffSlashIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { activateSchema, ActivateInput } from "../types/auth.types";
import { useActivateMutation, useInviteInfoQuery } from "../queries/auth.queries";
import { Button } from "@/components/ui/button";

function CiraLogo() {
  return (
    <div className="flex items-center gap-3 mb-3.5">
      <div className="size-9 rounded-2xl overflow-hidden shrink-0 border border-border shadow-xs bg-card">
        <Image
          src="/logo-cira.webp"
          alt="Cira Logo"
          width={36}
          height={36}
          priority
          className="size-full object-cover"
        />
      </div>
      <div>
        <span className="font-bold text-foreground tracking-tight text-sm leading-none block">
          Cira<span className="text-[#f7941e]">.</span>
        </span>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide block uppercase mt-0.5">
          Project Management
        </span>
      </div>
    </div>
  );
}

export function ActivateForm() {
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token") || "");
  useEffect(() => {
    if (token) window.history.replaceState(null, "", window.location.pathname);
  }, [token]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: inviteInfo, isLoading, isError, error } = useInviteInfoQuery(token);
  const activateMutation = useActivateMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateInput>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      token,
      name: "",
      whatsapp: "",
      instagram: "",
      password: "",
      confirmPassword: "",
    },
    values: {
      token,
      name: "",
      whatsapp: "",
      instagram: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ActivateInput) => {
    activateMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-lg text-center space-y-4">
        <CiraLogo />
        <div
          role="alert"
          className="p-3.5 bg-status-danger-surface border border-status-danger-border text-status-danger-text rounded-xl flex items-center gap-2.5 text-xs text-left"
        >
          <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Tautan Tidak Lengkap</p>
            <p className="opacity-90 mt-0.5">Parameter token aktivasi tidak ditemukan pada URL.</p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full h-11 rounded-xl">
          <Link href="/login">Kembali ke Halaman Login</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg text-center space-y-3">
        <div className="size-7 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-medium">Memverifikasi tautan undangan...</p>
      </div>
    );
  }

  if (isError || !inviteInfo) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-lg text-center space-y-4">
        <CiraLogo />
        <div
          role="alert"
          className="p-3.5 bg-status-danger-surface border border-status-danger-border text-status-danger-text rounded-xl flex items-start gap-3 text-xs text-left"
        >
          <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Undangan Tidak Valid / Kedaluwarsa</p>
            <p className="opacity-90 mt-0.5 leading-relaxed">
              {(error as Error)?.message ||
                "Tautan undangan ini telah kedaluwarsa (berlaku 24 jam) atau sudah pernah digunakan. Silakan hubungi Owner untuk mengirim ulang undangan."}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full h-11 rounded-xl">
          <Link href="/login">Kembali ke Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
      <div>
        <CiraLogo />
        <h1 className="text-lg font-bold tracking-tight text-foreground mt-2">
          Aktivasi Akun Tim
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Anda diundang bergabung sebagai{" "}
          <span className="font-semibold text-foreground capitalize bg-muted px-1.5 py-0.5 rounded-md">
            {inviteInfo.role}
          </span>{" "}
          untuk akun <span className="font-medium text-foreground">{inviteInfo.email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} value={token} />

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label htmlFor="activate-name" className="text-xs font-medium text-foreground block">
            Nama Lengkap <span className="text-status-danger-text">*</span>
          </label>
          <input
            id="activate-name"
            type="text"
            autoComplete="name"
            placeholder="Contoh: Budi Santoso"
            {...register("name")}
            className="w-full h-11 px-3.5 text-xs rounded-xl border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
          />
          {errors.name && (
            <p role="alert" className="text-xs text-status-danger-text font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Nomor WhatsApp */}
        <div className="space-y-1.5">
          <label htmlFor="activate-whatsapp" className="text-xs font-medium text-foreground block">
            Nomor WhatsApp Internasional <span className="text-status-danger-text">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <HugeiconsIcon icon={WhatsappIcon} className="size-4" aria-hidden="true" />
            </span>
            <input
              id="activate-whatsapp"
              type="text"
              autoComplete="tel"
              placeholder="+6281234567890"
              {...register("whatsapp")}
              className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors font-mono"
            />
          </div>
          {errors.whatsapp && (
            <p role="alert" className="text-xs text-status-danger-text font-medium">
              {errors.whatsapp.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Wajib menyertakan kode negara (misal +62 untuk Indonesia).
          </p>
        </div>

        {/* Username Instagram */}
        <div className="space-y-1.5">
          <label htmlFor="activate-instagram" className="text-xs font-medium text-foreground block">
            Username Instagram <span className="text-status-danger-text">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <HugeiconsIcon icon={InstagramIcon} className="size-4" aria-hidden="true" />
            </span>
            <input
              id="activate-instagram"
              type="text"
              placeholder="username_anda"
              {...register("instagram")}
              className="w-full h-11 pl-10 pr-3.5 text-xs rounded-xl border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            />
          </div>
          {errors.instagram && (
            <p role="alert" className="text-xs text-status-danger-text font-medium">
              {errors.instagram.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Tuliskan handle saja tanpa tanda @ atau tautan URL.
          </p>
        </div>

        {/* Password Baru */}
        <div className="space-y-1.5">
          <label htmlFor="activate-password" className="text-xs font-medium text-foreground block">
            Password Baru <span className="text-status-danger-text">*</span>
          </label>
          <div className="relative">
            <input
              id="activate-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              {...register("password")}
              className="w-full h-11 px-3.5 pr-11 text-xs rounded-xl border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password baru" : "Tampilkan password baru"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="text-xs text-status-danger-text font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div className="space-y-1.5">
          <label htmlFor="activate-confirm-password" className="text-xs font-medium text-foreground block">
            Konfirmasi Password <span className="text-status-danger-text">*</span>
          </label>
          <div className="relative">
            <input
              id="activate-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ketik ulang password baru"
              {...register("confirmPassword")}
              className="w-full h-11 px-3.5 pr-11 text-xs rounded-xl border border-input-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi password"
                  : "Tampilkan konfirmasi password"
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <HugeiconsIcon
                icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="text-xs text-status-danger-text font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={activateMutation.isPending}
          className="w-full h-11 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          {activateMutation.isPending ? "Mengaktifkan Akun..." : "Aktifkan Akun & Masuk"}
        </Button>
      </form>
    </div>
  );
}
