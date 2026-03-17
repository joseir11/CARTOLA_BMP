/* ============================================================
   SERVICE WORKER — TAÇA NATTOS 2026  •  Versão: 5.0 (corrigido)

   REGRAS ATUALIZADAS:
   - index.html, tabela.js, escalacoes.js → SEMPRE da rede (timestamp na URL)
   - Demais estáticos → cache com stale-while-revalidate
   ============================================================ */

const CACHE_NAME = 'nattos-v6'; 

// Arquivos que NUNCA devem ser cacheados (agora tratados com timestamp)
const ARQUIVOS_CRITICOS = ['index.html', 'tabela.js', 'escalacoes.js'];

// Arquivos estáticos que podem ser cacheados com segurança
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
      // Cacheia apenas os estáticos, um por um (sem travar se algum falhar)
      return Promise.allSettled(
        ARQUIVOS_ESTATICOS.map(arquivo => {
          return cache.add(arquivo).catch(err => {
            console.warn('[SW] Não cacheou:', arquivo, '-', err.message);
          });
        })
      );
    }).then(() => {
      console.log('[SW] Instalação OK');
      return self.skipWaiting(); // Ativa o SW imediatamente
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
    )).then(() => self.clients.claim()) // Assume controle de todas as abas
  );
});

/* ── INTERCEPTAÇÃO DE REQUISIÇÕES ───────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const nomeArquivo = url.pathname.split('/').pop();

  // ── ARQUIVOS CRÍTICOS: SEMPRE DA REDE (com timestamp) ──
  if (ARQUIVOS_CRITICOS.includes(nomeArquivo)) {
    // Adiciona timestamp para evitar qualquer cache
    url.searchParams.set('t', Math.floor(Date.now() / 1000));

    const novaRequisicao = new Request(url.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store' // Desabilita cache HTTP
    });

    event.respondWith(
      fetch(novaRequisicao)
        .then(response => {
          if (response && response.ok) return response;
          // Se a resposta não for ok, tenta fallback
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

  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') return;

  // ── FONTES DO GOOGLE: cache permanente ─────────────────
  if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── RECURSOS DO MESMO DOMÍNIO: Stale-While-Revalidate ───
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cached => {
        // Sempre tenta atualizar em background
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Retorna cache imediatamente se existir; senão espera a rede
        return cached || fetchPromise || new Response('Offline', { status: 503 });
      });
    })
  );
});

/* ── FALLBACK PARA ARQUIVOS DINÂMICOS OFFLINE ───────────── */
function criarFallback(pathname) {
  if (pathname.endsWith('tabela.js')) {
    // Retorna variáveis vazias válidas para não quebrar o app
    return new Response(
      'var historicoSerieA = []; var historicoSerieB = [];',
      { 
        status: 200,
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' } 
      }
    );
  }
  if (pathname.endsWith('escalacoes.js')) {
    return new Response(
      'var bancoEscalacoes = {};',
      { 
        status: 200,
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' } 
      }
    );
  }
  if (pathname.endsWith('index.html') || pathname.endsWith('/')) {
    // Para index.html offline, retorna uma página mínima
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TAÇA NATTOS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>body{background:#111827;color:#f59e0b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}</style>
      </head><body><div><h1>⚽ TAÇA NATTOS 2026</h1><p>Você está offline.<br>Conecte-se para ver a tabela atualizada.</p></div></body></html>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      }
    );
  }
  return new Response('', { status: 503 });
}

/* ── NOTIFICAÇÕES DE NOVA RODADA (mantido igual) ─────────── */
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

/* ── CLIQUE NA NOTIFICAÇÃO (mantido igual) ───────────────── */
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

/* ── INDEXEDDB HELPERS (mantido igual) ───────────────────── */
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
