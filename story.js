// --- Space Quest — Story Problems & Estimation ---
// Word problems (Mission Control planet): read a space story, work out
// which operation solves it, and compute the answer. Money problems use
// whole cents/dollars so answers stay numpad-friendly.
// Estimation (Estimation Station planet): rounding and "about how much".

const STORY_OPS = {
  add: { sym: '➕', word: 'Add' },
  subtract: { sym: '➖', word: 'Subtract' },
  multiply: { sym: '✖️', word: 'Multiply' },
  divide: { sym: '➗', word: 'Divide' }
};

const STORY_ITEMS = ['moon rock', 'star sticker', 'comet candy', 'space pen', 'alien plush', 'rocket badge', 'galaxy map'];

function storyRand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function storyPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// One-step story with its operation, numbers, answer, and explanation
function buildOneStepStory() {
  const kind = storyPick(['add', 'subtract', 'multiply', 'divide']);
  if (kind === 'add') {
    const a = storyRand(12, 60), b = storyRand(12, 40);
    return {
      kind,
      text: `Cosmo found <b>${a}</b> moon rocks on Monday and <b>${b}</b> more on Tuesday. How many moon rocks altogether?`,
      short: `${a} rocks + ${b} rocks`,
      answer: a + b,
      teach: `"Altogether" means we add: ${a} + ${b} = ${a + b} 🚀`
    };
  }
  if (kind === 'subtract') {
    const a = storyRand(30, 90), b = storyRand(8, a - 10);
    return {
      kind,
      text: `The rocket had <b>${a}</b> fuel cells. <b>${b}</b> were used during launch. How many fuel cells are left?`,
      short: `${a} cells − ${b} used`,
      answer: a - b,
      teach: `"How many are left" means we subtract: ${a} − ${b} = ${a - b} 🚀`
    };
  }
  if (kind === 'multiply') {
    const a = storyRand(3, 9), b = storyRand(3, 12);
    return {
      kind,
      text: `There are <b>${a}</b> rovers and each one carries <b>${b}</b> star crystals. How many crystals in total?`,
      short: `${a} rovers × ${b} crystals`,
      answer: a * b,
      teach: `${a} equal groups of ${b} means we multiply: ${a} × ${b} = ${a * b} 🚀`
    };
  }
  const b = storyRand(2, 6), q = storyRand(3, 12);
  const a = b * q;
  return {
    kind,
    text: `<b>${a}</b> space snacks are shared equally among <b>${b}</b> astronauts. How many snacks does each astronaut get?`,
    short: `${a} snacks ÷ ${b} astronauts`,
    answer: q,
    teach: `"Shared equally" means we divide: ${a} ÷ ${b} = ${q} 🚀`
  };
}

