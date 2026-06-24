// PHASE-A VERTICAL SLICE — first-person Martian lava-tube cave.
// The new mechanic for Mission: Starlight 4: drag to look, hold WALK to move,
// flick the headlamp, and explore a winding lava tube to find underground
// water. Built and iPad-benchmarked FIRST, before the rest of the game.
//
// The camera IS the player. Movement is free-look + walk-forward, softly
// constrained to the inside of a TubeGeometry so you can't leave the cave
// (no physics engine — just "pull back toward the tube centerline").
import * as THREE from 'three';
import { makeGlowSprite, makeCrystal, makeRock, worldTexture } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { sfx } from '../audio.js';
import { loadSave, save, hasUpgrade } from '../save.js';

const TUBE_R = 4.4;          // tunnel radius
const CLAMP_R = 3.3;         // how close to the wall the player may drift
const WALK_SPEED = 9;        // base; Grip Boots upgrade makes it faster
const LOOK_SENS = 0.0045;

// the winding, descending path of the lava tube — long enough to feel like a
// real expedition, with twists, climbs, and dips
const PATH = [
  [0, 1.5, 5], [0, 1.0, -9], [8, 0.5, -20], [10, -1, -32],
  [3, -1.6, -43], [-6, -2.2, -53], [-12, -3.6, -64], [-6, -5, -76],
  [4, -5.4, -87], [11, -6, -99], [5, -7.6, -111], [-5, -8, -122],
  [-2, -9, -134]
];

// fraction-of-path positions where a glowing find waits (ice + ancient hints)
const FINDS = [
  { at: 0.26, label: '🧊 Water ice in the rock!' },
  { at: 0.52, label: '🪨 Strange ripples — an ancient streambed!' },
  { at: 0.78, label: '✨ Glittering mineral veins!' }
];

