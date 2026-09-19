// Change this version whenever the cached app shell or assets change.
const CACHE_VERSION = 'nudge-v15';
const APP_SHELL = [
  '/',
  '/index.html',
  '/main.html',
  '/exam.html',
  '/install.js',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/bg.jpg',
  '/nudge-logo.svg',
  '/nudge-app-icon.svg',
  '/nudge-icon-192.png',
  '/nudge-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_VERSION)
        .map((cacheName) => caches.delete(cacheName))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseCopy = networkResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, responseCopy));
        return networkResponse;
      });
    })
  );
});
