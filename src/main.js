// Boot: service worker, audio unlock, and lift-off.
import { Game } from './game.js';
import { initAudio } from './audio.js';

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline play just won't cache */ });
}

// Browsers require a user gesture before audio can start.
addEventListener('pointerdown', () => initAudio(), { once: true });

const game = new Game();
window.__starlight5 = game;   // handy for debugging / automated smoke tests
game.start().catch((err) => {
  console.error('Mission control, we have a problem:', err);
});
