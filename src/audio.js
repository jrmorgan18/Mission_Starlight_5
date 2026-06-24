// Procedural sound: WebAudio SFX + a gentle ambient music loop. No audio files needed.
import { loadSave } from './save.js';

let ctx = null;
let musicNodes = null;
let musicTimer = null;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  startMusic();
}

function sfxAllowed() { return ctx && loadSave().parent.soundOn; }

function tone({ freq = 440, end = freq, dur = 0.15, type = 'sine', vol = 0.18, when = 0 }) {
  if (!sfxAllowed()) return;
  const t0 = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(end, 1), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap()      { tone({ freq: 660, end: 880, dur: 0.07, type: 'triangle', vol: 0.12 }); },
  correct()  {
    tone({ freq: 523, dur: 0.12, type: 'triangle' });
    tone({ freq: 659, dur: 0.12, type: 'triangle', when: 0.09 });
    tone({ freq: 784, dur: 0.22, type: 'triangle', when: 0.18 });
  },
  wrong()    { tone({ freq: 220, end: 150, dur: 0.3, type: 'sawtooth', vol: 0.1 }); },
  collect()  { tone({ freq: 880, end: 1318, dur: 0.14, type: 'sine', vol: 0.15 }); },
  thrust()   { tone({ freq: 90, end: 140, dur: 0.18, type: 'sawtooth', vol: 0.05 }); },
  land()     {
    tone({ freq: 392, dur: 0.18, type: 'triangle' });
    tone({ freq: 523, dur: 0.3, type: 'triangle', when: 0.15 });
  },
  fanfare()  {
    [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.25, type: 'triangle', vol: 0.2, when: i * 0.14 }));
    tone({ freq: 1318, dur: 0.5, type: 'sine', vol: 0.18, when: 0.6 });
  },
  shard()    {
    [784, 988, 1175, 1568].forEach((f, i) => tone({ freq: f, dur: 0.35, type: 'sine', vol: 0.16, when: i * 0.11 }));
  },
  whoosh()   { tone({ freq: 200, end: 900, dur: 0.35, type: 'sine', vol: 0.08 }); },
  bump()     { tone({ freq: 140, end: 80, dur: 0.15, type: 'square', vol: 0.08 }); },
  open()     { tone({ freq: 440, end: 660, dur: 0.12, type: 'triangle', vol: 0.1 }); }
};

// Soft ambient pad: slow random notes from a pentatonic scale over a low drone.
const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];

function startMusic() {
  if (!ctx || musicNodes) return;
  const master = ctx.createGain();
  master.gain.value = loadSave().parent.musicOn ? 0.05 : 0;
  master.connect(ctx.destination);

  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 55;
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.5;
  drone.connect(droneGain).connect(master);
  drone.start();

  musicNodes = { master, drone };

  const playNote = () => {
    if (!musicNodes) return;
    const f = SCALE[Math.floor(Math.random() * SCALE.length)];
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.6, t0 + 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 3.4);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + 3.6);
    musicTimer = setTimeout(playNote, 1400 + Math.random() * 2200);
  };
  playNote();
}

export function setMusicOn(on) {
  if (musicNodes) musicNodes.master.gain.value = on ? 0.05 : 0;
}
