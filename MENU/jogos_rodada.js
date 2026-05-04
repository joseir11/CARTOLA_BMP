/* ============================================================
   JOGOS DA RODADA — COM VALORIZAÇÃO AWS E STATUS CORRIGIDO
   ============================================================ */

const mainContent = document.getElementById("main-content");
const btnJogos = document.getElementById("btn-jogos");
const ESCUDOS_PATH = "./ESCUDOS_BRASILEIRAO";

let jogosRenderizando = false;

function renderLoader() {
  mainContent.innerHTML = `<div class="flex flex-col justify-center items-center h-screen"><div class="loader"></div><p class="text-xs mt-2">Carregando...</p></div>`;
}
function renderError(msg) {
  mainContent.innerHTML = `<div class="text-center py-10"><p class="text-red-500">${msg}</p><button onclick="window.carregarJogos()" class="mt-4 px-4 py-2 bg-black text-white rounded-full">Tentar novamente</button></div>`;
}
function formatarData(iso) {
  if (!iso) return "A definir";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}`;
}
function formatarPosicao(pos) { return pos ? `${pos}º` : ""; }
function formatarFechamento(f) { if(!f) return "--/-- --:--"; return `${String(f.dia).padStart(2,"0")}/${String(f.mes).padStart(2,"0")} ${String(f.hora).padStart(2,"0")}:${String(f.minuto).padStart(2,"0")}`; }
function statusMercado(s) {
  const m = {1:{l:"ABERTO",c:"text-emerald-500",t:"MERCADO FECHA"},2:{l:"FECHADO",c:"text-rose-500",t:"FECHADO EM"},3:{l:"ATUALIZANDO",c:"text-amber-500",t:"AGUARDE"},4:{l:"MANUTENÇÃO",c:"text-gray-500",t:"EM MANUTENÇÃO"},6:{l:"ENCERRADO",c:"text-gray-500",t:"FIM DE TEMPORADA"}};
  return m[s]||{l:"—",c:"text-gray-400",t:"—"};
}
function renderStatusMercado(mercado) {
  const s = statusMercado(mercado.status_mercado);
  return `<div class="bg-white rounded-2xl shadow-sm border mx-4 mb-4"><div class="bg-orange-50 px-4 py-2.5 border-b"><p class="text-xl font-black text-center">Jogos da Rodada</p></div><div class="grid grid-cols-3 divide-x p-5"><div class="text-center"><p class="text-[10px] text-gray-400">Rodada Atual</p><p class="text-2xl font-black">${mercado.rodada_atual??"-"}</p></div><div class="text-center"><p class="text-[10px] text-gray-400">Status</p><p class="text-2xl font-black ${s.c}">${s.l}</p></div><div class="text-center"><p class="text-[10px] text-gray-400">${s.t}</p><p class="text-lg font-black">${formatarFechamento(mercado.fechamento)}</p></div></div></div>`;
}
function renderAproveitamento(aprov) {
  if(!Array.isArray(aprov)) return "";
  const cores = {v:"bg-emerald-200",d:"bg-rose-200",e:"bg-gray-200"};
  return `<div class="flex justify-center gap-1 mt-2">${aprov.map(r=>`<span class="w-2 h-2 rounded-full ${cores[r]||"bg-gray-100"}"></span>`).join("")}</div>`;
}

// ========== FUNÇÃO RENDER CARD (COM STATUS CORRIGIDO) ==========
function renderCardPartida(p, clubes) {
  const casa = clubes[p.clube_casa_id], fora = clubes[p.clube_visitante_id];
  const placarC = p.placar_oficial_mandante ?? "-";
  const placarF = p.placar_oficial_visitante ?? "-";
  const jogoIniciado = p.placar_oficial_mandante !== null;

  // Lógica de status baseada no período e status de transmissão
  let statusTexto = "";
  let statusCor = "";
  
  // Prioridade: período PRE_JOGO -> AGUARDANDO
  if (p.periodo_tr === "PRE_JOGO") {
    statusTexto = "AGUARDANDO";
    statusCor = "text-gray-400";
  } 
  // Jogo em andamento (1º tempo, 2º tempo, intervalo, etc.)
  else if (p.periodo_tr === "PRIMEIRO_TEMPO" || p.periodo_tr === "SEGUNDO_TEMPO" || p.periodo_tr === "INTERVALO") {
    statusTexto = "EM ANDAMENTO";
    statusCor = "text-green-600";
  }
  // Partida encerrada
  else if (p.status_transmissao_tr === "ENCERRADA" || p.status_transmissao_tr === "POS_JOGO") {
    statusTexto = "ENCERRADA";
    statusCor = "text-red-500";
  }
  // Caso "CRIADA" e válida
  else if (p.valida === true && p.status_transmissao_tr === "CRIADA") {
    statusTexto = "AGUARDANDO";
    statusCor = "text-gray-400";
  }
  // Fallback: usa o status_transmissao_tr
  else {
    statusTexto = p.status_transmissao_tr ? p.status_transmissao_tr.replace(/_/g, " ") : "—";
    statusCor = "text-gray-400";
  }

  return `<div class="match-card bg-white rounded-2xl shadow-sm border p-4 mb-3 cursor-pointer" data-partida-id="${p.partida_id}">
    <p class="text-[10px] text-gray-400 text-center mb-2">${formatarData(p.partida_data)} • ${p.local || "-"}</p>
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 text-center">
        <span class="text-[11px] text-gray-400">${formatarPosicao(p.clube_casa_posicao)}</span>
        <img src="${ESCUDOS_PATH}/${p.clube_casa_id}.png" class="w-12 h-12 mx-auto" onerror="this.src='${casa?.escudos?.["60x60"] || ""}'">
        <span class="text-sm font-black block">${casa?.abreviacao || "?"}</span>
        ${renderAproveitamento(p.aproveitamento_mandante)}
      </div>
      <div class="text-center">
        <div class="text-2xl font-black pt-3">
          <span class="${jogoIniciado ? "text-black" : "text-gray-300"}">${placarC}</span>
          <span class="text-gray-300"> × </span>
          <span class="${jogoIniciado ? "text-black" : "text-gray-300"}">${placarF}</span>
        </div>
        <div class="text-[9px] font-bold uppercase tracking-wider mt-1 ${statusCor}">${statusTexto}</div>
      </div>
      <div class="flex-1 text-center">
        <span class="text-[11px] text-gray-400">${formatarPosicao(p.clube_visitante_posicao)}</span>
        <img src="${ESCUDOS_PATH}/${p.clube_visitante_id}.png" class="w-12 h-12 mx-auto" onerror="this.src='${fora?.escudos?.["60x60"] || ""}'">
        <span class="text-sm font-black block">${fora?.abreviacao || "?"}</span>
        ${renderAproveitamento(p.aproveitamento_visitante)}
      </div>
    </div>
  </div>`;
}

// ========== MODAL COM CABEÇALHO SEPARADO E VALORIZAÇÃO ==========
function fecharModalScouts() {
  const modal = document.getElementById('modal-scouts');
  if (modal) modal.remove();
}
window.fecharModalScouts = fecharModalScouts;

async function abrirModalScouts(partida, clubes) {
  fecharModalScouts();

  let pontuadosData = window.preloadedPontuadosData;
  let valuationData = null;

  try {
    const promises = [];
    if (!pontuadosData) promises.push(fetch(API_CARTOLA.PONTUADOS()).then(r => r.json()));
    else promises.push(Promise.resolve(pontuadosData));
    
    const rotaValorizacao = API_CARTOLA.AWS_ATLETAS_PONTUADOS || "https://josabet-proxy.onrender.com/aws/atletas-pontuados";
    promises.push(fetch(rotaValorizacao).then(r => r.json()).catch(err => {
      console.error("Erro ao buscar valorização AWS:", err);
      return null;
    }));

    const results = await Promise.all(promises);
    pontuadosData = results[0];
    valuationData = results[1];
  } catch (err) {
    console.error("Erro geral no modal de scouts:", err);
    alert("Erro ao carregar scouts");
    return;
  }

  const atletas = pontuadosData.atletas || {};
  
  const valuationMap = {};
  if (valuationData) {
    const source = valuationData.atletas || valuationData;
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        const val = value.valorizacao !== undefined ? value.valorizacao : 
                    value.valorizacao_real !== undefined ? value.valorizacao_real : 
                    value.variacao;
        if (val !== undefined && val !== null) {
          const numericVal = parseFloat(val);
          valuationMap[String(key)] = numericVal;
          if (value.idAtleta) valuationMap[String(value.idAtleta)] = numericVal;
        }
      }
    });
  }

  const timeCasa = clubes[partida.clube_casa_id];
  const timeFora = clubes[partida.clube_visitante_id];
  const siglaPosicao = { 1: "GOL", 2: "LAT", 3: "ZAG", 4: "MEI", 5: "ATA", 6: "TEC" };
  const scoutEmoji = { "G": "⚽", "A": "👟", "CA": "🟨", "CV": "🟥" };

  const renderizarLista = (timeId) => {
    const atletasArray = Object.entries(atletas).map(([id, data]) => {
      return { ...data, atleta_id: data.atleta_id || id };
    });
    const atletasTime = atletasArray.filter(a => Number(a.clube_id) === Number(timeId) && a.entrou_em_campo === true);
    atletasTime.sort((a,b) => (a.posicao_id || 99) - (b.posicao_id || 99));
    
    const body = document.querySelector('#modal-scouts .modal-body');
    if (!body) return;
    
    if (atletasTime.length === 0) {
      body.innerHTML = `<div class="empty-scouts">NENHUM ATLETA EM CAMPO</div>`;
      return;
    }

    body.innerHTML = atletasTime.map(atleta => {
      const sigla = siglaPosicao[atleta.posicao_id] || "???";
      const scoutsList = Object.entries(atleta.scout || {}).map(([k,v]) => `<span class="scout-item">${v} ${k.toUpperCase()}</span>`).join("");
      let emojis = [];
      if (atleta.scout?.G) emojis.push(scoutEmoji.G);
      if (atleta.scout?.A) emojis.push(scoutEmoji.A);
      if (atleta.scout?.CA) emojis.push(scoutEmoji.CA);
      if (atleta.scout?.CV) emojis.push(scoutEmoji.CV);
      const emojiSpan = emojis.length ? `<span class="scout-emojis">${emojis.join(" ")}</span>` : "";
      const pontuacao = atleta.pontuacao.toFixed(1);
      const pontuacaoClass = atleta.pontuacao >= 0 ? "positiva" : "negativa";

      const atletaIdStr = String(atleta.atleta_id);
      const valorizacao = valuationMap[atletaIdStr];
      let valHtml = "";
      if (valorizacao !== undefined && valorizacao !== null && valorizacao !== 0) {
        const valColor = valorizacao >= 0 ? "text-emerald-500" : "text-rose-500";
        const sinal = valorizacao > 0 ? "+" : "";
        valHtml = `<div class="text-[11px] font-black ${valColor} leading-tight">${sinal}${valorizacao.toFixed(2)}</div>`;
      }

      return `
        <div class="atleta-card">
          <div class="atleta-info">
            <img src="${atleta.foto?.replace("FORMATO", "140x140") || ""}" />
            <div class="atleta-dados">
              <div class="atleta-posicao">${sigla}</div>
              <div class="atleta-nome" style="line-height: 1.2;">${atleta.apelido}</div>
              ${valHtml}
            </div>
          </div>
          <div class="atleta-stats">
            <div class="pontuacao-wrapper">
              <span class="pontuacao ${pontuacaoClass}">${pontuacao}</span>${emojiSpan}
            </div>
            <div class="scouts-wrapper">${scoutsList || '<span class="no-scout">—</span>'}</div>
          </div>
        </div>
      `;
    }).join("");
  };

  const modalHtml = `
    <div id="modal-scouts" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target === this) fecharModalScouts()">
      <div class="relative w-full max-w-md mx-3 bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div class="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
          <h3 class="font-black text-lg text-gray-800" style="font-family: 'FontJogos', sans-serif;">SCOUTS DA PARTIDA</h3>
          <button onclick="fecharModalScouts()" class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="bg-gradient-to-r from-orange-50 to-white px-4 pb-3">
          <div class="flex gap-2">
            <button id="modal-tab-casa" class="flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-white bg-[#ff6321]">
              <img src="./ESCUDOS_BRASILEIRAO/${timeCasa.id}.png" class="w-5 h-5 object-contain" onerror="this.src='${timeCasa.escudos["30x30"]}'"> ${timeCasa.abreviacao}
            </button>
            <button id="modal-tab-fora" class="flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-black bg-gray-200">
              <img src="./ESCUDOS_BRASILEIRAO/${timeFora.id}.png" class="w-5 h-5 object-contain" onerror="this.src='${timeFora.escudos["30x30"]}'"> ${timeFora.abreviacao}
            </button>
          </div>
        </div>
        <div class="modal-body p-4 space-y-2"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  renderizarLista(partida.clube_casa_id);

  const tabCasa = document.getElementById('modal-tab-casa');
  const tabFora = document.getElementById('modal-tab-fora');
  if (tabCasa && tabFora) {
    tabCasa.onclick = () => {
      tabCasa.className = "flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-white bg-[#ff6321]";
      tabFora.className = "flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-black bg-gray-200";
      renderizarLista(partida.clube_casa_id);
    };
    tabFora.onclick = () => {
      tabFora.className = "flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-white bg-[#ff6321]";
      tabCasa.className = "flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-black bg-gray-200";
      renderizarLista(partida.clube_visitante_id);
    };
  }
}

