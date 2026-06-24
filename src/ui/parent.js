// Parent Zone: hold the gear button, pass an adult math gate, and you get a
// progress dashboard, real-world prize configuration, and game settings.
import { loadSave, save, resetSave, oopsLimit, setOopsLimit, OOPS_LIMIT_RANGE } from '../save.js';
import { skillReport } from '../edu/engine.js';
import { BADGES, CARDS, CLUES } from '../content.js';
import { setMusicOn } from '../audio.js';
import { SAGA_GAMES, sagaStatus, setSagaReward } from '../saga.js';
import { refreshHUD } from './ui.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function openParentZone(game, onReset) {
  if (document.getElementById('parent-zone') || document.getElementById('pz-gate')) return;

  // adult gate: a multiplication no 1st-grader will brute-force
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 13 + Math.floor(Math.random() * 9);
  const gate = el('div', 'screen dim');
  gate.id = 'pz-gate';
  gate.style.zIndex = 89;
  const card = el('div', 'name-entry');
  card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;';
  card.appendChild(el('h2', '', `Grown-ups only! What is ${a} × ${b}?`));
  const input = el('input');
  input.type = 'number';
  input.inputMode = 'numeric';
  const row = el('div', 'pz-row-btns');
  const go = el('button', 'big-btn cyan', 'ENTER');
  const cancel = el('button', 'dlg-btn', 'Back to the game');
  cancel.onclick = () => gate.remove();
  go.onclick = () => {
    if (parseInt(input.value, 10) === a * b) { gate.remove(); show(); }
    else { input.value = ''; input.placeholder = 'Not quite...'; }
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
  row.append(go, cancel);
  card.append(input, row);
  gate.appendChild(card);
  document.getElementById('ui').appendChild(gate);
  setTimeout(() => input.focus(), 80);

  const show = () => buildZone(game, onReset);
}

