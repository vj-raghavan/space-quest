// --- Space Quest — Mini Games arcade ---
// Star-gated silly rewards. Unlock is a threshold on lifetime planet
// stars (Progression.getStats().totalStars) — stars are never spent.
// Add a game: push an entry onto GAMES with { id, title, emoji, blurb,
// unlockStars, start(root, hud) }. start() should use beginSession() so
// MiniGames.stop() can cancel RAF/timers when the kid leaves.

const MiniGames = (() => {
  const DRESS_KEY = 'space_quest_dressup_v1';

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
  ];

  const OUTFITS = [
    { id: 'none', emoji: '🛸', name: 'Just Cosmo', unlockStars: 0 },
    { id: 'cape', emoji: '🦸', name: 'Sparkle cape', unlockStars: 0 },
    { id: 'tutu', emoji: '🩰', name: 'Star tutu', unlockStars: 15 },
    { id: 'stripes', emoji: '🎽', name: 'Zoom stripes', unlockStars: 25 },
    { id: 'pack', emoji: '🎒', name: 'Rocket pack', unlockStars: 30 },
  ];

  const EXTRAS = [
    { id: 'none', emoji: '🙂', name: 'Plain', unlockStars: 0 },
    { id: 'shades', emoji: '🕶️', name: 'Cool shades', unlockStars: 0 },
    { id: 'bow', emoji: '🎀', name: 'Bow-wow', unlockStars: 12 },
    { id: 'stache', emoji: '🥸', name: 'Silly stache', unlockStars: 18 },
    { id: 'sparkle', emoji: '✨', name: 'Sparkles', unlockStars: 28 },
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

  // Original Cosmo-style space pets (inline SVG). Not Pokémon, not
  // Roblox, not any licensed critter — just wholesome squishy friends.
  function spacePetArt(kind) {
    const art = {
      nebu: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="38" rx="20" ry="17" fill="#b8a6ff"/><ellipse cx="32" cy="44" rx="12" ry="8" fill="#e8e0ff"/><circle cx="32" cy="14" r="4" fill="#9ae6c8"/><rect x="30" y="16" width="4" height="10" rx="2" fill="#9ae6c8"/><circle cx="24" cy="34" r="4.2" fill="#1e2240"/><circle cx="40" cy="34" r="4.2" fill="#1e2240"/><circle cx="25.2" cy="32.6" r="1.4" fill="#fff"/><circle cx="41.2" cy="32.6" r="1.4" fill="#fff"/><path d="M26 44 q6 6 12 0" fill="none" stroke="#6b5cad" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="42" r="3.2" fill="#ff9ecf"/><circle cx="46" cy="42" r="3.2" fill="#ff9ecf"/></svg>`,
      cometpup: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="18" cy="44" rx="8" ry="5" fill="#ffd28a" transform="rotate(-18 18 44)"/><ellipse cx="34" cy="38" rx="18" ry="15" fill="#ffb066"/><ellipse cx="36" cy="44" rx="10" ry="7" fill="#ffe0c2"/><path d="M18 24 q-6 -14 2 -18 q4 8 10 12" fill="#ff9a3d"/><path d="M42 22 q8 -16 16 -8 q-8 6 -10 16" fill="#ff9a3d"/><circle cx="28" cy="36" r="4" fill="#1e2240"/><circle cx="40" cy="36" r="4" fill="#1e2240"/><circle cx="29.2" cy="34.6" r="1.3" fill="#fff"/><circle cx="41.2" cy="34.6" r="1.3" fill="#fff"/><ellipse cx="34" cy="42" rx="3" ry="2.2" fill="#ff8a6a"/><path d="M28 48 q6 5 12 0" fill="none" stroke="#c46a2e" stroke-width="2" stroke-linecap="round"/></svg>`,
      glowbun: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="22" cy="16" rx="6" ry="14" fill="#c9b6ff"/><ellipse cx="42" cy="16" rx="6" ry="14" fill="#c9b6ff"/><ellipse cx="22" cy="18" rx="3" ry="9" fill="#ffe3f2"/><ellipse cx="42" cy="18" rx="3" ry="9" fill="#ffe3f2"/><ellipse cx="32" cy="40" rx="19" ry="16" fill="#d8ccff"/><ellipse cx="32" cy="46" rx="11" ry="7" fill="#f4eeff"/><circle cx="25" cy="38" r="4" fill="#1e2240"/><circle cx="39" cy="38" r="4" fill="#1e2240"/><circle cx="26.3" cy="36.6" r="1.3" fill="#fff"/><circle cx="40.3" cy="36.6" r="1.3" fill="#fff"/><path d="M27 48 q6 5 12 0" fill="none" stroke="#8a7bc4" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="46" r="3" fill="#bfe3ff"/></svg>`,
      zipfin: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 34 q8 -16 24 -16 q16 0 22 14 q-8 4 -8 8 q0 4 8 8 q-6 12 -22 12 q-16 0 -24 -14 z" fill="#6bd6d0"/><ellipse cx="34" cy="36" rx="10" ry="8" fill="#c6f3f0"/><path d="M12 22 l8 10 l-12 2 z" fill="#8fd0ff"/><path d="M12 46 l8 -8 l-12 -2 z" fill="#8fd0ff"/><circle cx="40" cy="32" r="4.4" fill="#1e2240"/><circle cx="41.4" cy="30.8" r="1.4" fill="#fff"/><path d="M48 36 q6 2 12 0 q-4 6 -12 6 z" fill="#ffd76b"/><circle cx="26" cy="34" r="2" fill="#fff" opacity=".55"/></svg>`,
      pufforb: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="34" r="14" fill="#bfe3ff"/><circle cx="42" cy="34" r="14" fill="#bfe3ff"/><circle cx="32" cy="24" r="13" fill="#eef8ff"/><circle cx="32" cy="40" r="15" fill="#d7efff"/><circle cx="24" cy="36" r="4" fill="#1e2240"/><circle cx="40" cy="36" r="4" fill="#1e2240"/><circle cx="25.3" cy="34.6" r="1.3" fill="#fff"/><circle cx="41.3" cy="34.6" r="1.3" fill="#fff"/><path d="M26 46 q8 6 12 0" fill="none" stroke="#6aa8c9" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="42" r="3" fill="#ffb3c1"/><circle cx="46" cy="42" r="3" fill="#ffb3c1"/></svg>`,
      mochi: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="38" rx="21" ry="18" fill="#ff9ecf"/><ellipse cx="32" cy="44" rx="12" ry="8" fill="#ffdcef"/><path d="M18 22 q2 -12 10 -10 q2 8 -2 14" fill="#ff8fb3"/><path d="M46 22 q-2 -12 -10 -10 q-2 8 2 14" fill="#ff8fb3"/><circle cx="24" cy="36" r="4.2" fill="#1e2240"/><circle cx="40" cy="36" r="4.2" fill="#1e2240"/><circle cx="25.3" cy="34.6" r="1.3" fill="#fff"/><circle cx="41.3" cy="34.6" r="1.3" fill="#fff"/><path d="M26 46 q6 6 12 0" fill="none" stroke="#d46a9a" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="40" r="3" fill="#fff0b8"/><circle cx="48" cy="40" r="3" fill="#fff0b8"/></svg>`,
    };
    return art[kind] || art.nebu;
  }

  function startStealAPet(root, hud) {
    const sess = beginSession();
    const duration = 40000;
    let score = 0;
    let combo = 0;
    const t0 = performance.now();
    const pets = [
      { kind: 'nebu', name: 'Nebu', pts: 1, line: 'Got Nebu! 💜' },
      { kind: 'cometpup', name: 'Cometpup', pts: 1, line: 'Cometpup zoom! 🐾' },
      { kind: 'glowbun', name: 'Glowbun', pts: 1, line: 'Glowbun hug! 🌙' },
      { kind: 'zipfin', name: 'Zipfin', pts: 2, line: 'Zipfin splash! 🫧' },
      { kind: 'pufforb', name: 'Pufforb', pts: 1, line: 'Pufforb snuggle! ☁️' },
      { kind: 'mochi', name: 'Mochi', pts: 2, line: 'Mochi bounce! 🎀' },
    ];
    root.innerHTML = `
      <p class="mg-hint">Grab the falling space pets! Skip the sleepy pebbles 🪨</p>
      <div class="mg-cheer" id="mg-cheer">Steal a pet — gently!</div>
      <div class="mg-arena" id="mg-arena"></div>
    `;
    const arena = root.querySelector('#mg-arena');
    const bits = [];

    function spawn() {
      if (!session) return;
      const isRock = Math.random() > 0.84;
      const pet = pets[Math.floor(Math.random() * pets.length)];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'mg-fall ' + (isRock ? 'rock' : 'pet');
      el.setAttribute('aria-label', isRock ? 'Sleepy pebble' : pet.name);
      if (isRock) {
        el.textContent = '🪨';
      } else {
        el.innerHTML = spacePetArt(pet.kind);
      }
      el.style.left = (8 + Math.random() * 78) + '%';
      el.style.top = '-12%';
      const item = { el, isRock, pet, y: -12, vy: 18 + Math.random() * 22 };
      pointerTap(el, () => {
        if (!session) return;
        if (isRock) {
          combo = 0;
          cheer('Sleepy pebble! Pets are fluffier 🐾', false);
          playSound('wrong');
        } else {
          combo += 1;
          score += pet.pts + Math.min(combo, 8);
          playSound('correct');
          cheer((combo > 3 ? 'COMBO x' + combo + '! ' : '') + pet.line);
        }
        el.remove();
        const idx = bits.indexOf(item);
        if (idx >= 0) bits.splice(idx, 1);
        paintHud();
      });
      arena.appendChild(el);
      bits.push(item);
    }

    function paintHud() {
      const left = Math.max(0, Math.ceil((duration - (performance.now() - t0)) / 1000));
      hud.innerHTML = `<span>🐾 ${score}</span><span>⏱️ ${left}</span>`;
    }

    sess.intervals.push(setInterval(spawn, 500));
    spawn(); spawn();

    function tick(now) {
      if (!session) return;
      const elapsed = now - t0;
      bits.forEach(item => {
        item.y += item.vy * 0.016;
        item.el.style.top = item.y + '%';
      });
      for (let i = bits.length - 1; i >= 0; i--) {
        if (bits[i].y > 110) {
          bits[i].el.remove();
          bits.splice(i, 1);
        }
      }
      paintHud();
      if (elapsed >= duration) {
        freeze(sess);
        bits.forEach(b => b.el.remove());
        // Keep shipped id so dailyPlays['minigame:star-stealer'] still counts.
        finishOverlay(root, 'star-stealer', 'Steal a Pet', `You snatched ${score} pet points!`, () => {
          startStealAPet(root, hud);
        });
        return;
      }
      session.raf = requestAnimationFrame(tick);
    }
    sess.raf = requestAnimationFrame(tick);
    sess.cleanup = () => bits.forEach(b => b.el.remove());
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
      // Display name is Steal a Pet. Internal id stays star-stealer so
      // already-shipped anti-farm keys (minigame:star-stealer) stay valid.
      id: 'star-stealer',
      title: 'Steal a Pet',
      emoji: '🐾',
      blurb: 'Catch cute space pets in a silly rush!',
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
      unlockStars: 35,
      start: startWiggleWalk,
    },
    {
      id: 'moon-boing',
      title: 'Moon Boing',
      emoji: '🌕',
      blurb: 'Tap when the moon boings through the hoop.',
      unlockStars: 48,
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
