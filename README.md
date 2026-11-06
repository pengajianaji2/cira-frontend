# Cira Project Management (Frontend: pm-web)

Platform dashboard web terpadu untuk tim agensi dan studio pengembang proyek klien (skala 3–5 orang) guna mengelola pipeline penawaran proyek, editor PRD standar berbasis Markdown, papan Kanban tugas, pencatatan termin keuangan & bukti transfer, serta transparansi riwayat aktivitas (*audit log*).

Aplikasi ini dibangun untuk mengatasi risiko operasional dan *context switching* ekstrem, memastikan pengerjaan tugas teknis tidak mendahului kepastian pembayaran uang muka (DP) klien.

---

## 🚀 Fitur Utama (MVP: US-1 s/d US-4)

Sistem telah menyelesaikan seluruh cakupan kebutuhan fungsional MVP sesuai dokumen spesifikasi [`docs/prd.md`](../docs/prd.md):

### 1. Autentikasi & Ruang Kerja Tim (US-1)
- **Login Split-Screen Responsif:** Formulir masuk aman dengan validasi Zod (`loginSchema`), animasi transisi modern, dan ilustrasi *creative studio*.
- **Auth Store Terisolasi:** Manajemen sesi dan identitas pengguna berbasis Zustand store dengan persistensi lokal browser.
- **Shell Layout Dashboard:** Navigasi sidebar terpadu, info avatar pengguna, *breadcrumbs*, dan kompatibilitas tampilan desktop maupun mobile.

### 2. Pipeline Proyek & Editor PRD Resmi (US-2)
- **Manajemen Status Pipeline:** Pengelolaan siklus hidup proyek (`Lead`, `Active`, `Completed`, `Cancelled`) dengan filter tab interaktif dan modal pembuatan proyek baru.
- **Split-Pane PRD Markdown Editor:** Penyusunan dokumen kebutuhan produk (*Product Requirements Document*) berbasis Markdown dengan *live preview* tersinkronisasi.
- **Ekspor Dokumen PDF Resmi:** Fitur generate dan unduh dokumen resmi PRD bersurat standar profesional langsung dari browser menggunakan `@react-pdf/renderer`.

### 3. Papan Kanban Tugas & Galeri Aset Desain (US-3)
- **Task Kanban Board Drag-and-Drop:** Manajemen kolom status tugas (`To Do`, `In Progress`, `Done`) interaktif menggunakan `@dnd-kit/core` & `@dnd-kit/sortable` dengan pengelompokan prioritas (*Low*, *Medium*, *High*, *Urgent*).
- **Banner Deteksi Proteksi DP (DP Guard Banner):** Sistem peringatan dini otomatis di atas papan Kanban jika proyek berstatus `Active` belum memiliki pembayaran termin dengan status `Verified`.
- **Kompresi Gambar Otomatis di Browser:** Upload aset desain wireframe/mockup dengan kompresi ukuran otomatis di sisi klien via `browser-image-compression` (menjaga batas file < 2 MB).

### 4. Manajemen Keuangan, Bukti Transfer & Riwayat Aktivitas (US-4)
- **Ringkasan Finansial Proyek:** 4 kartu metrik utama (**Total Nilai Kontrak**, **Total Terverifikasi**, **Menunggu Verifikasi**, **Sisa Tagihan**) dan indikator persentase pelunasan.
- **Daftar Termin Pembayaran (Milestone):** Pencatatan termin (DP, progres, pelunasan) dengan status default `Pending` dan fitur penyesuaian nilai kontrak resmi.
- **Lightbox Bukti Transfer & Verifikasi:** Unggah bukti pembayaran dan pratinjau bukti bayar digital beresolusi tinggi. Verifikasi pembayaran oleh Owner secara otomatis mengubah badge menjadi `Verified` dan menonaktifkan peringatan banner DP di Task Board.
- **Riwayat Aktivitas Kronologis (Audit Log):** Pencatatan otomatis setiap aksi penting sistem (proyek, termin keuangan, task board, dan upload aset) dengan filter kategori dan waktu relatif bahasa Indonesia.

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
│   │   ├── (auth)/                   # Halaman autentikasi (/login)
│   │   ├── (dashboard)/              # Halaman operasional (/projects, /projects/[id])
│   │   ├── globals.css               # Definisi theme tokens Tailwind v4
│   │   └── layout.tsx                # Root layout & providers
│   ├── components/
│   │   └── ui/                       # Primitives UI reusable (Button, Dialog, Badge, Card, dll.)
│   ├── features/                     # Modul fitur mandiri (Encapsulated)
│   │   ├── auth/                     # Autentikasi tim & profil
│   │   ├── projects/                 # Pipeline proyek & editor PRD
│   │   ├── tasks/                    # Kanban board & DP banner
│   │   ├── assets/                   # Galeri aset & kompresi gambar
│   │   ├── finance/                  # Termin pembayaran & verifikasi transfer
│   │   ├── activity/                 # Timeline audit log kronologis
│   │   └── [feature]/index.ts        # SATU-SATUNYA Public API modul
│   ├── layouts/
│   │   ├── DashboardLayout/          # Komponen layout dashboard terpadu
│   │   └── navigation.config.ts      # Konfigurasi menu navigasi terpusat
│   └── shared/                       # Helper, lib instance, & types lintas modul
```

---

## 💻 Panduan Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Node.js versi 20+ (disarankan Node.js 20 LTS atau 22+)
- Package manager: `npm`

### 2. Instalasi Dependensi
```bash
cd frontend
npm install
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

Kredensial simulasi login:
- **Email:** `ivan@cira.id`
- **Password:** `password123`

### 4. Build Produksi & Type-Checking
```bash
# Verifikasi tipe data TypeScript:
npx tsc --noEmit

# Pengecekan kualitas kode & linting:
npm run lint

# Kompilasi build produksi Next.js:
npm run build
# Catatan: Jika build default Turbopack mengalami hambatan IPC socket di lingkungan Windows tertentu, gunakan opsi Webpack:
# npx next build --webpack
```

---

## 🔒 Konvensi Git & Kontribusi

- **Main Branch Protection:** Branch `main` harus selalu steril, bebas eror, dan siap rilis. Seluruh penambahan fitur dan perbaikan dilakukan melalui branch terpisah (`feat/...` atau `fix/...`).
- **Format Commit:** Mengikuti standar [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(...)`: Penambahan fungsionalitas fitur baru.
  - `fix(...)`: Perbaikan bug atau optimasi kode.
  - `chore(...)`: Konfigurasi dependensi, build, atau berkas gitignore.
  - `docs(...)`: Pembaruan dokumentasi atau spesifikasi.
- **Eksekusi Git:** Seluruh aksi commit, push, dan merge selalu dieksekusi secara sadar oleh manusia di terminal.

---

© 2026 Cira Creative Studio. All Rights Reserved.
