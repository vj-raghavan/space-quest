// --- Space Quest — Poké Galaxy ---
// Pokémon quizzes for early readers, answered by tapping big picture/word
// buttons. Includes the player's personal Pokédex: every correct answer
// catches the featured Pokémon. Artwork from the PokeAPI sprites CDN.

// The full original 151 (kid-friendly primary types; evolutions within Gen 1)
const POKEDEX = [
  { id: 1, name: 'Bulbasaur', type: 'grass', evolvesTo: ['Ivysaur'] },
  { id: 2, name: 'Ivysaur', type: 'grass', evolvesTo: ['Venusaur'] },
  { id: 3, name: 'Venusaur', type: 'grass' },
  { id: 4, name: 'Charmander', type: 'fire', evolvesTo: ['Charmeleon'] },
  { id: 5, name: 'Charmeleon', type: 'fire', evolvesTo: ['Charizard'] },
  { id: 6, name: 'Charizard', type: 'fire' },
  { id: 7, name: 'Squirtle', type: 'water', evolvesTo: ['Wartortle'] },
  { id: 8, name: 'Wartortle', type: 'water', evolvesTo: ['Blastoise'] },
  { id: 9, name: 'Blastoise', type: 'water' },
  { id: 10, name: 'Caterpie', type: 'bug', evolvesTo: ['Metapod'] },
  { id: 11, name: 'Metapod', type: 'bug', evolvesTo: ['Butterfree'] },
  { id: 12, name: 'Butterfree', type: 'bug' },
  { id: 13, name: 'Weedle', type: 'bug', evolvesTo: ['Kakuna'] },
  { id: 14, name: 'Kakuna', type: 'bug', evolvesTo: ['Beedrill'] },
  { id: 15, name: 'Beedrill', type: 'bug' },
  { id: 16, name: 'Pidgey', type: 'flying', evolvesTo: ['Pidgeotto'] },
  { id: 17, name: 'Pidgeotto', type: 'flying', evolvesTo: ['Pidgeot'] },
  { id: 18, name: 'Pidgeot', type: 'flying' },
  { id: 19, name: 'Rattata', type: 'normal', evolvesTo: ['Raticate'] },
  { id: 20, name: 'Raticate', type: 'normal' },
  { id: 21, name: 'Spearow', type: 'flying', evolvesTo: ['Fearow'] },
  { id: 22, name: 'Fearow', type: 'flying' },
  { id: 23, name: 'Ekans', type: 'poison', evolvesTo: ['Arbok'] },
  { id: 24, name: 'Arbok', type: 'poison' },
  { id: 25, name: 'Pikachu', type: 'electric', evolvesTo: ['Raichu'] },
  { id: 26, name: 'Raichu', type: 'electric' },
  { id: 27, name: 'Sandshrew', type: 'ground', evolvesTo: ['Sandslash'] },
  { id: 28, name: 'Sandslash', type: 'ground' },
  { id: 29, name: 'Nidoran♀', type: 'poison', evolvesTo: ['Nidorina'] },
  { id: 30, name: 'Nidorina', type: 'poison', evolvesTo: ['Nidoqueen'] },
  { id: 31, name: 'Nidoqueen', type: 'poison' },
  { id: 32, name: 'Nidoran♂', type: 'poison', evolvesTo: ['Nidorino'] },
  { id: 33, name: 'Nidorino', type: 'poison', evolvesTo: ['Nidoking'] },
  { id: 34, name: 'Nidoking', type: 'poison' },
  { id: 35, name: 'Clefairy', type: 'fairy', evolvesTo: ['Clefable'] },
  { id: 36, name: 'Clefable', type: 'fairy' },
  { id: 37, name: 'Vulpix', type: 'fire', evolvesTo: ['Ninetales'] },
  { id: 38, name: 'Ninetales', type: 'fire' },
  { id: 39, name: 'Jigglypuff', type: 'fairy', evolvesTo: ['Wigglytuff'] },
  { id: 40, name: 'Wigglytuff', type: 'fairy' },
  { id: 41, name: 'Zubat', type: 'poison', evolvesTo: ['Golbat'] },
  { id: 42, name: 'Golbat', type: 'poison' },
  { id: 43, name: 'Oddish', type: 'grass', evolvesTo: ['Gloom'] },
  { id: 44, name: 'Gloom', type: 'grass', evolvesTo: ['Vileplume'] },
  { id: 45, name: 'Vileplume', type: 'grass' },
  { id: 46, name: 'Paras', type: 'bug', evolvesTo: ['Parasect'] },
  { id: 47, name: 'Parasect', type: 'bug' },
  { id: 48, name: 'Venonat', type: 'bug', evolvesTo: ['Venomoth'] },
  { id: 49, name: 'Venomoth', type: 'bug' },
  { id: 50, name: 'Diglett', type: 'ground', evolvesTo: ['Dugtrio'] },
  { id: 51, name: 'Dugtrio', type: 'ground' },
  { id: 52, name: 'Meowth', type: 'normal', evolvesTo: ['Persian'] },
  { id: 53, name: 'Persian', type: 'normal' },
  { id: 54, name: 'Psyduck', type: 'water', evolvesTo: ['Golduck'] },
  { id: 55, name: 'Golduck', type: 'water' },
  { id: 56, name: 'Mankey', type: 'fighting', evolvesTo: ['Primeape'] },
  { id: 57, name: 'Primeape', type: 'fighting' },
  { id: 58, name: 'Growlithe', type: 'fire', evolvesTo: ['Arcanine'] },
  { id: 59, name: 'Arcanine', type: 'fire' },
  { id: 60, name: 'Poliwag', type: 'water', evolvesTo: ['Poliwhirl'] },
  { id: 61, name: 'Poliwhirl', type: 'water', evolvesTo: ['Poliwrath'] },
  { id: 62, name: 'Poliwrath', type: 'water' },
  { id: 63, name: 'Abra', type: 'psychic', evolvesTo: ['Kadabra'] },
  { id: 64, name: 'Kadabra', type: 'psychic', evolvesTo: ['Alakazam'] },
  { id: 65, name: 'Alakazam', type: 'psychic' },
  { id: 66, name: 'Machop', type: 'fighting', evolvesTo: ['Machoke'] },
  { id: 67, name: 'Machoke', type: 'fighting', evolvesTo: ['Machamp'] },
  { id: 68, name: 'Machamp', type: 'fighting' },
  { id: 69, name: 'Bellsprout', type: 'grass', evolvesTo: ['Weepinbell'] },
  { id: 70, name: 'Weepinbell', type: 'grass', evolvesTo: ['Victreebel'] },
  { id: 71, name: 'Victreebel', type: 'grass' },
  { id: 72, name: 'Tentacool', type: 'water', evolvesTo: ['Tentacruel'] },
  { id: 73, name: 'Tentacruel', type: 'water' },
  { id: 74, name: 'Geodude', type: 'rock', evolvesTo: ['Graveler'] },
  { id: 75, name: 'Graveler', type: 'rock', evolvesTo: ['Golem'] },
  { id: 76, name: 'Golem', type: 'rock' },
  { id: 77, name: 'Ponyta', type: 'fire', evolvesTo: ['Rapidash'] },
  { id: 78, name: 'Rapidash', type: 'fire' },
  { id: 79, name: 'Slowpoke', type: 'psychic', evolvesTo: ['Slowbro'] },
  { id: 80, name: 'Slowbro', type: 'psychic' },
  { id: 81, name: 'Magnemite', type: 'electric', evolvesTo: ['Magneton'] },
  { id: 82, name: 'Magneton', type: 'electric' },
  { id: 83, name: "Farfetch'd", type: 'flying' },
  { id: 84, name: 'Doduo', type: 'flying', evolvesTo: ['Dodrio'] },
  { id: 85, name: 'Dodrio', type: 'flying' },
  { id: 86, name: 'Seel', type: 'water', evolvesTo: ['Dewgong'] },
  { id: 87, name: 'Dewgong', type: 'ice' },
  { id: 88, name: 'Grimer', type: 'poison', evolvesTo: ['Muk'] },
  { id: 89, name: 'Muk', type: 'poison' },
  { id: 90, name: 'Shellder', type: 'water', evolvesTo: ['Cloyster'] },
  { id: 91, name: 'Cloyster', type: 'ice' },
  { id: 92, name: 'Gastly', type: 'ghost', evolvesTo: ['Haunter'] },
  { id: 93, name: 'Haunter', type: 'ghost', evolvesTo: ['Gengar'] },
  { id: 94, name: 'Gengar', type: 'ghost' },
  { id: 95, name: 'Onix', type: 'rock' },
  { id: 96, name: 'Drowzee', type: 'psychic', evolvesTo: ['Hypno'] },
  { id: 97, name: 'Hypno', type: 'psychic' },
  { id: 98, name: 'Krabby', type: 'water', evolvesTo: ['Kingler'] },
  { id: 99, name: 'Kingler', type: 'water' },
  { id: 100, name: 'Voltorb', type: 'electric', evolvesTo: ['Electrode'] },
  { id: 101, name: 'Electrode', type: 'electric' },
  { id: 102, name: 'Exeggcute', type: 'grass', evolvesTo: ['Exeggutor'] },
  { id: 103, name: 'Exeggutor', type: 'grass' },
  { id: 104, name: 'Cubone', type: 'ground', evolvesTo: ['Marowak'] },
  { id: 105, name: 'Marowak', type: 'ground' },
  { id: 106, name: 'Hitmonlee', type: 'fighting' },
  { id: 107, name: 'Hitmonchan', type: 'fighting' },
  { id: 108, name: 'Lickitung', type: 'normal' },
  { id: 109, name: 'Koffing', type: 'poison', evolvesTo: ['Weezing'] },
  { id: 110, name: 'Weezing', type: 'poison' },
  { id: 111, name: 'Rhyhorn', type: 'ground', evolvesTo: ['Rhydon'] },
  { id: 112, name: 'Rhydon', type: 'ground' },
  { id: 113, name: 'Chansey', type: 'normal' },
  { id: 114, name: 'Tangela', type: 'grass' },
  { id: 115, name: 'Kangaskhan', type: 'normal' },
  { id: 116, name: 'Horsea', type: 'water', evolvesTo: ['Seadra'] },
  { id: 117, name: 'Seadra', type: 'water' },
  { id: 118, name: 'Goldeen', type: 'water', evolvesTo: ['Seaking'] },
  { id: 119, name: 'Seaking', type: 'water' },
  { id: 120, name: 'Staryu', type: 'water', evolvesTo: ['Starmie'] },
  { id: 121, name: 'Starmie', type: 'water' },
  { id: 122, name: 'Mr. Mime', type: 'psychic' },
  { id: 123, name: 'Scyther', type: 'bug' },
  { id: 124, name: 'Jynx', type: 'ice' },
  { id: 125, name: 'Electabuzz', type: 'electric' },
  { id: 126, name: 'Magmar', type: 'fire' },
  { id: 127, name: 'Pinsir', type: 'bug' },
  { id: 128, name: 'Tauros', type: 'normal' },
  { id: 129, name: 'Magikarp', type: 'water', evolvesTo: ['Gyarados'] },
  { id: 130, name: 'Gyarados', type: 'water' },
  { id: 131, name: 'Lapras', type: 'water' },
  { id: 132, name: 'Ditto', type: 'normal' },
  { id: 133, name: 'Eevee', type: 'normal', evolvesTo: ['Vaporeon', 'Jolteon', 'Flareon'] },
  { id: 134, name: 'Vaporeon', type: 'water' },
  { id: 135, name: 'Jolteon', type: 'electric' },
  { id: 136, name: 'Flareon', type: 'fire' },
  { id: 137, name: 'Porygon', type: 'normal' },
  { id: 138, name: 'Omanyte', type: 'rock', evolvesTo: ['Omastar'] },
  { id: 139, name: 'Omastar', type: 'rock' },
  { id: 140, name: 'Kabuto', type: 'rock', evolvesTo: ['Kabutops'] },
  { id: 141, name: 'Kabutops', type: 'rock' },
  { id: 142, name: 'Aerodactyl', type: 'rock' },
  { id: 143, name: 'Snorlax', type: 'normal' },
  { id: 144, name: 'Articuno', type: 'ice' },
  { id: 145, name: 'Zapdos', type: 'electric' },
  { id: 146, name: 'Moltres', type: 'fire' },
  { id: 147, name: 'Dratini', type: 'dragon', evolvesTo: ['Dragonair'] },
  { id: 148, name: 'Dragonair', type: 'dragon', evolvesTo: ['Dragonite'] },
  { id: 149, name: 'Dragonite', type: 'dragon' },
  { id: 150, name: 'Mewtwo', type: 'psychic' },
  { id: 151, name: 'Mew', type: 'psychic' },
];

