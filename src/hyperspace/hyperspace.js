// Hyperspace "Light-River" flight: the sequel's showpiece travel mode.
// Jump entry stretches the stars, then you ride a glowing warp tunnel —
// steer to catch photons, dodge gravity ripples. No fail states: ripples
// just rattle the ship. Exits with the classic snap-back flash.
import * as THREE from 'three';
import { makeShip, makeGlowSprite } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { sfx } from '../audio.js';
import { hasUpgrade } from '../save.js';

const BOUNDS = 7;            // steering radius inside the tunnel
const TUNNEL_R = 16;
const TUNNEL_LEN = 400;

/* ---- the tunnel walls: scrolling light-river shader ---- */
function tunnelMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uOpacity: { value: 0 }
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uSpeed;
      uniform float uOpacity;
      varying vec2 vUv;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        // vUv.x wraps around the tube, vUv.y runs along its length
        float around = vUv.x;
        float along = vUv.y;

        // flowing streak lanes
        float lanes = 0.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float lane = fract(around * (14.0 + fi * 9.0) + hash(fi * 7.1));
          float flow = fract(along * (3.0 + fi * 2.0) - uTime * uSpeed * (0.6 + fi * 0.45));
          float streak = smoothstep(0.0, 0.25, flow) * smoothstep(1.0, 0.55, flow);
          lanes += streak * smoothstep(0.06, 0.0, abs(lane - 0.5) - 0.42) * (0.5 - fi * 0.12);
        }

        // slow color shift down the tunnel: cyan -> violet -> gold
        vec3 cA = vec3(0.25, 0.85, 1.0);
        vec3 cB = vec3(0.55, 0.35, 1.0);
        vec3 cC = vec3(1.0, 0.8, 0.35);
        float ph = sin(along * 6.2831 + uTime * 0.5) * 0.5 + 0.5;
        vec3 col = mix(mix(cA, cB, ph), cC, lanes * 0.4);

        // brightness: streaks + soft ambient glow (bloom adds the rest)
        float glow = lanes * 1.05 + 0.05;
        gl_FragColor = vec4(col * glow, glow * uOpacity);
      }
    `
  });
}

export class HyperspaceScene {
  constructor(game, destName, { peril = false } = {}) {
    this.game = game;
    this.destName = destName;
    this.peril = peril;          // "race the beam" mode: red danger vignette + urgent objective
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 2.6, 9);

    this.scene.add(new THREE.HemisphereLight(0x8899ff, 0x110a22, 1.4));

    // the tunnel
    this.tunnelMat = tunnelMaterial();
    this.tunnel = new THREE.Mesh(
      new THREE.CylinderGeometry(TUNNEL_R, TUNNEL_R, TUNNEL_LEN, 48, 24, true),
      this.tunnelMat
    );
    this.tunnel.rotation.x = Math.PI / 2;
    this.tunnel.position.z = -TUNNEL_LEN / 4;
    this.scene.add(this.tunnel);

    // star streaks: instanced stretched shards racing past
    const streakGeo = new THREE.BoxGeometry(0.05, 0.05, 5);
    const streakMat = new THREE.MeshBasicMaterial({ color: 0x86aed0 });
    this.streakCount = game.pipeline?.quality === 'low' ? 90 : 220;
    this.streaks = new THREE.InstancedMesh(streakGeo, streakMat, this.streakCount);
    this.streakData = [];
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.streakCount; i++) {
      const d = this.resetStreak(true);
      this.streakData.push(d);
      m.setPosition(d.x, d.y, d.z);
      this.streaks.setMatrixAt(i, m);
    }
    this.scene.add(this.streaks);

    this.ship = makeShip();
    this.scene.add(this.ship);

    // Suit Lab upgrades: Starship Paint recolors the engine glow, Star Magnet
    // widens the photon pickup radius, Ion Boosters raise the lightspeed cap.
    if (hasUpgrade('paint') && this.ship.userData.engineGlow) {
      this.ship.userData.engineGlow.material.color.set(0xff7ad0);
    }
    this.grabR = hasUpgrade('magnet') ? 4.6 : 2.4;
    this.boostTop = hasUpgrade('boost') ? 3.6 : 2.8;

    this.progress = 0;
    this.speed = 1;
    this.input = { x: 0, y: 0, thrust: false };
    this.done = false;
    this.exiting = false;
    this.shake = 0;
    this.entryT = 0;          // jump-entry stretch phase

    // photons to collect + gravity ripples to dodge
    this.photons = [];
    this.ripples = [];
    const detail = game.pipeline?.quality === 'low' ? 0.6 : 1;
    for (let i = 0; i < Math.round(14 * detail); i++) this.spawnPhoton(true);
    for (let i = 0; i < Math.round(8 * detail); i++) this.spawnRipple(true);

    this.keys = {};
    this.onKey = (e) => {
      const down = e.type === 'keydown';
      this.keys[e.key.toLowerCase()] = down;
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    addEventListener('keydown', this.onKey);
    addEventListener('keyup', this.onKey);
    this.buildControls();

    // entry flash element
    this.flash = document.createElement('div');
    this.flash.className = 'hyper-flash';
    document.getElementById('ui').appendChild(this.flash);
    requestAnimationFrame(() => this.flash.classList.add('on'));
    setTimeout(() => this.flash.classList.remove('on'), 500);
    sfx.whoosh();

    if (this.peril) {
      this.vignette = document.createElement('div');
      this.vignette.className = 'peril-vignette';
      document.getElementById('ui').appendChild(this.vignette);
    }
  }

  /* ----- touch controls (same feel as game 1) ----- */
  buildControls() {
    const uiRoot = document.getElementById('ui');

    this.joy = document.createElement('div');
    this.joy.id = 'joystick';
    const stick = document.createElement('div');
    stick.className = 'stick';
    this.joy.appendChild(stick);
    uiRoot.appendChild(this.joy);

    const setStick = (dx, dy) => {
      stick.style.transform = `translate(${dx * 36}px, ${dy * 36}px)`;
      this.input.x = dx;
      this.input.y = -dy;
    };
    const steerFrom = (e) => {
      const r = this.joy.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      if (len > 1) { dx /= len; dy /= len; }
      setStick(dx, dy);
    };

    // iPad Safari delivers touch pointermove reliably only when we preventDefault
    // and track the drag on window — setPointerCapture alone is flaky there.
    let joyId = null;
    const joyMove = (e) => { if (e.pointerId === joyId) { e.preventDefault(); steerFrom(e); } };
    const joyEnd = (e) => { if (e.pointerId === joyId) { joyId = null; setStick(0, 0); } };
    this.joy.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      joyId = e.pointerId;
      steerFrom(e);              // a press alone already steers, even without a drag
    }, { passive: false });
    window.addEventListener('pointermove', joyMove, { passive: false });
    window.addEventListener('pointerup', joyEnd);
    window.addEventListener('pointercancel', joyEnd);

    this.thrustBtn = document.createElement('button');
    this.thrustBtn.id = 'thrust-btn';
    this.thrustBtn.textContent = 'LIGHTSPEED ⚡';
    let thrustId = null;
    const thrustStart = (e) => {
      e.preventDefault();
      thrustId = e.pointerId;
      this.input.thrust = true;
      this.thrustBtn.classList.add('held');
      sfx.thrust();
    };
    // End on pointer-UP, never pointerleave: the .held scale transform shrinks the
    // button under the finger and would fire leave instantly on iPad, cutting boost.
    const thrustEnd = (e) => {
      if (thrustId !== null && e.pointerId !== thrustId) return;
      thrustId = null;
      this.input.thrust = false;
      this.thrustBtn.classList.remove('held');
    };
    this.thrustBtn.addEventListener('pointerdown', thrustStart, { passive: false });
    window.addEventListener('pointerup', thrustEnd);
    window.addEventListener('pointercancel', thrustEnd);
    uiRoot.appendChild(this.thrustBtn);

    // window-level handlers to detach when we leave hyperspace
    this._winCtl = [['pointermove', joyMove], ['pointerup', joyEnd], ['pointercancel', joyEnd], ['pointerup', thrustEnd], ['pointercancel', thrustEnd]];
  }

  removeControls() {
    this.joy?.remove();
    this.thrustBtn?.remove();
    this.flash?.remove();
    this.vignette?.remove();
    removeEventListener('keydown', this.onKey);
    removeEventListener('keyup', this.onKey);
    if (this._winCtl) { for (const [type, fn] of this._winCtl) window.removeEventListener(type, fn); this._winCtl = null; }
  }

  /* ----- spawners ----- */
  resetStreak(initial = false) {
    const a = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * (TUNNEL_R - 9);
    return {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      z: initial ? -20 - Math.random() * 300 : -320,
      v: 60 + Math.random() * 70
    };
  }

  spawnPhoton(initial = false) {
    const group = new THREE.Group();
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffd95c, emissiveIntensity: 3 })
    );
    group.add(orb, makeGlowSprite(0xffd95c, 2.6));
    group.position.set(
      (Math.random() * 2 - 1) * BOUNDS,
      (Math.random() * 2 - 1) * BOUNDS * 0.7,
      initial ? -30 - Math.random() * 280 : -300
    );
    this.scene.add(group);
    this.photons.push(group);
  }

  spawnRipple(initial = false) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.22, 10, 36),
      new THREE.MeshStandardMaterial({ color: 0x8a5cff, emissive: 0x6a3ad0, emissiveIntensity: 1.6, transparent: true, opacity: 0.85 })
    );
    ring.position.set(
      (Math.random() * 2 - 1) * BOUNDS,
      (Math.random() * 2 - 1) * BOUNDS * 0.7,
      initial ? -30 - Math.random() * 280 : -300
    );
    this.scene.add(ring);
    this.ripples.push(ring);
  }

  /* ----- main loop ----- */
  update(dt, t) {
    if (this.done) return;
    this.entryT += dt;
    const entering = this.entryT < 1.6;

    // tunnel fades in during entry, shader scrolls with speed
    this.tunnelMat.uniforms.uTime.value = t;
    this.tunnelMat.uniforms.uSpeed.value = this.speed * (entering ? this.entryT / 1.6 : 1);
    this.tunnelMat.uniforms.uOpacity.value = this.exiting
      ? Math.max(0, this.tunnelMat.uniforms.uOpacity.value - dt * 1.4)
      : Math.min(1, this.entryT / 1.2);

    // FOV punch during entry and at lightspeed
    const targetFov = entering ? 70 + (this.entryT / 1.6) * 14 : (this.input.thrust || this.keys[' '] ? 92 : 78);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 3);
    this.camera.updateProjectionMatrix();

    const kx = (this.keys['arrowright'] || this.keys['d'] ? 1 : 0) - (this.keys['arrowleft'] || this.keys['a'] ? 1 : 0);
    const ky = (this.keys['arrowup'] || this.keys['w'] ? 1 : 0) - (this.keys['arrowdown'] || this.keys['s'] ? 1 : 0);
    const ix = kx || this.input.x;
    const iy = ky || this.input.y;
    const thrust = this.input.thrust || this.keys[' '];

    if (!this.exiting) {
      this.ship.position.x = THREE.MathUtils.clamp(this.ship.position.x + ix * 13 * dt, -BOUNDS, BOUNDS);
      this.ship.position.y = THREE.MathUtils.clamp(this.ship.position.y + iy * 10 * dt, -BOUNDS * 0.7, BOUNDS * 0.7);
      this.ship.rotation.z = THREE.MathUtils.lerp(this.ship.rotation.z, -ix * 0.7, dt * 6);
      this.ship.rotation.x = THREE.MathUtils.lerp(this.ship.rotation.x, iy * 0.35, dt * 6);

      const target = thrust ? this.boostTop : 1.2;
      this.speed = THREE.MathUtils.lerp(this.speed, target, dt * 2.5);
      const rate = new URLSearchParams(location.search).has('fast') ? 0.15 : 0.016;
      this.progress += dt * rate * this.speed;
      this.ship.userData.engineGlow.scale.setScalar(0.9 + this.speed * 0.35 + Math.sin(t * 24) * 0.08);
      ui.setObjective(this.peril
        ? `⚠️ OUTRUN THE BURST — reach ${this.destName}! ${Math.min(99, Math.round(this.progress * 100))}%`
        : `🌀 Ride the light-river to ${this.destName}! ${Math.min(99, Math.round(this.progress * 100))}%`);
    }

    const travel = 70 * this.speed * dt;

    // streaks race by
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.streakCount; i++) {
      const d = this.streakData[i];
      d.z += (d.v + 40 * this.speed) * dt;
      if (d.z > 14) Object.assign(d, this.resetStreak());
      m.setPosition(d.x, d.y, d.z);
      this.streaks.setMatrixAt(i, m);
    }
    this.streaks.instanceMatrix.needsUpdate = true;

    // tunnel slowly rotates for that "river current" feel
    this.tunnel.rotation.z += dt * 0.12 * this.speed;

    for (const photon of this.photons) {
      photon.position.z += travel;
      photon.rotation.y += dt * 3;
      if (photon.position.z > 12) {
        photon.position.z = -300 - Math.random() * 50;
        photon.position.x = (Math.random() * 2 - 1) * BOUNDS;
        photon.position.y = (Math.random() * 2 - 1) * BOUNDS * 0.7;
      }
      if (!this.exiting && photon.position.distanceTo(this.ship.position) < this.grabR) {
        sfx.collect();
        ui.addStarBits(1);   // HUD star pill pulses; no screen-blocking toast
        photon.position.z = -300 - Math.random() * 50;
      }
    }
    for (const ring of this.ripples) {
      ring.position.z += travel;
      ring.rotation.z += dt * 1.5;
      const pulse = 1 + Math.sin(t * 4 + ring.id) * 0.15;
      ring.scale.setScalar(pulse);
      if (ring.position.z > 12) {
        ring.position.z = -300 - Math.random() * 60;
        ring.position.x = (Math.random() * 2 - 1) * BOUNDS;
        ring.position.y = (Math.random() * 2 - 1) * BOUNDS * 0.7;
      }
      if (!this.exiting && ring.position.distanceTo(this.ship.position) < 2.3) {
        sfx.bump();
        this.shake = 0.6;
        this.speed = 0.5;
        ring.position.z = -300;
      }
    }

    if (this.progress >= 1 && !this.exiting) this.startExit();

    if (this.exiting) {
      this.exitT += dt;
      this.speed = THREE.MathUtils.lerp(this.speed, 3.4, dt * 2);
      this.ship.position.lerp(new THREE.Vector3(0, 0, this.ship.position.z), dt * 3);
      if (this.exitT > 1.2 && !this.flashed) {
        this.flashed = true;
        this.flash.classList.add('on');     // snap-back flash
        sfx.land();
      }
      if (this.exitT > 1.7 && !this.fading) {
        this.fading = true;
        this.finish();
      }
    }

    // camera follow + shake
    this.shake = Math.max(0, this.shake - dt);
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.ship.position.x * 0.6 + sx, dt * 5);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 2.6 + this.ship.position.y * 0.5 + sy, dt * 5);
    this.camera.lookAt(this.ship.position.x * 0.8, this.ship.position.y * 0.8, -20);
  }

  startExit() {
    this.exiting = true;
    this.exitT = 0;
    ui.setObjective(`✨ Arriving at ${this.destName}...`);
  }

  async finish() {
    await ui.fade(true);
    this.flash.classList.remove('on');
    this.done = true;
    ui.setObjective('');
    this.removeControls();
    this.resolve?.();
  }

  /** Runs the ride; resolves once arrived (screen is faded to black). */
  run() {
    return new Promise((resolve) => { this.resolve = resolve; });
  }

  dispose() {
    this.removeControls();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}
