const CACHE = 'archer-v1';
const ASSETS = ['./ARCHERBETA.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Never touch the Google Apps Script sync calls — always live network
  if (url.includes('script.google.com')) return;
  if (e.request.method !== 'GET') return;
  // Network-first so app updates show immediately; fall back to cache offline
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
