import React, { Suspense } from "react";
import { Metadata } from "next";
import { ActivateForm, AuthBackdrop } from "@/features/auth";

export const metadata: Metadata = {
  title: "Aktivasi Akun Tim - Cira PM",
  description: "Aktivasi akun tim baru dan lengkapi kontak resmi Anda di Cira PM",
};

export default function ActivatePage() {
  return (
    <AuthBackdrop>
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg text-center space-y-3">
            <div className="size-7 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">Memuat halaman aktivasi...</p>
          </div>
        }
      >
        <ActivateForm />
      </Suspense>
    </AuthBackdrop>
  );
}
