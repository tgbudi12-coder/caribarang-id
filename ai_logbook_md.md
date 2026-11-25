# AI_LOGBOOK.md – Dokumentasi Pemanfaatan Kecerdasan Artifisial (KA)

* **Nama Produk Digital:** CariBarang.ID (Platform Pelaporan Barang Hilang & Barang Temuan)
* **Kategori Karya:** Produk Berbasis Website (HTML, CSS, JavaScript + Backend PHP/MySQL)
* **Kegiatan:** Pelatihan TIK Bagi Murid SMA/SMK Tahun 2026 (LATIKA 2026) – UPT. TIKP Dinas Pendidikan Provinsi Jawa Timur
* **Tema Project:** *"Solusi Digital untuk Kehidupan Sehari-hari Berbantuan Kecerdasan Artifisial"*
* **Alat Kecerdasan Artifisial yang Digunakan:** Google Gemini

---

## Tahap 1: Eksplorasi Ide & Perancangan Solusi

* **Tanggal / Waktu:** 19 Oktober 2026
* **Tujuan Interaksi:** Merumuskan konsep produk digital yang relevan dengan kehidupan sehari-hari siswa maupun masyarakat umum, serta menentukan arsitektur sistem agar aplikasi dapat diakses secara luas.
* **Ringkasan Prompt / Perintah kepada AI:**
  > *"Kami ingin membuat aplikasi website bernama CariBarang.ID untuk membantu masyarakat melaporkan barang hilang dan barang temuan di sekitar sekolah maupun fasilitas umum. Bantu kami merancang alur fitur utama, struktur data barang, serta saran arsitektur teknis agar website ini ringan, cepat diakses di HP, dan datanya dapat tersimpan secara permanen."*
* **Ringkasan Respon / Saran AI:**
  * AI menyarankan pembuatan antarmuka satu halaman (*Single Page Application* sederhana berbasis hash routing `#/barang/{id}`) dengan dua alur utama: **Daftar & Pencarian Laporan** serta **Formulir Pelaporan**.
  * AI merekomendasikan arsitektur hibrid: memisahkan tampilan antarmuka (*frontend*) di GitHub Pages agar akses cepat, dan meletakkan basis data (*database* MySQL & `api.php`) di server lokal Ubuntu yang dihubungkan ke internet menggunakan Cloudflare Tunnel, disertai mekanisme cadangan otomatis ke `localStorage` jika server lokal sedang offline.

### Validasi & Modifikasi Mandiri (Tahap 1)
1. **Penyesuaian Struktur Data:** Dari saran struktur data umum AI, kami memodifikasi dan menambahkan atribut khusus yang dibutuhkan pengguna lokal, yaitu status `Hilang` vs `Temuan`, kolom kategori spesifik (`Dompet & Tas`, `Dokumen`, `Elektronik`, dll.), tanggal kejadian, serta opsi penandaan status `selesai` (sudah ditemukan/dikembalikan).
2. **Privasi & Keamanan Kontak:** AI awalnya menyarankan menampilkan nomor telepon secara terbuka. Kami memodifikasinya menjadi tombol aksi langsung (*"Hubungi via WhatsApp"* dengan format tautan `https://wa.me/62...` otomatis dan *"Kirim Email"*), dilengkapi fitur salin kontak cepat agar lebih praktis dan aman bagi pelapor.

---

## Tahap 2: Penyusunan Kerangka Kode (Scaffolding)

* **Tanggal / Waktu:** 20 – 22 Oktober 2026
* **Tujuan Interaksi:** Membangun kerangka dasar antarmuka HTML, tata letak CSS yang responsif di perangkat seluler (HP), serta logika pemrograman JavaScript untuk pengelolaan daftar laporan dan kompresi gambar.
* **Ringkasan Prompt / Perintah kepada AI:**
  > *"Buatkan kerangka kode HTML, CSS, dan JavaScript untuk website CariBarang.ID. Pastikan desainnya bersih, fungsional, responsif di layar HP, memiliki fitur filter status (Semua, Hilang, Temuan, Selesai), pencarian real-time, serta fungsi kompresi foto otomatis sebelum diunggah agar tidak membebani penyimpanan."*
* **Ringkasan Respon / Saran AI:**
  * AI memberikan struktur HTML semantik yang membagi area daftar barang (`#listView`) dan halaman detail laporan (`#detailView`).
  * AI menyusun kode CSS berbasis CSS Variables (`--brand`, `--surface`, `--ink`) dan CSS Grid yang otomatis berubah menjadi tata letak vertikal satu kolom pada layar ponsel.
  * AI memberikan fungsi JavaScript `compressImage()` menggunakan elemen `<canvas>` HTML5 untuk memperkecil resolusi dan ukuran file foto menjadi format Base64 JPEG.