// ========== CARREGAR JOGOS ==========
window.carregarJogos = async function() {
  if (jogosRenderizando) return;
  jogosRenderizando = true;
  renderLoader();
  try {
    let mercado, partidasData;
    if (window.preloadedJogosData) {
      mercado = window.preloadedJogosData.mercado;
      partidasData = window.preloadedJogosData.partidas;
      delete window.preloadedJogosData;
    } else {
      const [resMerc, resPart] = await Promise.all([
        fetch(API_CARTOLA.MERCADO_STATUS),
        fetch(API_CARTOLA.PARTIDAS)
      ]);
      if (!resMerc.ok || !resPart.ok) throw new Error("Falha na API");
      mercado = await resMerc.json();
      partidasData = await resPart.json();
    }
    const partidas = partidasData.partidas || [];
    const clubes = partidasData.clubes || {};
    if (!partidas.length) {
      mainContent.innerHTML = `<div class="pt-6">${renderStatusMercado(mercado)}</div><div class="text-center py-20 text-gray-400">Nenhum jogo</div>`;
    } else {
      const cards = partidas.map(p => renderCardPartida(p, clubes)).join("");
      mainContent.innerHTML = `<div class="pt-6">${renderStatusMercado(mercado)}</div><section class="px-4">${cards}</section>`;
      document.querySelectorAll(".match-card").forEach(card => {
        const id = parseInt(card.dataset.partidaId);
        const partida = partidas.find(p => p.partida_id === id);
        if (partida) {
          card.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalScouts(partida, clubes);
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
    renderError(err.message);
  } finally {
    jogosRenderizando = false;
  }
};

if (btnJogos) {
  btnJogos.addEventListener("click", () => window.carregarJogos());
  console.log("Botão JOGOS ativado");
}

console.log("✅ jogos_rodada.js carregado com valorização AWS e status corrigido (PRE_JOGO -> AGUARDANDO)");