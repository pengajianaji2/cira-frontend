# Cira Project Management — Frontend Web (`cira-pm-frontend`)

Dashboard web terpadu berbasis **Next.js App Router** untuk tim agensi/studio pengembang mengelola proyek klien, checklist task & backlog, daur hidup sprint, tata kelola persetujuan status proyek & versi PRD, kontrak termin berbobot 100% & pencatatan invoice, kalender operasional teragregasi berzona waktu `Asia/Jakarta` (WIB), serta profil & direktori anggota tim.

---

## 🚀 Fitur Utama (US-1 s.d. US-4 & Fondasi Workspace)

Mengacu pada spesifikasi [`docs/prd.md`](docs/prd.md) dan [`docs/design.md`](docs/design.md):

### 1. Autentikasi, Profil Pengguna, RBAC Dinamis & Direktori Tim
- **Autentikasi & Pemulihan Akun (`AuthBackdrop`)**: Halaman login (`/login`), lupa password (`/forgot-password`), atur ulang password token 30 menit (`/reset-password`), dan aktivasi akun undangan 24 jam (`/activate`) dibungkus latar tema terang `AuthBackdrop` berpola titik aksesibel (`DotPattern` statis).
- **Pemotongan Foto Profil 1:1 & Avatar Seragam (`AvatarCropDialog`, `UserAvatar`)**: Pengguna dapat memilih foto PNG/JPG/WebP (maksimal 2 MB), memposisikan & memperbesar potongan rasio `1:1` lewat mouse, sentuhan, atau keyboard pada dialog interaktif, serta menampilkan avatar lingkaran seragam dengan fallback inisial otomatis lintas halaman.
- **Profil Kontak Opsional & Direktori Tim (`/profile`, `/directory`)**: Pembaruan nama, email, WhatsApp (E.164 opsional/nullable), dan username Instagram (opsional/nullable) pada `ProfileForm` langsung menyinkronkan Direktori Tim dan query terkait; halaman `/directory` menyediakan pencarian/filter role, pengiriman undangan, dan pengaturan role/status akun oleh Owner.
- **Kelola Akses (`/access-policies`)**: Pengaturan capability matrix dinamis per role (`Owner`, `Developer`, `Operasional`) beserta histori audit perubahannya khusus Owner.

### 2. Task Checklist TODO/DONE & Manajemen Backlog (`/projects/[id]?tab=tasks`)
- **Checklist Status Tunggal**: Setiap task hanya menggunakan dua status (`todo` dan `done`) dengan antarmuka daftar checklist (tanpa drag-and-drop Kanban), sekaligus banner pengingat status verifikasi DP proyek (`DpWarningBanner`).
- **Default Backlog**: Task baru otomatis masuk ke Backlog proyek (`sprintId = null`) bila pengguna tidak memilih sprint secara eksplisit.
- **Konfirmasi Pindah ke Sprint Aktif**: Memindahkan task dari Backlog/sprint lain ke Sprint yang sedang berstatus `active` wajib melewati dialog konfirmasi (`MoveToActiveSprintDialog`).

### 3. Tata Kelola Proyek, Sprint Lifecycle & Progres Kumulatif (`/projects`, `/projects/[id]`)
- **Tata Kelola Proyek & PRD Versioning (`?tab=prd`)**: Pengajuan & voting konsensus 100% perubahan status proyek (`lead` / `active` / `completed` / `cancelled`) beserta arbitrase final Owner (`StatusApprovalBanner`), manajemen roster voting, tautan repositori berlabel (`monorepo` / `separate`), editor PRD, arsip versi GZIP + *restore* versi, dan ekspor PDF PRD.
- **Daur Hidup Sprint (`?tab=sprints`)**: Pengelolaan sprint berurutan (`planning` ➔ `active` ➔ `completed`) dengan aturan maksimal satu sprint aktif per proyek.
- **Penutupan Sprint Atomik (`CloseSprintModal`)**: Menutup sprint aktif yang masih memiliki task `todo` mewajibkan pengguna menentukan tujuan pemindahan setiap task (ke Backlog `sprintId = null` atau sprint non-completed lain dalam proyek yang sama).
- **Progres Kumulatif Proyek (`CumulativeProgressBar`)**: Dihitung secara matematis berdasarkan rasio jumlah sprint selesai terhadap total seluruh sprint proyek ($\frac{\text{completedSprintCount}}{\text{totalSprintCount}} \times 100\%$, dibulatkan 1 desimal; bernilai $0\%$ bila total sprint 0).

