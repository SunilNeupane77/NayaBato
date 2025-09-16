const CACHE_NAME = 'nayabato-v4';
const DEV_MODE = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Assets to cache (minimal for development mode)
const urlsToCache = DEV_MODE ? 
[
  '/offline',
  '/manifest.json',
  '/globe.svg',
  '/favicon.svg',
  '/icons/icon-192x192.png'
] : 
[
  '/',
  '/issues',
  '/offline',
  '/manifest.json',
  '/globe.svg',
  '/favicon.svg',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

const NEXTAUTH_PATHS = ['/api/auth/'];
const API_PATHS = ['/api/'];
const STATIC_PATHS = ['/_next/static/', '/static/chunks/', '/static/'];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => console.log('[Service Worker] Cached core assets'))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For development mode, only intercept specific requests to avoid conflicts
  if (DEV_MODE) {
    // Skip intercepting development-specific resources
    if (STATIC_PATHS.some(path => url.pathname.startsWith(path)) || 
        url.pathname.includes('webpack-hmr') ||
        url.pathname.includes('webpack-dev-server') ||
        url.pathname.includes('on-demand-entries')) {
      return;
    }

    // Only handle offline fallback for pages in development mode
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => caches.match('/offline'))
      );
      return;
    }

    // For icon requests that might fail in dev
    if (url.pathname.includes('/icons/') && request.destination === 'image') {
      event.respondWith(
        caches.match(request).then(response => {
          return response || fetch(request).catch(() => {
            // Fallback to a generic icon
            return caches.match('/icons/icon-192x192.png');
          });
        })
      );
      return;
    }

    // Let browser handle the rest in dev mode
    return;
  }

  // Production mode below:

  // Skip service worker for Next.js dynamic static assets
  if (STATIC_PATHS.some(path => url.pathname.startsWith(path))) {
    // For static assets, try network first, then cache
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle NextAuth and API requests
  if (NEXTAUTH_PATHS.some(path => url.pathname.startsWith(path)) || 
      API_PATHS.some(path => url.pathname.startsWith(path))) {
    event.respondWith(
      fetch(request).catch(() => {
        // For auth failures, redirect to offline page
        if (request.destination === 'document') {
          return caches.match('/offline');
        }
        return new Response('{"error":"offline"}', {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle regular requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          // Cache successful responses for future offline use
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  // Clean up old cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        console.log('[Service Worker] Now ready to handle fetches!');
      });
    })
  );
  
  // Take control of uncontrolled clients
  self.clients.claim();
});
