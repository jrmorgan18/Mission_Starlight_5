// The education brain: picks questions at the right difficulty, tracks per-skill
// mastery, and maintains the Star Journal — a memory of missed questions the
// player can study, with hints that point back to it when a similar one returns.
import { loadSave, save, getSkill, oopsLimit } from '../save.js';
import { generateMath, MATH_SKILLS } from './math.js';
import { SCIENCE_BANK } from './science.js';
import { READING_BANK } from './reading.js';

const recentScience = [];   // avoid immediate repeats within a session
const reviewQueue = [];     // missed science ids to sneak back in later

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function effectiveLevel(skillId) {
  const s = loadSave();
  const sk = getSkill(skillId);
  const max = (MATH_SKILLS[skillId] && MATH_SKILLS[skillId].max) || 4;
  return Math.max(1, Math.min(max, sk.level + (s.parent.difficultyOffset || 0)));
}

/** Math question at the player's current adaptive level for this skill. */
export function pickMath(skillId) {
  const s = loadSave();
  const question = generateMath(skillId, effectiveLevel(skillId), s.name || 'Cadet');
  question.options = shuffle(question.options);
  return question;
}

/** Science question, preferring the requested topic, unseen first, with review mixed in. */
export function pickScience(topic) {
  const s = loadSave();
  // ~1/3 of the time, resurface something previously missed (spaced repetition-lite)
  if (reviewQueue.length && Math.random() < 0.34) {
    const id = reviewQueue.shift();
    const redo = SCIENCE_BANK.find((x) => x.id === id);
    if (redo) return { ...redo, options: shuffle(redo.options) };
  }
  let pool = SCIENCE_BANK.filter((x) => x.topic === topic && !recentScience.includes(x.id));
  if (!pool.length) pool = SCIENCE_BANK.filter((x) => x.topic === topic);
  if (!pool.length) pool = SCIENCE_BANK.filter((x) => !recentScience.includes(x.id));
  const unseen = pool.filter((x) => !s.factsLearned.includes(x.id));
  const choice = (unseen.length ? unseen : pool)[Math.floor(Math.random() * (unseen.length ? unseen.length : pool.length))];
  recentScience.push(choice.id);
  if (recentScience.length > 12) recentScience.shift();
  return { ...choice, options: shuffle(choice.options) };
}

/** Reading passage for a chapter. Returns { passage, questions } — ask them in order. */
export function pickReading(chapterTag) {
  const p = READING_BANK.find((x) => x.chapter === chapterTag) || READING_BANK[0];
  return {
    title: p.title,
    text: p.text,
    questions: p.questions.map((question) => ({ ...question, passage: p.text, passageTitle: p.title, options: shuffle(question.options) }))
  };
}

/** Record an answer: update mastery, manage leveling, and write journal memory on misses. */
export function recordAnswer(question, correct) {
  const s = loadSave();
  const sk = getSkill(question.skill);

  if (correct) {
    sk.correct++;
    sk.streak++;
    const max = (MATH_SKILLS[question.skill] && MATH_SKILLS[question.skill].max) || 1;
    if (sk.streak >= 4 && sk.level < max) {  // hot streak: level up quietly
      sk.level++;
      sk.streak = 0;
    }
  } else {
    sk.wrong++;
    sk.streak = Math.min(sk.streak, 0) - 1;
    s.missCount = (s.missCount || 0) + 1;
    if (s.missCount >= oopsLimit()) s.missCount = 0;   // hit the limit anywhere: reset tally (the UI sends them back a planet)
    addJournalEntry(question);
    if (question.kind === 'science' && !reviewQueue.includes(question.id)) reviewQueue.push(question.id);
  }

  // Science facts land in the databank whether right or wrong — learning either way.
  if (question.kind === 'science' && !s.factsLearned.includes(question.id)) s.factsLearned.push(question.id);
  save();
}

function addJournalEntry(question) {
  const s = loadSave();
  const existing = s.journal.find((e) => e.concept === question.concept);
  if (existing) {
    existing.misses++;
    existing.question = question.prompt;
    existing.answer = String(question.answer);
    existing.explain = question.explain;
    existing.time = Date.now();
  } else {
    s.journal.unshift({
      concept: question.concept,
      kind: question.kind,
      question: question.prompt,
      answer: String(question.answer),
      explain: question.explain,
      misses: 1,
      time: Date.now()
    });
  }
}

/** Find a journal memory that helps with this question (same concept). Powers the glowing hint. */
export function journalHintFor(question) {
  const s = loadSave();
  return s.journal.find((e) => e.concept === question.concept) || null;
}

/** Per-skill accuracy summary for the Parent Zone dashboard. */
export function skillReport() {
  const s = loadSave();
  const rows = [];
  const names = { ...MATH_SKILLS, science: { name: 'Space Science', icon: '🔭' }, reading: { name: 'Reading', icon: '📖' } };
  for (const [id, stats] of Object.entries(s.skills)) {
    const total = stats.correct + stats.wrong;
    if (!total) continue;
    rows.push({
      id,
      name: (names[id] && names[id].name) || id,
      icon: (names[id] && names[id].icon) || '✨',
      level: stats.level,
      correct: stats.correct,
      total,
      pct: Math.round((stats.correct / total) * 100)
    });
  }
  return rows.sort((a, b) => a.pct - b.pct);
}
