// --- Space Quest - Core Logic ---

// --- State Management ---
const gameState = {
  selectedTables: [],
  questionCount: 10,
  gameMode: 'adventure', // 'adventure' or 'timed'
  currentQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  correctAnswersCount: 0,
  answersLog: [], // stores { num1, num2, expected, typed, isCorrect, timeTaken }
  currentAnswer: '',
  timerInterval: null,
  timeLeft: 8.0, // seconds for timed mode
  questionStartTime: 0,
  audioEnabled: true,
  audioCtx: null,
  totalTestsCompleted: 0,
  activeOp: 'multiply', // 'multiply', 'divide', 'add', 'subtract', 'sequence', 'compare', 'clock', 'fraction'
  digitLevel: 'single', // 'single', 'double', 'triple', 'mixed'
  clockLevel: 'hour',    // 'hour', 'quarter', 'five-min', 'precision'
  activeClockInput: 'hour', // 'hour' or 'minute'
  clockInputHour: '',
  clockInputMinute: '',
  clockHourAutoAdvanceTimer: null,
  fractionLevel: 'identify', // 'identify', 'simplify', 'add', 'subtract'
  activeFractionInput: 'numerator', // 'numerator' or 'denominator'
  fractionInputNumerator: '',
  fractionInputDenominator: '',
  fractionAutoAdvanceTimer: null,
  sequenceLevel: 'easy',     // 'easy', 'medium', 'hard'
  compareLevel: 'easy',      // 'easy', 'medium', 'hard'
  compareCurrentChoice: '',  // '<', '=', '>'
  musicLevel: 'notes',       // 'notes', 'beats', 'measures'
  anglesLevel: 'turns',      // 'turns', 'combine', 'convert'
  puzzleLevel: 'mystery',    // 'mystery', 'emoji', 'magic'
  pokemonLevel: 'identity',  // 'identity', 'type', 'evolution'
  eqStyle: 'horizontal',     // 'horizontal' (6 + 3 = ?) or 'vertical' (stacked, like on paper)
  missionKey: null,          // 'planet:level' when launched from the galaxy map, 'daily', or null
  injectedQuestions: null,   // pre-built question list (daily mission)
  missedQuestions: [],       // wrong answers this round, queued for the rematch
  rematchDone: false         // whether the end-of-round rematch already ran
};

// Mascot Cosmo phrases
const mascotPhrases = {
  welcome: [
    "Hi! I'm Cosmo! Select your tables, and let's go explore the math galaxy together! 💫",
    "Ready to power up our space rocket? Select tables to start! 🚀",
    "Multiplication is like a cheat code for adding fast! Let's choose some numbers! 🛰️"
  ],
  correct: [
    "Awesome calculations! 🌟",
    "To the moon! That's correct! 🚀",
    "Cosmo is super proud of you! 🎉",
    "You are a math superstar! 💫",
    "Rocket fuel added! Double tap! ⚡",
    "Engine power is at 100%! 🛸"
  ],
  incorrect: [
    "It's okay! We learn from mistakes. Let's try another! 🛰️",
    "So close! Cosmo knows you can get the next one! 💪",
    "A minor space bump! Let's keep flying! 🚀",
    "No worries! Practice makes us super strong! ☄️"
  ],
  combo: [
    "Wow, a x1.5 combo! You're on fire! 🔥",
    "Incredible! Combo x2.0! You are zooming! ⚡",
    "Combo x2.5! The rocket is in hyperspace! 🌌"
  ]
};

// Badges list and conditions
const BADGES = [
  { id: 'first_flight', name: 'First Flight', emoji: '🚀', desc: 'Completed your first space mission!' },
  { id: 'perfect_10', name: 'Perfect 10', emoji: '👑', desc: 'Got 100% accuracy on a mission!' },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '⚡', desc: 'Answered questions in under 2.5 seconds on average!' },
  { id: 'combo_master', name: 'Combo Master', emoji: '🔥', desc: 'Achieved a Combo multiplier of x2.0 or more!' },
  { id: 'lucky_7', name: 'Lucky 7 Master', emoji: '✨', desc: 'Mastered the tricky Table 7!' },
  { id: 'cosmic_explorer', name: 'Cosmic Explorer', emoji: '🌌', desc: 'Mastered the difficult Tables 13, 14, or 15!' },
  { id: 'addition_cadet', name: 'Addition Cadet', emoji: '➕', desc: 'Got 100% accuracy on Double-digit Addition!' },
  { id: 'addition_master', name: 'Addition Master', emoji: '💫', desc: 'Got 100% accuracy on Triple-digit Addition!' },
  { id: 'subtraction_cadet', name: 'Subtraction Cadet', emoji: '➖', desc: 'Got 100% accuracy on Double-digit Subtraction!' },
  { id: 'subtraction_master', name: 'Subtraction Master', emoji: '⚡', desc: 'Got 100% accuracy on Triple-digit Subtraction!' },
  { id: 'division_cadet', name: 'Division Cadet', emoji: '➗', desc: 'Got 100% accuracy on Divisors 2, 5, or 10!' },
  { id: 'division_master', name: 'Division Master', emoji: '🌀', desc: 'Mastered complex space Division operations!' },
  { id: 'pattern_cadet', name: 'Pattern Cadet', emoji: '☄️', desc: 'Got 100% accuracy on Star Steps sequences!' },
  { id: 'pattern_master', name: 'Pattern Master', emoji: '🎆', desc: 'Aced Supernova Growth sequence challenges!' },
  { id: 'scale_cadet', name: 'Scale Cadet', emoji: '⚖️', desc: 'Got 100% accuracy comparing simple cosmic weights!' },
  { id: 'scale_master', name: 'Scale Master', emoji: '🪐', desc: 'Aced heavy formula comparison orbits!' },
  { id: 'clock_cadet', name: 'Clock Cadet', emoji: '⏰', desc: 'Mastered reading Clocks on the hour!' },
  { id: 'clock_master', name: 'Clock Master', emoji: '🕰️', desc: 'Mastered 5-Minute interval Clock reading!' },
  { id: 'time_lord', name: 'Time Lord', emoji: '🛸', desc: 'Aced Precision Clock Reading!' },
  { id: 'fraction_cadet', name: 'Fraction Cadet', emoji: '🍕', desc: 'Correctly identified fractions from a pie chart!' },
  { id: 'fraction_pilot', name: 'Fraction Pilot', emoji: '✂️', desc: 'Mastered simplifying fractions to lowest terms!' },
  { id: 'fraction_lord', name: 'Fraction Lord', emoji: '🌠', desc: 'Conquered adding and subtracting fractions!' },
  { id: 'rhythm_star', name: 'Rhythm Star', emoji: '🎵', desc: 'Got 100% on a Rhythm Nebula music mission!' },
  { id: 'twist_champion', name: 'Twist Champion', emoji: '🤸', desc: 'Got 100% on a Twist & Turn Arena mission!' },
  { id: 'puzzle_genius', name: 'Puzzle Genius', emoji: '🧩', desc: 'Got 100% on a Puzzle Asteroid mission!' },
  { id: 'pokemon_professor', name: 'Pokémon Professor', emoji: '⚡', desc: 'Got 100% on a Poké Galaxy mission!' },
  { id: 'galaxy_hero', name: 'Galaxy Hero', emoji: '🪐', desc: 'Completed 5 or more space missions!' }
];

// Cosmo's Cosmic Space Facts database
const SPACE_TRIVIA = [
  "One space suit costs about $12 million to make! 🛰️",
  "A day on Venus is longer than a year on Venus! 🌅",
  "There are more trees on Earth than stars in the Milky Way! 🌲",
  "Neptune's winds are the fastest in the Solar System, reaching 1,200 mph! 🌬️",
  "On Mars, sunsets are blue because of fine dust in the atmosphere! 🌇",
  "Jupiter is so massive that 1,300 Earths could easily fit inside it! 🪐",
  "Neutron stars are so dense, a single teaspoon of them would weigh 6 billion tons! 🌌",
  "Light from the Sun takes exactly 8 minutes and 20 seconds to reach Earth! ☀️",
  "The footprint of astronauts on the Moon will stay there for 100 million years! 👣",
  "Olympus Mons on Mars is the tallest volcano in the solar system, three times taller than Mount Everest! 🌋",
  "In space, liquid water boils instantly and then freezes into ice crystals! 💧",
  "Saturn's rings are made of billions of chunks of ice, dust, and rock! 💍",
  "The Milky Way galaxy is spinning at 1.3 million miles per hour! 🌀",
  "Halley's Comet passes by Earth once every 75 years! ☄️",
  "Venus is the hottest planet in our Solar System, with temperatures reaching 880°F! 🌡️"
];

// --- Math Utilities ---
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// Small inline SVG music-note glyphs (Unicode note symbols render
// inconsistently across devices, so we draw our own)
function noteSVG(type) {
  const open = '<svg class="note-glyph" viewBox="0 0 28 40" aria-hidden="true">';
  if (type === 'whole') {
    return `${open}<ellipse cx="14" cy="30" rx="9" ry="6" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
  }
  if (type === 'half') {
    return `${open}<ellipse cx="11" cy="32" rx="8" ry="5.5" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="19" y1="32" x2="19" y2="4" stroke="currentColor" stroke-width="2.5"/></svg>`;
  }
  if (type === 'quarter') {
    return `${open}<ellipse cx="11" cy="32" rx="8" ry="5.5" fill="currentColor"/><line x1="19" y1="32" x2="19" y2="4" stroke="currentColor" stroke-width="2.5"/></svg>`;
  }
  // eighth
  return `${open}<ellipse cx="11" cy="32" rx="8" ry="5.5" fill="currentColor"/><line x1="19" y1="32" x2="19" y2="4" stroke="currentColor" stroke-width="2.5"/><path d="M19 4 Q28 8 26 18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
}

// Ops that support the stacked (on-paper) layout
const VERTICAL_OPS = ['multiply', 'divide', 'add', 'subtract'];

function usesVerticalLayout(qOp) {
  return gameState.eqStyle === 'vertical' && VERTICAL_OPS.includes(qOp);
}

// Render a question in stacked written form: numbers right-aligned in a
// column for + − ×, and the long-division bracket for ÷.
function renderVerticalEquation(q, qOp) {
  const vert = document.getElementById('vertical-display');
  if (!vert) return;

  if (qOp === 'divide') {
    vert.innerHTML = `
      <div class="v-div">
        <div class="v-div-q"><span id="vertical-answer-display" class="answer-empty">?</span></div>
        <div class="v-div-divisor">${q.num2}</div>
        <div class="v-div-dividend">${q.num1}</div>
      </div>`;
  } else {
    const opSymbol = qOp === 'add' ? '+' : qOp === 'subtract' ? '−' : '×';
    vert.innerHTML = `
      <div class="v-eq">
        <div class="v-row">${q.num1}</div>
        <div class="v-row"><span class="v-op">${opSymbol}</span><span>${q.num2}</span></div>
        <div class="v-line"></div>
        <div class="v-row"><span id="vertical-answer-display" class="answer-empty">?</span></div>
      </div>`;
  }
  vert.classList.remove('hidden');
}

function syncEqStyleToggle() {
  document.querySelectorAll('#eq-style-group .toggle-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === gameState.eqStyle);
  });
}

// Build one puzzle question. `rand` is injectable so the Daily Mission's
// Puzzle of the Day can be seeded by the date (same puzzle all day long).
function buildPuzzleQuestion(level, rand = Math.random) {
  const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🚀', '⭐', '🪐', '🛸'];
  // The classic Lo Shu magic square in its four rotations (all sum to 15)
  const SQUARES = [
    [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
    [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
    [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
    [[8, 3, 4], [1, 5, 9], [6, 7, 2]]
  ];

  if (level === 'mystery') {
    const kind = ['mul', 'div', 'add', 'sub'][Math.floor(rand() * 4)];
    let eqHtml, text, expected, teach;
    if (kind === 'mul') {
      const a = Math.floor(rand() * 8) + 2;
      const b = Math.floor(rand() * 8) + 2;
      eqHtml = `<span class="mystery-box">?</span> × ${b} = ${a * b}`;
      text = `? × ${b} = ${a * b}`;
      expected = a;
      teach = `${a * b} ÷ ${b} = ${a} — division undoes multiplication! 🧩`;
    } else if (kind === 'div') {
      const a = Math.floor(rand() * 8) + 2;
      const b = Math.floor(rand() * 8) + 2;
      eqHtml = `${a * b} ÷ <span class="mystery-box">?</span> = ${a}`;
      text = `${a * b} ÷ ? = ${a}`;
      expected = b;
      teach = `${a} × ${b} = ${a * b}, so the mystery number is ${b}! 🧩`;
    } else if (kind === 'add') {
      const a = Math.floor(rand() * 40) + 5;
      const b = Math.floor(rand() * 40) + 5;
      eqHtml = `<span class="mystery-box">?</span> + ${b} = ${a + b}`;
      text = `? + ${b} = ${a + b}`;
      expected = a;
      teach = `${a + b} − ${b} = ${a} — subtraction undoes addition! 🧩`;
    } else {
      const a = Math.floor(rand() * 50) + 20;
      const b = Math.floor(rand() * (a - 5)) + 1;
      eqHtml = `${a} − <span class="mystery-box">?</span> = ${a - b}`;
      text = `${a} − ? = ${a - b}`;
      expected = b;
      teach = `${a} − ${a - b} = ${b}, so the mystery number is ${b}! 🧩`;
    }
    return {
      op: 'puzzle',
      html: `<div class="prompt-line">Find the mystery number!</div><div class="prompt-line puzzle-eq">${eqHtml}</div>`,
      promptText: text,
      expected: expected,
      teach: teach
    };
  }

  if (level === 'emoji') {
    const shuffledFruits = [...FRUITS].sort(() => rand() - 0.5);
    const [fa, fb] = shuffledFruits;
    const a = Math.floor(rand() * 8) + 2; // 2-9
    const b = Math.floor(rand() * 9) + 1; // 1-9
    const askCombo = rand() < 0.35;
    const lines = [
      `<div class="prompt-line emoji-eq">${fa} + ${fa} = ${2 * a}</div>`,
      `<div class="prompt-line emoji-eq">${fa} + ${fb} = ${a + b}</div>`
    ];
    if (askCombo) {
      return {
        op: 'puzzle',
        html: lines.join('') + `<div class="prompt-line emoji-eq">${fb} + ${fb} + ${fa} = <b>?</b></div>`,
        promptText: `emoji code: ${fb}+${fb}+${fa}`,
        expected: 2 * b + a,
        teach: `${fa} = ${a} and ${fb} = ${b}, so ${b} + ${b} + ${a} = ${2 * b + a} 🧩`
      };
    }
    return {
      op: 'puzzle',
      html: lines.join('') + `<div class="prompt-line emoji-eq">${fb} = <b>?</b></div>`,
      promptText: `emoji code: ${fb}`,
      expected: b,
      teach: `${fa} + ${fa} = ${2 * a}, so ${fa} = ${a}. Then ${a + b} − ${a} = ${b} 🧩`
    };
  }

  // magic squares
  const k = Math.floor(rand() * 6); // shift all cells by 0-5
  const sq = SQUARES[Math.floor(rand() * SQUARES.length)].map(row => row.map(v => v + k));
  const magicSum = 15 + 3 * k;
  const hr = Math.floor(rand() * 3);
  const hc = Math.floor(rand() * 3);
  const hidden = sq[hr][hc];
  const others = sq[hr].filter((v, ci) => ci !== hc);

  let cells = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells += (r === hr && c === hc)
        ? '<div class="magic-cell missing">?</div>'
        : `<div class="magic-cell">${sq[r][c]}</div>`;
    }
  }
  return {
    op: 'puzzle',
    html: `<div class="prompt-line">Every row and column adds up to <b>${magicSum}</b>.</div><div class="magic-grid">${cells}</div><div class="prompt-line">What goes in the <b>?</b> box?</div>`,
    promptText: `magic square (sum ${magicSum})`,
    expected: hidden,
    teach: `That row: ${magicSum} − ${others[0]} − ${others[1]} = ${hidden} 🧩`
  };
}
function reduceFraction(n, d) {
  if (d === 0) return [n, d];
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}

// --- Web Audio API Synthesizer ---
function initAudio() {
  if (gameState.audioCtx) return;
  // Create audio context (browser requires user interaction first)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    gameState.audioCtx = new AudioContext();
  }
}