const POKE_TYPE_LABELS = {
  fire: '🔥 Fire', water: '💧 Water', grass: '🌿 Grass', electric: '⚡ Electric',
  psychic: '🔮 Psychic', normal: '⭐ Normal', rock: '🪨 Rock', ground: '⛰️ Ground',
  ghost: '👻 Ghost', bug: '🐛 Bug', fighting: '🥊 Fighting', poison: '🟣 Poison',
  flying: '🕊️ Flying', dragon: '🐉 Dragon', fairy: '🧚 Fairy', ice: '❄️ Ice'
};

// Kid-level type matchups for Battle Match: type -> types that beat it
const POKE_BEATEN_BY = {
  fire: ['water', 'rock'],
  water: ['electric', 'grass'],
  grass: ['fire', 'ice'],
  electric: ['ground'],
  ice: ['fire'],
  bug: ['fire'],
  rock: ['water', 'grass'],
  flying: ['electric'],
  ground: ['water', 'ice']
};

const POKE_BATTLE_EXPLAIN = {
  'water>fire': 'Water splashes the fire out! 💦',
  'rock>fire': 'Rocks smother the flames! 🪨',
  'electric>water': 'Zap! Electricity shocks water! ⚡',
  'grass>water': 'Grass drinks up all the water! 🌿',
  'fire>grass': 'Fire burns the grass! 🔥',
  'ice>grass': 'Ice freezes the plants! ❄️',
  'ground>electric': 'The ground blocks the zap! ⛰️',
  'fire>ice': 'Fire melts the ice! 🔥',
  'fire>bug': 'Bugs run away from fire! 🔥',
  'water>rock': 'Water washes the rocks away! 💧',
  'grass>rock': 'Plants crack right through rock! 🌿',
  'electric>flying': 'Lightning strikes the sky! ⚡',
  'water>ground': 'Water turns the ground to mud! 💧',
  'ice>ground': 'Ice freezes the ground! ❄️'
};

