"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { safeNextPath, useCurrentUserQuery } from "@/features/auth/queries/auth.queries";
import { Spinner } from "@/components/ui/spinner";
export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSuccess, isError } = useCurrentUserQuery();
  const nextPath = safeNextPath(searchParams.get("next")) || "/projects";
  useEffect(() => { if (isSuccess) router.replace(nextPath); }, [isSuccess, nextPath, router]);
  if (isSuccess || !isError) return <main className="min-h-screen grid place-items-center"><Spinner className="size-6 text-primary" /></main>;
  return <LoginForm />;
}
