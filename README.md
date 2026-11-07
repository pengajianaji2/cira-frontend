# Cira Project Management (Frontend: `cira-pm-frontend`)

Platform dashboard web terpadu untuk tim agensi dan studio pengembang proyek klien (skala 3–5 orang) guna mengelola tata kelola persetujuan status proyek, PRD versioning kompresi GZIP, daur hidup sprint dengan story points Fibonacci matematis, serta rantai penagihan keuangan resmi: kontrak termin berbobot tepat 100%, trigger modul BAST, dan generator invoice PDF resmi.

---

## 🚀 Fitur Utama (MVP: US-1 s/d US-4)

Sistem telah menyelesaikan seluruh cakupan kebutuhan fungsional MVP sesuai dokumen spesifikasi [`docs/prd.md`](../docs/prd.md):

### 1. Autentikasi RBAC 3-Role & Direktori Tim (US-1)
- **Login Split-Screen Responsif:** Formulir masuk aman dengan validasi Zod (`loginSchema`), proteksi CSRF, dan persistensi sesi.
- **Aktivasi Token 24 Jam:** Pendaftaran anggota tim melalui token undangan 24 jam dengan input wajib WhatsApp standar internasional (`^\+?[1-9]\d{1,14}$`) dan profil Instagram.
- **Direktori Tim Terfilter:** Daftar anggota tim dengan filter role (`Owner`, `Developer`, `Operasional`) dan kontak langsung.

### 2. Tata Kelola Status Proyek, Voting Roster & PRD Versioning (US-2)
- **Persetujuan Status via Voting Roster:** Perubahan status proyek (`Lead`, `Active`, `Completed`, `Cancelled`) mewajibkan konsensus 100% dari roster tim atau arbitrase final Owner.
- **Tautan Repositori Berlabel:** Manajemen URL repositori proyek berlabel (`monorepo` vs `separate`) dengan otorisasi khusus Owner & Developer.
- **Riwayat Audit Append-Only:** Log histori audit perubahan proyek yang tidak dapat dimanipulasi.
- **PRD Versioning GZIP:** Riwayat snapshot spesifikasi PRD terkompresi GZIP yang dapat ditinjau dan dipulihkan (*restore*) tanpa menimpa histori audit masa lalu.

### 3. Sprint Lifecycle, Fibonacci Story Points, & Progres Kumulatif (US-3)
- **Daur Hidup Sprint Terurut:** Siklus sprint terstruktur (`planning` -> `active` -> `completed`) dengan aturan ketat 1 sprint aktif.
- **Story Points Fibonacci:** Penetapan bobot tugas berbasis deret Fibonacci murni `[1, 2, 3, 5, 8, 13]` dengan tepat 1 assignee per tugas.
- **Validasi Selesai Sprint:** Penolakan penyelesaian sprint jika masih terdapat task yang belum berstatus `Done`.
- **Progres Kumulatif Matematis:** Bar pengukur progres proyek dihitung secara matematis berdasarkan akumulasi story points sprint yang telah selesai terhadap total ruang lingkup yang disetujui.

### 4. Kontrak Termin 100%, Trigger BAST, & Invoice PDF Resmi (US-4)
- **Konfigurasi Kontrak & Termin 100%:** Form interaktif penyusunan termin dengan validasi total tepat 100%. Baris termin terakhir secara otomatis menyerap selisih pembulatan rupiah (*rounding discrepancy absorption*).
- **Trigger Penyelesaian & Bukti BAST:** Dukungan trigger Tanggal, Modul/Sprint, dan Manual. Khusus trigger sprint, sistem memvalidasi bahwa sprint terkait wajib berstatus `completed` sebelum dokumen BAST (PDF/JPG/PNG) dapat diunggah untuk mengubah status termin ke `Siap ditagih`.
- **Penerbitan Invoice PDF Resmi:** Pembuatan invoice bernomor seri unik otomatis `INV-YYYY-NNN/Tn` (misal `INV-2026-001/T1`), mengunci termin secara permanen (`isLocked = true`) dari perubahan, serta pratinjau dokumen dan pencetakan/unduh langsung via browser.
- **Proteksi RBAC Finansial:** Akses kelola termin dan invoice dibatasi hanya untuk role `Owner` dan `Operasional`.

---

## 🛠️ Tech Stack & Primitives

- **Framework:** Next.js 16.4.5 (App Router, React 19)
- **Bahasa:** TypeScript 5+ (Strict Mode)
- **Styling:** Tailwind CSS v4, PostCSS, tw-animate-css
- **Design System & Komponen:** Radix UI, Base UI, shadcn/ui (`radix-maia` style)
- **Ikonografi:** Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Server State & Caching:** TanStack React Query v5
- **Client State:** Zustand v5
- **Tabel & Data Grid:** TanStack Table v9
- **Form & Validasi:** React Hook Form + Zod
- **Notifikasi Toast:** Sonner
- **Markdown & PDF:** `react-markdown`, `@react-pdf/renderer`
- **Manipulasi Gambar:** `browser-image-compression`
- **Tanggal & Waktu:** `date-fns` (dengan locale `id`)

---

## 📁 Struktur Direktori (Feature-based Modular)

Mengikuti arsitektur 5 layer ketat (`types` ➔ `api` ➔ `queries` ➔ `components` ➔ `page`):

```text
frontend/
├── src/
│   ├── app/                          # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/                   # Halaman autentikasi (/login, /activate)
│   │   ├── (dashboard)/              # Halaman operasional (/projects, /projects/[id])
│   │   ├── globals.css               # Definisi theme tokens Tailwind v4
│   │   └── layout.tsx                # Root layout & providers
│   ├── components/
│   │   └── ui/                       # Primitives UI reusable (Button, Dialog, Badge, Card, dll.)
│   ├── features/                     # Modul fitur mandiri (Encapsulated)
│   │   ├── auth/                     # Autentikasi tim, token aktivasi & profil
│   │   ├── projects/                 # Pipeline proyek, voting roster, repo links & PRD versioning
│   │   ├── tasks/                    # Kanban board, story points & DP banner
│   │   ├── sprints/                  # Daur hidup sprint & progres kumulatif
│   │   ├── finance/                  # Kontrak termin 100%, upload BAST & invoice PDF
│   │   ├── activity/                 # Timeline audit log kronologis
│   │   ├── assets/                   # Galeri aset & kompresi gambar
│   │   └── [feature]/index.ts        # Public API modul
│   ├── layouts/
│   │   ├── DashboardLayout/          # Komponen layout dashboard terpadu
│   │   └── navigation.config.ts      # Konfigurasi menu navigasi terpusat
│   └── shared/                       # Helper, lib instance (apiClient), & types lintas modul
```

---

## 💻 Panduan Menjalankan Frontend

### 1. Prasyarat Sistem
- Node.js versi 20+ (disarankan Node.js 20 LTS atau 22+)
- Package manager: `npm`

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

### 5. Verifikasi Kualitas
```bash
# Typecheck
npx tsc -p tsconfig.json --noEmit

# Lint
npm run lint
```
*Hasil Verifikasi: 0 Error, 0 Warning.*
