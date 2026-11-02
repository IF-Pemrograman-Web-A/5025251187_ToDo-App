'use strict';

/*
 * app.js - interaksi halaman PHP + fitur PWA (E05)
 *  - dark / light mode (localStorage)
 *  - checkbox selesai & konfirmasi hapus
 *  - registrasi Service Worker
 *  - tombol Install App (beforeinstallprompt)
 *  - indikator online / offline
 */

const THEME_KEY = 'todo-theme';

const themeToggle = document.getElementById('theme-toggle');
const installBtn = document.getElementById('install-btn');
const netStatus = document.getElementById('net-status');
const statusRegion = document.getElementById('status');

function announce(message) {
    if (!statusRegion) return;
    statusRegion.textContent = '';
    window.setTimeout(function () { statusRegion.textContent = message; }, 50);
}

// ---------- Tema ----------
function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (themeToggle) themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function loadTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (error) { saved = null; }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved === 'dark');
        return;
    }
    applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        const isDark = !document.body.classList.contains('dark-mode');
        applyTheme(isDark);
        try { localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light'); } catch (error) {}
    });
}

// ---------- Checkbox selesai & konfirmasi hapus ----------
document.querySelectorAll('.js-toggle').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        checkbox.form.submit();
    });
});

document.querySelectorAll('form.js-confirm').forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!window.confirm(form.dataset.confirm || 'Yakin?')) {
            event.preventDefault();
        }
    });
});

// ---------- Online / offline ----------
function updateNetworkStatus() {
    if (!netStatus) return;
    const offline = !navigator.onLine;
    netStatus.hidden = !offline;
    document.body.classList.toggle('is-offline', offline);
    if (offline) announce('Kamu sedang offline. Menampilkan data yang tersimpan.');
}

window.addEventListener('online', function () {
    updateNetworkStatus();
    announce('Koneksi kembali online.');
});
window.addEventListener('offline', updateNetworkStatus);

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function (error) {
            console.warn('Service Worker gagal didaftarkan:', error);
        });
    });
}

// ---------- Tombol Install ----------
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
    installBtn.addEventListener('click', async function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        announce(choice.outcome === 'accepted' ? 'Aplikasi sedang di-install.' : 'Install dibatalkan.');
        deferredPrompt = null;
        installBtn.hidden = true;
    });
}

window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
    announce('Aplikasi berhasil di-install.');
});

loadTheme();
updateNetworkStatus();
