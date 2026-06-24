// Sagittarius A* — a shader-built supermassive black hole.
// One camera-facing quad does the whole movie look: the dark shadow, the
// bright photon ring, a doppler-boosted swirling accretion disk, and
// gravitational lensing of a procedural star background (stars visibly
// bend and smear around the shadow). Bloom turns the ring incandescent.
import * as THREE from 'three';

export function makeBlackHole(size = 60) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 }
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;       // centered coords, -1..1
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      // sparse procedural starfield
      vec3 stars(vec2 p) {
        vec2 cell = floor(p * 24.0);
        vec2 f = fract(p * 24.0) - 0.5;
        float h = hash21(cell);
        float star = smoothstep(0.12, 0.0, length(f - (vec2(h, fract(h * 7.0)) - 0.5) * 0.8));
        float bright = step(0.82, h) * star * (0.6 + h);
        vec3 tint = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.9, 0.75), fract(h * 13.0));
        return tint * bright;
      }

      // cheap value noise for the disk swirl
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
          mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x),
          f.y
        );
      }

      void main() {
        vec2 uv = vUv;
        float r = length(uv);
        if (r > 1.0) discard;

        float horizon = 0.30;         // shadow radius — big, so bloom can't swallow it
        float photon = 0.345;         // photon ring radius

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        // ---- gravitational lensing of the background ----
        // light passing near the hole bends inward; approximate by pulling
        // sample coords toward the center with a 1/r falloff.
        float bend = 0.08 / max(r - horizon * 0.6, 0.03);
        vec2 lensed = uv * (1.0 - bend);
        vec3 sky = stars(lensed * 1.6 + vec2(uTime * 0.004, 0.0)) * 1.3;
        // smear stars tangentially near the ring (Einstein-ring streaking)
        float streak = smoothstep(0.75, photon, r);
        vec2 tangent = normalize(vec2(-uv.y, uv.x));
        sky += stars(lensed * 1.6 + tangent * streak * 0.08) * streak;
        col += sky * smoothstep(horizon, photon * 1.15, r);
        alpha = max(alpha, max(sky.r, max(sky.g, sky.b)) * smoothstep(1.0, 0.8, r));

        // ---- the glowing donut (the EHT-photo look) ----
        // a swirling orange ring hugging the shadow, brighter on the side
        // spinning toward us, with noise so it boils like hot gas
        float ang = atan(uv.y, uv.x);
        float swirl = vnoise(vec2(ang * 3.0 - uTime * 0.9 + r * 3.0, r * 9.0 - uTime * 0.5));
        float qc = (r - 0.40) / 0.10;
        float donutCore = exp(-qc * qc);                             // bright body
        float qs = (r - 0.46) / 0.22;
        float donutSkirt = exp(-qs * qs) * 0.35;                     // soft outer falloff
        float doppler = 1.0 + 0.65 * sin(ang - 1.9);                 // hot side lower-left, like the photo
        float donut = (donutCore + donutSkirt) * (0.75 + swirl * 0.5) * doppler;
        donut *= step(horizon * 0.98, r);                            // nothing inside the shadow
        vec3 donutCol = mix(vec3(1.0, 0.38, 0.06), vec3(1.0, 0.85, 0.55), swirl * 0.55 + donutCore * 0.3);
        col += donutCol * donut * 1.35 * uIntensity;
        alpha = max(alpha, min(donut * 1.5, 1.0));

        // ---- the edge-on disk: a thin lensed blade across the middle ----
        float qb = uv.y / 0.045;
        float blade = exp(-qb * qb) * smoothstep(1.0, 0.5, r) * step(photon, r);
        col += vec3(1.0, 0.75, 0.45) * blade * 0.9 * uIntensity;
        alpha = max(alpha, blade);

        // ---- photon ring: thin, white-hot, hugging the shadow ----
        float ring = smoothstep(0.03, 0.0, abs(r - photon));
        col += vec3(1.3, 1.0, 0.75) * ring * 1.5 * uIntensity;
        alpha = max(alpha, ring);

        // ---- the shadow itself: pure black, hard-edged against the glow ----
        // (0 inside the horizon, 1 outside — edges must be ascending in GLSL)
        float shadow = smoothstep(horizon * 0.95, horizon, r);
        col *= shadow;
        alpha = max(alpha, 1.0 - shadow);            // opaque black center

        // soft edge of the whole quad
        alpha *= smoothstep(1.0, 0.85, r);

        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.userData.isBlackHole = true;
  mesh.userData.update = (dt, t) => { mat.uniforms.uTime.value = t; };
  mesh.userData.setIntensity = (v) => { mat.uniforms.uIntensity.value = v; };
  // always face the camera (billboard) — the game loop calls this
  mesh.userData.face = (camera) => mesh.quaternion.copy(camera.quaternion);
  return mesh;
}
