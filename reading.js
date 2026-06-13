// --- Space Quest — Reading Rocket (early literacy for pre-readers) ---
// Listen-and-tap phonics: the child hears a sound or word (spoken by the
// browser's speech engine) and taps a picture, letter, or word. Nothing is
// typed and the child never has to speak, so articulation is never tested.
//
// FOCUS_SOUNDS get extra airtime so a child working on those sounds hears
// many clear, correct models of them. Tune this list to the child.
// (Built for a learner practising L, W and F.)
const FOCUS_SOUNDS = ['l', 'w', 'f'];

// word, emoji, and the letter its FIRST SOUND maps to
const READ_PICS = [
  { w: 'fish', e: '🐟', f: 'f' }, { w: 'fan', e: '🪭', f: 'f' }, { w: 'fox', e: '🦊', f: 'f' },
  { w: 'frog', e: '🐸', f: 'f' }, { w: 'foot', e: '🦶', f: 'f' }, { w: 'fork', e: '🍴', f: 'f' },
  { w: 'fire', e: '🔥', f: 'f' }, { w: 'feather', e: '🪶', f: 'f' }, { w: 'flower', e: '🌸', f: 'f' },
  { w: 'lion', e: '🦁', f: 'l' }, { w: 'leg', e: '🦵', f: 'l' }, { w: 'leaf', e: '🍃', f: 'l' },
  { w: 'lemon', e: '🍋', f: 'l' }, { w: 'lock', e: '🔒', f: 'l' }, { w: 'log', e: '🪵', f: 'l' },
  { w: 'lollipop', e: '🍭', f: 'l' }, { w: 'ladybird', e: '🐞', f: 'l' }, { w: 'lamp', e: '🛋️', f: 'l' },
  { w: 'web', e: '🕸️', f: 'w' }, { w: 'wolf', e: '🐺', f: 'w' }, { w: 'watch', e: '⌚', f: 'w' },
  { w: 'wave', e: '🌊', f: 'w' }, { w: 'window', e: '🪟', f: 'w' }, { w: 'worm', e: '🪱', f: 'w' },
  { w: 'water', e: '💧', f: 'w' }, { w: 'wing', e: '🪽', f: 'w' }, { w: 'watermelon', e: '🍉', f: 'w' },
  { w: 'cat', e: '🐱', f: 'c' }, { w: 'dog', e: '🐶', f: 'd' }, { w: 'sun', e: '☀️', f: 's' },
  { w: 'moon', e: '🌙', f: 'm' }, { w: 'apple', e: '🍎', f: 'a' }, { w: 'ball', e: '⚽', f: 'b' },
  { w: 'bird', e: '🐦', f: 'b' }, { w: 'duck', e: '🦆', f: 'd' }, { w: 'egg', e: '🥚', f: 'e' },
  { w: 'goat', e: '🐐', f: 'g' }, { w: 'hat', e: '🎩', f: 'h' }, { w: 'jam', e: '🍯', f: 'j' },
  { w: 'kite', e: '🪁', f: 'k' }, { w: 'mouse', e: '🐭', f: 'm' }, { w: 'pig', e: '🐷', f: 'p' },
  { w: 'rat', e: '🐀', f: 'r' }, { w: 'snake', e: '🐍', f: 's' }, { w: 'tree', e: '🌳', f: 't' },
  { w: 'van', e: '🚐', f: 'v' }, { w: 'box', e: '📦', f: 'b' }, { w: 'car', e: '🚗', f: 'c' },
  { w: 'star', e: '⭐', f: 's' }, { w: 'bee', e: '🐝', f: 'b' }, { w: 'cake', e: '🎂', f: 'c' },
  { w: 'sock', e: '🧦', f: 's' }, { w: 'hand', e: '✋', f: 'h' }, { w: 'gift', e: '🎁', f: 'g' },
];

