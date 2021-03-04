importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = 'janet-1.15';

const offlineFallbackPage = [
  'style.css',
  'ansi_up.js',
  'janet.js',
  'janet.wasm',
  'repl.js',
  'index.html',
  '/',
];

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then(async (response) => {
        const cache = await caches.open(CACHE);
        console.log('[Service Worker] Caching new resource: ' + e.request.url);
        cache.put(e.request, response.clone());
        return response;
      });
    })
  );
});
