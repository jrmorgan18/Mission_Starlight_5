// Minigames. Each is an async function that resolves when the player wins.
// None of them can be failed permanently — wrong moves just bounce off.
import * as THREE from 'three';
import { makeTextSprite, makeGlowSprite, makeCrystal, makeBeacon } from '../world/builders.js';
import * as ui from '../ui/ui.js';
import { sfx } from '../audio.js';
import { hasUpgrade } from '../save.js';

/** Wait until the hero reaches ANY of the listed interactives; resolves its id. */
export function tapAny(scene, ids) {
  return new Promise((resolve) => {
    for (const id of ids) {
      const item = scene.interactives.get(id);
      if (!item) continue;
      if (!item.marker) {
        item.marker = makeGlowSprite(0xffd95c, 1.6);
        item.marker.position.set(item.obj.position.x, 3, item.obj.position.z);
        scene.scene.add(item.marker);
        item.marker.userData.marker = true;
      }
      item.pending = () => {
        for (const otherId of ids) {
          const other = scene.interactives.get(otherId);
          if (other) other.pending = null;
        }
        resolve(id);
      };
    }
  });
}

/** Collect scattered parts by walking to each one. */
export async function collectParts(scene, partIds, label) {
  let remaining = [...partIds];
  while (remaining.length) {
    ui.setObjective(`🔧 ${label}: ${partIds.length - remaining.length}/${partIds.length} found`);
    const id = await tapAny(scene, remaining);
    sfx.collect();
    const item = scene.interactives.get(id);
    scene.clearMarker(id);
    if (item) scene.scene.remove(item.obj);
    scene.interactives.delete(id);
    remaining = remaining.filter((x) => x !== id);
    ui.toast(`🔧 Found one! ${remaining.length} to go`);
  }
  ui.setObjective('');
  sfx.fanfare();
}

/* ============ Proxima: Flare Shields ============
   Ember's warning signs play out — freckles grow, the wind hums — and you
   must tap the SHIELD button before the flash. Reflex + sequence reading. */
