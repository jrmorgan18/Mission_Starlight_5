// The conductor: render pipeline, scene switching, story progression, badges.
import * as THREE from 'three';
import { loadSave, save, resetSave, loadGame1Save } from './save.js';
import { CHAPTERS, BADGES } from './content.js';
import { CHAPTER_SCRIPTS } from './systems/chapters.js';
import { makeStarfield, makePlanet, makeNebulaCloud, makeGlowSprite, makeRover } from './world/builders.js';
import { runCaveSlice } from './cave/caveScene.js';
import { runEarthSlice } from './earth/earthScene.js';
import { HyperspaceScene } from './hyperspace/hyperspace.js';
import { RoverDriveScene } from './rover/roverDrive.js';
import { Pipeline } from './fx/post.js';
import * as ui from './ui/ui.js';
import { openParentZone } from './ui/parent.js';
import { sfx } from './audio.js';
import { collectSagaPiece } from './saga.js';

class TitleBackdrop {
  constructor(game) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    this.camera.position.set(0, 2, 26);
    this.scene.add(makeStarfield(game.lowDetail ? 500 : 1400));
    this.scene.add(new THREE.HemisphereLight(0x8899ff, 0x110a22, 2.2));
    const sun = new THREE.DirectionalLight(0xfff2dd, 3.2);
    sun.position.set(30, 20, 10);
    this.scene.add(sun);

    // the poster shot: red Mars beside a half-terraformed Mars, a little rover below
    const cloud = makeNebulaCloud(0x9a5a3a, 10, 50);
    cloud.position.set(0, 8, -82);
    this.scene.add(cloud);

    this.planets = [];
    const layout = [['marsred', 3.2, -13, 3, -48], ['marsalive', 2.0, 17, -6, -42]];
    for (const [key, r, x, y, z] of layout) {
      const p = makePlanet(key, r);
      p.position.set(x, y, z);
      this.scene.add(p);
      this.planets.push(p);
    }

    this.rover = makeRover();
    this.rover.scale.setScalar(2.2);
    this.rover.position.set(2, -6, -18);
    this.rover.rotation.y = -0.5;
    this.scene.add(this.rover);
  }
  update(dt, t) {
    for (const p of this.planets) p.rotation.y += dt * 0.12;
    this.rover.position.y = -6 + Math.sin(t * 1.5) * 0.15;
    this.camera.position.x = Math.sin(t * 0.08) * 4;
    this.camera.lookAt(0, -1, -30);
  }
  dispose() {}
}

