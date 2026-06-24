// Render pipeline: WebGLRenderer + optional bloom composer, with a quality
// manager that probes FPS and quietly drops to a lean path on weak tablets.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadSave, save } from '../save.js';

export class Pipeline {
  constructor(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.quality = this.initialQuality();      // 'high' | 'low'
    this.composer = null;
    this.bloomPass = null;
    this.scene = null;
    this.camera = null;

    // FPS probe: watch the first seconds of real rendering; if we can't hold
    // a playable rate with bloom on, drop to the lean path for the session.
    this.probe = { frames: 0, start: 0, done: this.quality === 'low' };

    this.applySize();
  }

  initialQuality() {
    const pref = loadSave().parent.quality || 'auto';
    if (pref === 'high' || pref === 'low') return pref;
    return 'high';   // optimistic start; the probe demotes if needed
  }

  applySize() {
    const dpr = this.quality === 'high' ? Math.min(devicePixelRatio || 1, 2) : 1;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(innerWidth, innerHeight);
    if (this.composer) this.composer.setSize(innerWidth, innerHeight);
  }

  /** Point the pipeline at a scene+camera (rebuilds the composer). */
  attach(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    if (this.quality === 'high') {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(scene, camera));
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.6, 0.82);
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
      this.composer.setSize(innerWidth, innerHeight);
    } else {
      this.composer = null;
      this.bloomPass = null;
    }
  }

  /** Per-scene bloom tuning (the black hole wants more glow than a diorama). */
  setBloom(strength = 0.85, radius = 0.6, threshold = 0.82) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
      this.bloomPass.radius = radius;
      this.bloomPass.threshold = threshold;
    }
  }

  render(dt) {
    if (!this.scene || !this.camera) return;
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    this.runProbe(dt);
  }

  runProbe() {
    if (this.probe.done) return;
    const now = performance.now();
    if (!this.probe.start) { this.probe.start = now; return; }
    this.probe.frames++;
    const elapsed = now - this.probe.start;
    if (elapsed >= 4000) {
      const fps = (this.probe.frames / elapsed) * 1000;
      this.probe.done = true;
      if (fps < 24 && this.quality === 'high' && (loadSave().parent.quality || 'auto') === 'auto') {
        this.demote();
      }
    }
  }

  demote() {
    this.quality = 'low';
    this.applySize();
    if (this.scene && this.camera) this.attach(this.scene, this.camera);   // rebuild without composer
  }

  /** Parent Zone override: 'auto' | 'high' | 'low'. */
  setQualityPref(pref) {
    const s = loadSave();
    s.parent.quality = pref;
    save();
    const target = pref === 'low' ? 'low' : 'high';
    if (target !== this.quality) {
      this.quality = target;
      this.applySize();
      if (this.scene && this.camera) this.attach(this.scene, this.camera);
    }
  }

  resize() {
    this.applySize();
  }
}
