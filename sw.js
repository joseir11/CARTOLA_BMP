<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TAÇA NATTOS 2026</title>

<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#f59e0b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="TAÇA NATTOS">
<link rel="apple-touch-icon" href="CARTOLA.png">
<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Teko:wght@600;700&display=swap" rel="stylesheet">

<style>
:root {
  --green: #22c55e;
  --red: #ef4444;
  --orange: #f59e0b;
  --bg: #111827;
  --topo-grad: rgba(17, 24, 39, 0.8);
  --text-light: #e5e7eb;
}

@font-face {
  font-family: 'Fontecartola';
  src: url('Fontecartola.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: #fff;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}

.header {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: var(--topo-grad);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-topo-mobile { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 15px;
}

.titulo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.titulo-principal { 
  font-family: 'Teko', sans-serif;
  font-size: 50px; 
  font-weight: 700; 
  color: var(--orange); 
  line-height: 0.9;
  text-transform: uppercase;
  text-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
}

.ano-titulo {
  font-family: 'Teko', sans-serif;
  font-size: 18px;
  color: #ffffff;
  align-self: flex-end;
  margin-top: -5px;
}

.header-controles-mobile { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 10px;
}

.container-logo-bola {
  width: 62px;
  height: 62px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15);
  flex-shrink: 0;
}

.logo-campeonato { 
  height: 55px; 
  width: auto; 
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
}

.toggle-visual { 
  width: 90px; 
  background: rgba(255,255,255,0.08); 
  border-radius: 999px; 
  padding: 4px; 
  display: flex; 
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.05);
}

.toggle-btn { 
  width: 36px; height: 36px; 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  cursor: pointer; border: none; background: transparent; 
  color: #9ca3af; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn.ativo { 
  background: var(--orange); color: #000; 
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.icon-vertical { transform: rotate(90deg); }

.badge-rdd { 
  display: flex; align-items: center; justify-content: flex-start;
  gap: 10px; background: rgba(255,255,255,0.08); 
  padding: 4px 18px 4px 4px; border-radius: 999px; height: 44px;
  border: 1px solid rgba(255,255,255,0.05); min-width: 110px;
  position: relative; cursor: pointer;
}
.bola-rdd { 
  width: 36px; height: 36px; border-radius: 50%; background: var(--orange); 
  display: flex; align-items: center; justify-content: center; 
  font-weight: 900; color: #000; font-size: 11px; flex-shrink: 0;
}
.texto-rdd { 
  font-family: 'Fontecartola', 'Inter', sans-serif; 
  font-weight: 800; font-size: 22px; color: var(--text-light); 
  line-height: 1; letter-spacing: 0.5px;
}

.bloco-series {
  display: flex; align-items: center; justify-content: center;
  gap: 15px; margin: 10px 0;
}

.titulo-serie {
  font-family: 'Fontecartola', 'Inter', sans-serif;
  font-weight: 800; font-size: 22px; color: var(--text-light);
  line-height: 1; letter-spacing: 0.5px;
}

.seletor-series-badge {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.08); padding: 4px;
  border-radius: 999px; height: 44px;
  border: 1px solid rgba(255,255,255,0.05);
}

.btn-serie {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-family: 'Fontecartola', 'Inter', sans-serif;
  font-weight: 900; font-size: 22px; color: #9ca3af;
  background: transparent; border: none; transition: all 0.3s ease;
}

.btn-serie.ativo {
  background: var(--orange); color: #000;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.visualizacao-topo {
  display: none; align-items: center; justify-content: space-between;
  margin: 10px 20px; width: calc(100% - 40px);
}

.btn-voltar {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; background: rgba(255,255,255,0.08);
  border-radius: 50%; border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: all 0.3s ease; flex-shrink: 0;
}
.btn-voltar svg { width: 24px; height: 24px; stroke: var(--orange); }

.nome-time-central {
  font-family: 'Fontecartola', 'Inter', sans-serif;
  font-weight: 800; font-size: 24px; color: var(--orange);
  text-transform: uppercase; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  text-align: center; flex: 1; margin: 0 15px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.valorizacao-container {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,0,0,0.3); padding: 4px 12px 4px 8px;
  border-radius: 30px; border: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.icone-cs { width: 28px; height: 28px; object-fit: contain; }

.valorizacao-rodada {
  font-family: 'Teko', sans-serif; font-weight: 700;
  font-size: 26px; color: white; line-height: 1;
}
.valorizacao-rodada.negativo { color: var(--red); }

.campo, .campo-limpo {
  position: relative; margin: 0 auto;
  width: 95%; max-width: 520px; aspect-ratio: 9/14;
  border-radius: 24px; overflow: visible;
  background: #0f172a url('campo.png') center/cover no-repeat;
  border: 2px solid rgba(34,197,94,0.15);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.jogador-card {
  position: absolute; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  z-index: 10; width: 80px;
}

.logo-clube-escalacao {
  height: 55px; width: auto; object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(255,255,255,0.6));
}

.nome-jogador {
  font-family: 'Teko', sans-serif; font-weight: 400; font-size: 14px;
  color: #f59e0b; padding: 2px 18px; border-radius: 20px;
  margin-top: 1px; text-align: center; white-space: nowrap;
  max-width: 160px; overflow: hidden; text-overflow: ellipsis;
}

.valor-jogador {
  font-family: 'Teko', sans-serif; font-weight: 700; font-size: 18px;
  position: absolute; top: -25px; right: 25px;
  color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); z-index: 15;
}
.valor-jogador.negativo { color: var(--red); }

.card-time {
  position: absolute; width: 100px; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center; z-index: 10;
}

.logo-campo { 
  width: 78px; height: 78px; object-fit: contain; 
  filter: drop-shadow(0 8px 12px rgba(0,0,0,0.7));
  cursor: pointer; transition: transform 0.2s ease;
}

.badge-pontos-campo {
  background: var(--orange); color: #000;
  font-weight: 900; font-size: 13px; padding: 3px 10px;
  border-radius: 20px; margin-top: 2px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  display: flex; align-items: center; gap: 5px;
  cursor: pointer;
}
.badge-lider { background: var(--green) !important; color: white !important; }
.badge-rebaixamento { background: var(--red) !important; color: white !important; }

.posicao-campo {
  position: absolute; top: 40px; right: -5px;
  font-family: 'Teko'; font-size: 40px;
  text-shadow: 2px 2px 4px #000; z-index: 20;
}

.trofeu-campo {
  position: absolute; width: 50px;
  transform: translate(-50%, -50%); z-index: 5;
  pointer-events: none;
}

.garcom {
  position: absolute; height: 128px; width: auto;
  transform: translate(-180%, -45%);
  z-index: 5; pointer-events: none;
}

.pop-detalhes {
  position: absolute; bottom: 120%; left: 50%;
  transform: translateX(-50%);
  background: #1e293b; color: #f1f5f9; padding: 12px;
  border-radius: 12px; width: 170px; font-size: 11px;
  z-index: 999; display: none; border: 1px solid rgba(255,255,255,0.1);
}

.lista-container { 
  width: 95%; max-width: 600px; margin: 0 auto; background: #1e293b; 
  border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
}
.tabela-times { width: 100%; border-collapse: collapse; }
.tabela-times td { padding: 14px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.td-posicao { font-family: 'Teko'; font-size: 24px; font-weight: 700; color: #64748b; text-align: center; }
.td-escudo img { width: 44px; height: 44px; cursor: pointer; }
.td-nome { font-family: 'Fontecartola', 'Inter', sans-serif; font-weight: 800; font-size: 20px; text-transform: uppercase; }
.pontuacao-total { font-weight: 900; font-size: 18px; color: var(--orange); }

#install-container { position: fixed; bottom: 20px; right: 16px; z-index: 9999; }
.icone-instalar { width: 60px; height: 60px; }
.offline-indicator { background: var(--red); color: white; text-align: center; padding: 5px; position: fixed; top: 0; left: 0; right: 0; z-index: 1001; }
</style>
</head>
<body onclick="fecharTodosCards()">

<div id="offlineIndicator" class="offline-indicator" style="display:none;">
  ⚠️ Você está offline. Alguns dados podem não estar disponíveis.
</div>

<div class="header">
  <div class="header-topo-mobile">
    <div class="container-logo-bola">
      <img src="CARTOLA.png" class="logo-campeonato" alt="Logo">
    </div>
    <div class="titulo-wrapper">
      <div class="titulo-principal">TAÇA NATTOS</div>
      <div class="ano-titulo">2026</div>
    </div>
  </div>
  <div class="header-controles-mobile">
    <div class="toggle-visual">
      <button class="toggle-btn ativo" id="btnCampo" onclick="mudarVisual('campo')">
        <svg class="icon-vertical" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="12" y1="5" x2="12" y2="19"></line><circle cx="12" cy="12" r="2.5"></circle></svg>
      </button>
      <button class="toggle-btn" id="btnLista" onclick="mudarVisual('lista')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="3" width="16" height="18" rx="2"></rect><rect x="9" y="1" width="6" height="4" rx="1"></rect><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
      </button>
    </div>
    <div class="badge-rdd">
      <div class="bola-rdd">RDD</div>
      <div id="info-rdd-topo" class="texto-rdd">-- / 19</div>
      <select id="seletor-rodada" onchange="alterarRodadaManual(this.value)" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;"></select>
    </div>
  </div>
</div>

<div class="visualizacao-topo" id="visualizacaoTopo">
  <div class="btn-voltar" onclick="voltarParaCampo()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
  </div>
  <div class="nome-time-central" id="nomeTimeCentral"></div>
  <div class="valorizacao-container">
    <img src="CS.png" class="icone-cs" alt="CS" onerror="this.style.display='none'">
    <div class="valorizacao-rodada" id="valorizacaoRodada">0.00</div>
  </div>
</div>

<div class="bloco-series">
  <div class="titulo-serie">SÉRIES</div>
  <div class="seletor-series-badge">
    <div class="btn-serie ativo" data-serie="A" onclick="selecionarSerie('A')">A</div>
    <div class="btn-serie" data-serie="B" onclick="selecionarSerie('B')">B</div>
  </div>
</div>

<div id="containerA"><div id="displayA"></div></div>
<div id="containerB" style="display:none"><div id="displayB"></div></div>

<div id="install-container" style="display:none;">
  <button id="install-button" style="background:none; border:none; cursor:pointer;">
    <img src="install.png" alt="Instalar" class="icone-instalar">
  </button>
</div>

<script>
  (function() {
    const v = Date.now();
    function loadJS(src) {
      return new Promise(resolve => {
        const s = document.createElement('script');
        s.src = src + '?v=' + v;
        s.async = false;
        s.onload = resolve;
        document.head.appendChild(s);
      });
    }
    Promise.all([loadJS('tabela.js'), loadJS('escalacoes.js')])
      .then(() => { 
        console.log('DADOS CARREGADOS:', v); 
        initApp(); 
      });
  })();
</script>

<script>
/* ============================================================
   TAÇA NATTOS 2026 — SCRIPT PRINCIPAL
   ============================================================ */

const posicoesPorFormacao = {
  "343": [{t:23,l:50,pos:"ATA"},{t:25,l:20,pos:"ATA"},{t:25,l:80,pos:"ATA"},{t:42,l:50,pos:"MEI"},{t:42,l:15,pos:"MEI"},{t:44,l:50,pos:"MEI"},{t:44,l:85,pos:"MEI"},{t:67,l:15,pos:"ZAG"},{t:65,l:50,pos:"ZAG"},{t:67,l:85,pos:"ZAG"},{t:85,l:50,pos:"GOL"},{t:85,l:15,pos:"TEC"}],
  "352": [{t:23,l:30,pos:"ATA"},{t:23,l:70,pos:"ATA"},{t:42,l:50,pos:"MEI"},{t:44,l:15,pos:"MEI"},{t:44,l:85,pos:"MEI"},{t:50,l:30,pos:"MEI"},{t:50,l:70,pos:"MEI"},{t:65,l:15,pos:"ZAG"},{t:67,l:50,pos:"ZAG"},{t:65,l:85,pos:"ZAG"},{t:85,l:50,pos:"GOL"},{t:85,l:15,pos:"TEC"}],
  "433": [{t:23,l:50,pos:"ATA"},{t:27,l:20,pos:"ATA"},{t:27,l:80,pos:"ATA"},{t:42,l:50,pos:"MEI"},{t:44,l:15,pos:"MEI"},{t:44,l:85,pos:"MEI"},{t:64,l:15,pos:"LAT"},{t:67,l:38,pos:"ZAG"},{t:67,l:62,pos:"ZAG"},{t:64,l:85,pos:"LAT"},{t:85,l:50,pos:"GOL"},{t:85,l:15,pos:"TEC"}],
  "442": [{t:23,l:30,pos:"ATA"},{t:23,l:70,pos:"ATA"},{t:40,l:15,pos:"MEI"},{t:44,l:38,pos:"MEI"},{t:44,l:62,pos:"MEI"},{t:40,l:85,pos:"MEI"},{t:64,l:15,pos:"LAT"},{t:67,l:38,pos:"ZAG"},{t:67,l:62,pos:"ZAG"},{t:64,l:85,pos:"LAT"},{t:85,l:50,pos:"GOL"},{t:85,l:15,pos:"TEC"}],
  "532": [{t:23,l:30,pos:"ATA"},{t:23,l:70,pos:"ATA"},{t:44,l:15,pos:"MEI"},{t:42,l:50,pos:"MEI"},{t:42,l:85,pos:"MEI"},{t:67,l:15,pos:"LAT"},{t:65,l:30,pos:"ZAG"},{t:65,l:45,pos:"ZAG"},{t:65,l:60,pos:"ZAG"},{t:67,l:85,pos:"LAT"},{t:85,l:50,pos:"GOL"},{t:85,l:15,pos:"TEC"}]
};

const posCampo = [{t:23,l:50},{t:25,l:20},{t:25,l:80},{t:42,l:50},{t:44,l:15},{t:44,l:85},{t:65,l:15},{t:67,l:50},{t:65,l:85},{t:85,l:50}];
const posTrofeu = {t:10,l:51};

let modoAtivo = 'campo', serieAtiva = 'A', rodadaSelecionada = 0, rodadaMaximaGlobal = 0;
let dadosSerieA = [], dadosSerieB = [], visualizandoTime = false, timeSelecionado = null, deferredPrompt;

// SERVICE WORKER REGISTRO
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => reg.update());
  });
}

