"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { loginSchema, LoginInput } from "../types/auth.types";
import { useLoginMutation } from "../queries/auth.queries";
import { AuthBackdrop } from "./AuthBackdrop";

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

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthBackdrop className="p-3 sm:p-4 md:p-6">
      {/* Main White Card Container */}
      <div className="w-full max-w-[920px] md:max-h-[540px] bg-card rounded-[32px] md:rounded-[40px] border border-border shadow-xl p-5 sm:p-7 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center overflow-hidden">
        {/* Kolom Kiri: Form Login */}
        <div className="w-full max-w-[340px] mx-auto flex flex-col justify-center">
          {/* Logo Cira */}
          <CiraLogo />

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome, Ciraku Member
            </h1>
            <p className="text-xs text-muted-foreground font-normal mt-1">
              Silakan masukkan akun tim Anda untuk melanjutkan ke dashboard.
            </p>
          </div>

          {/* Formulir Email & Password */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Input Email */}
            <div className="space-y-1">
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  disabled={loginMutation.isPending || isSubmitting}
                  className="w-full h-11 rounded-full border border-input-border bg-card px-4 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
                  {...register("email")}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.email && (
                <p role="alert" className="text-xs text-status-danger-text pl-3">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  disabled={loginMutation.isPending || isSubmitting}
                  className="w-full h-11 rounded-full border border-input-border bg-card px-4 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-11 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                    className="size-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-xs text-status-danger-text pl-3">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none py-1">
                <input
                  type="checkbox"
                  className="rounded border-input-border text-secondary focus-visible:ring-2 focus-visible:ring-ring size-4 cursor-pointer accent-secondary"
                  {...register("rememberMe")}
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-accent-foreground hover:underline font-medium py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending || isSubmitting}
              className="w-full rounded-full h-11 bg-[#f7941e] hover:bg-[#e68310] active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center mt-2 disabled:opacity-70 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {loginMutation.isPending || isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: The Exact Reference Illustration via next/image */}
        <div className="hidden md:block w-full h-[460px] rounded-[24px] overflow-hidden relative shadow-inner bg-muted">
          <Image
            src="/images/login-illustration.webp"
            alt="Field Illustration"
            fill
            priority
            sizes="(min-width: 768px) 460px, 100vw"
            className="object-cover rounded-[24px]"
          />
        </div>
      </div>
    </AuthBackdrop>
  );
}
