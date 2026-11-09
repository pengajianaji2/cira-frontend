"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/shared/components";
import { navigationConfig } from "../navigation.config";
import { useAuthStore, useLogoutMutation, useCurrentUserQuery } from "@/features/auth";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import { cn } from "@/lib/utils";
import {
  filterNavigationItems,
  getDashboardUserSummary,
  isNavigationHrefActive,
} from "./dashboard-shell.helpers";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Workspace shell for authenticated dashboard pages without a topbar header.
 * Renders a floating rounded sticky sidebar on desktop and a bottom-right floating menu drawer on mobile.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const currentUserQuery = useCurrentUserQuery();
  const { data: permissions = [] } = useMyPermissionsQuery();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (
      currentUserQuery.error &&
      (currentUserQuery.error as Error & { status?: number }).status === 401
    ) {
      router.replace("/login");
    }
  }, [currentUserQuery.error, router]);

  if (currentUserQuery.isPending || (!currentUserQuery.data && !currentUserQuery.isError)) {
    return (
      <div className="min-h-screen min-h-dvh w-full flex items-center justify-center bg-background">
        <Spinner className="size-6 text-secondary" aria-label="Memuat workspace" />
      </div>
    );
  }

  if (
    currentUserQuery.isError &&
    (currentUserQuery.error as Error & { status?: number }).status === 401
  ) {
    return <div className="min-h-screen min-h-dvh w-full bg-background" aria-busy="true" />;
  }

  if (
    currentUserQuery.isError &&
    (currentUserQuery.error as Error & { status?: number }).status !== 401
  ) {
    return (
      <div className="min-h-screen min-h-dvh grid place-items-center bg-background p-6 text-center">
        <div
          role="alert"
          className="space-y-4 max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xs"
        >
          <p className="text-sm text-foreground">
            Sesi belum dapat diverifikasi karena koneksi bermasalah.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void currentUserQuery.refetch()}
            className="min-h-11 px-5"
          >
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  const visibleNavItems = filterNavigationItems(navigationConfig, user?.roles, permissions);
  const userSummary = getDashboardUserSummary(user);
  const isProfileActive = isNavigationHrefActive(pathname, "/profile");

  const renderNavLinks = (scope: "desktop" | "mobile") => (
    <nav
      aria-label={scope === "mobile" ? "Menu workspace seluler" : "Menu workspace"}
      className="px-3 py-4"
    >
      <ul className="space-y-2">
        {visibleNavItems.map((item) => {
          const isActive = isNavigationHrefActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 min-h-11 py-2.5 rounded-xl text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-[11px] bg-muted text-foreground px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const renderUserFooter = () => (
    <div className="p-3 border-t border-sidebar-border mt-auto shrink-0 flex flex-col gap-2">
      <Link
        href="/profile"
        aria-current={isProfileActive ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2.5 min-w-0 min-h-11 p-2.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          isProfileActive
            ? "bg-accent border-accent-foreground/25"
            : "bg-muted/40 border-border/70 hover:bg-muted hover:border-border",
        )}
      >
        <UserAvatar
          name={userSummary.displayName}
          avatarUrl={userSummary.avatarUrl}
          size="md"
          decorative
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-semibold text-foreground truncate"
            title={userSummary.displayName}
          >
            {userSummary.displayName}
          </p>
          <p className="text-[11px] text-muted-foreground truncate capitalize">
            {userSummary.primaryRole}
          </p>
        </div>
        <span className="sr-only">, Buka Profil Saya</span>
      </Link>

      <Button
        type="button"
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="w-full min-h-11 justify-center gap-2 rounded-xl border-border bg-card text-foreground font-medium hover:bg-status-danger-surface hover:text-status-danger-text hover:border-status-danger-border transition-colors"
      >
        {logoutMutation.isPending ? (
          <>
            <Spinner className="size-4 shrink-0" aria-hidden="true" />
            <span>Keluar...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Logout01Icon} className="size-4 shrink-0" aria-hidden="true" />
            <span>Keluar</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen min-h-dvh bg-background overflow-x-clip md:flex md:items-start md:gap-4 md:p-4">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-foreground focus:border focus:border-border focus:shadow-md"
      >
        Lewati ke konten utama
      </a>

      {/* Sidebar Desktop: Membulat, melayang (flying), dan tetap diam (sticky) */}
      <aside
        aria-label="Sidebar workspace"
        className="hidden md:flex md:sticky md:top-4 w-64 h-[calc(100vh-2rem)] supports-[height:100dvh]:h-[calc(100dvh-2rem)] flex-col rounded-3xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm shrink-0 select-none overflow-hidden"
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="size-9 rounded-2xl overflow-hidden shrink-0 border border-border/70 shadow-xs bg-card">
            <Image
              src="/logo-cira.webp"
              alt=""
              width={36}
              height={36}
              priority
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-foreground tracking-tight text-sm block truncate">
              Cira PM
            </span>
            <span className="text-[11px] text-muted-foreground block -mt-0.5 truncate">
              Internal Workspace
            </span>
          </div>
        </div>

        {/* Navigation Items: Scroll mandiri jika tinggi item melebihi tinggi sidebar */}
        <div className="flex-1 min-h-0 overflow-y-auto">{renderNavLinks("desktop")}</div>

        {/* User Profile Footer */}
        {renderUserFooter()}
      </aside>

      {/* Main Content Area: Tanpa header atas, konten langsung mengisi ruang atas */}
      <main
        id="workspace-main"
        tabIndex={-1}
        className="flex-1 min-w-0 p-4 pt-5 pb-24 md:pt-2 md:pr-4 md:pb-8 md:pl-2 focus:outline-none"
      >
        {children}
      </main>

      {/* Mobile Floating Navigation Trigger & Drawer (< md) */}
      <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              aria-label="Buka menu navigasi"
              className="size-12 min-h-11 min-w-11 rounded-full shadow-lg ring-1 ring-border/60"
            >
              <HugeiconsIcon icon={Menu01Icon} className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 max-w-[85vw] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border rounded-r-3xl overflow-hidden"
          >
            <SheetHeader className="h-16 shrink-0 flex flex-row items-center gap-3 px-5 border-b border-sidebar-border text-left">
              <div className="size-9 rounded-2xl overflow-hidden shrink-0 border border-border/70 shadow-xs bg-card">
                <Image
                  src="/logo-cira.webp"
                  alt=""
                  width={36}
                  height={36}
                  priority
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 pr-8">
                <SheetTitle className="font-bold text-foreground tracking-tight text-sm truncate">
                  Cira PM
                </SheetTitle>
                <SheetDescription className="text-[11px] text-muted-foreground -mt-0.5 truncate">
                  Internal Workspace
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex-1 min-h-0 overflow-y-auto">{renderNavLinks("mobile")}</div>
            {renderUserFooter()}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
