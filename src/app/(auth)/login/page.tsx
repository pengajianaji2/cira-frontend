import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Masuk ke Akun - Cira PM",
  description: "Masuk ke workspace manajemen proyek Cira PM",
};

export default function LoginPage() {
  return <LoginForm />;
}
