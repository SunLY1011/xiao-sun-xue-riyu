import { readFileSync } from 'fs';

const files = [
  'js/data/lessons-mvp.js',
  'js/data/lessons-stage2-mvp.js',
  'js/data/lessons-prd-unreleased-mvp.js',
  'js/data/lessons-supplement-mvp.js',
];

// Naive extraction of JSON arrays
function extractJSON(content, varName) {
  const re = new RegExp(`(?:const|var|let)\\s+${varName}\\s*=\\s*`);
  const match = content.match(re);
  if (!match) return null;
  const start = match.index + match[0].length;
  // Try to find matching bracket
  let depth = 0;
  let inStr = false;
  let escape = false;
  const strChar = null;
  for (let i = start; i < content.length; i++) {
    const c = content[i];
    if (escape) { escape = false; continue; }
    if (inStr) {
      if (c === '\\') { escape = true; }
      else if (c === inStr) { inStr = false; }
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '[' || c === '{') depth++;
    if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) {
        return JSON.parse(content.substring(start, i + 1));
      }
    }
  }
  return null;
}

const mvp = extractJSON(readFileSync(files[0], 'utf8'), 'LESSONS_MVP');
const stage2 = extractJSON(readFileSync(files[1], 'utf8'), 'LESSONS_STAGE2_MVP');
const prd = extractJSON(readFileSync(files[2], 'utf8'), 'LESSONS_PRD_UNRELEASED_MVP');
const sup = extractJSON(readFileSync(files[3], 'utf8'), 'LESSONS_SUPPLEMENT_MVP');

console.log(`MVP: ${mvp.length} lessons (${mvp.map(l=>l.lessonId).join(',')})`);
console.log(`Stage2: ${stage2.length} lessons (${stage2.map(l=>l.lessonId).join(',')})`);
console.log(`PRD: ${prd.length} lessons (${prd.map(l=>l.lessonId).join(',')})`);
console.log(`Supplement: ${sup.length} lessons`);

// Simulate mergeStageLessonsIntoMvp
const merged = [...mvp];
function merge(list) {
  list.forEach(l => {
    const idx = merged.findIndex(x => x.lessonId === l.lessonId);
    if (idx >= 0) merged[idx] = l;
    else merged.push(l);
  });
  merged.sort((a, b) => a.lessonId - b.lessonId);
}
merge(stage2);
merge(prd);

const l1 = merged.find(l => l.lessonId === 1);
console.log('\n=== LESSON 1 (after merge) ===');
console.log(`Title: ${l1.lessonTitle}`);
console.log(`Grammar nodes: ${l1.grammarNodes?.length || 0}`);
console.log(`Dialogues: ${l1.dialogues?.length || 0}`);
console.log(`Quiz questions: ${l1.quizQuestions?.length || 0}`);

// Check grammar node IDs
console.log('\nGrammar node IDs:', l1.grammarNodes?.map(g => g.id).join(', '));
console.log('Grammar titles:', l1.grammarNodes?.map(g => g.title.substring(0, 20)).join(' | '));

// All lessons summary
console.log('\n=== ALL LESSONS SUMMARY ===');
merged.forEach(l => {
  const s = sup.find(x => x.lessonId === l.lessonId);
  console.log(`L${l.lessonId}: grammar=${l.grammarNodes?.length || 0} dialogs=${l.dialogues?.length || 0} quizzes=${l.quizQuestions?.length || 0} supVocab=${s?.vocab?.length || 0}`);
});
