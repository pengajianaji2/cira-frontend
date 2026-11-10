import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const srcRoot = path.join(frontendRoot, "src");

function readSrc(relPath: string): string {
  return readFileSync(path.join(srcRoot, relPath), "utf8");
}

// ==========================================
// AC-1: Pengembalian Kanvas Terang (--background) & Palet Komponen f8e5d05 (Layout Kartu Tetap)
// ==========================================

test("AC-1: Workspace dashboard kembali memakai kanvas terang (--background) & palet komponen f8e5d05 sementara layout kartu seragam dipertahankan", () => {
  const globalsCss = readSrc("app/globals.css");
  const layoutSource = readSrc("app/layout.tsx");
  const globalErrorSource = readSrc("app/global-error.tsx");
  const dashboardShellSource = readSrc("layouts/DashboardLayout/DashboardShell.tsx");

  // Token --canvas* Siklus 3 telah dihapus dan body kembali ke --background tanpa dark mode
  for (const removedToken of [
    "--color-canvas:",
    "--color-canvas-foreground:",
    "--color-canvas-muted:",
    "--color-canvas-dot:",
    "--canvas:",
    "--canvas-foreground:",
    "--canvas-muted:",
    "--canvas-dot:",
  ]) {
    assert.ok(
      !globalsCss.includes(removedToken),
      `globals.css tidak boleh lagi menyimpan ${removedToken}`,
    );
  }

  assert.match(globalsCss, /:root\s*\{[\s\S]*?--background:\s*oklch\(/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--card:\s*oklch\(1 0 0\);/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--sidebar:\s*oklch\(1 0 0\);/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?color-scheme:\s*light;/);
  assert.match(globalsCss, /body\s*\{[\s\S]*?@apply\s+bg-background\s+text-foreground;/);

  // Root layout, global error, & DashboardShell memakai bg-background
  assert.match(layoutSource, /<body\s+className=\{cn\([^}]*"[^"]*\bbg-background\b[^"]*\btext-foreground\b/);
  assert.match(globalErrorSource, /<body\s+className="[^"]*\bbg-background\b[^"]*">/);
  assert.match(globalErrorSource, /\bbg-card\b[\s\S]*?\bbg-black\b[\s\S]*?\btext-white\b/);

  assert.doesNotMatch(
    dashboardShellSource,
    /\b(?:bg-canvas|text-canvas-foreground|text-canvas-muted)\b/,
    "DashboardShell tidak boleh lagi memakai utilitas canvas Siklus 3",
  );
  const bgBackgroundMatches = dashboardShellSource.match(/\bbg-background\b/g) ?? [];
  assert.equal(
    bgBackgroundMatches.length,
    4,
    "DashboardShell harus memakai bg-background di state loading, 401, error, dan layout utama",
  );
  assert.match(dashboardShellSource, /<Spinner className="size-6 text-secondary"/);
  assert.match(dashboardShellSource, /<aside[\s\S]*?\bbg-sidebar\b[\s\S]*?\btext-sidebar-foreground\b/);
  assert.match(dashboardShellSource, /<SheetContent[\s\S]*?\bbg-sidebar\b[\s\S]*?\btext-sidebar-foreground\b/);
  assert.match(dashboardShellSource, /variant="secondary"[\s\S]*?aria-label="Buka menu navigasi"[\s\S]*?\bring-border\/60\b/);

  // Palet komponen kembali ke f8e5d05 sementara pembungkus kartu layout tetap utuh
  const emptyStateSource = readSrc("shared/components/state/EmptyState.tsx");
  assert.match(emptyStateSource, /variant === "dashed"[\s\S]*?\bbg-card\/60\b/);

  const localizedErrorSource = readSrc("shared/components/state/LocalizedComponentError.tsx");
  assert.match(localizedErrorSource, /\bborder-destructive\/20 bg-destructive\/5\b/);
  assert.match(localizedErrorSource, /\bbg-destructive\/10 text-destructive\b/);

  const skeletonSource = readSrc("shared/components/state/ComponentSkeleton.tsx");
  assert.match(skeletonSource, /\bbg-card\/60\b/);

  const approvalBannerSource = readSrc("features/projects/components/StatusApprovalBanner.tsx");
  assert.match(approvalBannerSource, /\bbg-amber-500\/10 border border-amber-500\/30\b/);

  const overdueStripSource = readSrc("features/operations/components/OverdueAlertStrip.tsx");
  assert.match(overdueStripSource, /\bborder-destructive\/35 bg-destructive\/8\b/);
  assert.match(overdueStripSource, /\bbg-destructive\/15 text-destructive\b/);

  const calendarGridSource = readSrc("features/operations/components/CalendarMonthGrid.tsx");
  assert.match(calendarGridSource, /role="status"[\s\S]*?\bbg-muted\/40\b/);
  assert.match(calendarGridSource, /isToday \? "border-primary\/45 bg-primary\/4" : "border-border bg-card"/);

  const activityTimelineSource = readSrc("features/activity/components/ActivityTimeline.tsx");
  assert.match(activityTimelineSource, /\bbg-blue-500\/10 text-blue-600 border-blue-500\/20\b/);
  assert.match(activityTimelineSource, /\bbg-purple-500\/10 text-purple-600 border-purple-500\/20\b/);
  assert.match(activityTimelineSource, /bg-destructive\/10 border border-destructive\/20 rounded-2xl p-8 text-center text-destructive/);
  assert.match(activityTimelineSource, /\bbefore:bg-border\/80\b/);

  const sprintsSource = readSrc("features/sprints/components/SprintsTabContent.tsx");
  assert.match(sprintsSource, /activeSprint \?[\s\S]*?\bbg-emerald-500\/5 border-2 border-emerald-500\/30\b/);

  const financeTabSource = readSrc("features/finance/components/FinanceTabContent.tsx");
  assert.match(financeTabSource, /<div className="[^"]*\bbg-card\b[^"]*">\s*<TabsList className="bg-muted\/60/);

  const assetDropzoneSource = readSrc("features/assets/components/AssetDropzone.tsx");
  assert.match(assetDropzoneSource, /\bbg-primary\/10\b[\s\S]*?\bbg-card\/60 hover:bg-card\b/);

  const projectHeaderSource = readSrc("features/projects/components/ProjectDetailHeader.tsx");
  assert.match(projectHeaderSource, /<nav[\s\S]*?aria-label="Tab Proyek"[\s\S]*?\bbg-card\b/);

  const projectFilterTabsSource = readSrc("features/projects/components/ProjectFilterTabs.tsx");
  assert.match(projectFilterTabsSource, /\bbg-foreground text-background\b[\s\S]*?\bbg-muted\/50 text-muted-foreground\b/);
});

// ==========================================
// AC-2: Latar Terang (--background) + DotPattern pada Keempat Halaman Auth
// ==========================================

test("AC-2: Keempat halaman autentikasi (/login, /forgot-password, /reset-password, /activate) kembali memakai AuthBackdrop terang dengan DotPattern", () => {
  const authBackdropSource = readSrc("features/auth/components/AuthBackdrop.tsx");
  const loginFormSource = readSrc("features/auth/components/LoginForm.tsx");
  const forgotPageSource = readSrc("app/(auth)/forgot-password/page.tsx");
  const resetPageSource = readSrc("app/(auth)/reset-password/page.tsx");
  const activatePageSource = readSrc("app/(auth)/activate/page.tsx");
  const activateFormSource = readSrc("features/auth/components/ActivateForm.tsx");

  assert.doesNotMatch(authBackdropSource, /\b(?:bg-canvas|text-canvas-dot)\b/);
  assert.match(authBackdropSource, /data-slot="auth-backdrop"[\s\S]*?\bbg-background\b/);
  assert.match(authBackdropSource, /<DotPattern[\s\S]*?glow=\{false\}[\s\S]*?className="text-foreground\/15"/);

  // Keempat halaman auth tetap memakai AuthBackdrop dan kartu putih solid (bg-card)
  assert.match(loginFormSource, /<AuthBackdrop[\s\S]*?\bbg-card\b/);
  assert.match(forgotPageSource, /<AuthBackdrop>[\s\S]*?<section className="[^"]*\bbg-card\b/);
  assert.match(resetPageSource, /<AuthBackdrop>[\s\S]*?<section className="[^"]*\bbg-card\b/);
  assert.match(activatePageSource, /<AuthBackdrop>[\s\S]*?\bbg-card\b/);
  assert.match(activateFormSource, /\bbg-card\b/);
});

// ==========================================
// AC-3: Teks Luar Kartu Kembali Menggunakan Token Teks Tema Terang (--foreground / --muted-foreground)
// ==========================================

test("AC-3: Breadcrumb, teks muat, paginasi, catatan, dan heading kembali memakai token teks terang standar sementara pembungkus kartu dipertahankan", () => {
  const projectDetailHeader = readSrc("features/projects/components/ProjectDetailHeader.tsx");
  assert.doesNotMatch(projectDetailHeader, /\btext-canvas-(?:muted|foreground)\b/);
  assert.match(projectDetailHeader, /\btext-muted-foreground\b[\s\S]*?Daftar Proyek/);
  assert.match(projectDetailHeader, /\bhover:text-foreground\b/);
  assert.match(projectDetailHeader, /\btext-foreground\b[\s\S]*?\{project\.name\}/);

  const projectDetailPage = readSrc("app/(dashboard)/projects/[id]/page.tsx");
  assert.match(projectDetailPage, /\btext-muted-foreground\b[^>]*>Memuat data proyek\.\.\.</);
  assert.match(projectDetailPage, /\btext-muted-foreground\b[^>]*>Menyiapkan halaman\.\.\.</);

  const projectsPage = readSrc("app/(dashboard)/projects/page.tsx");
  assert.match(projectsPage, /<section[\s\S]*?\bbg-card\b[\s\S]*?id="project-search"[\s\S]*?aria-label="Paginasi proyek"/);
  assert.match(projectsPage, /aria-label="Paginasi proyek"[\s\S]*?\btext-muted-foreground\b/);
  assert.match(projectsPage, /Sebelumnya[\s\S]*?Selanjutnya/);

  const accessPoliciesPage = readSrc("app/(dashboard)/access-policies/page.tsx");
  assert.doesNotMatch(accessPoliciesPage, /\btext-canvas-(?:muted|foreground)\b/);
  assert.match(accessPoliciesPage, /\bbg-card\b[\s\S]*?Muat ulang policy/);

  const taskBoard = readSrc("features/tasks/components/TaskChecklistBoard.tsx");
  assert.match(taskBoard, /text-muted-foreground[^>]*>Memuat checklist task\.\.\.</);
  assert.match(taskBoard, /border-destructive\/30[\s\S]*?text-destructive/);

  const sprintsContent = readSrc("features/sprints/components/SprintsTabContent.tsx");
  assert.match(sprintsContent, /id="active-sprint-heading" className="[^"]*\btext-foreground\b/);
  assert.match(sprintsContent, /id="planning-sprint-heading" className="[^"]*\btext-foreground\b/);
  assert.match(sprintsContent, /id="completed-sprint-heading" className="[^"]*\btext-foreground\b/);
  assert.match(sprintsContent, /text-muted-foreground[^>]*>\s*Maksimal 1 sprint berjalan bersamaan/);

  const paymentMilestoneList = readSrc("features/finance/components/PaymentMilestoneList.tsx");
  assert.match(paymentMilestoneList, /\btext-foreground\b[^>]*>\s*Daftar Termin Pembayaran/);
  assert.match(paymentMilestoneList, /\btext-muted-foreground\b[^>]*>\s*Diverifikasi oleh Owner \/ Operasional/);

  const assetGallery = readSrc("features/assets/components/AssetGallery.tsx");
  assert.match(assetGallery, /\btext-foreground\b[^>]*>\s*Galeri Aset Proyek/);
  assert.match(assetGallery, /\btext-muted-foreground\b[^>]*>Memuat galeri aset\.\.\.</);
});
