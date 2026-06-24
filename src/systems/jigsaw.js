// The Keystone jigsaw: a real interlocking puzzle. We paint one glowing
// ancient-rune tablet, slice it into pieces with matching tab/notch edges, then
// the player drags the scrambled pieces back into the frame. A piece only locks
// when it's dropped near its true home AND its tabs line up with the picture.
import { sfx } from '../audio.js';

/* ---- paint a coherent ancient rune tablet (the assembled picture) ---- */
function makeTablet(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  // weathered stone
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#4a4060'); g.addColorStop(0.5, '#5a4f72'); g.addColorStop(1, '#3c3450');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    x.globalAlpha = 0.06 + Math.random() * 0.1;
    x.fillStyle = Math.random() < 0.5 ? '#2a2440' : '#6a5f86';
    x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 9, 0, Math.PI * 2); x.fill();
  }
  x.globalAlpha = 1;
  // a big glowing mandala that spans the whole tablet (so seams must align)
  const cx = w / 2, cy = h / 2;
  x.strokeStyle = '#5ce8ff'; x.shadowColor = '#5ce8ff';
  for (const r of [h * 0.42, h * 0.30, h * 0.18]) {
    x.shadowBlur = 16; x.lineWidth = 4; x.globalAlpha = 0.9;
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
  }
  // radiating spokes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    x.beginPath(); x.moveTo(cx + Math.cos(a) * h * 0.18, cy + Math.sin(a) * h * 0.18);
    x.lineTo(cx + Math.cos(a) * h * 0.42, cy + Math.sin(a) * h * 0.42); x.stroke();
  }
  // glowing runes scattered across the tablet
  x.shadowBlur = 18; x.fillStyle = '#ffe07a'; x.shadowColor = '#ffd95c';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const glyphs = ['✦', '◆', '☼', '❖', '◉', '▲', 'ᚨ', 'ᚦ', 'ᛟ', '⚙', '✶', '♆'];
  for (let i = 0; i < 14; i++) {
    x.font = `900 ${26 + Math.random() * 22}px serif`;
    x.globalAlpha = 0.85;
    x.fillText(glyphs[i % glyphs.length], 40 + Math.random() * (w - 80), 30 + Math.random() * (h - 60));
  }
  x.shadowBlur = 0; x.globalAlpha = 1;
  // glowing border
  x.strokeStyle = '#ffd95c'; x.lineWidth = 6; x.strokeRect(4, 4, w - 8, h - 8);
  return c;
}

/* ---- draw one jigsaw edge with a trapezoidal tab (sign +1 out, -1 in, 0 flat) ---- */
function edge(ctx, ax, ay, bx, by, sign, t) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;       // along
  const nx = -uy, ny = ux;                  // left normal
  const P = (f, o) => [ax + ux * len * f + nx * o, ay + uy * len * f + ny * o];
  if (!sign) { ctx.lineTo(bx, by); return; }
  const s = sign * t;
  let p;
  p = P(0.34, 0); ctx.lineTo(p[0], p[1]);
  p = P(0.40, s); ctx.lineTo(p[0], p[1]);   // ramp out
  p = P(0.60, s); ctx.lineTo(p[0], p[1]);   // across the knob
  p = P(0.66, 0); ctx.lineTo(p[0], p[1]);   // ramp back
  ctx.lineTo(bx, by);
}

/** Build interlocking piece canvases from a source image. */
function cutPieces(src, cols, rows) {
  const cw = src.width / cols, ch = src.height / rows;
  const t = Math.min(cw, ch) * 0.22;        // tab size
  const m = Math.ceil(t) + 2;               // canvas margin to fit tabs
  // random seam signs
  const vSeam = [], hSeam = [];
  for (let r = 0; r < rows; r++) { vSeam[r] = []; for (let c = 0; c < cols - 1; c++) vSeam[r][c] = Math.random() < 0.5 ? 1 : -1; }
  for (let r = 0; r < rows - 1; r++) { hSeam[r] = []; for (let c = 0; c < cols; c++) hSeam[r][c] = Math.random() < 0.5 ? 1 : -1; }

  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const top = r === 0 ? 0 : -hSeam[r - 1][c];
      const bottom = r === rows - 1 ? 0 : hSeam[r][c];
      const left = c === 0 ? 0 : -vSeam[r][c - 1];
      const right = c === cols - 1 ? 0 : vSeam[r][c];

      const pc = document.createElement('canvas');
      pc.width = cw + 2 * m; pc.height = ch + 2 * m;
      const px = pc.getContext('2d');
      // cell corners in piece-local coords (cell origin at m,m)
      const x0 = m, y0 = m, x1 = m + cw, y1 = m + ch;
      px.beginPath();
      px.moveTo(x0, y0);
      edge(px, x0, y0, x1, y0, top, t);      // top  L->R
      edge(px, x1, y0, x1, y1, right, t);    // right T->B
      edge(px, x1, y1, x0, y1, bottom, t);   // bottom R->L
      edge(px, x0, y1, x0, y0, left, t);     // left B->T
      px.closePath();
      px.save();
      px.shadowColor = 'rgba(0,0,0,0.5)'; px.shadowBlur = 6;
      px.fillStyle = '#000'; px.fill();      // base shadow under the piece
      px.restore();
      px.clip();
      // draw the source so this cell aligns into the clip
      px.drawImage(src, m - c * cw, m - r * ch);
      // a subtle bevel edge
      px.lineWidth = 2; px.strokeStyle = 'rgba(255,255,255,0.35)'; px.stroke();

      pieces.push({ canvas: pc, col: c, row: r, cw, ch, margin: m });
    }
  }
  return { pieces, cw, ch, margin: m };
}

