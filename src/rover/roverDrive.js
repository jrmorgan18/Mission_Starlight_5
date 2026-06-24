// Rover drive: the between-sites travel mode for Mission: Starlight 4, the way
// hyperspace links chapters in the earlier games. You steer Rusty across the
// Martian plains — collect ⭐ sample crystals, dodge boulders — until you reach
// the next site. No fail states: bumps just rattle you.
import * as THREE from 'three';
import { makeRover, makeRock, makeCrystal, makeGround, makeStarfield } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { sfx } from '../audio.js';

const BOUNDS = 7;

export class RoverDriveScene {
  constructor(game, destName) {
    this.game = game;
    this.destName = destName;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x3a1c10);
    this.scene.fog = new THREE.Fog(0x4a2614, 30, 120);

    this.camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 400);
    this.camera.position.set(0, 5.2, 9);

    this.scene.add(new THREE.HemisphereLight(0xe0a070, 0x3a1c10, 1.4));
    const sun = new THREE.DirectionalLight(0xffd0a0, 2.6);
    sun.position.set(10, 16, 6);
    this.scene.add(sun);
    const sky = makeStarfield(game.lowDetail ? 300 : 700, 300);
    sky.position.y = 60;
    this.scene.add(sky);

    // a long scrolling Martian ground strip
    this.ground = makeGround('marsred', 80);
    this.ground.position.z = -20;
    this.scene.add(this.ground);
    this.ground2 = makeGround('marsred', 80);
    this.ground2.position.z = -100;
    this.scene.add(this.ground2);

    // distant mountains for parallax
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(14, 12, 5), new THREE.MeshStandardMaterial({ color: 0x6a3220, roughness: 1, flatShading: true }));
      m.position.set((i - 3) * 26 + 8, 4, -150);
      this.scene.add(m);
    }

    this.rover = makeRover();
    this.rover.scale.setScalar(1.7);
    this.rover.position.set(0, 0, 0);
    this.scene.add(this.rover);

    this.progress = 0;
    this.speed = 1;
    this.shake = 0;
    this.done = false;
    this.input = { x: 0, thrust: false };
    this.keys = {};

    this.rocks = [];
    this.gems = [];
    const detail = game.lowDetail ? 0.6 : 1;
    for (let i = 0; i < Math.round(10 * detail); i++) this.spawnRock(true);
    for (let i = 0; i < Math.round(10 * detail); i++) this.spawnGem(true);

    this.onKey = (e) => {
      const d = e.type === 'keydown';
      this.keys[e.key.toLowerCase()] = d;
      if ([' ', 'arrowleft', 'arrowright', 'arrowup'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    addEventListener('keydown', this.onKey);
    addEventListener('keyup', this.onKey);
    this.buildControls();
    sfx.thrust?.();
  }

  spawnRock(initial = false) {
    const r = makeRock(0.7 + Math.random() * 0.9, 0x7a3a22);
    r.position.set((Math.random() * 2 - 1) * BOUNDS, 0, initial ? -20 - Math.random() * 110 : -120);
    this.scene.add(r);
    this.rocks.push(r);
  }

  spawnGem(initial = false) {
    const g = makeCrystal(0xffe07a, 1.3);
    g.position.set((Math.random() * 2 - 1) * BOUNDS, 0.6, initial ? -20 - Math.random() * 110 : -120 - Math.random() * 30);
    this.scene.add(g);
    this.gems.push(g);
  }

  /* ---- touch controls: steer + GO (window-tracked, iPad-safe) ---- */
  buildControls() {
    const uiRoot = document.getElementById('ui');
    this.joy = document.createElement('div');
    this.joy.id = 'joystick';
    const stick = document.createElement('div');
    stick.className = 'stick';
    this.joy.appendChild(stick);
    uiRoot.appendChild(this.joy);

    const setStick = (dx) => { stick.style.transform = `translate(${dx * 36}px, 0px)`; this.input.x = dx; };
    const steerFrom = (e) => {
      const r = this.joy.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      setStick(THREE.MathUtils.clamp(dx, -1, 1));
    };
    let joyId = null;
    const joyMove = (e) => { if (e.pointerId === joyId) { e.preventDefault(); steerFrom(e); } };
    const joyEnd = (e) => { if (e.pointerId === joyId) { joyId = null; setStick(0); } };
    this.joy.addEventListener('pointerdown', (e) => { e.preventDefault(); joyId = e.pointerId; steerFrom(e); }, { passive: false });
    window.addEventListener('pointermove', joyMove, { passive: false });
    window.addEventListener('pointerup', joyEnd);
    window.addEventListener('pointercancel', joyEnd);

    this.goBtn = document.createElement('button');
    this.goBtn.id = 'thrust-btn';
    this.goBtn.textContent = 'GO! 🚀';
    let goId = null;
    const goStart = (e) => { e.preventDefault(); goId = e.pointerId; this.input.thrust = true; this.goBtn.classList.add('held'); };
    const goEnd = (e) => { if (goId !== null && e.pointerId !== goId) return; goId = null; this.input.thrust = false; this.goBtn.classList.remove('held'); };
    this.goBtn.addEventListener('pointerdown', goStart, { passive: false });
    window.addEventListener('pointerup', goEnd);
    window.addEventListener('pointercancel', goEnd);
    uiRoot.appendChild(this.goBtn);

    this._winCtl = [['pointermove', joyMove], ['pointerup', joyEnd], ['pointercancel', joyEnd], ['pointerup', goEnd], ['pointercancel', goEnd]];
  }

  removeControls() {
    this.joy?.remove();
    this.goBtn?.remove();
    removeEventListener('keydown', this.onKey);
    removeEventListener('keyup', this.onKey);
    if (this._winCtl) { for (const [t, fn] of this._winCtl) window.removeEventListener(t, fn); this._winCtl = null; }
  }

  update(dt, t) {
    if (this.done) return;
    const kx = (this.keys['arrowright'] || this.keys['d'] ? 1 : 0) - (this.keys['arrowleft'] || this.keys['a'] ? 1 : 0);
    const ix = kx || this.input.x;
    const thrust = this.input.thrust || this.keys[' '] || this.keys['arrowup'];

    this.rover.position.x = THREE.MathUtils.clamp(this.rover.position.x + ix * 11 * dt, -BOUNDS, BOUNDS);
    this.rover.rotation.y = THREE.MathUtils.lerp(this.rover.rotation.y, -ix * 0.4, dt * 6);
    this.rover.rotation.z = THREE.MathUtils.lerp(this.rover.rotation.z, -ix * 0.18, dt * 6);
    this.rover.position.y = Math.abs(Math.sin(t * 14)) * 0.08;   // bumpy ride

    const target = thrust ? 2.6 : 1.2;
    this.speed = THREE.MathUtils.lerp(this.speed, target, dt * 2.2);
    const rate = new URLSearchParams(location.search).has('fast') ? 0.16 : 0.02;
    this.progress += dt * rate * this.speed;
    ui.setObjective(`🚜 Drive Rusty to ${this.destName}! ${Math.min(99, Math.round(this.progress * 100))}%`);

    const travel = 36 * this.speed * dt;
    // scroll the two ground strips
    for (const g of [this.ground, this.ground2]) {
      g.position.z += travel;
      if (g.position.z > 60) g.position.z -= 160;
    }
    for (const r of this.rocks) {
      r.position.z += travel;
      r.rotation.x += dt;
      if (r.position.z > 12) { r.position.z = -120 - Math.random() * 30; r.position.x = (Math.random() * 2 - 1) * BOUNDS; }
      if (Math.abs(r.position.z) < 2.2 && Math.abs(r.position.x - this.rover.position.x) < 1.8) {
        sfx.bump?.(); this.shake = 0.5; this.speed = 0.5; r.position.z = -120;
      }
    }
    for (const g of this.gems) {
      g.position.z += travel;
      g.rotation.y += dt * 3;
      if (g.position.z > 12) { g.position.z = -120 - Math.random() * 30; g.position.x = (Math.random() * 2 - 1) * BOUNDS; }
      if (Math.abs(g.position.z) < 2.2 && Math.abs(g.position.x - this.rover.position.x) < 1.8) {
        sfx.collect?.(); ui.addStarBits(1); g.position.z = -120 - Math.random() * 30;   // HUD pulses; no screen-blocking toast
      }
    }

    if (this.progress >= 1 && !this.done) { this.finish(); return; }

    this.shake = Math.max(0, this.shake - dt);
    const sx = (Math.random() - 0.5) * this.shake;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.rover.position.x * 0.5 + sx, dt * 5);
    this.camera.lookAt(this.rover.position.x * 0.4, 1, -10);
  }

  async finish() {
    this.done = true;
    await ui.fade(true);
    ui.setObjective('');
    this.removeControls();
    this.resolve?.();
  }

  run() { return new Promise((resolve) => { this.resolve = resolve; }); }

  dispose() {
    this.removeControls();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}
