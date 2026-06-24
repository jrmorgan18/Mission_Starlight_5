// The Pinwheel — a Wolf-Rayet star winding down to its death (think WR 104).
// The graphics showpiece of Mission: Starlight 3. A camera-facing shader quad
// paints the whole movie look: a blue-white turbulent core, two glowing
// logarithmic-spiral dust plumes (the "pinwheel"), and a soft halo. A second
// mesh is the gamma-ray-burst BEAM: it charges with the core, then fires in a
// blinding sweep. Bloom turns all of it incandescent.
//
// GLSL guardrails (learned building the black hole): never pow() a negative,
// and every smoothstep keeps edge0 < edge1.
import * as THREE from 'three';

const BEAM_LEN = 140;

/* ---------- the spinning pinwheel star (billboard quad) ---------- */
function pinwheelMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uCharge: { value: 0 }   // 0 = calm, 1 = about to detonate (brighter, bluer, faster)
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;            // centered -1..1
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uCharge;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
          mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x),
          f.y);
      }

      void main() {
        vec2 uv = vUv;
        float r = length(uv);
        if (r > 1.0) discard;

        float ang = atan(uv.y, uv.x);
        float spin = 0.6 + uCharge * 1.4;          // spins up as it nears death

        // bright turbulent core + soft halo (exp keeps it safe & glowy)
        float core = exp(-r * r * 26.0);
        float halo = exp(-r * r * 4.5) * 0.5;
        float boil = 0.7 + 0.5 * vnoise(vec2(ang * 3.0 + uTime * (0.4 + uCharge), r * 10.0 - uTime * 0.3));

        // two logarithmic-spiral dust arms (the pinwheel)
        float lr = log(max(r, 0.02));              // defined for r>0; negative is fine
        float arm = cos(2.0 * ang - lr * 5.0 + uTime * spin);
        arm = smoothstep(0.25, 1.0, arm);          // narrow, glowing arms
        float dust = arm * smoothstep(0.05, 0.30, r) * smoothstep(1.0, 0.40, r) * boil;

        // colour: white-blue heart, gold-to-red dust; charge pushes it violent-blue
        vec3 coreCol = mix(vec3(0.70, 0.86, 1.0), vec3(1.0), core);
        coreCol += vec3(0.35, 0.55, 1.0) * uCharge * core * 1.6;
        vec3 dustCol = mix(vec3(1.0, 0.82, 0.42), vec3(1.0, 0.34, 0.16), smoothstep(0.2, 1.0, r));

        vec3 col = coreCol * (core + halo) * 1.7 + dustCol * dust * 1.4;
        float alpha = clamp(max(core + halo, dust), 0.0, 1.0);
        alpha *= smoothstep(1.0, 0.82, r);         // soft quad edge

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}

/* ---------- the gamma-ray-burst beam (additive cone) ---------- */
function beamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uCharge: { value: 0 },   // base glow building inside the star
      uFire: { value: 0 }      // 0..1 tip position as the burst shoots out
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;                        // y runs 0..1 along the beam
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uCharge;
      uniform float uFire;
      varying vec2 vUv;
      void main() {
        float along = vUv.y;
        float across = abs(vUv.x - 0.5) * 2.0;        // 0 centre .. 1 edge
        float edge = smoothstep(1.0, 0.0, across);    // bright spine

        float flicker = 0.85 + 0.15 * sin(uTime * 40.0 + along * 30.0);
        float body = step(along, uFire) * 0.65;        // filled up to the tip
        float tip  = smoothstep(0.14, 0.0, abs(along - uFire)) * 1.6;  // blazing tip
        float charge = uCharge * (1.0 - along) * 0.5;  // glow pooling at the base
        float intensity = (body + tip + charge) * edge * flicker;

        vec3 col = mix(vec3(0.65, 0.85, 1.0), vec3(0.80, 0.55, 1.0), across);
        gl_FragColor = vec4(col * intensity, intensity);
      }
    `
  });
}

export function makeKillerStar(size = 26) {
  const group = new THREE.Group();

  const pinMat = pinwheelMaterial();
  const pinwheel = new THREE.Mesh(new THREE.PlaneGeometry(size, size), pinMat);
  pinwheel.userData.isPinwheel = true;   // billboarded by the scene
  group.add(pinwheel);

  // beam: a cone whose base sits at the star, aimed out along the pivot's axis
  const beamMat = beamMaterial();
  const beamGeo = new THREE.CylinderGeometry(0.2, size * 0.10, BEAM_LEN, 20, 1, true);
  beamGeo.translate(0, BEAM_LEN / 2, 0);   // base at origin, grows along +Y
  const beamPivot = new THREE.Group();
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beamPivot.add(beam);
  // aim down-and-toward the viewer's left, so it sweeps across the sky
  beamPivot.rotation.z = 2.3;
  beamPivot.rotation.x = -0.25;
  beamPivot.visible = false;
  group.add(beamPivot);

  group.userData.update = (dt, t) => {
    pinMat.uniforms.uTime.value = t;
    beamMat.uniforms.uTime.value = t;
    if (beamPivot.visible) beamPivot.rotation.z = 2.3 + Math.sin(t * 0.6) * 0.12;   // slow sweep
  };
  group.userData.setCharge = (v) => {
    pinMat.uniforms.uCharge.value = v;
    beamMat.uniforms.uCharge.value = v;
    if (v > 0.02) beamPivot.visible = true;
  };
  group.userData.setFire = (v) => {
    beamMat.uniforms.uFire.value = v;
    beamPivot.visible = true;
  };
  // billboard the pinwheel quad toward the camera (the beam stays in world space)
  group.userData.face = (camera) => pinwheel.quaternion.copy(camera.quaternion);

  return group;
}
