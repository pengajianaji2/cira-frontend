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

function extractPageHeaderBlock(source: string): string {
  const match = source.match(/<PageHeaderCard\b[\s\S]*?\n\s*\/>/);
  assert.ok(match, "Komponen <PageHeaderCard ... /> wajib dirender");
  return match[0];
}

// ==========================================
// AC-4: Kartu Header Seragam (PageHeaderCard) di Kelima Menu Utama Dashboard
// ==========================================

test("AC-4: PageHeaderCard shared terisolasi dari features, memakai kartu putih berkontras aman, dan diterapkan seragam di 5 menu utama", () => {
  const sharedIndex = readSrc("shared/components/index.ts");
  const pageHeaderSource = readSrc("shared/components/PageHeaderCard.tsx");
  const skeletonSource = readSrc("shared/components/state/ComponentSkeleton.tsx");

  // Barrel shared & skeleton loading seragam
  assert.match(sharedIndex, /export\s+\*\s+from\s+"\.\/PageHeaderCard"/);
  assert.match(sharedIndex, /export\s+\*\s+from\s+"\.\/state\/ComponentSkeleton"/);
  assert.match(skeletonSource, /export function PageHeaderSkeleton\(/);
  assert.match(skeletonSource, /data-slot="page-header-skeleton"[\s\S]*?\bbg-card\b[\s\S]*?\brounded-3xl\b/);

  // Shared isolation: tidak boleh mengimpor modul dari features/
  assert.doesNotMatch(pageHeaderSource, /@\/features\/|\.\.\/features\//);

  // Kontrak tampilan & aksesibilitas PageHeaderCard
  assert.match(pageHeaderSource, /<header[\s\S]*?data-slot="page-header-card"/);
  assert.match(pageHeaderSource, /\bbg-card\b[\s\S]*?\bborder-border\b[\s\S]*?\brounded-3xl\b[\s\S]*?\bshadow-xs\b/);
  assert.match(pageHeaderSource, /\bbg-accent\b[\s\S]*?\btext-accent-foreground\b/);
  assert.match(pageHeaderSource, /<HugeiconsIcon\s+icon=\{icon\}[\s\S]*?aria-hidden="true"/);
  assert.match(pageHeaderSource, /<h1[\s\S]*?\btext-foreground\b[\s\S]*?\{title\}/);
  assert.match(pageHeaderSource, /<p[\s\S]*?\btext-muted-foreground\b[\s\S]*?\{description\}/);
  assert.doesNotMatch(
    pageHeaderSource,
    /\btext-primary\b/,
    "PageHeaderCard tidak boleh memakai text-primary di atas kartu putih",
  );

  // 1) Daftar Proyek (/projects)
  const projectsPage = readSrc("app/(dashboard)/projects/page.tsx");
  assert.match(projectsPage, /import\s+\{[^}]*\bPageHeaderCard\b[^}]*\}\s+from\s+"@\/shared\/components"/);
  const projectsHeader = extractPageHeaderBlock(projectsPage);
  assert.match(projectsHeader, /icon=\{Folder01Icon\}/);
  assert.match(projectsHeader, /title="Daftar Pipeline Proyek"/);
  assert.match(projectsHeader, /action=\{canCreateProject \? <CreateProjectDialog \/> : undefined\}/);
  assert.doesNotMatch(projectsPage, /\btext-primary\b/);

  // 2) Kalender Operasional (/operations/calendar)
  const calendarPage = readSrc("app/(dashboard)/operations/calendar/page.tsx");
  const calendarWorkspace = readSrc("features/operations/components/OperationalCalendarWorkspace.tsx");
  assert.match(calendarPage, /<PageHeaderSkeleton\b/);
  assert.match(calendarWorkspace, /<PageHeaderSkeleton\b/);
  const calendarHeader = extractPageHeaderBlock(calendarWorkspace);
  assert.match(calendarHeader, /icon=\{Calendar03Icon\}/);
  assert.match(calendarHeader, /title="Kalender Operasional"/);
  assert.match(calendarHeader, /Asia\/Jakarta \(WIB\)/);
  assert.match(calendarHeader, /canManageEvents \?[\s\S]*?Tambah Agenda Manual/);

  // 3) Direktori Tim (/directory)
  const directoryPage = readSrc("app/(dashboard)/directory/page.tsx");
  const directoryTable = readSrc("features/directory/components/DirectoryTable.tsx");
  assert.doesNotMatch(directoryPage, /\bp-4 sm:p-6\b/);
  const directoryHeader = extractPageHeaderBlock(directoryTable);
  assert.match(directoryHeader, /icon=\{UserGroupIcon\}/);
  assert.match(directoryHeader, /title="Direktori Anggota Tim"/);
  assert.match(directoryHeader, /badge=\{[\s\S]*?\{activeCount\} Aktif/);
  assert.match(directoryHeader, /action=\{canInvite \? <InviteUserModal \/> : undefined\}/);

  // 4) Profil Saya (/profile)
  const profilePage = readSrc("app/(dashboard)/profile/page.tsx");
  const profileHeader = extractPageHeaderBlock(profilePage);
  assert.match(profileHeader, /icon=\{UserIcon\}/);
  assert.match(profileHeader, /title="Profil & Keamanan"/);
  assert.doesNotMatch(profileHeader, /\baction=/);
  assert.doesNotMatch(profilePage, /<h1\b[\s\S]*?text-canvas-foreground/);

  // 5) Kelola Akses (/access-policies)
  const accessPoliciesPage = readSrc("app/(dashboard)/access-policies/page.tsx");
  const accessPoliciesHeader = extractPageHeaderBlock(accessPoliciesPage);
  assert.match(accessPoliciesHeader, /icon=\{Shield01Icon\}/);
  assert.match(accessPoliciesHeader, /title="Policy Akses"/);
  assert.doesNotMatch(accessPoliciesHeader, /\baction=/);
  const headerRenderMatches = accessPoliciesPage.match(/\{headerCard\}/g) ?? [];
  assert.equal(
    headerRenderMatches.length,
    4,
    "AccessPoliciesPage wajib merender headerCard di state non-owner, loading, error, dan sukses",
  );
});

// ==========================================
// AC-5: Kartu Header Teratas Bebas dari Pencarian, Filter, View Toggle, & Navigasi Waktu
// ==========================================

test("AC-5: PageHeaderCard serta kartu header Daftar Proyek, Kalender Operasional, dan Direktori Tim tidak memuat search, filter tab, view toggle, atau navigasi tanggal", () => {
  const pageHeaderSource = readSrc("shared/components/PageHeaderCard.tsx");
  assert.doesNotMatch(pageHeaderSource, /<input\b|<Input\b|<select\b|\bsearchQuery\b|\bviewMode\b|\bchildren\b/i);

  // Daftar Proyek: PageHeaderCard terpisah di atas input pencarian dan ProjectFilterTabs
  const projectsPage = readSrc("app/(dashboard)/projects/page.tsx");
  const projectsHeader = extractPageHeaderBlock(projectsPage);
  assert.doesNotMatch(projectsHeader, /project-search|<Input|ProjectFilterTabs/);
  assert.ok(
    projectsPage.indexOf("<PageHeaderCard") < projectsPage.indexOf('id="project-search"') &&
      projectsPage.indexOf('id="project-search"') < projectsPage.indexOf("<ProjectFilterTabs"),
    "Pencarian dan tab filter Daftar Proyek wajib berada setelah PageHeaderCard",
  );

  // Kalender Operasional: PageHeaderCard terpisah di atas CalendarHeaderControls (<section>, tanpa <h1>/CTA)
  const calendarWorkspace = readSrc("features/operations/components/OperationalCalendarWorkspace.tsx");
  const calendarHeader = extractPageHeaderBlock(calendarWorkspace);
  assert.doesNotMatch(calendarHeader, /Mode tampilan kalender|Kalender\s*\/\s*Daftar Agenda|Bulan sebelumnya|Hari Ini|Filter Proyek/);
  assert.ok(
    calendarWorkspace.indexOf("<PageHeaderCard") < calendarWorkspace.indexOf("<CalendarHeaderControls"),
    "CalendarHeaderControls wajib berada setelah PageHeaderCard",
  );

  const calendarControls = readSrc("features/operations/components/CalendarHeaderControls.tsx");
  assert.doesNotMatch(calendarControls, /<header[\s>]|<\/header>|<h1[\s>]|Tambah Agenda Manual|\bcanManageEvents\b|\bonOpenCreateModal\b/);
  assert.match(calendarControls, /^[\s\S]*<section\s+className="bg-card\b/);
  assert.match(calendarControls, /aria-label="Mode tampilan kalender"[\s\S]*?Kalender[\s\S]*?Daftar Agenda/);
  assert.match(calendarControls, /aria-label="Bulan sebelumnya"[\s\S]*?Hari Ini[\s\S]*?Filter Proyek/);
  assert.match(calendarControls, /text-accent-foreground\b[^>]*>\s*Reset Default/);

  // Direktori Tim: PageHeaderCard terpisah di atas bar search/filter role/status & tabel
  const directoryTable = readSrc("features/directory/components/DirectoryTable.tsx");
  const directoryHeader = extractPageHeaderBlock(directoryTable);
  assert.doesNotMatch(directoryHeader, /Filter berdasarkan role|Filter berdasarkan status|<input|<select|<table/);
  assert.ok(
    directoryTable.indexOf("<PageHeaderCard") < directoryTable.indexOf("Cari nama, email, WhatsApp, atau Instagram") &&
      directoryTable.indexOf("Filter berdasarkan role") < directoryTable.indexOf("<table"),
    "Input cari dan select filter Direktori Tim wajib berada di luar dan di bawah PageHeaderCard",
  );
});
