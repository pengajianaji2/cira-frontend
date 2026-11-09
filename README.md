# Cira Project Management — Frontend Web (`cira-pm-frontend`)

Dashboard web terpadu berbasis **Next.js App Router** untuk tim agensi/studio pengembang mengelola proyek klien, checklist task & backlog, daur hidup sprint, tata kelola persetujuan status proyek & versi PRD, kontrak termin berbobot 100% & pencatatan invoice, serta kalender operasional teragregasi berzona waktu `Asia/Jakarta` (WIB).

---

## 🚀 Fitur Utama (US-1 s.d. US-4 & Fondasi Workspace)

Mengacu pada spesifikasi [`docs/prd.md`](../docs/prd.md):

### 1. Autentikasi, RBAC Dinamis & Direktori Tim
- **Autentikasi & Pemulihan Akun**: Halaman login (`/login`), lupa password (`/forgot-password`), atur ulang password token 30 menit (`/reset-password`), aktivasi akun undangan 24 jam dengan kontak WhatsApp/Instagram (`/activate`), serta pengaturan profil & foto avatar (`/profile`).
- **Direktori Tim (`/directory`)**: Daftar anggota tim beserta kontak WhatsApp/Instagram, pencarian/filter role, pengiriman undangan anggota baru, serta pengelolaan role & status akun oleh Owner.
- **Kelola Akses (`/access-policies`)**: Pengaturan capability matrix dinamis per role (`Owner`, `Developer`, `Operasional`) beserta histori audit perubahannya khusus Owner.

### 2. US-1: Task Checklist TODO/DONE & Manajemen Backlog (`/projects/[id]?tab=tasks`)
- **Checklist Status Tunggal**: Setiap task hanya menggunakan dua status (`todo` dan `done`) dengan antarmuka daftar checklist (tanpa drag-and-drop Kanban), sekaligus banner pengingat status verifikasi DP proyek (`DpWarningBanner`).
- **Default Backlog**: Task baru otomatis masuk ke Backlog proyek (`sprintId = null`) bila pengguna tidak memilih sprint secara eksplisit.
- **Konfirmasi Pindah ke Sprint Aktif**: Memindahkan task dari Backlog/sprint lain ke Sprint yang sedang berstatus `active` wajib melewati dialog konfirmasi (`MoveToActiveSprintDialog`).

### 3. US-2: Tata Kelola Proyek, Sprint Lifecycle & Progres Kumulatif (`/projects`, `/projects/[id]`)
- **Tata Kelola Proyek & PRD Versioning (`?tab=prd`)**: Pengajuan & voting konsensus 100% perubahan status proyek (`lead` / `active` / `completed` / `cancelled`) beserta arbitrase final Owner (`StatusApprovalBanner`), manajemen roster voting, tautan repositori berlabel (`monorepo` / `separate`), editor PRD, arsip versi GZIP + *restore* versi, dan ekspor PDF PRD.
- **Daur Hidup Sprint (`?tab=sprints`)**: Pengelolaan sprint berurutan (`planning` ➔ `active` ➔ `completed`) dengan aturan maksimal satu sprint aktif per proyek.
- **Penutupan Sprint Atomik (`CloseSprintModal`)**: Menutup sprint aktif yang masih memiliki task `todo` mewajibkan pengguna menentukan tujuan pemindahan setiap task (ke Backlog `sprintId = null` atau sprint non-completed lain dalam proyek yang sama).
- **Progres Kumulatif Proyek (`CumulativeProgressBar`)**: Dihitung secara matematis berdasarkan rasio jumlah sprint selesai terhadap total seluruh sprint proyek ($\frac{\text{completedSprintCount}}{\text{totalSprintCount}} \times 100\%$, dibulatkan 1 desimal; bernilai $0\%$ bila total sprint 0).

### 4. US-3: Kontrak Termin 100%, Pemicu Termin & Penerbitan Invoice Manual (`/projects/[id]?tab=finance`)
- **Konfigurasi Kontrak & Termin 100% (`ContractConfigModal`)**: Form penyusunan nilai kontrak dan daftar termin berbobot total persis 100%; termin terakhir otomatis menyerap selisih pembulatan rupiah.
- **Pemicu Tunggal & Evaluasi Kesiapan Idempotent (`EditPaymentTermModal`, `UploadBastModal`)**: Setiap termin wajib memilih tepat satu pemicu: `date` (`YYYY-MM-DD` WIB), `sprint` (ambang `requiredCompletedSprints`), atau `manual`. Termin berstatus `planned` otomatis menjadi `ready` saat pemicu terpenuhi, atau dapat ditandai `ready` secara manual dengan lampiran BAST opsional.
- **Pencatatan Invoice Manual & Overdue WIB (`PaymentTermsTable`, `InvoicePdfModal`)**: Penerbitan invoice resmi dari termin `ready` mewajibkan pengisian `invoiceDueDate`, mengunci termin (`isLocked = true`), mendukung pratinjau/cetak dokumen PDF invoice, penandaan lunas manual (`invoiced` ➔ `paid`), dan penandaan status `Overdue` otomatis berdasarkan tanggal `Asia/Jakarta` (WIB).

