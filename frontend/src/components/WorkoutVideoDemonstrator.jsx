import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2,
  ChevronLeft, ChevronRight, CheckCircle2, Flame, Sparkles,
  Zap, Info, Activity, ShieldCheck, Eye, Compass, Gauge,
  Film, Layers, Award, Check, Heart, Radio, MapPin, Wrench,
  Target, ArrowRight, Video, Camera
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   AUTHENTIC CULT.FIT & GOOGLE FIT EXERCISE KNOWLEDGE BASE
   ───────────────────────────────────────────────────────────── */
const EXERCISE_VISUALS = {
  'barbell flat bench press': {
    category: 'Chest & Triceps',
    primaryMuscle: 'Pectoralis Major (Mid & Lower)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
    difficulty: 'Intermediate',
    tempo: '3-1-1-0 (3s Lower, 1s Pause, 1s Drive)',
    cultCoach: 'Coach Shwetambari Shetty • Cult.fit Strength Pro',
    cultClassTitle: 'Cult.fit Power Build: Chest & Triceps Dominance',
    cultBurnRate: '11.5 kcal/min',
    googleFitHeartPoints: '+18 Heart Pts',
    googleFitCategory: 'Compound Horizontal Push / Sternal Head',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Retract scapulae and pin shoulder blades into the bench',
      'Lower bar smoothly to nipple line with elbows tucked 45°',
      'Drive feet into floor and press explosively back to lockout'
    ],
    mistakes: ['Bouncing bar off sternum', 'Flaring elbows 90° outwards', 'Lifting hips off the bench'],
    animationType: 'bench_press',
    icon: '🏋️‍♂️',
    machine: {
      name: 'Olympic Flat Bench Press Station (Eleiko / Hammer Strength)',
      type: 'Free Weight Olympic Station',
      gymZone: 'Zone A • Free Weights (East Bay)',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Station sanitized & ready for use',
      pinSetup: 'J-Cup Height: Notch #7 (arm length) • Safety Catch: Notch #4',
      equipmentChecklist: ['20kg Olympic Barbell', 'Bumper Plates (5kg - 25kg)', '2x Quick-Release Spring Collars', 'Bench Pad Sanitizer'],
      alternatives: [
        { name: 'Dumbbell Flat Bench Press', zone: 'Zone A • Dumbbell Racks', swapReason: 'Independent limb stabilization & deeper stretch' },
        { name: 'Smith Machine Flat Press', zone: 'Zone B • Selectorized Bay', swapReason: 'Fixed vertical track for safer solo training' },
        { name: 'Hammer Strength Iso-Lateral Chest Press', zone: 'Zone D • Plate-Loaded Arena', swapReason: 'Converging arc with plate loading' }
      ]
    }
  },
  'incline dumbbell press': {
    category: 'Upper Chest',
    primaryMuscle: 'Clavicular Pectoral Head',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    difficulty: 'Intermediate',
    tempo: '3-1-1-0 (Slow deep stretch)',
    cultCoach: 'Coach Rishabh Telang • Cult.fit Hypertrophy Master',
    cultClassTitle: 'Cult.fit Upper Torso Sculpt: Clavicular Pecs',
    cultBurnRate: '9.8 kcal/min',
    googleFitHeartPoints: '+15 Heart Pts',
    googleFitCategory: 'Upper Body Angled Press / Clavicular Pecs',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Set bench at 30° incline to isolate upper chest fibers',
      'Keep dumbbells angled at 45° to protect rotator cuffs',
      'Press upward in slight natural triangle without clanking weights'
    ],
    mistakes: ['Setting bench incline too steep (>45° becomes shoulder press)', 'Shallow range of motion'],
    animationType: 'incline_press',
    icon: '💪',
    machine: {
      name: 'Adjustable Utility Bench (0°-85°) & Urethane Dumbbells',
      type: 'Free Weight Dumbbell Arena',
      gymZone: 'Zone A • Dumbbell Racks (Bay 3)',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: '4 of 6 adjustable benches currently open',
      pinSetup: 'Backrest Angle: Pin at 30° Notch (Hole 3) • Seat Pad: 15° upward tilt',
      equipmentChecklist: ['Matched Pair Urethane Dumbbells (12kg - 40kg)', 'Chalk block', 'Wrist wraps for heavy sets'],
      alternatives: [
        { name: 'Incline Barbell Bench Station', zone: 'Zone A • Olympic Deck', swapReason: 'Heavy progressive overload on upper clavicular head' },
        { name: 'Hammer Strength Incline Chest Press', zone: 'Zone D • Plate Bay', swapReason: 'Biomechanical converging motion path' }
      ]
    }
  },
  'weighted chest dips': {
    category: 'Lower Chest & Triceps',
    primaryMuscle: 'Lower Pectoralis & Triceps',
    secondaryMuscles: ['Anterior Deltoids', 'Core'],
    difficulty: 'Advanced',
    tempo: '2-1-1-0 (Controlled descent)',
    cultCoach: 'Coach Naveen Sharma • Cult.fit Calisthenics Lead',
    cultClassTitle: 'Cult.fit Bodyweight Elite: Chest & Tricep Dips',
    cultBurnRate: '12.0 kcal/min',
    googleFitHeartPoints: '+20 Heart Pts',
    googleFitCategory: 'Bodyweight Calisthenics & Relative Strength',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Lean torso forward 30° to bias pectoral involvement over triceps',
      'Descend until shoulders dip slightly below elbow crease',
      'Push through palms and lock out with a hard chest contraction'
    ],
    mistakes: ['Staying completely upright (loads solely triceps)', 'Excessive swinging with weight belt'],
    animationType: 'dips',
    icon: '🤸‍♂️',
    machine: {
      name: 'Multi-Grip Dip & Pull-Up Tower (or Assisted Dip Machine)',
      type: 'Bodyweight & Calisthenics Rig',
      gymZone: 'Zone C • Functional & Pull-Up Arena',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Station free with dipping belt available on rack',
      pinSetup: 'Grip Width: Medium-Wide (Chest Bias) • Belt Chain Length: 30cm',
      equipmentChecklist: ['Leather Dipping Belt & Steel Carabiner Chain', 'Olympic Plates (10kg / 20kg)', 'Chalk'],
      alternatives: [
        { name: 'Assisted Dip Machine (Pin-Selected)', zone: 'Zone B • Machine Bay', swapReason: 'Counter-weight platform for controlled volume' },
        { name: 'Decline Barbell Bench Press', zone: 'Zone A • Free Weights', swapReason: 'Direct lower pec overload without shoulder strain' }
      ]
    }
  },
  'standing cable flyes': {
    category: 'Chest Adduction',
    primaryMuscle: 'Sternal Pectoral Head (Inner Squeeze)',
    secondaryMuscles: ['Anterior Deltoids', 'Biceps Short Head'],
    difficulty: 'Beginner - Intermediate',
    tempo: '2-2-1-0 (2s Peak Squeeze)',
    cultCoach: 'Coach Vasudha Joshi • Cult.fit Transformation Specialist',
    cultClassTitle: 'Cult.fit Pec Squeeze: Cable Isolation Masterclass',
    cultBurnRate: '8.4 kcal/min',
    googleFitHeartPoints: '+12 Heart Pts',
    googleFitCategory: 'Continuous Tension Cable Fly / Pec Adduction',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Maintain slight bend in elbows throughout entire movement arc',
      'Imagine hugging a large barrel to bring hands together',
      'Squeeze pectoral muscles together hard for 2 seconds at centerline'
    ],
    mistakes: ['Using momentum/jerking torso', 'Bending elbows into a press'],
    animationType: 'cable_flyes',
    icon: '⚡',
    machine: {
      name: 'Dual Adjustable Cable Crossover Column (Life Fitness / Matrix)',
      type: 'Dual Selectorized Cable Machine',
      gymZone: 'Zone C • Cable Station #4',
      availability: '1 Member Active (Est. 2m)',
      status: 'busy',
      occupancyNote: 'Member finishing final set on left column',
      pinSetup: 'Pulley Height: Notch #16 (Shoulder/Upper Chest Height)',
      equipmentChecklist: ['2x D-Ring Stirrup Cable Handles', 'Weight Stack Pin (10kg - 35kg/side)'],
      alternatives: [
        { name: 'Pec Deck / Rear Delt Fly Machine', zone: 'Zone B • Selectorized Bay', swapReason: 'Exact chest adduction path with padded forearm levers' },
        { name: 'Flat Dumbbell Flyes', zone: 'Zone A • Free Weights', swapReason: 'Deep pectoral myofibrillar stretch on utility bench' }
      ]
    }
  },
  'skull crushers (ez bar)': {
    category: 'Triceps Isolation',
    primaryMuscle: 'Triceps Long Head',
    secondaryMuscles: ['Triceps Lateral Head', 'Forearms'],
    difficulty: 'Intermediate',
    tempo: '3-0-1-0 (Slow eccentric extension)',
    cultCoach: 'Coach Rahul Shetty • Cult.fit Arms & Core Master',
    cultClassTitle: 'Cult.fit Horseshoe Triceps: Skull Crusher Clinic',
    cultBurnRate: '7.8 kcal/min',
    googleFitHeartPoints: '+10 Heart Pts',
    googleFitCategory: 'Single-Joint Triceps Extension / Long Head',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Keep upper arms angled slightly back toward head to maintain tension',
      'Hinge strictly at elbows while lowering bar toward crown of head',
      'Extend elbows back to starting position without flaring outward'
    ],
    mistakes: ['Moving upper arms back and forth like a pullover', 'Elbow flaring causing elbow joint pain'],
    animationType: 'skull_crushers',
    icon: '🔥',
    machine: {
      name: 'Cambered EZ-Curl Bar & Flat Utility Bench',
      type: 'Free Weight EZ Barbell & Pad',
      gymZone: 'Zone A • Fixed Barbells (Rack 2)',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Fixed EZ-bars (15kg to 45kg) on wall rack',
      pinSetup: 'Flat bench positioned 1 meter clear of racks',
      equipmentChecklist: ['EZ-Curl Bar (Fixed or Olympic Plate Loaded)', 'Spring Clips', 'Flat Pad Bench'],
      alternatives: [
        { name: 'Overhead Cable Tricep Extension', zone: 'Zone C • Cable Column', swapReason: 'Continuous cable tension throughout long head excursion' },
        { name: 'Lying Dumbbell Tricep Extension', zone: 'Zone A • Dumbbell Bay', swapReason: 'Independent arm isolation to fix left/right imbalance' }
      ]
    }
  },
  'rope triceps pushdowns': {
    category: 'Triceps Isolation',
    primaryMuscle: 'Triceps Lateral & Medial Head',
    secondaryMuscles: ['Anconeus', 'Wrist Stabilizers'],
    difficulty: 'Beginner',
    tempo: '2-1-1-0 (Spread rope at bottom)',
    cultCoach: 'Coach Tarun Gill • Cult.fit Strength Coach',
    cultClassTitle: 'Cult.fit Arms Blast: Cable Tricep Lockout',
    cultBurnRate: '7.5 kcal/min',
    googleFitHeartPoints: '+9 Heart Pts',
    googleFitCategory: 'Selectorized Cable Tricep Lockout',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Pin elbows firmly against ribcage; do not let them drift forward',
      'Push downward and flare rope outward at the bottom of the stroke',
      'Hold peak isometric tricep contraction for 1 full second'
    ],
    mistakes: ['Leaning whole body weight over cable', 'Allowing elbows to lift upward on negative'],
    animationType: 'rope_pushdown',
    icon: '⛓️',
    machine: {
      name: 'Single Cable Tower with Braided Tricep Rope Attachment',
      type: 'High-Pulley Selectorized Station',
      gymZone: 'Zone C • Cable Tower #2',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'High pulley open; rope attachment clipped on',
      pinSetup: 'Top Pulley (Notch #20 / Maximum Height) • Carabiner locked',
      equipmentChecklist: ['Braided Nylon Tricep Rope Attachment', 'Selectorized Pin (20kg - 45kg)'],
      alternatives: [
        { name: 'Straight Steel Bar Pushdown', zone: 'Zone C • Cable Tower #2', swapReason: 'Increased lockout overload on lateral tricep head' },
        { name: 'V-Bar Tricep Pushdown', zone: 'Zone C • Cable Station', swapReason: 'Neutral semi-pronated wrist angle for elbow comfort' }
      ]
    }
  },
  'conventional barbell deadlift': {
    category: 'Posterior Chain',
    primaryMuscle: 'Erector Spinae, Gluteus Maximus, Hamstrings',
    secondaryMuscles: ['Latissimus Dorsi', 'Traps', 'Forearms', 'Core'],
    difficulty: 'Advanced',
    tempo: '1-1-2-0 (Explosive drive & reset)',
    cultCoach: 'Coach Anupam • Cult.fit Power & Olympic Coach',
    cultClassTitle: 'Cult.fit Deadlift Academy: Posterior Chain Mastery',
    cultBurnRate: '14.2 kcal/min',
    googleFitHeartPoints: '+25 Heart Pts',
    googleFitCategory: 'Ground-Based Posterior Chain Pull / Full Body',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Set bar over midfoot, pull chest tall and pack lats tightly',
      'Push floor away through heels before hinging hips forward',
      'Lock out with glutes without overextending lumbar spine'
    ],
    mistakes: ['Rounding lower spine', 'Bar drifting away from shins during ascent'],
    animationType: 'deadlift',
    icon: '🏋️',
    machine: {
      name: 'Olympic Hardwood Lifting Platform & 20kg Power Bar',
      type: 'Heavy Olympic Deadlift Platform',
      gymZone: 'Zone D • Olympic Lifting Platforms (Platform #3)',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Platform sanitized and rubber bumper plates stacked',
      pinSetup: 'Floor level deadlift platform with deadlift jack available',
      equipmentChecklist: ['Eleiko 20kg Power Barbell', 'Rubber Competition Bumper Plates', 'Deadlift Jack', 'Chalk Bowl'],
      alternatives: [
        { name: 'Trap Bar / Hex Bar Deadlift', zone: 'Zone D • Platform #1', swapReason: 'Neutral grip with reduced shear stress on lower back' },
        { name: 'Romanian Deadlift on Rack', zone: 'Zone A • Power Cage', swapReason: 'Targeted hamstring & glute hypertrophy hinge' }
      ]
    }
  },
  'weighted pull-ups': {
    category: 'Back & Lats',
    primaryMuscle: 'Latissimus Dorsi & Upper Back',
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Forearms', 'Rear Deltoids'],
    difficulty: 'Advanced',
    tempo: '2-1-1-0 (Dead hang to sternum touch)',
    cultCoach: 'Coach Siddharth Rao • Cult.fit Calisthenics Master',
    cultClassTitle: 'Cult.fit V-Taper: Advanced Pull-Up Progression',
    cultBurnRate: '11.8 kcal/min',
    googleFitHeartPoints: '+19 Heart Pts',
    googleFitCategory: 'Vertical Pull & Latissimus Hypertrophy',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Initiate pull by depressing scapulae and pulling elbows down toward hips',
      'Pull until chin completely clears the horizontal bar without neck craning',
      'Lower with strict 3-second control into full dead hang stretch'
    ],
    mistakes: ['Kicking legs / kipping', 'Cutting range of motion at bottom'],
    animationType: 'pullups',
    icon: '🧗‍♂️',
    machine: {
      name: 'Heavy Duty Multi-Grip Pull-Up Rig & Dipping Belt',
      type: 'Bodyweight Overhead Rig',
      gymZone: 'Zone C • Functional & Pull-Up Arena',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Bar free with dipping belt and chalk nearby',
      pinSetup: 'Grip: Pronated, 1.5x shoulder width',
      equipmentChecklist: ['Dipping Belt & Chain', 'Chalk Block', '10kg / 20kg Plates'],
      alternatives: [
        { name: 'Lat Pulldown Machine (Wide-Grip)', zone: 'Zone B • Selectorized Bay', swapReason: 'Pin-selected resistance for exact volume tracking' },
        { name: 'Assisted Pull-Up Counterweight Machine', zone: 'Zone B • Machine Bay', swapReason: 'Assisted platform for high-rep drop sets' }
      ]
    }
  },
  'barbell bent-over rows': {
    category: 'Back Thickness & Rhomboids',
    primaryMuscle: 'Rhomboids, Middle Trapezius & Lats',
    secondaryMuscles: ['Erector Spinae', 'Biceps', 'Posterior Deltoids'],
    difficulty: 'Intermediate',
    tempo: '2-1-1-0 (Explosive pull to navel)',
    cultCoach: 'Coach Rishabh Telang • Cult.fit Strength Coach',
    cultClassTitle: 'Cult.fit Back Density: Heavy Bent-Over Rows',
    cultBurnRate: '10.5 kcal/min',
    googleFitHeartPoints: '+16 Heart Pts',
    googleFitCategory: 'Horizontal Pulling & Spinal Bracing',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Hinge at hips to a 45-degree torso angle with spine perfectly neutral',
      'Drive elbows up and back, pulling bar toward lower ribcage / navel',
      'Pinch shoulder blades hard for 1 second at the top of contraction'
    ],
    mistakes: ['Jerking torso upright during pull', 'Rounding lower lumbar spine'],
    animationType: 'rows',
    icon: '🛶',
    machine: {
      name: 'Olympic Barbell Platform / Power Rack',
      type: 'Free Weight Horizontal Pull Station',
      gymZone: 'Zone A • Free Weights (Bay 2)',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Olympic barbell available on rubber floor platform',
      pinSetup: 'Start from floor or low rack pins (Notch #4)',
      equipmentChecklist: ['20kg Olympic Barbell', 'Bumper Plates', 'Locking Collars', 'Lifting Straps'],
      alternatives: [
        { name: 'Chest-Supported T-Bar Row', zone: 'Zone D • Plate-Loaded Bay', swapReason: 'Eliminates lower back fatigue with chest pad' },
        { name: 'Seated Cable Row (Close Grip)', zone: 'Zone C • Low Pulley Station', swapReason: 'Constant cable tension with neutral grip' }
      ]
    }
  },
  'seated cable row (close-grip)': {
    category: 'Back Thickness',
    primaryMuscle: 'Latissimus Dorsi & Rhomboids',
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Lower Traps'],
    difficulty: 'Beginner - Intermediate',
    tempo: '2-1-1-0 (Full lat stretch & pinch)',
    cultCoach: 'Coach Simran Khosla • Cult.fit Conditioning',
    cultClassTitle: 'Cult.fit Cable Power: Seated Row Clinic',
    cultBurnRate: '9.2 kcal/min',
    googleFitHeartPoints: '+14 Heart Pts',
    googleFitCategory: 'Selectorized Low-Pulley Horizontal Row',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Maintain an upright neutral spine; avoid swinging backward',
      'Pull V-bar attachment directly to navel and pinch shoulder blades',
      'Allow shoulders to stretch forward slightly at the full reach'
    ],
    mistakes: ['Leaning too far back to pull with bodyweight momentum', 'Shrugging shoulders upward'],
    animationType: 'rows',
    icon: '🚣',
    machine: {
      name: 'Low Pulley Seated Cable Row Station with V-Grip Handle',
      type: 'Selectorized Cable Station',
      gymZone: 'Zone C • Low Cable Station #1',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Station free with rubber foot plates and close-grip handle',
      pinSetup: 'Weight stack pin set to working load • Footplates secure',
      equipmentChecklist: ['Close-Grip V-Bar Attachment', 'Weight Stack Pin (40kg - 85kg)'],
      alternatives: [
        { name: 'Chest Supported T-Bar Row', zone: 'Zone D • Plate-Loaded', swapReason: 'Similar neutral grip with supported sternum' },
        { name: 'Single-Arm Dumbbell Row', zone: 'Zone A • Dumbbells', swapReason: 'Unilateral focus and larger range of motion' }
      ]
    }
  },
  'standing barbell bicep curl': {
    category: 'Arm Hypertrophy',
    primaryMuscle: 'Biceps Brachii (Long & Short Heads)',
    secondaryMuscles: ['Brachialis', 'Brachioradialis', 'Wrist Flexors'],
    difficulty: 'Beginner - Intermediate',
    tempo: '2-1-1-0 (Strict pivot, no momentum)',
    cultCoach: 'Coach Tarun Gill • Cult.fit Arms Specialist',
    cultClassTitle: 'Cult.fit 3D Biceps: Barbell Peak Power',
    cultBurnRate: '8.1 kcal/min',
    googleFitHeartPoints: '+11 Heart Pts',
    googleFitCategory: 'Isolated Elbow Flexion / Biceps Peak',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Keep elbows pinned firmly to ribs without drifting forward',
      'Curl bar in a smooth arc until biceps are fully shortened',
      'Lower under 3-second eccentric tension with full arm extension at bottom'
    ],
    mistakes: ['Swinging torso / using hip thrust momentum', 'Elbows lifting high at top'],
    animationType: 'bicep_curl',
    icon: '💪',
    machine: {
      name: 'Straight Olympic Barbell / Fixed Rubber Barbells (10kg-45kg)',
      type: 'Free Weight Barbell Rack',
      gymZone: 'Zone A • Fixed Barbells Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Full rack of pre-loaded barbells available',
      pinSetup: 'Standing open area with mirror alignment',
      equipmentChecklist: ['Fixed Barbell (20kg - 40kg) or Olympic Barbell with micro-plates', 'Arm Blaster (Optional)'],
      alternatives: [
        { name: 'Preacher Curl Bench & EZ Bar', zone: 'Zone A • Arm Station', swapReason: 'Locked upper arm position prevents cheating' },
        { name: 'Incline Dumbbell Bicep Curl', zone: 'Zone A • Dumbbell Bay', swapReason: 'Deep long head stretch from inclined shoulder position' }
      ]
    }
  },
  'incline dumbbell hammer curl': {
    category: 'Arms & Forearms',
    primaryMuscle: 'Brachialis & Brachioradialis',
    secondaryMuscles: ['Biceps Long Head', 'Wrist Extensors'],
    difficulty: 'Beginner',
    tempo: '2-1-1-0 (Neutral grip stretch)',
    cultCoach: 'Coach Rahul Shetty • Cult.fit Arms Master',
    cultClassTitle: 'Cult.fit Forearm & Bicep Thickness',
    cultBurnRate: '7.6 kcal/min',
    googleFitHeartPoints: '+10 Heart Pts',
    googleFitCategory: 'Neutral Grip Elbow Flexion / Brachialis',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Set incline bench to 60 degrees to maximize brachialis engagement',
      'Hold dumbbells with neutral thumbs-up hammer grip throughout',
      'Curl up smoothly without rotating wrists and lower slowly'
    ],
    mistakes: ['Rotating wrists into supination', 'Shoulder hiking at peak contraction'],
    animationType: 'hammer_curl',
    icon: '🔨',
    machine: {
      name: '60-Degree Incline Bench & Hex Dumbbells',
      type: 'Free Weight Incline Station',
      gymZone: 'Zone A • Dumbbell Bay #2',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Dumbbell pairs from 10kg to 24kg available',
      pinSetup: 'Bench Incline: 60° (Notch 4)',
      equipmentChecklist: ['Pair of Urethane / Rubber Hex Dumbbells (12kg - 20kg)'],
      alternatives: [
        { name: 'Standing Rope Cable Hammer Curl', zone: 'Zone C • Cable Tower', swapReason: 'Continuous cable tension throughout stroke' },
        { name: 'Preacher Hammer Curl', zone: 'Zone A • Preacher Pad', swapReason: 'Strict arm stabilization with neutral grip' }
      ]
    }
  },
  'barbell back squat': {
    category: 'Legs & Core',
    primaryMuscle: 'Quadriceps, Gluteus Maximus',
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Core Bracing'],
    difficulty: 'Intermediate - Advanced',
    tempo: '3-1-1-0 (Deep controlled descent)',
    cultCoach: 'Coach Simran Khosla • Cult.fit Lower Body Lead',
    cultClassTitle: 'Cult.fit Squat Mastery: Lower Body Power & Depth',
    cultBurnRate: '13.8 kcal/min',
    googleFitHeartPoints: '+24 Heart Pts',
    googleFitCategory: 'Primary Compound Knee Flexion & Hip Drive',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Brace abdominal 360° and take a deep breath into belly before drop',
      'Break at hips and knees simultaneously, tracking knees over toes',
      'Hit parallel or below, drive upward through midfoot'
    ],
    mistakes: ['Knees caving inward (valgus collapse)', 'Heels rising off ground during drive'],
    animationType: 'squat',
    icon: '🦵',
    machine: {
      name: 'Full Commercial Power Cage & Squat Rack (Hammer Strength)',
      type: 'Power Cage with Safety Spotter Arms',
      gymZone: 'Zone D • Power Cage Bay #2',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Cage #2 free with Olympic barbell racked',
      pinSetup: 'J-Hooks: Mid-Chest Height (Hole #11) • Safety Arms: 2 inches below squat depth (Hole #5)',
      equipmentChecklist: ['20kg Olympic Barbell', 'Weight Plates (1.25kg - 25kg)', '2x Locking Barbell Collars', 'Squat Wedge / Lifting Belt'],
      alternatives: [
        { name: '45-Degree Incline Leg Press', zone: 'Zone D • Plate-Loaded Bay', swapReason: 'Direct quad loading with back supported' },
        { name: 'Hack Squat Machine', zone: 'Zone D • Leg Arena', swapReason: 'Fixed 45-degree angle with superior knee stabilization' },
        { name: 'Smith Machine Squat', zone: 'Zone B • Machine Bay', swapReason: 'Stabilized vertical track' }
      ]
    }
  },
  '45-degree leg press': {
    category: 'Quad Mass & Glutes',
    primaryMuscle: 'Quadriceps (Vastus Lateralis, Medialis, Intermedius)',
    secondaryMuscles: ['Gluteus Maximus', 'Adductors', 'Hamstrings'],
    difficulty: 'Intermediate',
    tempo: '3-1-1-0 (Deep knee bend without butt lifting)',
    cultCoach: 'Coach Simran Khosla • Cult.fit Lower Body Lead',
    cultClassTitle: 'Cult.fit Heavy Sled: 45° Leg Press Hypertrophy',
    cultBurnRate: '12.5 kcal/min',
    googleFitHeartPoints: '+22 Heart Pts',
    googleFitCategory: 'Heavy Incline Sled Compound / Knee Extension',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Place feet shoulder-width apart in middle of platform',
      'Lower heavy sled until knees reach 90 degrees or slightly deeper',
      'Press through heels and midfoot without locking knees at lockout'
    ],
    mistakes: ['Hyperextending / locking out knees abruptly', 'Allowing pelvis / butt to round off back pad'],
    animationType: 'leg_press',
    icon: '🦵',
    machine: {
      name: 'Heavy-Duty 45° Linear Incline Leg Press (Cybex / Hammer Strength)',
      type: 'Linear Bearing Plate-Loaded Machine',
      gymZone: 'Zone D • Heavy Plate-Loaded Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: '45° Leg Press open with Olympic plates racked',
      pinSetup: 'Backrest Angle: 45° • Safety Stop Catch: Middle Slot (Notch #3)',
      equipmentChecklist: ['Olympic Weight Plates (20kg & 25kg plates)', 'Knee Sleeves (Optional)'],
      alternatives: [
        { name: 'Hack Squat Machine', zone: 'Zone D • Leg Arena', swapReason: 'Direct upright spine quad targeting' },
        { name: 'Barbell Back Squat', zone: 'Zone D • Power Cage', swapReason: 'Full functional athletic lower body recruitment' }
      ]
    }
  },
  'romanian deadlift (dumbbell)': {
    category: 'Hamstrings & Glutes',
    primaryMuscle: 'Hamstrings (Biceps Femoris & Semitendinosus)',
    secondaryMuscles: ['Gluteus Maximus', 'Erector Spinae', 'Grip'],
    difficulty: 'Intermediate',
    tempo: '3-1-1-0 (Deep hamstring stretch hinge)',
    cultCoach: 'Coach Vasudha Joshi • Cult.fit Transformation Coach',
    cultClassTitle: 'Cult.fit Posterior Chain: Dumbbell RDL Mechanics',
    cultBurnRate: '10.8 kcal/min',
    googleFitHeartPoints: '+17 Heart Pts',
    googleFitCategory: 'Hip Hinge Hypertrophy / Hamstrings & Glutes',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Maintain soft bend in knees and push hips straight back toward wall',
      'Glide dumbbells down close to shins until deep hamstring stretch is felt',
      'Drive hips forward and squeeze glutes hard at the standing lockout'
    ],
    mistakes: ['Rounding the lower back', 'Squatting down instead of hinging hips back'],
    animationType: 'deadlift',
    icon: '⚡',
    machine: {
      name: 'Heavy Dumbbells & Rubber Flooring Platform',
      type: 'Free Weight Dumbbell Station',
      gymZone: 'Zone A • Dumbbell Platform Area',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Heavy dumbbell pairs (24kg to 44kg) ready',
      pinSetup: 'Flat platform with clear 2-meter perimeter',
      equipmentChecklist: ['Pair of Heavy Urethane Dumbbells', 'Lifting Straps (Optional)'],
      alternatives: [
        { name: 'Barbell Romanian Deadlift', zone: 'Zone D • Platform #2', swapReason: 'Higher total load capacity with barbell' },
        { name: 'Lying Leg Curl Machine', zone: 'Zone B • Selectorized Bay', swapReason: 'Direct knee flexion isolation for hamstrings' }
      ]
    }
  },
  'leg extension machine': {
    category: 'Quad Isolation',
    primaryMuscle: 'Quadriceps Teardrop (Vastus Medialis Oblique & Rectus Femoris)',
    secondaryMuscles: ['Patellar Tendon Stabilizers'],
    difficulty: 'Beginner',
    tempo: '2-2-1-0 (2s Isometric peak quad hold)',
    cultCoach: 'Coach Vasudha Joshi • Cult.fit Strength Coach',
    cultClassTitle: 'Cult.fit Quad Definition: Leg Extension Squeeze',
    cultBurnRate: '8.6 kcal/min',
    googleFitHeartPoints: '+12 Heart Pts',
    googleFitCategory: 'Selectorized Knee Extension / Quad Definition',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Align knee joint pivot directly with the machine axis of rotation',
      'Position lower leg pad just above ankles / shoelaces',
      'Extend legs to full horizontal lockout and squeeze quads hard for 2 seconds'
    ],
    mistakes: ['Using momentum to kick weight up', 'Allowing butt to rise off seat pad'],
    animationType: 'leg_extension',
    icon: '⚡',
    machine: {
      name: 'Pin-Selected Leg Extension Machine (Life Fitness / Matrix)',
      type: 'Single-Joint Selectorized Leg Machine',
      gymZone: 'Zone B • Selectorized Machine Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Machine sanitized and ready for use',
      pinSetup: 'Back Pad: Hole #4 (Align knees with red pivot dot) • Shin Pad: Hole #3 (Above ankles)',
      equipmentChecklist: ['Weight Stack Selector Pin (30kg - 85kg)'],
      alternatives: [
        { name: 'Sissy Squat Bench', zone: 'Zone C • Functional Area', swapReason: 'Bodyweight quad overload in full extension' },
        { name: 'Spanish Squat with Heavy Resistance Band', zone: 'Zone C • Functional Turf', swapReason: 'High quad tendon isometric load' }
      ]
    }
  },
  'standing calf raises': {
    category: 'Calves',
    primaryMuscle: 'Gastrocnemius (Lateral & Medial Heads)',
    secondaryMuscles: ['Soleus', 'Achilles Tendon'],
    difficulty: 'Beginner',
    tempo: '2-2-1-0 (Full deep stretch & hold)',
    cultCoach: 'Coach Naveen Sharma • Cult.fit Lower Body',
    cultClassTitle: 'Cult.fit Calf Power: Standing Elevation',
    cultBurnRate: '7.2 kcal/min',
    googleFitHeartPoints: '+9 Heart Pts',
    googleFitCategory: 'Isolated Plantarflexion / Calf Hypertrophy',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Stand with balls of feet on edge of platform and heels hanging off',
      'Drop heels down for a full deep calf stretch for 2 seconds',
      'Drive onto balls of feet and contract calves as high as possible'
    ],
    mistakes: ['Bouncing up and down quickly using Achilles elastic recoil', 'Bending knees during drive'],
    animationType: 'calf_raise',
    icon: '🦶',
    machine: {
      name: 'Standing Calf Raise Machine (Selectorized or Plate-Loaded)',
      type: 'Selectorized Shoulder-Padded Calf Machine',
      gymZone: 'Zone B • Lower Body Machine Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Shoulder pads sanitized and open',
      pinSetup: 'Shoulder Pad Height: Notch #6 (shoulder level with straight legs)',
      equipmentChecklist: ['Machine Weight Stack Pin (50kg - 120kg)'],
      alternatives: [
        { name: 'Smith Machine Standing Calf Raise on Block', zone: 'Zone B • Smith Station', swapReason: 'Barbell loading across traps on wood block' },
        { name: 'Leg Press Calf Press', zone: 'Zone D • Leg Press Sled', swapReason: 'Seated angle removes spinal loading' }
      ]
    }
  },
  'overhead barbell military press': {
    category: 'Shoulders & Core',
    primaryMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Trapezius', 'Core'],
    difficulty: 'Intermediate',
    tempo: '2-1-1-0 (Straight vertical bar path)',
    cultCoach: 'Coach Rohit Kulkarni • Cult.fit Upper Body Coach',
    cultClassTitle: 'Cult.fit Overhead Power: Strict Military Press',
    cultBurnRate: '11.0 kcal/min',
    googleFitHeartPoints: '+17 Heart Pts',
    googleFitCategory: 'Vertical Pressing & Overhead Scapular Control',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Squeeze glutes and brace core to prevent lumbar hyperextension',
      'Press straight up, tucking chin back until bar clears forehead',
      'Lock bar out directly over crown of head and push head through window'
    ],
    mistakes: ['Arching lower back excessively', 'Pushing bar forward instead of vertical'],
    animationType: 'overhead_press',
    icon: '👑',
    machine: {
      name: 'Olympic Military Press Station / Standing Power Rack',
      type: 'Standing Free Weight Barbell Station',
      gymZone: 'Zone A • Shoulder & Press Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Station available with upright seat or standing platform',
      pinSetup: 'J-Cup Bar Rest: Armpit Height (Hole #9)',
      equipmentChecklist: ['20kg Olympic Barbell', 'Bumper / Cast Iron Plates', '2x Locking Collars'],
      alternatives: [
        { name: 'Seated Dumbbell Shoulder Press', zone: 'Zone A • Dumbbell Bay', swapReason: 'Individual shoulder balance & natural pressing arc' },
        { name: 'Hammer Strength Shoulder Press', zone: 'Zone D • Plate-Loaded Bay', swapReason: 'Iso-lateral convergent shoulder press' }
      ]
    }
  },
  'dumbbell lateral raises': {
    category: 'Shoulders Width',
    primaryMuscle: 'Lateral Deltoid (Side Delt)',
    secondaryMuscles: ['Anterior Deltoid', 'Upper Traps'],
    difficulty: 'Beginner - Intermediate',
    tempo: '2-1-1-0 (Lead with elbows)',
    cultCoach: 'Coach Rohit Kulkarni • Cult.fit Upper Body Coach',
    cultClassTitle: 'Cult.fit 3D Shoulders: Lateral Raise Mechanics',
    cultBurnRate: '7.9 kcal/min',
    googleFitHeartPoints: '+11 Heart Pts',
    googleFitCategory: 'Isolated Shoulder Abduction / Side Deltoids',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Tilt torso slightly forward 10° and keep slight bend in elbows',
      'Raise dumbbells out to sides leading with elbows until arms are parallel to floor',
      'Pour the pitcher at the top and control the descent slowly'
    ],
    mistakes: ['Swinging whole body using leg drive', 'Shrugging shoulders into ears'],
    animationType: 'lateral_raise',
    icon: '🦅',
    machine: {
      name: 'Urethane Dumbbells (6kg - 18kg) & Mirror Wall',
      type: 'Free Weight Dumbbell Area',
      gymZone: 'Zone A • Dumbbell Racks',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Light dumbbell rack open with full range of weights',
      pinSetup: 'Standing open area in front of mirror',
      equipmentChecklist: ['Matched Pair Dumbbells (6kg - 16kg)'],
      alternatives: [
        { name: 'Cable Single-Arm Lateral Raise', zone: 'Zone C • Low Cable', swapReason: 'Constant tension throughout bottom stretch range' },
        { name: 'Machine Lateral Raise (Nautilus/Matrix)', zone: 'Zone B • Shoulder Bay', swapReason: 'Direct elbow pad contact removes grip fatigue' }
      ]
    }
  },
  'reverse pec deck fly': {
    category: 'Rear Delts & Upper Back',
    primaryMuscle: 'Posterior Deltoid',
    secondaryMuscles: ['Rhomboids', 'Infraspinatus', 'Trapezius'],
    difficulty: 'Beginner',
    tempo: '2-1-1-0 (Hold rear contraction)',
    cultCoach: 'Coach Shwetambari Shetty • Cult.fit Master Trainer',
    cultClassTitle: 'Cult.fit Posture & Rear Delt Isolation',
    cultBurnRate: '8.0 kcal/min',
    googleFitHeartPoints: '+11 Heart Pts',
    googleFitCategory: 'Horizontal Shoulder Abduction / Rear Delts',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Sit facing machine with chest firmly against the pad',
      'Grip handles with neutral or overhand grip with elbows level with shoulders',
      'Drive arms backward in a wide arc and squeeze rear deltoids tightly'
    ],
    mistakes: ['Bending elbows excessively during stroke', 'Jerking chest off pad'],
    animationType: 'rear_fly',
    icon: '🦋',
    machine: {
      name: 'Dual Pec Deck & Rear Delt Machine (Life Fitness Pro2)',
      type: 'Pin-Selected Selectorized Machine',
      gymZone: 'Zone B • Selectorized Machine Bay #3',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Dual arms set to reverse fly notch',
      pinSetup: 'Seat Height: Hole #3 (Handles level with shoulder line) • Arm Setting: Notch #1 (Back position)',
      equipmentChecklist: ['Weight Stack Selector Pin (20kg - 60kg)'],
      alternatives: [
        { name: 'Incline Dumbbell Rear Delt Fly', zone: 'Zone A • Incline Bench', swapReason: 'Prone on 45° bench with free dumbbells' },
        { name: 'Face Pulls with Rope on Cable', zone: 'Zone C • Cable Tower', swapReason: 'External rotation combined with rear delt retraction' }
      ]
    }
  },
  'dumbbell shrugs': {
    category: 'Traps & Neck',
    primaryMuscle: 'Upper Trapezius',
    secondaryMuscles: ['Levator Scapulae', 'Forearm Grip'],
    difficulty: 'Beginner',
    tempo: '2-2-1-0 (2s Peak trap squeeze)',
    cultCoach: 'Coach Anupam • Cult.fit Power Coach',
    cultClassTitle: 'Cult.fit Trap Yoke: Dumbbell Shrug Masterclass',
    cultBurnRate: '8.5 kcal/min',
    googleFitHeartPoints: '+12 Heart Pts',
    googleFitCategory: 'Scapular Elevation / Upper Trapezius',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
    videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    cues: [
      'Hold heavy dumbbells at sides with neutral palms',
      'Elevate shoulders straight up toward ears in a clean vertical path',
      'Pause for 2 full seconds at peak contraction; do NOT roll shoulders'
    ],
    mistakes: ['Rolling shoulders in circular motion (causes neck/cervical strain)', 'Using leg bounce'],
    animationType: 'shrugs',
    icon: '🐂',
    machine: {
      name: 'Heavy Dumbbells or Trap Bar Shrug Station',
      type: 'Free Weight Dumbbell Area',
      gymZone: 'Zone A • Heavy Dumbbell Bay',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Heavy pairs (28kg to 50kg) open on lower tier',
      pinSetup: 'Standing position with chalk station nearby',
      equipmentChecklist: ['Heavy Dumbbell Pair (24kg - 40kg)', 'Lifting Straps'],
      alternatives: [
        { name: 'Barbell Shrugs (Smith Machine)', zone: 'Zone B • Smith Bay', swapReason: 'Heavy stable vertical bar glide' },
        { name: 'Trap Bar Shrugs', zone: 'Zone D • Platform #1', swapReason: 'Neutral grip with ideal center of gravity' }
      ]
    }
  }
};

