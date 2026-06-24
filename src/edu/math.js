// Math question generators, leveled 1-5 per skill. Sequel edition: same skills
// as Mission: Starlight, but every skill gains a harder top tier and starting
// levels are seeded higher (see save.js) for a cadet who finished game 1.
// Every question carries a kid-friendly explanation used by the Star Journal.

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

function distractors(answer, spread = 3, count = 3) {
  const opts = new Set([answer]);
  let guard = 0;
  while (opts.size < count + 1 && guard++ < 60) {
    const d = answer + (rand(0, 1) ? 1 : -1) * rand(1, spread);
    if (d >= 0 && d !== answer) opts.add(d);
  }
  while (opts.size < count + 1) opts.add(answer + opts.size);
  return [...opts];
}

function q(skill, concept, prompt, answer, explain, options, context) {
  return { skill, concept, prompt, answer, explain, options: options || distractors(answer), context: context || null };
}

const OBJECTS = [
  ['🌟', 'photons'], ['💎', 'space crystals'], ['🛸', 'scout ships'], ['☄️', 'comet chunks'],
  ['🔋', 'power cells'], ['🪐', 'mini-planets'], ['👽', 'aliens'], ['🚀', 'rockets']
];

export const MATH_SKILLS = {
  counting: { name: 'Counting & Place Value', icon: '🔢', max: 5 },
  addition: { name: 'Addition', icon: '➕', max: 5 },
  subtraction: { name: 'Subtraction', icon: '➖', max: 5 },
  multiplication: { name: 'Multiplication', icon: '✖️', max: 5 },
  patterns: { name: 'Patterns & Skip Counting', icon: '🔁', max: 5 },
  comparison: { name: 'Greater & Less', icon: '⚖️', max: 5 },
  wordprob: { name: 'Word Problems', icon: '📖', max: 5 }
};

