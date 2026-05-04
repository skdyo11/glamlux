// GlamLux Registry Service Worker
const CACHE_NAME = 'glamlux-registry-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
  );
});

self.addEventListener('fetch', (event) => {
  // This satisfies the PWA requirement for a fetch handler.
  // In a production environment, you would add caching logic here.
  return;
});