"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
  variant?: "card" | "dashed" | "minimal";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
  variant = "dashed",
}: EmptyStateProps) {
  const defaultIcon = (
    <div className={cn(
      "rounded-2xl bg-muted/70 text-muted-foreground flex items-center justify-center",
      compact ? "size-10" : "size-14"
    )}>
      <HugeiconsIcon icon={Folder01Icon} className={compact ? "size-5" : "size-7"} />
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center transition-all",
        variant === "dashed" && "border-2 border-dashed border-border rounded-3xl bg-card/60",
        variant === "card" && "border border-border rounded-3xl bg-card shadow-xs",
        variant === "minimal" && "bg-transparent",
        compact ? "p-6" : "p-10 md:p-14",
        className
      )}
    >
      <div className="mb-3.5 flex items-center justify-center">
        {icon || defaultIcon}
      </div>

      <h3
        className={cn(
          "font-bold text-foreground tracking-tight",
          compact ? "text-sm" : "text-base md:text-lg"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm mt-1 leading-relaxed",
            compact ? "text-[11px]" : "text-xs md:text-sm"
          )}
        >
          {description}
        </p>
      )}

      {action && <div className={cn("mt-5", compact && "mt-3")}>{action}</div>}
    </div>
  );
}
