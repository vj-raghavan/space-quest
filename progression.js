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
    { id: 'story', name: 'Mission Control', emoji: '📖', tagline: 'Story problems', levels: [
      { id: 'onestep', name: 'Space Stories', desc: 'One-step problems' },
      { id: 'twostep', name: 'Double Trouble', desc: 'Two-step problems' },
      { id: 'money', name: 'Space Market', desc: 'Money & change' },
    ]},
    { id: 'estimate', name: 'Estimation Station', emoji: '🎯', tagline: 'Rounding & guessing', levels: [
      { id: 'round10', name: 'Nearest Ten', desc: 'Round to nearest 10' },
      { id: 'round100', name: 'Nearest Hundred', desc: 'Round to nearest 100' },
      { id: 'approx', name: 'About How Much?', desc: 'Estimate sums fast' },
    ]},
    { id: 'spelling', name: 'Spelling Star Base', emoji: '🔤', tagline: 'Word power', levels: [
      { id: 'spot', name: 'Spelling Scout', desc: 'Tap the right spelling' },
      { id: 'spot2', name: 'Tricky Spotter', desc: 'Spot tricky words' },
      { id: 'build', name: 'Word Builder', desc: 'Build words from tiles' },
      { id: 'build2', name: 'Word Wizard', desc: 'Build tricky words' },
      { id: 'school', name: 'My School Words', desc: 'Your weekly list' },
    ]},
    { id: 'reading', name: 'Reading Rocket', emoji: '📚', tagline: 'Learn to read', levels: [
      { id: 'letters', name: 'Letter Sounds', desc: 'Which letter starts it?' },
      { id: 'soundmatch', name: 'Sound Match', desc: 'Same starting sound' },
      { id: 'rhyme', name: 'Rhyme Time', desc: 'Find the rhyme' },
      { id: 'sight', name: 'Sight Words', desc: 'Tap the word you hear' },
      { id: 'cvc', name: 'Build-a-Word', desc: 'Sound it out & build' },
      { id: 'myreading', name: 'My Reading Words', desc: 'Your own word list' },
    ]},
    { id: 'pokemon', name: 'Poké Galaxy', emoji: '⚡', tagline: 'Gotta catch \'em all', levels: [
      { id: 'count', name: 'Pika Count', desc: 'Count the Pokémon!' },
      { id: 'identity', name: "Who's That Pokémon?", desc: 'Name the silhouette' },
      { id: 'type', name: 'Type Match', desc: 'Fire, water, grass…' },
      { id: 'evolution', name: 'Evolution Lab', desc: 'Who evolves into whom?' },
      { id: 'battle', name: 'Battle Match', desc: 'Which type wins?' },
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

  // Big-ticket dream items: whole-app background themes
  const THEMES = [
    { id: 'default', name: 'Deep Space', color: 'radial-gradient(circle, #1b2735, #090a0f)', price: 0 },
    { id: 'sunset', name: 'Sunset Nebula', color: 'radial-gradient(circle, #b3502e, #2a0f1f)', price: 400 },
    { id: 'aurora', name: 'Aurora Sky', color: 'radial-gradient(circle, #1e7a5a, #07131f)', price: 500 },
    { id: 'candy', name: 'Candy Galaxy', color: 'radial-gradient(circle, #a04a9e, #1f0a2e)', price: 600 },
  ];

  const ACCESSORIES = [
    { id: 'none', emoji: '🚫', name: 'No Accessory', price: 0 },
    { id: 'tophat', emoji: '🎩', name: 'Top Hat', price: 80 },
    { id: 'bow', emoji: '🎀', name: 'Fancy Bow', price: 80 },
    { id: 'shades', emoji: '🕶️', name: 'Cool Shades', price: 100 },
    { id: 'crown', emoji: '👑', name: 'Royal Crown', price: 150 },
  ];

  // Space pet: evolves with total stars, fed by the Daily Mission
  const PET_STAGES = [
    { min: 100, emoji: '🐉', name: 'Stardragon', hint: 'Fully grown — legendary!' },
    { min: 60, emoji: '🦕', name: 'Cosmosaur', hint: 'Reach 100 ⭐ to evolve!' },
    { min: 30, emoji: '🐙', name: 'Wobbles', hint: 'Reach 60 ⭐ to evolve!' },
    { min: 10, emoji: '👾', name: 'Blip', hint: 'Reach 30 ⭐ to evolve!' },
    { min: 0, emoji: '🥚', name: 'Space Egg', hint: 'Earn 10 ⭐ to hatch it!' },
  ];

  const DEFAULT_PROFILE = {
    name: '',
    namePromptShown: false,
    coins: 0,
    rocket: 'rocket',
    trail: 'cyan',
    jingle: 'classic',
    eqStyle: 'horizontal',
    theme: 'default',
    petName: '',
    petAccessory: 'none',
    sprintBest: null,
    owned: ['rocket', 'cyan', 'classic', 'default', 'none'],
    stars: {},          // missionKey -> best star count (0-3)
    streak: { count: 0, lastDate: null, shieldWeek: null },
    dailyHistory: [],   // ['2026-06-10', ...] days with completed daily mission
    totalMissions: 0,
  };

  let profile = loadProfile();
  let parentUnlocked = false;
  let parentGateAnswer = null;
  let editingProfile = false; // the new-player form doubles as the profile editor

  function loadProfile() {
    let p = { ...DEFAULT_PROFILE };
    try {
      const raw = localStorage.getItem(Players.key(STORE_KEY));
      if (raw) p = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch (e) { /* fall through to defaults */ }
    // Profiles saved before newer shop slots existed need the free items
    ['classic', 'default', 'none'].forEach(freeItem => {
      if (!p.owned.includes(freeItem)) p.owned.push(freeItem);
    });
    // A freshly created player already told us their name in the picker
    if (!p.name && Players.active().name) {
      p.name = Players.active().name;
      p.namePromptShown = true;
    }
    return p;
  }

  function saveProfile() {
    localStorage.setItem(Players.key(STORE_KEY), JSON.stringify(profile));
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
    else if (planet.id === 'story') s.storyLevel = level.id;
    else if (planet.id === 'estimate') s.estimateLevel = level.id;
    else if (planet.id === 'spelling') s.spellingLevel = level.id;
    else if (planet.id === 'reading') s.readingLevel = level.id;
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
      s.activeOp === 'pokemon' ? s.pokemonLevel :
      s.activeOp === 'story' ? s.storyLevel :
      s.activeOp === 'estimate' ? s.estimateLevel :
      s.activeOp === 'spelling' ? s.spellingLevel :
      s.activeOp === 'reading' ? s.readingLevel : s.compareLevel;
    const lvl = planet.levels.find(l => l.id === levelId);
    return lvl ? `${planet.id}:${levelId}` : null;
  }

  function starsFor(missionKey) {
    return profile.stars[missionKey] || 0;
  }

  function isLevelUnlocked(planet, levelIndex) {
    if (levelIndex === 0) return true;
    // Parent-entered word lists are the family's own — never locked behind stars
    if (planet.id === 'spelling' && planet.levels[levelIndex].id === 'school') return true;
    if (planet.id === 'reading' && planet.levels[levelIndex].id === 'myreading') return true;
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

    const playerChip = document.getElementById('btn-switch-player');
    if (playerChip) {
      playerChip.innerText = `${Players.active().avatar} ${profile.name || 'Explorer'} ▾`;
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
    const sprintEl = document.getElementById('galaxy-sprint');
    if (sprintEl) {
      if (profile.sprintBest) {
        sprintEl.innerText = `⚡ best ${profile.sprintBest}s`;
        sprintEl.classList.remove('hidden');
      } else {
        sprintEl.classList.add('hidden');
      }
    }
    updateCoinHud();
    renderPet(totalEarned);

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

  // --- Space pet ---
  function renderPet(totalStars) {
    const card = document.getElementById('pet-card');
    if (!card) return;
    const stage = PET_STAGES.find(s => totalStars >= s.min) || PET_STAGES[PET_STAGES.length - 1];
    const acc = ACCESSORIES.find(a => a.id === profile.petAccessory && a.id !== 'none');
    const displayName = profile.petName || stage.name;
    const fedToday = profile.dailyHistory.includes(dateStr());
    const isEgg = stage.min === 0 && totalStars < 10;
    const mood = isEgg ? '✨' : fedToday ? '😊' : '🥺';
    const moodText = isEgg
      ? 'Something is wiggling inside… keep playing to hatch it!'
      : fedToday
        ? `${displayName} is fed and full of star power!`
        : `${displayName} is hungry — finish the Daily Mission to feed it!`;

    card.innerHTML = `
      <div class="pet-visual">
        ${acc ? `<span class="pet-acc">${acc.emoji}</span>` : ''}
        <span class="pet-emoji">${stage.emoji}</span>
        <span class="pet-mood">${mood}</span>
      </div>
      <div class="pet-info">
        <h2>${displayName} <button id="btn-pet-rename" class="btn-edit-name" title="Rename pet">✏️</button></h2>
        <p>${moodText}</p>
        <p class="pet-hint">⭐ ${totalStars} stars · ${stage.hint}</p>
      </div>`;

    document.getElementById('btn-pet-rename').addEventListener('click', () => {
      const n = prompt('Name your space pet!', profile.petName || stage.name);
      if (n !== null) {
        profile.petName = n.trim().slice(0, 14);
        saveProfile();
        renderGalaxy();
      }
    });
  }

  // --- Lightning Round (sprint): race your own best time ---
  function startSprint() {
    gameState.injectedQuestions = null;
    gameState.activeOp = 'multiply';
    gameState.selectedTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    gameState.questionCount = 20;
    gameState.gameMode = 'adventure';
    gameState.missionKey = 'sprint';
    launchGame();
  }

  function recordSprint(time) {
    const prevBest = profile.sprintBest;
    if (!prevBest || time < prevBest) {
      profile.sprintBest = time;
      saveProfile();
      return { isRecord: true, prevBest, best: time };
    }
    return { isRecord: false, best: prevBest };
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
    renderShopSection('shop-themes', THEMES, 'theme');
    renderShopSection('shop-accessories', ACCESSORIES, 'petAccessory');
    renderPackSection();
  }

  function applyTheme() {
    document.body.classList.remove('theme-sunset', 'theme-aurora', 'theme-candy');
    if (profile.theme && profile.theme !== 'default') {
      document.body.classList.add(`theme-${profile.theme}`);
    }
  }

  // --- Poké Packs: spend coins, catch 3 surprise Pokémon ---
  const PACK_PRICE = 60;

  function renderPackSection() {
    const container = document.getElementById('shop-packs');
    if (!container) return;
    const left = Pokedex.uncaughtIds().length;
    const allCaught = left === 0;
    const btnClass = allCaught ? 'equipped' : profile.coins >= PACK_PRICE ? 'buy' : 'cant-afford';
    const btnLabel = allCaught ? 'All 151 caught! 🏆' : `${PACK_PRICE} ⭐`;
    container.innerHTML = `
      <div class="shop-item pack-item">
        <span class="shop-emoji">🎁</span>
        <span class="shop-name">Poké Pack — 3 surprise Pokémon for your Pokédex! (${left} still out there)</span>
        <button class="shop-btn ${btnClass}" id="btn-buy-pack">${btnLabel}</button>
      </div>`;
    document.getElementById('btn-buy-pack').addEventListener('click', buyPokePack);
  }

  function buyPokePack() {
    const uncaught = Pokedex.uncaughtIds();
    if (uncaught.length === 0 || profile.coins < PACK_PRICE) {
      playSound('warning');
      return;
    }
    profile.coins -= PACK_PRICE;
    const newIds = [];
    for (let i = 0; i < 3 && uncaught.length > 0; i++) {
      const idx = Math.floor(Math.random() * uncaught.length);
      newIds.push(uncaught[idx]);
      uncaught.splice(idx, 1);
    }
    newIds.forEach(id => Pokedex.catchPokemon(id));
    saveProfile();
    updateCoinHud();

    document.getElementById('pack-reveal-list').innerHTML = newIds.map(id => {
      const p = pokeById(id);
      return `<div class="pack-card"><img src="${pokeSpriteURL(id)}" alt="${p.name}"><span>${p.name}</span></div>`;
    }).join('');
    document.getElementById('pack-popup').classList.remove('hidden');
    playSound('victory');
    renderShop();
  }

  // --- Pokédex screen ---
  function renderPokedex() {
    const countEl = document.getElementById('pokedex-count');
    if (countEl) countEl.innerText = `${Pokedex.count()} / ${Pokedex.total()} caught`;
    const grid = document.getElementById('pokedex-grid');
    if (!grid) return;
    grid.innerHTML = POKEDEX.map(p => {
      const caught = Pokedex.isCaught(p.id);
      return `<div class="dex-cell ${caught ? 'caught' : ''}" title="${caught ? p.name : 'Not caught yet!'}">
        <img loading="lazy" src="${pokeSmallSpriteURL(p.id)}" alt="${caught ? p.name : '???'}">
        <span class="dex-name">${caught ? p.name : '???'}</span>
      </div>`;
    }).join('');
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
          if (slot === 'theme') applyTheme();
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
          if (slot === 'theme') applyTheme();
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
    renderSchoolWords();
    renderReadingWords();
  }

  // --- My School Words management (data lives in spelling.js's SchoolWords) ---
  function renderSchoolWords() {
    const cur = document.getElementById('school-words-current');
    const input = document.getElementById('school-words-input');
    if (!cur || typeof SchoolWords === 'undefined') return;
    const words = SchoolWords.load();
    cur.innerHTML = words.length
      ? words.map(w => `<span class="weak-chip">${w}</span>`).join('')
      : '<p class="parent-empty">No school words yet — type this week\'s list below.</p>';
    if (input) input.value = words.join(', ');
  }

  function saveSchoolWordsFromInput() {
    const input = document.getElementById('school-words-input');
    if (!input || typeof SchoolWords === 'undefined') return;
    const words = [...new Set(
      input.value.toLowerCase().split(/[\s,;]+/)
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length >= 2 && w.length <= 12)
    )];
    SchoolWords.save(words);
    renderSchoolWords();
    const ok = document.getElementById('school-words-saved');
    if (ok) {
      ok.classList.remove('hidden');
      setTimeout(() => ok.classList.add('hidden'), 2000);
    }
  }

  // --- My Reading Words management (data lives in reading.js's ReadingWords) ---
  function renderReadingWords() {
    const cur = document.getElementById('reading-words-current');
    const input = document.getElementById('reading-words-input');
    if (!cur || typeof ReadingWords === 'undefined') return;
    const words = ReadingWords.load();
    cur.innerHTML = words.length
      ? words.map(w => `<span class="weak-chip">${w}</span>`).join('')
      : '<p class="parent-empty">No reading words yet — type your child\'s list below.</p>';
    if (input) input.value = words.join(', ');
  }

  function saveReadingWordsFromInput() {
    const input = document.getElementById('reading-words-input');
    if (!input || typeof ReadingWords === 'undefined') return;
    const words = [...new Set(
      input.value.toLowerCase().split(/[\s,;]+/)
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length >= 1 && w.length <= 12)
    )];
    ReadingWords.save(words);
    renderReadingWords();
    const ok = document.getElementById('reading-words-saved');
    if (ok) {
      ok.classList.remove('hidden');
      setTimeout(() => ok.classList.add('hidden'), 2000);
    }
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
    'pokemon:count': '⚡ Pokémon (counting)', 'pokemon:identity': "⚡ Pokémon (who's that)", 'pokemon:type': '⚡ Pokémon (types)',
    'pokemon:evolution': '⚡ Pokémon (evolutions)', 'pokemon:battle': '⚡ Pokémon (battles)',
    'story:onestep': '📖 Stories (one-step)', 'story:twostep': '📖 Stories (two-step)', 'story:money': '📖 Stories (money)',
    'estimate:round10': '🎯 Estimation (nearest 10)', 'estimate:round100': '🎯 Estimation (nearest 100)', 'estimate:approx': '🎯 Estimation (about how much)',
    'spelling:spot': '🔤 Spelling (spot the word)', 'spelling:spot2': '🔤 Spelling (tricky spotter)',
    'spelling:build': '🔤 Spelling (word builder)', 'spelling:build2': '🔤 Spelling (word wizard)',
    'spelling:school': '🏫 Spelling (school words)',
    'reading:letters': '📚 Reading (letter sounds)', 'reading:soundmatch': '📚 Reading (sound match)',
    'reading:rhyme': '📚 Reading (rhyme)', 'reading:sight': '📚 Reading (sight words)',
    'reading:cvc': '📚 Reading (build-a-word)', 'reading:myreading': '📖 Reading (my words)',
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

  // --- Player picker ---
  function openPlayerPicker() {
    const popup = document.getElementById('player-popup');
    const list = document.getElementById('player-list');
    const form = document.getElementById('new-player-form');
    if (!popup || !list) return;

    editingProfile = false;
    form.classList.add('hidden');
    list.classList.remove('hidden');
    document.getElementById('player-popup-title').innerText = "Who's playing? 👨‍🚀";
    list.innerHTML = '';

    Players.list().forEach(p => {
      const card = document.createElement('div');
      card.className = `player-card ${p.id === Players.active().id ? 'active-player' : ''}`;
      card.innerHTML = `<span class="player-avatar">${p.avatar}</span><span class="player-name">${p.name || 'Explorer'}</span>`;
      card.addEventListener('click', () => {
        playSound('tap');
        if (p.id === Players.active().id) {
          popup.classList.add('hidden');
        } else {
          Players.switchTo(p.id); // reloads with that player's world
        }
      });
      if (Players.list().length > 1) {
        const del = document.createElement('button');
        del.className = 'player-delete';
        del.innerText = '✕';
        del.title = 'Delete player';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete ${p.name || 'this player'} and ALL their progress? This cannot be undone.`)) {
            Players.removePlayer(p.id);
            openPlayerPicker();
          }
        });
        card.appendChild(del);
      }
      if (p.id === Players.active().id) {
        const edit = document.createElement('button');
        edit.className = 'player-edit';
        edit.innerText = '✏️';
        edit.title = 'Edit profile';
        edit.addEventListener('click', (e) => {
          e.stopPropagation();
          playSound('tap');
          showNewPlayerForm(true);
        });
        card.appendChild(edit);
      }
      list.appendChild(card);
    });

    const addCard = document.createElement('div');
    addCard.className = 'player-card add-player';
    addCard.innerHTML = '<span class="player-avatar">➕</span><span class="player-name">New Player</span>';
    addCard.addEventListener('click', () => {
      playSound('tap');
      showNewPlayerForm();
    });
    list.appendChild(addCard);

    popup.classList.remove('hidden');
  }

  // One form, two jobs: create a new player, or edit the active one
  function showNewPlayerForm(editMode = false) {
    editingProfile = editMode;
    document.getElementById('player-list').classList.add('hidden');
    document.getElementById('player-popup-title').innerText = editMode
      ? 'Edit Your Profile ✏️'
      : 'New Space Explorer! ✨';
    document.getElementById('btn-create-player').innerText = editMode
      ? 'Save! ✨'
      : "Let's Go! 🚀";
    const form = document.getElementById('new-player-form');
    form.classList.remove('hidden');

    const currentAvatar = editMode ? Players.active().avatar : null;
    const choices = document.getElementById('avatar-choices');
    choices.innerHTML = '';
    Players.AVATARS.forEach((a, i) => {
      const btn = document.createElement('button');
      const isSelected = currentAvatar ? a === currentAvatar : i === 0;
      btn.className = `avatar-choice ${isSelected ? 'selected' : ''}`;
      btn.innerText = a;
      btn.addEventListener('click', () => {
        playSound('tap');
        choices.querySelectorAll('.avatar-choice').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
      });
      choices.appendChild(btn);
    });
    document.getElementById('new-player-name').value = editMode ? profile.name : '';
    document.getElementById('new-player-name').focus();
  }

  function openProfileEditor() {
    document.getElementById('player-popup').classList.remove('hidden');
    showNewPlayerForm(true);
  }

  function createPlayer() {
    const name = (document.getElementById('new-player-name').value || '').trim();
    const selected = document.querySelector('#avatar-choices .avatar-choice.selected');
    const avatar = selected ? selected.innerText : Players.AVATARS[0];

    if (editingProfile) {
      // Apply changes to the active player in place — no reload needed
      if (name) {
        profile.name = name.slice(0, 14);
        Players.renameActive(name);
      }
      Players.setActiveAvatar(avatar);
      profile.namePromptShown = true;
      saveProfile();
      editingProfile = false;
      document.getElementById('player-popup').classList.add('hidden');
      playSound('tap');
      renderGalaxy();
      return;
    }

    playSound('victory');
    Players.addPlayer(name || 'Explorer', avatar); // reloads as the new player
  }

  // --- Name handling ---
  function getName() {
    return profile.name;
  }

  function getJingle() {
    return profile.jingle || 'classic';
  }

  function setEqStyle(style) {
    profile.eqStyle = style;
    saveProfile();
  }

  function maybeShowNamePopup() {
    if (profile.name || profile.namePromptShown) return;
    document.getElementById('name-popup').classList.remove('hidden');
  }

  function saveName() {
    const input = document.getElementById('name-input');
    const name = (input.value || '').trim().slice(0, 14);
    if (name) {
      profile.name = name;
      Players.renameActive(name); // keep the player picker label in sync
    }
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
    on('btn-sprint', () => { playSound('tap'); startSprint(); });
    on('btn-pokedex', () => { playSound('tap'); renderPokedex(); showScreen('screen-pokedex'); });
    on('btn-pokedex-back', () => { playSound('tap'); showScreen('screen-galaxy'); });
    on('btn-close-pack', () => {
      playSound('tap');
      document.getElementById('pack-popup').classList.add('hidden');
    });
    on('btn-parent-zone', () => { playSound('tap'); openParentZone(); });
    on('btn-parent-back', () => { playSound('tap'); showScreen('screen-galaxy'); });
    on('btn-parent-gate', tryParentGate);
    on('btn-save-school-words', () => { playSound('tap'); saveSchoolWordsFromInput(); });
    on('btn-save-reading-words', () => { playSound('tap'); saveReadingWordsFromInput(); });
    on('btn-close-levels', () => {
      playSound('tap');
      document.getElementById('level-popup').classList.add('hidden');
    });
    on('btn-save-name', () => { playSound('tap'); saveName(); });
    on('btn-switch-player', () => { playSound('tap'); openPlayerPicker(); });
    on('btn-close-players', () => {
      playSound('tap');
      editingProfile = false;
      document.getElementById('player-popup').classList.add('hidden');
    });
    on('btn-create-player', createPlayer);
    on('btn-edit-name', () => {
      playSound('tap');
      openProfileEditor();
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
    const newPlayerInput = document.getElementById('new-player-name');
    if (newPlayerInput) {
      newPlayerInput.addEventListener('keydown', e => { if (e.key === 'Enter') createPlayer(); });
    }
  }

  function init() {
    bindEvents();
    renderGalaxy();
    updateCoinHud();
    // Restore this player's preferred number style and galaxy theme
    gameState.eqStyle = profile.eqStyle || 'horizontal';
    if (typeof syncEqStyleToggle === 'function') syncEqStyleToggle();
    applyTheme();
    // With several players on this device, ask who's playing up front
    if (Players.list().length >= 2) {
      openPlayerPicker();
    } else {
      maybeShowNamePopup();
    }
  }

  return { init, renderGalaxy, completeMission, applyCosmetics, keyFromState, getName, getJingle, setEqStyle, recordSprint, updateCoinHud };
})();
