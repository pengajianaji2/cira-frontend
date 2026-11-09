"use client";

import Link from "next/link";
import { useState } from "react";
import { authApi, AuthBackdrop } from "@/features/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email belum dapat dikirim.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthBackdrop>
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-lg">
        <h1 className="text-xl font-bold text-foreground">Lupa password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan email akun Cira PM. Jika terdaftar, kami akan mengirim tautan reset yang berlaku 30 menit.
        </p>

        {sent ? (
          <div
            role="status"
            className="mt-6 rounded-xl border border-status-success-border bg-status-success-surface p-4 text-sm text-status-success-text"
          >
            Jika email terdaftar, tautan reset password akan dikirim. Periksa kotak masuk dan folder spam.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="forgot-password-email" className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Email akun</span>
              <input
                id="forgot-password-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full h-11 rounded-xl border border-input-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-status-danger-text font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-11 rounded-xl bg-[#f7941e] hover:bg-[#e68310] py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {busy ? "Mengirim..." : "Kirim tautan reset"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-5 inline-flex items-center py-2 text-sm font-medium text-accent-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          Kembali ke login
        </Link>
      </section>
    </AuthBackdrop>
  );
}