function buildStoryQuestion(level) {
  if (level === 'threestep') {
    const n = storyRand(3, 8), k = storyRand(4, 9), eat = storyRand(2, 10), gift = storyRand(2, 8);
    return {
      op: 'story',
      html: `<div class="prompt-line"><b>${n}</b> boxes hold <b>${k}</b> crystals each. Cosmo eats <b>${eat}</b>, then gives <b>${gift}</b> away.<br>How many crystals are left?</div>`,
      promptText: `${n} × ${k} − ${eat} − ${gift}`,
      expected: n * k - eat - gift,
      teach: `Step 1: ${n} × ${k} = ${n * k}. Step 2: ${n * k} − ${eat} = ${n * k - eat}. Step 3: − ${gift} = ${n * k - eat - gift} 🚀`
    };
  }

  if (level === 'elapsed') {
    const startH = storyRand(1, 8);
    const hours = storyRand(1, 3);
    const mins = [0, 15, 30, 45][storyRand(0, 3)];
    if (Math.random() < 0.5) {
      return {
        op: 'story',
        html: `<div class="prompt-line">Gymnastics starts at <b>${startH}:00</b> and lasts <b>${hours}</b> hour${hours === 1 ? '' : 's'}.<br>What hour does it finish? (just the hour number)</div>`,
        promptText: `${startH}:00 + ${hours} hours`,
        expected: startH + hours,
        teach: `${startH} + ${hours} = ${startH + hours} o'clock ⏰`
      };
    }
    return {
      op: 'story',
      html: `<div class="prompt-line">Piano practice is <b>${hours}</b> hour${hours === 1 ? '' : 's'} and <b>${mins}</b> minutes.<br>How many <b>minutes</b> is that?</div>`,
      promptText: `${hours}h ${mins}m`,
      expected: hours * 60 + mins,
      teach: `${hours} × 60 = ${hours * 60}, plus ${mins} = ${hours * 60 + mins} minutes ⏰`
    };
  }

  if (level === 'bigger') {
    const a = storyRand(120, 450), b = storyRand(80, 300);
    if (Math.random() < 0.5) {
      return {
        op: 'story',
        html: `<div class="prompt-line">A space station has <b>${a}</b> crew and <b>${b}</b> more arrive.<br>How many crew altogether?</div>`,
        promptText: `${a} + ${b}`,
        expected: a + b,
        teach: `${a} + ${b} = ${a + b} 🚀`
      };
    }
    const start = Math.max(a, b) + 50;
    const take = Math.min(a, b);
    return {
      op: 'story',
      html: `<div class="prompt-line">The cargo bay held <b>${start}</b> crates. Robots moved <b>${take}</b> of them.<br>How many crates remain?</div>`,
      promptText: `${start} − ${take}`,
      expected: start - take,
      teach: `${start} − ${take} = ${start - take} 🚀`
    };
  }

  if (level === 'money') {
    const variant = storyPick(['change1', 'change5', 'centsTotal', 'dollarTotal']);
    if (variant === 'change1') {
      let price = storyRand(15, 95);
      if (price % 10 === 0) price += storyRand(1, 5);
      return {
        op: 'story',
        html: `<div class="prompt-line">A <b>${storyPick(STORY_ITEMS)}</b> costs <b>${price}¢</b>. You pay with <b>$1</b>.<br>How many <b>cents</b> change do you get?</div>`,
        promptText: `change from $1 for ${price}¢`,
        expected: 100 - price,
        teach: `$1 = 100¢, so 100 − ${price} = ${100 - price}¢ change 💰`
      };
    }
    if (variant === 'change5') {
      const price = storyRand(1, 4);
      return {
        op: 'story',
        html: `<div class="prompt-line">An <b>${storyPick(STORY_ITEMS)}</b> costs <b>$${price}</b>. You pay with <b>$5</b>.<br>How many <b>dollars</b> change do you get?</div>`,
        promptText: `change from $5 for $${price}`,
        expected: 5 - price,
        teach: `5 − ${price} = ${5 - price} dollars change 💰`
      };
    }
    if (variant === 'centsTotal') {
      const a = storyRand(15, 50), b = storyRand(10, 45);
      const [i1, i2] = [storyPick(STORY_ITEMS), storyPick(STORY_ITEMS)];
      return {
        op: 'story',
        html: `<div class="prompt-line">A <b>${i1}</b> costs <b>${a}¢</b> and a <b>${i2}</b> costs <b>${b}¢</b>.<br>How many <b>cents</b> altogether?</div>`,
        promptText: `${a}¢ + ${b}¢`,
        expected: a + b,
        teach: `${a} + ${b} = ${a + b}¢ 💰`
      };
    }
    const a = storyRand(3, 12), b = storyRand(2, 9);
    const [i1, i2] = [storyPick(STORY_ITEMS), storyPick(STORY_ITEMS)];
    return {
      op: 'story',
      html: `<div class="prompt-line">A <b>${i1}</b> costs <b>$${a}</b> and a <b>${i2}</b> costs <b>$${b}</b>.<br>How many <b>dollars</b> for both?</div>`,
      promptText: `$${a} + $${b}`,
      expected: a + b,
      teach: `${a} + ${b} = $${a + b} 💰`
    };
  }

  if (level === 'twostep') {
    const variant = storyPick(['earnSpend', 'groupsBroke', 'boxesEaten']);
    if (variant === 'earnSpend') {
      const a = storyRand(15, 50), b = storyRand(10, 30), c = storyRand(5, a + b - 5);
      return {
        op: 'story',
        html: `<div class="prompt-line">Cosmo had <b>${a}</b> star coins. He earned <b>${b}</b> more, then spent <b>${c}</b> on rocket fuel.<br>How many star coins now?</div>`,
        promptText: `${a} + ${b} − ${c} coins`,
        expected: a + b - c,
        teach: `Step 1: ${a} + ${b} = ${a + b}. Step 2: ${a + b} − ${c} = ${a + b - c} 🚀`
      };
    }
    if (variant === 'groupsBroke') {
      const n = storyRand(3, 7), k = storyRand(4, 9), c = storyRand(2, 8);
      return {
        op: 'story',
        html: `<div class="prompt-line"><b>${n}</b> rovers each carry <b>${k}</b> crystals. On the bumpy ride, <b>${c}</b> crystals cracked.<br>How many good crystals are left?</div>`,
        promptText: `${n} × ${k} − ${c} crystals`,
        expected: n * k - c,
        teach: `Step 1: ${n} × ${k} = ${n * k}. Step 2: ${n * k} − ${c} = ${n * k - c} 🚀`
      };
    }
    const k = storyRand(4, 8), n = storyRand(2, 5), c = storyRand(3, 9);
    return {
      op: 'story',
      html: `<div class="prompt-line">A box holds <b>${k}</b> space snacks. Cosmo buys <b>${n}</b> boxes and eats <b>${c}</b> snacks.<br>How many snacks are left?</div>`,
      promptText: `${n} × ${k} − ${c} snacks`,
      expected: n * k - c,
      teach: `Step 1: ${n} × ${k} = ${n * k}. Step 2: ${n * k} − ${c} = ${n * k - c} 🚀`
    };
  }

  // onestep: 40% ask WHICH operation (the real skill), 60% ask the answer
  const s = buildOneStepStory();
  if (Math.random() < 0.4) {
    const wrongOps = Object.keys(STORY_OPS).filter(o => o !== s.kind);
    const picks = [s.kind];
    while (picks.length < 3) {
      const w = storyPick(wrongOps);
      if (!picks.includes(w)) picks.push(w);
    }
    // shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    return {
      op: 'story',
      html: `<div class="prompt-line">${s.text}</div><div class="prompt-line story-which-op">Which operation solves it?</div>`,
      choices: picks.map(o => ({ html: `${STORY_OPS[o].sym} ${STORY_OPS[o].word}`, value: o })),
      promptText: `${s.short} — which operation?`,
      expected: s.kind,
      teach: s.teach
    };
  }
  return {
    op: 'story',
    html: `<div class="prompt-line">${s.text}</div>`,
    promptText: s.short,
    expected: s.answer,
    teach: s.teach
  };
}

