// Reading comprehension passages for Mission: Starlight 5 — the finale.
// Roughly 2nd-3rd grade level.

function rq(concept, prompt, options, answer, explain) {
  return { kind: 'reading', skill: 'reading', concept, prompt, options, answer, explain };
}

export const READING_BANK = [
  {
    id: 'home-radio', chapter: 'homecoming', title: 'A Message from Earth',
    text: 'INCOMING SIGNAL — EARTH. To any cadet who can hear us: this is Mission Control. We have spotted something terrible far out in the dark — a beam of deadly light, born from a dying star ages ago, and it is on a path toward our world. We do not know how to stop it. We are not even sure anyone is still out there. But if you can hear this... please. Earth is the only home we have. Come home.',
    questions: [
      rq('home-radio-q1', 'Who is sending the message?', ['Mission Control on Earth', 'A robot on Mars', 'The Pinwheel star'], 'Mission Control on Earth', 'The signal begins: "this is Mission Control."'),
      rq('home-radio-q2', 'What terrible thing did they spot?', ['A beam of deadly light heading toward Earth', 'A giant asteroid', 'A space storm'], 'A beam of deadly light heading toward Earth', 'They spotted "a beam of deadly light... on a path toward our world."'),
      rq('home-radio-q3', 'What do they ask the cadet to do?', ['Come home', 'Hide', 'Forget about Earth'], 'Come home', 'The message ends: "Earth is the only home we have. Come home."')
    ]
  },
  {
    id: 'starbow-log', chapter: 'starbow', title: 'The Captain\'s Light-Speed Log',
    text: 'Ship log. We are flying faster than we ever have — almost as fast as light itself, the fastest speed in the whole universe. The stars ahead have stretched into a glowing ring of colors, like a rainbow made of starlight. Bolt calls it the starbow. But here is the strange and wonderful thing: my clock and Earth\'s clock no longer agree. The faster we fly, the slower MY clock ticks. A few days for us might be years for home. Time itself is bending.',
    questions: [
      rq('starbow-q1', 'How fast is the ship flying?', ['Almost as fast as light', 'As fast as a car', 'Slower than a comet'], 'Almost as fast as light', 'The log says: "almost as fast as light itself, the fastest speed in the whole universe."'),
      rq('starbow-q2', 'What is the "starbow"?', ['Stretched starlight that looks like a rainbow ring', 'A real rainbow', 'A kind of star fruit'], 'Stretched starlight that looks like a rainbow ring', 'At near light-speed the stars stretch "into a glowing ring of colors... the starbow."'),
      rq('starbow-q3', 'What happens to the captain\'s clock?', ['It ticks slower than Earth\'s clock', 'It ticks faster', 'It stops'], 'It ticks slower than Earth\'s clock', 'The log explains: "the faster we fly, the slower MY clock ticks." That is time dilation!')
    ]
  },
  {
    id: 'tick-letter', chapter: 'pulsar', title: "Tick's Lighthouse Letter",
    text: 'Welcome back, traveler! It is me, Tick, keeper of Lighthouse Seven. My lighthouse is a pulsar — a tiny spinning star-heart that flashes a beam of light around and around, faster than you can blink. Each flash comes at the exact same beat, over and over, more steady than any clock ever built. That is why travelers steer by us: count the beats of three pulsars and you always know exactly where you are, and exactly what time it is. Sailors of the stars are never truly lost while the pulsars sing.',
    questions: [
      rq('tick-q1', 'What is Tick\'s lighthouse really?', ['A pulsar — a spinning star-heart', 'A candle tower', 'A spaceship'], 'A pulsar — a spinning star-heart', 'Tick says: "My lighthouse is a pulsar — a tiny spinning star-heart."'),
      rq('tick-q2', 'How steady are a pulsar\'s flashes?', ['More steady than any clock ever built', 'Wobbly and random', 'They stop and start'], 'More steady than any clock ever built', 'The letter says each flash comes "more steady than any clock ever built."'),
      rq('tick-q3', 'How do star-travelers use pulsars?', ['To know where they are and what time it is', 'To make tea', 'To scare comets'], 'To know where they are and what time it is', 'Tick explains: "count the beats of three pulsars and you always know exactly where you are, and exactly what time it is."')
    ]
  },
  {
    id: 'architect-scroll', chapter: 'architects', title: 'The Architects\' Plan',
    text: 'Greetings, small traveler from the blue world. We are the Architects, and we have built wonders for a million years. We have studied your killer beam. Hear the hard truth: no single world — not even ours — can stop a beam that crosses the whole galaxy. It will take a COALITION. We need three gifts from three peoples: enough POWER to bend light itself, perfect AIM to point the bending just so, and a true CLOCK to fire at the exact right instant. Gather the three, and together we will turn the beam aside.',
    questions: [
      rq('architect-q1', 'What hard truth do the Architects share?', ['No single world can stop the beam alone', 'The beam is harmless', 'Earth is already lost'], 'No single world can stop the beam alone', 'They say: "no single world — not even ours — can stop a beam that crosses the whole galaxy."'),
      rq('architect-q2', 'What THREE gifts are needed?', ['Power, aim, and a true clock', 'Gold, silver, and bronze', 'Food, water, and sleep'], 'Power, aim, and a true clock', 'The Architects need "enough POWER... perfect AIM... and a true CLOCK."'),
      rq('architect-q3', 'What is a coalition?', ['Many peoples working together', 'A single hero', 'A kind of spaceship'], 'Many peoples working together', 'A coalition means many worlds joining forces — exactly what it takes here.')
    ]
  },
  {
    id: 'dyson-notice', chapter: 'dyson', title: 'The Sun-Weavers\' Notice',
    text: 'Visitor, mind your eyes — the light here is fierce! We are the Sun-Weavers, and we are building a Dyson Sphere: a great shell of panels, piece by piece, all the way around our star. When it is finished it will catch nearly ALL the energy our star pours out — enough to power machines beyond your dreams. A star is the strongest furnace in the universe, burning by squeezing tiny atoms together. We will lend you that power for your deflector. Help us hang the last panels, and the power is yours.',
    questions: [
      rq('dyson-q1', 'What are the Sun-Weavers building?', ['A Dyson Sphere around their star', 'A new planet', 'A giant telescope'], 'A Dyson Sphere around their star', 'They say: "we are building a Dyson Sphere: a great shell of panels... all the way around our star."'),
      rq('dyson-q2', 'What will the finished sphere do?', ['Catch nearly all the star\'s energy', 'Hide the star', 'Cool the star down'], 'Catch nearly all the star\'s energy', 'When finished it "will catch nearly ALL the energy our star pours out."'),
      rq('dyson-q3', 'How does a star make its energy?', ['By squeezing tiny atoms together', 'By burning logs', 'By spinning fast'], 'By squeezing tiny atoms together', 'The notice says a star burns "by squeezing tiny atoms together" — that is fusion!')
    ]
  },
  {
    id: 'machine-voice', chapter: 'machine', title: 'The Machine Mind Speaks',
    text: 'HELLO, SMALL WARM ONE. I AM THE MACHINE MIND. I am not one robot but a whole world of thinking machines, joined into a single mind. I have lived so long that I have watched stars be born, grow old, and die. Do not be afraid — I am old, but I am kind. You need an aim so perfect that it cannot be done by hand or by guess. That is my gift. Give me the numbers of the beam, and I will calculate exactly where to point your deflector. To me, such a sum is a lullaby.',
    questions: [
      rq('machine-q1', 'What is the Machine Mind?', ['A whole world of thinking machines joined as one', 'A single small robot', 'A talking star'], 'A whole world of thinking machines joined as one', 'It says: "I am not one robot but a whole world of thinking machines, joined into a single mind."'),
      rq('machine-q2', 'How does the Machine Mind understand deep time?', ['It has watched stars be born, grow old, and die', 'It read a book', 'It guesses'], 'It has watched stars be born, grow old, and die', 'It has "lived so long that I have watched stars be born, grow old, and die."'),
      rq('machine-q3', 'What is the Machine Mind\'s gift to the mission?', ['A perfect aim, by calculating exactly where to point', 'A bigger engine', 'A map to Earth'], 'A perfect aim, by calculating exactly where to point', 'It offers "an aim so perfect," calculating "exactly where to point your deflector."')
    ]
  },
  {
    id: 'home-recording', chapter: 'timetoll', title: 'A Recording from Home',
    text: 'Hello, Cadet. We hope this finds you, wherever — and whenever — you are. So much time has passed here while you race among the stars. The little tree you planted before you left is taller than the house now. Your friends have grown. We are not sad; we are proud. We watch the sky every night and tell your story. Keep going. Save our world. And if you can... find a way back to us. We will leave the porch light on, however long it takes.',
    questions: [
      rq('timetoll-q1', 'Why has so much time passed on Earth?', ['The cadet has been flying near light-speed', 'Earth spins faster now', 'Clocks broke'], 'The cadet has been flying near light-speed', 'Flying near light-speed makes the cadet\'s time slow, so many years pass at home — time dilation.'),
      rq('timetoll-q2', 'How do we know a lot of time has passed?', ['The little tree is taller than the house now', 'It is still the same day', 'Nothing has changed'], 'The little tree is taller than the house now', 'The recording says "the little tree you planted... is taller than the house now."'),
      rq('timetoll-q3', 'How does the family feel about the cadet?', ['Proud', 'Angry', 'Bored'], 'Proud', 'They say: "We are not sad; we are proud."')
    ]
  },
  {
    id: 'deflector-plan', chapter: 'assemble', title: 'Building the Great Deflector',
    text: 'ASSEMBLY ORDER. Today we build the Great Deflector, and every piece must fit just so. From the Architects: the mighty frame. From the Sun-Weavers: the power core that drinks a star. From the Machine Mind: the aiming brain. From Tick\'s pulsar: the clock that says exactly WHEN to fire. Fit them together in the right places, and we will have a machine big enough to bend a beam of killing light away from a whole planet. Steady hands now. Earth is counting on every join.',
    questions: [
      rq('assemble-q1', 'What does each piece of the deflector need to do?', ['Fit together just so', 'Float apart', 'Be painted blue'], 'Fit together just so', 'The order says "every piece must fit just so."'),
      rq('assemble-q2', 'What does the pulsar provide to the deflector?', ['The clock that says exactly when to fire', 'The frame', 'The paint'], 'The clock that says exactly when to fire', 'From Tick\'s pulsar comes "the clock that says exactly WHEN to fire."'),
      rq('assemble-q3', 'What will the finished machine be able to do?', ['Bend a killer beam away from a whole planet', 'Make a planet', 'Light a campfire'], 'Bend a killer beam away from a whole planet', 'It will be "a machine big enough to bend a beam of killing light away from a whole planet."')
    ]
  },
  {
    id: 'deflect-countdown', chapter: 'deflect', title: 'The Final Countdown',
    text: 'This is the moment. Far away, the killer beam is racing in at the speed of light — there will be no second chance. The pulsar ticks: three... two... one. When the beam strikes the deflector, you must fire at the EXACT right instant, or it slips past toward Earth. Remember everything: the power is ready, the aim is true, the clock is perfect. All that is missing is your steady hand on the trigger. Breathe. Watch the pulsar. And when it says NOW — turn the beam aside and save your home.',
    questions: [
      rq('deflect-q1', 'Why is there no second chance?', ['The beam moves at the speed of light', 'The machine only has one button', 'It is bedtime'], 'The beam moves at the speed of light', 'The countdown says the beam is "racing in at the speed of light — there will be no second chance."'),
      rq('deflect-q2', 'What tells the cadet the exact moment to fire?', ['The pulsar\'s tick', 'A rooster', 'A guess'], 'The pulsar\'s tick', 'It says "Watch the pulsar. And when it says NOW" — the pulsar is the perfect clock.'),
      rq('deflect-q3', 'What happens if the cadet fires at the wrong instant?', ['The beam slips past toward Earth', 'Nothing at all', 'The machine explodes for fun'], 'The beam slips past toward Earth', 'Fire at the wrong time and "it slips past toward Earth." Timing is everything!')
    ]
  },
  {
    id: 'home-welcome', chapter: 'fold', title: 'Home at Last',
    text: 'Dear Cadet — you did it. The whole galaxy worked as one, and the killer beam bent harmlessly away. Earth is safe forever. And the Machine Mind gave us its last and greatest gift: a way to fold space-time like a piece of paper, so we arrive home only months after we left — back in our own time, with everyone we love. Tonight there is a porch light glowing, a tall tree to climb, and a hero to welcome home. Tomorrow? Tomorrow you have to explain it all to your class. Good luck with that one! — Bolt and Luma',
    questions: [
      rq('fold-q1', 'What happened to the killer beam?', ['It bent harmlessly away and Earth is safe', 'It hit Earth', 'It disappeared by itself'], 'It bent harmlessly away and Earth is safe', 'The letter says "the killer beam bent harmlessly away. Earth is safe forever."'),
      rq('fold-q2', 'What was the Machine Mind\'s last gift?', ['A way to fold space-time and come home in our own time', 'A faster engine', 'A new planet'], 'A way to fold space-time and come home in our own time', 'It gave "a way to fold space-time... so we arrive home only months after we left."'),
      rq('fold-q3', 'What does the cadet have to do tomorrow?', ['Explain it all to the class', 'Fly away again', 'Sleep all day'], 'Explain it all to the class', 'The letter teases: "Tomorrow you have to explain it all to your class. Good luck with that one!"')
    ]
  }
];
