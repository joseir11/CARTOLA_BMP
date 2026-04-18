console.log('script.js: Carregando...');

const POS_CAMPO = [
    { t: 20, l: 50 }, { t: 25, l: 15 }, { t: 25, l: 85 },
    { t: 45, l: 50 }, { t: 50, l: 15 }, { t: 50, l: 85 },
    { t: 65, l: 50 }, { t: 70, l: 15 }, { t: 70, l: 85 },
    { t: 88, l: 50 }
];

const POS_TROFEU = { t: 5, l: 50 };

const POSICOES_POR_FORMACAO = {
    "433": [
        { pos: "GOL", t: 90, l: 50 },
        { pos: "LAT", t: 75, l: 15 }, { pos: "ZAG", t: 75, l: 38 }, { pos: "ZAG", t: 75, l: 62 }, { pos: "LAT", t: 75, l: 85 },
        { pos: "MEI", t: 55, l: 25 }, { pos: "MEI", t: 55, l: 50 }, { pos: "MEI", t: 55, l: 75 },
        { pos: "ATA", t: 30, l: 20 }, { pos: "ATA", t: 30, l: 50 }, { pos: "ATA", t: 30, l: 80 },
        { pos: "TEC", t: 95, l: 85 }
    ]
};

window.app = {
    state: {
        activeSerie: 'A',
        viewMode: 'campo',
        selectedRound: 0,
        selectedTeam: null,
        data: null,
        deferredPrompt: null
    },

    init() {
        console.log('app.init(): Iniciando...');
        this.initPWA();
        try {
            // Tenta encontrar os dados em diferentes variáveis possíveis
            const rawSerieA = (typeof TABELA !== 'undefined' && TABELA.serieA) || (typeof historicoSerieA !== 'undefined' ? historicoSerieA : null);
            const rawSerieB = (typeof TABELA !== 'undefined' && TABELA.serieB) || (typeof historicoSerieB !== 'undefined' ? historicoSerieB : null);
            const rawEscalacoes = (typeof ESCALACOES !== 'undefined' ? ESCALACOES : null) || (typeof bancoEscalacoes !== 'undefined' ? bancoEscalacoes : null);

            console.log('Dados detectados:', { 
                serieA: !!rawSerieA, 
                serieB: !!rawSerieB, 
                escalacoes: !!rawEscalacoes 
            });

            if (!rawSerieA || !rawSerieB) {
                throw new Error('Dados da liga (Série A ou B) não encontrados. Verifique se tabela.js está correto.');
            }

            this.state.data = {
                serieA: rawSerieA,
                serieB: rawSerieB,
                escalacoes: rawEscalacoes || {}
            };
            
            this.state.selectedRound = this.getMaxRound();
            console.log('app.init(): Rodada selecionada:', this.state.selectedRound);
            
            this.render();
            console.log('app.init(): Renderização concluída.');
        } catch (error) {
            console.error('app.init(): Erro crítico:', error);
            const main = document.getElementById('main-content');
            if (main) {
                main.innerHTML = `
                    <div class="glass-card p-8 text-center space-y-4">
                        <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <i data-lucide="alert-circle" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-2xl font-teko uppercase text-red-600">Erro de Inicialização</h2>
                        <p class="text-gray-600 max-w-md mx-auto">${error.message}</p>
                        <div class="text-left bg-black/5 p-4 rounded-lg font-mono text-xs overflow-auto max-h-40">
                            ${error.stack}
                        </div>
                    </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    },

    getMaxRound() {
        if (!this.state.data) return 0;
        const serieData = this.state.activeSerie === 'A' ? this.state.data.serieA : this.state.data.serieB;
        if (!serieData || serieData.length === 0) return 0;
        return Math.max(...serieData.map(d => d.rdd));
    },

    getRanking(serie, round) {
        const serieData = serie === 'A' ? this.state.data.serieA : this.state.data.serieB;
        if (!serieData) return [];
        const roundData = serieData.filter(d => d.rdd <= round);
        
        const totals = {};
        roundData.forEach(d => {
            if (!totals[d.nome]) totals[d.nome] = { nome: d.nome, pontos: 0, re: 0, pen: 0, roundScore: 0 };
            // A pontuação total é a soma de val + re - pen de todas as rodadas até o momento
            totals[d.nome].pontos += (d.val || 0) + (d.re || 0) - (d.pen || 0);
            if (d.rdd === round) {
                totals[d.nome].re = d.re || 0;
                totals[d.nome].pen = d.pen || 0;
                // Pontuação específica da rodada (Valorização)
                totals[d.nome].roundScore = (d.val || 0) + (d.re || 0) - (d.pen || 0);
            }
        });

        return Object.values(totals).sort((a, b) => b.pontos - a.pontos);
    },

    getMitoOfRound(serie, round) {
        if (!this.state.data) return null;
        const serieData = serie === 'A' ? this.state.data.serieA : this.state.data.serieB;
        if (!serieData) return null;
        const roundData = serieData.filter(d => d.rdd === round);
        if (roundData.length === 0) return null;
        
        return roundData.map(d => ({
            nome: d.nome,
            score: (d.val || 0) + (d.re || 0) - (d.pen || 0)
        })).sort((a, b) => b.score - a.score)[0];
    },

    render() {
        this.renderHeader();
        this.renderMain();
        this.renderSidebar();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    initPWA() {
        // Service Worker registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA: Service Worker registrado com sucesso'))
                    .catch(err => console.error('PWA: Erro ao registrar Service Worker', err));
            });
        }

        // Install prompt handler
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.state.deferredPrompt = e;
            const btn = document.getElementById('installApp');
            if (btn) btn.classList.remove('hidden');
        });

        window.addEventListener('appinstalled', (e) => {
            this.state.deferredPrompt = null;
            const btn = document.getElementById('installApp');
            if (btn) btn.classList.add('hidden');
        });
    },

    installApp() {
        if (!this.state.deferredPrompt) return;
        this.state.deferredPrompt.prompt();
        this.state.deferredPrompt.userChoice.then((choiceResult) => {
            this.state.deferredPrompt = null;
            const btn = document.getElementById('installApp');
            if (btn) btn.classList.add('hidden');
        });
    },

    renderHeader() {
        const header = document.getElementById('header');
        header.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4 flex-1">
                    <div class="w-12 h-12 bg-cartola-orange rounded-xl flex items-center justify-center shadow-lg shadow-cartola-orange/20">
                        <i data-lucide="trophy" class="text-white w-7 h-7"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between md:justify-start md:gap-8">
                            <div>
                                <h1 class="text-3xl font-teko uppercase tracking-wider leading-none">Taça Nattos 2026</h1>
                                <p class="text-xs font-mono text-gray-500 uppercase tracking-widest">CARTOLA BMP</p>
                            </div>
                            <button id="installApp" onclick="app.installApp()" class="hidden opacity-20 hover:opacity-100 transition-opacity p-2" title="Instalar App">
                                <i data-lucide="download" class="w-6 h-6 text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <!-- Serie Toggle -->
                    <div class="bg-black/5 p-1 rounded-xl flex gap-1">
                        <button onclick="app.setSerie('A')" class="px-4 py-1.5 rounded-lg text-lg font-teko uppercase tracking-wider transition-all ${this.state.activeSerie === 'A' ? 'bg-white shadow-sm text-cartola-orange' : 'text-gray-500 hover:text-gray-800'}">SÉRIE A</button>
                        <button onclick="app.setSerie('B')" class="px-4 py-1.5 rounded-lg text-lg font-teko uppercase tracking-wider transition-all ${this.state.activeSerie === 'B' ? 'bg-white shadow-sm text-cartola-orange' : 'text-gray-500 hover:text-gray-800'}">SÉRIE B</button>
                    </div>

                    <!-- Round Selector -->
                    <div class="relative group">
                        <select onchange="app.setRound(this.value)" class="appearance-none bg-white border border-black/5 rounded-xl px-4 py-2 pr-10 text-lg font-teko uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-cartola-orange/20 transition-all cursor-pointer">
                            ${Array.from({length: this.getMaxRound()}, (_, i) => i + 1).map(r => `
                                <option value="${r}" ${this.state.selectedRound === r ? 'selected' : ''}>Rodada ${r}</option>
                            `).join('')}
                        </select>
                        <i data-lucide="chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
                    </div>
                </div>
            </div>
        `;
    },

    renderMain() {
        const main = document.getElementById('main-content');
        if (!main) return;

        if (this.state.selectedTeam) {
            this.renderTeamDetail(main);
            return;
        }

        const ranking = this.getRanking(this.state.activeSerie, this.state.selectedRound);
        
        if (!ranking || ranking.length === 0) {
            main.innerHTML = `
                <div class="glass-card p-12 text-center space-y-4">
                    <i data-lucide="search-x" class="w-12 h-12 text-gray-300 mx-auto"></i>
                    <p class="text-gray-500 font-teko text-xl uppercase tracking-widest">Nenhum dado encontrado para esta rodada</p>
                </div>
            `;
            return;
        }

        main.innerHTML = `
            <div class="space-y-8">
                ${ranking.length >= 3 ? this.renderPodium(ranking.slice(0, 3)) : ''}
                
                <div class="glass-card p-1 pb-4">
                    ${this.renderField(ranking)}
                </div>
            </div>
        `;
    },

    renderPodium(top3) {
        const leader = top3[0];
        return `
            <div class="grid grid-cols-3 gap-4 items-end px-4">
                <!-- Coluna 1: Vazia -->
                <div></div>

                <!-- Coluna 2: Destaque (Pasta /01) -->
                <div class="flex flex-col items-center">
                    <div class="relative group cursor-pointer" onclick="app.selectTeam('${leader.nome}')">
                        <div class="absolute -inset-10 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                        <img src="01/${leader.nome}.png" 
                             class="h-48 md:h-72 w-auto object-contain relative z-10 transition-transform duration-700 hover:scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" 
                             onerror="this.src='ESCUDOS/${leader.nome}.png'">
                    </div>
                </div>

                <!-- Coluna 3: Escudo + Pontuação (Antiga posição do 3º) -->
                <div class="flex flex-col items-center gap-3 pb-6">
                    <div class="relative group cursor-pointer" onclick="app.selectTeam('${leader.nome}')">
                        <div class="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 border-4 border-yellow-400/20">
                            <img src="ESCUDOS/${leader.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                        </div>
                        <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white font-teko text-xl text-black font-black z-20 shadow-lg">1</div>
                    </div>
                    <div class="text-center">
                        <p class="font-teko text-xl md:text-2xl uppercase leading-none font-bold text-gray-800">${leader.nome}</p>
                        <p class="font-mono text-base md:text-lg font-bold text-cartola-orange">${leader.pontos.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderField(ranking) {
        return `
            <div class="relative aspect-[4/5] w-full max-w-2xl mx-auto bg-gradient-to-b from-green-600 to-green-800 rounded-[32px] border-8 border-white/20 overflow-hidden shadow-2xl">
                <!-- Field Lines -->
                <div class="absolute inset-0 opacity-30 pointer-events-none">
                    <!-- Outer Border -->
                    <div class="absolute inset-4 border-2 border-white"></div>
                    <!-- Center Line -->
                    <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
                    <!-- Center Circle -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
                    <!-- Penalty Area Top -->
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white"></div>
                    <!-- Penalty Area Bottom -->
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white"></div>
                </div>
                
                <!-- Trophy -->
                <div class="absolute" style="top: ${POS_TROFEU.t}%; left: ${POS_TROFEU.l}%; transform: translate(-50%, -50%)">
                    <div class="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                        <i data-lucide="trophy" class="w-8 h-8 text-yellow-400"></i>
                    </div>
                </div>

                <!-- Teams -->
                ${ranking.slice(0, 10).map((team, i) => {
                    let posColorClass = 'text-white';
                    if (this.state.activeSerie === 'A' && i >= ranking.length - 2) {
                        posColorClass = 'text-red-500';
                    } else if (this.state.activeSerie === 'B' && i < 2) {
                        posColorClass = 'text-green-500';
                    }

                    // Lógica do Garçom: Altura fixa, largura auto para não esticar
                    let garcomImg = '';
                    if (i === 9) {
                        const lastTeam = ranking[ranking.length - 1];
                        garcomImg = `<img class="absolute h-[150px] md:h-[250px] w-auto object-contain pointer-events-none opacity-90 z-20" 
                                          src="GARCONS/${lastTeam.nome}.png" 
                                          style="top: 50%; left: -120%; transform: translateY(-50%); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.8));" 
                                          onerror="this.style.display='none'">`;
                    }

                    return `
                        <div class="absolute group cursor-pointer" style="top: ${POS_CAMPO[i].t}%; left: ${POS_CAMPO[i].l}%; transform: translate(-50%, -50%)" onclick="app.selectTeam('${team.nome}')">
                            <div class="flex flex-col items-center gap-1">
                                <div class="relative">
                                    ${garcomImg}
                                    <!-- Escudo com altura fixa em pixels e largura automática para não sobrepor no mobile -->
                                    <div class="h-[40px] md:h-[70px] w-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative z-10 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                                        <img src="ESCUDOS/${team.nome}.png" class="h-full w-auto object-contain" onerror="this.src='ESCUDOS/default.png'">
                                    </div>
                                    <!-- Posição estilo número de camisa com cores dinâmicas -->
                                    <div class="absolute -top-2 -right-4 font-teko font-black text-3xl md:text-5xl ${posColorClass} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20">
                                        ${i + 1}
                                    </div>
                                </div>
                                <!-- Labels soltos, maiores e com sombra -->
                                <div class="text-center relative z-10 flex flex-col items-center">
                                    <p class="text-sm md:text-base font-teko text-white uppercase tracking-wider font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">${team.nome}</p>
                                    <p class="text-base md:text-lg font-teko text-cartola-orange font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">${team.pontos.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderTable(ranking) {
        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="text-left border-b border-black/5">
                            <th class="px-6 py-4 font-teko text-lg uppercase tracking-wider text-gray-400">Pos</th>
                            <th class="px-6 py-4 font-teko text-lg uppercase tracking-wider text-gray-400">Time</th>
                            <th class="px-6 py-4 font-teko text-lg uppercase tracking-wider text-gray-400 text-right">Rodada</th>
                            <th class="px-6 py-4 font-teko text-lg uppercase tracking-wider text-gray-400 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-black/5">
                        ${ranking.map((team, i) => {
                            const roundData = (this.state.activeSerie === 'A' ? this.state.data.serieA : this.state.data.serieB)
                                .find(d => d.nome === team.nome && d.rdd === this.state.selectedRound);
                            const roundPoints = (roundData?.val || 0) + (roundData?.re || 0) - (roundData?.pen || 0);
                            
                            let rowClass = 'group hover:bg-black/[0.02] transition-colors cursor-pointer';
                            let borderClass = '';
                            if (this.state.activeSerie === 'A' && i >= ranking.length - 2) {
                                borderClass = 'border-l-4 border-red-500';
                            } else if (this.state.activeSerie === 'B' && i < 2) {
                                borderClass = 'border-l-4 border-green-500';
                            }

                            return `
                                <tr class="${rowClass} ${borderClass}" onclick="app.selectTeam('${team.nome}')">
                                    <td class="px-6 py-4">
                                        <span class="font-teko text-2xl ${i < 3 ? 'text-cartola-orange' : 'text-gray-400'}">
                                            ${(i + 1).toString().padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                                                <img src="ESCUDOS/${team.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                                            </div>
                                            <span class="font-teko text-xl uppercase tracking-wide">${team.nome}</span>
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
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const ranking = this.getRanking(this.state.activeSerie, this.state.selectedRound);
        
        if (!ranking || ranking.length === 0) {
            sidebar.innerHTML = '';
            return;
        }

        // Mito: Maior roundScore / Bola Murcha: Menor roundScore
        const mito = [...ranking].sort((a, b) => b.roundScore - a.roundScore)[0];
        const bolaMurcha = [...ranking].sort((a, b) => a.roundScore - b.roundScore)[0];

        // Lógica para Mitos de Rodadas Anteriores
        const mitosAnteriores = [];
        const globalMax = Math.max(
            ...(this.state.data.serieA?.map(d => d.rdd) || []),
            ...(this.state.data.serieB?.map(d => d.rdd) || []),
            0
        );
        for (let r = 1; r <= globalMax; r++) {
            const mitoA = this.getMitoOfRound('A', r);
            const mitoB = this.getMitoOfRound('B', r);
            if (mitoA || mitoB) {
                mitosAnteriores.push({ rdd: r, mitoA, mitoB });
            }
        }
        mitosAnteriores.reverse(); // Mais recente primeiro

        sidebar.innerHTML = `
            <div class="space-y-6">
                <!-- Classificação -->
                <div class="glass-card p-6 space-y-4">
                    <div class="flex items-center justify-between border-b border-black/5 pb-2">
                        <h3 class="font-teko text-xl uppercase tracking-wider">Classificação</h3>
                        <span class="text-[10px] font-mono text-gray-400 uppercase">Série ${this.state.activeSerie}</span>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center text-[10px] font-mono text-gray-400 uppercase font-bold border-b border-black/5 pb-1">
                            <span class="w-6">Pos</span>
                            <span class="flex-1">Time</span>
                            <span class="w-16 text-center">Ult. Rdd</span>
                            <span class="w-16 text-right">Total</span>
                        </div>
                        ${ranking.map((team, i) => {
                            const prevTeam = ranking[i - 1];
                            const diff = prevTeam ? (prevTeam.pontos - team.pontos).toFixed(2) : '0.00';
                            return `
                                <div class="flex items-center py-2 border-b border-black/5 last:border-0 group cursor-pointer" onclick="app.selectTeam('${team.nome}')">
                                    <div class="flex items-center gap-2 flex-1">
                                        <span class="font-mono text-[10px] text-gray-400 w-4">${i + 1}</span>
                                        <div class="w-6 h-6 shrink-0">
                                            <img src="ESCUDOS/${team.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                                        </div>
                                        <span class="font-teko text-lg uppercase leading-none group-hover:text-cartola-orange transition-colors truncate">${team.nome}</span>
                                    </div>
                                    <div class="w-16 text-center">
                                        <p class="font-mono text-xs font-bold text-gray-600 leading-none">${team.roundScore ? team.roundScore.toFixed(2) : '0.00'}</p>
                                    </div>
                                    <div class="w-16 text-right">
                                        <p class="font-mono text-sm font-bold text-cartola-orange leading-none">${team.pontos.toFixed(2)}</p>
                                        <p class="text-[8px] font-mono text-gray-400 uppercase">DIF: ${diff}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Mito da Rodada -->
                <div class="glass-card p-6 bg-gradient-to-br from-green-50 to-transparent border-green-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-teko text-xl uppercase tracking-wider">Mito da Rodada</h3>
                        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                            <i data-lucide="smile" class="text-white w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-white p-1 shadow-xl border-2 border-green-200">
                            <img src="ESCUDOS/${mito.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                        </div>
                        <div>
                            <p class="font-teko text-2xl uppercase leading-none">${mito.nome}</p>
                            <p class="font-mono text-sm text-green-600 font-bold">+${mito.roundScore.toFixed(2)} pts</p>
                        </div>
                    </div>
                </div>

                <!-- Bola Murcha da Rodada -->
                <div class="glass-card p-6 bg-gradient-to-br from-red-50 to-transparent border-red-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-teko text-xl uppercase tracking-wider">Bola Murcha</h3>
                        <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                            <i data-lucide="frown" class="text-white w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-white p-1 shadow-xl border-2 border-red-200">
                            <img src="ESCUDOS/${bolaMurcha.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                        </div>
                        <div>
                            <p class="font-teko text-2xl uppercase leading-none">${bolaMurcha.nome}</p>
                            <p class="font-mono text-sm text-red-500 font-bold">${bolaMurcha.roundScore.toFixed(2)} pts</p>
                        </div>
                    </div>
                </div>

                <!-- Mitos Anteriores -->
                <div class="glass-card p-6">
                    <h3 class="font-teko text-xl uppercase tracking-wider mb-4 text-cartola-orange">Mitos - Histórico</h3>
                    <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        ${mitosAnteriores.map(m => `
                            <div class="p-3 bg-black/[0.02] rounded-xl border border-black/5 space-y-3">
                                <div class="flex items-center justify-between border-b border-black/5 pb-1">
                                    <span class="text-[10px] font-mono text-gray-400 uppercase font-bold">Rodada ${m.rdd}</span>
                                    <i data-lucide="award" class="w-3 h-3 text-yellow-500"></i>
                                </div>
                                <div class="grid grid-cols-2 gap-4 divide-x divide-black/5">
                                    <div class="space-y-2">
                                        <p class="text-[9px] font-mono text-gray-400 uppercase text-center">Série A</p>
                                        ${m.mitoA ? `
                                            <div class="flex flex-col items-center">
                                                <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 mb-1">
                                                    <img src="ESCUDOS/${m.mitoA.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                                                </div>
                                                <span class="font-teko text-xs uppercase leading-none truncate w-full text-center">${m.mitoA.nome}</span>
                                                <span class="font-mono text-[10px] text-green-600 font-bold">+${m.mitoA.score.toFixed(2)}</span>
                                            </div>
                                        ` : '<p class="text-[9px] text-center text-gray-300">-</p>'}
                                    </div>
                                    <div class="space-y-2 pl-4">
                                        <p class="text-[9px] font-mono text-gray-400 uppercase text-center">Série B</p>
                                        ${m.mitoB ? `
                                            <div class="flex flex-col items-center">
                                                <div class="w-10 h-10 rounded-full bg-white p-1 shadow-sm border border-black/5 mb-1">
                                                    <img src="ESCUDOS/${m.mitoB.nome}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                                                </div>
                                                <span class="font-teko text-xs uppercase leading-none truncate w-full text-center">${m.mitoB.nome}</span>
                                                <span class="font-mono text-[10px] text-green-600 font-bold">+${m.mitoB.score.toFixed(2)}</span>
                                            </div>
                                        ` : '<p class="text-[9px] text-center text-gray-300">-</p>'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderTeamDetail(container) {
        const team = this.state.selectedTeam;
        const round = this.state.selectedRound;
        const rawEscalacao = this.state.data.escalacoes[team] || [];
        
        // Filtra a escalação para a rodada selecionada
        let escalacao = [];
        let foundRound = false;
        for (let i = 0; i < rawEscalacao.length; i++) {
            const item = rawEscalacao[i];
            if (item.rdd === round) {
                foundRound = true;
                continue;
            }
            if (foundRound) {
                if (item.rdd && item.rdd !== round) break; // Próxima rodada
                escalacao.push(item);
            }
        }

        const historico = (this.state.activeSerie === 'A' ? this.state.data.serieA : this.state.data.serieB)
            .filter(d => d.nome === team)
            .sort((a, b) => a.rdd - b.rdd);

        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- Back Button -->
                <button onclick="app.selectTeam(null)" class="flex items-center gap-2 text-gray-500 hover:text-cartola-orange transition-colors group">
                    <i data-lucide="arrow-left" class="w-5 h-5 group-hover:-translate-x-1 transition-transform"></i>
                    <span class="font-teko text-lg uppercase tracking-wider">Voltar</span>
                </button>

                <!-- Team Header -->
                <div class="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
                    <div class="w-32 h-32 rounded-full bg-white p-2 shadow-2xl border-4 border-cartola-orange/10">
                        <img src="ESCUDOS/${team}.png" class="w-full h-full object-contain" onerror="this.src='ESCUDOS/default.png'">
                    </div>
                    <div class="text-center md:text-left space-y-2">
                        <h2 class="text-5xl font-teko uppercase leading-none">${team}</h2>
                        <div class="flex flex-wrap justify-center md:justify-start gap-4">
                            <div class="bg-black/5 px-4 py-1 rounded-full">
                                <span class="text-xs font-mono text-gray-400 uppercase mr-2">Série</span>
                                <span class="font-teko text-xl text-cartola-orange">${this.state.activeSerie}</span>
                            </div>
                            <div class="bg-black/5 px-4 py-1 rounded-full">
                                <span class="text-xs font-mono text-gray-400 uppercase mr-2">Total</span>
                                <span class="font-teko text-xl">${historico.reduce((acc, h) => acc + (h.val || 0) + (h.re || 0) - (h.pen || 0), 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Lineup -->
                    <div class="glass-card p-6">
                        <h3 class="font-teko text-2xl uppercase tracking-wider mb-6 border-b border-black/5 pb-2">Escalação Rodada ${this.state.selectedRound}</h3>
                        ${escalacao.length > 0 ? `
                            <div class="space-y-3">
                                ${escalacao.filter(p => p.nome).map(p => `
                                    <div class="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl border border-black/5 hover:border-cartola-orange/20 transition-colors">
                                        <div class="flex items-center gap-3">
                                            <img src="TIMES/${p.clube}.png" class="w-8 h-8 object-contain" onerror="this.src='TIMES/default.png'">
                                            <div>
                                                <p class="font-teko text-lg uppercase leading-none">${p.nome}</p>
                                                <p class="text-[10px] font-mono text-gray-400 uppercase">${p.clube} | ${p.pos}</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-mono text-sm font-bold ${(p.val || 0) >= 0 ? 'text-green-500' : 'text-red-500'}">${(p.val || 0).toFixed(2)}</p>
                                            <span class="text-[10px] font-mono text-gray-400 uppercase">${p.status}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
                                <i data-lucide="shield-alert" class="w-16 h-16 opacity-20"></i>
                                <p class="font-teko text-xl uppercase tracking-widest">Escalação Indisponível</p>
                            </div>
                        `}
                    </div>

                    <!-- History Chart -->
                    <div class="glass-card p-6">
                        <h3 class="font-teko text-2xl uppercase tracking-wider mb-6 border-b border-black/5 pb-2">Desempenho Histórico</h3>
                        <div class="space-y-4">
                            ${historico.map(h => {
                                const totalRound = (h.val || 0) + (h.re || 0) - (h.pen || 0);
                                return `
                                    <div class="flex items-center gap-4 py-1 border-b border-black/[0.03] last:border-0">
                                        <div class="w-14 shrink-0">
                                            <span class="font-mono text-[10px] text-gray-400">ROD ${h.rdd}</span>
                                        </div>
                                        <div class="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                                            <div class="h-full bg-cartola-orange rounded-full" style="width: ${Math.max(0, Math.min(100, (totalRound / 20) * 100))}%"></div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <p class="font-mono text-xs font-bold leading-none text-cartola-orange">${totalRound.toFixed(2)}</p>
                                            <div class="flex justify-end gap-1.5 mt-1">
                                                ${h.re ? `<span class="text-[9px] font-mono ${h.re >= 0 ? 'text-green-600' : 'text-red-500'}" title="Rodada Especial">RE: ${h.re >= 0 ? '+' : ''}${h.re.toFixed(1)}</span>` : ''}
                                                ${h.pen ? `<span class="text-[9px] font-mono text-red-500" title="Penalização">PEN: -${h.pen.toFixed(1)}</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    // Actions
    setSerie(serie) {
        this.state.activeSerie = serie;
        this.state.selectedRound = this.getMaxRound();
        this.state.selectedTeam = null;
        this.render();
    },

    setRound(round) {
        this.state.selectedRound = parseInt(round);
        this.render();
    },

    toggleView() {
        this.state.viewMode = this.state.viewMode === 'campo' ? 'tabela' : 'campo';
        this.render();
    },

    selectTeam(team) {
        this.state.selectedTeam = team;
        this.render();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
