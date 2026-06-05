const { chromium } = require('playwright');

(async () => {
  console.log('Starting server...');
  const { spawn } = require('child_process');
  const server = spawn('node', ['server.js']);

  // Wait a moment for server to start
  await new Promise(r => setTimeout(r, 1000));

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    
    console.log('Selecting clock mode...');
    await page.click('.op-tab-btn[data-op="clock"]');
    
    console.log('Starting mission...');
    await page.click('#btn-start-game');
    
    await page.waitForSelector('#screen-game:not(.hidden)');
    console.log('Game started.');

    // Get the expected answer
    const q = await page.evaluate(() => {
      return gameState.currentQuestions[gameState.currentQuestionIndex];
    });
    console.log('Current question:', q);

    const [expectedHour, expectedMin] = q.expected.split(':');

    // TEST: pad hour with leading zero if it is a single digit
    const typedHour = expectedHour.length === 1 ? `0${expectedHour}` : expectedHour;

    console.log(`Typing answer with leading zero if single digit: Hour=${typedHour}, Min=${expectedMin}`);

    for (const char of typedHour) {
      await page.click(`.num-key[data-key="${char}"]`);
      await page.waitForTimeout(100);
    }

    for (const char of expectedMin) {
      await page.click(`.num-key[data-key="${char}"]`);
      await page.waitForTimeout(100);
    }

    console.log('Pressing Enter...');
    await page.click('.num-key[data-key="enter"]');

    await page.waitForTimeout(1000);
    const answersLog = await page.evaluate(() => gameState.answersLog);
    const lastAnswer = answersLog[answersLog.length - 1];
    
    console.log('Answer log:', lastAnswer);

    if (!lastAnswer.isCorrect) {
      console.error('TEST FAILED: Answer was marked incorrect!');
      const isClockIncorrect = await page.evaluate(() => {
        return document.getElementById('clock-card').classList.contains('incorrect');
      });
      console.error('Clock Card has "incorrect" class:', isClockIncorrect);
      
      const hourInput = await page.evaluate(() => document.getElementById('clock-input-hour').innerText);
      const minInput = await page.evaluate(() => document.getElementById('clock-input-min').innerText);
      console.error('UI shows:', hourInput, ':', minInput);
    } else {
      console.log('TEST PASSED: Answer was marked correct.');
    }

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    console.log('Cleaning up...');
    await browser.close();
    server.kill();
    process.exit(0);
  }
})();
