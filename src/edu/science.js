// Space science question bank — sequel edition: light & distance, exoplanets,
// pulsars, and the supermassive black hole at the heart of the Milky Way.
// Every entry is REAL SCIENCE (story-magic stuff like the Star Gate never
// appears here — Bolt is careful about that).

function sq(id, topic, prompt, answer, wrongs, explain) {
  return { id, topic, kind: 'science', skill: 'science', concept: id, prompt, answer, options: [answer, ...wrongs], explain, real: true };
}

export const TOPIC_NAMES = {
  lightspeed: 'Light & Distance',
  planet9: 'Planet Nine',
  exoplanets: 'Exoplanets',
  proxima: 'Proxima Centauri',
  trappist: 'TRAPPIST-1',
  cancri: 'The Diamond Planet',
  pulsar: 'Pulsars & Neutron Stars',
  blackhole: 'Black Holes',
  galaxy: 'The Milky Way',
  stars: 'Stars & Nebulas',
  killerstar: 'Stars That Kill',
  mars: 'The Red Planet',
  keystone: 'The Keystone',
  earth: 'Planet Earth',
  timewarp: 'Light & Time',
  dyson: 'Megastructures',
  machine: 'Minds & Machines',
  general: 'Space Explorer'
};

export const SCIENCE_BANK = [
  // --- Earth (game 5) ---
  sq('earth-blue', 'earth', 'Why does Earth look blue from space?', 'It is mostly covered in ocean water', ['The sky paints it', 'It is made of blueberries', 'It is very cold'],
    'About 70% of Earth is ocean, so from space our world shines bright blue — the "pale blue dot."'),
  sq('earth-special', 'earth', 'What makes Earth special among the planets we know?', 'It has liquid water, air, and life', ['It is the biggest', 'It has the most moons', 'It is closest to the Sun'],
    'Earth is the only world we know with oceans, breathable air, AND life. So far, it is one of a kind!'),
  sq('earth-shield', 'earth', 'What protects Earth\'s air and water from the solar wind?', 'Its magnetic shield', ['A force field machine', 'The Moon', 'Tall mountains'],
    'Earth\'s spinning iron core makes a magnetic shield that deflects the solar wind — the very thing Mars lost long ago.'),
  sq('earth-home', 'earth', 'Why is it worth racing the whole galaxy to save Earth?', 'It is the only home we have', ['It has good pizza', 'It is shiny', 'There is nothing better to do'],
    'Earth is our one and only home — every person, animal, and plant we know lives here. That is worth saving!'),

  // --- Light & Time / time dilation (game 5) ---
  sq('time-fast', 'timewarp', 'What happens to your clock when you fly close to the speed of light?', 'It ticks slower than clocks back home', ['It ticks faster', 'It stops forever', 'It melts'],
    'The faster you go, the slower your clock runs compared to home. This is REAL — scientists call it time dilation!'),
  sq('time-trip', 'timewarp', 'You take a fast star-trip that feels like a week. Back on Earth, how much time might pass?', 'Many years', ['Exactly one week', 'One minute', 'No time at all'],
    'Near light-speed, a week for you can be years for Earth. Astronauts on the Space Station already age a tiny bit slower than us!'),
  sq('time-limit', 'timewarp', 'What is the fastest anything can travel in the universe?', 'The speed of light', ['The speed of sound', 'The speed of a rocket', 'The speed of a sneeze'],
    'Light is the cosmic speed limit — about 300,000 km every second. Nothing with mass can quite reach it.'),
  sq('time-why', 'timewarp', 'Why does flying near light-speed help cross the huge galaxy in one lifetime?', 'Time slows for the traveler, so the trip feels short', ['The galaxy shrinks for fun', 'You skip lunch', 'Stars push you faster'],
    'Because your own clock slows, a journey of thousands of light-years can feel like just years to YOU. Time itself helps you travel!'),

  // --- Pulsars (recap + new, game 5) ---
  sq('pulsar-what2', 'pulsar', 'What is a pulsar?', 'A tiny spinning neutron star that flashes a beam', ['A kind of planet', 'A comet', 'A space station'],
    'A pulsar is the crushed, spinning heart left behind by a giant star. It sweeps a beam around like a lighthouse.'),
  sq('pulsar-clock', 'pulsar', 'Why are pulsars called the universe\'s best clocks?', 'They flash with incredibly steady rhythm', ['They have tiny hands', 'They ring like bells', 'They glow gold'],
    'A pulsar\'s spin is so steady that its flashes keep better time than almost any clock on Earth — perfect for navigation!'),
  sq('pulsar-dense', 'pulsar', 'How dense is a neutron star?', 'A spoonful would weigh as much as a mountain', ['Light as a feather', 'Like a balloon', 'Like water'],
    'Neutron stars are unbelievably dense — one teaspoon would weigh billions of tons. The star\'s whole mass squeezed into a city-sized ball!'),

  // --- Megastructures / Dyson Spheres (game 5) ---
  sq('dyson-what', 'dyson', 'What is a Dyson Sphere?', 'A giant shell built around a star to capture its energy', ['A bouncy ball for aliens', 'A kind of moon', 'A spaceship engine'],
    'A Dyson Sphere is a megastructure that wraps a whole star to drink up ALL its energy — a real idea dreamed up by scientist Freeman Dyson.'),
  sq('dyson-why', 'dyson', 'Why would a civilization build a Dyson Sphere?', 'To collect enormous amounts of power', ['To hide the star', 'To keep the star warm', 'To make the star spin'],
    'A star pours out unimaginable energy. Catching even part of it could power a whole civilization\'s greatest machines.'),
  sq('dyson-energy', 'dyson', 'Where do stars get their incredible energy?', 'From fusing atoms together in their cores', ['From burning wood', 'From batteries', 'From sunlight'],
    'Deep in a star, atoms are squeezed so hard they fuse and release huge energy — the same power that lights our Sun.'),

  // --- Minds & Machines / AI (game 5) ---
  sq('ai-what', 'machine', 'What is an artificial intelligence (AI)?', 'A machine that can think and solve problems', ['A robot that only dances', 'A kind of star', 'A magic spell'],
    'An AI is a machine that can learn, reason, and solve problems — like a very clever computer brain.'),
  sq('ai-good', 'machine', 'What is the Machine Mind especially good at?', 'Doing enormous calculations perfectly', ['Taking naps', 'Eating snacks', 'Getting lost'],
    'The Machine Mind can crunch numbers no person could — perfect for aiming a galaxy-sized deflector down to the last hair.'),
  sq('ai-patient', 'machine', 'How has the Machine Mind watched stars be born and die?', 'It has lived for an enormous span of time', ['It has a time machine', 'It dreams it', 'It reads about it'],
    'The Machine Mind is ancient — it has existed so long it has watched whole stars form and fade. It understands deep time.'),
  // --- Mars: the Red Planet (game 4) ---
  sq('mars-red', 'mars', 'Why is Mars called the Red Planet?', 'It is covered in rusty red dust', ['It is very hot', 'It is made of ketchup', 'It glows like fire'],
    'Mars is red because its dust is full of iron that rusted — the whole planet is covered in rust!'),
  sq('mars-volcano', 'mars', 'What is Olympus Mons on Mars?', 'The biggest volcano in the solar system', ['A giant lake', 'A space station', 'A kind of moon'],
    'Olympus Mons is a volcano on Mars about three times taller than Mount Everest — the tallest known in the whole solar system!'),
  sq('mars-canyon', 'mars', 'Valles Marineris on Mars is a giant...', 'Canyon', ['Ocean', 'Forest', 'City'],
    'Valles Marineris is a canyon so long it would stretch across the whole United States. It makes the Grand Canyon look tiny!'),
  sq('mars-water-past', 'mars', 'Long ago, what did Mars have that it does not have now?', 'Rivers, lakes, and lots of liquid water', ['Tall trees', 'Big cities', 'Two suns'],
    'Mars used to be warm and wet, with rivers and lakes. We can still see the dry riverbeds they left behind!'),
  sq('mars-cold', 'mars', 'What is Mars like today?', 'Cold, dry, and dusty', ['Warm and rainy', 'Covered in oceans', 'Hot like the Sun'],
    'Today Mars is a frozen desert — colder than Antarctica, with thin air and red dust storms.'),
  sq('mars-moons', 'mars', 'How many moons does Mars have?', 'Two', ['None', 'Twelve', 'A hundred'],
    'Mars has two tiny lumpy moons: Phobos and Deimos. They look like little potatoes in the sky!'),
  sq('mars-shield', 'mars', 'Why did Mars lose its air and water?', 'It lost its magnetic shield, so the solar wind blew them away', ['It got too crowded', 'A comet drank them', 'It rained too much'],
    'Mars lost its magnetic shield. Without that shield the solar wind slowly stripped its air and water into space.'),
  sq('mars-shield-earth', 'mars', 'What protects Earth\'s air from the solar wind?', "Earth's magnetic shield", ['The Moon', 'Clouds', 'Airplanes'],
    "Earth has a strong magnetic shield made deep in its core. It deflects the solar wind and keeps our air safe — Mars lost its long ago."),
  sq('mars-life', 'mars', 'Why do scientists look for WATER when hunting for life?', 'Every living thing we know needs water', ['Water is shiny', 'Water is heavy', 'Water tastes good'],
    'Everywhere we find life on Earth, we find water. So "follow the water" is how we hunt for life on other worlds!'),
  sq('mars-caves', 'mars', 'Why might Martian caves be special?', 'They could shelter explorers and hold hidden ice', ['They are full of gold', 'They lead to Earth', 'They are warm and sunny'],
    'Mars has lava-tube caves that could shield future explorers from radiation and cold — and may hide frozen water!'),
  sq('mars-terraform', 'mars', 'What would "waking up" Mars mean?', 'Warming it and giving it air and water again', ['Painting it blue', 'Pushing it closer to the Sun', 'Waking it from a nap'],
    'Making Mars livable — warming it, thickening its air, melting its ice — is called terraforming. A huge dream for the future!'),

  // --- The Keystone: review of the whole game's big ideas (recall finale) ---
  sq('key-lost', 'keystone', 'KEYSTONE: What three things did Mars lose?', 'Its shield, then its air, then its water', ['Its moons, rings, and color', 'Its rovers, caves, and dust', 'Its name, map, and song'],
    'First Mars lost its magnetic SHIELD, then the solar wind took its AIR, and then its WATER froze and escaped. Three losses — that\'s how a planet dies.'),
  sq('key-life', 'keystone', 'KEYSTONE: What does every living thing we know need?', 'Water', ['Gold', 'Moonlight', 'Music'],
    'Water! That\'s why finding water in the caves matters so much — water is the first key to life.'),
  sq('key-wake', 'keystone', 'KEYSTONE: To wake Mars, what must we give it back?', 'Warmth, air, and water', ['Rust, dust, and rocks', 'Two more moons', 'A coat of paint'],
    'To wake the Red Planet we give back what it lost: warmth, air, and water. Then green things can grow again.'),
  sq('key-shield', 'keystone', 'KEYSTONE: What kept Earth safe but Mars did not have?', 'A magnetic shield', ['A bigger moon', 'More volcanoes', 'A thicker crust'],
    'Earth\'s magnetic shield protects our air and water. Mars lost its shield — and lost everything else after.'),
  // --- Stars That Kill (game 3) ---
  sq('ks-wolfrayet', 'killerstar', 'What is a Wolf-Rayet star?', 'A giant star near the end of its life', ['A baby star just forming', 'A planet made of fire', 'A kind of comet'],
    'Wolf-Rayet stars are huge, super-hot stars blasting their outer layers into space. They live fast and die young!'),
  sq('ks-grb', 'killerstar', 'What is a gamma-ray burst?', 'A powerful beam of energy from a dying star', ['A friendly radio song', 'A gentle warm breeze', 'A kind of moonlight'],
    'When some giant stars die, they fire a narrow BEAM of energy — a gamma-ray burst — one of the most powerful blasts in the universe.'),
  sq('ks-aim', 'killerstar', 'Why is the DIRECTION a gamma-ray burst points so important?', 'It only harms worlds in the beam\'s path', ['It makes the beam warmer', 'It changes the star\'s color', 'It decides the day of the week'],
    'A gamma-ray burst is like a flashlight beam. You are only in danger if it is pointed right at you — direction is everything!'),
  sq('ks-supernova', 'killerstar', 'What do we call it when a giant star explodes?', 'A supernova', ['A sunrise', 'A snowstorm', 'A sun-nap'],
    'A supernova is a giant star explosion — for a few days it can shine brighter than a whole galaxy of normal stars!'),
  sq('ks-safe', 'killerstar', 'How can explorers stay safe from a killer star\'s blast?', 'Shield against it or stay out of the beam', ['Paint the ship red', 'Fly closer to see better', 'Turn off the radio'],
    'Distance, shielding, and staying out of the beam keep you safe. Smart cadets read the danger before they get close!'),
  sq('ks-spin', 'killerstar', 'Why does a spinning dying star fire a narrow BEAM instead of blasting everywhere?', 'Its fast spin focuses the energy out its poles', ['It is shy', 'Beams are prettier', 'The wind blows it sideways'],
    'A fast-spinning dying star funnels its energy out its top and bottom, like water out of a spinning hose — a tight beam, not a splash.'),
  sq('ks-betelgeuse', 'killerstar', 'Betelgeuse is a giant red star that might explode someday. What will that be?', 'A supernova', ['A sunrise', 'A new moon', 'A rainbow'],
    'Betelgeuse is a real red supergiant near the end of its life. When it goes, it will be a brilliant supernova — safe to watch from far-away Earth!'),
  sq('ks-light-time', 'killerstar', 'A killer star\'s beam is made of light. Does light travel instantly?', 'No — it is fast, but it still takes time', ['Yes, it is everywhere at once', 'No, light never moves', 'Only on weekends'],
    'Light is the fastest thing there is, but space is so huge that even light takes years to cross it. That travel TIME is what lets you escape!'),
  sq('ks-newstars', 'killerstar', 'When a giant star dies and explodes, what can happen next?', 'Its dust helps build new stars and planets', ['Everything stays empty forever', 'It turns into a black hole only', 'Nothing ever again'],
    'Star deaths scatter rich dust that gathers into NEW stars and worlds. Even the atoms in you came from a star that died long ago!'),
  sq('ks-distance', 'killerstar', 'Two killer stars are dying. Which is more dangerous to a planet?', 'The one whose beam points at the planet', ['The prettier one', 'The one farther away always', 'The quieter one'],
    'A gamma-ray burst only harms what it is aimed at. A close star pointed away is safer than a far one pointed right at you — aim matters most!'),

  // --- Light & distance ---
  sq('light-fastest', 'lightspeed', 'What is the FASTEST thing in the whole universe?', 'Light', ['A rocket', 'A comet', 'Sound'],
    'Nothing beats light! It zooms about 300,000 kilometers every single second.'),
  sq('light-year', 'lightspeed', 'What is a light-year?', 'How far light travels in one year', ['How long a year feels in space', 'The weight of a star', 'A year with extra sunshine'],
    'A light-year measures DISTANCE, not time — it\'s how far light zooms in one year. That\'s about 9 trillion kilometers!'),
  sq('light-sun', 'lightspeed', 'How long does sunlight take to reach Earth?', 'About 8 minutes', ['1 second', 'About 8 hours', 'A whole year'],
    'Light leaves the Sun and lands on your nose about 8 minutes later. You always see the Sun as it was 8 minutes ago!'),
  sq('light-look-back', 'lightspeed', 'When you look at faraway stars, you see them...', 'As they were long ago', ['Exactly as they are right now', 'As they will be someday', 'Upside down'],
    'Starlight takes years to reach us, so looking far away is looking back in TIME. Telescopes are time machines!'),
  sq('light-why-slow', 'lightspeed', 'Why do rockets take so long to visit other stars?', 'Stars are incredibly far apart', ['Rockets get sleepy', 'Space is too cold', 'Stars keep moving away on purpose'],
    'Even the closest star is 4 light-years away. Our fastest rockets would need thousands of years — that\'s why explorers dream of faster ways!'),

  // --- Planet Nine refresher ---
  sq('p9-evidence2', 'planet9', 'Why do scientists think Planet Nine might be real?', 'Icy worlds far away move in strange bunched-up paths', ['They saw it in a photo', 'An astronaut visited it', 'It sends radio songs'],
    'Nobody has seen Planet Nine. But far-away icy worlds get tugged into strange orbits — like something big and invisible is pulling them.'),
  sq('p9-dark2', 'planet9', 'Why is Planet Nine so hard to find?', 'It is far away and very dim', ['It hides behind the Moon', 'It only comes out in winter', 'It is too tiny to matter'],
    'Planet Nine (if it\'s out there) is so far from the Sun that barely any light reaches it. Even big telescopes need luck to spot it.'),

  // --- Exoplanets ---
  sq('exo-what', 'exoplanets', 'What is an exoplanet?', 'A planet that orbits another star', ['A planet that exploded', 'A pretend planet', 'A planet with no gravity'],
    '"Exo" means OUTSIDE — exoplanets circle stars other than our Sun. Astronomers have found over 5,000 of them!'),
  sq('exo-transit', 'exoplanets', 'How do telescopes find most exoplanets?', 'They watch a star blink dimmer when a planet passes in front', ['They hear the planet beep', 'They smell the atmosphere', 'They send a robot to check'],
    'When a planet crosses in front of its star, the star\'s light dips a tiny bit — like a fly walking across a flashlight. That dip is the clue!'),
  sq('exo-count', 'exoplanets', 'How many exoplanets have astronomers found so far?', 'More than 5,000', ['Exactly 9', 'About 100', 'Only 1'],
    'Over 5,000 and counting! New ones are confirmed almost every week. The galaxy is FULL of planets.'),

  // --- Proxima Centauri ---
  sq('prox-nearest', 'proxima', 'What is the closest star to our Sun?', 'Proxima Centauri', ['Polaris', 'Sirius', 'Betelgeuse'],
    'Proxima Centauri is our Sun\'s nearest neighbor — about 4 light-years away. "Proxima" even means "closest"!'),
  sq('prox-red', 'proxima', 'What kind of star is Proxima Centauri?', 'A small, cool red dwarf', ['A giant blue star', 'A star just like our Sun', 'A dead star'],
    'Proxima is a red dwarf — smaller, cooler, and dimmer than our Sun. Red dwarfs are the most common stars in the galaxy!'),
  sq('prox-flare', 'proxima', 'What surprise does Proxima Centauri sometimes blast out?', 'Huge flares of energy', ['Snowballs', 'Rainbows', 'Bubbles'],
    'Red dwarfs like Proxima throw tantrums called FLARES — sudden bursts of energy much stronger than our Sun\'s. Shields up!'),
  sq('prox-planet', 'proxima', 'Does Proxima Centauri have a planet?', 'Yes — Proxima b, about Earth-sized', ['No, red dwarfs can\'t have planets', 'Yes — a planet made of gold', 'Nobody has ever checked'],
    'Proxima b is a real planet about the size of Earth, discovered in 2016. It\'s the closest exoplanet to home!'),

  // --- TRAPPIST-1 ---
  sq('trap-seven', 'trappist', 'How many Earth-sized planets circle the star TRAPPIST-1?', '7', ['2', '12', '100'],
    'TRAPPIST-1 has SEVEN rocky planets about Earth\'s size — the biggest family of Earth-sized worlds ever found around one star!'),
  sq('trap-close', 'trappist', 'The TRAPPIST-1 planets orbit very close together. What would you see from one of them?', 'Other planets looking as big as our Moon', ['Nothing — space is empty there', 'Two suns', 'Giant space whales'],
    'The planets huddle so close that from one, the others look like big moons in the sky. Imagine seven worlds as neighbors!'),
  sq('trap-zone', 'trappist', 'What is the "habitable zone" around a star?', 'The not-too-hot, not-too-cold area where water can stay liquid', ['The zone where aliens live', 'The area with the most asteroids', 'The star\'s favorite spot'],
    'It\'s the "just right" zone — close enough to stay warm, far enough not to roast. Some TRAPPIST-1 planets sit right in it!'),

  // --- 55 Cancri e ---
  sq('canc-lava', 'cancri', 'What covers the surface of 55 Cancri e?', 'Oceans of glowing lava', ['Ice cream', 'Grass', 'Regular water oceans'],
    '55 Cancri e hugs its star so closely that a year lasts 18 hours and the surface melts into lava oceans!'),
  sq('canc-diamond', 'cancri', 'Why do some scientists call 55 Cancri e the "diamond planet"?', 'It may have lots of carbon squeezed into diamond inside', ['It is shiny in photos', 'Aliens decorated it', 'It is shaped like a diamond'],
    'The planet may be rich in carbon — and deep inside, crushing pressure could squeeze carbon into DIAMOND. A jewel of a world!'),
  sq('canc-year', 'cancri', 'On 55 Cancri e, one whole YEAR lasts only...', '18 hours', ['365 days', '12 years', 'One minute'],
    'It races around its star in just 18 hours — your birthday would come every single day before bedtime!'),

  // --- Pulsars & neutron stars ---
  sq('puls-what', 'pulsar', 'What is a pulsar?', 'A spinning star that sweeps beams of light like a lighthouse', ['A planet that bounces', 'A star that went out', 'A space jellyfish'],
    'A pulsar is a tiny, super-dense spinning star whose beams sweep past us in steady blinks — a real cosmic lighthouse!'),
  sq('puls-born', 'pulsar', 'How is a neutron star born?', 'A giant star explodes as a supernova and its core collapses', ['Two moons crash together', 'A black hole sneezes', 'Stardust freezes'],
    'When a giant star explodes, its heart gets squeezed into a city-sized ball heavier than the Sun. That\'s a neutron star!'),
  sq('puls-dense', 'pulsar', 'How heavy is one tiny spoonful of neutron star?', 'As heavy as a mountain', ['As heavy as an apple', 'As heavy as a school bus', 'It weighs nothing'],
    'Neutron star stuff is squeezed SO tight that one spoonful outweighs a whole mountain. Don\'t put it in your backpack!'),
  sq('puls-clock', 'pulsar', 'Why do astronomers call pulsars the best clocks in space?', 'Their blinks repeat with almost perfect timing', ['They have tiny clock hands', 'They tick out loud', 'They glow in numbers'],
    'Pulsar blinks are so steady that scientists use them to keep time and even map locations in the galaxy — space lighthouses AND space clocks!'),

  // --- Black holes ---
  sq('bh-what', 'blackhole', 'What is a black hole?', 'A place where gravity is so strong not even light can escape', ['An empty hole in space', 'A very dark planet', 'A tunnel to another house'],
    'A black hole isn\'t a hole at all — it\'s a HUGE amount of stuff squeezed tiny, with gravity so strong that even speedy light can\'t escape.'),
  sq('bh-horizon', 'blackhole', 'What is the event horizon?', 'The invisible line where nothing can escape anymore', ['The black hole\'s shadow puppet', 'A ring of fire', 'The horizon at sunset'],
    'The event horizon is the point of no return. Outside it, you can still fly away. Inside... even light is stuck. So we always keep a safe distance!'),
  sq('bh-sgra', 'blackhole', 'What sits at the very center of our Milky Way galaxy?', 'A supermassive black hole called Sagittarius A*', ['A giant mirror', 'The Sun', 'Planet Nine'],
    'Sagittarius A* (say "A-star") is a supermassive black hole as heavy as 4 MILLION Suns, sitting at the heart of our galaxy!'),
  sq('bh-photo', 'blackhole', 'In 2022, scientists showed the first photo of our galaxy\'s black hole. What did it look like?', 'A glowing orange ring around a dark circle', ['A blue square', 'A smiley face', 'Total blackness'],
    'The Event Horizon Telescope linked dishes all over Earth into one planet-sized telescope and photographed a glowing ring around the dark shadow!'),
  sq('bh-vacuum', 'blackhole', 'Is a black hole a giant vacuum cleaner that sucks up everything?', 'No — far away, you can orbit it safely like any star', ['Yes, it slurps the whole galaxy', 'Yes, but only on Tuesdays', 'No, because it\'s not real'],
    'Black holes don\'t chase anyone! If the Sun became a black hole (it can\'t), Earth would keep orbiting just the same. Gravity isn\'t mean — it\'s just strong.'),
  sq('bh-spaghetti', 'blackhole', 'What funny word describes falling feet-first into a small black hole?', 'Spaghettification', ['Pancakeification', 'Meatballization', 'Noodle-doodling'],
    'Gravity pulls harder on your feet than your head, stretching you like spaghetti! Real scientists really call it spaghettification.'),
  sq('bh-s2', 'blackhole', 'How do we know Sagittarius A* is really there if it\'s black?', 'We watch stars whip around something invisible and heavy', ['We heard it roar', 'It glows bright green', 'A probe landed on it'],
    'Astronomers watched stars like S2 race in loops around an invisible something — only a supermassive black hole could swing them that fast!'),
  sq('bh-time', 'blackhole', 'What happens to time very close to a black hole?', 'It runs slower than far away', ['It runs backwards', 'It stops everywhere', 'Nothing — time never changes'],
    'Einstein figured it out: strong gravity slows time down. Near a black hole, your clock ticks slower than your friend\'s far away!'),

  // --- Milky Way / galaxy ---
  sq('gal-name', 'galaxy', 'What is the name of our galaxy?', 'The Milky Way', ['The Cookie Way', 'Andromeda', 'The Big Spiral'],
    'We live in the Milky Way — a giant spiral of more than 100 BILLION stars. Our Sun is just one of them!'),
  sq('gal-shape', 'galaxy', 'What shape is the Milky Way?', 'A spiral with long curved arms', ['A perfect cube', 'A donut', 'A triangle'],
    'The Milky Way is a spiral galaxy — a flat swirl with curving arms of stars. We live out in one of the arms, in the quiet suburbs!'),
  sq('gal-center', 'galaxy', 'How far is Earth from the center of the galaxy?', 'About 26,000 light-years', ['4 light-years', '100 kilometers', 'About 8 minutes'],
    'The galactic center — and its black hole — is about 26,000 light-years from home. The light we see from there left before people invented writing!'),
  sq('gal-stars', 'galaxy', 'About how many stars live in the Milky Way?', 'More than 100 billion', ['Exactly 1,000', 'About a million', 'Seven'],
    'More than 100 billion stars — if you counted one star every second, it would take over 3,000 YEARS to count them all.'),

  // --- Stars / nebula (review & finale) ---
  sq('neb-nursery2', 'stars', 'Where are new stars born?', 'In giant clouds called nebulas', ['Inside planets', 'In black holes', 'On the Moon'],
    'Nebulas are huge clouds of gas and dust — star nurseries! Gravity squeezes the cloud until new stars light up, like Luma did.'),
  sq('star-old', 'stars', 'What happens to the very biggest stars when they get old?', 'They explode as supernovas', ['They turn into planets', 'They float away', 'They become moons'],
    'Giant stars end with a BANG — a supernova! The leftovers become neutron stars or even black holes.'),
  sq('star-colors', 'stars', 'Which color stars are the HOTTEST?', 'Blue', ['Red', 'Yellow', 'Green'],
    'Blue stars burn hottest, yellow (like our Sun) are middle, and red stars are coolest. Color is a star\'s thermometer!'),

  // --- General ---
  sq('gen-grav-tool', 'general', 'How can a spaceship use a planet\'s gravity to go FASTER?', 'Swing close by and slingshot away', ['Honk at the planet', 'Open all the windows', 'Turn off the engines forever'],
    'It\'s called a gravity slingshot! Spacecraft swing close to a planet, borrow a bit of its speed, and fling away faster. NASA does it all the time.'),
  sq('gen-vacuum', 'general', 'Why can\'t you hear explosions in space?', 'Space has no air to carry sound', ['Space is too cold for sound', 'Sound is afraid of the dark', 'You can, but only loud ones'],
    'Sound needs air to travel through. Space is a silent vacuum — even the biggest boom makes no sound at all.'),
  sq('gen-suit', 'general', 'Why do astronauts wear spacesuits?', 'To carry air, warmth, and protection with them', ['To look fancy', 'Because space is sticky', 'To hide from aliens'],
    'A spacesuit is like a tiny spaceship you wear: air to breathe, warmth, and armor against the emptiness of space.')
];