function playSound(type) {
  if (!gameState.audioEnabled) return;
  initAudio();
  if (!gameState.audioCtx) return;

  // Resume context if suspended
  if (gameState.audioCtx.state === 'suspended') {
    gameState.audioCtx.resume();
  }

  const ctx = gameState.audioCtx;
  const now = ctx.currentTime;

  switch (type) {
    case 'tap': {
      // Short bubble-pop sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
      break;
    }
    case 'correct': {
      // Sweet 2-note retro chord (C5 then G5 or E5)
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // Soft flute/retro tone
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      };
      
      playTone(523.25, now, 0.12); // C5
      playTone(659.25, now + 0.08, 0.22); // E5
      break;
    }
    case 'wrong': {
      // Descending buzz sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      // Low pass filter to make it less harsh
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
      break;
    }
    case 'warning': {
      // Short lower pitch buzzer sound for warnings
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
      break;
    }
    case 'victory': {
      const playNote = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.05);
      };

      // The equipped Victory Tune from the Star Shop decides the melody
      const jingle = (typeof Progression !== 'undefined' && Progression.getJingle) ? Progression.getJingle() : 'classic';
      if (jingle === 'arpeggio') {
        // Rolling piano arpeggio: C4 up to C6
        const seq = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        seq.forEach((f, i) => playNote(f, now + i * 0.09, 0.18));
      } else if (jingle === 'glissando') {
        // Sparkly run up a whole-tone-ish scale, landing on high C
        for (let i = 0; i <= 12; i += 2) {
          playNote(523.25 * Math.pow(2, i / 12), now + (i / 2) * 0.06, 0.10);
        }
        playNote(1046.50, now + 0.45, 0.5);
      } else {
        // Classic triumphant arpeggio: C5 -> E5 -> G5 -> C6
        const tempo = 0.15;
        playNote(523.25, now, 0.25); // C5
        playNote(659.25, now + tempo, 0.25); // E5
        playNote(783.99, now + tempo * 2, 0.25); // G5
        playNote(1046.50, now + tempo * 3, 0.50); // C6
      }
      break;
    }
  }
}

// --- Confetti Particle System ---
const canvas = document.getElementById('confetti-canvas');
const canvasCtx = canvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.size = Math.random() * 10 + 6;
    this.color = `oklch(${Math.random() * 0.2 + 0.7} ${Math.random() * 0.15 + 0.1} ${Math.random() * 360})`;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 6 + 4;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    canvasCtx.save();
    canvasCtx.translate(this.x, this.y);
    canvasCtx.rotate((this.rotation * Math.PI) / 180);
    canvasCtx.fillStyle = this.color;
    // Draw small rectangle confetti
    canvasCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    canvasCtx.restore();
  }
}

function startConfetti() {
  stopConfetti();
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  
  function animate() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    
    confettiParticles.forEach(p => {
      p.update();
      p.draw();
      if (p.y < canvas.height) {
        active = true;
      }
    });

    if (active) {
      confettiAnimationId = requestAnimationFrame(animate);
    } else {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

function stopConfetti() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Mascot Cosmo Interaction ---
function setMascotExpression(type, customText = null) {
  const speechElement = document.getElementById(
    type === 'setup' ? 'setup-mascot-speech' : 
    type === 'results' ? 'results-mascot-speech' : 'game-mascot-speech'
  );
  if (!speechElement) return;

  if (customText) {
    speechElement.innerText = customText;
    return;
  }

  let phrases = [];
  if (type === 'setup') phrases = mascotPhrases.welcome;
  else if (type === 'results') phrases = mascotPhrases.welcome; // Fallback
  else if (type === 'correct') phrases = mascotPhrases.correct;
  else if (type === 'incorrect') phrases = mascotPhrases.incorrect;
  
  if (phrases.length > 0) {
    let randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    // Sometimes cheer the player on by name
    const playerName = (typeof Progression !== 'undefined') ? Progression.getName() : '';
    if (type === 'correct' && playerName && Math.random() < 0.35) {
      const namePhrases = [
        `Amazing work, ${playerName}! 🌟`,
        `${playerName}, you're a math superstar! 💫`,
        `Cosmo is so proud of you, ${playerName}! 🚀`,
        `Blast off, ${playerName}! That's correct! ⚡`
      ];
      randomPhrase = namePhrases[Math.floor(Math.random() * namePhrases.length)];
    }
    speechElement.innerText = randomPhrase;
  }
}

// --- Game Logic Functions ---

// Build table choice UI
function initSetupUI() {
  const grid = document.querySelector('.tables-selector-grid');
  grid.innerHTML = '';
  
  // Tables 1 to 15
  for (let i = 1; i <= 15; i++) {
    const btn = document.createElement('button');
    btn.className = 'table-btn';
    btn.innerText = i;
    btn.dataset.table = i;
    
    btn.addEventListener('click', () => {
      playSound('tap');
      btn.classList.toggle('selected');
      updateSelectedTablesList();
    });
    grid.appendChild(btn);
  }

  // Pre-select Easy Table as default
  applyPreset('easy');

  // Add click events to Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      applyPreset(btn.dataset.preset);
    });
  });

  // Action buttons
  document.getElementById('btn-select-all').addEventListener('click', () => {
    playSound('tap');
    document.querySelectorAll('.table-btn').forEach(btn => btn.classList.add('selected'));
    updateSelectedTablesList();
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    playSound('tap');
    document.querySelectorAll('.table-btn').forEach(btn => btn.classList.remove('selected'));
    updateSelectedTablesList();
  });

  // Operation tabs selector
  document.querySelectorAll('.op-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('.op-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const op = btn.dataset.op;
      gameState.activeOp = op;
      
      const configMulti = document.getElementById('config-multiplication');
      const configDigits = document.getElementById('config-digits');
      const configClock = document.getElementById('config-clock');
      const configFraction = document.getElementById('config-fraction');
      const configSequence = document.getElementById('config-sequence');
      const configCompare = document.getElementById('config-compare');
      const configMusic = document.getElementById('config-music');
      const configAngles = document.getElementById('config-angles');
      const configPuzzle = document.getElementById('config-puzzle');
      const configPokemon = document.getElementById('config-pokemon');
      const subtitle = document.getElementById('setup-subtitle');
      const multiHeading = configMulti.querySelector('h2');

      // Hide all configurations first
      configMulti.classList.add('hidden');
      configDigits.classList.add('hidden');
      configClock.classList.add('hidden');
      configFraction.classList.add('hidden');
      if (configSequence) configSequence.classList.add('hidden');
      if (configCompare) configCompare.classList.add('hidden');
      if (configMusic) configMusic.classList.add('hidden');
      if (configAngles) configAngles.classList.add('hidden');
      if (configPuzzle) configPuzzle.classList.add('hidden');
      if (configPokemon) configPokemon.classList.add('hidden');

      if (op === 'multiply') {
        configMulti.classList.remove('hidden');
        if (multiHeading) multiHeading.innerText = "🎯 Choose Tables to Test";
        subtitle.innerText = "Select your multiplication tables and prepare your rocket!";
        setMascotExpression('setup', "Hi! I'm Cosmo! Select your tables, and let's go explore the math galaxy together! 💫");
      } else if (op === 'divide') {
        configMulti.classList.remove('hidden');
        if (multiHeading) multiHeading.innerText = "🎯 Choose Divisors to Test";
        subtitle.innerText = "Select your division divisors and prepare your rocket!";
        setMascotExpression('setup', "Division Zone! Divide numbers to split our rocket thruster cells! ➗");
      } else if (op === 'add') {
        configDigits.classList.remove('hidden');
        subtitle.innerText = "Select your addition number size and prepare your rocket!";
        setMascotExpression('setup', "Addition Zone! Add numbers together to generate high engine pressure! ➕");
      } else if (op === 'subtract') {
        configDigits.classList.remove('hidden');
        subtitle.innerText = "Select your subtraction number size and prepare your rocket!";
        setMascotExpression('setup', "Subtraction Zone! Decrease numbers to steer our spacecraft! ➖");
      } else if (op === 'sequence') {
        if (configSequence) configSequence.classList.remove('hidden');
        subtitle.innerText = "Select your sequence level and prepare your rocket!";
        setMascotExpression('setup', "Sequence Zone! Find the cosmic pattern to guide our ship through asteroid fields! ☄️");
      } else if (op === 'compare') {
        if (configCompare) configCompare.classList.remove('hidden');
        subtitle.innerText = "Select your comparison difficulty and prepare your rocket!";
        setMascotExpression('setup', "Comparison Zone! Balance the gravitational weights of space sectors! ⚖️");
      } else if (op === 'clock') {
        configClock.classList.remove('hidden');
        subtitle.innerText = "Select your time difficulty and prepare your rocket!";
        setMascotExpression('setup', "Clock Zone! Read the clock face to align our satellite dish! ⏰");
      } else if (op === 'fraction') {
        configFraction.classList.remove('hidden');
        subtitle.innerText = "Select your fraction level and prepare your rocket!";
        setMascotExpression('setup', "Fraction Zone! Slice the space pizza and master fractions! 🍕");
      } else if (op === 'music') {
        if (configMusic) configMusic.classList.remove('hidden');
        subtitle.innerText = "Select your music math level and prepare your rocket!";
        setMascotExpression('setup', "Rhythm Zone! Count beats and notes like a space pianist! 🎵");
      } else if (op === 'angles') {
        if (configAngles) configAngles.classList.remove('hidden');
        subtitle.innerText = "Select your turns difficulty and prepare your rocket!";
        setMascotExpression('setup', "Gymnastics Zone! Twist and turn through the degrees! 🤸");
      } else if (op === 'puzzle') {
        if (configPuzzle) configPuzzle.classList.remove('hidden');
        subtitle.innerText = "Select your puzzle type and prepare your rocket!";
        setMascotExpression('setup', "Puzzle Zone! Crack the cosmic riddles with your brain power! 🧩");
      } else if (op === 'pokemon') {
        if (configPokemon) configPokemon.classList.remove('hidden');
        subtitle.innerText = "Select your Pokémon quiz and prepare your rocket!";
        setMascotExpression('setup', "Poké Galaxy! Tap the right answer — gotta know 'em all! ⚡");
      }
    });
  });

  // Digit level buttons
  document.querySelectorAll('#config-digits .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-digits .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.digitLevel = btn.dataset.level;
    });
  });

  // Clock difficulty level buttons
  document.querySelectorAll('#config-clock .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-clock .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.clockLevel = btn.dataset.level;
    });
  });

  // Fraction difficulty level buttons
  document.querySelectorAll('#config-fraction .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-fraction .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.fractionLevel = btn.dataset.level;
    });
  });

  // Sequence difficulty level buttons
  document.querySelectorAll('#config-sequence .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-sequence .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.sequenceLevel = btn.dataset.level;
    });
  });

  // Compare difficulty level buttons
  document.querySelectorAll('#config-compare .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-compare .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.compareLevel = btn.dataset.level;
    });
  });

  // Music level buttons
  document.querySelectorAll('#config-music .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-music .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.musicLevel = btn.dataset.level;
    });
  });

  // Angles level buttons
  document.querySelectorAll('#config-angles .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-angles .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.anglesLevel = btn.dataset.level;
    });
  });

  // Puzzle level buttons
  document.querySelectorAll('#config-puzzle .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-puzzle .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.puzzleLevel = btn.dataset.level;
    });
  });

  // Pokémon level buttons
  document.querySelectorAll('#config-pokemon .digit-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#config-pokemon .digit-level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.pokemonLevel = btn.dataset.level;
    });
  });

  // Fraction inputs click focus handling
  const fracNumInput = document.getElementById('fraction-input-num');
  const fracDenInput = document.getElementById('fraction-input-den');
  if (fracNumInput && fracDenInput) {
    fracNumInput.addEventListener('click', () => {
      if (gameState.activeOp === 'fraction') {
        playSound('tap');
        if (gameState.fractionAutoAdvanceTimer) {
          clearTimeout(gameState.fractionAutoAdvanceTimer);
          gameState.fractionAutoAdvanceTimer = null;
        }
        gameState.activeFractionInput = 'numerator';
        fracNumInput.classList.add('active');
        fracNumInput.classList.remove('waiting');
        fracDenInput.classList.remove('active');
      }
    });
    fracDenInput.addEventListener('click', () => {
      if (gameState.activeOp === 'fraction') {
        playSound('tap');
        if (gameState.fractionAutoAdvanceTimer) {
          clearTimeout(gameState.fractionAutoAdvanceTimer);
          gameState.fractionAutoAdvanceTimer = null;
        }
        gameState.activeFractionInput = 'denominator';
        fracDenInput.classList.add('active');
        fracNumInput.classList.remove('active', 'waiting');
      }
    });
  }

  // Clock inputs click focus handling
  const clockHourInput = document.getElementById('clock-input-hour');
  const clockMinInput = document.getElementById('clock-input-min');
  if (clockHourInput && clockMinInput) {
    clockHourInput.addEventListener('click', () => {
      playSound('tap');
      gameState.activeClockInput = 'hour';
      clockHourInput.classList.add('active');
      clockMinInput.classList.remove('active');
    });
    clockMinInput.addEventListener('click', () => {
      playSound('tap');
      gameState.activeClockInput = 'minute';
      clockMinInput.classList.add('active');
      clockHourInput.classList.remove('active');
    });
  }

  // Questions Count selector
  document.querySelectorAll('#question-count-group .toggle-option').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#question-count-group .toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.questionCount = parseInt(btn.dataset.value);
    });
  });

  // Number Style selector (across vs stacked) — persisted per player
  document.querySelectorAll('#eq-style-group .toggle-option').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      gameState.eqStyle = btn.dataset.value;
      syncEqStyleToggle();
      if (typeof Progression !== 'undefined') Progression.setEqStyle(gameState.eqStyle);
    });
  });

  // In-game flip button: re-renders the current question in the other style
  const flipStyleBtn = document.getElementById('btn-flip-style');
  if (flipStyleBtn) {
    flipStyleBtn.addEventListener('click', () => {
      playSound('tap');
      gameState.eqStyle = gameState.eqStyle === 'vertical' ? 'horizontal' : 'vertical';
      syncEqStyleToggle();
      if (typeof Progression !== 'undefined') Progression.setEqStyle(gameState.eqStyle);
      if (!document.getElementById('screen-game').classList.contains('hidden')) {
        loadQuestion();
      }
    });
  }

  // Game Mode selector
  document.querySelectorAll('#game-mode-group .toggle-option').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#game-mode-group .toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.gameMode = btn.dataset.value;
    });
  });

  // Start game click (custom mission from the setup screen)
  document.getElementById('btn-start-game').addEventListener('click', () => {
    gameState.injectedQuestions = null;
    // Custom missions that exactly match a planet level still earn its stars
    gameState.missionKey = (typeof Progression !== 'undefined') ? Progression.keyFromState(gameState) : null;
    launchGame();
  });

  // Restart click on Results
  document.getElementById('btn-restart').addEventListener('click', resetToSetup);

  // Trivia Close click
  const closeTriviaBtn = document.getElementById('btn-close-trivia');
  if (closeTriviaBtn) {
    closeTriviaBtn.addEventListener('click', () => {
      playSound('tap');
      const triviaPopup = document.getElementById('trivia-popup');
      if (triviaPopup) {
        triviaPopup.classList.add('hidden');
      }
    });
  }

  // Sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  soundBtn.addEventListener('click', () => {
    gameState.audioEnabled = !gameState.audioEnabled;
    soundBtn.innerHTML = gameState.audioEnabled ? '<span class="icon">🔊</span>' : '<span class="icon">🔇</span>';
    soundBtn.classList.toggle('active', !gameState.audioEnabled);
    if (gameState.audioEnabled) {
      playSound('tap');
    }
  });

  // Setup initial Cosmo text
  setMascotExpression('setup');
}

