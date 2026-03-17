/* ============================================================
   SERVICE WORKER — TAÇA NATTOS 2026

   ⚠️ A CADA NOVA RODADA, MUDE O CACHE_NAME:
      Rodada  6 → nattos-v60   ← atual
      Rodada  7 → nattos-v70
      Rodada  8 → nattos-v80
      Rodada  9 → nattos-v90
      Rodada 10 → nattos-v100
      ... e assim por diante.

   COMO FUNCIONA:
   - tabela.js, escalacoes.js, index.html → SEMPRE da rede, NUNCA cacheados
   - Estáticos (imagens, fontes) → cache com revalidação em background
   - Mudar o CACHE_NAME força TODOS os navegadores a reinstalar o SW
   ============================================================ */

// ⚠️ ESTE VALOR É ATUALIZADO AUTOMATICAMENTE — NÃO EDITE À MÃO
// Gerado em: cada vez que você rodar o script de deploy
// ⚠️ MUDE ESTE NÚMERO A CADA RODADA: v60=rdd6, v70=rdd7, v80=rdd8...
const CACHE_NAME = 'nattos-v60';

const ARQUIVOS_CRITICOS = ['index.html', 'tabela.js', 'escalacoes.js'];

const ARQUIVOS_ESTATICOS = [
  'campo.png',
  'CARTOLA.png',
  'CS.png',
  'TROFEU_NATTOS.png',
  'manifest.json',
  'Fontecartola.otf',
  'icon-192.png',
  'icon-512.png'
];

/* ── INSTALAÇÃO ─────────────────────────────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Instalando', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ARQUIVOS_ESTATICOS.map(arquivo =>
          cache.add(arquivo).catch(err =>
            console.warn('[SW] Não cacheou:', arquivo, '-', err.message)
          )
        )
      );
    }).then(() => {
      console.log('[SW] Instalação OK');
      return self.skipWaiting();
    })
  );
});

/* ── ATIVAÇÃO (limpa caches antigos) ─────────────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Ativando', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k !== CACHE_NAME)
        .map(k => {
          console.log('[SW] Deletando cache antigo:', k);
          return caches.delete(k);
        })
    )).then(() => self.clients.claim())
  );
});

/* ── INTERCEPTAÇÃO DE REQUISIÇÕES ───────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const nomeArquivo = url.pathname.split('/').pop();

  // ── ARQUIVOS CRÍTICOS: SEMPRE DA REDE, NUNCA DO CACHE ──
  if (ARQUIVOS_CRITICOS.some(c => nomeArquivo === c || url.pathname.endsWith('/' + c))) {
    const novaRequisicao = new Request(event.request.url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });

    event.respondWith(
      fetch(novaRequisicao)
        .then(response => {
          if (response && response.ok) return response;
          console.warn('[SW] Resposta inválida para:', nomeArquivo, response?.status);
          return criarFallback(nomeArquivo);
        })
        .catch(err => {
          console.warn('[SW] Offline para:', nomeArquivo, err.message);
          return criarFallback(nomeArquivo);
        })
    );
    return;
  }

  if (event.request.method !== 'GET') return;

  // ── FONTES DO GOOGLE: cache permanente ─────────────────
  if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── RECURSOS DO MESMO DOMÍNIO: Stale-While-Revalidate ──
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        return cached || fetchPromise || new Response('Offline', { status: 503 });
      })
    )
  );
});

/* ── FALLBACK OFFLINE ───────────────────────────────────── */
function criarFallback(pathname) {
  if (pathname.endsWith('tabela.js')) {
    return new Response(
      'var historicoSerieA = []; var historicoSerieB = [];',
      { status: 200, headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
    );
  }
  if (pathname.endsWith('escalacoes.js')) {
    return new Response(
      'var bancoEscalacoes = {};',
      { status: 200, headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
    );
  }
  if (pathname.endsWith('index.html') || pathname.endsWith('/')) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TAÇA NATTOS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>body{background:#111827;color:#f59e0b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}</style>
      </head><body><div><h1>⚽ TAÇA NATTOS 2026</h1><p>Você está offline.<br>Conecte-se para ver a tabela atualizada.</p></div></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
  return new Response('', { status: 503 });
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
