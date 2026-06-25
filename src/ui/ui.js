// HTML UI layer: dialogue, questions, journal, HUD, toasts, and celebrations.
// Everything resolves promises so chapter scripts read like storybooks:
//   await ui.dialogue([...]); await ui.askQuestion(...); ...
import { loadSave, save, oopsLimit } from '../save.js';
import { recordAnswer, journalHintFor } from '../edu/engine.js';
import { speak, stopSpeaking } from '../speech.js';
import { sfx } from '../audio.js';
import { CARDS, CLUES } from '../content.js';
import { SCIENCE_BANK } from '../edu/science.js';
import { openSuitLab } from './suit.js';

const root = () => document.getElementById('ui');

export const SPEAKERS = {
  bolt:   { name: 'Bolt', face: '🤖' },
  luma:   { name: 'Luma', face: '🌟' },
  player: { name: 'You', face: '🧑‍🚀' },
  ember:  { name: 'Ember', face: '🔴' },
  keeper: { name: 'Lantern Keeper', face: '🏮' },
  smelt:  { name: 'Smelt', face: '⛏️' },
  tick:   { name: 'Tick', face: '🗼' },
  lyra:   { name: 'Nana Lyra', face: '✨' },
  gate:   { name: 'The Star Gate', face: '🌀' },
  solari: { name: 'Solari', face: '👽' },
  sola:   { name: 'Elder Sola', face: '👽' },
  pip:    { name: 'Pip', face: '🐚' },
  astra:  { name: 'Astra', face: '🔭' },
  vega:   { name: 'Captain Vega', face: '🚀' },
  rusty:  { name: 'Rusty', face: '🤖' },
  keystone: { name: 'The Keystone', face: '🗝️' },
  glyphs: { name: 'Ancient Glyphs', face: '📜' },
  radio:  { name: 'Ship Radio', face: '📻' },
  signal: { name: 'The Signal', face: '📡' },
  mission: { name: 'Mission Control', face: '🛰️' },
  architect: { name: 'The Architects', face: '👽' },
  sunweaver: { name: 'Sun-Weaver', face: '☀️' },
  machine: { name: 'The Machine Mind', face: '🤖' },
  family: { name: 'Home', face: '🏡' },
  classmate: { name: 'Classmate', face: '🧒' },
  teacher: { name: 'Teacher', face: '👩‍🏫' }
};

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setMultiline(node, text) {
  node.textContent = '';
  String(text).split('\n').forEach((line, i) => {
    if (i) node.appendChild(document.createElement('br'));
    node.appendChild(document.createTextNode(line));
  });
}

/* ================= HUD ================= */

let hudEls = null;

export function buildHUD(game) {
  const hud = el('div');
  hud.id = 'hud';

  const left = el('div', 'hud-group');
  const beacons = el('div', 'hud-pill');
  beacons.append('🕵️', el('span', '', '0'));   // mystery clues discovered
  beacons.title = 'Story clues discovered';
  const bits = el('div', 'hud-pill');
  bits.append('⭐', el('span', '', '0'));
  // "Oops meter": this many wrong answers anywhere in the game bounce the player back one planet.
  const strikes = el('div', 'hud-pill strikes-pill');
  strikes.title = 'Oops meter — too many wrong answers and we zoom back a planet to practice';
  const strikeDots = Array.from({ length: oopsLimit() }, () => el('span', 'strike-dot'));
  strikes.append('💭', ...strikeDots);
  left.append(beacons, bits, strikes);

  const right = el('div', 'hud-group');
  const suitBtn = el('button', 'hud-btn', '🧰');
  suitBtn.title = 'Suit Lab — spend your stars on ship upgrades';
  suitBtn.onclick = () => { sfx.open(); openSuitLab(() => refreshHUD()); };
  const journalBtn = el('button', 'hud-btn', '📔');
  journalBtn.title = 'Star Journal';
  journalBtn.onclick = () => { sfx.open(); showJournal(); };
  const gear = el('button', 'hud-btn', '⚙️');
  let holdTimer = null;
  const startHold = () => { holdTimer = setTimeout(() => game.openParentZone(), 1500); };
  const cancelHold = () => clearTimeout(holdTimer);
  gear.addEventListener('pointerdown', startHold);
  gear.addEventListener('pointerup', cancelHold);
  gear.addEventListener('pointerleave', cancelHold);
  right.append(suitBtn, journalBtn, gear);

  hud.append(left, right);
  root().appendChild(hud);

  const objective = el('div');
  objective.id = 'objective-banner';
  objective.style.display = 'none';
  root().appendChild(objective);

  const toasts = el('div');
  toasts.id = 'toast-wrap';
  root().appendChild(toasts);

  const fade = el('div', 'fade-overlay');
  root().appendChild(fade);

  hudEls = { hud, beacons: beacons.lastChild, bits: bits.lastChild, strikes, strikeDots, objective, toasts, fade };
  refreshHUD();
}

