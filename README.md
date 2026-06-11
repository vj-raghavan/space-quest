# Space Quest 🚀

A kid-friendly math game: multiplication, division, addition, subtraction, sequences, comparisons, analog clock reading, and fractions — all wrapped in a space adventure with Cosmo the mascot.

## How learning works

- **Adaptive practice** — every multiplication/division fact is tracked in `localStorage` (attempts, accuracy, response time). Question selection is weighted toward facts the player gets wrong or answers slowly.
- **Rematch round** — questions missed during a mission are re-asked at the end of the same round, so every mission ends on a win.
- **Teaching moments** — a wrong answer shows a short visual explanation (dot arrays for multiplication, decomposition hints for big numbers) before moving on.
- **Daily Mission + streak** — 5 questions picked from the player's weakest facts, with a streak counter and one forgiveness "shield" per week.

## Player profiles

Multiple kids can share one device: a "Who's playing?" picker at launch keeps each player's coins, stars, streaks, mastery data, badges, and high scores completely separate (`players.js`).

## Progression & motivation

- **Galaxy Map** — each skill is a planet with levels; earn up to 3 stars per level, 2 stars unlocks the next level.
- **Star Coins & Shop** — missions earn coins; spend them on rockets and rocket trails.
- **Badges, combos, high scores** — in-session rewards on top of long-term progression.
- **Grown-Up Zone** — parent dashboard (behind a multiplication gate 😉) with a multiplication mastery heatmap, weakest-facts list, and per-mode stats.

## Run it

```bash
node server.js
# open http://localhost:3000
```

No build step, no dependencies — plain HTML/CSS/JS. Game logic in `app.js`, adaptive mastery tracking in `mastery.js`, progression/galaxy/shop in `progression.js`.