function buildZone(game, onReset) {
  const s = loadSave();
  const zone = el('div');
  zone.id = 'parent-zone';

  const head = el('div', 'pz-head');
  head.append(el('span', '', '👨‍🚀'), el('h2', '', `Parent Zone — ${s.name || 'Cadet'}'s Mission Progress`));
  const close = el('button', 'hud-btn', '✖');
  close.onclick = () => zone.remove();
  head.appendChild(close);
  zone.appendChild(head);

  const body = el('div', 'pz-body');
  zone.appendChild(body);

  /* ---- overview ---- */
  const overview = el('div', 'pz-section');
  overview.appendChild(el('h3', '', '📊 OVERVIEW'));
  const chapterNames = ['Homecoming', 'Into the Starbow', 'The Pulsar Lighthouse', 'The Architects', 'The Dyson Sphere', 'The Machine Mind', 'The Long Build', 'The Great Deflector', 'Turn the Beam', 'The Long Way Home', 'Story complete! 🎉'];
  overview.appendChild(el('div', 'skill-row', `Story progress: ${chapterNames[Math.min(s.chapter, 10)]} (chapter ${Math.min(s.chapter + 1, 10)} of 10)`));
  overview.appendChild(el('div', 'skill-row', `⭐ Stars: ${s.starBits} · 🌀 Jumps: ${s.jumps} · 👽 Crew cards: ${s.cards.length}/${CARDS.length} · 🕵️ Clues: ${s.clues.length}/${Object.keys(CLUES).length}`));
  body.appendChild(overview);

  /* ---- skills dashboard ---- */
  const skills = el('div', 'pz-section');
  skills.appendChild(el('h3', '', '🧠 SKILLS (sorted: most help needed first)'));
  const rows = skillReport();
  if (!rows.length) skills.appendChild(el('div', 'skill-row', 'No questions answered yet.'));
  for (const r of rows) {
    const row = el('div', 'skill-row');
    row.appendChild(el('div', 'sk-name', `${r.icon} ${r.name}`));
    const bar = el('div', 'sk-bar');
    const fill = el('div', 'sk-fill');
    fill.style.width = r.pct + '%';
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(el('div', 'sk-pct', `${r.pct}% · Lv ${r.level} · ${r.correct}/${r.total}`));
    skills.appendChild(row);
  }
  body.appendChild(skills);

  /* ---- recent struggles ---- */
  const tricky = el('div', 'pz-section');
  tricky.appendChild(el('h3', '', '📔 RECENTLY MISSED (what to practice at dinner)'));
  if (!s.journal.length) tricky.appendChild(el('div', 'skill-row', 'Nothing missed yet!'));
  for (const entry of s.journal.slice(0, 6)) {
    const row = el('div', 'j-entry');
    row.appendChild(el('div', 'j-q', entry.question.replace(/\n/g, ' — ') + `  (missed ×${entry.misses})`));
    row.appendChild(el('div', 'j-a', 'Answer: ' + entry.answer));
    tricky.appendChild(row);
  }
  body.appendChild(tricky);

  /* ---- grand prize saga (shared across all 5 games) ---- */
  const saga = el('div', 'pz-section');
  saga.appendChild(el('h3', '', '🏆 GRAND PRIZE SAGA'));
  const piecesRow = el('div', 'saga-pieces');
  for (const g of SAGA_GAMES) {
    const status = sagaStatus();
    const piece = el('div', 'saga-piece' + (status.pieces[g.id] ? ' got' : ''));
    piece.textContent = status.pieces[g.id] ? '🧩' : '·';
    piece.title = g.name;
    piecesRow.appendChild(piece);
  }
  saga.appendChild(piecesRow);
  const status = sagaStatus();
  saga.appendChild(el('div', 'skill-row', `${status.count} of ${status.total} pieces collected — finish each Mission: Starlight game to earn a piece!`));
  const rewardRow = el('div', 'saga-reward-row');
  rewardRow.appendChild(el('div', 'pr-milestone', 'Grand Prize (when all 5 are collected):'));
  const rewardInput = el('input');
  rewardInput.value = status.reward;
  rewardInput.onchange = () => setSagaReward(rewardInput.value);
  rewardRow.appendChild(rewardInput);
  saga.appendChild(rewardRow);
  body.appendChild(saga);

  /* ---- real-world prizes ---- */
  const prizes = el('div', 'pz-section');
  prizes.appendChild(el('h3', '', '🎁 REAL-WORLD PRIZES (edit the reward text — ✅ means earned)'));
  for (const p of s.parent.prizes) {
    const row = el('div', 'prize-row');
    const badge = BADGES.find((x) => x.id === p.milestone);
    const earned = badge ? badge.test(s) : false;
    row.appendChild(el('div', 'pr-status', earned ? '✅' : '⬜'));
    row.appendChild(el('div', 'pr-milestone', p.label));
    const input = el('input');
    input.value = p.reward;
    input.onchange = () => { p.reward = input.value; save(); };
    row.appendChild(input);
    prizes.appendChild(row);
  }
  body.appendChild(prizes);

  /* ---- settings ---- */
  const settings = el('div', 'pz-section');
  settings.appendChild(el('h3', '', '⚙️ SETTINGS'));
  const btns = el('div', 'pz-row-btns');

  const diffBtn = el('button', 'pz-btn');
  const diffLabel = () => `Difficulty: ${['Easier', 'Normal', 'Harder'][(s.parent.difficultyOffset || 0) + 1]}`;
  diffBtn.textContent = diffLabel();
  diffBtn.onclick = () => {
    s.parent.difficultyOffset = ((s.parent.difficultyOffset || 0) + 2) % 3 - 1;
    save();
    diffBtn.textContent = diffLabel();
  };

  const gfxBtn = el('button', 'pz-btn');
  const gfxLabel = () => `Graphics: ${{ auto: 'Auto', high: 'High', low: 'Lite' }[s.parent.quality || 'auto']}`;
  gfxBtn.textContent = gfxLabel();
  gfxBtn.onclick = () => {
    const order = ['auto', 'high', 'low'];
    const next = order[(order.indexOf(s.parent.quality || 'auto') + 1) % 3];
    game.pipeline.setQualityPref(next);
    gfxBtn.textContent = gfxLabel();
  };

  // how many wrong answers (game-wide) bounce the player back a planet — higher = more forgiving
  const oopsBtn = el('button', 'pz-btn');
  const oopsLabel = () => `Go back after: ${oopsLimit()} wrong`;
  oopsBtn.textContent = oopsLabel();
  oopsBtn.onclick = () => {
    const idx = OOPS_LIMIT_RANGE.indexOf(oopsLimit());
    setOopsLimit(OOPS_LIMIT_RANGE[(idx + 1) % OOPS_LIMIT_RANGE.length]);
    oopsBtn.textContent = oopsLabel();
    refreshHUD();   // re-render the HUD dot row to the new count
  };

  const sndBtn = el('button', 'pz-btn', `Sound FX: ${s.parent.soundOn ? 'ON' : 'OFF'}`);
  sndBtn.onclick = () => { s.parent.soundOn = !s.parent.soundOn; save(); sndBtn.textContent = `Sound FX: ${s.parent.soundOn ? 'ON' : 'OFF'}`; };

  const musBtn = el('button', 'pz-btn', `Music: ${s.parent.musicOn ? 'ON' : 'OFF'}`);
  musBtn.onclick = () => { s.parent.musicOn = !s.parent.musicOn; save(); setMusicOn(s.parent.musicOn); musBtn.textContent = `Music: ${s.parent.musicOn ? 'ON' : 'OFF'}`; };

  const resetBtn = el('button', 'pz-btn danger', 'Reset ALL progress');
  let armed = false;
  resetBtn.onclick = () => {
    if (!armed) {
      armed = true;
      resetBtn.textContent = 'Tap again to ERASE EVERYTHING';
      setTimeout(() => { armed = false; resetBtn.textContent = 'Reset ALL progress'; }, 4000);
      return;
    }
    resetSave();
    zone.remove();
    onReset?.();
  };

  btns.append(diffBtn, oopsBtn, gfxBtn, sndBtn, musBtn, resetBtn);
  settings.appendChild(btns);
  body.appendChild(settings);

  document.getElementById('ui').appendChild(zone);
}
