// ==========================================
// KONFIGURASI API BACKEND UBUNTU (Cloudflare Tunnel)
// ==========================================
const API_URL = "https://income-illustrations-switches-driver.trycloudflare.com/api.php";
const STORAGE_KEY = 'lost_items';

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
    },
    {
        id: 3, status: 'Hilang', namaPelapor: 'Dewi Lestari', kontak: '087711223344',
        namaBarang: 'HP Samsung hitam', kategori: 'Elektronik',
        lokasi: 'Terminal Giwangan, Yogyakarta', tanggal: '2026-05-28', milikSaya: false,
        deskripsi: 'Casing biru tua, ada retak kecil di pojok kiri atas.', foto: 'images-(2).jfif',
        selesai: true, tanggalSelesai: '2026-06-04'
    }
];

// ---------- Ambil Data dari Server MySQL atau LocalStorage ----------
async function loadReports() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                updateServerStatus(true);
                return data.length ? data : seed;
            }
        }
    } catch (err) {
        console.warn("Server offline, menggunakan penyimpanan lokal.");
    }

    updateServerStatus(false);
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved) && saved.length) return saved;
    } catch (err) { /* data rusak atau storage tidak tersedia */ }
    return seed;
}

// Indikator Status Server di Navbar
function updateServerStatus(isOnline) {
    let indicator = document.getElementById('serverStatusBadge');
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

// Inisialisasi data asynchronously
loadReports().then(data => {
    reports = data;
    render();
    route();
});

/* Tanggal tidak boleh di masa depan */
const today = new Date();
if ($('tanggal')) {
    $('tanggal').max = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        return true;
    } catch (err) {
        return false;
    }
}

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
        toast('Tidak bisa menyalin otomatis. Salin dari kolom alamat browser.');
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
        .sort((a, b) => (!!a.selesai - !!b.selesai) || (b.tanggal || '').localeCompare(a.tanggal || '') || b.id - a.id);

    if (resultCount) resultCount.textContent = rows.length ? `${rows.length} laporan` : '';
    if (list) list.innerHTML = '';
    if (emptyState) emptyState.classList.toggle('hidden', rows.length > 0);

    if (!rows.length) {
        if (emptyText) {
            emptyText.textContent = (q || activeStatus)
                ? 'Tidak ada laporan yang cocok. Coba kata kunci lain atau hapus filter.'
                : 'Belum ada laporan.';
        }
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

/* ---------- Halaman detail ---------- */
const listView = $('listView');
const detailView = $('detailView');
let confirming = null; // 'selesai' | 'buka' | 'hapus'

function renderDetail(item) {
    const c = contactLink(item);
    const hilang = item.status === 'Hilang';
    const doneTitle = hilang ? 'Barang ini sudah ditemukan.' : 'Barang ini sudah dikembalikan ke pemiliknya.';
    const doneAction = hilang ? 'Tandai sudah ditemukan' : 'Tandai sudah dikembalikan';

    if (!detailView) return;
    detailView.classList.toggle('is-done', !!item.selesai);
    detailView.innerHTML = `
        <a class="back" href="#daftar">Kembali ke daftar</a>
        <div class="detail-grid">
            <div class="detail-photo">
                ${item.foto ? `<img src="${item.foto}" alt="Foto ${escapeHTML(item.namaBarang)}">` : 'Tidak ada foto'}
            </div>
            <div>
                <div class="item-head">
                    <span class="status ${statusClass(item)}">${statusLabel(item)}</span>
                    <span>Dilaporkan ${formatDate(item.tanggal)}</span>
                </div>
                <h1>${escapeHTML(item.namaBarang)}</h1>

                ${item.selesai ? `
                <div class="done-banner">
                    <strong>Laporan selesai</strong>
                    ${doneTitle}${item.tanggalSelesai ? ' Ditandai selesai pada ' + formatDate(item.tanggalSelesai) + '.' : ''}
                </div>` : ''}

                <dl class="facts">
                    <dt>Kategori</dt><dd>${escapeHTML(item.kategori)}</dd>
                    <dt>${hilang ? 'Lokasi hilang' : 'Lokasi ditemukan'}</dt><dd>${escapeHTML(item.lokasi)}</dd>
                    <dt>${hilang ? 'Tanggal hilang' : 'Tanggal ditemukan'}</dt><dd>${formatDate(item.tanggal)}</dd>
                    <dt>Pelapor</dt><dd>${escapeHTML(item.namaPelapor)}</dd>
                </dl>

                <h2>Ciri-ciri</h2>
                <p class="detail-desc">${escapeHTML(item.deskripsi || 'Pelapor tidak menambahkan ciri-ciri.')}</p>

                ${item.selesai ? '' : `
                <h2>${hilang ? 'Punya informasi tentang barang ini?' : 'Ini barang Anda?'}</h2>
                <div class="actions">
                    <a class="btn" href="${c.href}" target="_blank" rel="noopener noreferrer">${c.label}</a>
                    <button type="button" class="btn-ghost" data-action="copy-contact">Salin kontak</button>
                </div>`}
                <div class="actions" style="margin-top:0.5rem">
                    <button type="button" class="btn-ghost" data-action="copy-link">Salin tautan laporan</button>
                </div>

                ${item.milikSaya === false ? '' : `
                <div class="owner">
                    <h2>Kelola laporan Anda</h2>
                    <p>${item.selesai
                        ? 'Barang ini sudah ditandai selesai. Jika ternyata belum, Anda bisa membuka kembali laporannya.'
                        : (hilang ? 'Sudah menemukan barang Anda? Tandai laporan ini agar orang lain tidak perlu menghubungi Anda lagi.'
                                  : 'Sudah menyerahkan barang ke pemiliknya? Tandai laporan ini agar tidak dicari lagi.')}</p>
                    <div class="actions">
                        <button type="button" class="btn-ghost" data-action="ask" data-kind="${item.selesai ? 'buka' : 'selesai'}">${item.selesai ? 'Buka kembali laporan' : doneAction}</button>
                        <button type="button" class="btn-ghost btn-danger" data-action="ask" data-kind="hapus">Hapus laporan</button>
                    </div>
                    ${confirming ? `
                    <div class="confirm">
                        <p>${confirming === 'hapus' ? 'Hapus laporan ini secara permanen?'
                            : confirming === 'buka' ? 'Buka kembali laporan ini?' : 'Tandai laporan ini selesai?'}</p>
                        <div class="actions">
                            <button type="button" class="btn" data-action="confirm">Ya, lanjutkan</button>
                            <button type="button" class="btn-ghost" data-action="cancel">Batal</button>
                        </div>
                    </div>` : ''}
                </div>`}
            </div>
        </div>`;
}

if (detailView) {
    detailView.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const item = reports.find(r => r.id === currentId);
        if (!item) return;
        const action = btn.dataset.action;

        if (action === 'copy-link') return copyText(location.href, 'Tautan disalin');
        if (action === 'copy-contact') return copyText(item.kontak, 'Kontak disalin');
        if (action === 'ask') { confirming = btn.dataset.kind; return renderDetail(item); }
        if (action === 'cancel') { confirming = null; return renderDetail(item); }

        if (action === 'confirm') {
            const kind = confirming;
            confirming = null;
            if (kind === 'hapus') {
                reports = reports.filter(r => r.id !== item.id);
                save();
                toast('Laporan dihapus');
                location.hash = '#daftar';
                return;
            }
            const prev = { selesai: item.selesai, tanggalSelesai: item.tanggalSelesai };
            item.selesai = kind === 'selesai';
            item.tanggalSelesai = item.selesai ? new Date().toISOString().slice(0, 10) : '';
            if (!save()) {
                Object.assign(item, prev);
                toast('Perubahan gagal disimpan.');
            } else {
                toast(item.selesai ? 'Laporan ditandai selesai' : 'Laporan dibuka kembali');
            }
            renderDetail(item);
            render();
        }
    });
}