export class Game {
  constructor() {
    this.pipeline = new Pipeline(document.getElementById('scene'));
    this.activeScene = null;
    this.clock = new THREE.Clock();

    addEventListener('resize', () => {
      this.pipeline.resize();
      if (this.activeScene?.camera) {
        this.activeScene.camera.aspect = innerWidth / innerHeight;
        this.activeScene.camera.updateProjectionMatrix();
      }
    });

    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const t = this.clock.elapsedTime;
      if (this.activeScene) {
        this.activeScene.update?.(dt, t);
        this.pipeline.render(dt);
      }
    };
    loop();
  }

  /** Compatibility with the proven scene code from game 1. */
  get renderer() { return this.pipeline.renderer; }
  get lowDetail() { return this.pipeline.quality === 'low'; }

  setScene(sceneObj) {
    this.activeScene = sceneObj;
    if (sceneObj?.camera) {
      sceneObj.camera.aspect = innerWidth / innerHeight;
      sceneObj.camera.updateProjectionMatrix();
      this.pipeline.attach(sceneObj.scene, sceneObj.camera);
      // scene-appropriate bloom (chapters override this for their showpieces)
      if (sceneObj instanceof TitleBackdrop) this.pipeline.setBloom(0.95, 0.6, 0.7);
      else this.pipeline.setBloom(0.8, 0.55, 0.85);
    }
  }

  openParentZone() {
    openParentZone(this, () => location.reload());
  }

  checkBadges() {
    const s = loadSave();
    for (const badge of BADGES) {
      const earned = badge.test(s);
      if (earned && !s.badges.includes(badge.id)) {
        s.badges.push(badge.id);
        save();
        const prize = s.parent.prizes.find((p) => p.milestone === badge.id);
        ui.rewardBurst(badge.icon, `Badge earned: ${badge.name}!`,
          prize ? `Show a grown-up — this badge is worth a real prize: "${prize.reward}" 🎁` : 'You\'re becoming a legend of the spaceways!');
      }
      if (badge.id === 'finish' && earned) collectSagaPiece('game4');
    }
  }

  /** Transition INTO a chapter: a star-flight to Mars, a rover drive between
   *  sites, or a simple fade. The chapter script then builds its own scene. */
  async arrive(ch) {
    if (ch.arrival === 'self') return;
    if (ch.arrival === 'flight') {
      if (ui.isFaded()) await this.toBackdrop();
      await ui.dialogue([
        { who: 'luma', text: 'Course locked on Mars! Hold tight, Cadet — riding the star-stream all the way to the Red Planet!' },
        { who: 'bolt', text: 'Steer with the joystick, hold LIGHTSPEED to zoom, and grab the ⭐ stars along the way!' }
      ]);
      await ui.fade(true);
      const ride = new HyperspaceScene(this, 'MARS');
      this.setScene(ride);
      await ui.fade(false);
      await ride.run();
      ride.dispose();
      ui.countJump();
      return;
    }
    if (ch.arrival === 'drive') {
      if (ui.isFaded()) await this.toBackdrop();
      await ui.dialogue([
        { who: 'rusty', text: `Hop aboard — I'll drive us to ${ch.name}! Steer me with the joystick, hold GO to roll faster, and scoop up any ⭐ stars you see!` }
      ]);
      await ui.fade(true);
      const drive = new RoverDriveScene(this, ch.name);
      this.setScene(drive);
      await ui.fade(false);
      await drive.run();
      drive.dispose();
      return;
    }
    await ui.fade(true);   // plain montage-style arrival
  }

  /** If the screen is still black from a scene change, fade back in over the starry backdrop. */
  async toBackdrop() {
    if (!this.backdrop) this.backdrop = new TitleBackdrop(this);
    this.setScene(this.backdrop);
    if (ui.isFaded()) await ui.fade(false);
  }

  async start() {
    const s = loadSave();
    ui.buildHUD(this);

    // PHASE-A visual slice: boot straight to the Earth homecoming to validate the
    // NASA-asset pipeline (real Blue Marble textures) + perf on the iPad before
    // building the rest of the game.
    if (new URLSearchParams(location.search).has('slice')) {
      await runEarthSlice(this);
      return;
    }

    this.checkBadges();   // backfills saga progress for already-finished saves
    if (!s.cards.includes('bolt')) { s.cards.push('bolt'); save(); }   // Bolt is always aboard
    await this.toBackdrop();

    // same github.io origin: greet the returning hero of game 3 by name
    const g1 = loadGame1Save();
    let greeting = null;
    if (g1?.name && !s.name) {
      greeting = g1.chapter >= 6
        ? `🏅 Welcome back, Cadet ${g1.name} — Star Rescuer!`
        : `👋 Good to see you again, Cadet ${g1.name}!`;
    }

    const choice = await ui.titleScreen(!!s.name, greeting);
    if (choice === 'new') {
      resetSave();
      return this.start();
    }

    if (!s.name) {
      const name = await ui.nameEntry(g1?.name || '');
      s.name = name;
      if (g1?.chapter >= 6 && g1?.name?.toLowerCase() === name.toLowerCase()) {
        s.game1Hero = true;   // unlocks the Star Rescuer badge (finished game 3)
      }
      save();
      this.checkBadges();
    }

    if (!s.seenIntro) {
      s.seenIntro = true;
      save();
      await ui.dialogue([
        { who: 'bolt', text: `Cadet ${s.name}, reporting for duty! Bolt here, fact-checker chip warmed up. Beep!` },
        { who: 'luma', text: 'We saved the Solari from their dying star — but they still need somewhere to live. So we found them a world...' },
        { who: 'bolt', text: 'A small, red, rocky world: MARS. There\'s just one problem, Cadet. When we got close, we found out Mars is... well... a DEAD planet.', stamp: 'real' },
        { who: 'bolt', text: 'Cold. Dry. Silent. But maybe — just maybe — we can wake it back up. Buckle up. Let\'s land on the Red Planet.' }
      ]);
    }

    // story loop
    while (loadSave().chapter < CHAPTERS.length) {
      const i = loadSave().chapter;
      const ch = CHAPTERS[i];
      if (ui.isFaded()) await this.toBackdrop();
      try {
        await ui.chapterCard(i + 1, ch.name, ch.sub);
        await this.arrive(ch);
        await CHAPTER_SCRIPTS[i](this);
        const st = loadSave();
        st.chapter = i + 1;
        save();
        this.checkBadges();
      } catch (e) {
        if (e instanceof ui.DemotionSignal) { await this.goBackAChapter(i); continue; }
        throw e;
      }
    }

    // story complete: free-play replay menu
    await this.freePlay();
  }

  /** Three cumulative wrong answers: bounce the player back one chapter to practice, then work forward again. */
  async goBackAChapter(fromIndex) {
    const target = Math.max(0, fromIndex - 1);
    const st = loadSave();
    st.chapter = target;
    save();
    // tear down any half-built chapter scene so we return cleanly to the backdrop
    if (this.activeScene && this.activeScene !== this.backdrop && this.activeScene.dispose) {
      try { this.activeScene.dispose(); } catch { /* best effort */ }
    }
    ui.setObjective('');
    if (!ui.isFaded()) await ui.fade(true);
    await this.toBackdrop();
    await ui.dialogue([
      { who: 'bolt', text: `Oops meter's full, Cadet — totally okay! Let's roll back to ${CHAPTERS[target].name} and warm up those brain-thrusters. 🚀` }
    ]);
  }

  async freePlay() {
    for (;;) {
      await this.toBackdrop();
      const pick = await this.replayMenu();
      try {
        const ch = CHAPTERS[pick];
        await ui.chapterCard(pick + 1, ch.name, ch.sub);
        await this.arrive(ch);
        await CHAPTER_SCRIPTS[pick](this);
      } catch (e) {
        if (!(e instanceof ui.DemotionSignal)) throw e;   // in free-play, just bow back out to the menu
      }
    }
  }

  replayMenu() {
    return new Promise((resolve) => {
      const screen = document.createElement('div');
      screen.className = 'screen dim';
      const title = document.createElement('div');
      title.className = 'title-sub';
      title.textContent = '🌟 Mission complete! Revisit any part of Mars:';
      screen.appendChild(title);
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:80vw;';
      CHAPTERS.forEach((ch, i) => {
        const b = document.createElement('button');
        b.className = 'dlg-btn primary';
        b.textContent = `${i + 1}. ${ch.name}`;
        b.onclick = () => { sfx.tap(); screen.remove(); resolve(i); };
        wrap.appendChild(b);
      });
      screen.appendChild(wrap);
      document.getElementById('ui').appendChild(screen);
    });
  }
}
