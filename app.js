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
  activeOp: 'multiply', // 'multiply', 'add', 'subtract', 'clock', 'fraction'
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
  fractionAutoAdvanceTimer: null
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
    "Wow, a x2 combo! You're on fire! 🔥",
    "Incredible speed! Combo x3! You are zooming! ⚡",
    "Super combo! The rocket is in hyperspace! 🌌"
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
  { id: 'clock_cadet', name: 'Clock Cadet', emoji: '⏰', desc: 'Mastered reading Clocks on the hour!' },
  { id: 'clock_master', name: 'Clock Master', emoji: '🕰️', desc: 'Mastered 5-Minute interval Clock reading!' },
  { id: 'time_lord', name: 'Time Lord', emoji: '🛸', desc: 'Aced Precision Clock Reading!' },
  { id: 'fraction_cadet', name: 'Fraction Cadet', emoji: '🍕', desc: 'Correctly identified fractions from a pie chart!' },
  { id: 'fraction_pilot', name: 'Fraction Pilot', emoji: '✂️', desc: 'Mastered simplifying fractions to lowest terms!' },
  { id: 'fraction_lord', name: 'Fraction Lord', emoji: '🌠', desc: 'Conquered adding and subtracting fractions!' },
  { id: 'galaxy_hero', name: 'Galaxy Hero', emoji: '🪐', desc: 'Completed 5 or more space missions!' }
];

// --- Math Utilities ---
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
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
      // Classic triumphant arpeggio: C5 -> E5 -> G5 -> C6
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
      
      const tempo = 0.15;
      playNote(523.25, now, 0.25); // C5
      playNote(659.25, now + tempo, 0.25); // E5
      playNote(783.99, now + tempo * 2, 0.25); // G5
      playNote(1046.50, now + tempo * 3, 0.50); // C6
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
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
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
      const subtitle = document.getElementById('setup-subtitle');

      if (op === 'multiply') {
        configMulti.classList.remove('hidden');
        configDigits.classList.add('hidden');
        configClock.classList.add('hidden');
        configFraction.classList.add('hidden');
        subtitle.innerText = "Select your multiplication tables and prepare your rocket!";
        setMascotExpression('setup', "Hi! I'm Cosmo! Select your tables, and let's go explore the math galaxy together! 💫");
      } else if (op === 'add') {
        configMulti.classList.add('hidden');
        configDigits.classList.remove('hidden');
        configClock.classList.add('hidden');
        configFraction.classList.add('hidden');
        subtitle.innerText = "Select your addition number size and prepare your rocket!";
        setMascotExpression('setup', "Addition Zone! Add numbers together to generate high engine pressure! ➕");
      } else if (op === 'subtract') {
        configMulti.classList.add('hidden');
        configDigits.classList.remove('hidden');
        configClock.classList.add('hidden');
        configFraction.classList.add('hidden');
        subtitle.innerText = "Select your subtraction number size and prepare your rocket!";
        setMascotExpression('setup', "Subtraction Zone! Decrease numbers to steer our spacecraft! ➖");
      } else if (op === 'clock') {
        configMulti.classList.add('hidden');
        configDigits.classList.add('hidden');
        configClock.classList.remove('hidden');
        configFraction.classList.add('hidden');
        subtitle.innerText = "Select your time difficulty and prepare your rocket!";
        setMascotExpression('setup', "Clock Zone! Read the clock face to align our satellite dish! ⏰");
      } else if (op === 'fraction') {
        configMulti.classList.add('hidden');
        configDigits.classList.add('hidden');
        configClock.classList.add('hidden');
        configFraction.classList.remove('hidden');
        subtitle.innerText = "Select your fraction level and prepare your rocket!";
        setMascotExpression('setup', "Fraction Zone! Slice the space pizza and master fractions! 🍕");
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

  // Game Mode selector
  document.querySelectorAll('#game-mode-group .toggle-option').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('tap');
      document.querySelectorAll('#game-mode-group .toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.gameMode = btn.dataset.value;
    });
  });

  // Start game click
  document.getElementById('btn-start-game').addEventListener('click', launchGame);

  // Restart click on Results
  document.getElementById('btn-restart').addEventListener('click', resetToSetup);

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
  }
}

// Generate the randomized arithmetic pool
function generateQuestions() {
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

  const mathCard = document.getElementById('math-card');
  const clockCard = document.getElementById('clock-card');
  mathCard.className = 'math-card glass-panel'; // clear templates
  clockCard.className = 'clock-card glass-panel';

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  
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
  } else {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');
    const fractionCard = document.getElementById('fraction-card');
    if (fractionCard) fractionCard.classList.add('hidden');

    document.getElementById('num-1').innerText = q.num1;
    document.getElementById('num-2').innerText = q.num2;
    document.getElementById('game-question-index').innerText = `${gameState.currentQuestionIndex + 1} / ${gameState.questionCount}`;

    // Mascot speech reset and operator display setup
    const opElement = document.getElementById('game-operator');
    let opSymbol = '×';
    if (gameState.activeOp === 'add') {
      opSymbol = '+';
      setMascotExpression('game', `Solve ${q.num1} + ${q.num2} to propel the rocket! 🚀`);
    } else if (gameState.activeOp === 'subtract') {
      opSymbol = '−';
      setMascotExpression('game', `Solve ${q.num1} − ${q.num2} to propel the rocket! 🚀`);
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

function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timeLeft = 8.0;
  const bar = document.getElementById('timer-bar');
  bar.style.width = '100%';

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft -= 0.1;
    const percentage = (gameState.timeLeft / 8.0) * 100;
    bar.style.width = `${percentage}%`;

    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timerInterval);
      // Auto-submit empty response (which will mark it wrong)
      submitAnswer(true);
    }
  }, 100);
}

