// The ten chapters of Mission: Starlight 5 — "The Lighthouse at the Edge of
// Time", the grand finale. Race near light-speed (time bends!), navigate by a
// pulsar, and unite the galaxy's civilizations to build a deflector and save
// Earth. Dialogue lines carry stamp:'real'|'magic' for Bolt's fact-checker.
import * as THREE from 'three';
import { WorldScene } from './worldScene.js';
import { collectParts, echoBlinks, animate } from './minigames.js';
import { keystoneJigsaw } from './jigsaw.js';
import { EarthScene } from '../earth/earthScene.js';
import { HyperspaceScene } from '../hyperspace/hyperspace.js';
import { makePulsar, makeDysonSphere } from '../showpieces/cosmic.js';
import { timeWarp } from '../showpieces/timeclocks.js';
import { makeAlien, makeLuma, makeArchitect, makeRobot, makeKid, makeRock, makeShip, makeGlowSprite, makeStarfield, makeTree, makeGrassField } from '../world/builders.js';
import { sagaStatus } from '../saga.js';
import * as ui from '../ui/ui.js';
import { pickMath, pickScience, pickReading } from '../edu/engine.js';
import { loadSave } from '../save.js';
import { sfx } from '../audio.js';

/* ---------- shared bits ---------- */
async function askScience(topic, opts = {}) {
  return ui.askQuestion(pickScience(topic), { contextLabel: opts.label || "BOLT'S DATABANK CHECK", icon: opts.icon || '🔭', gauge: opts.gauge });
}
async function askMath(skill, opts = {}) {
  return ui.askQuestion(pickMath(skill), { contextLabel: opts.label || 'SHIP COMPUTER', icon: opts.icon || '🧮', gauge: opts.gauge });
}
async function askReadingSet(tag, howMany, opts = {}) {
  const set = pickReading(tag);
  for (const q of set.questions.slice(0, howMany)) await ui.askQuestion(q, { contextLabel: opts.label || 'READ CAREFULLY', icon: '📖' });
}
function addLuma(scene, x, y, z) { const l = makeLuma(0.85); l.position.set(x, y, z); scene.scene.add(l); return l; }
function addSky(scene, obj, x, y, z) { obj.position.set(x, y, z); scene.scene.add(obj); return obj; }
function hideStars(scene) { scene.scene.traverse((o) => { if (o.isPoints) o.visible = false; }); }
async function openScene(game, key) { const s = new WorldScene(game, key); game.setScene(s); await ui.fade(false); return s; }
async function closeScene(game, scene) { await ui.fade(true); scene.dispose(); }

/* a quick hyperspace flight (used by chapters that fly themselves) */
async function flyTo(game, destName) {
  await ui.fade(true);
  const ride = new HyperspaceScene(game, destName);
  game.setScene(ride);
  await ui.fade(false);
  await ride.run();
  ride.dispose();
  ui.countJump();
}

/* ============================================================
   CHAPTER 1 — HOMECOMING
============================================================ */
export async function chapterHomecoming(game) {
  const s = loadSave();
  const scene = new EarthScene(game, { showFps: false });
  game.setScene(scene);
  game.pipeline.setBloom(0.7, 0.5, 0.6);
  await ui.fade(false);

  await ui.dialogue([
    { who: 'bolt', text: `Cadet ${s.name}... after everything we've seen out there — there it is. Home.` },
    { who: 'luma', text: 'Earth. The pale blue dot. Blue for oceans, green for life, white for clouds and ice — the only world like it we have ever found.', stamp: 'real' },
    { who: 'mission', text: 'Cadet! Thank the stars you came. We tracked a beam of deadly light heading our way — born from a dying star, ages ago. We don\'t know how to stop it.' }
  ]);
  await ui.giveCard('earth');
  await askReadingSet('homecoming', 2);
  await askScience('earth');

  await ui.dialogue([
    { who: 'bolt', text: 'We delivered the warning — but warning won\'t save Earth. We have to go STOP that beam, far out at its source.', stamp: 'real' },
    { who: 'luma', text: 'And no single world can do that. We\'ll need the galaxy\'s greatest builders. Time to fly faster than we ever have, Cadet.' }
  ]);
  await ui.giveClue('ls1');
  game.checkBadges();
  await ui.fade(true);
  scene.dispose();
}

