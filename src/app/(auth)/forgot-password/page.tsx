"use client";

import Link from "next/link";
import { useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await authApi.forgotPassword(email); setSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Email belum dapat dikirim."); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen grid place-items-center p-6 bg-neutral-50"><section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm"><h1 className="text-xl font-bold">Lupa password?</h1><p className="mt-2 text-sm text-neutral-500">Masukkan email akun Cira PM. Jika terdaftar, kami akan mengirim tautan reset yang berlaku 30 menit.</p>{sent ? <div role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Jika email terdaftar, tautan reset password akan dikirim. Periksa kotak masuk dan folder spam.</div> : <form onSubmit={submit} className="mt-6 space-y-4"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" className="w-full rounded-xl border px-4 py-3 text-sm" />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#f7941e] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Mengirim..." : "Kirim tautan reset"}</button></form>}<Link href="/login" className="mt-6 inline-block text-sm text-primary hover:underline">Kembali ke login</Link></section></main>;
}
