
// GlamLux Registry Service Worker
const CACHE_NAME = 'glamlux-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch listener required for PWA installability
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
