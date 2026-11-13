"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserQuery } from "@/features/auth/queries/auth.queries";
import { Spinner } from "@/components/ui/spinner";
export default function HomePage() {
  const router = useRouter();
  const { isSuccess, isError } = useCurrentUserQuery();
  useEffect(() => { if (isSuccess) router.replace("/projects"); else if (isError) router.replace("/login"); }, [isSuccess, isError, router]);
  return <main className="min-h-screen grid place-items-center"><Spinner className="size-6 text-primary" /></main>;
}