export function flareShields(rounds = 3) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.style.zIndex = 65;

    const title = document.createElement('div');
    title.style.cssText = 'font-size:clamp(17px,3vw,24px);font-weight:900;color:#ff8a6a;text-align:center;padding:0 20px;';
    wrap.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.id = 'flare-canvas';
    const W = Math.min(560, Math.floor(innerWidth * 0.6));
    const H = Math.min(320, Math.floor(innerHeight * 0.46));
    canvas.width = W; canvas.height = H;
    canvas.style.cssText = 'border:3px solid #a04030;border-radius:14px;background:#1a0808;';
    wrap.appendChild(canvas);

    const shieldBtn = document.createElement('button');
    shieldBtn.className = 'big-btn cyan';
    shieldBtn.id = 'shield-btn';
    shieldBtn.textContent = '🛡 RAISE SHIELDS!';
    wrap.appendChild(shieldBtn);

    const note = document.createElement('div');
    note.className = 'small-note';
    note.textContent = 'Watch the sun freckles grow... shields up BEFORE the flash!';
    wrap.appendChild(note);

    document.getElementById('ui').appendChild(wrap);
    const ctx = canvas.getContext('2d');

    let round = 1;
    let phase = 'calm';        // calm -> growing -> danger -> flash
    let phaseT = 0;
    let shielded = false;
    let spots = [];
    let raf;

    const newRound = () => {
      phase = 'calm';
      phaseT = 0;
      shielded = false;
      spots = Array.from({ length: 7 }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 0.2 + Math.random() * 0.55,
        size: 2
      }));
      title.textContent = `🔴 Flare watch! Round ${round} of ${rounds}`;
    };
    newRound();

    const growTime = () => 2.2 - round * 0.35;     // freckles grow faster each round

    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      phaseT += dt;

      if (phase === 'calm' && phaseT > 1.0 + Math.random() * 0.03) { phase = 'growing'; phaseT = 0; }
      else if (phase === 'growing' && phaseT > growTime()) { phase = 'danger'; phaseT = 0; sfx.thrust(); }
      else if (phase === 'danger' && phaseT > 1.1) { phase = 'flash'; phaseT = 0; }

      // draw the red dwarf
      ctx.fillStyle = '#1a0808';
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
      const flash = phase === 'flash';
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * (flash ? 2.4 : 1.15));
      g.addColorStop(0, flash ? '#fff6e8' : '#ff7a4a');
      g.addColorStop(0.7, flash ? '#ffd9a8' : '#c83a18');
      g.addColorStop(1, 'rgba(40,8,8,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * (flash ? 2.2 : 1.1), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#ffb86a' : '#ff5a2a';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // freckles
      const grow = phase === 'growing' ? phaseT / growTime() : phase === 'calm' ? 0 : 1;
      ctx.fillStyle = '#7a1808';
      for (const sp of spots) {
        const sx = cx + Math.cos(sp.a) * R * sp.r;
        const sy = cy + Math.sin(sp.a) * R * sp.r;
        ctx.beginPath(); ctx.arc(sx, sy, sp.size + grow * 9, 0, Math.PI * 2); ctx.fill();
      }

      if (phase === 'danger') {
        ctx.fillStyle = '#ffe9b8';
        ctx.font = '900 22px Trebuchet MS';
        ctx.textAlign = 'center';
        ctx.fillText('〰 the wind is humming 〰', cx, 30);
        ctx.textAlign = 'left';
      }

      // shield dome
      if (shielded) {
        ctx.strokeStyle = '#5ce8ff';
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(cx, H + 30, H * 0.75, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (phase === 'flash' && phaseT > 0.8) {
        if (shielded) {
          sfx.correct();
          ui.toast('🛡 Shields held! Great timing!', true);
          round++;
          if (round > rounds) {
            cancelAnimationFrame(raf);
            sfx.fanfare();
            wrap.remove();
            resolve();
            return;
          }
          newRound();
        } else {
          sfx.bump();
          note.textContent = 'The flash beat you! Watch for the humming wind — that\'s your moment!';
          newRound();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    shieldBtn.onclick = () => {
      if (phase === 'danger') {
        if (!shielded) { shielded = true; sfx.collect(); }
      } else if (phase === 'growing' || phase === 'calm') {
        sfx.tap();
        note.textContent = 'Too early — shields drain power! Wait for the humming wind.';
      }
    };
  });
}

/* ============ TRAPPIST-1: The Lantern Chain ============
   Seven worlds in an arc — tap them in orbit order (b through h) to pass
   the festival light down the chain. Sequencing + letters. */
export async function lanternChain(scene, planetIds) {
  // planetIds in correct order, e.g. ['tp-b','tp-c',...]
  for (let step = 0; step < planetIds.length; step++) {
    const want = planetIds[step];
    const letter = want.split('-')[1];
    ui.setObjective(`🏮 Pass the light to planet ${letter.toUpperCase()}!`);
    for (;;) {
      const id = await tapAny(scene, planetIds.slice(step));
      if (id === want) {
        sfx.collect();
        const item = scene.interactives.get(id);
        const lamp = item?.obj.userData.lamp;
        if (lamp) {
          lamp.material.emissiveIntensity = 3;
          lamp.material.emissive = new THREE.Color(0xffd95c);
        }
        scene.clearMarker(id);
        scene.interactives.delete(id);
        break;
      }
      sfx.wrong();
      ui.toast(`The chain goes in order — planet ${letter.toUpperCase()} is next!`);
    }
  }
  ui.setObjective('');
  sfx.fanfare();
}

/* ============ 55 Cancri e: Diamond Dig ============
   Tap mounds to dig. Popper crystals fizzle; real diamonds hum. Find N real ones. */
export async function diamondDig(scene, moundIds, needed) {
  let found = 0;
  while (found < needed) {
    ui.setObjective(`⛏️ Dig for diamonds! ${found}/${needed} found`);
    const remaining = moundIds.filter((id) => scene.interactives.has(id));
    const id = await tapAny(scene, remaining);
    const item = scene.interactives.get(id);
    scene.clearMarker(id);
    scene.interactives.delete(id);

    sfx.thrust();
    const mound = item.obj;
    const start = mound.position.y;
    await animate(700, (k) => { mound.position.y = start - k * 1.2; });

    if (mound.userData.isDiamond) {
      found++;
      sfx.shard();
      const gem = makeCrystal(0xbfe8ff, 1.6);
      gem.position.set(mound.position.x, 0, mound.position.z);
      scene.scene.add(gem);
      ui.toast(`💎 A real diamond — it\'s humming! ${found}/${needed}`, true);
    } else {
      sfx.bump();
      ui.toast('💥 POP! Just a glitter crystal. Real diamonds are deep, dark, and cool!');
    }
  }
  ui.setObjective('');
  sfx.fanfare();
}

/* ============ Pulsar Lighthouse: Echo the Blinks ============
   Tick's lighthouse blinks a pattern — count the blinks, then tap the drum
   the same number of times. Counting + working memory. */
export function echoBlinks(scene, lighthouse, rounds = [3, 5, 7]) {
  return new Promise(async (resolve) => {
    const lamp = lighthouse.userData.lamp;
    const baseIntensity = lamp.material.emissiveIntensity;

    for (let r = 0; r < rounds.length; r++) {
      const count = rounds[r];
      let ok = false;
      while (!ok) {
        ui.setObjective(`🗼 Watch closely... count the blinks!`);
        scene.tapEnabled = false;
        // play the blinks
        for (let i = 0; i < count; i++) {
          lamp.material.emissiveIntensity = 8;
          sfx.tap();
          await animate(160, () => {});
          lamp.material.emissiveIntensity = 0.4;
          await animate(340, () => {});
        }
        lamp.material.emissiveIntensity = baseIntensity;

        // answer pad
        window.__drumExpected = count;   // automation hook for smoke tests
        const taps = await drumPad(count);
        if (taps === count) {
          ok = true;
          sfx.correct();
          ui.toast(`🗼 ${count} blinks — perfect echo!`, true);
        } else {
          sfx.wrong();
          ui.toast(`You tapped ${taps}... the lighthouse blinked ${count} times. Watch again!`);
        }
      }
    }
    scene.tapEnabled = true;
    ui.setObjective('');
    sfx.fanfare();
    resolve();
  });
}

function drumPad(expected) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.style.zIndex = 65;
    const title = document.createElement('div');
    title.style.cssText = 'font-size:clamp(18px,3vw,26px);font-weight:900;color:#5ce8ff;';
    title.textContent = 'How many blinks? Tap the drum that many times!';
    const drum = document.createElement('button');
    drum.id = 'drum-btn';
    drum.style.cssText = 'font-size:64px;width:140px;height:140px;border-radius:50%;background:#2a2f4e;border:4px solid #5ce8ff;';
    drum.textContent = '🥁';
    const counter = document.createElement('div');
    counter.style.cssText = 'font-size:40px;font-weight:900;color:#ffd95c;min-height:52px;';
    counter.textContent = '0';
    const done = document.createElement('button');
    done.className = 'big-btn';
    done.textContent = 'DONE ✔';
    let taps = 0;
    drum.onclick = () => { taps++; counter.textContent = String(taps); sfx.tap(); drum.animate([{ transform: 'scale(0.9)' }, { transform: 'scale(1)' }], { duration: 120 }); };
    done.onclick = () => { wrap.remove(); resolve(taps); };
    wrap.append(title, drum, counter, done);
    document.getElementById('ui').appendChild(wrap);
  });
}