// Rhyme families — each needs at least two picturable members
const READ_RHYMES = [
  [{ w: 'cat', e: '🐱' }, { w: 'hat', e: '🎩' }, { w: 'bat', e: '🦇' }, { w: 'rat', e: '🐀' }],
  [{ w: 'dog', e: '🐶' }, { w: 'frog', e: '🐸' }, { w: 'log', e: '🪵' }],
  [{ w: 'star', e: '⭐' }, { w: 'car', e: '🚗' }, { w: 'jar', e: '🫙' }],
  [{ w: 'bee', e: '🐝' }, { w: 'tree', e: '🌳' }, { w: 'key', e: '🔑' }],
  [{ w: 'sun', e: '☀️' }, { w: 'bun', e: '🍞' }],
  [{ w: 'ball', e: '⚽' }, { w: 'wall', e: '🧱' }],
  [{ w: 'fox', e: '🦊' }, { w: 'box', e: '📦' }, { w: 'socks', e: '🧦' }],
  [{ w: 'moon', e: '🌙' }, { w: 'spoon', e: '🥄' }],
  [{ w: 'cake', e: '🎂' }, { w: 'snake', e: '🐍' }],
  [{ w: 'bed', e: '🛏️' }, { w: 'sled', e: '🛷' }],
  [{ w: 'fish', e: '🐟' }, { w: 'dish', e: '🍽️' }],
  [{ w: 'frog', e: '🐸' }, { w: 'log', e: '🪵' }, { w: 'dog', e: '🐶' }],
];

// High-frequency "sight" words a new reader learns whole, not by sounding out.
// Focus-sound starters (l/w/f) are flagged so we can give them extra airtime.
const READ_SIGHT = [
  'the', 'and', 'is', 'it', 'in', 'at', 'on', 'up', 'to', 'a', 'see', 'can', 'go',
  'my', 'me', 'he', 'she', 'you', 'are', 'was', 'said', 'look', 'come', 'here',
  'this', 'that', 'big', 'am', 'an', 'get', 'had', 'yes', 'no', 'we', 'like',
  'love', 'little', 'will', 'want', 'with', 'were', 'for', 'from', 'fun', 'look',
];
const READ_SIGHT_FOCUS = ['look', 'like', 'love', 'little', 'will', 'want', 'with', 'were', 'for', 'from', 'fun', 'we'];

// CVC (consonant-vowel-consonant) words to build from letter tiles
const READ_CVC = [
  { w: 'cat', e: '🐱' }, { w: 'dog', e: '🐶' }, { w: 'sun', e: '☀️' }, { w: 'pig', e: '🐷' },
  { w: 'hat', e: '🎩' }, { w: 'bed', e: '🛏️' }, { w: 'box', e: '📦' }, { w: 'cup', e: '☕' },
  { w: 'bus', e: '🚌' }, { w: 'jam', e: '🍯' }, { w: 'rat', e: '🐀' }, { w: 'hen', e: '🐔' },
  { w: 'bug', e: '🐛' }, { w: 'net', e: '🥅' }, { w: 'pot', e: '🍲' }, { w: 'van', e: '🚐' },
  // focus sounds (l/w/f)
  { w: 'log', e: '🪵' }, { w: 'leg', e: '🦵' }, { w: 'lip', e: '👄' }, { w: 'fan', e: '🪭' },
  { w: 'fox', e: '🦊' }, { w: 'web', e: '🕸️' }, { w: 'fig', e: '🍐' }, { w: 'wig', e: '👱' },
];

function readShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function readPick(list) { return list[Math.floor(Math.random() * list.length)]; }

// Pick a picture, biased toward the focus sounds about half the time
function readPickPic() {
  if (Math.random() < 0.5) {
    const f = readPick(FOCUS_SOUNDS);
    const pool = READ_PICS.filter(p => p.f === f);
    if (pool.length) return readPick(pool);
  }
  return readPick(READ_PICS);
}

function bigEmoji(e) { return `<span class="reading-pic-choice">${e}</span>`; }
function bigLetter(l) { return `<span class="reading-letter">${l}</span>`; }

