const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'workoutLibrary.js');
const raw = fs.readFileSync(jsPath, 'utf8');

const match = raw.match(/export const workoutLibrary = (\{[\s\S]*?\n\};)/);
if (match) {
  const jsonStr = match[1].replace(/;\s*$/, '');
  const parsed = eval(`(${jsonStr})`);
  const jsonPath = path.join(__dirname, '../data/workoutLibrary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log('Successfully wrote backend/data/workoutLibrary.json!');
} else {
  console.error('Could not parse workoutLibrary from JS file');
}