function applyPreset(preset) {
  const buttons = document.querySelectorAll('.table-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));

  let targets = [];
  if (preset === 'easy') targets = [2, 5, 10];
  else if (preset === 'medium') targets = [3, 4, 6, 11];
  else if (preset === 'hard') targets = [7, 8, 9, 12];
  else if (preset === 'cosmic') targets = [13, 14, 15];
  else if (preset === 'all') targets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  buttons.forEach(btn => {
    const val = parseInt(btn.dataset.table);
    if (targets.includes(val)) {
      btn.classList.add('selected');
    }
  });
  updateSelectedTablesList();
}

function updateSelectedTablesList() {
  gameState.selectedTables = [];
  document.querySelectorAll('.table-btn.selected').forEach(btn => {
    gameState.selectedTables.push(parseInt(btn.dataset.table));
  });
}

// Transition helper between screens
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  const activeScreen = document.getElementById(screenId);
  activeScreen.classList.remove('hidden');
  
  // Trigger layout refresh or focus if necessary
  if (screenId === 'screen-setup') {
    stopConfetti();
    setMascotExpression('setup');
    const triviaPopup = document.getElementById('trivia-popup');
    if (triviaPopup) triviaPopup.classList.add('hidden');
  }

  if (screenId === 'screen-galaxy') {
    stopConfetti();
    const triviaPopup = document.getElementById('trivia-popup');
    if (triviaPopup) triviaPopup.classList.add('hidden');
    if (typeof Progression !== 'undefined') Progression.renderGalaxy();
  }
}

// Generate the randomized arithmetic pool
function generateQuestions() {
  // Daily missions arrive as a pre-built list of the player's weakest facts
  if (gameState.injectedQuestions && gameState.injectedQuestions.length > 0) {
    gameState.currentQuestions = gameState.injectedQuestions.map(q => ({ ...q }));
    gameState.questionCount = gameState.currentQuestions.length;
    return;
  }

  const pool = [];

  if (gameState.activeOp === 'multiply') {
    if (gameState.selectedTables.length === 0) {
      gameState.selectedTables = [2];
    }
    
    // Create all combinations of (selectedTables) x (1..12)
    gameState.selectedTables.forEach(t => {
      for (let multiplier = 1; multiplier <= 12; multiplier++) {
        // Randomly decide left/right ordering to make it diverse
        const swap = Math.random() > 0.5;
        pool.push({
          num1: swap ? multiplier : t,
          num2: swap ? t : multiplier,
          expected: t * multiplier,
          op: 'multiply'
        });
      }
    });
  } else if (gameState.activeOp === 'divide') {
    if (gameState.selectedTables.length === 0) {
      gameState.selectedTables = [2];
    }
    
    // Create division combinations using selected tables as divisors
    gameState.selectedTables.forEach(d => {
      for (let quotient = 1; quotient <= 12; quotient++) {
        const dividend = quotient * d;
        pool.push({
          num1: dividend,
          num2: d,
          expected: quotient,
          op: 'divide'
        });
      }
    });
  } else if (gameState.activeOp === 'clock') {
    const level = gameState.clockLevel;
    const targetCount = Math.max(50, gameState.questionCount);

    for (let i = 0; i < targetCount; i++) {
      let hour = Math.floor(Math.random() * 12) + 1; // 1 to 12
      let min = 0;

      if (level === 'hour') {
        min = 0;
      } else if (level === 'quarter') {
        const choices = [0, 15, 30, 45];
        min = choices[Math.floor(Math.random() * choices.length)];
      } else if (level === 'five-min') {
        min = Math.floor(Math.random() * 12) * 5; // 0, 5, 10 ... 55
      } else { // precision
        min = Math.floor(Math.random() * 60); // 0 to 59
      }

      const minStr = min < 10 ? `0${min}` : `${min}`;
      const expectedStr = `${hour}:${minStr}`;

      pool.push({
        num1: hour,
        num2: min,
        expected: expectedStr,
        op: 'clock'
      });
    }
  } else if (gameState.activeOp === 'fraction') {
    const level = gameState.fractionLevel;
    const targetCount = Math.max(50, gameState.questionCount);

    if (level === 'identify') {
      // All valid simple fractions: denominators 2-8, numerator 1 to d-1
      const allFracs = [];
      for (const d of [2, 3, 4, 5, 6, 8]) {
        for (let n = 1; n < d; n++) {
          allFracs.push({ n, d });
        }
      }
      // Shuffle and repeat to fill pool
      for (let i = allFracs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFracs[i], allFracs[j]] = [allFracs[j], allFracs[i]];
      }
      for (let i = 0; i < targetCount; i++) {
        const { n, d } = allFracs[i % allFracs.length];
        pool.push({ num1: n, num2: d, expected: `${n}/${d}`, op: 'fraction', subtype: 'identify' });
      }
    } else if (level === 'simplify') {
      // Fractions that can be reduced: multiply a simple fraction by a factor 2-4
      const baseFracs = [
        [1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],
        [1,6],[5,6],[1,7],[2,7],[3,7],[1,8],[3,8],[5,8],[7,8]
      ];
      for (let i = 0; i < targetCount; i++) {
        const [bn, bd] = baseFracs[i % baseFracs.length];
        const factor = Math.floor(Math.random() * 3) + 2; // 2-4
        const n = bn * factor;
        const d = bd * factor;
        // expected is the reduced (base) form
        pool.push({ num1: n, num2: d, expected: `${bn}/${bd}`, op: 'fraction', subtype: 'simplify' });
      }
    } else if (level === 'add') {
      const denoms = [2, 3, 4, 5, 6, 8];
      for (let i = 0; i < targetCount; i++) {
        const d = denoms[Math.floor(Math.random() * denoms.length)];
        const n1 = Math.floor(Math.random() * (d - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d - n1)) + 1; // ensure sum <= d-1 (no whole)
        const sumN = n1 + n2;
        const g = gcd(sumN, d);
        const rn = sumN / g, rd = d / g;
        pool.push({ num1: n1, num2: n2, expected: `${rn}/${rd}`, op: 'fraction', subtype: 'add', denom: d });
      }
    } else { // subtract
      const denoms = [2, 3, 4, 5, 6, 8];
      for (let i = 0; i < targetCount; i++) {
        const d = denoms[Math.floor(Math.random() * denoms.length)];
        const n1 = Math.floor(Math.random() * (d - 1)) + 2; // at least 2
        const n2 = Math.floor(Math.random() * (n1 - 1)) + 1; // n2 < n1
        const diffN = n1 - n2;
        const g = gcd(diffN, d);
        const rn = diffN / g, rd = d / g;
        pool.push({ num1: n1, num2: n2, expected: `${rn}/${rd}`, op: 'fraction', subtype: 'subtract', denom: d });
      }
    }
  } else if (gameState.activeOp === 'sequence') {
    const level = gameState.sequenceLevel;
    const targetCount = Math.max(50, gameState.questionCount);

    for (let i = 0; i < targetCount; i++) {
      if (level === 'easy') {
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 5) + 1;
        const isAddition = Math.random() > 0.4;
        const terms = [];
        if (isAddition) {
          for (let j = 0; j < 5; j++) {
            terms.push(start + j * step);
          }
        } else {
          const startHigh = start + 4 * step;
          for (let j = 0; j < 5; j++) {
            terms.push(startHigh - j * step);
          }
        }
        pool.push({
          op: 'sequence',
          subtype: 'easy',
          terms: terms.slice(0, 4),
          expected: terms[4]
        });
      } else if (level === 'medium') {
        const coin = Math.random() > 0.5;
        if (coin) {
          const stepVal = Math.floor(Math.random() * 8) + 3;
          const add = Math.random() > 0.5;
          const termsDouble = [];
          const startD = add ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 40) + 50;
          for (let j = 0; j < 5; j++) {
            termsDouble.push(add ? startD + j * stepVal : startD - j * stepVal);
          }
          pool.push({
            op: 'sequence',
            subtype: 'medium',
            terms: termsDouble.slice(0, 4),
            expected: termsDouble[4]
          });
        } else {
          const start = Math.floor(Math.random() * 10) + 2;
          const step1 = Math.floor(Math.random() * 4) + 2;
          const step2 = Math.floor(Math.random() * 2) + 1;
          const terms = [start];
          for (let j = 1; j < 5; j++) {
            if (j % 2 === 1) {
              terms.push(terms[j - 1] + step1);
            } else {
              terms.push(terms[j - 1] - step2);
            }
          }
          pool.push({
            op: 'sequence',
            subtype: 'medium',
            terms: terms.slice(0, 4),
            expected: terms[4]
          });
        }
      } else {
        const isFib = Math.random() > 0.5;
        if (isFib) {
          const start1 = Math.floor(Math.random() * 3) + 1;
          const start2 = start1 + Math.floor(Math.random() * 3) + 1;
          const terms = [start1, start2];
          for (let j = 2; j < 5; j++) {
            terms.push(terms[j - 1] + terms[j - 2]);
          }
          pool.push({
            op: 'sequence',
            subtype: 'hard',
            terms: terms.slice(0, 4),
            expected: terms[4]
          });
        } else {
          const factor = Math.random() > 0.6 ? 3 : 2;
          const start = Math.floor(Math.random() * 4) + 1;
          const terms = [];
          for (let j = 0; j < 5; j++) {
            terms.push(Math.round(start * Math.pow(factor, j)));
          }
          pool.push({
            op: 'sequence',
            subtype: 'hard',
            terms: terms.slice(0, 4),
            expected: terms[4]
          });
        }
      }
    }
  } else if (gameState.activeOp === 'compare') {
    const level = gameState.compareLevel;
    const targetCount = Math.max(50, gameState.questionCount);

    for (let i = 0; i < targetCount; i++) {
      let lhsText = '', rhsText = '';
      let lhsVal = 0, rhsVal = 0;

      if (level === 'easy') {
        lhsVal = Math.floor(Math.random() * 40) + 1;
        if (Math.random() < 0.2) {
          rhsVal = lhsVal;
        } else {
          rhsVal = Math.floor(Math.random() * 40) + 1;
        }
        lhsText = `${lhsVal}`;
        rhsText = `${rhsVal}`;
      } else if (level === 'medium') {
        const formIsLeft = Math.random() > 0.5;
        const opType = ['add', 'subtract', 'multiply'][Math.floor(Math.random() * 3)];
        let fVal = 0, text = '';
        if (opType === 'add') {
          const a = Math.floor(Math.random() * 20) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          fVal = a + b;
          text = `${a} + ${b}`;
        } else if (opType === 'subtract') {
          const a = Math.floor(Math.random() * 30) + 10;
          const b = Math.floor(Math.random() * a) + 1;
          fVal = a - b;
          text = `${a} − ${b}`;
        } else {
          const a = Math.floor(Math.random() * 9) + 2;
          const b = Math.floor(Math.random() * 8) + 2;
          fVal = a * b;
          text = `${a} × ${b}`;
        }

        let numVal = 0;
        if (Math.random() < 0.2) {
          numVal = fVal;
        } else {
          const diff = Math.floor(Math.random() * 9) - 4;
          numVal = Math.max(1, fVal + diff);
        }

        if (formIsLeft) {
          lhsVal = fVal; lhsText = text;
          rhsVal = numVal; rhsText = `${numVal}`;
        } else {
          lhsVal = numVal; lhsText = `${numVal}`;
          rhsVal = fVal; rhsText = text;
        }
      } else {
        const generateFormula = () => {
          const opType = ['add', 'subtract', 'multiply'][Math.floor(Math.random() * 3)];
          if (opType === 'add') {
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            return { val: a + b, text: `${a} + ${b}` };
          } else if (opType === 'subtract') {
            const a = Math.floor(Math.random() * 30) + 10;
            const b = Math.floor(Math.random() * a) + 1;
            return { val: a - b, text: `${a} − ${b}` };
          } else {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 2;
            return { val: a * b, text: `${a} × ${b}` };
          }
        };

        const f1 = generateFormula();
        let f2 = generateFormula();

        if (Math.random() < 0.2) {
          f2.val = f1.val;
          if (f1.val > 5) {
            const offset = Math.floor(Math.random() * 4) + 1;
            f2.text = `${f1.val - offset} + ${offset}`;
          }
        }

        lhsVal = f1.val; lhsText = f1.text;
        rhsVal = f2.val; rhsText = f2.text;
      }

      const expected = lhsVal < rhsVal ? '<' : lhsVal > rhsVal ? '>' : '=';
      pool.push({
        op: 'compare',
        lhsText: lhsText,
        rhsText: rhsText,
        lhsVal: lhsVal,
        rhsVal: rhsVal,
        expected: expected
      });
    }
  } else if (gameState.activeOp === 'music') {
    // Music Math: note values ARE fractions — ties directly to piano theory
    const level = gameState.musicLevel;
    const targetCount = Math.max(50, gameState.questionCount);
    const NOTE_INFO = {
      whole:   { beats: 4, label: 'whole note' },
      half:    { beats: 2, label: 'half note' },
      quarter: { beats: 1, label: 'quarter note' },
      eighth:  { beats: 0.5, label: 'eighth note' }
    };

    for (let i = 0; i < targetCount; i++) {
      if (level === 'notes') {
        if (Math.random() < 0.5) {
          const types = ['whole', 'half', 'quarter'];
          const t = types[Math.floor(Math.random() * types.length)];
          pool.push({
            op: 'music',
            html: `<div class="prompt-line">How many <b>beats</b> is a <b>${NOTE_INFO[t].label}</b>?</div><div class="prompt-notes">${noteSVG(t)}</div>`,
            promptText: `Beats in a ${NOTE_INFO[t].label}`,
            expected: NOTE_INFO[t].beats,
            teach: 'Quarter note = 1 beat, half note = 2 beats, whole note = 4 beats 🎵'
          });
        } else {
          const pairs = [
            ['quarter', 'whole'], ['quarter', 'half'], ['half', 'whole'],
            ['eighth', 'quarter'], ['eighth', 'half'], ['eighth', 'whole']
          ];
          const [small, big] = pairs[Math.floor(Math.random() * pairs.length)];
          const answer = NOTE_INFO[big].beats / NOTE_INFO[small].beats;
          pool.push({
            op: 'music',
            html: `<div class="prompt-line">How many <b>${NOTE_INFO[small].label}s</b> ${noteSVG(small)} fit in a <b>${NOTE_INFO[big].label}</b> ${noteSVG(big)}?</div>`,
            promptText: `${NOTE_INFO[small].label}s in a ${NOTE_INFO[big].label}`,
            expected: answer,
            teach: `A ${NOTE_INFO[big].label} lasts ${NOTE_INFO[big].beats} beats — that's ${answer} ${NOTE_INFO[small].label}s! 🎵`
          });
        }
      } else if (level === 'beats') {
        const types = ['whole', 'half', 'quarter'];
        const n = Math.random() < 0.5 ? 2 : 3;
        const chosen = [];
        for (let j = 0; j < n; j++) chosen.push(types[Math.floor(Math.random() * types.length)]);
        const total = chosen.reduce((sum, t) => sum + NOTE_INFO[t].beats, 0);
        pool.push({
          op: 'music',
          html: `<div class="prompt-line">How many <b>beats</b> in total?</div><div class="prompt-notes">${chosen.map(t => noteSVG(t)).join('<span class="prompt-plus">+</span>')}</div>`,
          promptText: chosen.map(t => NOTE_INFO[t].label).join(' + '),
          expected: total,
          teach: `${chosen.map(t => NOTE_INFO[t].beats).join(' + ')} = ${total} beats 🎶`
        });
      } else { // measures
        const beatsPerMeasure = [2, 3, 4][Math.floor(Math.random() * 3)];
        const measures = Math.floor(Math.random() * 5) + 2; // 2-6
        pool.push({
          op: 'music',
          html: `<div class="prompt-line">A song has <b>${measures} measures</b> of <b>${beatsPerMeasure}/4</b> time.<br>How many beats in total?</div>`,
          promptText: `${measures} measures of ${beatsPerMeasure}/4`,
          expected: measures * beatsPerMeasure,
          teach: `${beatsPerMeasure} beats per measure × ${measures} measures = ${measures * beatsPerMeasure} 🎵`
        });
      }
    }
  } else if (gameState.activeOp === 'angles') {
    // Turns & Angles: gymnastics vocabulary is angle math in disguise
    const level = gameState.anglesLevel;
    const targetCount = Math.max(50, gameState.questionCount);
    const TURNS = [
      { name: 'quarter turn', deg: 90 },
      { name: 'half turn', deg: 180 },
      { name: 'three-quarter turn', deg: 270 },
      { name: 'full twist', deg: 360 }
    ];
    const TEACH_TURNS = 'Quarter = 90°, Half = 180°, Three-quarter = 270°, Full twist = 360° 🤸';

    for (let i = 0; i < targetCount; i++) {
      if (level === 'turns') {
        const t = TURNS[Math.floor(Math.random() * TURNS.length)];
        pool.push({
          op: 'angles',
          html: `<div class="prompt-line">A gymnast does a <b>${t.name}</b>.<br>How many <b>degrees</b> is that?</div>`,
          promptText: `${t.name} in degrees`,
          expected: t.deg,
          teach: TEACH_TURNS
        });
      } else if (level === 'combine') {
        const n = Math.random() < 0.7 ? 2 : 3;
        const moves = [];
        for (let j = 0; j < n; j++) moves.push(TURNS[Math.floor(Math.random() * TURNS.length)]);
        const total = moves.reduce((sum, m) => sum + m.deg, 0);
        pool.push({
          op: 'angles',
          html: `<div class="prompt-line">A routine: a <b>${moves.map(m => m.name).join('</b>, then a <b>')}</b>.<br>Total <b>degrees</b>?</div>`,
          promptText: moves.map(m => m.name).join(' + '),
          expected: total,
          teach: `${moves.map(m => m.deg + '°').join(' + ')} = ${total}° 🤸`
        });
      } else { // convert
        const variants = [
          { html: 'A <b>full twist</b> = how many <b>quarter turns</b>?', text: 'quarter turns in a full twist', expected: 4, teach: '360° ÷ 90° = 4 quarter turns 🤸' },
          { html: 'A <b>half turn</b> = how many <b>quarter turns</b>?', text: 'quarter turns in a half turn', expected: 2, teach: '180° ÷ 90° = 2 quarter turns 🤸' },
          { html: 'How many <b>quarter turns</b> make <b>270°</b>?', text: 'quarter turns in 270°', expected: 3, teach: '90° + 90° + 90° = 270° 🤸' },
          { html: 'How many <b>half turns</b> make a <b>full twist</b>?', text: 'half turns in a full twist', expected: 2, teach: '180° + 180° = 360° 🤸' },
          { html: '<b>Two full twists</b> = how many <b>degrees</b>?', text: 'two full twists in degrees', expected: 720, teach: '360° × 2 = 720° 🤸' },
          { html: 'How many <b>quarter turns</b> in <b>two full twists</b>?', text: 'quarter turns in two full twists', expected: 8, teach: '4 quarter turns per twist × 2 = 8 🤸' }
        ];
        const v = variants[Math.floor(Math.random() * variants.length)];
        pool.push({
          op: 'angles',
          html: `<div class="prompt-line">${v.html}</div>`,
          promptText: v.text,
          expected: v.expected,
          teach: v.teach
        });
      }
    }
  } else if (gameState.activeOp === 'puzzle') {
    const targetCount = Math.max(50, gameState.questionCount);
    for (let i = 0; i < targetCount; i++) {
      pool.push(buildPuzzleQuestion(gameState.puzzleLevel));
    }
  } else if (gameState.activeOp === 'pokemon') {
    const targetCount = Math.max(50, gameState.questionCount);
    for (let i = 0; i < targetCount; i++) {
      pool.push(buildPokemonQuestion(gameState.pokemonLevel));
    }
  } else {
    // Addition & Subtraction Mode
    let minVal = 1, maxVal = 9;
    const level = gameState.digitLevel;
    
    if (level === 'single') { minVal = 1; maxVal = 9; }
    else if (level === 'double') { minVal = 10; maxVal = 99; }
    else if (level === 'triple') { minVal = 100; maxVal = 999; }

    const targetCount = Math.max(50, gameState.questionCount);
    for (let i = 0; i < targetCount; i++) {
      let n1, n2;
      if (level === 'mixed') {
        const sizes = [[1, 9], [10, 99], [100, 999]];
        const rSize1 = sizes[Math.floor(Math.random() * 3)];
        const rSize2 = sizes[Math.floor(Math.random() * 3)];
        n1 = Math.floor(Math.random() * (rSize1[1] - rSize1[0] + 1)) + rSize1[0];
        n2 = Math.floor(Math.random() * (rSize2[1] - rSize2[0] + 1)) + rSize2[0];
      } else {
        n1 = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        n2 = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      }

      let expected;
      if (gameState.activeOp === 'add') {
        expected = n1 + n2;
      } else {
        // Subtraction: make sure expected is positive
        if (n1 < n2) {
          [n1, n2] = [n2, n1];
        }
        expected = n1 - n2;
      }

      pool.push({
        num1: n1,
        num2: n2,
        expected: expected,
        op: gameState.activeOp
      });
    }
  }

  // Adaptive selection for multiplication/division: facts the player gets
  // wrong or answers slowly are much more likely to be picked.
  if (gameState.activeOp === 'multiply' || gameState.activeOp === 'divide') {
    gameState.currentQuestions = Mastery.weightedSample(pool, gameState.questionCount);
    return;
  }

  // Shuffle the pool (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Slice down to requested question count
  gameState.currentQuestions = pool.slice(0, gameState.questionCount);
  
  // Duplication fallback if selected set is smaller than required questions
  while (gameState.currentQuestions.length < gameState.questionCount) {
    const duplicate = pool.map(item => ({...item}));
    gameState.currentQuestions.push(...duplicate);
  }
  
  gameState.currentQuestions = gameState.currentQuestions.slice(0, gameState.questionCount);
}

