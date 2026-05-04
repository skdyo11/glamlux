// GlamLux Registry Service Worker
const CACHE_NAME = 'glamlux-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Satisfies the PWA 'fetch' requirement for installation
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline: The Registry Hub requires a connection for real-time updates.');
    })
  );
});