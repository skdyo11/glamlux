self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // This satisfies the browser's PWA requirement for a fetch handler
  event.respondWith(fetch(event.request));
});