function launchGame() {
  if (gameState.activeOp === 'multiply' && gameState.selectedTables.length === 0) {
    alert("🌌 Please select at least one multiplication table first!");
    return;
  }

  playSound('tap');
  generateQuestions();

  // Reset Game variables
  gameState.currentQuestionIndex = 0;
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.correctAnswersCount = 0;
  gameState.answersLog = [];
  gameState.currentAnswer = '';
  gameState.missedQuestions = [];
  gameState.rematchDone = false;

  if (typeof Progression !== 'undefined') Progression.applyCosmetics();

  // Update UI Elements
  document.getElementById('game-score').innerText = '0';
  updateComboHUD();
  updateProgressRocket();

  // Show Game screen
  showScreen('screen-game');

  // Start first question
  loadQuestion();
}

function loadQuestion() {
  gameState.currentAnswer = '';
  updateAnswerDisplay();

  // Hide any teaching visual from the previous question
  const visualHelper = document.getElementById('visual-helper');
  if (visualHelper) {
    visualHelper.classList.add('hidden');
    visualHelper.innerHTML = '';
  }
  const promptDisplayReset = document.getElementById('prompt-display');
  if (promptDisplayReset) promptDisplayReset.classList.add('hidden');
  const choicePadReset = document.getElementById('choice-pad');
  if (choicePadReset) choicePadReset.classList.add('hidden');
  const promptAnswerRowReset = document.querySelector('.prompt-answer-row');
  if (promptAnswerRowReset) promptAnswerRowReset.classList.remove('hidden');
  const verticalDisplayReset = document.getElementById('vertical-display');
  if (verticalDisplayReset) verticalDisplayReset.classList.add('hidden');

  const mathCard = document.getElementById('math-card');
  const clockCard = document.getElementById('clock-card');
  mathCard.className = 'math-card glass-panel'; // clear templates
  clockCard.className = 'clock-card glass-panel';

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  // Branch on the question's own op where it can differ from the mission op
  // (the Daily Mission mixes multiply/divide facts with a puzzle)
  const qOpKind = q.op || gameState.activeOp;

  // The across/stacked flip button only applies to basic arithmetic
  const flipBtn = document.getElementById('btn-flip-style');
  if (flipBtn) flipBtn.style.display = VERTICAL_OPS.includes(qOpKind) ? '' : 'none';

  if (gameState.activeOp === 'clock') {
    mathCard.classList.add('hidden');
    clockCard.classList.remove('hidden');

    const hourHand = document.getElementById('clock-hour-hand');
    const minHand = document.getElementById('clock-min-hand');

    const hour = q.num1;
    const min = q.num2;

    const minAngle = min * 6; // 6 deg per minute
    const hourAngle = (hour % 12) * 30 + (min * 0.5); // 30 deg per hour + 0.5 deg per min

    hourHand.style.transform = `rotate(${hourAngle}deg)`;
    minHand.style.transform = `rotate(${minAngle}deg)`;

    // Reset clock text inputs
    if (gameState.clockHourAutoAdvanceTimer) {
      clearTimeout(gameState.clockHourAutoAdvanceTimer);
      gameState.clockHourAutoAdvanceTimer = null;
    }
    gameState.activeClockInput = 'hour';
    gameState.clockInputHour = '';
    gameState.clockInputMinute = '';

    const hourInputEl = document.getElementById('clock-input-hour');
    const minInputEl = document.getElementById('clock-input-min');
    hourInputEl.innerText = 'HH';
    minInputEl.innerText = 'MM';
    hourInputEl.style.color = '';
    minInputEl.style.color = '';
    hourInputEl.className = 'clock-input-box active';
    minInputEl.className = 'clock-input-box';

    // Update question counter for clock mode too
    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

    setMascotExpression('game', `What time is shown on the space clock? Enter hour and minutes! ⏰`);
  } else if (gameState.activeOp === 'fraction') {
    mathCard.classList.add('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    fractionCard.className = 'fraction-card glass-panel';
    fractionCard.classList.remove('hidden');

    // Reset fraction inputs
    if (gameState.fractionAutoAdvanceTimer) {
      clearTimeout(gameState.fractionAutoAdvanceTimer);
      gameState.fractionAutoAdvanceTimer = null;
    }
    gameState.activeFractionInput = 'numerator';
    gameState.fractionInputNumerator = '';
    gameState.fractionInputDenominator = '';

    const numEl = document.getElementById('fraction-input-num');
    const denEl = document.getElementById('fraction-input-den');
    numEl.innerText = '?';
    denEl.innerText = '?';
    numEl.style.color = '';
    denEl.style.color = '';
    numEl.className = 'fraction-input-box active';
    denEl.className = 'fraction-input-box';

    // Show/hide pie vs problem display
    const pieEl = document.getElementById('fraction-pie');
    const probEl = document.getElementById('fraction-problem');

    if (q.subtype === 'identify') {
      pieEl.classList.remove('hidden');
      probEl.classList.add('hidden');
      drawFractionPie(q.num1, q.num2);
      setMascotExpression('game', `What fraction of the pie is shaded? 🍕`);
    } else {
      pieEl.classList.add('hidden');
      probEl.classList.remove('hidden');
      const lhsEl = document.getElementById('fraction-lhs');

      if (q.subtype === 'simplify') {
        lhsEl.innerHTML = fracHTML(q.num1, q.num2);
        setMascotExpression('game', `Simplify this fraction to its lowest terms! ✂️`);
      } else if (q.subtype === 'add') {
        lhsEl.innerHTML = `${fracHTML(q.num1, q.denom)} <span class="fraction-op-symbol">+</span> ${fracHTML(q.num2, q.denom)}`;
        setMascotExpression('game', `Add these fractions together! ➕`);
      } else if (q.subtype === 'subtract') {
        lhsEl.innerHTML = `${fracHTML(q.num1, q.denom)} <span class="fraction-op-symbol">−</span> ${fracHTML(q.num2, q.denom)}`;
        setMascotExpression('game', `Subtract these fractions! ➖`);
      }
    }

    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;
  } else if (gameState.activeOp === 'sequence') {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');
    const compareCard = document.getElementById('compare-card');
    if (compareCard) compareCard.classList.add('hidden');

    document.getElementById('equation-display').classList.add('hidden');
    const sequenceDisplay = document.getElementById('sequence-display');
    sequenceDisplay.classList.remove('hidden');

    let seqHtml = '';
    q.terms.forEach(term => {
      seqHtml += `<span class="seq-num">${term}</span><span class="seq-comma">,</span> `;
    });
    seqHtml += `<span id="sequence-answer-display" class="answer-empty">?</span>`;
    sequenceDisplay.innerHTML = seqHtml;

    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;
    
    setMascotExpression('game', `Identify the pattern and find the next number in the sequence! ☄️`);

    document.getElementById('custom-numpad').classList.remove('hidden');
    document.getElementById('comparison-input-pad').classList.add('hidden');
  } else if (qOpKind === 'music' || qOpKind === 'angles' || qOpKind === 'puzzle') {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');
    const compareCard = document.getElementById('compare-card');
    if (compareCard) compareCard.classList.add('hidden');

    document.getElementById('equation-display').classList.add('hidden');
    document.getElementById('sequence-display').classList.add('hidden');
    const promptDisplay = document.getElementById('prompt-display');
    promptDisplay.classList.remove('hidden');
    document.getElementById('prompt-question').innerHTML = q.html;
    const promptAnswer = document.getElementById('prompt-answer-display');
    promptAnswer.innerText = '?';
    promptAnswer.className = 'answer-empty';
    promptAnswer.style.color = '';

    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

    document.getElementById('custom-numpad').classList.remove('hidden');
    document.getElementById('comparison-input-pad').classList.add('hidden');

    const promptSpeech = {
      music: 'Music math time! Count the beats like a real pianist! 🎵',
      angles: 'Gymnastics math! Spin through the degrees! 🤸',
      puzzle: 'Puzzle time! Use your detective brain to crack the code! 🧩'
    };
    setMascotExpression('game', promptSpeech[qOpKind]);
  } else if (qOpKind === 'pokemon') {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');
    const compareCard = document.getElementById('compare-card');
    if (compareCard) compareCard.classList.add('hidden');

    document.getElementById('equation-display').classList.add('hidden');
    document.getElementById('sequence-display').classList.add('hidden');
    const promptDisplay = document.getElementById('prompt-display');
    promptDisplay.classList.remove('hidden');
    document.getElementById('prompt-question').innerHTML = q.html;
    // No typed answer for multiple choice — hide the answer slot
    const answerRow = document.querySelector('.prompt-answer-row');
    if (answerRow) answerRow.classList.add('hidden');

    // Big tap-to-answer buttons
    const choicePad = document.getElementById('choice-pad');
    choicePad.innerHTML = '';
    choicePad.style.pointerEvents = '';
    q.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-key';
      btn.dataset.value = choice.value;
      btn.innerHTML = choice.html;
      btn.addEventListener('click', () => {
        playSound('tap');
        submitChoiceAnswer(choice.value);
      });
      choicePad.appendChild(btn);
    });
    choicePad.classList.remove('hidden');
    document.getElementById('custom-numpad').classList.add('hidden');
    document.getElementById('comparison-input-pad').classList.add('hidden');

    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

    const pokeSpeech = {
      identity: "Who's that Pokémon?! Tap the right name! 🔍",
      type: 'Is it fire, water, or something else? Tap the type! 🔥',
      evolution: 'Evolution time! Who does it grow into? Tap the picture! ✨'
    };
    setMascotExpression('game', pokeSpeech[gameState.pokemonLevel] || "Who's that Pokémon?! ⚡");
  } else if (gameState.activeOp === 'compare') {
    mathCard.classList.add('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');
    
    const compareCard = document.getElementById('compare-card');
    if (compareCard) {
      compareCard.className = 'compare-card glass-panel';
      compareCard.classList.remove('hidden');
    }

    document.getElementById('compare-lhs').innerText = q.lhsText;
    document.getElementById('compare-rhs').innerText = q.rhsText;
    const relEl = document.getElementById('compare-relation');
    relEl.innerText = '?';
    relEl.className = 'compare-relation answer-empty';

    const beam = document.getElementById('scale-beam-group');
    if (beam) beam.style.transform = 'rotate(0deg)';

    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;
    
    setMascotExpression('game', `Compare the expressions! Select <, =, or > to balance the scale! ⚖️`);

    document.getElementById('custom-numpad').classList.add('hidden');
    document.getElementById('comparison-input-pad').classList.remove('hidden');
  } else {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');
    const compareCard = document.getElementById('compare-card');
    if (compareCard) compareCard.classList.add('hidden');

    document.getElementById('sequence-display').classList.add('hidden');

    if (usesVerticalLayout(qOpKind)) {
      document.getElementById('equation-display').classList.add('hidden');
      renderVerticalEquation(q, qOpKind);
    } else {
      document.getElementById('equation-display').classList.remove('hidden');
    }

    document.getElementById('num-1').innerText = q.num1;
    document.getElementById('num-2').innerText = q.num2;
    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

    document.getElementById('custom-numpad').classList.remove('hidden');
    document.getElementById('comparison-input-pad').classList.add('hidden');

    // Mascot speech reset and operator display setup.
    // Use the question's own op (daily missions can mix multiply & divide).
    const qOp = q.op || gameState.activeOp;
    const opElement = document.getElementById('game-operator');
    let opSymbol = '×';
    if (qOp === 'add') {
      opSymbol = '+';
      setMascotExpression('game', `Solve ${q.num1} + ${q.num2} to propel the rocket! 🚀`);
    } else if (qOp === 'subtract') {
      opSymbol = '−';
      setMascotExpression('game', `Solve ${q.num1} − ${q.num2} to propel the rocket! 🚀`);
    } else if (qOp === 'divide') {
      opSymbol = '÷';
      setMascotExpression('game', `Solve ${q.num1} ÷ ${q.num2} to propel the rocket! 🚀`);
    } else {
      setMascotExpression('game', `Solve ${q.num1} × ${q.num2} to propel the rocket! 🚀`);
    }
    opElement.innerText = opSymbol;
  }

  gameState.questionStartTime = performance.now();

  // Timed Mode logic
  const timerContainer = document.getElementById('timer-container');
  if (gameState.gameMode === 'timed') {
    timerContainer.classList.remove('hidden');
    startTimer();
  } else {
    timerContainer.classList.add('hidden');
  }
}