function updateAnswerDisplay() {
  const display = document.getElementById('answer-display');
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
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleKeyPress('delete');
    } else if (e.key === 'Enter') {
      handleKeyPress('enter');
    } else if (e.key === '/' || e.key === '.') {
      if (gameState.activeOp === 'fraction') {
        if (gameState.fractionAutoAdvanceTimer) {
          clearTimeout(gameState.fractionAutoAdvanceTimer);
          gameState.fractionAutoAdvanceTimer = null;
        }
        gameState.activeFractionInput = 'denominator';
        document.getElementById('fraction-input-num').classList.remove('active', 'waiting');
        document.getElementById('fraction-input-den').classList.add('active');
      } else if (e.key === ':' && gameState.activeOp === 'clock') {
        if (gameState.clockHourAutoAdvanceTimer) {
          clearTimeout(gameState.clockHourAutoAdvanceTimer);
          gameState.clockHourAutoAdvanceTimer = null;
        }
        gameState.activeClockInput = 'minute';
        document.getElementById('clock-input-hour').classList.remove('active', 'waiting');
        document.getElementById('clock-input-min').classList.add('active');
      }
    }
  });
}

function handleKeyPress(key) {
  if (gameState.activeOp === 'fraction') {
    handleFractionKeyPress(key);
    return;
  }
  if (gameState.activeOp === 'clock') {
    handleClockKeyPress(key);
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
  const typedAnswer = isTimeout ? null : parseInt(gameState.currentAnswer);
  const isCorrect = typedAnswer === q.expected;
  
  const timeTaken = (performance.now() - gameState.questionStartTime) / 1000;

  // Log answer
  gameState.answersLog.push({
    num1: q.num1,
    num2: q.num2,
    expected: q.expected,
    op: q.op,
    typed: typedAnswer,
    isCorrect: isCorrect,
    timeTaken: timeTaken
  });

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
    playSound('wrong');
    mathCard.classList.add('incorrect');
    mathCard.classList.add('animate-shake');
    setTimeout(() => mathCard.classList.remove('animate-shake'), 400);

    const display = document.getElementById('answer-display');
    display.innerText = q.expected;
    display.style.color = 'var(--success-green)';

    setMascotExpression('incorrect');
    updateComboHUD();

    setTimeout(advanceGame, 1800);
  }
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
    timeTaken: timeTaken
  });

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
    typed: `${typedN}/${typedD}`, isCorrect, timeTaken
  });

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
  } else {
    endGame();
  }
}

function endGame() {
  gameState.totalTestsCompleted++;
  localStorage.setItem('space_quest_tests_completed', gameState.totalTestsCompleted);

  const accuracy = Math.round((gameState.correctAnswersCount / gameState.questionCount) * 100);
  let totalTime = 0;
  gameState.answersLog.forEach(log => totalTime += log.timeTaken);
  const avgSpeed = (totalTime / gameState.questionCount).toFixed(1);

  let highscore = parseInt(localStorage.getItem('space_quest_high_score')) || 0;
  let isNewHighScore = false;
  if (gameState.score > highscore) {
    localStorage.setItem('space_quest_high_score', gameState.score);
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

  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = '';
  
  gameState.answersLog.forEach(log => {
    const item = document.createElement('div');
    item.className = `review-item ${log.isCorrect ? 'correct' : 'wrong'}`;
    
    let opSymbol = '×';
    if (log.op === 'add') opSymbol = '+';
    else if (log.op === 'subtract') opSymbol = '−';

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
}

function checkAndUnlockBadges(accuracy, avgSpeed) {
  let unlockedBadges = JSON.parse(localStorage.getItem('space_quest_unlocked_badges')) || [];
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

  if (gameState.activeOp === 'fraction' && accuracy === 100) {
    if (gameState.fractionLevel === 'identify') {
      addBadge('fraction_cadet');
    } else if (gameState.fractionLevel === 'simplify') {
      addBadge('fraction_pilot');
    } else if (gameState.fractionLevel === 'add' || gameState.fractionLevel === 'subtract') {
      addBadge('fraction_lord');
    }
  }

  if (gameState.totalTestsCompleted >= 5) {
    addBadge('galaxy_hero');
  }

  localStorage.setItem('space_quest_unlocked_badges', JSON.stringify(unlockedBadges));

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
  showScreen('screen-setup');
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  gameState.totalTestsCompleted = parseInt(localStorage.getItem('space_quest_tests_completed')) || 0;

  initSetupUI();
  setupNumpad();
  
  drawClockDial();
});
