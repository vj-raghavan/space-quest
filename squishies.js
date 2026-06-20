// --- Space Quest — Squishy Collection ---
// A cuddly collectible reward layer: kids unlock cute squishies by earning
// achievements (badges) and hitting milestones (total stars, missions,
// streaks, Pokémon caught). Collect them all to unlock the secret legendary
// Golden Squishy. All art is self-contained inline SVG (no image assets),
// in the same spirit as mascot.js. Storage is per-player via Players.key().
// This script must load BEFORE app.js (it is read from checkAndUnlockBadges).

const Squishies = (() => {
  const STORE_KEY = 'space_quest_squishies_v1';

  // Each squishy: id, name, shape, palette [body, belly], rarity, an unlock
  // condition, and a kid-friendly hint shown while it is still locked.
  // Unlock conditions (only one key each, except golden):
  //   { badge: 'id' }        -> a specific badge is unlocked
  //   { anyBadge: [...] }    -> any one of these badges is unlocked
  //   { totalStars: n }      -> lifetime stars earned across planets
  //   { totalMissions: n }   -> lifetime missions completed
  //   { streak: n }          -> current daily streak length
  //   { pokedex: n }         -> Pokémon caught
  //   { all: true }          -> every other squishy collected (the golden one)
  const SQUISHIES = [
    { id: 'star_puff',  name: 'Star Puff',        shape: 'star',   palette: ['#ffd76b', '#fff0b8'], rarity: 'common', unlock: { badge: 'first_flight' }, hint: 'Finish your very first space mission!' },
    { id: 'moon_marsh', name: 'Moon Marshmallow', shape: 'moon',   palette: ['#dfe6ff', '#ffffff'], rarity: 'common', unlock: { badge: 'perfect_10' }, hint: 'Get 100% on a mission!' },
    { id: 'zippy',      name: 'Zippy',            shape: 'rocket', palette: ['#ff7a8a', '#ffd1d7'], rarity: 'rare',   unlock: { badge: 'speed_demon' }, hint: 'Answer super fast to earn the Speed Demon badge!' },
    { id: 'combo_cub',  name: 'Combo Cub',        shape: 'cat',    palette: ['#ffb066', '#ffe0c2'], rarity: 'common', unlock: { badge: 'combo_master' }, hint: 'Get a 3-in-a-row combo!' },
    { id: 'lucky_bean', name: 'Lucky Bean',       shape: 'blob',   palette: ['#7bd88f', '#d8f5df'], rarity: 'rare',   unlock: { badge: 'lucky_7' }, hint: 'Ace a mission with the 7s!' },
    { id: 'cosmo_blob', name: 'Cosmo Blob',       shape: 'blob',   palette: ['#a98bff', '#e4daff'], rarity: 'rare',   unlock: { badge: 'cosmic_explorer' }, hint: 'Master the cosmic tables (13 and up)!' },
    { id: 'addy',       name: 'Addy',             shape: 'bun',    palette: ['#8fd0ff', '#dcefff'], rarity: 'common', unlock: { badge: 'addition_cadet' }, hint: 'Earn the Addition Cadet badge!' },
    { id: 'subby',      name: 'Subby',            shape: 'bun',    palette: ['#ff9ecf', '#ffdcef'], rarity: 'common', unlock: { badge: 'subtraction_cadet' }, hint: 'Earn the Subtraction Cadet badge!' },
    { id: 'ticktock',   name: 'Tick-Tock',        shape: 'planet', palette: ['#6bd6d0', '#c6f3f0'], rarity: 'common', unlock: { anyBadge: ['clock_cadet', 'clock_master', 'time_lord'] }, hint: 'Earn any Clock badge!' },
    { id: 'pizzo',      name: 'Pizzo',            shape: 'donut',  palette: ['#ffb3c1', '#ffe3b3'], rarity: 'rare',   unlock: { anyBadge: ['fraction_cadet', 'fraction_pilot', 'fraction_lord'] }, hint: 'Earn any Fraction badge!' },
    { id: 'wordy',      name: 'Wordy',            shape: 'ghost',  palette: ['#c9b6ff', '#ece4ff'], rarity: 'common', unlock: { anyBadge: ['spelling_scout', 'word_wizard'] }, hint: 'Earn a Spelling badge!' },
    { id: 'readster',   name: 'Readster',         shape: 'dino',   palette: ['#7bd88f', '#d8f5df'], rarity: 'common', unlock: { badge: 'reading_rocket' }, hint: 'Earn the Reading Rocket badge!' },
    { id: 'melody',     name: 'Melody',           shape: 'heart',  palette: ['#ff8fb3', '#ffd6e3'], rarity: 'rare',   unlock: { badge: 'rhythm_star' }, hint: 'Earn the Rhythm Star badge!' },
    { id: 'puffle',     name: 'Puffle',           shape: 'cloud',  palette: ['#bfe3ff', '#eef8ff'], rarity: 'rare',   unlock: { badge: 'puzzle_genius' }, hint: 'Earn the Puzzle Genius badge!' },
    { id: 'prof_squish',name: 'Professor Squish', shape: 'cat',    palette: ['#ffd76b', '#fff0b8'], rarity: 'rare',   unlock: { badge: 'pokemon_professor' }, hint: 'Ace a Poké Galaxy mission!' },
    { id: 'boltly',     name: 'Boltly',           shape: 'star',   palette: ['#ffe14d', '#fff7c2'], rarity: 'epic',   unlock: { badge: 'lightning_legend' }, hint: 'Earn the Lightning Legend badge!' },

    { id: 'starlet',    name: 'Starlet',          shape: 'star',   palette: ['#9ad1ff', '#e3f2ff'], rarity: 'common', unlock: { totalStars: 25 }, hint: 'Collect 25 stars in total!' },
    { id: 'supernova',  name: 'Supernova',        shape: 'star',   palette: ['#ff9a62', '#ffd9bf'], rarity: 'rare',   unlock: { totalStars: 50 }, hint: 'Collect 50 stars in total!' },
    { id: 'galaxia',    name: 'Galaxia',          shape: 'planet', palette: ['#a98bff', '#e4daff'], rarity: 'epic',   unlock: { totalStars: 100 }, hint: 'Collect 100 stars in total!' },
    { id: 'voyager',    name: 'Voyager',          shape: 'rocket', palette: ['#8fd0ff', '#dcefff'], rarity: 'common', unlock: { totalMissions: 10 }, hint: 'Finish 10 missions!' },
    { id: 'captain',    name: 'Captain Squish',   shape: 'blob',   palette: ['#ff7a8a', '#ffd1d7'], rarity: 'rare',   unlock: { totalMissions: 25 }, hint: 'Finish 25 missions!' },
    { id: 'flamey',     name: 'Flamey',           shape: 'blob',   palette: ['#ff9a3d', '#ffd9a8'], rarity: 'rare',   unlock: { streak: 3 }, hint: 'Play 3 days in a row!' },
    { id: 'blaze',      name: 'Blaze',            shape: 'dino',   palette: ['#ff6b5e', '#ffc9c2'], rarity: 'epic',   unlock: { streak: 7 }, hint: 'Play 7 days in a row!' },
    { id: 'dex_buddy',  name: 'Dex Buddy',        shape: 'cat',    palette: ['#6bd6d0', '#c6f3f0'], rarity: 'rare',   unlock: { pokedex: 25 }, hint: 'Catch 25 Pokémon!' },

    { id: 'goldie',     name: 'Goldie',           shape: 'crown',  palette: ['#ffd34d', '#fff1b0'], rarity: 'legendary', unlock: { all: true }, hint: 'Collect every other squishy to reveal the secret one!' },
  ];

  const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

  let owned;
  try {
    owned = new Set(JSON.parse(localStorage.getItem(Players.key(STORE_KEY))) || []);
  } catch (e) {
    owned = new Set();
  }

  function save() {
    localStorage.setItem(Players.key(STORE_KEY), JSON.stringify([...owned]));
  }

  function isOwned(id) { return owned.has(id); }
  function count() { return owned.size; }
  function total() { return SQUISHIES.length; }
  function get(id) { return SQUISHIES.find(s => s.id === id); }
  function list() { return SQUISHIES.slice(); }

  // --- Unlock evaluation ---
  function conditionMet(unlock, ctx) {
    if (unlock.all) {
      return SQUISHIES.every(s => s.unlock.all || owned.has(s.id));
    }
    if (unlock.badge) return ctx.badges.includes(unlock.badge);
    if (unlock.anyBadge) return unlock.anyBadge.some(b => ctx.badges.includes(b));
    if (unlock.totalStars != null) return ctx.totalStars >= unlock.totalStars;
    if (unlock.totalMissions != null) return ctx.totalMissions >= unlock.totalMissions;
    if (unlock.streak != null) return ctx.streak >= unlock.streak;
    if (unlock.pokedex != null) return ctx.pokedexCount >= unlock.pokedex;
    return false;
  }

  // Evaluate all conditions against the latest stats and award any newly
  // earned squishies. Returns the list of squishy objects just unlocked
  // (so the UI can celebrate them). The golden one is checked last so that
  // collecting your final regular squishy can also pop the legendary.
  function checkUnlocks(ctx) {
    ctx = ctx || {};
    ctx.badges = ctx.badges || [];
    const newly = [];

    // Regular squishies first.
    SQUISHIES.forEach(s => {
      if (s.unlock.all) return;
      if (!owned.has(s.id) && conditionMet(s.unlock, ctx)) {
        owned.add(s.id);
        newly.push(s);
      }
    });

    // Then the legendary "collect them all" reward.
    const golden = SQUISHIES.find(s => s.unlock.all);
    if (golden && !owned.has(golden.id) && conditionMet(golden.unlock, ctx)) {
      owned.add(golden.id);
      newly.push(golden);
    }

    if (newly.length) save();
    return newly;
  }

  // --- Art: self-contained inline SVG, parameterized by shape + palette ---
  function face() {
    return `
      <ellipse cx="38" cy="51" rx="4.4" ry="5.4" fill="#3a2b3a"/>
      <ellipse cx="62" cy="51" rx="4.4" ry="5.4" fill="#3a2b3a"/>
      <circle cx="39.6" cy="49" r="1.5" fill="#fff"/>
      <circle cx="63.6" cy="49" r="1.5" fill="#fff"/>
      <circle cx="29" cy="59" r="4" fill="#ff8fb3" opacity="0.6"/>
      <circle cx="71" cy="59" r="4" fill="#ff8fb3" opacity="0.6"/>
      <path d="M43 58 Q50 65 57 58" stroke="#3a2b3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    `;
  }

  function gloss() {
    return `<ellipse cx="40" cy="35" rx="9" ry="5.5" fill="#ffffff" opacity="0.4"/>`;
  }

  // Body markup for a shape, given fill colors. Faces sit around (50, 53).
  function body(shape, c1, c2) {
    switch (shape) {
      case 'star':
        return `
          <path d="M50 16 L60 40 L86 42 L66 59 L73 85 L50 70 L27 85 L34 59 L14 42 L40 40 Z"
                fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'moon':
        return `
          <circle cx="50" cy="52" r="32" fill="${c1}"/>
          <circle cx="38" cy="44" r="6" fill="${c2}" opacity="0.6"/>
          <circle cx="64" cy="64" r="5" fill="${c2}" opacity="0.6"/>
          <circle cx="60" cy="40" r="3.5" fill="${c2}" opacity="0.6"/>`;
      case 'rocket':
        return `
          <path d="M50 18 C66 30 66 56 58 76 L42 76 C34 56 34 30 50 18 Z" fill="${c1}"/>
          <path d="M42 70 L30 82 L42 80 Z" fill="${c2}"/>
          <path d="M58 70 L70 82 L58 80 Z" fill="${c2}"/>
          <ellipse cx="50" cy="64" rx="13" ry="10" fill="${c2}" opacity="0.5"/>`;
      case 'cat':
        return `
          <path d="M30 30 L24 14 L42 26 Z" fill="${c1}"/>
          <path d="M70 30 L76 14 L58 26 Z" fill="${c1}"/>
          <circle cx="50" cy="54" r="30" fill="${c1}"/>
          <ellipse cx="50" cy="62" rx="20" ry="14" fill="${c2}" opacity="0.5"/>`;
      case 'bun':
        return `
          <ellipse cx="38" cy="22" rx="7" ry="16" fill="${c1}"/>
          <ellipse cx="62" cy="22" rx="7" ry="16" fill="${c1}"/>
          <ellipse cx="38" cy="24" rx="3" ry="9" fill="${c2}"/>
          <ellipse cx="62" cy="24" rx="3" ry="9" fill="${c2}"/>
          <circle cx="50" cy="56" r="28" fill="${c1}"/>
          <ellipse cx="50" cy="64" rx="19" ry="13" fill="${c2}" opacity="0.5"/>`;
      case 'planet':
        return `
          <circle cx="50" cy="53" r="28" fill="${c1}"/>
          <ellipse cx="50" cy="56" rx="42" ry="11" fill="none" stroke="${c2}" stroke-width="5" transform="rotate(-18 50 56)"/>
          <ellipse cx="50" cy="62" rx="18" ry="12" fill="${c2}" opacity="0.45"/>`;
      case 'donut':
        return `
          <circle cx="50" cy="54" r="30" fill="${c1}"/>
          <circle cx="50" cy="54" r="10" fill="#3a2b3a" opacity="0.18"/>
          <path d="M22 46 Q50 30 78 46 L78 40 Q50 24 22 40 Z" fill="${c2}"/>
          <circle cx="34" cy="48" r="2" fill="#ff6b8a"/>
          <circle cx="66" cy="48" r="2" fill="#6bd6d0"/>
          <circle cx="50" cy="40" r="2" fill="#a98bff"/>`;
      case 'ghost':
        return `
          <path d="M22 56 C22 32 78 32 78 56 L78 80 L70 73 L62 80 L54 73 L46 80 L38 73 L30 80 L22 73 Z" fill="${c1}"/>
          <ellipse cx="50" cy="62" rx="16" ry="11" fill="${c2}" opacity="0.45"/>`;
      case 'dino':
        return `
          <path d="M40 22 L45 32 L50 20 L55 32 L60 22 L62 40 L38 40 Z" fill="${c2}"/>
          <circle cx="50" cy="56" r="29" fill="${c1}"/>
          <ellipse cx="50" cy="64" rx="19" ry="13" fill="${c2}" opacity="0.5"/>`;
      case 'heart':
        return `
          <path d="M50 80 C18 58 22 30 42 30 C49 30 50 38 50 38 C50 38 51 30 58 30 C78 30 82 58 50 80 Z" fill="${c1}"/>
          <ellipse cx="50" cy="58" rx="15" ry="10" fill="${c2}" opacity="0.45"/>`;
      case 'cloud':
        return `
          <circle cx="34" cy="56" r="16" fill="${c1}"/>
          <circle cx="50" cy="48" r="20" fill="${c1}"/>
          <circle cx="66" cy="56" r="16" fill="${c1}"/>
          <rect x="30" y="56" width="40" height="16" rx="8" fill="${c1}"/>
          <ellipse cx="50" cy="62" rx="16" ry="9" fill="${c2}" opacity="0.4"/>`;
      case 'crown':
        return `
          <path d="M30 26 L38 38 L50 24 L62 38 L70 26 L72 44 L28 44 Z" fill="#ffcf3a" stroke="#ffe27a" stroke-width="1.5"/>
          <circle cx="30" cy="26" r="3" fill="#ff6b8a"/>
          <circle cx="50" cy="22" r="3" fill="#6bd6d0"/>
          <circle cx="70" cy="26" r="3" fill="#a98bff"/>
          <circle cx="50" cy="58" r="28" fill="${c1}"/>
          <ellipse cx="50" cy="66" rx="19" ry="12" fill="${c2}" opacity="0.5"/>`;
      case 'blob':
      default:
        return `
          <rect x="20" y="28" width="60" height="54" rx="28" ry="29" fill="${c1}"/>
          <ellipse cx="50" cy="64" rx="21" ry="14" fill="${c2}" opacity="0.5"/>`;
    }
  }

  // Returns an <svg> string. When locked, draws a grey silhouette + "?".
  function svg(id, opts) {
    opts = opts || {};
    const s = get(id);
    if (!s) return '';
    const cls = `squishy-svg squishy-${s.rarity}${opts.locked ? ' locked' : ''}`;
    if (opts.locked) {
      return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="Locked squishy">
        <g opacity="0.9">${body(s.shape, '#454564', '#3a3a55')}</g>
        <text x="50" y="60" text-anchor="middle" font-size="30" font-weight="700" fill="#6f6f95">?</text>
      </svg>`;
    }
    const hasFace = !['donut'].includes(s.shape) ? face() : '';
    return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="${s.name}">
      ${body(s.shape, s.palette[0], s.palette[1])}
      ${gloss()}
      ${hasFace}
    </svg>`;
  }

  function rarityRank(id) {
    const s = get(id);
    return s ? (RARITY_ORDER[s.rarity] || 0) : 0;
  }

  return { SQUISHIES, isOwned, count, total, get, list, checkUnlocks, svg, rarityRank };
})();