/* ============================================================
   CHAPTER 2 — INTO THE STARBOW (self-flight + first dilation)
============================================================ */
export async function chapterStarbow(game) {
  await ui.dialogue([
    { who: 'bolt', text: 'Engines to maximum, Cadet! We\'re going to fly almost as fast as light itself — the fastest speed in the whole universe.', stamp: 'real' },
    { who: 'luma', text: 'Watch the stars stretch into a ring of colors — the starbow! Steer, hold LIGHTSPEED, and catch the ⭐ stars!' }
  ]);
  await flyTo(game, 'DEEP SPACE');
  await game.toBackdrop();

  await timeWarp('3 days', '4 years', 'Flying near light-speed, your clock slows. A few days for you was YEARS for Earth. This is real — it\'s called time dilation!');
  await ui.dialogue([
    { who: 'bolt', text: 'Whoa. Three days for us... four years passed on Earth. The faster we go, the more time slips by back home.', stamp: 'real' }
  ]);
  await askReadingSet('starbow', 2);
  await askScience('timewarp');
  await ui.giveClue('ls2');
  await ui.dialogue([
    { who: 'luma', text: 'We\'re deep in the dark now, and a little lost. We need a lighthouse — and I know just the one. To the pulsar!' }
  ]);
}

/* ============================================================
   CHAPTER 3 — THE PULSAR LIGHTHOUSE
============================================================ */
export async function chapterPulsar(game) {
  const scene = await openScene(game, 'pulsarsky');
  const pulsar = makePulsar(1.4);
  addSky(scene, pulsar, 8, 11, -28);
  const tick = makeAlien('tick');
  scene.place(tick, -4, -2, { id: 'tick', ry: 0.4 });

  await ui.dialogue([
    { who: 'bolt', text: 'There it is — a PULSAR. A tiny spinning neutron star, flashing a beam around like a lighthouse, faster than you can blink.', stamp: 'real' },
    { who: 'luma', text: 'And its keeper is an old friend...' }
  ]);
  await ui.giveCard('pulsar');

  ui.setObjective('Tap Tick, the lighthouse keeper');
  await scene.waitInteract('tick');
  await ui.dialogue([
    { who: 'tick', text: 'Cadet! You came back! My pulsar keeps perfect time — the steadiest beat in the universe. Count the flashes and you\'ll never be lost.', stamp: 'real' },
    { who: 'tick', text: 'Watch closely... then echo the pulsar\'s beat on the drum!' }
  ]);
  await ui.giveCard('tick');
  await askReadingSet('pulsar', 2);

  // echo the pulsar's beats. Pause the pulsar's auto-flash (it would fight the
  // echo blinks for the core's glow) but keep the beams sweeping.
  const savedUpdate = pulsar.userData.update;
  pulsar.userData.update = (dt) => { pulsar.userData.beams.rotation.y += dt * 2; };
  await echoBlinks(scene, { userData: { lamp: pulsar.userData.core } }, [3, 4, 5]);
  pulsar.userData.update = savedUpdate;

  await askScience('pulsar');
  await ui.giveClue('ls3');
  game.checkBadges();   // Star Navigator badge
  await ui.dialogue([
    { who: 'tick', text: 'Now you can navigate the deep galaxy. Seek the Architects — the master-builders. Only they can plan a way to stop your beam.' }
  ]);
  await closeScene(game, scene);
}

/* ============================================================
   CHAPTER 4 — THE ARCHITECTS
============================================================ */
export async function chapterArchitects(game) {
  const scene = await openScene(game, 'architect');
  for (let i = 0; i < 6; i++) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 6, 8), new THREE.MeshStandardMaterial({ color: 0x4a3a7a, emissive: 0x2a2050, emissiveIntensity: 0.5, roughness: 0.5 }));
    pillar.position.set(-16 + i * 6, 3, -20 - (i % 2) * 6);
    scene.scene.add(pillar);
  }
  const arch = makeArchitect();
  scene.place(arch, -3, -2, { id: 'arch', ry: 0.4 });

  await ui.dialogue([
    { who: 'bolt', text: 'A city older than worlds. These are the Architects — they\'ve built wonders for a million years.' }
  ]);
  ui.setObjective('Approach the Architects');
  await scene.waitInteract('arch');
  await ui.dialogue([
    { who: 'architect', text: 'Greetings, small traveler from the blue world. We have studied your killer beam. Hear the hard truth: no single world can stop it.' },
    { who: 'architect', text: 'It takes a COALITION — three gifts from three peoples: vast POWER, perfect AIM, and a true CLOCK. You already have the clock — the pulsar.' }
  ]);
  await ui.giveCard('architect');
  await askReadingSet('architects', 2);
  await askMath('addition', { label: 'BLUEPRINT MATH', icon: '📐' });
  await askScience('galaxy');
  await ui.giveClue('ls4');
  await ui.dialogue([
    { who: 'architect', text: 'For POWER, seek the Sun-Weavers, who cage a whole star. Go, little one. The galaxy is waking to help you.' }
  ]);
  await closeScene(game, scene);
}