### 4. Kontrak Termin 100%, Pemicu Termin & Penerbitan Invoice Manual (`/projects/[id]?tab=finance`)
- **Konfigurasi Kontrak & Termin 100% (`ContractConfigModal`)**: Form penyusunan nilai kontrak dan daftar termin berbobot total persis 100%; termin terakhir otomatis menyerap selisih pembulatan rupiah.
- **Pemicu Tunggal & Evaluasi Kesiapan Idempotent (`EditPaymentTermModal`, `UploadBastModal`)**: Setiap termin wajib memilih tepat satu pemicu: `date` (`YYYY-MM-DD` WIB), `sprint` (ambang `requiredCompletedSprints`), atau `manual`. Termin berstatus `planned` otomatis menjadi `ready` saat pemicu terpenuhi, atau dapat ditandai `ready` secara manual dengan lampiran BAST opsional.
- **Pencatatan Invoice Manual & Overdue WIB (`PaymentTermsTable`, `InvoicePdfModal`)**: Penerbitan invoice resmi dari termin `ready` mewajibkan pengisian `invoiceDueDate`, mengunci termin (`isLocked = true`), mendukung pratinjau/cetak dokumen PDF invoice, penandaan lunas manual (`invoiced` ➔ `paid`), dan penandaan status `Overdue` otomatis berdasarkan tanggal `Asia/Jakarta` (WIB).

### 5. Kalender Operasional Teragregasi & Agenda Manual (`/operations/calendar`)
- **Read-Aggregation Kalender WIB (`OperationalCalendarWorkspace`)**: Kalender bulanan Senin-pertama yang menggabungkan Sprint, Termin `Ready`, Invoice Jatuh Tempo / Overdue (`OverdueAlertStrip`), dan Agenda Manual (`OperationalEvent`: `client_demo`, `deployment`, `maintenance`, `meeting`).
- **Filter, Drawer & Deep Link (`CalendarHeaderControls`, `CalendarEventDrawer`)**: Filter rentang tanggal (maks 90 hari), sumber event, proyek, status proyek, serta toggle agenda dibatalkan; drawer detail menyediakan tautan navigasi langsung ke modul/proyek sumber.
- **Agenda Manual & Proteksi RBAC (`OperationalEventModal`, `CancelAgendaDialog`, `CalendarAccessDenied`)**: Pembuatan agenda mendukung mode terjadwal/all-day dengan `projectId` opsional, pembatalan soft-status (`cancelled`), log follow-up manual, dan proteksi akses berbasis `operations.calendar.read`.

### 6. Workspace Layout Tanpa Topbar & Tema Terang Tunggal
- **Floating Sticky Sidebar (`DashboardShell`)**: Menghilangkan bar header atas demi memberi ruang penuh bagi `<main id="workspace-main">`; desktop menampilkan sidebar membulat (`rounded-3xl`) menempel sticky dengan footer terpisah untuk kartu `<Link href="/profile">` dan tombol `Keluar`, sedangkan layar seluler menampilkan tombol menu melayang kanan bawah (`size-12`) pembuka drawer navigasi.
- **Kanvas Tema Terang Tunggal (`globals.css`)**: Seluruh aplikasi dan komponen pihak ketiga (Sonner, Recharts, Shiki, Radix/Base UI) dikunci pada satu tema terang konsisten dengan dokumentasi pemetaan komponen dan token status semantik (`status-success-*`, `status-warning-*`, `status-info-*`, `status-danger-*`).

---

## 🛠️ Tech Stack & Primitives

- **Framework:** Next.js `16.4.5` (App Router), React `19.3.0`
- **Bahasa:** TypeScript `5+`
- **Styling & Animasi:** Tailwind CSS `v4`, PostCSS, `tw-animate-css`, `motion` (`^14.11.1`)
- **Design System & Primitives UI:** Radix UI (`radix-ui`), Base UI (`@base-ui/react`), shadcn/ui
- **Ikonografi:** Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Server State & Caching:** TanStack React Query `v5` (`@tanstack/react-query`)
- **Client State:** Zustand `v5`
- **Tabel & Data Grid:** TanStack Table `v9`
- **Form & Validasi:** React Hook Form + `@hookform/resolvers` + Zod `v4`
- **Notifikasi Toast:** Sonner
- **Markdown, Chart & PDF:** `react-markdown`, `recharts`, `@react-pdf/renderer`, `react-to-print`
- **Manipulasi Gambar & Tanggal:** `browser-image-compression`, HTML5 Canvas (`avatar-crop.ts`), `date-fns`
- **Test Runner:** Node.js Built-in Test Runner (`node --test tests/*.test.ts`)

---

## 📁 Struktur Direktori (`frontend/`)

Mengikuti arsitektur modular berbasis fitur (`types` ➔ `api` ➔ `queries` ➔ `components` ➔ `page`):

