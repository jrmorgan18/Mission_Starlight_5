// 3D construction kit, sequel edition: PBR procedural worlds (color + bump +
// roughness maps generated on canvas), emissive materials tuned for the bloom
// pass, and the new cast — gate, lighthouse, elder star, and friends.
import * as THREE from 'three';

function rand(min, max) { return min + Math.random() * (max - min); }

/* ---------------- canvas helpers ---------------- */

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function speckle(ctx, w, h, color, n, rMin, rMax, alpha = 0.5) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, rand(rMin, rMax), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function bands(ctx, w, h, colors, wobble = 18) {
  const n = colors.length;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[i];
    const y0 = (h / n) * i;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= w; x += 16) {
      ctx.lineTo(x, y0 + Math.sin(x / 53 + i * 2.1) * wobble);
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }
}

/* ---------------- PBR world textures (color + height in one recipe) ----------------
   Each recipe paints the COLOR canvas; "bump" speckles also get drawn in grayscale
   onto a parallel HEIGHT canvas so craters and cracks actually catch the light. */

function heightSpeckle(hctx, w, h, n, rMin, rMax, dark = true) {
  hctx.globalAlpha = 0.5;
  hctx.fillStyle = dark ? '#000000' : '#ffffff';
  for (let i = 0; i < n; i++) {
    hctx.beginPath();
    hctx.arc(Math.random() * w, Math.random() * h, rand(rMin, rMax), 0, Math.PI * 2);
    hctx.fill();
  }
  hctx.globalAlpha = 1;
}

