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
// AC-6: Daftar Proyek — Kartu Konten Putih Seragam + Warna Terkembali f8e5d05
// ==========================================

test("AC-6: Daftar Proyek membungkus pencarian, tab filter status, tabel/kartu proyek, dan paginasi ke dalam kartu konten putih (bg-card) dengan warna f8e5d05", () => {
  const projectsPage = readSrc("app/(dashboard)/projects/page.tsx");
  const filterTabsSource = readSrc("features/projects/components/ProjectFilterTabs.tsx");
  const projectTableSource = readSrc("features/projects/components/ProjectTable.tsx");

  // 1) Satu kartu konten putih membulat berada setelah PageHeaderCard dan membungkus seluruh kontrol & tabel
  const sectionMatch = projectsPage.match(
    /<section[\s\S]*?aria-labelledby="projects-content-heading"[\s\S]*?<\/section>/,
  );
  assert.ok(sectionMatch, "Daftar Proyek wajib memiliki <section aria-labelledby=\"projects-content-heading\">");
  const contentCard = sectionMatch[0];

  assert.ok(
    projectsPage.indexOf("<PageHeaderCard") < projectsPage.indexOf('aria-labelledby="projects-content-heading"'),
    "Kartu konten proyek wajib tampil di bawah PageHeaderCard",
  );
  assert.match(contentCard, /className="[^"]*\bbg-card\b[^"]*\bborder-border\b[^"]*\brounded-3xl\b[^"]*\bshadow-xs\b/);
  assert.match(contentCard, /<h2\s+id="projects-content-heading"/);

  // Pencarian & filter status dalam <search>
  assert.match(contentCard, /<search\b[\s\S]*?htmlFor="project-search"[\s\S]*?id="project-search"[\s\S]*?<ProjectFilterTabs[\s\S]*?<\/search>/);
  assert.match(contentCard, /autoComplete="off"[\s\S]*?autoCorrect="off"[\s\S]*?autoCapitalize="off"[\s\S]*?spellCheck=\{false\}/);

  // Tabel/daftar, error alert (f8e5d05 destructive/*), & paginasi seluruhnya di dalam kartu konten putih
  assert.match(contentCard, /border-destructive\/30 bg-destructive\/5/);
  assert.match(contentCard, /<ProjectTable\b/);
  assert.match(contentCard, /<nav[\s\S]*?aria-label="Paginasi proyek"[\s\S]*?\btext-muted-foreground\b[\s\S]*?Sebelumnya[\s\S]*?Selanjutnya/);
  assert.doesNotMatch(projectsPage, /\btext-canvas-muted\b/);

  // 2) Tab filter status memakai aria-pressed, group, target sentuh mobile >= 44px, dan pil aktif gelap f8e5d05
  assert.match(filterTabsSource, /role="group"[\s\S]*?aria-label="Filter status proyek"/);
  assert.match(filterTabsSource, /aria-pressed=\{isActive\}/);
  assert.match(filterTabsSource, /\bmin-h-11 sm:min-h-9\b/);
  assert.doesNotMatch(filterTabsSource, /\bmin-h-10\b/);
  assert.match(filterTabsSource, /\bbg-foreground text-background\b[\s\S]*?\bbg-muted\/50 text-muted-foreground\b/);

  // 3) Tabel proyek aksesibel (scroll keyboard, caption, scope="col") & tanpa <Button> bersarang di <Link> + warna f8e5d05
  assert.match(projectTableSource, /tabIndex=\{0\}[\s\S]*?role="region"[\s\S]*?aria-label="Tabel daftar proyek"/);
  assert.match(projectTableSource, /<caption\s+className="sr-only">/);
  const colHeaders = projectTableSource.match(/<th\s+scope="col"/g) ?? [];
  assert.equal(colHeaders.length, 6, "Seluruh 6 kolom header ProjectTable wajib memiliki scope=\"col\"");
  assert.doesNotMatch(projectTableSource, /<Link\b[^>]*>\s*<Button\b/);
  const asChildLinks = projectTableSource.match(/<Button[\s\S]*?\basChild\b[\s\S]*?>\s*<Link\b/g) ?? [];
  assert.equal(asChildLinks.length, 2, "Tautan Buka Proyek desktop & mobile wajib memakai <Button asChild><Link ...>");
  assert.match(projectTableSource, /bg-muted\/30/);
  assert.match(projectTableSource, /<article[\s\S]*?\bbg-card\b[\s\S]*?\bshadow-xs\b[\s\S]*?<h3\b/);
});

// ==========================================
// AC-7: Kalender Operasional — Kartu Kontrol & Filter Putih Terpisah di Bawah Header
// ==========================================

test("AC-7: Kalender Operasional memisahkan navigasi waktu, rentang kustom, view toggle, dan filter ke kartu kontrol putih terpisah dengan warna f8e5d05", () => {
  const calendarWorkspace = readSrc("features/operations/components/OperationalCalendarWorkspace.tsx");
  const controlsSource = readSrc("features/operations/components/CalendarHeaderControls.tsx");

  assert.ok(
    calendarWorkspace.indexOf("<PageHeaderCard") < calendarWorkspace.indexOf("<CalendarHeaderControls") &&
      calendarWorkspace.indexOf("<CalendarHeaderControls") < calendarWorkspace.indexOf("<OverdueAlertStrip") &&
      calendarWorkspace.indexOf("<OverdueAlertStrip") < calendarWorkspace.indexOf("<CalendarMonthGrid"),
    "CalendarHeaderControls wajib terpisah di antara PageHeaderCard dan area alert/grid kalender",
  );

  // Kartu kontrol putih terpisah
  assert.match(
    controlsSource,
    /<section\s+className="bg-card border border-border rounded-3xl[^"]*\bshadow-xs\b[^"]*"\s+aria-labelledby="calendar-controls-heading"/,
  );
  assert.match(controlsSource, /<h2\s+id="calendar-controls-heading"\s+className="sr-only">/);

  // Navigasi bulan, Hari Ini, rentang kustom (aman 375px + warna text-destructive f8e5d05)
  assert.match(controlsSource, /aria-label="Bulan sebelumnya"[\s\S]*?aria-label="Bulan berikutnya"[\s\S]*?Hari Ini/);
  assert.match(controlsSource, /max-w-\[calc\(100vw-2rem\)\]/);
  assert.match(controlsSource, /role="alert"[\s\S]*?\btext-destructive\b/);

  assert.match(
    calendarWorkspace,
    /className="[^"]*\bh-11 md:h-9\b[^"]*"[\s\S]*?Tambah Agenda Manual/,
  );
  assert.doesNotMatch(calendarWorkspace, /\bh-10 md:h-9\b/);

  // View mode toggle & filter proyek & sumber acara di dalam kartu kontrol putih
  assert.match(controlsSource, /aria-label="Mode tampilan kalender"[\s\S]*?aria-pressed=\{viewMode === "grid"\}[\s\S]*?Kalender[\s\S]*?aria-pressed=\{viewMode === "list"\}[\s\S]*?Daftar Agenda/);
  assert.match(controlsSource, /Filter Proyek[\s\S]*?Reset Default[\s\S]*?id="cal-project-search"[\s\S]*?autoCorrect="off"[\s\S]*?\bh-11 md:h-9\b[\s\S]*?\btext-base md:text-xs\b/);
  assert.match(controlsSource, /role="group"[\s\S]*?aria-label="Filter sumber acara kalender"[\s\S]*?Semua Tipe/);
  assert.doesNotMatch(controlsSource, /\btext-canvas-muted\b/);
});

// ==========================================
// AC-8: Direktori Tim & Kelola Akses — Struktur Kartu Putih & Aksesibilitas Tetap dengan Warna f8e5d05
// ==========================================

test("AC-8: Direktori Tim dan Kelola Akses menjaga seluruh struktur kartu, target sentuh >= 44px, dan mengembalikan warna komponen ke f8e5d05", () => {
  const directoryTable = readSrc("features/directory/components/DirectoryTable.tsx");
  const accessPoliciesPage = readSrc("app/(dashboard)/access-policies/page.tsx");

  // 1) Direktori Tim: 1 kartu konten putih setelah PageHeaderCard
  const dirSectionMatch = directoryTable.match(
    /<section[\s\S]*?aria-labelledby="directory-content-heading"[\s\S]*?<\/section>/,
  );
  assert.ok(dirSectionMatch, "DirectoryTable wajib memiliki <section aria-labelledby=\"directory-content-heading\">");
  const dirCard = dirSectionMatch[0];

  assert.ok(
    directoryTable.indexOf("<PageHeaderCard") < directoryTable.indexOf('aria-labelledby="directory-content-heading"'),
    "Kartu konten Direktori Tim wajib tampil di bawah PageHeaderCard",
  );
  assert.match(dirCard, /className="[^"]*\bbg-card\b[^"]*\bborder-border\b[^"]*\brounded-3xl\b[^"]*\bshadow-xs\b/);

  // Pencarian + select dropdown di dalam <search> pada bagian atas kartu konten (konsisten 16px & >= 44px mobile)
  assert.match(
    dirCard,
    /<search[\s\S]*?htmlFor="directory-search"[\s\S]*?id="directory-search"[\s\S]*?htmlFor="directory-role-filter"[\s\S]*?id="directory-role-filter"[\s\S]*?\btext-base sm:text-xs\b[\s\S]*?\bmin-h-11 sm:min-h-9\b[\s\S]*?htmlFor="directory-status-filter"[\s\S]*?id="directory-status-filter"[\s\S]*?\btext-base sm:text-xs\b[\s\S]*?\bmin-h-11 sm:min-h-9\b[\s\S]*?<\/search>/,
  );
  // Seluruh state (loading, error, empty, data table) di dalam kartu konten putih dengan warna f8e5d05
  assert.match(dirCard, /border-primary border-t-transparent[\s\S]*?Memuat data direktori tim\.\.\./);
  assert.match(dirCard, /text-red-600 font-medium[\s\S]*?Gagal memuat direktori tim\./);
  assert.match(dirCard, /Tidak ada anggota yang ditemukan/);
  assert.match(dirCard, /tabIndex=\{0\}[\s\S]*?role="region"[\s\S]*?<table[\s\S]*?<caption\s+className="sr-only">/);
  assert.match(dirCard, /<th\s+scope="col"/);
  assert.match(dirCard, /bg-amber-100 text-amber-800/);
  assert.match(dirCard, /bg-emerald-50 text-emerald-700/);
  assert.match(dirCard, /bg-purple-50 text-purple-700/);

  // 2) Kelola Akses (/access-policies): seluruh state & kontrol tetap di Card putih dengan warna f8e5d05
  assert.doesNotMatch(accessPoliciesPage, /\btext-canvas-muted\b|\btext-canvas-foreground\b/);

  // State non-owner, loading, & error tetap memakai Card bg-card
  assert.match(accessPoliciesPage, /<Card[\s\S]*?\bbg-card\b[\s\S]*?>[\s\S]*?Halaman ini hanya tersedia untuk owner\./);
  assert.match(accessPoliciesPage, /<Card[\s\S]*?\bbg-card\b[\s\S]*?>[\s\S]*?border-primary border-t-transparent[\s\S]*?Memuat policy akses…/);
  assert.match(accessPoliciesPage, /role="alert"[\s\S]*?border-destructive\/30[\s\S]*?\bbg-card\b[\s\S]*?text-destructive[\s\S]*?Muat ulang policy/);

  // Notice penguncian owner dibungkus Card putih & warna amber f8e5d05
  assert.match(
    accessPoliciesPage,
    /<Card[\s\S]*?\bbg-card\b[\s\S]*?>[\s\S]*?border-amber-200 bg-amber-50 p-4 text-sm text-amber-900[\s\S]*?Permission pengelolaan policy untuk owner dikunci/,
  );

  // Kartu role pakai Card bg-card, label for/id eksplisit, & accent-primary f8e5d05
  assert.match(accessPoliciesPage, /<Card[\s\S]*?\bbg-card\b[\s\S]*?>[\s\S]*?<label[\s\S]*?htmlFor=\{checkboxId\}[\s\S]*?<input[\s\S]*?id=\{checkboxId\}[\s\S]*?accent-primary/);

  // Kartu riwayat menyatukan penjelasan multi-role, list <ul>, warna emerald/amber f8e5d05, dan tombol Muat ulang policy di CardFooter
  assert.match(
    accessPoliciesPage,
    /<Card[\s\S]*?\bbg-card\b[\s\S]*?>[\s\S]*?Riwayat perubahan policy[\s\S]*?Jika pengguna memiliki lebih dari satu role[\s\S]*?<ul[\s\S]*?text-emerald-700[\s\S]*?text-amber-700[\s\S]*?<CardFooter[\s\S]*?Muat ulang policy[\s\S]*?<\/CardFooter>[\s\S]*?<\/Card>/,
  );
});
