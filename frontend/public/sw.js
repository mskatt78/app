// Service Worker for Temple of the Soul - Offline Support
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `temple-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `temple-dynamic-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/offline.html'
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/meditations',
  '/api/yoga-poses',
  '/api/breathwork',
  '/api/mantras',
  '/api/mudras',
  '/api/crystals',
  '/api/oracle-cards',
  '/api/runes',
  '/api/iching',
  '/api/light-codes'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        console.log('[SW] Caching static assets');
        const cacheJobs = STATIC_ASSETS.map((assetPath) =>
          cache.add(assetPath).catch((error) => {
            console.warn('[SW] Static asset cache skipped:', assetPath, error?.message || error);
            return null;
          })
        );
        await Promise.allSettled(cacheJobs);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests - Network first, cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.includes(route));

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests for cacheable routes
    if (networkResponse.ok && isCacheable) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a JSON error response for API requests
    return new Response(
      JSON.stringify({ error: 'Offline - Please check your connection' }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests - Cache first, network fallback
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === 'navigate';

  // Navigation requests should be network-first to avoid stale SPA shell black screens
  if (isNavigation) {
    try {
      const networkResponse = await fetch(request, { cache: 'no-store' });
      if (networkResponse.ok && isSameOrigin) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put('/index.html', networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.log('[SW] Navigation network failed, trying cached shell for:', request.url);
      const cachedShell = await caches.match('/index.html') || await caches.match(request);
      if (cachedShell) return cachedShell;

      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;

      return new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  // Static assets: stale-while-revalidate
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    if (isSameOrigin) {
      fetchAndCache(request);
    }
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful same-origin static responses
    if (networkResponse.ok && isSameOrigin) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Static request failed for:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Fetch and update cache in background
async function fetchAndCache(request) {
  try {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('[SW] Background cache refresh skipped for:', request.url);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = { title: 'Temple of the Soul', body: 'You have a new message' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});

// Background sync for practice logging
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-practice-log') {
    event.waitUntil(syncPracticeLog());
  }
});

// Sync practice logs when back online
async function syncPracticeLog() {
  try {
    const cache = await caches.open('pending-logs');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Send to server
      await fetch('/api/practice-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Remove from pending
      await cache.delete(request);
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

console.log('[SW] Service worker loaded');