### Validasi & Modifikasi Mandiri (Tahap 2)
1. **Pencegahan Manipulasi Tanggal:** Kami menambahkan validasi mandiri pada input tanggal (`$('tanggal').max`) menggunakan kalkulasi zona waktu lokal agar pelapor tidak bisa memasukkan tanggal kejadian di masa depan.
2. **Keamanan Rendering Teks (Anti-XSS):** Kami memastikan seluruh masukan pengguna (nama barang, lokasi, ciri-ciri) diproses melalui fungsi sanitasi `escapeHTML()` sebelum dirender ke dalam DOM HTML agar terhindar dari injeksi skrip berbahaya.
3. **Pengelolaan Laporan Milik Sendiri:** Kami merancang fitur khusus (`milikSaya: true`) beserta dialog konfirmasi ganda (`confirming`) sehingga pembuat laporan dapat menandai barangnya sudah ditemukan/dikembalikan atau menghapus laporannya sendiri tanpa mengganggu laporan milik orang lain.

---

## Tahap 3: Pemecahan Masalah & Penanganan Galat (Debugging)

* **Tanggal / Waktu:** 23 – 25 Oktober 2026
* **Tujuan Interaksi:** Mengatasi kendala teknis saat menghubungkan website statis di GitHub Pages ke server database MySQL di Ubuntu, menangani bentrokan port jaringan, serta mencegah galat saat penyimpanan penuh atau server offline.
* **Ringkasan Prompt / Perintah kepada AI:**
  > *"Website frontend kami di GitHub Pages gagal mengambil data dari api.php di server Ubuntu karena kebijakan CORS, dan port 80 serta 8080 di server sudah terpakai layanan lain. Selain itu, jika server lokal dimatikan, website menjadi kosong. Bagaimana solusi penanganan galat (debugging) untuk masalah ini?"*
* **Ringkasan Respon / Saran AI:**
  * AI menjelaskan penyebab blokir lintas domain (*Cross-Origin Resource Sharing*) dan menyarankan penambahan header `Access-Control-Allow-Origin: *` serta penanganan metode `OPTIONS` pada file `api.php`.
  * AI menyarankan menjalankan server PHP pada port alternatif yang kosong (seperti port `9090`) dan mengarahkan Cloudflare Tunnel ke port tersebut.
  * AI merekomendasikan pola `try...catch` pada fungsi `fetch()` asinkron agar aplikasi otomatis beralih membaca/menyimpan data ke `localStorage` ketika server utama tidak merespons.

### Validasi & Modifikasi Mandiri (Tahap 3)
1. **Indikator Status Koneksi Real-Time:** Agar pengguna dan dewan juri mengetahui kondisi koneksi server secara transparan, kami memodifikasi bagian navigasi dengan menambahkan fungsi `updateServerStatus()` yang menampilkan lencana status dinamis (**🟢 Server MySQL Aktif** saat terhubung ke database Ubuntu, dan **🟠 Mode Offline** saat beralih ke penyimpanan lokal).
2. **Penanganan Galat Penyimpanan & Format Foto:** Kami menambahkan penanganan pengecualian (`try...catch`) pada fungsi `save()` untuk mendeteksi jika kapasitas `localStorage` browser penuh, serta validasi berkas gambar agar memberikan pesan peringatan yang jelas (`setMessage`) apabila pengguna mengunggah file yang rusak atau bukan format gambar.

---

## Tahap 4: Refleksi & Penjelasan Kode

* **Tanggal / Waktu:** 26 Oktober 2026
* **Tujuan Interaksi:** Memverifikasi pemahaman tim pengembang terhadap seluruh alur logika kode JavaScript, struktur database MySQL, serta kesiapan publikasi akhir di GitHub Pages.
* **Ringkasan Prompt / Perintah kepada AI:**
  > *"Bantu kami meninjau ulang alur kerja fungsi routing berbasis hash (#/barang/id) dan fungsi penyaringan (filter & sort) pada file script.js kami untuk memastikan tidak ada bug logika dan kami memahami cara kerja setiap bagian kodenya."*
* **Ringkasan Respon / Saran AI:**
  * AI membedah cara kerja event `hashchange` yang memanggil fungsi `route()` untuk beralih tampilan antara daftar utama dan detail barang tanpa memuat ulang halaman (*reload*).
  * AI menjelaskan urutan pengurutan data (*sorting*) yang memprioritaskan laporan yang masih aktif di bagian atas dibandingkan laporan yang sudah berstatus selesai.

### Validasi & Modifikasi Mandiri (Tahap 4)
1. **Pemahaman & Penguasaan Kode oleh Tim:** Melalui proses ini, tim kami memahami sepenuhnya bagaimana data mengalir dari input formulir HTML $\rightarrow$ validasi & kompresi di JavaScript $\rightarrow$ pengiriman JSON melalui `fetch()` $\rightarrow$ penyimpanan ke tabel MySQL via `api.php` $\rightarrow$ hingga dirender kembali menjadi kartu informasi yang interaktif.
2. **Penyempurnaan Dokumentasi & Uji Coba Akhir:** Kami melakukan pengujian langsung (*end-to-end testing*) melalui perangkat ponsel (HP) dan laptop menggunakan tautan publik GitHub Pages untuk memastikan seluruh tombol, salin tautan laporan, integrasi WhatsApp, dan pencarian berjalan 100% akurat sebelum dikumpulkan.