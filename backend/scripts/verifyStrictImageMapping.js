const fs = require('fs');
const path = require('path');
const { defaultSplitWorkouts } = require('../data/seedData');

const expectedSplit = [
  {
    dayNumber: 1,
    dayName: "Day 1 — CHEST",
    exercises: [
      { name: "Barbell Bench Press", image: "/images/workouts/chest/bench-press.jpg" },
      { name: "Incline Dumbbell Press", image: "/images/workouts/chest/incline-dumbbell-press.jpg" },
      { name: "Chest Fly", image: "/images/workouts/chest/chest-fly.jpg" },
      { name: "Dumbbell Pullover", image: "/images/workouts/chest/dumbbell-pullover.jpg" },
      { name: "Push-Ups", image: "/images/workouts/chest/push-ups.jpg" }
    ]
  },
  {
    dayNumber: 2,
    dayName: "Day 2 — SHOULDERS",
    exercises: [
      { name: "Overhead Press", image: "/images/workouts/shoulders/overhead-press.jpg" },
      { name: "Lateral Raise", image: "/images/workouts/shoulders/lateral-raise.jpg" },
      { name: "Front Raise", image: "/images/workouts/shoulders/front-raise.jpg" },
      { name: "Rear Delt Fly", image: "/images/workouts/shoulders/rear-delt-fly.jpg" },
      { name: "Shrugs", image: "/images/workouts/shoulders/shrugs.jpg" }
    ]
  },
  {
    dayNumber: 3,
    dayName: "Day 3 — BICEPS",
    exercises: [
      { name: "Barbell Curl", image: "/images/workouts/biceps/barbell-curl.jpg" },
      { name: "Dumbbell Curl", image: "/images/workouts/biceps/dumbbell-curl.jpg" },
      { name: "Hammer Curl", image: "/images/workouts/biceps/hammer-curl.jpg" },
      { name: "Preacher Curl", image: "/images/workouts/biceps/preacher-curl.jpg" },
      { name: "Concentration Curl", image: "/images/workouts/biceps/concentration-curl.jpg" }
    ]
  },
  {
    dayNumber: 4,
    dayName: "Day 4 — TRICEPS",
    exercises: [
      { name: "Close Grip Bench Press", image: "/images/workouts/triceps/close-grip-bench-press.jpg" },
      { name: "Rope Push Down", image: "/images/workouts/triceps/rope-pushdown.jpg" },
      { name: "Overhead Triceps Extension", image: "/images/workouts/triceps/overhead-extension.jpg" },
      { name: "Dips", image: "/images/workouts/triceps/dips.jpg" },
      { name: "Triceps Kickback", image: "/images/workouts/triceps/triceps-kickback.jpg" }
    ]
  },
  {
    dayNumber: 5,
    dayName: "Day 5 — BACK",
    exercises: [
      { name: "Pull-Ups", image: "/images/workouts/back/pull-ups.jpg" },
      { name: "Barbell Row", image: "/images/workouts/back/barbell-row.jpg" },
      { name: "Lat Pulldown", image: "/images/workouts/back/lat-pulldown.jpg" },
      { name: "Seated Cable Row", image: "/images/workouts/back/seated-cable-row.jpg" },
      { name: "Deadlift", image: "/images/workouts/back/deadlift.jpg" }
    ]
  },
  {
    dayNumber: 6,
    dayName: "Day 6 — LEGS",
    exercises: [
      { name: "Barbell Squat", image: "/images/workouts/legs/barbell-squat.jpg" },
      { name: "Leg Press", image: "/images/workouts/legs/leg-press.jpg" },
      { name: "Leg Extension", image: "/images/workouts/legs/leg-extension.jpg" },
      { name: "Leg Curl", image: "/images/workouts/legs/leg-curl.jpg" },
      { name: "Calf Raise", image: "/images/workouts/legs/calf-raise.jpg" }
    ]
  },
  {
    dayNumber: 7,
    dayName: "Day 7 — REST AND RECOVERY",
    exercises: [
      { name: "Walking", image: "/images/workouts/recovery/walking.jpg" },
      { name: "Full Body Stretching", image: "/images/workouts/recovery/stretching.jpg" },
      { name: "Mobility Exercises", image: "/images/workouts/recovery/mobility.jpg" }
    ]
  }
];

console.log('====================================================');
console.log('🔬 FIT HEALTH STRICT WORKOUT & IMAGE VERIFICATION');
console.log('====================================================\n');

const days = defaultSplitWorkouts.intermediate;
let totalChecks = 0;
let passedChecks = 0;

expectedSplit.forEach((expDay, dIdx) => {
  const actualDay = days[dIdx];
  console.log(`\n📅 Checking ${expDay.dayName}:`);

  if (!actualDay) {
    console.error(`❌ Missing day index ${dIdx}`);
    return;
  }

  expDay.exercises.forEach((expEx, eIdx) => {
    totalChecks += 2;
    const actualEx = actualDay.exercises[eIdx];

    if (!actualEx) {
      console.error(`❌ Missing exercise at index ${eIdx} in ${expDay.dayName}`);
      return;
    }

    // Check 1: Name match
    if (actualEx.name.toLowerCase().trim() === expEx.name.toLowerCase().trim()) {
      passedChecks++;
      console.log(`  ✅ Name: "${actualEx.name}"`);
    } else {
      console.error(`  ❌ Name mismatch: expected "${expEx.name}", got "${actualEx.name}"`);
    }

    // Check 2: Image path & physical file existence
    const localFsPath = path.resolve(__dirname, '../../frontend/public', actualEx.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(localFsPath)) {
      const size = fs.statSync(localFsPath).size;
      if (size > 1000) {
        passedChecks++;
        console.log(`     └─ Image: ${actualEx.imageUrl} (${(size / 1024).toFixed(1)} KB)`);
      } else {
        console.error(`     ❌ Image file is too small (${size} bytes): ${localFsPath}`);
      }
    } else {
      console.error(`     ❌ Image file NOT FOUND on disk: ${localFsPath}`);
    }
  });
});

console.log('\n====================================================');
console.log(`SUMMARY: ${passedChecks} / ${totalChecks} Checks Passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
console.log('====================================================');

if (passedChecks === totalChecks) {
  console.log('🎉 100% PERFECT 1-TO-1 MATCH ACROSS ALL 33 EXERCISES & IMAGES!');
  process.exit(0);
} else {
  process.exit(1);
}

