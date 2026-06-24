// Showpieces for Mission: Starlight 5:
//  - makePulsar(): a spinning neutron star with twin sweeping lighthouse beams
//    and a glowing magnetic-field look (procedural, bloom-friendly).
//  - makeDysonSphere(): a star caged in a shell of glowing panels.
import * as THREE from 'three';
import { makeGlowSprite } from '../world/builders.js';

/* ---------------- pulsar ---------------- */
export function makePulsar(scale = 1) {
  const group = new THREE.Group();

  // the neutron star: small, brilliant, blue-white
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.6 * scale, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xcfe4ff, emissive: 0x9ec8ff, emissiveIntensity: 3.2 })
  );
  group.add(core);
  group.add(makeGlowSprite(0xaad4ff, 4 * scale));

  // twin lighthouse beams (additive cones), tilted off the spin axis
  const beams = new THREE.Group();
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  for (const dir of [1, -1]) {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4 * scale, 26 * scale, 18, 1, true), beamMat);
    beam.position.y = dir * 13 * scale;
    beam.rotation.x = dir === 1 ? 0 : Math.PI;
    beams.add(beam);
  }
  beams.rotation.z = 0.5;          // magnetic axis tilted from spin axis
  group.add(beams);

  // a faint equatorial field ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5 * scale, 0.04 * scale, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0x6fb0ff, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const light = new THREE.PointLight(0xbfe0ff, 40 * scale, 60);
  group.add(light);

  group.userData.beams = beams;
  group.userData.core = core;
  // spins fast — that's the "pulse". flash tracked so a minigame can read it.
  group.userData.phase = 0;
  group.userData.update = (dt, t) => {
    beams.rotation.y += dt * 3.2;                          // rapid sweep
    group.userData.phase = (group.userData.phase + dt * 3.2) % (Math.PI * 2);
    const flash = Math.pow(Math.max(0, Math.cos(group.userData.phase)), 8);   // bright when a beam faces us
    core.material.emissiveIntensity = 2.4 + flash * 4;
    group.userData.flash = flash;
  };
  return group;
}

/* ---------------- Dyson Sphere ---------------- */
export function makeDysonSphere(scale = 1) {
  const group = new THREE.Group();

  // the caged star
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(2.2 * scale, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc24a, emissiveIntensity: 2.6 })
  );
  group.add(star);
  group.add(makeGlowSprite(0xffd06a, 10 * scale));
  group.add(new THREE.PointLight(0xffd9a0, 60 * scale, 80));

  // a geodesic shell of dark panels with glowing seams
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.6 * scale, 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1f33, roughness: 0.5, metalness: 0.7, emissive: 0x2a2440, emissiveIntensity: 0.5, flatShading: true, transparent: true, opacity: 0.92 })
  );
  group.add(shell);
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.62 * scale, 2),
    new THREE.MeshBasicMaterial({ color: 0xffb24a, wireframe: true, transparent: true, opacity: 0.4 })
  );
  group.add(wire);

  // a few orbiting collector panels (the swarm still being built)
  const panels = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(0.7 * scale, 0.7 * scale, 0.04 * scale),
      new THREE.MeshStandardMaterial({ color: 0x2a3a6a, emissive: 0x3a5ab0, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.3 })
    );
    const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * 2;
    p.userData.orbit = { r, speed: 0.2 + Math.random() * 0.3, phase: a, tilt: (Math.random() - 0.5) * 1.2 };
    panels.add(p);
  }
  group.add(panels);

  group.userData.update = (dt, t) => {
    star.rotation.y += dt * 0.1;
    shell.rotation.y += dt * 0.05;
    wire.rotation.y += dt * 0.05;
    star.material.emissiveIntensity = 2.4 + Math.sin(t * 1.5) * 0.3;
    for (const p of panels.children) {
      const o = p.userData.orbit;
      p.position.set(Math.cos(t * o.speed + o.phase) * o.r, Math.sin(o.tilt) * o.r * 0.5, Math.sin(t * o.speed + o.phase) * o.r);
      p.lookAt(0, 0, 0);
    }
  };
  return group;
}