// Time limit scaled to the difficulty of the current mode, so the timer
// challenges without causing panic (8s is fine for 3×4, brutal for 14×12).
function getTimeLimit() {
  const op = gameState.activeOp;
  if (op === 'multiply' || op === 'divide') {
    const hasBigTables = gameState.selectedTables.some(t => t >= 11);
    return hasBigTables ? 12 : 8;
  }
  if (op === 'add' || op === 'subtract') {
    return { single: 8, double: 15, triple: 25, mixed: 18 }[gameState.digitLevel] || 10;
  }
  if (op === 'sequence') return { easy: 12, medium: 18, hard: 25 }[gameState.sequenceLevel] || 15;
  if (op === 'compare') return { easy: 8, medium: 12, hard: 15 }[gameState.compareLevel] || 10;
  if (op === 'clock') return { hour: 10, quarter: 12, 'five-min': 15, precision: 20 }[gameState.clockLevel] || 12;
  if (op === 'fraction') return { identify: 15, simplify: 20, add: 25, subtract: 25 }[gameState.fractionLevel] || 18;
  if (op === 'music') return { notes: 12, beats: 15, measures: 18 }[gameState.musicLevel] || 15;
  if (op === 'angles') return { turns: 10, combine: 15, convert: 15 }[gameState.anglesLevel] || 12;
  if (op === 'puzzle') return { mystery: 15, emoji: 25, magic: 30 }[gameState.puzzleLevel] || 20;
  if (op === 'pokemon') return { identity: 12, type: 12, evolution: 15 }[gameState.pokemonLevel] || 12;
  return 8;
}

function startTimer() {
  clearInterval(gameState.timerInterval);
  const limit = getTimeLimit();
  gameState.timeLeft = limit;
  const bar = document.getElementById('timer-bar');
  bar.style.width = '100%';

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft -= 0.1;
    const percentage = (gameState.timeLeft / limit) * 100;
    bar.style.width = `${percentage}%`;

    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timerInterval);
      // Auto-submit empty response (which will mark it wrong)
      submitAnswer(true);
    }
  }, 100);
}

function updateAnswerDisplay() {
  const currentQ = gameState.currentQuestions[gameState.currentQuestionIndex];
  const qOpKind = (currentQ && currentQ.op) || gameState.activeOp;

  if (qOpKind === 'pokemon') return; // multiple choice — nothing typed

  if (gameState.activeOp === 'sequence') {
    const display = document.getElementById('sequence-answer-display');
    if (!display) return;
    if (gameState.currentAnswer === '') {
      display.innerText = '?';
      display.className = 'answer-empty';
    } else {
      display.innerText = gameState.currentAnswer;
      display.className = 'answer-typing';
    }
    return;
  }

  if (qOpKind === 'music' || qOpKind === 'angles' || qOpKind === 'puzzle') {
    const display = document.getElementById('prompt-answer-display');
    if (!display) return;
    if (gameState.currentAnswer === '') {
      display.innerText = '?';
      display.className = 'answer-empty';
    } else {
      display.innerText = gameState.currentAnswer;
      display.className = 'answer-typing';
    }
    return;
  }

  const displayId = usesVerticalLayout(qOpKind) ? 'vertical-answer-display' : 'answer-display';
  const display = document.getElementById(displayId);
  if (!display) return;
  if (gameState.currentAnswer === '') {
    display.innerText = '?';
    display.className = 'answer-empty';
  } else {
    display.innerText = gameState.currentAnswer;
    display.className = 'answer-typing';
  }
}

function updateComboHUD() {
  const bubble = document.getElementById('game-combo-container');
  const label = document.getElementById('game-combo');
  
  if (gameState.combo < 3) {
    bubble.style.display = 'none';
  } else {
    bubble.style.display = 'inline-block';
    let multiplier = 1.0;
    if (gameState.combo >= 9) multiplier = 2.5;
    else if (gameState.combo >= 6) multiplier = 2.0;
    else if (gameState.combo >= 3) multiplier = 1.5;
    
    label.innerText = `x${multiplier.toFixed(1)}`;
    bubble.classList.add('pulse');
    setTimeout(() => bubble.classList.remove('pulse'), 400);

    // Cosmo celebrates combo milestones with a backflip
    if (gameState.combo % 3 === 0) {
      const mascot = document.getElementById('mascot-img');
      if (mascot) {
        mascot.classList.add('mascot-flip');
        setTimeout(() => mascot.classList.remove('mascot-flip'), 900);
      }
    }
  }
}

function updateProgressRocket() {
  const rocket = document.getElementById('rocket-ship');
  const percentage = (gameState.currentQuestionIndex / gameState.questionCount) * 100;
  rocket.style.left = `${percentage}%`;
}

// Custom On-screen Numpad inputs
function setupNumpad() {
  document.querySelectorAll('.num-key').forEach(key => {
    key.addEventListener('click', () => {
      const val = key.dataset.key;
      playSound('tap');
      handleKeyPress(val);
    });
  });

  // Custom On-screen Compare inputs
  document.querySelectorAll('.compare-key').forEach(key => {
    key.addEventListener('click', () => {
      const val = key.dataset.key;
      playSound('tap');
      handleKeyPress(val);
    });
  });

  // Allow clicking on clock inputs to manually switch focus
  const hourEl = document.getElementById('clock-input-hour');
  const minEl = document.getElementById('clock-input-min');
  
  if (hourEl && minEl) {
    hourEl.addEventListener('click', () => {
      if (gameState.activeOp === 'clock') {
        // Cancel any pending auto-advance timer
        if (gameState.clockHourAutoAdvanceTimer) {
          clearTimeout(gameState.clockHourAutoAdvanceTimer);
          gameState.clockHourAutoAdvanceTimer = null;
        }
        gameState.activeClockInput = 'hour';
        minEl.classList.remove('active');
        hourEl.classList.add('active');
        hourEl.classList.remove('waiting');
      }
    });

    minEl.addEventListener('click', () => {
      if (gameState.activeOp === 'clock') {
        // User manually moves to minute — cancel any pending timer
        if (gameState.clockHourAutoAdvanceTimer) {
          clearTimeout(gameState.clockHourAutoAdvanceTimer);
          gameState.clockHourAutoAdvanceTimer = null;
        }
        gameState.activeClockInput = 'minute';
        hourEl.classList.remove('active', 'waiting');
        minEl.classList.add('active');
      }
    });
  }

  // Physical keyboard support for desktop preview
  document.addEventListener('keydown', (e) => {
    const activeScreen = document.getElementById('screen-game');
    if (activeScreen.classList.contains('hidden')) return;

    if (e.key >= '0' && e.key <= '9') {
      if (gameState.activeOp !== 'compare') {
        handleKeyPress(e.key);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleKeyPress('delete');
    } else if (e.key === 'Enter') {
      handleKeyPress('enter');
    } else if (e.key === '<' || e.key === ',') {
      if (gameState.activeOp === 'compare') {
        handleKeyPress('<');
      }
    } else if (e.key === '>' || e.key === '.') {
      if (gameState.activeOp === 'compare') {
        handleKeyPress('>');
      } else if (gameState.activeOp === 'fraction') {
        if (gameState.fractionAutoAdvanceTimer) {
          clearTimeout(gameState.fractionAutoAdvanceTimer);
          gameState.fractionAutoAdvanceTimer = null;
        }
        gameState.activeFractionInput = 'denominator';
        document.getElementById('fraction-input-num').classList.remove('active', 'waiting');
        document.getElementById('fraction-input-den').classList.add('active');
      } else if (gameState.activeOp === 'clock') {
        if (gameState.clockHourAutoAdvanceTimer) {
          clearTimeout(gameState.clockHourAutoAdvanceTimer);
          gameState.clockHourAutoAdvanceTimer = null;
        }
        gameState.activeClockInput = 'minute';
        document.getElementById('clock-input-hour').classList.remove('active', 'waiting');
        document.getElementById('clock-input-min').classList.add('active');
      }
    } else if (e.key === '=') {
      if (gameState.activeOp === 'compare') {
        handleKeyPress('=');
      }
    } else if (e.key === '/') {
      if (gameState.activeOp === 'fraction') {
        if (gameState.fractionAutoAdvanceTimer) {
          clearTimeout(gameState.fractionAutoAdvanceTimer);
          gameState.fractionAutoAdvanceTimer = null;
        }
        gameState.activeFractionInput = 'denominator';
        document.getElementById('fraction-input-num').classList.remove('active', 'waiting');
        document.getElementById('fraction-input-den').classList.add('active');
      }
    }
  });
}

function handleKeyPress(key) {
  if (gameState.activeOp === 'pokemon') {
    // Keys 1-3 tap the corresponding choice button
    if (key >= '1' && key <= '3') {
      const buttons = document.querySelectorAll('#choice-pad .choice-key');
      const btn = buttons[parseInt(key, 10) - 1];
      if (btn) btn.click();
    }
    return;
  }
  if (gameState.activeOp === 'fraction') {
    handleFractionKeyPress(key);
    return;
  }
  if (gameState.activeOp === 'clock') {
    handleClockKeyPress(key);
    return;
  }
  if (gameState.activeOp === 'compare') {
    handleCompareKeyPress(key);
    return;
  }

  if (key === 'delete') {
    gameState.currentAnswer = gameState.currentAnswer.slice(0, -1);
    updateAnswerDisplay();
  } else if (key === 'enter') {
    if (gameState.currentAnswer !== '') {
      submitAnswer();
    }
  } else {
    // Max length 4 (e.g. 999 + 999 = 1998)
    if (gameState.currentAnswer.length < 4) {
      gameState.currentAnswer += key;
      updateAnswerDisplay();
    }
  }
}

function submitAnswer(isTimeout = false) {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  const typedAnswer = isTimeout ? null : Number(gameState.currentAnswer);
  const isCorrect = !isTimeout && typedAnswer === q.expected;
  
  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;

  // Log answer
  gameState.answersLog.push({
    num1: q.op === 'sequence' ? q.terms.join(', ') : (q.promptText || q.num1),
    num2: q.num2,
    expected: q.expected,
    op: q.op,
    typed: typedAnswer,
    isCorrect: isCorrect,
    timeTaken: timeTaken,
    isRematch: !!q.isRematch
  });
  Mastery.record(q, isCorrect, timeTaken, currentLevelTag(q));

  const mathCard = document.getElementById('math-card');
  const rocket = document.getElementById('rocket-ship');

  if (isCorrect) {
    gameState.correctAnswersCount++;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo;
    }

    playSound('correct');
    mathCard.classList.add('correct');
    
    rocket.classList.add('animate-pop');
    setTimeout(() => rocket.classList.remove('animate-pop'), 500);

    // Calculate score
    let baseScore = 100;
    let speedBonus = 0;
    if (timeTaken < 4.0) {
      speedBonus = Math.round(50 * (1 - (Math.max(timeTaken - 1.0, 0) / 3.0)));
    }
    
    let comboMultiplier = 1.0;
    if (gameState.combo >= 9) comboMultiplier = 2.5;
    else if (gameState.combo >= 6) comboMultiplier = 2.0;
    else if (gameState.combo >= 3) comboMultiplier = 1.5;

    const pointsEarned = Math.round((baseScore + speedBonus) * comboMultiplier);
    gameState.score += pointsEarned;

    const scoreVal = document.getElementById('game-score');
    scoreVal.innerText = gameState.score;
    scoreVal.classList.add('animate-pop');
    setTimeout(() => scoreVal.classList.remove('animate-pop'), 400);

    if (gameState.combo > 0 && gameState.combo % 3 === 0) {
      const idx = Math.min(Math.floor(gameState.combo / 3) - 1, mascotPhrases.combo.length - 1);
      setMascotExpression('game', mascotPhrases.combo[idx]);
    } else {
      setMascotExpression('correct');
    }

    updateComboHUD();
    setTimeout(advanceGame, 800);

  } else {
    gameState.combo = 0;
    gameState.missedQuestions.push(q);
    playSound('wrong');
    mathCard.classList.add('incorrect');
    mathCard.classList.add('animate-shake');
    setTimeout(() => mathCard.classList.remove('animate-shake'), 400);

    const qSubmitOp = q.op || gameState.activeOp;
    const displayId = qSubmitOp === 'sequence' ? 'sequence-answer-display'
      : (qSubmitOp === 'music' || qSubmitOp === 'angles' || qSubmitOp === 'puzzle') ? 'prompt-answer-display'
      : usesVerticalLayout(qSubmitOp) ? 'vertical-answer-display'
      : 'answer-display';
    const display = document.getElementById(displayId);
    if (display) {
      display.innerText = q.expected;
      display.style.color = 'var(--success-green)';
      if (gameState.activeOp === 'sequence') {
        display.style.borderColor = 'var(--success-green)';
        display.className = 'answer-typing';
      }
    }

    // Turn the mistake into a mini-lesson before moving on
    const taught = showTeachingMoment(q);

    setMascotExpression('incorrect');
    updateComboHUD();

    setTimeout(advanceGame, taught ? 3600 : 1800);
  }
}

