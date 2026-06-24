// World diorama: a small explorable 3D scene on an alien world or station.
// The cadet walks where you tap; tapping a marked character/object walks
// over and triggers its story moment. Same proven engine as game 1, with
// PBR grounds and per-world atmospheres.
import * as THREE from 'three';
import { makeGround, makeStarfield, makeAstronaut, makeMarker, addSceneLights, animateProps, makeShip, makeNebulaCloud } from '../world/builders.js';
import { sfx } from '../audio.js';

const SKY = {
  planet9:  { bg: 0x050310, fog: 0x050310, lights: { sky: 0x8a75d0, ground: 0x141028, intensity: 2.3 } },
  proxima:  { bg: 0x2a0e14, fog: 0x2a0e14, lights: { sky: 0xff8a6a, ground: 0x2a0e14, sunColor: 0xff7a50, intensity: 2.4 } },
  trappist: { bg: 0x1a2030, fog: 0x1a2030, lights: { sky: 0xffb89a, ground: 0x141a28, sunColor: 0xff9a70, intensity: 2.2 } },
  cancri:   { bg: 0x180a06, fog: 0x2a1208, lights: { sky: 0xff9a50, ground: 0x2a1208, sunColor: 0xffc080, intensity: 2.8 } },
  pulsar:   { bg: 0x0a1228, fog: 0x0a1228, lights: { sky: 0xaac8ff, ground: 0x101828, intensity: 2.2 } },
  blackhole: { bg: 0x040208, fog: 0x040208, lights: { sky: 0xffa86a, ground: 0x1a0e08, sunColor: 0xffb070, intensity: 2.2 } },
  finale:   { bg: 0x1c0f33, fog: 0x2a1545, lights: { sky: 0xff9ec8, ground: 0x1c0f33, intensity: 2.2 } },
  // --- Mission: Starlight 3 worlds ---
  veyra:       { bg: 0x07283a, fog: 0x0a3a52, lights: { sky: 0x6fd0ee, ground: 0x0a3a4a, sunColor: 0xbfe8ff, intensity: 2.5 } },
  observatory: { bg: 0x060a1c, fog: 0x0a1024, lights: { sky: 0x9ab8ff, ground: 0x10182c, intensity: 2.2 } },
  spaceport:   { bg: 0x12131e, fog: 0x1a1c2a, lights: { sky: 0xbfd0ff, ground: 0x141622, sunColor: 0xdfe8ff, intensity: 2.5 } },
  harbor:      { bg: 0x0a2630, fog: 0x103a3a, lights: { sky: 0x7ae0c0, ground: 0x0e2e30, sunColor: 0xcffae8, intensity: 2.4 } },
  // --- Mission: Starlight 4 (Mars) worlds ---
  marsred:     { bg: 0x2a1408, fog: 0x4a2614, lights: { sky: 0xe0a070, ground: 0x3a1c10, sunColor: 0xffd0a0, intensity: 2.4 } },
  marscanyon:  { bg: 0x301808, fog: 0x52301a, lights: { sky: 0xe8aa78, ground: 0x40200f, sunColor: 0xffd8a8, intensity: 2.5 } },
  marspolar:   { bg: 0x241830, fog: 0x352848, lights: { sky: 0xc8b8e8, ground: 0x1c1428, sunColor: 0xe0d0ff, intensity: 2.3 } },
  marsalive:   { bg: 0x123048, fog: 0x1a4a5e, lights: { sky: 0x8fd8e0, ground: 0x14383a, sunColor: 0xeafff0, intensity: 2.6 } }
};

export class WorldScene {
  constructor(game, key) {
    this.game = game;
    this.key = key;
    const cfg = SKY[key] || SKY.planet9;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(cfg.bg);
    this.scene.fog = new THREE.Fog(cfg.fog, 30, 85);

    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
    this.camera.position.set(0, 6.5, 16);
    this.camera.lookAt(0, 2.5, 0);

    addSceneLights(this.scene, cfg.lights);
    const stars = makeStarfield(this.game.lowDetail ? 350 : 900, 320);
    stars.position.y = 40;
    this.scene.add(stars);

    if (key === 'finale' || key === 'harbor') {
      const cloud = makeNebulaCloud(key === 'harbor' ? 0x5ce8c0 : 0xe87aa8, 12, 70);
      cloud.position.set(0, 24, -50);
      this.scene.add(cloud);
    }

    this.ground = makeGround(key);
    this.scene.add(this.ground);

    this.hero = makeAstronaut();
    this.hero.position.set(0, 0, 6);
    this.scene.add(this.hero);

    // the parked ship, for scenery and for leaving
    this.ship = makeShip();
    this.ship.scale.setScalar(1.4);
    this.ship.position.set(7.5, 0.8, 7.5);
    this.ship.rotation.y = -0.7;
    this.scene.add(this.ship);

    this.walkTarget = null;
    this.interactives = new Map();   // id -> { obj, marker, pending }
    this.tapEnabled = true;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.onTap = (e) => this.handleTap(e);
    this.game.renderer.domElement.addEventListener('pointerdown', this.onTap);
  }