function pokeSpriteURL(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Small 96px sprite — light enough for the Pokédex grid and counting questions
function pokeSmallSpriteURL(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function pokeByName(name) {
  return POKEDEX.find(p => p.name === name);
}

function pokeById(id) {
  return POKEDEX.find(p => p.id === id);
}

function pokePickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// n random items from list, excluding anything matching `exclude(item)`
function pokePickOthers(list, n, exclude) {
  const candidates = list.filter(item => !exclude(item));
  const out = [];
  while (out.length < n && candidates.length > 0) {
    const idx = Math.floor(Math.random() * candidates.length);
    out.push(candidates[idx]);
    candidates.splice(idx, 1);
  }
  return out;
}

function pokeShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pokeImageChoiceHTML(p) {
  return `<span class="choice-stack"><img class="choice-img" src="${pokeSpriteURL(p.id)}" alt="${p.name}"><span class="choice-caption">${p.name}</span></span>`;
}

// --- The player's personal Pokédex (per player profile) ---
const Pokedex = (() => {
  const STORE_KEY = 'space_quest_pokedex_v1';
  let caught;
  try {
    caught = new Set(JSON.parse(localStorage.getItem(Players.key(STORE_KEY))) || []);
  } catch (e) {
    caught = new Set();
  }

  function save() {
    localStorage.setItem(Players.key(STORE_KEY), JSON.stringify([...caught]));
  }

  function isCaught(id) { return caught.has(id); }

  // Returns true only on a NEW catch
  function catchPokemon(id) {
    if (caught.has(id)) return false;
    caught.add(id);
    save();
    return true;
  }

  function count() { return caught.size; }
  function total() { return POKEDEX.length; }
  function uncaughtIds() { return POKEDEX.filter(p => !caught.has(p.id)).map(p => p.id); }

  return { isCaught, catchPokemon, count, total, uncaughtIds };
})();

// --- Question builders ---
// Every question carries catchId: answer it correctly and that Pokémon
// joins the player's Pokédex.

function buildPokemonQuestion(level) {
  if (level === 'count') return buildPokeCountQuestion();
  if (level === 'battle') return buildPokeBattleQuestion();
  if (level === 'type') return buildPokeTypeQuestion();
  if (level === 'evolution') return buildPokeEvolutionQuestion();
  return buildPokeIdentityQuestion();
}

function numberChoices(correct) {
  const wrongs = new Set();
  while (wrongs.size < 2) {
    const offset = Math.floor(Math.random() * 2) + 1;
    const w = Math.random() > 0.5 ? correct + offset : correct - offset;
    if (w >= 1 && w !== correct) wrongs.add(w);
  }
  return pokeShuffle([correct, ...wrongs]).map(n => ({ html: String(n), value: String(n) }));
}

function buildPokeCountQuestion() {
  const p = pokePickRandom(POKEDEX);
  const sprites = n => Array.from({ length: n }, () => `<img class="poke-count-img" src="${pokeSmallSpriteURL(p.id)}" alt="${p.name}">`).join('');

  if (Math.random() < 0.4) {
    // Picture addition: 3 Squirtle + 2 Squirtle
    const a = Math.floor(Math.random() * 4) + 1;
    const b = Math.floor(Math.random() * 4) + 1;
    const total = a + b;
    return {
      op: 'pokemon',
      html: `<div class="prompt-line">How many <b>${p.name}</b> altogether?</div><div class="poke-count-row"><div class="poke-count-grid">${sprites(a)}</div><span class="prompt-plus">+</span><div class="poke-count-grid">${sprites(b)}</div></div>`,
      choices: numberChoices(total),
      promptText: `${a} + ${b} ${p.name}`,
      expected: String(total),
      catchId: p.id,
      teach: `${a} + ${b} = ${total} ${p.name}! 🔢`
    };
  }

  const n = Math.floor(Math.random() * 8) + 2; // 2-9
  return {
    op: 'pokemon',
    html: `<div class="prompt-line">How many <b>${p.name}</b>?</div><div class="poke-count-grid">${sprites(n)}</div>`,
    choices: numberChoices(n),
    promptText: `count the ${p.name}`,
    expected: String(n),
    catchId: p.id,
    teach: `Count them one by one — there are ${n} ${p.name}! 🔢`
  };
}

function buildPokeIdentityQuestion() {
  const p = pokePickRandom(POKEDEX);
  const others = pokePickOthers(POKEDEX, 2, x => x.name === p.name);
  const choices = pokeShuffle([p, ...others]).map(x => ({ html: x.name, value: x.name }));
  return {
    op: 'pokemon',
    html: `<div class="prompt-line">Who's that Pokémon?</div><img class="poke-img silhouette" src="${pokeSpriteURL(p.id)}" alt="Mystery Pokémon">`,
    choices: choices,
    promptText: "Who's that Pokémon?",
    expected: p.name,
    catchId: p.id,
    silhouette: true,
    teach: `It's ${p.name}! ${POKE_TYPE_LABELS[p.type].split(' ')[0]}`
  };
}

function buildPokeTypeQuestion() {
  const p = pokePickRandom(POKEDEX);
  const otherTypes = pokePickOthers(Object.keys(POKE_TYPE_LABELS), 2, t => t === p.type);
  const choices = pokeShuffle([p.type, ...otherTypes]).map(t => ({ html: POKE_TYPE_LABELS[t], value: t }));
  return {
    op: 'pokemon',
    html: `<div class="prompt-line">What type is <b>${p.name}</b>?</div><img class="poke-img" src="${pokeSpriteURL(p.id)}" alt="${p.name}">`,
    choices: choices,
    promptText: `${p.name}'s type`,
    expected: p.type,
    catchId: p.id,
    teach: `${p.name} is a ${POKE_TYPE_LABELS[p.type]} type!`
  };
}

function buildPokeEvolutionQuestion() {
  const evolvers = POKEDEX.filter(p => p.evolvesTo && p.evolvesTo.length > 0);
  const p = pokePickRandom(evolvers);
  const correctName = pokePickRandom(p.evolvesTo);
  const correct = pokeByName(correctName);
  const wrong = pokePickOthers(POKEDEX, 2, x => x.name === p.name || p.evolvesTo.includes(x.name));
  const choices = pokeShuffle([correct, ...wrong]).map(x => ({ html: pokeImageChoiceHTML(x), value: x.name }));
  return {
    op: 'pokemon',
    html: `<div class="prompt-line">Who does <b>${p.name}</b> evolve into?</div><img class="poke-img" src="${pokeSpriteURL(p.id)}" alt="${p.name}">`,
    choices: choices,
    promptText: `${p.name} evolves into…`,
    expected: correctName,
    catchId: correct.id,
    teach: `${p.name} evolves into ${correctName}! ✨`
  };
}

function buildPokeBattleQuestion() {
  const battlers = POKEDEX.filter(p => POKE_BEATEN_BY[p.type]);
  const p = pokePickRandom(battlers);
  const counters = POKE_BEATEN_BY[p.type];
  const winner = pokePickRandom(counters);
  const wrongTypes = pokePickOthers(
    Object.keys(POKE_TYPE_LABELS), 2,
    t => counters.includes(t) || t === p.type
  );
  const choices = pokeShuffle([winner, ...wrongTypes]).map(t => ({ html: POKE_TYPE_LABELS[t], value: t }));
  const explain = POKE_BATTLE_EXPLAIN[`${winner}>${p.type}`] || `${POKE_TYPE_LABELS[winner]} beats ${POKE_TYPE_LABELS[p.type]}!`;
  return {
    op: 'pokemon',
    html: `<div class="prompt-line"><b>${p.name}</b> is a <b>${POKE_TYPE_LABELS[p.type]}</b> type.<br>Which type wins the battle against it?</div><img class="poke-img" src="${pokeSpriteURL(p.id)}" alt="${p.name}">`,
    choices: choices,
    promptText: `which type beats ${p.name}`,
    expected: winner,
    catchId: p.id,
    teach: explain
  };
}