// Tag used for per-mode statistics in the parent dashboard
function currentLevelTag(q) {
  const op = (q && q.op) || gameState.activeOp;
  if (op === 'multiply' || op === 'divide') return op;
  if (op === 'add' || op === 'subtract') return `${op}:${gameState.digitLevel}`;
  if (op === 'clock') return `clock:${gameState.clockLevel}`;
  if (op === 'fraction') return `fraction:${gameState.fractionLevel}`;
  if (op === 'sequence') return `sequence:${gameState.sequenceLevel}`;
  if (op === 'compare') return `compare:${gameState.compareLevel}`;
  if (op === 'music') return `music:${gameState.musicLevel}`;
  if (op === 'angles') return `angles:${gameState.anglesLevel}`;
  if (op === 'puzzle') return `puzzle:${gameState.puzzleLevel}`;
  if (op === 'pokemon') return `pokemon:${gameState.pokemonLevel}`;
  return op;
}

// Show a short visual explanation after a wrong answer.
// Returns true if something was shown (caller extends the pause).
function showTeachingMoment(q) {
  const helper = document.getElementById('visual-helper');
  if (!helper) return false;

  let html = '';
  if (q.teach) {
    html = `<div class="teach-text">${q.teach}</div>`;
  } else if (q.op === 'multiply') {
    const a = Math.min(q.num1, q.num2), b = Math.max(q.num1, q.num2);
    if (a <= 10 && b <= 12) {
      let dots = '';
      for (let r = 0; r < a; r++) {
        dots += `<div class="teach-row">${'<span class="teach-dot"></span>'.repeat(b)}</div>`;
      }
      html = `<div class="teach-text">${a} groups of ${b} = ${q.expected}</div><div class="teach-dots">${dots}</div>`;
    } else {
      const big = Math.max(q.num1, q.num2), small = Math.min(q.num1, q.num2);
      const tens = Math.floor(big / 10) * 10, ones = big % 10;
      html = `<div class="teach-text">${big} × ${small} = (${tens} × ${small}) + (${ones} × ${small}) = ${tens * small} + ${ones * small} = ${q.expected}</div>`;
    }
  } else if (q.op === 'divide') {
    html = `<div class="teach-text">${q.num1} ÷ ${q.num2} = ${q.expected}, because ${q.num2} × ${q.expected} = ${q.num1} ✨</div>`;
  } else if (q.op === 'add' && q.num2 >= 10) {
    const tens = Math.floor(q.num2 / 10) * 10, ones = q.num2 % 10;
    html = `<div class="teach-text">${q.num1} + ${tens} = ${q.num1 + tens}, then + ${ones} = ${q.expected} ✨</div>`;
  } else if (q.op === 'subtract' && q.num2 >= 10) {
    const tens = Math.floor(q.num2 / 10) * 10, ones = q.num2 % 10;
    html = `<div class="teach-text">${q.num1} − ${tens} = ${q.num1 - tens}, then − ${ones} = ${q.expected} ✨</div>`;
  } else {
    return false;
  }

  helper.innerHTML = html;
  helper.classList.remove('hidden');
  return true;
}

function handleClockKeyPress(key) {
  const hourEl = document.getElementById('clock-input-hour');
  const minEl = document.getElementById('clock-input-min');

  if (key === 'delete') {
    if (gameState.activeClockInput === 'hour') {
      gameState.clockInputHour = gameState.clockInputHour.slice(0, -1);
      hourEl.innerText = gameState.clockInputHour === '' ? 'HH' : gameState.clockInputHour;
      hourEl.classList.toggle('typing', gameState.clockInputHour !== '');
    } else {
      if (gameState.clockInputMinute !== '') {
        gameState.clockInputMinute = gameState.clockInputMinute.slice(0, -1);
        minEl.innerText = gameState.clockInputMinute === '' ? 'MM' : gameState.clockInputMinute;
        minEl.classList.toggle('typing', gameState.clockInputMinute !== '');
      } else {
        // Backspace on empty minutes focuses hour and deletes its last character
        gameState.activeClockInput = 'hour';
        minEl.classList.remove('active');
        hourEl.classList.add('active');
        gameState.clockInputHour = gameState.clockInputHour.slice(0, -1);
        hourEl.innerText = gameState.clockInputHour === '' ? 'HH' : gameState.clockInputHour;
        hourEl.classList.toggle('typing', gameState.clockInputHour !== '');
      }
    }
  } else if (key === 'enter') {
    if (gameState.clockInputHour !== '' && gameState.clockInputMinute !== '') {
      submitClockAnswer();
    } else {
      const clockCard = document.getElementById('clock-card');
      clockCard.classList.add('animate-shake');
      setTimeout(() => clockCard.classList.remove('animate-shake'), 400);
      playSound('warning');
      setMascotExpression('setup', "Enter both hour and minutes first! ⏰");
    }
  } else {
    // Type number
    if (gameState.activeClockInput === 'hour') {
      // Cancel any pending auto-advance timer when a new key is pressed
      if (gameState.clockHourAutoAdvanceTimer) {
        clearTimeout(gameState.clockHourAutoAdvanceTimer);
        gameState.clockHourAutoAdvanceTimer = null;
        hourEl.classList.remove('waiting');
      }

      function advanceToMinute(minuteStartKey) {
        gameState.activeClockInput = 'minute';
        hourEl.classList.remove('active', 'waiting');
        minEl.classList.add('active');
        if (minuteStartKey !== undefined) {
          // Put this digit into the minute field
          gameState.clockInputMinute = minuteStartKey;
          minEl.innerText = gameState.clockInputMinute;
          minEl.classList.add('typing');
        }
      }

      if (gameState.clockInputHour.length === 0) {
        if (key === '0') {
          // '0' alone is not a valid hour - keep on hour field but show '0'
          gameState.clockInputHour = '0';
        } else {
          gameState.clockInputHour = key;
          const digit = parseInt(key, 10);
          if (digit >= 2) {
            // Digits 2-9: unambiguous single-digit hour, advance immediately
            advanceToMinute();
          } else {
            // Digit '1': ambiguous (could be 1, 10, 11, 12)
            // Start a timer — if no second digit comes within 900ms, treat as hour 1
            hourEl.classList.add('waiting'); // amber pulse while waiting
            gameState.clockHourAutoAdvanceTimer = setTimeout(() => {
              gameState.clockHourAutoAdvanceTimer = null;
              if (gameState.activeClockInput === 'hour' && gameState.clockInputHour === '1') {
                const hEl = document.getElementById('clock-input-hour');
                const mEl = document.getElementById('clock-input-min');
                hEl.classList.remove('waiting', 'active');
                mEl.classList.add('active');
                gameState.activeClockInput = 'minute';
              }
            }, 900);
          }
        }
      } else if (gameState.clockInputHour.length === 1) {
        const combined = gameState.clockInputHour + key;
        const combinedVal = parseInt(combined, 10);
        if (gameState.clockInputHour === '0') {
          // After typing '0', any digit becomes the hour (treat '0' as invalid, replace)
          gameState.clockInputHour = key;
          if (parseInt(key, 10) >= 2) advanceToMinute();
        } else if (combinedVal <= 12 && combinedVal >= 10) {
          // Two-digit hours: 10, 11, 12 — combine and advance
          gameState.clockInputHour = combined;
          advanceToMinute();
        } else {
          // The second digit does NOT form a valid 2-digit hour (e.g. '1' + '5' = 15 > 12)
          // Keep the current hour as-is, treat the new digit as the start of minutes
          advanceToMinute(key);
        }
      } else {
        // Hour already has 2 digits (e.g. user clicked back) — replace with new key
        gameState.clockInputHour = key;
        if (parseInt(key, 10) >= 2) {
          advanceToMinute();
        } else if (parseInt(key, 10) >= 1) {
          // Same ambiguous '1' logic
          hourEl.classList.add('waiting');
          gameState.clockHourAutoAdvanceTimer = setTimeout(() => {
            gameState.clockHourAutoAdvanceTimer = null;
            if (gameState.activeClockInput === 'hour') {
              const hEl = document.getElementById('clock-input-hour');
              const mEl = document.getElementById('clock-input-min');
              hEl.classList.remove('waiting', 'active');
              mEl.classList.add('active');
              gameState.activeClockInput = 'minute';
            }
          }, 900);
        }
      }
      hourEl.innerText = gameState.clockInputHour === '' ? 'HH' : gameState.clockInputHour;
      hourEl.classList.toggle('typing', gameState.clockInputHour !== '');
    } else {
      // Typing minutes
      if (gameState.clockInputMinute.length < 2) {
        gameState.clockInputMinute += key;
        const val = parseInt(gameState.clockInputMinute, 10);
        if (val > 59) {
          gameState.clockInputMinute = key;
        }
        minEl.innerText = gameState.clockInputMinute;
        minEl.classList.add('typing');
      } else {
        // Overwrite if they type a third digit
        gameState.clockInputMinute = key;
        minEl.innerText = gameState.clockInputMinute;
        minEl.classList.add('typing');
      }
    }
  }
}

function submitClockAnswer() {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  
  const typedH = parseInt(gameState.clockInputHour, 10) || 0;
  const typedM = parseInt(gameState.clockInputMinute, 10) || 0;
  const typedMStr = typedM < 10 ? `0${typedM}` : `${typedM}`;
  const typedTimeStr = `${typedH}:${typedMStr}`;

  const isCorrect = typedTimeStr === q.expected;
  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;

  // Log answer
  gameState.answersLog.push({
    num1: q.num1,
    num2: q.num2,
    expected: q.expected,
    op: 'clock',
    typed: typedTimeStr,
    isCorrect: isCorrect,
    timeTaken: timeTaken,
    isRematch: !!q.isRematch
  });
  Mastery.record(q, isCorrect, timeTaken, currentLevelTag(q));

  const clockCard = document.getElementById('clock-card');
  const rocket = document.getElementById('rocket-ship');

  if (isCorrect) {
    gameState.correctAnswersCount++;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo;
    }

    playSound('correct');
    clockCard.classList.add('correct');
    rocket.classList.add('animate-pop');
    setTimeout(() => rocket.classList.remove('animate-pop'), 500);

    // Calculate score
    let baseScore = 100;
    let speedBonus = 0;
    if (timeTaken < 5.0) { // clocks take slightly longer
      speedBonus = Math.round(50 * (1 - (Math.max(timeTaken - 1.5, 0) / 3.5)));
    }
    
    let comboMultiplier = 1.0;
    if (gameState.combo >= 9) comboMultiplier = 2.5;
    else if (gameState.combo >= 6) comboMultiplier = 2.0;
    else if (gameState.combo >= 3) comboMultiplier = 1.5;

    const pointsEarned = Math.round((baseScore + speedBonus) * comboMultiplier);
    gameState.score += pointsEarned;

    const scoreVal = document.getElementById('game-score');
    scoreVal.innerText = gameState.score;
    scoreVal.classList.add('animate-pop');
    setTimeout(() => scoreVal.classList.remove('animate-pop'), 400);

    if (gameState.combo > 0 && gameState.combo % 3 === 0) {
      const idx = Math.min(Math.floor(gameState.combo / 3) - 1, mascotPhrases.combo.length - 1);
      setMascotExpression('game', mascotPhrases.combo[idx]);
    } else {
      setMascotExpression('correct');
    }

    updateComboHUD();
    setTimeout(advanceGame, 800);

  } else {
    gameState.combo = 0;
    gameState.missedQuestions.push(q);
    playSound('wrong');
    clockCard.classList.add('incorrect');
    clockCard.classList.add('animate-shake');
    setTimeout(() => clockCard.classList.remove('animate-shake'), 400);

    // Reveal correct time
    const hourInputEl = document.getElementById('clock-input-hour');
    const minInputEl = document.getElementById('clock-input-min');
    const expectedParts = q.expected.split(':');
    hourInputEl.innerText = expectedParts[0];
    minInputEl.innerText = expectedParts[1];
    hourInputEl.style.color = 'var(--success-green)';
    minInputEl.style.color = 'var(--success-green)';

    setMascotExpression('incorrect');
    updateComboHUD();

    setTimeout(advanceGame, 2200);
  }
}
// ============================================================
// POKÉ GALAXY — Multiple-choice submission
// ============================================================

