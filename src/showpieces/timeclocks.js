// The time-dilation "two clocks" beat: shows the cadet's ship-clock barely
// moving while Earth's clock spins through years — the visual heart of the
// finale's time-dilation arc. Resolves when the player taps Continue.
import { sfx } from '../audio.js';

export function timeWarp(shipText, earthText, note = 'The faster you fly, the more time passes back home.') {
  return new Promise((resolve) => {
    const screen = document.createElement('div');
    screen.className = 'screen dim';
    screen.style.zIndex = 66;
    screen.innerHTML = `
      <div class="tw-title">⏱️ Time is bending...</div>
      <div class="tw-row">
        <div class="tw-clock">
          <div class="tw-face"><div class="tw-hand ship"></div></div>
          <div class="tw-label">🚀 YOUR SHIP</div>
          <div class="tw-time">${shipText}</div>
        </div>
        <div class="tw-clock">
          <div class="tw-face"><div class="tw-hand earth"></div></div>
          <div class="tw-label">🌍 EARTH</div>
          <div class="tw-time">${earthText}</div>
        </div>
      </div>
      <div class="tw-note">${note}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'big-btn';
    btn.textContent = 'CONTINUE ▸';
    btn.onclick = () => { sfx.tap?.(); screen.remove(); resolve(); };
    screen.appendChild(btn);
    document.getElementById('ui').appendChild(screen);
    sfx.whoosh?.();
  });
}
