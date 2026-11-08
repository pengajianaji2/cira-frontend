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
    <div className="h-screen max-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6 bg-white overflow-hidden select-none">
      {/* Main White Card Container - Pas 100% Viewport tanpa scroll */}
      <div className="w-full max-w-[920px] max-h-[96vh] md:max-h-[540px] bg-white rounded-[32px] md:rounded-[40px] border border-neutral-200/80 shadow-xl p-5 sm:p-7 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center overflow-hidden">
        {/* Kolom Kiri: Form Login */}
        <div className="w-full max-w-[340px] mx-auto flex flex-col justify-center">
          {/* Logo Cira */}
          <CiraLogo />

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">Welcome, Ciraku Member</h1>
            <p className="text-xs text-neutral-500 font-normal mt-1">
              Silakan masukkan akun tim Anda untuk melanjutkan ke dashboard.
            </p>
          </div>

          {/* Formulir Email & Password */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Input Email */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  disabled={loginMutation.isPending || isSubmitting}
                  className="w-full h-10 rounded-full border border-neutral-300 bg-white px-4 pr-10 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 transition-all"
                  {...register("email")}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                </div>
              </div>
              {errors.email && <p className="text-[11px] text-red-500 pl-3">{errors.email.message}</p>}
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={loginMutation.isPending || isSubmitting}
                  className="w-full h-10 rounded-full border border-neutral-300 bg-white px-4 pr-10 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} className="size-4" />
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 pl-3">{errors.password.message}</p>}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-500 hover:text-neutral-700 select-none">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-neutral-800 focus:ring-0 size-3.5 cursor-pointer accent-neutral-800"
                  {...register("rememberMe")}
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[#f7941e] hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending || isSubmitting}
              className="w-full rounded-full h-10 bg-[#f7941e] hover:bg-[#e68310] active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center mt-2 disabled:opacity-70 disabled:pointer-events-none"
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
        <div className="hidden md:block w-full h-[460px] rounded-[24px] overflow-hidden relative shadow-inner bg-neutral-100">
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
    </div>
  );
}