function submitChoiceAnswer(choiceValue) {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  const isCorrect = choiceValue === q.expected;
  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;

  // Lock the pad and color the buttons: green = right answer, red = the miss
  const pad = document.getElementById('choice-pad');
  if (pad) {
    pad.style.pointerEvents = 'none';
    pad.querySelectorAll('.choice-key').forEach(btn => {
      if (btn.dataset.value === q.expected) btn.classList.add('choice-correct');
      else if (btn.dataset.value === choiceValue) btn.classList.add('choice-wrong');
    });
  }

  // The "Who's that Pokémon?" reveal
  const pokeImg = document.querySelector('#prompt-question .poke-img');
  if (pokeImg) pokeImg.classList.remove('silhouette');

  gameState.answersLog.push({
    num1: q.promptText,
    num2: '',
    expected: q.expected,
    op: 'pokemon',
    typed: choiceValue,
    isCorrect: isCorrect,
    timeTaken: timeTaken,
    isRematch: !!q.isRematch
  });
  Mastery.record(q, isCorrect, timeTaken, currentLevelTag(q));

  const mathCard = document.getElementById('math-card');
  const rocket = document.getElementById('rocket-ship');

  if (isCorrect) {
    gameState.correctAnswersCount++;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;

    playSound('correct');
    mathCard.classList.add('correct');
    rocket.classList.add('animate-pop');
    setTimeout(() => rocket.classList.remove('animate-pop'), 500);

    let baseScore = 100;
    let speedBonus = timeTaken < 5.0 ? Math.round(50 * (1 - Math.max(timeTaken - 1.5, 0) / 3.5)) : 0;
    let comboMultiplier = gameState.combo >= 9 ? 2.5 : gameState.combo >= 6 ? 2.0 : gameState.combo >= 3 ? 1.5 : 1.0;
    const pointsEarned = Math.round((baseScore + speedBonus) * comboMultiplier);
    gameState.score += pointsEarned;

    const scoreVal = document.getElementById('game-score');
    scoreVal.innerText = gameState.score;
    scoreVal.classList.add('animate-pop');
    setTimeout(() => scoreVal.classList.remove('animate-pop'), 400);

    if (gameState.combo > 0 && gameState.combo % 3 === 0) {
      const idx = Math.min(Math.floor(gameState.combo / 3) - 1, mascotPhrases.combo.length - 1);
      setMascotExpression('game', mascotPhrases.combo[idx]);
    } else {
      setMascotExpression('correct');
    }

    updateComboHUD();
    // A touch longer than numeric modes so the reveal can land
    setTimeout(advanceGame, 1400);

  } else {
    gameState.combo = 0;
    gameState.missedQuestions.push(q);
    playSound('wrong');
    mathCard.classList.add('incorrect');
    mathCard.classList.add('animate-shake');
    setTimeout(() => mathCard.classList.remove('animate-shake'), 400);

    const taught = showTeachingMoment(q);

    setMascotExpression('incorrect');
    updateComboHUD();
    setTimeout(advanceGame, taught ? 3400 : 2400);
  }
}

// ============================================================
// COMPARISON QUEST — Input, Submission, and Scale Tilting
// ============================================================

function handleCompareKeyPress(key) {
  if (key === '<' || key === '=' || key === '>') {
    gameState.compareCurrentChoice = key;
    
    // Update display relation
    const relEl = document.getElementById('compare-relation');
    if (relEl) {
      relEl.innerText = key;
      relEl.className = 'compare-relation answer-typing';
    }

    // Auto-submit after a slight delay to let the kid see the selection highlight
    setTimeout(() => {
      // Make sure they didn't switch questions during the timeout
      if (gameState.compareCurrentChoice === key) {
        submitCompareAnswer();
      }
    }, 250);
  }
}

function submitCompareAnswer() {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  const typedVal = gameState.compareCurrentChoice;
  const isCorrect = typedVal === q.expected;
  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;

  // Log answer
  gameState.answersLog.push({
    num1: q.lhsText,
    num2: q.rhsText,
    expected: q.expected,
    op: 'compare',
    typed: typedVal || 'None',
    isCorrect: isCorrect,
    timeTaken: timeTaken,
    isRematch: !!q.isRematch
  });
  Mastery.record(q, isCorrect, timeTaken, currentLevelTag(q));

  const compareCard = document.getElementById('compare-card');
  const rocket = document.getElementById('rocket-ship');
  const beam = document.getElementById('scale-beam-group');

  // Tilt the scale towards the heavier side
  const tiltScale = (relation) => {
    if (!beam) return;
    if (relation === '<') {
      beam.style.transform = 'rotate(12deg)'; // Right is heavier
    } else if (relation === '>') {
      beam.style.transform = 'rotate(-12deg)'; // Left is heavier
    } else {
      beam.style.transform = 'rotate(0deg)'; // Balanced
    }
  };

  if (isCorrect) {
    gameState.correctAnswersCount++;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo;
    }

    playSound('correct');
    if (compareCard) compareCard.classList.add('correct');
    if (rocket) {
      rocket.classList.add('animate-pop');
      setTimeout(() => rocket.classList.remove('animate-pop'), 500);
    }

    tiltScale(q.expected);

    // Calculate score
    let baseScore = 100;
    let speedBonus = 0;
    if (timeTaken < 4.0) {
      speedBonus = Math.round(50 * (1 - (Math.max(timeTaken - 1.0, 0) / 3.0)));
    }
    
    let comboMultiplier = 1.0;
    if (gameState.combo >= 9) comboMultiplier = 2.5;
    else if (gameState.combo >= 6) comboMultiplier = 2.0;
    else if (gameState.combo >= 3) comboMultiplier = 1.5;

    const pointsEarned = Math.round((baseScore + speedBonus) * comboMultiplier);
    gameState.score += pointsEarned;

    const scoreVal = document.getElementById('game-score');
    if (scoreVal) {
      scoreVal.innerText = gameState.score;
      scoreVal.classList.add('animate-pop');
      setTimeout(() => scoreVal.classList.remove('animate-pop'), 400);
    }

    if (gameState.combo > 0 && gameState.combo % 3 === 0) {
      const idx = Math.min(Math.floor(gameState.combo / 3) - 1, mascotPhrases.combo.length - 1);
      setMascotExpression('game', mascotPhrases.combo[idx]);
    } else {
      setMascotExpression('correct');
    }

    updateComboHUD();
    setTimeout(advanceGame, 1000); // 1s to let scale settle

  } else {
    gameState.combo = 0;
    gameState.missedQuestions.push(q);
    playSound('wrong');
    if (compareCard) {
      compareCard.classList.add('incorrect', 'animate-shake');
      setTimeout(() => compareCard.classList.remove('animate-shake'), 400);
    }

    // Tilt the scale to show the correct balance relationship
    tiltScale(q.expected);

    // Reveal correct answer in green
    const relEl = document.getElementById('compare-relation');
    if (relEl) {
      relEl.innerText = q.expected;
      relEl.style.color = 'var(--success-green)';
      relEl.style.borderColor = 'var(--success-green)';
    }

    setMascotExpression('incorrect');
    updateComboHUD();

    setTimeout(advanceGame, 2200);
  }
}

// ============================================================
// FRACTION QUEST — Input, Submission, and Pie Drawing
// ============================================================

function handleFractionKeyPress(key) {
  const numEl = document.getElementById('fraction-input-num');
  const denEl = document.getElementById('fraction-input-den');

  if (gameState.fractionAutoAdvanceTimer) {
    clearTimeout(gameState.fractionAutoAdvanceTimer);
    gameState.fractionAutoAdvanceTimer = null;
    numEl.classList.remove('waiting');
  }

  if (key === 'delete') {
    if (gameState.activeFractionInput === 'numerator') {
      gameState.fractionInputNumerator = gameState.fractionInputNumerator.slice(0, -1);
      numEl.innerText = gameState.fractionInputNumerator === '' ? '?' : gameState.fractionInputNumerator;
      numEl.classList.toggle('typing', gameState.fractionInputNumerator !== '');
    } else {
      if (gameState.fractionInputDenominator !== '') {
        gameState.fractionInputDenominator = gameState.fractionInputDenominator.slice(0, -1);
        denEl.innerText = gameState.fractionInputDenominator === '' ? '?' : gameState.fractionInputDenominator;
        denEl.classList.toggle('typing', gameState.fractionInputDenominator !== '');
      } else {
        // Backspace on empty denominator: move back to numerator
        gameState.activeFractionInput = 'numerator';
        denEl.classList.remove('active');
        numEl.classList.add('active');
        gameState.fractionInputNumerator = gameState.fractionInputNumerator.slice(0, -1);
        numEl.innerText = gameState.fractionInputNumerator === '' ? '?' : gameState.fractionInputNumerator;
        numEl.classList.toggle('typing', gameState.fractionInputNumerator !== '');
      }
    }
  } else if (key === 'enter') {
    if (gameState.fractionInputNumerator !== '' && gameState.fractionInputDenominator !== '') {
      submitFractionAnswer();
    } else {
      const fractionCard = document.getElementById('fraction-card');
      fractionCard.classList.add('animate-shake');
      setTimeout(() => fractionCard.classList.remove('animate-shake'), 400);
      playSound('warning');
      const missing = gameState.fractionInputNumerator === '' ? 'top number' : 'bottom number';
      setMascotExpression('game', `Enter the ${missing} first! 🍕`);
    }
  } else {
    // Digit input
    if (gameState.activeFractionInput === 'numerator') {
      if (gameState.fractionInputNumerator.length < 2) {
        gameState.fractionInputNumerator += key;
        numEl.innerText = gameState.fractionInputNumerator;
        numEl.classList.add('typing');
        // Auto-advance to denominator when 2 digits typed OR digit is 0
        if (gameState.fractionInputNumerator.length >= 2 || key === '0') {
          gameState.activeFractionInput = 'denominator';
          numEl.classList.remove('active');
          denEl.classList.add('active');
        } else {
          // Single digit entered. Wait briefly before advancing.
          numEl.classList.add('waiting');
          gameState.fractionAutoAdvanceTimer = setTimeout(() => {
             gameState.fractionAutoAdvanceTimer = null;
             if (gameState.activeFractionInput === 'numerator' && gameState.fractionInputNumerator.length === 1) {
               gameState.activeFractionInput = 'denominator';
               numEl.classList.remove('waiting', 'active');
               denEl.classList.add('active');
             }
          }, 900);
        }
      } else {
        // Overwrite
        gameState.fractionInputNumerator = key;
        numEl.innerText = key;
        numEl.classList.add('typing');
        numEl.classList.add('waiting');
        gameState.fractionAutoAdvanceTimer = setTimeout(() => {
             gameState.fractionAutoAdvanceTimer = null;
             if (gameState.activeFractionInput === 'numerator' && gameState.fractionInputNumerator.length === 1) {
               gameState.activeFractionInput = 'denominator';
               numEl.classList.remove('waiting', 'active');
               denEl.classList.add('active');
             }
        }, 900);
      }
    } else {
      // Denominator
      if (key === '0' && gameState.fractionInputDenominator === '') {
        // 0 is not valid as denominator start — warn
        playSound('warning');
        return;
      }
      if (gameState.fractionInputDenominator.length < 2) {
        gameState.fractionInputDenominator += key;
        denEl.innerText = gameState.fractionInputDenominator;
        denEl.classList.add('typing');
      } else {
        gameState.fractionInputDenominator = key;
        denEl.innerText = key;
        denEl.classList.add('typing');
      }
    }
  }
}

function submitFractionAnswer() {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  const typedN = parseInt(gameState.fractionInputNumerator, 10);
  const typedD = parseInt(gameState.fractionInputDenominator, 10);

  // Reduce both typed and expected to check equivalence
  const [rTypedN, rTypedD] = reduceFraction(typedN, typedD);
  const [expN, expD] = q.expected.split('/').map(Number);
  const [rExpN, rExpD] = reduceFraction(expN, expD);

  // For 'identify' mode we also accept the exact visual fraction (not just reduced)
  let isCorrect = (rTypedN === rExpN && rTypedD === rExpD);
  if (q.subtype === 'identify') {
    isCorrect = (typedN === q.num1 && typedD === q.num2) || isCorrect;
  }

  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;
  gameState.answersLog.push({
    num1: q.num1, num2: q.num2, expected: q.expected,
    op: 'fraction', subtype: q.subtype, denom: q.denom,
    typed: `${typedN}/${typedD}`, isCorrect, timeTaken,
    isRematch: !!q.isRematch
  });
  Mastery.record(q, isCorrect, timeTaken, currentLevelTag(q));

  const fractionCard = document.getElementById('fraction-card');
  const rocket = document.getElementById('rocket-ship');

  if (isCorrect) {
    gameState.correctAnswersCount++;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;

    playSound('correct');
    fractionCard.classList.add('correct');
    rocket.classList.add('animate-pop');
    setTimeout(() => rocket.classList.remove('animate-pop'), 500);

    let baseScore = 100;
    let speedBonus = timeTaken < 6.0 ? Math.round(50 * (1 - Math.max(timeTaken - 1.5, 0) / 4.5)) : 0;
    let comboMultiplier = gameState.combo >= 9 ? 2.5 : gameState.combo >= 6 ? 2.0 : gameState.combo >= 3 ? 1.5 : 1.0;
    const pointsEarned = Math.round((baseScore + speedBonus) * comboMultiplier);
    gameState.score += pointsEarned;

    const scoreVal = document.getElementById('game-score');
    scoreVal.innerText = gameState.score;
    scoreVal.classList.add('animate-pop');
    setTimeout(() => scoreVal.classList.remove('animate-pop'), 400);

    if (gameState.combo > 0 && gameState.combo % 3 === 0) {
      const idx = Math.min(Math.floor(gameState.combo / 3) - 1, mascotPhrases.combo.length - 1);
      setMascotExpression('game', mascotPhrases.combo[idx]);
    } else {
      setMascotExpression('correct');
    }

    updateComboHUD();
    setTimeout(advanceGame, 800);

  } else {
    gameState.combo = 0;
    gameState.missedQuestions.push(q);
    playSound('wrong');
    fractionCard.classList.add('incorrect');
    fractionCard.classList.add('animate-shake');
    setTimeout(() => fractionCard.classList.remove('animate-shake'), 400);

    // Reveal correct answer in input boxes
    const numEl = document.getElementById('fraction-input-num');
    const denEl = document.getElementById('fraction-input-den');
    numEl.innerText = expN;
    denEl.innerText = expD;
    numEl.style.color = 'var(--success-green)';
    denEl.style.color = 'var(--success-green)';

    setMascotExpression('incorrect');
    updateComboHUD();
    setTimeout(advanceGame, 2200);
  }
}

// Build an inline HTML fraction (num over denom with a bar)
function fracHTML(n, d) {
  return `<span class="frac-display">
    <span class="frac-num">${n}</span>
    <span class="frac-bar"></span>
    <span class="frac-den">${d}</span>
  </span>`;
}

