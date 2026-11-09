"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const AVATAR_SIZE_CLASS: Record<UserAvatarSize, string> = {
  xs: "size-5",
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-16",
};

const AVATAR_TEXT_CLASS: Record<UserAvatarSize, string> = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-xl",
};

export function getUserInitials(name?: string | null): string {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  alt?: string;
  decorative?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  alt,
  decorative = false,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const displayName = name?.trim() || "";
  const resolvedSrc = avatarUrl?.trim() ? avatarUrl.trim() : undefined;
  const resolvedAlt = decorative
    ? ""
    : alt ?? (displayName ? `Foto profil ${displayName}` : "Foto profil");

  return (
    <Avatar
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "aspect-square shrink-0 rounded-full overflow-hidden border border-border/80 bg-accent",
        AVATAR_SIZE_CLASS[size],
        className,
      )}
    >
      <AvatarImage
        src={resolvedSrc}
        alt={resolvedAlt}
        className="aspect-square size-full rounded-full object-cover"
      />
      <AvatarFallback
        className={cn(
          "aspect-square size-full rounded-full bg-accent text-accent-foreground font-semibold tracking-tight select-none",
          AVATAR_TEXT_CLASS[size],
          fallbackClassName,
        )}
      >
        {getUserInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
