// --- Space Quest — Progression Layer ---
// Galaxy map home screen, per-level star ratings, star-coin economy + shop,
// daily missions with streaks, and the parent (Grown-Up Zone) dashboard.

const Progression = (() => {
  const STORE_KEY = 'space_quest_profile_v1';

  const PLANETS = [
    { id: 'multiply', name: 'Planet Multiplia', emoji: '🪐', tagline: 'Times tables', levels: [
      { id: 'easy', name: 'Easy Tables', desc: '×2, ×5, ×10', tables: [2, 5, 10] },
      { id: 'medium', name: 'Medium Tables', desc: '×3, ×4, ×6, ×11', tables: [3, 4, 6, 11] },
      { id: 'hard', name: 'Hard Tables', desc: '×7, ×8, ×9, ×12', tables: [7, 8, 9, 12] },
      { id: 'cosmic', name: 'Cosmic Tables', desc: '×13, ×14, ×15', tables: [13, 14, 15] },
    ]},
    { id: 'divide', name: 'Division Station', emoji: '🛰️', tagline: 'Space sharing', levels: [
      { id: 'easy', name: 'Easy Divisors', desc: '÷2, ÷5, ÷10', tables: [2, 5, 10] },
      { id: 'medium', name: 'Medium Divisors', desc: '÷3, ÷4, ÷6', tables: [3, 4, 6] },
      { id: 'hard', name: 'Hard Divisors', desc: '÷7, ÷8, ÷9, ÷12', tables: [7, 8, 9, 12] },
    ]},
    { id: 'add', name: 'Addition Asteroids', emoji: '☄️', tagline: 'Adding power', levels: [
      { id: 'single', name: 'Single Digits', desc: '1 to 9' },
      { id: 'double', name: 'Double Digits', desc: '10 to 99' },
      { id: 'triple', name: 'Triple Digits', desc: '100 to 999' },
      { id: 'mixed', name: 'Mixed Dust', desc: 'All sizes' },
    ]},
    { id: 'subtract', name: 'Subtraction Nebula', emoji: '🌫️', tagline: 'Taking away', levels: [
      { id: 'single', name: 'Single Digits', desc: '1 to 9' },
      { id: 'double', name: 'Double Digits', desc: '10 to 99' },
      { id: 'triple', name: 'Triple Digits', desc: '100 to 999' },
      { id: 'mixed', name: 'Mixed Dust', desc: 'All sizes' },
    ]},
    { id: 'sequence', name: 'Pattern Comet', emoji: '💫', tagline: 'Number patterns', levels: [
      { id: 'easy', name: 'Star Steps', desc: 'Easy steps' },
      { id: 'medium', name: 'Nebula Skip', desc: 'Tricky steps' },
      { id: 'hard', name: 'Supernova Growth', desc: 'Doubling & Fibonacci' },
    ]},
    { id: 'compare', name: 'Balance Belt', emoji: '⚖️', tagline: 'Greater or less', levels: [
      { id: 'easy', name: 'Asteroid Sizes', desc: 'Compare numbers' },
      { id: 'medium', name: 'Double Warp', desc: 'Formula vs number' },
      { id: 'hard', name: 'Galactic Force', desc: 'Formula vs formula' },
    ]},
    { id: 'clock', name: 'Clockwork Moon', emoji: '⏰', tagline: 'Telling time', levels: [
      { id: 'hour', name: 'Hour Planets', desc: 'On the hour' },
      { id: 'quarter', name: 'Half & Quarters', desc: 'e.g. 2:30' },
      { id: 'five-min', name: 'Five-Min Sectors', desc: 'e.g. 4:25' },
      { id: 'precision', name: 'Precision Flight', desc: 'Any minute' },
    ]},
    { id: 'fraction', name: 'Fraction Pizzeria', emoji: '🍕', tagline: 'Pizza math', levels: [
      { id: 'identify', name: 'Read It', desc: 'Name the fraction' },
      { id: 'simplify', name: 'Simplify It', desc: 'Lowest terms' },
      { id: 'add', name: 'Add It', desc: 'Add fractions' },
      { id: 'subtract', name: 'Subtract It', desc: 'Subtract fractions' },
    ]},
    { id: 'music', name: 'Rhythm Nebula', emoji: '🎵', tagline: 'Piano math', levels: [
      { id: 'notes', name: 'Note Values', desc: 'Beats per note' },
      { id: 'beats', name: 'Beat Counting', desc: 'Add up the notes' },
      { id: 'measures', name: 'Measure Math', desc: 'Beats × measures' },
    ]},
    { id: 'angles', name: 'Twist & Turn Arena', emoji: '🤸', tagline: 'Gymnastics turns', levels: [
      { id: 'turns', name: 'Name the Turn', desc: 'Turns to degrees' },
      { id: 'combine', name: 'Routine Builder', desc: 'Add up the turns' },
      { id: 'convert', name: 'Twist Converter', desc: 'Quarters, halves & twists' },
    ]},
    { id: 'puzzle', name: 'Puzzle Asteroid', emoji: '🧩', tagline: 'Brain teasers', levels: [
      { id: 'mystery', name: 'Mystery Number', desc: 'Find the hidden number' },
      { id: 'emoji', name: 'Emoji Equations', desc: 'Crack the fruit code' },
      { id: 'magic', name: 'Magic Squares', desc: 'Make rows & columns match' },
    ]},
    { id: 'pokemon', name: 'Poké Galaxy', emoji: '⚡', tagline: 'Gotta know \'em all', levels: [
      { id: 'identity', name: "Who's That Pokémon?", desc: 'Name the silhouette' },
      { id: 'type', name: 'Type Match', desc: 'Fire, water, grass…' },
      { id: 'evolution', name: 'Evolution Lab', desc: 'Who evolves into whom?' },
    ]},
  ];

  const ROCKETS = [
    { id: 'rocket', emoji: '🚀', name: 'Classic Rocket', price: 0 },
    { id: 'ufo', emoji: '🛸', name: 'Cosmic UFO', price: 80 },
    { id: 'star', emoji: '🌟', name: 'Shooting Star', price: 150 },
    { id: 'unicorn', emoji: '🦄', name: 'Space Unicorn', price: 250 },
    { id: 'piano', emoji: '🎹', name: 'Grand Piano', price: 200 },
    { id: 'gymnast', emoji: '🤸', name: 'Flying Gymnast', price: 200 },
    { id: 'dragon', emoji: '🐉', name: 'Star Dragon', price: 400 },
  ];

  const TRAILS = [
    { id: 'cyan', name: 'Cyan Glow', color: 'oklch(0.78 0.18 190)', price: 0 },
    { id: 'pink', name: 'Pink Blaze', color: 'oklch(0.65 0.25 340)', price: 60 },
    { id: 'violet', name: 'Melody Glow', color: 'oklch(0.62 0.25 300)', price: 90 },
    { id: 'gold', name: 'Golden Comet', color: 'oklch(0.85 0.22 85)', price: 120 },
    { id: 'green', name: 'Alien Aura', color: 'oklch(0.75 0.20 140)', price: 120 },
  ];

  const JINGLES = [
    { id: 'classic', emoji: '🎺', name: 'Classic Fanfare', price: 0 },
    { id: 'arpeggio', emoji: '🎹', name: 'Piano Arpeggio', price: 100 },
    { id: 'glissando', emoji: '✨', name: 'Sparkle Glissando', price: 150 },
  ];

  const DEFAULT_PROFILE = {
    name: '',
    namePromptShown: false,
    coins: 0,
    rocket: 'rocket',
    trail: 'cyan',
    jingle: 'classic',
    owned: ['rocket', 'cyan', 'classic'],
    stars: {},          // missionKey -> best star count (0-3)
    streak: { count: 0, lastDate: null, shieldWeek: null },
    dailyHistory: [],   // ['2026-06-10', ...] days with completed daily mission
    totalMissions: 0,
  };

  let profile = loadProfile();
  let parentUnlocked = false;
  let parentGateAnswer = null;

  function loadProfile() {
    let p = { ...DEFAULT_PROFILE };
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) p = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch (e) { /* fall through to defaults */ }
    // Profiles saved before Victory Tunes existed need the free jingle
    if (!p.owned.includes('classic')) p.owned.push('classic');
    return p;
  }

  function saveProfile() {
    localStorage.setItem(STORE_KEY, JSON.stringify(profile));
  }

  // --- Date helpers (local time, not UTC) ---
  function dateStr(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function weekId(d = new Date()) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    return `${d.getFullYear()}-${week}`;
  }

  // --- Mission keys & level application ---
  function applyLevel(planet, level, s) {
    s.activeOp = planet.id;
    if (level.tables) s.selectedTables = [...level.tables];
    else if (planet.id === 'add' || planet.id === 'subtract') s.digitLevel = level.id;
    else if (planet.id === 'clock') s.clockLevel = level.id;
    else if (planet.id === 'fraction') s.fractionLevel = level.id;
    else if (planet.id === 'sequence') s.sequenceLevel = level.id;
    else if (planet.id === 'compare') s.compareLevel = level.id;
    else if (planet.id === 'music') s.musicLevel = level.id;
    else if (planet.id === 'angles') s.anglesLevel = level.id;
    else if (planet.id === 'puzzle') s.puzzleLevel = level.id;
    else if (planet.id === 'pokemon') s.pokemonLevel = level.id;
  }

  // Derive a missionKey from the current setup-screen state so custom
  // missions that exactly match a planet level still earn its stars.
  function keyFromState(s) {
    const planet = PLANETS.find(p => p.id === s.activeOp);
    if (!planet) return null;
    if (s.activeOp === 'multiply' || s.activeOp === 'divide') {
      const sel = [...s.selectedTables].sort((a, b) => a - b).join(',');
      const lvl = planet.levels.find(l => l.tables && [...l.tables].sort((a, b) => a - b).join(',') === sel);
      return lvl ? `${planet.id}:${lvl.id}` : null;
    }
    const levelId =
      (s.activeOp === 'add' || s.activeOp === 'subtract') ? s.digitLevel :
      s.activeOp === 'clock' ? s.clockLevel :
      s.activeOp === 'fraction' ? s.fractionLevel :
      s.activeOp === 'sequence' ? s.sequenceLevel :
      s.activeOp === 'music' ? s.musicLevel :
      s.activeOp === 'angles' ? s.anglesLevel :
      s.activeOp === 'puzzle' ? s.puzzleLevel :
      s.activeOp === 'pokemon' ? s.pokemonLevel : s.compareLevel;
    const lvl = planet.levels.find(l => l.id === levelId);
    return lvl ? `${planet.id}:${levelId}` : null;
  }

  function starsFor(missionKey) {
    return profile.stars[missionKey] || 0;
  }

  function isLevelUnlocked(planet, levelIndex) {
    if (levelIndex === 0) return true;
    const prev = planet.levels[levelIndex - 1];
    return starsFor(`${planet.id}:${prev.id}`) >= 2;
  }

  function planetStarTotals(planet) {
    let earned = 0;
    planet.levels.forEach(l => { earned += starsFor(`${planet.id}:${l.id}`); });
    return { earned, max: planet.levels.length * 3 };
  }

  // --- Galaxy rendering ---
  function renderGalaxy() {
    const greeting = document.getElementById('galaxy-greeting');
    if (greeting) {
      greeting.innerText = profile.name
        ? `Welcome back, ${profile.name}! 🚀`
        : 'Welcome, Space Explorer! 🚀';
    }

    let totalEarned = 0, totalMax = 0;
    PLANETS.forEach(p => {
      const t = planetStarTotals(p);
      totalEarned += t.earned;
      totalMax += t.max;
    });

    const streakEl = document.getElementById('galaxy-streak');
    if (streakEl) streakEl.innerText = `🔥 ${profile.streak.count} day streak`;
    const starsEl = document.getElementById('galaxy-stars');
    if (starsEl) starsEl.innerText = `🌟 ${totalEarned} / ${totalMax} stars`;
    updateCoinHud();

    // Daily mission card state
    const dailyBtn = document.getElementById('btn-daily');
    const dailyDesc = document.getElementById('daily-desc');
    const doneToday = profile.dailyHistory.includes(dateStr());
    if (dailyBtn && dailyDesc) {
      if (doneToday) {
        dailyBtn.innerText = 'Play Again 🔁';
        dailyDesc.innerText = "Today's mission complete! Extra practice earns extra coins! ✅";
      } else {
        dailyBtn.innerText = 'Start! 🚀';
        dailyDesc.innerText = '4 questions picked just for you + the Puzzle of the Day! 🧩';
      }
    }
    renderStreakCalendar();

    // Planet cards
    const grid = document.getElementById('planets-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PLANETS.forEach(planet => {
      const totals = planetStarTotals(planet);
      const pct = totals.max === 0 ? 0 : Math.round((totals.earned / totals.max) * 100);
      const card = document.createElement('button');
      card.className = 'planet-card glass-panel';
      card.innerHTML = `
        <div class="planet-ring" style="--ring-pct:${pct}">
          <span class="planet-emoji">${planet.emoji}</span>
        </div>
        <span class="planet-name">${planet.name}</span>
        <span class="planet-tagline">${planet.tagline}</span>
        <span class="planet-stars">🌟 ${totals.earned} / ${totals.max}</span>
      `;
      card.addEventListener('click', () => {
        playSound('tap');
        openLevelPopup(planet);
      });
      grid.appendChild(card);
    });
  }

  function renderStreakCalendar() {
    const cal = document.getElementById('streak-calendar');
    if (!cal) return;
    cal.innerHTML = '';
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const done = profile.dailyHistory.includes(dateStr(d));
      const cell = document.createElement('div');
      cell.className = `streak-day ${done ? 'done' : ''} ${i === 0 ? 'today' : ''}`;
      cell.innerHTML = `<span class="streak-letter">${dayLetters[d.getDay()]}</span><span class="streak-dot">${done ? '🔥' : '·'}</span>`;
      cal.appendChild(cell);
    }
  }

  function openLevelPopup(planet) {
    const popup = document.getElementById('level-popup');
    const title = document.getElementById('level-popup-title');
    const list = document.getElementById('level-list');
    if (!popup || !title || !list) return;

    title.innerText = `${planet.emoji} ${planet.name}`;
    list.innerHTML = '';

    planet.levels.forEach((level, idx) => {
      const unlocked = isLevelUnlocked(planet, idx);
      const stars = starsFor(`${planet.id}:${level.id}`);
      const row = document.createElement('button');
      row.className = `level-row ${unlocked ? '' : 'locked'}`;
      const starStr = '⭐'.repeat(stars) + '<span class="star-empty">' + '☆'.repeat(3 - stars) + '</span>';
      row.innerHTML = `
        <span class="level-row-main">
          <span class="level-row-name">${unlocked ? '' : '🔒 '}${level.name}</span>
          <span class="level-row-desc">${level.desc}</span>
        </span>
        <span class="level-row-stars">${unlocked ? starStr : 'Earn 2 ⭐ above'}</span>
      `;
      if (unlocked) {
        row.addEventListener('click', () => {
          playSound('tap');
          popup.classList.add('hidden');
          launchPlanetMission(planet, level);
        });
      }
      list.appendChild(row);
    });

    popup.classList.remove('hidden');
  }

  function launchPlanetMission(planet, level) {
    gameState.injectedQuestions = null;
    applyLevel(planet, level, gameState);
    gameState.gameMode = 'adventure';
    gameState.missionKey = `${planet.id}:${level.id}`;
    launchGame();
  }

  // --- Daily mission ---
  // Deterministic RNG seeded by the date, so the Puzzle of the Day is the
  // same puzzle all day long (even on replays).
  function dateSeed() {
    const s = dateStr();
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function startDailyMission() {
    const weak = Mastery.getWeakFactQuestions(4);
    const questions = [...weak];
    // Top up with random easy-to-medium multiplication facts
    while (questions.length < 4) {
      const t = [2, 3, 4, 5, 6, 7, 8, 9][Math.floor(Math.random() * 8)];
      const m = Math.floor(Math.random() * 12) + 1;
      const swap = Math.random() > 0.5;
      questions.push({ num1: swap ? m : t, num2: swap ? t : m, expected: t * m, op: 'multiply' });
    }

    // Puzzle of the Day as the grand finale
    const seed = dateSeed();
    const puzzleType = ['mystery', 'emoji', 'magic'][seed % 3];
    gameState.puzzleLevel = puzzleType; // so stats land in the right bucket
    questions.push(buildPuzzleQuestion(puzzleType, mulberry32(seed)));

    gameState.injectedQuestions = questions;
    gameState.activeOp = 'multiply';
    gameState.gameMode = 'adventure';
    gameState.missionKey = 'daily';
    launchGame();
  }

  function markDailyDone() {
    const today = dateStr();
    if (profile.dailyHistory.includes(today)) return false; // already counted

    profile.dailyHistory.push(today);
    if (profile.dailyHistory.length > 60) {
      profile.dailyHistory = profile.dailyHistory.slice(-60);
    }

    const st = profile.streak;
    if (!st.lastDate) {
      st.count = 1;
    } else {
      const gap = daysBetween(st.lastDate, today);
      if (gap === 1) {
        st.count += 1;
      } else if (gap === 2 && st.shieldWeek !== weekId()) {
        // One missed day forgiven per week — the streak shield
        st.count += 1;
        st.shieldWeek = weekId();
      } else if (gap > 1) {
        st.count = 1;
      }
      // gap === 0 shouldn't happen (history check above), no change
    }
    st.lastDate = today;
    saveProfile();
    return true;
  }

  // --- Mission completion: coins + stars + streak ---
  // Replaying the same level keeps practice free but pays less each time,
  // so farming an easy level stops being worth it: full coins for the
  // first two plays per day, then 50%, then 20%.
  function replayMultiplier(playKey) {
    const today = dateStr();
    if (!profile.dailyPlays || profile.dailyPlays.date !== today) {
      profile.dailyPlays = { date: today, counts: {} };
    }
    const playsToday = profile.dailyPlays.counts[playKey] || 0;
    if (playsToday >= 3) return 0.2;
    if (playsToday === 2) return 0.5;
    return 1.0;
  }

  function completeMission(starsCount, accuracy) {
    const key = gameState.missionKey;
    // Custom missions are tracked per op+level too, so they can't be farmed either
    const playKey = key || ('custom:' + (typeof currentLevelTag === 'function' ? currentLevelTag() : gameState.activeOp));
    const multiplier = replayMultiplier(playKey);

    let coins = 5 + starsCount * 10;
    if (accuracy === 100) coins += 10;
    coins = Math.max(2, Math.round(coins * multiplier));

    let dailyBonus = false;
    if (key === 'daily') {
      if (markDailyDone()) {
        coins += 20;
        dailyBonus = true;
      }
    } else if (key) {
      if (starsCount > starsFor(key)) {
        profile.stars[key] = starsCount;
      }
    }

    profile.dailyPlays.counts[playKey] = (profile.dailyPlays.counts[playKey] || 0) + 1;
    profile.coins += coins;
    profile.totalMissions += 1;
    saveProfile();
    updateCoinHud();
    return { coins, dailyBonus, diminished: multiplier < 1 };
  }

  // --- Cosmetics & shop ---
  function applyCosmetics() {
    const rocketEl = document.getElementById('rocket-ship');
    if (!rocketEl) return;
    const rocket = ROCKETS.find(r => r.id === profile.rocket) || ROCKETS[0];
    const trail = TRAILS.find(t => t.id === profile.trail) || TRAILS[0];
    rocketEl.innerText = rocket.emoji;
    rocketEl.style.filter = `drop-shadow(0 0 8px ${trail.color})`;
  }

  function renderShop() {
    updateCoinHud();
    renderShopSection('shop-rockets', ROCKETS, 'rocket');
    renderShopSection('shop-trails', TRAILS, 'trail');
    renderShopSection('shop-jingles', JINGLES, 'jingle');
  }

  function renderShopSection(containerId, items, slot) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
      const owned = profile.owned.includes(item.id);
      const equipped = profile[slot] === item.id;
      const card = document.createElement('div');
      card.className = `shop-item ${equipped ? 'equipped' : ''}`;

      const visual = item.color
        ? `<span class="shop-emoji trail-swatch" style="background:${item.color}"></span>`
        : `<span class="shop-emoji">${item.emoji}</span>`;

      let btnLabel, btnClass;
      if (equipped) { btnLabel = '✓ Equipped'; btnClass = 'equipped'; }
      else if (owned) { btnLabel = 'Use It!'; btnClass = 'use'; }
      else { btnLabel = `${item.price} ⭐`; btnClass = profile.coins >= item.price ? 'buy' : 'cant-afford'; }

      card.innerHTML = `
        ${visual}
        <span class="shop-name">${item.name}</span>
        <button class="shop-btn ${btnClass}">${btnLabel}</button>
      `;

      card.querySelector('.shop-btn').addEventListener('click', () => {
        if (equipped) return;
        if (owned) {
          profile[slot] = item.id;
          saveProfile();
          renderShop();
          // Preview the tune when equipping a jingle
          if (slot === 'jingle') playSound('victory');
          else playSound('tap');
        } else if (profile.coins >= item.price) {
          playSound('victory');
          profile.coins -= item.price;
          profile.owned.push(item.id);
          profile[slot] = item.id;
          saveProfile();
          renderShop();
        } else {
          playSound('warning');
        }
      });

      container.appendChild(card);
    });
  }

  function updateCoinHud() {
    const headerChip = document.getElementById('coin-counter');
    if (headerChip) headerChip.innerText = `⭐ ${profile.coins}`;
    const galaxyCoins = document.getElementById('galaxy-coins');
    if (galaxyCoins) galaxyCoins.innerText = `⭐ ${profile.coins} coins`;
    const shopCoins = document.getElementById('shop-coins');
    if (shopCoins) shopCoins.innerText = `⭐ ${profile.coins}`;
  }

  // --- Parent (Grown-Up) Zone ---
  function openParentZone() {
    showScreen('screen-parent');
    if (parentUnlocked) {
      showParentDashboard();
      return;
    }
    const a = Math.floor(Math.random() * 8) + 12; // 12-19
    const b = Math.floor(Math.random() * 7) + 3;  // 3-9
    parentGateAnswer = a * b;
    document.getElementById('parent-gate-q').innerText = `${a} × ${b} = ?`;
    document.getElementById('parent-gate-input').value = '';
    document.getElementById('parent-gate-error').classList.add('hidden');
    document.getElementById('parent-gate').classList.remove('hidden');
    document.getElementById('parent-dashboard').classList.add('hidden');
  }

  function tryParentGate() {
    const typed = parseInt(document.getElementById('parent-gate-input').value, 10);
    if (typed === parentGateAnswer) {
      parentUnlocked = true;
      showParentDashboard();
    } else {
      document.getElementById('parent-gate-error').classList.remove('hidden');
    }
  }

  function showParentDashboard() {
    document.getElementById('parent-gate').classList.add('hidden');
    document.getElementById('parent-dashboard').classList.remove('hidden');
    renderHeatmap();
    renderWeakList();
    renderModeStats();
  }

  function masteryClass(s) {
    if (!s || s.a === 0) return 'heat-none';
    if (s.a < 2) return 'heat-few';
    const acc = s.c / s.a;
    if (acc < 0.6) return 'heat-weak';
    if (acc < 0.85 || s.t > 6) return 'heat-mid';
    return 'heat-good';
  }

  function renderHeatmap() {
    const grid = document.getElementById('parent-heatmap');
    if (!grid) return;
    grid.innerHTML = '';

    // Header row: × then 1..12
    grid.appendChild(heatCell('×', 'heat-header'));
    for (let c = 1; c <= 12; c++) grid.appendChild(heatCell(c, 'heat-header'));

    for (let t = 1; t <= 15; t++) {
      grid.appendChild(heatCell(t, 'heat-header'));
      for (let m = 1; m <= 12; m++) {
        const s = Mastery.getFactStats(t, m);
        const cell = heatCell('', masteryClass(s));
        cell.title = s
          ? `${t}×${m}=${t * m} — ${s.c}/${s.a} correct, avg ${s.t.toFixed(1)}s`
          : `${t}×${m}=${t * m} — not practiced yet`;
        grid.appendChild(cell);
      }
    }
  }

  function heatCell(text, cls) {
    const el = document.createElement('div');
    el.className = `heat-cell ${cls}`;
    el.innerText = text;
    return el;
  }

  function renderWeakList() {
    const listEl = document.getElementById('parent-weak-list');
    if (!listEl) return;
    const weak = Mastery.getWeakFactQuestions(8);
    if (weak.length === 0) {
      listEl.innerHTML = '<p class="parent-empty">No practice data yet — play some missions first!</p>';
      return;
    }
    listEl.innerHTML = weak.map(q => {
      const sym = q.op === 'divide' ? '÷' : '×';
      return `<span class="weak-chip">${q.num1} ${sym} ${q.num2}</span>`;
    }).join('');
  }

  const MODE_NAMES = {
    multiply: '✖️ Multiplication', divide: '➗ Division',
    'add:single': '➕ Addition (1-digit)', 'add:double': '➕ Addition (2-digit)', 'add:triple': '➕ Addition (3-digit)', 'add:mixed': '➕ Addition (mixed)',
    'subtract:single': '➖ Subtraction (1-digit)', 'subtract:double': '➖ Subtraction (2-digit)', 'subtract:triple': '➖ Subtraction (3-digit)', 'subtract:mixed': '➖ Subtraction (mixed)',
    'clock:hour': '⏰ Clock (hours)', 'clock:quarter': '⏰ Clock (quarters)', 'clock:five-min': '⏰ Clock (5-min)', 'clock:precision': '⏰ Clock (precision)',
    'fraction:identify': '🍕 Fractions (read)', 'fraction:simplify': '🍕 Fractions (simplify)', 'fraction:add': '🍕 Fractions (add)', 'fraction:subtract': '🍕 Fractions (subtract)',
    'sequence:easy': '💫 Sequences (easy)', 'sequence:medium': '💫 Sequences (medium)', 'sequence:hard': '💫 Sequences (hard)',
    'compare:easy': '⚖️ Compare (easy)', 'compare:medium': '⚖️ Compare (medium)', 'compare:hard': '⚖️ Compare (hard)',
    'music:notes': '🎵 Music (note values)', 'music:beats': '🎵 Music (beat counting)', 'music:measures': '🎵 Music (measures)',
    'angles:turns': '🤸 Turns (degrees)', 'angles:combine': '🤸 Turns (routines)', 'angles:convert': '🤸 Turns (conversions)',
    'puzzle:mystery': '🧩 Puzzles (mystery number)', 'puzzle:emoji': '🧩 Puzzles (emoji equations)', 'puzzle:magic': '🧩 Puzzles (magic squares)',
    'pokemon:identity': "⚡ Pokémon (who's that)", 'pokemon:type': '⚡ Pokémon (types)', 'pokemon:evolution': '⚡ Pokémon (evolutions)',
  };

  function renderModeStats() {
    const el = document.getElementById('parent-mode-stats');
    if (!el) return;
    const modes = Mastery.getModeStats();
    const keys = Object.keys(modes);
    if (keys.length === 0) {
      el.innerHTML = '<p class="parent-empty">No mission data yet.</p>';
      return;
    }
    el.innerHTML = keys.map(k => {
      const m = modes[k];
      const acc = Math.round((m.c / m.a) * 100);
      return `<div class="mode-stat-row">
        <span class="mode-stat-name">${MODE_NAMES[k] || k}</span>
        <span class="mode-stat-val">${m.a} answered · ${acc}% · avg ${m.t.toFixed(1)}s</span>
      </div>`;
    }).join('');
  }

  // --- Name handling ---
  function getName() {
    return profile.name;
  }

  function getJingle() {
    return profile.jingle || 'classic';
  }

  function maybeShowNamePopup() {
    if (profile.name || profile.namePromptShown) return;
    document.getElementById('name-popup').classList.remove('hidden');
  }

  function saveName() {
    const input = document.getElementById('name-input');
    const name = (input.value || '').trim().slice(0, 14);
    if (name) profile.name = name;
    profile.namePromptShown = true;
    saveProfile();
    document.getElementById('name-popup').classList.add('hidden');
    renderGalaxy();
  }

  // --- Event bindings & init ---
  function bindEvents() {
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    on('btn-daily', () => { playSound('tap'); startDailyMission(); });
    on('btn-custom-mission', () => { playSound('tap'); showScreen('screen-setup'); });
    on('btn-setup-back', () => { playSound('tap'); showScreen('screen-galaxy'); });
    on('btn-shop', () => { playSound('tap'); renderShop(); showScreen('screen-shop'); });
    on('btn-shop-back', () => { playSound('tap'); showScreen('screen-galaxy'); });
    on('btn-parent-zone', () => { playSound('tap'); openParentZone(); });
    on('btn-parent-back', () => { playSound('tap'); showScreen('screen-galaxy'); });
    on('btn-parent-gate', tryParentGate);
    on('btn-close-levels', () => {
      playSound('tap');
      document.getElementById('level-popup').classList.add('hidden');
    });
    on('btn-save-name', () => { playSound('tap'); saveName(); });
    on('btn-edit-name', () => {
      playSound('tap');
      document.getElementById('name-input').value = profile.name;
      document.getElementById('name-popup').classList.remove('hidden');
    });
    on('btn-abort-mission', () => {
      playSound('tap');
      clearInterval(gameState.timerInterval);
      showScreen('screen-galaxy');
    });
    on('btn-retry', () => { playSound('tap'); launchGame(); });
    on('btn-reset-progress', () => {
      if (confirm('Reset ALL progress? This erases mastery data, stars, coins, and streaks.')) {
        Mastery.resetAll();
        profile = { ...DEFAULT_PROFILE, name: profile.name, namePromptShown: true };
        saveProfile();
        showParentDashboard();
        updateCoinHud();
      }
    });

    const gateInput = document.getElementById('parent-gate-input');
    if (gateInput) {
      gateInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryParentGate(); });
    }
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
      nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
    }
  }

  function init() {
    bindEvents();
    renderGalaxy();
    updateCoinHud();
    maybeShowNamePopup();
  }

  return { init, renderGalaxy, completeMission, applyCosmetics, keyFromState, getName, getJingle, updateCoinHud };
})();