// Draw an SVG pie chart showing n shaded slices out of d total
function drawFractionPie(n, d) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const slicesGroup = document.getElementById('fraction-pie-slices');
  slicesGroup.innerHTML = '';

  const cx = 100, cy = 100, r = 85;

  // Background circle
  const bg = document.createElementNS(SVG_NS, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r + 4);
  bg.setAttribute('class', 'pie-bg-circle');
  slicesGroup.appendChild(bg);

  // Draw d slices, first n are shaded
  for (let i = 0; i < d; i++) {
    const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2;
    const endAngle   = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = (1 / d) > 0.5 ? 1 : 0;

    const path = document.createElementNS(SVG_NS, 'path');
    const dAttr = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    path.setAttribute('d', dAttr);
    path.setAttribute('class', i < n ? 'pie-slice-shaded' : 'pie-slice-empty');
    slicesGroup.appendChild(path);
  }

  // Outer ring
  const ring = document.createElementNS(SVG_NS, 'circle');
  ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', r);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', 'rgba(255,255,255,0.15)');
  ring.setAttribute('stroke-width', '1');
  slicesGroup.appendChild(ring);

  // Center dot
  const dot = document.createElementNS(SVG_NS, 'circle');
  dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', 4);
  dot.setAttribute('fill', 'rgba(255,255,255,0.6)');
  slicesGroup.appendChild(dot);
}

function drawClockDial() {
  const numsGroup = document.getElementById('clock-numerals-group');
  const ticksGroup = document.getElementById('clock-ticks-group');
  if (!numsGroup || !ticksGroup) return;

  numsGroup.innerHTML = '';
  ticksGroup.innerHTML = '';

  const SVG_NS = "http://www.w3.org/2000/svg";

  // Draw Ticks for minutes/hours
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isHour = i % 5 === 0;
    const rStart = isHour ? 78 : 84;
    const rEnd = 90;

    const x1 = 100 + rStart * Math.sin(angle);
    const y1 = 100 - rStart * Math.cos(angle);
    const x2 = 100 + rEnd * Math.sin(angle);
    const y2 = 100 - rEnd * Math.cos(angle);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', `clock-tick ${isHour ? 'hour-tick' : ''}`);
    ticksGroup.appendChild(line);
  }

  // Draw Numbers 1 to 12
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const radius = 64; // position inside the face
    const x = 100 + radius * Math.sin(angle);
    const y = 100 - radius * Math.cos(angle);

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('class', 'clock-numeral');
    text.textContent = i;
    numsGroup.appendChild(text);
  }
}

function advanceGame() {
  gameState.currentQuestionIndex++;
  updateProgressRocket();

  if (gameState.currentQuestionIndex < gameState.questionCount) {
    loadQuestion();
  } else if (!gameState.rematchDone && gameState.missedQuestions.length > 0) {
    startRematch();
  } else {
    endGame();
  }
}

// Re-ask this round's missed questions so the round ends on a win —
// that immediate retry is where the actual learning sticks.
function startRematch() {
  gameState.rematchDone = true;

  const seen = new Set();
  const rematch = [];
  gameState.missedQuestions.forEach(q => {
    const k = JSON.stringify([q.op, q.num1, q.num2, q.terms, q.lhsText, q.rhsText, q.expected]);
    if (!seen.has(k) && rematch.length < 5) {
      seen.add(k);
      rematch.push({ ...q, isRematch: true });
    }
  });

  gameState.currentQuestions.push(...rematch);
  gameState.questionCount += rematch.length;

  document.getElementById('game-question-index').innerText =
    `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

  loadQuestion();
  setMascotExpression('game', `🛡️ Cosmo's Rematch! Let's beat the ${rematch.length === 1 ? 'one' : rematch.length} that got away! 💪`);
}

function endGame() {
  gameState.totalTestsCompleted++;
  localStorage.setItem(Players.key('space_quest_tests_completed'), gameState.totalTestsCompleted);

  const accuracy = Math.round((gameState.correctAnswersCount / gameState.questionCount) * 100);
  let totalTime = 0;
  gameState.answersLog.forEach(log => totalTime += log.timeTaken);
  const avgSpeed = (totalTime / gameState.questionCount).toFixed(1);

  let highscore = parseInt(localStorage.getItem(Players.key('space_quest_high_score'))) || 0;
  let isNewHighScore = false;
  if (gameState.score > highscore) {
    localStorage.setItem(Players.key('space_quest_high_score'), gameState.score);
    isNewHighScore = true;
  }

  let starsCount = 0;
  if (accuracy === 100) starsCount = 3;
  else if (accuracy >= 80) starsCount = 2;
  else if (accuracy >= 50) starsCount = 1;

  document.querySelectorAll('.star-rating').forEach(el => el.classList.remove('active'));
  setTimeout(() => {
    for (let i = 1; i <= starsCount; i++) {
      document.getElementById(`star-${i}`).classList.add('active');
    }
  }, 300);

  const headline = document.getElementById('results-headline');
  const subhead = document.getElementById('results-subhead');
  
  if (starsCount === 3) {
    headline.innerText = "🌌 Perfect Solar System Quest!";
    subhead.innerText = "Wow! 100% Correct answers! Cosmo says you are the Math Empress! 👑";
    playSound('victory');
    startConfetti();
  } else if (starsCount === 2) {
    headline.innerText = "🚀 Stellar Rocket Pilot!";
    subhead.innerText = "Fantastic accuracy! The rocket safely landed on Saturn! 🪐";
    playSound('victory');
    startConfetti();
  } else {
    headline.innerText = "🛰️ Space Patrol Cadet!";
    subhead.innerText = "Good effort! Practice makes our space rocket go faster next time! 🌟";
    playSound('correct');
  }

  document.getElementById('res-score').innerText = gameState.score;
  document.getElementById('res-accuracy').innerText = `${accuracy}%`;
  document.getElementById('res-speed').innerText = `${avgSpeed}s`;
  document.getElementById('res-max-combo').innerText = `${gameState.maxCombo}x`;

  const highscoreBadge = document.getElementById('new-highscore-badge');
  if (isNewHighScore) {
    highscoreBadge.classList.remove('hidden');
  } else {
    highscoreBadge.classList.add('hidden');
  }

  checkAndUnlockBadges(accuracy, parseFloat(avgSpeed));

  // Progression rewards: star-coins, planet stars, daily streak
  let reward = { coins: 0, dailyBonus: false };
  if (typeof Progression !== 'undefined') {
    reward = Progression.completeMission(starsCount, accuracy);
  }
  const coinsEarnedEl = document.getElementById('coins-earned');
  if (coinsEarnedEl) {
    let coinsText = `+${reward.coins} ⭐ Star Coins`;
    if (reward.dailyBonus) coinsText += '  ·  Daily Mission Streak! 🔥';
    if (reward.diminished) coinsText += '  ·  Replay reward — explore a new level for full coins! 🗺️';
    coinsEarnedEl.innerText = coinsText;
    coinsEarnedEl.classList.remove('hidden');
  }

  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = '';
  
  gameState.answersLog.forEach(log => {
    const item = document.createElement('div');
    item.className = `review-item ${log.isCorrect ? 'correct' : 'wrong'}`;
    
    let opSymbol = '×';
    if (log.op === 'add') opSymbol = '+';
    else if (log.op === 'subtract') opSymbol = '−';
    else if (log.op === 'divide') opSymbol = '÷';

    const formula = document.createElement('span');
    formula.className = 'review-formula';

    if (log.op === 'clock') {
      formula.innerText = `Clock Reading`;
    } else if (log.op === 'fraction') {
      if (log.subtype === 'identify') {
        formula.innerText = `Fraction: ${log.num1}/${log.num2}`;
      } else if (log.subtype === 'simplify') {
        formula.innerText = `Simplify: ${log.num1}/${log.num2}`;
      } else if (log.subtype === 'add') {
        formula.innerText = `${log.num1}/${log.denom || '?'} + ${log.num2}/${log.denom || '?'}`;
      } else if (log.subtype === 'subtract') {
        formula.innerText = `${log.num1}/${log.denom || '?'} − ${log.num2}/${log.denom || '?'}`;
      }
    } else if (log.op === 'music' || log.op === 'angles' || log.op === 'puzzle' || log.op === 'pokemon') {
      formula.innerText = `${log.num1} ${log.op === 'pokemon' ? '→' : '='} ${log.expected}`;
    } else if (log.op === 'sequence') {
      formula.innerText = `Sequence: ${log.num1}, ?`;
    } else if (log.op === 'compare') {
      formula.innerText = `Compare: ${log.num1} ? ${log.num2}`;
    } else {
      formula.innerText = `${log.num1} ${opSymbol} ${log.num2} = ${log.expected}`;
    }

    const detail = document.createElement('div');
    if (log.isCorrect) {
      detail.innerHTML = `<span class="review-correct-val">✓ ${log.expected} (${log.timeTaken.toFixed(1)}s)</span>`;
    } else {
      detail.innerHTML = `
        <span class="review-wrong-val">${log.typed === null ? 'Timeout' : log.typed}</span>
        <span class="review-correct-val">✓ ${log.expected}</span>
      `;
    }

    if (log.isRematch) {
      formula.innerText = `🛡️ ${formula.innerText}`;
    }

    item.appendChild(formula);
    item.appendChild(detail);
    reviewList.appendChild(item);
  });

  const resultsSpeech = document.getElementById('results-mascot-speech');
  if (starsCount === 3) {
    resultsSpeech.innerText = "Oh my galaxy, 100%! You have infinite math powers! Let's conquer another table! ☄️";
  } else if (starsCount === 2) {
    resultsSpeech.innerText = "Excellent flying! Only a couple of minor astroids hit us. Let's aim for a perfect score! 🛰️";
  } else {
    resultsSpeech.innerText = "Cosmo knows you can score even higher! Let's retry and fly again! 🚀";
  }

  showScreen('screen-results');

  // Trigger Cosmo's Space Trivia popup on ending the game!
  setTimeout(() => {
    const randomFact = SPACE_TRIVIA[Math.floor(Math.random() * SPACE_TRIVIA.length)];
    const triviaContent = document.getElementById('trivia-content');
    const triviaPopup = document.getElementById('trivia-popup');
    if (triviaContent && triviaPopup) {
      triviaContent.innerText = randomFact;
      triviaPopup.classList.remove('hidden');
      playSound('victory'); // Play a nice discovery tone!
    }
  }, 1200); // 1.2s delay to let stars and scores pop first
}

function checkAndUnlockBadges(accuracy, avgSpeed) {
  let unlockedBadges = JSON.parse(localStorage.getItem(Players.key('space_quest_unlocked_badges'))) || [];
  const newUnlocks = [];

  const addBadge = (id) => {
    if (!unlockedBadges.includes(id)) {
      unlockedBadges.push(id);
      newUnlocks.push(id);
    }
  };

  addBadge('first_flight');

  if (accuracy === 100) {
    addBadge('perfect_10');
  }

  if (accuracy >= 80 && avgSpeed < 2.5) {
    addBadge('speed_demon');
  }

  if (gameState.maxCombo >= 3) {
    addBadge('combo_master');
  }

  const tested7 = gameState.selectedTables.includes(7);
  if (tested7 && accuracy === 100) {
    addBadge('lucky_7');
  }

  const testedCosmic = gameState.selectedTables.some(t => t >= 13);
  if (testedCosmic && accuracy === 100) {
    addBadge('cosmic_explorer');
  }

  if (gameState.activeOp === 'add') {
    if (gameState.digitLevel === 'double' && accuracy === 100) {
      addBadge('addition_cadet');
    } else if (gameState.digitLevel === 'triple' && accuracy === 100) {
      addBadge('addition_master');
    }
  } else if (gameState.activeOp === 'subtract') {
    if (gameState.digitLevel === 'double' && accuracy === 100) {
      addBadge('subtraction_cadet');
    } else if (gameState.digitLevel === 'triple' && accuracy === 100) {
      addBadge('subtraction_master');
    }
  } else if (gameState.activeOp === 'clock') {
    if (gameState.clockLevel === 'hour' && accuracy === 100) {
      addBadge('clock_cadet');
    } else if (gameState.clockLevel === 'five-min' && accuracy === 100) {
      addBadge('clock_master');
    } else if (gameState.clockLevel === 'precision' && accuracy === 100) {
      addBadge('time_lord');
    }
  }

  if (gameState.activeOp === 'divide' && accuracy === 100) {
    const onlyEasy = gameState.selectedTables.every(t => [2, 5, 10].includes(t));
    if (onlyEasy) {
      addBadge('division_cadet');
    } else {
      addBadge('division_master');
    }
  }

  if (gameState.activeOp === 'sequence' && accuracy === 100) {
    if (gameState.sequenceLevel === 'easy') {
      addBadge('pattern_cadet');
    } else if (gameState.sequenceLevel === 'hard') {
      addBadge('pattern_master');
    }
  }

  if (gameState.activeOp === 'compare' && accuracy === 100) {
    if (gameState.compareLevel === 'easy') {
      addBadge('scale_cadet');
    } else if (gameState.compareLevel === 'hard') {
      addBadge('scale_master');
    }
  }

  if (gameState.activeOp === 'fraction' && accuracy === 100) {
    if (gameState.fractionLevel === 'identify') {
      addBadge('fraction_cadet');
    } else if (gameState.fractionLevel === 'simplify') {
      addBadge('fraction_pilot');
    } else if (gameState.fractionLevel === 'add' || gameState.fractionLevel === 'subtract') {
      addBadge('fraction_lord');
    }
  }

  if (gameState.activeOp === 'music' && accuracy === 100) {
    addBadge('rhythm_star');
  }

  if (gameState.activeOp === 'angles' && accuracy === 100) {
    addBadge('twist_champion');
  }

  if (gameState.activeOp === 'puzzle' && accuracy === 100) {
    addBadge('puzzle_genius');
  }

  if (gameState.activeOp === 'pokemon' && accuracy === 100) {
    addBadge('pokemon_professor');
  }

  if (gameState.totalTestsCompleted >= 5) {
    addBadge('galaxy_hero');
  }

  localStorage.setItem(Players.key('space_quest_unlocked_badges'), JSON.stringify(unlockedBadges));

  const badgeContainer = document.getElementById('badges-unlocked-list');
  badgeContainer.innerHTML = '';

  BADGES.forEach(badge => {
    if (unlockedBadges.includes(badge.id)) {
      const isNew = newUnlocks.includes(badge.id);
      const bHtml = document.createElement('div');
      bHtml.className = `badge-item ${isNew ? 'animate-pop' : ''}`;
      bHtml.title = badge.desc;
      bHtml.innerHTML = `
        <span class="badge-emoji">${badge.emoji}</span>
        <span class="badge-name">${badge.name}</span>
        ${isNew ? '<span style="font-size:0.7rem;color:var(--gold-yellow);margin-left:4px;">NEW!</span>' : ''}
      `;
      badgeContainer.appendChild(bHtml);
    }
  });

  if (badgeContainer.children.length === 0) {
    badgeContainer.innerHTML = '<p style="font-size:0.9rem;color:rgba(255,255,255,0.4);">No badges unlocked yet. Fly more missions to earn them! 🏅</p>';
  }
}

function resetToSetup() {
  playSound('tap');
  showScreen('screen-galaxy');
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  gameState.totalTestsCompleted = parseInt(localStorage.getItem(Players.key('space_quest_tests_completed'))) || 0;

  initSetupUI();
  setupNumpad();

  drawClockDial();

  if (typeof Progression !== 'undefined') Progression.init();
});
