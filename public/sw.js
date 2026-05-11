self.addEventListener('install', (event) => {
  console.log('GlamLux Service Worker installed.');
});

self.addEventListener('fetch', (event) => {
  // Essential for PWA installation detection
  event.respondWith(fetch(event.request));
});