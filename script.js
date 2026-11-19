// ==========================================
// KONFIGURASI KONEKSI API BACKEND UBUNTU
// Ganti link di bawah dengan URL Cloudflare Tunnel aktif dari PC Ubuntu kamu
// ==========================================
const API_URL = "https://income-illustrations-switches-driver.trycloudflare.com/api.php";
const STORAGE_KEY = 'caribarang_offline_db';

const seed = [
    {
        id: 1, status: 'Hilang', namaPelapor: 'Ahmad Fauzi', kontak: '081298765432',
        namaBarang: 'Dompet kulit coklat (isi STNK dan KTP)', kategori: 'Dompet & Tas',
        lokasi: 'Kawasan Malioboro, Yogyakarta', tanggal: '2026-06-01', milikSaya: false,
        deskripsi: 'Hilang di sekitar area parkir timur. Ada hadiah bagi yang menemukan.', foto: 'dompetkulitcoklat.jpg'
    },
    {
        id: 2, status: 'Temuan', namaPelapor: 'Siti Rahma', kontak: '085612345678',
        namaBarang: 'Kunci motor Honda dan STNK', kategori: 'Dokumen',
        lokasi: 'Fakultas Teknik Kampus', tanggal: '2026-06-02', milikSaya: false,
        deskripsi: 'Ditemukan di atas meja kantin area pojok.', foto: 'images-(1).jfif'
    }
];

let reports = [];
let activeStatus = '';
let query = '';
let currentImage = '';

const $ = id => document.getElementById(id);
const form = $('reportForm');
const list = $('itemsContainer');
const emptyState = $('emptyState');
const emptyText = $('emptyText');
const resultCount = $('resultCount');
const message = $('formMessage');
const fotoInput = $('fotoBarang');
const previewBox = $('imagePreviewContainer');
const previewImg = $('imagePreview');

/* Tanggal tidak boleh di masa depan */
const today = new Date();
if ($('tanggal')) {
    $('tanggal').max = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/* ---------- Ambil Data dari Server MySQL / Fallback ---------- */
async function loadReports() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                reports = data;
                // Indikator server aktif jika berhasil ambil dari MySQL
                updateServerStatus(true);
                render();
                return;
            }
        }
    } catch (err) {
        console.warn("Gagal terhubung ke server MySQL, menggunakan data lokal.");
    }
    
    // Fallback ke localStorage jika server offline
    updateServerStatus(false);
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        reports = Array.isArray(saved) && saved.length ? saved : seed;
    } catch (e) {
        reports = seed;
    }
    render();
}

// Indikator Status Server di Navbar (Opsional)
function updateServerStatus(isOnline) {
    let indicator = $('serverStatusBadge');
    if (!indicator) {
        const brandNav = document.querySelector('.brand');
        if (brandNav) {
            indicator = document.createElement('span');
            indicator.id = 'serverStatusBadge';
            indicator.style.cssText = "margin-left: 10px; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: 600;";
            brandNav.parentNode.appendChild(indicator);
        }
    }
    if (indicator) {
        indicator.textContent = isOnline ? "🟢 Server MySQL Aktif" : "🟠 Mode Offline";
        indicator.style.background = isOnline ? "#e8f2ec" : "#fef3c7";
        indicator.style.color = isOnline ? "#1c6e45" : "#b45309";
    }
}

/* ---------- Util ---------- */
function escapeHTML(str = '') {
    return String(str).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPhone(phone) {
    let n = phone.replace(/\D/g, '');
    if (n.startsWith('0')) n = '62' + n.slice(1);
    return n;
}

function contactLink(item) {
    const text = encodeURIComponent('Halo, saya menghubungi terkait laporan "' + item.namaBarang + '" di CariBarang.ID');
    if (item.kontak && item.kontak.includes('@')) {
        return { href: `mailto:${encodeURIComponent(item.kontak)}?subject=${encodeURIComponent('Laporan ' + item.namaBarang)}`, label: 'Kirim email' };
    }
    return { href: `https://wa.me/${formatPhone(item.kontak || '')}?text=${text}`, label: 'Hubungi via WhatsApp' };
}

/* ---------- Gambar ---------- */
function compressImage(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = e => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function clearImage() {
    if (fotoInput) fotoInput.value = '';
    currentImage = '';
    if (previewImg) previewImg.src = '';
    if (previewBox) previewBox.classList.add('hidden');
}

if (fotoInput) {
    fotoInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            currentImage = await compressImage(file);
            previewImg.src = currentImage;
            previewBox.classList.remove('hidden');
            setMessage('');
        } catch (err) {
            clearImage();
            setMessage('Foto tidak bisa dibaca. Pilih file gambar lain (JPG atau PNG).', 'error');
        }
    });
}
if ($('removeImageBtn')) $('removeImageBtn').addEventListener('click', clearImage);

