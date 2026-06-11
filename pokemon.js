// --- Space Quest — Poké Galaxy ---
// Pokémon quizzes for early readers: silhouette identity ("Who's that
// Pokémon?"), type matching, and evolutions — all answered by tapping
// big picture/word buttons, no typing needed.
// Artwork comes from the PokeAPI sprites CDN (national dex ids).

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
  { id: 16, name: 'Pidgey', type: 'flying', evolvesTo: ['Pidgeotto'] },
  { id: 17, name: 'Pidgeotto', type: 'flying', evolvesTo: ['Pidgeot'] },
  { id: 18, name: 'Pidgeot', type: 'flying' },
  { id: 25, name: 'Pikachu', type: 'electric', evolvesTo: ['Raichu'] },
  { id: 26, name: 'Raichu', type: 'electric' },
  { id: 27, name: 'Sandshrew', type: 'ground', evolvesTo: ['Sandslash'] },
  { id: 28, name: 'Sandslash', type: 'ground' },
  { id: 37, name: 'Vulpix', type: 'fire', evolvesTo: ['Ninetales'] },
  { id: 38, name: 'Ninetales', type: 'fire' },
  { id: 39, name: 'Jigglypuff', type: 'fairy', evolvesTo: ['Wigglytuff'] },
  { id: 40, name: 'Wigglytuff', type: 'fairy' },
  { id: 41, name: 'Zubat', type: 'poison', evolvesTo: ['Golbat'] },
  { id: 42, name: 'Golbat', type: 'poison' },
  { id: 43, name: 'Oddish', type: 'grass', evolvesTo: ['Gloom'] },
  { id: 44, name: 'Gloom', type: 'grass' },
  { id: 52, name: 'Meowth', type: 'normal', evolvesTo: ['Persian'] },
  { id: 53, name: 'Persian', type: 'normal' },
  { id: 54, name: 'Psyduck', type: 'water', evolvesTo: ['Golduck'] },
  { id: 55, name: 'Golduck', type: 'water' },
  { id: 58, name: 'Growlithe', type: 'fire', evolvesTo: ['Arcanine'] },
  { id: 59, name: 'Arcanine', type: 'fire' },
  { id: 60, name: 'Poliwag', type: 'water', evolvesTo: ['Poliwhirl'] },
  { id: 61, name: 'Poliwhirl', type: 'water' },
  { id: 63, name: 'Abra', type: 'psychic', evolvesTo: ['Kadabra'] },
  { id: 64, name: 'Kadabra', type: 'psychic' },
  { id: 66, name: 'Machop', type: 'fighting', evolvesTo: ['Machoke'] },
  { id: 67, name: 'Machoke', type: 'fighting' },
  { id: 74, name: 'Geodude', type: 'rock', evolvesTo: ['Graveler'] },
  { id: 75, name: 'Graveler', type: 'rock' },
  { id: 79, name: 'Slowpoke', type: 'psychic', evolvesTo: ['Slowbro'] },
  { id: 80, name: 'Slowbro', type: 'psychic' },
  { id: 81, name: 'Magnemite', type: 'electric', evolvesTo: ['Magneton'] },
  { id: 82, name: 'Magneton', type: 'electric' },
  { id: 92, name: 'Gastly', type: 'ghost', evolvesTo: ['Haunter'] },
  { id: 93, name: 'Haunter', type: 'ghost', evolvesTo: ['Gengar'] },
  { id: 94, name: 'Gengar', type: 'ghost' },
  { id: 95, name: 'Onix', type: 'rock' },
  { id: 98, name: 'Krabby', type: 'water', evolvesTo: ['Kingler'] },
  { id: 99, name: 'Kingler', type: 'water' },
  { id: 104, name: 'Cubone', type: 'ground', evolvesTo: ['Marowak'] },
  { id: 105, name: 'Marowak', type: 'ground' },
  { id: 116, name: 'Horsea', type: 'water', evolvesTo: ['Seadra'] },
  { id: 117, name: 'Seadra', type: 'water' },
  { id: 120, name: 'Staryu', type: 'water', evolvesTo: ['Starmie'] },
  { id: 121, name: 'Starmie', type: 'water' },
  { id: 129, name: 'Magikarp', type: 'water', evolvesTo: ['Gyarados'] },
  { id: 130, name: 'Gyarados', type: 'water' },
  { id: 131, name: 'Lapras', type: 'water' },
  { id: 132, name: 'Ditto', type: 'normal' },
  { id: 133, name: 'Eevee', type: 'normal', evolvesTo: ['Vaporeon', 'Jolteon', 'Flareon'] },
  { id: 134, name: 'Vaporeon', type: 'water' },
  { id: 135, name: 'Jolteon', type: 'electric' },
  { id: 136, name: 'Flareon', type: 'fire' },
  { id: 143, name: 'Snorlax', type: 'normal' },
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

function pokeSpriteURL(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function pokeByName(name) {
  return POKEDEX.find(p => p.name === name);
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

function buildPokemonQuestion(level) {
  if (level === 'identity') {
    const p = pokePickRandom(POKEDEX);
    const others = pokePickOthers(POKEDEX, 2, x => x.name === p.name);
    const choices = pokeShuffle([p, ...others]).map(x => ({ html: x.name, value: x.name }));
    return {
      op: 'pokemon',
      html: `<div class="prompt-line">Who's that Pokémon?</div><img class="poke-img silhouette" src="${pokeSpriteURL(p.id)}" alt="Mystery Pokémon">`,
      choices: choices,
      promptText: "Who's that Pokémon?",
      expected: p.name,
      silhouette: true,
      teach: `It's ${p.name}! ${POKE_TYPE_LABELS[p.type].split(' ')[0]}`
    };
  }

  if (level === 'type') {
    const p = pokePickRandom(POKEDEX);
    const otherTypes = pokePickOthers(Object.keys(POKE_TYPE_LABELS), 2, t => t === p.type);
    const choices = pokeShuffle([p.type, ...otherTypes]).map(t => ({ html: POKE_TYPE_LABELS[t], value: t }));
    return {
      op: 'pokemon',
      html: `<div class="prompt-line">What type is <b>${p.name}</b>?</div><img class="poke-img" src="${pokeSpriteURL(p.id)}" alt="${p.name}">`,
      choices: choices,
      promptText: `${p.name}'s type`,
      expected: p.type,
      teach: `${p.name} is a ${POKE_TYPE_LABELS[p.type]} type!`
    };
  }

  // evolution
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
    teach: `${p.name} evolves into ${correctName}! ✨`
  };
}
