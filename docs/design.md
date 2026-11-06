# Design: Cira Project Management — Frontend Application (`pm-web`)

> Dokumen spesifikasi desain antarmuka khusus `./frontend`.
> Mengacu pada Design System Master di `docs/design-system/cira-pm/MASTER.md`.
> Komponen UI berbasis Tailwind CSS v4, shadcn/ui (`radix-maia`), Hugeicons, dan Inter font.

---

## 1. Halaman: Aktivasi Akun Tim (`/activate?token=...`)
- **Jejak**: US-1, AC-F1-1, AC-F1-2
- **Tujuan Halaman**: Memfasilitasi calon anggota tim menyelesaikan aktivasi akun dan mengisi data kontak wajib (WhatsApp format internasional & handle Instagram) via token 24 jam.
- **Layout**: Single Card terpusat secara vertikal dan horizontal di tengah layar (*Auth Shell Centered*).
- **Elemen Utama**:
  - Header: Logo Cira PM, judul *"Aktivasi Akun Tim"*, badge email undangan yang sedang diaktivasi.
  - Form Fields: Nama Lengkap, Nomor WhatsApp Internasional (`+62...`), Username Instagram (`@...`), Password Baru, Konfirmasi Password.
  - Tombol: *"Aktifkan Akun & Masuk"* (Primary button full-width).
- **State**:
  - *Kosong*: Form terbuka dengan field bersih, placeholder jelas, email undangan read-only.
  - *Loading*: Tombol submit disable dengan spinner pemrosesan, input terkunci.
  - *Error*: Banner merah jika token kedaluwarsa (>24 jam) atau token tidak valid; error teks di bawah field jika validasi Zod gagal.
  - *Sukses*: Toast Sonner berhasil dan otomatis diarahkan (*redirect*) ke dashboard `/projects`.
- **Device Priority & Style**: Mobile & Desktop friendly / Clean Minimal.

---

## 2. Halaman: Direktori Tim & Pengelolaan Anggota (`/directory`)
- **Jejak**: US-1, AC-F1-3, AC-F1-4, AC-F1-5
- **Tujuan Halaman**: Menampilkan daftar anggota tim (aktif & nonaktif) serta menyediakan portal bagi Owner untuk mengundang anggota dan mengelola status akun.
- **Layout**:
  - Header: Judul halaman *"Direktori Tim"*, counter total anggota aktif & nonaktif, dan tombol *"Undang Anggota"* (hanya tampil untuk role `Owner`).
  - Filter Bar: Pencarian nama/email, dropdown filter Role (`Semua`, `Owner`, `Developer`, `Operasional`), dan filter Status (`Semua`, `Aktif`, `Nonaktif`).
  - Main Section: Tabel data anggota tim (*TanStack Table*).
- **Elemen Utama**:
  - Kolom Tabel: Avatar + Nama Lengkap + Email, WhatsApp (badge tautan wa.me), Instagram (badge profil), Role (Badge warna), Status (Badge Hijau Aktif / Abu-abu Nonaktif), Aksi (Dropdown Owner: Ubah Role, Nonaktifkan Akun / Aktifkan Kembali).
  - Modal Undang Anggota: Email calon anggota, Pilihan Radio/Select Role (`Developer` atau `Operasional`), tombol *"Kirim Undangan (24 Jam)"*.
- **State**:
  - *Kosong*: State *"Tidak ada anggota tim yang cocok dengan filter"*.
  - *Loading*: Skeleton shimmer rows pada tabel.
  - *Error*: Alert error koneksi dengan tombol *"Muat Ulang"*.
  - *Sukses*: Tabel anggota tampil lengkap dengan aksi dan paginasi.
- **Device Priority & Style**: Desktop-first / Dense Admin Table.

---

