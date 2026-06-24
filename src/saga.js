// The "Saga" — a small shared save (same github.io origin) that tracks the
// grand-prize progress across ALL Mission: Starlight games. Finishing any one
// game's story collects one of five pieces toward a single big family reward.
const KEY = 'mission-starlight-saga-v1';

export const SAGA_GAMES = [
  { id: 'game1', name: 'Mission: Starlight' },
  { id: 'game2', name: 'Mission: Starlight 2' },
  { id: 'game3', name: 'Mission: Starlight 3' },
  { id: 'game4', name: 'Mission: Starlight 4' },
  { id: 'game5', name: 'Mission: Starlight 5' }
];

function defaultSaga() {
  return { pieces: {}, reward: 'A big family trip (Sky Zone or Hyper Kidz)' };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? Object.assign(defaultSaga(), JSON.parse(raw)) : defaultSaga();
  } catch {
    return defaultSaga();
  }
}

function persist(saga) {
  try { localStorage.setItem(KEY, JSON.stringify(saga)); } catch { /* storage full/blocked */ }
}

/** Mark this game's piece collected. Idempotent. */
export function collectSagaPiece(gameId) {
  const saga = load();
  if (saga.pieces[gameId]) return;
  saga.pieces[gameId] = true;
  persist(saga);
}

/** { count, total, reward, pieces } for the Parent Zone grand-prize panel. */
export function sagaStatus() {
  const saga = load();
  return {
    count: SAGA_GAMES.filter((g) => saga.pieces[g.id]).length,
    total: SAGA_GAMES.length,
    reward: saga.reward,
    pieces: saga.pieces
  };
}

export function setSagaReward(text) {
  const saga = load();
  saga.reward = text;
  persist(saga);
}