/* ============ Sgr A*: Spot the Lensed Star ============
   Game-1 blink-test callback, leveled up: the black hole's gravity bends
   light, so one star STRETCHES into an arc between photos. Find it. */
export function lensSpot(round = 1) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.style.zIndex = 65;

    const title = document.createElement('div');
    title.style.cssText = 'font-size:clamp(17px,3vw,24px);font-weight:900;color:#ffb86a;text-align:center;padding:0 20px;';
    title.textContent = `🔭 Gravity bends light! Tap the star that STRETCHES. (Photo ${round} of 3)`;
    wrap.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.id = 'lens-canvas';
    const W = Math.min(640, Math.floor(innerWidth * 0.72));
    const H = Math.min(380, Math.floor(innerHeight * 0.55));
    canvas.width = W; canvas.height = H;
    canvas.style.cssText = 'border:3px solid #a06030;border-radius:14px;background:#04050f;touch-action:manipulation;';
    wrap.appendChild(canvas);

    const note = document.createElement('div');
    note.className = 'small-note';
    note.textContent = 'When something heavy and invisible passes in front, a star smears into a little arc.';
    wrap.appendChild(note);

    document.getElementById('ui').appendChild(wrap);
    const ctx = canvas.getContext('2d');

    const starCount = 36 + round * 20;
    const stars = Array.from({ length: starCount }, () => ({
      x: 14 + Math.random() * (W - 28),
      y: 14 + Math.random() * (H - 28),
      r: 1 + Math.random() * 2.2,
      a: 0.5 + Math.random() * 0.5
    }));
    const target = {
      x: W * (0.25 + Math.random() * 0.5),
      y: H * (0.25 + Math.random() * 0.5),
      r: 2.6
    };

    let frame = 0;
    let solved = false;
    const draw = () => {
      ctx.fillStyle = '#04050f';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#cfd8ff';
      for (const st of stars) {
        ctx.globalAlpha = st.a;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffe9b8';
      if (!frame) {
        ctx.beginPath(); ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2); ctx.fill();
      } else {
        // lensed: smeared into a bright little arc
        ctx.strokeStyle = '#ffe9b8';
        ctx.lineWidth = 3.4 - round * 0.5;
        ctx.beginPath();
        ctx.arc(target.x, target.y + 9, 13, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffb86a';
      ctx.font = '700 15px Trebuchet MS';
      ctx.fillText(frame ? '📷 With the dark giant passing' : '📷 Normal night', 12, 22);
      if (solved) {
        ctx.strokeStyle = '#5cff9d';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(target.x, target.y, 20, 0, Math.PI * 2); ctx.stroke();
      }
    };
    draw();
    const blink = setInterval(() => { frame = 1 - frame; draw(); }, 850);

    canvas.addEventListener('pointerdown', (e) => {
      if (solved) return;
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const y = ((e.clientY - r.top) / r.height) * H;
      if (Math.hypot(x - target.x, y - target.y) < 26) {
        solved = true;
        sfx.shard();
        draw();
        title.textContent = '🎉 You found it! Bent starlight means heavy gravity is hiding there!';
        setTimeout(() => { clearInterval(blink); wrap.remove(); resolve(); }, 1800);
      } else {
        sfx.wrong();
        note.textContent = 'That one stayed round — look for the star that smears into an ARC!';
      }
    });
  });
}

