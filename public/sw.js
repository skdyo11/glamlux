// Core Service Worker for GlamLux Registry Hub
const CACHE_NAME = 'glamlux-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Satisfies Chrome install requirements
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline content placeholder');
  }));
});