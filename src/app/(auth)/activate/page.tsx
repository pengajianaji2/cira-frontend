import React, { Suspense } from "react";
import { Metadata } from "next";
import { ActivateForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Aktivasi Akun Tim - Cira PM",
  description: "Aktivasi akun tim baru dan lengkapi kontak resmi Anda di Cira PM",
};

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-neutral-50/50">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
