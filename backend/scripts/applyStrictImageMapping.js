const fs = require('fs');
const path = require('path');

const intermediateSplit = [
  {
    dayNumber: 1,
    dayName: "Day 1 — CHEST",
    focus: "Pectoral Hypertrophy, Upper Chest Density & Push Power",
    targetGroup: "Chest",
    warmup: "5-10 min dynamic shoulder circles, band pull-aparts & 2 warm-up sets of light bench press.",
    cooldown: "5 min doorway chest stretch & overhead triceps mobility.",
    exercises: [
      {
        id: "e1",
        name: "Barbell Bench Press",
        targetMuscle: "Pectoralis Major & Triceps",
        equipment: "Olympic Barbell & Flat Bench",
        sets: 4,
        reps: "8-10",
        weight: "75 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/chest/bench-press.jpg",
        instructions: "Lie flat on bench with eyes under barbell. Grip slightly wider than shoulder width, arch lower back slightly, and retract scapulae.",
        technique: "Lower bar in a controlled 3-second descent touching lower sternum. Drive upward explosively without flaring elbows.",
        breathing: "Inhale deeply at the top and hold during descent; exhale forcefully past the sticking point.",
        commonMistakes: ["Flaring elbows out to 90 degrees", "Bouncing the barbell off ribcage", "Lifting hips off the bench"]
      },
      {
        id: "e2",
        name: "Incline Dumbbell Press",
        targetMuscle: "Upper Clavicular Pectoralis",
        equipment: "Adjustable Bench (30°) & Dumbbells",
        sets: 4,
        reps: "8-12",
        weight: "26 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/chest/incline-dumbbell-press.jpg",
        instructions: "Set bench to 30 degrees. Kick dumbbells up to shoulder level with knees, plant feet firmly, and press up over upper chest.",
        technique: "Keep elbows at 45 degrees to torso. Lower until you feel a deep stretch in upper pecs, then drive inward.",
        breathing: "Inhale on the lowering phase; exhale as you push the dumbbells upward.",
        commonMistakes: ["Setting bench angle too high (>45°) which shifts load to shoulders", "Touching dumbbells together at top and losing tension"]
      },
      {
        id: "e3",
        name: "Chest Fly",
        targetMuscle: "Sternal Pectoralis Adduction",
        equipment: "Flat Bench & Dumbbells (Pair)",
        sets: 3,
        reps: "10-12",
        weight: "16 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/chest/chest-fly.jpg",
        instructions: "Lie supine holding dumbbells above chest with neutral grip and slight bend in elbows.",
        technique: "Open arms in a wide hugging arc until chest is stretched. Squeeze pecs hard to bring dumbbells back together.",
        breathing: "Inhale as you open wide into the chest stretch; exhale as you adduct arms back to center.",
        commonMistakes: ["Bending elbows too much and turning it into a press", "Going too heavy and hyperextending shoulders"]
      },
      {
        id: "e4",
        name: "Dumbbell Pullover",
        targetMuscle: "Upper Chest, Serratus & Lats",
        equipment: "Cross-Bench & Heavy Dumbbell",
        sets: 3,
        reps: "10-12",
        weight: "22 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/chest/dumbbell-pullover.jpg",
        instructions: "Rest upper back perpendicular across a flat bench, hips slightly lowered. Hold one dumbbell with both hands in diamond grip.",
        technique: "Lower dumbbell behind head in an arc until a deep ribcage stretch is achieved. Pull back over chest focusing on serratus and pecs.",
        breathing: "Take a deep diaphragmatic breath expanding the ribcage as the weight lowers; exhale as you pull over.",
        commonMistakes: ["Bending elbows excessively like a triceps extension", "Allowing hips to rise up above bench height"]
      },
      {
        id: "e5",
        name: "Push-Ups",
        targetMuscle: "Chest, Anterior Delts & Core",
        equipment: "Bodyweight Floor Calisthenics",
        sets: 3,
        reps: "MAX",
        weight: "Bodyweight",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/chest/push-ups.jpg",
        instructions: "Place hands shoulder-width apart on floor, feet together, body in rigid plank.",
        technique: "Lower chest to 1 inch off the floor with elbows tracking 45 degrees back. Press up to full arm extension.",
        breathing: "Inhale descending; exhale driving up while bracing core.",
        commonMistakes: ["Sagging lower back or piking hips in the air", "Half reps without full chest depth"]
      }
    ]
  },
  {
    dayNumber: 2,
    dayName: "Day 2 — SHOULDERS",
    focus: "3D Deltoid Mass, Overhead Power & Upper Trapezius",
    targetGroup: "Shoulders",
    warmup: "5-10 min shoulder pass-throughs, face pulls & rotator cuff warm-up.",
    cooldown: "Cross-body shoulder stretch & gentle neck lateral stretches.",
    exercises: [
      {
        id: "e6",
        name: "Overhead Press",
        targetMuscle: "Anterior & Lateral Deltoids",
        equipment: "Olympic Barbell & Power Rack",
        sets: 4,
        reps: "8-10",
        weight: "50 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/shoulders/overhead-press.jpg",
        instructions: "Stand with feet shoulder-width, bar resting across clavicles. Squeeze glutes and brace core.",
        technique: "Press bar vertically, tilting head slightly back to clear chin, then pushing head through window at top lockout.",
        breathing: "Inhale and brace core before pressing; exhale once past forehead level.",
        commonMistakes: ["Excessive lower back arching", "Pressing bar forward instead of vertical", "Not locking out at top"]
      },
      {
        id: "e7",
        name: "Lateral Raise",
        targetMuscle: "Lateral Deltoid (Shoulder Width)",
        equipment: "Dumbbells (Pair)",
        sets: 4,
        reps: "10-15",
        weight: "12 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/shoulders/lateral-raise.jpg",
        instructions: "Stand tall with slight forward hinge, dumbbells at thighs with elbows slightly bent.",
        technique: "Raise arms laterally leading with elbows until parallel to floor. Pour the pitcher slightly with thumbs angled down.",
        breathing: "Exhale as you raise outward; inhale on controlled descent.",
        commonMistakes: ["Using torso momentum or swinging", "Shrugging traps instead of isolating lateral delts"]
      },
      {
        id: "e8",
        name: "Front Raise",
        targetMuscle: "Anterior Deltoid Head",
        equipment: "Dumbbells (Pair)",
        sets: 3,
        reps: "10-12",
        weight: "12 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/shoulders/front-raise.jpg",
        instructions: "Stand upright holding dumbbells in front of thighs with overhand grip.",
        technique: "Raise dumbbells straight forward to eye level with strict control. Pause for a split second, then lower slowly.",
        breathing: "Exhale on upward lift; inhale lowering down.",
        commonMistakes: ["Swinging hips to launch dumbbells", "Raising far above shoulder level"]
      },
      {
        id: "e9",
        name: "Rear Delt Fly",
        targetMuscle: "Posterior Deltoids & Rhomboids",
        equipment: "Dumbbells & 45° Torso Hinge",
        sets: 3,
        reps: "12-15",
        weight: "10 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/shoulders/rear-delt-fly.jpg",
        instructions: "Hinge at hips to a 45-degree angle with flat spine and soft knees. Let dumbbells hang below shoulders.",
        technique: "Sweep arms out wide and slightly back like wings, squeezing the back of your shoulders at the peak.",
        breathing: "Exhale raising wide; inhale returning under control.",
        commonMistakes: ["Rounding lower back", "Using heavy weights and turning it into a row"]
      },
      {
        id: "e10",
        name: "Shrugs",
        targetMuscle: "Upper Trapezius",
        equipment: "Heavy Dumbbells (Pair)",
        sets: 3,
        reps: "12-15",
        weight: "32 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/shoulders/shrugs.jpg",
        instructions: "Hold heavy dumbbells at your sides with neutral grip, arms straight and shoulders back.",
        technique: "Elevate shoulders straight upward towards your ears. Hold the peak contraction for 1-2 seconds, then lower under control.",
        breathing: "Exhale on shrug elevation; inhale on the eccentric stretch.",
        commonMistakes: ["Rolling shoulders in circles (injures rotator cuffs)", "Bending elbows to assist lift"]
      }
    ]
  },
  {
    dayNumber: 3,
    dayName: "Day 3 — BICEPS",
    focus: "Arm Thickness, Bicep Peak Hypertrophy & Brachialis Density",
    targetGroup: "Biceps",
    warmup: "5 min wrist rotations, light band curls & forearm stretches.",
    cooldown: "Biceps wall stretch & forearm flexor/extensor stretches.",
    exercises: [
      {
        id: "e11",
        name: "Barbell Curl",
        targetMuscle: "Biceps Brachii (Short & Long Head)",
        equipment: "Olympic / EZ-Curl Barbell",
        sets: 4,
        reps: "8-10",
        weight: "35 kg",
        restTime: 75,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/biceps/barbell-curl.jpg",
        instructions: "Stand tall holding barbell with shoulder-width supinated grip, elbows tucked against ribcage.",
        technique: "Curl bar upward in a smooth arc to upper chest. Squeeze biceps hard at peak, then take 3 seconds to lower.",
        breathing: "Exhale curling upward; inhale lowering down.",
        commonMistakes: ["Rocking torso back and forth", "Flaring elbows away from sides", "Letting bar drop freely"]
      },
      {
        id: "e12",
        name: "Dumbbell Curl",
        targetMuscle: "Biceps Brachii Supination",
        equipment: "Dumbbells (Pair)",
        sets: 4,
        reps: "10-12",
        weight: "16 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/biceps/dumbbell-curl.jpg",
        instructions: "Hold dumbbells at sides with palms facing each other at bottom position.",
        technique: "Curl up while rotating wrist (supination) so palm faces ceiling by mid-repetition. Squeeze at top.",
        breathing: "Exhale as you curl and supinate; inhale during descent.",
        commonMistakes: ["Swinging shoulders forward to assist", "Failing to fully supinate wrist"]
      },
      {
        id: "e13",
        name: "Hammer Curl",
        targetMuscle: "Brachialis & Forearm Brachioradialis",
        equipment: "Dumbbells (Neutral Grip)",
        sets: 3,
        reps: "10-12",
        weight: "16 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/biceps/hammer-curl.jpg",
        instructions: "Hold dumbbells with palms facing each other (neutral grip) throughout entire rep.",
        technique: "Curl straight up toward shoulders maintaining neutral palms. Great for widening arm profile and forearms.",
        breathing: "Exhale on contraction; inhale on descent.",
        commonMistakes: ["Elbows moving forward past ribcage", "Using excessive torso sway"]
      },
      {
        id: "e14",
        name: "Preacher Curl",
        targetMuscle: "Biceps Brachii (Isolated Short Head)",
        equipment: "Preacher Bench & EZ-Bar",
        sets: 3,
        reps: "10-12",
        weight: "28 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/biceps/preacher-curl.jpg",
        instructions: "Sit at preacher bench with upper arms flat against 45-degree pad, gripping inner EZ-bar knurling.",
        technique: "Curl bar toward chin without lifting elbows off pad. Lower under strict control to 95% extension.",
        breathing: "Exhale curling bar up; inhale as you lower smoothly.",
        commonMistakes: ["Hyperextending and locking out elbow violently at bottom", "Lifting body off seat"]
      },
      {
        id: "e15",
        name: "Concentration Curl",
        targetMuscle: "Biceps Isolation Peak Contraction",
        equipment: "Flat Bench & Single Dumbbell",
        sets: 3,
        reps: "12",
        weight: "14 kg",
        restTime: 45,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/biceps/concentration-curl.jpg",
        instructions: "Sit on bench with legs spread. Brace back of elbow against inner thigh of same side.",
        technique: "Curl dumbbell up smoothly towards your face, keeping torso steady. Peak squeeze at top for 1 second.",
        breathing: "Exhale curling; inhale lowering.",
        commonMistakes: ["Moving elbow along thigh during repetition", "Using back momentum"]
      }
    ]
  },
  {
    dayNumber: 4,
    dayName: "Day 4 — TRICEPS",
    focus: "Tricep Horseshoe, Lockout Power & Density",
    targetGroup: "Triceps",
    warmup: "5 min arm circles, light cable pushdowns & elbow mobility.",
    cooldown: "Overhead triceps stretch & cross-body arm stretch.",
    exercises: [
      {
        id: "e16",
        name: "Close Grip Bench Press",
        targetMuscle: "Triceps Lateral & Medial Heads",
        equipment: "Olympic Barbell & Flat Bench",
        sets: 4,
        reps: "8-10",
        weight: "65 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/triceps/close-grip-bench-press.jpg",
        instructions: "Grip barbell shoulder-width apart (approx 12-14 inches). Keep elbows tucked close to ribcage.",
        technique: "Lower bar to lower ribcage under control, drive up forcefully locking out triceps.",
        breathing: "Inhale lowering bar; exhale pressing up.",
        commonMistakes: ["Hands too close together (<8 inches) which strains wrists", "Elbows flaring outward"]
      },
      {
        id: "e17",
        name: "Rope Push Down",
        targetMuscle: "Triceps Lateral Head Peak Lockout",
        equipment: "High Cable Pulley & Rope Attachment",
        sets: 4,
        reps: "10-12",
        weight: "26 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/triceps/rope-pushdown.jpg",
        instructions: "Grip rope attachment with palms facing inward, slight forward hinge at hips, elbows pinned to sides.",
        technique: "Push rope downward and flare rope ends apart at full lockout, squeezing triceps for 1 second.",
        breathing: "Exhale pushing down into lockout; inhale allowing rope to return to chest height.",
        commonMistakes: ["Letting elbows drift forward and backward", "Using body weight to press rope"]
      },
      {
        id: "e18",
        name: "Overhead Triceps Extension",
        targetMuscle: "Triceps Long Head (Full Stretch)",
        equipment: "Seated Bench & Heavy Dumbbell",
        sets: 3,
        reps: "10-12",
        weight: "24 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/triceps/overhead-extension.jpg",
        instructions: "Sit upright gripping one dumbbell with both hands in diamond grip overhead.",
        technique: "Lower dumbbell behind neck keeping elbows pointing upward. Extend arms back overhead to full lockout.",
        breathing: "Inhale descending behind neck; exhale extending overhead.",
        commonMistakes: ["Elbows flaring excessively wide", "Arching lower back off backrest"]
      },
      {
        id: "e19",
        name: "Dips",
        targetMuscle: "Triceps & Anterior Deltoids",
        equipment: "Parallel Bar Dips / Bench",
        sets: 3,
        reps: "10-12",
        weight: "Bodyweight",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/triceps/dips.jpg",
        instructions: "Mount parallel dip bars with arms straight and shoulders depressed down. Torso upright.",
        technique: "Lower body by bending elbows until arms form 90 degrees. Press through palms to lock out.",
        breathing: "Inhale lowering hips; exhale pressing up.",
        commonMistakes: ["Leaning too far forward (shifts load to chest)", "Shrugging shoulders"]
      },
      {
        id: "e20",
        name: "Triceps Kickback",
        targetMuscle: "Triceps Lateral & Long Head Lockout",
        equipment: "Dumbbell & Flat Bench Support",
        sets: 3,
        reps: "12",
        weight: "10 kg",
        restTime: 45,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/triceps/triceps-kickback.jpg",
        instructions: "Hinge torso parallel to floor, pin upper arm alongside ribcage, holding dumbbell.",
        technique: "Extend forearm straight back into full elbow lockout, squeezing tricep hard before returning to 90 degrees.",
        breathing: "Exhale extending back; inhale returning forward.",
        commonMistakes: ["Dropping elbow during movement", "Swinging dumbbell with shoulder momentum"]
      }
    ]
  },
  {
    dayNumber: 5,
    dayName: "Day 5 — BACK",
    focus: "V-Taper Lats, Mid-Back Thickness & Deadlift Posterior Chain Power",
    targetGroup: "Back",
    warmup: "5-10 min band dislocates, light lat pulldowns & cat-cow spinal flexions.",
    cooldown: "Dead hang from pull-up bar for 60 seconds & child's pose.",
    exercises: [
      {
        id: "e21",
        name: "Pull-Ups",
        targetMuscle: "Latissimus Dorsi (V-Taper Width)",
        equipment: "Rigid Overhead Pull-Up Bar",
        sets: 4,
        reps: "6-10",
        weight: "Bodyweight",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/back/pull-ups.jpg",
        instructions: "Grip pull-up bar slightly wider than shoulder width with overhand grip from a full dead-hang.",
        technique: "Drive elbows down toward your hips and pull upper chest up to touch the bar. Lower under control.",
        breathing: "Exhale pulling up; inhale lowering into full dead-hang stretch.",
        commonMistakes: ["Kicking legs or kipping body", "Half reps without chin clearing bar or without full stretch"]
      },
      {
        id: "e22",
        name: "Barbell Row",
        targetMuscle: "Rhomboids, Lats & Mid-Back Thickness",
        equipment: "Olympic Barbell & 45° Torso Angle",
        sets: 4,
        reps: "8-12",
        weight: "70 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/back/barbell-row.jpg",
        instructions: "Hinge forward at 45 degrees with flat spine and knees soft. Grip bar slightly wider than shoulders.",
        technique: "Pull bar towards your navel, driving elbows back and pinching shoulder blades together tightly.",
        breathing: "Exhale rowing upward; inhale lowering bar under control.",
        commonMistakes: ["Rounding lumbar spine", "Standing too upright and turning it into a shrug"]
      },
      {
        id: "e23",
        name: "Lat Pulldown",
        targetMuscle: "Latissimus Dorsi (Outer Sweep)",
        equipment: "Cable Lat Machine & Wide Curved Bar",
        sets: 3,
        reps: "10-12",
        weight: "65 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/back/lat-pulldown.jpg",
        instructions: "Lock thighs firmly under pads. Grip wide curved bar with overhand grip, slight lean back.",
        technique: "Pull bar down smoothly to upper collarbone while expanding chest. Slowly control ascent back up.",
        breathing: "Exhale pulling down; inhale returning bar overhead.",
        commonMistakes: ["Pulling bar behind the neck (dangerous for rotator cuffs)", "Swinging torso backward excessively"]
      },
      {
        id: "e24",
        name: "Seated Cable Row",
        targetMuscle: "Middle Traps, Rhomboids & Lower Lats",
        equipment: "Low Pulley Cable Row & V-Grip Handle",
        sets: 3,
        reps: "10-12",
        weight: "60 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/back/seated-cable-row.jpg",
        instructions: "Sit upright with feet braced against footplates and knees softly bent. Grasp V-grip handle.",
        technique: "Pull handle into lower abdomen while keeping spine tall. Squeeze back muscles for 1 second.",
        breathing: "Exhale pulling into ribs; inhale extending arms forward.",
        commonMistakes: ["Rounding lower back reaching forward", "Leaning back excessively to jerk weight"]
      },
      {
        id: "e25",
        name: "Deadlift",
        targetMuscle: "Entire Posterior Chain, Erector Spinae & Glutes",
        equipment: "Olympic Barbell & Bumper Plates",
        sets: 3,
        reps: "6-8",
        weight: "115 kg",
        restTime: 120,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/back/deadlift.jpg",
        instructions: "Bar over midfoot, feet hip-width. Hinge down and take double-overhand or mixed grip. Pull chest proud and lock lats.",
        technique: "Push the floor away through midfoot, keeping bar glued to shins and thighs until hips lock out tall.",
        breathing: "Deep diaphragmatic breath and brace at bottom; exhale through lockout.",
        commonMistakes: ["Rounding lower back", "Squatting the bar instead of hinging", "Hyperextending spine at lockout"]
      }
    ]
  },
  {
    dayNumber: 6,
    dayName: "Day 6 — LEGS",
    focus: "Quad Teardrop Hypertrophy, Hamstring Sweep & Calf Density",
    targetGroup: "Legs",
    warmup: "5-10 min stationary bike, bodyweight air squats & hip 90/90 mobility.",
    cooldown: "Standing quad stretch, seated hamstring stretch & calf wall stretch.",
    exercises: [
      {
        id: "e26",
        name: "Barbell Squat",
        targetMuscle: "Quadriceps, Glutes & Adductors",
        equipment: "Squat Rack & Olympic Barbell",
        sets: 4,
        reps: "8-10",
        weight: "95 kg",
        restTime: 120,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/legs/barbell-squat.jpg",
        instructions: "Rest bar across upper traps (high bar). Feet shoulder-width apart, toes turned out 15 degrees. Brace core 360 degrees.",
        technique: "Descend by breaking at hips and knees until hip crease is parallel or below knees. Drive up through midfoot.",
        breathing: "Big breath into belly at top and hold; exhale as you pass sticking point on way up.",
        commonMistakes: ["Knees caving inward (valgus collapse)", "Heels lifting off floor", "Butt wink/rounding lower back"]
      },
      {
        id: "e27",
        name: "Leg Press",
        targetMuscle: "Quadriceps & Gluteus Maximus",
        equipment: "45° Plate-Loaded Leg Press Sled",
        sets: 4,
        reps: "10-12",
        weight: "180 kg",
        restTime: 90,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/legs/leg-press.jpg",
        instructions: "Sit firmly in seat with lower back and hips pressed against pad. Place feet shoulder-width on footplate.",
        technique: "Release safety levers. Lower sled until knees reach 90 degrees without rounding tailbone. Press back up without knee lockout.",
        breathing: "Inhale lowering sled; exhale driving footplate away.",
        commonMistakes: ["Allowing pelvis to curl off seat", "Locking knees aggressively at top"]
      },
      {
        id: "e28",
        name: "Leg Extension",
        targetMuscle: "Quadriceps (Rectus Femoris Isolation)",
        equipment: "Leg Extension Machine & Shin Roller",
        sets: 3,
        reps: "10-15",
        weight: "50 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/legs/leg-extension.jpg",
        instructions: "Align knee joint with machine pivot axis. Pad rests against lower shins just above ankles.",
        technique: "Extend legs fully, squeeze quads hard at the top for 1 full second, then take 3 seconds to lower.",
        breathing: "Exhale extending upward; inhale lowering slowly.",
        commonMistakes: ["Using momentum to swing pad", "Allowing weight stack to slam between reps"]
      },
      {
        id: "e29",
        name: "Leg Curl",
        targetMuscle: "Hamstrings (Biceps Femoris)",
        equipment: "Prone Hamstring Curl Bench",
        sets: 3,
        reps: "10-15",
        weight: "45 kg",
        restTime: 60,
        completed: false,
        completedSets: [false, false, false],
        imageUrl: "/images/workouts/legs/leg-curl.jpg",
        instructions: "Lie face down with roller pad positioned just below calf muscles. Hold side handles.",
        technique: "Curl heels up toward glutes while keeping hips pinned to pad. Squeeze hamstrings, then control return.",
        breathing: "Exhale curling heels up; inhale lowering under control.",
        commonMistakes: ["Hips lifting off bench to assist curl", "Incomplete range of motion"]
      },
      {
        id: "e30",
        name: "Calf Raise",
        targetMuscle: "Gastrocnemius & Soleus",
        equipment: "Elevated Block & Machine / Dumbbells",
        sets: 4,
        reps: "12-20",
        weight: "70 kg",
        restTime: 45,
        completed: false,
        completedSets: [false, false, false, false],
        imageUrl: "/images/workouts/legs/calf-raise.jpg",
        instructions: "Place balls of feet on edge of calf block, heels hanging free.",
        technique: "Lower heels into a deep calf stretch for 1 second, then explode up onto toes and hold peak squeeze for 2 seconds.",
        breathing: "Inhale dropping heels; exhale pressing high onto toes.",
        commonMistakes: ["Bouncing quickly without pauses", "Bending knees and turning it into a squat"]
      }
    ]
  },
  {
    dayNumber: 7,
    dayName: "Day 7 — REST AND RECOVERY",
    focus: "CNS Restoration, Active Mobility, Hydration & Sleep Repair",
    targetGroup: "Recovery",
    warmup: "Light breathing exercises & diaphragmatic expansion.",
    cooldown: "Full rest & 7-9 hours restorative deep sleep.",
    exercises: [
      {
        id: "e31",
        name: "Walking",
        targetMuscle: "Cardiovascular & Lymphatic Flow",
        equipment: "Outdoor Path / Gentle Treadmill Pace",
        sets: 1,
        reps: "30 mins",
        weight: "Bodyweight",
        restTime: 0,
        completed: false,
        completedSets: [false],
        imageUrl: "/images/workouts/recovery/walking.jpg",
        instructions: "Perform a gentle brisk walk at nasal breathing pace (60-70% max heart rate).",
        technique: "Stimulates lymphatic drainage, clears metabolic waste, enhances muscle recovery without systemic fatigue.",
        breathing: "Breathe rhythmically in and out through nose.",
        commonMistakes: ["Walking too fast and turning it into high-intensity cardio"]
      },
      {
        id: "e32",
        name: "Full Body Stretching",
        targetMuscle: "Joint Mobility, Fascia & Hip Openers",
        equipment: "Yoga Mat & Foam Roller",
        sets: 1,
        reps: "15-20 mins",
        weight: "Bodyweight",
        restTime: 0,
        completed: false,
        completedSets: [false],
        imageUrl: "/images/workouts/recovery/stretching.jpg",
        instructions: "Guided mobility circuit covering thoracic spine rotation, world's greatest stretch, hip flexors, and hamstrings.",
        technique: "Hold each stretch for 30-45 seconds without bouncing. Focus on relaxing tight connective tissue.",
        breathing: "Deep diaphragmatic belly breathing.",
        commonMistakes: ["Aggressively forcing into painful joint ranges"]
      },
      {
        id: "e33",
        name: "Mobility Exercises",
        targetMuscle: "Cellular Repair, Protein Synthesis & CNS",
        equipment: "3-4L Water, High Protein & 7-9h Sleep",
        sets: 1,
        reps: "Full Day Protocol",
        weight: "Recovery Target",
        restTime: 0,
        completed: false,
        completedSets: [false],
        imageUrl: "/images/workouts/recovery/mobility.jpg",
        instructions: "Drink 3-4 liters of water with electrolytes, hit 2.0g/kg protein goal, and prioritize 7-9 hours of uninterrupted sleep.",
        technique: "Rest is when hypertrophy occurs. Keep room dark, cool, and stay off screens 45 mins before bedtime.",
        breathing: "Slow 4-7-8 relaxing breathing before sleep.",
        commonMistakes: ["Skipping hydration or skimping on protein on rest days"]
      }
    ]
  }
];

