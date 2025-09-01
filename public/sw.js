const CACHE_NAME = 'nayabato-v2';
const urlsToCache = [
  '/',
  '/issues',
  '/offline',
  '/manifest.json',
  '/globe.svg',
  '/favicon.svg'
];

const NEXTAUTH_PATHS = ['/api/auth/', '/_next/static/'];
const API_PATHS = ['/api/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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

  // Handle regular requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