/* ============ Sgr A*: The Slingshot Rescue ============
   Nana Lyra circles the black hole. Tap BOOST exactly when she crosses the
   glowing green window to swing her higher — three good boosts and she's free. */
export function slingshotRescue(scene, lyra, blackHolePos) {
  return new Promise((resolve) => {
    const NEED = 3;
    let boosts = 0;
    let orbitR = 9;
    let angle = 0;
    let windowAngle = Math.PI * 0.5;    // the boost window position

    // green boost window arc
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(orbitR, 0.18, 8, 32, Math.PI * 0.4),
      new THREE.MeshStandardMaterial({ color: 0x5cff9d, emissive: 0x2dbf6d, emissiveIntensity: 2, transparent: true, opacity: 0.9 })
    );
    arc.position.copy(blackHolePos);
    arc.rotation.x = Math.PI / 2.3;
    arc.rotation.z = windowAngle;
    scene.scene.add(arc);

    const boostBtn = document.createElement('button');
    boostBtn.id = 'boost-btn';
    boostBtn.className = 'big-btn cyan';
    boostBtn.textContent = '🚀 BOOST!';
    boostBtn.style.cssText += ';position:absolute;bottom:30px;right:30px;z-index:40;';
    document.getElementById('ui').appendChild(boostBtn);

    ui.setObjective(`🌀 Tap BOOST when Nana Lyra glows GREEN in the window! ${boosts}/${NEED}`);

    lyra.userData.update = (dt) => {
      angle += dt * (1.1 + boosts * 0.15);
      const k = orbitR;
      lyra.position.set(
        blackHolePos.x + Math.cos(angle) * k,
        blackHolePos.y + Math.sin(angle) * k * 0.42,
        blackHolePos.z + Math.sin(angle) * k * 0.3 + 4
      );
      // glow brighter inside the window
      const inWindow = isInWindow();
      lyra.userData.core.material.emissive = new THREE.Color(inWindow ? 0x5cff9d : 0xffa84a);
    };

    const isInWindow = () => {
      const a = ((angle - windowAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      return a < Math.PI * 0.4;
    };

    boostBtn.onclick = () => {
      if (isInWindow()) {
        boosts++;
        orbitR += 3.2;
        sfx.shard();
        arc.geometry.dispose();
        windowAngle = Math.random() * Math.PI * 2;
        arc.geometry = new THREE.TorusGeometry(orbitR, 0.18, 8, 32, Math.PI * 0.4);
        arc.rotation.z = windowAngle;
        ui.toast(`🚀 Perfect slingshot! Her orbit is climbing! ${boosts}/${NEED}`, true);
        ui.setObjective(boosts < NEED ? `🌀 Tap BOOST in the green window! ${boosts}/${NEED}` : '');
        if (boosts >= NEED) {
          scene.scene.remove(arc);
          boostBtn.remove();
          lyra.userData.update = (dt) => {                 // spiral out to safety
            lyra.position.lerp(new THREE.Vector3(0, 3, 2), dt * 1.2);
            lyra.userData.core.material.emissive = new THREE.Color(0xffd95c);
          };
          sfx.fanfare();
          resolve();
        }
      } else {
        sfx.bump();
        ui.toast('Not yet! Wait for her to glow GREEN in the window — timing is everything!');
      }
    };
  });
}

/* ============ shared helpers ============ */

export function animate(ms, step) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      step(k);
      if (k < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/* ============ Mars: Boulder Hunt ============
   Heavy boulders hide the old river stones. Walk to a boulder to heave it
   aside — some hide a stone, some are just dust. Find N stones. Harder than a
   plain walk-and-collect because you can't see what's underneath. */
export async function boulderHunt(scene, boulderIds, needed) {
  let found = 0;
  let remaining = [...boulderIds];
  while (found < needed && remaining.length) {
    ui.setObjective(`🪨 Heave the boulders aside — find ${found}/${needed} river stones`);
    const id = await tapAny(scene, remaining);
    const item = scene.interactives.get(id);
    scene.clearMarker(id);
    scene.interactives.delete(id);
    remaining = remaining.filter((x) => x !== id);

    const boulder = item.obj;
    sfx.thrust?.();
    // heave it: roll sideways and tip over
    const dir = boulder.position.x >= 0 ? 1 : -1;
    const sx = boulder.position.x, sz = boulder.position.z;
    await animate(650, (k) => {
      boulder.position.x = sx + dir * 3 * k;
      boulder.position.z = sz + 1.2 * k;
      boulder.rotation.z -= dir * k * 2.4;
      boulder.position.y = Math.abs(Math.sin(k * Math.PI)) * 0.8 + 0.5;
    });

    if (boulder.userData.hasStone) {
      found++;
      sfx.shard?.();
      const stone = makeCrystal(0xbfd0ff, 1.3);
      stone.position.set(sx, 0, sz);
      scene.scene.add(stone);
      ui.toast(`💎 A smooth river stone! ${found}/${needed}`, true);
    } else {
      sfx.bump?.();
      ui.toast('💨 Just red dust under that one — try another!');
    }
  }
  ui.setObjective('');
  sfx.fanfare?.();
}

/** Drop a glowing beacon shard into the scene and have the hero collect it. */
export async function beaconPickup(scene) {
  const beacon = makeBeacon();
  scene.place(beacon, 0, -3, { id: 'the-beacon' });
  await scene.waitInteract('the-beacon');
  scene.scene.remove(beacon);
  scene.interactives.delete('the-beacon');
}

/* ============ Energy Catch (Dyson Sphere) ============
   Glowing energy orbs pop up around the play field; tap them before they fade
   to charge the power meter. Reach the target to fill the Dyson Sphere. A
   reaction/attention game — far livelier than walking to pick up panels. */
export function energyCatch(target = 8) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.id = 'energy-game';
    wrap.innerHTML =
      '<div class="eg-title">☀️ Catch the star\'s energy — tap the glowing orbs!</div>' +
      '<div class="eg-field"></div>' +
      '<div class="eg-bar"><div class="eg-fill"></div></div>';
    document.getElementById('ui').appendChild(wrap);
    const field = wrap.querySelector('.eg-field');
    const fill = wrap.querySelector('.eg-fill');

    let caught = 0, spawnTimer = 0, done = false;
    const orbLife = hasUpgrade('gloves') ? 1700 : 1150;   // Energy Gloves upgrade: orbs linger
    const timers = new Set();
    const render = () => { fill.style.width = `${Math.round((caught / target) * 100)}%`; };

    const finish = () => {
      if (done) return; done = true;
      clearInterval(spawnTimer);
      timers.forEach((t) => clearTimeout(t));
      sfx.fanfare?.();
      wrap.remove();
      window.__energySolve = undefined;
      resolve();
    };

    const spawnOrb = () => {
      if (done) return;
      const orb = document.createElement('button');
      orb.className = 'eg-orb';
      const r = field.getBoundingClientRect();
      orb.style.left = `${10 + Math.random() * 80}%`;
      orb.style.top = `${10 + Math.random() * 76}%`;
      orb.onclick = () => {
        if (orb.dataset.gone) return;
        orb.dataset.gone = '1';
        caught++; render();
        sfx.collect?.();
        orb.classList.add('pop');
        setTimeout(() => orb.remove(), 150);
        if (caught >= target) finish();
      };
      field.appendChild(orb);
      requestAnimationFrame(() => orb.classList.add('show'));
      const life = setTimeout(() => { if (!orb.dataset.gone) { orb.classList.remove('show'); setTimeout(() => orb.remove(), 200); } }, orbLife);
      timers.add(life);
    };

    spawnTimer = setInterval(spawnOrb, 720);
    spawnOrb();
    render();
    window.__energySolve = () => { caught = target; render(); finish(); };   // test hook
  });
}