export function refreshHUD() {
  if (!hudEls) return;
  const s = loadSave();
  hudEls.beacons.textContent = String(s.clues.length);
  hudEls.bits.textContent = String(s.starBits);
  // rebuild the dot row if the parent changed the oops limit
  const limit = oopsLimit();
  if (hudEls.strikeDots.length !== limit) {
    hudEls.strikes.querySelectorAll('.strike-dot').forEach((d) => d.remove());
    hudEls.strikeDots = Array.from({ length: limit }, () => el('span', 'strike-dot'));
    hudEls.strikes.append(...hudEls.strikeDots);
  }
  const miss = s.missCount || 0;
  hudEls.strikeDots.forEach((d, i) => d.classList.toggle('filled', i < miss));
}

/** Thrown out of askQuestion when the 3rd cumulative miss should send the player back a planet. */
export class DemotionSignal extends Error {
  constructor() { super('demote'); this.name = 'DemotionSignal'; }
}

/** Animate the oops meter clearing after a reset. */
function flashOopsReset() {
  if (!hudEls) return;
  hudEls.strikes.classList.add('eased');
  setTimeout(() => hudEls.strikes.classList.remove('eased'), 1200);
}

export function setObjective(text) {
  if (!hudEls) return;
  hudEls.objective.style.display = text ? '' : 'none';
  hudEls.objective.textContent = text || '';
}

export function setHUDVisible(visible) {
  if (hudEls) hudEls.hud.style.display = visible ? '' : 'none';
}

