// Mars set-pieces for Mission: Starlight 4:
//  - TerraformScene: the climax — Mars blooms from red to blue-green under bloom.
//  - makeSolarWind: a particle stream + magnetic-shield bubble for "Why a Planet
//    Dies" (chapter 2), showing the solar wind stripping a shieldless world.
import * as THREE from 'three';
import { makeStarfield, makeGlowSprite, worldTexture } from '../world/builders.js';

function globe(key, radius) {
  const tex = worldTexture(key);
  const mat = new THREE.MeshStandardMaterial({
    map: tex.map, bumpMap: tex.bump, bumpScale: 1.2, roughness: 0.92, metalness: 0.03,
    transparent: true, opacity: 1
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 56, 40), mat);
}

/* ---------- the terraforming showpiece (chapter 5) ---------- */
export class TerraformScene {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05030a);

    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 1.5, 16);

    this.scene.add(new THREE.HemisphereLight(0x8899ff, 0x140a08, 1.2));
    const sun = new THREE.DirectionalLight(0xfff2dd, 3.0);
    sun.position.set(20, 12, 14);
    this.scene.add(sun);
    this.scene.add(makeStarfield(game.lowDetail ? 500 : 1300, 360));

    const R = 5;
    this.planet = new THREE.Group();
    this.red = globe('marsred', R);
    this.alive = globe('marsalive', R * 1.001);   // a hair larger to avoid z-fight
    this.alive.material.opacity = 0;
    this.planet.add(this.red, this.alive);
    this.planet.position.set(0, 0.5, 0);
    this.scene.add(this.planet);

    // atmosphere shell that thickens and turns blue as Mars wakes
    this.atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.06, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0xd88a5a, transparent: true, opacity: 0.08, side: THREE.BackSide, depthWrite: false })
    );
    this.planet.add(this.atmo);
    this.glow = makeGlowSprite(0xd88a5a, R * 3.2);
    this.glow.position.copy(this.planet.position);
    this.scene.add(this.glow);

    this.progress = 0;
  }

  /** 0 = dead red Mars, 1 = living blue-green Mars. */
  setProgress(k) {
    this.progress = k;
    this.alive.material.opacity = k;
    this.red.material.opacity = 1 - k * 0.85;
    const col = new THREE.Color(0xd88a5a).lerp(new THREE.Color(0x7ac8ff), k);
    this.atmo.material.color.copy(col);
    this.atmo.material.opacity = 0.08 + k * 0.22;
    this.glow.material.color.copy(col);
  }

  update(dt, t) {
    this.planet.rotation.y += dt * 0.12;
    this.camera.position.x = Math.sin(t * 0.1) * 2.4;
    this.camera.lookAt(0, 0.5, 0);
  }

  dispose() {
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
    });
  }
}

/* ---------- solar wind + magnetic shield (chapter 2) ---------- */
/** Returns a group with userData.update(dt,t) and userData.setShield(on).
 *  Particles stream from +x toward the planet at origin; with the shield on
 *  they curve around the bubble, with it off they punch straight through. */
export function makeSolarWind(count = 160) {
  const group = new THREE.Group();

  // the magnetic-shield bubble (hidden until raised)
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0x5ce8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  group.add(shield);

  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const data = [];
  const reset = (i, spread = true) => {
    const y = (Math.random() - 0.5) * 9;
    const z = (Math.random() - 0.5) * 9;
    const x = spread ? 8 + Math.random() * 14 : 22;
    data[i] = { x, y, z, v: 5 + Math.random() * 5 };
    pos.set([x, y, z], i * 3);
  };
  for (let i = 0; i < count; i++) reset(i);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd070, size: 0.18, transparent: true, opacity: 0.9 }));
  group.add(points);

  let shieldOn = false;
  group.userData.setShield = (on) => {
    shieldOn = on;
    shield.material.opacity = on ? 0.22 : 0;
  };
  group.userData.update = (dt) => {
    const p = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      d.x -= d.v * dt;
      // shield: deflect particles around the bubble (radius ~3.4)
      if (shieldOn) {
        const r = Math.hypot(d.x, d.y, d.z);
        if (r < 4 && d.x < 4) { d.y += Math.sign(d.y || 1) * 6 * dt; d.x += 2.5 * dt; }
      }
      if (d.x < -6) reset(i, false);
      p.setXYZ(i, d.x, d.y, d.z);
    }
    p.needsUpdate = true;
    shield.rotation.y += dt * 0.4;
  };
  return group;
}
