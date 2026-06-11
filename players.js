// --- Space Quest — Player Profiles ---
// Multiple kids, one device: each player gets their own coins, stars,
// streaks, mastery data, badges, and high score. All per-player
// localStorage keys are namespaced by player id via Players.key().
// This script must load BEFORE mastery.js / progression.js / app.js.

const Players = (() => {
  const REGISTRY_KEY = 'space_quest_players_v1';
  const AVATARS = ['🚀', '🦄', '🐉', '🤖', '🐱', '⚡', '🌟', '🦖', '🧜‍♀️', '🦊'];
  // Every per-player storage key in the game
  const PLAYER_KEYS = [
    'space_quest_profile_v1',
    'space_quest_mastery_v1',
    'space_quest_high_score',
    'space_quest_tests_completed',
    'space_quest_unlocked_badges'
  ];

  let registry = null;
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) registry = JSON.parse(raw);
  } catch (e) { registry = null; }

  // First run with profiles: adopt any existing un-namespaced data as player 1
  if (!registry || !registry.players || registry.players.length === 0) {
    const pid = 'p1';
    let migratedName = '';
    try {
      const oldProfile = JSON.parse(localStorage.getItem('space_quest_profile_v1'));
      if (oldProfile && oldProfile.name) migratedName = oldProfile.name;
    } catch (e) { /* no old profile */ }

    PLAYER_KEYS.forEach(base => {
      const val = localStorage.getItem(base);
      if (val !== null) {
        localStorage.setItem(`${base}:${pid}`, val);
        localStorage.removeItem(base);
      }
    });

    registry = { players: [{ id: pid, name: migratedName, avatar: '🚀' }], activeId: pid };
    save();
  }

  function save() {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }

  function key(base) {
    return `${base}:${registry.activeId}`;
  }

  function active() {
    return registry.players.find(p => p.id === registry.activeId) || registry.players[0];
  }

  function list() {
    return registry.players;
  }

  // Switching players reloads the page so every module re-reads the
  // new player's data — far simpler and safer than live re-init.
  function switchTo(id) {
    if (id === registry.activeId) return;
    if (!registry.players.some(p => p.id === id)) return;
    registry.activeId = id;
    save();
    location.reload();
  }

  function addPlayer(name, avatar) {
    const id = 'p' + Date.now();
    registry.players.push({ id, name: (name || '').trim().slice(0, 14), avatar: avatar || '🚀' });
    registry.activeId = id;
    save();
    location.reload();
  }

  function renameActive(name) {
    active().name = (name || '').trim().slice(0, 14);
    save();
  }

  function removePlayer(id) {
    if (registry.players.length <= 1) return;
    PLAYER_KEYS.forEach(base => localStorage.removeItem(`${base}:${id}`));
    registry.players = registry.players.filter(p => p.id !== id);
    if (registry.activeId === id) {
      registry.activeId = registry.players[0].id;
      save();
      location.reload();
    } else {
      save();
    }
  }

  return { key, active, list, switchTo, addPlayer, renameActive, removePlayer, AVATARS };
})();
