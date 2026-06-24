// Story content for Mission: Starlight 4 — "Waking the Red Planet".
// Based on the "Life and Death on the Red Planet" episode: escort the Solari to
// Mars, discover why a planet dies (and whether it ever lived), and wake Mars
// back up so the Solari can settle. Ends on a big cliffhanger into game 5 — a
// gamma-ray beam now bearing on Earth, and a garbled signal from home.

export const CHAPTERS = [
  { id: 0, key: 'welcome',  name: 'The Red Welcome',      sub: 'A world fast asleep',         world: 'marsred',  arrival: 'flight' },
  { id: 1, key: 'rivers',   name: 'The Ghost Rivers',     sub: 'Mars was once warm and wet',  world: 'marscanyon', arrival: 'drive' },
  { id: 2, key: 'death',    name: 'Why a Planet Dies',    sub: 'The shield that failed',      world: 'marspolar', arrival: 'drive' },
  { id: 3, key: 'caves',    name: 'Into the Caves',       sub: 'The deepest secret of Mars',  world: 'cave',     arrival: 'drive' },
  { id: 4, key: 'keystone', name: 'The Keystone',         sub: 'Everything you have learned', world: 'marsred',  arrival: 'drive' },
  { id: 5, key: 'dawn',     name: 'A New Dawn',           sub: 'Waking the Red Planet',       world: 'marsalive', arrival: 'fade' }
];

export const CLUES = {
  mr1: { id: 'mr1', icon: '🔴', title: 'A Dead World', text: 'Mars is cold, dry, and silent — rusty-red from iron, with the biggest volcano and the deepest canyon in the solar system. It looks like a world fast asleep. (Bolt stamps this REAL SCIENCE.)' },
  mr2: { id: 'mr2', icon: '🏞️', title: 'The Ghost Rivers', text: 'Dry riverbeds and old lake shores cover Mars. Long ago it was WARM and WET — rivers, lakes, maybe even an ocean! Something took the water away. (REAL SCIENCE.)' },
  mr3: { id: 'mr3', icon: '🧲', title: 'The Shield That Failed', text: 'Mars lost its magnetic shield. Without it, the solar wind slowly stripped its air and water out into space — and the warm, wet world froze. That is how a planet dies. (REAL SCIENCE.)' },
  mr4: { id: 'mr4', icon: '💧', title: 'Water in the Dark', text: 'Deep in a lava-tube cave we found hidden water ice — and ripples of an ancient streambed. Where there is water, there might once have been LIFE. (REAL SCIENCE.)' },
  mr5: { id: 'mr5', icon: '🗝️', title: 'The Keystone Opens', text: 'By remembering everything we learned — what Mars lost, and what life needs — we powered the ancient Keystone and started the engines that will wake the Red Planet.' },
  mr6: { id: 'mr6', icon: '🔵', title: 'A Cry from Home', text: 'As Mars turned green, Bolt\'s tracker screamed: the old gamma-ray beam is finally on a path toward EARTH, far in the future — and a frightened signal is calling from home. Earth is close, so the warning is easy. But STOPPING the beam means journeying so far and so fast that time itself will bend.' }
};

export const CARDS = [
  { id: 'bolt',  face: '🤖', name: 'Bolt',         desc: 'Your robot co-pilot and fact-checker. Stamps every fact REAL or STORY MAGIC.' },
  { id: 'luma',  face: '🌟', name: 'Luma',         desc: 'The little star you carried home, long ago — now your ship\'s glowing navigator.' },
  { id: 'rusty', face: '🤖', name: 'Rusty',        desc: 'A lonely old Mars rover who has explored the Red Planet alone for ages. Overjoyed to finally have friends!' },
  { id: 'sola',  face: '👽', name: 'Elder Sola',   desc: 'Wise leader of the Solari, searching for a new home for her people.' },
  { id: 'vega',  face: '🚀', name: 'Captain Vega', desc: 'Commander of the Solari ark-fleet. Never leaves anyone behind.' },
  { id: 'pip',   face: '🐚', name: 'Pip',          desc: 'A curious young Solari, full of questions about the strange red world.' },
  { id: 'mars',  face: '🔴', name: 'Mars',         desc: 'The Red Planet — once warm and wet, now cold and quiet. Could it live again?' },
  { id: 'olympus', face: '🌋', name: 'Olympus Mons', desc: 'The tallest volcano in the whole solar system — three times higher than Mount Everest!' }
];

export const BADGES = [
  { id: 'explorer', icon: '💧', name: 'Cave Explorer',  test: (s) => s.clues.includes('mr4') },
  { id: 'samples3', icon: '🪨', name: 'Rock Hound',     test: (s) => (s.samples || 0) >= 3 },
  { id: 'journal10', icon: '📔', name: 'Star Scholar',  test: (s) => (s.factsLearned.length + s.journal.length) >= 10 },
  { id: 'keystone', icon: '🗝️', name: 'Planet Waker',   test: (s) => s.clues.includes('mr5') },
  { id: 'finish',   icon: '🌅', name: 'World Builder',  test: (s) => s.chapter >= 6 },
  { id: 'hero3',    icon: '🏅', name: 'Star Rescuer',   test: (s) => !!s.game1Hero }
];