/* Universal fallback generator for custom or unmapped exercises */
const getExerciseVisualMeta = (exerciseName, targetMuscle) => {
  const key = (exerciseName || '').toLowerCase().trim();
  
  if (EXERCISE_VISUALS[key]) {
    return EXERCISE_VISUALS[key];
  }

  // Fuzzy match keywords
  for (const [k, val] of Object.entries(EXERCISE_VISUALS)) {
    if (key.includes(k) || k.includes(key)) {
      return val;
    }
  }

  // Contextual smart generator
  let anim = 'bench_press';
  let coach = 'Coach Rishabh Telang • Cult.fit Master Trainer';
  let cat = 'Strength & Conditioning';
  let icon = '🏋️‍♂️';
  let img = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';

  if (key.includes('squat') || key.includes('leg') || key.includes('lunge')) {
    anim = 'squat';
    coach = 'Coach Simran Khosla • Cult.fit Lower Body Lead';
    cat = 'Lower Body & Quadriceps';
    icon = '🦵';
    img = 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80';
  } else if (key.includes('deadlift') || key.includes('hamstring') || key.includes('hinge')) {
    anim = 'deadlift';
    coach = 'Coach Anupam • Cult.fit Olympic Lead';
    cat = 'Posterior Chain & Hamstrings';
    icon = '⚡';
    img = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';
  } else if (key.includes('press') || key.includes('shoulder') || key.includes('deltoid')) {
    anim = 'overhead_press';
    coach = 'Coach Rohit Kulkarni • Cult.fit Shoulder Specialist';
    cat = 'Shoulders & Overhead Press';
    icon = '👑';
    img = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80';
  } else if (key.includes('pull') || key.includes('row') || key.includes('lat')) {
    anim = 'rows';
    coach = 'Coach Siddharth Rao • Cult.fit Back Specialist';
    cat = 'Back & Latissimus Dorsi';
    icon = '🧗‍♂️';
    img = 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80';
  } else if (key.includes('curl') || key.includes('bicep') || key.includes('arm')) {
    anim = 'bicep_curl';
    coach = 'Coach Tarun Gill • Cult.fit Arms Master';
    cat = 'Arms & Biceps Hypertrophy';
    icon = '💪';
    img = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80';
  }

  return {
    category: targetMuscle || cat,
    primaryMuscle: targetMuscle || 'Primary Muscle Group',
    secondaryMuscles: ['Synergist Stabilizers', 'Core'],
    difficulty: 'Intermediate',
    tempo: '3-1-1-0 (Cult.fit Optimal Tempo)',
    cultCoach: coach,
    cultClassTitle: `Cult.fit Live: ${exerciseName || 'Strength Protocol'}`,
    cultBurnRate: '9.5 kcal/min',
    googleFitHeartPoints: '+14 Heart Pts',
    googleFitCategory: 'Compound Strength / Google Fit Verified',
    imageUrl: img,
    videoPoster: img,
    cues: [
      'Maintain continuous core bracing throughout the full range of motion.',
      'Control the 3-second eccentric lowering phase for maximum muscle stimulation.',
      'Execute explosive concentric contraction with proper breathing.'
    ],
    mistakes: ['Using excessive momentum or body sway', 'Cutting short the full range of motion'],
    animationType: anim,
    icon: icon,
    machine: {
      name: `${exerciseName || 'Standard Gym'} Station`,
      type: 'Commercial Gym Apparatus',
      gymZone: 'Zone A • Main Gym Floor',
      availability: 'Available Now',
      status: 'free',
      occupancyNote: 'Equipment sanitized and available on gym floor',
      pinSetup: 'Adjust seat and safety pins to match arm length and torso height',
      equipmentChecklist: ['Working Load Plates / Dumbbells', 'Safety Collars', 'Towel & Sanitizer'],
      alternatives: [
        { name: `Dumbbell Alternative for ${exerciseName}`, zone: 'Zone A • Dumbbell Bay', swapReason: 'Free range movement' },
        { name: `Cable Alternative for ${exerciseName}`, zone: 'Zone C • Cable Towers', swapReason: 'Constant resistance tension' }
      ]
    }
  };
};

