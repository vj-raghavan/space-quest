// --- Space Quest — Mini Games arcade ---
// Star-gated silly rewards. Unlock is a threshold on lifetime planet
// stars (Progression.getStats().totalStars) — stars are never spent.
// Add a game: push an entry onto GAMES with { id, title, emoji, blurb,
// unlockStars, start(root, hud) }. start() should use beginSession() so
// MiniGames.stop() can cancel RAF/timers when the kid leaves.

const MiniGames = (() => {
  const DRESS_KEY = 'space_quest_dressup_v1';
  const STEAL_KEY = 'space_quest_steal_pet_v1';

  // hue-rotate is relative to each pal's own paint. These are the hues a kid
  // should see (and the swatch should show). Mint means "no tint".
  const COLORS = [
    { id: 'mint', label: 'Mint', hue: null },
    { id: 'blush', label: 'Blush', hue: 338 },
    { id: 'sky', label: 'Sky', hue: 206 },
    { id: 'sunny', label: 'Sunny', hue: 48 },
    { id: 'grape', label: 'Grape', hue: 276 },
    { id: 'lava', label: 'Lava', hue: 14 },
  ];
  // Dominant hue of each body before any tint, sampled from the main fill.
  const BODY_HUE = { cosmo: 161, starlet: 207, nibble: 350, boop: 262 };

  const HATS = [
    { id: 'none', emoji: '✨', name: 'No hat', unlockStars: 0 },
    { id: 'beanie', emoji: '🎩', name: 'Star hat', unlockStars: 0 },
    { id: 'helm', emoji: '⛑️', name: 'Moon helm', unlockStars: 10 },
    { id: 'prop', emoji: '🚁', name: 'Whirly', unlockStars: 16 },
    { id: 'flower', emoji: '🌸', name: 'Bloom', unlockStars: 22 },
    { id: 'pigtails', emoji: '🎀', name: 'Twin bows', unlockStars: 0, chars: ['starlet'] },
    { id: 'ears', emoji: '🐰', name: 'Bunny ears', unlockStars: 0, chars: ['nibble'] },
    { id: 'saucer', emoji: '📡', name: 'Saucer lid', unlockStars: 0, chars: ['boop'] },
    { id: 'crown', emoji: '👑', name: 'Star crown', unlockStars: 40 },
    { id: 'comet', emoji: '☄️', name: 'Comet cap', unlockStars: 80 },
    { id: 'nova', emoji: '🌟', name: 'Nova halo', unlockStars: 140 },
  ];

  const OUTFITS = [
    { id: 'none', emoji: '🛸', name: 'No outfit', unlockStars: 0 },
    { id: 'cape', emoji: '🦸', name: 'Sparkle cape', unlockStars: 0 },
    { id: 'tutu', emoji: '🩰', name: 'Star tutu', unlockStars: 15 },
    { id: 'stripes', emoji: '🎽', name: 'Zoom stripes', unlockStars: 25 },
    { id: 'pack', emoji: '🎒', name: 'Rocket pack', unlockStars: 30 },
    { id: 'overalls', emoji: '👖', name: 'Moon overalls', unlockStars: 0, chars: ['starlet'] },
    { id: 'fluff', emoji: '🧶', name: 'Cozy fluff', unlockStars: 0, chars: ['nibble'] },
    { id: 'rings', emoji: '💿', name: 'Hover rings', unlockStars: 0, chars: ['boop'] },
    { id: 'cape2', emoji: '🌈', name: 'Rainbow trail', unlockStars: 120 },
  ];

  const EXTRAS = [
    { id: 'none', emoji: '🙂', name: 'Plain', unlockStars: 0 },
    { id: 'shades', emoji: '🕶️', name: 'Cool shades', unlockStars: 0 },
    { id: 'bow', emoji: '🎀', name: 'Bow-wow', unlockStars: 12 },
    { id: 'stache', emoji: '🥸', name: 'Silly stache', unlockStars: 18 },
    { id: 'sparkle', emoji: '✨', name: 'Sparkles', unlockStars: 28 },
    { id: 'badge', emoji: '🏅', name: 'Star badge', unlockStars: 0, chars: ['starlet'] },
    { id: 'collar', emoji: '🔔', name: 'Star bell', unlockStars: 0, chars: ['nibble'] },
    { id: 'googly', emoji: '👀', name: 'Googly wow', unlockStars: 0, chars: ['boop'] },
    { id: 'glitter', emoji: '💖', name: 'Heart glitter', unlockStars: 180 },
  ];

  const DEFAULT_LOOK = { color: 'mint', hat: 'none', outfit: 'cape', extra: 'none' };

  const DRESS_CHARS = [
    { id: 'cosmo', name: 'Cosmo', emoji: '👽', unlockStars: 0, kind: 'cosmo', blurb: 'Galaxy pal' },
    { id: 'starlet', name: 'Starlet', emoji: '🧒', unlockStars: 0, kind: 'kid', blurb: 'Space kid' },
    { id: 'nibble', name: 'Nibble', emoji: '🐾', unlockStars: 28, kind: 'pet', blurb: 'Pet buddy' },
    { id: 'boop', name: 'Boop', emoji: '🛸', unlockStars: 50, kind: 'friend', blurb: 'Silly friend' },
  ];

  function defaultDressState() {
    const looks = {};
    DRESS_CHARS.forEach(ch => { looks[ch.id] = { ...DEFAULT_LOOK }; });
    return { active: 'cosmo', looks };
  }

  function loadDressState() {
    try {
      const raw = localStorage.getItem(Players.key(DRESS_KEY));
      if (!raw) return defaultDressState();
      const data = JSON.parse(raw);
      if (data && data.looks && typeof data.looks === 'object') {
        const looks = {};
        DRESS_CHARS.forEach(ch => {
          looks[ch.id] = { ...DEFAULT_LOOK, ...(data.looks[ch.id] || {}) };
        });
        const active = DRESS_CHARS.some(c => c.id === data.active) ? data.active : 'cosmo';
        return { active, looks };
      }
      const migrated = defaultDressState();
      migrated.looks.cosmo = { ...DEFAULT_LOOK, ...data };
      return migrated;
    } catch (e) { /* defaults */ }
    return defaultDressState();
  }

  function saveDressState(state) {
    localStorage.setItem(Players.key(DRESS_KEY), JSON.stringify(state));
  }

  function loadDress() {
    const st = loadDressState();
    return { ...DEFAULT_LOOK, ...(st.looks.cosmo || {}) };
  }

  function lookForChar(id) {
    const st = loadDressState();
    return { ...DEFAULT_LOOK, ...(st.looks[id] || {}) };
  }

  function saveDress(look) {
    const st = loadDressState();
    st.looks.cosmo = { ...DEFAULT_LOOK, ...look };
    saveDressState(st);
  }

  function totalStars() {
    if (typeof Progression !== 'undefined' && Progression.getStats) {
      return Progression.getStats().totalStars || 0;
    }
    return 0;
  }

  function isUnlocked(game) {
    return totalStars() >= (game.unlockStars || 0);
  }

  let session = null;
  let hubBound = false;

  function beginSession() {
    stop();
    session = { raf: 0, timers: [], intervals: [], cleanup: null };
    return session;
  }

  function stop() {
    if (!session) return;
    if (session.raf) cancelAnimationFrame(session.raf);
    (session.timers || []).forEach(id => clearTimeout(id));
    (session.intervals || []).forEach(id => clearInterval(id));
    if (typeof session.cleanup === 'function') {
      try { session.cleanup(); } catch (e) { /* ignore */ }
    }
    session = null;
  }

  function freeze(sess) {
    if (!sess) return;
    (sess.intervals || []).forEach(id => clearInterval(id));
    sess.intervals = [];
    (sess.timers || []).forEach(id => clearTimeout(id));
    sess.timers = [];
    if (sess.raf) {
      cancelAnimationFrame(sess.raf);
      sess.raf = 0;
    }
  }

  function cheer(text, happy) {
    const el = document.getElementById('mg-cheer');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    if (typeof setMascotMood === 'function') {
      setMascotMood(happy === false ? 'incorrect' : 'correct');
    }
  }

  function awardFinish(gameId) {
    if (typeof Progression === 'undefined' || !Progression.awardMiniCoins) {
      return { coins: 0 };
    }
    return Progression.awardMiniCoins(gameId, 3);
  }

  function finishOverlay(root, gameId, title, scoreLine, restartFn) {
    const prize = awardFinish(gameId);
    const coinLine = prize.coins > 0
      ? `+${prize.coins} star coins! Cosmo is so proud!`
      : 'That was super fun! Coins are taking a nap after lots of plays.';
    const wrap = document.createElement('div');
    wrap.className = 'mg-finish glass-panel';
    wrap.innerHTML = `
      <h3>🎉 ${title}</h3>
      <p class="mg-finish-score">${scoreLine}</p>
      <p class="mg-finish-coins">${coinLine}</p>
      <div class="mg-finish-actions">
        <button class="btn btn-primary" data-mg="again">Play again!</button>
        <button class="btn btn-secondary" data-mg="hub">Mini Games</button>
      </div>
    `;
    wrap.querySelector('[data-mg="again"]').addEventListener('click', () => {
      playSound('tap');
      restartFn();
    });
    wrap.querySelector('[data-mg="hub"]').addEventListener('click', () => {
      playSound('tap');
      openHub();
    });
    const host = root.querySelector('#mg-arena') || root;
    host.appendChild(wrap);
    if (typeof startConfetti === 'function') startConfetti();
    playSound('victory');
  }

  function pointerTap(el, fn) {
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      fn(e);
    });
  }

  function hueRotateFor(colorId, charId) {
    const color = COLORS.find(c => c.id === colorId) || COLORS[0];
    if (color.hue == null) return 0;
    const base = BODY_HUE[charId] != null ? BODY_HUE[charId] : BODY_HUE.cosmo;
    return (color.hue - base + 360) % 360;
  }

  function swatchHue(colorId, charId) {
    const color = COLORS.find(c => c.id === colorId) || COLORS[0];
    if (color.hue == null) {
      return BODY_HUE[charId] != null ? BODY_HUE[charId] : BODY_HUE.cosmo;
    }
    return color.hue;
  }

  function dressedStage(uid, look, sizeClass, charId) {
    const char = DRESS_CHARS.find(c => c.id === (charId || 'cosmo')) || DRESS_CHARS[0];
    const svg = char.kind === 'cosmo'
      ? ((typeof mascotSVG === 'function') ? mascotSVG(uid) : '')
      : Characters.body(char.kind, uid);
    const layers = Characters.dressLayers(look, uid + 'fit', char.id);
    const rotate = hueRotateFor(look.color, char.id);
    return `
      <div class="cosmo-dress-stage ${sizeClass || ''}">
        <div class="char-idle">
          ${layers.back || ''}
          <div class="cosmo-dress-body" style="filter:hue-rotate(${rotate}deg)">
            <div class="mascot-svg">${svg}</div>
          </div>
          ${layers.front || ''}
          ${layers.extra || ''}
          ${layers.hat || ''}
        </div>
      </div>`;
  }

  function renderGalaxyCosmo() {
    const el = document.getElementById('galaxy-cosmo');
    if (!el) return;
    el.innerHTML = dressedStage('galaxy-look', loadDress(), 'galaxy-size');
  }

  // --- Game implementations ---

  const SPACE_PETS = [
    { id: 'spark-pup', name: 'Spark Pup', emoji: '🐶', rarity: 'common', hue: '#7ec8ff' },
    { id: 'moon-kit', name: 'Moon Kit', emoji: '🐱', rarity: 'common', hue: '#d4b8ff' },
    { id: 'dust-hopper', name: 'Dust Hopper', emoji: '🐰', rarity: 'common', hue: '#ffe29a' },
    { id: 'comet-fox', name: 'Comet Fox', emoji: '🦊', rarity: 'uncommon', hue: '#ffb36b' },
    { id: 'orbit-owl', name: 'Orbit Owl', emoji: '🦉', rarity: 'uncommon', hue: '#9ad7c2' },
    { id: 'nebula-seal', name: 'Nebula Seal', emoji: '🦭', rarity: 'rare', hue: '#6ec8ff' },
    { id: 'star-sloth', name: 'Star Sloth', emoji: '🦥', rarity: 'rare', hue: '#ff9bb0' },
    { id: 'aurora-drake', name: 'Aurora Drake', emoji: '🐲', rarity: 'legendary', hue: '#ffd25a' },
    { id: 'nova-whale', name: 'Nova Whale', emoji: '🐋', rarity: 'legendary', hue: '#c084fc' },
    { id: 'prism-phoenix', name: 'Prism Phoenix', emoji: '🐦', rarity: 'legendary', hue: '#ff7a45' },
    { id: 'lunar-unicorn', name: 'Lunar Unicorn', emoji: '🦄', rarity: 'legendary', hue: '#f0abfc' },
    { id: 'galaxy-panda', name: 'Galaxy Panda', emoji: '🐼', rarity: 'legendary', hue: '#a5b4fc' },
    { id: 'comet-axolotl', name: 'Comet Axolotl', emoji: '🦎', rarity: 'legendary', hue: '#fda4af' },
    { id: 'eclipse-lynx', name: 'Eclipse Lynx', emoji: '🐈', rarity: 'legendary', hue: '#e9d5ff' },
  ];

  const PET_RARITY = {
    common: { label: 'Common', power: 8, income: 1 },
    uncommon: { label: 'Uncommon', power: 16, income: 2 },
    rare: { label: 'Rare', power: 32, income: 3 },
    legendary: { label: 'Legendary', power: 96, income: 8 },
  };

  const NOVA_NEST_ID = 3;
  const LEGEND_WAKE_TAPS = 3;
  const GATE_CYCLE = 5000;
  const GATE_LOCKED = 2800;

  function petArtHtml(def, mark) {
    const uid = 'sap' + String(mark || def.id).replace(/[^a-z0-9]/gi, '');
    return `<span class="sap-pet-art">${Characters.pet(def.id, uid)}</span>`;
  }

  function petChip(p, cls) {
    return `<span class="${cls} r-${p.def.rarity}" title="${p.def.name}">${Characters.pet(p.def.id, cls + p.uid)}</span>`;
  }

  function loadStealBest() {
    try {
      const raw = localStorage.getItem(Players.key(STEAL_KEY));
      if (raw) return { bestScore: 0, bestPets: 0, bestLegendary: 0, ...JSON.parse(raw) };
    } catch (e) { /* defaults */ }
    return { bestScore: 0, bestPets: 0, bestLegendary: 0 };
  }

  function saveStealBest(rec) {
    localStorage.setItem(Players.key(STEAL_KEY), JSON.stringify(rec));
  }

  function nestGateOpen(now) {
    return (now % GATE_CYCLE) >= GATE_LOCKED;
  }

  function pickSpacePet(rarity) {
    const pool = SPACE_PETS.filter(p => p.rarity === rarity);
    if (!pool.length) return SPACE_PETS[0];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function restockRarity(rival, luck) {
    if (rival.id === NOVA_NEST_ID) {
      const chance = luck >= 2 ? 0.48 : luck >= 1 ? 0.32 : 0.18;
      if (Math.random() < chance) return 'legendary';
      return Math.random() < 0.55 ? 'rare' : 'uncommon';
    }
    const bump = Math.min(2, rival.id + luck);
    return ['common', 'uncommon', 'rare'][bump];
  }

  function startStealAPet(root, hud) {
    const sess = beginSession();
    const duration = 75000;
    const homeMax = 6;
    const t0 = performance.now();
    const records = loadStealBest();
    let coins = 4;
    let lastIncome = t0;
    let petUid = 1;
    let ended = false;
    let lastTs = t0;
    let stunUntil = 0;
    let stealGraceUntil = 0;
    let alertUntil = 0;
    let lastGateOpen = nestGateOpen(t0);
    let gateHintAt = 0;
    const upgrades = { speed: 0, hug: 0, luck: 0 };
    const keys = { u: false, d: false, l: false, r: false };
    const joy = { active: false, x: 0, y: 0 };
    let dest = null;
    const player = { x: 50, y: 78 };
    const home = { x: 50, y: 88, r: 13 };
    const rivals = [
      { id: 0, name: 'Crater Keep', x: 16, y: 18, color: '#ff8a5b' },
      { id: 1, name: 'Ring Ranch', x: 84, y: 18, color: '#b56bff' },
      { id: 2, name: 'Goo Grove', x: 14, y: 48, color: '#3cc9a0' },
      { id: 3, name: 'Nova Nest', x: 86, y: 48, color: '#ffd25a' },
    ];
    const goos = [
      { x: 42, y: 36 },
      { x: 32, y: 64 },
      { x: 68, y: 60 },
    ];
    const guards = rivals.map((b, i) => ({
      rivalId: b.id,
      angle: i * 1.4,
      speed: 1.05 + i * 0.18,
      orbit: 8 + (i === NOVA_NEST_ID ? 1.8 : 0),
      chase: 0,
      x: b.x, y: b.y,
    }));
    guards.push({
      rivalId: NOVA_NEST_ID,
      angle: 3.6,
      speed: 1.55,
      orbit: 11.5,
      chase: 0,
      x: rivals[NOVA_NEST_ID].x,
      y: rivals[NOVA_NEST_ID].y,
    });
    const worldPets = [];
    const collection = [];
    const carried = [];

    function makePet(rarity, rival) {
      const def = pickSpacePet(rarity);
      const legendary = rarity === 'legendary';
      const inward = rival.x < 50 ? (legendary ? 16 : 14) : (legendary ? -16 : -14);
      const down = legendary ? -8 : 14;
      return {
        uid: petUid++,
        def,
        rivalId: rival.id,
        x: rival.x + inward,
        y: rival.y + down,
        homeX: rival.x + inward,
        homeY: rival.y + down,
        state: 'parked',
        awake: !legendary,
        wakes: 0,
      };
    }

    worldPets.push(makePet('common', rivals[0]));
    worldPets.push(makePet('uncommon', rivals[1]));
    worldPets.push(makePet('rare', rivals[2]));
    worldPets.push(makePet('legendary', rivals[3]));

    function petPower() {
      return collection.reduce((s, p) => s + PET_RARITY[p.def.rarity].power, 0);
    }

    function carryCap() {
      return 1 + upgrades.hug;
    }

    function carryingLegendary() {
      return carried.some(p => p.def.rarity === 'legendary');
    }

    function speedMul() {
      const boots = 1 + upgrades.speed * 0.22;
      if (!carried.length) return boots;
      const load = carryingLegendary() ? 0.42 : 0.52;
      return boots * load;
    }

    function wakeNeed() {
      return (upgrades.luck > 0 || upgrades.hug > 0) ? 1 : LEGEND_WAKE_TAPS;
    }

    root.innerHTML = `
      <p class="mg-hint">Tap the map or drag the stick. Legendaries sparkle at Nova Nest — wake them, wait for the gold gate, then dash home!</p>
      <div class="mg-cheer" id="mg-cheer">Go, Cosmo — sneak a pet!</div>
      <div class="mg-arena mg-steal" id="mg-arena"></div>
    `;
    const arena = root.querySelector('#mg-arena');

    rivals.forEach(b => {
      const el = document.createElement('div');
      el.className = 'sap-base sap-rival';
      el.dataset.rival = String(b.id);
      el.innerHTML = `<div class="sap-rival-art${b.id === NOVA_NEST_ID ? ' is-nova' : ''}">${Characters.rival(b.id)}</div><span class="sap-base-name">${b.name}</span>`;
      el.style.setProperty('--base', b.color);
      arena.appendChild(el);
    });
    const homeEl = document.createElement('div');
    homeEl.className = 'sap-base sap-home';
    homeEl.id = 'sap-home';
    homeEl.innerHTML = `<div class="sap-rival-art">${Characters.homeBase()}</div><span class="sap-base-name">Your Base</span><div class="sap-home-pets" id="sap-home-pets"></div>`;
    arena.appendChild(homeEl);
    goos.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = 'sap-goo';
      el.innerHTML = Characters.goo('goo' + i);
      el.dataset.goo = String(i);
      arena.appendChild(el);
    });
    guards.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = 'sap-guard' + (g.rivalId === NOVA_NEST_ID ? ' sap-guard-nova' : '');
      el.dataset.guard = String(i);
      el.innerHTML = Characters.guard(g.rivalId === NOVA_NEST_ID, 'guard' + i);
      arena.appendChild(el);
    });
    const playerEl = document.createElement('div');
    playerEl.className = 'sap-player';
    playerEl.id = 'sap-player';
    playerEl.innerHTML = dressedStage('steal-pet', loadDress(), 'tiny-size') +
      '<div class="sap-carry-stack" id="sap-carry-stack"></div>';
    arena.appendChild(playerEl);

    const stick = document.createElement('div');
    stick.className = 'sap-stick';
    stick.id = 'sap-stick';
    stick.innerHTML = '<div class="sap-stick-hit" id="sap-stick-hit"></div><div class="sap-stick-knob" id="sap-stick-knob"></div>';
    arena.appendChild(stick);
    const knob = stick.querySelector('#sap-stick-knob');

    const petLayer = document.createElement('div');
    petLayer.className = 'sap-pet-layer';
    arena.appendChild(petLayer);

    const shop = document.createElement('div');
    shop.className = 'sap-shop';
    shop.id = 'sap-shop';
    arena.appendChild(shop);

    function petButton(pet) {
      const r = PET_RARITY[pet.def.rarity];
      const legendary = pet.def.rarity === 'legendary';
      const gateShut = legendary && !nestGateOpen(performance.now());
      const sleepy = legendary && !pet.awake;
      const lockClass = (gateShut || sleepy) ? ' sap-locked' : '';
      const wakeMark = sleepy ? `<span class="sap-wake">${pet.wakes}/${wakeNeed()}</span>` : '';
      const lockMark = gateShut && pet.awake
        ? `<span class="sap-gate">${Characters.lock()}</span>`
        : (sleepy ? `<span class="sap-gate">${Characters.sparkle()}</span>` : '');
      return `<button type="button" class="sap-pet r-${pet.def.rarity}${lockClass}" data-pet="${pet.uid}" style="--pet:${pet.def.hue}" aria-label="${pet.def.name}">
        ${lockMark}
        ${petArtHtml(pet.def, pet.uid)}
        <span class="sap-pet-tag">${pet.def.name}</span>
        <span class="sap-pet-rare">${legendary ? '⭐ ' : ''}${r.label}</span>
        ${wakeMark}
      </button>`;
    }

    function layoutStatic() {
      homeEl.style.left = home.x + '%';
      homeEl.style.top = home.y + '%';
      rivals.forEach(b => {
        const el = arena.querySelector(`[data-rival="${b.id}"]`);
        if (el) { el.style.left = b.x + '%'; el.style.top = b.y + '%'; }
      });
      goos.forEach((g, i) => {
        const el = arena.querySelector(`[data-goo="${i}"]`);
        if (el) { el.style.left = g.x + '%'; el.style.top = g.y + '%'; }
      });
    }
    layoutStatic();

    function tryWakeLegendary(pet) {
      if (pet.def.rarity !== 'legendary' || pet.state !== 'parked') return;
      if (dist(player, pet) > 14) {
        cheer('Scoot closer to wake the legendary!');
        return;
      }
      if (pet.awake) {
        if (!nestGateOpen(performance.now())) {
          cheer('Wait for Nova Nest’s gold sparkle gate!');
        } else {
          cheer('It’s awake — steal and run home!');
        }
        return;
      }
      pet.wakes += 1;
      const need = wakeNeed();
      if (pet.wakes >= need) {
        pet.awake = true;
        playSound('correct');
        cheer(need === 1
          ? 'Upgrade magic woke the legendary!'
          : `${pet.def.name} is awake! Wait for the gold gate!`);
      } else {
        playSound('tap');
        cheer(`Tap sparkles ${pet.wakes}/${need} to wake ${pet.def.name}!`);
      }
      renderPets();
    }

    function bindPetTaps() {
      petLayer.querySelectorAll('[data-pet]').forEach(btn => {
        pointerTap(btn, () => {
          if (!session || ended) return;
          const pet = worldPets.find(p => p.uid === Number(btn.dataset.pet) && p.state === 'parked');
          if (!pet) return;
          dest = { x: pet.x, y: pet.y };
          if (pet.def.rarity === 'legendary') tryWakeLegendary(pet);
          else playSound('tap');
        });
      });
    }

    function renderPets() {
      petLayer.innerHTML = worldPets.filter(p => p.state === 'parked').map(petButton).join('');
      worldPets.filter(p => p.state === 'parked').forEach(p => {
        const el = petLayer.querySelector(`[data-pet="${p.uid}"]`);
        if (el) { el.style.left = p.x + '%'; el.style.top = p.y + '%'; }
      });
      bindPetTaps();
      const stack = playerEl.querySelector('#sap-carry-stack');
      stack.innerHTML = carried.map(p => petChip(p, 'sap-carry-chip')).join('');
      const homePets = homeEl.querySelector('#sap-home-pets');
      homePets.innerHTML = collection.map(p => petChip(p, 'sap-home-chip')).join('');
      playerEl.classList.toggle('carrying', carried.length > 0);
      playerEl.classList.toggle('carrying-legendary', carryingLegendary());
      playerEl.classList.toggle('stunned', performance.now() < stunUntil);
      arena.classList.toggle('sap-alerting', performance.now() < alertUntil);
      const nova = arena.querySelector(`[data-rival="${NOVA_NEST_ID}"]`);
      if (nova) nova.classList.toggle('sap-gate-shut', !nestGateOpen(performance.now()));
    }

    function paintGate() {
      const open = nestGateOpen(performance.now());
      const nova = arena.querySelector(`[data-rival="${NOVA_NEST_ID}"]`);
      if (nova) nova.classList.toggle('sap-gate-shut', !open);
      worldPets.filter(p => p.state === 'parked' && p.def.rarity === 'legendary').forEach(p => {
        const el = petLayer.querySelector(`[data-pet="${p.uid}"]`);
        if (!el) return;
        const sleepy = !p.awake;
        const gateShut = !open;
        el.classList.toggle('sap-locked', gateShut || sleepy);
        let mark = el.querySelector('.sap-gate');
        if (gateShut && p.awake) {
          if (!mark) {
            mark = document.createElement('span');
            mark.className = 'sap-gate';
            el.prepend(mark);
          }
          mark.innerHTML = Characters.lock();
        } else if (sleepy) {
          if (!mark) {
            mark = document.createElement('span');
            mark.className = 'sap-gate';
            el.prepend(mark);
          }
          mark.innerHTML = Characters.sparkle();
        } else if (mark) {
          mark.remove();
        }
      });
    }

    function shopHtml() {
      const speedCost = [6, 12, 20][upgrades.speed] || null;
      const hugCost = upgrades.hug ? null : 14;
      const luckCost = [10, 18][upgrades.luck] || null;
      return `
        <button type="button" class="sap-up" data-up="speed" ${!speedCost || coins < speedCost ? 'disabled' : ''}>
          👟 Zoom boots ${upgrades.speed}/3${speedCost ? ' · 🪙' + speedCost : ' · max'}
        </button>
        <button type="button" class="sap-up" data-up="hug" ${hugCost == null || coins < hugCost ? 'disabled' : ''}>
          🤗 Super hug ${upgrades.hug ? 'on' : '· carry 2 · 🪙14'}
        </button>
        <button type="button" class="sap-up" data-up="luck" ${!luckCost || coins < luckCost ? 'disabled' : ''}>
          🍀 Lucky sniff ${upgrades.luck}/2${luckCost ? ' · 🪙' + luckCost : ' · max'}
        </button>`;
    }

    function paintShop() {
      shop.innerHTML = shopHtml();
      shop.querySelectorAll('[data-up]').forEach(btn => {
        pointerTap(btn, () => buyUpgrade(btn.dataset.up));
      });
    }

    function buyUpgrade(kind) {
      if (!session || ended) return;
      if (kind === 'speed') {
        const cost = [6, 12, 20][upgrades.speed];
        if (!cost || coins < cost) return;
        coins -= cost;
        upgrades.speed += 1;
        cheer('Zoom boots! Faster Cosmo!');
      } else if (kind === 'hug') {
        if (upgrades.hug || coins < 14) return;
        coins -= 14;
        upgrades.hug = 1;
        cheer('Super hug! Carry two pets — and wake legendaries faster!');
      } else if (kind === 'luck') {
        const cost = [10, 18][upgrades.luck];
        if (!cost || coins < cost) return;
        coins -= cost;
        upgrades.luck += 1;
        cheer('Lucky sniff! Legendaries at Nova Nest get easier to find!');
      }
      playSound('correct');
      paintHud();
      paintShop();
    }

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>🐾 ${collection.length}/${homeMax}</span><span>⚡ ${petPower()}</span><span>⭐ ${collection.filter(p => p.def.rarity === 'legendary').length}</span><span>🪙 ${coins}</span><span>⏱️ ${left}</span>`;
    }

    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function gooHit() {
      return goos.some(g => dist(player, g) < 6.5);
    }

    function inHazard() {
      if (gooHit() && !carryingLegendary()) return true;
      if (performance.now() < stealGraceUntil) return false;
      return guards.some(g => dist(player, g) < 5.6);
    }

    function tryPickup() {
      if (performance.now() < stunUntil) return;
      if (carried.length >= carryCap()) return;
      if (inHazard()) return;
      const near = worldPets.find(p => p.state === 'parked' && dist(player, p) < 9);
      if (!near) return;
      if (near.def.rarity === 'legendary') {
        if (!near.awake) return;
        if (!nestGateOpen(performance.now())) {
          if (performance.now() - gateHintAt > 1600) {
            gateHintAt = performance.now();
            cheer('Gold gate is closed — wait for the sparkle!');
          }
          return;
        }
      }
      near.state = 'carried';
      carried.push(near);
      stealGraceUntil = performance.now() + (near.def.rarity === 'legendary' ? 1400 : 700);
      if (near.def.rarity === 'legendary') {
        dest = { x: home.x, y: home.y };
        alertUntil = performance.now() + 4200;
        guards.forEach(g => { if (g.rivalId === NOVA_NEST_ID) g.chase = alertUntil; });
        arena.classList.add('sap-alerting');
        playSound('legendary');
        cheer(`⭐ LEGENDARY ${near.def.name}! Heavy hugs — dash home!`);
        if (typeof setMascotMood === 'function') setMascotMood('correct');
      } else {
        playSound('correct');
        cheer(`Got ${near.def.name}! Run home!`);
      }
      renderPets();
    }

    function persistBests() {
      const rec = loadStealBest();
      const score = petPower();
      const legends = collection.filter(p => p.def.rarity === 'legendary').length;
      if (score > rec.bestScore) rec.bestScore = score;
      if (collection.length > rec.bestPets) rec.bestPets = collection.length;
      if (legends > rec.bestLegendary) rec.bestLegendary = legends;
      saveStealBest(rec);
      return rec;
    }

    function celebrateLegendary(pet) {
      homeEl.classList.remove('sap-legend-land');
      void homeEl.offsetWidth;
      homeEl.classList.add('sap-legend-land');
      sess.timers.push(setTimeout(() => homeEl.classList.remove('sap-legend-land'), 1800));
      if (typeof startConfetti === 'function') startConfetti();
      playSound('victory');
      if (typeof setMascotMood === 'function') setMascotMood('correct');
      cheer(`🌟 LEGENDARY locked in! ${pet.def.name} lives at YOUR base!`);
    }

    function lockIn() {
      if (!carried.length) return;
      if (dist(player, home) > home.r) return;
      const gained = carried.splice(0, carried.length);
      const landedLegend = gained.filter(p => p.def.rarity === 'legendary');
      gained.forEach(p => {
        p.state = 'home';
        collection.push(p);
        coins += p.def.rarity === 'legendary' ? 10 : 2;
        const rival = rivals.find(r => r.id === p.rivalId);
        if (rival) {
          sess.timers.push(setTimeout(() => {
            if (!session || ended) return;
            const hasParked = worldPets.some(w => w.rivalId === rival.id && w.state === 'parked');
            if (!hasParked) {
              worldPets.push(makePet(restockRarity(rival, upgrades.luck), rival));
              renderPets();
            }
          }, 1600));
        }
      });
      if (landedLegend.length) {
        celebrateLegendary(landedLegend[0]);
      } else {
        playSound('correct');
        cheer(collection.length >= homeMax
          ? 'BASE FULL of space pets! Cosmo is dancing!'
          : 'Safe at base! ' + gained.map(p => p.def.name).join(', '));
      }
      persistBests();
      renderPets();
      paintHud();
      paintShop();
      if (collection.length >= homeMax) endRound(true);
    }

    function dropSteal(reason) {
      if (!carried.length) return;
      const dropped = carried.splice(0, carried.length);
      dropped.forEach(p => {
        p.state = 'parked';
        p.x = p.homeX;
        p.y = p.homeY;
        if (p.def.rarity === 'legendary') {
          p.awake = true;
        }
      });
      stunUntil = performance.now() + 900;
      dest = null;
      playSound('wrong');
      cheer(reason === 'goo'
        ? 'Goo splat! The pet wriggled home. Try again!'
        : 'Guard tag! Pet skipped back. You got this!', false);
      renderPets();
    }

    function endRound(filled) {
      if (ended) return;
      ended = true;
      freeze(sess);
      const score = petPower();
      const rec = persistBests();
      const n = collection.length;
      const petWord = n === 1 ? 'pet' : 'pets';
      const names = collection.map(p => p.def.name).join(', ') || 'none yet';
      const legends = collection.filter(p => p.def.rarity === 'legendary').length;
      const legendLine = legends ? ` · ⭐ ${legends} legendary` : '';
      const line = filled
        ? 'Base full! Pet power ' + score + legendLine + ' · ' + names
        : 'You brought home ' + n + ' ' + petWord + ' · power ' + score + legendLine + ' (best ' + rec.bestScore + ')';
      finishOverlay(root, 'steal-a-pet', 'Steal a Pet', line, () => {
        startStealAPet(root, hud);
      });
    }

    function onKey(e, down) {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') keys.u = down;
      if (k === 'arrowdown' || k === 's') keys.d = down;
      if (k === 'arrowleft' || k === 'a') keys.l = down;
      if (k === 'arrowright' || k === 'd') keys.r = down;
    }
    const kd = e => onKey(e, true);
    const ku = e => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    function setJoyFromEvent(e) {
      const box = stick.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const reach = Math.max(36, box.width * 0.36);
      let dx = (e.clientX - cx) / reach;
      let dy = (e.clientY - cy) / reach;
      const mag = Math.hypot(dx, dy);
      if (mag < 0.05) {
        joy.x = 0;
        joy.y = 0;
        knob.style.transform = 'translate(0,0)';
        return;
      }
      const nx = dx / mag;
      const ny = dy / mag;
      const t = Math.min(1, (mag - 0.05) / 0.78);
      const spd = Math.pow(t, 0.55);
      joy.x = nx * spd;
      joy.y = ny * spd;
      const travel = 30;
      knob.style.transform = `translate(${nx * Math.min(mag, 1) * travel}px, ${ny * Math.min(mag, 1) * travel}px)`;
    }
    function joyStart(e) {
      e.preventDefault();
      e.stopPropagation();
      joy.active = true;
      dest = null;
      if (e.pointerId != null && stick.setPointerCapture) {
        try { stick.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      setJoyFromEvent(e);
    }
    function joyMove(e) {
      if (!joy.active) return;
      e.preventDefault();
      setJoyFromEvent(e);
    }
    function joyEnd(e) {
      if (!joy.active) return;
      e.preventDefault();
      joy.active = false;
      joy.x = 0;
      joy.y = 0;
      knob.style.transform = 'translate(0,0)';
      if (e.pointerId != null && stick.releasePointerCapture) {
        try { stick.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
    }
    stick.addEventListener('pointerdown', joyStart);
    window.addEventListener('pointermove', joyMove);
    window.addEventListener('pointerup', joyEnd);
    window.addEventListener('pointercancel', joyEnd);

    arena.addEventListener('pointerdown', e => {
      if (e.target.closest('#sap-stick') || e.target.closest('.sap-pet') || e.target.closest('.sap-shop') || e.target.closest('.mg-finish')) return;
      const box = arena.getBoundingClientRect();
      dest = {
        x: ((e.clientX - box.left) / box.width) * 100,
        y: ((e.clientY - box.top) / box.height) * 100,
      };
    });

    sess.cleanup = () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('pointermove', joyMove);
      window.removeEventListener('pointerup', joyEnd);
      window.removeEventListener('pointercancel', joyEnd);
    };

    renderPets();
    paintShop();
    paintHud();
    cheer(records.bestScore
      ? `Best power ${records.bestScore}${records.bestLegendary ? ' · ⭐' + records.bestLegendary + ' legendary' : ''}! Hunt Nova Nest!`
      : 'Steal a pet, then dash back to YOUR base!');

    function tick(now) {
      if (!session || ended) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      guards.forEach((g, i) => {
        const b = rivals[g.rivalId];
        const chasing = now < g.chase && carryingLegendary() && now >= stealGraceUntil;
        if (chasing) {
          const dx = player.x - g.x;
          const dy = player.y - g.y;
          const m = Math.hypot(dx, dy) || 1;
          g.x += (dx / m) * 9 * dt;
          g.y += (dy / m) * 9 * dt;
        } else {
          const spd = g.speed * (now < alertUntil && g.rivalId === NOVA_NEST_ID ? 1.45 : 1);
          g.angle += spd * dt;
          g.x = b.x + Math.cos(g.angle) * g.orbit;
          g.y = b.y + Math.sin(g.angle) * (g.orbit * 0.72);
        }
        const el = arena.querySelector(`[data-guard="${i}"]`);
        if (el) {
          el.style.left = g.x + '%';
          el.style.top = g.y + '%';
          el.classList.toggle('sap-guard-chase', chasing);
        }
      });

      const gateOpen = nestGateOpen(now);
      if (gateOpen !== lastGateOpen) {
        lastGateOpen = gateOpen;
        paintGate();
      }
      if (now >= alertUntil) arena.classList.remove('sap-alerting');

      let vx = 0, vy = 0;
      if (joy.active) {
        vx = joy.x;
        vy = joy.y;
      } else {
        if (keys.l) vx -= 1;
        if (keys.r) vx += 1;
        if (keys.u) vy -= 1;
        if (keys.d) vy += 1;
        if (dest) {
          const dx = dest.x - player.x;
          const dy = dest.y - player.y;
          const m = Math.hypot(dx, dy);
          if (m < 1.8) dest = null;
          else { vx += dx / m; vy += dy / m; }
        }
      }
      const mag = Math.hypot(vx, vy);
      if (mag > 1) { vx /= mag; vy /= mag; }
      const spd = 34 * speedMul();
      if (now < stunUntil) {
        vx *= 0.35;
        vy *= 0.35;
      }
      player.x = Math.max(7, Math.min(93, player.x + vx * spd * dt));
      player.y = Math.max(8, Math.min(92, player.y + vy * spd * dt));
      playerEl.style.left = player.x + '%';
      playerEl.style.top = player.y + '%';

      tryPickup();
      lockIn();

      if (carried.length && inHazard()) {
        dropSteal(gooHit() && !carryingLegendary() ? 'goo' : 'guard');
      }

      if (now - lastIncome >= 2200) {
        lastIncome = now;
        const gain = collection.reduce((s, p) => s + PET_RARITY[p.def.rarity].income, 0);
        if (gain) {
          coins += gain;
          paintShop();
        }
      }

      paintHud();
      if (now - t0 >= duration) {
        endRound(false);
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  function startPlanetPop(root, hud) {
    const sess = beginSession();
    const duration = 45000;
    let score = 0;
    let combo = 0;
    const t0 = performance.now();
    let planetN = 0;
    root.innerHTML = `
      <p class="mg-hint">Pop the zoom-zoom planets!</p>
      <div class="mg-cheer" id="mg-cheer">ZOOM ZOOM!</div>
      <div class="mg-arena mg-arena-pop" id="mg-arena"></div>
    `;
    const arena = root.querySelector('#mg-arena');

    function spawn() {
      if (!session) return;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'mg-planet';
      const face = planetN++;
      el.innerHTML = Characters.planet(face, 'pop' + face);
      el.style.left = (6 + Math.random() * 78) + '%';
      el.style.top = (10 + Math.random() * 62) + '%';
      const size = 58 + Math.random() * 36;
      el.style.width = el.style.height = size + 'px';
      el.style.fontSize = (size * 0.52) + 'px';
      pointerTap(el, () => {
        if (!session) return;
        combo += 1;
        score += 1 + Math.min(combo, 10);
        playSound('tap');
        cheer(combo > 2 ? `ZOOM ZOOM x${combo}!` : 'POP!');
        el.classList.add('popped');
        sess.timers.push(setTimeout(() => el.remove(), 180));
        paintHud();
      });
      arena.appendChild(el);
      sess.timers.push(setTimeout(() => {
        if (el.parentNode) {
          combo = 0;
          el.remove();
        }
      }, 1600 + Math.random() * 900));
    }

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>🫧 ${score}</span><span>⏱️ ${left}</span>`;
    }

    sess.intervals.push(setInterval(spawn, 480));
    spawn(); spawn(); spawn();

    function tick(now) {
      if (!session) return;
      paintHud();
      if (now - t0 >= duration) {
        freeze(sess);
        arena.innerHTML = '';
        finishOverlay(root, 'planet-pop', 'Zoom Zoom Planet Pop', `You popped ${score} zoom points!`, () => {
          startPlanetPop(root, hud);
        });
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  function startPurpleBlip(root, hud) {
    const sess = beginSession();
    const duration = 35000;
    let score = 0;
    const t0 = performance.now();
    const palette = [
      { id: 'purple', emoji: '👾', ok: true, color: '#b56bff' },
      { id: 'green', emoji: '🟢', ok: false, color: '#3cc9a0' },
      { id: 'gold', emoji: '🟡', ok: false, color: '#ffd25a' },
      { id: 'pink', emoji: '🩷', ok: false, color: '#ff9bb0' },
      { id: 'blue', emoji: '🔵', ok: false, color: '#6ec8ff' },
    ];
    root.innerHTML = `
      <p class="mg-hint">Tap only the <span class="mg-swatch-purple">purple</span> blip!</p>
      <div class="mg-cheer" id="mg-cheer">Wait for purple…</div>
      <div class="mg-arena mg-arena-blips" id="mg-arena"></div>
    `;
    const arena = root.querySelector('#mg-arena');

    function spawnWave() {
      if (!session) return;
      arena.innerHTML = '';
      const count = 2 + Math.floor(Math.random() * 3);
      const slots = [];
      let hasPurple = false;
      for (let i = 0; i < count; i++) {
        let pick = palette[Math.floor(Math.random() * palette.length)];
        if (i === count - 1 && !hasPurple) pick = palette[0];
        if (pick.ok) hasPurple = true;
        slots.push(pick);
      }
      if (Math.random() < 0.18) {
        // Sometimes extra purples for a juicy round
        slots[0] = palette[0];
      }
      slots.forEach(pick => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'mg-blip';
        el.style.background = 'rgba(8, 12, 28, 0.35)';
        el.style.border = '4px solid ' + pick.color;
        el.innerHTML = Characters.blip(pick.id, 'blip' + pick.id + score + Math.floor(Math.random() * 999));
        pointerTap(el, () => {
          if (!session) return;
          if (pick.ok) {
            score += 1;
            playSound('correct');
            cheer(['PURPLE! 👾', 'Nice blip!', 'Cosmo wiggles!'][score % 3]);
            el.classList.add('blip-yes');
          } else {
            playSound('wrong');
            cheer('Wait for purple!', false);
            el.classList.add('blip-no');
          }
          paintHud();
        });
        arena.appendChild(el);
      });
    }

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>👾 ${score}</span><span>⏱️ ${left}</span>`;
    }

    sess.intervals.push(setInterval(spawnWave, 1300));
    spawnWave();

    function tick(now) {
      if (!session) return;
      paintHud();
      if (now - t0 >= duration) {
        freeze(sess);
        arena.innerHTML = '';
        finishOverlay(root, 'purple-blip', 'Purple Blip Tap', `You caught ${score} purple blips!`, () => {
          startPurpleBlip(root, hud);
        });
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  function startWiggleWalk(root, hud) {
    const sess = beginSession();
    const duration = 45000;
    let score = 0;
    let x = 50;
    let steer = 0;
    const t0 = performance.now();
    root.innerHTML = `
      <p class="mg-hint">Tap left or right to keep Cosmo on the wiggle!</p>
      <div class="mg-cheer" id="mg-cheer">Wiggle wiggle!</div>
      <div class="mg-arena mg-wiggle" id="mg-arena">
        <canvas id="mg-wiggle-canvas"></canvas>
        <div id="mg-wiggle-cosmo" class="mg-wiggle-cosmo mascot-svg"></div>
        <button type="button" class="mg-steer mg-steer-l" aria-label="Left">${Characters.arrow('left')}</button>
        <button type="button" class="mg-steer mg-steer-r" aria-label="Right">${Characters.arrow('right')}</button>
      </div>
    `;
    const arena = root.querySelector('#mg-arena');
    const canvas = root.querySelector('#mg-wiggle-canvas');
    const cosmo = root.querySelector('#mg-wiggle-cosmo');
    cosmo.innerHTML = dressedStage('wiggle', loadDress(), 'tiny-size');
    const ctx = canvas.getContext('2d');
    const coins = [];
    for (let i = 0; i < 14; i++) {
      coins.push({ t: i * 0.45 + 0.4, taken: false });
    }

    function resize() {
      canvas.width = arena.clientWidth;
      canvas.height = arena.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function pathX(t, w) {
      return w * (0.5 + 0.32 * Math.sin(t * 1.7) + 0.08 * Math.sin(t * 4.1));
    }

    const down = { l: false, r: false };
    function bindSteer(btn, side) {
      const on = e => { e.preventDefault(); down[side] = true; };
      const off = e => { e.preventDefault(); down[side] = false; };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointerleave', off);
      btn.addEventListener('pointercancel', off);
    }
    bindSteer(root.querySelector('.mg-steer-l'), 'l');
    bindSteer(root.querySelector('.mg-steer-r'), 'r');

    function onOrient(e) {
      if (e.gamma == null) return;
      steer = Math.max(-1, Math.min(1, e.gamma / 18));
    }
    window.addEventListener('deviceorientation', onOrient);

    sess.cleanup = () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('deviceorientation', onOrient);
    };

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>🪙 ${score}</span><span>⏱️ ${left}</span>`;
    }

    function tick(now) {
      if (!session) return;
      const t = (now - t0) / 1000;
      const w = canvas.width;
      const h = canvas.height;
      if (down.l) x -= 1.15;
      if (down.r) x += 1.15;
      x += steer * 0.9;
      x = Math.max(8, Math.min(92, x));

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = Math.max(36, w * 0.12);
      ctx.strokeStyle = 'rgba(60, 201, 160, 0.35)';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const tt = t + i * 0.12;
        const px = pathX(tt, w);
        const py = h - i * (h / 20);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const laneX = pathX(t, w);
      const px = (x / 100) * w;
      const py = h * 0.72;
      coins.forEach(c => {
        if (c.taken) return;
        const cy = h * 0.72 - ((c.t - (t % 8)) * 70);
        const cx = pathX(c.t + t * 0.15, w);
        if (cy < -20 || cy > h + 20) return;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = '#ffd25a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fff6c8';
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const a = -Math.PI / 2 + s * Math.PI * 2 / 5;
          const b = a + Math.PI / 5;
          ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
          ctx.lineTo(Math.cos(b) * 3.4, Math.sin(b) * 3.4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const near = Math.hypot(px - cx, py - cy) < 48;
        if (near) {
          c.taken = true;
          score += 1;
          playSound('correct');
          cheer('Coin wiggle! 🪙');
        }
      });
      if (coins.every(c => c.taken)) {
        coins.forEach((c, i) => { c.taken = false; c.t = t + 0.5 + i * 0.4; });
      }

      const dist = Math.abs(px - laneX);
      if (dist > w * 0.16) {
        x += (laneX / w * 100 - x) * 0.04;
      }

      cosmo.style.left = x + '%';
      paintHud();
      if (now - t0 >= duration) {
        freeze(sess);
        finishOverlay(root, 'wiggle-walk', 'Wiggle Walk', `You scooped ${score} wiggle coins!`, () => {
          startWiggleWalk(root, hud);
        });
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  function startMoonBoing(root, hud) {
    const sess = beginSession();
    const rounds = 10;
    let attempt = 0;
    let hits = 0;
    let moonY = 90;
    let vy = -2.4;
    let waiting = false;
    root.innerHTML = `
      <p class="mg-hint">Tap when the moon is in the hoop!</p>
      <div class="mg-cheer" id="mg-cheer">Boing boing!</div>
      <div class="mg-arena mg-boing" id="mg-arena">
        <div class="mg-hoop" id="mg-hoop">${Characters.hoop()}</div>
        <button type="button" class="mg-moon" id="mg-moon" aria-label="Moon">${Characters.moon()}</button>
      </div>
    `;
    const moon = root.querySelector('#mg-moon');
    const hoop = root.querySelector('#mg-hoop');

    function paintHud() {
      hud.innerHTML = `<span>🌕 ${hits}</span><span>Boing ${Math.min(attempt + 1, rounds)}/${rounds}</span>`;
    }

    function afterTap() {
      if (!session) return;
      if (attempt >= rounds) {
        freeze(sess);
        finishOverlay(root, 'moon-boing', 'Moon Boing', `Boing! ${hits} perfect hoops!`, () => {
          startMoonBoing(root, hud);
        });
        return;
      }
      waiting = false;
      moonY = 88;
      vy = -(2.1 + Math.random() * 1.4);
      paintHud();
    }

    pointerTap(moon, () => tapBoing());
    pointerTap(root.querySelector('#mg-arena'), () => tapBoing());

    function tapBoing() {
      if (!session || waiting || attempt >= rounds) return;
      const moonBox = moon.getBoundingClientRect();
      const hoopBox = hoop.getBoundingClientRect();
      const overlap = !(moonBox.bottom < hoopBox.top + 8 || moonBox.top > hoopBox.bottom - 8);
      waiting = true;
      attempt += 1;
      if (overlap) {
        hits += 1;
        playSound('correct');
        cheer(['BOING!', 'Moon hug!', 'Perfect hoop!'][hits % 3]);
      } else {
        playSound('tap');
        cheer('Almost — wait for the hoop!');
      }
      paintHud();
      sess.timers.push(setTimeout(afterTap, 650));
    }

    function tick() {
      if (!session) return;
      if (!waiting && attempt < rounds) {
        moonY += vy;
        vy += 0.085;
        if (moonY > 92) {
          moonY = 92;
          vy = -(2.2 + Math.random() * 1.6);
        }
        if (moonY < 8) {
          moonY = 8;
          vy = Math.abs(vy);
        }
        moon.style.top = moonY + '%';
      }
      session.raf = requestAnimationFrame(tick);
    }
    paintHud();
    sess.raf = requestAnimationFrame(tick);
  }

  function startDressUp(root, hud) {
    beginSession();
    hud.innerHTML = '<span>👗 Pick a pal, then mix & match!</span>';
    const stars = totalStars();
    const state = loadDressState();
    let activeId = state.active;
    if ((DRESS_CHARS.find(c => c.id === activeId) || {}).unlockStars > stars) activeId = 'cosmo';
    let look = lookForChar(activeId);
    let lastCheer = 'Pick a character — then dress them up!';

    function wardrobeFor(items, charId) {
      return items.filter(item => !item.chars || item.chars.includes(charId));
    }

    function locked(item) {
      return stars < item.unlockStars;
    }

    function charLocked(ch) {
      return stars < ch.unlockStars;
    }

    function paint() {
      const active = DRESS_CHARS.find(c => c.id === activeId) || DRESS_CHARS[0];
      const picker = DRESS_CHARS.map(ch => {
        const isLock = charLocked(ch);
        return `<button type="button" class="dress-char ${ch.id === activeId ? 'on' : ''} ${isLock ? 'locked' : ''}"
          data-char="${ch.id}">
          <span class="dress-char-emoji">${isLock ? Characters.lock() : (ch.kind === 'cosmo' ? mascotSVG('pick-' + ch.id) : Characters.body(ch.kind, 'pick-' + ch.id))}</span>
          <span>${isLock ? ch.unlockStars + '⭐' : ch.name}</span>
        </button>`;
      }).join('');
      root.innerHTML = `
        <div class="mg-cheer" id="mg-cheer">${lastCheer}</div>
        <div class="dress-chars" role="tablist" aria-label="Dress-up characters">${picker}</div>
        <div class="dress-layout">
          ${dressedStage('dressup', look, 'play-size', active.id)}
          <div class="dress-cols">
            ${section('Colour', COLORS.map(c => ({
              id: c.id, emoji: '●', name: c.label, unlockStars: 0, swatch: true, hue: swatchHue(c.id, activeId)
            })), 'color')}
            ${section('Hats', wardrobeFor(HATS, activeId), 'hat')}
            ${section('Outfits', wardrobeFor(OUTFITS, activeId), 'outfit')}
            ${section('Extras', wardrobeFor(EXTRAS, activeId), 'extra')}
          </div>
        </div>
        <p class="mg-hint">Looks save per character. Cosmo still wears Cosmo’s look on the galaxy map!</p>
      `;
      root.querySelectorAll('[data-char]').forEach(btn => {
        pointerTap(btn, () => {
          if (btn.classList.contains('locked')) {
            playSound('warning');
            cheer('Earn more stars to unlock this pal!', false);
            return;
          }
          activeId = btn.dataset.char;
          look = lookForChar(activeId);
          const st = loadDressState();
          st.active = activeId;
          saveDressState(st);
          playSound('tap');
          lastCheer = 'Let’s dress ' + (DRESS_CHARS.find(c => c.id === activeId).name) + '!';
          paint();
        });
      });
      root.querySelectorAll('[data-dress]').forEach(btn => {
        pointerTap(btn, () => {
          if (btn.classList.contains('locked')) {
            playSound('warning');
            cheer('Earn more stars to unlock this!', false);
            return;
          }
          const slot = btn.dataset.slot;
          look[slot] = btn.dataset.dress;
          const st = loadDressState();
          st.active = activeId;
          st.looks[activeId] = { ...DEFAULT_LOOK, ...look };
          saveDressState(st);
          playSound('tap');
          lastCheer = 'Ooh fancy!';
          paint();
          if (activeId === 'cosmo') renderGalaxyCosmo();
        });
      });
    }

    function section(title, items, slot) {
      const cells = items.map(item => {
        const isLock = locked(item);
        const on = look[slot] === item.id;
        let visual;
        if (isLock) visual = Characters.lock();
        else if (item.swatch) {
          visual = `<span class="dress-swatch" style="background:hsl(${item.hue} 64% 54%)"></span>`;
        } else if (item.id === 'none') visual = Characters.noneIcon();
        else visual = Characters.dressIcon(slot === 'color' ? 'extra' : slot, item.id, 'ico' + slot + item.id);
        return `<button type="button" class="dress-item ${on ? 'on' : ''} ${isLock ? 'locked' : ''}"
          data-dress="${item.id}" data-slot="${slot}">
          <span class="dress-emoji">${visual}</span>
          <span>${isLock ? item.unlockStars + '⭐' : item.name}</span>
        </button>`;
      }).join('');
      return `<div class="dress-section"><h3>${title}</h3><div class="dress-grid">${cells}</div></div>`;
    }

    paint();
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function startPetPicnic(root, hud) {
    const sess = beginSession();
    const foods = Characters.FOODS;
    const pets = shuffle(Characters.PET_IDS);
    const total = 8;
    let round = 0;
    let fed = 0;
    let misses = 0;
    let craving = foods[0].id;

    function paintHud() {
      hud.innerHTML = `<span>Snack ${Math.min(round + 1, total)}/${total}</span><span>Fed ${fed}</span>`;
    }

    function paint() {
      if (round >= total) {
        freeze(sess);
        finishOverlay(root, 'pet-picnic', 'Pet Picnic', `You fed ${fed} hungry pals!`, () => startPetPicnic(root, hud));
        return;
      }
      const petId = pets[round % pets.length];
      craving = foods[Math.floor(Math.random() * foods.length)].id;
      misses = 0;
      const buttons = shuffle(foods).map(f => `
        <button type="button" class="picnic-food" data-food="${f.id}" aria-label="${f.name}">
          ${Characters.food(f.id)}
          <span>${f.name}</span>
        </button>`).join('');
      root.innerHTML = `
        <p class="mg-hint">Match the snack in the dream bubble. Big pictures!</p>
        <div class="mg-cheer" id="mg-cheer">Snack time!</div>
        <div class="mg-arena mg-picnic" id="mg-arena">
          <div class="picnic-pet">${Characters.pet(petId, 'pic' + round)}</div>
          <div class="picnic-dream">${Characters.food(craving)}<span>I want this!</span></div>
          <div class="picnic-foods">${buttons}</div>
        </div>`;
      root.querySelectorAll('[data-food]').forEach(btn => {
        pointerTap(btn, () => choose(btn));
      });
      paintHud();
    }

    function choose(btn) {
      if (!session) return;
      if (btn.dataset.food === craving) {
        fed += 1;
        round += 1;
        playSound('correct');
        const msg = ['Yum!', 'Happy tummy!', 'What a good snack!'][fed % 3];
        paint();
        cheer(msg);
        return;
      }
      misses += 1;
      playSound('tap');
      const right = root.querySelector(`[data-food="${craving}"]`);
      if (right) right.classList.add('picnic-hint');
      cheer(misses >= 2 ? 'Here it is — give them this one!' : 'Almost! Look at the dream bubble.');
    }

    paint();
  }

  function startMemoryStars(root, hud) {
    const sess = beginSession();
    const pool = [
      { kind: 'pet', id: 'spark-pup' },
      { kind: 'pet', id: 'moon-kit' },
      { kind: 'pet', id: 'comet-fox' },
      { kind: 'pet', id: 'aurora-drake' },
      { kind: 'pet', id: 'lunar-unicorn' },
      { kind: 'pet', id: 'galaxy-panda' },
      { kind: 'dress', id: 'starlet', body: 'kid' },
      { kind: 'dress', id: 'nibble', body: 'pet' },
      { kind: 'dress', id: 'boop', body: 'friend' },
      { kind: 'cosmo', id: 'cosmo' },
    ];
    const picks = shuffle(pool).slice(0, 6);
    const cards = shuffle(picks.concat(picks.map(p => Object.assign({}, p)))).map((p, i) => (
      Object.assign({ i: i, up: false, matched: false }, p)
    ));
    let lock = false;
    let open = [];
    let matches = 0;

    function art(card) {
      if (card.kind === 'pet') return Characters.pet(card.id, 'mem' + card.i);
      if (card.kind === 'cosmo') return mascotSVG('mem' + card.i);
      return Characters.body(card.body, 'mem' + card.i);
    }

    function paintHud() {
      hud.innerHTML = `<span>Pairs ${matches}/6</span>`;
    }

    root.innerHTML = `
      <p class="mg-hint">Flip two cards. Find the matching pals!</p>
      <div class="mg-cheer" id="mg-cheer">Memory stars!</div>
      <div class="mg-arena mg-memory" id="mg-arena">
        <div class="mg-memory-grid">
          ${cards.map(c => `<button type="button" class="mg-mem-card" data-i="${c.i}" aria-label="Star card">
            <span class="back">${Characters.cardBack('memback' + c.i)}</span>
            <span class="front">${art(c)}</span>
          </button>`).join('')}
        </div>
      </div>`;
    const arena = root.querySelector('#mg-arena');

    function paintCards() {
      cards.forEach(c => {
        const el = arena.querySelector(`[data-i="${c.i}"]`);
        if (!el) return;
        el.classList.toggle('flipped', c.up || c.matched);
        el.classList.toggle('matched', c.matched);
      });
      paintHud();
    }

    arena.querySelectorAll('.mg-mem-card').forEach(btn => {
      pointerTap(btn, () => {
        if (!session || lock) return;
        const card = cards[Number(btn.dataset.i)];
        if (!card || card.matched || card.up) return;
        card.up = true;
        playSound('tap');
        open.push(card);
        paintCards();
        if (open.length < 2) return;
        const a = open[0];
        const b = open[1];
        if (a.id === b.id && a.kind === b.kind) {
          a.matched = true;
          b.matched = true;
          matches += 1;
          open = [];
          playSound('correct');
          cheer(matches === 6 ? 'All pairs found!' : 'Match!');
          paintCards();
          if (matches === 6) {
            freeze(sess);
            sess.timers.push(setTimeout(() => {
              finishOverlay(root, 'memory-stars', 'Memory Stars', 'You found all 6 pairs!', () => startMemoryStars(root, hud));
            }, 450));
          }
          return;
        }
        lock = true;
        cheer('Not this time — try another pair!');
        sess.timers.push(setTimeout(() => {
          a.up = false;
          b.up = false;
          open = [];
          lock = false;
          if (session) paintCards();
        }, 800));
      });
    });
    paintHud();
  }

  function startCometCatch(root, hud) {
    const sess = beginSession();
    const duration = 40000;
    const t0 = performance.now();
    let score = 0;
    let x = 50;
    let target = 50;
    let uid = 1;
    const items = [];
    root.innerHTML = `
      <p class="mg-hint">Tap a treat, or tap where Cosmo should stand. Goo is just silly!</p>
      <div class="mg-cheer" id="mg-cheer">Catch the comets!</div>
      <div class="mg-arena mg-catch" id="mg-arena">
        <div class="mg-catch-player" id="mg-catch-player">${dressedStage('catch', loadDress(), 'tiny-size')}</div>
        <div class="mg-catch-controls">
          <button type="button" class="mg-steer" id="mg-catch-l" aria-label="Left">${Characters.arrow('left')}</button>
          <button type="button" class="mg-steer" id="mg-catch-r" aria-label="Right">${Characters.arrow('right')}</button>
        </div>
      </div>`;
    const arena = root.querySelector('#mg-arena');
    const playerEl = root.querySelector('#mg-catch-player');
    playerEl.style.left = '50%';

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>Caught ${score}</span><span>⏱️ ${left}</span>`;
    }

    function spawn() {
      if (!session || items.length >= 4) return;
      const roll = Math.random();
      const kind = roll < 0.18 ? 'goo' : roll < 0.55 ? 'star' : 'pet';
      const id = uid++;
      const petId = Characters.PET_IDS[Math.floor(Math.random() * Characters.PET_IDS.length)];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'mg-fall-item';
      if (kind === 'goo') el.innerHTML = Characters.goo('fall' + id);
      else if (kind === 'star') el.innerHTML = Characters.planet(id % 6, 'fall' + id);
      else el.innerHTML = Characters.pet(petId, 'fall' + id);
      const item = { id, kind, x: 12 + Math.random() * 76, y: -10, vy: 16 + Math.random() * 8, el };
      el.style.left = item.x + '%';
      el.style.top = item.y + '%';
      pointerTap(el, () => grab(item, true));
      arena.appendChild(el);
      items.push(item);
    }

    function grab(item, direct) {
      if (!item.el || !item.el.parentNode) return;
      if (!direct && Math.abs(item.x - x) > 14) return;
      if (direct) target = item.x;
      item.el.remove();
      item.el = null;
      if (item.kind === 'goo') {
        playSound('tap');
        cheer('Slippery goo! Cosmo giggles and keeps going!');
      } else {
        score += item.kind === 'pet' ? 2 : 1;
        playSound('correct');
        cheer(item.kind === 'pet' ? 'Pet hug!' : 'Star catch!');
      }
      paintHud();
    }

    const down = { l: false, r: false };
    function bindHold(btn, side) {
      const on = e => { e.preventDefault(); down[side] = true; };
      const off = e => { e.preventDefault(); down[side] = false; };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointerleave', off);
      btn.addEventListener('pointercancel', off);
    }
    bindHold(root.querySelector('#mg-catch-l'), 'l');
    bindHold(root.querySelector('#mg-catch-r'), 'r');
    arena.addEventListener('pointerdown', e => {
      if (e.target.closest('.mg-fall-item') || e.target.closest('.mg-catch-controls')) return;
      const box = arena.getBoundingClientRect();
      target = ((e.clientX - box.left) / box.width) * 100;
    });

    sess.intervals.push(setInterval(spawn, 900));
    spawn();

    function tick(now) {
      if (!session) return;
      if (down.l) target -= 1.3;
      if (down.r) target += 1.3;
      target = Math.max(8, Math.min(92, target));
      x += (target - x) * 0.2;
      playerEl.style.left = x + '%';
      items.forEach(item => {
        if (!item.el) return;
        item.y += item.vy * 0.016;
        item.el.style.top = item.y + '%';
        if (item.y > 76 && item.y < 98 && Math.abs(item.x - x) < 14) grab(item, false);
        else if (item.y > 110) {
          item.el.remove();
          item.el = null;
        }
      });
      for (let i = items.length - 1; i >= 0; i--) if (!items[i].el) items.splice(i, 1);
      paintHud();
      if (now - t0 >= duration) {
        freeze(sess);
        const line = score ? `You caught ${score} treats!` : 'Cosmo loved zooming with you!';
        finishOverlay(root, 'comet-catch', 'Comet Catch', line, () => startCometCatch(root, hud));
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  function startCozyBase(root, hud) {
    beginSession();
    const placed = [];
    let selected = Characters.DECOR[0].id;
    hud.innerHTML = '<span>Tap a sticker, then tap the room</span>';

    function paint() {
      root.innerHTML = `
        <p class="mg-hint">Decorate the base. Every spot is a good spot!</p>
        <div class="mg-cheer" id="mg-cheer">${placed.length ? placed.length + ' cozy things!' : 'Make it cozy!'}</div>
        <div class="mg-arena mg-cozy" id="mg-arena">
          <div class="mg-room" id="mg-room">
            ${Characters.roomShell('cozy')}
            <div class="mg-placed">${placed.map(p => `<div class="mg-room-item" style="left:${p.x}%;top:${p.y}%">${Characters.decor(p.id)}</div>`).join('')}</div>
          </div>
          <div class="mg-tray">
            ${Characters.DECOR.map(d => `<button type="button" class="mg-tray-btn ${d.id === selected ? 'on' : ''}" data-decor="${d.id}">
              ${Characters.decor(d.id)}<span>${d.name}</span>
            </button>`).join('')}
          </div>
          <div class="mg-cozy-actions">
            <button type="button" class="btn btn-secondary" id="mg-undo">Undo</button>
            <button type="button" class="btn btn-primary" id="mg-done">All done!</button>
          </div>
        </div>`;
      const room = root.querySelector('#mg-room');
      root.querySelectorAll('[data-decor]').forEach(btn => {
        pointerTap(btn, () => {
          selected = btn.dataset.decor;
          playSound('tap');
          paint();
        });
      });
      room.addEventListener('pointerdown', e => {
        if (placed.length >= 14) {
          cheer('The base is wonderfully full!');
          return;
        }
        const box = room.getBoundingClientRect();
        const px = ((e.clientX - box.left) / box.width) * 100;
        const py = ((e.clientY - box.top) / box.height) * 100;
        placed.push({
          id: selected,
          x: Math.max(10, Math.min(90, px)),
          y: Math.max(16, Math.min(86, py)),
        });
        playSound('tap');
        paint();
        cheer('Looks cozy!');
      });
      root.querySelector('#mg-undo').addEventListener('click', () => {
        playSound('tap');
        if (!placed.length) {
          cheer('Nothing to undo — the room is a fresh start!');
          return;
        }
        placed.pop();
        paint();
      });
      root.querySelector('#mg-done').addEventListener('click', () => {
        const line = placed.length
          ? `You placed ${placed.length} cozy decorations!`
          : 'A quiet base is cozy too!';
        finishOverlay(root, 'cozy-base', 'Cozy Base', line, () => startCozyBase(root, hud));
      });
    }
    paint();
  }

  function startStarParade(root, hud) {
    const sess = beginSession();
    const duration = 36000;
    const t0 = performance.now();
    let score = 0;
    let uid = 1;
    const pals = [];
    const cast = [
      { kind: 'pet', id: 'spark-pup' },
      { kind: 'pet', id: 'moon-kit' },
      { kind: 'pet', id: 'dust-hopper' },
      { kind: 'pet', id: 'comet-fox' },
      { kind: 'pet', id: 'aurora-drake' },
      { kind: 'pet', id: 'nova-whale' },
      { kind: 'pet', id: 'prism-phoenix' },
      { kind: 'pet', id: 'eclipse-lynx' },
      { kind: 'dress', body: 'kid' },
      { kind: 'dress', body: 'pet' },
      { kind: 'dress', body: 'friend' },
      { kind: 'cosmo' },
    ];
    root.innerHTML = `
      <p class="mg-hint">Tap each pal as they parade by. A wave is plenty!</p>
      <div class="mg-cheer" id="mg-cheer">Parade time!</div>
      <div class="mg-arena mg-parade" id="mg-arena"></div>`;
    const arena = root.querySelector('#mg-arena');

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>Cheers ${score}</span><span>⏱️ ${left}</span>`;
    }

    function artFor(c, id) {
      if (c.kind === 'pet') return Characters.pet(c.id, 'par' + id);
      if (c.kind === 'cosmo') return mascotSVG('par' + id);
      return Characters.body(c.body, 'par' + id);
    }

    function spawn() {
      if (!session) return;
      const c = cast[Math.floor(Math.random() * cast.length)];
      const id = uid++;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'parade-pal';
      el.innerHTML = artFor(c, id);
      const pal = { x: -14, y: 22 + Math.random() * 52, vx: 14 + Math.random() * 8, cheered: false, el };
      el.style.top = pal.y + '%';
      el.style.left = pal.x + '%';
      pointerTap(el, () => {
        if (pal.cheered) return;
        pal.cheered = true;
        score += 1;
        el.classList.add('cheered');
        playSound('correct');
        cheer(['Yay!', 'Hello, pal!', 'Nice wave!'][score % 3]);
        paintHud();
      });
      arena.appendChild(el);
      pals.push(pal);
    }

    sess.intervals.push(setInterval(spawn, 1000));
    spawn();

    function tick(now) {
      if (!session) return;
      pals.forEach(p => {
        if (!p.el) return;
        p.x += p.vx * 0.016;
        p.el.style.left = p.x + '%';
        if (p.x > 118) {
          p.el.remove();
          p.el = null;
        }
      });
      paintHud();
      if (now - t0 >= duration) {
        freeze(sess);
        finishOverlay(root, 'star-parade', 'Star Parade', `You cheered ${score} pals!`, () => startStarParade(root, hud));
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
  }

  // Registry — add games here. Hub renders this list.
  const GAMES = [
    {
      id: 'steal-a-pet',
      title: 'Steal a Pet',
      emoji: '🐾',
      blurb: 'Sneak space pets home — hunt sparkly legendaries at Nova Nest!',
      unlockStars: 8,
      start: startStealAPet,
    },
    {
      id: 'planet-pop',
      title: 'Zoom Zoom Planet Pop',
      emoji: '🪐',
      blurb: 'Pop zooming planets for silly combos.',
      unlockStars: 12,
      start: startPlanetPop,
    },
    {
      id: 'purple-blip',
      title: 'Purple Blip Tap',
      emoji: '👾',
      blurb: 'Only tap the purple alien. That’s it!',
      unlockStars: 18,
      start: startPurpleBlip,
    },
    {
      id: 'dress-up',
      title: 'Cosmo Dress-Up',
      emoji: '👗',
      blurb: 'Pick Cosmo, Starlet, Nibble or Boop and dress them up!',
      unlockStars: 22,
      start: startDressUp,
    },
    {
      id: 'pet-picnic',
      title: 'Pet Picnic',
      emoji: '🍓',
      blurb: 'Feed hungry space pals the snack they dreamed about.',
      unlockStars: 36,
      start: startPetPicnic,
    },
    {
      id: 'wiggle-walk',
      title: 'Wiggle Walk',
      emoji: '〰️',
      blurb: 'Steer Cosmo along a wiggly coin path.',
      unlockStars: 55,
      start: startWiggleWalk,
    },
    {
      id: 'memory-stars',
      title: 'Memory Stars',
      emoji: '🃏',
      blurb: 'Flip cards and match Cosmo’s pals.',
      unlockStars: 78,
      start: startMemoryStars,
    },
    {
      id: 'moon-boing',
      title: 'Moon Boing',
      emoji: '🌕',
      blurb: 'Tap when the moon boings through the hoop.',
      unlockStars: 90,
      start: startMoonBoing,
    },
    {
      id: 'comet-catch',
      title: 'Comet Catch',
      emoji: '☄️',
      blurb: 'Help Cosmo catch falling stars and pets.',
      unlockStars: 145,
      start: startCometCatch,
    },
    {
      id: 'cozy-base',
      title: 'Cozy Base',
      emoji: '🏠',
      blurb: 'Decorate a starry base with stickers.',
      unlockStars: 200,
      start: startCozyBase,
    },
    {
      id: 'star-parade',
      title: 'Star Parade',
      emoji: '🎉',
      blurb: 'Wave at pals as they parade across the sky.',
      unlockStars: 270,
      start: startStarParade,
    },
  ];

  function renderHub() {
    const grid = document.getElementById('minigame-grid');
    const starsEl = document.getElementById('minigames-stars');
    const stars = totalStars();
    if (starsEl) starsEl.textContent = `🌟 ${stars} stars earned`;
    if (!grid) return;
    grid.innerHTML = '';
    GAMES.forEach(game => {
      const open = isUnlocked(game);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'minigame-card glass-panel' + (open ? '' : ' locked');
      btn.innerHTML = `
        <span class="minigame-emoji">${open ? Characters.gameBadge(game.id) : Characters.lock()}</span>
        <span class="minigame-title">${game.title}</span>
        <span class="minigame-blurb">${open ? game.blurb : 'Earn ' + game.unlockStars + ' stars to unlock'}</span>
        <span class="minigame-req">${open ? 'Play!' : game.unlockStars + ' ⭐'}</span>
      `;
      btn.addEventListener('click', () => {
        playSound('tap');
        if (!open) {
          const need = Math.max(0, game.unlockStars - stars);
          const msg = document.getElementById('minigames-lock-msg');
          if (msg) {
            msg.textContent = `Almost! ${need} more star${need === 1 ? '' : 's'} to unlock ${game.title}. Keep playing planets!`;
            msg.classList.remove('hidden');
          }
          playSound('warning');
          return;
        }
        launch(game);
      });
      grid.appendChild(btn);
    });
  }

  function launch(game) {
    stop();
    const title = document.getElementById('mg-play-title');
    if (title) title.innerHTML = `<span class="mg-title-art">${Characters.gameBadge(game.id)}</span> ${game.title}`;
    const hud = document.getElementById('mg-play-hud');
    const root = document.getElementById('mg-play-root');
    if (hud) hud.innerHTML = '';
    if (root) root.innerHTML = '';
    showScreen('screen-minigame-play');
    game.start(root, hud);
  }

  function openHub() {
    stop();
    if (typeof stopConfetti === 'function') stopConfetti();
    renderHub();
    showScreen('screen-minigames');
  }

  function bindHub() {
    if (hubBound) return;
    hubBound = true;
    const openers = ['btn-minigames', 'minigames-teaser'];
    openers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { playSound('tap'); openHub(); });
    });
    const back = document.getElementById('btn-minigames-back');
    if (back) back.addEventListener('click', () => {
      playSound('tap');
      showScreen('screen-galaxy');
    });
    const exit = document.getElementById('btn-minigame-exit');
    if (exit) exit.addEventListener('click', () => {
      playSound('tap');
      openHub();
    });
  }

  function init() {
    bindHub();
    renderGalaxyCosmo();
  }

  return { init, stop, openHub, renderHub, renderGalaxyCosmo, GAMES };
})();
