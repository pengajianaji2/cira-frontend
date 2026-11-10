import React from "react";
import { Metadata } from "next";
import { UserIcon } from "@hugeicons/core-free-icons";
import { ProfileForm, ChangePasswordForm } from "@/features/auth";
import { PageHeaderCard } from "@/shared/components";

export const metadata: Metadata = {
  title: "Profil Saya - Cira PM",
  description: "Pengaturan akun dan profil anggota tim Cira PM",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeaderCard
        icon={UserIcon}
        title="Profil & Keamanan"
        description="Kelola informasi identitas, hak akses tim, dan kata sandi akun Anda."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
