// Generates og-image.png (1200x630) — the social-share preview card.
// Run from the repo root:  node tools/make-og-image.js
// One-off build tool; the PNG it produces is committed, so this isn't
// part of the runtime or the GitHub Pages deploy.

const { chromium } = require('playwright');
const path = require('path');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: 'Fredoka', system-ui, sans-serif;
    background: radial-gradient(circle at 50% 35%, #1b2735, #090a0f 75%);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .star { position: absolute; border-radius: 50%; background: #fff; opacity: 0.7; }
  .rocket { font-size: 150px; line-height: 1; filter: drop-shadow(0 0 30px rgba(120,200,255,0.6)); }
  h1 {
    font-size: 110px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(180deg, #8fe9ff, #4aa8ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 60px rgba(80,180,255,0.35);
    margin: 6px 0 4px;
  }
  .tagline { font-size: 40px; font-weight: 500; color: #cfe8ff; margin-bottom: 30px; }
  .chips { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; max-width: 1000px; }
  .chip {
    font-size: 30px; font-weight: 500;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 999px;
    padding: 12px 26px;
  }
  .free {
    position: absolute; top: 44px; right: 54px;
    font-size: 28px; font-weight: 600; color: #1a1a1a;
    background: #ffdd00; border-radius: 999px; padding: 10px 26px;
    transform: rotate(6deg);
  }
</style>
</head>
<body>
  <div class="free">100% Free · No Ads</div>
  <div class="rocket">🚀</div>
  <h1>Space Quest</h1>
  <div class="tagline">Fun learning games for kids exploring the galaxy</div>
  <div class="chips">
    <span class="chip">✖️ Times Tables</span>
    <span class="chip">🔤 Spelling</span>
    <span class="chip">🍕 Fractions</span>
    <span class="chip">⏰ Telling Time</span>
    <span class="chip">📖 Story Problems</span>
  </div>
</body>
</html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  // Sprinkle a few deterministic stars so the field looks alive but stays reproducible
  await page.evaluate(() => {
    const seed = [[120,90,3],[300,160,2],[980,120,3],[1080,300,2],[200,520,2],
                  [1040,540,3],[640,70,2],[760,560,3],[420,90,2],[900,470,2]];
    for (const [x, y, r] of seed) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.cssText = `left:${x}px;top:${y}px;width:${r}px;height:${r}px;`;
      document.body.appendChild(s);
    }
  });
  const out = path.join(__dirname, '..', 'og-image.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log('Wrote ' + out);

  // App icon (apple-touch-icon / home screen) — rocket on the deep-space gradient
  const iconHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:180px;height:180px;}
    body{display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 50% 40%, #243447, #090a0f);}
    .r{font-size:118px;line-height:1;filter:drop-shadow(0 0 14px rgba(120,200,255,0.6));}
  </style></head><body><div class="r">🚀</div></body></html>`;
  const iconPage = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  await iconPage.setContent(iconHtml, { waitUntil: 'networkidle' });
  const iconOut = path.join(__dirname, '..', 'apple-touch-icon.png');
  await iconPage.screenshot({ path: iconOut, type: 'png' });
  console.log('Wrote ' + iconOut);

  await browser.close();
})();
