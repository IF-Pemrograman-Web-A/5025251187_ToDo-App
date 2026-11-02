'use strict';

const VERSION = 'v1';
const SHELL_CACHE = 'todo-shell-' + VERSION;
const PAGES_CACHE = 'todo-pages-' + VERSION;
const IMAGES_CACHE = 'todo-images-' + VERSION;
const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, IMAGES_CACHE];

const MAX_IMAGES = 30;
const MAX_PAGES = 20;

const APP_SHELL = [
    './offline.html',
    './style.css',
    './app.js',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
];

const OPTIONAL_PAGES = [
    './index.php?page=personal',
    './index.php?page=shared'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        (async function () {
            const shell = await caches.open(SHELL_CACHE);
            await shell.addAll(APP_SHELL);

            const pages = await caches.open(PAGES_CACHE);
            await Promise.all(OPTIONAL_PAGES.map(async function (url) {
                try {
                    const response = await fetch(url, { credentials: 'same-origin' });
                    if (response.ok && !response.redirected) {
                        await pages.put(url, response);
                    }
                } catch (error) {
                    // Abaikan error saat mengambil halaman PHP
                }
            }));

            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        (async function () {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(function (key) { return CURRENT_CACHES.indexOf(key) === -1; })
                    .map(function (key) { return caches.delete(key); })
            );
            await self.clients.claim();
        })()
    );
});

async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - maxItems; i++) {
        await cache.delete(keys[i]);
    }
}

async function handleNavigation(request) {
    try {
        const response = await fetch(request);
        if (response.ok && !response.redirected) {
            const cache = await caches.open(PAGES_CACHE);
            await cache.put(request, response.clone());
            trimCache(PAGES_CACHE, MAX_PAGES);
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match('./offline.html');
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);

    const network = fetch(request)
        .then(function (response) {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(function () { return cached; });

    return cached || network;
}

async function cacheFirst(request, cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            await cache.put(request, response.clone());
            if (maxItems) trimCache(cacheName, maxItems);
        }
        return response;
    } catch (error) {
        return Response.error();
    }
}

self.addEventListener('fetch', function (event) {
    const request = event.request;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    const path = url.pathname;

    if (/\.(css|js)$/.test(path)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (path.indexOf('/uploads/') !== -1) {
        event.respondWith(cacheFirst(request, IMAGES_CACHE, MAX_IMAGES));
        return;
    }

    event.respondWith(cacheFirst(request, SHELL_CACHE));
});
