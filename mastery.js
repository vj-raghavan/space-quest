// --- Space Quest — Mastery Tracking & Adaptive Question Selection ---
// Persists per-fact stats (multiplication/division) and per-mode stats in
// localStorage so the game can practice what the player is weak or slow at.

const Mastery = (() => {
  const STORE_KEY = 'space_quest_mastery_v1';

  let data = { facts: {}, modes: {} };
  try {
    const raw = localStorage.getItem(Players.key(STORE_KEY));
    if (raw) data = JSON.parse(raw);
    if (!data.facts) data.facts = {};
    if (!data.modes) data.modes = {};
  } catch (e) {
    data = { facts: {}, modes: {} };
  }

  function save() {
    localStorage.setItem(Players.key(STORE_KEY), JSON.stringify(data));
  }

  // Canonical key for a fact. Multiplication is commutative, so 7x8 and 8x7
  // share one record.
  function factKey(q) {
    if (q.op === 'multiply') {
      const a = Math.min(q.num1, q.num2), b = Math.max(q.num1, q.num2);
      return `m:${a}x${b}`;
    }
    if (q.op === 'divide') return `d:${q.num1}/${q.num2}`;
    return null;
  }

  function record(q, isCorrect, timeTaken, modeTag) {
    const key = factKey(q);
    if (key) {
      const s = data.facts[key] || { a: 0, c: 0, t: 0 };
      s.a += 1;
      if (isCorrect) s.c += 1;
      // Exponential moving average of response time
      s.t = s.t === 0 ? timeTaken : (s.t * 0.7 + timeTaken * 0.3);
      data.facts[key] = s;
    }
    if (modeTag) {
      const m = data.modes[modeTag] || { a: 0, c: 0, t: 0 };
      m.a += 1;
      if (isCorrect) m.c += 1;
      m.t = m.t === 0 ? timeTaken : (m.t * 0.7 + timeTaken * 0.3);
      data.modes[modeTag] = m;
    }
    save();
  }

  // How much does this fact need practice? ~0 = mastered, higher = weaker.
  function weaknessScore(key) {
    const s = data.facts[key];
    if (!s || s.a === 0) return 0.9; // never seen: medium-high priority
    const acc = s.c / s.a;
    let score = (1 - acc) * 2.2;
    score += Math.min(Math.max((s.t - 3) / 5, 0), 1) * 0.8; // slow = not fluent yet
    if (s.a < 3) score += 0.3; // not enough evidence yet
    return score;
  }

  // Weighted sample without replacement — weak/slow facts are much more
  // likely to be picked. Refills from the pool if count exceeds pool size.
  function weightedSample(pool, count) {
    let items = pool.map(q => ({ q, w: 0.5 + weaknessScore(factKey(q)) }));
    const out = [];
    while (out.length < count) {
      if (items.length === 0) {
        if (pool.length === 0) break;
        items = pool.map(q => ({ q, w: 1 }));
      }
      const total = items.reduce((sum, it) => sum + it.w, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < items.length - 1; idx++) {
        r -= items[idx].w;
        if (r <= 0) break;
      }
      out.push({ ...items[idx].q });
      items.splice(idx, 1);
    }
    return out;
  }

  // Up to n ready-to-play question objects for the weakest recorded facts.
  function getWeakFactQuestions(n) {
    const scored = Object.keys(data.facts)
      .map(key => ({ key, score: weaknessScore(key), stats: data.facts[key] }))
      .filter(f => f.stats.a > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, n);

    return scored.map(({ key }) => {
      if (key.startsWith('m:')) {
        const [a, b] = key.slice(2).split('x').map(Number);
        const swap = Math.random() > 0.5;
        return { num1: swap ? b : a, num2: swap ? a : b, expected: a * b, op: 'multiply' };
      }
      const [x, y] = key.slice(2).split('/').map(Number);
      return { num1: x, num2: y, expected: x / y, op: 'divide' };
    });
  }

  function getFactStats(a, b) {
    return data.facts[`m:${Math.min(a, b)}x${Math.max(a, b)}`] || null;
  }

  function getModeStats() {
    return data.modes;
  }

  function resetAll() {
    data = { facts: {}, modes: {} };
    save();
  }

  return { record, weightedSample, getWeakFactQuestions, getFactStats, getModeStats, weaknessScore, factKey, resetAll };
})();
