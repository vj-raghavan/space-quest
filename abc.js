// --- Space Quest — ABC Base & Number Camp (early writing for pre-schoolers) ---
// Built for a 5-year-old learning his alphabets and numbers: every question is
// spoken aloud, answered by tapping big buttons, or written by TRACING the
// letter/number with a finger on a canvas. Nothing is typed, nothing is read.

// Letter → the word & emoji used to anchor its sound ("B is for Ball ⚽")
const ABC_WORDS = {
  A: { w: 'Apple', e: '🍎' },  B: { w: 'Ball', e: '⚽' },     C: { w: 'Cat', e: '🐱' },
  D: { w: 'Dog', e: '🐶' },    E: { w: 'Elephant', e: '🐘' }, F: { w: 'Fish', e: '🐟' },
  G: { w: 'Grapes', e: '🍇' }, H: { w: 'Hat', e: '🎩' },      I: { w: 'Ice cream', e: '🍦' },
  J: { w: 'Juice', e: '🧃' },  K: { w: 'Kite', e: '🪁' },     L: { w: 'Lion', e: '🦁' },
  M: { w: 'Moon', e: '🌙' },   N: { w: 'Nest', e: '🪺' },     O: { w: 'Orange', e: '🍊' },
  P: { w: 'Penguin', e: '🐧' },Q: { w: 'Queen', e: '👑' },    R: { w: 'Rainbow', e: '🌈' },
  S: { w: 'Sun', e: '☀️' },    T: { w: 'Tiger', e: '🐯' },    U: { w: 'Umbrella', e: '☂️' },
  V: { w: 'Violin', e: '🎻' }, W: { w: 'Whale', e: '🐳' },    X: { w: 'Xylophone', e: '🎵' },
  Y: { w: 'Yo-yo', e: '🪀' },  Z: { w: 'Zebra', e: '🦓' },
};
const ABC_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Letters that little learners genuinely mix up — the best distractors,
// because telling them apart is exactly the skill being practised.
const ABC_CONFUSABLE = {
  b: ['d', 'p', 'q'], d: ['b', 'q', 'p'], p: ['q', 'b', 'd'], q: ['p', 'g', 'b'],
  m: ['n', 'w'], n: ['m', 'u', 'h'], w: ['m', 'v'], u: ['n', 'v'], v: ['w', 'u'],
  i: ['l', 'j'], l: ['i', 't'], j: ['i', 'g'], t: ['f', 'l'], f: ['t'],
  a: ['o', 'e'], o: ['a', 'c'], e: ['a', 'c'], c: ['e', 'o'],
  g: ['q', 'y'], y: ['g', 'v'], h: ['n', 'b'], r: ['n', 'm'],
  s: ['z'], z: ['s'], k: ['x'], x: ['k'],
};

// Emoji sets for counting questions — friendly, high-contrast, countable
const NUM_COUNT_THINGS = [
  { w: 'rockets', e: '🚀' }, { w: 'stars', e: '⭐' }, { w: 'planets', e: '🪐' },
  { w: 'aliens', e: '👽' }, { w: 'moons', e: '🌙' }, { w: 'comets', e: '☄️' },
  { w: 'apples', e: '🍎' }, { w: 'balloons', e: '🎈' }, { w: 'dinosaurs', e: '🦖' },
  { w: 'robots', e: '🤖' },
];

function abcShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function abcPick(list) { return list[Math.floor(Math.random() * list.length)]; }

function abcBigLetter(l) { return `<span class="abc-letter-choice">${l}</span>`; }
function abcBigNumber(n) { return `<span class="abc-number-choice">${n}</span>`; }

// Two distractor letters for a target: confusable look-alikes first
function abcLetterDistractors(target, lowercase) {
  const t = target.toLowerCase();
  const out = [];
  const conf = ABC_CONFUSABLE[t] || [];
  abcShuffle(conf).forEach(c => { if (out.length < 2 && c !== t) out.push(c); });
  while (out.length < 2) {
    const r = abcPick(ABC_ALPHABET).toLowerCase();
    if (r !== t && !out.includes(r)) out.push(r);
  }
  return out.map(l => lowercase ? l : l.toUpperCase());
}