/* ============ Program the Helper Robot (the Machine Mind) ============
   Write a little program — tap arrow commands to queue a path — then RUN to
   send the robot across the grid to its power core. A real coding/sequencing
   puzzle. Wrong path just resets; never fails. */
export function programRobot() {
  return new Promise((resolve) => {
    const COLS = 4, ROWS = 3;
    const start = { c: 0, r: 2 }, goal = { c: 2, r: 0 };   // needs →→↑↑ (order-flexible)
    let pos = { ...start }, queue = [], running = false;

    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.id = 'program-game';
    wrap.innerHTML =
      '<div class="pg-title">🤖 Program the robot — write its path to the core, then RUN!</div>' +
      '<div class="pg-grid"></div>' +
      '<div class="pg-queue"></div>' +
      '<div class="pg-cmds">' +
      '<button class="pg-cmd" data-d="right">➡️</button>' +
      '<button class="pg-cmd" data-d="up">⬆️</button>' +
      '<button class="pg-run">▶ RUN</button>' +
      '<button class="pg-clear">↺</button>' +
      '</div>';
    document.getElementById('ui').appendChild(wrap);
    const grid = wrap.querySelector('.pg-grid');
    const qEl = wrap.querySelector('.pg-queue');

    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'pg-cell';
      if (c === goal.c && r === goal.r) cell.classList.add('goal');
      grid.appendChild(cell);
      cells.push(cell);
    }
    const draw = () => {
      cells.forEach((cell, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        cell.textContent = (c === goal.c && r === goal.r) ? '🔋' : '';
        if (c === pos.c && r === pos.r) cell.textContent = '🤖';
      });
      qEl.innerHTML = '';
      for (const d of queue) { const chip = document.createElement('span'); chip.className = 'pg-chip'; chip.textContent = d === 'right' ? '➡️' : '⬆️'; qEl.appendChild(chip); }
    };
    draw();

    const finish = () => { sfx.fanfare?.(); wrap.remove(); window.__programSolve = undefined; resolve(); };

    const run = async () => {
      if (running || !queue.length) return;
      running = true;
      pos = { ...start }; draw();
      for (const d of queue) {
        if (d === 'right') pos.c = Math.min(COLS - 1, pos.c + 1);
        else pos.r = Math.max(0, pos.r - 1);
        sfx.tap?.(); draw();
        await animate(320, () => {});
      }
      if (pos.c === goal.c && pos.r === goal.r) { sfx.shard?.(); setTimeout(finish, 300); }
      else { sfx.bump?.(); wrap.querySelector('.pg-title').textContent = 'Beep! Not at the core yet — try again!'; queue = []; pos = { ...start }; setTimeout(() => { draw(); running = false; }, 600); }
    };

    wrap.querySelectorAll('.pg-cmd').forEach((b) => b.onclick = () => { if (running) return; queue.push(b.dataset.d); sfx.tap?.(); draw(); });
    wrap.querySelector('.pg-clear').onclick = () => { if (running) return; queue = []; pos = { ...start }; sfx.tap?.(); draw(); };
    wrap.querySelector('.pg-run').onclick = run;
    window.__programSolve = () => { queue = ['right', 'right', 'up', 'up']; run(); };   // test hook
  });
}