/** Run the jigsaw. Resolves when every piece is locked into place. */
export function keystoneJigsaw({ cols = 4, rows = 2 } = {}) {
  return new Promise((resolve) => {
    const SRC_W = cols * 92, SRC_H = rows * 92;
    const src = makeTablet(SRC_W, SRC_H);
    const { pieces, cw, ch, margin } = cutPieces(src, cols, rows);

    const screen = document.createElement('div');
    screen.className = 'screen dim';
    screen.style.zIndex = 65;
    screen.innerHTML = '<div class="ks-title">🧩 Slot the ancient Keystone pieces together!</div>';

    // Lay out without overlap: piece canvases are cell+2*margin, and their
    // transparent margins would otherwise intercept taps. Space the tray by the
    // full canvas size, and widen the board to fit; centre the frame in it.
    const canvasW = cw + 2 * margin, canvasH = ch + 2 * margin;
    const perRow = cols;
    const boardW = Math.max(SRC_W + 2 * margin, perRow * canvasW);
    const frameX = (boardW - SRC_W) / 2, frameY = margin;
    const trayTop = frameY + SRC_H + margin + 20;
    const trayOffX = (boardW - perRow * canvasW) / 2;
    const trayRows = Math.ceil(pieces.length / perRow);
    const board = document.createElement('div');
    board.className = 'jig-board';
    board.style.width = `${boardW}px`;
    board.style.height = `${trayTop + trayRows * canvasH + 10}px`;

    // faint ghost of the finished tablet inside the frame (kid-friendly guide)
    const ghost = document.createElement('div');
    ghost.className = 'jig-ghost';
    ghost.style.cssText = `left:${frameX}px;top:${frameY}px;width:${SRC_W}px;height:${SRC_H}px;background-image:url(${src.toDataURL()});`;
    board.appendChild(ghost);

    let placed = 0;
    const pieceObjs = [];
    const trayCells = pieces.map((_, i) => i).sort(() => Math.random() - 0.5);   // scramble
    pieces.forEach((pc, i) => {
      const targetX = frameX + pc.col * cw - margin;
      const targetY = frameY + pc.row * ch - margin;
      const slot = trayCells[i];
      const homeX = trayOffX + (slot % perRow) * canvasW;
      const homeY = trayTop + Math.floor(slot / perRow) * canvasH;

      const el = document.createElement('canvas');
      el.width = pc.canvas.width; el.height = pc.canvas.height;
      el.getContext('2d').drawImage(pc.canvas, 0, 0);
      el.className = 'jig-piece';
      el.style.left = `${homeX}px`; el.style.top = `${homeY}px`;
      board.appendChild(el);
      pieceObjs.push({ el, targetX, targetY, homeX, homeY, locked: false });
    });

    let drag = null, offX = 0, offY = 0;
    const rect = () => board.getBoundingClientRect();
    const onMove = (e) => {
      if (!drag) return;
      e.preventDefault();
      const r = rect();
      drag.el.style.left = `${e.clientX - r.left - offX}px`;
      drag.el.style.top = `${e.clientY - r.top - offY}px`;
    };
    const lock = (o) => {
      o.el.style.left = `${o.targetX}px`; o.el.style.top = `${o.targetY}px`;
      o.locked = true; o.el.classList.add('locked'); o.el.style.zIndex = 1;
      placed++;
      if (placed === pieceObjs.length) { cleanup(); sfx.fanfare?.(); setTimeout(() => { screen.remove(); resolve(); }, 600); }
    };
    const onUp = () => {
      if (!drag) return;
      const o = drag; drag = null; o.el.classList.remove('drag');
      const dx = parseFloat(o.el.style.left) - o.targetX, dy = parseFloat(o.el.style.top) - o.targetY;
      if (Math.hypot(dx, dy) < 38) { sfx.collect?.(); lock(o); }
      else { o.el.style.left = `${o.homeX}px`; o.el.style.top = `${o.homeY}px`; sfx.tap?.(); }
    };
    for (const o of pieceObjs) {
      o.el.addEventListener('pointerdown', (e) => {
        if (o.locked) return;
        e.preventDefault();
        drag = o; o.el.classList.add('drag'); o.el.style.zIndex = 10;
        const r = rect();
        offX = e.clientX - (r.left + parseFloat(o.el.style.left));
        offY = e.clientY - (r.top + parseFloat(o.el.style.top));
      }, { passive: false });
    }
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.__ksSolve = undefined;
    };
    window.__ksSolve = () => { for (const o of pieceObjs) if (!o.locked) lock(o); };

    screen.appendChild(board);
    document.getElementById('ui').appendChild(screen);
  });
}