function initApp() {
  window.historicoSerieA = window.historicoSerieA || [];
  window.historicoSerieB = window.historicoSerieB || [];
  window.bancoEscalacoes = window.bancoEscalacoes || {};
  const res = processarDados(historicoSerieA);
  rodadaSelecionada = res.rdd || 1;
  atualizarTelas();
}

function processarDados(hist, rddAlvo) {
  if (!hist || !hist.length) return { ranking: [], rdd: 0 };
  let max = 0;
  hist.forEach(i => { if (i.rdd > max) max = i.rdd; });
  if (max > rodadaMaximaGlobal) rodadaMaximaGlobal = max;
  const limite = rddAlvo || max, agrupado = {};
  hist.forEach(i => {
    if (i.rdd > limite) return;
    if (!agrupado[i.nome]) agrupado[i.nome] = { nome:i.nome, total:0, somaRDD:0, somaRE:0, somaPEN:0, rodadas:[] };
    agrupado[i.nome].somaRDD += i.val || 0;
    agrupado[i.nome].somaRE += i.re || 0;
    agrupado[i.nome].somaPEN += i.pen || 0;
    agrupado[i.nome].rodadas.push(i);
  });
  const lista = Object.values(agrupado).map(t => {
    t.total = (t.somaRDD + t.somaRE) - t.somaPEN;
    const ult = t.rodadas.reduce((p,c) => p.rdd > c.rdd ? p : c, {val:0});
    t.ultimaRDDVal = ult.val;
    return t;
  }).sort((a,b) => b.total - a.total);
  return { ranking: lista, rdd: limite };
}

