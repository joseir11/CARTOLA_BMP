/* ============================================================
   ROTAS DA API — CARTOLA FC
   VIA PROXY PRÓPRIO NO RENDER
   ============================================================ */

const BASE = "https://josabet-proxy.onrender.com";

const API_CARTOLA = {
  // STATUS DO MERCADO (RODADA ATUAL, ABERTURA/FECHAMENTO)
  MERCADO_STATUS: `${BASE}/mercado/status`,

  // PARTIDAS DA RODADA ATUAL
  PARTIDAS: `${BASE}/partidas`,

  // CLUBES (LISTA COMPLETA)
  CLUBES: `${BASE}/clubes`,

  // POSIÇÕES DOS JOGADORES
  POSICOES: `${BASE}/posicoes`,

  // RODADAS
  RODADAS: `${BASE}/rodadas`,

  // MERCADO DE ATLETAS
  ATLETAS_MERCADO: `${BASE}/mercado`,

  // PARTIDAS DE UMA RODADA ESPECÍFICA
  PARTIDAS_RODADA: (rodada) => `${BASE}/partidas/${rodada}`,

  // ATLETAS PONTUADOS (RODADA ATUAL OU ESPECÍFICA)
  PONTUADOS: (rodada) =>
    rodada
      ? `${BASE}/atletas/pontuados/${rodada}`
      : `${BASE}/atletas/pontuados`,

  // PROVÁVEIS DO CARTOLA
  PROVAVEIS_LINEUPS: `${BASE}/provaveis/lineups`,
  PROVAVEIS_IMAGES: `${BASE}/provaveis/mercado-images`,
  PROVAVEIS_TEAM_UPDATES: `${BASE}/provaveis/team-updates`,
};

window.API_CARTOLA = API_CARTOLA;
console.log("✅ Rotas API carregadas:", API_CARTOLA);