const WORLD_RECIPES = {
  planet9(ctx, w, h, hctx) {
    ctx.fillStyle = '#241a3e'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#3a2a5e', 140, 8, 50, 0.6);
    speckle(ctx, w, h, '#161028', 120, 6, 34, 0.6);
    speckle(ctx, w, h, '#5a4490', 70, 3, 14, 0.5);
    speckle(ctx, w, h, '#7a5cc0', 24, 2, 6, 0.4);
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 160, 6, 40, true);
    heightSpeckle(hctx, w, h, 80, 3, 12, false);
  },
  proxima(ctx, w, h, hctx) {           // Proxima b — dusky tidally-locked rock
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#5a2a28'); g.addColorStop(0.5, '#8a4a3a'); g.addColorStop(1, '#2a1a22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#a86a4a', 110, 5, 26, 0.5);
    speckle(ctx, w, h, '#3a2020', 90, 6, 30, 0.55);
    speckle(ctx, w, h, '#c88a5a', 40, 2, 9, 0.45);
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 140, 5, 28, true);
  },
  trappist(ctx, w, h, hctx) {          // temperate TRAPPIST world — slate seas, salmon light
    ctx.fillStyle = '#3a5a6e'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#6a8a7a', 36, 14, 46, 0.9);
    speckle(ctx, w, h, '#2a4252', 80, 8, 30, 0.5);
    speckle(ctx, w, h, '#e8c8b0', 60, 4, 16, 0.35);   // salmon cloud wisps
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 50, 12, 40, false);
  },
  cancri(ctx, w, h, hctx) {            // 55 Cancri e — cracked crust over lava
    ctx.fillStyle = '#1a0e0a'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#3a2018', 120, 8, 36, 0.7);
    ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 3; ctx.globalAlpha = 0.85;   // lava cracks
    for (let i = 0; i < 46; i++) {
      ctx.beginPath();
      let x = Math.random() * w, y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let j = 0; j < 6; j++) { x += rand(-80, 80); y += rand(-36, 36); ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    speckle(ctx, w, h, '#ffb02e', 50, 1.5, 5, 0.8);
    hctx.fillStyle = '#909090'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 130, 6, 30, true);
  },
  reddwarf(ctx, w, h) {                // Proxima / TRAPPIST-1 star surface
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ff7a4a'); g.addColorStop(0.5, '#e8401a'); g.addColorStop(1, '#ff7a4a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#a82a10', 90, 6, 26, 0.6);    // star spots ("sun freckles")
    speckle(ctx, w, h, '#ffb86a', 60, 3, 12, 0.5);
  },
  nebula(ctx, w, h, hctx) {
    ctx.fillStyle = '#3a2a5e'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#6a4a9e', 90, 10, 44, 0.5);
    speckle(ctx, w, h, '#e87aa8', 60, 6, 26, 0.4);
    speckle(ctx, w, h, '#5ce8ff', 36, 2, 9, 0.4);
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
  },
  station(ctx, w, h, hctx) {           // metal deck plating
    ctx.fillStyle = '#3c4154'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2e3e'; ctx.lineWidth = 4;
    for (let x = 0; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    speckle(ctx, w, h, '#4c5268', 60, 2, 8, 0.5);
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    hctx.strokeStyle = '#404040'; hctx.lineWidth = 4;
    for (let x = 0; x < w; x += 64) { hctx.beginPath(); hctx.moveTo(x, 0); hctx.lineTo(x, h); hctx.stroke(); }
    for (let y = 0; y < h; y += 64) { hctx.beginPath(); hctx.moveTo(0, y); hctx.lineTo(w, y); hctx.stroke(); }
  },
  saturnish(ctx, w, h) {               // distant home-system cameo
    bands(ctx, w, h, ['#e8d8a8', '#d8c088', '#f0e0b8', '#ccb078', '#e8d8a8', '#d8c894'], 10);
  },
  veyra(ctx, w, h, hctx) {             // Veyra — shining ocean world with coral reefs
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2aa0c8'); g.addColorStop(0.5, '#1a7aa0'); g.addColorStop(1, '#0e5878');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#3ec8e0', 90, 8, 34, 0.4);     // bright shallows
    speckle(ctx, w, h, '#ff8a5a', 70, 3, 14, 0.55);    // coral reefs
    speckle(ctx, w, h, '#ffd0a8', 50, 2, 8, 0.5);      // coral highlights
    speckle(ctx, w, h, '#eafaff', 80, 1.5, 6, 0.5);    // sea foam
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 90, 4, 22, false);
  },
  harbor(ctx, w, h, hctx) {            // Safe Harbor — calm green-blue haven
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#163a4a'); g.addColorStop(0.5, '#1e5a52'); g.addColorStop(1, '#163a4a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#2e7a6a', 70, 10, 40, 0.5);
    speckle(ctx, w, h, '#7ae0c0', 50, 3, 12, 0.4);
    speckle(ctx, w, h, '#bfe8ff', 40, 2, 7, 0.4);
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 70, 5, 24, true);
  },
  marsred(ctx, w, h, hctx) {           // Mars today — rusty red desert
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#c2603a'); g.addColorStop(0.5, '#a8482a'); g.addColorStop(1, '#7a3420');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#d88a5a', 120, 6, 30, 0.45);   // dusty highlights
    speckle(ctx, w, h, '#5a2616', 110, 8, 36, 0.5);    // dark rock
    speckle(ctx, w, h, '#e8a060', 60, 2, 8, 0.4);      // bright dust
    // a few craters
    ctx.globalAlpha = 0.4; ctx.strokeStyle = '#4a1e10'; ctx.lineWidth = 4;
    for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, rand(14, 50), 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 150, 6, 34, true);
    heightSpeckle(hctx, w, h, 70, 3, 12, false);
  },
  meadow(ctx, w, h, hctx) {            // reborn-Mars GROUND: grass, flowers, dirt patches
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#4c9a52'); g.addColorStop(0.5, '#3f8a46'); g.addColorStop(1, '#54a85a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#357a3e', 220, 6, 26, 0.4);    // grass shadow clumps
    speckle(ctx, w, h, '#7ed080', 200, 4, 16, 0.4);    // grass highlights
    speckle(ctx, w, h, '#b89a5a', 40, 10, 34, 0.3);    // dirt patches
    // wildflowers
    for (const col of ['#ffe45c', '#ff8ad0', '#ffffff', '#9ad0ff']) {
      ctx.fillStyle = col; ctx.globalAlpha = 0.85;
      for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 120, 5, 20, true);
  },
  marsalive(ctx, w, h, hctx) {         // Mars terraformed — a living world: oceans, green
                                       // continents with coastlines, rivers, lakes, ice caps
    // deep ocean
    const sea = ctx.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#1f6fa8'); sea.addColorStop(0.5, '#1a5f96'); sea.addColorStop(1, '#16507e');
    ctx.fillStyle = sea; ctx.fillRect(0, 0, w, h);
    // subtle ocean depth variation
    speckle(ctx, w, h, '#2a7ab0', 60, 30, 90, 0.25);
    speckle(ctx, w, h, '#14486e', 50, 20, 70, 0.25);

    // --- build organic continents from clustered blobs ---
    const blob = (cx, cy, r, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      const pts = 14;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const rr = r * (0.7 + Math.sin(a * 3 + cx) * 0.18 + Math.random() * 0.18);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.8;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    };
    const continents = [[360, 420, 230], [820, 560, 180], [1280, 360, 260], [1700, 620, 210], [560, 800, 150]];
    // sandy coastlines (drawn slightly larger, under the green)
    for (const [cx, cy, r] of continents) blob(cx, cy, r * 1.12, '#caa86a');
    // green land
    for (const [cx, cy, r] of continents) blob(cx, cy, r, '#3e8e54');
    // darker forest patches + lighter grassland on the land
    ctx.save();
    for (const [cx, cy, r] of continents) {
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * r * 0.8;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
        ctx.fillStyle = Math.random() < 0.5 ? '#2f7a44' : '#6abf76';
        ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(x, y, 6 + Math.random() * 22, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1; ctx.restore();

    // rivers winding to the sea, and lakes
    ctx.strokeStyle = '#3a90c8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const [cx, cy, r] of continents) {
      for (let k = 0; k < 3; k++) {
        let x = cx + (Math.random() - 0.5) * r, y = cy + (Math.random() - 0.5) * r;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let j = 0; j < 7; j++) { x += rand(-46, 46); y += rand(20, 60); ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.fillStyle = '#357fb4';
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.ellipse(cx + (Math.random() - 0.5) * r, cy + (Math.random() - 0.5) * r, rand(8, 26), rand(6, 16), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // polar ice caps
    ctx.fillStyle = '#eef6ff';
    ctx.globalAlpha = 0.92;
    ctx.fillRect(0, 0, w, 60); ctx.fillRect(0, h - 56, w, 56);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 60, w, 34); ctx.fillRect(0, h - 90, w, 34);
    ctx.globalAlpha = 1;

    // wispy clouds
    speckle(ctx, w, h, '#f4fbff', 70, 6, 26, 0.28);
    speckle(ctx, w, h, '#ffffff', 40, 3, 12, 0.3);

    // height map: land raised, oceans low
    hctx.fillStyle = '#5a5a5a'; hctx.fillRect(0, 0, w, h);   // ocean = low
    const hscale = 0.5;
    for (const [cx, cy, r] of continents) {
      hctx.fillStyle = '#b8b8b8';
      hctx.beginPath();
      hctx.ellipse(cx * hscale, cy * hscale, r * hscale, r * hscale * 0.8, 0, 0, Math.PI * 2);
      hctx.fill();
    }
    heightSpeckle(hctx, w, h, 80, 4, 18, false);
  },
  deck(ctx, w, h, hctx) {              // sci-fi station deck — metal panels, glowing seams
    ctx.fillStyle = '#26324c'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#2e3c5a', 80, 10, 40, 0.4);
    const step = 128;
    ctx.lineWidth = 3;
    for (let x = 0; x <= w; x += step) { ctx.strokeStyle = '#161e30'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); ctx.strokeStyle = 'rgba(92,232,255,0.5)'; ctx.beginPath(); ctx.moveTo(x + 2, 0); ctx.lineTo(x + 2, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.strokeStyle = '#161e30'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); ctx.strokeStyle = 'rgba(92,232,255,0.35)'; ctx.beginPath(); ctx.moveTo(0, y + 2); ctx.lineTo(w, y + 2); ctx.stroke(); }
    ctx.fillStyle = '#4a5a7a';   // rivets
    for (let x = step / 2; x < w; x += step) for (let y = step / 2; y < h; y += step) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
    // a couple of hazard-stripe patches
    for (let k = 0; k < 3; k++) { const px = Math.random() * (w - 200), py = Math.random() * (h - 80); ctx.save(); ctx.translate(px, py); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#e8c44a' : '#1a1a1a'; ctx.fillRect(i * 30, 0, 30, 60); } ctx.restore(); }
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    hctx.strokeStyle = '#505050'; hctx.lineWidth = 3;
    for (let x = 0; x <= w; x += step / 2) { hctx.beginPath(); hctx.moveTo(x, 0); hctx.lineTo(x, h); hctx.stroke(); }
    for (let y = 0; y <= h; y += step / 2) { hctx.beginPath(); hctx.moveTo(0, y); hctx.lineTo(w, y); hctx.stroke(); }
  },
  dysondeck(ctx, w, h, hctx) {         // warm industrial deck near a caged star
    ctx.fillStyle = '#3a2c18'; ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, '#4a3820', 80, 10, 40, 0.4);
    const step = 128;
    ctx.lineWidth = 3;
    for (let x = 0; x <= w; x += step) { ctx.strokeStyle = '#241a0e'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); ctx.strokeStyle = 'rgba(255,180,80,0.5)'; ctx.beginPath(); ctx.moveTo(x + 2, 0); ctx.lineTo(x + 2, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.strokeStyle = '#241a0e'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // scattered blue solar cells
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(60,100,200,0.7)'; const sx = Math.random() * w, sy = Math.random() * h; ctx.fillRect(sx, sy, 40, 28); ctx.strokeStyle = '#6fa0ff'; ctx.lineWidth = 1; ctx.strokeRect(sx, sy, 40, 28); }
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    heightSpeckle(hctx, w, h, 60, 4, 14, true);
  },
  stone(ctx, w, h, hctx) {             // ancient Architect city — pale stone + glowing runes
    ctx.fillStyle = '#5a5276'; ctx.fillRect(0, 0, w, h);
    const step = 170;
    for (let x = 0; x < w; x += step) for (let y = 0; y < h; y += step) { ctx.fillStyle = `rgba(${90 + Math.random() * 30 | 0},${82 + Math.random() * 26 | 0},${120 + Math.random() * 30 | 0},1)`; ctx.fillRect(x + 3, y + 3, step - 6, step - 6); }
    speckle(ctx, w, h, '#3e3858', 120, 4, 16, 0.4);
    // glowing gold rune inlays along some tile borders
    ctx.strokeStyle = 'rgba(255,210,120,0.8)'; ctx.lineWidth = 3; ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 8;
    for (let i = 0; i < 24; i++) { const x = Math.floor(Math.random() * (w / step)) * step + step / 2, y = Math.floor(Math.random() * (h / step)) * step + step / 2; ctx.strokeRect(x - 22, y - 22, 44, 44); }
    ctx.shadowBlur = 0;
    hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, w, h);
    hctx.strokeStyle = '#505050'; hctx.lineWidth = 5;
    for (let x = 0; x <= w; x += step) { hctx.beginPath(); hctx.moveTo(x, 0); hctx.lineTo(x, h); hctx.stroke(); }
    for (let y = 0; y <= h; y += step) { hctx.beginPath(); hctx.moveTo(0, y); hctx.lineTo(w, y); hctx.stroke(); }
  },
  circuit(ctx, w, h, hctx) {           // Machine Mind — dark floor with glowing circuit traces
    ctx.fillStyle = '#081420'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(92,232,255,0.7)'; ctx.lineWidth = 2.5; ctx.shadowColor = '#5ce8ff'; ctx.shadowBlur = 6;
    for (let i = 0; i < 40; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) { if (Math.random() < 0.5) x += (Math.random() - 0.5) * 240; else y += (Math.random() - 0.5) * 240; ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = '#aef2ff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();   // node
    }
    ctx.shadowBlur = 0;
    hctx.fillStyle = '#707070'; hctx.fillRect(0, 0, w, h);
  }
};

const textureCache = {};
export function worldTexture(key) {
  if (textureCache[key]) return textureCache[key];
  const [canvas, ctx] = makeCanvas(2048, 1024);
  const [hcanvas, hctx] = makeCanvas(1024, 512);
  hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, 1024, 512);
  (WORLD_RECIPES[key] || WORLD_RECIPES.planet9)(ctx, 2048, 1024, hctx, 1024, 512);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const bump = new THREE.CanvasTexture(hcanvas);
  textureCache[key] = { map, bump };
  return textureCache[key];
}

