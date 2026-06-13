// --- Space Quest — Spelling Star Base ---
// Two question styles for the spelling planet:
//   • spot / spot2  — tap the correct spelling among misspellings (choice pad)
//   • build / build2 — assemble the word from scrambled letter tiles
// Each word carries kid-plausible misspellings and a memory hint that becomes
// the teaching moment. Clues never contain the word itself.

const SPELL_EASY = [
  { word: 'house', emoji: '🏠', clue: 'The building you live in', wrongs: ['howse', 'hous'], hint: '<b>ou</b> makes the OW sound: h-OU-se 🏠' },
  { word: 'party', emoji: '🎈', clue: 'Balloons, cake and games!', wrongs: ['partey', 'parti'], hint: 'it ends in <b>y</b> — part-Y! 🎈' },
  { word: 'happy', emoji: '😊', clue: 'How you feel on your birthday', wrongs: ['hapy', 'happe'], hint: 'double <b>p</b> and a <b>y</b> at the end! 😊' },
  { word: 'sunny', emoji: '☀️', clue: 'Bright, warm weather', wrongs: ['suny', 'sunnie'], hint: 'double the <b>n</b>: sun + n + y ☀️' },
  { word: 'candy', emoji: '🍬', clue: 'A sweet treat', wrongs: ['candey', 'kandy'], hint: 'starts with <b>c</b>, ends with <b>y</b> 🍬' },
  { word: 'tiger', emoji: '🐯', clue: 'A big striped cat', wrongs: ['tigur', 'tyger'], hint: 't-i-g-<b>er</b> — ER at the end! 🐯' },
  { word: 'water', emoji: '💧', clue: 'You drink it every day', wrongs: ['watter', 'woter'], hint: 'only ONE <b>t</b>: wa-ter 💧' },
  { word: 'sister', emoji: '👧', clue: 'A girl in your family', wrongs: ['sistur', 'sester'], hint: 'sis + <b>ter</b> 👧' },
  { word: 'pencil', emoji: '✏️', clue: 'You write with it', wrongs: ['pensil', 'pencle'], hint: 'the <b>c</b> makes the S sound: pen-CIL ✏️' },
  { word: 'rocket', emoji: '🚀', clue: 'It blasts off into space', wrongs: ['rokit', 'rockit'], hint: 'rock + <b>et</b> 🚀' },
  { word: 'planet', emoji: '🪐', clue: 'Earth and Mars are these', wrongs: ['plannet', 'planit'], hint: 'plan + <b>et</b> — one n! 🪐' },
  { word: 'monkey', emoji: '🐒', clue: 'A cheeky animal that loves bananas', wrongs: ['munkey', 'monkee'], hint: 'm-o-n-k-<b>ey</b> — EY at the end! 🐒' },
  { word: 'jungle', emoji: '🌴', clue: 'A thick forest full of animals', wrongs: ['jungel', 'jungal'], hint: 'it ends in <b>le</b>: jun-g-LE 🌴' },
  { word: 'winter', emoji: '⛄', clue: 'The coldest season', wrongs: ['wintur', 'winnter'], hint: 'win + <b>ter</b> — one n! ⛄' },
  { word: 'garden', emoji: '🌷', clue: 'Where flowers grow at home', wrongs: ['gardin', 'gardun'], hint: 'gar-d-<b>en</b> — EN at the end 🌷' },
  { word: 'yellow', emoji: '💛', clue: 'The colour of the sun', wrongs: ['yelow', 'yellaw'], hint: 'double <b>l</b>: ye-LL-ow 💛' },
  { word: 'little', emoji: '🐭', clue: 'The opposite of big', wrongs: ['littel', 'litle'], hint: 'double <b>t</b> then <b>le</b>: li-tt-le 🐭' },
  { word: 'summer', emoji: '🏖️', clue: 'The hottest season', wrongs: ['sumer', 'summur'], hint: 'double <b>m</b>: su-MM-er 🏖️' },
  { word: 'dinner', emoji: '🍽️', clue: 'The meal you eat in the evening', wrongs: ['diner', 'dinnur'], hint: 'double <b>n</b>: di-NN-er 🍽️' },
  { word: 'rabbit', emoji: '🐰', clue: 'A hopping animal with long ears', wrongs: ['rabit', 'rabbet'], hint: 'double <b>b</b>: ra-BB-it 🐰' },
  { word: 'spider', emoji: '🕷️', clue: 'It has eight legs and spins webs', wrongs: ['spyder', 'spidur'], hint: 'sp-<b>i</b>-der — i in the middle! 🕷️' },
  { word: 'dragon', emoji: '🐉', clue: 'A fire-breathing storybook creature', wrongs: ['dragun', 'draggon'], hint: 'drag + <b>on</b> — one g! 🐉' },
  { word: 'magic', emoji: '✨', clue: 'What a wizard does', wrongs: ['majic', 'magick'], hint: 'the <b>g</b> sounds like J: ma-GIC ✨' },
  { word: 'music', emoji: '🎵', clue: 'Songs and tunes you listen to', wrongs: ['musik', 'moosic'], hint: 'it ends in <b>c</b>: mu-si-C 🎵' },
];

