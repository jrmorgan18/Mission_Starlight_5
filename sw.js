/* Mission: Starlight 5 service worker — cache-first so the game works offline after first play. */
const CACHE = 'starlight5-v2';
const CORE = [
  '.',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'vendor/three.module.min.js',
  'icons/icon.svg',
  'assets/earth.jpg',
  'assets/clouds.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Code (HTML/CSS/JS/manifest) is network-first so edits show up immediately when online,
// falling back to cache offline. Big static assets (vendor, images, fonts) stay cache-first for speed.
const CODE_RE = /\.(html|css|js|webmanifest)$/i;

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  const url = new URL(e.request.url);
  const isCode = e.request.mode === 'navigate' || CODE_RE.test(url.pathname);

  if (isCode) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