/* ============ Space Walk Repair (the homecoming malfunction) ============
   Sparks burst on the hull — tap each one to seal it. Repair them all to fix
   the ship. A reaction/repair game. */
export function spaceWalkRepair(spots = 5) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.id = 'repair-game';
    wrap.innerHTML = '<div class="rp-title">🛠️ Emergency repair! Tap every sparking spot to seal the hull!</div><div class="rp-hull"></div><div class="rp-count"></div>';
    document.getElementById('ui').appendChild(wrap);
    const hull = wrap.querySelector('.rp-hull');
    const count = wrap.querySelector('.rp-count');
    let fixed = 0;
    const render = () => { count.textContent = `Sealed: ${fixed} / ${spots}`; };
    const finish = () => { sfx.fanfare?.(); wrap.remove(); window.__repairSolve = undefined; resolve(); };
    const nodes = [];
    for (let i = 0; i < spots; i++) {
      const s = document.createElement('button');
      s.className = 'rp-spark';
      s.style.left = `${12 + Math.random() * 76}%`;
      s.style.top = `${14 + Math.random() * 68}%`;
      s.textContent = '⚡';
      s.onclick = () => {
        if (s.dataset.fixed) return;
        s.dataset.fixed = '1'; s.classList.add('fixed'); s.textContent = '✅';
        fixed++; sfx.collect?.(); render();
        if (fixed >= spots) setTimeout(finish, 350);
      };
      hull.appendChild(s); nodes.push(s);
    }
    render();
    window.__repairSolve = () => { nodes.forEach((s) => s.click()); };   // test hook
  });
}