export class CaveScene {
  constructor(game, { showFps = true } = {}) {
    this.game = game;
    this.showFps = showFps;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070302);
    this.scene.fog = new THREE.Fog(0x140805, 6, 34);   // darkness closes in past the lamp

    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 400);
    this.camera.rotation.order = 'YXZ';
    this.start = new THREE.Vector3(...PATH[0]);
    this.camera.position.copy(this.start);
    this.yaw = 0;            // 0 = facing -z (down the tube)
    this.pitch = 0;

    // dim red Martian glow so it's never pitch black, but the lamp matters
    this.scene.add(new THREE.HemisphereLight(0x4a2418, 0x0a0402, 0.5));

    // the tube
    this.curve = new THREE.CatmullRomCurve3(PATH.map((p) => new THREE.Vector3(...p)));
    this.samples = this.curve.getPoints(240);
    const tex = worldTexture('proxima');               // dusky red rock
    const tubeMat = new THREE.MeshStandardMaterial({
      map: tex.map, bumpMap: tex.bump, bumpScale: 1.2, roughness: 0.96, metalness: 0.04, side: THREE.BackSide
    });
    const tubeGeo = new THREE.TubeGeometry(this.curve, 220, TUBE_R, 16, false);
    this.scene.add(new THREE.Mesh(tubeGeo, tubeMat));

    // upgrades: Bright Headlamp reaches farther, Grip Boots walk faster
    this.bright = hasUpgrade('headlamp');
    this.walkSpeed = hasUpgrade('grip') ? WALK_SPEED * 1.4 : WALK_SPEED;
    this.lampPower = this.bright ? 32 : 18;

    // headlamp: a spotlight riding the camera
    this.lampOn = true;
    this.lamp = new THREE.SpotLight(0xfff1d8, this.lampPower, this.bright ? 60 : 40, Math.PI / 4.5, 0.5, 1.2);
    this.lamp.position.set(0, 0, 0);
    this.lampTarget = new THREE.Object3D();
    this.scene.add(this.lamp, this.lampTarget);
    this.lamp.target = this.lampTarget;
    // a soft fill so the player's immediate surroundings read even lamp-off
    this.fill = new THREE.PointLight(0xff8a5a, 6, 12, 1.5);
    this.scene.add(this.fill);

    // guiding ice crystals along the route (emissive = visible in the dark)
    this.crystals = [];
    for (let i = 1; i < this.samples.length - 6; i += 22) {
      const c = makeCrystal(0xbfe8ff, 0.8 + Math.random() * 0.7);
      const base = this.samples[i];
      const off = new THREE.Vector3((Math.random() - 0.5), -TUBE_R * 0.7, (Math.random() - 0.5)).multiplyScalar(2);
      c.position.copy(base).add(off);
      c.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(c);
      this.crystals.push(c);
    }
    // scattered rocks for texture
    for (let i = 6; i < this.samples.length - 6; i += 17) {
      const r = makeRock(0.5 + Math.random() * 0.9, 0x5a2e22);
      r.position.copy(this.samples[i]).add(new THREE.Vector3((Math.random() - 0.5) * 4, -TUBE_R * 0.8, (Math.random() - 0.5) * 4));
      this.scene.add(r);
    }

    // discoveries along the way: glowing samples to find before the water
    this.finds = [];
    for (const f of FINDS) {
      const idx = Math.floor(f.at * (this.samples.length - 1));
      const base = this.samples[idx];
      const gem = makeCrystal(0x9fe8ff, 1.3);
      gem.position.copy(base).add(new THREE.Vector3((Math.random() - 0.5) * 3, -TUBE_R * 0.55, (Math.random() - 0.5) * 3));
      const halo = makeGlowSprite(0x8fd8ff, 3);
      halo.position.copy(gem.position).add(new THREE.Vector3(0, 0.8, 0));
      this.scene.add(gem, halo);
      this.finds.push({ pos: gem.position.clone(), label: f.label, found: false, gem, halo });
    }
    this.findCount = 0;

    // the prize: an underground water pool in the final chamber
    this.waterPos = this.samples[this.samples.length - 1].clone();
    this.waterPos.y -= TUBE_R * 0.55;
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a72b0, emissive: 0x1c5a96, emissiveIntensity: 0.7, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.9 })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.copy(this.waterPos);
    this.scene.add(pool);
    this.pool = pool;
    this.water = new THREE.Group();
    this.water.add(makeGlowSprite(0x6fc8ff, 6));
    const wlight = new THREE.PointLight(0x7ac8ff, 24, 26, 1.4);
    this.water.add(wlight);
    this.water.position.copy(this.waterPos).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(this.water);

    // dust motes drifting in the lamp beam
    const motePos = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      const s = this.samples[Math.floor(Math.random() * this.samples.length)];
      motePos.set([s.x + (Math.random() - 0.5) * 5, s.y + (Math.random() - 0.5) * 5, s.z + (Math.random() - 0.5) * 5], i * 3);
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    this.motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xffcaa0, size: 0.07, transparent: true, opacity: 0.6 }));
    this.scene.add(this.motes);

    this.found = false;
    this.autopilot = false;
    this.input = { walk: false };
    this.keys = {};

    this.buildControls();

    if (this.showFps) {
      this.fpsEl = document.createElement('div');
      this.fpsEl.id = 'slice-fps';
      document.getElementById('ui').appendChild(this.fpsEl);
    }
    this._frames = 0; this._fpsClock = 0; this._fpsSamples = [];
    window.__caveFPS = 0;
  }

  /* ----- first-person controls (drag to look, hold to walk, toggle lamp) ----- */
  buildControls() {
    const canvas = this.game.renderer.domElement;

    // LOOK: drag anywhere on the 3D canvas. Track the drag on window (the joystick
    // lesson: setPointerCapture is flaky for touch on iOS; preventDefault helps).
    let lookId = null, lastX = 0, lastY = 0;
    this.onCanvasDown = (e) => {
      if (lookId !== null) return;
      lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
      e.preventDefault();
    };
    this.onWinMove = (e) => {
      if (e.pointerId !== lookId) return;
      e.preventDefault();
      this.yaw -= (e.clientX - lastX) * LOOK_SENS;
      this.pitch = THREE.MathUtils.clamp(this.pitch - (e.clientY - lastY) * LOOK_SENS, -1.2, 1.2);
      lastX = e.clientX; lastY = e.clientY;
    };
    this.onWinUp = (e) => { if (e.pointerId === lookId) lookId = null; };
    canvas.addEventListener('pointerdown', this.onCanvasDown, { passive: false });
    window.addEventListener('pointermove', this.onWinMove, { passive: false });
    window.addEventListener('pointerup', this.onWinUp);
    window.addEventListener('pointercancel', this.onWinUp);

    // WALK button (hold)
    const uiRoot = document.getElementById('ui');
    this.walkBtn = document.createElement('button');
    this.walkBtn.id = 'walk-btn';
    this.walkBtn.textContent = 'WALK ▲';
    let walkId = null;
    const walkStart = (e) => { e.preventDefault(); walkId = e.pointerId; this.input.walk = true; this.walkBtn.classList.add('held'); };
    const walkEnd = (e) => { if (walkId !== null && e.pointerId !== walkId) return; walkId = null; this.input.walk = false; this.walkBtn.classList.remove('held'); };
    this.walkBtn.addEventListener('pointerdown', walkStart, { passive: false });
    window.addEventListener('pointerup', walkEnd);
    window.addEventListener('pointercancel', walkEnd);
    this._walkEnd = walkEnd;
    uiRoot.appendChild(this.walkBtn);

    // HEADLAMP toggle
    this.lampBtn = document.createElement('button');
    this.lampBtn.id = 'lamp-btn';
    this.lampBtn.textContent = '🔦 Lamp';
    this.lampBtn.onclick = () => { this.lampOn = !this.lampOn; this.lampBtn.classList.toggle('off', !this.lampOn); sfx.tap?.(); };
    uiRoot.appendChild(this.lampBtn);

    // keyboard for desktop testing
    this.onKey = (e) => {
      const d = e.type === 'keydown';
      this.keys[e.key.toLowerCase()] = d;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
    };
    addEventListener('keydown', this.onKey);
    addEventListener('keyup', this.onKey);
  }

  removeControls() {
    const canvas = this.game.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onCanvasDown);
    window.removeEventListener('pointermove', this.onWinMove);
    window.removeEventListener('pointerup', this.onWinUp);
    window.removeEventListener('pointercancel', this.onWinUp);
    window.removeEventListener('pointerup', this._walkEnd);
    window.removeEventListener('pointercancel', this._walkEnd);
    removeEventListener('keydown', this.onKey);
    removeEventListener('keyup', this.onKey);
    this.walkBtn?.remove();
    this.lampBtn?.remove();
    this.fpsEl?.remove();
  }

  /** index of the nearest sample point on the tube centerline to a position */
  nearestIndex(p) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < this.samples.length; i++) {
      const d = this.samples[i].distanceToSquared(p);
      if (d < bd) { bd = d; bi = i; }
    }
    return bi;
  }

  nearestOnPath(p) { return this.samples[this.nearestIndex(p)]; }

  update(dt, t) {
    // ---- look (keyboard arrows nudge it too) ----
    if (this.keys['arrowleft']) this.yaw += dt * 1.6;
    if (this.keys['arrowright']) this.yaw -= dt * 1.6;
    if (this.keys['arrowup']) this.pitch = Math.min(1.2, this.pitch + dt * 1.2);
    if (this.keys['arrowdown']) this.pitch = Math.max(-1.2, this.pitch - dt * 1.2);

    // autopilot (tests): follow the winding tube forward from wherever we are
    let walking = this.input.walk || this.keys['w'] || this.keys[' '];
    if (this.autopilot && !this.found) {
      const ni = this.nearestIndex(this.camera.position);
      const target = ni >= this.samples.length - 8 ? this.waterPos : this.samples[Math.min(ni + 10, this.samples.length - 1)];
      const to = target.clone().sub(this.camera.position);
      this.yaw = Math.atan2(-to.x, -to.z);     // face the waypoint ahead (matches -z forward)
      walking = true;
    }

    this.camera.rotation.set(this.pitch, this.yaw, 0);

    // ---- walk forward along facing (flattened to horizontal) ----
    if (walking && !this.found) {
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      dir.y = 0;
      if (dir.lengthSq() > 1e-4) {
        dir.normalize();
        this.camera.position.addScaledVector(dir, this.walkSpeed * dt);
      }
    }

    // ---- soft constraint: stay inside the tube, settle toward a "floor" ----
    const c = this.nearestOnPath(this.camera.position);
    const floorY = c.y - TUBE_R * 0.45;
    this.camera.position.y += (floorY - this.camera.position.y) * Math.min(1, dt * 5);
    const flat = new THREE.Vector3(this.camera.position.x - c.x, 0, this.camera.position.z - c.z);
    const d = flat.length();
    if (d > CLAMP_R) {
      flat.multiplyScalar((CLAMP_R - d) / d * Math.min(1, dt * 8));
      this.camera.position.add(flat);
    }

    // ---- headlamp follows the camera ----
    this.lamp.position.copy(this.camera.position);
    const look = new THREE.Vector3();
    this.camera.getWorldDirection(look);
    this.lampTarget.position.copy(this.camera.position).add(look.multiplyScalar(8));
    this.lamp.intensity = this.lampOn ? this.lampPower : 0;
    this.fill.position.copy(this.camera.position);

    // ---- water shimmer + objective ----
    this.water.children[0].scale.setScalar(6 + Math.sin(t * 2) * 0.6);
    this.pool.material.emissiveIntensity = 0.55 + Math.sin(t * 1.6) * 0.2;
    this.motes.rotation.y = t * 0.03;

    // intermediate discoveries — bob/spin them and pick them up on approach
    for (const f of this.finds) {
      if (f.found) continue;
      f.gem.rotation.y += dt * 1.5;
      f.halo.scale.setScalar(3 + Math.sin(t * 3) * 0.4);
      if (this.camera.position.distanceTo(f.pos) < 4.5) {
        f.found = true;
        this.findCount++;
        sfx.collect?.();
        ui.toast(f.label, true);
        this.scene.remove(f.gem, f.halo);
      }
    }

    if (!this.found) {
      const dist = this.camera.position.distanceTo(this.waterPos);
      ui.setObjective(!this.lampOn
        ? `💡 (Tip: tap the Lamp to see in the dark!)`
        : this.findCount < this.finds.length
          ? `🔦 Explore the lava tube — found ${this.findCount}/${this.finds.length} clues... keep going deeper!`
          : `💧 So close — find the underground water!`);
      if (dist < 6) {
        this.found = true;
        ui.setObjective('');
        sfx.shard?.();
        window.__caveFound = true;
        this.resolve?.();
      }
    }

    // ---- FPS meter ----
    this._frames++; this._fpsClock += dt;
    if (this._fpsClock >= 0.5) {
      const fps = this._frames / this._fpsClock;
      this._fpsSamples.push(fps);
      if (this._fpsSamples.length > 8) this._fpsSamples.shift();
      window.__caveFPS = Math.round(this._fpsSamples.reduce((a, b) => a + b, 0) / this._fpsSamples.length);
      if (this.fpsEl) this.fpsEl.textContent = `${Math.round(fps)} fps · ${this.game.pipeline.quality}`;
      this._frames = 0; this._fpsClock = 0;
    }
  }

  /** Resolves once the player reaches the water. */
  run() { return new Promise((resolve) => { this.resolve = resolve; }); }

  dispose() {
    this.removeControls();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}

