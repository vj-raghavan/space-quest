// --- Space Quest — Mini Games arcade ---
// Star-gated silly rewards. Unlock is a threshold on lifetime planet
// stars (Progression.getStats().totalStars) — stars are never spent.
// Add a game: push an entry onto GAMES with { id, title, emoji, blurb,
// unlockStars, start(root, hud) }. start() should use beginSession() so
// MiniGames.stop() can cancel RAF/timers when the kid leaves.

const MiniGames = (() => {
  const DRESS_KEY = 'space_quest_dressup_v1';
  const STEAL_KEY = 'space_quest_steal_pet_v1';

  const COLORS = [
    { id: 'mint', label: 'Mint', hue: 0 },
    { id: 'blush', label: 'Blush', hue: 300 },
    { id: 'sky', label: 'Sky', hue: 155 },
    { id: 'sunny', label: 'Sunny', hue: 42 },
    { id: 'grape', label: 'Grape', hue: 248 },
    { id: 'lava', label: 'Lava', hue: 332 },
  ];

  const HATS = [
    { id: 'none', emoji: '✨', name: 'No hat', unlockStars: 0 },
    { id: 'beanie', emoji: '🎩', name: 'Star hat', unlockStars: 0 },
    { id: 'helm', emoji: '⛑️', name: 'Moon helm', unlockStars: 10 },
    { id: 'prop', emoji: '🚁', name: 'Whirly', unlockStars: 16 },
    { id: 'flower', emoji: '🌸', name: 'Bloom', unlockStars: 22 },
    { id: 'crown', emoji: '👑', name: 'Star crown', unlockStars: 40 },
    { id: 'comet', emoji: '☄️', name: 'Comet cap', unlockStars: 80 },
    { id: 'nova', emoji: '🌟', name: 'Nova halo', unlockStars: 140 },
  ];

  const OUTFITS = [
    { id: 'none', emoji: '🛸', name: 'Just Cosmo', unlockStars: 0 },
    { id: 'cape', emoji: '🦸', name: 'Sparkle cape', unlockStars: 0 },
    { id: 'tutu', emoji: '🩰', name: 'Star tutu', unlockStars: 15 },
    { id: 'stripes', emoji: '🎽', name: 'Zoom stripes', unlockStars: 25 },
    { id: 'pack', emoji: '🎒', name: 'Rocket pack', unlockStars: 30 },
    { id: 'cape2', emoji: '🌈', name: 'Rainbow trail', unlockStars: 120 },
  ];

  const EXTRAS = [
    { id: 'none', emoji: '🙂', name: 'Plain', unlockStars: 0 },
    { id: 'shades', emoji: '🕶️', name: 'Cool shades', unlockStars: 0 },
    { id: 'bow', emoji: '🎀', name: 'Bow-wow', unlockStars: 12 },
    { id: 'stache', emoji: '🥸', name: 'Silly stache', unlockStars: 18 },
    { id: 'sparkle', emoji: '✨', name: 'Sparkles', unlockStars: 28 },
    { id: 'glitter', emoji: '💖', name: 'Heart glitter', unlockStars: 180 },
  ];

  const DEFAULT_LOOK = { color: 'mint', hat: 'none', outfit: 'cape', extra: 'none' };

  let session = null;
  let hubBound = false;

  function totalStars() {
    if (typeof Progression !== 'undefined' && Progression.getStats) {
      return Progression.getStats().totalStars || 0;
    }
    return 0;
  }

  function isUnlocked(game) {
    return totalStars() >= (game.unlockStars || 0);
  }

  function loadDress() {
    try {
      const raw = localStorage.getItem(Players.key(DRESS_KEY));
      if (raw) return { ...DEFAULT_LOOK, ...JSON.parse(raw) };
    } catch (e) { /* defaults */ }
    return { ...DEFAULT_LOOK };
  }

  function saveDress(look) {
    localStorage.setItem(Players.key(DRESS_KEY), JSON.stringify(look));
  }

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

  function dressedStage(uid, look, sizeClass) {
    const color = COLORS.find(c => c.id === look.color) || COLORS[0];
    const hat = HATS.find(h => h.id === look.hat) || HATS[0];
    const outfit = OUTFITS.find(o => o.id === look.outfit) || OUTFITS[0];
    const extra = EXTRAS.find(x => x.id === look.extra) || EXTRAS[0];
    const svg = (typeof mascotSVG === 'function') ? mascotSVG(uid) : '';
    return `
      <div class="cosmo-dress-stage ${sizeClass || ''}">
        <div class="cosmo-dress-body" style="filter:hue-rotate(${color.hue}deg)">
          <div class="mascot-svg">${svg}</div>
        </div>
        <div class="cosmo-overlays" aria-hidden="true">
          ${outfit.id !== 'none' ? `<span class="dress-piece dress-outfit dress-outfit-${outfit.id}">${outfit.emoji}</span>` : ''}
          ${hat.id !== 'none' ? `<span class="dress-piece dress-hat dress-hat-${hat.id}">${hat.emoji}</span>` : ''}
          ${extra.id !== 'none' ? `<span class="dress-piece dress-extra dress-extra-${extra.id}">${extra.emoji}</span>` : ''}
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
    const hue = def.hue || '#ffd25a';
    if (def.rarity !== 'legendary') {
      return `<span class="sap-pet-emoji">${def.emoji}</span>`;
    }
    const uid = 'sap' + String(mark || def.id).replace(/[^a-z0-9]/g, '');
    return `<span class="sap-pet-art" aria-hidden="true">${legendarySvg(def.id, hue, uid)}</span>`;
  }

  function legendarySvg(id, hue, uid) {
    const g1 = uid + 'a';
    const g2 = uid + 'b';
    if (id === 'nova-whale') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c084fc"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient></defs><ellipse cx="32" cy="36" rx="22" ry="12" fill="url(#${g1})"/><path d="M50 32c6 2 10-4 12-8-8 1-12 6-12 10z" fill="#a78bfa"/><circle cx="20" cy="34" r="2.2" fill="#1e1b4b"/><path d="M14 38c-6 4-8 10-4 12 6-2 10-6 12-10" fill="#ddd6fe"/></svg>`;
    }
    if (id === 'prism-phoenix') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><path d="M32 14c8 6 18 8 22 4-2 10-10 16-18 18 8 2 14 10 16 18-12-6-20-8-22-8s-10 2-22 8c2-8 8-16 16-18-8-2-16-8-18-18 4 4 14 2 22-4z" fill="${hue}"/><circle cx="32" cy="30" r="7" fill="#ffe29a"/><circle cx="30" cy="29" r="1.4" fill="#3b1d0b"/><circle cx="35" cy="29" r="1.4" fill="#3b1d0b"/></svg>`;
    }
    if (id === 'lunar-unicorn') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><path d="M32 10l4 14h-8z" fill="#fde68a"/><ellipse cx="34" cy="36" rx="16" ry="14" fill="${hue}"/><circle cx="24" cy="28" r="8" fill="#f5d0fe"/><circle cx="21" cy="26" r="1.6" fill="#3b0764"/><path d="M18 22c-6-8 2-14 8-10" fill="#c084fc"/><path d="M40 28c8-2 16 6 12 12" stroke="#fff" stroke-width="3" fill="none"/></svg>`;
    }
    if (id === 'galaxy-panda') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><circle cx="32" cy="34" r="16" fill="#e0e7ff"/><circle cx="22" cy="22" r="7" fill="#312e81"/><circle cx="42" cy="22" r="7" fill="#312e81"/><circle cx="26" cy="32" r="4" fill="#1e1b4b"/><circle cx="38" cy="32" r="4" fill="#1e1b4b"/><circle cx="27" cy="31" r="1.4" fill="#fff"/><circle cx="39" cy="31" r="1.4" fill="#fff"/><ellipse cx="32" cy="42" rx="5" ry="3" fill="#4338ca"/><circle cx="18" cy="16" r="1.5" fill="#fde68a"/><circle cx="48" cy="14" r="1.2" fill="#fde68a"/></svg>`;
    }
    if (id === 'comet-axolotl') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><ellipse cx="32" cy="36" rx="16" ry="12" fill="${hue}"/><path d="M16 24c-8-8 2-16 10-8M48 24c8-8-2-16-10-8M14 40c-10 2-10 14-2 12M50 40c10 2 10 14 2 12" fill="#fb7185"/><circle cx="26" cy="34" r="2" fill="#4c0519"/><circle cx="38" cy="34" r="2" fill="#4c0519"/><path d="M44 20l14-8-4 12" fill="#fde68a"/></svg>`;
    }
    if (id === 'eclipse-lynx') {
      return `<svg viewBox="0 0 64 64" class="sap-svg"><ellipse cx="34" cy="38" rx="16" ry="13" fill="${hue}"/><path d="M20 22l-6-12 12 6M44 20l8-12-4 14" fill="#6b21a8"/><circle cx="26" cy="34" r="3" fill="#1e1b4b"/><circle cx="27" cy="33" r="1" fill="#fde68a"/><path d="M40 18c8 0 14 8 10 14" fill="#c4b5fd"/><circle cx="48" cy="14" r="6" fill="#fef3c7" opacity=".85"/></svg>`;
    }
    // Aurora Drake default
    return `<svg viewBox="0 0 64 64" class="sap-svg"><defs><linearGradient id="${g2}" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffd25a"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs><path d="M18 40c2-16 14-24 28-22 2 8-2 16-10 20 10 0 16 6 18 14-16-4-24-2-28 2-2-6-6-10-8-14z" fill="url(#${g2})"/><circle cx="40" cy="26" r="2" fill="#1e1b4b"/><path d="M48 22l10-6-2 10" fill="#fb7185"/></svg>`;
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
      { id: 0, name: 'Crater Keep', emoji: '🧡', x: 16, y: 18, color: '#ff8a5b' },
      { id: 1, name: 'Ring Ranch', emoji: '💜', x: 84, y: 18, color: '#b56bff' },
      { id: 2, name: 'Goo Grove', emoji: '💚', x: 14, y: 48, color: '#3cc9a0' },
      { id: 3, name: 'Nova Nest', emoji: '💛', x: 86, y: 48, color: '#ffd25a' },
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
      const inward = rival.x < 50 ? (legendary ? 6 : 14) : (legendary ? -6 : -14);
      const down = legendary ? 5 : 14;
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
      const load = carryingLegendary() ? 0.32 : 0.52;
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
      el.innerHTML = `<span class="sap-base-name">${b.emoji} ${b.name}</span>`;
      el.style.setProperty('--base', b.color);
      arena.appendChild(el);
    });
    const homeEl = document.createElement('div');
    homeEl.className = 'sap-base sap-home';
    homeEl.id = 'sap-home';
    homeEl.innerHTML = '<span class="sap-base-name">🏠 Your Base</span><div class="sap-home-pets" id="sap-home-pets"></div>';
    arena.appendChild(homeEl);
    goos.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = 'sap-goo';
      el.textContent = '🟢';
      el.dataset.goo = String(i);
      arena.appendChild(el);
    });
    guards.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = 'sap-guard' + (g.rivalId === NOVA_NEST_ID ? ' sap-guard-nova' : '');
      el.dataset.guard = String(i);
      el.textContent = g.rivalId === NOVA_NEST_ID ? '🌟' : '🛡️';
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
    stick.innerHTML = '<div class="sap-stick-knob" id="sap-stick-knob"></div>';
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
      const lockMark = gateShut && pet.awake ? '<span class="sap-gate">🔒</span>' : (sleepy ? '<span class="sap-gate">✨</span>' : '');
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
      stack.innerHTML = carried.map(p =>
        `<span class="sap-carry-chip r-${p.def.rarity}">${p.def.rarity === 'legendary' ? '⭐' : ''}${p.def.emoji}</span>`
      ).join('');
      const homePets = homeEl.querySelector('#sap-home-pets');
      homePets.innerHTML = collection.map(p =>
        `<span class="sap-home-chip r-${p.def.rarity}" title="${p.def.name}">${p.def.rarity === 'legendary' ? '⭐' : ''}${p.def.emoji}</span>`
      ).join('');
      playerEl.classList.toggle('carrying', carried.length > 0);
      playerEl.classList.toggle('carrying-legendary', carryingLegendary());
      playerEl.classList.toggle('stunned', performance.now() < stunUntil);
      arena.classList.toggle('sap-alerting', performance.now() < alertUntil);
      const nova = arena.querySelector(`[data-rival="${NOVA_NEST_ID}"]`);
      if (nova) nova.classList.toggle('sap-gate-shut', !nestGateOpen(performance.now()));
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

    function inHazard() {
      const gooHit = goos.some(g => dist(player, g) < 6.5);
      if (gooHit) return true;
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
      stealGraceUntil = performance.now() + (near.def.rarity === 'legendary' ? 420 : 700);
      if (near.def.rarity === 'legendary') {
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
          : 'Safe at base! ' + gained.map(p => p.def.emoji).join(' '));
      }
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
          p.awake = false;
          p.wakes = 0;
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
      const rec = loadStealBest();
      const legends = collection.filter(p => p.def.rarity === 'legendary').length;
      if (score > rec.bestScore) rec.bestScore = score;
      if (collection.length > rec.bestPets) rec.bestPets = collection.length;
      if (legends > rec.bestLegendary) rec.bestLegendary = legends;
      saveStealBest(rec);
      const n = collection.length;
      const petWord = n === 1 ? 'pet' : 'pets';
      const names = collection.map(p => p.def.emoji).join(' ') || 'none yet';
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
      let dx = (e.clientX - cx) / (box.width / 2);
      let dy = (e.clientY - cy) / (box.height / 2);
      const mag = Math.hypot(dx, dy) || 1;
      if (mag > 1) { dx /= mag; dy /= mag; }
      joy.x = dx;
      joy.y = dy;
      knob.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
    }
    function joyStart(e) {
      e.preventDefault();
      e.stopPropagation();
      joy.active = true;
      dest = null;
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
        const chasing = now < g.chase && carryingLegendary();
        if (chasing) {
          const dx = player.x - g.x;
          const dy = player.y - g.y;
          const m = Math.hypot(dx, dy) || 1;
          g.x += (dx / m) * 18 * dt;
          g.y += (dy / m) * 18 * dt;
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
        renderPets();
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
        dropSteal(goos.some(g => dist(player, g) < 6.5) ? 'goo' : 'guard');
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
    const faces = ['🪐', '🌍', '🌕', '🫧', '🟣', '🟡'];
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
      el.textContent = faces[Math.floor(Math.random() * faces.length)];
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
        el.style.background = pick.color;
        el.textContent = pick.emoji;
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
        <button type="button" class="mg-steer mg-steer-l" aria-label="Left">👈</button>
        <button type="button" class="mg-steer mg-steer-r" aria-label="Right">👉</button>
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
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪙', cx, cy);
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
        <div class="mg-hoop" id="mg-hoop">⭕</div>
        <button type="button" class="mg-moon" id="mg-moon">🌕</button>
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
    hud.innerHTML = '<span>👗 Mix & match!</span>';
    let look = loadDress();
    const stars = totalStars();
    let lastCheer = 'You look cosmic!';

    function locked(item) {
      return stars < item.unlockStars;
    }

    function paint() {
      root.innerHTML = `
        <div class="mg-cheer" id="mg-cheer">${lastCheer}</div>
        <div class="dress-layout">
          ${dressedStage('dressup', look, 'play-size')}
          <div class="dress-cols">
            ${section('Colour', COLORS.map(c => ({
              id: c.id, emoji: '●', name: c.label, unlockStars: 0, swatch: true, hue: c.hue
            })), 'color')}
            ${section('Hats', HATS, 'hat')}
            ${section('Outfits', OUTFITS, 'outfit')}
            ${section('Extras', EXTRAS, 'extra')}
          </div>
        </div>
        <p class="mg-hint">Looks save automatically. Cosmo wears this on the galaxy map!</p>
      `;
      root.querySelectorAll('[data-dress]').forEach(btn => {
        pointerTap(btn, () => {
          if (btn.classList.contains('locked')) {
            playSound('warning');
            cheer('Earn more stars to unlock this!', false);
            return;
          }
          const slot = btn.dataset.slot;
          look[slot] = btn.dataset.dress;
          saveDress(look);
          playSound('tap');
          lastCheer = 'Ooh fancy!';
          paint();
          renderGalaxyCosmo();
        });
      });
    }

    function section(title, items, slot) {
      const cells = items.map(item => {
        const isLock = locked(item);
        const on = look[slot] === item.id;
        const hueStyle = item.swatch ? `style="color:hsl(${(item.hue + 140) % 360} 70% 60%)"` : '';
        return `<button type="button" class="dress-item ${on ? 'on' : ''} ${isLock ? 'locked' : ''}"
          data-dress="${item.id}" data-slot="${slot}">
          <span class="dress-emoji" ${hueStyle}>${isLock ? '🔒' : item.emoji}</span>
          <span>${isLock ? item.unlockStars + '⭐' : item.name}</span>
        </button>`;
      }).join('');
      return `<div class="dress-section"><h3>${title}</h3><div class="dress-grid">${cells}</div></div>`;
    }

    paint();
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
      blurb: 'Hats, colours, and sparkly outfits.',
      unlockStars: 22,
      start: startDressUp,
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
      id: 'moon-boing',
      title: 'Moon Boing',
      emoji: '🌕',
      blurb: 'Tap when the moon boings through the hoop.',
      unlockStars: 90,
      start: startMoonBoing,
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
        <span class="minigame-emoji">${open ? game.emoji : '🔒'}</span>
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
    if (title) title.textContent = `${game.emoji} ${game.title}`;
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
