import React from "react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

interface AuthBackdropProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Kanvas latar belakang tema terang terpusat dengan pola titik lembut (`DotPattern`)
 * untuk seluruh rute autentikasi (`/login`, `/forgot-password`, `/reset-password`, `/activate`).
 */
export function AuthBackdrop({ children, className }: AuthBackdropProps) {
  return (
    <main
      data-slot="auth-backdrop"
      className={cn(
        "relative min-h-screen min-h-dvh w-full flex items-center justify-center p-4 sm:p-6 bg-canvas overflow-x-clip overflow-y-auto",
        className
      )}
    >
      <DotPattern
        width={20}
        height={20}
        cr={1.1}
        glow={false}
        className="text-canvas-dot"
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