// --- My Reading Words: parent-entered list (e.g. Reading Eggs words) ---
const ReadingWords = (() => {
  const KEY = 'space_quest_reading_words_v1';
  function load() {
    try {
      const raw = localStorage.getItem(Players.key(KEY));
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function save(words) {
    localStorage.setItem(Players.key(KEY), JSON.stringify(words));
  }
  return { load, save };
})();

function buildReadingQuestion(level) {
  if (level === 'letters') {
    const pic = readPickPic();
    const others = readShuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(l => l !== pic.f)).slice(0, 2);
    const choices = readShuffle([pic.f, ...others]);
    return {
      op: 'reading',
      say: pic.w,
      html: `<div class="prompt-line">${bigEmoji(pic.e)}</div><div class="prompt-line story-which-op">Which letter does <b>${pic.w}</b> start with? ${spellSpeakBtn(pic.w)}</div>`,
      choices: choices.map(l => ({ html: bigLetter(l), value: l })),
      promptText: `${pic.w} starts with?`,
      expected: pic.f,
      teach: `<b>${pic.w}</b> starts with the <b>${pic.f}</b> sound — ${pic.e}`
    };
  }

  if (level === 'soundmatch') {
    const target = readPickPic();
    const sameSound = READ_PICS.filter(p => p.f === target.f && p.w !== target.w);
    if (!sameSound.length) return buildReadingQuestion('letters'); // safety fallback
    const correct = readPick(sameSound);
    const distractors = readShuffle(READ_PICS.filter(p => p.f !== target.f)).slice(0, 2);
    const choices = readShuffle([correct, ...distractors]);
    return {
      op: 'reading',
      say: target.w,
      html: `<div class="prompt-line">${bigEmoji(target.e)}</div><div class="prompt-line story-which-op">Tap the one that starts like <b>${target.w}</b>! ${spellSpeakBtn(target.w)}</div>`,
      choices: choices.map(p => ({ html: bigEmoji(p.e), value: p.w })),
      promptText: `starts like ${target.w}`,
      expected: correct.w,
      teach: `<b>${target.w}</b> and <b>${correct.w}</b> both start with the <b>${target.f}</b> sound!`
    };
  }

  if (level === 'rhyme') {
    const fam = readPick(READ_RHYMES.filter(f => f.length >= 2));
    const picks = readShuffle(fam).slice(0, 2);
    const target = picks[0], correct = picks[1];
    const otherWords = READ_RHYMES.filter(f => f !== fam).flat();
    const distractors = readShuffle(otherWords).slice(0, 2);
    const choices = readShuffle([correct, ...distractors]);
    return {
      op: 'reading',
      say: target.w,
      html: `<div class="prompt-line">${bigEmoji(target.e)}</div><div class="prompt-line story-which-op">Tap the picture that rhymes with <b>${target.w}</b>! ${spellSpeakBtn(target.w)}</div>`,
      choices: choices.map(p => ({ html: bigEmoji(p.e), value: p.w })),
      promptText: `rhymes with ${target.w}`,
      expected: correct.w,
      teach: `<b>${target.w}</b> and <b>${correct.w}</b> rhyme — they end with the same sound!`
    };
  }

  if (level === 'sight') {
    const word = Math.random() < 0.5 ? readPick(READ_SIGHT_FOCUS) : readPick(READ_SIGHT);
    const others = readShuffle(READ_SIGHT.filter(w => w !== word)).slice(0, 2);
    const choices = readShuffle([word, ...others]);
    return {
      op: 'reading',
      say: word,
      html: `<div class="prompt-line">👂 Tap the word you hear ${spellSpeakBtn(word)}</div>`,
      choices: choices.map(w => ({ html: `<span class="reading-sight">${w}</span>`, value: w })),
      promptText: `hear: ${word}`,
      expected: word,
      teach: `That word is <b>${word}</b>. Listen and look — you'll know it next time!`
    };
  }

  if (level === 'cvc') {
    const c = readPick(READ_CVC);
    return {
      op: 'reading',
      say: c.w,
      spellWord: c.w.toUpperCase(),
      html: `<div class="prompt-line">${bigEmoji(c.e)}</div><div class="prompt-line story-which-op">Listen, then tap the letters to build <b>${c.w}</b>! ${spellSpeakBtn(c.w)}</div>`,
      promptText: c.w,
      expected: c.w,
      teach: `Sound it out: ${c.w.split('').join('-')} → <b>${c.w}</b> ${c.e}`
    };
  }

  // myreading: parent-entered words (Reading Eggs / school list)
  const list = ReadingWords.load();
  const word = readPick(list).toLowerCase();
  const buildable = word.length >= 2 && word.length <= 8;
  if (buildable && Math.random() < 0.4) {
    return {
      op: 'reading',
      say: word,
      spellWord: word.toUpperCase(),
      html: `<div class="prompt-line">📖 One of YOUR reading words!</div><div class="prompt-line story-which-op">Listen, then build it! ${spellSpeakBtn(word)}</div>`,
      promptText: word,
      expected: word,
      teach: `That word is <b>${word}</b> — great reading!`
    };
  }
  const pool = readShuffle([...new Set([...list.map(w => w.toLowerCase()), ...READ_SIGHT])].filter(w => w !== word));
  const choices = readShuffle([word, ...pool.slice(0, 2)]);
  return {
    op: 'reading',
    say: word,
    html: `<div class="prompt-line">📖 Tap your reading word ${spellSpeakBtn(word)}</div>`,
    choices: choices.map(w => ({ html: `<span class="reading-sight">${w}</span>`, value: w })),
    promptText: `hear: ${word}`,
    expected: word,
    teach: `That word is <b>${word}</b> — great reading!`
  };
}
