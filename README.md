# Cira Project Management — Frontend Web (`cira-pm-frontend`)

Dashboard web terpadu berbasis **Next.js App Router** untuk tim agensi/studio pengembang mengelola proyek klien, Todo di dalam Sprint, tata kelola persetujuan status proyek & versi PRD, kontrak termin berbobot 100% & pencatatan invoice, kalender operasional teragregasi berzona waktu `Asia/Jakarta` (WIB), serta profil & direktori anggota tim.

---

## 🚀 Fitur Utama (Kanvas Terang, Kartu Header Seragam & Modul Inti)

Mengacu pada spesifikasi [`docs/prd.md`](../docs/prd.md), [`docs/design.md`](../docs/design.md), dan [`MASTER.md`](../docs/design-system/cira-pm/MASTER.md):

### 1. Autentikasi, Profil Pengguna, RBAC Dinamis & Direktori Tim
- **Autentikasi & Pemulihan Akun (`AuthBackdrop`)**: Halaman login (`/login`), lupa password (`/forgot-password`), atur ulang password token 30 menit (`/reset-password`), dan aktivasi akun undangan 24 jam (`/activate`) memakai latar kanvas tema terang (`--background`) berpola titik netral lembut aksesibel (`DotPattern` statis `text-foreground/15`) di belakang kartu formulir putih solid (`--card`).
- **Pemotongan Foto Profil 1:1 & Avatar Seragam (`AvatarCropDialog`, `UserAvatar`)**: Pengguna dapat memilih foto PNG/JPG/WebP (maksimal 2 MB), memposisikan & memperbesar potongan rasio `1:1` lewat mouse, sentuhan, atau keyboard pada dialog interaktif, serta menampilkan avatar lingkaran seragam dengan fallback inisial otomatis lintas halaman.
- **Profil Kontak Opsional & Direktori Tim (`/profile`, `/directory`)**: Pembaruan nama, email, WhatsApp (E.164 opsional/nullable), dan username Instagram (opsional/nullable) pada `ProfileForm` langsung menyinkronkan Direktori Tim dan query terkait; halaman `/directory` menyediakan pencarian/filter role, pengiriman undangan, dan pengaturan role/status akun oleh Owner.
- **Kelola Akses (`/access-policies`)**: Pengaturan capability matrix dinamis per role (`Owner`, `Developer`, `Operasional`) beserta histori audit perubahannya khusus Owner.

### 2. Todo per Sprint (`/projects/[id]?tab=sprints`)
- **Checklist Status Tunggal**: Setiap task hanya menggunakan dua status (`todo` dan `done`) dengan antarmuka daftar checklist (tanpa drag-and-drop Kanban), sekaligus banner pengingat status verifikasi DP proyek (`DpWarningBanner`).
- **Semua Todo di Sprint**: Todo wajib dibuat di Sprint planning atau aktif. Todo lama tanpa Sprint dipindahkan oleh migrasi ke Sprint planning.
- **Satu PIC per Todo**: PIC dipilih dari roster proyek. Template copas menyediakan PIC default untuk semua Todo dan pilihan PIC berbeda untuk tiap Todo.
- **PIC Opsional**: Setiap Todo dapat memiliki satu PIC dari roster. PIC dapat diatur saat membuat atau mengedit Sprint, tetapi tidak wajib untuk mengaktifkannya.

### 3. Tata Kelola Proyek, Sprint Lifecycle & Progres Kumulatif (`/projects`, `/projects/[id]`)
- **Tata Kelola Proyek & PRD Versioning (`?tab=prd`)**: Pengajuan & voting konsensus 100% perubahan status proyek (`lead` / `active` / `completed` / `cancelled`) beserta arbitrase final Owner (`StatusApprovalBanner`), manajemen roster voting, tautan repositori berlabel (`monorepo` / `separate`), editor PRD, arsip versi GZIP + *restore* versi, dan ekspor PDF PRD.
- **Daur Hidup Sprint (`?tab=sprints`)**: Pengelolaan sprint berurutan (`planning` ➔ `active` ➔ `completed`) dengan aturan maksimal satu sprint aktif per proyek.
- **Penutupan Sprint Atomik (`CloseSprintModal`)**: Menutup Sprint aktif yang masih memiliki Todo mewajibkan pengguna memilih Sprint planning lain sebagai tujuan setiap Todo yang belum selesai.
- **Progres Kumulatif Proyek (`CumulativeProgressBar`)**: Dihitung secara matematis berdasarkan rasio jumlah sprint selesai terhadap total seluruh sprint proyek ($\frac{\text{completedSprintCount}}{\text{totalSprintCount}} \times 100\%$, dibulatkan 1 desimal; bernilai $0\%$ bila total sprint 0).

### 4. Kontrak Termin 100%, Pemicu Termin & Penerbitan Invoice Manual (`/projects/[id]?tab=finance`)
- **Konfigurasi Kontrak & Termin 100% (`ContractConfigModal`)**: Form penyusunan nilai kontrak dan daftar termin berbobot total persis 100%; termin terakhir otomatis menyerap selisih pembulatan rupiah.
- **Pemicu Tunggal & Evaluasi Kesiapan Idempotent (`EditPaymentTermModal`, `UploadBastModal`)**: Setiap termin wajib memilih tepat satu pemicu: `date` (`YYYY-MM-DD` WIB), `sprint` (ambang `requiredCompletedSprints`), atau `manual`. Termin berstatus `planned` otomatis menjadi `ready` saat pemicu terpenuhi, atau dapat ditandai `ready` secara manual dengan lampiran BAST opsional.
- **Pencatatan Invoice Manual & Overdue WIB (`PaymentTermsTable`, `InvoicePdfModal`)**: Penerbitan invoice resmi dari termin `ready` mewajibkan pengisian `invoiceDueDate`, mengunci termin (`isLocked = true`), mendukung pratinjau/cetak dokumen PDF invoice, penandaan lunas manual (`invoiced` ➔ `paid`), dan penandaan status `Overdue` otomatis berdasarkan tanggal `Asia/Jakarta` (WIB).

