# Styling Tokens

Warna aplikasi dikelola di `src/app/globals.css`. Token dibagi menjadi tiga lapisan:

1. **Token semantik** untuk warna yang memang berlaku lintas halaman, seperti `--background`, `--foreground`, dan `--primary`.
2. **Alias primitive komponen** untuk button, badge, card, dan input. Nilai defaultnya mengacu ke token semantik, tetapi dapat diubah tanpa mengubah komponen lain.
3. **Token domain** untuk status proyek, prioritas task, dan peringatan DP. Setiap status memiliki warna latar, teks, dan border sendiri.

| Bagian UI | Token utama |
|---|---|
| Kanvas luar (workspace & auth) | `--canvas`, `--canvas-dot` |
| Teks di luar kartu (atas kanvas) | `--canvas-foreground`, `--canvas-muted` |
| Tombol utama | `--button-primary`, `--button-primary-foreground`, `--button-primary-hover` |
| Badge default | `--badge-default`, `--badge-default-foreground` |
| Card | `--card-surface`, `--card-content` |
| Input | `--input-surface`, `--input-border` |
| Status proyek | `--project-status-{lead,active,completed,cancelled}-{bg,fg,border}` |
| Prioritas task | `--task-priority-{urgent,high,medium,low}-{bg,text,border}` |
| Banner DP | `--notice-dp-{bg,text,border}` |
| Status lintas fitur | `--status-{success,warning,info,danger}-{surface,text,border}` |

Aturan perubahan:

- Ubah token komponen jika hanya satu primitive/varian yang perlu berubah.
- Ubah token semantik jika perubahan memang diinginkan untuk semua pemakai peran semantik itu.
- Gunakan `--canvas` (biru navy gelap) untuk kanvas luar `DashboardShell` dan `AuthBackdrop`, sambil menjaga `--card`, `--sidebar`, dan `--background` tetap putih/terang agar sidebar dan seluruh kartu tampak mengambang.
- Seluruh teks/tautan yang menempel langsung di atas `--canvas` wajib memakai `--canvas-foreground` atau `--canvas-muted`; kontrol pencarian, filter, dan paginasi tetap dibungkus ke dalam kartu putih (`bg-card`).
- Dilarang memakai `--primary` (`text-primary`) sebagai warna teks di atas kartu putih; gunakan `--foreground` atau `--accent-foreground`.
- Pertahankan satu tema terang konsisten pada `:root` tanpa menambahkan varian `.dark`.
- Hindari warna literal atau kelas palette langsung untuk komponen yang sudah memiliki token domain.
- Status tidak boleh dibedakan lewat warna saja; label teks tetap ditampilkan.
- Verifikasi kontras teks, hover, focus, disabled, dan konsistensi kanvas tema terang saat menambah atau mengganti token.
