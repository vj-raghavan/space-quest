# Space Quest — Agent Handover Document

A briefing for any agent (or human) picking up this project cold. Last updated: June 2026.

## What this is

A kids' educational game built by the owner (Vijay) for his two children:
- **Daughter, age 8** — the math side: times tables, arithmetic, fractions, clocks, word problems, estimation, puzzles, plus hobby-themed planets (piano → music math, gymnastics → angles).
- **Son, age 5** — the Poké Galaxy: tap-to-answer Pokémon quizzes (no typing/reading required) with a collectible Pokédex.

Live at **vj-raghavan.github.io/space-quest** (GitHub Pages, auto-deploys from `main` of `vj-raghavan/space-quest`).

### Non-negotiable design principles
1. **GitHub Pages simple**: plain HTML/CSS/JS, no build step, no backend, no dependencies, no accounts. All state in `localStorage`.
2. **Encourage, never punish**: no leaderboards or sibling competition; streaks have a weekly forgiveness "shield"; wrong answers teach instead of just buzzing; rewards diminish on farming but practice is never blocked.
3. **Kid-appropriate input**: the 8yo types on a big numpad; the 5yo taps big multiple-choice buttons.

## Run / verify / deploy

- **Run locally**: `node server.js` → http://localhost:3000 (static file server; the site works identically when served by GitHub Pages).
- **Preview tooling**: a `space-quest` entry exists in the *ibkr-dashboard* repo's `.claude/launch.json` (the preview system reads launch config from the primary project, not this repo). `.claude/` here is gitignored.
- **Deploy** = commit + `git push` to `main`. Remote is SSH; the key is passphrase-protected — if push fails with `Permission denied (publickey)`, run `ssh-add --apple-load-keychain` (passphrase is in the macOS keychain).
- Commit only when the owner asks (he usually says "commit and push" or it's the established end-of-feature step).

## File map & script load order

Load order in `index.html` **matters** (globals, no modules):

| File | Role |
|---|---|
| `players.js` | **Loads first.** Player registry + `Players.key(base)` namespacing of all per-player localStorage keys. Migration of pre-profile data → player `p1`. Switching players = `location.reload()`. |
| `mascot.js` | Cosmo 2.0: inline-SVG animated mascot (`mascotSVG(uid)`, `initMascots()`, `setMascotMood(type)`). |
| `mastery.js` | Per-fact stats (multiply/divide only: key `m:AxB` normalized, `d:X/Y`) + per-mode buckets. EWMA response time. `weightedSample` biases question selection toward weak/slow facts. |
| `pokemon.js` | Full Gen-1 dataset (151), `Pokedex` collection module, question builders (count/identity/type/evolution/battle). Sprites hotlinked from PokeAPI CDN (`raw.githubusercontent.com/PokeAPI/sprites/...`; official artwork for questions, 96px sprites for grids/counting). |
| `story.js` | Word-problem + estimation question builders. |
| `progression.js` | `Progression` module: planet/level config (`PLANETS`), stars, coins + anti-farm, shop (rockets/trails/jingles/themes/pet accessories/Poké Packs), daily mission + streak + Puzzle of the Day, space pet, Lightning Round records, player picker & profile editor UI, parent dashboard, galaxy rendering. |
| `app.js` | **Loads last.** Game engine: `gameState`, setup screen, question generation dispatch, the four submit paths, rematch, teaching moments, timers, scoring, badges, results, audio synth, bootstrap. |
| `style.css` | Original stylesheet (mostly untouched). `.screen { display:flex }` — row by default! |
| `enhancements.css` | Everything added since: galaxy/shop/pokedex/pet/themes/vertical-layout/choice-pad/mascot CSS. |

## Core gameplay flow

- `gameState.activeOp` ∈ multiply, divide, add, subtract, sequence, compare, clock, fraction, music, angles, puzzle, pokemon, story, estimate.
- `generateQuestions()` builds `gameState.currentQuestions`; multiply/divide use `Mastery.weightedSample` (adaptive); daily missions inject `gameState.injectedQuestions`.
- `loadQuestion()` branches on the **question's own op** (`q.op || activeOp`) because daily missions mix ops. Rendering paths: equation (horizontal or stacked/vertical via `gameState.eqStyle`), sequence, clock SVG, fraction, compare scale, prompt-display (music/angles/puzzle/story/estimate), **choice-pad if `q.choices` exists** (any op).
- Submission paths: `submitAnswer` (numpad), `submitClockAnswer`, `submitFractionAnswer`, `submitCompareAnswer`, `submitChoiceAnswer` (multiple choice; also catches Pokémon via `q.catchId`). All record to `Mastery` and push `answersLog`.
- Wrong answers: queue into `missedQuestions` → end-of-round **rematch** (max 5, skipped for sprint); show a **teaching moment** (`q.teach` string, or generated dot-arrays/decompositions) in `#visual-helper`.
- `endGame()`: stars (100%→3, ≥80→2, ≥50→1), `Progression.completeMission` (coins with replay-diminishing multiplier per `missionKey` per day: full ×2, then 50%, then 20%), badges, sprint record handling, review list.
- `gameState.missionKey`: `'planet:level'` (galaxy launches and matching custom missions), `'daily'`, `'sprint'`, or null.

## Storage (all namespaced by `Players.key()` → `<base>:<playerId>`)

- `space_quest_players_v1` — registry (NOT namespaced): `{players:[{id,name,avatar}], activeId}`.
- `space_quest_profile_v1` — coins, rocket/trail/jingle/theme/petAccessory + `owned[]`, stars per missionKey, streak `{count,lastDate,shieldWeek}`, `dailyHistory[]`, `dailyPlays` (anti-farm counters), `eqStyle`, `petName`, `sprintBest`, name.
- `space_quest_mastery_v1` — `{facts:{key:{a,c,t}}, modes:{tag:{a,c,t}}}`.
- `space_quest_pokedex_v1` — array of caught ids.
- `space_quest_high_score`, `space_quest_tests_completed`, `space_quest_unlocked_badges`.

When adding a per-player key, add it to `PLAYER_KEYS` in `players.js` (migration + delete-player cleanup).

## How to add a new planet (the recurring task)

1. Question builder (new file or `story.js`-style) returning `{op, html|num1/num2, promptText, expected, teach, choices?}`. `choices` → tap buttons; otherwise numpad via prompt-display.
2. `gameState.<op>Level` default in `app.js`.
3. Setup screen: op tab button + `config-<op>` card in `index.html`; wire in `initSetupUI` (config const, hide-all line, tab branch, level-button binding).
4. `generateQuestions()` branch.
5. If prompt-based: add op to the three lists (`loadQuestion` prompt branch condition, `updateAnswerDisplay`, `submitAnswer` displayId) + `promptSpeech`.
6. `getTimeLimit()` + `currentLevelTag()` entries in `app.js`.
7. `progression.js`: `PLANETS` entry, `applyLevel`, `keyFromState`, `MODE_NAMES`.
8. Update the static stars total in galaxy HTML (`🌟 0 / N stars`, N = totalLevels×3) — `renderGalaxy` recomputes it anyway.
9. Optional badge: `BADGES` entry + condition in `checkAndUnlockBadges`.
10. Review-list display branch in `endGame` if the op isn't covered.

## Gotchas (each of these bit us once)

- **`.screen` is `display:flex` row** — new screens need `flex-direction: column` (see `enhancements.css`).
- **Duplicate SVG ids across instances**: gradients resolve to the first document occurrence; if that copy is inside a `display:none` screen the fill silently doesn't render. `mascotSVG(uid)` exists for this reason.
- **The numpad has no decimal point** — money problems use whole cents/dollars; max answer length is 4 digits.
- **Eighth notes are 0.5 beats** — music questions only ever ask integer answers (ratios, not beat-values, for eighths).
- **Preview screenshots take ~4s** — longer than teaching pauses (3.4–3.6s); verify transient UI synchronously via `preview_eval` after calling `handleKeyPress(...)` (submit runs synchronously; advance is on a timeout).
- **`Date`/profile gotcha**: streak dates are local (`dateStr()` builds YYYY-MM-DD manually, not `toISOString`).
- **`loadProfile` merges `DEFAULT_PROFILE`** — new free shop items must be pushed into `owned` for pre-existing profiles (see the `['classic','default','none']` normalization).
- **`formula.innerText = ...` overwrites children** — append/prepend decorations after the branch chain in the review list.
- **PokeAPI sprites need internet** — fine (fonts are remote too), but don't add features assuming offline.

## ⚠️ Legal / monetisation status

The Poké Galaxy uses Nintendo-owned names and artwork. Acceptable as a private family project; **must be removed or reskinned with original creatures before any monetisation** (owner has been advised; he's aware). "Space Quest" is also a Sierra trademark — rename for any commercial release. Monetisation discussion (June 2026): recommended path = donations link first for signal, then app-store wrap (Capacitor/TWA, one-time purchase) if traction. No ads (kids' privacy regs + design principle).

## Current state & known opportunities

Everything described above is **built, browser-verified, and deployed** (HEAD: profile editing, `f9a2971`). Not built / discussed ideas:
- Co-op family goals (explicitly avoid competitive leaderboards).
- Per-table sprint bests (current Lightning Round best is global, tables 2–12).
- Teacher/classroom features (dashboard exists for parents only, behind a multiplication gate).
- "Tricky facts" on-demand practice button (mastery data already supports it).
- Editing non-active players' profiles (deliberately scoped out — prevents sibling mischief).
- PWA manifest/service worker (would also be step 1 of app-store wrapping).

## Working with the owner

- He says "go for it / all of them" — build the full scope, verify in the browser preview, then commit & push (Pages auto-deploys); summaries should lead with what the kids will experience.
- Persistent agent memory about this project lives in the ibkr-dashboard project's memory dir (`space-quest-game.md`).