### 5. US-4: Kalender Operasional Teragregasi & Agenda Manual (`/operations/calendar`)
- **Read-Aggregation Kalender WIB (`OperationalCalendarWorkspace`)**: Kalender bulanan Senin-pertama yang menggabungkan Sprint, Termin `Ready`, Invoice Jatuh Tempo / Overdue (`OverdueAlertStrip`), dan Agenda Manual (`OperationalEvent`: `client_demo`, `deployment`, `maintenance`, `meeting`).
- **Filter, Drawer & Deep Link (`CalendarHeaderControls`, `CalendarEventDrawer`)**: Filter rentang tanggal (maks 90 hari), sumber event, proyek, status proyek, serta toggle agenda dibatalkan; drawer detail menyediakan tautan navigasi langsung ke modul/proyek sumber.
- **Agenda Manual Tanpa Gateway Otomatis (`OperationalEventModal`, `CancelAgendaDialog`)**: Pembuatan agenda mendukung mode terjadwal/all-day dengan `projectId` opsional (lintas agensi maupun spesifik proyek), pembatalan soft-status (`cancelled`), dan pencatatan tindak lanjut (follow-up) manual.
- **Proteksi Akses RBAC**: Pengguna yang tidak memiliki permission `operations.calendar.read` (misal `Developer`) ditolak oleh middleware/backend dan diarahkan ke tampilan `CalendarAccessDenied`.

---

## 🛠️ Tech Stack & Primitives

- **Framework:** Next.js `16.4.5` (App Router), React `19.3.0`
- **Bahasa:** TypeScript `5+`
- **Styling:** Tailwind CSS `v4`, PostCSS, `tw-animate-css`
- **Design System & Primitives UI:** Radix UI (`radix-ui`), Base UI (`@base-ui/react`), shadcn/ui
- **Ikonografi:** Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Server State & Caching:** TanStack React Query `v5` (`@tanstack/react-query`)
- **Client State:** Zustand `v5`
- **Tabel & Data Grid:** TanStack Table `v9`
- **Form & Validasi:** React Hook Form + `@hookform/resolvers` + Zod `v4`
- **Notifikasi Toast:** Sonner
- **Markdown, Chart & PDF:** `react-markdown`, `recharts`, `@react-pdf/renderer`, `react-to-print`
- **Manipulasi Gambar & Tanggal:** `browser-image-compression`, `date-fns`

---

## 📁 Struktur Direktori (`src/`)

Mengikuti arsitektur modular berbasis fitur (`types` ➔ `api` ➔ `queries` ➔ `components` ➔ `page`):

```text
frontend/src/
├── app/                                  # Next.js App Router Pages & Layouts
│   ├── (auth)/                           # /login, /activate, /forgot-password, /reset-password
│   ├── (dashboard)/                      # /projects, /projects/[id], /operations/calendar, /directory, /profile, /access-policies
│   ├── providers/                        # Root client providers (QueryClient, Theme, Toaster)
│   ├── globals.css & tw-animate.css      # Theme tokens & styling utilitas Tailwind v4
│   └── layout.tsx & global-error.tsx
├── components/
│   └── ui/                               # Primitives UI reusable (Button, Dialog, AlertDialog, Table, Badge, dll.)
├── features/                             # Modul fitur mandiri (Encapsulated per domain)
│   ├── auth/                             # Login, aktivasi token 24j, ubah password, profil & store permission
│   ├── directory/                        # Tabel direktori tim, undangan anggota & ubah role/status
│   ├── projects/                         # Pipeline proyek, voting roster, repo links & editor/arsip PRD GZIP
│   ├── tasks/                            # Task checklist TODO/DONE, Backlog & dialog pindah ke sprint aktif
│   ├── sprints/                          # Daur hidup sprint, tutup atomik & progres rasio sprint
│   ├── finance/                          # Kontrak termin 100%, pemicu tunggal, BAST, invoice PDF & pelunasan
│   ├── operations/                       # Kalender operasional WIB, filter 90 hari, agenda manual & reminder log
│   ├── activity/                         # Timeline riwayat aktivitas kronologis
│   └── assets/                           # Galeri aset desain & kompresi gambar
├── layouts/
│   ├── DashboardLayout/                  # Shell layout sidebar & topbar terpadu
│   └── navigation.config.ts              # Konfigurasi menu navigasi berbasis permission
└── shared/
    ├── components/state/                 # Skeletons, EmptyState, GlobalStateProvider, LoadingAction, LocalizedComponentError
    ├── lib/                              # api-client.ts (Axios + CSRF + cookie credentials), business-date.ts (WIB)
    ├── store/                            # workspace.store.ts
    └── types/                            # api.types.ts, auth.types.ts
```

---

## 💻 Panduan Menjalankan Frontend

### 1. Prasyarat Sistem
- Node.js versi 20 atau lebih baru
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

### 5. Verifikasi Kualitas Kode
```bash
# Typecheck TypeScript
npx tsc -p tsconfig.json --noEmit

# Linting ESLint
npm run lint

# Build Produksi Next.js
npm run build
```