let currentId = null;

function route() {
    const m = location.hash.match(/^#\/barang\/(\d+)$/);
    if (!m) {
        currentId = null;
        confirming = null;
        if (detailView) detailView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');
        document.title = 'CariBarang.ID – Barang hilang dan barang temuan';
        render();
        const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
        return;
    }

    const id = Number(m[1]);
    if (id !== currentId) confirming = null;
    currentId = id;
    const item = reports.find(r => r.id === id);
    if (listView) listView.classList.add('hidden');
    if (detailView) detailView.classList.remove('hidden');
    window.scrollTo(0, 0);

    if (!item) {
        if (detailView) {
            detailView.classList.remove('is-done');
            detailView.innerHTML = `<a class="back" href="#daftar">Kembali ke daftar</a>
                <h1>Laporan tidak ditemukan</h1>
                <p class="detail-desc">Laporan ini mungkin sudah dihapus.</p>`;
        }
        document.title = 'Laporan tidak ditemukan – CariBarang.ID';
        return;
    }
    document.title = `${item.namaBarang} – CariBarang.ID`;
    renderDetail(item);
}
window.addEventListener('hashchange', route);

/* ---------- Filter & pencarian ---------- */
if ($('searchInput')) {
    $('searchInput').addEventListener('input', e => { query = e.target.value; render(); });
}

document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
        activeStatus = btn.dataset.status;
        document.querySelectorAll('.chip').forEach(b => {
            const on = b === btn;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', on);
        });
        render();
    });
});

/* ---------- Form ---------- */
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
            missing.forEach(id => { if ($(id)) $(id).classList.add('invalid'); });
            if ($(missing[0])) $(missing[0]).focus();
            setMessage('Lengkapi kolom yang ditandai.', 'error');
            return;
        }
        if (!isValidContact(val('kontak'))) {
            if ($('kontak')) {
                $('kontak').classList.add('invalid');
                $('kontak').focus();
            }
            setMessage('Isi nomor WhatsApp (9–15 digit) atau alamat email yang valid.', 'error');
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
            foto: currentImage,
            milikSaya: true,
            selesai: false,
            tanggalSelesai: ''
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
                // Muat ulang daftar laporan dari database
                reports = await loadReports();
                render();
                return;
            }
        } catch (err) {
            console.warn("Gagal mengirim ke server MySQL, menyimpan ke mode offline.");
        }

        // Fallback simpan lokal jika gagal ke server
        newReport.id = Date.now();
        reports.push(newReport);
        if (!save()) {
            reports.pop();
            setMessage('Laporan tidak tersimpan karena penyimpanan penuh.', 'error');
            return;
        }
        form.reset();
        clearImage();
        setMessage('Laporan terkirim (Mode Offline).', 'ok');
        render();
    });
}
