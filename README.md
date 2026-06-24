# Mission: Starlight 2 — The Heart of the Galaxy

The sequel to [Mission: Starlight](https://github.com/jrmorgan18/Mission_Starlight) — a 3D
educational space adventure for early readers (ages 6–9), built to run free in any browser
on iPad, Chromebook, or Fire tablet.

**This time, the adventure leaves the solar system.** A faint distress signal is relaying
through Planet Nine. Following it, Cadet *[your name]*, Bolt the robot, and Luma (the baby
star from game 1, now your ship's navigator-heart) discover an ancient **Star Gate** that
opens "light-rivers" between the stars — and trace the signal across real star systems to
the supermassive black hole at the center of the Milky Way, where an elder star named
**Nana Lyra** is trapped in a slow spiral. Rescue plan: a perfectly-timed **gravity
slingshot**.

## The seven chapters

1. **Return to Planet Nine** — decode the gate glyphs, wake the gate, first hyperspace jump
2. **Proxima Centauri b** — flare storms at the nearest star (raise shields in time!)
3. **TRAPPIST-1** — the Festival of Seven: pass the lantern light down all seven worlds in order
4. **The Diamond Planet (55 Cancri e)** — dig for humming diamonds on a lava world
5. **The Pulsar Lighthouse** — count the blinks and echo them back to keeper Tick
6. **Sagittarius A*** — spot Nana Lyra by her gravitationally lensed light, then slingshot her free
7. **The Long Way Home** — light the 7-beacon relay back to the Orion Nebula

## What's new over game 1

- **Real rendered glow**: post-processing bloom pipeline (vendored Three.js addons, still no build step)
- **Hyperspace travel**: a custom-shader warp tunnel with star streaks, photon collecting, and gravity-ripple dodging
- **A shader-built supermassive black hole**: black shadow, white-hot photon ring, boiling doppler-bright accretion donut, gravitationally lensed stars — the look of the real 2022 EHT photo
- **PBR worlds**: 2048px procedural textures with bump maps, emissive lava, animated pulsar beams
- **REAL SCIENCE / STORY MAGIC stamps**: Bolt's fact-checker chip marks what's real (black holes, pulsars, TRAPPIST-1, light-years) vs. story magic (the Star Gate) in dialogue and the Star Journal
- **Harder math, same sneaky delivery**: starts at 2-digit work and grows to 3-digit add/subtract, 2-digit×1-digit multiplication, doubling patterns, thousands comparisons (light-years!), and two-step word problems
- **Quality manager**: auto-detects weak tablets and drops to a lean render path; manual override in the Parent Zone
- **Game-1 continuity**: on the same device, the sequel reads the original's save to greet the cadet by name — and finishing game 1 unlocks the **Hero of Luma** badge

Everything else that worked carries over: the adaptive difficulty engine, the Star Journal
memory system (missed questions become reviewable entries with glowing hints), read-aloud
on every word, collectible crew cards, mystery clues, milestone badges, and the gear-gated
Parent Zone with editable real-world prizes.

## Running it

Static files, no build:

```
cd Mission_Starlight_2
python -m http.server 8000
# open http://localhost:8000
```

Deploy: push to GitHub, enable Pages on the repo root. The service worker caches
everything for offline play; on iPad use Safari → Share → **Add to Home Screen**.

Testing: `?fast` query param speeds up hyperspace rides; `window.__starlight2` exposes the
game instance. Automated tests live in the sibling `.devtools/` folder (`seq-smoke.js` =
full playthrough, `seq-boot.js` = boot check, `bh-isolated.js` = black hole render check).

## Tech

Three.js 0.170 (vendored, plus EffectComposer/UnrealBloomPass/GLTFLoader addons mapped via
importmap `three/addons/`), vanilla ES modules, WebAudio procedural sound, Web Speech API
read-aloud, localStorage saves, PWA manifest + service worker. ~1.2 MB total.