export function toast(text, gold = false) {
  const t = el('div', 'toast' + (gold ? ' gold' : ''), text);
  hudEls.toasts.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

export function fade(on) {
  hudEls.fade.classList.toggle('on', on);
  return new Promise((res) => setTimeout(res, 650));
}

export function isFaded() {
  return !!hudEls?.fade.classList.contains('on');
}

/* ================= dialogue ================= */

export function dialogue(lines) {
  return new Promise((resolve) => {
    const s = loadSave();
    const box = el('div');
    box.id = 'dialogue';

    const head = el('div', 'speaker');
    const portrait = el('div', 'portrait');
    const name = el('div', 'speaker-name');
    const speakBtn = el('button', 'speak-btn', '🔊');
    head.append(portrait, name, speakBtn);

    const text = el('div', 'dlg-text');
    const actions = el('div', 'dlg-actions');
    const next = el('button', 'dlg-btn primary', 'NEXT ▸');
    actions.append(next);
    box.append(head, text, actions);
    root().appendChild(box);

    let i = 0;
    let typer = null;

    const show = () => {
      const line = lines[i];
      const who = SPEAKERS[line.who] || SPEAKERS.bolt;
      portrait.textContent = who.face;
      name.textContent = line.who === 'player' ? (s.name || 'You') : who.name;
      // Bolt's fact-checker: lines can carry stamp: 'real' | 'magic'
      const stampEl = head.querySelector('.fact-stamp');
      if (stampEl) stampEl.remove();
      if (line.stamp) {
        const st = el('span', 'fact-stamp ' + line.stamp, line.stamp === 'real' ? '🔬 REAL SCIENCE' : '✨ STORY MAGIC');
        head.insertBefore(st, speakBtn);
      }
      const full = line.text;
      // typewriter
      clearInterval(typer);
      let chars = 0;
      setMultiline(text, '');
      typer = setInterval(() => {
        chars += 2;
        setMultiline(text, full.slice(0, chars));
        if (chars >= full.length) clearInterval(typer);
      }, 16);
      next.textContent = i === lines.length - 1 ? 'OK ✔' : 'NEXT ▸';
      speakBtn.onclick = () => speak(full);
    };

    next.onclick = () => {
      if (i >= lines.length) return;   // guard against rapid double-taps on the last line
      sfx.tap();
      stopSpeaking();
      const full = lines[i].text;
      // first tap finishes the typewriter, second advances
      if (text.textContent.length < full.length) {
        clearInterval(typer);
        setMultiline(text, full);
        return;
      }
      i++;
      if (i >= lines.length) {
        box.remove();
        resolve();
      } else {
        show();
      }
    };

    show();
  });
}

/* ================= questions ================= */

/**
 * Ask a question. Kid-friendly rules: wrong answers never end anything —
 * Bolt explains, a Star Journal memory is written, and they try again until
 * they get it. Mastery only counts the FIRST attempt.
 * Resolves { firstTry: boolean }.
 */
export function askQuestion(question, { contextLabel = 'BOLT NEEDS YOUR HELP', icon = '🤖', gauge = null } = {}) {
  window.__lastQuestion = question;   // automation/test hook (like window.__drumExpected)
  return new Promise((resolve, reject) => {
    let demote = false;   // set when the 3rd cumulative miss should bounce us back a planet
    const panel = el('div');
    panel.id = 'question-panel';

    const ctx = el('div', 'q-context');
    ctx.append(el('span', '', icon), el('span', '', contextLabel));
    const speakBtn = el('button', 'speak-btn', '🔊');
    ctx.appendChild(speakBtn);
    panel.appendChild(ctx);

    let gaugeFill, gaugeIcon;
    if (gauge) {
      const wrap = el('div', 'q-gauge');
      const track = el('div', 'q-gauge-track');
      gaugeFill = el('div', 'q-gauge-fill');
      gaugeFill.style.width = `${Math.round((gauge.current / gauge.total) * 100)}%`;
      track.appendChild(gaugeFill);
      gaugeIcon = el('span', 'q-gauge-icon', gauge.icon || '⛽');
      wrap.append(track, gaugeIcon);
      panel.appendChild(wrap);
    }

    if (question.passage) {
      const p = el('div', 'q-passage');
      if (question.passageTitle) p.appendChild(el('div', 'q-passage-title', '📜 ' + question.passageTitle));
      const body = el('div');
      setMultiline(body, question.passage);
      p.appendChild(body);
      panel.appendChild(p);
    }

    const prompt = el('div', 'q-prompt');
    setMultiline(prompt, question.prompt);
    panel.appendChild(prompt);

    const longOptions = question.options.some((o) => String(o).length > 14);
    const grid = el('div', 'q-options' + (longOptions ? ' single-col' : ''));
    panel.appendChild(grid);

    const footer = el('div', 'q-footer');
    const feedback = el('div', 'q-feedback');
    const hintBtn = el('button', 'hint-btn', '📔 Star Journal hint');
    const goBtn = el('button', 'dlg-btn primary', 'GO! ▸');
    goBtn.style.display = 'none';
    footer.append(feedback, hintBtn, goBtn);
    panel.appendChild(footer);

    const updateHint = () => {
      const entry = journalHintFor(question);
      hintBtn.style.display = entry ? '' : 'none';
      hintBtn.classList.toggle('glow', !!entry);
      hintBtn.onclick = () => { sfx.open(); showJournal('tricky', question.concept); };
    };
    updateHint();

    speakBtn.onclick = () => {
      const parts = [];
      if (question.passage) parts.push(question.passage);
      parts.push(question.prompt.replace(/\n/g, '. '));
      parts.push('Is it... ' + question.options.join('? ... or ... ') + '?');
      speak(parts.join(' ... '));
    };

    let attempted = false;
    let firstTry = true;
    let solved = false;

    question.options.forEach((opt) => {
      const btn = el('button', 'q-opt', String(opt));
      btn.onclick = () => {
        if (solved) return;
        const correct = String(opt) === String(question.answer);
        if (!attempted) {
          attempted = true;
          recordAnswer(question, correct);
          refreshHUD();
          // a wrong answer that leaves the tally at 0 means it just hit 3 and reset
          if (!correct && (loadSave().missCount || 0) === 0) {
            flashOopsReset();
            if ((loadSave().chapter || 0) > 0) {   // past the first planet: bounce back one after this question
              demote = true;
              toast('Oops meter full! We\'ll pop back a planet to practice. 🚀', true);
            } else {
              toast('Take your time — you\'ve got this! 💪', true);
            }
          }
        }
        if (correct) {
          solved = true;
          sfx.correct();
          btn.classList.add('correct');
          grid.querySelectorAll('button').forEach((b) => (b.disabled = true));
          feedback.className = 'q-feedback good';
          feedback.textContent = (firstTry ? '🎉 Amazing! ' : '⭐ You got it! ') + question.explain;
          hintBtn.style.display = 'none';
          goBtn.style.display = '';
          if (gaugeFill) {
            requestAnimationFrame(() => {
              gaugeFill.style.width = `${Math.round(((gauge.current + 1) / gauge.total) * 100)}%`;
              gaugeFill.classList.add('glowing');
              gaugeIcon.classList.add('bump');
            });
          }
          goBtn.onclick = () => {
            stopSpeaking();
            panel.remove();
            if (demote) reject(new DemotionSignal());
            else resolve({ firstTry });
          };
        } else {
          firstTry = false;
          sfx.wrong();
          btn.classList.add('wrong');
          btn.disabled = true;
          feedback.className = 'q-feedback bad';
          feedback.textContent = pickEncouragement();
          updateHint();   // a journal memory now exists — make the hint glow
        }
      };
      grid.appendChild(btn);
    });

    root().appendChild(panel);
  });
}

const ENCOURAGEMENTS = [
  'Almost! Astronauts always try again. 🚀',
  'Not quite — check the Star Journal hint!',
  'So close! Take another look. 🔭',
  'Every scientist makes guesses. Try again!'
];
function pickEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

/* ================= Star Journal ================= */

export function showJournal(tab = 'tricky', highlightConcept = null) {
  const s = loadSave();
  const existing = document.getElementById('journal');
  if (existing) existing.remove();

  const j = el('div');
  j.id = 'journal';

  const head = el('div', 'j-head');
  head.append(el('span', '', '📔'), el('h2', '', "Bolt's Star Journal"));
  const close = el('button', 'hud-btn', '✖');
  close.onclick = () => { sfx.tap(); j.remove(); };
  head.appendChild(close);
  j.appendChild(head);

  const tabs = el('div', 'j-tabs');
  const body = el('div', 'j-body');
  const TABS = [
    ['tricky', '🧠 Tricky Ones'],
    ['facts', '🔭 Space Facts'],
    ['cards', '👽 Crew Cards'],
    ['clues', '🕵️ Mystery Clues']
  ];
  const render = (which) => {
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === which));
    body.textContent = '';

    if (which === 'tricky') {
      if (!s.journal.length) {
        body.appendChild(el('div', 'j-empty', 'No tricky questions yet!\nWhen one stumps you, Bolt writes it here so you can learn it.'));
        return;
      }
      for (const entry of s.journal) {
        const card = el('div', 'j-entry' + (entry.concept === highlightConcept ? ' highlight' : ''));
        const q = el('div', 'j-q');
        setMultiline(q, '❓ ' + entry.question);
        card.appendChild(q);
        card.appendChild(el('div', 'j-a', '✅ Answer: ' + entry.answer));
        card.appendChild(el('div', 'j-why', '💡 ' + entry.explain));
        const sp = el('button', 'speak-btn', '🔊');
        sp.style.marginTop = '6px';
        sp.onclick = () => speak(`${entry.question.replace(/\n/g, '. ')}. The answer is ${entry.answer}. ${entry.explain}`);
        card.appendChild(sp);
        body.appendChild(card);
        if (entry.concept === highlightConcept) setTimeout(() => card.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60);
      }
    } else if (which === 'facts') {
      const facts = s.factsLearned.map((id) => SCIENCE_BANK.find((x) => x.id === id)).filter(Boolean);
      if (!facts.length) {
        body.appendChild(el('div', 'j-empty', 'Answer space questions on your adventure\nand the facts you learn will collect here!'));
        return;
      }
      for (const f of facts) {
        const card = el('div', 'j-entry');
        const head2 = el('div', 'j-q', '🔭 ' + f.prompt);
        card.appendChild(head2);
        card.appendChild(el('div', 'j-a', '✅ ' + f.answer));
        card.appendChild(el('div', 'j-why', '💡 ' + f.explain));
        card.appendChild(el('div', 'fact-stamp real', '🔬 REAL SCIENCE'));
        body.appendChild(card);
      }
    } else if (which === 'cards') {
      const grid = el('div', 'card-grid');
      for (const c of CARDS) {
        const owned = s.cards.includes(c.id);
        const card = el('div', 'alien-card' + (owned ? '' : ' locked'));
        card.appendChild(el('div', 'face', owned ? c.face : '❓'));
        card.appendChild(el('div', 'nm', owned ? c.name : '???'));
        card.appendChild(el('div', 'desc', owned ? c.desc : 'Keep exploring to meet this friend!'));
        grid.appendChild(card);
      }
      body.appendChild(grid);
    } else if (which === 'clues') {
      const collected = s.clues.map((id) => CLUES[id]).filter(Boolean);
      if (!collected.length) {
        body.appendChild(el('div', 'j-empty', 'A mysterious signal is calling from the dark...\nClues you discover will be pinned here.'));
        return;
      }
      for (const c of collected) {
        const card = el('div', 'j-entry');
        card.appendChild(el('div', 'j-q', c.icon + ' ' + c.title));
        card.appendChild(el('div', 'j-why', c.text));
        body.appendChild(card);
      }
      const remaining = Object.keys(CLUES).length - collected.length;
      if (remaining > 0) body.appendChild(el('div', 'j-empty', `${remaining} more clue${remaining > 1 ? 's' : ''} out there...`));
    }
  };

  for (const [id, label] of TABS) {
    const b = el('button', 'j-tab', label);
    b.dataset.tab = id;
    b.onclick = () => { sfx.tap(); render(id); };
    tabs.appendChild(b);
  }
  j.append(tabs, body);
  root().appendChild(j);
  render(tab);
}

