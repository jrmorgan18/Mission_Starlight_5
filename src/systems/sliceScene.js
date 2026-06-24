// PHASE-A VERTICAL SLICE — "The Pinwheel up close" (chapter 3 showpiece).
// Built and benchmarked first to prove the heaviest graphics run on the iPad
// before the rest of Mission: Starlight 3 is built. Boot with ?slice.
//
// A self-contained space scene (same shape as HyperspaceScene): own scene +
// camera + update loop, driven by an async storybook script. It also pins a
// live FPS read-out (window.__sliceFPS) so the benchmark has a hard number.
import * as THREE from 'three';
import { makeStarfield, makeShip, makeGlowSprite } from '../world/builders.js';
import { makeKillerStar } from '../killerstar/killerstar.js';
import * as ui from '../ui/ui.js';
import { pickScience, pickMath } from '../edu/engine.js';
import { loadSave, save } from '../save.js';
import { sfx } from '../audio.js';

const STAR_POS = new THREE.Vector3(5, 4, -46);

/* simple promise-based tween off the rAF clock (independent of scene.update) */
function tween(ms, onUpdate) {
  return new Promise((resolve) => {
    const fast = new URLSearchParams(location.search).has('fast');
    const dur = fast ? Math.min(ms, 220) : ms;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      onUpdate(k);
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

export class KillerStarScene {
  constructor(game, { showFps = true } = {}) {
    this.game = game;
    this.showFps = showFps;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05030c);
    this.scene.fog = new THREE.Fog(0x05030c, 60, 220);

    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 1.5, 8);

    this.scene.add(new THREE.HemisphereLight(0x8aa0ff, 0x0a0618, 1.6));
    const key = new THREE.DirectionalLight(0xbfd4ff, 2.0);
    key.position.copy(STAR_POS);
    this.scene.add(key);

    const stars = makeStarfield(game.lowDetail ? 500 : 1300, 360);
    this.scene.add(stars);

    this.star = makeKillerStar(26);
    this.star.position.copy(STAR_POS);
    this.scene.add(this.star);
    // a soft glow halo behind the star core
    this.halo = makeGlowSprite(0xaaccff, 16);
    this.halo.position.copy(STAR_POS);
    this.scene.add(this.halo);

    this.ship = makeShip();
    this.ship.scale.setScalar(1.2);
    this.ship.position.set(-6.5, -1.8, -6);
    this.ship.rotation.y = 0.5;
    this.scene.add(this.ship);

    this.shake = 0;
    this.t0 = 0;

    // live FPS read-out for the benchmark (slice only)
    if (this.showFps) {
      this.fpsEl = document.createElement('div');
      this.fpsEl.id = 'slice-fps';
      document.getElementById('ui').appendChild(this.fpsEl);
    }
    this._frames = 0;
    this._fpsClock = 0;
    this._fpsSamples = [];
    window.__sliceFPS = 0;
  }

  update(dt, t) {
    if (this.t0 === 0) this.t0 = t;
    this.star.userData.update(dt, t);
    this.star.userData.face(this.camera);
    if (this.halo) this.halo.scale.setScalar(16 * (1 + this.starCharge * 0.4));

    // lazy cinematic drift + shake
    this.shake = Math.max(0, this.shake - dt);
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.x = Math.sin((t - this.t0) * 0.12) * 1.6 + sx;
    this.camera.position.y = 1.5 + Math.sin((t - this.t0) * 0.18) * 0.5 + sy;
    this.camera.lookAt(STAR_POS.x * 0.5, STAR_POS.y * 0.4, STAR_POS.z * 0.5);

    // FPS meter (≈ every 0.5s)
    this._frames++;
    this._fpsClock += dt;
    if (this._fpsClock >= 0.5) {
      const fps = this._frames / this._fpsClock;
      this._fpsSamples.push(fps);
      if (this._fpsSamples.length > 8) this._fpsSamples.shift();
      const avg = this._fpsSamples.reduce((a, b) => a + b, 0) / this._fpsSamples.length;
      window.__sliceFPS = Math.round(avg);
      if (this.fpsEl) this.fpsEl.textContent = `${Math.round(fps)} fps · ${this.game.pipeline.quality}`;
      this._frames = 0;
      this._fpsClock = 0;
    }
  }

  get starCharge() { return this.star ? (this.star.children[0].material.uniforms.uCharge.value || 0) : 0; }

  dispose() {
    this.fpsEl?.remove();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}

/* ---------- the deflector mini-game: hold to charge the shield ---------- */
export function deflectorMinigame() {
  return new Promise((resolve) => {
    const root = document.getElementById('ui');
    const wrap = document.createElement('div');
    wrap.id = 'deflector';
    wrap.innerHTML =
      '<div class="dfl-title">🛡️ Charge the deflector shield!</div>' +
      '<div class="dfl-track"><div class="dfl-fill"></div></div>' +
      '<button class="dfl-btn">HOLD TO CHARGE ⚡</button>';
    root.appendChild(wrap);
    const fillEl = wrap.querySelector('.dfl-fill');
    const btn = wrap.querySelector('.dfl-btn');

    let charge = 0, holding = false, raf = 0, last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (holding) charge = Math.min(1, charge + dt * 0.5);
      else charge = Math.max(0, charge - dt * 0.25);
      fillEl.style.width = `${Math.round(charge * 100)}%`;
      if (charge >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      sfx.shard?.();
      wrap.remove();
      window.__sliceDeflect = undefined;
      resolve();
    };
    const down = () => { holding = true; btn.classList.add('held'); sfx.thrust?.(); };
    const up = () => { holding = false; btn.classList.remove('held'); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
    // test hook: complete the mini-game immediately
    window.__sliceDeflect = () => { charge = 1; fillEl.style.width = '100%'; finish(); };
    raf = requestAnimationFrame(tick);
  });
}

/** The charge -> deflector -> gamma-ray-burst climax. Shared by the slice and
 *  the story chapter. The star spins up, the kid holds the shield, then the
 *  burst fires and the deflector splits it. Resolves when the flash subsides. */
export async function pinwheelClimax(scene) {
  ui.setObjective('🛡️ Charge the deflector before the star fires!');
  const charging = tween(5200, (k) => scene.star.userData.setCharge(k));
  await deflectorMinigame();
  await charging;                         // make sure the star is fully lit before it blows
  scene.star.userData.setCharge(1);

  // FIRE: the gamma-ray burst shoots out, the deflector splits it
  ui.setObjective('');
  sfx.whoosh?.();
  const flash = document.createElement('div');
  flash.className = 'slice-flash';
  document.getElementById('ui').appendChild(flash);
  requestAnimationFrame(() => flash.classList.add('on'));
  scene.shake = 1.2;
  await tween(650, (k) => scene.star.userData.setFire(k));
  sfx.land?.();
  setTimeout(() => { flash.classList.remove('on'); setTimeout(() => flash.remove(), 600); }, 250);
  await tween(900, (k) => scene.star.userData.setFire(1 - k * 0.7));
}

/** Run the whole vertical slice. Resolves when the player finishes it. */
export async function runKillerStarSlice(game) {
  const s = loadSave();
  if (!s.name) { s.name = 'Cadet'; save(); }   // slice skips the title/name flow

  const scene = new KillerStarScene(game);
  game.setScene(scene);
  game.pipeline.setBloom(1.15, 0.7, 0.62);     // crank the glow for the showpiece
  await ui.fade(false);
  window.__sliceReady = true;

  await ui.dialogue([
    { who: 'bolt', text: `Cadet ${s.name}, lock your visor. THAT is the Pinwheel — a Wolf-Rayet star, the biggest, hottest kind of star there is.`, stamp: 'real' },
    { who: 'solari', text: 'It has shielded our world for an age... but now it spins faster every night. We are afraid, sky-traveller.' },
    { who: 'bolt', text: 'When a star this big dies, it can fire a GAMMA-RAY BURST — a beam of killing light. We have to read its danger and raise a deflector. Fast.', stamp: 'real' }
  ]);

  // two real-science checks + one countdown calculation
  await ui.askQuestion(pickScience('killerstar'), { contextLabel: "BOLT'S DATABANK CHECK", icon: '🔭' });
  await ui.askQuestion(pickScience('killerstar'), { contextLabel: "BOLT'S DATABANK CHECK", icon: '🔭' });
  await ui.askQuestion(pickMath('subtraction'), { contextLabel: 'COUNTDOWN COMPUTER', icon: '⏱️' });

  await ui.dialogue([
    { who: 'bolt', text: 'The core is destabilising — it\'s charging up! HOLD the deflector to shield Veyra. GO GO GO!' }
  ]);

  await pinwheelClimax(scene);

  await ui.dialogue([
    { who: 'solari', text: 'The beam... it split around your shield! Our world is safe. Thank you, Cadet — you are a star yourself.' },
    { who: 'bolt', text: 'Beautiful work. And Cadet... my map flickered when that beam fired. It pointed past Veyra, toward a faraway blue world. I\'ll log that. For later.', stamp: 'real' }
  ]);

  ui.toast('🌟 Slice complete — graphics test done!', true);
  window.__sliceDone = true;
}
