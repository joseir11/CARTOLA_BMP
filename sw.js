/* ============================================================
   SERVICE WORKER — TAÇA NATTOS 2026

   ⚠️ A CADA NOVA RODADA, MUDE O CACHE_NAME:
      Rodada  6 → nattos-v60   ← atual
      Rodada  7 → nattos-v70
      Rodada  8 → nattos-v80
      Rodada  9 → nattos-v90
      Rodada 10 → nattos-v100
      ... e assim por diante.
   ============================================================ */

const CACHE_NAME = 'nattos-v60';

// APENAS estes arquivos entram no cache — nada mais
const ARQUIVOS_ESTATICOS = [
  'campo.png',
  'CARTOLA.png',
  'CS.png',
  'TROFEU_NATTOS.png',
  'Fontecartola.otf',
  'icon-192.png',
  'icon-512.png'
];

/* ── INSTALAÇÃO ─────────────────────────────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Instalando', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        ARQUIVOS_ESTATICOS.map(f =>
          cache.add(f).catch(e => console.warn('[SW] Não cacheou:', f, e.message))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

/* ── ATIVAÇÃO ────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Ativando', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deletando cache antigo:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ───────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora requisições externas (fontes Google, etc) — deixa o navegador resolver
  if (url.origin !== location.origin) return;

  const path = url.pathname;

  // .js e .html → SEMPRE da rede, NUNCA do cache
  if (path.endsWith('.js') || path.endsWith('.html') || path.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) return response;
          return criarFallback(path);
        })
        .catch(() => criarFallback(path))
    );
    return;
  }

  // manifest.json → sempre da rede também
  if (path.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => new Response('{}', {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Tudo mais (imagens, fontes) → cache primeiro, atualiza em background
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response && response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => null);

        return cached || fetchPromise || new Response('', { status: 503 });
      })
    )
  );
});

/* ── FALLBACK OFFLINE ────────────────────────────────────── */
function criarFallback(path) {
  if (path.endsWith('tabela.js')) {
    return new Response(
      'var historicoSerieA = []; var historicoSerieB = [];',
      { status: 200, headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
    );
  }
  if (path.endsWith('escalacoes.js')) {
    return new Response(
      'var bancoEscalacoes = {};',
      { status: 200, headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
    );
  }
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TAÇA NATTOS</title>
    <style>body{background:#111827;color:#f59e0b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}</style>
    </head><body><h1>⚽ TAÇA NATTOS 2026</h1><p>Você está offline.</p></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/* ── NOTIFICAÇÕES DE NOVA RODADA ────────────────────────── */
self.addEventListener('message', async event => {
  if (!event.data || event.data.tipo !== 'VERIFICAR_RODADA') return;

  const { rodadaAtual, serieAtiva } = event.data;
  const chave = `ultima_rodada_${serieAtiva}`;

  try {
    const db = await abrirDB();
    const ultimaRodada = await lerValor(db, chave);

    if (ultimaRodada !== null && rodadaAtual > ultimaRodada) {
      await gravarValor(db, chave, rodadaAtual);
      if (Notification.permission === 'granted') {
        self.registration.showNotification('⚽ TAÇA NATTOS 2026', {
          body: `Nova rodada disponível: Rodada ${rodadaAtual}`,
          icon: 'CARTOLA.png',
          badge: 'CARTOLA.png',
          tag: `rodada-${serieAtiva}-${rodadaAtual}`,
          renotify: true,
          data: { url: 'https://joseir11.github.io/CARTOLA_BMP/CARTOLA_BMP.html' }
        });
      }
    } else if (ultimaRodada === null) {
      await gravarValor(db, chave, rodadaAtual);
    }
  } catch (err) {
    console.error('[SW] Erro ao verificar rodada:', err);
  }
});

/* ── CLIQUE NA NOTIFICAÇÃO ──────────────────────────────── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlAlvo = event.notification.data?.url || 'https://joseir11.github.io/CARTOLA_BMP/CARTOLA_BMP.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('/CARTOLA_BMP/') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlAlvo);
    })
  );
});

/* ── INDEXEDDB HELPERS ──────────────────────────────────── */
function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('nattos-sw', 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

function lerValor(db, chave) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly');
    const req = tx.objectStore('kv').get(chave);
    req.onsuccess = e => resolve(e.target.result ?? null);
    req.onerror = e => reject(e.target.error);
  });
}

function gravarValor(db, chave, valor) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    const req = tx.objectStore('kv').put(valor, chave);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}
