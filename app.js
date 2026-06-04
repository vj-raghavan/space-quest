// --- Space Multiplication Quest - Core Logic ---

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
  activeOp: 'multiply', // 'multiply', 'add', 'subtract', 'clock'
  digitLevel: 'single', // 'single', 'double', 'triple', 'mixed'
  clockLevel: 'hour',    // 'hour', 'quarter', 'five-min', 'precision'
  activeClockInput: 'hour', // 'hour' or 'minute'
  clockInputHour: '',
  clockInputMinute: ''
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
  { id: 'galaxy_hero', name: 'Galaxy Hero', emoji: '🪐', desc: 'Completed 5 or more space missions!' }
];

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
      const subtitle = document.getElementById('setup-subtitle');

      if (op === 'multiply') {
        configMulti.classList.remove('hidden');
        configDigits.classList.add('hidden');
        configClock.classList.add('hidden');
        subtitle.innerText = "Select your multiplication tables and prepare your rocket!";
        setMascotExpression('setup', "Hi! I'm Cosmo! Select your tables, and let's go explore the math galaxy together! 💫");
      } else if (op === 'add') {
        configMulti.classList.add('hidden');
        configDigits.classList.remove('hidden');
        configClock.classList.add('hidden');
        subtitle.innerText = "Select your addition number size and prepare your rocket!";
        setMascotExpression('setup', "Addition Zone! Add numbers together to generate high engine pressure! ➕");
      } else if (op === 'subtract') {
        configMulti.classList.add('hidden');
        configDigits.classList.remove('hidden');
        configClock.classList.add('hidden');
        subtitle.innerText = "Select your subtraction number size and prepare your rocket!";
        setMascotExpression('setup', "Subtraction Zone! Decrease numbers to steer our spacecraft! ➖");
      } else if (op === 'clock') {
        configMulti.classList.add('hidden');
        configDigits.classList.add('hidden');
        configClock.classList.remove('hidden');
        subtitle.innerText = "Select your time difficulty and prepare your rocket!";
        setMascotExpression('setup', "Clock Zone! Read the clock face to align our satellite dish! ⏰");
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

    hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
    minHand.setAttribute('transform', `rotate(${minAngle} 100 100)`);

    // Reset clock text inputs
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

    setMascotExpression('game', `What time is shown on the space clock? Enter hour and minutes! ⏰`);
  } else {
    mathCard.classList.remove('hidden');
    clockCard.classList.add('hidden');

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
    }
  });
}

function handleKeyPress(key) {
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
      gameState.clockInputMinute = gameState.clockInputMinute.slice(0, -1);
      minEl.innerText = gameState.clockInputMinute === '' ? 'MM' : gameState.clockInputMinute;
      minEl.classList.toggle('typing', gameState.clockInputMinute !== '');
    }
  } else if (key === 'enter') {
    if (gameState.clockInputHour !== '' && gameState.clockInputMinute !== '') {
      submitClockAnswer();
    }
  } else {
    // Type number
    if (gameState.activeClockInput === 'hour') {
      if (gameState.clockInputHour.length < 2) {
        gameState.clockInputHour += key;
        const val = parseInt(gameState.clockInputHour);
        if (val > 12) {
          gameState.clockInputHour = key;
        }
        hourEl.innerText = gameState.clockInputHour;
        hourEl.classList.add('typing');
        
        // Auto-advance
        const currentValStr = gameState.clockInputHour;
        if (currentValStr.length === 2 || parseInt(currentValStr) >= 2) {
          setTimeout(() => {
            gameState.activeClockInput = 'minute';
            hourEl.classList.remove('active');
            minEl.classList.add('active');
          }, 300);
        }
      }
    } else {
      if (gameState.clockInputMinute.length < 2) {
        gameState.clockInputMinute += key;
        const val = parseInt(gameState.clockInputMinute);
        if (val > 59) {
          gameState.clockInputMinute = key;
        }
        minEl.innerText = gameState.clockInputMinute;
        minEl.classList.add('typing');
      }
    }
  }
}

function submitClockAnswer() {
  clearInterval(gameState.timerInterval);

  const q = gameState.currentQuestions[gameState.currentQuestionIndex];
  
  const typedH = parseInt(gameState.clockInputHour);
  const typedM = parseInt(gameState.clockInputMinute);
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
