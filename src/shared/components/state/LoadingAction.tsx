"use client";

import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface LoadingActionProps {
  isLoading: boolean;
  message?: string;
  overlay?: boolean;
  children?: React.ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg";
}

export function LoadingAction({
  isLoading,
  message = "Sedang memproses...",
  overlay = false,
  children,
  className,
  spinnerSize = "md",
}: LoadingActionProps) {
  const spinnerClasses = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-7",
  }[spinnerSize];

  if (!isLoading) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className="relative">
        {children}
        <div
          className={cn(
            "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 rounded-3xl bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in-50",
            className
          )}
        >
          <Spinner className={cn("text-primary", spinnerClasses)} />
          {message && (
            <p className="text-xs font-medium text-foreground tracking-tight">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-muted/40 text-muted-foreground",
        className
      )}
    >
      <Spinner className={cn("text-primary", spinnerClasses)} />
      {message && <span className="text-xs font-medium">{message}</span>}
    </div>
  );
}