### 5. Kalender Operasional Teragregasi & Agenda Manual (`/operations/calendar`)
- **Read-Aggregation Kalender WIB (`OperationalCalendarWorkspace`)**: Kalender bulanan Senin-pertama yang menggabungkan Sprint, Termin `Ready`, Invoice Jatuh Tempo / Overdue (`OverdueAlertStrip`), dan Agenda Manual (`OperationalEvent`: `client_demo`, `deployment`, `maintenance`, `meeting`).
- **Filter, Drawer & Deep Link (`CalendarHeaderControls`, `CalendarEventDrawer`)**: Filter rentang tanggal (maks 90 hari), sumber event, proyek, status proyek, serta toggle agenda dibatalkan; drawer detail menyediakan tautan navigasi langsung ke modul/proyek sumber.
- **Agenda Manual & Proteksi RBAC (`OperationalEventModal`, `CancelAgendaDialog`, `CalendarAccessDenied`)**: Pembuatan agenda mendukung mode terjadwal/all-day dengan `projectId` opsional, pembatalan soft-status (`cancelled`), log follow-up manual, dan proteksi akses berbasis `operations.calendar.read`.

### 6. Pemulihan Kanvas Terang, Floating Sidebar, & Kartu Header / Konten Seragam
- **Kanvas Terang (`--background`) & Palet Komponen Pra-Siklus-3**: `DashboardShell` dan `AuthBackdrop` kembali memakai kanvas tema terang tunggal (`--background` `#fbfcf8`) tanpa token `--canvas*` biru navy gelap maupun utilitas `.dark` / `dark:`, sementara sidebar desktop membulat sticky (`--sidebar`), laci navigasi seluler, tombol menu melayang seluler (`variant="secondary"`, `size-12`), dan seluruh kartu (`--card`) mempertahankan palet terang semula (`f8e5d05`).
- **Kartu Header Workspace Seragam (`PageHeaderCard` & `PageHeaderSkeleton`)**: Komponen bersama terisolasi di [`src/shared/components/PageHeaderCard.tsx`](src/shared/components/PageHeaderCard.tsx) menampilkan ikon (`bg-primary/15 text-foreground`), judul, badge ringkas opsional, deskripsi, dan tombol aksi utama pada kelima menu utama (`/projects`, `/operations/calendar`, `/directory`, `/profile`, `/access-policies`) tanpa mencampurkan input pencarian maupun kontrol filter ke dalam header.
- **Kartu Konten & Kontrol Terpisah (`bg-card`)**: Pencarian proyek, tab filter status, tabel/kartu proyek, serta paginasi (`/projects`), kontrol navigasi/rentang/filter kalender (`CalendarHeaderControls`), filter & tabel anggota (`/directory`), serta pemberitahuan, matrix role, riwayat, dan tombol *"Muat ulang policy"* (`/access-policies`) tetap dibungkus dalam kartu putih bertoken semantik dengan target sentuh seluler `>= 44px`.
- **Token Warna Semantik Terkunci (`globals.css`)**: Pemetaan komponen terdokumentasi di `globals.css` dan [`docs/styling-tokens.md`](docs/styling-tokens.md) memakai satu tema terang tunggal dengan token `--background`, `--card`, dan `--status-{success,warning,info,danger}-*`.

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
│   │   ├── tasks/                            # Todo checklist TODO/DONE dalam Sprint
│   │   ├── sprints/                          # Daur hidup sprint, tutup atomik & progres rasio sprint
│   │   ├── finance/                          # Kontrak termin 100%, pemicu tunggal, BAST, invoice PDF & pelunasan
│   │   ├── operations/                       # Kalender operasional WIB, filter 90 hari, agenda manual & reminder log
│   │   ├── activity/                         # Timeline riwayat aktivitas kronologis
│   │   └── assets/                           # Galeri aset desain & kompresi/upload langsung ke Cloudinary
│   ├── layouts/
│   │   ├── DashboardLayout/                  # DashboardShell (floating sticky sidebar & mobile drawer) + dashboard-shell.helpers.ts
│   │   └── navigation.config.ts              # Konfigurasi menu navigasi berbasis role & permission
│   └── shared/
│       ├── components/                       # PageHeaderCard.tsx, UserAvatar.tsx & state/ (Skeletons + PageHeaderSkeleton, EmptyState, GlobalStateProvider, LoadingAction, LocalizedComponentError)
│       ├── lib/                              # api-client.ts (Axios + CSRF + cookie credentials), business-date.ts (WIB)
│       ├── store/                            # workspace.store.ts
│       └── types/                            # api.types.ts, auth.types.ts
└── tests/                                    # Automated unit & contract tests (7 file, 21 tests)
    ├── cycle3-us1-navy-canvas-contrast.test.ts    # 3 tests — Pemulihan kanvas terang (--background), AuthBackdrop dot-pattern & palet f8e5d05
    ├── cycle3-us2-shared-page-header-card.test.ts # 2 tests — Shared PageHeaderCard terisolasi di 5 menu utama bebas kontrol filter/cari
    ├── cycle3-us3-content-card-controls.test.ts   # 3 tests — Pembungkusan kontrol pencarian/filter/paginasi/policy dalam bg-card, target >= 44px & warna f8e5d05
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

*Terverifikasi: `21 tests passing, 0 failing` across 7 test files; TypeScript & ESLint `0 errors`.*