/* ---------------- planets & space ---------------- */

export function makePlanet(key, radius = 1) {
  const group = new THREE.Group();
  const isStar = key === 'reddwarf';
  const tex = worldTexture(key);
  const mat = isStar
    ? new THREE.MeshBasicMaterial({ map: tex.map, color: 0xffd0b8 })   // brightened so bloom catches it
    : new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 1.4, roughness: 0.92, metalness: 0.02 });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), mat);
  group.add(sphere);
  group.userData.sphere = sphere;

  if (isStar) {
    group.add(makeGlowSprite(0xff6a3a, radius * 4.6));
    const light = new THREE.PointLight(0xffc0a0, 2200, 0, 1.6);
    group.add(light);
  }
  if (key === 'cancri') {
    // lava worlds smolder
    sphere.material.emissive = new THREE.Color(0xff4a10);
    sphere.material.emissiveMap = tex.map;
    sphere.material.emissiveIntensity = 0.55;
  }
  return group;
}

export function makeGlowSprite(color, size) {
  const [canvas, ctx] = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  const c = new THREE.Color(color);
  g.addColorStop(0, `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},0.85)`);
  g.addColorStop(0.4, `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},0.25)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.setScalar(size);
  return sprite;
}

export function makeStarfield(count = 1800, radius = 900) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(0xffffff), new THREE.Color(0xbfdcff), new THREE.Color(0xffe9b8), new THREE.Color(0xffc9c9)];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(radius * rand(0.5, 1));
    positions.set([v.x, v.y, v.z], i * 3);
    const c = palette[Math.floor(Math.random() * palette.length)].clone().multiplyScalar(rand(0.7, 1.6));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.4, vertexColors: true, sizeAttenuation: false }));
}

/** A wisp-cloud of additive sprites — cheap volumetric nebula for backdrops. */
export function makeNebulaCloud(color = 0x6a4a9e, count = 14, spread = 60) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const s = makeGlowSprite(color, rand(18, 44));
    s.material.opacity = rand(0.08, 0.2);
    s.material.blending = THREE.AdditiveBlending;
    s.position.set(rand(-spread, spread), rand(-spread * 0.4, spread * 0.4), rand(-spread, spread));
    group.add(s);
  }
  return group;
}

/* ---------------- living-world landscape (reborn Mars) ---------------- */

/** A gradient sky dome (sits behind everything; ignores fog). */
export function makeSkyDome(top = 0x6fb8e8, bottom = 0xcfeaf6, radius = 240) {
  const geo = new THREE.SphereGeometry(radius, 32, 18);
  const top3 = new THREE.Color(top), bot3 = new THREE.Color(bottom);
  const colors = new Float32Array(geo.attributes.position.count * 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = THREE.MathUtils.clamp((pos.getY(i) / radius) * 0.5 + 0.5, 0, 1);
    const c = bot3.clone().lerp(top3, k);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
}

/** A simple low-poly tree: trunk + stacked foliage cones. */
export function makeTree(scale = 1) {
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.1, 7),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9, flatShading: true })
  );
  trunk.position.y = 0.55;
  t.add(trunk);
  const leaf = (r, y, col) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.5, 8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.8, flatShading: true }));
    m.position.y = y;
    t.add(m);
  };
  leaf(0.95, 1.5, 0x357a3e);
  leaf(0.78, 2.05, 0x3f8c48);
  leaf(0.55, 2.5, 0x4fa257);
  t.scale.setScalar(scale);
  t.userData.bobs = false;
  return t;
}

/** Dense instanced grass blades scattered in a ring; one draw call. */
export function makeGrassField(count = 500, inner = 5, outer = 26) {
  const blade = new THREE.ConeGeometry(0.06, 0.5, 3);
  blade.translate(0, 0.25, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true });
  const mesh = new THREE.InstancedMesh(blade, mat, count);
  const dummy = new THREE.Object3D();
  const greens = [new THREE.Color(0x4aa860), new THREE.Color(0x6ec878), new THREE.Color(0x3d8c4a), new THREE.Color(0x86d68a)];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = inner + Math.random() * (outer - inner);
    dummy.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8 - 2);
    dummy.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
    dummy.scale.setScalar(0.7 + Math.random() * 1.1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, greens[Math.floor(Math.random() * greens.length)]);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/* ---------------- the player's ship (Mk II) ---------------- */

export function makeShip() {
  const ship = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xe8ecf5, roughness: 0.35, metalness: 0.55 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x8a5cff, roughness: 0.4, metalness: 0.4 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.6, 6, 14), hullMat);
  body.rotation.x = Math.PI / 2;
  ship.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 14), accentMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -1.65;
  ship.add(nose);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 18, 12),
    new THREE.MeshStandardMaterial({ color: 0x5ce8ff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.92 })
  );
  dome.position.set(0, 0.45, -0.5);
  ship.add(dome);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.85), accentMat);
    wing.position.set(side * 1.0, -0.1, 0.45);
    wing.rotation.z = side * -0.16;
    ship.add(wing);
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.55, 4, 8), hullMat);
    pod.rotation.x = Math.PI / 2;
    pod.position.set(side * 1.55, 0.0, 0.45);
    ship.add(pod);
    // engine nozzles glow hot for the bloom pass
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 0.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x5ce8ff, emissive: 0x5ce8ff, emissiveIntensity: 3.2 })
    );
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(side * 1.55, 0.0, 0.82);
    ship.add(nozzle);
  }

  // luma's cradle: she rides as the ship's glowing heart
  const cradle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xffd95c, emissive: 0xffd95c, emissiveIntensity: 1.6 })
  );
  cradle.position.set(0, 0.32, 0.55);
  cradle.rotation.x = Math.PI / 2;
  ship.add(cradle);

  const engineGlow = makeGlowSprite(0x5ce8ff, 1.6);
  engineGlow.position.z = 1.5;
  ship.add(engineGlow);
  ship.userData.engineGlow = engineGlow;
  return ship;
}

/* ---------------- characters ---------------- */

function eye(x, y, z, r = 0.09) {
  const e = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10141f }));
  e.position.set(x, y, z);
  return e;
}

export function makeBolt() {
  const bot = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xffd95c, roughness: 0.35, metalness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.7, 14), metal);
  body.position.y = 0.55;
  bot.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), metal);
  head.position.y = 1.15;
  bot.add(head);
  head.add(eye(-0.12, 0.05, 0.27), eye(0.12, 0.05, 0.27));
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), metal);
  antenna.position.y = 1.55;
  bot.add(antenna);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0x5ce8ff, emissive: 0x5ce8ff, emissiveIntensity: 2.6 }));
  tip.position.y = 1.73;
  bot.add(tip);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.34, 3, 6), metal);
    arm.position.set(side * 0.48, 0.6, 0);
    arm.rotation.z = side * 0.5;
    bot.add(arm);
  }
  bot.userData.bobs = true;
  return bot;
}

export function makeAstronaut(suitColor = 0xf0f3ff) {
  const person = new THREE.Group();
  const suit = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.6, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 4, 10), suit);
  body.position.y = 0.62;
  person.add(body);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), suit);
  helmet.position.y = 1.28;
  person.add(helmet);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 8, -Math.PI / 3, (Math.PI * 2) / 3, Math.PI / 4, Math.PI / 2.2),
    new THREE.MeshStandardMaterial({ color: 0x5ce8ff, roughness: 0.1, metalness: 0.4 })
  );
  visor.position.y = 1.28;
  person.add(visor);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xb8c0d4, roughness: 0.5, metalness: 0.3 }));
  pack.position.set(0, 0.78, 0.3);
  person.add(pack);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 3, 6), suit);
    arm.position.set(side * 0.42, 0.72, 0);
    arm.rotation.z = side * 0.35;
    person.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.32, 3, 6), suit);
    leg.position.set(side * 0.15, 0.18, 0);
    person.add(leg);
  }
  return person;
}

export function makeLuma(scale = 1) {
  const star = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.4 * scale, 1),
    new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffd95c, emissiveIntensity: 2.8, flatShading: true })
  );
  star.add(core);
  star.add(makeGlowSprite(0xffd95c, 2.6 * scale));
  const light = new THREE.PointLight(0xffe9a8, 30 * scale, 18);
  star.add(light);
  star.userData.core = core;
  star.userData.bobs = true;
  return star;
}

/** Nana Lyra — an elder star: bigger, warmer, with slow orbiting sparks. */
export function makeLyra(scale = 1.6) {
  const star = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.45 * scale, 2),
    new THREE.MeshStandardMaterial({ color: 0xffe8d0, emissive: 0xffa84a, emissiveIntensity: 2.2, flatShading: true })
  );
  star.add(core);
  star.add(makeGlowSprite(0xffa84a, 3.2 * scale));
  const light = new THREE.PointLight(0xffd0a0, 36 * scale, 22);
  star.add(light);
  for (let i = 0; i < 3; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 * scale, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffe8d0, emissive: 0xffc06a, emissiveIntensity: 3 })
    );
    spark.userData.orbit = { r: (0.8 + i * 0.3) * scale, speed: 1.2 - i * 0.3, phase: i * 2.1 };
    star.add(spark);
  }
  star.userData.core = core;
  star.userData.bobs = true;
  return star;
}

export function makeAlien(kind) {
  const g = new THREE.Group();
  if (kind === 'ember') {               // Proxima storm-watcher: living flame wisp
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xff7a3a, emissive: 0xff4a10, emissiveIntensity: 1.2, flatShading: true })
    );
    body.position.y = 0.85;
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xffb02e, emissive: 0xff8a2a, emissiveIntensity: 1.4, flatShading: true })
    );
    head.position.y = 1.55;
    head.add(eye(-0.11, 0.05, 0.23), eye(0.11, 0.05, 0.23));
    g.add(head);
    g.add(makeGlowSprite(0xff7a3a, 2.2).translateY(1.1));
    g.userData.bobs = true;
  } else if (kind === 'keeper') {       // TRAPPIST lantern-keeper
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 4, 10), new THREE.MeshStandardMaterial({ color: 0x4a7a9e, roughness: 0.5 }));
    body.position.y = 0.72;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshStandardMaterial({ color: 0x6a9abe, roughness: 0.5 }));
    head.position.y = 1.35;
    head.add(eye(-0.11, 0.05, 0.23), eye(0.11, 0.05, 0.23));
    g.add(head);
    const lantern = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffd95c, emissiveIntensity: 2.6 })
    );
    lantern.position.set(0.5, 1.0, 0.1);
    g.add(lantern);
    g.userData.lantern = lantern;
  } else if (kind === 'smelt') {        // Diamond Planet miner: stocky crystal golem
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.MeshStandardMaterial({ color: 0x5a4a44, roughness: 0.8, flatShading: true })
    );
    body.position.y = 0.65;
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.3, 0),
      new THREE.MeshStandardMaterial({ color: 0x6a564e, roughness: 0.8, flatShading: true })
    );
    head.position.y = 1.3;
    head.add(eye(-0.11, 0.04, 0.24), eye(0.11, 0.04, 0.24));
    g.add(head);
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x5ce8ff, emissiveIntensity: 1.8, roughness: 0.1 })
    );
    gem.position.set(0, 1.62, 0);
    g.add(gem);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 3, 6), new THREE.MeshStandardMaterial({ color: 0x5a4a44, flatShading: true }));
      arm.position.set(side * 0.55, 0.7, 0);
      arm.rotation.z = side * 0.5;
      g.add(arm);
    }
  } else if (kind === 'tick') {         // lighthouse keeper: tall clockwork bird
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.0, 10), new THREE.MeshStandardMaterial({ color: 0x9aa4c8, roughness: 0.4, metalness: 0.4 }));
    body.position.y = 0.8;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), new THREE.MeshStandardMaterial({ color: 0xb8c2e0, roughness: 0.4, metalness: 0.4 }));
    head.position.y = 1.5;
    head.add(eye(-0.1, 0.04, 0.2), eye(0.1, 0.04, 0.2));
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xffd95c }));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0, 0.3);
    head.add(beak);
    g.add(head);
    const pendulum = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x5ce8ff, emissive: 0x5ce8ff, emissiveIntensity: 2.2 })
    );
    pendulum.position.set(0, 0.35, 0.3);
    g.add(pendulum);
    g.userData.pendulum = pendulum;
  } else if (kind === 'solari') {       // Veyra ocean-folk: gentle, glowing, finned
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.55, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x3aa6c8, roughness: 0.35, metalness: 0.1, emissive: 0x1a6a8a, emissiveIntensity: 0.5 })
    );
    body.position.y = 0.75;
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x6fd8ee, roughness: 0.3, metalness: 0.1, emissive: 0x2a8aa8, emissiveIntensity: 0.6 })
    );
    head.position.y = 1.4;
    head.add(eye(-0.11, 0.05, 0.24), eye(0.11, 0.05, 0.24));
    g.add(head);
    // a coral-fin crest and a soft bioluminescent glow
    const fin = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.5, 5),
      new THREE.MeshStandardMaterial({ color: 0xffb86a, emissive: 0xff8a5a, emissiveIntensity: 1.2, flatShading: true })
    );
    fin.position.y = 1.78;
    g.add(fin);
    g.add(makeGlowSprite(0x5ce8ff, 2.0).translateY(1.1));
    g.userData.bobs = true;
  } else {                              // generic
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 4, 8), new THREE.MeshStandardMaterial({ color: 0x5cd98f, flatShading: true }));
    body.position.y = 0.7;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), new THREE.MeshStandardMaterial({ color: 0x6fe8a0, flatShading: true }));
    head.position.y = 1.3;
    head.add(eye(-0.12, 0.06, 0.25), eye(0.12, 0.06, 0.25));
    g.add(head);
  }
  return g;
}

/** A glowing pylon/antenna — a station light post with a point light. */
export function makePylon(color = 0x5ce8ff, height = 4) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, height, 8), new THREE.MeshStandardMaterial({ color: 0x2a3450, roughness: 0.4, metalness: 0.7 }));
  post.position.y = height / 2;
  g.add(post);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 3 }));
  lamp.position.y = height + 0.1;
  g.add(lamp);
  g.add(makeGlowSprite(color, 2).translateY(height + 0.1));
  const light = new THREE.PointLight(color, 10, 16);
  light.position.y = height;
  g.add(light);
  return g;
}

/** A tall glowing monolith/slab — ancient architecture or a data tower. */
export function makeMonolith(color = 0x9a7aff, height = 6, w = 1.2) {
  const g = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(w, height, w * 0.6), new THREE.MeshStandardMaterial({ color: 0x2a2440, roughness: 0.5, metalness: 0.4, emissive: color, emissiveIntensity: 0.4 }));
  slab.position.y = height / 2;
  g.add(slab);
  // glowing edge strip
  const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, height * 0.8, w * 0.62), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.2 }));
  strip.position.y = height / 2;
  g.add(strip);
  return g;
}

/** A small solar-panel array on a frame (Dyson set dressing). */
export function makePanelArray(color = 0x3a5ab0) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: 0x4a3820, metalness: 0.7, roughness: 0.4 }));
  frame.position.y = 1.6;
  frame.rotation.x = -0.5;
  g.add(frame);
  for (let i = -1; i <= 1; i++) for (let j = -0.5; j <= 0.5; j += 1) {
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), new THREE.MeshStandardMaterial({ color, emissive: 0x2a4a8a, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.2 }));
    cell.position.set(i * 0.78, 1.66, j * 0.78);
    cell.rotation.x = -0.5;
    g.add(cell);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x4a3820, metalness: 0.7 }));
  pole.position.y = 0.8;
  g.add(pole);
  return g;
}

/** A tall, elegant Architect alien — robed, glowing, ancient. */
export function makeArchitect() {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.7, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a4a8e, roughness: 0.5, emissive: 0x2a2050, emissiveIntensity: 0.6, flatShading: true })
  );
  robe.position.y = 0.85;
  g.add(robe);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xbfa8ff, roughness: 0.4, emissive: 0x6a4ad0, emissiveIntensity: 0.7 })
  );
  head.position.y = 1.9;
  head.add(eye(-0.1, 0.04, 0.24), eye(0.1, 0.04, 0.24));
  g.add(head);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.4 + i * 0.12, 0.02, 8, 28),
      new THREE.MeshStandardMaterial({ color: 0xffe07a, emissive: 0xffd95c, emissiveIntensity: 2 })
    );
    ring.position.y = 2.3 + i * 0.05;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }
  g.add(makeGlowSprite(0x9a7aff, 2.4).translateY(1.4));
  g.userData.bobs = true;
  return g;
}

/** A friendly robot of the Machine Mind — chrome body, glowing eye-bar. */
export function makeRobot(scale = 1) {
  const g = new THREE.Group();
  const chrome = new THREE.MeshStandardMaterial({ color: 0xb8c2d8, roughness: 0.25, metalness: 0.85 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.7, 6, 12), chrome);
  body.position.y = 0.8;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), chrome);
  head.position.y = 1.5;
  g.add(head);
  const eyebar = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.1, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x5ce8ff, emissive: 0x5ce8ff, emissiveIntensity: 3 })
  );
  eyebar.position.set(0, 1.52, 0.26);
  g.add(eyebar);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), chrome);
    arm.position.set(side * 0.46, 0.85, 0);
    arm.rotation.z = side * 0.3;
    g.add(arm);
  }
  g.add(makeGlowSprite(0x5ce8ff, 1.6).translateY(1.2));
  g.scale.setScalar(scale);
  g.userData.eyebar = eyebar;
  g.userData.bobs = true;
  return g;
}

/** A human kid (classmate / the cadet on Earth) — simple, friendly. */
export function makeKid(shirt = 0x5ce8ff) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.5, 4, 10), new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.7 }));
  body.position.y = 0.62;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), skin);
  head.position.y = 1.2;
  head.add(eye(-0.1, 0.03, 0.22), eye(0.1, 0.03, 0.22));
  g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 1 }));
  hair.position.y = 1.26;
  g.add(hair);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.34, 3, 6), new THREE.MeshStandardMaterial({ color: 0x35507a }));
    leg.position.set(side * 0.12, 0.18, 0);
    g.add(leg);
  }
  return g;
}

/** Rusty — a lonely little Mars rover: boxy body, six wheels, camera mast, panels. */
export function makeRover() {
  const r = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xd8c2a0, roughness: 0.5, metalness: 0.55 });
  const dusty = new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.85, metalness: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.9), dusty);
  body.position.y = 0.7;
  r.add(body);

  // wheels (3 a side)
  for (const side of [-1, 1]) {
    for (const z of [-0.6, 0, 0.6]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.9 }));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.78, 0.28, z);
      r.add(wheel);
    }
  }
  // solar-panel wings
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 1.4), new THREE.MeshStandardMaterial({ color: 0x223a6a, roughness: 0.3, metalness: 0.6, emissive: 0x14203a, emissiveIntensity: 0.4 }));
    panel.position.set(side * 1.0, 1.0, 0);
    r.add(panel);
  }
  // camera mast with a big friendly eye
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), metal);
  mast.position.set(0, 1.3, -0.7);
  r.add(mast);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.35), metal);
  head.position.set(0, 1.75, -0.7);
  r.add(head);
  const reye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5ce8ff, emissive: 0x5ce8ff, emissiveIntensity: 2.4 }));
  reye.position.set(0, 1.75, -0.9);
  r.add(reye);
  r.userData.eye = reye;
  r.userData.bobs = true;   // gentle idle
  return r;
}

/* ---------------- landmarks ---------------- */

/** The Star Gate: a great double ring of ancient metal with glowing glyphs. */
export function makeGate(radius = 5) {
  const gate = new THREE.Group();
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a527a, roughness: 0.35, metalness: 0.7, emissive: 0x2a2348, emissiveIntensity: 0.7 });
  const outer = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.09, 12, 64), ringMat);
  gate.add(outer);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.82, radius * 0.05, 10, 64), ringMat);
  gate.add(inner);
  inner.userData.spins = true;

  // glyph studs around the ring — they light up as the gate wakes
  const glyphs = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const glyph = new THREE.Mesh(
      new THREE.OctahedronGeometry(radius * 0.06, 0),
      new THREE.MeshStandardMaterial({ color: 0x2a2440, emissive: 0x5ce8ff, emissiveIntensity: 0 })
    );
    glyph.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    gate.add(glyph);
    glyphs.push(glyph);
  }
  gate.userData.glyphs = glyphs;

  // dormant portal film
  const film = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.78, 48),
    new THREE.MeshBasicMaterial({ color: 0x5ce8ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
  );
  gate.add(film);
  gate.userData.film = film;
  return gate;
}

/** Pulsar lighthouse: striped tower + rotating twin light beams. */
export function makeLighthouse(height = 7) {
  const lh = new THREE.Group();
  const stripes = new THREE.MeshStandardMaterial({ color: 0xe8ecf5, roughness: 0.5 });
  const stripesB = new THREE.MeshStandardMaterial({ color: 0x8a5cff, roughness: 0.5 });
  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const r0 = 1.1 - i * 0.14, r1 = 1.1 - (i + 1) * 0.14;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, height / segs, 14), i % 2 ? stripesB : stripes);
    seg.position.y = (i + 0.5) * (height / segs);
    lh.add(seg);
  }
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x5ce8ff, emissiveIntensity: 3.2 })
  );
  lamp.position.y = height + 0.4;
  lh.add(lamp);
  lh.userData.lamp = lamp;

  // twin sweeping beams (pulsar style — opposite directions)
  const beams = new THREE.Group();
  beams.position.y = height + 0.4;
  for (const dir of [1, -1]) {
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 14, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9adcff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.rotation.z = dir * Math.PI / 2;
    beam.position.x = dir * 7;
    beams.add(beam);
  }
  lh.add(beams);
  lh.userData.beams = beams;
  return lh;
}

/* ---------------- terrain & props ---------------- */

const GROUND_KEYS = { planet9: 'planet9', proxima: 'proxima', trappist: 'trappist', cancri: 'cancri', pulsar: 'station', finale: 'nebula', blackhole: 'station',
  veyra: 'veyra', observatory: 'station', spaceport: 'station', harbor: 'harbor', race: 'station',
  marsred: 'marsred', marscanyon: 'marsred', marspolar: 'marsred', marsalive: 'meadow',
  pulsarsky: 'deck', architect: 'stone', dyson: 'dysondeck', machine: 'circuit', school: 'meadow' };

export function makeGround(key, size = 60) {
  const geo = new THREE.PlaneGeometry(size, size, 48, 48);
  const pos = geo.attributes.position;
  const flat = key === 'pulsar' || key === 'blackhole' || key === 'observatory' || key === 'spaceport';   // station decks stay flat
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d = Math.sqrt(x * x + y * y);
    const edge = Math.max(0, (d - size * 0.28) / (size * 0.22));
    pos.setZ(i, flat ? 0 : Math.sin(x * 0.35) * Math.cos(y * 0.3) * 0.35 + edge * edge * 2.2 + Math.random() * 0.12);
  }
  geo.computeVertexNormals();
  const tex = worldTexture(GROUND_KEYS[key] || 'planet9');
  const ground = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 0.8, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

export function makeRock(size = 1, color = 0x8a8a96) {
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, 0),
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 })
  );
  rock.position.y = size * 0.5;
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  return rock;
}

export function makeCrystal(color = 0x5ce8ff, height = 1) {
  const crystal = new THREE.Mesh(
    new THREE.ConeGeometry(0.22 * height, height, 5),
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.15, emissive: color, emissiveIntensity: 0.8, transparent: true, opacity: 0.92 })
  );
  crystal.position.y = height / 2;
  crystal.rotation.y = Math.random() * Math.PI;
  return crystal;
}

/** A pulsar beacon shard — sequel's collectible, lit for bloom. */
export function makeBeacon() {
  const beacon = new THREE.Group();
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x5ce8ff, emissiveIntensity: 2.6, flatShading: true })
  );
  gem.position.y = 1.1;
  beacon.add(gem);
  beacon.add(makeGlowSprite(0x5ce8ff, 3).translateY(1.1));
  const light = new THREE.PointLight(0x9adcff, 18, 12);
  light.position.y = 1.2;
  beacon.add(light);
  beacon.userData.gem = gem;
  beacon.userData.spins = true;
  return beacon;
}

/** Floating "!" marker that screams TAP ME to a six-year-old. */
export function makeMarker(color = '#ffd95c') {
  const [canvas, ctx] = makeCanvas(64, 96);
  ctx.fillStyle = color;
  ctx.font = '900 80px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillText('!', 32, 76);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(0.8, 1.2, 1);
  sprite.userData.marker = true;
  return sprite;
}

export function makeTextSprite(text, { size = 42, color = '#ffffff', bg = null } = {}) {
  const [canvas, ctx] = makeCanvas(512, 128);
  ctx.font = `900 ${size}px "Trebuchet MS", Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (bg) {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(40, 24, 432, 80, 40);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(4, 1, 1);
  return sprite;
}

/** Standard lighting rig for world dioramas. */
export function addSceneLights(scene, { sky = 0x8899ff, ground = 0x223344, sunColor = 0xfff2dd, intensity = 2.6 } = {}) {
  scene.add(new THREE.HemisphereLight(sky, ground, 0.9));
  const sun = new THREE.DirectionalLight(sunColor, intensity);
  sun.position.set(8, 14, 6);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x6688ff, 0.5);
  fill.position.set(-8, 6, -6);
  scene.add(fill);
  return sun;
}

/** Animate userData.bobs / spins / orbits / pendulums on a scene graph. Call every frame. */
export function animateProps(root, t) {
  root.traverse((obj) => {
    if (obj.userData.bobs) obj.position.y = (obj.userData.baseY ?? (obj.userData.baseY = obj.position.y)) + Math.sin(t * 2 + obj.id) * 0.12;
    if (obj.userData.spins) obj.rotation.y = t * 1.2;
    if (obj.userData.marker) obj.position.y = (obj.userData.baseY ?? (obj.userData.baseY = obj.position.y)) + Math.sin(t * 3) * 0.15;
    if (obj.userData.orbit) {
      const o = obj.userData.orbit;
      obj.position.set(Math.cos(t * o.speed + o.phase) * o.r, Math.sin(t * o.speed * 0.7 + o.phase) * o.r * 0.4, Math.sin(t * o.speed + o.phase) * o.r);
    }
    if (obj.userData.pendulum === obj) { /* noop guard */ }
  });
  if (root.userData?.pendulum) root.userData.pendulum.position.x = Math.sin(t * 2.4) * 0.18;
  if (root.userData?.beams) root.userData.beams.rotation.y = t * 1.8;
}