// Update seedData.js
const seedFilePath = path.resolve(__dirname, '../data/seedData.js');
let code = fs.readFileSync(seedFilePath, 'utf8');

const splitRegex = /const defaultSplitWorkouts = \{[\s\S]*?\n\};\n\nconst foodDatabase/m;

const newSplitCode = `const defaultSplitWorkouts = {
  intermediate: ${JSON.stringify(intermediateSplit, null, 2)},
  bulking: ${JSON.stringify(intermediateSplit, null, 2)}
};

const foodDatabase`;

if (splitRegex.test(code)) {
  code = code.replace(splitRegex, newSplitCode);
  fs.writeFileSync(seedFilePath, code, 'utf8');
  console.log('Successfully updated backend/data/seedData.js with strict image paths and exercise names!');
} else {
  console.error('Failed to match defaultSplitWorkouts regex in seedData.js');
}

// Update backend/data/workoutLibrary.json
const backendJsonPath = path.resolve(__dirname, '../data/workoutLibrary.json');
let backendJson = JSON.parse(fs.readFileSync(backendJsonPath, 'utf8'));

const curatedIntermediate = [];
intermediateSplit.forEach(day => {
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
      formCue: ex.technique || ex.instructions,
      steps: [
        ex.instructions,
        ex.technique,
        `Breathing: ${ex.breathing}`
      ],
      commonMistakes: ex.commonMistakes || [
        'Lifting with jerky momentum rather than controlled tempo',
        'Failing to reach full muscle extension and contraction'
      ]
    });
  });
});

const existingIntermediate = (backendJson.intermediate || []).filter(ex => 
  !curatedIntermediate.some(c => c.name.toLowerCase() === ex.name.toLowerCase())
);
backendJson.intermediate = [...curatedIntermediate, ...existingIntermediate];
fs.writeFileSync(backendJsonPath, JSON.stringify(backendJson, null, 2), 'utf8');

// Update frontend/src/data/workoutLibrary.js
const frontendJsPath = path.resolve(__dirname, '../../frontend/src/data/workoutLibrary.js');
const libraryCode = `/**
 * Fit Health Comprehensive Multi-Level Workout Library
 * 1-to-1 Strictly Mapped Exercise Demonstration Photographs
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
console.log('Successfully updated workoutLibrary.js and workoutLibrary.json!');
