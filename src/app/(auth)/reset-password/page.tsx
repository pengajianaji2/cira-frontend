"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, AuthBackdrop } from "@/features/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token");
    // Read legacy query links already sent, then remove credentials from browser history immediately.
    const legacyQueryToken = new URLSearchParams(window.location.search).get("token");
    setToken(fragmentToken || legacyQueryToken || "");
    window.history.replaceState(null, "", window.location.pathname);
    setTokenReady(true);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      router.replace("/login?passwordReset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tautan reset tidak valid.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthBackdrop>
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-lg">
        <h1 className="text-xl font-bold text-foreground">Atur password baru</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gunakan password minimal 8 karakter. Tautan hanya dapat digunakan sekali.
        </p>

        {!tokenReady ? (
          <p role="status" className="mt-5 text-sm text-muted-foreground">
            Memeriksa tautan reset…
          </p>
        ) : !token ? (
          <p role="alert" className="mt-5 text-sm text-status-danger-text font-medium">
            Token reset tidak ditemukan.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="reset-password-new" className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Password baru</span>
              <input
                id="reset-password-new"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full h-11 rounded-xl border border-input-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </label>

            <label htmlFor="reset-password-confirm" className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Ulangi password baru</span>
              <input
                id="reset-password-confirm"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full h-11 rounded-xl border border-input-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
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
              {busy ? "Menyimpan…" : "Simpan password"}
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
