import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type * as HelpersModule from "../src/layouts/DashboardLayout/dashboard-shell.helpers";
import type * as NavConfigModule from "../src/layouts/navigation.config";

const {
  filterNavigationItems,
  getDashboardUserSummary,
  isNavigationHrefActive,
} = (await import(
  new URL("../src/layouts/DashboardLayout/dashboard-shell.helpers.ts", import.meta.url).href
)) as typeof HelpersModule;

const { navigationConfig } = (await import(
  new URL("../src/layouts/navigation.config.ts", import.meta.url).href
)) as typeof NavConfigModule;

const dashboardShellSource = readFileSync(
  new URL("../src/layouts/DashboardLayout/DashboardShell.tsx", import.meta.url),
  "utf8",
);

// ==========================================
// AC-5: Workspace Tanpa Top Header Bar
// ==========================================

test("AC-5: DashboardShell menghilangkan header atas, breadcrumb, serta avatar kanan atas dan memakai satu landmark <main>", () => {
  assert.doesNotMatch(dashboardShellSource, /<header[\s>]/i);
  assert.doesNotMatch(dashboardShellSource, /DashboardBreadcrumb/);
  assert.doesNotMatch(dashboardShellSource, /useProjectQuery/);

  const mainMatches = dashboardShellSource.match(/<main[\s>]/g) ?? [];
  assert.equal(mainMatches.length, 1);
  assert.match(dashboardShellSource, /<main[\s\S]*?id="workspace-main"/);
  assert.match(dashboardShellSource, /href="#workspace-main"/);
});

// ==========================================
// AC-6: Sidebar Desktop Rounded, Melayang (Flying), & Sticky
// ==========================================

test("AC-6: Sidebar desktop memakai sudut membulat melayang dan sticky tanpa wrapper overflow-hidden pemutus scroll", () => {
  // Wrapper root mengizinkan scroll dokumen dan memiliki jarak tepi desktop
  assert.match(
    dashboardShellSource,
    /className="[^"]*min-h-screen[^"]*overflow-x-clip[^"]*md:flex[^"]*md:items-start[^"]*md:p-4[^"]*"/,
  );
  // Pastikan return utama shell tidak mengunci seluruh layout dengan overflow-hidden + h-screen
  assert.doesNotMatch(
    dashboardShellSource,
    /h-screen h-dvh flex overflow-hidden/,
  );

  // <aside> membulat (rounded-3xl), melayang dengan border + shadow, dan menempel sticky
  const asideMatch = dashboardShellSource.match(/<aside[\s\S]*?>/);
  assert.ok(asideMatch, "Elemen <aside> desktop wajib ada");
  const asideOpenTag = asideMatch[0];
  assert.match(asideOpenTag, /\brounded-3xl\b/);
  assert.match(asideOpenTag, /\bmd:sticky\b/);
  assert.match(asideOpenTag, /\bmd:top-4\b/);
  assert.match(asideOpenTag, /\bshadow-sm\b/);
  assert.match(asideOpenTag, /\bborder-sidebar-border\b/);

  // Daftar menu di dalam sidebar tetap dapat scroll mandiri
  assert.match(
    dashboardShellSource,
    /flex-1 min-h-0 overflow-y-auto">\{renderNavLinks\("desktop"\)\}/,
  );
});

// ==========================================
// AC-7: Filter Navigasi, Footer /profile + Keluar Terpisah, & Menu Melayang HP
// ==========================================

test("AC-7: Helper navigasi dan identitas sidebar menyaring menu berdasarkan role/permission dan menormalkan data akun", () => {
  const developerItems = filterNavigationItems(
    navigationConfig,
    ["developer"],
    ["projects.read"],
  );
  assert.deepEqual(
    developerItems.map((item) => item.href),
    ["/projects", "/profile"],
  );

  // Tanpa role owner, permission policies.manage saja tidak cukup untuk Kelola Akses
  const policyOnlyDeveloper = filterNavigationItems(
    navigationConfig,
    ["developer"],
    ["policies.manage"],
  );
  assert.equal(
    policyOnlyDeveloper.some((item) => item.href === "/access-policies"),
    false,
  );

  // Role dicocokkan case-insensitive + permission terpenuhi
  const ownerItems = filterNavigationItems(
    navigationConfig,
    ["Owner"],
    ["operations.calendar.read", "directory.read", "policies.manage"],
  );
  assert.deepEqual(
    ownerItems.map((item) => item.href),
    [
      "/projects",
      "/operations/calendar",
      "/directory",
      "/profile",
      "/access-policies",
    ],
  );

  assert.equal(isNavigationHrefActive("/profile", "/profile"), true);
  assert.equal(isNavigationHrefActive("/projects/proj-123", "/projects"), true);
  assert.equal(isNavigationHrefActive("/projects-archive", "/projects"), false);
  assert.equal(isNavigationHrefActive("/directory", "/profile"), false);

  assert.deepEqual(
    getDashboardUserSummary({
      name: "  Nadia Kusuma  ",
      roles: ["  ", "operasional"],
      avatarUrl: " https://cdn.example.com/u1.webp ",
    }),
    {
      displayName: "Nadia Kusuma",
      primaryRole: "operasional",
      avatarUrl: "https://cdn.example.com/u1.webp",
    },
  );

  assert.deepEqual(getDashboardUserSummary(null), {
    displayName: "Anggota Tim",
    primaryRole: "Anggota",
    avatarUrl: null,
  });
});

test("AC-7: Footer sidebar memisahkan kartu Link /profile dengan Button Keluar dan menyediakan tombol menu melayang HP", () => {
  const footerMatch = dashboardShellSource.match(
    /const renderUserFooter = \(\) => \(([\s\S]*?)\n  \);/,
  );
  assert.ok(footerMatch, "Fungsi renderUserFooter wajib ada");
  const footerBody = footerMatch[1];

  const profileLinkMatch = footerBody.match(/<Link[\s\S]*?href="\/profile"[\s\S]*?<\/Link>/);
  assert.ok(profileLinkMatch, "Kartu akun harus berupa Link menuju /profile");
  // Anti-pattern: tidak boleh ada <Button> bersarang di dalam <Link>
  assert.doesNotMatch(profileLinkMatch[0], /<Button[\s>]/);
  assert.match(profileLinkMatch[0], /<UserAvatar[\s\S]*?\/>/);

  // Tombol Keluar terpisah di luar </Link> dengan label teks "Keluar" dan target minimal 44px
  const logoutButtonMatch = footerBody.match(/<Button[\s\S]*?<\/Button>/);
  assert.ok(logoutButtonMatch, "Tombol Keluar terpisah wajib ada");
  assert.match(logoutButtonMatch[0], /<span>Keluar<\/span>/);
  assert.match(logoutButtonMatch[0], /\bmin-h-11\b/);
  assert.match(logoutButtonMatch[0], /hover:bg-status-danger-surface/);
  assert.match(logoutButtonMatch[0], /hover:text-status-danger-text/);

  // Tombol menu melayang khusus mobile (< md) ukuran >= 44x44px dan ruang aman bawah pada <main>
  assert.match(dashboardShellSource, /<main[\s\S]*?\bpb-24\b/);
  assert.match(dashboardShellSource, /fixed right-\[[^\]]+\] bottom-\[[^\]]+\] z-40 md:hidden/);
  assert.match(dashboardShellSource, /aria-label="Buka menu navigasi"/);
  assert.match(dashboardShellSource, /\bsize-12\b/);
  assert.match(dashboardShellSource, /<SheetContent[\s\S]*?side="left"[\s\S]*?<SheetDescription/);
});
