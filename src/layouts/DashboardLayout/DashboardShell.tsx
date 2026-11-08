"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navigationConfig } from "../navigation.config";
import { useAuthStore, useLogoutMutation, useCurrentUserQuery } from "@/features/auth";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import { useProjectQuery } from "@/features/projects";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isProjectsRoute = segments[0] === "projects";
  const projectId = isProjectsRoute && segments[1] ? segments[1] : "";

  // TanStack Query caches project details, reusing data fetched on the project page
  const { data: project, isLoading } = useProjectQuery(projectId);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>
    );
  }

  if (isProjectsRoute && projectId) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Workspace</span>
        <span>/</span>
        <Link
          href="/projects"
          className="hover:text-foreground transition-colors font-medium text-muted-foreground"
        >
          Projects
        </Link>
        <span>/</span>
        <span
          className="text-foreground font-medium truncate max-w-[140px] sm:max-w-[220px] md:max-w-[340px]"
          title={project?.name}
        >
          {project?.name || (isLoading ? "..." : projectId)}
        </span>
      </div>
    );
  }

  const title =
    segments[0] === "projects"
      ? "Projects"
      : segments[0] === "directory"
      ? "Directory"
      : segments[0] === "profile"
      ? "Profile"
      : segments[0].charAt(0).toUpperCase() + segments[0].slice(1);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Workspace</span>
      <span>/</span>
      <span className="text-foreground font-medium">{title}</span>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  useCurrentUserQuery();
  const { data: permissions = [] } = useMyPermissionsQuery();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect ke login jika pengguna belum login di client
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="h-screen h-dvh w-full flex items-center justify-center bg-background">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderNavLinks = () => (
    <nav className="space-y-1 px-3 py-4">
      {navigationConfig
        .filter((item) => {
          const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
          const roleAllowed = !item.roles?.length || item.roles.some((r) => userRoles.includes(r.toLowerCase()));
          return roleAllowed && (!item.permission || permissions.includes(item.permission));
        })
        .map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
              <span>{item.title}</span>
              {item.badge && <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded-md">{item.badge}</span>}
            </Link>
          );
        })}
    </nav>
  );

  const renderUserFooter = () => (
    <div className="p-3 border-t border-border mt-auto shrink-0">
      <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name || "Anggota Tim"}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground truncate">{user?.roles?.[0] || "Anggota"}</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          title="Keluar"
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen h-dvh flex overflow-hidden bg-background">
      {/* Sidebar Desktop: Fixed height, fixed width, independent scroll for nav */}
      <aside className="hidden md:flex w-64 h-full flex-col border-r border-border bg-card shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center gap-3 px-6 border-b border-border">
          <div className="size-9 rounded-2xl overflow-hidden shrink-0 border border-border/70 shadow-xs bg-card">
            <Image
              src="/logo-cira.webp"
              alt="Cira PM"
              width={36}
              height={36}
              priority
              className="size-full object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-foreground tracking-tight text-sm block">Cira PM</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">Internal Workspace</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>

        {/* User Profile Footer */}
        {renderUserFooter()}
      </aside>

      {/* Main Content Area: Scroll strictly isolated to <main> */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-border bg-card/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="rounded-lg">
                    <HugeiconsIcon icon={Menu01Icon} className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 flex flex-col bg-card">
                  <SheetHeader className="h-16 flex flex-row items-center gap-3 px-6 border-b border-border">
                    <div className="size-8 rounded-xl overflow-hidden shrink-0 border border-border/70 shadow-xs bg-card">
                      <Image
                        src="/logo-cira.webp"
                        alt="Cira PM"
                        width={32}
                        height={32}
                        priority
                        className="size-full object-cover"
                      />
                    </div>
                    <SheetTitle className="font-bold text-foreground tracking-tight text-sm">Cira PM</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
                  {renderUserFooter()}
                </SheetContent>
              </Sheet>
            </div>

            <DashboardBreadcrumb />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile">
              <div className="size-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs hover:opacity-80 transition-opacity">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content: Only this element scrolls vertically */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 focus:outline-none">{children}</main>
      </div>
    </div>
  );
}
