// The Suit Lab — a kid-facing shop where the cadet spends ⭐ stars on suit
// upgrades. Upgrades are gentle helpers (brighter lamp, faster boots, a clue
// scanner) plus a cosmetic recolor — never required to finish the game.
import { loadSave, SUIT_UPGRADES, hasUpgrade, buyUpgrade } from '../save.js';
import { sfx } from '../audio.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function openSuitLab(onChange) {
  if (document.getElementById('suit-lab')) return;
  const s = loadSave();

  const screen = el('div', 'screen dim');
  screen.id = 'suit-lab';
  const panel = el('div', 'suit-panel');

  const head = el('div', 'suit-head');
  head.append(el('span', '', '🧑‍🚀🧰'), el('h2', '', 'Suit Lab'));
  const stars = el('div', 'suit-stars');
  const renderStars = () => { stars.textContent = `⭐ ${loadSave().starBits}`; };
  renderStars();
  const close = el('button', 'hud-btn', '✖');
  close.onclick = () => { sfx.tap?.(); screen.remove(); };
  head.append(stars, close);
  panel.append(head);
  panel.append(el('div', 'suit-sub', 'Spend your stars on suit upgrades — they help you explore!'));

  const list = el('div', 'suit-list');
  for (const up of SUIT_UPGRADES) {
    const row = el('div', 'suit-row');
    row.append(el('div', 'suit-icon', up.icon));
    const info = el('div', 'suit-info');
    info.append(el('div', 'suit-name', up.name), el('div', 'suit-desc', up.desc));
    row.append(info);

    const btn = el('button', 'suit-buy');
    const refresh = () => {
      if (hasUpgrade(up.id)) { btn.textContent = '✓ Owned'; btn.disabled = true; btn.classList.add('owned'); }
      else { btn.textContent = `⭐ ${up.cost}`; btn.disabled = loadSave().starBits < up.cost; }
    };
    refresh();
    btn.onclick = () => {
      if (buyUpgrade(up.id)) {
        sfx.collect?.();
        renderStars();
        // refresh affordability of every row
        list.querySelectorAll('.suit-row').forEach((r, i) => r.dispatchEvent(new CustomEvent('refresh')));
        onChange?.();
      } else {
        sfx.wrong?.();
      }
    };
    row.addEventListener('refresh', refresh);
    row.append(btn);
    list.append(row);
  }
  panel.append(list);

  const done = el('button', 'big-btn', 'BACK TO MISSION');
  done.onclick = () => { sfx.tap?.(); screen.remove(); };
  panel.append(done);

  screen.append(panel);
  document.getElementById('ui').appendChild(screen);
}
