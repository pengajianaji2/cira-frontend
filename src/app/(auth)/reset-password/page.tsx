"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";

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
    <main className="min-h-screen grid place-items-center p-6 bg-neutral-50">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold">Atur password baru</h1>
        <p className="mt-2 text-sm text-neutral-500">Gunakan password minimal 8 karakter. Tautan hanya dapat digunakan sekali.</p>
        {!tokenReady ? (
          <p role="status" className="mt-5 text-sm text-neutral-500">Memeriksa tautan reset…</p>
        ) : !token ? (
          <p role="alert" className="mt-5 text-sm text-red-600">Token reset tidak ditemukan.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block space-y-1 text-sm font-medium">
              Password baru
              <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Ulangi password baru
              <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#f7941e] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Menyimpan…" : "Simpan password"}
            </button>
          </form>
        )}
        <Link href="/login" className="mt-6 inline-block text-sm text-primary hover:underline">Kembali ke login</Link>
      </section>
    </main>
  );
}
