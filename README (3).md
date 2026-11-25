# CariBarang.ID

Aplikasi web untuk melaporkan dan mencari barang hilang maupun barang temuan. Dibuat sebagai tugas akhir **Pelatihan TIK Bagi Murid (LATIKA) Provinsi Jawa Timur Tahun 2026**.

**Demo:** https://tgbudi12-coder.github.io/caribarang-id/

---

## Latar Belakang

Barang yang tertinggal di sekolah atau tempat umum sering sulit kembali ke pemiliknya karena informasinya tidak tersebar. CariBarang.ID menyediakan satu tempat bagi pemilik untuk melaporkan kehilangan dan bagi penemu untuk melaporkan barang yang ditemukan. Semua laporan tersimpan di server, sehingga bisa dilihat oleh siapa pun yang membuka website.

## Fitur

- **Buat laporan** barang hilang atau barang temuan: nama barang, kategori, lokasi, tanggal, ciri-ciri, foto, serta nama dan kontak pelapor.
- **Daftar laporan** terbaru beserta foto.
- **Pencarian** berdasarkan nama barang, kategori, atau lokasi.
- **Filter status**: Semua, Hilang, Temuan, dan Selesai.
- **Halaman detail** untuk setiap laporan, dengan tombol salin tautan.
- **Hubungi pelapor** langsung lewat WhatsApp atau email.
- **Kelola laporan**: tandai selesai, buka kembali, atau hapus.
- **Validasi form**: kolom wajib, format kontak, dan tanggal tidak boleh di masa depan.
- **Foto otomatis diperkecil** di browser sebelum dikirim, supaya ukuran data tidak besar.
- **Mode offline**: jika server tidak bisa dihubungi, laporan disimpan sementara di browser.
- **Responsif** di HP maupun laptop.

## Arsitektur

Proyek ini memakai arsitektur hybrid: tampilan di GitHub Pages, data di server sendiri.

```
Browser
   │
   ▼
GitHub Pages  (HTML, CSS, JavaScript)
   │  fetch() ke API
   ▼
Cloudflare Tunnel
   │
   ▼
Server Ubuntu (LEMP: Nginx + PHP)  ──  api.php
   │
   ▼
Database MySQL
```

GitHub Pages hanya bisa menayangkan file statis. Jika hanya memakai GitHub Pages, data laporan hanya tersimpan di browser masing-masing pengguna dan tidak bisa dilihat orang lain. Karena itu data disimpan di database MySQL pada server terpisah, dan website mengambilnya lewat API.

Jika server tidak aktif, website tetap bisa dibuka dan beralih ke mode offline (data di `localStorage`). Status server ditampilkan di bagian atas halaman.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Tampilan | HTML5, CSS3 (font Schibsted Grotesk) |
| Logika halaman | JavaScript (tanpa framework) |
| Backend API | PHP (`api.php`) |
| Database | MySQL |
| Web server | Nginx di Ubuntu (LEMP) |
| Koneksi ke server | Cloudflare Tunnel |
| Hosting website | GitHub Pages |

## Struktur Repositori

```
caribarang-id/
├── index.html              # Struktur halaman
├── style.css               # Tampilan
├── script.js               # Logika halaman dan komunikasi dengan API
├── dompetkulitcoklat.jpg   # Foto contoh data
├── images-(1).jfif         # Foto contoh data
├── images-(2).jfif         # Foto contoh data
└── README.md
```

## API

Website berkomunikasi dengan satu endpoint (`api.php`):

| Metode | Fungsi |
|---|---|
| `GET` | Mengambil seluruh laporan (JSON) |
| `POST` | Menambah laporan baru (body JSON) |

Data yang dikirim saat membuat laporan:

| Field | Keterangan |
|---|---|
| `status` | `Hilang` atau `Temuan` |
| `namaBarang` | Nama barang |
| `kategori` | Elektronik, Dokumen, Dompet & Tas, atau Lainnya |
| `lokasi` | Lokasi hilang atau ditemukan |
| `tanggal` | Tanggal kejadian |
| `deskripsi` | Ciri-ciri barang (opsional) |
| `foto` | Foto barang dalam format base64 (opsional) |
| `namaPelapor` | Nama pelapor |
| `kontak` | Nomor WhatsApp atau email |
| `selesai`, `tanggalSelesai` | Status penyelesaian laporan |

Alamat API diatur lewat konstanta `API_URL` di bagian atas `script.js`.

## Menjalankan di Komputer Lokal

1. Clone repositori:
   ```bash
   git clone https://github.com/tgbudi12-coder/caribarang-id.git
   ```
2. Buka `index.html` di browser.

Website akan mencoba menghubungi server pada `API_URL`. Jika server tidak aktif, website berjalan dalam mode offline dengan data contoh. Untuk menjalankan backend sendiri, siapkan server dengan Nginx, PHP, dan MySQL, buat endpoint `api.php` dan tabel laporan, lalu ubah `API_URL` di `script.js`.

## Keterbatasan

- Alamat server memakai Cloudflare Tunnel versi cepat (`trycloudflare.com`). Alamat ini bersifat sementara dan berubah jika tunnel dimulai ulang, sehingga `API_URL` harus diperbarui.
- Aksi **tandai selesai** dan **hapus laporan** saat ini baru tersimpan di browser pengguna dan belum diteruskan ke database server.
- Belum ada sistem login, sehingga belum ada pembatasan siapa yang boleh mengelola suatu laporan.
- Nama dan kontak pelapor tampil publik di daftar laporan.
- Data contoh (nama, nomor, dan lokasi) hanya fiktif untuk demonstrasi.

## Rencana Pengembangan

- Menyimpan aksi selesai dan hapus ke database.
- Alamat server tetap (domain sendiri) menggantikan tunnel sementara.
- Login pelapor agar laporan hanya bisa dikelola pemiliknya.
- Menyimpan foto sebagai file di server, bukan base64 di database.

## Penggunaan AI

Selama pengerjaan, tim memakai alat AI sebagai bantuan belajar:

- **Gemini**: mencari referensi dan menyusun draf awal dokumentasi.
- **Claude**: membantu memahami dan memperbaiki kode yang error, serta merapikan dokumentasi.

Hasil akhir diuji dan ditinjau oleh tim sebelum dipublikasikan.

## Tim Pengembang

- Tegar Budi Kurniawan
- Septa Radid Prasetyo

## Lisensi

Dibuat untuk keperluan pembelajaran.
