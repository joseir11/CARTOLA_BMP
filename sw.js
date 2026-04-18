/* ============================================================
   SERVICE WORKER — TAÇA NATTOS 2026
   ============================================================ */

const CACHE_NAME = 'nattos-v2';

// Arquivos para cache
const ARQUIVOS_ESTATICOS = [
  './',
  './index.html',
  './script.js',
  './tabela.js',
  './escalacoes.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

/* ── INSTALAÇÃO ─────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ARQUIVOS_ESTATICOS)
    ).then(() => self.skipWaiting())
  );
});

/* ── ATIVAÇÃO ────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* ── FETCH ───────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => null);

      return cached || fetchPromise;
    })
  );
});