/* ============================================================
   CHAPTER 5 — THE DYSON SPHERE
============================================================ */
export async function chapterDyson(game) {
  const scene = await openScene(game, 'dyson');
  const dyson = makeDysonSphere(1.2);
  addSky(scene, dyson, 6, 11, -28);
  const weaver = makeAlien('keeper');
  scene.place(weaver, -4, -2, { id: 'weaver', ry: 0.4 });

  await ui.dialogue([
    { who: 'bolt', text: 'Shield your eyes! They\'re building a DYSON SPHERE — a shell of panels around their whole star to drink ALL its energy. A real idea from real scientists!', stamp: 'real' }
  ]);
  await ui.giveCard('dysonsphere');
  ui.setObjective('Find the Sun-Weavers');
  await scene.waitInteract('weaver');
  await ui.dialogue([
    { who: 'sunweaver', text: 'Welcome, traveler! Our star pours out more power than a million suns of machines could use. We will lend it to your deflector...' },
    { who: 'sunweaver', text: '...if you help us hang the last panels. Gather them and bring them to the sphere!' }
  ]);
  await ui.giveCard('dyson');
  await askReadingSet('dyson', 2);

  const panelIds = ['pn1', 'pn2', 'pn3', 'pn4'];
  panelIds.forEach((id, i) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x2a3a6a, emissive: 0x3a5ab0, emissiveIntensity: 0.7, metalness: 0.6 }));
    scene.place(panel, -11 + i * 7, -6, { id });
  });
  await collectParts(scene, panelIds, 'Gather the Dyson panels');

  await ui.dialogue([{ who: 'bolt', text: 'Now figure the power — how much energy from how many panels?' }]);
  await askMath('multiplication', { label: 'POWER OUTPUT', icon: '☀️' });
  await askScience('dyson');
  await ui.giveClue('ls5');
  ui.addStarBits(3);
  await ui.dialogue([
    { who: 'sunweaver', text: 'The power is yours! Now you need AIM. Seek the Machine Mind — the world that thinks. Only it can calculate a perfect shot.' }
  ]);
  await closeScene(game, scene);
}

/* ============================================================
   CHAPTER 6 — THE MACHINE MIND
============================================================ */
export async function chapterMachine(game) {
  const scene = await openScene(game, 'machine');
  for (let i = 0; i < 5; i++) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5 + Math.random() * 3, 1.2), new THREE.MeshStandardMaterial({ color: 0x14202c, emissive: 0x0a3040, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.3 }));
    tower.position.set(-15 + i * 7, 2.5, -22 - (i % 2) * 5);
    scene.scene.add(tower);
  }
  const robot = makeRobot(1.1);
  scene.place(robot, -3, -2, { id: 'robot', ry: 0.4 });
  for (let i = 0; i < 3; i++) { const r = makeRobot(0.7); scene.place(r, 6 + i * 2.5, 3 + i, { ry: -0.5 }); }

  await ui.dialogue([
    { who: 'bolt', text: 'A whole world of thinking machines, joined into one mind. Ancient, and — Bolt double-checks — actually rather kind.' }
  ]);
  ui.setObjective('Greet the Machine Mind');
  await scene.waitInteract('robot');
  await ui.dialogue([
    { who: 'machine', text: 'HELLO, SMALL WARM ONE. I AM THE MACHINE MIND. I have watched stars be born, grow old, and die. Do not be afraid — I am old, but I am kind.', stamp: 'real' },
    { who: 'machine', text: 'You need an aim too perfect for any hand. Give me the numbers, and I will calculate exactly where to point your deflector. To me, such sums are a lullaby.' }
  ]);
  await ui.giveCard('machine');
  await askReadingSet('machine', 2);

  await ui.dialogue([{ who: 'machine', text: 'LET US CALCULATE THE AIM. SOLVE WITH ME.' }]);
  for (let i = 0; i < 3; i++) {
    await askMath(['addition', 'subtraction', 'multiplication'][i], { label: `AIMING THE DEFLECTOR ${i + 1} OF 3`, icon: '🎯', gauge: { current: i, total: 3, icon: '🎯' } });
  }
  await askScience('machine');
  await ui.giveClue('ls6');
  game.checkBadges();   // Galaxy Uniter badge
  await ui.dialogue([
    { who: 'machine', text: 'AIM COMPLETE. POWER, AIM, CLOCK — THE COALITION IS WHOLE. NOW... THE LONG BUILDING BEGINS.' }
  ]);
  await closeScene(game, scene);
}