/* ============ Manual Landing (the homecoming malfunction) ============
   The autopilot is down — steer the descending ship to stay over the landing
   pad as a crosswind pushes it. Touch down centered to land safe. */
export function manualLanding() {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.id = 'landing-game';
    wrap.innerHTML =
      '<div class="ld-title">🚀 Manual landing! Keep the ship over the pad as it comes down!</div>' +
      '<div class="ld-field"><div class="ld-ship">🚀</div><div class="ld-pad"></div></div>' +
      '<div class="ld-alt"><div class="ld-altfill"></div></div>' +
      '<div class="ld-cmds"><button class="ld-btn" data-d="-1">◀</button><button class="ld-btn" data-d="1">▶</button></div>';
    document.getElementById('ui').appendChild(wrap);
    const shipEl = wrap.querySelector('.ld-ship');
    const altFill = wrap.querySelector('.ld-altfill');
    const title = wrap.querySelector('.ld-title');

    let shipX = 50, drift = (Math.random() < 0.5 ? -1 : 1) * 8, alt = 100, landed = false, raf = 0, last = performance.now();
    const fast = new URLSearchParams(location.search).has('fast');
    const PAD_HALF = 16;   // pad half-width in %

    const place = () => {
      shipX = Math.max(4, Math.min(96, shipX));
      shipEl.style.left = `${shipX}%`;
      shipEl.style.bottom = `${10 + alt * 0.78}%`;
      altFill.style.height = `${alt}%`;
    };
    place();

    const finish = (ok) => {
      cancelAnimationFrame(raf);
      if (ok) { clearInterval(steer); window.__landSolve = undefined; sfx.land?.(); title.textContent = '🎉 Smooth landing — welcome home!'; setTimeout(() => { wrap.remove(); resolve(); }, 900); }
      else { sfx.bump?.(); title.textContent = '😅 Bumpy! Bringing her back up — try again!'; alt = 100; shipX = 50; drift = (Math.random() < 0.5 ? -1 : 1) * 8; landed = false; place(); raf = requestAnimationFrame(loop); }
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      // gentle wandering crosswind
      drift += (Math.random() - 0.5) * 10 * dt;
      drift = Math.max(-14, Math.min(14, drift));
      shipX += drift * dt;
      alt -= (fast ? 60 : 14) * dt;
      if (alt <= 0 && !landed) { landed = true; alt = 0; place(); finish(Math.abs(shipX - 50) <= PAD_HALF); return; }
      place();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let held = 0;
    wrap.querySelectorAll('.ld-btn').forEach((b) => {
      const d = Number(b.dataset.d);
      const press = (e) => { e.preventDefault?.(); held = d; b.classList.add('held'); };
      const release = () => { held = 0; b.classList.remove('held'); };
      b.addEventListener('pointerdown', press, { passive: false });
      b.addEventListener('pointerup', release);
      b.addEventListener('pointerleave', release);
      b.addEventListener('pointercancel', release);
      b.onclick = () => { shipX += d * 7; place(); };   // taps nudge too
    });
    // continuous steer while held
    const steer = setInterval(() => { if (held) { shipX += held * 1.1; place(); } }, 32);
    window.__landSolve = () => { shipX = 50; alt = 1; drift = 0; place(); };   // test hook: center + nearly down
  });
}

