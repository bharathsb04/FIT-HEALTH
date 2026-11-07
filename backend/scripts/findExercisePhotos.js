const fs = require('fs');
const path = require('path');

async function searchExercises() {
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const all = await res.json();
  
  const searchTerms = [
    // Chest
    { category: 'chest', file: 'bench-press.jpg', name: 'Barbell Bench Press', queries: ['Barbell Bench Press - Medium Grip', 'Barbell Bench Press', 'bench press'] },
    { category: 'chest', file: 'incline-dumbbell-press.jpg', name: 'Incline Dumbbell Press', queries: ['Incline Dumbbell Press', 'incline dumbbell'] },
    { category: 'chest', file: 'chest-fly.jpg', name: 'Chest Fly', queries: ['Dumbbell Flyes', 'Flat Bench Dumbbell Flyes', 'Dumbbell Fly', 'Incline Dumbbell Flyes'] },
    { category: 'chest', file: 'dumbbell-pullover.jpg', name: 'Dumbbell Pullover', queries: ['Straight-Arm Dumbbell Pullover', 'Bent-Arm Dumbbell Pullover', 'pullover'] },
    { category: 'chest', file: 'push-ups.jpg', name: 'Push-Ups', queries: ['Pushups', 'pushup', 'push-up'] },
    
    // Shoulders
    { category: 'shoulders', file: 'overhead-press.jpg', name: 'Overhead Press', queries: ['Standing Military Press', 'Standing Overhead Barbell Press', 'Overhead Press', 'Barbell Shoulder Press'] },
    { category: 'shoulders', file: 'lateral-raise.jpg', name: 'Lateral Raise', queries: ['Side Lateral Raise', 'Dumbbell Lateral Raise', 'Power Partials'] },
    { category: 'shoulders', file: 'front-raise.jpg', name: 'Front Raise', queries: ['Front Dumbbell Raise', 'Dumbbell Front Raise'] },
    { category: 'shoulders', file: 'rear-delt-fly.jpg', name: 'Rear Delt Fly', queries: ['Bent Over Dumbbell Rear Delt Raise with Head on Bench', 'Bent Over Dumbbell Rear Delt Raise', 'Rear Delt Flyes'] },
    { category: 'shoulders', file: 'shrugs.jpg', name: 'Shrugs', queries: ['Dumbbell Shrug', 'Barbell Shrug'] },

    // Biceps
    { category: 'biceps', file: 'barbell-curl.jpg', name: 'Barbell Curl', queries: ['Barbell Curl', 'Standing Biceps Barbell Curl'] },
    { category: 'biceps', file: 'dumbbell-curl.jpg', name: 'Dumbbell Curl', queries: ['Dumbbell Alternate Bicep Curl', 'Dumbbell Bicep Curl', 'Bicep Curl'] },
    { category: 'biceps', file: 'hammer-curl.jpg', name: 'Hammer Curl', queries: ['Hammer Curls', 'Alternate Hammer Curl'] },
    { category: 'biceps', file: 'preacher-curl.jpg', name: 'Preacher Curl', queries: ['Preacher Curl', 'One Arm Dumbbell Preacher Curl'] },
    { category: 'biceps', file: 'concentration-curl.jpg', name: 'Concentration Curl', queries: ['Concentration Curls', 'Concentration Curl'] },

    // Triceps
    { category: 'triceps', file: 'close-grip-bench-press.jpg', name: 'Close Grip Bench Press', queries: ['Close-Grip Barbell Bench Press', 'Close Grip Bench Press'] },
    { category: 'triceps', file: 'rope-pushdown.jpg', name: 'Rope Push Down', queries: ['Triceps Pushdown - Rope Attachment', 'Triceps Pushdown', 'Pushdown'] },
    { category: 'triceps', file: 'overhead-extension.jpg', name: 'Overhead Triceps Extension', queries: ['Standing Dumbbell Triceps Extension', 'Seated Triceps Press', 'Dumbbell Triceps Extension'] },
    { category: 'triceps', file: 'dips.jpg', name: 'Dips', queries: ['Dips - Triceps Version', 'Dips - Chest Version', 'Bench Dips', 'Parallel Bar Dips'] },
    { category: 'triceps', file: 'triceps-kickback.jpg', name: 'Triceps Kickback', queries: ['Tricep Dumbbell Kickback', 'Standing Bent-Over One-Arm Dumbbell Triceps Extension'] },

    // Back
    { category: 'back', file: 'pull-ups.jpg', name: 'Pull-Ups', queries: ['Pullups', 'Pull-up', 'Wide-Grip Rear Pull-Up'] },
    { category: 'back', file: 'barbell-row.jpg', name: 'Barbell Row', queries: ['Bent Over Barbell Row', 'Barbell Row'] },
    { category: 'back', file: 'lat-pulldown.jpg', name: 'Lat Pulldown', queries: ['Wide-Grip Lat Pulldown', 'Lat Pulldown'] },
    { category: 'back', file: 'seated-cable-row.jpg', name: 'Seated Cable Row', queries: ['Seated Cable Rows', 'Cable Seated Row'] },
    { category: 'back', file: 'deadlift.jpg', name: 'Deadlift', queries: ['Barbell Deadlift', 'Deadlift'] },

    // Legs
    { category: 'legs', file: 'barbell-squat.jpg', name: 'Barbell Squat', queries: ['Barbell Full Squat', 'Barbell Squat'] },
    { category: 'legs', file: 'leg-press.jpg', name: 'Leg Press', queries: ['Leg Press'] },
    { category: 'legs', file: 'leg-extension.jpg', name: 'Leg Extension', queries: ['Leg Extensions', 'Leg Extension'] },
    { category: 'legs', file: 'leg-curl.jpg', name: 'Leg Curl', queries: ['Lying Leg Curls', 'Seated Leg Curl', 'Leg Curls'] },
    { category: 'legs', file: 'calf-raise.jpg', name: 'Calf Raise', queries: ['Standing Calf Raises', 'Standing Dumbbell Calf Raise', 'Calf Raise'] }
  ];

  const matched = [];

  for (const item of searchTerms) {
    let match = null;
    for (const q of item.queries) {
      match = all.find(e => e.name.toLowerCase() === q.toLowerCase());
      if (match) break;
    }
    if (!match) {
      for (const q of item.queries) {
        match = all.find(e => e.name.toLowerCase().includes(q.toLowerCase()));
        if (match) break;
      }
    }
    if (match && match.images && match.images.length > 0) {
      console.log(`[FOUND] ${item.name} -> "${match.name}" (image: ${match.images[0]})`);
      matched.push({
        category: item.category,
        file: item.file,
        name: item.name,
        dbName: match.name,
        imagePath: match.images[0]
      });
    } else {
      console.log(`[NOT FOUND] ${item.name}`);
    }
  }

  console.log(`\nMatched ${matched.length} of ${searchTerms.length} exercises!`);
  fs.writeFileSync('backend/data/matchedExerciseImages.json', JSON.stringify(matched, null, 2));
}

searchExercises();
