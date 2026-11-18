// rutoso.de – Offline-Funktion
// Holt Seiten immer frisch aus dem Netz und legt eine Kopie ab.
// Ohne Netz wird die gespeicherte Kopie gezeigt.
// Neue Seite dazugekommen? In DATEIEN eintragen und VERSION um eins erhöhen.
const VERSION = 'rutoso-3';
const DATEIEN = ['/', '/neues.html', '/ueber.html', '/en/', '/en/news.html', '/en/about.html',
  '/sv/', '/sv/nyheter.html', '/sv/om.html', '/logo.svg', '/favicon.ico', '/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET' || new URL(anfrage.url).origin !== location.origin) return;
  e.respondWith(
    fetch(anfrage).then(antwort => {
      if (antwort.ok) {
        const kopie = antwort.clone();
        caches.open(VERSION).then(c => c.put(anfrage, kopie));
      }
      return antwort;
    }).catch(() => caches.match(anfrage).then(gespeichert =>
      gespeichert || (anfrage.mode === 'navigate' ? caches.match('/') : Response.error())))
  );
});
