// The homecoming malfunction, take 2: a real 3D space walk. The cadet floats
// out of the ship (astronaut on a tether) with Earth glowing behind, and taps
// the sparking damage points on the hull to seal them. Tap-to-repair via
// raycasting; resolves once every spark is sealed.
import * as THREE from 'three';
import { makeShip, makeAstronaut, makeStarfield, makeGlowSprite } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { sfx } from '../audio.js';

const EARTH_TEX = 'assets/earth.jpg';

function makeDamage() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xff7a3a, emissive: 0xff4a10, emissiveIntensity: 3 })
  );
  g.add(core);
  const glow = makeGlowSprite(0xff6a3a, 1.2);
  g.add(glow);
  g.userData = { core, glow, sealed: false };
  core.userData.marker = g;
  return g;
}

export class SpaceWalkScene {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03040c);
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 1.2, 12);

    this.scene.add(new THREE.HemisphereLight(0x88aaff, 0x0a0a18, 1.1));
    this.sun = new THREE.DirectionalLight(0xfff6e8, 3.0);
    this.sun.position.set(-16, 8, 10);
    this.scene.add(this.sun);
    this.scene.add(makeStarfield(game.lowDetail ? 700 : 1700, 600));

    // Earth glowing in the background, lower-left
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(13, 56, 40),
      new THREE.MeshStandardMaterial({ color: 0x5a7fa6, roughness: 1, metalness: 0 })
    );
    earth.position.set(-20, -10, -44);
    this.scene.add(earth);
    const halo = makeGlowSprite(0x6fb0ff, 38); halo.position.copy(earth.position); this.scene.add(halo);
    new THREE.TextureLoader().load(EARTH_TEX, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; earth.material.map = t; earth.material.color.set(0xffffff); earth.material.needsUpdate = true; });
    this.earth = earth;

    // the ship, broadside to the camera, drifting gently
    this.ship = makeShip();
    this.ship.scale.setScalar(2.4);
    this.ship.rotation.y = -0.55;
    this.ship.position.set(-0.5, 0.2, 0);
    this.scene.add(this.ship);

    // damage points fixed to the hull (children of the ship)
    this.markers = [];
    const spots = [[0.5, 0.5, -0.3], [-0.4, 0.2, 0.7], [1.4, 0.05, 0.4], [-1.4, 0.05, 0.4], [0.1, 0.35, -1.6]];
    for (const [x, y, z] of spots) {
      const d = makeDamage();
      d.position.set(x, y, z);
      this.ship.add(d);
      this.markers.push(d);
    }
    this.total = this.markers.length;
    this.sealed = 0;

    // the cadet, floating out on a tether
    this.astro = makeAstronaut();
    this.astro.scale.setScalar(1.3);
    this.astro.position.set(4.2, 1.4, 3);
    this.scene.add(this.astro);
    this.tether = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.5, 0.6, 1.5), this.astro.position.clone()]),
      new THREE.LineBasicMaterial({ color: 0xbfd0e0, transparent: true, opacity: 0.6 })
    );
    this.scene.add(this.tether);
    this.astroTarget = this.astro.position.clone();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onTap = (e) => this.handleTap(e);
    game.renderer.domElement.addEventListener('pointerdown', this.onTap);

    ui.setObjective('🛠️ Tap each sparking spot on the ship to seal it!');
    window.__repairReady = true;
    window.__repairSolve = () => { for (const m of this.markers) this.seal(m); };
  }

  seal(m) {
    if (m.userData.sealed) return;
    m.userData.sealed = true;
    m.userData.core.material.color.set(0x5cff9d);
    m.userData.core.material.emissive.set(0x2dbf6d);
    m.userData.glow.material.color.set(0x5cff9d);
    m.userData.glow.scale.setScalar(0.7);
    sfx.collect?.();
    // send the cadet drifting over to the spot just sealed
    this.astroTarget = m.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.8, 0.6, 0.8));
    this.sealed++;
    ui.setObjective(`🛠️ Sealing the hull... ${this.sealed}/${this.total}`);
    if (this.sealed >= this.total) {
      ui.setObjective('');
      sfx.fanfare?.();
      setTimeout(() => this.resolve?.(), 700);
    }
  }

  handleTap(e) {
    if (this.game.activeScene !== this) return;
    const r = this.game.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const cores = this.markers.filter((m) => !m.userData.sealed).map((m) => m.userData.core);
    const hits = this.raycaster.intersectObjects(cores, false);
    if (hits.length) this.seal(hits[0].object.userData.marker);
  }

  update(dt, t) {
    this.ship.position.y = 0.2 + Math.sin(t * 0.7) * 0.25;
    this.ship.rotation.z = Math.sin(t * 0.5) * 0.04;
    this.earth.rotation.y += dt * 0.03;
    // pulse the unsealed sparks
    for (const m of this.markers) {
      if (!m.userData.sealed) { const p = 2.4 + Math.sin(t * 8 + m.id) * 1.6; m.userData.core.material.emissiveIntensity = p; m.userData.glow.scale.setScalar(1.1 + Math.sin(t * 8 + m.id) * 0.3); }
    }
    // drift the cadet toward the target spot, bobbing
    this.astro.position.lerp(this.astroTarget, dt * 1.3);
    this.astro.position.y += Math.sin(t * 1.5) * 0.012;
    this.astro.rotation.y += dt * 0.5;
    const pts = this.tether.geometry.attributes.position;
    pts.setXYZ(1, this.astro.position.x, this.astro.position.y, this.astro.position.z);
    pts.needsUpdate = true;
    this.camera.position.x = Math.sin(t * 0.1) * 1.2;
    this.camera.lookAt(0, 0.6, 0);
  }

  run() { return new Promise((res) => { this.resolve = res; }); }

  dispose() {
    this.game.renderer.domElement.removeEventListener('pointerdown', this.onTap);
    window.__repairReady = undefined; window.__repairSolve = undefined;
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
    });
  }
}
