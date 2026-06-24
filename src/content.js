// Story content for Mission: Starlight 5 — "The Lighthouse at the Edge of Time".
// The grand finale of the saga. The killer gamma-ray beam is on a path to Earth;
// only a coalition of advanced civilizations can build a deflector. The cadet
// races near light-speed (time bends!) to unite them — navigating by a pulsar,
// powered by a Dyson Sphere, aimed by an AI mind — saves Earth, and folds time
// to come home. Finishing this collects the 5th and LAST Grand Prize piece.

export const CHAPTERS = [
  { id: 0, key: 'homecoming', name: 'Homecoming',          sub: 'The pale blue dot',            world: 'earth',     arrival: 'fade' },
  { id: 1, key: 'starbow',    name: 'Into the Starbow',    sub: 'Faster, and time bends',       world: 'flight',    arrival: 'self' },
  { id: 2, key: 'pulsar',     name: 'The Pulsar Lighthouse', sub: "The galaxy's truest clock",   world: 'pulsar',    arrival: 'jump' },
  { id: 3, key: 'architects', name: 'The Architects',      sub: 'A plan too big for one world',  world: 'architect', arrival: 'jump' },
  { id: 4, key: 'dyson',      name: 'The Dyson Sphere',    sub: 'A cage of light around a star', world: 'dyson',     arrival: 'jump' },
  { id: 5, key: 'machine',    name: 'The Machine Mind',    sub: 'A world that thinks',           world: 'machine',   arrival: 'jump' },
  { id: 6, key: 'timetoll',   name: 'The Long Build',      sub: 'How much time has passed?',     world: 'deepspace', arrival: 'self' },
  { id: 7, key: 'assemble',   name: 'The Great Deflector', sub: 'All the pieces, together',      world: 'deepspace', arrival: 'jump' },
  { id: 8, key: 'deflect',    name: 'Turn the Beam',       sub: 'One perfect shot',              world: 'deflect',   arrival: 'self' },
  { id: 9, key: 'fold',       name: 'The Long Way Home',   sub: 'Folding time, and a welcome',   world: 'earth',     arrival: 'fade' }
];

export const CLUES = {
  ls1: { id: 'ls1', icon: '🌍', title: 'The Pale Blue Dot', text: 'Earth: blue for oceans, green for life, white for clouds and ice — the only world like it we have ever found. And a killer beam is heading its way. (Bolt stamps this REAL SCIENCE.)' },
  ls2: { id: 'ls2', icon: '⏱️', title: 'Time Bends', text: 'When you fly close to the speed of light, your clock ticks slower than the clocks back home. A short trip for you can be long years for Earth. This is REAL — it is called time dilation.' },
  ls3: { id: 'ls3', icon: '📡', title: "The Galaxy's Clock", text: 'A pulsar is a tiny spinning star-heart that flashes with perfect rhythm — the most exact natural clock in the universe, and a lighthouse to steer by. Tick keeps Lighthouse Seven. (REAL SCIENCE.)' },
  ls4: { id: 'ls4', icon: '🛠️', title: 'The Coalition', text: 'No single world can stop a galaxy-sized beam. The Architects say it takes three gifts from three peoples: vast POWER, perfect AIM, and a true CLOCK. We must unite them.' },
  ls5: { id: 'ls5', icon: '☀️', title: 'The Dyson Sphere', text: 'A civilization is building a shell of panels around their whole star to drink ALL its energy — a Dyson Sphere. That is the power our deflector needs. (REAL idea from real scientists!)' },
  ls6: { id: 'ls6', icon: '🤖', title: 'The Machine Mind', text: 'A whole world of thinking machines — an ancient AI that has watched stars be born and die. It can calculate the deflector\'s aim down to the last hair. It is strange, and kind.' },
  ls7: { id: 'ls7', icon: '💌', title: 'A Message from Home', text: 'A recording arrived from Earth. So much time has passed there while we raced the stars — the little tree is tall now. Saving home is costing us our own years. But we will not stop.' },
  ls8: { id: 'ls8', icon: '🛰️', title: 'The Great Deflector', text: 'Pulsar clock, Dyson power, machine aim, Architect frame — all assembled into one enormous deflector, set right in the beam\'s path. Now we wait for the light.' },
  ls9: { id: 'ls9', icon: '✨', title: 'The Beam Turned', text: 'The killer beam struck the deflector and bent harmlessly away from Earth. We did it — the whole galaxy, working as one, saved a single small blue world.' },
  ls10: { id: 'ls10', icon: '🏡', title: 'Folding Time', text: 'The Machine Mind gave us a final gift: a way to fold space-time and arrive home just months after we left. Earth is safe, and we are home, in our own time at last.' }
};

export const CARDS = [
  { id: 'bolt',    face: '🤖', name: 'Bolt',          desc: 'Your robot co-pilot and fact-checker, with you since the very first mission.' },
  { id: 'luma',    face: '🌟', name: 'Luma',          desc: 'The little star you carried home long ago — now your wise navigator, who understands deep time.' },
  { id: 'earth',   face: '🌍', name: 'Earth',         desc: 'Home. The pale blue dot. The one world we are racing the galaxy to save.' },
  { id: 'tick',    face: '🗼', name: 'Tick',          desc: 'Keeper of Pulsar Lighthouse Seven. Never misses a blink — the galaxy\'s timekeeper.' },
  { id: 'architect', face: '👽', name: 'The Architects', desc: 'An ancient civilization of master builders who dreamed the coalition into being.' },
  { id: 'dyson',   face: '☀️', name: 'The Sun-Weavers', desc: 'Engineers building a Dyson Sphere to harness an entire star\'s power.' },
  { id: 'machine', face: '🤖', name: 'The Machine Mind', desc: 'A whole world of thinking machines — an ancient, gentle AI that calculates the impossible.' },
  { id: 'pulsar',  face: '📡', name: 'The Pulsar',    desc: 'A spinning neutron star flashing a perfect beat — the universe\'s most exact clock.' },
  { id: 'dysonsphere', face: '🌀', name: 'The Dyson Sphere', desc: 'A shell of countless panels around a star, drinking all its light.' },
  { id: 'deflector', face: '🛰️', name: 'The Great Deflector', desc: 'The coalition\'s masterwork: a galaxy-scale machine to turn a killer beam aside.' }
];

export const BADGES = [
  { id: 'pulsar',   icon: '📡', name: 'Star Navigator', test: (s) => s.clues.includes('ls3') },
  { id: 'coalition', icon: '🤝', name: 'Galaxy Uniter',  test: (s) => s.clues.includes('ls6') },
  { id: 'journal10', icon: '📔', name: 'Star Scholar',   test: (s) => (s.factsLearned.length + s.journal.length) >= 10 },
  { id: 'deflect',  icon: '✨', name: 'Earth Saver',     test: (s) => s.clues.includes('ls9') },
  { id: 'finish',   icon: '🏆', name: 'Saga Hero',       test: (s) => s.chapter >= 10 },
  { id: 'hero4',    icon: '🏅', name: 'World Builder',   test: (s) => !!s.game1Hero }
];
