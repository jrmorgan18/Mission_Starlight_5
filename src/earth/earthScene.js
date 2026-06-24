// PHASE-A VISUAL SLICE — "Homecoming": the cadet returns to Earth.
// This proves the new NASA-asset pipeline (real public-domain Blue Marble +
// cloud textures loaded locally, no CDN) renders smoothly on the iPad before we
// build the rest of Mission: Starlight 5. Boot with ?slice.
//
// A self-contained scene: a real-textured Earth (day map + drifting clouds + a
// fresnel atmosphere rim) turning over a deep starfield, under bloom.
import * as THREE from 'three';
import { makeStarfield } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { loadSave, save } from '../save.js';

const EARTH_TEX = 'assets/earth.jpg';     // NASA Blue Marble (public domain)
const CLOUD_TEX = 'assets/clouds.jpg';    // NASA cloud map (public domain)

/* a soft blue atmosphere rim via fresnel */
function atmosphere(radius) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0x5ab4ff) } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vView;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; varying vec3 vN; varying vec3 vView;
      void main() {
        float f = pow(1.0 - max(dot(vN, vView), 0.0), 2.5);
        gl_FragColor = vec4(uColor, f * 0.9);
      }`
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.025, 64, 48), mat);
}

export class EarthScene {
  constructor(game, { showFps = true } = {}) {
    this.game = game;
    this.showFps = showFps;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03040a);

    this.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0.6, 16);

    this.scene.add(new THREE.AmbientLight(0x223044, 1.0));
    this.sun = new THREE.DirectionalLight(0xfff6e8, 3.2);
    this.sun.position.set(-14, 6, 10);
    this.scene.add(this.sun);

    this.scene.add(makeStarfield(game.lowDetail ? 800 : 2200, 600));

    const R = 5;
    this.earth = new THREE.Mesh(
      new THREE.SphereGeometry(R, 64, 48),
      new THREE.MeshStandardMaterial({ color: 0x668199, roughness: 1, metalness: 0 })   // placeholder tint until the map loads
    );
    this.earth.rotation.z = 0.41;   // axial tilt
    this.scene.add(this.earth);

    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.01, 64, 48),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
    );
    this.earth.add(this.clouds);

    this.scene.add(atmosphere(R));
    this.glow = null;

    // load the NASA textures (local files, no CDN). window.__earthAssets flips
    // true when both are applied, so the slice/test knows the pipeline worked.
    window.__earthAssets = false;
    const loader = new THREE.TextureLoader();
    let pending = 2;
    const done = () => { if (--pending === 0) window.__earthAssets = true; };
    loader.load(EARTH_TEX, (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      this.earth.material.map = t; this.earth.material.color.set(0xffffff); this.earth.material.needsUpdate = true;
      done();
    }, undefined, () => { window.__earthError = 'earth.jpg failed'; done(); });
    loader.load(CLOUD_TEX, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      this.clouds.material.alphaMap = t; this.clouds.material.opacity = 0.85; this.clouds.material.needsUpdate = true;
      done();
    }, undefined, () => { window.__earthError = 'clouds.jpg failed'; done(); });

    if (this.showFps) {
      this.fpsEl = document.createElement('div');
      this.fpsEl.id = 'slice-fps';
      document.getElementById('ui').appendChild(this.fpsEl);
    }
    this._frames = 0; this._fpsClock = 0; this._fpsSamples = [];
    window.__earthFPS = 0;
  }

  update(dt, t) {
    this.earth.rotation.y += dt * 0.05;
    this.clouds.rotation.y += dt * 0.012;
    // slow, reverent camera drift
    this.camera.position.x = Math.sin(t * 0.06) * 3.2;
    this.camera.position.y = 0.6 + Math.sin(t * 0.05) * 0.8;
    this.camera.lookAt(0, 0, 0);

    this._frames++; this._fpsClock += dt;
    if (this._fpsClock >= 0.5) {
      const fps = this._frames / this._fpsClock;
      this._fpsSamples.push(fps);
      if (this._fpsSamples.length > 8) this._fpsSamples.shift();
      window.__earthFPS = Math.round(this._fpsSamples.reduce((a, b) => a + b, 0) / this._fpsSamples.length);
      if (this.fpsEl) this.fpsEl.textContent = `${Math.round(fps)} fps · ${this.game.pipeline.quality}`;
      this._frames = 0; this._fpsClock = 0;
    }
  }

  dispose() {
    this.fpsEl?.remove();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose?.(); m.alphaMap?.dispose?.(); m.dispose?.(); });
    });
  }
}

/** Run the Earth homecoming as a standalone slice (boot via ?slice). */
export async function runEarthSlice(game) {
  const s = loadSave();
  if (!s.name) { s.name = 'Cadet'; save(); }

  const scene = new EarthScene(game);
  game.setScene(scene);
  game.pipeline.setBloom(0.7, 0.5, 0.6);
  await ui.fade(false);
  window.__earthReady = true;

  await ui.dialogue([
    { who: 'bolt', text: `Cadet ${s.name}... look. After everything we've seen out there — there it is.` },
    { who: 'luma', text: 'Home. The pale blue dot. Blue for oceans, green for life, white for clouds and ice — the only world like it we have ever found.', stamp: 'real' },
    { who: 'bolt', text: 'And it\'s in danger. That old killer beam is on its way here. We came to warn them... but warning won\'t be enough. Ready, Cadet? Our greatest mission starts now.' }
  ]);

  ui.toast('🌍 Homecoming visual test complete!', true);
  window.__earthDone = true;
}