function atualizarSeletorRodadas() {
  const sel = document.getElementById('seletor-rodada');
  if (!sel) return; sel.innerHTML = '';
  for (let i = 1; i <= rodadaMaximaGlobal; i++) {
    const o = document.createElement('option');
    o.value = i; o.innerText = `Rodada ${String(i).padStart(2,'0')}`;
    if (i === rodadaSelecionada) o.selected = true;
    sel.appendChild(o);
  }
}

function alterarRodadaManual(rdd) {
  rodadaSelecionada = parseInt(rdd);
  visualizandoTime ? mostrarTime(timeSelecionado) : atualizarTelas();
}

function atualizarTelas() {
  const resA = processarDados(historicoSerieA, rodadaSelecionada);
  const resB = processarDados(historicoSerieB, rodadaSelecionada);
  dadosSerieA = resA.ranking; dadosSerieB = resB.ranking;
  document.getElementById('info-rdd-topo').innerText = `${String(rodadaSelecionada).padStart(2,'0')} / 19`;
  atualizarSeletorRodadas();
  renderSecao('displayA', dadosSerieA, true);
  renderSecao('displayB', dadosSerieB, false);
}

function renderSecao(id, data, isA) {
  const container = document.getElementById(id);
  if (!container || visualizandoTime) return;
  container.innerHTML = '';
  if (!data.length) { container.innerHTML = '<div style="text-align:center;padding:20px;">Sem dados</div>'; return; }

  if (modoAtivo === 'campo') {
    const campo = document.createElement('div');
    campo.className = 'campo';
    campo.innerHTML = `<img src="TROFEU_NATTOS.png" class="trofeu-campo" style="top:${posTrofeu.t}%;left:${posTrofeu.l}%">`;
    data.forEach((t, i) => {
      const p = posCampo[i]; if (!p) return;
      const bClass = (isA && i >= 8) ? 'badge-rebaixamento' : (!isA && i <= 1) ? 'badge-lider' : '';
      campo.innerHTML += `
        <div class="card-time" style="top:${p.t}%;left:${p.l}%">
          <div class="posicao-campo">${i+1}</div>
          <img class="logo-campo" src="ESCUDOS/${t.nome}.png" onclick="mostrarTime('${t.nome}')" onerror="this.src='ESCUDOS/default.png'">
          <div class="badge-pontos-campo ${bClass}" onclick="alternarCard(event,'${id+i}')">${t.total.toFixed(2)}</div>
          <div class="pop-detalhes" id="pop-${id+i}"><b>${t.nome.replace(/_/g,' ')}</b><br>Total: ${t.total.toFixed(2)}</div>
        </div>`;
    });
    container.appendChild(campo);
  } else {
    let html = '<div class="lista-container"><table class="tabela-times">';
    data.forEach((t, i) => {
      html += `<tr><td class="td-posicao">${i+1}</td><td class="td-escudo"><img src="ESCUDOS/${t.nome}.png" onclick="mostrarTime('${t.nome}')"></td><td class="td-nome">${t.nome}</td><td class="pontuacao-total">${t.total.toFixed(2)}</td></tr>`;
    });
    container.innerHTML = html + '</table></div>';
  }
}

