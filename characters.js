// --- Space Quest — original illustrated characters ---
// Hand-authored inline SVG. No photos, no emoji, no copied characters.
// Gradient ids include a uid because a duplicate id inside a hidden
// screen makes the paint disappear (same rule as mascotSVG).

const Characters = (() => {
  function clean(uid) {
    return String(uid || 'c').replace(/[^a-zA-Z0-9_-]/g, '') || 'c';
  }

  function svg(viewBox, label, inner, cls) {
    const aria = label
      ? `role="img" aria-label="${label}"`
      : 'aria-hidden="true"';
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" class="${cls || ''}" ${aria}>${inner}</svg>`;
  }

  function eye(x, y, r) {
    const ry = (r * 1.16).toFixed(2);
    const hx = (x + r * 0.32).toFixed(2);
    const hy = (y - r * 0.38).toFixed(2);
    const hr = (r * 0.34).toFixed(2);
    const sx = (x - r * 0.22).toFixed(2);
    const sy = (y + r * 0.32).toFixed(2);
    const sr = (r * 0.16).toFixed(2);
    return `<g class="m-eye"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="#1b1630"/><circle cx="${hx}" cy="${hy}" r="${hr}" fill="#fff"/><circle cx="${sx}" cy="${sy}" r="${sr}" fill="#b9e6ff"/></g>`;
  }

  function eyes(x1, x2, y, r) {
    return eye(x1, y, r) + eye(x2, y, r);
  }

  function blush(x1, x2, y, rx, ry) {
    return `<ellipse cx="${x1}" cy="${y}" rx="${rx || 5}" ry="${ry || 3}" fill="#ff8fab" opacity="0.72"/>
      <ellipse cx="${x2}" cy="${y}" rx="${rx || 5}" ry="${ry || 3}" fill="#ff8fab" opacity="0.72"/>`;
  }

  function smile(x, y, w) {
    return `<path d="M${x - w} ${y} Q${x} ${y + w * 0.65} ${x + w} ${y}" fill="none" stroke="#1b1630" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  function star(cx, cy, r, fill) {
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const b = a + Math.PI / 5;
      pts.push((cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1));
      pts.push((cx + Math.cos(b) * r * 0.42).toFixed(1) + ' ' + (cy + Math.sin(b) * r * 0.42).toFixed(1));
    }
    return `<path d="M${pts.join(' L')} Z" fill="${fill || '#ffd25a'}"/>`;
  }

  function gloss(cx, cy, rx, ry) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="0.3"/>`;
  }

  function sparkles() {
    return `<g class="char-spark">${star(14, 14, 3.6, '#fff6c2')}</g>
      <g class="char-spark d2">${star(66, 16, 2.8, '#fff')}</g>
      <g class="char-spark d3">${star(68, 62, 2.4, '#ffe29a')}</g>
      <circle class="char-spark" cx="12" cy="58" r="1.6" fill="#fff"/>`;
  }

  function aura(color) {
    return `<ellipse class="legend-aura" cx="40" cy="42" rx="34" ry="32" fill="${color}" opacity="0.42"/>`;
  }

  const INK = 'stroke="#241b3a" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"';

  // ---------- Steal a Pet portraits (big face, readable at token size) ----------

  function petSpark() {
    return `
      <ellipse cx="18" cy="40" rx="10" ry="14" fill="#5eb0ea" ${INK} transform="rotate(-24 18 40)"/>
      <ellipse cx="62" cy="40" rx="10" ry="14" fill="#5eb0ea" ${INK} transform="rotate(24 62 40)"/>
      <ellipse cx="18" cy="42" rx="5" ry="8" fill="#fde7c7"/>
      <ellipse cx="62" cy="42" rx="5" ry="8" fill="#fde7c7"/>
      <ellipse cx="40" cy="66" rx="18" ry="10" fill="#3b9de0" ${INK}/>
      <circle cx="40" cy="42" r="22" fill="#7ec8ff" ${INK}/>
      ${gloss(32, 30, 10, 6)}
      <ellipse cx="40" cy="50" rx="10" ry="7" fill="#fde7c7"/>
      ${star(40, 28, 5, '#ffd25a')}
      ${blush(24, 56, 48, 4, 2.4)}
      ${eyes(31, 49, 42, 5.2)}
      ${smile(40, 52, 6)}
      <path d="M40 54 q2.4 4.2 0 4.6 q-2.4 -0.4 0 -4.6" fill="#fb7185"/>`;
  }

  function petKit() {
    return `
      <path d="M18 36 L10 12 L30 30 Z" fill="#c4b5fd" ${INK}/>
      <path d="M62 36 L70 12 L50 30 Z" fill="#c4b5fd" ${INK}/>
      <path d="M20 32 L16 18 L28 30 Z" fill="#fbcfe8"/>
      <path d="M60 32 L64 18 L52 30 Z" fill="#fbcfe8"/>
      <path d="M58 62 q16 2 14 -12 q-8 2 -14 8" fill="#a78bfa" ${INK}/>
      <circle cx="40" cy="44" r="22" fill="#d4b8ff" ${INK}/>
      ${gloss(31, 32, 9, 5)}
      ${star(40, 26, 4, '#fef9c3')}
      <path d="M22 46 H12 M58 46 H68 M24 52 H14 M56 52 H66" stroke="#6b5a8e" stroke-width="1.4" stroke-linecap="round"/>
      ${blush(24, 56, 50, 4, 2.4)}
      ${eyes(31, 49, 42, 5.2)}
      <ellipse cx="40" cy="50" rx="3.2" ry="2.2" fill="#f9a8d4"/>
      ${smile(40, 54, 5)}`;
  }

  function petHopper() {
    return `
      <ellipse cx="24" cy="28" rx="7" ry="20" fill="#ffe29a" ${INK}/>
      <ellipse cx="56" cy="28" rx="7" ry="20" fill="#ffe29a" ${INK}/>
      <ellipse cx="24" cy="30" rx="3.2" ry="12" fill="#fecdd3"/>
      <ellipse cx="56" cy="30" rx="3.2" ry="12" fill="#fecdd3"/>
      <circle cx="40" cy="46" r="21" fill="#ffe7a8" ${INK}/>
      ${gloss(32, 36, 9, 5)}
      <circle cx="16" cy="18" r="1.4" fill="#fff" opacity="0.8"/>
      <circle cx="66" cy="22" r="1.2" fill="#fff" opacity="0.8"/>
      <circle cx="68" cy="40" r="1.3" fill="#fff6c2"/>
      ${blush(26, 54, 52, 4, 2.4)}
      ${eyes(31, 49, 44, 5)}
      <ellipse cx="40" cy="52" rx="3" ry="2" fill="#f9a8d4"/>
      ${smile(40, 56, 5)}
      <rect x="36" y="56" width="3" height="4" rx="1" fill="#fff"/>
      <rect x="41" y="56" width="3" height="4" rx="1" fill="#fff"/>`;
  }

  function petFox() {
    return `
      <path d="M14 58 Q4 70 18 66 Q20 58 14 58" fill="#fb923c" ${INK}/>
      <path d="M22 30 L12 8 L32 26 Z" fill="#ffb36b" ${INK}/>
      <path d="M58 30 L68 8 L48 26 Z" fill="#ffb36b" ${INK}/>
      <path d="M24 28 L18 14 L30 26 Z" fill="#fff7ed"/>
      <path d="M56 28 L62 14 L50 26 Z" fill="#fff7ed"/>
      <circle cx="40" cy="44" r="22" fill="#ffb36b" ${INK}/>
      ${gloss(31, 32, 9, 5)}
      <ellipse cx="40" cy="52" rx="10" ry="8" fill="#fff7ed"/>
      ${blush(25, 55, 50, 3.5, 2.2)}
      ${eyes(31, 49, 42, 5)}
      <ellipse cx="40" cy="50" rx="3" ry="2.2" fill="#1b1630"/>
      ${smile(40, 56, 5)}`;
  }

  function petOwl() {
    return `
      <ellipse cx="40" cy="44" rx="30" ry="18" fill="none" stroke="#fde68a" stroke-width="3" opacity="0.9"/>
      <ellipse cx="40" cy="44" rx="24" ry="13" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
      <path d="M22 28 L16 12 L30 24 Z" fill="#7dcebb" ${INK}/>
      <path d="M58 28 L64 12 L50 24 Z" fill="#7dcebb" ${INK}/>
      <circle cx="40" cy="46" r="22" fill="#9ad7c2" ${INK}/>
      ${gloss(30, 34, 8, 5)}
      <ellipse cx="40" cy="58" rx="10" ry="7" fill="#e7fff6"/>
      <circle cx="30" cy="44" r="8" fill="#fff" ${INK}/>
      <circle cx="50" cy="44" r="8" fill="#fff" ${INK}/>
      ${eye(30, 44, 4.2)}
      ${eye(50, 44, 4.2)}
      <path d="M40 50 L36 55 H44 Z" fill="#f59e0b" ${INK}/>
    `;
  }

  function petSeal() {
    return `
      <ellipse cx="16" cy="58" rx="8" ry="5" fill="#6ec8ff" ${INK} transform="rotate(-30 16 58)"/>
      <ellipse cx="64" cy="58" rx="8" ry="5" fill="#6ec8ff" ${INK} transform="rotate(30 64 58)"/>
      <ellipse cx="40" cy="46" rx="26" ry="22" fill="#8fd4ff" ${INK}/>
      ${gloss(30, 34, 10, 6)}
      <ellipse cx="40" cy="54" rx="12" ry="8" fill="#e0f4ff"/>
      ${star(54, 34, 3.4, '#fef9c3')}
      ${star(22, 36, 2.2, '#fff')}
      ${blush(24, 56, 50, 3.6, 2.2)}
      ${eyes(31, 49, 42, 5)}
      <ellipse cx="40" cy="50" rx="3.4" ry="2.2" fill="#1b1630"/>
      ${smile(40, 56, 6)}`;
  }

  function petSloth() {
    return `
      <path d="M12 46 q-6 16 4 20" fill="none" stroke="#ff9bb0" stroke-width="6" stroke-linecap="round"/>
      <path d="M68 46 q6 16 -4 20" fill="none" stroke="#ff9bb0" stroke-width="6" stroke-linecap="round"/>
      <circle cx="40" cy="44" r="22" fill="#ffb3c4" ${INK}/>
      <ellipse cx="30" cy="44" rx="8" ry="9" fill="#9f6070"/>
      <ellipse cx="50" cy="44" rx="8" ry="9" fill="#9f6070"/>
      ${gloss(32, 32, 8, 4)}
      ${star(40, 26, 4, '#ffd25a')}
      ${eyes(30, 50, 44, 4.4)}
      <ellipse cx="40" cy="52" rx="4" ry="3" fill="#9f6070"/>
      ${smile(40, 58, 5)}
      ${blush(20, 60, 52, 3, 2)}`;
  }

  function petDrake(uid) {
    const g = uid + 'dr';
    return `
      <defs><linearGradient id="${g}" x1="0" y1="1" x2="1" y2="0">
        <stop stop-color="#34d399"/><stop offset="0.55" stop-color="#fde68a"/><stop offset="1" stop-color="#67e8f9"/>
      </linearGradient></defs>
      <path d="M10 48 Q0 22 16 18 Q14 36 24 44 Z" fill="#6ee7b7" ${INK}/>
      <path d="M70 48 Q80 22 64 16 Q66 36 56 44 Z" fill="#fde68a" ${INK}/>
      <path d="M28 18 L24 4 L36 16 Z" fill="#ffd25a" ${INK}/>
      <path d="M52 18 L56 4 L44 16 Z" fill="#ffd25a" ${INK}/>
      <circle cx="40" cy="44" r="22" fill="url(#${g})" ${INK}/>
      ${gloss(30, 32, 9, 5)}
      <ellipse cx="40" cy="54" rx="10" ry="7" fill="#ecfdf5"/>
      ${eyes(31, 49, 42, 5.2)}
      <ellipse cx="36" cy="50" rx="1.3" ry="1" fill="#1b1630"/>
      <ellipse cx="44" cy="50" rx="1.3" ry="1" fill="#1b1630"/>
      ${smile(40, 56, 6)}
      <path d="M62 58 q10 6 4 10" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>`;
  }

  function petWhale(uid) {
    const g = uid + 'wh';
    return `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#c084fc"/><stop offset="1" stop-color="#7dd3fc"/>
      </linearGradient></defs>
      ${star(28, 12, 3.2, '#fff')}
      ${star(40, 6, 4, '#fef9c3')}
      ${star(52, 12, 3, '#fff')}
      <path d="M40 16 Q38 28 40 32" stroke="#e9d5ff" stroke-width="2" fill="none"/>
      <ellipse cx="14" cy="50" rx="8" ry="5" fill="#a78bfa" ${INK}/>
      <ellipse cx="66" cy="50" rx="8" ry="5" fill="#a78bfa" ${INK}/>
      <ellipse cx="40" cy="46" rx="26" ry="22" fill="url(#${g})" ${INK}/>
      ${gloss(28, 34, 10, 6)}
      <ellipse cx="40" cy="56" rx="12" ry="7" fill="#ede9fe"/>
      ${eyes(30, 50, 44, 5)}
      ${smile(40, 54, 8)}`;
  }

  function petPhoenix(uid) {
    const g = uid + 'ph';
    return `
      <defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0">
        <stop stop-color="#fb7185"/><stop offset="0.5" stop-color="#fdba74"/><stop offset="1" stop-color="#fde68a"/>
      </linearGradient></defs>
      <path d="M18 46 Q2 28 14 16 Q22 32 28 42 Z" fill="#fb7185" ${INK}/>
      <path d="M62 46 Q78 28 66 16 Q58 32 52 42 Z" fill="#fdba74" ${INK}/>
      <path d="M40 22 L32 4 L40 14 L48 4 Z" fill="#fde68a" ${INK}/>
      <circle cx="40" cy="44" r="21" fill="url(#${g})" ${INK}/>
      ${gloss(31, 34, 8, 5)}
      ${eyes(31, 49, 42, 5)}
      <path d="M40 50 L35 55 H45 Z" fill="#f59e0b" ${INK}/>
      ${smile(40, 58, 5)}`;
  }

  function petUnicorn() {
    return `
      <path d="M22 36 Q8 28 16 18 Q28 30 30 40" fill="#f9a8d4" ${INK}/>
      <path d="M40 24 L36 2 L46 20 Z" fill="#fef9c3" ${INK}/>
      <path d="M40 20 Q44 8 42 2" fill="none" stroke="#f0abfc" stroke-width="2"/>
      <path d="M24 24 L18 10 L32 22 Z" fill="#fbcfe8" ${INK}/>
      <path d="M56 24 L62 10 L48 22 Z" fill="#fbcfe8" ${INK}/>
      <circle cx="40" cy="46" r="22" fill="#f5d0fe" ${INK}/>
      ${gloss(30, 34, 9, 5)}
      <ellipse cx="40" cy="54" rx="10" ry="7" fill="#fff"/>
      ${eyes(31, 49, 44, 5.2)}
      <ellipse cx="40" cy="52" rx="2.6" ry="1.8" fill="#f9a8d4"/>
      ${smile(40, 58, 5)}`;
  }

  function petPanda() {
    return `
      <circle cx="20" cy="24" r="9" fill="#312e81" ${INK}/>
      <circle cx="60" cy="24" r="9" fill="#312e81" ${INK}/>
      <circle cx="40" cy="46" r="23" fill="#e0e7ff" ${INK}/>
      ${gloss(30, 34, 9, 5)}
      <ellipse cx="29" cy="46" rx="8" ry="9" fill="#3730a3"/>
      <ellipse cx="51" cy="46" rx="8" ry="9" fill="#3730a3"/>
      ${eye(29, 46, 4)}
      ${eye(51, 46, 4)}
      <ellipse cx="40" cy="56" rx="5" ry="3.4" fill="#312e81"/>
      ${smile(40, 62, 5)}
      ${star(40, 28, 3.4, '#fde68a')}
      <circle cx="58" cy="34" r="1.3" fill="#fde68a"/>
      <circle cx="18" cy="40" r="1.1" fill="#fff"/>`;
  }

  function petAxolotl() {
    return `
      <path d="M8 36 q8 -16 14 -4" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
      <path d="M10 44 q6 -8 12 0" fill="none" stroke="#fda4af" stroke-width="4" stroke-linecap="round"/>
      <path d="M12 52 q8 -6 10 4" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
      <path d="M72 36 q-8 -16 -14 -4" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 44 q-6 -8 -12 0" fill="none" stroke="#fda4af" stroke-width="4" stroke-linecap="round"/>
      <path d="M68 52 q-8 -6 -10 4" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
      <path d="M62 64 L76 58 L70 72 Z" fill="#fde68a" ${INK}/>
      <ellipse cx="40" cy="46" rx="22" ry="20" fill="#fecdd3" ${INK}/>
      ${gloss(30, 36, 8, 5)}
      ${eyes(31, 49, 44, 5)}
      ${smile(40, 54, 8)}
      <ellipse cx="40" cy="50" rx="3" ry="2" fill="#fb7185"/>`;
  }

  function petLynx() {
    return `
      <path d="M22 30 L14 6 L32 24 Z" fill="#d8b4fe" ${INK}/>
      <path d="M58 30 L66 6 L48 24 Z" fill="#d8b4fe" ${INK}/>
      <circle cx="22" cy="16" r="3.2" fill="#f5d0fe" ${INK}/>
      <circle cx="58" cy="16" r="3.2" fill="#f5d0fe" ${INK}/>
      <circle cx="40" cy="46" r="22" fill="#e9d5ff" ${INK}/>
      ${gloss(30, 34, 9, 5)}
      <circle cx="40" cy="28" r="6" fill="#fef3c7" ${INK}/>
      <path d="M40 24 a4 4 0 0 0 0 8 a3 3 0 0 1 0 -8" fill="#1b1630"/>
      ${blush(24, 56, 52, 4.2, 2.6)}
      ${eyes(31, 49, 44, 5.1)}
      <ellipse cx="40" cy="52" rx="2.4" ry="1.6" fill="#a78bfa"/>
      ${smile(40, 58, 5)}
      <path d="M64 60 q8 2 6 8" fill="none" stroke="#c4b5fd" stroke-width="3" stroke-linecap="round"/>`;
  }

  const PET_DRAW = {
    'spark-pup': { name: 'Spark Pup', draw: petSpark },
    'moon-kit': { name: 'Moon Kit', draw: petKit },
    'dust-hopper': { name: 'Dust Hopper', draw: petHopper },
    'comet-fox': { name: 'Comet Fox', draw: petFox },
    'orbit-owl': { name: 'Orbit Owl', draw: petOwl },
    'nebula-seal': { name: 'Nebula Seal', draw: petSeal },
    'star-sloth': { name: 'Star Sloth', draw: petSloth },
    'aurora-drake': { name: 'Aurora Drake', draw: petDrake, legend: true, aura: '#fde68a' },
    'nova-whale': { name: 'Nova Whale', draw: petWhale, legend: true, aura: '#c084fc' },
    'prism-phoenix': { name: 'Prism Phoenix', draw: petPhoenix, legend: true, aura: '#fb7185' },
    'lunar-unicorn': { name: 'Lunar Unicorn', draw: petUnicorn, legend: true, aura: '#f0abfc' },
    'galaxy-panda': { name: 'Galaxy Panda', draw: petPanda, legend: true, aura: '#a5b4fc' },
    'comet-axolotl': { name: 'Comet Axolotl', draw: petAxolotl, legend: true, aura: '#fda4af' },
    'eclipse-lynx': { name: 'Eclipse Lynx', draw: petLynx, legend: true, aura: '#e9d5ff' },
  };

  function pet(id, uid) {
    uid = clean(uid);
    const spec = PET_DRAW[id] || PET_DRAW['spark-pup'];
    let inner = '';
    if (spec.legend) inner += aura(spec.aura || '#ffd25a');
    inner += spec.draw(uid);
    if (spec.legend) inner += sparkles();
    return svg('0 0 80 80', spec.name, inner, 'sap-svg' + (spec.legend ? ' char-legend' : ''));
  }

  // ---------- Dress-up full bodies (eyes locked at y=86 so costumes align) ----------

  function bodyKid(uid) {
    const g = uid + 'st';
    return `
      <defs>
        <linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#7dd3fc"/><stop offset="1" stop-color="#1d4ed8"/>
        </linearGradient>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#bae6fd"/><stop offset="1" stop-color="#0284c7"/>
        </linearGradient>
        <radialGradient id="${g}f" cx="40%" cy="35%" r="75%">
          <stop stop-color="#fff6e4"/><stop offset="1" stop-color="#f0c48a"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="34" ry="6" fill="rgba(0,0,0,.18)"/>
      <circle cx="100" cy="100" r="84" fill="rgba(170,220,255,.12)" stroke="rgba(255,255,255,.5)" stroke-width="2.5"/>
      <path d="M64 100 Q54 52 100 44 Q146 52 136 100 Q126 74 100 70 Q74 74 64 100Z" fill="url(#${g}h)" ${INK}/>
      <ellipse cx="58" cy="134" rx="12" ry="18" fill="#38bdf8" ${INK} transform="rotate(16 58 134)"/>
      <ellipse cx="142" cy="134" rx="12" ry="18" fill="#38bdf8" ${INK} transform="rotate(-16 142 134)"/>
      <rect x="78" y="152" width="16" height="22" rx="8" fill="#0369a1" ${INK}/>
      <rect x="106" y="152" width="16" height="22" rx="8" fill="#0369a1" ${INK}/>
      <ellipse cx="86" cy="174" rx="13" ry="7" fill="#0ea5e9" ${INK}/>
      <ellipse cx="114" cy="174" rx="13" ry="7" fill="#0ea5e9" ${INK}/>
      <path d="M68 116 Q100 104 132 116 L138 158 Q100 172 62 158Z" fill="url(#${g}s)" ${INK}/>
      ${star(100, 132, 8, '#ffd25a')}
      <circle cx="100" cy="96" r="30" fill="url(#${g}f)" ${INK}/>
      <path d="M74 80 Q100 54 126 80 Q112 70 100 72 Q88 70 74 80Z" fill="url(#${g}h)" ${INK}/>
      ${gloss(88, 86, 8, 4)}
      ${blush(78, 122, 102, 6, 3.4)}
      ${eyes(84, 116, 86, 7.4)}
      ${smile(100, 106, 12)}
      ${star(126, 66, 6, '#ffd25a')}`;
  }

  function bodyPet(uid) {
    const g = uid + 'nb';
    return `
      <defs>
        <radialGradient id="${g}" cx="40%" cy="30%" r="75%">
          <stop stop-color="#ffe4ea"/><stop offset="0.55" stop-color="#fb7185"/><stop offset="1" stop-color="#e11d48"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>
      <circle cx="100" cy="100" r="84" fill="rgba(255,190,210,.1)" stroke="rgba(255,255,255,.45)" stroke-width="2.5"/>
      <ellipse cx="162" cy="138" rx="16" ry="11" fill="#fda4af" ${INK} transform="rotate(-18 162 138)"/>
      <path d="M72 78 L56 26 L96 64 Z" fill="#fb7185" ${INK}/>
      <path d="M76 70 L64 36 L90 62 Z" fill="#fecdd3"/>
      <path d="M128 78 L144 26 L104 64 Z" fill="#fb7185" ${INK}/>
      <path d="M124 70 L136 36 L110 62 Z" fill="#fecdd3"/>
      <ellipse cx="100" cy="126" rx="52" ry="40" fill="url(#${g})" ${INK}/>
      <ellipse cx="100" cy="112" rx="34" ry="28" fill="#fff1f2"/>
      ${gloss(86, 96, 10, 6)}
      ${blush(76, 124, 104, 6, 3.5)}
      ${eyes(84, 116, 86, 7.6)}
      <ellipse cx="100" cy="100" rx="5" ry="3.4" fill="#fb7185"/>
      ${smile(100, 108, 10)}
      <ellipse cx="70" cy="158" rx="14" ry="9" fill="#fff1f2" ${INK}/>
      <ellipse cx="130" cy="158" rx="14" ry="9" fill="#fff1f2" ${INK}/>
      <ellipse cx="100" cy="162" rx="12" ry="8" fill="#fff1f2" ${INK}/>`;
  }

  function bodyFriend(uid) {
    const g = uid + 'bp';
    return `
      <defs>
        <radialGradient id="${g}d" cx="38%" cy="30%" r="75%">
          <stop stop-color="#f5f3ff"/><stop offset="1" stop-color="#8b5cf6"/>
        </radialGradient>
        <linearGradient id="${g}r" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#ddd6fe"/><stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="48" ry="6" fill="rgba(0,0,0,.18)"/>
      <circle cx="100" cy="100" r="84" fill="rgba(190,160,255,.1)" stroke="rgba(255,255,255,.45)" stroke-width="2.5"/>
      <ellipse cx="100" cy="146" rx="72" ry="22" fill="url(#${g}r)" ${INK}/>
      <ellipse cx="100" cy="140" rx="44" ry="11" fill="#c4b5fd"/>
      <circle cx="46" cy="146" r="5" fill="#ffd25a" ${INK}/>
      <circle cx="74" cy="156" r="4.4" fill="#67e8f9" ${INK}/>
      <circle cx="126" cy="156" r="4.4" fill="#fb7185" ${INK}/>
      <circle cx="154" cy="146" r="5" fill="#86efac" ${INK}/>
      <ellipse cx="100" cy="102" rx="40" ry="36" fill="url(#${g}d)" ${INK}/>
      ${gloss(86, 84, 12, 7)}
      <line x1="100" y1="66" x2="100" y2="52" stroke="#6d28d9" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="48" r="6" fill="#ffd25a" ${INK}/>
      ${blush(78, 122, 102, 6, 3.4)}
      ${eyes(84, 116, 86, 7.6)}
      ${smile(100, 108, 12)}`;
  }

  function body(kind, uid) {
    uid = clean(uid);
    if (kind === 'pet') return svg('0 0 200 200', 'Nibble the space pet', bodyPet(uid), 'char-svg');
    if (kind === 'friend') return svg('0 0 200 200', 'Boop the silly friend', bodyFriend(uid), 'char-svg');
    return svg('0 0 200 200', 'Starlet the space kid', bodyKid(uid), 'char-svg');
  }

  // ---------- Costume layers (same 200 viewBox as the bodies) ----------

  function hatInner(id, uid) {
    const g = uid + 'hat';
    if (id === 'beanie') {
      return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>
        <path d="M76 66 L100 16 L124 66 Q100 76 76 66Z" fill="url(#${g})" ${INK}/>
        <ellipse cx="100" cy="66" rx="26" ry="8" fill="#fbbf24" ${INK}/>
        ${star(100, 20, 6, '#fff')}`;
    }
    if (id === 'helm') {
      return `<path d="M70 70 Q70 28 100 24 Q130 28 130 70 Z" fill="rgba(224,242,254,.55)" ${INK}/>
        <path d="M74 58 Q100 36 126 58" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <rect x="68" y="66" width="64" height="10" rx="4" fill="#94a3b8" ${INK}/>
        <circle cx="100" cy="34" r="4" fill="#ffd25a"/>`;
    }
    if (id === 'prop') {
      return `<ellipse cx="100" cy="64" rx="24" ry="9" fill="#818cf8" ${INK}/>
        <rect x="96" y="36" width="8" height="28" rx="3" fill="#64748b"/>
        <g class="m-prop">
          <ellipse cx="100" cy="34" rx="26" ry="5.5" fill="#f472b6" ${INK}/>
          <ellipse cx="100" cy="34" rx="5.5" ry="16" fill="#38bdf8" ${INK}/>
        </g>
        <circle cx="100" cy="34" r="4.5" fill="#fde68a" ${INK}/>`;
    }
    if (id === 'flower') {
      return [78, 100, 122].map((x, i) => {
        const c = ['#fb7185', '#fde68a', '#67e8f9'][i];
        return `<g>${[0, 60, 120, 180, 240, 300].map(d => `<circle cx="${x + Math.cos(d * Math.PI / 180) * 6}" cy="${58 + Math.sin(d * Math.PI / 180) * 6}" r="4" fill="${c}"/>`).join('')}<circle cx="${x}" cy="58" r="3.2" fill="#fde68a" ${INK}/></g>`;
      }).join('') + `<path d="M78 66 Q100 74 122 66" fill="none" stroke="#86efac" stroke-width="3"/>`;
    }
    if (id === 'pigtails') {
      return `<path d="M70 78 q-18 10 -8 28 q16 -6 16 -16" fill="#7dd3fc" ${INK}/>
        <path d="M130 78 q18 10 8 28 q-16 -6 -16 -16" fill="#7dd3fc" ${INK}/>
        <path d="M62 70 l-16 -8 10 16 q8 -2 6 -8Z" fill="#fb7185" ${INK}/>
        <path d="M138 70 l16 -8 -10 16 q-8 -2 -6 -8Z" fill="#fb7185" ${INK}/>
        <circle cx="64" cy="72" r="4" fill="#fda4af"/>
        <circle cx="136" cy="72" r="4" fill="#fda4af"/>`;
    }
    if (id === 'ears') {
      return `<ellipse cx="68" cy="36" rx="12" ry="28" fill="#fff" ${INK}/>
        <ellipse cx="132" cy="36" rx="12" ry="28" fill="#fff" ${INK}/>
        <ellipse cx="68" cy="40" rx="6" ry="16" fill="#fecdd3"/>
        <ellipse cx="132" cy="40" rx="6" ry="16" fill="#fecdd3"/>`;
    }
    if (id === 'saucer') {
      return `<ellipse cx="100" cy="64" rx="48" ry="14" fill="#c4b5fd" ${INK}/>
        <ellipse cx="100" cy="52" rx="18" ry="12" fill="#8b5cf6" ${INK}/>
        <circle cx="64" cy="64" r="3.2" fill="#ffd25a"/>
        <circle cx="100" cy="70" r="3" fill="#67e8f9"/>
        <circle cx="136" cy="64" r="3.2" fill="#fb7185"/>`;
    }
    if (id === 'crown') {
      return `<path d="M70 66 L78 36 L92 54 L100 26 L108 54 L122 36 L130 66 Z" fill="#ffd25a" ${INK}/>
        <rect x="70" y="62" width="60" height="10" rx="3" fill="#fbbf24" ${INK}/>
        <circle cx="78" cy="40" r="3" fill="#fb7185"/>
        <circle cx="100" cy="30" r="3.2" fill="#67e8f9"/>
        <circle cx="122" cy="40" r="3" fill="#a7f3d0"/>`;
    }
    if (id === 'comet') {
      return `<path d="M78 66 Q100 28 122 66 Q100 74 78 66Z" fill="#7dd3fc" ${INK}/>
        <path d="M118 40 q28 -16 24 6 q-16 2 -24 4" fill="#fde68a" ${INK}/>
        <circle cx="100" cy="48" r="6" fill="#fff"/>`;
    }
    if (id === 'nova') {
      return `<ellipse class="m-halo" cx="100" cy="42" rx="34" ry="12" fill="none" stroke="#fde68a" stroke-width="5"/>
        <ellipse cx="100" cy="42" rx="24" ry="7" fill="none" stroke="#fff" stroke-width="2"/>
        ${star(100, 22, 6, '#fff6c2')}
        ${star(70, 36, 3.4, '#fde68a')}
        ${star(130, 36, 3.4, '#fde68a')}`;
    }
    return '';
  }

  function outfitInner(id, uid) {
    const g = uid + 'of';
    if (id === 'cape') {
      return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c084fc"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs>
        <path d="M72 96 Q36 120 46 176 Q100 150 154 176 Q164 120 128 96 Q100 112 72 96Z" fill="url(#${g})" ${INK}/>
        <path d="M100 102 L108 92 L100 110 L92 92 Z" fill="#fde68a"/>`;
    }
    if (id === 'cape2') {
      return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#fb7185"/><stop offset=".25" stop-color="#fdba74"/>
          <stop offset=".5" stop-color="#fde68a"/><stop offset=".75" stop-color="#67e8f9"/><stop offset="1" stop-color="#a78bfa"/>
        </linearGradient></defs>
        <path d="M74 100 Q30 130 42 180 Q100 156 158 180 Q170 130 126 100 Q100 118 74 100Z" fill="url(#${g})" ${INK}/>`;
    }
    if (id === 'tutu') {
      return `<ellipse cx="78" cy="150" rx="16" ry="12" fill="#f9a8d4" ${INK}/>
        <ellipse cx="100" cy="154" rx="22" ry="14" fill="#fbcfe8" ${INK}/>
        <ellipse cx="122" cy="150" rx="16" ry="12" fill="#f472b6" ${INK}/>
        <ellipse cx="100" cy="148" rx="12" ry="6" fill="#fff" opacity="0.55"/>
        ${star(100, 150, 5, '#ffd25a')}`;
    }
    if (id === 'stripes') {
      return `<path d="M68 112 H132" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
        <path d="M68 124 H132" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
        <path d="M68 136 H132" stroke="#ffd25a" stroke-width="7" stroke-linecap="round"/>
        <circle cx="124" cy="112" r="5" fill="#fb7185" ${INK}/>`;
    }
    if (id === 'pack') {
      return `<rect x="40" y="108" width="18" height="40" rx="6" fill="#94a3b8" ${INK}/>
        <rect x="142" y="108" width="18" height="40" rx="6" fill="#94a3b8" ${INK}/>
        <ellipse class="m-flame" cx="49" cy="154" rx="6" ry="10" fill="#fb923c"/>
        <ellipse class="m-flame d2" cx="151" cy="154" rx="6" ry="10" fill="#fde68a"/>
        <circle cx="49" cy="116" r="3" fill="#67e8f9"/>
        <circle cx="151" cy="116" r="3" fill="#fb7185"/>`;
    }
    if (id === 'overalls') {
      return `<path d="M74 118 H126 V160 Q100 172 74 160Z" fill="#3b82f6" ${INK}/>
        <rect x="80" y="104" width="8" height="22" rx="3" fill="#3b82f6" ${INK}/>
        <rect x="112" y="104" width="8" height="22" rx="3" fill="#3b82f6" ${INK}/>
        <circle cx="84" cy="104" r="4" fill="#fde68a" ${INK}/>
        <circle cx="116" cy="104" r="4" fill="#fde68a" ${INK}/>
        <rect x="94" y="132" width="12" height="10" rx="2" fill="#fde68a"/>`;
    }
    if (id === 'fluff') {
      return `<ellipse cx="68" cy="118" rx="16" ry="12" fill="#fff" ${INK}/>
        <ellipse cx="100" cy="126" rx="24" ry="14" fill="#fff7ed" ${INK}/>
        <ellipse cx="132" cy="118" rx="16" ry="12" fill="#fff" ${INK}/>
        <ellipse cx="84" cy="116" rx="10" ry="8" fill="#ffe4e6"/>
        <ellipse cx="116" cy="116" rx="10" ry="8" fill="#ffe4e6"/>`;
    }
    if (id === 'rings') {
      return `<ellipse cx="100" cy="132" rx="74" ry="16" fill="none" stroke="#c4b5fd" stroke-width="8"/>
        <ellipse cx="100" cy="132" rx="74" ry="16" fill="none" stroke="#fde68a" stroke-width="2.5"/>
        <circle cx="40" cy="126" r="3" fill="#67e8f9"/>
        <circle cx="160" cy="138" r="3" fill="#fb7185"/>`;
    }
    return '';
  }

  function extraInner(id) {
    if (id === 'shades') {
      return `<rect x="68" y="74" width="28" height="20" rx="7" fill="#1b1630" opacity="0.92"/>
        <rect x="104" y="74" width="28" height="20" rx="7" fill="#1b1630" opacity="0.92"/>
        <rect x="94" y="80" width="12" height="5" fill="#1b1630"/>
        <path d="M68 82 H56 M132 82 H144" stroke="#1b1630" stroke-width="3" stroke-linecap="round"/>
        <path d="M74 80 h10" stroke="#fff" stroke-width="2" opacity="0.55" stroke-linecap="round"/>
        <path d="M110 80 h10" stroke="#fff" stroke-width="2" opacity="0.55" stroke-linecap="round"/>`;
    }
    if (id === 'bow') {
      return `<path d="M100 124 L74 110 L76 136 Z" fill="#fb7185" ${INK}/>
        <path d="M100 124 L126 110 L124 136 Z" fill="#fb7185" ${INK}/>
        <circle cx="100" cy="124" r="6" fill="#fda4af" ${INK}/>`;
    }
    if (id === 'stache') {
      return `<path d="M76 108 Q88 120 100 108 Q112 120 124 108 Q112 114 100 112 Q88 114 76 108Z" fill="#3b2a4a" ${INK}/>`;
    }
    if (id === 'sparkle') {
      return `<g class="char-spark">${star(150, 40, 8, '#fff6c2')}</g>
        <g class="char-spark d2">${star(46, 48, 6, '#fde68a')}</g>
        <g class="char-spark d3">${star(156, 78, 5, '#fff')}</g>`;
    }
    if (id === 'badge') {
      return `<circle cx="124" cy="126" r="13" fill="#ffd25a" ${INK}/>
        ${star(124, 126, 7, '#fff')}
        <path d="M116 138 h16 l-2 8 h-12 z" fill="#fb7185"/>`;
    }
    if (id === 'collar') {
      return `<path d="M76 116 Q100 132 124 116" fill="none" stroke="#fde68a" stroke-width="6" stroke-linecap="round"/>
        <circle cx="100" cy="132" r="8" fill="#ffd25a" ${INK}/>
        <circle cx="100" cy="132" r="3" fill="#fff"/>`;
    }
    if (id === 'googly') {
      return `<g class="m-eye"><circle cx="84" cy="86" r="14" fill="#fff" ${INK}/><circle cx="88" cy="88" r="6" fill="#1b1630"/></g>
        <g class="m-eye"><circle cx="116" cy="86" r="14" fill="#fff" ${INK}/><circle cx="112" cy="88" r="6" fill="#1b1630"/></g>`;
    }
    if (id === 'glitter') {
      return `<g class="m-float">${heart(46, 46, 8, '#fb7185')}</g>
        <g class="m-float d2">${heart(154, 58, 7, '#f9a8d4')}</g>
        <g class="m-float d3">${heart(150, 100, 6, '#fda4af')}</g>
        <g class="char-spark">${star(40, 70, 4, '#fff')}</g>`;
    }
    return '';
  }

  function heart(cx, cy, r, fill) {
    return `<path d="M${cx} ${cy + r} C${cx - r * 2} ${cy - r} ${cx - r} ${cy - r * 1.8} ${cx} ${cy - r * 0.4} C${cx + r} ${cy - r * 1.8} ${cx + r * 2} ${cy - r} ${cx} ${cy + r}Z" fill="${fill}"/>`;
  }

  const BACK_OUTFITS = { cape: 1, cape2: 1, pack: 1 };

  function wrapLayer(inner, cls) {
    if (!inner) return '';
    return `<div class="dress-layer ${cls}"><svg viewBox="0 0 200 200" class="char-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg></div>`;
  }

  // Nudge shared costume art onto each silhouette. Eyes stay at y=86;
  // these shifts only seat hats whose rest-line was drawn for Cosmo.
  const HAT_SHIFT = { cosmo: 0, starlet: 8, nibble: 8, boop: 4 };
  const EXTRA_SHIFT = { cosmo: 0, starlet: 0, nibble: 2, boop: 0 };
  const OWN_HAT = { ears: 'nibble', saucer: 'boop', pigtails: 'starlet' };

  function anchor(inner, dy) {
    if (!inner || !dy) return inner;
    return `<g class="dress-anchor" transform="translate(0 ${dy})">${inner}</g>`;
  }

  function dressLayers(look, uid, charId) {
    uid = clean(uid);
    const who = charId || 'cosmo';
    const hatId = look && look.hat;
    const outfitId = look && look.outfit;
    const extraId = look && look.extra;
    const hatDy = OWN_HAT[hatId] === who ? 0 : (HAT_SHIFT[who] || 0);
    const hat = hatId && hatId !== 'none' ? anchor(hatInner(hatId, uid), hatDy) : '';
    const outfit = outfitId && outfitId !== 'none' ? outfitInner(outfitId, uid) : '';
    const extra = extraId && extraId !== 'none' ? anchor(extraInner(extraId), EXTRA_SHIFT[who] || 0) : '';
    const back = BACK_OUTFITS[outfitId] ? wrapLayer(outfit, 'dress-back') : '';
    const front = outfit && !BACK_OUTFITS[outfitId] ? wrapLayer(outfit, 'dress-front') : '';
    return {
      back,
      front,
      hat: wrapLayer(hat, 'dress-hat'),
      extra: wrapLayer(extra, 'dress-extra'),
    };
  }

  const HAT_CROP = {
    beanie: '68 8 64 70',
    helm: '64 18 72 64',
    prop: '70 16 60 62',
    flower: '64 44 72 36',
    pigtails: '40 58 120 56',
    ears: '60 10 80 70',
    saucer: '60 24 80 36',
    crown: '64 20 72 56',
    comet: '70 24 80 54',
    nova: '60 12 80 48',
  };
  const OUTFIT_CROP = {
    cape: '30 90 140 96',
    cape2: '24 96 152 92',
    tutu: '56 132 88 40',
    stripes: '60 100 80 48',
    pack: '36 100 128 70',
    overalls: '68 98 64 78',
    fluff: '50 102 100 42',
    rings: '20 112 160 40',
  };
  const EXTRA_CROP = {
    shades: '52 70 96 32',
    bow: '70 104 60 40',
    stache: '70 100 60 28',
    sparkle: '36 30 128 58',
    badge: '108 110 32 42',
    collar: '70 108 60 40',
    googly: '66 68 68 36',
    glitter: '30 28 140 84',
  };

  function dressIcon(slot, id, uid) {
    uid = clean(uid || ('ico' + slot + id));
    let inner = '';
    let crop = '50 40 100 100';
    if (slot === 'hat') {
      inner = hatInner(id, uid);
      crop = HAT_CROP[id] || '60 8 80 70';
    } else if (slot === 'outfit') {
      inner = outfitInner(id, uid);
      crop = OUTFIT_CROP[id] || '40 96 120 80';
    } else {
      inner = extraInner(id);
      crop = EXTRA_CROP[id] || '60 70 80 60';
    }
    if (!inner) return noneIcon();
    return svg(crop, '', inner, 'dress-ico');
  }

  function noneIcon() {
    return svg('0 0 64 64', 'Nothing equipped', `
      <circle cx="32" cy="32" r="18" fill="none" stroke="#fff" stroke-width="3" opacity="0.75"/>
      <path d="M20 44 L44 20" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.75"/>`, 'dress-ico');
  }

  function lock() {
    return svg('0 0 32 32', 'Locked', `
      <rect x="7" y="14" width="18" height="13" rx="3" fill="#fde68a" ${INK}/>
      <path d="M11 14 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#241b3a" stroke-width="2.2"/>
      <circle cx="16" cy="20" r="1.6" fill="#241b3a"/>`, 'ico-lock');
  }

  function sparkle() {
    return svg('0 0 32 32', 'Sparkle', star(16, 16, 10, '#fde68a') + star(16, 16, 4, '#fff'), 'ico-spark');
  }

  // ---------- Rival keepers, guards, goo, home ----------

  function rival(baseId) {
    const id = Number(baseId);
    if (id === 1) {
      return svg('0 0 80 80', 'Vela of Ring Ranch', `
        <ellipse cx="40" cy="58" rx="28" ry="8" fill="none" stroke="#c4b5fd" stroke-width="4"/>
        <circle cx="40" cy="40" r="18" fill="#b56bff" ${INK}/>
        ${gloss(32, 32, 7, 4)}
        <line x1="32" y1="22" x2="30" y2="10" stroke="#6d28d9" stroke-width="3" stroke-linecap="round"/>
        <line x1="48" y1="22" x2="50" y2="10" stroke="#6d28d9" stroke-width="3" stroke-linecap="round"/>
        <circle cx="30" cy="9" r="3.2" fill="#fde68a"/>
        <circle cx="50" cy="9" r="3.2" fill="#67e8f9"/>
        ${eyes(33, 47, 38, 4.2)}
        ${smile(40, 46, 6)}
        ${blush(28, 52, 44, 3, 2)}`, 'char-svg');
    }
    if (id === 2) {
      return svg('0 0 80 80', 'Gloop of Goo Grove', `
        <path d="M40 70 q6 8 0 8 q-4 -2 -2 -6" fill="#3cc9a0"/>
        <ellipse cx="40" cy="46" rx="22" ry="20" fill="#5ee0b5" ${INK}/>
        <ellipse cx="40" cy="18" rx="4" ry="7" fill="#86efac" ${INK}/>
        <circle cx="40" cy="10" r="3" fill="#fde68a"/>
        ${gloss(32, 36, 8, 4)}
        ${eyes(32, 48, 42, 4.6)}
        ${smile(40, 52, 7)}
        ${blush(26, 54, 50, 3.2, 2)}`, 'char-svg');
    }
    if (id === 3) {
      return svg('0 0 80 80', 'Luma of Nova Nest', `
        <ellipse class="legend-aura" cx="40" cy="42" rx="30" ry="28" fill="#fde68a" opacity="0.4"/>
        <path d="M18 48 Q8 28 20 24 Q22 40 30 46Z" fill="#fde68a" ${INK}/>
        <path d="M62 48 Q72 28 60 24 Q58 40 50 46Z" fill="#fff6c2" ${INK}/>
        <circle cx="40" cy="42" r="18" fill="#ffe29a" ${INK}/>
        ${gloss(32, 34, 7, 4)}
        <path d="M40 20 L36 8 L44 18 Z" fill="#fff" ${INK}/>
        ${eyes(33, 47, 40, 4.4)}
        ${smile(40, 48, 6)}
        ${sparkles()}`, 'char-svg char-legend');
    }
    return svg('0 0 80 80', 'Pebble of Crater Keep', `
      <circle cx="22" cy="28" r="6" fill="#fdba74" ${INK}/>
      <circle cx="58" cy="24" r="5" fill="#fb923c" ${INK}/>
      <circle cx="40" cy="44" r="20" fill="#ff8a5b" ${INK}/>
      <circle cx="28" cy="36" r="4" fill="#fdba74"/>
      <circle cx="52" cy="40" r="3.2" fill="#fed7aa"/>
      ${gloss(32, 34, 8, 4)}
      ${eyes(32, 48, 42, 4.6)}
      ${smile(40, 52, 6)}
      ${blush(26, 54, 50, 3, 2)}`, 'char-svg');
  }

  function guard(nova, uid) {
    uid = clean(uid);
    const gold = !!nova;
    const fill = gold ? '#ffd25a' : '#dbe4ff';
    return svg('0 0 64 64', gold ? 'Nova pal' : 'Star pal', `
      ${gold ? '<ellipse class="legend-aura" cx="32" cy="32" rx="26" ry="24" fill="#fde68a" opacity="0.45"/>' : ''}
      <circle cx="32" cy="30" r="16" fill="${fill}" ${INK}/>
      <path d="M18 28 Q32 14 46 28" fill="${gold ? '#fff6c2' : '#bfdbfe'}" ${INK}/>
      ${eyes(26, 38, 30, 3.4)}
      ${smile(32, 38, 5)}
      <circle cx="48" cy="46" r="8" fill="${gold ? '#fff' : '#bfdbfe'}" ${INK}/>
      ${star(48, 46, 4.2, gold ? '#f59e0b' : '#64748b')}
      ${gold ? sparkles() : ''}`, 'char-svg' + (gold ? ' char-legend' : ''));
  }

  function goo(uid) {
    return svg('0 0 64 64', 'Silly goo', `
      <ellipse cx="32" cy="40" rx="18" ry="14" fill="#4ade80" ${INK}/>
      <path d="M24 50 q4 8 0 8 q-3 -2 -1 -6" fill="#22c55e"/>
      <ellipse cx="32" cy="18" rx="3" ry="6" fill="#86efac" ${INK}/>
      ${gloss(26, 34, 6, 3)}
      ${eyes(26, 38, 38, 3.6)}
      ${smile(32, 46, 5)}`, 'char-svg');
  }

  function homeBase() {
    return svg('0 0 80 64', 'Your base', `
      <ellipse cx="40" cy="56" rx="26" ry="6" fill="rgba(0,0,0,.2)"/>
      <path d="M14 40 L40 16 L66 40 V54 H14 Z" fill="#9df5d6" ${INK}/>
      <rect x="34" y="40" width="12" height="14" rx="2" fill="#0f766e"/>
      ${star(40, 30, 5, '#ffd25a')}
      <circle cx="24" cy="36" r="3" fill="#fff" opacity="0.7"/>`, 'char-svg');
  }

  // ---------- Mini-game sprites ----------

  function blip(id, uid) {
    const colors = {
      purple: ['#d8b4fe', '#7c3aed', true],
      green: ['#86efac', '#16a34a', false],
      gold: ['#fde68a', '#d97706', false],
      pink: ['#fbcfe8', '#db2777', false],
      blue: ['#bae6fd', '#0284c7', false],
    };
    const spec = colors[id] || colors.purple;
    const antenna = spec[2]
      ? `<line x1="40" y1="22" x2="40" y2="8" stroke="#6d28d9" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="7" r="4" fill="#fde68a" ${INK}/>`
      : '';
    const tuft = id === 'green'
      ? `<ellipse cx="40" cy="16" rx="4" ry="8" fill="#22c55e" ${INK}/>`
      : id === 'pink'
        ? `<path d="M40 20 l-8 -6 6 8 z" fill="#fb7185"/>`
        : id === 'gold'
          ? star(40, 16, 5, '#fff')
          : id === 'blue'
            ? `<ellipse cx="18" cy="42" rx="6" ry="3" fill="#7dd3fc"/><ellipse cx="62" cy="42" rx="6" ry="3" fill="#7dd3fc"/>`
            : '';
    return svg('0 0 80 80', id + ' blip', `
      ${antenna}
      <circle cx="40" cy="44" r="22" fill="${spec[0]}" ${INK}/>
      ${tuft}
      ${gloss(32, 34, 8, 5)}
      ${blush(26, 54, 50, 4, 2.4)}
      ${eyes(31, 49, 42, 5)}
      ${smile(40, 54, 6)}`, 'char-svg char-bob');
  }

  function planet(index, uid) {
    uid = clean(uid || ('pl' + index));
    const g = uid + 'pl';
    const kinds = [
      () => `<defs><radialGradient id="${g}" cx="35%" cy="30%" r="70%"><stop stop-color="#fde68a"/><stop offset="1" stop-color="#fb7185"/></radialGradient></defs>
        <ellipse cx="40" cy="44" rx="30" ry="10" fill="none" stroke="#fde68a" stroke-width="4" transform="rotate(-18 40 44)"/>
        <circle cx="40" cy="42" r="18" fill="url(#${g})" ${INK}/>`,
      () => `<circle cx="40" cy="42" r="20" fill="#67e8f9" ${INK}/><path d="M24 36 q10 8 20 -2 q6 10 -4 16 q-16 2 -18 -8z" fill="#34d399"/><circle cx="54" cy="30" r="4" fill="#bae6fd"/>`,
      () => `<circle cx="40" cy="42" r="20" fill="#fef3c7" ${INK}/><circle cx="30" cy="36" r="5" fill="#fde68a"/><circle cx="50" cy="48" r="4" fill="#fcd34d"/><circle cx="42" cy="30" r="2.4" fill="#fbbf24"/>`,
      () => `<circle cx="40" cy="42" r="18" fill="rgba(186,230,253,.85)" ${INK}/><ellipse cx="32" cy="34" rx="6" ry="4" fill="#fff" opacity="0.65"/><circle cx="52" cy="48" r="3" fill="#fff" opacity="0.5"/>`,
      () => `<circle cx="40" cy="42" r="20" fill="#c4b5fd" ${INK}/><path d="M20 40 H60" stroke="#7c3aed" stroke-width="4"/><path d="M22 50 H58" stroke="#a78bfa" stroke-width="3"/>`,
      () => `<defs><radialGradient id="${g}" cx="40%" cy="35%" r="70%"><stop stop-color="#fff6c2"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs>
        <circle cx="40" cy="42" r="18" fill="url(#${g})" ${INK}/>
        ${star(40, 18, 4, '#fff')}${star(18, 28, 3, '#fde68a')}${star(62, 26, 3, '#fde68a')}`,
    ];
    const face = `${eyes(33, 47, 40, 3.6)}${smile(40, 50, 5)}`;
    const draw = kinds[index % kinds.length];
    return svg('0 0 80 80', 'Zoom planet', draw() + face, 'char-svg char-bob');
  }

  function moon() {
    return svg('0 0 80 80', 'Moon', `
      <circle cx="40" cy="40" r="26" fill="#fef3c7" ${INK}/>
      <circle cx="28" cy="32" r="6" fill="#fde68a"/>
      <circle cx="50" cy="46" r="5" fill="#fde68a"/>
      <circle cx="36" cy="52" r="3" fill="#fcd34d"/>
      ${gloss(30, 28, 8, 5)}
      ${eyes(32, 50, 38, 4)}
      ${smile(40, 50, 6)}`, 'char-svg char-bob');
  }

  function hoop() {
    return svg('0 0 80 80', 'Star hoop', `
      <circle cx="40" cy="40" r="26" fill="none" stroke="#fde68a" stroke-width="6"/>
      <circle cx="40" cy="40" r="18" fill="none" stroke="#fff" stroke-width="2" opacity="0.7"/>
      ${star(40, 10, 6, '#fff6c2')}
      ${star(12, 40, 4, '#fde68a')}
      ${star(68, 40, 4, '#fde68a')}`, 'char-svg');
  }

  function arrow(dir) {
    const d = dir === 'left'
      ? 'M42 14 L16 32 L42 50'
      : 'M22 14 L48 32 L22 50';
    return svg('0 0 64 64', dir, `<path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`, 'char-svg');
  }

  function cardBack(uid) {
    const g = clean(uid) + 'cb';
    return svg('0 0 80 80', 'Star card', `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#7c3aed"/><stop offset="1" stop-color="#2dd4bf"/>
      </linearGradient></defs>
      <rect x="6" y="6" width="68" height="68" rx="16" fill="url(#${g})" ${INK}/>
      ${star(40, 40, 16, '#fff6c2')}
      ${star(18, 18, 4, '#fff')}
      ${star(62, 60, 4, '#fff')}`, 'char-svg');
  }

  const FOODS = [
    { id: 'starberry', name: 'Starberry' },
    { id: 'moonmilk', name: 'Moon milk' },
    { id: 'cookie', name: 'Comet cookie' },
  ];

  function food(id) {
    if (id === 'moonmilk') {
      return svg('0 0 80 80', 'Moon milk', `
        <rect x="30" y="22" width="20" height="40" rx="8" fill="#e0f2fe" ${INK}/>
        <rect x="28" y="18" width="24" height="10" rx="4" fill="#7dd3fc" ${INK}/>
        <path d="M48 30 a10 10 0 1 0 0 16 a6 6 0 1 1 0 -16" fill="#fef9c3"/>
        <ellipse cx="40" cy="64" rx="10" ry="3" fill="rgba(0,0,0,.15)"/>`, 'char-svg');
    }
    if (id === 'cookie') {
      return svg('0 0 80 80', 'Comet cookie', `
        <path d="M58 28 L74 22 L64 36 Z" fill="#fde68a" ${INK}/>
        <circle cx="38" cy="44" r="22" fill="#f6c98a" ${INK}/>
        <circle cx="30" cy="38" r="3" fill="#9a3412"/>
        <circle cx="44" cy="36" r="2.4" fill="#9a3412"/>
        <circle cx="40" cy="50" r="3" fill="#9a3412"/>
        <circle cx="28" cy="50" r="2" fill="#9a3412"/>
        ${eyes(32, 46, 42, 2.2)}
        ${smile(38, 52, 4)}`, 'char-svg');
    }
    return svg('0 0 80 80', 'Starberry', `
      ${star(40, 40, 26, '#fb7185')}
      ${star(40, 40, 16, '#fda4af')}
      <ellipse cx="40" cy="28" rx="4" ry="6" fill="#22c55e" ${INK}/>
      ${eyes(32, 48, 40, 3)}
      ${smile(40, 50, 5)}`, 'char-svg');
  }

  const DECOR = [
    { id: 'lamp', name: 'Star lamp' },
    { id: 'rug', name: 'Moon rug' },
    { id: 'bed', name: 'Pet bed' },
    { id: 'fern', name: 'Nebula fern' },
    { id: 'window', name: 'Star window' },
    { id: 'banner', name: 'Welcome banner' },
    { id: 'cushion', name: 'Cloud cushion' },
    { id: 'scope', name: 'Telescope' },
  ];

  function decor(id) {
    if (id === 'rug') {
      return svg('0 0 80 80', 'Moon rug', `<ellipse cx="40" cy="44" rx="30" ry="16" fill="#c4b5fd" ${INK}/><ellipse cx="40" cy="44" rx="16" ry="8" fill="#fef3c7"/><path d="M40 36 a8 8 0 1 0 0 16 a5 5 0 1 1 0 -16" fill="#fde68a"/>`, 'char-svg');
    }
    if (id === 'bed') {
      return svg('0 0 80 80', 'Pet bed', `<ellipse cx="40" cy="50" rx="28" ry="14" fill="#fbcfe8" ${INK}/><ellipse cx="40" cy="46" rx="20" ry="8" fill="#fff"/><path d="M18 40 q6 -16 14 -4" fill="#fb7185"/>`, 'char-svg');
    }
    if (id === 'fern') {
      return svg('0 0 80 80', 'Nebula fern', `<rect x="36" y="48" width="8" height="16" rx="3" fill="#166534"/><path d="M40 48 Q20 40 24 24" fill="none" stroke="#4ade80" stroke-width="4"/><path d="M40 46 Q60 34 54 18" fill="none" stroke="#22c55e" stroke-width="4"/><path d="M40 40 Q28 28 36 16" fill="none" stroke="#86efac" stroke-width="4"/>`, 'char-svg');
    }
    if (id === 'window') {
      return svg('0 0 80 80', 'Star window', `<rect x="16" y="14" width="48" height="48" rx="8" fill="#1e3a8a" ${INK}/><path d="M40 14 V62 M16 38 H64" stroke="#93c5fd" stroke-width="3"/>${star(28, 26, 4, '#fde68a')}${star(52, 48, 3, '#fff')}`, 'char-svg');
    }
    if (id === 'banner') {
      return svg('0 0 80 80', 'Welcome banner', `<path d="M10 24 H70 L62 36 H18 Z" fill="#fde68a" ${INK}/><path d="M18 36 L14 52 L24 40" fill="#fb7185"/><path d="M62 36 L66 52 L56 40" fill="#fb7185"/>${star(40, 30, 5, '#f59e0b')}`, 'char-svg');
    }
    if (id === 'cushion') {
      return svg('0 0 80 80', 'Cloud cushion', `<ellipse cx="40" cy="46" rx="26" ry="16" fill="#e0f2fe" ${INK}/><ellipse cx="28" cy="42" rx="12" ry="10" fill="#f0f9ff" ${INK}/><ellipse cx="52" cy="42" rx="12" ry="10" fill="#f0f9ff" ${INK}/>`, 'char-svg');
    }
    if (id === 'scope') {
      return svg('0 0 80 80', 'Telescope', `<path d="M18 58 L34 30" stroke="#94a3b8" stroke-width="4"/><path d="M30 58 L40 36" stroke="#94a3b8" stroke-width="4"/><rect x="28" y="22" width="36" height="14" rx="7" fill="#7dd3fc" ${INK} transform="rotate(-28 46 29)"/><circle cx="62" cy="18" r="5" fill="#1e3a8a" ${INK}/>`, 'char-svg');
    }
    return svg('0 0 80 80', 'Star lamp', `<path d="M40 58 V36" stroke="#94a3b8" stroke-width="4"/><ellipse cx="40" cy="62" rx="14" ry="5" fill="#64748b"/>${star(40, 24, 14, '#fde68a')}${star(40, 24, 6, '#fff')}`, 'char-svg');
  }

  function roomShell(uid) {
    const g = clean(uid) + 'room';
    return svg('0 0 400 260', 'Cozy base', `
      <defs>
        <linearGradient id="${g}w" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#1e2a55"/><stop offset="1" stop-color="#12162c"/>
        </linearGradient>
        <linearGradient id="${g}f" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#3b2a5a"/><stop offset="1" stop-color="#241833"/>
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#${g}w)"/>
      <rect x="36" y="28" width="120" height="80" rx="12" fill="#0f172a" stroke="#93c5fd" stroke-width="4"/>
      ${star(70, 58, 8, '#fde68a')}${star(110, 70, 5, '#fff')}${star(90, 40, 4, '#fef9c3')}
      <path d="M0 160 Q200 130 400 160 V260 H0 Z" fill="url(#${g}f)"/>
      <ellipse cx="200" cy="168" rx="70" ry="10" fill="rgba(255,255,255,.06)"/>`, 'room-shell');
  }

  function gameBadge(id) {
    const map = {
      'steal-a-pet': () => pet('lunar-unicorn', 'gb-steal'),
      'planet-pop': () => planet(0, 'gb-pop'),
      'purple-blip': () => blip('purple', 'gb-blip'),
      'dress-up': () => body('kid', 'gb-dress'),
      'wiggle-walk': () => body('friend', 'gb-wig'),
      'moon-boing': () => moon(),
      'pet-picnic': () => pet('spark-pup', 'gb-pic'),
      'memory-stars': () => pet('orbit-owl', 'gb-mem'),
      'comet-catch': () => pet('comet-fox', 'gb-catch'),
      'cozy-base': () => decor('lamp'),
      'star-parade': () => pet('prism-phoenix', 'gb-par'),
    };
    const fn = map[id];
    return fn ? fn() : sparkle();
  }

  // ---------- Galaxy space pet (one creature growing up) ----------

  function bellyStar(cx, cy, r) {
    return star(cx, cy, r, '#ffd25a');
  }

  function spacePet(minStars, uid) {
    uid = clean(uid);
    const g = uid + 'sp';
    const min = Number(minStars) || 0;
    if (min >= 220) {
      return svg('0 0 140 140', 'Nebula Wyrm', `
        <defs><linearGradient id="${g}" x1="0" y1="1" x2="1" y2="0">
          <stop stop-color="#818cf8"/><stop offset=".5" stop-color="#e9d5ff"/><stop offset="1" stop-color="#67e8f9"/>
        </linearGradient></defs>
        <ellipse class="legend-aura" cx="70" cy="74" rx="58" ry="52" fill="#c4b5fd" opacity="0.35"/>
        <path d="M30 108 Q18 80 40 70 Q20 60 46 52 Q24 40 58 46 Q70 20 92 40 Q120 28 110 58 Q132 70 108 84 Q124 110 90 100 Q70 124 48 108 Q36 120 30 108Z" fill="url(#${g})" ${INK}/>
        ${gloss(78, 48, 10, 6)}
        ${eyes(78, 98, 58, 5)}
        ${smile(88, 68, 6)}
        ${bellyStar(70, 88, 7)}
        <path d="M96 40 L108 18 L100 42 Z" fill="#fde68a" ${INK}/>
        ${sparkles()}`, 'char-svg char-legend');
    }
    if (min >= 160) {
      return svg('0 0 140 140', 'Starwing', `
        <path d="M40 70 Q8 40 24 24 Q36 48 52 62 Z" fill="#c4b5fd" ${INK}/>
        <path d="M100 70 Q132 40 116 24 Q104 48 88 62 Z" fill="#fde68a" ${INK}/>
        <path d="M48 66 Q16 78 30 96" fill="#a78bfa" ${INK}/>
        <path d="M92 66 Q124 78 110 96" fill="#fcd34d" ${INK}/>
        <ellipse cx="70" cy="84" rx="28" ry="32" fill="#d8b4fe" ${INK}/>
        ${bellyStar(70, 96, 7)}
        <circle cx="70" cy="62" r="22" fill="#f5d0fe" ${INK}/>
        ${gloss(60, 54, 8, 5)}
        ${eyes(60, 80, 62, 5)}
        ${smile(70, 72, 6)}`, 'char-svg');
    }
    if (min >= 100) {
      return svg('0 0 140 140', 'Stardragon', `
        <path d="M34 78 Q12 48 30 40 Q32 60 46 72 Z" fill="#6ee7b7" ${INK}/>
        <path d="M106 78 Q128 48 110 40 Q108 60 94 72 Z" fill="#a7f3d0" ${INK}/>
        <ellipse cx="70" cy="88" rx="30" ry="28" fill="#5eead4" ${INK}/>
        ${bellyStar(70, 98, 6)}
        <circle cx="70" cy="60" r="22" fill="#99f6e4" ${INK}/>
        <path d="M58 46 L54 30 L66 44 Z" fill="#fde68a" ${INK}/>
        <path d="M82 46 L86 30 L74 44 Z" fill="#fde68a" ${INK}/>
        ${gloss(60, 52, 8, 4)}
        ${eyes(60, 80, 60, 5)}
        ${smile(70, 70, 6)}`, 'char-svg');
    }
    if (min >= 60) {
      return svg('0 0 140 140', 'Cosmosaur', `
        <path d="M48 96 Q30 70 46 48 Q40 30 58 40 Q52 58 64 70" fill="#86efac" ${INK}/>
        <ellipse cx="78" cy="96" rx="32" ry="24" fill="#6ee7b7" ${INK}/>
        <circle cx="58" cy="46" r="16" fill="#bbf7d0" ${INK}/>
        ${bellyStar(84, 100, 5)}
        ${eyes(52, 66, 46, 3.6)}
        ${smile(58, 54, 4)}
        <ellipse cx="40" cy="108" rx="8" ry="5" fill="#34d399" ${INK}/>
        <ellipse cx="100" cy="112" rx="10" ry="6" fill="#34d399" ${INK}/>`, 'char-svg');
    }
    if (min >= 30) {
      return svg('0 0 140 140', 'Wobbles', `
        <path d="M30 96 q-8 20 6 22" fill="#5eead4" ${INK}/>
        <path d="M50 104 q-2 22 10 18" fill="#2dd4bf" ${INK}/>
        <path d="M78 104 q4 22 12 16" fill="#5eead4" ${INK}/>
        <path d="M104 96 q10 18 2 24" fill="#2dd4bf" ${INK}/>
        <ellipse cx="70" cy="78" rx="36" ry="30" fill="#5eead4" ${INK}/>
        ${bellyStar(70, 88, 5)}
        ${gloss(56, 64, 10, 6)}
        ${eyes(56, 84, 70, 6)}
        ${smile(70, 84, 8)}
        ${blush(48, 92, 80, 5, 3)}`, 'char-svg');
    }
    if (min >= 10) {
      return svg('0 0 140 140', 'Blip', `
        <line x1="70" y1="46" x2="70" y2="28" stroke="#0f766e" stroke-width="5" stroke-linecap="round"/>
        <circle cx="70" cy="24" r="7" fill="#fde68a" ${INK}/>
        <circle cx="70" cy="78" r="36" fill="#5eead4" ${INK}/>
        ${gloss(56, 64, 12, 7)}
        ${bellyStar(70, 96, 6)}
        ${blush(50, 90, 84, 6, 3.4)}
        ${eyes(56, 84, 74, 7)}
        ${smile(70, 90, 8)}`, 'char-svg');
    }
    return svg('0 0 140 140', 'Space Egg', `
      <defs><radialGradient id="${g}" cx="40%" cy="30%" r="75%">
        <stop stop-color="#fff"/><stop offset="1" stop-color="#d1fae5"/>
      </radialGradient></defs>
      <ellipse cx="70" cy="118" rx="28" ry="6" fill="rgba(0,0,0,.15)"/>
      <ellipse cx="70" cy="78" rx="36" ry="44" fill="url(#${g})" ${INK}/>
      ${gloss(56, 58, 12, 8)}
      <path d="M70 40 q8 10 2 18" fill="none" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>
      ${star(88, 60, 6, '#fde68a')}
      <ellipse cx="70" cy="92" rx="10" ry="6" fill="#a7f3d0" opacity="0.8"/>`, 'char-svg');
  }

  function petMood(kind) {
    if (kind === 'fed') {
      return svg('0 0 48 48', 'Happy and full', `
        <circle cx="24" cy="24" r="18" fill="#fde68a" ${INK}/>
        <path d="M14 22 q6 -6 10 0" fill="none" stroke="#1b1630" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M26 22 q6 -6 10 0" fill="none" stroke="#1b1630" stroke-width="2.4" stroke-linecap="round"/>
        ${smile(24, 30, 6)}`, 'char-svg');
    }
    if (kind === 'hungry') {
      return svg('0 0 48 48', 'Ready for a snack', `
        <ellipse cx="24" cy="30" rx="14" ry="8" fill="#fff" ${INK}/>
        <ellipse cx="24" cy="28" rx="10" ry="4" fill="#e0f2fe"/>
        ${star(24, 27, 4, '#fde68a')}`, 'char-svg');
    }
    return svg('0 0 48 48', 'Wiggling', star(24, 24, 12, '#fde68a') + star(24, 24, 5, '#fff'), 'char-svg');
  }

  function petAccessory(id, uid) {
    uid = clean(uid);
    if (id === 'tophat') {
      return svg('0 0 64 64', 'Top hat', `
        <rect x="18" y="16" width="28" height="26" rx="4" fill="#1e1b4b" ${INK}/>
        <rect x="10" y="40" width="44" height="8" rx="3" fill="#312e81" ${INK}/>
        <rect x="22" y="20" width="8" height="16" fill="#fff" opacity="0.25"/>`, 'char-svg');
    }
    if (id === 'bow') {
      return svg('0 0 64 64', 'Fancy bow', `
        <path d="M32 34 L8 18 L10 46 Z" fill="#fb7185" ${INK}/>
        <path d="M32 34 L56 18 L54 46 Z" fill="#fb7185" ${INK}/>
        <circle cx="32" cy="34" r="6" fill="#fda4af" ${INK}/>`, 'char-svg');
    }
    if (id === 'shades') {
      return svg('0 0 64 64', 'Cool shades', `
        <rect x="6" y="22" width="22" height="16" rx="5" fill="#1b1630"/>
        <rect x="36" y="22" width="22" height="16" rx="5" fill="#1b1630"/>
        <rect x="26" y="26" width="12" height="5" fill="#1b1630"/>
        <path d="M10 26 h8 M40 26 h8" stroke="#fff" stroke-width="2" opacity="0.5"/>`, 'char-svg');
    }
    if (id === 'crown') {
      return svg('0 0 64 64', 'Royal crown', `
        <path d="M8 44 L16 18 L28 34 L32 12 L36 34 L48 18 L56 44 Z" fill="#ffd25a" ${INK}/>
        <rect x="8" y="42" width="48" height="8" rx="2" fill="#fbbf24" ${INK}/>
        <circle cx="16" cy="22" r="3" fill="#fb7185"/>
        <circle cx="32" cy="16" r="3" fill="#67e8f9"/>
        <circle cx="48" cy="22" r="3" fill="#a7f3d0"/>`, 'char-svg');
    }
    return noneIcon();
  }

  function accessorySlot(id) {
    if (id === 'shades') return 'face';
    if (id === 'bow') return 'neck';
    return 'hat';
  }

  return {
    pet,
    PET_IDS: Object.keys(PET_DRAW),
    body,
    dressLayers,
    dressIcon,
    noneIcon,
    lock,
    sparkle,
    rival,
    guard,
    goo,
    homeBase,
    blip,
    planet,
    moon,
    hoop,
    arrow,
    cardBack,
    FOODS,
    food,
    DECOR,
    decor,
    roomShell,
    gameBadge,
    spacePet,
    petMood,
    petAccessory,
    accessorySlot,
  };
})();
