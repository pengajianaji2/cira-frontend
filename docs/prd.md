# PRD: Cira Project Management — Frontend Application (`pm-web`)
## Siklus Pengembangan Lanjutan (Target Features)

> Dokumen spesifikasi fungsional dan integrasi untuk aplikasi frontend di `./frontend`.
> Mengonsumsi layanan REST API dari backend `cira-pm-backend` di `/api/v1`.

---

## 1. Problem & Goals
Frontend `pm-web` membutuhkan pembaruan antarmuka dan penanganan data untuk mendukung:
1. **RBAC & Undangan Anggota**: Halaman aktivasi akun via token 24 jam dengan input kontak wajib (WhatsApp internasional & Instagram handle), halaman direktori tim dengan filter role/status, modal undangan anggota khusus Owner, serta client-side role guarding.
2. **Persetujuan Status Proyek & Versioning PRD**: Banner/modal pengajuan dan voting status proyek per roster (dengan tombol final decision Owner), pengelolaan tautan repositori berlabel (Monorepo / Terpisah), drawer riwayat versi PRD terkompresi GZIP dengan kemampuan restore instan.
3. **Sprint, Todo, & Progres Proyek**: Satu tab Sprint untuk siklus sprint dan checklist Todo. Semua Todo harus berada dalam Sprint; Sprint baru dapat dibuat manual atau dari template paste dan Todo dapat diberi PIC dari roster.
4. **Keuangan Bertingkat & Invoice PDF**: Tabel daftar termin berbobot total tepat 100%, modal trigger penyelesaian & unggah dokumen BAST, dan generator/preview invoice resmi PDF menggunakan `@react-pdf/renderer` dengan nomor otomatis `INV-YYYY-NNN/Tn`.

---

## 2. Personas & Hak Akses Frontend
- **Owner**: Akses ke seluruh menu, tombol undang anggota di Direktori, manajemen status/role akun, arbitrase status proyek, dan penerbitan invoice PDF.
- **Developer**: Akses ke proyek, PRD, board sprint & task kanban, kelola link repositori. Tombol undang anggota dan kelola keuangan disembunyikan/read-only.
- **Operasional**: Akses ke proyek, PRD, board kanban, roster status, kelola kontrak/termin, trigger BAST, dan invoice PDF.

---

## 3. User Stories & Acceptance Criteria (Frontend)

### US-1: RBAC, Aktivasi Anggota, & Direktori Tim
- **AC-F1-1 (Halaman Aktivasi)**: Given calon anggota membuka URL `/activate?token=...`, When form diisi nama, password, nomor WhatsApp (+62...), dan handle IG, Then tombol submit memanggil API aktivasi; jika sukses, memunculkan toast notifikasi dan mengarahkan otomatis ke dashboard `/projects`.
- **AC-F1-2 (Token Kadaluwarsa / Error)**: Given calon anggota membuka tautan dengan token tidak valid atau kedaluwarsa (>24 jam), When halaman aktivasi dimuat, Then halaman menampilkan banner alert merah jelas dan tombol kembali ke halaman login.
- **AC-F1-3 (Halaman Direktori Tim)**: Given pengguna aktif membuka menu `/directory`, When halaman dimuat, Then menampilkan tabel direktori tim dengan avatar, nama, email, WhatsApp (tautan wa.me), Instagram (tautan profil), badge role warna, dan badge status aktif/nonaktif.
- **AC-F1-4 (Modal Undang Anggota)**: Given pengguna dengan role `Owner` di halaman direktori, When mengklik tombol *"Undang Anggota"*, Then modal form terbuka untuk memasukkan email dan memilih role (`Developer` atau `Operasional`), serta mengirimkan permintaan undangan via API.
- **AC-F1-5 (Role Guard Navigasi)**: Given pengguna dengan role non-Owner, When membuka aplikasi, Then kontrol tindakan khusus Owner (tombol undang, ubah role) disembunyikan dari UI.

### US-2: Persetujuan Status Proyek, Repositori, & Riwayat PRD
- **AC-F2-1 (Banner Pengajuan Status)**: Given proyek memiliki permohonan status pending, When halaman detail proyek dibuka, Then tampil banner kartu persetujuan dengan daftar anggota roster, status voting mereka (Setuju / Menolak / Menunggu), dan tombol voting bagi pengguna yang berada di roster.
- **AC-F2-2 (Tombol Putusan Final Owner)**: Given permohonan status memiliki suara penolakan, When dilihat oleh Owner, Then muncul opsi tombol tindakan putusan akhir (*Approve Override* atau *Batalkan Pengajuan*).
- **AC-F2-3 (Drawer Riwayat Versi PRD)**: Given pengguna berada di tab PRD `/projects/[id]?tab=prd`, When mengklik tombol *"Riwayat Versi"*, Then drawer sisi kanan menampilkan kronologi versi PRD; saat tombol *"Restore"* pada salah satu versi diklik, isi versi lama dipulihkan ke editor dan disimpan sebagai versi terbaru.
- **AC-F2-4 (Pengelolaan Repositori)**: Given tab repositori pada detail proyek, When Owner atau Developer menambah link repositori berlabel (misal Frontend, Backend), Then tautan tersimpan dan ditampilkan sebagai kartu repositori interaktif.

### US-3: Sprint Lifecycle, Todo, & Progres
- **AC-F3-1 (Progress Meter)**: Tab Sprint menampilkan progres proyek berdasarkan `task selesai / seluruh task`; setiap task berbobot sama.
- **AC-F3-2 (Todo di Sprint)**: Seluruh Todo dapat dikelola dalam tab Sprint; Todo wajib terhubung ke Sprint dan URL lama `?tab=tasks` diarahkan ke tab Sprint.
- **AC-F3-3 (Buat Sprint Manual atau Template)**: Form Sprint menyediakan input manual dan Quick-Paste. Template divalidasi dan Todo ditampilkan sebagai preview sebelum disimpan.
- **AC-F3-4 (Simpan Atomik)**: Sprint dan Todo hasil template dibuat dalam satu operasi backend transaksional.
- **AC-F3-5 (Penutupan Sprint)**: Todo yang tersisa harus dialihkan ke Sprint planning lain sebelum Sprint ditutup.
- **AC-F3-6 (PIC Todo)**: Setiap Todo dapat memiliki maksimal satu PIC dari roster proyek. PIC opsional selama planning maupun Sprint aktif dan dapat diubah melalui dialog edit Sprint.

### US-4: Kontrak, Termin 100%, Trigger BAST, & Invoice PDF
- **AC-F4-1 (Validasi Persentase Termin 100%)**: Given modal pengaturan termin pembayaran proyek, When pengguna memasukkan persentase per termin, Then form secara realtime menghitung total persentase dan memvalidasi bahwa totalnya tepat `100.00%` sebelum tombol simpan dapat ditekan.
- **AC-F4-2 (Modal Trigger BAST)**: Given termin dengan trigger penyelesaian modul/sprint, When item selesai, pengguna dapat mengunggah dokumen bukti BAST (PDF/JPG/PNG) melalui modal upload dan menandai termin menjadi `Siap ditagih`.
- **AC-F4-3 (Preview & Download Invoice PDF)**: Given termin berstatus `Siap ditagih`, When Owner/Operasional menekan tombol *"Terbitkan Invoice"*, Then modal preview menampilkan dokumen invoice PDF resmi dengan penomoran otomatis `INV-YYYY-NNN/Tn`, rincian klien/perusahaan, dan tombol unduh/cetak.