/* ================= big moments ================= */

export function chapterCard(num, name, sub) {
  return new Promise((resolve) => {
    const screen = el('div', 'screen dim');
    const card = el('div', 'chapter-card');
    card.appendChild(el('div', 'ch-num', `Chapter ${num}`));
    card.appendChild(el('div', 'ch-name', name));
    card.appendChild(el('div', 'ch-sub', sub));
    screen.appendChild(card);
    root().appendChild(screen);
    sfx.whoosh();
    setTimeout(() => { screen.remove(); resolve(); }, 2600);
  });
}

export function rewardBurst(icon, title, sub) {
  return new Promise((resolve) => {
    const screen = el('div', 'screen dim');
    const burst = el('div', 'reward-burst');
    burst.appendChild(el('div', 'rb-icon', icon));
    burst.appendChild(el('div', 'rb-title', title));
    if (sub) burst.appendChild(el('div', 'rb-sub', sub));
    const btn = el('button', 'big-btn', 'AWESOME!');
    btn.style.marginTop = '22px';
    btn.onclick = () => { sfx.tap(); screen.remove(); resolve(); };
    burst.appendChild(btn);
    screen.appendChild(burst);
    root().appendChild(screen);
  });
}

/* ================= title & name entry ================= */

export function titleScreen(hasSave, greeting = null) {
  return new Promise((resolve) => {
    const screen = el('div', 'screen');
    screen.style.justifyContent = 'center';
    const logo = el('div', 'title-logo');
    logo.append('MISSION:', document.createElement('br'), 'STARLIGHT 5');
    const sub = el('div', 'title-sub', 'The Lighthouse at the Edge of Time');
    const play = el('button', 'big-btn', hasSave ? '▶ CONTINUE' : '▶ START MISSION');
    play.onclick = () => { sfx.fanfare(); screen.remove(); resolve('play'); };
    screen.append(logo, sub);
    if (greeting) screen.appendChild(el('div', 'title-greeting', greeting));
    screen.appendChild(play);
    if (hasSave) {
      const fresh = el('button', 'dlg-btn', 'New Game');
      fresh.onclick = () => { sfx.tap(); screen.remove(); resolve('new'); };
      screen.append(fresh);
    }
    screen.appendChild(el('div', 'small-note', 'Race the light, bend time, and save the Earth'));
    root().appendChild(screen);
  });
}

