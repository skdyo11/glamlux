// Simple Service Worker to satisfy PWA requirements
const CACHE_NAME = 'glamlux-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy (network-first/only) for MVP
  // This satisfies browser installability checks
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});
