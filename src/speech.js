// Read-aloud via Web Speech API. Diegetically this is Bolt the robot reading to you.
let voice = null;

function pickVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  if (!voices.length) return null;
  // Prefer a friendly English voice; Samantha is the iPad default and sounds good.
  return (
    voices.find((v) => /samantha/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US' && /female|natural/i.test(v.name)) ||
    voices.find((v) => v.lang && v.lang.startsWith('en')) ||
    voices[0]
  );
}

if (window.speechSynthesis) {
  speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const clean = String(text).replace(/[✦★🌟⭐🪐🚀🤖👽💎×]/g, (m) => (m === '×' ? ' times ' : ' '));
  const u = new SpeechSynthesisUtterance(clean);
  if (!voice) voice = pickVoice();
  if (voice) u.voice = voice;
  u.rate = 0.92;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (window.speechSynthesis) speechSynthesis.cancel();
}