const SPELL_TRICKY = [
  { word: 'friend', emoji: '🫶', clue: 'Someone you love to play with', wrongs: ['freind', 'frend'], hint: 'fri<b>END</b> has END in it — a friend to the END! 🫶' },
  { word: 'because', emoji: '🤔', clue: 'The word that gives a reason', wrongs: ['becuase', 'becos'], hint: '<b>B</b>ig <b>E</b>lephants <b>C</b>an <b>A</b>lways <b>U</b>nderstand <b>S</b>mall <b>E</b>lephants! 🐘' },
  { word: 'school', emoji: '🏫', clue: 'Where you go to learn', wrongs: ['scool', 'skool'], hint: 's-<b>ch</b>-ool — the h hides after the c! 🏫' },
  { word: 'beautiful', emoji: '🌸', clue: 'Very, very pretty', wrongs: ['butiful', 'beautifull'], hint: '<b>B</b>ig <b>E</b>ars <b>A</b>ren\'t <b>U</b>gly — b-e-a-u, then one l! 🌸' },
  { word: 'favourite', emoji: '💖', clue: 'The one you like best of all', wrongs: ['favrite', 'faverite'], hint: 'fav-<b>OUR</b>-ite — OUR favourite! 💖' },
  { word: 'different', emoji: '🔀', clue: 'Not the same', wrongs: ['diffrent', 'diferent'], hint: 'double <b>f</b> and a hidden <b>e</b>: diff-er-ent 🔀' },
  { word: 'people', emoji: '👥', clue: 'Lots of humans together', wrongs: ['peple', 'peopel'], hint: 'pe-<b>o</b>-ple — the o sneaks in! 👥' },
  { word: 'thought', emoji: '💭', clue: 'An idea inside your head', wrongs: ['thort', 'thaught'], hint: 'th + <b>ought</b> — o-u-g-h-t 💭' },
  { word: 'enough', emoji: '👍', clue: 'As much as you need', wrongs: ['enuff', 'enugh'], hint: '<b>ough</b> sounds like UFF: en-OUGH 👍' },
  { word: 'island', emoji: '🏝️', clue: 'Land with water all around it', wrongs: ['iland', 'eyeland'], hint: 'the <b>s</b> is silent — an IS-land IS land! 🏝️' },
  { word: 'chocolate', emoji: '🍫', clue: 'A sweet brown treat', wrongs: ['choclate', 'chocolat'], hint: 'choc-<b>o</b>-late — don\'t lose the middle o! 🍫' },
  { word: 'tomorrow', emoji: '🌅', clue: 'The day after today', wrongs: ['tomorow', 'tommorow'], hint: 'one <b>m</b>, double <b>r</b>: to-mo-rrow 🌅' },
  { word: 'minute', emoji: '⏱️', clue: 'Sixty seconds', wrongs: ['minit', 'minnit'], hint: 'min-<b>ute</b> — it ends like flute! ⏱️' },
  { word: 'believe', emoji: '🌟', clue: 'To feel sure something is true', wrongs: ['beleive', 'beleve'], hint: 'never be<b>LIE</b>ve a LIE! 🌟' },
  { word: 'straight', emoji: '➡️', clue: 'A line with no bends', wrongs: ['strait', 'strate'], hint: 'str-<b>aight</b> — a-i-g-h-t ➡️' },
  { word: 'caught', emoji: '🥎', clue: 'You did this when the ball landed in your hands', wrongs: ['cort', 'caugt'], hint: 'c-<b>augh</b>-t — the gh is silent! 🥎' },
  { word: 'early', emoji: '🌄', clue: 'Before the usual time', wrongs: ['erly', 'earley'], hint: '<b>ear</b>-ly — it starts with EAR! 🌄' },
  { word: 'heart', emoji: '❤️', clue: 'It beats inside your chest', wrongs: ['hart', 'heert'], hint: 'you <b>HEAR</b> with your HEART! ❤️' },
  { word: 'often', emoji: '🔁', clue: 'Happening lots of times', wrongs: ['offen', 'ofen'], hint: 'of-<b>t</b>-en — the t hides in the middle! 🔁' },
  { word: 'knight', emoji: '🛡️', clue: 'A soldier in shining armour', wrongs: ['nite', 'knite'], hint: 'silent <b>k</b>: K-night guards the night! 🛡️' },
  { word: 'castle', emoji: '🏰', clue: 'Where a king and queen live', wrongs: ['casel', 'cassle'], hint: 'silent <b>t</b>: cas-T-le 🏰' },
  { word: 'answer', emoji: '✅', clue: 'What you give when asked a question', wrongs: ['anser', 'ansewr'], hint: 'silent <b>w</b>: ans-W-er ✅' },
  { word: 'surprise', emoji: '🎁', clue: 'Something you never expected', wrongs: ['suprise', 'surprize'], hint: 'su-<b>r</b>-prise — two r\'s, and an s at the end! 🎁' },
  { word: 'earth', emoji: '🌍', clue: 'The planet we live on', wrongs: ['erth', 'urth'], hint: '<b>ear</b>-th — it starts with EAR! 🌍' },
];

function spellShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deal words from a shuffled deck so a round repeats as little as possible
const spellDecks = {};
function spellNextWord(bankName) {
  const bank = bankName === 'tricky' ? SPELL_TRICKY : SPELL_EASY;
  if (!spellDecks[bankName] || spellDecks[bankName].length === 0) {
    spellDecks[bankName] = spellShuffle(bank);
  }
  return spellDecks[bankName].pop();
}

// Read the word aloud (built-in browser speech, no dependencies)
function speakWord(word) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.75;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* speech is a bonus, never break the game */ }
}

function spellSpeakBtn(word) {
  return `<button type="button" class="speak-word-btn" onclick="event.stopPropagation(); speakWord('${word}')">🔊 Hear it</button>`;
}

function buildSpellingQuestion(level) {
  const tricky = level === 'spot2' || level === 'build2';
  const w = spellNextWord(tricky ? 'tricky' : 'easy');
  const teach = `The correct spelling is <b>${w.word}</b> — ${w.hint}`;

  if (level === 'build' || level === 'build2') {
    return {
      op: 'spelling',
      spellWord: w.word.toUpperCase(),
      html: `<div class="prompt-line">${w.emoji} ${w.clue}</div><div class="prompt-line story-which-op">Tap the letters in order to spell it! ${spellSpeakBtn(w.word)}</div>`,
      promptText: w.clue,
      expected: w.word,
      teach
    };
  }

  // spot: the correct word hides among kid-plausible misspellings
  const opts = spellShuffle([w.word, ...w.wrongs]);
  return {
    op: 'spelling',
    html: `<div class="prompt-line">${w.emoji} ${w.clue}</div><div class="prompt-line story-which-op">Which spelling is correct? ${spellSpeakBtn(w.word)}</div>`,
    choices: opts.map(o => ({ html: o, value: o })),
    promptText: `spell "${w.word}"`,
    expected: w.word,
    teach
  };
}
