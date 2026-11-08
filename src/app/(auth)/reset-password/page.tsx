"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token") || "");
  useEffect(() => { if (token) window.history.replaceState(null, "", window.location.pathname); }, [token]);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("Konfirmasi password tidak cocok."); return; }
    setBusy(true);
    try { await authApi.resetPassword(token, password); router.replace("/login?passwordReset=1"); }
    catch (err) { setError(err instanceof Error ? err.message : "Tautan reset tidak valid."); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen grid place-items-center p-6 bg-neutral-50"><section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm"><h1 className="text-xl font-bold">Atur password baru</h1><p className="mt-2 text-sm text-neutral-500">Gunakan password minimal 8 karakter. Tautan hanya dapat digunakan sekali.</p>{!token ? <p role="alert" className="mt-5 text-sm text-red-600">Token reset tidak ditemukan.</p> : <form onSubmit={submit} className="mt-6 space-y-4"><input type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password baru" className="w-full rounded-xl border px-4 py-3 text-sm" /><input type="password" required minLength={8} maxLength={72} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ulangi password baru" className="w-full rounded-xl border px-4 py-3 text-sm" />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#f7941e] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Menyimpan..." : "Simpan password"}</button></form>}<Link href="/login" className="mt-6 inline-block text-sm text-primary hover:underline">Kembali ke login</Link></section></main>;
}

export default function ResetPasswordPage() { return <Suspense><ResetPasswordForm /></Suspense>; }