// --- Estimation Station ---

function buildEstimateQuestion(level) {
  if (level === 'round10') {
    let n = storyRand(11, 99);
    if (n % 10 === 0) n += storyRand(1, 9);
    const rounded = Math.round(n / 10) * 10;
    const ones = n % 10;
    return {
      op: 'estimate',
      html: `<div class="prompt-line">Round <b>${n}</b> to the nearest <b>10</b>.</div>`,
      promptText: `round ${n} to nearest 10`,
      expected: rounded,
      teach: `The ones digit is ${ones} — ${ones >= 5 ? '5 or more rounds UP' : 'less than 5 rounds DOWN'} → ${rounded} 🎯`
    };
  }

  if (level === 'round100') {
    let n = storyRand(105, 995);
    if (n % 100 === 0) n += storyRand(1, 99);
    const rounded = Math.round(n / 100) * 100;
    const tens = Math.floor((n % 100) / 10);
    return {
      op: 'estimate',
      html: `<div class="prompt-line">Round <b>${n}</b> to the nearest <b>100</b>.</div>`,
      promptText: `round ${n} to nearest 100`,
      expected: rounded,
      teach: `Look at the tens: ${tens}${n % 10} — ${n % 100 >= 50 ? '50 or more rounds UP' : 'less than 50 rounds DOWN'} → ${rounded} 🎯`
    };
  }

  if (level === 'round1000') {
    let n = storyRand(1100, 8900);
    if (n % 1000 === 0) n += storyRand(50, 400);
    const rounded = Math.round(n / 1000) * 1000;
    const hundreds = Math.floor((n % 1000) / 100);
    return {
      op: 'estimate',
      html: `<div class="prompt-line">Round <b>${n}</b> to the nearest <b>1000</b>.</div>`,
      promptText: `round ${n} to nearest 1000`,
      expected: rounded,
      teach: `Look at the hundreds: ${hundreds} — ${n % 1000 >= 500 ? '500 or more rounds UP' : 'less than 500 rounds DOWN'} → ${rounded} 🎯`
    };
  }

  if (level === 'approxmul') {
    const a = storyRand(12, 48), b = storyRand(3, 9);
    const ra = Math.round(a / 10) * 10;
    const correct = ra * b;
    const wrongs = new Set();
    while (wrongs.size < 2) {
      const w = correct + storyPick([-b * 10, b * 10, 20, -20]);
      if (w > 0 && w !== correct) wrongs.add(w);
    }
    const opts = [correct, ...wrongs];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return {
      op: 'estimate',
      html: `<div class="prompt-line"><b>About</b> how much is <b>${a} × ${b}</b>?</div><div class="prompt-line story-which-op">Round the bigger number first!</div>`,
      choices: opts.map(n => ({ html: `about ${n}`, value: String(n) })),
      promptText: `about ${a} × ${b}`,
      expected: String(correct),
      teach: `${a} is about ${ra}, so ${ra} × ${b} = ${correct} 🎯`
    };
  }

  if (level === 'closer') {
    const target = [50, 100, 200, 500][storyRand(0, 3)];
    let a = target + storyRand(-18, -4);
    let b = target + storyRand(4, 18);
    if (Math.abs(a - target) === Math.abs(b - target)) b += 3;
    const closer = Math.abs(a - target) < Math.abs(b - target) ? a : b;
    return {
      op: 'estimate',
      html: `<div class="prompt-line">Which number is closer to <b>${target}</b>?</div>`,
      choices: [
        { html: String(a), value: String(a) },
        { html: String(b), value: String(b) }
      ],
      promptText: `closer to ${target}`,
      expected: String(closer),
      teach: `${a} is ${Math.abs(a - target)} away, ${b} is ${Math.abs(b - target)} away → ${closer} is closer to ${target} 🎯`
    };
  }

  // approx: "about how much" with rounded multiple-choice options
  const isAdd = Math.random() > 0.35;
  let a = storyRand(23, 87), b = storyRand(18, 76);
  if (!isAdd && b > a) [a, b] = [b, a];
  const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
  const correct = isAdd ? ra + rb : ra - rb;
  const wrongs = new Set();
  while (wrongs.size < 2) {
    const w = correct + storyPick([-30, -20, 20, 30]);
    if (w > 0 && w !== correct) wrongs.add(w);
  }
  const opts = [correct, ...wrongs];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const sym = isAdd ? '+' : '−';
  return {
    op: 'estimate',
    html: `<div class="prompt-line"><b>About</b> how much is <b>${a} ${sym} ${b}</b>?</div><div class="prompt-line story-which-op">Round each number first — no exact math needed!</div>`,
    choices: opts.map(n => ({ html: `about ${n}`, value: String(n) })),
    promptText: `about ${a} ${sym} ${b}`,
    expected: String(correct),
    teach: `${a} is about ${ra}, ${b} is about ${rb} → ${ra} ${sym} ${rb} = ${correct} 🎯`
  };
}
