
/**
 * GlamLux Service Worker
 * Enables PWA functionality and handles background synchronization.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for standard marketplace interaction
  event.respondWith(fetch(event.request));
});
