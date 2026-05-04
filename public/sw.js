
/**
 * GlamLux Registry Service Worker
 * Satisfies PWA installation requirements and provides baseline offline capabilities.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Maintain real-time connectivity for the artisan registry
  event.respondWith(fetch(event.request).catch(() => {
    return new Response("You are currently disconnected from the registry.", {
      headers: { "Content-Type": "text/plain" }
    });
  }));
});