  /** Add any object; optionally make it tappable with id. */
  place(obj, x, z, { id = null, ry = 0 } = {}) {
    obj.position.x = x;
    obj.position.z = z;
    obj.rotation.y = ry;
    this.scene.add(obj);
    if (id) this.interactives.set(id, { obj, marker: null, pending: null });
    return obj;
  }

  /** Show a "!" marker over an interactive and resolve when the hero reaches it. */
  waitInteract(id) {
    const item = this.interactives.get(id);
    if (!item) return Promise.resolve();
    if (!item.marker) {
      item.marker = makeMarker();
      item.marker.position.set(item.obj.position.x, 3.1, item.obj.position.z);
      this.scene.add(item.marker);
    }
    return new Promise((resolve) => { item.pending = resolve; });
  }

  clearMarker(id) {
    const item = this.interactives.get(id);
    if (item?.marker) {
      this.scene.remove(item.marker);
      item.marker = null;
    }
  }

  uiBlocked() {
    return !!(document.getElementById('dialogue') || document.getElementById('question-panel') ||
              document.getElementById('journal') || document.getElementById('parent-zone') ||
              document.querySelector('.screen'));
  }

  handleTap(e) {
    if (!this.tapEnabled || this.uiBlocked() || this.game.activeScene !== this) return;
    const r = this.game.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // interactive objects first
    for (const [id, item] of this.interactives) {
      const hits = this.raycaster.intersectObject(item.obj, true);
      const markerHit = item.marker && this.raycaster.intersectObject(item.marker).length;
      if (hits.length || markerHit) {
        sfx.tap();
        this.walkTo(item.obj.position.x, item.obj.position.z, () => {
          if (item.pending) {
            const resolve = item.pending;
            item.pending = null;
            this.clearMarker(id);
            resolve();
          }
        });
        return;
      }
    }
    // otherwise walk to the tapped ground point
    const hit = this.raycaster.intersectObject(this.ground);
    if (hit.length) {
      const p = hit[0].point;
      const d = Math.hypot(p.x, p.z);
      if (d < 24) {
        sfx.tap();
        this.walkTo(p.x, p.z);
      }
    }
  }

  /** Programmatic version of tapping an interactive — used by automated tests. */
  debugTap(id) {
    const item = this.interactives.get(id);
    if (!item) return false;
    this.walkTo(item.obj.position.x, item.obj.position.z, () => {
      if (item.pending) {
        const resolve = item.pending;
        item.pending = null;
        this.clearMarker(id);
        resolve();
      }
    });
    return true;
  }

  walkTo(x, z, onArrive = null) {
    // stop a step short of the destination so we don't stand inside characters
    const dx = x - this.hero.position.x, dz = z - this.hero.position.z;
    const len = Math.hypot(dx, dz);
    const stop = onArrive ? Math.min(1.8, len) : 0;
    this.walkTarget = {
      x: x - (len ? (dx / len) * stop : 0),
      z: z - (len ? (dz / len) * stop : 0),
      onArrive
    };
  }

  update(dt, t) {
    animateProps(this.scene, t);
    this.scene.traverse((o) => o.userData.update && o.userData.update(dt, t));
    this.scene.traverse((o) => o.userData.face && o.userData.face(this.camera));

    // hero walking
    if (this.walkTarget) {
      const wt = this.walkTarget;
      const dx = wt.x - this.hero.position.x;
      const dz = wt.z - this.hero.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) {
        this.hero.position.y = 0;
        const cb = wt.onArrive;
        this.walkTarget = null;
        cb?.();
      } else {
        const sp = 6 * dt;
        this.hero.position.x += (dx / d) * Math.min(sp, d);
        this.hero.position.z += (dz / d) * Math.min(sp, d);
        this.hero.rotation.y = Math.atan2(dx, dz);
        this.hero.position.y = Math.abs(Math.sin(t * 10)) * 0.18;   // little low-gravity bounce
      }
    }

    // gentle camera follow
    const targetX = this.hero.position.x * 0.4;
    const targetZ = 16 + this.hero.position.z * 0.25;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, dt * 2);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, dt * 2);
    this.camera.lookAt(this.hero.position.x * 0.5, 2.5, this.hero.position.z * 0.3);
  }

  dispose() {
    this.game.renderer.domElement.removeEventListener('pointerdown', this.onTap);
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}