function abcNumberDistractors(target, min, max) {
  const out = [];
  const candidates = [];
  for (let n = min; n <= max; n++) if (n !== target) candidates.push(n);
  // Prefer neighbours — telling 6 from 7 (and 6 from 9!) is the real skill
  const near = candidates.filter(n => Math.abs(n - target) <= 2);
  abcShuffle(near).forEach(n => { if (out.length < 2) out.push(n); });
  abcShuffle(candidates).forEach(n => { if (out.length < 2 && !out.includes(n)) out.push(n); });
  return out;
}

// ============================================================
// ABC BASE — question builders (op: 'abc')
// ============================================================

function buildAbcQuestion(level) {
  if (level === 'find') {
    // Letter Hunt: hear the letter, tap it
    const letter = abcPick(ABC_ALPHABET);
    const info = ABC_WORDS[letter];
    const choices = abcShuffle([letter, ...abcLetterDistractors(letter, false)]);
    return {
      op: 'abc',
      say: `Find the letter ${letter}! ${letter} is for ${info.w}!`,
      html: `<div class="prompt-line"><span class="reading-pic">${info.e}</span></div><div class="prompt-line story-which-op">👂 Tap the letter you hear! ${spellSpeakBtn(`Find the letter ${letter}! ${letter} is for ${info.w}!`)}</div>`,
      choices: choices.map(l => ({ html: abcBigLetter(l), value: l })),
      promptText: `find letter ${letter}`,
      expected: letter,
      teach: `That letter is <b>${letter}</b> — ${letter} is for <b>${info.w}</b> ${info.e}`
    };
  }

  if (level === 'match') {
    // Big & Small Twins: shown the big letter, tap its small twin
    const letter = abcPick(ABC_ALPHABET);
    const info = ABC_WORDS[letter];
    const lower = letter.toLowerCase();
    const choices = abcShuffle([lower, ...abcLetterDistractors(lower, true)]);
    return {
      op: 'abc',
      say: `Big ${letter}! Find its small twin!`,
      html: `<div class="prompt-line"><span class="abc-target-letter">${letter}</span></div><div class="prompt-line story-which-op">Tap the SMALL twin of big <b>${letter}</b>! ${spellSpeakBtn(`Big ${letter}! Find its small twin!`)}</div>`,
      choices: choices.map(l => ({ html: abcBigLetter(l), value: l })),
      promptText: `small twin of ${letter}`,
      expected: lower,
      teach: `Big <b>${letter}</b> and small <b>${lower}</b> are twins — both say the same sound, like <b>${info.w}</b> ${info.e}`
    };
  }

  if (level === 'order') {
    // Alphabet Train: A, B, C … what comes next?
    const start = Math.floor(Math.random() * 23); // leaves room for 3 shown + answer
    const shown = ABC_ALPHABET.slice(start, start + 3);
    const answer = ABC_ALPHABET[start + 3];
    // Distractors: nearby letters feel plausible but can't repeat the shown ones
    const candidates = abcShuffle(ABC_ALPHABET.filter(l => l !== answer && !shown.includes(l)));
    const near = candidates.filter(l => Math.abs(ABC_ALPHABET.indexOf(l) - ABC_ALPHABET.indexOf(answer)) <= 3);
    const distractors = [...new Set([...near, ...candidates])].slice(0, 2);
    const choices = abcShuffle([answer, ...distractors]);
    const train = shown.map(l => `<span class="abc-train-car">${l}</span>`).join('');
    return {
      op: 'abc',
      say: `${shown.join(', ')}... what comes next?`,
      html: `<div class="prompt-line abc-train">🚂${train}<span class="abc-train-car abc-train-mystery">?</span></div><div class="prompt-line story-which-op">Which letter comes next on the train? ${spellSpeakBtn(`${shown.join(', ')}... what comes next?`)}</div>`,
      choices: choices.map(l => ({ html: abcBigLetter(l), value: l })),
      promptText: `${shown.join(' ')} then?`,
      expected: answer,
      teach: `The alphabet goes ${shown.join(', ')}, <b>${answer}</b>! Sing the ABC song to check! 🎵`
    };
  }

  // Tracing levels: traceupper / tracelower
  const letter = abcPick(ABC_ALPHABET);
  const info = ABC_WORDS[letter];
  const isLower = level === 'tracelower';
  const glyph = isLower ? letter.toLowerCase() : letter;
  const sizeWord = isLower ? 'small' : 'big';
  return {
    op: 'abc',
    say: `Trace the ${sizeWord} letter ${letter}! ${letter} is for ${info.w}!`,
    traceChar: glyph,
    html: `<div class="prompt-line story-which-op">✏️ Trace the ${sizeWord} letter <b>${glyph}</b> — ${letter} is for ${info.w} ${info.e} ${spellSpeakBtn(`Trace the ${sizeWord} letter ${letter}! ${letter} is for ${info.w}!`)}</div>`,
    promptText: `trace ${sizeWord} ${glyph}`,
    expected: glyph,
    teach: `Look at the shape of <b>${glyph}</b> and trace slowly along the glowing lines — you will get it! ✏️`
  };
}