/** Run the first-person cave as a standalone slice (boot via ?slice). */
export async function runCaveSlice(game) {
  const s = loadSave();
  if (!s.name) { s.name = 'Cadet'; save(); }

  const scene = new CaveScene(game);
  game.setScene(scene);
  game.pipeline.setBloom(0.7, 0.55, 0.5);
  await ui.fade(false);
  window.__caveReady = true;

  await ui.dialogue([
    { who: 'bolt', text: `Cadet ${s.name}, we\'re deep inside a Martian lava tube — a cave carved by ancient volcanoes. Real ones could shelter explorers someday!`, stamp: 'real' },
    { who: 'bolt', text: 'Drag to look around, hold WALK to move, and flick your headlamp if it gets dark. Somewhere down here is what Mars hides best: WATER. Go find it!' }
  ]);

  ui.setObjective('🔦 Explore the lava tube — find the underground water!');
  await scene.run();

  await ui.dialogue([
    { who: 'bolt', text: 'WATER! Frozen and liquid, hidden in the dark for a billion years. Where there\'s water, there might once have been LIFE.', stamp: 'real' },
    { who: 'bolt', text: 'Great exploring, Cadet. That\'s the deepest secret of the Red Planet — and the first key to waking it up.' }
  ]);
  ui.toast('💧 Underground water found — cave test complete!', true);
  window.__caveDone = true;
}