const GEN = {
  counting(level) {
    if (level === 1) {
      const [icon, name] = pick(OBJECTS);
      const n = rand(4, 9);
      return q('counting', 'count-objects',
        `How many ${name}?\n${icon.repeat(n)}`, n,
        `Touch each one and count: 1, 2, 3... There are ${n} ${name}!`);
    }
    if (level === 2) {
      const tens = rand(2, 9), ones = rand(1, 9);
      return q('counting', 'place-value',
        `${tens} tens and ${ones} ones make what number?`, tens * 10 + ones,
        `${tens} tens is ${tens * 10}. Add the ${ones} ones: ${tens * 10 + ones}!`);
    }
    if (level === 3) {
      const n = rand(95, 495);
      return q('counting', 'number-after-100', `What number comes right after ${n}?`, n + 1,
        `Even with big numbers, the next number is just one more: ${n + 1}.`);
    }
    if (level === 4) {
      const h = rand(1, 9), t = rand(0, 9), o = rand(1, 9);
      return q('counting', 'place-value-hundreds',
        `${h} hundreds, ${t} tens, and ${o} ones make what number?`, h * 100 + t * 10 + o,
        `${h} hundreds is ${h * 100}, ${t} tens is ${t * 10}, plus ${o} ones: ${h * 100 + t * 10 + o}!`,
        distractors(h * 100 + t * 10 + o, 110));
    }
    const th = rand(1, 9), n = th * 1000 + rand(0, 999);
    return q('counting', 'place-value-thousands',
      `In the number ${n}, what does the ${th} stand for?`, th * 1000,
      `The ${th} sits in the THOUSANDS place, so it means ${th} thousands = ${th * 1000}. Space numbers get BIG!`,
      [th * 1000, th, th * 100, th * 10]);
  },

  addition(level) {
    if (level === 1) {
      const a = rand(2, 9), b = rand(2, 9);
      return q('addition', 'add-within-20', `${a} + ${b} = ?`, a + b,
        `Start at the bigger number, ${Math.max(a, b)}, and count up ${Math.min(a, b)}: that's ${a + b}.`);
    }
    if (level === 2) {
      const a = rand(10, 89), b = rand(2, 9);
      return q('addition', 'add-2digit-1digit', `${a} + ${b} = ?`, a + b,
        `Just add the ones place. ${a} + ${b} = ${a + b}.`);
    }
    if (level === 3) {
      const a = rand(11, 59), b = rand(11, 40);
      return q('addition', 'add-2digit-2digit', `${a} + ${b} = ?`, a + b,
        `Add the tens first (${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10}), then the ones. You get ${a + b}.`);
    }
    if (level === 4) {
      const a = rand(100, 850), b = rand(10, 99);
      return q('addition', 'add-3digit-2digit', `${a} + ${b} = ?`, a + b,
        `The hundreds mostly stay put. ${a} + ${b} = ${a + b}.`,
        distractors(a + b, 12));
    }
    const a = rand(110, 540), b = rand(110, 450);
    return q('addition', 'add-3digit-3digit', `${a} + ${b} = ?`, a + b,
      `Add hundreds, then tens, then ones: ${Math.floor(a / 100) * 100} + ${Math.floor(b / 100) * 100} first. Total: ${a + b}.`,
      distractors(a + b, 60));
  },

  subtraction(level) {
    if (level === 1) {
      const a = rand(8, 18), b = rand(2, 7);
      return q('subtraction', 'sub-within-20', `${a} - ${b} = ?`, a - b,
        `Count back from ${a}, or think: what plus ${b} makes ${a}? It's ${a - b}.`);
    }
    if (level === 2) {
      const a = rand(20, 99), b = rand(2, 9);
      return q('subtraction', 'sub-2digit-1digit', `${a} - ${b} = ?`, a - b,
        `Take ${b} away from ${a}: ${a - b}.`);
    }
    if (level === 3) {
      const a = rand(30, 99), b = rand(11, a - 11);
      return q('subtraction', 'sub-2digit-2digit', `${a} - ${b} = ?`, a - b,
        `Subtract the tens, then the ones. ${a} - ${b} = ${a - b}.`);
    }
    if (level === 4) {
      const a = rand(110, 950), b = rand(10, 99);
      return q('subtraction', 'sub-3digit-2digit', `${a} - ${b} = ?`, a - b,
        `Take the tens away first, then the ones. ${a} - ${b} = ${a - b}.`,
        distractors(a - b, 12));
    }
    const a = rand(300, 980), b = rand(110, a - 120);
    return q('subtraction', 'sub-3digit-3digit', `${a} - ${b} = ?`, a - b,
      `Subtract hundreds, tens, then ones. ${a} - ${b} = ${a - b}.`,
      distractors(a - b, 60));
  },

  multiplication(level) {
    if (level === 1) {
      const t = pick([2, 5, 10]), n = rand(2, 5);
      return q('multiplication', `times-${t}`, `${n} × ${t} = ?`, n * t,
        `${n} × ${t} means ${n} groups of ${t}. Skip count by ${t}s ${n} times: ${Array.from({ length: n }, (_, i) => (i + 1) * t).join(', ')}.`);
    }
    if (level === 2) {
      const a = rand(2, 5), b = rand(2, 6);
      return q('multiplication', 'mult-to-30', `${a} × ${b} = ?`, a * b,
        `${a} × ${b} is ${a} groups of ${b}. Count them up: ${a * b}!`);
    }
    if (level === 3) {
      const a = rand(3, 10), b = rand(3, 10);
      return q('multiplication', 'mult-to-100', `${a} × ${b} = ?`, a * b,
        `${a} groups of ${b} make ${a * b}.`);
    }
    if (level === 4) {
      const a = rand(2, 9), b = rand(2, 9);
      return q('multiplication', 'missing-factor', `${a} × ? = ${a * b}`, b,
        `How many groups of ${a} make ${a * b}? Count by ${a}s until you reach ${a * b} — it takes ${b} jumps.`);
    }
    const a = rand(12, 25), b = rand(3, 9);
    const tens = Math.floor(a / 10) * 10, ones = a - tens;
    return q('multiplication', 'mult-2digit-1digit', `${a} × ${b} = ?`, a * b,
      `Break ${a} into ${tens} + ${ones}. ${b} × ${tens} = ${b * tens}, and ${b} × ${ones} = ${b * ones}. Add them: ${b * tens} + ${b * ones} = ${a * b}.`,
      distractors(a * b, 14));
  },

  patterns(level) {
    if (level === 1) {
      const step = pick([2, 5, 10]), start = step * rand(1, 5);
      const seq = [start, start + step, start + 2 * step];
      return q('patterns', `skip-count-${step}`,
        `Skip counting by ${step}s: ${seq.join(', ')}, ___`, start + 3 * step,
        `Counting by ${step}s means adding ${step} each jump: ${start + 3 * step}.`);
    }
    if (level === 2) {
      const step = pick([3, 4]), start = rand(2, 12);
      const seq = [start, start + step, start + 2 * step];
      return q('patterns', `skip-count-${step}`,
        `What comes next?\n${seq.join(', ')}, ___`, start + 3 * step,
        `The numbers go up by ${step} each time: ${start + 3 * step}.`);
    }
    if (level === 3) {
      const step = pick([2, 3, 5]), start = rand(30, 60);
      const seq = [start, start - step, start - 2 * step];
      return q('patterns', `pattern-minus-${step}`,
        `What comes next?\n${seq.join(', ')}, ___`, start - 3 * step,
        `The numbers go DOWN by ${step} each time: ${start - 3 * step}.`);
    }
    if (level === 4) {
      const start = rand(1, 5); // growing pattern: +1, +2, +3...
      const seq = [start, start + 1, start + 3, start + 6];
      return q('patterns', 'growing-pattern',
        `Tricky pattern! What comes next?\n${seq.join(', ')}, ___`, start + 10,
        `The jumps grow: +1, +2, +3... so the next jump is +4. ${start + 6} + 4 = ${start + 10}.`);
    }
    const start = pick([2, 3]);
    const seq = [start, start * 2, start * 4];
    return q('patterns', 'doubling-pattern',
      `Hyperspace pattern — each number DOUBLES!\n${seq.join(', ')}, ___`, start * 8,
      `Doubling means × 2 each jump: ${start * 4} × 2 = ${start * 8}. Light-river speed grows FAST!`,
      distractors(start * 8, 6));
  },

  comparison(level) {
    if (level <= 3) {
      const range = level === 1 ? [10, 99] : level === 2 ? [100, 999] : null;
      if (range) {
        let a = rand(range[0], range[1]), b = rand(range[0], range[1]);
        if (a === b) b += 1;
        const ans = a > b ? '>' : '<';
        return q('comparison', 'compare-numbers',
          `Which sign goes in the blank?\n${a} ___ ${b}`, ans,
          `${Math.max(a, b)} is bigger than ${Math.min(a, b)}, and the open mouth of the sign always eats the bigger number!`,
          ['>', '<', '=']);
      }
      const a = rand(3, 12), b = rand(3, 12), c = a + b + pick([-2, -1, 0, 1, 2]);
      const sum = a + b;
      const ans = sum > c ? '>' : sum < c ? '<' : '=';
      return q('comparison', 'compare-expression',
        `Which sign goes in the blank?\n${a} + ${b} ___ ${c}`, ans,
        `First solve ${a} + ${b} = ${sum}. Then compare ${sum} and ${c}.`,
        ['>', '<', '=']);
    }
    if (level === 4) {
      let a = rand(1, 9) * 1000 + rand(0, 999), b = rand(1, 9) * 1000 + rand(0, 999);
      if (a === b) b += 100;
      const ans = a > b ? '>' : '<';
      return q('comparison', 'compare-thousands',
        `Which sign goes in the blank?\n${a} ___ ${b}`, ans,
        `Compare the thousands place first: ${Math.floor(a / 1000)} vs ${Math.floor(b / 1000)}. The bigger thousands wins (check hundreds if they tie).`,
        ['>', '<', '=']);
    }
    const pairs = [
      ['4 light-years (Proxima)', '40 light-years (TRAPPIST-1)', '<', 'Proxima is 4 light-years away and TRAPPIST-1 is about 40 — ten times farther!'],
      ['26,000 light-years (galaxy center)', '40 light-years (TRAPPIST-1)', '>', 'The center of the galaxy is 26,000 light-years away — way past TRAPPIST-1!'],
      ['1 second of light travel', '1 second of rocket travel', '>', 'Light goes 300,000 km in a second. A rocket goes only a few km. Light wins by a LOT.'],
      ['8 minutes (Sun’s light to Earth)', '2 seconds (Moon’s light to Earth)', '>', 'Sunlight takes 8 whole minutes to reach us. Moonlight takes about 1-2 seconds.']
    ];
    const [a, b, ans, why] = pick(pairs);
    return q('comparison', 'compare-distances',
      `Which is MORE?\n${a} ___ ${b}`, ans,
      why, ['>', '<', '=']);
  },

  wordprob(level, playerName = 'Cadet') {
    const [icon, name] = pick(OBJECTS);
    if (level === 1) {
      const a = rand(3, 9), b = rand(2, 9);
      return q('wordprob', 'word-add',
        `${playerName} gathered ${a} ${name} ${icon}. Luma found ${b} more. How many ${name} together?`, a + b,
        `"Together" means add! ${a} + ${b} = ${a + b}.`);
    }
    if (level === 2) {
      const b = rand(3, 9), a = rand(2, 9), big = a + b;
      return q('wordprob', 'word-sub',
        `${playerName} had ${big} ${name} ${icon}, but ${b} got pulled away by gravity! How many are left?`, a,
        `"Pulled away" means subtract. ${big} - ${b} = ${a}.`);
    }
    if (level === 3) {
      const g = rand(3, 6), per = rand(3, 6);
      return q('wordprob', 'word-mult',
        `There are ${g} star systems, and each one has ${per} ${name} ${icon}. How many ${name} in all?`, g * per,
        `Equal groups means multiply: ${g} × ${per} = ${g * per}.`);
    }
    if (level === 4) {
      const friends = pick([2, 4]), total = friends * rand(3, 8);
      return q('wordprob', 'word-share',
        `${playerName}, Bolt, and friends — ${friends} explorers in all — share ${total} ${name} ${icon} equally. How many does EACH explorer get?`, total / friends,
        `Sharing equally means splitting into ${friends} same-size groups: ${total} split ${friends} ways is ${total / friends} each.`);
    }
    const a = rand(3, 7), b = rand(2, 5), c = rand(2, 9);
    return q('wordprob', 'word-two-step',
      `TWO-STEP MISSION: ${playerName} collects ${a} ${name} ${icon} from each of ${b} planets, then uses ${c} to power the gate. How many ${name} are left?`, a * b - c,
      `Step 1: multiply ${a} × ${b} = ${a * b}. Step 2: subtract the ${c} used: ${a * b} - ${c} = ${a * b - c}.`,
      distractors(a * b - c, 5));
  }
};

export function generateMath(skill, level, playerName) {
  const gen = GEN[skill] || GEN.addition;
  const question = gen(Math.max(1, Math.min(5, level)), playerName);
  question.kind = 'math';
  return question;
}