export function nameEntry(suggestedName = '') {
  return new Promise((resolve) => {
    const screen = el('div', 'screen dim name-entry');
    screen.appendChild(el('div', 'title-sub', 'Welcome back to the Space Cadets!'));
    const h = el('h2', '', 'What is your name, Cadet?');
    h.style.fontSize = 'clamp(22px, 4vw, 34px)';
    const input = el('input');
    input.maxLength = 14;
    input.placeholder = 'Type your name';
    if (suggestedName) input.value = suggestedName;
    const ok = el('button', 'big-btn cyan', 'BLAST OFF! 🚀');
    ok.onclick = () => {
      const name = input.value.trim();
      if (!name) { input.placeholder = 'Cadets need names!'; return; }
      sfx.fanfare();
      screen.remove();
      resolve(name.charAt(0).toUpperCase() + name.slice(1));
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click(); });
    screen.append(h, input, ok);
    root().appendChild(screen);
    setTimeout(() => input.focus(), 100);
  });
}

/* ================= shared helpers for chapters ================= */

export function giveCard(cardId) {
  const s = loadSave();
  if (s.cards.includes(cardId)) return Promise.resolve();
  s.cards.push(cardId);
  save();
  const c = CARDS.find((x) => x.id === cardId);
  sfx.collect();
  refreshHUD();
  return rewardBurst(c.face, `New Crew Card: ${c.name}!`, c.desc);
}