/* ============ Match the Coalition (the Architects) ============
   Tap a gift on the left, then the civilization that provides it on the right.
   A matching game that teaches the coalition plan. */
export function matchPairs(pairs, title = 'Match each gift to who provides it!') {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'screen dim';
    wrap.id = 'match-game';
    wrap.innerHTML = `<div class="mp-title">${title}</div>`;
    const row = document.createElement('div');
    row.className = 'mp-row';
    const colL = document.createElement('div'); colL.className = 'mp-col';
    const colR = document.createElement('div'); colR.className = 'mp-col';
    row.append(colL, colR);
    wrap.appendChild(row);
    document.getElementById('ui').appendChild(wrap);

    const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    let selKey = null, selBtn = null, matched = 0, done = false;

    const mkBtn = (col, key, label, side) => {
      const b = document.createElement('button');
      b.className = 'mp-btn';
      b.textContent = label;
      b.dataset.key = key; b.dataset.side = side;
      col.appendChild(b);
      return b;
    };
    for (const p of shuffle([...pairs])) mkBtn(colL, p.key, p.left, 'L');
    for (const p of shuffle([...pairs])) mkBtn(colR, p.key, p.right, 'R');

    const finish = () => { if (done) return; done = true; sfx.fanfare?.(); wrap.remove(); window.__matchSolve = undefined; resolve(); };
    const lock = (key) => {
      wrap.querySelectorAll(`.mp-btn[data-key="${key}"]`).forEach((b) => { b.classList.add('matched'); b.disabled = true; });
      matched++;
      if (matched >= pairs.length) setTimeout(finish, 350);
    };

    wrap.querySelectorAll('.mp-btn').forEach((b) => {
      b.onclick = () => {
        if (b.disabled) return;
        if (b.dataset.side === 'L') {
          selBtn?.classList.remove('sel');
          selKey = b.dataset.key; selBtn = b; b.classList.add('sel'); sfx.tap?.();
        } else {
          if (!selKey) { sfx.tap?.(); return; }
          if (b.dataset.key === selKey) { sfx.collect?.(); selBtn?.classList.remove('sel'); lock(selKey); selKey = null; selBtn = null; }
          else { sfx.wrong?.(); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 200 }); selBtn?.classList.remove('sel'); selKey = null; selBtn = null; }
        }
      };
    });
    window.__matchSolve = () => { for (const p of pairs) lock(p.key); };   // test hook
  });
}
