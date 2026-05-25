self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('glamlux-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/Glamlux.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});