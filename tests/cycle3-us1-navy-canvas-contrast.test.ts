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
// AC-1: Kanvas Luar Biru Navy Gelap & Sidebar/Kartu Tetap Putih Solid
// ==========================================

test("AC-1: Workspace dashboard memakai kanvas biru navy gelap (--canvas) sementara sidebar dan seluruh kartu/permukaan tetap putih solid", () => {
  const globalsCss = readSrc("app/globals.css");
  const layoutSource = readSrc("app/layout.tsx");
  const globalErrorSource = readSrc("app/global-error.tsx");
  const dashboardShellSource = readSrc("layouts/DashboardLayout/DashboardShell.tsx");

  // Token kanvas biru navy gelap & teks luar kartu terdefinisi di @theme inline & :root tanpa dark mode
  for (const mappedToken of [
    "--color-canvas: var(--canvas);",
    "--color-canvas-foreground: var(--canvas-foreground);",
    "--color-canvas-muted: var(--canvas-muted);",
    "--color-canvas-dot: var(--canvas-dot);",
  ]) {
    assert.ok(
      globalsCss.includes(mappedToken),
      `globals.css wajib memetakan ${mappedToken}`,
    );
  }

  assert.match(globalsCss, /:root\s*\{[\s\S]*?--canvas:\s*oklch\(/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--canvas-foreground:\s*oklch\(/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--canvas-muted:\s*oklch\(/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--canvas-dot:\s*oklch\(/);

  // Permukaan sidebar, card, dan inner background tetap putih/terang
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--card:\s*oklch\(1 0 0\);/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?--sidebar:\s*oklch\(1 0 0\);/);
  assert.match(globalsCss, /:root\s*\{[\s\S]*?color-scheme:\s*light;/);
  assert.match(globalsCss, /body\s*\{[\s\S]*?@apply\s+bg-canvas\s+text-foreground;/);

  // Root layout & global error memakai bg-canvas dan kartu putih
  assert.match(layoutSource, /<body\s+className=\{cn\([^}]*"[^"]*\bbg-canvas\b[^"]*\btext-foreground\b/);
  assert.match(globalErrorSource, /<body\s+className="[^"]*\bbg-canvas\b[^"]*">/);
  assert.match(globalErrorSource, /\bbg-card\b/);

  // Seluruh state & kerangka luar DashboardShell memakai bg-canvas; sidebar, drawer, error card, & mobile button tetap putih
  assert.doesNotMatch(
    dashboardShellSource,
    /\bbg-background\b/,
    "DashboardShell tidak boleh memakai bg-background pada wrapper luar",
  );
  const bgCanvasMatches = dashboardShellSource.match(/\bbg-canvas\b/g) ?? [];
  assert.equal(
    bgCanvasMatches.length,
    4,
    "DashboardShell harus memakai bg-canvas di state loading, 401, error, dan layout utama",
  );
  assert.match(dashboardShellSource, /<aside[\s\S]*?\bbg-sidebar\b[\s\S]*?\btext-sidebar-foreground\b/);
  assert.match(dashboardShellSource, /<SheetContent[\s\S]*?\bbg-sidebar\b[\s\S]*?\btext-sidebar-foreground\b/);
  assert.match(dashboardShellSource, /aria-label="Buka menu navigasi"[\s\S]*?\bbg-card\b/);

  // Permukaan yang berada di atas bg-canvas wajib solid (bebas dari latar semi-transparan tipis)
  const emptyStateSource = readSrc("shared/components/state/EmptyState.tsx");
  assert.doesNotMatch(emptyStateSource, /\bbg-card\/\d+\b/);
  assert.match(emptyStateSource, /variant === "dashed"[\s\S]*?\bbg-card\b/);

  const localizedErrorSource = readSrc("shared/components/state/LocalizedComponentError.tsx");
  assert.doesNotMatch(localizedErrorSource, /\bbg-destructive\/\d+\b/);
  assert.match(localizedErrorSource, /\bbg-card\b/);

  const skeletonSource = readSrc("shared/components/state/ComponentSkeleton.tsx");
  assert.doesNotMatch(skeletonSource, /\bbg-card\/\d+\b/);

  const approvalBannerSource = readSrc("features/projects/components/StatusApprovalBanner.tsx");
  assert.match(approvalBannerSource, /\bbg-status-warning-surface\b[\s\S]*?\bborder-status-warning-border\b/);

  const overdueStripSource = readSrc("features/operations/components/OverdueAlertStrip.tsx");
  assert.doesNotMatch(overdueStripSource, /\bbg-destructive\/\d+\b/);
  assert.match(overdueStripSource, /\bbg-status-danger-surface\b[\s\S]*?\bborder-status-danger-border\b/);

  const calendarGridSource = readSrc("features/operations/components/CalendarMonthGrid.tsx");
  assert.doesNotMatch(calendarGridSource, /bg-primary\/4\b/);
  assert.match(calendarGridSource, /role="status"[\s\S]*?\bbg-card\b/);

  const activityTimelineSource = readSrc("features/activity/components/ActivityTimeline.tsx");
  assert.doesNotMatch(activityTimelineSource, /\bbg-(?:destructive|blue-500|purple-500)\/\d+\b/);
  assert.match(activityTimelineSource, /\bbefore:bg-canvas-muted\/40\b/);

  const sprintsSource = readSrc("features/sprints/components/SprintsTabContent.tsx");
  assert.doesNotMatch(sprintsSource, /\bbg-emerald-500\/5\b/);
  assert.match(sprintsSource, /activeSprint \?[\s\S]*?\bbg-card\b/);

  const financeTabSource = readSrc("features/finance/components/FinanceTabContent.tsx");
  assert.match(financeTabSource, /<div className="[^"]*\bbg-card\b[^"]*">\s*<TabsList/);

  const assetDropzoneSource = readSrc("features/assets/components/AssetDropzone.tsx");
  assert.doesNotMatch(assetDropzoneSource, /\bbg-card\/60\b/);
  assert.match(assetDropzoneSource, /\bbg-card\b/);

  const projectHeaderSource = readSrc("features/projects/components/ProjectDetailHeader.tsx");
  assert.match(projectHeaderSource, /<nav[\s\S]*?aria-label="Tab Proyek"[\s\S]*?\bbg-card\b/);

  const projectFilterTabsSource = readSrc("features/projects/components/ProjectFilterTabs.tsx");
  assert.doesNotMatch(projectFilterTabsSource, /\bbg-muted\/50\b/);
  assert.match(projectFilterTabsSource, /\bbg-primary\b[\s\S]*?\bbg-card\b/);
});

// ==========================================
// AC-2: Latar Biru Navy Gelap + DotPattern pada Keempat Halaman Auth
// ==========================================

test("AC-2: Keempat halaman autentikasi (/login, /forgot-password, /reset-password, /activate) memakai AuthBackdrop biru navy gelap dengan DotPattern di belakang kartu putih", () => {
  const authBackdropSource = readSrc("features/auth/components/AuthBackdrop.tsx");
  const loginFormSource = readSrc("features/auth/components/LoginForm.tsx");
  const forgotPageSource = readSrc("app/(auth)/forgot-password/page.tsx");
  const resetPageSource = readSrc("app/(auth)/reset-password/page.tsx");
  const activatePageSource = readSrc("app/(auth)/activate/page.tsx");
  const activateFormSource = readSrc("features/auth/components/ActivateForm.tsx");

  assert.doesNotMatch(authBackdropSource, /\bbg-background\b/);
  assert.match(authBackdropSource, /data-slot="auth-backdrop"[\s\S]*?\bbg-canvas\b/);
  assert.match(authBackdropSource, /<DotPattern[\s\S]*?glow=\{false\}[\s\S]*?className="[^"]*\btext-canvas-dot\b[^"]*"/);

  // Keempat halaman auth tetap memakai AuthBackdrop dan kartu putih solid (bg-card)
  assert.match(loginFormSource, /<AuthBackdrop[\s\S]*?\bbg-card\b/);
  assert.match(forgotPageSource, /<AuthBackdrop>[\s\S]*?<section className="[^"]*\bbg-card\b/);
  assert.match(resetPageSource, /<AuthBackdrop>[\s\S]*?<section className="[^"]*\bbg-card\b/);
  assert.match(activatePageSource, /<AuthBackdrop>[\s\S]*?\bbg-card\b/);
  assert.match(activateFormSource, /\bbg-card\b/);
});

// ==========================================
// AC-3: Keterbacaan Teks & Kontrol di Luar Kartu pada Kanvas Navy Gelap
// ==========================================

test("AC-3: Breadcrumb, teks muat, paginasi, catatan, dan heading di luar kartu memakai token teks terang di atas biru navy gelap", () => {
  const projectDetailHeader = readSrc("features/projects/components/ProjectDetailHeader.tsx");
  assert.match(projectDetailHeader, /\btext-canvas-muted\b[\s\S]*?Daftar Proyek/);
  assert.match(projectDetailHeader, /\bhover:text-canvas-foreground\b/);
  assert.match(projectDetailHeader, /\btext-canvas-foreground\b[\s\S]*?\{project\.name\}/);

  const projectDetailPage = readSrc("app/(dashboard)/projects/[id]/page.tsx");
  assert.match(projectDetailPage, /\btext-canvas-muted\b[^>]*>Memuat data proyek\.\.\.</);
  assert.match(projectDetailPage, /\btext-canvas-muted\b[^>]*>Menyiapkan halaman\.\.\.</);

  // Daftar Proyek (/projects) dan Kelola Akses (/access-policies) kini membungkus pencarian,
  // paginasi, status/notice, catatan multi-role, dan tombol muat ulang di dalam kartu konten putih (US-3 AC-6 & AC-8).
  const projectsPage = readSrc("app/(dashboard)/projects/page.tsx");
  assert.match(projectsPage, /<section[\s\S]*?\bbg-card\b[\s\S]*?id="project-search"[\s\S]*?aria-label="Paginasi proyek"/);
  assert.match(projectsPage, /aria-label="Paginasi proyek"[\s\S]*?\btext-muted-foreground\b/);
  assert.match(projectsPage, /Sebelumnya[\s\S]*?Selanjutnya/);
  assert.doesNotMatch(projectsPage, /\btext-canvas-muted\b/);

  // Elemen teks luar kartu yang tetap berada langsung di atas --canvas wajib memakai token teks terang.
  const accessPoliciesPage = readSrc("app/(dashboard)/access-policies/page.tsx");
  assert.doesNotMatch(accessPoliciesPage, /\btext-canvas-muted\b/);
  assert.match(accessPoliciesPage, /\bbg-card\b[\s\S]*?Muat ulang policy/);

  const taskBoard = readSrc("features/tasks/components/TaskChecklistBoard.tsx");
  assert.match(taskBoard, /text-canvas-muted[^>]*>Memuat checklist task\.\.\.</);

  const sprintsContent = readSrc("features/sprints/components/SprintsTabContent.tsx");
  assert.match(sprintsContent, /id="active-sprint-heading" className="[^"]*\btext-canvas-foreground\b/);
  assert.match(sprintsContent, /id="planning-sprint-heading" className="[^"]*\btext-canvas-foreground\b/);
  assert.match(sprintsContent, /id="completed-sprint-heading" className="[^"]*\btext-canvas-foreground\b/);
  assert.match(sprintsContent, /text-canvas-muted[^>]*>\s*Maksimal 1 sprint berjalan bersamaan/);

  const paymentMilestoneList = readSrc("features/finance/components/PaymentMilestoneList.tsx");
  assert.match(paymentMilestoneList, /\btext-canvas-foreground\b[^>]*>\s*Daftar Termin Pembayaran/);
  assert.match(paymentMilestoneList, /\btext-canvas-muted\b[^>]*>\s*Diverifikasi oleh Owner \/ Operasional/);

  const assetGallery = readSrc("features/assets/components/AssetGallery.tsx");
  assert.match(assetGallery, /\btext-canvas-foreground\b[^>]*>\s*Galeri Aset Proyek/);
  assert.match(assetGallery, /\btext-canvas-muted\b[^>]*>Memuat galeri aset\.\.\.</);
});