function mostrarTime(nome) {
  visualizandoTime = true; timeSelecionado = nome;
  document.querySelector('.bloco-series').style.display = 'none';
  document.getElementById('visualizacaoTopo').style.display = 'flex';
  document.getElementById('nomeTimeCentral').innerText = nome.replace(/_/g,' ');
  const container = serieAtiva === 'A' ? 'displayA' : 'displayB';
  document.getElementById('displayA').innerHTML = ''; document.getElementById('displayB').innerHTML = '';
  
  const esc = buscarEscalacao(nome, rodadaSelecionada);
  if (esc) { renderEscalacao(esc.formacao, esc.jogadores, container); }
  else { document.getElementById(container).innerHTML = '<div class="campo-limpo"></div>'; }
}

function buscarEscalacao(nome, rdd) {
  const d = bancoEscalacoes[nome]; if (!d) return null;
  let i = 0;
  while(i < d.length) {
    if (d[i].rdd === rdd) {
      const f = d[i].formacao, j = []; i++;
      while(i < d.length && d[i].rdd === undefined) { j.push(d[i]); i++; }
      return { formacao: f, jogadores: j };
    }
    i++;
  }
  return null;
}

function renderEscalacao(form, jogs, id) {
  const container = document.getElementById(id), pos = posicoesPorFormacao[form], campo = document.createElement('div');
  campo.className = 'campo';
  const porPos = { GOL:[], ZAG:[], LAT:[], MEI:[], ATA:[], TEC:[] };
  jogs.filter(j => j.status === 'T').forEach(j => porPos[j.pos].push(j));
  pos.forEach(p => {
    const j = porPos[p.pos].shift(); if (!j) return;
    campo.innerHTML += `<div class="jogador-card" style="top:${p.t}%;left:${p.l}%"><img class="logo-clube-escalacao" src="TIMES/${j.clube}.png" onerror="this.src='TIMES/default.png'"><div class="nome-jogador">${j.nome}</div><div class="valor-jogador">${j.val.toFixed(2)}</div></div>`;
  });
  container.appendChild(campo);
}

function voltarParaCampo() {
  visualizandoTime = false;
  document.querySelector('.bloco-series').style.display = 'flex';
  document.getElementById('visualizacaoTopo').style.display = 'none';
  atualizarTelas();
}

function selecionarSerie(s) {
  serieAtiva = s;
  document.querySelectorAll('.btn-serie').forEach(b => b.classList.toggle('ativo', b.dataset.serie === s));
  document.getElementById('containerA').style.display = s === 'A' ? 'block' : 'none';
  document.getElementById('containerB').style.display = s === 'B' ? 'block' : 'none';
  if (!visualizandoTime) atualizarTelas();
}

function mudarVisual(v) { modoAtivo = v; atualizarTelas(); }
function fecharTodosCards() { document.querySelectorAll('.pop-detalhes').forEach(p => p.style.display = 'none'); }
function alternarCard(e, id) { e.stopPropagation(); fecharTodosCards(); document.getElementById('pop-'+id).style.display = 'block'; }
</script>
</body>
</html>