## 3. Detail Proyek: Tab Status, Persetujuan Roster, & Repositori (`/projects/[id]`)
- **Jejak**: US-2, AC-F2-1, AC-F2-2, AC-F2-4
- **Tujuan Halaman**: Mengontrol perubahan status proyek via voting roster tim (dengan putusan final Owner jika ada tolak) dan mengelola tautan repositori berlabel.
- **Layout**:
  - Header: Judul Proyek, Klien, Badge Status (`lead`, `active`, `completed`, `cancelled`), Tombol *"Ajukan Perubahan Status"*.
  - Banner Persetujuan Status (jika ada permohonan pending): Kartu status target, pemohon, daftar anggota roster beserta status suaranya, tombol voting bagi anggota roster, serta tombol *"Putusan Final Owner"* jika ada penolakan.
  - Section Repositori: Switcher tipe (`Monorepo` vs `Repo terpisah`), daftar kartu repositori berlabel (misal: *Frontend*, *Backend*, *Mobile API*), tombol *"Tambah Repositori"*.
- **Device Priority & Style**: Desktop-first / Dense Admin.

---

## 4. Detail Proyek: Tab PRD Editor & Riwayat Versi GZIP (`/projects/[id]?tab=prd`)
- **Jejak**: US-2, AC-F2-3
- **Tujuan Halaman**: Editor dokumen spesifikasi PRD Markdown dengan drawer riwayat versi terkompresi GZIP dan kemampuan restore versi lama.
- **Layout**:
  - Toolbar Atas: Indikator status penyimpanan (*Tersimpan* / *Ada perubahan*), tombol *"Simpan Versi Baru"*, dan tombol *"Riwayat Versi"* (Drawer kanan).
  - Main Editor: Split-pane editor (input markdown di kiri, preview rendered di kanan).
  - Drawer Riwayat Versi: Daftar kronologis versi PRD (Nomor versi, tanggal simpan, penyimpan, ukuran GZIP), tombol *"Pulihkan Versi Ini (Restore)"*.
- **Device Priority & Style**: Desktop-first / Split-Pane Editor.

---

## 5. Detail Proyek: Tab Sprint, Task Points, & Progres Kumulatif (`/projects/[id]?tab=tasks`)
- **Jejak**: US-3, AC-F3-1, AC-F3-2, AC-F3-3
- **Tujuan Halaman**: Mengelola sprint (tanpa tumpang tindih), Kanban board task dengan points Fibonacci (`1, 2, 3, 5, 8, 13`) dan single assignee, serta visualisasi progres kumulatif proyek terbobot.
- **Layout**:
  - Top Meter: Progress Bar Kumulatif Proyek, persentase kemajuan $\left(\frac{\text{Poin Selesai}}{\text{Total Scope}} \times 100\%\right)$, ringkasan poin selesai vs total.
  - Sprint Header: Dropdown sprint aktif/backlog, tanggal mulai/selesai, tombol *"Mulai Sprint"*, tombol *"Selesaikan Sprint"*, tombol *"Buat Sprint Baru"*.
  - Kanban Board: 3 kolom status (`Todo`, `In Progress`, `Done`) drag-and-drop.
  - Kartu Task: Judul, badge story points (lingkaran angka), avatar assignee tunggal, label prioritas.
  - Dialog Selesaikan Sprint: Validasi otomatis seluruh task berstatus `Done`.
- **Device Priority & Style**: Desktop-first / Dense Kanban Board.

---

## 6. Detail Proyek: Tab Finansial: Kontrak, Termin 100%, & Invoice PDF (`/projects/[id]?tab=finance`)
- **Jejak**: US-4, AC-F4-1, AC-F4-2, AC-F4-3
- **Tujuan Halaman**: Mengatur kontrak proyek dan daftar termin bertotal 100% (penyerapan selisih pembulatan), trigger termin modul/BAST, dan penerbitan invoice resmi PDF.
- **Layout**:
  - Header Kontrak: Nilai total kontrak, status kontrak (`Active` / `Completed`), tombol kelola kontrak (Owner/Ops).
  - Tabel Termin Pembayaran: Kolom Urutan/Nama Termin, Persentase (wajib total 100%), Nominal (penyerapan pembulatan otomatis), Tipe Trigger, Dokumen BAST, Status Termin, Tombol Aksi.
  - Modal Trigger & Upload BAST: Form upload dokumen bukti BAST untuk mengaktifkan status `Siap ditagih`.
  - Modal Invoice PDF: Pratinjau dokumen PDF invoice bernomor otomatis `INV-YYYY-NNN/Tn` dengan data profil perusahaan dan klien proyek.
- **Device Priority & Style**: Desktop-first / Dense Financial Table & PDF Preview.