```text
frontend/
├── src/
│   ├── app/                                  # Next.js App Router Pages & Layouts
│   │   ├── (auth)/                           # /login, /activate, /forgot-password, /reset-password
│   │   ├── (dashboard)/                      # /projects, /projects/[id], /operations/calendar, /directory, /profile, /access-policies
│   │   ├── providers/                        # Root client providers (QueryClientProvider, GlobalStateProvider, Toaster)
│   │   ├── globals.css & tw-animate.css      # Theme terang tunggal, token semantik & pemetaan komentar CSS
│   │   └── layout.tsx & global-error.tsx
│   ├── components/
│   │   └── ui/                               # Primitives UI reusable (Button, Dialog, AlertDialog, DotPattern, Table, Badge, dll.)
│   ├── features/                             # Modul fitur mandiri (Encapsulated per domain)
│   │   ├── auth/                             # LoginForm, ActivateForm, AuthBackdrop, AvatarCropDialog, avatar-crop.ts, ProfileForm, auth store/queries
│   │   ├── directory/                        # Tabel direktori tim, undangan anggota & ubah role/status
│   │   ├── projects/                         # Pipeline proyek, voting roster, repo links & editor/arsip PRD GZIP
│   │   ├── tasks/                            # Task checklist TODO/DONE, Backlog & dialog pindah ke sprint aktif
│   │   ├── sprints/                          # Daur hidup sprint, tutup atomik & progres rasio sprint
│   │   ├── finance/                          # Kontrak termin 100%, pemicu tunggal, BAST, invoice PDF & pelunasan
│   │   ├── operations/                       # Kalender operasional WIB, filter 90 hari, agenda manual & reminder log
│   │   ├── activity/                         # Timeline riwayat aktivitas kronologis
│   │   └── assets/                           # Galeri aset desain & kompresi/upload langsung ke Cloudinary
│   ├── layouts/
│   │   ├── DashboardLayout/                  # DashboardShell (floating sticky sidebar & mobile drawer) + dashboard-shell.helpers.ts
│   │   └── navigation.config.ts              # Konfigurasi menu navigasi berbasis role & permission
│   └── shared/
│       ├── components/                       # UserAvatar.tsx & state/ (Skeletons, EmptyState, GlobalStateProvider, LoadingAction, LocalizedComponentError)
│       ├── lib/                              # api-client.ts (Axios + CSRF + cookie credentials), business-date.ts (WIB)
│       ├── store/                            # workspace.store.ts
│       └── types/                            # api.types.ts, auth.types.ts
└── tests/                                    # Automated unit & contract tests (4 file, 13 test)
    ├── us1-avatar-crop.test.ts               # 3 tests — Validasi file avatar, kalkulasi frame 1:1 & ekspor kanvas
    ├── us2-profile-contacts.test.ts          # 3 tests — Skema profil & normalisasi WA/IG opsional ke null
    ├── us3-dashboard-shell.test.ts           # 4 tests — Shell tanpa topbar, floating sticky sidebar, filter navigasi & aksesibilitas footer
    └── us4-theme-and-auth-backdrop.test.ts   # 3 tests — Kunci tema terang tunggal, komentar globals.css & AuthBackdrop DotPattern
```

---

## 💻 Panduan Menjalankan Frontend

Aturan pemakaian token styling dijelaskan di [`docs/styling-tokens.md`](docs/styling-tokens.md).

### 1. Prasyarat Sistem
- Node.js versi 20 atau lebih baru (Node 24 LTS direkomendasikan untuk `node --test tests/*.test.ts`)
- Package manager: `npm`

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env.local`)
Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi konfigurasi dasar:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

*(Opsional khusus development)* `NEXT_PUBLIC_DEMO_EMAIL` dan `NEXT_PUBLIC_DEMO_PASSWORD` hanya untuk fitur quick-fill login saat development. Jangan set variabel tersebut pada build production karena nilainya tersimpan di bundle browser.

### 4. Menjalankan Server
- **Development Mode**:
  ```bash
  npm run dev
  ```
  Buka [http://localhost:3000](http://localhost:3000).
- **Build & Start Produksi**:
  ```bash
  npm run build
  npm run start
  ```

### 5. Verifikasi Kualitas Kode & Automated Tests
```bash
# Typecheck TypeScript
npx tsc -p tsconfig.json --noEmit

# Linting ESLint
npm run lint

# Automated Unit & Contract Tests (Node.js native test runner)
node --test tests/*.test.ts

# Build Produksi Next.js
npm run build
```

*Terverifikasi: `13 tests passing, 0 failing` across 4 test files; TypeScript & ESLint `0 errors`.*
