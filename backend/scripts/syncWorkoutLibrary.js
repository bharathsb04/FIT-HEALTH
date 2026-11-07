/**
 * Synchronizes frontend/src/data/workoutLibrary.js and backend/data/workoutLibrary.json
 * with the 33 exact intermediate exercises and their dedicated demonstration SVG URLs.
 */

const fs = require('fs');
const path = require('path');
const { defaultSplitWorkouts } = require('../data/seedData');

const intermediateDays = defaultSplitWorkouts.intermediate;

// Convert defaultSplitWorkouts exercises to library format
const curatedIntermediate = [];
intermediateDays.forEach(day => {
  day.exercises.forEach(ex => {
    curatedIntermediate.push({
      id: ex.id,
      name: ex.name,
      level: 'intermediate',
      targetMuscle: ex.targetMuscle,
      equipment: ex.equipment,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restTime,
      suggestedLoad: ex.weight,
      imageUrl: ex.imageUrl,
      videoUrl: ex.videoUrl,
      videoPoster: ex.imageUrl,
      formCue: ex.technique || ex.instructions,
      steps: [
        ex.instructions,
        ex.technique,
        `Breathing: ${ex.breathing}`
      ],
      commonMistakes: ex.commonMistakes || [
        'Lifting with jerky momentum rather than controlled tempo',
        'Failing to reach full muscle extension and contraction'
      ],
      machine: {
        name: ex.equipment,
        category: day.targetGroup,
        imageUrl: ex.imageUrl,
        adjustmentNotes: `Optimal gym setup for ${ex.name}. Adjust load and bench/seat height to personal ergonomics.`
      }
    });
  });
});

console.log('Curated intermediate count:', curatedIntermediate.length);

// 1. Update backend/data/workoutLibrary.json
const backendJsonPath = path.resolve(__dirname, '../data/workoutLibrary.json');
let backendJson = JSON.parse(fs.readFileSync(backendJsonPath, 'utf8'));

// Filter out existing duplicates with same name if any
const existingIntermediate = (backendJson.intermediate || []).filter(ex => 
  !curatedIntermediate.some(c => c.name.toLowerCase() === ex.name.toLowerCase())
);
backendJson.intermediate = [...curatedIntermediate, ...existingIntermediate];
fs.writeFileSync(backendJsonPath, JSON.stringify(backendJson, null, 2), 'utf8');
console.log('Updated backend/data/workoutLibrary.json. Total intermediate:', backendJson.intermediate.length);

// 2. Update frontend/src/data/workoutLibrary.js
const frontendJsPath = path.resolve(__dirname, '../../frontend/src/data/workoutLibrary.js');
let frontendJsContent = fs.readFileSync(frontendJsPath, 'utf8');

// Match `export const workoutLibrary = {` ...
const libraryCode = `/**
 * Fit Health Comprehensive Multi-Level Workout Library
 * Includes 33 Dedicated Demonstration SVG visuals for the Intermediate 7-Day Plan
 */

export const workoutLibrary = ${JSON.stringify(backendJson, null, 2)};

export function getExercisesByLevel(level = 'intermediate') {
  const norm = (level || 'intermediate').toLowerCase();
  return workoutLibrary[norm] || workoutLibrary.intermediate || [];
}

export function getExercisesByLevelAndMuscle(level = 'intermediate', targetMuscle = 'Chest') {
  const list = getExercisesByLevel(level);
  if (!targetMuscle || targetMuscle === 'All') return list;
  const clean = targetMuscle.toLowerCase();
  return list.filter(ex => (ex.targetMuscle || '').toLowerCase().includes(clean) || clean.includes((ex.targetMuscle || '').toLowerCase()));
}

export function findExerciseById(id) {
  for (const lvl of ['beginner', 'intermediate', 'advanced']) {
    const found = (workoutLibrary[lvl] || []).find(e => e.id === id);
    if (found) return found;
  }
  return null;
}
`;

fs.writeFileSync(frontendJsPath, libraryCode, 'utf8');
console.log('Successfully updated frontend/src/data/workoutLibrary.js!');

