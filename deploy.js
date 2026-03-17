#!/usr/bin/env node
/* ============================================================
   deploy.js — TAÇA NATTOS 2026
   
   USO: node deploy.js
   
   O que faz:
   1. Gera um timestamp único (ex: 20260317-1423)
   2. Substitui %%TIMESTAMP%% no sw.js por esse valor
   3. Assim o CACHE_NAME muda a cada rodada, forçando
      todos os navegadores a reinstalar o Service Worker
      e buscar os arquivos atualizados da rede.
   
   FLUXO DE ATUALIZAÇÃO A CADA RODADA:
   1. Atualize tabela.js e escalacoes.js com os novos dados
   2. Rode: node deploy.js
   3. Commit e push para o GitHub normalmente
   ============================================================ */

const fs = require('fs');
const path = require('path');

const SW_PATH = path.join(__dirname, 'sw.js');

// Gera timestamp no formato YYYYMMDD-HHmm
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

// Lê o sw.js atual
let content = fs.readFileSync(SW_PATH, 'utf-8');

// Substitui qualquer CACHE_NAME existente pelo novo timestamp
// Funciona tanto com %%TIMESTAMP%% quanto com um valor anterior (ex: nattos-20260317-1400)
content = content.replace(
  /const CACHE_NAME = 'nattos-[^']*';/,
  `const CACHE_NAME = 'nattos-${timestamp}';`
);

// Salva o arquivo atualizado
fs.writeFileSync(SW_PATH, content, 'utf-8');

console.log(`✅ sw.js atualizado com CACHE_NAME = nattos-${timestamp}`);
console.log(`📦 Agora faça git add sw.js tabela.js escalacoes.js && git commit && git push`);