// ============================================================
// NUMBER CAMP — question builders (op: 'numbers')
// ============================================================

function buildNumbersQuestion(level) {
  if (level === 'count') {
    // Count with Cosmo: count the emojis, tap the number
    const thing = abcPick(NUM_COUNT_THINGS);
    const n = Math.floor(Math.random() * 10) + 1; // 1-10
    const grid = Array.from({ length: n }, () => `<span class="num-count-item">${thing.e}</span>`).join('');
    const choices = abcShuffle([n, ...abcNumberDistractors(n, 1, 10)]);
    return {
      op: 'numbers',
      say: `How many ${thing.w}? Count them and tap the number!`,
      html: `<div class="prompt-line story-which-op">How many <b>${thing.w}</b>? ${spellSpeakBtn(`How many ${thing.w}? Count them and tap the number!`)}</div><div class="num-count-grid">${grid}</div>`,
      choices: choices.map(c => ({ html: abcBigNumber(c), value: String(c) })),
      promptText: `count ${n} ${thing.w}`,
      expected: String(n),
      teach: `Point at each one and count out loud: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')} — there are <b>${n}</b> ${thing.w}! ${thing.e}`
    };
  }

  if (level === 'find') {
    // Number Hunt: hear the number, tap it
    const n = Math.floor(Math.random() * 21); // 0-20
    const choices = abcShuffle([n, ...abcNumberDistractors(n, 0, 20)]);
    return {
      op: 'numbers',
      say: `Find the number ${n}!`,
      html: `<div class="prompt-line"><span class="reading-pic">👂</span></div><div class="prompt-line story-which-op">Tap the number you hear! ${spellSpeakBtn(`Find the number ${n}!`)}</div>`,
      choices: choices.map(c => ({ html: abcBigNumber(c), value: String(c) })),
      promptText: `find number ${n}`,
      expected: String(n),
      teach: `That number is <b>${n}</b>! Listen again and look at its shape — you will spot it next time! 🔢`
    };
  }

  if (level === 'order') {
    // Number Train: 4, 5, 6 … what comes next?
    const start = Math.floor(Math.random() * 17) + 1; // 1-17 → answer up to 20
    const shown = [start, start + 1, start + 2];
    const answer = start + 3;
    const choices = abcShuffle([answer, ...abcNumberDistractors(answer, Math.max(0, answer - 4), answer + 4)]);
    const train = shown.map(n => `<span class="abc-train-car">${n}</span>`).join('');
    return {
      op: 'numbers',
      say: `${shown.join(', ')}... what comes next?`,
      html: `<div class="prompt-line abc-train">🚂${train}<span class="abc-train-car abc-train-mystery">?</span></div><div class="prompt-line story-which-op">Which number comes next on the train? ${spellSpeakBtn(`${shown.join(', ')}... what comes next?`)}</div>`,
      choices: choices.map(c => ({ html: abcBigNumber(c), value: String(c) })),
      promptText: `${shown.join(' ')} then?`,
      expected: String(answer),
      teach: `Count up: ${shown.join(', ')}, <b>${answer}</b>! Each number is one more than the last! 🚂`
    };
  }

  if (level === 'teen') {
    // Trace Big Numbers: two digits, 10-20
    const n = Math.floor(Math.random() * 11) + 10;
    return {
      op: 'numbers',
      say: `Trace the big number ${n}!`,
      traceChar: String(n),
      html: `<div class="prompt-line story-which-op">✏️ Trace the big number <b>${n}</b> — write both digits! ${spellSpeakBtn(`Trace the big number ${n}!`)}</div>`,
      promptText: `trace ${n}`,
      expected: String(n),
      teach: `<b>${n}</b> has two parts: a <b>${String(n)[0]}</b> and a <b>${String(n)[1]}</b>. Trace them one at a time! ✏️`
    };
  }

  // trace: single digits 0-9
  const n = Math.floor(Math.random() * 10);
  const stars = n === 0 ? 'zero means none at all!' : '⭐'.repeat(n);
  return {
    op: 'numbers',
    say: `Trace the number ${n}!`,
    traceChar: String(n),
    html: `<div class="prompt-line story-which-op">✏️ Trace the number <b>${n}</b> ${spellSpeakBtn(`Trace the number ${n}!`)}</div>`,
    promptText: `trace ${n}`,
    expected: String(n),
    teach: `This is <b>${n}</b> — ${stars} Trace slowly along the glowing shape! ✏️`
  };
}

