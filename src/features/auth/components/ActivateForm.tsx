"use client";

import React, { useState } from "react";
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
      <div className="size-9 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/80 shadow-xs bg-white">
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
        <span className="font-bold text-neutral-900 tracking-tight text-sm leading-none block">
          Cira<span className="text-[#f7941e]">.</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-medium tracking-wide block uppercase mt-0.5">
          Project Management
        </span>
      </div>
    </div>
  );
}

export function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
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
      <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-neutral-50/50">
        <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <CiraLogo />
          <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2.5 text-xs text-left">
            <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Tautan Tidak Lengkap</p>
              <p className="text-red-600/90">Parameter token aktivasi tidak ditemukan pada URL.</p>
            </div>
          </div>
          <Link href="/login" className="inline-block w-full">
            <Button variant="outline" className="w-full rounded-xl">
              Kembali ke Halaman Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-neutral-50/50">
        <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-sm text-center space-y-3">
          <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Memverifikasi tautan undangan...</p>
        </div>
      </div>
    );
  }

  if (isError || !inviteInfo) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-neutral-50/50">
        <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <CiraLogo />
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3 text-xs text-left">
            <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Undangan Tidak Valid / Kedaluwarsa</p>
              <p className="text-red-700/90 mt-0.5 leading-relaxed">
                {(error as Error)?.message ||
                  "Tautan undangan ini telah kedaluwarsa (berlaku 24 jam) atau sudah pernah digunakan. Silakan hubungi Owner untuk mengirim ulang undangan."}
              </p>
            </div>
          </div>
          <Link href="/login" className="inline-block w-full">
            <Button variant="outline" className="w-full rounded-xl">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-neutral-50/50">
      <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <CiraLogo />
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 mt-2">
            Aktivasi Akun Tim
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Anda diundang bergabung sebagai{" "}
            <span className="font-semibold text-neutral-800 capitalize bg-neutral-100 px-1.5 py-0.5 rounded-md">
              {inviteInfo.role}
            </span>{" "}
            untuk akun <span className="font-medium text-neutral-800">{inviteInfo.email}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} value={token} />

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 block">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              {...register("name")}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 block">
              Nomor WhatsApp Internasional <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <HugeiconsIcon icon={WhatsappIcon} className="size-4" />
              </span>
              <input
                type="text"
                placeholder="+6281234567890"
                {...register("whatsapp")}
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>
            {errors.whatsapp && (
              <p className="text-[11px] text-red-600 font-medium">{errors.whatsapp.message}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Wajib menyertakan kode negara (misal +62 untuk Indonesia).</p>
          </div>

          {/* Username Instagram */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 block">
              Username Instagram <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <HugeiconsIcon icon={InstagramIcon} className="size-4" />
              </span>
              <input
                type="text"
                placeholder="username_anda"
                {...register("instagram")}
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {errors.instagram && (
              <p className="text-[11px] text-red-600 font-medium">{errors.instagram.message}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Tuliskan handle saja tanpa tanda @ atau tautan URL.</p>
          </div>

          {/* Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 block">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                {...register("password")}
                className="w-full px-3.5 py-2 pr-10 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 block">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ketik ulang password baru"
                {...register("confirmPassword")}
                className="w-full px-3.5 py-2 pr-10 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <HugeiconsIcon
                  icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={activateMutation.isPending}
            className="w-full rounded-xl py-2.5 text-xs font-semibold shadow-xs"
          >
            {activateMutation.isPending ? "Mengaktifkan Akun..." : "Aktifkan Akun & Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