export function giveClue(clueId) {
  const s = loadSave();
  if (s.clues.includes(clueId)) return Promise.resolve();
  s.clues.push(clueId);
  save();
  const c = CLUES[clueId];
  sfx.open();
  return rewardBurst(c.icon, `Mystery Clue: ${c.title}`, c.text + '\n(Pinned in your Star Journal 🕵️)');
}

/** Collect a Mars sample (+1 HUD rock, +stars to spend in the Suit Lab). */
export function giveSample(what, starReward = 2) {
  const s = loadSave();
  s.samples = (s.samples || 0) + 1;
  s.starBits += starReward;
  save();
  refreshHUD();
  sfx.shard();
  return rewardBurst('🪨', `Sample collected: ${what}!`, `That's ${s.samples} Mars sample${s.samples > 1 ? 's' : ''}. Earned ⭐${starReward} — spend them in the Suit Lab! 🧰`);
}

export function countJump() {
  const s = loadSave();
  s.jumps++;
  save();
}

export function addStarBits(n) {
  const s = loadSave();
  s.starBits += n;
  save();
  refreshHUD();
  // quick HUD pulse instead of a screen-blocking toast (used during driving/flight)
  if (hudEls?.bits?.parentElement) {
    const pill = hudEls.bits.parentElement;
    pill.classList.remove('pulse');
    void pill.offsetWidth;        // restart the animation
    pill.classList.add('pulse');
  }
}
