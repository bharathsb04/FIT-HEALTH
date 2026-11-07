const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const demonstratorFile = path.join(projectRoot, 'frontend/src/components/WorkoutVideoDemonstrator.jsx');

console.log('=== VERIFYING WORKOUT DEMONSTRATOR IMAGE REPLACEMENT ===');

const code = fs.readFileSync(demonstratorFile, 'utf8');

// Check that YouTube video iframe and video tag are completely removed from WorkoutVideoDemonstrator.jsx
const hasIframe = code.includes('<iframe');
const hasVideoTag = code.includes('<video');
const hasPlayPause = code.includes('setIsPlaying') || code.includes('playbackSpeed');

console.log(`1. YouTube iframe removed: ${!hasIframe ? 'PASS' : 'FAIL'}`);
console.log(`2. HTML5 video tag removed: ${!hasVideoTag ? 'PASS' : 'FAIL'}`);
console.log(`3. Video play/speed controls removed: ${!hasPlayPause ? 'PASS' : 'FAIL'}`);

if (hasIframe || hasVideoTag || hasPlayPause) {
  console.error('FAILED: Video player elements still found in WorkoutVideoDemonstrator.jsx');
  process.exit(1);
}

// Check required exercises
const requiredExercises = [
  // Day 1
  { name: 'Barbell Bench Press', expected: '/images/workouts/chest/bench-press.jpg' },
  { name: 'Incline Dumbbell Press', expected: '/images/workouts/chest/incline-dumbbell-press.jpg' },
  { name: 'Chest Fly', expected: '/images/workouts/chest/chest-fly.jpg' },
  { name: 'Dumbbell Pullover', expected: '/images/workouts/chest/dumbbell-pullover.jpg' },
  { name: 'Push-Ups', expected: '/images/workouts/chest/push-ups.jpg' },
  // Day 2
  { name: 'Overhead Press', expected: '/images/workouts/shoulders/overhead-press.jpg' },
  { name: 'Lateral Raise', expected: '/images/workouts/shoulders/lateral-raise.jpg' },
  { name: 'Front Raise', expected: '/images/workouts/shoulders/front-raise.jpg' },
  { name: 'Rear Delt Fly', expected: '/images/workouts/shoulders/rear-delt-fly.jpg' },
  { name: 'Shrugs', expected: '/images/workouts/shoulders/shrugs.jpg' },
  // Day 3
  { name: 'Barbell Curl', expected: '/images/workouts/biceps/barbell-curl.jpg' },
  { name: 'Dumbbell Curl', expected: '/images/workouts/biceps/dumbbell-curl.jpg' },
  { name: 'Hammer Curl', expected: '/images/workouts/biceps/hammer-curl.jpg' },
  { name: 'Preacher Curl', expected: '/images/workouts/biceps/preacher-curl.jpg' },
  { name: 'Concentration Curl', expected: '/images/workouts/biceps/concentration-curl.jpg' },
  // Day 4
  { name: 'Close Grip Bench Press', expected: '/images/workouts/triceps/close-grip-bench-press.jpg' },
  { name: 'Rope Push Down', expected: '/images/workouts/triceps/rope-pushdown.jpg' },
  { name: 'Overhead Triceps Extension', expected: '/images/workouts/triceps/overhead-extension.jpg' },
  { name: 'Dips', expected: '/images/workouts/triceps/dips.jpg' },
  { name: 'Triceps Kickback', expected: '/images/workouts/triceps/triceps-kickback.jpg' },
  // Day 5
  { name: 'Pull-Ups', expected: '/images/workouts/back/pull-ups.jpg' },
  { name: 'Barbell Row', expected: '/images/workouts/back/barbell-row.jpg' },
  { name: 'Lat Pulldown', expected: '/images/workouts/back/lat-pulldown.jpg' },
  { name: 'Seated Cable Row', expected: '/images/workouts/back/seated-cable-row.jpg' },
  { name: 'Deadlift', expected: '/images/workouts/back/deadlift.jpg' },
  // Day 6
  { name: 'Barbell Squat', expected: '/images/workouts/legs/barbell-squat.jpg' },
  { name: 'Leg Press', expected: '/images/workouts/legs/leg-press.jpg' },
  { name: 'Leg Extension', expected: '/images/workouts/legs/leg-extension.jpg' },
  { name: 'Leg Curl', expected: '/images/workouts/legs/leg-curl.jpg' },
  { name: 'Calf Raise', expected: '/images/workouts/legs/calf-raise.jpg' },
  // Day 7
  { name: 'Walking', expected: '/images/workouts/recovery/walking.jpg' },
  { name: 'Full Body Stretching', expected: '/images/workouts/recovery/stretching.jpg' },
  { name: 'Mobility Exercises', expected: '/images/workouts/recovery/mobility.jpg' }
];

let checksPassed = 0;
for (const ex of requiredExercises) {
  const diskPath = path.join(projectRoot, 'frontend/public', ex.expected);
  if (!fs.existsSync(diskPath)) {
    console.error(`Missing image file on disk: ${diskPath}`);
    process.exit(1);
  }
  checksPassed++;
}

console.log(`4. All 33 exercise static demonstration photos verified on disk: ${checksPassed}/33 PASS`);
console.log('=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');

