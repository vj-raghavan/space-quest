// One-shot verification of the ABC Base & Number Camp planets.
// Run: node tools/verify-abc.js  (expects `node server.js` on :3000)
const { chromium } = require('playwright');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Dismiss the player picker if it appears
  await page.evaluate(() => {
    const overlay = document.getElementById('player-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      const btn = overlay.querySelector('.player-chip, button');
      if (btn) btn.click();
    }
  });
  await page.waitForTimeout(400);

  // --- 1. Galaxy map shows the new planets & the new stars total ---
  const galaxy = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#planets-grid .planet-name')].map(e => e.innerText);
    return { cards, stars: document.getElementById('galaxy-stars').innerText };
  });
  check('ABC Base planet on galaxy map', galaxy.cards.includes('ABC Base'));
  check('Number Camp planet on galaxy map', galaxy.cards.includes('Number Camp'));
  check('Stars total is 210', galaxy.stars.includes('210'), galaxy.stars);

  // Helper: close any overlay popups (name prompt, space trivia) between rounds
  async function dismissPopups() {
    await page.evaluate(() => {
      document.querySelectorAll('.trivia-overlay').forEach(el => el.classList.add('hidden'));
      const overlay = document.getElementById('player-overlay');
      if (overlay) overlay.classList.add('hidden');
    });
  }

  // Helper: launch a planet level straight through the real Progression path
  async function launchLevel(planetId, levelId) {
    await dismissPopups();
    await page.evaluate(([pid, lid]) => {
      gameState.injectedQuestions = null;
      gameState.gameMode = 'adventure';
      gameState.questionCount = 10;
      // Same as launchPlanetMission
      const planets = { abc: 'abcLevel', numbers: 'numbersLevel' };
      gameState.activeOp = pid;
      gameState[planets[pid]] = lid;
      gameState.missionKey = `${pid}:${lid}`;
      launchGame();
    }, [planetId, levelId]);
    await page.waitForTimeout(400);
  }

  // Helper: play a whole round by tapping the CORRECT choice button each time
  async function playChoiceRound() {
    for (let i = 0; i < 10; i++) {
      const done = await page.evaluate(() => {
        const q = gameState.currentQuestions[gameState.currentQuestionIndex];
        if (!q || !q.choices) return 'no-choices';
        const btns = [...document.querySelectorAll('#choice-pad .choice-key')];
        const target = btns.find(b => b.dataset.value === q.expected);
        if (!target) return 'no-target';
        target.click();
        return 'ok';
      });
      if (done !== 'ok') return done;
      await page.waitForTimeout(1600);
    }
    await page.waitForTimeout(1500);
    return 'ok';
  }

  // --- 2. ABC Letter Hunt: full 10-question round via real button taps ---
  await launchLevel('abc', 'find');
  const q1 = await page.evaluate(() => {
    const q = gameState.currentQuestions[0];
    const pad = document.getElementById('choice-pad');
    return {
      op: q.op, hasSay: !!q.say, choices: q.choices.length,
      padVisible: !pad.classList.contains('hidden'),
      numpadHidden: document.getElementById('custom-numpad').classList.contains('hidden')
    };
  });
  check('Letter Hunt uses 3 tap choices, numpad hidden',
    q1.op === 'abc' && q1.choices === 3 && q1.padVisible && q1.numpadHidden, JSON.stringify(q1));
  const r1 = await playChoiceRound();
  const end1 = await page.evaluate(() => ({
    screen: !document.getElementById('screen-results').classList.contains('hidden'),
    correct: gameState.correctAnswersCount,
    stars: (JSON.parse(localStorage.getItem(Players.key('space_quest_profile_v1'))).stars || {})['abc:find'],
    badges: JSON.parse(localStorage.getItem(Players.key('space_quest_unlocked_badges'))) || []
  }));
  check('Letter Hunt round: 10/10, results screen', r1 === 'ok' && end1.screen && end1.correct === 10, JSON.stringify(end1));
  check('Letter Hunt awards 3 stars for abc:find', end1.stars === 3, `stars=${end1.stars}`);
  check('Alphabet Ace badge unlocked', end1.badges.includes('alphabet_ace'));

  // --- 3. Big & Small Twins + Alphabet Train + Number levels (2 questions each, sanity) ---
  for (const [pid, lid] of [['abc', 'match'], ['abc', 'order'], ['numbers', 'count'], ['numbers', 'find'], ['numbers', 'order']]) {
    await launchLevel(pid, lid);
    const info = await page.evaluate(() => {
      const q = gameState.currentQuestions[0];
      const btns = [...document.querySelectorAll('#choice-pad .choice-key')];
      const hasExpected = btns.some(b => b.dataset.value === q.expected);
      return { choices: q.choices ? q.choices.length : 0, hasExpected, say: !!q.say };
    });
    check(`${pid}:${lid} renders 3 choices incl. the answer`, info.choices === 3 && info.hasExpected && info.say, JSON.stringify(info));
    // answer one correctly, one wrongly → teach + rematch paths exercised
    await page.evaluate(() => {
      const q = gameState.currentQuestions[gameState.currentQuestionIndex];
      submitChoiceAnswer(q.expected);
    });
    await page.waitForTimeout(1600);
    await page.evaluate(() => {
      const q = gameState.currentQuestions[gameState.currentQuestionIndex];
      const wrong = q.choices.map(c => String(c.value)).find(v => v !== q.expected);
      submitChoiceAnswer(wrong);
    });
    const wrongState = await page.evaluate(() => ({
      missed: gameState.missedQuestions.length,
      teachShown: !document.getElementById('visual-helper').classList.contains('hidden')
    }));
    check(`${pid}:${lid} wrong answer queues rematch + teaching moment`, wrongState.missed === 1 && wrongState.teachShown, JSON.stringify(wrongState));
    await page.waitForTimeout(3800);
  }

  // --- 4. TRACING: the star of the show ---
  async function traceCurrentGlyph(quality) {
    // quality: 'good' → ink along glyph pixels; 'scribble' → ink far from glyph
    return await page.evaluate((quality) => {
      const canvas = document.getElementById('trace-canvas');
      const rect = canvas.getBoundingClientRect();
      const SIZE = 360;
      const q = gameState.currentQuestions[gameState.currentQuestionIndex];
      const char = q.traceChar;

      // Rebuild the glyph mask exactly like TracePad does
      const mask = document.createElement('canvas');
      mask.width = SIZE; mask.height = SIZE;
      const mctx = mask.getContext('2d');
      mctx.font = `700 ${char.length > 1 ? 200 : 250}px Fredoka, "Comic Sans MS", Arial, sans-serif`;
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.fillStyle = '#fff';
      mctx.fillText(char, SIZE / 2, SIZE / 2 + 10);
      const data = mctx.getImageData(0, 0, SIZE, SIZE).data;

      const pts = [];
      if (quality === 'good') {
        for (let y = 0; y < SIZE; y += 5) {
          for (let x = 0; x < SIZE; x += 5) {
            if (data[(y * SIZE + x) * 4 + 3] > 40) pts.push([x, y]);
          }
        }
      } else {
        for (let i = 0; i < 120; i++) pts.push([10 + (i % 12) * 6, 10 + Math.floor(i / 12) * 6]); // top-left corner scribble
      }

      const toClient = ([x, y]) => ({
        clientX: rect.left + x * (rect.width / SIZE),
        clientY: rect.top + y * (rect.height / SIZE)
      });
      const fire = (type, p) => canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 1, isPrimary: true, ...toClient(p)
      }));

      fire('pointerdown', pts[0]);
      for (let i = 1; i < pts.length; i++) fire('pointermove', pts[i]);
      fire('pointerup', pts[pts.length - 1]);
      return { char, points: pts.length, eval: TracePad.evaluate() };
    }, quality);
  }

  // 4a. Good trace of an uppercase letter passes and scores
  await launchLevel('abc', 'traceupper');
  const traceUi = await page.evaluate(() => ({
    padVisible: !document.getElementById('trace-pad').classList.contains('hidden'),
    doneDisabled: document.getElementById('trace-done').disabled,
    numpadHidden: document.getElementById('custom-numpad').classList.contains('hidden')
  }));
  check('Trace pad visible, Done disabled before ink, numpad hidden',
    traceUi.padVisible && traceUi.doneDisabled && traceUi.numpadHidden, JSON.stringify(traceUi));

  const good = await traceCurrentGlyph('good');
  check(`Good trace of "${good.char}" passes scoring`,
    good.eval.pass && good.eval.coverage > 0.8,
    `coverage=${good.eval.coverage.toFixed(2)} precision=${good.eval.precision.toFixed(2)}`);
  const doneEnabled = await page.evaluate(() => !document.getElementById('trace-done').disabled);
  check('Done button enabled after inking', doneEnabled);
  await dismissPopups();
  await page.click('#trace-done');
  await page.waitForTimeout(300);
  const afterGood = await page.evaluate(() => {
    const log = gameState.answersLog[gameState.answersLog.length - 1];
    return { isCorrect: log.isCorrect, typed: log.typed, correctCount: gameState.correctAnswersCount };
  });
  check('Good trace submits as CORRECT', afterGood.isCorrect === true && afterGood.correctCount === 1, JSON.stringify(afterGood));
  await page.waitForTimeout(1700);

  // 4b. Scribble in the corner fails (scribble-proof scoring)
  const bad = await traceCurrentGlyph('scribble');
  check(`Corner scribble on "${bad.char}" fails scoring`, !bad.eval.pass,
    `coverage=${bad.eval.coverage.toFixed(2)} precision=${bad.eval.precision.toFixed(2)}`);
  await dismissPopups();
  await page.click('#trace-done');
  await page.waitForTimeout(300);
  const afterBad = await page.evaluate(() => {
    const log = gameState.answersLog[gameState.answersLog.length - 1];
    return { isCorrect: log.isCorrect, missed: gameState.missedQuestions.length };
  });
  check('Scribble submits as WRONG and queues rematch', afterBad.isCorrect === false && afterBad.missed === 1, JSON.stringify(afterBad));
  await page.waitForTimeout(3800);

  // 4c. Clear button wipes ink and disables Done
  await traceCurrentGlyph('good');
  await dismissPopups();
  await page.click('#trace-clear');
  const afterClear = await page.evaluate(() => ({
    doneDisabled: document.getElementById('trace-done').disabled,
    ink: TracePad.inkPresent()
  }));
  check('Start-over clears ink and disables Done', afterClear.doneDisabled && !afterClear.ink, JSON.stringify(afterClear));

  // 4d. Lowercase letter and single/double digit tracing all pass with a good trace
  for (const [pid, lid] of [['abc', 'tracelower'], ['numbers', 'trace'], ['numbers', 'teen']]) {
    await launchLevel(pid, lid);
    const r = await traceCurrentGlyph('good');
    check(`${pid}:${lid} good trace of "${r.char}" passes`, r.eval.pass,
      `coverage=${r.eval.coverage.toFixed(2)} precision=${r.eval.precision.toFixed(2)}`);
  }

  // --- 5. Parent dashboard mode names resolve ---
  const modeNames = await page.evaluate(() => {
    const modes = Mastery.getModeStats();
    return Object.keys(modes).filter(k => k.startsWith('abc:') || k.startsWith('numbers:'));
  });
  check('Mastery mode stats recorded for new planets', modeNames.length >= 3, modeNames.join(', '));

  // --- 6. No console errors during the whole session ---
  const realErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('net::') && !e.includes('googleapis'));
  check('No console/page errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
