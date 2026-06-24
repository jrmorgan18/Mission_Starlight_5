// Reading comprehension passages for Mission: Starlight 4 — Rusty's logs, the
// Solari's hopes, and the secrets of Mars. Roughly 2nd-3rd grade level.

function rq(concept, prompt, options, answer, explain) {
  return { kind: 'reading', skill: 'reading', concept, prompt, options, answer, explain };
}

export const READING_BANK = [
  {
    id: 'rover-log', chapter: 'welcome', title: "Rusty's Lonely Log",
    text: 'Rover log, day nine thousand and something. I have lost count! My name is Rusty. For many, many years I have rolled across Mars all alone, taking pictures of red rocks and bigger red rocks. It is cold here, and very quiet. The sky is a dusty pink. There is a volcano so tall its top pokes above the clouds, and a canyon so deep you could lose a whole city in it. I always hoped that one day, someone would come. Today my camera saw a ship in the sky. Could it be? Friends, at last?',
    questions: [
      rq('rover-log-q1', "What is the rover's name?", ['Rusty', 'Sparky', 'Bolt'], 'Rusty', 'The log says: "My name is Rusty."'),
      rq('rover-log-q2', 'How does Rusty feel about being on Mars?', ['Lonely — he hoped someone would come', 'Happy and busy', 'Scared of the rocks'], 'Lonely — he hoped someone would come', 'Rusty says it is quiet and lonely, and "I always hoped that one day, someone would come."'),
      rq('rover-log-q3', 'What did Rusty\'s camera see today?', ['A ship in the sky', 'A shooting star', 'A new rock'], 'A ship in the sky', 'The log ends: "Today my camera saw a ship in the sky. Friends, at last?"')
    ]
  },
  {
    id: 'river-map', chapter: 'rivers', title: 'The Map of Ghost Rivers',
    text: 'Rusty unrolled an old map. "See these long winding lines?" he said. "They look like rivers — because they ARE rivers, or they were, long ago. Mars used to be warm. Rain fell, rivers ran, and lakes filled up. I have rolled along these dry riverbeds for years. The water is gone now, but the shapes it carved are still here, like footprints in dried mud. If you want to know what happened to Mars, follow the ghost rivers."',
    questions: [
      rq('river-map-q1', 'What do the long winding lines on the map show?', ['Rivers that used to flow on Mars', 'Roads for cars', 'Cracks in the glass'], 'Rivers that used to flow on Mars', 'Rusty says the lines "look like rivers — because they ARE rivers, or they were, long ago."'),
      rq('river-map-q2', 'What was Mars like when the rivers flowed?', ['Warm, with rain and lakes', 'Frozen and dark', 'Covered in cities'], 'Warm, with rain and lakes', 'The passage says: "Mars used to be warm. Rain fell, rivers ran, and lakes filled up."'),
      rq('river-map-q3', 'What does Rusty compare the dry riverbeds to?', ['Footprints in dried mud', 'Pictures in a book', 'Cracks in an egg'], 'Footprints in dried mud', 'He says the carved shapes are "still here, like footprints in dried mud."')
    ]
  },
  {
    id: 'shield-story', chapter: 'death', title: 'Why Mars Fell Asleep',
    text: 'Bolt explained the sad story. "Long ago, deep inside Mars, a spinning iron heart made an invisible magnetic shield, like an umbrella over the whole planet. That shield kept the solar wind — a stream of tiny particles from the Sun — from blowing the air away. But Mars is small, and its iron heart cooled and slowed, and the shield faded. With the umbrella gone, the solar wind stripped the air away, bit by bit. The warm world grew cold. The water froze and escaped. And Mars fell asleep. Earth is luckier — its shield is still strong."',
    questions: [
      rq('shield-q1', 'What did the magnetic shield protect Mars from?', ['The solar wind blowing its air away', 'Falling rocks', 'Too much rain'], 'The solar wind blowing its air away', 'Bolt says the shield "kept the solar wind... from blowing the air away."'),
      rq('shield-q2', 'Why did the shield fade?', ['Mars is small, so its iron heart cooled and slowed', 'Someone turned it off', 'The Sun grew too bright'], 'Mars is small, so its iron heart cooled and slowed', 'The story says: "Mars is small, and its iron heart cooled and slowed, and the shield faded."'),
      rq('shield-q3', 'What is different about Earth?', ['Its magnetic shield is still strong', 'It has no air at all', 'It is smaller than Mars'], 'Its magnetic shield is still strong', 'Bolt says: "Earth is luckier — its shield is still strong."')
    ]
  },
  {
    id: 'keystone-note', chapter: 'keystone', title: 'The Keystone Riddle',
    text: 'Carved on the ancient Keystone were these words: "To wake a sleeping world, you must first understand how it slept. Speak true what the Red Planet lost, and true what all living things need, and the engines of spring will turn. Knowledge is the only key that fits this lock." Bolt whirred. "It is testing us, Cadet. Everything we learned on Mars — the shield, the air, the water, the secret of life — we have to remember it now. Are you ready?"',
    questions: [
      rq('keystone-note-q1', 'What does the Keystone need to open?', ['True answers about what Mars lost and what life needs', 'A metal key', 'A magic word'], 'True answers about what Mars lost and what life needs', 'The carving says to "speak true what the Red Planet lost, and true what all living things need."'),
      rq('keystone-note-q2', 'What is "the only key that fits this lock"?', ['Knowledge', 'Gold', 'Strength'], 'Knowledge', 'The Keystone says: "Knowledge is the only key that fits this lock."'),
      rq('keystone-note-q3', 'What does Bolt say they have to do?', ['Remember everything they learned on Mars', 'Dig a deep hole', 'Fly back home'], 'Remember everything they learned on Mars', 'Bolt says: "Everything we learned on Mars... we have to remember it now."')
    ]
  },
  {
    id: 'dawn-letter', chapter: 'dawn', title: 'A New Dawn — and a Warning',
    text: 'Dear Cadet, look what we did together! The engines are warming Mars. The ice is melting into the first new rivers, the air is growing thick enough to breathe, and tiny green plants are opening along the old shores. The Solari are home. But Bolt\'s tracker is flashing red. That old killer beam, the one we saw long ago, is finally on a path toward a small blue world — EARTH. It will not arrive for ages, but it is coming, and a frightened signal is calling from home. Earth is just next door, so we can carry the warning there quickly. Stopping the beam, though, means a journey so far and so fast that time itself will bend. Hold on tight. — Luma',
    questions: [
      rq('dawn-q1', 'What is happening to Mars now?', ['It is warming, with new rivers, air, and green plants', 'It is freezing solid', 'It is breaking apart'], 'It is warming, with new rivers, air, and green plants', 'The letter says the engines are warming Mars, the ice is melting, and "tiny green plants are opening."'),
      rq('dawn-q2', 'What is the killer beam now on a path toward?', ['Earth, a small blue world', 'The Moon', 'Another star'], 'Earth, a small blue world', 'Luma writes the beam "is finally on a path toward a small blue world — EARTH."'),
      rq('dawn-q3', 'Why is WARNING Earth easy, but STOPPING the beam hard?', ['Earth is next door, but the beam\'s source is very far away', 'Earth is far, but the beam is close', 'Both are right next to Mars'], 'Earth is next door, but the beam\'s source is very far away', 'Earth is Mars\'s neighbor, so the warning is quick. But the beam comes from far across the galaxy — reaching that takes a journey so fast that time itself bends!')
    ]
  }
];