/* ---------- Status ---------- */
function statusLabel(item) {
    if (item.selesai) return item.status === 'Hilang' ? 'Sudah ditemukan' : 'Sudah dikembalikan';
    return item.status === 'Hilang' ? 'Hilang' : 'Ditemukan';
}
const statusClass = item => item.selesai ? 'selesai' : (item.status ? item.status.toLowerCase() : '');

function toast(text) {
    const el = $('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('show'), 2000);
}

async function copyText(text, okMsg) {
    try {
        await navigator.clipboard.writeText(text);
        toast(okMsg);
    } catch (err) {
        toast('Tidak bisa menyalin otomatis.');
    }
}

/* ---------- Tampilan daftar ---------- */
function render() {
    const q = query.trim().toLowerCase();
    const rows = reports
        .filter(r => {
            if (activeStatus === 'Selesai') return r.selesai;
            if (activeStatus) return r.status === activeStatus && !r.selesai;
            return true;
        })
        .filter(r => !q || [r.namaBarang, r.lokasi, r.kategori, r.deskripsi].some(v => (v || '').toLowerCase().includes(q)))
        .sort((a, b) => (!!b.id - !!a.id));

    if (resultCount) resultCount.textContent = rows.length ? `${rows.length} laporan` : '';
    if (list) list.innerHTML = '';
    if (emptyState) emptyState.classList.toggle('hidden', rows.length > 0);

    if (!rows.length) {
        if (emptyText) emptyText.textContent = (q || activeStatus) ? 'Tidak ada laporan yang cocok.' : 'Belum ada laporan.';
        return;
    }

    if (list) {
        list.innerHTML = rows.map(item => {
            const c = contactLink(item);
            const thumb = item.foto
                ? `<img src="${item.foto}" alt="Foto ${escapeHTML(item.namaBarang)}" loading="lazy">`
                : 'Tanpa foto';
            return `
            <article class="item${item.selesai ? ' is-done' : ''}" data-id="${item.id}">
                <div class="thumb">${thumb}</div>
                <div>
                    <div class="item-head">
                        <span class="status ${statusClass(item)}">${statusLabel(item)}</span>
                        <time datetime="${escapeHTML(item.tanggal)}">${formatDate(item.tanggal)}</time>
                    </div>
                    <h3><a href="#/barang/${item.id}">${escapeHTML(item.namaBarang)}</a></h3>
                    <p class="meta">${escapeHTML(item.kategori)}, di ${escapeHTML(item.lokasi)}</p>
                    ${item.deskripsi ? `<p class="desc">${escapeHTML(item.deskripsi)}</p>` : ''}
                    <div class="item-foot">
                        <span>Dilaporkan oleh ${escapeHTML(item.namaPelapor)}</span>
                        ${item.selesai ? '' : `<a class="contact-link" href="${c.href}" target="_blank" rel="noopener noreferrer">${c.label}</a>`}
                    </div>
                </div>
            </article>`;
        }).join('');
    }
}

if (list) {
    list.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const row = e.target.closest('.item');
        if (row) location.hash = '#/barang/' + row.dataset.id;
    });
}

/* ---------- Halaman detail & Form Submit ---------- */
const listView = $('listView');
const detailView = $('detailView');

function setMessage(text, type = '') {
    if (!message) return;
    message.textContent = text;
    message.className = 'message ' + type;
}

function isValidContact(v) {
    const value = v.trim();
    if (value.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const digits = value.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
}

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        const val = id => $(id) ? $(id).value.trim() : '';
        const required = ['namaBarang', 'lokasi', 'tanggal', 'namaPelapor', 'kontak'];
        const missing = required.filter(id => !val(id));

        if (missing.length) {
            missing.forEach(id => { if($(id)) $(id).classList.add('invalid'); });
            setMessage('Lengkapi kolom yang ditandai.', 'error');
            return;
        }
        if (!isValidContact(val('kontak'))) {
            if($('kontak')) $('kontak').classList.add('invalid');
            setMessage('Isi nomor WhatsApp atau email yang valid.', 'error');
            return;
        }

        const newReport = {
            status: val('status'),
            namaPelapor: val('namaPelapor'),
            kontak: val('kontak'),
            namaBarang: val('namaBarang'),
            kategori: val('kategori'),
            lokasi: val('lokasi'),
            tanggal: val('tanggal'),
            deskripsi: val('deskripsi'),
            foto: currentImage
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReport)
            });
            if (res.ok) {
                form.reset();
                clearImage();
                setMessage('Laporan berhasil dikirim ke server MySQL!', 'ok');
                loadReports(); // Muat ulang data dari server
                return;
            }
        } catch (err) {
            console.error("Gagal mengirim ke server:", err);
        }

        setMessage('Gagal terhubung ke server database.', 'error');
    });
}

// Inisialisasi awal memuat data
loadReports();
