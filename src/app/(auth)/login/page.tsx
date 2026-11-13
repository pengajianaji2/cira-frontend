import React, { Suspense } from "react";
import { Metadata } from "next";
import { Spinner } from "@/components/ui/spinner";
import LoginPageClient from "./LoginPageClient";
export const metadata: Metadata = { title: "Masuk ke Akun - Cira PM", description: "Masuk ke workspace manajemen proyek Cira PM" };
export default function LoginPage() { return <Suspense fallback={<main className="min-h-screen grid place-items-center"><Spinner className="size-6 text-primary" /></main>}><LoginPageClient /></Suspense>; }