// ============================================================
// TRACE PAD — the finger-writing canvas
// ============================================================
// The child traces over a big dashed "ghost" of the letter/number. Scoring is
// forgiving and scribble-proof: we check how much of the glyph was covered
// (coverage) AND how much of the ink actually landed on the glyph (precision).
// No stroke-order data needed — perfect for a first writer.

const TracePad = (() => {
  const SIZE = 360;            // canvas is square, CSS scales it responsively
  const INK_WIDTH = 26;        // chunky crayon stroke for little fingers
  const TOLERANCE_WIDTH = 56;  // ink counts as "on the letter" within this halo
  const PASS_COVERAGE = 0.40;  // how much of the glyph must be traced
  const PASS_PRECISION = 0.50; // how much of the ink must be on the glyph

  let canvas = null, ctx = null;
  let inkCanvas = null, inkCtx = null;
  let drawing = false, hasInk = false, locked = false;
  let currentChar = '';
  let lastX = 0, lastY = 0;

  function fontFor(char) {
    // Shrink to fit multi-character targets like "12"
    const base = char.length > 1 ? 200 : 250;
    return `700 ${base}px Fredoka, "Comic Sans MS", Arial, sans-serif`;
  }

  function drawGuide() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Writing-line guides, like the dotted middle line of school paper
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    [SIZE * 0.22, SIZE * 0.5, SIZE * 0.78].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(SIZE - 20, y);
      ctx.stroke();
    });
    ctx.restore();

    // The ghost letter: faint fill + glowing dashed outline to trace along
    ctx.save();
    ctx.font = fontFor(currentChar);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(120, 210, 255, 0.10)';
    ctx.fillText(currentChar, SIZE / 2, SIZE / 2 + 10);
    ctx.strokeStyle = 'rgba(120, 210, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeText(currentChar, SIZE / 2, SIZE / 2 + 10);
    ctx.restore();
  }

  function setDoneEnabled(on) {
    const btn = document.getElementById('trace-done');
    if (btn) btn.disabled = !on;
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (SIZE / rect.width),
      y: (e.clientY - rect.top) * (SIZE / rect.height)
    };
  }

  function inkSegment(x1, y1, x2, y2) {
    [ctx, inkCtx].forEach(c => {
      c.save();
      c.strokeStyle = c === ctx ? 'rgba(255, 210, 80, 0.95)' : '#fff';
      c.lineWidth = INK_WIDTH;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
      c.restore();
    });
  }

  function onPointerDown(e) {
    if (locked) return;
    e.preventDefault();
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    drawing = true;
    const p = pointerPos(e);
    lastX = p.x; lastY = p.y;
    inkSegment(p.x, p.y, p.x, p.y); // dot on tap
    hasInk = true;
    setDoneEnabled(true);
  }

  function onPointerMove(e) {
    if (!drawing || locked) return;
    e.preventDefault();
    const p = pointerPos(e);
    inkSegment(lastX, lastY, p.x, p.y);
    lastX = p.x; lastY = p.y;
  }

  function onPointerUp() {
    drawing = false;
  }

  function init() {
    canvas = document.getElementById('trace-canvas');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    inkCanvas = document.createElement('canvas');
    inkCanvas.width = SIZE;
    inkCanvas.height = SIZE;
    inkCtx = inkCanvas.getContext('2d');
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    // Guide and scoring mask must use the SAME font — redraw the guide once
    // the webfont arrives in case the first glyph rendered with a fallback.
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 250px Fredoka').then(() => {
        if (currentChar && !locked && !hasInk) drawGuide();
      }).catch(() => {});
    }
    return true;
  }

  function start(char) {
    if (!canvas && !init()) return;
    currentChar = char;
    drawing = false;
    hasInk = false;
    locked = false;
    inkCtx.clearRect(0, 0, SIZE, SIZE);
    drawGuide();
    setDoneEnabled(false);
  }

  function clear() {
    if (locked) return;
    hasInk = false;
    inkCtx.clearRect(0, 0, SIZE, SIZE);
    drawGuide();
    setDoneEnabled(false);
  }

  // Compare ink against the glyph mask. Sampled every 3px for speed.
  function evaluate() {
    if (!hasInk) return { coverage: 0, precision: 0, pass: false };

    const mask = document.createElement('canvas');
    mask.width = SIZE; mask.height = SIZE;
    const mctx = mask.getContext('2d');
    mctx.font = fontFor(currentChar);
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#fff';
    mctx.fillText(currentChar, SIZE / 2, SIZE / 2 + 10);

    const halo = document.createElement('canvas');
    halo.width = SIZE; halo.height = SIZE;
    const hctx = halo.getContext('2d');
    hctx.font = fontFor(currentChar);
    hctx.textAlign = 'center';
    hctx.textBaseline = 'middle';
    hctx.fillStyle = '#fff';
    hctx.strokeStyle = '#fff';
    hctx.lineWidth = TOLERANCE_WIDTH;
    hctx.lineJoin = 'round';
    hctx.fillText(currentChar, SIZE / 2, SIZE / 2 + 10);
    hctx.strokeText(currentChar, SIZE / 2, SIZE / 2 + 10);

    const maskData = mctx.getImageData(0, 0, SIZE, SIZE).data;
    const haloData = hctx.getImageData(0, 0, SIZE, SIZE).data;
    const inkData = inkCtx.getImageData(0, 0, SIZE, SIZE).data;

    let glyphPx = 0, coveredPx = 0, inkPx = 0, onTargetPx = 0;
    for (let y = 0; y < SIZE; y += 3) {
      for (let x = 0; x < SIZE; x += 3) {
        const i = (y * SIZE + x) * 4 + 3; // alpha channel
        const onGlyph = maskData[i] > 40;
        const onHalo = haloData[i] > 40;
        const hasInkHere = inkData[i] > 40;
        if (onGlyph) {
          glyphPx++;
          if (hasInkHere) coveredPx++;
        }
        if (hasInkHere) {
          inkPx++;
          if (onHalo) onTargetPx++;
        }
      }
    }

    const coverage = glyphPx === 0 ? 0 : coveredPx / glyphPx;
    const precision = inkPx === 0 ? 0 : onTargetPx / inkPx;
    return {
      coverage,
      precision,
      pass: coverage >= PASS_COVERAGE && precision >= PASS_PRECISION
    };
  }

  // Lock the pad and paint the result: green glow for a pass,
  // the solid target letter for a miss (so the child SEES the shape).
  function finish(pass) {
    locked = true;
    setDoneEnabled(false);
    ctx.save();
    if (pass) {
      ctx.font = fontFor(currentChar);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(80, 230, 140, 0.9)';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.strokeText(currentChar, SIZE / 2, SIZE / 2 + 10);
    } else {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.font = fontFor(currentChar);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(80, 230, 140, 0.85)';
      ctx.fillText(currentChar, SIZE / 2, SIZE / 2 + 10);
    }
    ctx.restore();
  }

  function inkPresent() { return hasInk; }

  return { start, clear, evaluate, finish, inkPresent };
})();
