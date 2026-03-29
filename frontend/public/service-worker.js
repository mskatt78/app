// Shamanic Soul Temple – Service Worker v2
// Strategy: Cache-first for static assets, Network-first for API calls

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `shamanic-static-${CACHE_VERSION}`;
const API_CACHE = `shamanic-api-${CACHE_VERSION}`;

// Core static assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// ---- Install ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => !n.endsWith(CACHE_VERSION))
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ---- Fetch ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests (except API)
  if (request.method !== 'GET') return;

  // API requests — Network-first, short cache fallback (5 min)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 300));
    return;
  }

  // Static assets (JS, CSS, images, fonts) — Cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ico)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation — Network-first, fallback to index.html for SPA
  event.respondWith(
    fetch(request).catch(() =>
      caches.match('/index.html').then((r) => r || caches.match('/offline.html'))
    )
  );
});

// ---- Strategies ----

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, maxAgeSeconds) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) {
      // Only serve cached API responses if they're fresh enough
      const dateHeader = cached.headers.get('date');
      if (dateHeader) {
        const age = (Date.now() - new Date(dateHeader).getTime()) / 1000;
        if (age < maxAgeSeconds) return cached;
      } else {
        return cached;
      }
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
