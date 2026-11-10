"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LocalizedComponentErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  compact?: boolean;
}

export function LocalizedComponentError({
  title = "Gagal Memuat Komponen",
  message = "Terjadi kendala saat memuat data pada bagian ini. Silakan coba lagi.",
  onRetry,
  isRetrying = false,
  className,
  compact = false,
}: LocalizedComponentErrorProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-status-danger-border bg-card shadow-xs text-center flex flex-col items-center justify-center p-6 md:p-8",
        compact && "p-4 rounded-2xl",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-status-danger-surface text-status-danger-text flex items-center justify-center mb-3",
          compact ? "size-9" : "size-12"
        )}
      >
        <HugeiconsIcon icon={AlertCircleIcon} className={compact ? "size-4" : "size-6"} />
      </div>

      <h4
        className={cn(
          "font-bold text-foreground",
          compact ? "text-xs" : "text-sm md:text-base"
        )}
      >
        {title}
      </h4>

      {message && (
        <p
          className={cn(
            "text-muted-foreground mt-1 max-w-md",
            compact ? "text-[11px]" : "text-xs"
          )}
        >
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size={compact ? "xs" : "sm"}
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            "mt-4 rounded-full border-status-danger-border hover:bg-status-danger-surface hover:text-status-danger-text text-foreground transition-all",
            compact && "mt-2.5 text-xs"
          )}
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            className={cn("size-3.5 mr-1.5", isRetrying && "animate-spin")}
          />
          {isRetrying ? "Mencoba ulang..." : "Coba Lagi"}
        </Button>
      )}
    </div>
  );
}