/* ============================================================
   CHAPTER 7 — THE LONG BUILD (self; the bittersweet time toll)
============================================================ */
export async function chapterTimetoll(game) {
  await game.toBackdrop();
  await ui.dialogue([
    { who: 'bolt', text: 'Building a galaxy-sized deflector takes a long, long time. We race between the worlds, near light-speed, carrying pieces and plans...' },
    { who: 'luma', text: 'And every fast trip that saves the build... costs us years back home.' }
  ]);
  await timeWarp('A few months', 'Many years', 'The build is working — but look how much time has passed on Earth.');

  await ui.dialogue([
    { who: 'signal', text: 'beep... incoming recording... from EARTH...' }
  ]);
  await askReadingSet('timetoll', 2, { label: 'A RECORDING FROM HOME' });
  await ui.dialogue([
    { who: 'family', text: 'So much time has passed here while you race the stars. The little tree you planted is taller than the house now. We are not sad — we are proud. Find your way home.' },
    { who: 'player', text: '...I miss them. Is saving Earth worth losing my own time there?' },
    { who: 'luma', text: 'Oh, Cadet. I am a star — I know deep time. Some things wait for you longer than you think. Finish this. We will find a way home, together.' }
  ]);
  await askScience('timewarp');
  await ui.giveClue('ls7');
}

/* ============================================================
   CHAPTER 8 — THE GREAT DEFLECTOR (assemble: jigsaw)
============================================================ */
export async function chapterAssemble(game) {
  await game.toBackdrop();
  await ui.dialogue([
    { who: 'bolt', text: 'All the pieces have arrived — the Architects\' frame, the Dyson power core, the Machine aiming brain, the pulsar clock. Time to put it together!' }
  ]);
  await askReadingSet('assemble', 2);
  await ui.dialogue([
    { who: 'luma', text: 'Fit every piece into place — make it whole. Earth is counting on every join.' }
  ]);
  await keystoneJigsaw({ cols: 4, rows: 2 });
  sfx.fanfare?.();
  await ui.giveCard('deflector');
  await ui.giveClue('ls8');
  await ui.dialogue([
    { who: 'bolt', text: 'The Great Deflector is built — set right in the beam\'s path. Now... we wait for the light. Steady, Cadet.' }
  ]);
}

/* ============================================================
   CHAPTER 9 — TURN THE BEAM (self; the climax)
============================================================ */
export async function chapterDeflect(game) {
  const scene = await openScene(game, 'pulsarsky');
  const pulsar = makePulsar(1.2);
  addSky(scene, pulsar, -7, 12, -28);
  // the great deflector dish
  const dish = new THREE.Mesh(new THREE.SphereGeometry(4.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2a3450, emissive: 0x3a5ab0, emissiveIntensity: 0.5, metalness: 0.7, side: THREE.DoubleSide }));
  dish.rotation.x = -0.6;
  dish.position.set(6, 6, -16);
  scene.scene.add(dish);

  await ui.dialogue([
    { who: 'bolt', text: 'This is it. The killer beam is racing in at the speed of light — there\'s no second chance.', stamp: 'real' },
    { who: 'tick', text: 'Watch my pulsar, Cadet. When it FLASHES bright — that is the instant. Fire the deflector ON the flash!' }
  ]);
  await askReadingSet('deflect', 1);

  await fireOnBeat(pulsar);

  // the beam strikes and bends away — big flash
  const flash = document.createElement('div');
  flash.className = 'slice-flash';
  document.getElementById('ui').appendChild(flash);
  requestAnimationFrame(() => flash.classList.add('on'));
  sfx.land?.();
  await animate(700, () => {});
  setTimeout(() => { flash.classList.remove('on'); setTimeout(() => flash.remove(), 600); }, 250);

  await ui.dialogue([
    { who: 'luma', text: 'The beam... it bent! It slid right past Earth into the empty dark. YOU DID IT!' },
    { who: 'bolt', text: 'The whole galaxy, working as one, just saved a single small blue world. Cadet — Earth is safe. Forever.', stamp: 'real' }
  ]);
  await ui.giveClue('ls9');
  game.checkBadges();   // Earth Saver badge
  await closeScene(game, scene);
}

