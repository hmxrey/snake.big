/**
 * Snake Arena — Motor de Jogo, Níveis, Controles e Ranking
 * Criado por Ivo Ribeiro
 * Código em JavaScript puro (ES6+), pronto para execução estática.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. Configurações Globais e Definição dos 6 Níveis Progressivos
  // =========================================================================
  const GRID_SIZE = 20;
  const CANVAS_LOGICAL_SIZE = 560;
  const CELL_SIZE = CANVAS_LOGICAL_SIZE / GRID_SIZE;
  const POINTS_PER_APPLE = 10;
  const BONUS_POINTS = 30;
  const BONUS_DURATION_MS = 7000;
  const RANKING_STORAGE_KEY = 'snake_arena_ivo_ribeiro_ranking_v1';
  const PLAYER_STORAGE_KEY = 'snake_arena_ivo_ribeiro_last_player';
  const PROGRESS_STORAGE_KEY = 'snake_arena_ivo_ribeiro_progress_v1';
  const MAX_RANKING_ENTRIES = 10;

  // Cada nível define velocidade (ms por passo), meta de pontos na fase e obstáculos seguros
  // Nota: a linha y = 10 (colunas x = 1..8) fica sempre livre para nascimento seguro.
  const LEVELS = [
    {
      level: 1,
      name: 'Campo Aberto',
      speedMs: 145,
      levelGoal: 50,
      description: 'Arena livre para dominar os controles e ganhar ritmo.',
      obstacles: [],
    },
    {
      level: 2,
      name: 'Quatro Pilares',
      speedMs: 128,
      levelGoal: 70,
      description: 'Quatro pilares simétricos entram em campo. Atenção às curvas!',
      obstacles: [
        // Superior esquerdo / direito
        { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 14, y: 4 }, { x: 15, y: 4 }, { x: 14, y: 5 }, { x: 15, y: 5 },
        // Inferior esquerdo / direito
        { x: 4, y: 14 }, { x: 5, y: 14 }, { x: 4, y: 15 }, { x: 5, y: 15 },
        { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 14, y: 15 }, { x: 15, y: 15 },
      ],
    },
    {
      level: 3,
      name: 'Corredores',
      speedMs: 112,
      levelGoal: 90,
      description: 'Barreiras horizontais dividem o mapa em três faixas de navegação.',
      obstacles: [
        { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
        { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 }, { x: 16, y: 5 },
        { x: 3, y: 14 }, { x: 4, y: 14 }, { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
        { x: 12, y: 14 }, { x: 13, y: 14 }, { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 16, y: 14 },
      ],
    },
    {
      level: 4,
      name: 'Cruzamentos',
      speedMs: 98,
      levelGoal: 110,
      description: 'Eixos verticais e bloqueios laterais exigem reflexos mais rápidos.',
      obstacles: [
        { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
        { x: 10, y: 13 }, { x: 10, y: 14 }, { x: 10, y: 15 }, { x: 10, y: 16 }, { x: 10, y: 17 },
        { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }, { x: 17, y: 9 },
        { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
        { x: 2, y: 14 }, { x: 3, y: 14 }, { x: 4, y: 14 },
      ],
    },
    {
      level: 5,
      name: 'Cantoneiras',
      speedMs: 86,
      levelGoal: 130,
      description: 'Cantos fechados em L e torres centrais reduzem sua margem de erro.',
      obstacles: [
        // Cantos em L
        { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 14, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 },
        { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 }, { x: 3, y: 14 }, { x: 3, y: 15 },
        { x: 14, y: 16 }, { x: 15, y: 16 }, { x: 16, y: 16 }, { x: 16, y: 14 }, { x: 16, y: 15 },
        // Torres centrais
        { x: 10, y: 7 }, { x: 10, y: 8 },
        { x: 10, y: 12 }, { x: 10, y: 13 },
      ],
    },
    {
      level: 6,
      name: 'Fortaleza (Infinito)',
      speedMs: 76,
      levelGoal: null, // Modo infinito para disputa de recorde máximo
      description: 'Nível máximo! A cada 50 pontos extras, a velocidade fica ainda mais intensa.',
      obstacles: [
        // Portões internos
        { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 },
        { x: 7, y: 13 }, { x: 7, y: 14 }, { x: 7, y: 15 }, { x: 7, y: 16 },
        { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 },
        { x: 12, y: 13 }, { x: 12, y: 14 }, { x: 12, y: 15 }, { x: 12, y: 16 },
        // Pontes e blocos laterais
        { x: 9, y: 4 }, { x: 10, y: 4 },
        { x: 9, y: 15 }, { x: 10, y: 15 },
        { x: 2, y: 4 }, { x: 3, y: 4 },
        { x: 2, y: 15 }, { x: 3, y: 15 },
        { x: 16, y: 4 }, { x: 17, y: 4 },
        { x: 16, y: 15 }, { x: 17, y: 15 },
        // Pilares centrais
        { x: 10, y: 8 }, { x: 10, y: 12 },
      ],
    },
  ];

  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  };

  // =========================================================================
  // 2. Referências de DOM
  // =========================================================================
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const boardStage = document.getElementById('board-stage');

  const hudPlayer = document.getElementById('hud-player');
  const hudScore = document.getElementById('hud-score');
  const hudLevel = document.getElementById('hud-level');
  const hudGoal = document.getElementById('hud-goal');
  const hudBest = document.getElementById('hud-best');
  const levelProgressFill = document.getElementById('level-progress-fill');

  const overlayStart = document.getElementById('overlay-start');
  const overlayLevel = document.getElementById('overlay-level');
  const overlayPause = document.getElementById('overlay-pause');
  const overlayGameOver = document.getElementById('overlay-gameover');

  const startForm = document.getElementById('start-form');
  const playerNameInput = document.getElementById('player-name-input');
  const startLevelSelect = document.getElementById('start-level-select');
  const savedProgressNote = document.getElementById('saved-progress-note');
  const btnResetProgress = document.getElementById('btn-reset-progress');
  const nameError = document.getElementById('name-error');

  const levelUpKicker = document.getElementById('level-up-kicker');
  const levelUpTitle = document.getElementById('level-up-title');
  const levelUpDesc = document.getElementById('level-up-desc');

  const finalPlayer = document.getElementById('final-player');
  const finalScore = document.getElementById('final-score');
  const finalLevel = document.getElementById('final-level');
  const gameoverKicker = document.getElementById('gameover-kicker');
  const gameoverFeedback = document.getElementById('gameover-feedback');

  const btnSound = document.getElementById('btn-sound');
  const btnPause = document.getElementById('btn-pause');
  const btnNextLevel = document.getElementById('btn-next-level');
  const btnResume = document.getElementById('btn-resume');
  const btnRestartPaused = document.getElementById('btn-restart-paused');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnChangePlayer = document.getElementById('btn-change-player');
  const btnClearRanking = document.getElementById('btn-clear-ranking');

  const levelsListEl = document.getElementById('levels-list');
  const sidebarLevelName = document.getElementById('sidebar-level-name');
  const rankingBodyEl = document.getElementById('ranking-body');
  const rankingEmptyEl = document.getElementById('ranking-empty');
  const dpadButtons = document.querySelectorAll('.dpad-btn');

  // =========================================================================
  // 3. Sintetizador de Áudio Leve (Web Audio API)
  // =========================================================================
  const soundEngine = {
    enabled: true,
    audioCtx: null,

    ensureContext() {
      if (!this.enabled) return null;
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    },

    playTone(freq, durationSec, type = 'sine', volume = 0.08, delaySec = 0) {
      const ac = this.ensureContext();
      if (!ac) return;

      const startTime = ac.currentTime + delaySec;
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.02);
    },

    eat() {
      this.playTone(540, 0.09, 'triangle', 0.08);
      this.playTone(720, 0.1, 'triangle', 0.06, 0.04);
    },

    bonus() {
      this.playTone(660, 0.1, 'sine', 0.09);
      this.playTone(880, 0.12, 'sine', 0.08, 0.06);
      this.playTone(1100, 0.16, 'sine', 0.07, 0.12);
    },

    levelUp() {
      this.playTone(440, 0.12, 'triangle', 0.09, 0);
      this.playTone(554, 0.12, 'triangle', 0.09, 0.09);
      this.playTone(659, 0.18, 'triangle', 0.1, 0.18);
    },

    gameOver() {
      this.playTone(260, 0.15, 'sawtooth', 0.06, 0);
      this.playTone(190, 0.24, 'sawtooth', 0.06, 0.12);
    },
  };

  // =========================================================================
  // 4. Estado da Aplicação
  // =========================================================================
  const state = {
    mode: 'START', // 'START' | 'PLAYING' | 'PAUSED' | 'LEVEL_TRANSITION' | 'GAMEOVER'
    playerName: '',
    score: 0,
    levelScore: 0,
    levelIndex: 0,
    snake: [],
    direction: DIRECTIONS.RIGHT,
    directionQueue: [],
    food: null,
    bonusFood: null, // { x, y, expiresAt }
    applesEatenThisLevel: 0,
    lastTickTime: 0,
    animationFrameId: null,
    latestRankingId: null,
    clearConfirmTimeout: null,
    resetProgressTimeout: null,
  };

  // =========================================================================
  // 5. Persistência de Ranking (localStorage)
  // =========================================================================
  function loadRanking() {
    try {
      const raw = localStorage.getItem(RANKING_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveRanking(entries) {
    try {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Silencioso caso o navegador restrinja storage local
    }
  }

  function addRankingEntry(name, score, level) {
    const entries = loadRanking();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    entries.push({
      id,
      name,
      score,
      level,
      createdAt: Date.now(),
    });

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.level !== a.level) return b.level - a.level;
      return a.createdAt - b.createdAt;
    });

    const trimmed = entries.slice(0, MAX_RANKING_ENTRIES);
    saveRanking(trimmed);

    const enteredTop = trimmed.some((item) => item.id === id);
    state.latestRankingId = enteredTop ? id : null;
    return {
      enteredTop,
      isFirstPlace: trimmed.length > 0 && trimmed[0].id === id,
      bestScore: trimmed.length > 0 ? trimmed[0].score : score,
    };
  }

  function getBestScore() {
    const entries = loadRanking();
    return entries.length > 0 ? entries[0].score : 0;
  }

  function renderRanking() {
    const entries = loadRanking();
    rankingBodyEl.innerHTML = '';

    if (entries.length === 0) {
      rankingEmptyEl.hidden = false;
      hudBest.textContent = String(Math.max(0, state.score));
      return;
    }

    rankingEmptyEl.hidden = true;
    hudBest.textContent = String(Math.max(entries[0].score, state.score));

    entries.forEach((entry, index) => {
      const tr = document.createElement('tr');
      if (index === 0) tr.classList.add('is-top-one');
      if (entry.id === state.latestRankingId) tr.classList.add('is-latest');

      const posCell = document.createElement('td');
      posCell.textContent = `${index + 1}º`;

      const nameCell = document.createElement('td');
      nameCell.textContent = entry.name;

      const levelCell = document.createElement('td');
      levelCell.className = 'num';
      levelCell.textContent = `Nv. ${entry.level}`;

      const scoreCell = document.createElement('td');
      scoreCell.className = 'num';
      scoreCell.textContent = String(entry.score);

      tr.append(posCell, nameCell, levelCell, scoreCell);
      rankingBodyEl.appendChild(tr);
    });
  }

  // =========================================================================
  // 5b. Persistência de Progresso de Níveis (localStorage)
  // =========================================================================
  function normalizePlayerKey(name) {
    return (name || '').trim().toLowerCase() || '__default__';
  }

  function loadAllProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveAllProgress(map) {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Silencioso caso o navegador restrinja storage local
    }
  }

  function getUnlockedLevelIndex(playerName) {
    const map = loadAllProgress();
    const key = normalizePlayerKey(playerName);
    const saved = Number.isInteger(map[key]) ? map[key] : 0;
    return Math.max(0, Math.min(LEVELS.length - 1, saved));
  }

  function saveUnlockedLevelIndex(playerName, levelIndex) {
    const map = loadAllProgress();
    const key = normalizePlayerKey(playerName);
    const current = Number.isInteger(map[key]) ? map[key] : 0;
    if (levelIndex > current) {
      map[key] = Math.min(LEVELS.length - 1, levelIndex);
      saveAllProgress(map);
    }
  }

  function resetSavedProgress(playerName) {
    const map = loadAllProgress();
    const key = normalizePlayerKey(playerName);
    delete map[key];
    saveAllProgress(map);
  }

  function syncLevelSelector(preferHighest = true) {
    const name = playerNameInput.value.trim();
    const unlockedIndex = getUnlockedLevelIndex(name);
    const prevSelected = Number.parseInt(startLevelSelect.value, 10);

    startLevelSelect.innerHTML = '';
    LEVELS.forEach((cfg, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      const isLocked = idx > unlockedIndex;
      opt.disabled = isLocked;
      opt.textContent = isLocked
        ? `Nível ${cfg.level} — ${cfg.name} (Bloqueado)`
        : `Nível ${cfg.level} — ${cfg.name}`;
      startLevelSelect.appendChild(opt);
    });

    const targetIndex = preferHighest
      ? unlockedIndex
      : Math.min(unlockedIndex, Number.isNaN(prevSelected) ? unlockedIndex : prevSelected);

    startLevelSelect.value = String(targetIndex);
    state.levelIndex = targetIndex;

    if (unlockedIndex > 0) {
      savedProgressNote.textContent = `Progresso salvo: desbloqueado até o Nível ${unlockedIndex + 1}.`;
      btnResetProgress.hidden = false;
    } else {
      savedProgressNote.textContent = 'Avance de fase para salvar e desbloquear os próximos níveis.';
      btnResetProgress.hidden = true;
    }

    resetSnakeForLevel();
    updateHUD();
    renderBoard();
  }

  // =========================================================================
  // 6. Lógica do Tabuleiro, Colisões e Spawn Seguro
  // =========================================================================
  function getCurrentLevelConfig() {
    return LEVELS[state.levelIndex];
  }

  function getCurrentTickIntervalMs() {
    const cfg = getCurrentLevelConfig();
    if (cfg.level < LEVELS.length) {
      return cfg.speedMs;
    }
    // No nível 6 (infinito), acelera gradualmente a cada 50 pontos feitos nesta fase
    const extraSteps = Math.max(0, Math.floor(state.levelScore / 50));
    return Math.max(60, cfg.speedMs - extraSteps * 3);
  }

  function isCellOccupied(x, y, includeFood = true) {
    const obstacles = getCurrentLevelConfig().obstacles;
    if (obstacles.some((o) => o.x === x && o.y === y)) return true;
    if (state.snake.some((seg) => seg.x === x && seg.y === y)) return true;
    if (includeFood && state.food && state.food.x === x && state.food.y === y) return true;
    if (
      includeFood &&
      state.bonusFood &&
      state.bonusFood.x === x &&
      state.bonusFood.y === y
    ) {
      return true;
    }
    return false;
  }

  function countFreeNeighbors(x, y) {
    const obstacles = getCurrentLevelConfig().obstacles;
    const dirs = Object.values(DIRECTIONS);
    let free = 0;

    for (const d of dirs) {
      const nx = x + d.x;
      const ny = y + d.y;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
      if (obstacles.some((o) => o.x === nx && o.y === ny)) continue;
      free += 1;
    }
    return free;
  }

  function findSafeEmptyCell() {
    const candidates = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (!isCellOccupied(x, y, true) && countFreeNeighbors(x, y) >= 2) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) {
      // Fallback caso o tabuleiro esteja quase totalmente preenchido
      for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
          if (!isCellOccupied(x, y, true)) candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function resetSnakeForLevel() {
    // Nasce sempre na linha y = 10 indo para a direita, garantindo início seguro
    state.snake = [
      { x: 4, y: 10 },
      { x: 3, y: 10 },
      { x: 2, y: 10 },
    ];
    state.direction = DIRECTIONS.RIGHT;
    state.directionQueue = [];
    state.bonusFood = null;
    state.applesEatenThisLevel = 0;
    state.food = findSafeEmptyCell();
  }

  // =========================================================================
  // 7. Controle de Fluxo de Partida e Interface
  // =========================================================================
  function hideAllOverlays() {
    overlayStart.hidden = true;
    overlayLevel.hidden = true;
    overlayPause.hidden = true;
    overlayGameOver.hidden = true;
  }

  function updateSidebarLevels() {
    levelsListEl.innerHTML = '';
    const activeCfg = getCurrentLevelConfig();
    const unlockedIndex = getUnlockedLevelIndex(
      state.playerName || playerNameInput.value.trim()
    );
    sidebarLevelName.textContent = `Nível ${activeCfg.level}: ${activeCfg.name}`;

    LEVELS.forEach((cfg, idx) => {
      const li = document.createElement('li');
      li.className = 'level-row';
      if (idx === state.levelIndex) li.classList.add('is-active');
      else if (idx < state.levelIndex || idx <= unlockedIndex) li.classList.add('is-completed');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'level-row-name';
      nameSpan.textContent = `${cfg.level}. ${cfg.name}`;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'level-row-meta';
      if (idx > unlockedIndex && idx > state.levelIndex) {
        metaSpan.textContent = 'Bloqueado';
      } else {
        metaSpan.textContent = cfg.levelGoal ? `${cfg.levelGoal} pts` : 'Infinito';
      }

      li.append(nameSpan, metaSpan);
      levelsListEl.appendChild(li);
    });
  }

  function updateHUD() {
    const cfg = getCurrentLevelConfig();

    hudPlayer.textContent = state.playerName || playerNameInput.value.trim() || '—';
    hudScore.textContent = String(state.score);
    hudLevel.textContent = `${cfg.level} / ${LEVELS.length}`;
    hudGoal.textContent = cfg.levelGoal
      ? `${state.levelScore}/${cfg.levelGoal}`
      : 'Infinito';
    hudBest.textContent = String(Math.max(getBestScore(), state.score));

    if (cfg.levelGoal) {
      const pct = Math.min(100, Math.round((state.levelScore / cfg.levelGoal) * 100));
      levelProgressFill.style.width = `${pct}%`;
    } else {
      levelProgressFill.style.width = '100%';
    }

    updateSidebarLevels();
  }

  function startNewGame(playerName, startLevelIndex = null) {
    state.playerName = playerName.trim();
    try {
      localStorage.setItem(PLAYER_STORAGE_KEY, state.playerName);
    } catch {
      // Ignora erro de storage
    }

    const unlockedIndex = getUnlockedLevelIndex(state.playerName);
    const chosenIndex =
      startLevelIndex !== null
        ? Math.max(0, Math.min(unlockedIndex, startLevelIndex))
        : unlockedIndex;

    state.score = 0;
    state.levelScore = 0;
    state.levelIndex = chosenIndex;
    state.latestRankingId = null;
    resetSnakeForLevel();

    hideAllOverlays();
    state.mode = 'PLAYING';
    btnPause.disabled = false;
    btnPause.textContent = 'Pausar';

    updateHUD();
    renderBoard();
    startGameLoop();
  }

  function pauseGame() {
    if (state.mode !== 'PLAYING') return;
    state.mode = 'PAUSED';
    stopGameLoop();
    btnPause.textContent = 'Retomar';
    overlayPause.hidden = false;
  }

  function resumeGame() {
    if (state.mode !== 'PAUSED') return;
    hideAllOverlays();
    state.mode = 'PLAYING';
    btnPause.textContent = 'Pausar';
    startGameLoop();
  }

  function triggerLevelUp() {
    state.levelIndex += 1;
    state.levelScore = 0;
    state.mode = 'LEVEL_TRANSITION';
    stopGameLoop();
    soundEngine.levelUp();

    // Salva imediatamente o novo nível desbloqueado no localStorage
    saveUnlockedLevelIndex(state.playerName, state.levelIndex);

    resetSnakeForLevel();
    updateHUD();
    renderBoard();

    const nextCfg = getCurrentLevelConfig();
    levelUpKicker.textContent = `Nível ${nextCfg.level} de ${LEVELS.length} · Progresso salvo`;
    levelUpTitle.textContent = nextCfg.name;
    levelUpDesc.textContent = nextCfg.description;
    overlayLevel.hidden = false;
    btnNextLevel.focus();
  }

  function continueAfterLevelUp() {
    if (state.mode !== 'LEVEL_TRANSITION') return;
    hideAllOverlays();
    state.mode = 'PLAYING';
    startGameLoop();
  }

  function handleGameOver() {
    state.mode = 'GAMEOVER';
    stopGameLoop();
    soundEngine.gameOver();
    btnPause.disabled = true;

    const currentLevel = getCurrentLevelConfig().level;
    const result = addRankingEntry(state.playerName, state.score, currentLevel);
    renderRanking();
    updateHUD();

    finalPlayer.textContent = state.playerName;
    finalScore.textContent = String(state.score);
    finalLevel.textContent = `Nível ${currentLevel}`;
    btnPlayAgain.textContent = `Jogar Novamente (Nível ${currentLevel})`;

    if (state.score === 0) {
      gameoverKicker.textContent = 'Fim de Partida';
      gameoverFeedback.textContent = `Seu progresso até o Nível ${currentLevel} continua salvo.`;
    } else if (result.isFirstPlace) {
      gameoverKicker.textContent = 'Novo Recorde Absoluto!';
      gameoverFeedback.textContent = 'Parabéns! Você assumiu a 1ª colocação do ranking.';
    } else if (result.enteredTop) {
      gameoverKicker.textContent = 'Classificado no Top 10';
      gameoverFeedback.textContent = 'Excelente desempenho! Sua pontuação foi salva no ranking.';
    } else {
      gameoverKicker.textContent = 'Fim de Partida';
      gameoverFeedback.textContent = 'Continue treinando para alcançar o Top 10 do placar.';
    }

    overlayGameOver.hidden = false;
    btnPlayAgain.focus();
  }

  // =========================================================================
  // 8. Motor de Atualização (Tick & Loop)
  // =========================================================================
  function queueDirection(newDirKey) {
    const nextDir = DIRECTIONS[newDirKey];
    if (!nextDir) return;

    // Compara com a última direção na fila ou a direção atual
    const lastPlanned =
      state.directionQueue.length > 0
        ? state.directionQueue[state.directionQueue.length - 1]
        : state.direction;

    // Impede reversão instantânea de 180 graus e direções repetidas
    if (nextDir.x === -lastPlanned.x && nextDir.y === -lastPlanned.y) return;
    if (nextDir.x === lastPlanned.x && nextDir.y === lastPlanned.y) return;

    if (state.directionQueue.length < 2) {
      state.directionQueue.push(nextDir);
    }
  }

  function stepGame(now) {
    // Expiração da maçã bônus
    if (state.bonusFood && now >= state.bonusFood.expiresAt) {
      state.bonusFood = null;
    }

    if (state.directionQueue.length > 0) {
      state.direction = state.directionQueue.shift();
    }

    const head = state.snake[0];
    const nextHead = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y,
    };

    // Colisão com paredes externas
    if (
      nextHead.x < 0 ||
      nextHead.x >= GRID_SIZE ||
      nextHead.y < 0 ||
      nextHead.y >= GRID_SIZE
    ) {
      handleGameOver();
      return;
    }

    // Colisão com obstáculos do nível
    const obstacles = getCurrentLevelConfig().obstacles;
    if (obstacles.some((o) => o.x === nextHead.x && o.y === nextHead.y)) {
      handleGameOver();
      return;
    }

    const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
    const ateBonus =
      state.bonusFood &&
      nextHead.x === state.bonusFood.x &&
      nextHead.y === state.bonusFood.y;

    // Verifica colisão com o próprio corpo (ignora a cauda se não for crescer)
    const bodyToCheck = ateFood || ateBonus ? state.snake : state.snake.slice(0, -1);
    if (bodyToCheck.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y)) {
      handleGameOver();
      return;
    }

    state.snake.unshift(nextHead);

    if (ateFood || ateBonus) {
      if (ateFood) {
        state.score += POINTS_PER_APPLE;
        state.levelScore += POINTS_PER_APPLE;
        state.applesEatenThisLevel += 1;
        soundEngine.eat();
        state.food = findSafeEmptyCell();

        // A partir do Nível 2, a cada 3 maçãs pode surgir uma maçã dourada bônus
        if (
          state.levelIndex >= 1 &&
          !state.bonusFood &&
          state.applesEatenThisLevel % 3 === 0
        ) {
          const bonusPos = findSafeEmptyCell();
          if (bonusPos) {
            state.bonusFood = {
              x: bonusPos.x,
              y: bonusPos.y,
              expiresAt: now + BONUS_DURATION_MS,
            };
          }
        }
      }

      if (ateBonus) {
        state.score += BONUS_POINTS;
        state.levelScore += BONUS_POINTS;
        state.bonusFood = null;
        soundEngine.bonus();
      }

      updateHUD();

      // Verifica avanço para o próximo nível com base nos pontos conquistados nesta fase
      const currentCfg = getCurrentLevelConfig();
      if (
        currentCfg.levelGoal !== null &&
        state.levelScore >= currentCfg.levelGoal &&
        state.levelIndex < LEVELS.length - 1
      ) {
        triggerLevelUp();
        return;
      }
    } else {
      state.snake.pop();
    }
  }

  function gameLoop(timestamp) {
    if (state.mode !== 'PLAYING') return;

    if (!state.lastTickTime) {
      state.lastTickTime = timestamp;
    }

    const tickMs = getCurrentTickIntervalMs();
    if (timestamp - state.lastTickTime >= tickMs) {
      state.lastTickTime = timestamp;
      stepGame(timestamp);
    }

    if (state.mode === 'PLAYING') {
      renderBoard(timestamp);
      state.animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function startGameLoop() {
    stopGameLoop();
    state.lastTickTime = 0;
    state.animationFrameId = requestAnimationFrame(gameLoop);
  }

  function stopGameLoop() {
    if (state.animationFrameId !== null) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }
  }

  // =========================================================================
  // 9. Renderização em Canvas (Visual Limpo e Nítido)
  // =========================================================================
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }

  function renderBoard(now = performance.now()) {
    // Fundo do tabuleiro
    ctx.fillStyle = '#11181f';
    ctx.fillRect(0, 0, CANVAS_LOGICAL_SIZE, CANVAS_LOGICAL_SIZE);

    // Grade sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i += 1) {
      const pos = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_LOGICAL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_LOGICAL_SIZE, pos);
      ctx.stroke();
    }

    // Obstáculos do nível
    const obstacles = getCurrentLevelConfig().obstacles;
    obstacles.forEach((obs) => {
      const px = obs.x * CELL_SIZE + 2;
      const py = obs.y * CELL_SIZE + 2;
      const size = CELL_SIZE - 4;

      ctx.fillStyle = '#334155';
      drawRoundedRect(px, py, size, size, 5);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
    });

    // Maçã padrão
    if (state.food) {
      const cx = state.food.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = state.food.y * CELL_SIZE + CELL_SIZE / 2;
      const r = CELL_SIZE * 0.34;

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Folha discreta
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy - r - 1, 3.5, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Maçã dourada (bônus com anel de tempo restante)
    if (state.bonusFood) {
      const remainingRatio = Math.max(
        0,
        (state.bonusFood.expiresAt - now) / BONUS_DURATION_MS
      );
      const cx = state.bonusFood.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = state.bonusFood.y * CELL_SIZE + CELL_SIZE / 2;
      const r = CELL_SIZE * 0.36;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Anel indicador do tempo restante
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        r + 3.5,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * remainingRatio
      );
      ctx.stroke();
    }

    // Serpente (da cauda para a cabeça)
    for (let i = state.snake.length - 1; i >= 0; i -= 1) {
      const seg = state.snake[i];
      const isHead = i === 0;
      const pad = isHead ? 1.5 : 2.5;
      const px = seg.x * CELL_SIZE + pad;
      const py = seg.y * CELL_SIZE + pad;
      const size = CELL_SIZE - pad * 2;

      if (isHead) {
        ctx.fillStyle = '#34d399';
      } else {
        const fade = Math.max(0.45, 1 - (i / Math.max(8, state.snake.length)) * 0.45);
        ctx.fillStyle = `rgba(16, 185, 129, ${fade.toFixed(2)})`;
      }

      drawRoundedRect(px, py, size, size, isHead ? 7 : 5);

      // Olhos direcionais na cabeça
      if (isHead) {
        ctx.fillStyle = '#062118';
        const eyeSize = 2.6;
        const centerX = seg.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = seg.y * CELL_SIZE + CELL_SIZE / 2;
        const offsetForward = 5;
        const offsetSide = 4.5;

        let eye1 = { x: centerX, y: centerY };
        let eye2 = { x: centerX, y: centerY };

        if (state.direction === DIRECTIONS.RIGHT) {
          eye1 = { x: centerX + offsetForward, y: centerY - offsetSide };
          eye2 = { x: centerX + offsetForward, y: centerY + offsetSide };
        } else if (state.direction === DIRECTIONS.LEFT) {
          eye1 = { x: centerX - offsetForward, y: centerY - offsetSide };
          eye2 = { x: centerX - offsetForward, y: centerY + offsetSide };
        } else if (state.direction === DIRECTIONS.UP) {
          eye1 = { x: centerX - offsetSide, y: centerY - offsetForward };
          eye2 = { x: centerX + offsetSide, y: centerY - offsetForward };
        } else {
          eye1 = { x: centerX - offsetSide, y: centerY + offsetForward };
          eye2 = { x: centerX + offsetSide, y: centerY + offsetForward };
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // =========================================================================
  // 10. Eventos de Teclado, Toque (Swipe + D-Pad) e Botões
  // =========================================================================
  function handleKeyDown(event) {
    const key = event.key;

    // Permite digitação normal quando o foco está no campo de nome
    if (document.activeElement === playerNameInput) {
      return;
    }

    if (
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === ' '
    ) {
      event.preventDefault();
    }

    if (key === ' ' || key === 'Enter') {
      if (state.mode === 'LEVEL_TRANSITION') {
        continueAfterLevelUp();
        return;
      }
      if (state.mode === 'GAMEOVER') {
        startNewGame(state.playerName, state.levelIndex);
        return;
      }
    }

    if (key === ' ' || key === 'p' || key === 'P') {
      if (state.mode === 'PLAYING') pauseGame();
      else if (state.mode === 'PAUSED') resumeGame();
      return;
    }

    if (key === 'm' || key === 'M') {
      toggleSound();
      return;
    }

    if (state.mode !== 'PLAYING') return;

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        queueDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        queueDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        queueDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        queueDirection('RIGHT');
        break;
      default:
        break;
    }
  }

  // Suporte a gestos de deslize (Swipe) diretamente no tabuleiro
  let touchStartX = 0;
  let touchStartY = 0;

  boardStage.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  boardStage.addEventListener(
    'touchend',
    (e) => {
      if (state.mode !== 'PLAYING' || e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const minSwipeDistance = 24;

      if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
        return;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        queueDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        queueDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    },
    { passive: true }
  );

  // D-Pad tátil na tela
  dpadButtons.forEach((btn) => {
    const dir = btn.getAttribute('data-dir');
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (state.mode === 'PLAYING' && dir) {
        queueDirection(dir);
      }
    });
  });

  function toggleSound() {
    soundEngine.enabled = !soundEngine.enabled;
    btnSound.setAttribute('aria-pressed', String(soundEngine.enabled));
    btnSound.textContent = soundEngine.enabled ? 'Som: Ligado' : 'Som: Mudo';
  }

  // Formulário inicial
  startForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    if (!name) {
      nameError.hidden = false;
      playerNameInput.focus();
      return;
    }
    nameError.hidden = true;
    const chosenLevel = Number.parseInt(startLevelSelect.value, 10) || 0;
    startNewGame(name, chosenLevel);
  });

  playerNameInput.addEventListener('input', () => {
    if (playerNameInput.value.trim()) {
      nameError.hidden = true;
    }
    syncLevelSelector(true);
  });

  startLevelSelect.addEventListener('change', () => {
    const idx = Number.parseInt(startLevelSelect.value, 10);
    if (!Number.isNaN(idx)) {
      state.levelIndex = idx;
      resetSnakeForLevel();
      updateHUD();
      renderBoard();
    }
  });

  btnResetProgress.addEventListener('click', () => {
    if (!btnResetProgress.classList.contains('is-confirming')) {
      btnResetProgress.classList.add('is-confirming');
      btnResetProgress.textContent = 'Confirmar?';
      clearTimeout(state.resetProgressTimeout);
      state.resetProgressTimeout = setTimeout(() => {
        btnResetProgress.classList.remove('is-confirming');
        btnResetProgress.textContent = 'Resetar progresso';
      }, 3000);
      return;
    }

    clearTimeout(state.resetProgressTimeout);
    btnResetProgress.classList.remove('is-confirming');
    btnResetProgress.textContent = 'Resetar progresso';
    resetSavedProgress(playerNameInput.value.trim());
    syncLevelSelector(true);
  });

  // Botões de ação
  btnSound.addEventListener('click', toggleSound);

  btnPause.addEventListener('click', () => {
    if (state.mode === 'PLAYING') pauseGame();
    else if (state.mode === 'PAUSED') resumeGame();
  });

  btnNextLevel.addEventListener('click', continueAfterLevelUp);
  btnResume.addEventListener('click', resumeGame);

  btnRestartPaused.addEventListener('click', () => {
    startNewGame(state.playerName, state.levelIndex);
  });

  btnPlayAgain.addEventListener('click', () => {
    startNewGame(state.playerName, state.levelIndex);
  });

  btnChangePlayer.addEventListener('click', () => {
    hideAllOverlays();
    state.mode = 'START';
    btnPause.disabled = true;
    syncLevelSelector(true);
    overlayStart.hidden = false;
    playerNameInput.focus();
    playerNameInput.select();
  });

  // Limpeza segura do ranking em 2 cliques (evita window.confirm bloqueado em iframes)
  btnClearRanking.addEventListener('click', () => {
    if (!btnClearRanking.classList.contains('is-confirming')) {
      btnClearRanking.classList.add('is-confirming');
      btnClearRanking.textContent = 'Confirmar?';
      clearTimeout(state.clearConfirmTimeout);
      state.clearConfirmTimeout = setTimeout(() => {
        btnClearRanking.classList.remove('is-confirming');
        btnClearRanking.textContent = 'Limpar';
      }, 3000);
      return;
    }

    clearTimeout(state.clearConfirmTimeout);
    btnClearRanking.classList.remove('is-confirming');
    btnClearRanking.textContent = 'Limpar';
    localStorage.removeItem(RANKING_STORAGE_KEY);
    state.latestRankingId = null;
    renderRanking();
  });

  document.addEventListener('keydown', handleKeyDown);

  // =========================================================================
  // 11. Inicialização da Aplicação
  // =========================================================================
  function init() {
    try {
      const savedName = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (savedName) {
        playerNameInput.value = savedName;
      }
    } catch {
      // Ignora erro de storage
    }

    syncLevelSelector(true);
    renderRanking();
  }

  init();
})();
