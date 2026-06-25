// The final journey home: the Machine Mind folds space-time. A golden-to-blue
// vortex spirals shut, light snaps, and Earth emerges out of the fold as the
// real Blue Marble, swelling to fill the view. A one-shot cinematic — built as
// its own scene with an internal timeline; run() resolves once Earth arrives.
import * as THREE from 'three';
import { makeStarfield, makeShip, makeGlowSprite } from '../world/builders.js';

const EARTH_TEX = 'assets/earth.jpg';
const CLOUD_TEX = 'assets/clouds.jpg';

/* the spacetime-fold vortex: spiraling streaks, gold near → white → deep blue */
function foldMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uSpin: { value: 1 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uOpacity; uniform float uSpin;
      varying vec2 vUv;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float around = vUv.x;
        float along = vUv.y;
        float spin = around + along * 2.6 - uTime * 0.35 * uSpin;   // the fold's twist
        float streak = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i);
          float lane = fract(spin * (10.0 + fi * 7.0) + hash(fi * 3.1));
          float flow = fract(along * (2.0 + fi * 1.5) - uTime * (0.8 + fi * 0.5) * uSpin);
          streak += smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.5, flow)
                  * smoothstep(0.08, 0.0, abs(lane - 0.5) - 0.4) * (0.5 - fi * 0.1);
        }
        vec3 cNear = vec3(1.0, 0.82, 0.35);
        vec3 cMid  = vec3(1.0, 1.0, 1.0);
        vec3 cFar  = vec3(0.35, 0.7, 1.0);
        vec3 col = mix(cNear, cMid, smoothstep(0.0, 0.5, along));
        col = mix(col, cFar, smoothstep(0.5, 1.0, along));
        float glow = streak * 1.25 + 0.06;
        gl_FragColor = vec4(col * glow, glow * uOpacity);
      }
    `
  });
}

function atmosphere(radius) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0x5ab4ff) } },
    vertexShader: /* glsl */`varying vec3 vN; varying vec3 vV;
      void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - max(dot(vN,vV),0.0), 2.5); gl_FragColor = vec4(uColor, f*0.9); }`
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.03, 48, 36), mat);
}

export class FoldJourneyScene {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02030a);
    this.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0, 9);

    this.scene.add(new THREE.HemisphereLight(0x8899ff, 0x0a0a18, 1.0));
    this.sun = new THREE.DirectionalLight(0xfff6e8, 3.0);
    this.sun.position.set(-12, 5, 10);
    this.scene.add(this.sun);
    this.stars = makeStarfield(game.lowDetail ? 700 : 1800, 600);
    this.scene.add(this.stars);

    // the fold vortex tunnel
    this.foldMat = foldMaterial();
    this.tunnel = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 400, 48, 1, true), this.foldMat);
    this.tunnel.rotation.x = Math.PI / 2;
    this.tunnel.position.z = -100;
    this.scene.add(this.tunnel);

    // a bright "fold point" the Earth emerges from
    this.core = makeGlowSprite(0xffe9b8, 6);
    this.core.position.set(0, 0, -60);
    this.scene.add(this.core);

    this.ship = makeShip();
    this.ship.scale.setScalar(1.1);
    this.ship.position.set(0.5, -1.6, 4);
    this.scene.add(this.ship);

    // Earth (real Blue Marble) — starts as a tiny dot in the fold, then swells
    const R = 6;
    this.earth = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48),
      new THREE.MeshStandardMaterial({ color: 0x4a6f99, roughness: 1, metalness: 0 }));
    this.earth.position.set(0, 0, -24);
    this.earth.scale.setScalar(0.03);
    this.earth.rotation.z = 0.41;
    this.clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.01, 64, 48),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    this.earth.add(this.clouds);
    this.atmo = atmosphere(R);
    this.earth.add(this.atmo);
    this.scene.add(this.earth);
    const loader = new THREE.TextureLoader();
    loader.load(EARTH_TEX, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this.earth.material.map = t; this.earth.material.color.set(0xffffff); this.earth.material.needsUpdate = true; });
    loader.load(CLOUD_TEX, (t) => { t.colorSpace = THREE.SRGBColorSpace; this.clouds.material.alphaMap = t; this.clouds.material.opacity = 0.85; this.clouds.material.needsUpdate = true; });

    // the snap-flash
    this.flash = document.createElement('div');
    this.flash.className = 'slice-flash';
    document.getElementById('ui').appendChild(this.flash);

    this.e = 0;            // elapsed seconds (scaled)
    this.flashed = false;
    this.done = false;
    this.fast = new URLSearchParams(location.search).has('fast');
  }

  update(dt, t) {
    const k = this.fast ? 3.2 : 1;
    this.e += dt * k;
    const F1 = 3.2, F2 = 6.2, END = 7.8;   // fold → flash → emerge → arrive

    this.foldMat.uniforms.uTime.value = t;
    this.earth.rotation.y += dt * 0.06;
    this.clouds.rotation.y += dt * 0.015;

    if (this.e < F1) {
      // THE FOLD: vortex spins up and tightens, ship streaks in, FOV punches
      const p = this.e / F1;
      this.foldMat.uniforms.uOpacity.value = Math.min(1, p * 1.6);
      this.foldMat.uniforms.uSpin.value = 1 + p * 3;
      this.tunnel.rotation.z += dt * (0.4 + p * 1.6);
      this.core.scale.setScalar(6 + p * 6);
      this.core.material.opacity = 0.4 + p * 0.6;
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 92, dt * 2);
      const shake = p * 0.25;
      this.camera.position.x = (Math.random() - 0.5) * shake;
      this.camera.position.y = (Math.random() - 0.5) * shake;
      this.ship.position.z = 4 - Math.sin(this.e * 8) * 0.4;
    } else if (!this.flashed) {
      this.flashed = true;
      this.flash.classList.add('on');
      setTimeout(() => this.flash.classList.remove('on'), 320);
    }

    if (this.e >= F1 && this.e < F2) {
      // EMERGE: the fold fades, Earth swells out of the light
      const p = (this.e - F1) / (F2 - F1);
      this.foldMat.uniforms.uOpacity.value = Math.max(0, 1 - p * 1.4);
      this.core.material.opacity = Math.max(0, 0.9 - p * 1.2);
      this.earth.scale.setScalar(THREE.MathUtils.lerp(0.03, 1, p * p));
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 62, dt * 3);
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 0, dt * 4);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 0, dt * 4);
      this.ship.position.lerp(new THREE.Vector3(3.2, -2.2, 2), dt * 1.5);
    } else if (this.e >= F2) {
      // ARRIVE: Earth full and serene
      this.earth.scale.setScalar(1);
      this.foldMat.uniforms.uOpacity.value = 0;
      this.camera.position.x = Math.sin((this.e - F2) * 0.3) * 0.6;
      if (!this.done && this.e >= END) { this.done = true; this.resolve?.(); }
    }
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(0, 0, -24);
  }

  run() { return new Promise((res) => { this.resolve = res; }); }

  dispose() {
    this.flash?.remove();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose?.(); m.alphaMap?.dispose?.(); m.dispose?.(); });
    });
  }
}