/** Lock-on rhythm: a shrinking ring telegraphs the beat. Tap FIRE when the ring
 *  closes onto the target and everything turns GREEN ("FIRE NOW!"). The sky
 *  pulsar flashes in sync. Need NEED good hits. Misses never punish, just coach. */
function fireOnBeat(pulsar, need = 3) {
  return new Promise((resolve) => {
    // pause the pulsar's own flash so the sky + the on-screen ring agree
    const savedUpdate = pulsar.userData.update;
    pulsar.userData.update = (dt) => { pulsar.userData.beams.rotation.y += dt * 2; };
    const core = pulsar.userData.core;

    const wrap = document.createElement('div');
    wrap.id = 'beat-wrap';
    wrap.innerHTML =
      '<div class="beat-hint">Watch the ring close in...</div>' +
      '<div class="beat-target"><div class="beat-incoming"></div><div class="beat-go">FIRE<br>NOW!</div></div>' +
      '<div class="beat-dots"></div>' +
      '<button class="beat-btn">🔥 FIRE!</button>';
    document.getElementById('ui').appendChild(wrap);
    const incoming = wrap.querySelector('.beat-incoming');
    const hint = wrap.querySelector('.beat-hint');
    const btn = wrap.querySelector('.beat-btn');
    const dotsEl = wrap.querySelector('.beat-dots');
    let hits = 0;
    const renderDots = () => { dotsEl.innerHTML = ''; for (let i = 0; i < need; i++) { const d = document.createElement('span'); d.className = 'beat-dot' + (i < hits ? ' on' : ''); dotsEl.appendChild(d); } };
    renderDots();
    ui.setObjective('💥 Tap FIRE when the ring turns GREEN!');

    const PERIOD = 1500;          // ms per beat — slow enough for a 6-year-old
    const WIN = 0.16;             // open window as a fraction of the period (generous)
    let open = false, raf = 0, t0 = performance.now();
    const fast = new URLSearchParams(location.search).has('fast');

    const loop = (now) => {
      const phase = ((now - t0) % PERIOD) / PERIOD;      // 0..1; beat at phase→1
      const scale = 1 + (1 - phase) * 1.9;               // ring shrinks 2.9 → 1.0
      incoming.style.transform = `translate(-50%,-50%) scale(${scale})`;
      open = phase > (1 - WIN) || phase < WIN * 0.3;      // window straddling the close
      wrap.classList.toggle('go', open);
      core.material.emissiveIntensity = open ? 6 : 1.6;   // sky pulsar flashes in sync
      if (open && hint.textContent !== 'FIRE NOW!') hint.textContent = 'FIRE NOW! 💥';
      else if (!open && phase < 0.5 && hint.textContent !== 'Get ready...') hint.textContent = 'Get ready...';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const finish = () => {
      cancelAnimationFrame(raf);
      pulsar.userData.update = savedUpdate;
      ui.setObjective('');
      wrap.remove();
      resolve();
    };
    btn.onclick = () => {
      if (open || fast) {       // ?fast lets the smoke test always succeed
        hits++;
        renderDots();
        sfx.shard?.();
        wrap.classList.add('hitflash');
        setTimeout(() => wrap.classList.remove('hitflash'), 200);
        if (hits >= need) { setTimeout(finish, 250); }
      } else {
        sfx.bump?.();
        hint.textContent = 'Too soon — wait for GREEN!';
      }
    };
    window.__fireOnBeat = () => btn.click();   // test hook
  });
}

/* ============================================================
   CHAPTER 10 — THE LONG WAY HOME (fold time + homecoming + postscript)
============================================================ */
export async function chapterFold(game) {
  // the fold-time gift
  await game.toBackdrop();
  await ui.dialogue([
    { who: 'machine', text: 'WAIT, SMALL WARM ONE. YOU SAVED A WORLD AND LOST YOUR OWN YEARS. ACCEPT MY LAST GIFT: A WAY TO FOLD SPACE-TIME...' },
    { who: 'machine', text: '...SO YOU ARRIVE HOME ONLY MONTHS AFTER YOU LEFT. GO. BE WITH THE ONES YOU LOVE, IN YOUR OWN TIME.' }
  ]);
  await timeWarp('Months', 'Months', 'Time folds back into step. Ship-time and Earth-time, together again at last. 🏡');

  // homecoming over the real Earth
  const earth = new EarthScene(game, { showFps: false });
  game.setScene(earth);
  game.pipeline.setBloom(0.7, 0.5, 0.6);
  await ui.fade(false);
  await ui.dialogue([
    { who: 'luma', text: 'There it is. Home — safe, blue, and waiting. And only a few months have passed. We made it, Cadet.' }
  ]);
  await askReadingSet('fold', 2);
  await ui.giveClue('ls10');
  await ui.fade(true);
  earth.dispose();

  // --- school postscript ---
  const scene = await openScene(game, 'school');
  hideStars(scene);
  scene.scene.background = new THREE.Color(0x9fcfe8);
  if (scene.scene.fog) { scene.scene.fog.color.set(0xbfe2f0); scene.scene.fog.near = 36; scene.scene.fog.far = 120; }
  scene.scene.add(new THREE.HemisphereLight(0xbfe6ff, 0x3f7a44, 1.2));
  scene.scene.add(makeGrassField(game.lowDetail ? 200 : 420, 5, 28));
  for (let i = 0; i < 8; i++) { const tr = makeTree(0.8 + Math.random() * 0.5); const a = Math.random() * Math.PI * 2, d = 11 + Math.random() * 10; tr.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.7 - 2); scene.scene.add(tr); }
  const colors = [0xff8a6a, 0x6ad06a, 0xffd95c, 0xc88aff];
  for (let i = 0; i < 4; i++) { const kid = makeKid(colors[i]); scene.place(kid, -6 + i * 4, 2 + (i % 2), { id: 'kid' + i, ry: Math.PI }); }

  await ui.dialogue([
    { who: 'bolt', text: 'And so, only a few months after you left... it was a regular school day again.' },
    { who: 'player', text: 'So then I flew near the speed of light, met the Architects, helped build a Dyson Sphere, and a giant robot brain aimed the deflector, and—' },
    { who: 'classmate', text: 'Suuure you did. And I flew to the Moon for breakfast!' },
    { who: 'classmate', text: 'Nice story though. Wanna play tag?' },
    { who: 'player', text: '...Yeah. Yeah, let\'s play tag.' },
    { who: 'bolt', text: 'They don\'t believe a word of it, Cadet. But you and I know the truth — and so does a whole grateful galaxy. *wink*' },
    { who: 'luma', text: 'You saved your home, and everyone\'s home. The bravest thing a small warm one ever did. Welcome back, hero. 🌟' }
  ]);
  await ui.giveCard('luma');
  game.checkBadges();   // Saga Hero badge + collects the 5th Grand Prize piece

  // grand finale: the whole saga is complete
  const saga = sagaStatus();
  if (saga.count >= saga.total) {
    await ui.rewardBurst('🏆', 'THE GRAND PRIZE SAGA IS COMPLETE!', `All 5 of 5 pieces collected across the whole Mission: Starlight saga! Show a grown-up — the Grand Prize is unlocked: "${saga.reward}" 🎉`);
  }
  await ui.dialogue([
    { who: 'bolt', text: 'That\'s the end of our saga, Cadet — five missions, a galaxy of friends, and a whole universe a little safer. Thank you for flying with us. 🚀💖' }
  ]);
  await closeScene(game, scene);
}

export const CHAPTER_SCRIPTS = [
  chapterHomecoming,
  chapterStarbow,
  chapterPulsar,
  chapterArchitects,
  chapterDyson,
  chapterMachine,
  chapterTimetoll,
  chapterAssemble,
  chapterDeflect,
  chapterFold
];
