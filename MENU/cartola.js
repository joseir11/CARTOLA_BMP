/* ============================================================
   cartola.js — BMP (Tabela, Campo, Escalações)
   Baseado no script.js do projeto Taça Nattos 2026
   Utiliza as variáveis globais:
     historicoSerieA, historicoSerieB, bancoEscalacoes
   ============================================================ */

let bmpState = {
  activeSerie: "A",
  selectedRound: 0,
  selectedTeam: null,
  viewMode: "campo", // 'campo' ou 'tabela'
};

// ========== FUNÇÕES DE ACESSO AOS DADOS ==========
function getSerieData() {
  return bmpState.activeSerie === "A" ? historicoSerieA : historicoSerieB;
}

function getMaxRound() {
  const serieData = getSerieData();
  if (!serieData || serieData.length === 0) return 0;
  return Math.max(...serieData.map((d) => d.rdd));
}

function getRanking(round) {
  const serieData = getSerieData();
  if (!serieData) return [];
  const roundData = serieData.filter((d) => d.rdd <= round);
  const totals = {};
  roundData.forEach((d) => {
    if (!totals[d.nome]) totals[d.nome] = { nome: d.nome, pontos: 0, re: 0, pen: 0, roundScore: 0 };
    totals[d.nome].pontos += (d.val || 0) + (d.re || 0) - (d.pen || 0);
    if (d.rdd === round) {
      totals[d.nome].re = d.re || 0;
      totals[d.nome].pen = d.pen || 0;
      totals[d.nome].roundScore = (d.val || 0) + (d.re || 0) - (d.pen || 0);
    }
  });
  return Object.values(totals).sort((a, b) => b.pontos - a.pontos);
}