export const WorkoutVideoDemonstrator = ({
  workoutDay,
  initialExerciseIndex = 0,
  onClose,
  isModal = false
}) => {
  const { user } = useAuth();
  const { showToast } = useFitness();

  const exercises = workoutDay?.exercises || [];
  const [currentIndex, setCurrentIndex] = useState(initialExerciseIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repCount, setRepCount] = useState(1);
  const [phase, setPhase] = useState('Eccentric (Lowering)');
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Tab View Modes: Cult.fit Video Stream vs Google Fit Biomechanics vs Required Gym Machine
  const [mediaSource, setMediaSource] = useState('cult'); // 'cult' | 'google_fit' | 'machine'
  const [audioMuted, setAudioMuted] = useState(false);

  // Sync index when parent changes active exercise step
  useEffect(() => {
    if (initialExerciseIndex !== undefined && initialExerciseIndex >= 0 && initialExerciseIndex < (exercises.length || 1)) {
      setCurrentIndex(initialExerciseIndex);
      setRepCount(1);
    }
  }, [initialExerciseIndex]);

  const currentExercise = exercises[currentIndex] || {
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'Chest (Mid/Lower)',
    sets: 4,
    reps: '6-8',
    weight: '80 kg',
    instructions: 'Arch lower back slightly, retract scapulae, lower bar to mid-chest, drive up explosively.'
  };

  const visualMeta = getExerciseVisualMeta(currentExercise.name, currentExercise.targetMuscle);
  const machine = visualMeta.machine;

  // User Profile Tailoring
  const userGoal = user?.primaryGoal || 'Bulking';
  const userWeight = user?.weight || '76 kg';
  const userName = user?.name || 'Alex Mercer';

  const personalizedAdvice = (() => {
    if (userGoal.toLowerCase().includes('bulk')) {
      return {
        badge: 'Cult.fit Bulking Protocol — Hypertrophy & Muscle Mass',
        setsTarget: `${currentExercise.sets || 4} Sets × ${currentExercise.reps || '6-8'} Reps`,
        tempoNote: 'Slow 3-second eccentric to trigger maximum myofibrillar hypertrophy.',
        loadTip: `Recommended load: ${currentExercise.weight || '80% 1RM'}. Prioritize progressive overload.`
      };
    } else if (userGoal.toLowerCase().includes('cut')) {
      return {
        badge: 'Cult.fit Cutting Protocol — High Metabolic Density',
        setsTarget: `${currentExercise.sets || 3} Sets × 12-15 Reps`,
        tempoNote: 'Short rest intervals (45-60s) to keep heart rate elevated and burn fat.',
        loadTip: 'Strict time-under-tension to preserve lean muscle tissue in caloric deficit.'
      };
    } else {
      return {
        badge: 'Google Fit Strength & Conditioning Protocol',
        setsTarget: `${currentExercise.sets || 4} Sets × 8-10 Reps`,
        tempoNote: 'Explosive concentric drive with full joint stabilization.',
        loadTip: 'Optimal neuromuscular firing and athletic joint balance.'
      };
    }
  })();

  // Motion Loop Animation Timer
  useEffect(() => {
    if (!isPlaying) return;
    let animFrame;
    let startTime = performance.now();
    const cycleDuration = 3400 / playbackSpeed;

    const loop = (now) => {
      const elapsed = (now - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;
      setPhaseProgress(progress);

      if (progress < 0.55) {
        setPhase('Eccentric (Lowering & Stretch)');
      } else if (progress < 0.72) {
        setPhase('Peak Contraction (Squeeze)');
      } else {
        setPhase('Concentric (Power Drive)');
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, playbackSpeed, currentIndex]);

  // Rep counter ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRepCount(prev => (prev >= 8 ? 1 : prev + 1));
    }, 3400 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleNextEx = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRepCount(1);
    }
  };

  const handlePrevEx = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setRepCount(1);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER 1: AUTHENTIC CULT.FIT VIDEO STREAM DEMONSTRATION
     ───────────────────────────────────────────────────────────── */
  const renderCultFitVideoStream = () => {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '270px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0a0d14',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)'
      }}>
        {/* Background Exercise Motion Visual / Poster Image */}
        <img
          src={visualMeta.imageUrl}
          alt={currentExercise.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.55) contrast(1.15)',
            transform: isPlaying ? `scale(${1 + (Math.sin(phaseProgress * Math.PI) * 0.04)})` : 'scale(1)',
            transition: 'transform 0.2s ease-out'
          }}
        />

        {/* Ambient Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(10,13,20,0.4) 40%, rgba(10,13,20,0.92) 100%)'
        }} />

        {/* Cult.fit Live Watermark & Channel Header */}
        <div style={{
          position: 'absolute', top: '12px', left: '14px', right: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', gap: '5px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
              cult.fit LIVE
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {visualMeta.cultClassTitle}
            </div>
          </div>

          {/* Telemetry Stats: Burn Rate & Heart Zone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <Flame size={12} />
              {visualMeta.cultBurnRate}
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <Heart size={12} />
              138 BPM
            </div>
          </div>
        </div>

        {/* Center Play Overlay / Rep Count Pulse */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 3
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(249, 115, 22, 0.6)',
            borderRadius: '50%',
            width: '70px', height: '70px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(249, 115, 22, 0.35)'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>
              REP
            </span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              {repCount}
            </span>
            <span style={{ fontSize: '9px', color: '#94a3b8' }}>
              / {currentExercise.reps || 8}
            </span>
          </div>

          <div style={{
            marginTop: '10px',
            background: 'rgba(0,0,0,0.7)',
            padding: '3px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#f97316'
          }}>
            {phase}
          </div>
        </div>

        {/* Cult Coach Bar Footer */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '14px', right: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#f97316', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 900
            }}>
              C
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff' }}>
                {visualMeta.cultCoach}
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                Form: {visualMeta.tempo}
              </div>
            </div>
          </div>

          {/* Audio & Fullscreen Quick Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => {
                setAudioMuted(!audioMuted);
                showToast(audioMuted ? 'Coach voice cues unmuted 🔊' : 'Coach voice muted 🔇', 'info');
              }}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER 2: GOOGLE FIT BIOMECHANICAL ANATOMY & KINEMATICS
     ───────────────────────────────────────────────────────────── */
  const renderGoogleFitBiomechanics = () => {
    const strokeY = Math.sin(phaseProgress * Math.PI);
    const animType = visualMeta.animationType || 'bench_press';

    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '270px',
        background: 'radial-gradient(circle at center, #091e3a 0%, #050b14 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Precision Coordinate Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.8
        }} />

        {/* Google Fit Branding Header */}
        <div style={{
          position: 'absolute', top: '12px', left: '14px', right: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#60a5fa',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
              Google Fit Biomechanics AI
            </div>

            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px', fontWeight: 700
            }}>
              {visualMeta.googleFitHeartPoints}
            </span>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '3px 8px',
            fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)'
          }}>
            Score: <span style={{ color: '#10b981' }}>98% Strict Form</span>
          </div>
        </div>

        {/* Biomechanical Anatomy SVG Canvas */}
        <svg viewBox="0 0 320 180" style={{ width: '90%', height: '75%', zIndex: 2 }}>
          <defs>
            <filter id="gf-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gf-active" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="gf-muscle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* SQUAT BIOMECHANICS */}
          {animType === 'squat' && (() => {
            const hipY = 85 + (strokeY * 42);
            const kneeX = 135 + (strokeY * 16);
            const barY = 48 + (strokeY * 42);

            return (
              <g>
                <line x1="55" y1="20" x2="55" y2="165" stroke="#334155" strokeWidth="4" />
                <line x1="265" y1="20" x2="265" y2="165" stroke="#334155" strokeWidth="4" />
                <line x1="40" y1="165" x2="280" y2="165" stroke="#475569" strokeWidth="4" />

                <circle cx="160" cy={barY - 14} r="11" fill="#38bdf8" stroke="#94a3b8" />
                <line x1="160" y1={barY} x2="160" y2={hipY} stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />
                
                {/* Active Quad Heatmap */}
                <path d={`M 154 ${hipY} Q ${kneeX - 6} ${hipY + 22} 145 160`} fill="none" stroke="url(#gf-muscle)" strokeWidth="10" strokeLinecap="round" filter="url(#gf-glow)" />
                <path d={`M 166 ${hipY} Q ${kneeX + 34} ${hipY + 22} 175 160`} fill="none" stroke="url(#gf-muscle)" strokeWidth="10" strokeLinecap="round" filter="url(#gf-glow)" />

                {/* Knee Angle Indicator */}
                <circle cx={kneeX - 6} cy={hipY + 22} r="4" fill="#f59e0b" />
                <circle cx={kneeX + 34} cy={hipY + 22} r="4" fill="#f59e0b" />

                <line x1="70" y1={barY} x2="250" y2={barY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                <rect x="80" y={barY - 20} width="10" height="40" rx="2" fill="#10b981" />
                <rect x="230" y={barY - 20} width="10" height="40" rx="2" fill="#10b981" />
              </g>
            );
          })()}

          {/* DEADLIFT BIOMECHANICS */}
          {animType === 'deadlift' && (() => {
            const barY = 150 - (strokeY * 65);
            const hipY = 130 - (strokeY * 35);
            const headY = 85 - (strokeY * 45);

            return (
              <g>
                <rect x="35" y="160" width="250" height="8" rx="2" fill="#1e293b" stroke="#334155" />
                <circle cx="160" cy={headY} r="11" fill="#38bdf8" stroke="#94a3b8" />
                <line x1="160" y1={headY + 12} x2="160" y2={hipY} stroke="url(#gf-muscle)" strokeWidth="14" strokeLinecap="round" filter="url(#gf-glow)" />

                <line x1="154" y1={hipY} x2="145" y2="160" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
                <line x1="166" y1={hipY} x2="175" y2="160" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />

                <line x1="160" y1={headY + 16} x2="135" y2={barY} stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="160" y1={headY + 16} x2="185" y2={barY} stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />

                <line x1="65" y1={barY} x2="255" y2={barY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                <circle cx="80" cy={barY} r="20" fill="#10b981" />
                <circle cx="240" cy={barY} r="20" fill="#10b981" />
              </g>
            );
          })()}

          {/* DEFAULT BENCH / GENERAL PRESS */}
          {animType !== 'squat' && animType !== 'deadlift' && (() => {
            const barY = 55 + (strokeY * 38);
            const elbowX = 135 + (strokeY * 8);
            const elbowY = 90 + (strokeY * 16);

            return (
              <g>
                <rect x="45" y="115" width="210" height="10" rx="3" fill="#1e293b" stroke="#334155" />
                <circle cx="95" cy="100" r="11" fill="#38bdf8" stroke="#64748b" />
                <rect x="105" y="98" width="75" height="18" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />

                {/* Primary Muscle Glow (Pecs / Delts) */}
                <path d="M 120 100 Q 140 92 155 100 Q 140 114 120 100 Z" fill="url(#gf-muscle)" filter="url(#gf-glow)" opacity={phase.includes('Peak') ? 1 : 0.8} />

                <line x1="130" y1="102" x2={elbowX} y2={elbowY} stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
                <line x1={elbowX} y1={elbowY} x2="142" y2={barY} stroke="#0ea5e9" strokeWidth="4.5" strokeLinecap="round" />

                <circle cx={elbowX} cy={elbowY} r="4" fill="#f59e0b" />
                <circle cx="142" cy={barY} r="4.5" fill="#f8fafc" />

                <line x1="55" y1={barY} x2="225" y2={barY} stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                <rect x="65" y={barY - 18} width="8" height="36" rx="2" fill="#10b981" />
                <rect x="205" y={barY - 18} width="8" height="36" rx="2" fill="#10b981" />
              </g>
            );
          })()}
        </svg>

        {/* Real-time Biomechanics Phase Tag */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '14px', right: '14px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '6px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="#38bdf8" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Kinematics: {phase}
            </span>
          </div>

          <div style={{
            width: '90px', height: '6px', borderRadius: '3px',
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.round(phaseProgress * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #10b981)',
              transition: 'width 0.05s linear'
            }} />
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER 3: GYM PREMISES MACHINE AVAILABILITY & SETUP GUIDE
     ───────────────────────────────────────────────────────────── */
  const renderGymMachineGuide = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Machine Hero Identification Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'var(--cyan)', color: '#0b0f19',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px'
              }}>
                🏗️
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Gym Apparatus Station
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '1px 0 0' }}>
                  {machine.name}
                </h4>
              </div>
            </div>

            {/* Realtime Live Status */}
            <span style={{
              fontSize: '11px', fontWeight: 800,
              background: machine.status === 'free' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
              border: `1px solid ${machine.status === 'free' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
              color: machine.status === 'free' ? 'var(--primary)' : 'var(--amber)',
              borderRadius: '99px', padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: machine.status === 'free' ? 'var(--primary)' : 'var(--amber)'
              }} />
              {machine.availability}
            </span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            fontSize: '12px', color: 'var(--text-secondary)',
            padding: '8px 12px', background: 'var(--bg-surface)',
            borderRadius: '10px', marginTop: '10px'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block', fontWeight: 700 }}>PREMISES LOCATION</span>
              <b style={{ color: 'var(--text-primary)' }}>📍 {machine.gymZone}</b>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block', fontWeight: 700 }}>ZONE STATUS</span>
              <span style={{ color: 'var(--cyan)' }}>{machine.occupancyNote}</span>
            </div>
          </div>
        </div>

        {/* Pin Calibration Card */}
        <div className="card" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Compass size={15} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
              📐 Machine Pin & Seat Calibration Guide
            </span>
          </div>
          <div style={{
            background: 'var(--bg-surface)', padding: '10px 12px',
            borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)',
            lineHeight: 1.5, fontWeight: 600
          }}>
            {machine.pinSetup}
          </div>
        </div>

        {/* Equipment Checklist */}
        <div className="card" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldCheck size={15} color="var(--cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>
              📦 Required Accessories Checklist
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {(machine.equipmentChecklist || []).map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 10px', background: 'var(--bg-surface)',
                borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)'
              }}>
                <CheckCircle2 size={13} color="var(--primary)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Machine Swaps */}
        {machine.alternatives && machine.alternatives.length > 0 && (
          <div className="card" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>
                🔄 In-Gym Machine Alternatives
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Targeting identical muscle groups
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {machine.alternatives.map((alt, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'var(--bg-surface)',
                  borderRadius: '10px', border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {alt.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      📍 {alt.zone} &bull; {alt.swapReason}
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Selected alternative: ${alt.name} in ${alt.zone}!`, 'info')}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '10px', padding: '3px 8px', height: '26px' }}
                  >
                    Use Machine
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{
      padding: isModal ? '24px' : '18px',
      background: 'var(--bg-card)',
      border: '1px solid rgba(16,185,129,0.3)',
      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
      position: 'relative'
    }}>
      {/* Title Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="badge badge-fitness" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={11} />
              CULT.FIT & GOOGLE FIT LABS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Exercise {currentIndex + 1} of {exercises.length || 1}
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {visualMeta.icon} {currentExercise.name}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Target: <b style={{ color: 'var(--primary)' }}>{visualMeta.primaryMuscle}</b> &bull; {currentExercise.targetMuscle}
          </p>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Media Source Selector: Cult.fit Video vs Google Fit AI vs Gym Machine */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
        background: 'var(--bg-surface)', padding: '4px',
        borderRadius: '12px', marginBottom: '14px',
        border: '1px solid var(--border-color)'
      }}>
        <button
          type="button"
          onClick={() => setMediaSource('cult')}
          style={{
            padding: '8px 6px', borderRadius: '9px', border: 'none',
            background: mediaSource === 'cult' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'transparent',
            color: mediaSource === 'cult' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800, fontSize: '11px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🔥</span>
          <span>cult.fit Video</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaSource('google_fit')}
          style={{
            padding: '8px 6px', borderRadius: '9px', border: 'none',
            background: mediaSource === 'google_fit' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
            color: mediaSource === 'google_fit' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800, fontSize: '11px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🔵</span>
          <span>Google Fit AI</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaSource('machine')}
          style={{
            padding: '8px 6px', borderRadius: '9px', border: 'none',
            background: mediaSource === 'machine' ? 'linear-gradient(135deg, var(--cyan), #0891b2)' : 'transparent',
            color: mediaSource === 'machine' ? '#0b0f19' : 'var(--text-secondary)',
            fontWeight: 800, fontSize: '11px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🏋️</span>
          <span>Gym Machine</span>
        </button>
      </div>

      {/* Active Tab Content */}
      {mediaSource === 'cult' && (
        <>
          {renderCultFitVideoStream()}

          {/* Interactive Player Controls */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '12px', padding: '8px 12px',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: isPlaying ? 'rgba(249,115,22,0.2)' : '#f97316',
                  border: 'none',
                  color: isPlaying ? '#f97316' : '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                onClick={() => setRepCount(1)}
                title="Reset Rep Counter"
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'transparent', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <RotateCcw size={15} />
              </button>

              <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px' }}>
                {[0.5, 1, 1.5].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      padding: '3px 8px', borderRadius: '6px', border: 'none',
                      background: playbackSpeed === spd ? '#f97316' : 'transparent',
                      color: playbackSpeed === spd ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '10px', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Cult Video Stream HD 1080p
            </div>
          </div>
        </>
      )}

      {mediaSource === 'google_fit' && (
        <>
          {renderGoogleFitBiomechanics()}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '12px', padding: '8px 12px',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: isPlaying ? 'rgba(59,130,246,0.2)' : '#3b82f6',
                  border: 'none',
                  color: isPlaying ? '#60a5fa' : '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Google Fit Joint Kinematics Tracker
              </span>
            </div>

            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>
              {visualMeta.googleFitCategory}
            </span>
          </div>
        </>
      )}

      {mediaSource === 'machine' && renderGymMachineGuide()}

      {/* Form Cues & Muscle Breakdown (Shown under both video & google fit tabs) */}
      {mediaSource !== 'machine' && (
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Form Cues */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                🎯 Form & Biomechanical Cues (Cult.fit & Google Fit)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--cyan)', fontWeight: 700 }}>
                Tempo: {visualMeta.tempo}
              </span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {visualMeta.cues.map((cue, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {cue}
                </li>
              ))}
            </ul>
          </div>

          {/* Muscle Activation Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '10px 12px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                ⚡ Primary Muscle
              </span>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {visualMeta.primaryMuscle}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {personalizedAdvice.tempoNote}
              </div>
            </div>

            <div style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '10px',
              padding: '10px 12px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                🛡️ Synergists & Assist
              </span>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {visualMeta.secondaryMuscles.join(', ')}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {personalizedAdvice.loadTip}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Navigation Footer */}
      {exercises.length > 1 && (
        <div style={{
          marginTop: '16px', paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <button
            onClick={handlePrevEx}
            disabled={currentIndex === 0}
            className="btn btn-sm btn-outline"
            style={{
              gap: '6px', fontSize: '11px',
              opacity: currentIndex === 0 ? 0.4 : 1,
              cursor: currentIndex === 0 ? 'default' : 'pointer'
            }}
          >
            <ChevronLeft size={15} />
            Previous Exercise
          </button>

          {/* Quick exercise dots selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {exercises.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setRepCount(1); }}
                style={{
                  width: currentIndex === i ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentIndex === i ? 'var(--primary)' : 'var(--border-color)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNextEx}
            disabled={currentIndex === exercises.length - 1}
            className="btn btn-sm btn-primary"
            style={{
              gap: '6px', fontSize: '11px',
              opacity: currentIndex === exercises.length - 1 ? 0.4 : 1,
              cursor: currentIndex === exercises.length - 1 ? 'default' : 'pointer'
            }}
          >
            Next Exercise
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
