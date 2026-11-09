import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const srcRoot = path.join(frontendRoot, "src");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (
      entry.isFile() &&
      /\.(ts|tsx|css)$/i.test(entry.name)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const globalsCss = readFileSync(path.join(srcRoot, "app/globals.css"), "utf8");
const sonnerSource = readFileSync(
  path.join(srcRoot, "components/ui/sonner.tsx"),
  "utf8",
);
const chartSource = readFileSync(
  path.join(srcRoot, "components/ui/chart.tsx"),
  "utf8",
);
const highlighterSource = readFileSync(
  path.join(srcRoot, "lib/highlighter.tsx"),
  "utf8",
);
const dotPatternSource = readFileSync(
  path.join(srcRoot, "components/ui/dot-pattern.tsx"),
  "utf8",
);
const authBackdropSource = readFileSync(
  path.join(srcRoot, "features/auth/components/AuthBackdrop.tsx"),
  "utf8",
);
const authBarrelSource = readFileSync(
  path.join(srcRoot, "features/auth/index.ts"),
  "utf8",
);
const loginPageSource = readFileSync(
  path.join(srcRoot, "app/(auth)/login/page.tsx"),
  "utf8",
);
const loginFormSource = readFileSync(
  path.join(srcRoot, "features/auth/components/LoginForm.tsx"),
  "utf8",
);
const forgotPasswordPageSource = readFileSync(
  path.join(srcRoot, "app/(auth)/forgot-password/page.tsx"),
  "utf8",
);
const resetPasswordPageSource = readFileSync(
  path.join(srcRoot, "app/(auth)/reset-password/page.tsx"),
  "utf8",
);
const activatePageSource = readFileSync(
  path.join(srcRoot, "app/(auth)/activate/page.tsx"),
  "utf8",
);
const activateFormSource = readFileSync(
  path.join(srcRoot, "features/auth/components/ActivateForm.tsx"),
  "utf8",
);

// ==========================================
// AC-8: Satu Tema Warna Terang Tetap (Tanpa Dark Mode)
// ==========================================

test("AC-8: Seluruh berkas frontend/src bebas dari aturan, kelas, maupun switcher mode gelap", () => {
  const sourceFiles = collectSourceFiles(srcRoot);
  assert.ok(sourceFiles.length > 0, "Folder frontend/src wajib berisi berkas sumber");

  const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
    { label: "@custom-variant dark", regex: /@custom-variant\s+dark\b/ },
    { label: "selector .dark", regex: /(?:^|[\s,{])\.dark\b/m },
    { label: "utilitas Tailwind dark:", regex: /\bdark:/ },
    { label: "import/penggunaan next-themes", regex: /\bnext-themes\b/ },
    { label: "komponen ThemeProvider", regex: /\bThemeProvider\b/ },
    { label: "media query prefers-color-scheme", regex: /prefers-color-scheme/ },
  ];

  const violations: string[] = [];

  for (const filePath of sourceFiles) {
    const content = readFileSync(filePath, "utf8");
    const relPath = path.relative(frontendRoot, filePath);

    for (const pattern of forbiddenPatterns) {
      if (pattern.regex.test(content)) {
        violations.push(`${relPath} mengandung ${pattern.label}`);
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Ditemukan sisa aturan/utilitas mode gelap: ${violations.join("; ")}`,
  );

  // Kunci color-scheme light dan konfigurasi komponen pihak ketiga ke tema terang
  assert.match(globalsCss, /:root\s*\{[\s\S]*?\bcolor-scheme:\s*light;/);
  assert.match(sonnerSource, /theme="light"/);
  assert.match(chartSource, /const\s+THEMES\s*=\s*\{\s*light:\s*""\s*\}\s*as\s+const/);
  assert.doesNotMatch(chartSource, /\bdark:/);
  assert.match(highlighterSource, /github-light/);
  assert.doesNotMatch(highlighterSource, /github-dark/);
});

// ==========================================
// AC-9: Komentar Pemetaan Komponen /* ... */ di globals.css Tanpa Class Baru
// ==========================================

test("AC-9: globals.css mendokumentasikan pemetaan komponen dengan komentar /* ... */ tanpa menambah class CSS baru", () => {
  assert.doesNotMatch(globalsCss, /(?:^|\s)\.dark\b/);

  // Pastikan tidak ada deklarasi class selector CSS (.nama-class) di luar komentar & token
  const cssWithoutComments = globalsCss.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(
    cssWithoutComments,
    /^\s*\.[a-zA-Z_-][\w-]*/m,
    "globals.css dilarang menambah selector class CSS baru",
  );

  // Pastikan seluruh area komponen utama terdokumentasi dengan komentar CSS standar /* ... */
  const cssComments = globalsCss.match(/\/\*[\s\S]*?\*\//g) ?? [];
  const joinedComments = cssComments.join("\n");

  for (const requiredTopic of [
    /Button.*Badge.*Card.*Input/i,
    /DashboardShell|Floating Sidebar/i,
    /ProjectStatusBadge|Status Proyek/i,
    /TaskChecklistItem|DpWarningBanner/i,
    /ChartContainer|Grafik/i,
    /Auth|DotPattern/i,
  ]) {
    assert.match(
      joinedComments,
      requiredTopic,
      `Komentar pemetaan untuk ${requiredTopic} wajib ada di globals.css`,
    );
  }

  // Pastikan token warna inti tetap utuh di dalam :root
  for (const coreToken of [
    "--background:",
    "--foreground:",
    "--card:",
    "--primary:",
    "--primary-foreground:",
    "--secondary:",
    "--accent-foreground:",
    "--status-success-text:",
    "--status-danger-text:",
    "--sidebar:",
    "--border:",
  ]) {
    assert.ok(
      globalsCss.includes(coreToken),
      `Token ${coreToken} wajib dipertahankan di globals.css`,
    );
  }
});

// ==========================================
// AC-10: Latar DotPattern pada Keempat Halaman Autentikasi
// ==========================================

test("AC-10: Halaman /login, /forgot-password, /reset-password, dan /activate memakai AuthBackdrop dengan DotPattern statis & aksesibel", () => {
  // Ekspor barrel & implementasi AuthBackdrop
  assert.match(authBarrelSource, /export\s+\*\s+from\s+"\.\/components\/AuthBackdrop"/);
  assert.match(authBackdropSource, /<main[\s\S]*?data-slot="auth-backdrop"/);
  assert.match(authBackdropSource, /<DotPattern[\s\S]*?glow=\{false\}/);
  assert.match(authBackdropSource, /relative\s+z-10[\s\S]*?\{children\}/);

  // DotPattern harus aksesibel, menghormati reduced motion, dan tidak memakai Math.random saat render
  assert.match(dotPatternSource, /aria-hidden="true"/);
  assert.match(dotPatternSource, /pointer-events-none/);
  assert.match(dotPatternSource, /useReducedMotion/);
  assert.match(dotPatternSource, /Boolean\(glow\)\s*&&\s*!prefersReducedMotion/);
  assert.doesNotMatch(dotPatternSource, /Math\.random\s*\(/);

  // 1) /login -> LoginForm membungkus AuthBackdrop
  assert.match(loginPageSource, /<LoginForm\s*\/>/);
  assert.match(loginFormSource, /<AuthBackdrop\b[\s\S]*?<\/AuthBackdrop>/);

  // 2) /forgot-password -> membungkus AuthBackdrop
  assert.match(forgotPasswordPageSource, /AuthBackdrop/);
  assert.match(forgotPasswordPageSource, /<AuthBackdrop>[\s\S]*?<\/AuthBackdrop>/);

  // 3) /reset-password -> membungkus AuthBackdrop
  assert.match(resetPasswordPageSource, /AuthBackdrop/);
  assert.match(resetPasswordPageSource, /<AuthBackdrop>[\s\S]*?<\/AuthBackdrop>/);

  // 4) /activate -> membungkus <Suspense> + ActivateForm di AuthBackdrop tanpa latar polos ganda di ActivateForm
  assert.match(activatePageSource, /<AuthBackdrop>[\s\S]*?<Suspense[\s\S]*?<ActivateForm\s*\/>[\s\S]*?<\/AuthBackdrop>/);
  assert.doesNotMatch(activateFormSource, /bg-neutral-50\/50/);
  assert.doesNotMatch(activateFormSource, /\bmin-h-screen\b/);

  // Verifikasi keamanan kontras & aksesibilitas pada formulir auth
  for (const authModule of [
    loginFormSource,
    forgotPasswordPageSource,
    resetPasswordPageSource,
    activateFormSource,
  ]) {
    assert.doesNotMatch(authModule, /\btext-red-500\b/);
    assert.match(authModule, /role="alert"/);
    assert.match(authModule, /text-status-danger-text/);
  }
});