function getMitoOfRound(serie, round) {
  const data = serie === "A" ? historicoSerieA : historicoSerieB;
  if (!data) return null;
  const roundData = data.filter((d) => d.rdd === round);
  if (roundData.length === 0) return null;
  return roundData
    .map((d) => ({
      nome: d.nome,
      score: (d.val || 0) + (d.re || 0) - (d.pen || 0),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

// ========== RENDERIZAÇÃO ==========
function renderLoaderBMP() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = `
      <div class="flex flex-col justify-center items-center h-screen gap-3 px-6 text-center">
        <div class="loader"></div>
        <p class="uppercase text-[10px] font-bold tracking-[0.3em] text-gray-400" style="font-family: 'FontJogos', sans-serif;">
          Carregando dados do BMP...
        </p>
      </div>
    `;
  }
}

function renderErrorBMP(msg) {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = `
      <div class="flex flex-col justify-center items-center h-screen gap-2 px-6 text-center">
        <p class="uppercase text-xs font-bold tracking-widest text-red-500" style="font-family: 'FontJogos', sans-serif;">
          Erro ao carregar BMP
        </p>
        <p class="text-sm text-gray-500">${msg}</p>
        <button onclick="window.carregarBMP()" 
          class="mt-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest rounded-full" style="font-family: 'FontJogos', sans-serif;">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

// Posições fixas para os 10 times no campo
const POS_CAMPO = [
  { t: 20, l: 50 },
  { t: 25, l: 15 },
  { t: 25, l: 85 },
  { t: 45, l: 50 },
  { t: 50, l: 15 },
  { t: 50, l: 85 },
  { t: 65, l: 50 },
  { t: 70, l: 15 },
  { t: 70, l: 85 },
  { t: 88, l: 50 },
];
const POS_TROFEU = { t: 5, l: 50 };

function renderHeader() {
  const maxRound = getMaxRound();
  return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3">
          <button onclick="bmpSetSerie(bmpState.activeSerie === 'A' ? 'B' : 'A')"
            class="inline-flex items-center rounded-full bg-white border border-black/10 shadow-sm pl-3 pr-1 gap-1 shrink-0" style="height:34px">
            <span class="text-lg uppercase leading-none pointer-events-none" style="font-family: 'FontJogos', sans-serif; font-weight:500;color:#1A1A1A">SÉRIE</span>
            <span class="relative flex items-center justify-center shrink-0" style="width:28px;height:28px">
              <span class="absolute inset-0 rounded-full ${bmpState.activeSerie === "A" ? "bg-cartola-orange" : ""}"></span>
              <span class="relative text-lg uppercase leading-none ${bmpState.activeSerie === "A" ? "text-white" : "text-gray-800"}" style="font-family: 'FontJogos', sans-serif;">A</span>
            </span>
            <span class="relative flex items-center justify-center shrink-0" style="width:28px;height:28px">
              <span class="absolute inset-0 rounded-full ${bmpState.activeSerie === "B" ? "bg-cartola-orange" : ""}"></span>
              <span class="relative text-lg uppercase leading-none ${bmpState.activeSerie === "B" ? "text-white" : "text-gray-800"}" style="font-family: 'FontJogos', sans-serif;">B</span>
            </span>
          </button>

          <div class="relative shrink-0">
            <select onchange="bmpSetRound(this.value)"
              class="appearance-none bg-white border border-black/10 shadow-sm rounded-full text-lg uppercase focus:outline-none cursor-pointer"
              style="height:34px;padding:0 28px 0 14px;font-family: 'FontJogos', sans-serif; font-weight:500;color:#1A1A1A">
              ${Array.from({ length: maxRound }, (_, i) => i + 1)
                .map(
                  (r) => `
                <option value="${r}" ${bmpState.selectedRound === r ? "selected" : ""}>RODADA ${r}</option>
              `
                )
                .join("")}
            </select>
            <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPodium(ranking) {
  if (ranking.length === 0) return "";
  const leader = ranking[0];
  return `
    <div class="grid grid-cols-3 gap-4 items-end px-4">
      <div></div>
      <div class="flex flex-col items-center">
        <div class="relative group cursor-pointer" onclick="bmpSelectTeam('${leader.nome}')">
          <div class="absolute -inset-10 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <img src="01/${leader.nome}.png" 
               class="h-48 md:h-72 w-auto object-contain relative z-10 transition-transform duration-700 hover:scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" 
               onerror="this.src='ESCUDOS/${leader.nome}.png'">
        </div>
      </div>
      <div class="flex flex-col items-center gap-3 pb-6">
        <div class="relative group cursor-pointer" onclick="bmpSelectTeam('${leader.nome}')">
          <div class="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 border-4 border-yellow-400/20">
            <img src="ESCUDOS/${leader.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
          </div>
          <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white text-xl text-black font-black z-20 shadow-lg" style="font-family: 'FontJogos', sans-serif;">1</div>
        </div>
        <div class="text-center">
          <p class="text-xl md:text-2xl uppercase leading-none font-bold text-gray-800" style="font-family: 'FontJogos', sans-serif;">${leader.nome}</p>
          <p class="font-mono text-base md:text-lg font-bold text-cartola-orange">${leader.pontos.toFixed(2)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderField(ranking) {
  const top10 = ranking.slice(0, 10);
  const lastTeam = ranking[ranking.length - 1];

  return `
    <div class="relative aspect-[4/5] w-full max-w-2xl mx-auto bg-gradient-to-b from-green-600 to-green-800 rounded-[32px] border-8 border-white/20 overflow-hidden shadow-2xl">
      <div class="absolute inset-0 opacity-30 pointer-events-none">
        <div class="absolute inset-4 border-2 border-white"></div>
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white"></div>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white"></div>
      </div>
      
      <div class="absolute" style="top: ${POS_TROFEU.t}%; left: ${POS_TROFEU.l}%; transform: translate(-50%, -50%)">
        <div class="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
          <i data-lucide="trophy" class="w-8 h-8 text-yellow-400"></i>
        </div>
      </div>

      ${top10
        .map((team, i) => {
          let posColorClass = "text-white";
          const rankingLength = ranking.length;
          if (bmpState.activeSerie === "A" && i >= rankingLength - 2) {
            posColorClass = "text-red-500";
          } else if (bmpState.activeSerie === "B" && i < 2) {
            posColorClass = "text-green-500";
          }

          let garcomImg = '';
          if (i === 9 && lastTeam) {
            garcomImg = `
              <img class="absolute h-[150px] md:h-[250px] w-auto object-contain pointer-events-none opacity-90 z-20" 
                   src="GARCONS/${lastTeam.nome}.png" 
                   style="top: 50%; left: -120%; transform: translateY(-50%); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.8));" 
                   onerror="this.style.display='none'">
            `;
          }

          return `
            <div class="absolute group cursor-pointer" style="top: ${POS_CAMPO[i].t}%; left: ${POS_CAMPO[i].l}%; transform: translate(-50%, -50%)" onclick="bmpSelectTeam('${team.nome}')">
              <div class="flex flex-col items-center gap-1">
                <div class="relative">
                  ${garcomImg}
                  <div class="h-[40px] md:h-[70px] w-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative z-10 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                    <img src="ESCUDOS/${team.nome}.png" class="h-full w-auto object-contain" onerror="this.src='ESCUDOS/default.png'">
                  </div>
                  <div class="absolute -top-2 -right-4 font-black text-3xl md:text-5xl ${posColorClass} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20" style="font-family: 'FontJogos', sans-serif;">
                    ${i + 1}
                  </div>
                </div>
                <div class="text-center relative z-10 flex flex-col items-center">
                  <p class="text-sm md:text-base uppercase tracking-wider font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none text-white" style="font-family: 'FontJogos', sans-serif;">${team.nome}</p>
                  <p class="text-base md:text-lg text-cartola-orange font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">${team.pontos.toFixed(2)}</p>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTable(ranking) {
  return `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left border-b border-black/5">
            <th class="px-6 py-4 text-lg uppercase tracking-wider text-gray-400" style="font-family: 'FontJogos', sans-serif;">Pos</th>
            <th class="px-6 py-4 text-lg uppercase tracking-wider text-gray-400" style="font-family: 'FontJogos', sans-serif;">Time</th>
            <th class="px-6 py-4 text-lg uppercase tracking-wider text-gray-400 text-right" style="font-family: 'FontJogos', sans-serif;">Rodada</th>
            <th class="px-6 py-4 text-lg uppercase tracking-wider text-gray-400 text-right" style="font-family: 'FontJogos', sans-serif;">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          ${ranking
            .map((team, i) => {
              const roundData = getSerieData().find(
                (d) => d.nome === team.nome && d.rdd === bmpState.selectedRound
              );
              const roundPoints = (roundData?.val || 0) + (roundData?.re || 0) - (roundData?.pen || 0);
              let rowClass = "group hover:bg-black/[0.02] transition-colors cursor-pointer";
              let borderClass = "";
              const rankingLength = ranking.length;
              if (bmpState.activeSerie === "A" && i >= rankingLength - 2) {
                borderClass = "border-l-4 border-red-500";
              } else if (bmpState.activeSerie === "B" && i < 2) {
                borderClass = "border-l-4 border-green-500";
              }
              return `
                <tr class="${rowClass} ${borderClass}" onclick="bmpSelectTeam('${team.nome}')">
                  <td class="px-6 py-4">
                    <span class="text-2xl ${i < 3 ? "text-cartola-orange" : "text-gray-400"}" style="font-family: 'FontJogos', sans-serif;">
                      ${(i + 1).toString().padStart(2, "0")}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                        <img src="ESCUDOS/${team.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                      </div>
                      <span class="text-xl uppercase tracking-wide" style="font-family: 'FontJogos', sans-serif;">${team.nome}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-sm text-gray-500">
                    ${roundPoints.toFixed(2)}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-mono text-lg font-bold text-cartola-orange">
                      ${team.pontos.toFixed(2)}
                    </span>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSidebar(ranking) {
  const mito = [...ranking].sort((a, b) => b.roundScore - a.roundScore)[0];
  const bolaMurcha = [...ranking].sort((a, b) => a.roundScore - b.roundScore)[0];

  const mitosAnteriores = [];
  const globalMax = getMaxRound();
  for (let r = 1; r <= globalMax; r++) {
    const mitoA = getMitoOfRound("A", r);
    const mitoB = getMitoOfRound("B", r);
    if (mitoA || mitoB) {
      mitosAnteriores.push({ rdd: r, mitoA, mitoB });
    }
  }
  mitosAnteriores.reverse();

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-black/5 pb-2">
          <h3 class="text-xl uppercase tracking-wider" style="font-family: 'FontJogos', sans-serif;">Classificação</h3>
          <span class="text-[10px] font-mono text-gray-400 uppercase" style="font-family: 'FontJogos', sans-serif;">Série ${bmpState.activeSerie}</span>
        </div>
        <div class="space-y-1">
          <div class="flex items-center text-[10px] font-mono text-gray-400 uppercase font-bold border-b border-black/5 pb-1">
            <span class="w-6">Pos</span>
            <span class="flex-1">Time</span>
            <span class="w-16 text-center">Ult. Rdd</span>
            <span class="w-16 text-right">Total</span>
          </div>
          ${ranking
            .map((team, i) => {
              const prevTeam = ranking[i - 1];
              const diff = prevTeam ? (prevTeam.pontos - team.pontos).toFixed(2) : "0.00";
              return `
                <div class="flex items-center py-2 border-b border-black/5 last:border-0 group cursor-pointer" onclick="bmpSelectTeam('${team.nome}')">
                  <div class="flex items-center gap-2 flex-1">
                    <span class="font-mono text-[10px] text-gray-400 w-4">${i + 1}</span>
                    <div class="w-6 h-6 shrink-0">
                      <img src="ESCUDOS/${team.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                    </div>
                    <span class="text-lg uppercase leading-none group-hover:text-cartola-orange transition-colors truncate" style="font-family: 'FontJogos', sans-serif;">${team.nome}</span>
                  </div>
                  <div class="w-16 text-center">
                    <p class="font-mono text-xs font-bold text-gray-600 leading-none">${team.roundScore ? team.roundScore.toFixed(2) : "0.00"}</p>
                  </div>
                  <div class="w-16 text-right">
                    <p class="font-mono text-sm font-bold text-cartola-orange leading-none">${team.pontos.toFixed(2)}</p>
                    <p class="text-[8px] font-mono text-gray-400 uppercase">DIF: ${diff}</p>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 bg-gradient-to-br from-green-50 to-transparent border-green-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl uppercase tracking-wider" style="font-family: 'FontJogos', sans-serif;">Mito da Rodada</h3>
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
            <i data-lucide="smile" class="text-white w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-white p-1 shadow-xl border-2 border-green-200">
            <img src="ESCUDOS/${mito.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
          </div>
          <div>
            <p class="text-2xl uppercase leading-none" style="font-family: 'FontJogos', sans-serif;">${mito.nome}</p>
            <p class="font-mono text-sm text-green-600 font-bold">+${mito.roundScore.toFixed(2)} pts</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 bg-gradient-to-br from-red-50 to-transparent border-red-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl uppercase tracking-wider" style="font-family: 'FontJogos', sans-serif;">Bola Murcha</h3>
          <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <i data-lucide="frown" class="text-white w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-white p-1 shadow-xl border-2 border-red-200">
            <img src="ESCUDOS/${bolaMurcha.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
          </div>
          <div>
            <p class="text-2xl uppercase leading-none" style="font-family: 'FontJogos', sans-serif;">${bolaMurcha.nome}</p>
            <p class="font-mono text-sm text-red-500 font-bold">${bolaMurcha.roundScore.toFixed(2)} pts</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-xl uppercase tracking-wider mb-4 text-cartola-orange" style="font-family: 'FontJogos', sans-serif;">Mitos - Histórico</h3>
        <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          ${mitosAnteriores
            .map(
              (m) => `
            <div class="p-3 bg-black/[0.02] rounded-xl border border-black/5 space-y-3">
              <div class="flex items-center justify-between border-b border-black/5 pb-1">
                <span class="text-[10px] font-mono text-gray-400 uppercase font-bold">Rodada ${m.rdd}</span>
                <i data-lucide="award" class="w-3 h-3 text-yellow-500"></i>
              </div>
              <div class="grid grid-cols-2 gap-4 divide-x divide-black/5">
                <div class="space-y-2">
                  <p class="text-[9px] font-mono text-gray-400 uppercase text-center">Série A</p>
                  ${
                    m.mitoA
                      ? `
                    <div class="flex flex-col items-center">
                      <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 mb-1">
                        <img src="ESCUDOS/${m.mitoA.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                      </div>
                      <span class="text-xs uppercase leading-none truncate w-full text-center" style="font-family: 'FontJogos', sans-serif;">${m.mitoA.nome}</span>
                      <span class="font-mono text-[10px] text-green-600 font-bold">+${m.mitoA.score.toFixed(2)}</span>
                    </div>
                  `
                      : '<p class="text-[9px] text-center text-gray-300">-</p>'
                  }
                </div>
                <div class="space-y-2 pl-4">
                  <p class="text-[9px] font-mono text-gray-400 uppercase text-center">Série B</p>
                  ${
                    m.mitoB
                      ? `
                    <div class="flex flex-col items-center">
                      <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 mb-1">
                        <img src="ESCUDOS/${m.mitoB.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                      </div>
                      <span class="text-xs uppercase leading-none truncate w-full text-center" style="font-family: 'FontJogos', sans-serif;">${m.mitoB.nome}</span>
                      <span class="font-mono text-[10px] text-green-600 font-bold">+${m.mitoB.score.toFixed(2)}</span>
                    </div>
                  `
                      : '<p class="text-[9px] text-center text-gray-300">-</p>'
                  }
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderTeamDetail(container) {
  const team = bmpState.selectedTeam;
  const round = bmpState.selectedRound;
  const rawEscalacao = bancoEscalacoes[team] || [];

  let escalacao = [];
  let foundRound = false;
  for (let i = 0; i < rawEscalacao.length; i++) {
    const item = rawEscalacao[i];
    if (item.rdd === round) {
      foundRound = true;
      continue;
    }
    if (foundRound) {
      if (item.rdd && item.rdd !== round) break;
      escalacao.push(item);
    }
  }

  const historico = getSerieData()
    .filter((d) => d.nome === team)
    .sort((a, b) => a.rdd - b.rdd);

  const totalPontos = historico
    .reduce((acc, h) => acc + (h.val || 0) + (h.re || 0) - (h.pen || 0), 0)
    .toFixed(2);

  const headerHtml = renderHeader();

  container.innerHTML = `
    ${headerHtml}
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onclick="bmpSelectTeam(null)" class="flex items-center gap-2 text-gray-500 hover:text-cartola-orange transition-colors group">
        <i data-lucide="arrow-left" class="w-5 h-5 group-hover:-translate-x-1 transition-transform"></i>
        <span class="text-lg uppercase tracking-wider" style="font-family: 'FontJogos', sans-serif;">Voltar</span>
      </button>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8">
        <div class="w-32 h-32 rounded-full bg-white p-2 shadow-2xl border-4 border-cartola-orange/10">
          <img src="ESCUDOS/${team}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
        </div>
        <div class="text-center md:text-left space-y-2">
          <h2 class="text-5xl uppercase leading-none" style="font-family: 'FontJogos', sans-serif;">${team}</h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-4">
            <div class="bg-black/5 px-4 py-1 rounded-full">
              <span class="text-xs uppercase mr-2" style="font-family: 'FontJogos', sans-serif; color: #9ca3af;">Série</span>
              <span class="text-xl text-cartola-orange" style="font-family: 'FontJogos', sans-serif;">${bmpState.activeSerie}</span>
            </div>
            <div class="bg-black/5 px-4 py-1 rounded-full">
              <span class="text-xs uppercase mr-2" style="font-family: 'FontJogos', sans-serif; color: #9ca3af;">Total</span>
              <span class="text-xl" style="font-family: 'FontJogos', sans-serif;">${totalPontos}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-2xl uppercase tracking-wider mb-6 border-b border-black/5 pb-2" style="font-family: 'FontJogos', sans-serif;">Escalação Rodada ${round}</h3>
          ${
            escalacao.length > 0
              ? `
            <div class="space-y-3">
              ${escalacao
                .filter((p) => p.nome)
                .map(
                  (p) => `
                <div class="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl border border-black/5 hover:border-cartola-orange/20 transition-colors">
                  <div class="flex items-center gap-3">
                    <img src="TIMES/${p.clube}.png" class="w-8 h-8 object-contain" onerror="this.src='TIMES/default.png'">
                    <div>
                      <p class="text-lg uppercase leading-none" style="font-family: 'FontJogos', sans-serif;">${p.nome}</p>
                      <p class="text-[10px] font-mono text-gray-400 uppercase">${p.clube} | ${p.pos}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-mono text-sm font-bold ${(p.val || 0) >= 0 ? "text-green-500" : "text-red-500"}">${(
                    p.val || 0
                  ).toFixed(2)}</p>
                    <span class="text-[10px] font-mono text-gray-400 uppercase">${p.status}</span>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : `
            <div class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <i data-lucide="shield-alert" class="w-16 h-16 opacity-20"></i>
              <p class="text-xl uppercase tracking-widest" style="font-family: 'FontJogos', sans-serif;">Escalação Indisponível</p>
            </div>
          `
          }
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-2xl uppercase tracking-wider mb-6 border-b border-black/5 pb-2" style="font-family: 'FontJogos', sans-serif;">Desempenho Histórico</h3>
          <div class="space-y-4">
            ${historico
              .map((h) => {
                const totalRound = (h.val || 0) + (h.re || 0) - (h.pen || 0);
                return `
                <div class="flex items-center gap-4 py-1 border-b border-black/[0.03] last:border-0">
                  <div class="w-14 shrink-0">
                    <span class="font-mono text-[10px] text-gray-400">ROD ${h.rdd}</span>
                  </div>
                  <div class="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                    <div class="h-full bg-cartola-orange rounded-full" style="width: ${Math.max(
                      0,
                      Math.min(100, (totalRound / 20) * 100)
                    )}%"></div>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="font-mono text-xs font-bold leading-none text-cartola-orange">${totalRound.toFixed(
                      2
                    )}</p>
                    <div class="flex justify-end gap-1.5 mt-1">
                      ${h.re ? `<span class="text-[9px] font-mono ${h.re >= 0 ? "text-green-600" : "text-red-500"}" title="Rodada Especial">RE: ${h.re >= 0 ? "+" : ""}${h.re.toFixed(1)}</span>` : ""}
                      ${h.pen ? `<span class="text-[9px] font-mono text-red-500" title="Penalização">PEN: -${h.pen.toFixed(1)}</span>` : ""}
                    </div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function renderBMP() {
  const main = document.getElementById("main-content");
  if (!main) return;

  if (bmpState.selectedTeam) {
    renderTeamDetail(main);
    return;
  }

  const ranking = getRanking(bmpState.selectedRound);
  if (!ranking || ranking.length === 0) {
    main.innerHTML = `
      ${renderHeader()}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center space-y-4">
        <i data-lucide="search-x" class="w-12 h-12 text-gray-300 mx-auto"></i>
        <p class="text-gray-500 text-xl uppercase tracking-widest" style="font-family: 'FontJogos', sans-serif;">Nenhum dado encontrado para esta rodada</p>
      </div>
    `;
    return;
  }

  const mainContentHtml = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        ${ranking.length >= 1 ? renderPodium(ranking) : ""}
        ${bmpState.viewMode === "campo" ? renderField(ranking) : renderTable(ranking)}
      </div>
      <aside>
        ${renderSidebar(ranking)}
      </aside>
    </div>
  `;

  main.innerHTML = renderHeader() + mainContentHtml;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ========== FUNÇÕES GLOBAIS ==========
window.bmpSelectTeam = function (team) {
  bmpState.selectedTeam = team;
  renderBMP();
};

window.bmpSetSerie = function (serie) {
  bmpState.activeSerie = serie;
  bmpState.selectedRound = getMaxRound();
  bmpState.selectedTeam = null;
  renderBMP();
};

window.bmpSetRound = function (round) {
  bmpState.selectedRound = parseInt(round);
  renderBMP();
};

window.bmpToggleView = function () {
  bmpState.viewMode = bmpState.viewMode === "campo" ? "tabela" : "campo";
  renderBMP();
};

// ========== FUNÇÃO PRINCIPAL ==========
window.carregarBMP = function () {
  console.log("🟢 BMP: Inicializando...");
  renderLoaderBMP();
  try {
    if (typeof historicoSerieA === "undefined" || typeof historicoSerieB === "undefined") {
      throw new Error("Arquivo tabela.js não carregado corretamente (faltam historicoSerieA/B)");
    }
    if (typeof bancoEscalacoes === "undefined") {
      throw new Error("Arquivo escalacoes.js não carregado corretamente (falta bancoEscalacoes)");
    }
    bmpState.selectedRound = getMaxRound();
    bmpState.selectedTeam = null;
    bmpState.viewMode = "campo";
    renderBMP();
    console.log("✅ BMP carregado com sucesso");
  } catch (err) {
    console.error("❌ Erro ao carregar BMP:", err);
    renderErrorBMP(err.message);
  }
};

console.log("cartola.js carregado - use window.carregarBMP()");
