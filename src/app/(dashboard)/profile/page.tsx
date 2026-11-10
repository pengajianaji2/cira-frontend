import React from "react";
import { Metadata } from "next";
import { ProfileForm, ChangePasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Profil Saya - Cira PM",
  description: "Pengaturan akun dan profil anggota tim Cira PM",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-canvas-foreground">
          Profil & Keamanan
        </h1>
        <p className="text-sm text-canvas-muted mt-1">
          Kelola informasi identitas, hak akses tim, dan kata sandi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
