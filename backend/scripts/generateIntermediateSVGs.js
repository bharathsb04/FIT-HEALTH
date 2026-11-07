/**
 * Generates all 33 individual, exercise-specific demonstration SVG assets for the
 * Fit Health Intermediate 7-Day Workout Plan.
 * Each SVG contains:
 * - 800x450 16:9 responsive viewBox
 * - Dark theme background with subtle gym grid and floor horizon
 * - Detailed lifter figure with anatomical posture and exercise equipment (barbells, dumbbells, cable pulleys, benches)
 * - Movement arrows and range of motion vectors
 * - Target muscle glow and biomechanical cues
 * - Category badge, level badge, and equipment labels
 */

const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../../frontend/public/exercises/intermediate');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to wrap SVG in standard canvas
function buildSvg({
  filename,
  exerciseName,
  dayTag,
  targetMuscle,
  equipment,
  tempoCue,
  figureSvg,
  motionArrows = '',
  accentColor = '#f59e0b', // Amber/Yellow accent as requested
  accentGlow = 'rgba(245, 158, 11, 0.25)',
  secondaryAccent = '#10b981' // Emerald brand accent
}) {
  const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c14"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>

    <!-- Floor Horizon Radial -->
    <radialGradient id="floorSpot" cx="50%" cy="85%" r="60%">
      <stop offset="0%" stop-color="${accentGlow}"/>
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0)"/>
    </radialGradient>

    <!-- Equipment Steel Gradient -->
    <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="40%" stop-color="#cbd5e1"/>
      <stop offset="70%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <!-- Knurled Barbell / Plate Gradient -->
    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="35%" stop-color="#334155"/>
      <stop offset="65%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Lifter Muscle Gradient -->
    <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Active Muscle Target Glow Gradient -->
    <linearGradient id="activeMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="${accentColor}"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Arrow Marker -->
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${accentColor}"/>
    </marker>
    <marker id="arrowSec" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${secondaryAccent}"/>
    </marker>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="450" fill="url(#bgGrad)"/>
  
  <!-- Subtle Gym Grid Lines -->
  <g stroke="rgba(255, 255, 255, 0.03)" stroke-width="1">
    <line x1="0" y1="90" x2="800" y2="90"/>
    <line x1="0" y1="180" x2="800" y2="180"/>
    <line x1="0" y1="270" x2="800" y2="270"/>
    <line x1="0" y1="360" x2="800" y2="360"/>
    <line x1="160" y1="0" x2="160" y2="450"/>
    <line x1="320" y1="0" x2="320" y2="450"/>
    <line x1="480" y1="0" x2="480" y2="450"/>
    <line x1="640" y1="0" x2="640" y2="450"/>
  </g>

  <!-- Floor Spotlight Glow -->
  <ellipse cx="400" cy="385" rx="340" ry="50" fill="url(#floorSpot)"/>
  <line x1="60" y1="385" x2="740" y2="385" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" stroke-dasharray="8 6"/>

  <!-- Top Header Badges -->
  <g transform="translate(36, 32)">
    <!-- Day & Level Tag -->
    <rect x="0" y="0" width="165" height="26" rx="13" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1"/>
    <circle cx="12" cy="13" r="4" fill="${accentColor}"/>
    <text x="24" y="17" fill="#fef3c7" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1">${dayTag.toUpperCase()}</text>

    <!-- Intermediate Level Pill -->
    <rect x="175" y="0" width="115" height="26" rx="13" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1"/>
    <text x="187" y="17" fill="#6ee7b7" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">INTERMEDIATE</text>
  </g>

  <!-- Equipment & Tempo Badges (Top Right) -->
  <g transform="translate(510, 32)">
    <rect x="0" y="0" width="254" height="26" rx="13" fill="rgba(30, 41, 59, 0.7)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
    <text x="12" y="17" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600">⚙️ ${equipment}</text>
  </g>

  <!-- Central Visual Figure & Rigging -->
  <g id="figure-and-rig" transform="translate(0, 0)">
    ${figureSvg}
  </g>

  <!-- Motion & Trajectory Arrows -->
  <g id="motion-paths">
    ${motionArrows}
  </g>

  <!-- Bottom Info Overlay Bar -->
  <g transform="translate(36, 376)">
    <!-- Exercise Title -->
    <text x="0" y="24" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" letter-spacing="0.5">${exerciseName}</text>
    
    <!-- Target Muscle Highlight -->
    <g transform="translate(0, 32)">
      <text x="0" y="18" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">TARGET:</text>
      <rect x="58" y="5" width="${targetMuscle.length * 8 + 20}" height="20" rx="4" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1"/>
      <text x="68" y="19" fill="#fde68a" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">${targetMuscle.toUpperCase()}</text>
    </g>

    <!-- Tempo / Form Guide Cue (Right aligned) -->
    <g transform="translate(728, 20)">
      <text x="0" y="0" text-anchor="end" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">⚡ ${tempoCue}</text>
      <text x="0" y="22" text-anchor="end" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="500">Fit Health • Form Certified</text>
    </g>
  </g>
</svg>`;

  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Building 33 intermediate exercise demonstration SVGs...');

// ==========================================
// DAY 1: CHEST (5 Exercises)
// ==========================================

// 1. Barbell Bench Press
buildSvg({
  filename: 'barbell_bench_press.svg',
  exerciseName: 'Barbell Bench Press',
  dayTag: 'Day 1 • Chest',
  targetMuscle: 'Pectoralis Major & Triceps',
  equipment: 'Olympic Barbell & Bench',
  tempoCue: 'Tempo 3-1-1-0 • Arch & Retract',
  figureSvg: `
    <!-- Flat Bench Rig -->
    <rect x="250" y="310" width="300" height="24" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="290" y="334" width="20" height="52" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <rect x="490" y="334" width="20" height="52" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <!-- Upright Rack Posts -->
    <rect x="300" y="150" width="16" height="180" fill="#334155" stroke="#475569" stroke-width="1.5"/>
    <rect x="484" y="150" width="16" height="180" fill="#334155" stroke="#475569" stroke-width="1.5"/>
    <path d="M 296 220 L 320 220" stroke="#f59e0b" stroke-width="4"/>
    <path d="M 480 220 L 504 220" stroke="#f59e0b" stroke-width="4"/>

    <!-- Lifter Torso (Supine on Bench) -->
    <ellipse cx="400" cy="298" rx="75" ry="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <!-- Chest Muscle Highlight (Active) -->
    <ellipse cx="400" cy="296" rx="42" ry="12" fill="url(#activeMuscle)"/>
    <!-- Head on pad -->
    <circle cx="280" cy="296" r="16" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
    <!-- Bent Legs / Feet on floor -->
    <path d="M 470 300 L 520 330 L 530 385" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Lifter Arms Driving Upward -->
    <path d="M 370 295 L 350 240 L 350 185" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 430 295 L 450 240 L 450 185" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Olympic Barbell -->
    <rect x="220" y="180" width="360" height="10" rx="4" fill="url(#steelGrad)" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Knurling center marks -->
    <line x1="360" y1="180" x2="360" y2="190" stroke="#475569" stroke-width="2"/>
    <line x1="440" y1="180" x2="440" y2="190" stroke="#475569" stroke-width="2"/>
    <!-- Left Weight Plates (20kg + 10kg) -->
    <rect x="240" y="135" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#64748b" stroke-width="1.5"/>
    <rect x="226" y="145" width="12" height="80" rx="2" fill="url(#plateGrad)" stroke="#475569" stroke-width="1"/>
    <!-- Right Weight Plates (20kg + 10kg) -->
    <rect x="544" y="135" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#64748b" stroke-width="1.5"/>
    <rect x="562" y="145" width="12" height="80" rx="2" fill="url(#plateGrad)" stroke="#475569" stroke-width="1"/>
  `,
  motionArrows: `
    <!-- Upward Drive Vectors -->
    <path d="M 350 230 L 350 170" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
    <path d="M 450 230 L 450 170" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 2. Incline Dumbbell Press
buildSvg({
  filename: 'incline_dumbbell_press.svg',
  exerciseName: 'Incline Dumbbell Press',
  dayTag: 'Day 1 • Chest',
  targetMuscle: 'Upper Clavicular Pectoralis',
  equipment: 'Adjustable Bench (30°) & Dumbbells',
  tempoCue: '30° Angle • Full Stretch at Bottom',
  figureSvg: `
    <!-- Incline Bench (30-degree incline) -->
    <line x1="280" y1="340" x2="450" y2="240" stroke="#1e293b" stroke-width="26" stroke-linecap="round"/>
    <rect x="250" y="340" width="50" height="16" rx="4" fill="#334155"/>
    <rect x="360" y="320" width="16" height="65" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>

    <!-- Seated Lifter Torso (Reclined 30°) -->
    <line x1="300" y1="330" x2="430" y2="250" stroke="#1e293b" stroke-width="22" stroke-linecap="round"/>
    <!-- Upper Chest Activation Glow -->
    <line x1="360" y1="290" x2="420" y2="255" stroke="url(#activeMuscle)" stroke-width="16" stroke-linecap="round"/>
    <circle cx="450" cy="235" r="16" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
    <!-- Feet flat on floor -->
    <path d="M 300 340 L 270 385" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>

    <!-- Left & Right Dumbbell Arms Pressing Up & In -->
    <path d="M 380 270 L 350 210 L 340 160" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 410 260 L 440 205 L 430 155" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Left Dumbbell -->
    <rect x="315" y="152" width="50" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="310" y="138" width="10" height="36" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="360" y="138" width="10" height="36" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>

    <!-- Right Dumbbell -->
    <rect x="405" y="148" width="50" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="400" y="134" width="10" height="36" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="450" y="134" width="10" height="36" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 330 200 Q 335 175 340 155" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
    <path d="M 450 195 Q 440 170 430 150" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 3. Dumbbell Chest Fly
buildSvg({
  filename: 'dumbbell_chest_fly.svg',
  exerciseName: 'Dumbbell Chest Fly',
  dayTag: 'Day 1 • Chest',
  targetMuscle: 'Sternal Pectoralis Adduction',
  equipment: 'Flat Bench & Dumbbells (Pair)',
  tempoCue: 'Slight Elbow Bend • Deep Pec Hugging Arc',
  figureSvg: `
    <!-- Flat Bench -->
    <rect x="330" y="240" width="140" height="145" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <!-- Lifter Body Top-Down / High-Angle View -->
    <ellipse cx="400" cy="290" rx="50" ry="80" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <!-- Head -->
    <circle cx="400" cy="200" r="18" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
    <!-- Glowing Pectorals Adducting -->
    <path d="M 370 260 Q 400 280 430 260 Q 400 295 370 260 Z" fill="url(#activeMuscle)"/>

    <!-- Left Arm in Wide Fly Arc -->
    <path d="M 365 260 Q 280 250 250 220" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
    <!-- Left Dumbbell -->
    <rect x="225" y="215" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="260" y="215" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="235" y="232" width="30" height="8" fill="url(#steelGrad)"/>

    <!-- Right Arm in Wide Fly Arc -->
    <path d="M 435 260 Q 520 250 550 220" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
    <!-- Right Dumbbell -->
    <rect x="525" y="215" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="560" y="215" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="535" y="232" width="30" height="8" fill="url(#steelGrad)"/>
  `,
  motionArrows: `
    <!-- Hugging Convergence Motion Arcs -->
    <path d="M 260 210 Q 330 180 380 200" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
    <path d="M 540 210 Q 470 180 420 200" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 4. Dumbbell Pullover
buildSvg({
  filename: 'dumbbell_pullover.svg',
  exerciseName: 'Dumbbell Pullover',
  dayTag: 'Day 1 • Chest',
  targetMuscle: 'Upper Chest, Serratus & Lats',
  equipment: 'Cross-Bench & Heavy Dumbbell',
  tempoCue: 'Cross-Bench Pivot • Deep Ribcage Expansion',
  figureSvg: `
    <!-- Perpendicular Bench Support -->
    <rect x="360" y="280" width="80" height="90" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <rect x="390" y="370" width="20" height="15" fill="#0f172a"/>

    <!-- Lifter Upper Back on Bench, Hips Lowered -->
    <path d="M 290 340 Q 360 300 400 285 Q 430 285 450 300" fill="none" stroke="#38bdf8" stroke-width="18" stroke-linecap="round"/>
    <!-- Head resting off edge -->
    <circle cx="465" cy="305" r="16" fill="#334155" stroke="#64748b"/>
    <!-- Serratus / Ribcage Active Glow -->
    <ellipse cx="380" cy="290" rx="30" ry="12" fill="url(#activeMuscle)"/>

    <!-- Arms Reaching Overhead with Dumbbell -->
    <path d="M 430 290 L 490 230 L 530 180" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>

    <!-- Heavy Dumbbell in Diamond Grip -->
    <rect x="520" y="150" width="40" height="18" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="532" y="168" width="16" height="24" fill="url(#steelGrad)"/>
    <rect x="520" y="192" width="40" height="18" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 545 160 Q 480 140 430 200" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 5. Push-Ups
buildSvg({
  filename: 'push_ups.svg',
  exerciseName: 'Push-Ups (Max Reps)',
  dayTag: 'Day 1 • Chest',
  targetMuscle: 'Chest, Anterior Delts & Core',
  equipment: 'Bodyweight Floor Calisthenics',
  tempoCue: 'Rigid Plank • Full Chest Depth to Floor',
  figureSvg: `
    <!-- Ground Line -->
    <line x1="180" y1="360" x2="620" y2="360" stroke="#475569" stroke-width="3"/>

    <!-- Lifter in Horizontal Plank Alignment -->
    <!-- Legs from toes up to hips -->
    <line x1="220" y1="350" x2="360" y2="300" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <!-- Feet / Toes pivoting on ground -->
    <circle cx="218" cy="354" r="7" fill="#64748b"/>

    <!-- Torso and Chest Hovering -->
    <line x1="360" y1="300" x2="520" y2="280" stroke="#38bdf8" stroke-width="16" stroke-linecap="round"/>
    <!-- Active Chest Glow -->
    <line x1="440" y1="285" x2="510" y2="280" stroke="url(#activeMuscle)" stroke-width="12" stroke-linecap="round"/>

    <!-- Head -->
    <circle cx="550" cy="265" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Bent Arms (Bottom Range of Pushup) -->
    <path d="M 480 285 L 490 320 L 485 360" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="485" cy="360" rx="8" ry="4" fill="#64748b"/>
  `,
  motionArrows: `
    <!-- Vertical Push Drive Vector -->
    <path d="M 490 330 L 490 280" fill="none" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#arrow)"/>
    <path d="M 380 320 L 380 290" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3 3"/>
  `
});

// ==========================================
// DAY 2: SHOULDERS (5 Exercises)
// ==========================================

// 6. Overhead Barbell Press
buildSvg({
  filename: 'overhead_barbell_press.svg',
  exerciseName: 'Overhead Barbell Press',
  dayTag: 'Day 2 • Shoulders',
  targetMuscle: 'Anterior & Lateral Deltoids',
  equipment: 'Olympic Barbell & Power Rack',
  tempoCue: 'Glutes Squeezed • Head Through the Window',
  figureSvg: `
    <!-- Standing Lifter Body -->
    <!-- Legs -->
    <line x1="375" y1="380" x2="385" y2="280" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <line x1="425" y1="380" x2="415" y2="280" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <!-- Torso -->
    <line x1="400" y1="280" x2="400" y2="200" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <!-- Deltoid Activation Glow -->
    <circle cx="378" cy="200" r="14" fill="url(#activeMuscle)"/>
    <circle cx="422" cy="200" r="14" fill="url(#activeMuscle)"/>
    <!-- Head with chin tucked back -->
    <circle cx="400" cy="180" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Arms Locked Out Overhead -->
    <path d="M 378 200 L 370 145 L 365 110" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 422 200 L 430 145 L 435 110" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Barbell Pressed High Overhead -->
    <rect x="220" y="105" width="360" height="9" rx="3" fill="url(#steelGrad)" stroke="#cbd5e1"/>
    <!-- Plates -->
    <rect x="240" y="70" width="16" height="80" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="544" y="70" width="16" height="80" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  `,
  motionArrows: `
    <path d="M 365 170 L 365 120" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
    <path d="M 435 170 L 435 120" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 7. Dumbbell Lateral Raises
buildSvg({
  filename: 'dumbbell_lateral_raises.svg',
  exerciseName: 'Dumbbell Lateral Raises',
  dayTag: 'Day 2 • Shoulders',
  targetMuscle: 'Lateral Deltoid (Shoulder Width)',
  equipment: 'Dumbbells (Pair)',
  tempoCue: 'Lead with Elbows • Pour the Water Pitcher',
  figureSvg: `
    <!-- Standing Lifter -->
    <line x1="385" y1="380" x2="390" y2="270" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="415" y1="380" x2="410" y2="270" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="400" y1="270" x2="400" y2="190" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Glowing Lateral Delts -->
    <ellipse cx="375" cy="190" rx="14" ry="10" fill="url(#activeMuscle)"/>
    <ellipse cx="425" cy="190" rx="14" ry="10" fill="url(#activeMuscle)"/>

    <!-- Left Arm Swept Out Laterally to Parallel -->
    <path d="M 375 190 L 300 190 L 250 195" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <rect x="235" y="180" width="10" height="30" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="255" y="180" width="10" height="30" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>

    <!-- Right Arm Swept Out Laterally to Parallel -->
    <path d="M 425 190 L 500 190 L 550 195" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <rect x="535" y="180" width="10" height="30" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="555" y="180" width="10" height="30" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <!-- Wide Arc Raising Trajectories -->
    <path d="M 290 270 Q 250 240 245 205" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
    <path d="M 510 270 Q 550 240 555 205" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 8. Front Dumbbell Raises
buildSvg({
  filename: 'front_dumbbell_raises.svg',
  exerciseName: 'Front Dumbbell Raises',
  dayTag: 'Day 2 • Shoulders',
  targetMuscle: 'Anterior (Front) Deltoid',
  equipment: 'Dumbbells (Pair)',
  tempoCue: 'Controlled Lift to Eye Level • No Swing',
  figureSvg: `
    <!-- Standing Profile / 3/4 Lifter -->
    <line x1="370" y1="380" x2="380" y2="270" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="410" y1="380" x2="400" y2="270" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="390" y1="270" x2="390" y2="190" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="390" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Front Delt Active Glow -->
    <circle cx="405" cy="192" r="14" fill="url(#activeMuscle)"/>

    <!-- Left Arm Resting at Thigh -->
    <line x1="375" y1="195" x2="365" y2="260" stroke="#334155" stroke-width="8" stroke-linecap="round"/>

    <!-- Right Arm Extended Forward to Eye Level -->
    <path d="M 405 195 L 480 185 L 540 180" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <!-- Dumbbell at Eye Height -->
    <rect x="535" y="165" width="30" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="530" y="155" width="10" height="28" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="560" y="155" width="10" height="28" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <!-- Forward Arc Motion -->
    <path d="M 430 270 Q 510 250 535 195" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 9. Rear Delt Fly
buildSvg({
  filename: 'rear_delt_fly.svg',
  exerciseName: 'Bent-Over Rear Delt Fly',
  dayTag: 'Day 2 • Shoulders',
  targetMuscle: 'Posterior Deltoids & Rhomboids',
  equipment: 'Dumbbells & 45° Torso Hinge',
  tempoCue: 'Flat Back • Squeeze Shoulder Blades Together',
  figureSvg: `
    <!-- Hinged Lifter Profile (Bent-over 45°) -->
    <line x1="320" y1="380" x2="340" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <!-- Torso Hinged Forward -->
    <line x1="340" y1="280" x2="460" y2="240" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="485" cy="235" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Rear Delt Glow on Posterior Shoulder -->
    <ellipse cx="430" cy="235" rx="14" ry="10" fill="url(#activeMuscle)"/>

    <!-- Sweeping Arm Flying Out and Back -->
    <path d="M 430 240 L 460 180 L 480 140" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <!-- Dumbbell -->
    <rect x="470" y="125" width="30" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="465" y="115" width="10" height="28" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="495" y="115" width="10" height="28" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <!-- Reverse Fly Arc Vector -->
    <path d="M 420 280 Q 460 210 475 155" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 10. Dumbbell Shrugs
buildSvg({
  filename: 'dumbbell_shrugs.svg',
  exerciseName: 'Dumbbell Shrugs',
  dayTag: 'Day 2 • Shoulders',
  targetMuscle: 'Upper Trapezius',
  equipment: 'Heavy Dumbbells (Pair)',
  tempoCue: 'Elevate Traps Straight Up • Hold 2s Peak',
  figureSvg: `
    <!-- Standing Upright Lifter -->
    <line x1="380" y1="380" x2="385" y2="270" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <line x1="420" y1="380" x2="415" y2="270" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <line x1="400" y1="270" x2="400" y2="185" stroke="#1e293b" stroke-width="22" stroke-linecap="round"/>
    <circle cx="400" cy="155" r="16" fill="#334155" stroke="#64748b"/>

    <!-- High Elevated Glowing Trapezius -->
    <path d="M 370 190 Q 400 160 430 190 Z" fill="url(#activeMuscle)"/>

    <!-- Arms Hanging at Sides with Heavy Dumbbells -->
    <line x1="365" y1="185" x2="340" y2="270" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <line x1="435" y1="185" x2="460" y2="270" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>

    <!-- Left Heavy Dumbbell -->
    <rect x="325" y="270" width="30" height="12" fill="url(#steelGrad)"/>
    <rect x="315" y="255" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="350" y="255" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>

    <!-- Right Heavy Dumbbell -->
    <rect x="445" y="270" width="30" height="12" fill="url(#steelGrad)"/>
    <rect x="435" y="255" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="470" y="255" width="14" height="42" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  `,
  motionArrows: `
    <path d="M 340 260 L 340 210" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
    <path d="M 460 260 L 460 210" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// ==========================================
// DAY 3: BICEPS (5 Exercises)
// ==========================================

// 11. Barbell Curl
buildSvg({
  filename: 'barbell_curl.svg',
  exerciseName: 'Standing Barbell Curl',
  dayTag: 'Day 3 • Biceps',
  targetMuscle: 'Biceps Brachii (Short & Long Head)',
  equipment: 'Olympic / EZ-Curl Barbell',
  tempoCue: 'Elbows Pinned to Ribcage • Squeeze at Peak',
  figureSvg: `
    <!-- Standing Lifter -->
    <line x1="380" y1="380" x2="385" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="420" y1="380" x2="415" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="400" y1="280" x2="400" y2="195" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Fully Flexed Glowing Biceps Peaks -->
    <circle cx="365" cy="225" r="14" fill="url(#activeMuscle)"/>
    <circle cx="435" cy="225" r="14" fill="url(#activeMuscle)"/>

    <!-- Curled Forearms Holding Barbell at Chest -->
    <path d="M 370 195 L 365 240 L 380 210" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 430 195 L 435 240 L 420 210" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Barbell at Peak Contraction -->
    <rect x="250" y="205" width="300" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="265" y="175" width="16" height="68" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="519" y="175" width="16" height="68" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  `,
  motionArrows: `
    <path d="M 350 280 Q 340 240 370 215" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
  `
});

// 12. Dumbbell Curl
buildSvg({
  filename: 'dumbbell_curl.svg',
  exerciseName: 'Alternating Dumbbell Curl',
  dayTag: 'Day 3 • Biceps',
  targetMuscle: 'Biceps Brachii Supination',
  equipment: 'Dumbbells (Pair)',
  tempoCue: 'Supinate Wrist as You Curl to Shoulder',
  figureSvg: `
    <line x1="380" y1="380" x2="385" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="420" y1="380" x2="415" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="400" y1="280" x2="400" y2="195" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Right Arm Curling with Supination -->
    <path d="M 430 195 L 435 245 L 450 205" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <circle cx="440" cy="225" r="13" fill="url(#activeMuscle)"/>
    <rect x="435" y="195" width="30" height="8" fill="url(#steelGrad)"/>
    <rect x="430" y="182" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="460" y="182" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>

    <!-- Left Arm Hanging Full Stretch -->
    <line x1="370" y1="195" x2="355" y2="285" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <rect x="340" y="285" width="30" height="8" fill="url(#steelGrad)"/>
    <rect x="335" y="272" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
    <rect x="365" y="272" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 460 280 Q 480 235 460 205" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 13. Hammer Curl
buildSvg({
  filename: 'hammer_curl.svg',
  exerciseName: 'Dumbbell Hammer Curl',
  dayTag: 'Day 3 • Biceps',
  targetMuscle: 'Brachialis & Forearm Brachioradialis',
  equipment: 'Dumbbells (Neutral Grip)',
  tempoCue: 'Neutral Palms Facing Inward • Arm Thickness',
  figureSvg: `
    <line x1="380" y1="380" x2="385" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="420" y1="380" x2="415" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="400" y1="280" x2="400" y2="195" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Glowing Outer Arm / Brachialis Target -->
    <line x1="432" y1="220" x2="445" y2="245" stroke="url(#activeMuscle)" stroke-width="12" stroke-linecap="round"/>

    <!-- 90 Degree Neutral Hammer Curled Arm -->
    <path d="M 425 195 L 430 250 L 480 240" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Vertical Dumbbell in Neutral Grip -->
    <rect x="475" y="215" width="8" height="48" fill="url(#steelGrad)"/>
    <rect x="465" y="205" width="28" height="14" rx="2" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="465" y="258" width="28" height="14" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 445 290 Q 480 280 480 245" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 14. Preacher Curl
buildSvg({
  filename: 'preacher_curl.svg',
  exerciseName: 'Preacher Curl',
  dayTag: 'Day 3 • Biceps',
  targetMuscle: 'Biceps Brachii (Isolated Short Head)',
  equipment: 'Preacher Bench & EZ-Bar',
  tempoCue: 'Triceps Locked on Pad • Zero Body Sway',
  figureSvg: `
    <!-- Preacher Pad Slanted at 45° -->
    <polygon points="340,300 440,240 455,255 355,315" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <rect x="390" y="290" width="16" height="90" fill="#0f172a" stroke="#334155"/>

    <!-- Seated Lifter with Upper Arms Glued to Pad -->
    <line x1="330" y1="290" x2="410" y2="245" stroke="#38bdf8" stroke-width="16" stroke-linecap="round"/>
    <!-- Peak Biceps Contraction Glow -->
    <circle cx="410" cy="235" r="14" fill="url(#activeMuscle)"/>

    <!-- Forearms Curled Straight Up off Pad -->
    <path d="M 410 245 L 430 190" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>

    <!-- EZ Bar at Peak -->
    <rect x="360" y="185" width="140" height="8" rx="2" fill="url(#steelGrad)"/>
    <rect x="375" y="165" width="12" height="48" rx="2" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="475" y="165" width="12" height="48" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 440 230 Q 455 205 435 185" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 15. Concentration Curl
buildSvg({
  filename: 'concentration_curl.svg',
  exerciseName: 'Concentration Curl',
  dayTag: 'Day 3 • Biceps',
  targetMuscle: 'Biceps Brachii Peak Contraction',
  equipment: 'Flat Bench & Single Dumbbell',
  tempoCue: 'Elbow Braced on Inner Thigh • Squeeze Chin-High',
  figureSvg: `
    <!-- Bench -->
    <rect x="260" y="290" width="160" height="18" rx="3" fill="#1e293b" stroke="#334155"/>
    <!-- Seated Lifter Legs Spread -->
    <line x1="280" y1="295" x2="310" y2="380" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="370" y1="295" x2="420" y2="380" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>

    <!-- Torso Leaning Forward -->
    <line x1="320" y1="290" x2="380" y2="240" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="400" cy="225" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Right Elbow Braced Firmly Against Inner Thigh -->
    <path d="M 370 245 L 390 320 L 415 260" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Glowing Biceps Peak -->
    <circle cx="405" cy="285" r="13" fill="url(#activeMuscle)"/>

    <!-- Dumbbell Curled Up -->
    <rect x="405" y="255" width="30" height="8" fill="url(#steelGrad)"/>
    <rect x="400" y="242" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="430" y="242" width="10" height="34" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 405 320 Q 425 290 415 255" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// ==========================================
// DAY 4: TRICEPS (5 Exercises)
// ==========================================

// 16. Close-Grip Bench Press
buildSvg({
  filename: 'close_grip_bench_press.svg',
  exerciseName: 'Close-Grip Bench Press',
  dayTag: 'Day 4 • Triceps',
  targetMuscle: 'Triceps Lateral & Medial Heads',
  equipment: 'Olympic Barbell (Shoulder-Width Grip)',
  tempoCue: 'Shoulder-Width Hands • Elbows Tucked In Tight',
  figureSvg: `
    <rect x="250" y="310" width="300" height="24" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="300" y="160" width="16" height="170" fill="#334155"/>
    <rect x="484" y="160" width="16" height="170" fill="#334155"/>

    <!-- Lifter Torso on Bench -->
    <ellipse cx="400" cy="298" rx="75" ry="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="280" cy="296" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Triceps Glowing Along Upper Arms -->
    <line x1="380" y1="260" x2="380" y2="295" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>
    <line x1="420" y1="260" x2="420" y2="295" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>

    <!-- Arms Tightly Tucked In (Close Grip) -->
    <path d="M 380 295 L 380 240 L 385 185" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <path d="M 420 295 L 420 240 L 415 185" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>

    <!-- Barbell with Hands Close Together (385 to 415) -->
    <rect x="230" y="180" width="340" height="9" rx="3" fill="url(#steelGrad)"/>
    <rect x="245" y="135" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="539" y="135" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 380 230 L 380 175" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
    <path d="M 420 230 L 420 175" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 17. Rope Pushdown
buildSvg({
  filename: 'rope_pushdown.svg',
  exerciseName: 'Cable Rope Pushdown',
  dayTag: 'Day 4 • Triceps',
  targetMuscle: 'Triceps Lateral Head Peak Lockout',
  equipment: 'High Cable Pulley & Rope',
  tempoCue: 'Spread Rope Apart at Bottom • Pin Elbows',
  figureSvg: `
    <!-- Cable Machine Stack -->
    <rect x="230" y="110" width="40" height="260" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <circle cx="270" cy="120" r="12" fill="#334155" stroke="#f59e0b" stroke-width="2"/>
    <!-- Cable Line to Lifter -->
    <line x1="270" y1="120" x2="420" y2="210" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Standing Lifter Slightly Hinged -->
    <line x1="460" y1="380" x2="450" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="430" y1="280" x2="430" y2="195" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="430" cy="168" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Triceps Back of Arm Glowing -->
    <line x1="422" y1="195" x2="420" y2="245" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>

    <!-- Upper Arm Fixed at Side, Forearms Extending Down -->
    <path d="M 430 195 L 420 245 L 390 310" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Split Rope Attachment at Full Lockout -->
    <path d="M 400 290 Q 385 305 375 320" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
    <circle cx="375" cy="320" r="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  `,
  motionArrows: `
    <path d="M 410 240 Q 390 280 380 315" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 18. Overhead Dumbbell Triceps Extension
buildSvg({
  filename: 'overhead_dumbbell_triceps_ext.svg',
  exerciseName: 'Overhead Triceps Extension',
  dayTag: 'Day 4 • Triceps',
  targetMuscle: 'Triceps Long Head (Full Stretch)',
  equipment: 'Seated Bench & Heavy Dumbbell',
  tempoCue: 'Keep Elbows Pointed Skyward • Deep Neck Drop',
  figureSvg: `
    <rect x="360" y="270" width="80" height="20" rx="3" fill="#1e293b" stroke="#334155"/>
    <line x1="385" y1="270" x2="385" y2="380" stroke="#0f172a" stroke-width="12"/>

    <!-- Seated Lifter Torso -->
    <line x1="400" y1="270" x2="400" y2="190" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="165" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Triceps Long Head Posterior Activation -->
    <line x1="388" y1="120" x2="388" y2="165" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>

    <!-- Arms Overhead Bent at 90° behind neck -->
    <path d="M 400 185 L 390 120 L 415 150" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Dumbbell Behind Neck -->
    <rect x="410" y="140" width="12" height="34" fill="url(#steelGrad)"/>
    <rect x="398" y="132" width="36" height="12" rx="2" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="398" y="170" width="36" height="12" rx="2" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 415 160 Q 425 125 400 115" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 19. Bench Dips
buildSvg({
  filename: 'bench_dips.svg',
  exerciseName: 'Bench Dips (Bodyweight / Weighted)',
  dayTag: 'Day 4 • Triceps',
  targetMuscle: 'Triceps & Anterior Deltoids',
  equipment: 'Flat Bench & Extended Legs',
  tempoCue: 'Lower to 90° Elbow Flexion • Drive Through Palms',
  figureSvg: `
    <!-- Support Bench Behind Hips -->
    <rect x="460" y="270" width="130" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <rect x="520" y="294" width="20" height="85" fill="#0f172a" stroke="#334155"/>

    <!-- Hands Gripping Bench Edge Behind Lifter -->
    <circle cx="475" cy="265" r="7" fill="#64748b"/>

    <!-- Lifter Lowering in Dip Position -->
    <path d="M 475 265 L 450 245 L 430 270" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Glowing Triceps Horseshoe -->
    <line x1="450" y1="245" x2="435" y2="265" stroke="url(#activeMuscle)" stroke-width="12" stroke-linecap="round"/>

    <!-- Torso Dropping in Front of Bench -->
    <line x1="430" y1="260" x2="430" y2="330" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="430" cy="235" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Legs Extended Out in Front -->
    <path d="M 430 330 L 330 350 L 300 375" fill="none" stroke="#38bdf8" stroke-width="11" stroke-linecap="round"/>
  `,
  motionArrows: `
    <path d="M 430 310 L 430 255" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 20. Cable Triceps Kickback
buildSvg({
  filename: 'cable_triceps_kickback.svg',
  exerciseName: 'Cable Triceps Kickback',
  dayTag: 'Day 4 • Triceps',
  targetMuscle: 'Triceps Lateral & Long Head Lockout',
  equipment: 'Low Cable Pulley & Single Handle',
  tempoCue: 'Torso Horizontal • Pin Elbow to Ribs & Extend',
  figureSvg: `
    <line x1="200" y1="150" x2="200" y2="370" stroke="#334155" stroke-width="4"/>
    <line x1="200" y1="340" x2="380" y2="260" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Hinged Lifter Torso (Flat Back) -->
    <line x1="330" y1="380" x2="350" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <line x1="350" y1="280" x2="450" y2="250" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="475" cy="245" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Upper Arm Pinned to Torso, Forearm Kicking Straight Back -->
    <path d="M 420 255 L 390 255 L 300 255" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <!-- Intense Tricep Lockout Glow -->
    <line x1="380" y1="255" x2="330" y2="255" stroke="url(#activeMuscle)" stroke-width="12" stroke-linecap="round"/>

    <circle cx="295" cy="255" r="7" fill="#f59e0b"/>
  `,
  motionArrows: `
    <path d="M 370 275 L 310 260" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// ==========================================
// DAY 5: BACK (5 Exercises)
// ==========================================

// 21. Pull-Ups
buildSvg({
  filename: 'pull_ups.svg',
  exerciseName: 'Wide-Grip Pull-Ups',
  dayTag: 'Day 5 • Back',
  targetMuscle: 'Latissimus Dorsi & Teres Major',
  equipment: 'Rigid Overhead Pull-Up Bar',
  tempoCue: 'Chest to Bar • Flare Lats at Bottom Stretch',
  figureSvg: `
    <!-- Overhead Pull-Up Bar Rigging -->
    <rect x="220" y="80" width="360" height="12" rx="4" fill="url(#steelGrad)" stroke="#475569"/>
    <line x1="250" y1="80" x2="250" y2="30" stroke="#334155" stroke-width="6"/>
    <line x1="550" y1="80" x2="550" y2="30" stroke="#334155" stroke-width="6"/>

    <!-- Wide Hands Gripping Bar -->
    <circle cx="310" cy="86" r="8" fill="#64748b"/>
    <circle cx="490" cy="86" r="8" fill="#64748b"/>

    <!-- Lifter Pulled Up High (Chin Above Bar) -->
    <circle cx="400" cy="80" r="17" fill="#334155" stroke="#64748b"/>
    <!-- V-Taper Back / Lat Wings Glowing -->
    <path d="M 360 140 Q 400 170 440 140 L 420 230 L 380 230 Z" fill="url(#activeMuscle)"/>

    <!-- Arms Pulled Back in Flexion -->
    <path d="M 310 86 L 350 125 L 375 140" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
    <path d="M 490 86 L 450 125 L 425 140" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>

    <!-- Crossed Ankles Hanging Free -->
    <path d="M 390 230 L 400 320 L 410 350" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
  `,
  motionArrows: `
    <path d="M 400 200 L 400 130" fill="none" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#arrow)"/>
  `
});

// 22. Barbell Row
buildSvg({
  filename: 'barbell_row.svg',
  exerciseName: 'Bent-Over Barbell Row',
  dayTag: 'Day 5 • Back',
  targetMuscle: 'Mid-Back, Rhomboids & Latissimus',
  equipment: 'Olympic Barbell & 45° Torso Angle',
  tempoCue: 'Drive Elbows Back to Ribs • Retract Scapulae',
  figureSvg: `
    <!-- Hinged Lifter Profile (Bent-over 45°) -->
    <line x1="330" y1="380" x2="350" y2="280" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <!-- Flat Back Torso -->
    <line x1="350" y1="280" x2="470" y2="240" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <!-- Lat & Rhomboid Glowing Contour -->
    <line x1="370" y1="265" x2="450" y2="245" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>
    <circle cx="495" cy="235" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Arms Rowing Bar to Navel -->
    <path d="M 430 245 L 420 280 L 400 260" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Barbell Pulled Tight to Abdomen -->
    <rect x="350" y="255" width="16" height="80" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="330" y="292" width="160" height="8" rx="2" fill="url(#steelGrad)"/>
  `,
  motionArrows: `
    <path d="M 390 320 L 390 265" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 23. Lat Pulldown
buildSvg({
  filename: 'lat_pulldown.svg',
  exerciseName: 'Wide-Grip Lat Pulldown',
  dayTag: 'Day 5 • Back',
  targetMuscle: 'Latissimus Dorsi (Outer Sweep)',
  equipment: 'Cable Lat Machine & Wide Curved Bar',
  tempoCue: 'Pull to Collarbone • Arch Upper Chest to Ceiling',
  figureSvg: `
    <!-- Machine Overhead Pulley Frame -->
    <rect x="250" y="60" width="300" height="14" rx="3" fill="#1e293b" stroke="#334155"/>
    <circle cx="400" cy="67" r="10" fill="#334155" stroke="#f59e0b"/>
    <!-- Cable down to bar -->
    <line x1="400" y1="77" x2="400" y2="120" stroke="#cbd5e1" stroke-width="2.5"/>

    <!-- Wide Angled Lat Bar -->
    <path d="M 280 140 Q 400 120 520 140" fill="none" stroke="url(#steelGrad)" stroke-width="7" stroke-linecap="round"/>

    <!-- Seated Lifter with Thighs Under Roller Pads -->
    <rect x="350" y="260" width="100" height="16" rx="4" fill="#334155"/>
    <circle cx="370" cy="250" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <circle cx="430" cy="250" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>

    <!-- Torso Leaning Slightly Back -->
    <line x1="400" y1="270" x2="400" y2="180" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <!-- Glowing Lat Wings -->
    <path d="M 365 170 Q 400 200 435 170 L 415 240 L 385 240 Z" fill="url(#activeMuscle)"/>
    <circle cx="400" cy="155" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Arms Pulling Bar Down to Collarbone -->
    <path d="M 300 138 L 350 175 L 380 185" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <path d="M 500 138 L 450 175 L 420 185" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
  `,
  motionArrows: `
    <path d="M 330 115 L 350 160" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
    <path d="M 470 115 L 450 160" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 24. Seated Cable Row
buildSvg({
  filename: 'seated_cable_row.svg',
  exerciseName: 'Seated Cable Row',
  dayTag: 'Day 5 • Back',
  targetMuscle: 'Middle Traps, Rhomboids & Lats',
  equipment: 'Low Pulley Cable Row & V-Grip Handle',
  tempoCue: 'Drive Scapulae Back • 1s Squeeze at Navel',
  figureSvg: `
    <!-- Low Pulley Machine & Footplates -->
    <rect x="230" y="240" width="30" height="130" fill="#1e293b" stroke="#334155"/>
    <circle cx="260" cy="290" r="9" fill="#334155" stroke="#f59e0b"/>
    <!-- Footplate Brace -->
    <polygon points="270,300 285,280 290,285 275,305" fill="#475569"/>

    <!-- Cable Running to V-Handle -->
    <line x1="260" y1="290" x2="400" y2="280" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Seated Lifter on Sliding Bench Pad -->
    <rect x="350" y="330" width="150" height="16" rx="4" fill="#1e293b" stroke="#334155"/>
    <!-- Legs Braced Against Footplates -->
    <path d="M 410 330 L 340 310 L 285 290" fill="none" stroke="#38bdf8" stroke-width="11" stroke-linecap="round"/>

    <!-- Upright Back / Torso -->
    <line x1="420" y1="330" x2="420" y2="230" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="420" cy="205" r="16" fill="#334155" stroke="#64748b"/>
    <!-- Mid-Back Active Contraction Glow -->
    <line x1="412" y1="230" x2="412" y2="280" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>

    <!-- Arms Pulled Back to Ribs with V-Handle -->
    <path d="M 405 280 L 430 265 L 415 240" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <rect x="395" y="275" width="12" height="12" rx="2" fill="#f59e0b"/>
  `,
  motionArrows: `
    <path d="M 330 285 L 395 280" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 25. Deadlift
buildSvg({
  filename: 'deadlift.svg',
  exerciseName: 'Conventional Barbell Deadlift',
  dayTag: 'Day 5 • Back',
  targetMuscle: 'Entire Posterior Chain & Erectors',
  equipment: 'Olympic Barbell & Bumper Plates',
  tempoCue: 'Push Floor Away • Neutral Spine & Lock Hips',
  figureSvg: `
    <!-- Lifter Mid-Pull / Knee Transition -->
    <line x1="375" y1="380" x2="385" y2="295" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <line x1="385" y1="295" x2="360" y2="250" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>

    <!-- Flat Spine Hinged at Hips -->
    <line x1="360" y1="250" x2="450" y2="185" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="475" cy="170" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Entire Spinal Erector & Lat Glow -->
    <line x1="370" y1="245" x2="440" y2="195" stroke="url(#activeMuscle)" stroke-width="15" stroke-linecap="round"/>

    <!-- Arms Hanging Straight Down Clamping Barbell -->
    <path d="M 435 200 L 400 290" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>

    <!-- Barbell at Knee Height -->
    <rect x="230" y="285" width="340" height="9" rx="3" fill="url(#steelGrad)"/>
    <!-- Bumper Plates Resting off Floor -->
    <circle cx="260" cy="290" r="50" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="260" cy="290" r="16" fill="#0f172a"/>
    <circle cx="540" cy="290" r="50" fill="url(#plateGrad)" stroke="#64748b" stroke-width="2"/>
    <circle cx="540" cy="290" r="16" fill="#0f172a"/>
  `,
  motionArrows: `
    <path d="M 400 330 L 400 270" fill="none" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#arrow)"/>
    <path d="M 360 260 L 390 220" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3 3"/>
  `
});

// ==========================================
// DAY 6: LEGS (5 Exercises)
// ==========================================

// 26. Barbell Squat
buildSvg({
  filename: 'barbell_squat.svg',
  exerciseName: 'Barbell Back Squat',
  dayTag: 'Day 6 • Legs',
  targetMuscle: 'Quadriceps, Glutes & Adductors',
  equipment: 'Squat Rack & Olympic Barbell',
  tempoCue: 'Depth to Parallel • Drive Knees Out & Brace Core',
  figureSvg: `
    <!-- Squat Rack Safety Pins -->
    <rect x="280" y="150" width="16" height="230" fill="#334155"/>
    <rect x="504" y="150" width="16" height="230" fill="#334155"/>

    <!-- Lifter at Parallel Squat Depth -->
    <!-- Lower Leg (Shin Angle) -->
    <line x1="380" y1="380" x2="360" y2="300" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <line x1="420" y1="380" x2="440" y2="300" stroke="#38bdf8" stroke-width="13" stroke-linecap="round"/>
    <!-- Thighs Parallel to Floor -->
    <line x1="360" y1="300" x2="400" y2="295" stroke="#38bdf8" stroke-width="14" stroke-linecap="round"/>
    <!-- Quad and Glute Muscle Fire Glow -->
    <line x1="365" y1="300" x2="425" y2="300" stroke="url(#activeMuscle)" stroke-width="16" stroke-linecap="round"/>

    <!-- Torso Angled Forward Core Braced -->
    <line x1="400" y1="295" x2="400" y2="200" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="175" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Barbell Resting High-Bar on Traps -->
    <rect x="220" y="195" width="360" height="9" rx="3" fill="url(#steelGrad)"/>
    <rect x="240" y="150" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="544" y="150" width="16" height="100" rx="3" fill="url(#plateGrad)" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 400 320 L 400 240" fill="none" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#arrow)"/>
  `
});

// 27. Leg Press
buildSvg({
  filename: 'leg_press.svg',
  exerciseName: '45-Degree Leg Press',
  dayTag: 'Day 6 • Legs',
  targetMuscle: 'Quadriceps & Gluteus Maximus',
  equipment: '45° Plate-Loaded Leg Press Sled',
  tempoCue: 'Do Not Lock Knees • Full Depth Without Hip Lift',
  figureSvg: `
    <!-- 45-Degree Incline Sled Frame -->
    <line x1="260" y1="380" x2="520" y2="120" stroke="#334155" stroke-width="12" stroke-linecap="round"/>
    <!-- Footplate Sled Platform -->
    <rect x="420" y="150" width="80" height="20" rx="4" transform="rotate(45 460 160)" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>

    <!-- Seated Lifter with Back Against Pad -->
    <line x1="300" y1="360" x2="360" y2="300" stroke="#1e293b" stroke-width="22" stroke-linecap="round"/>
    <circle cx="340" cy="275" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Legs Bent at 90° Driving Sled Platform Up -->
    <path d="M 360 310 L 400 250 L 440 180" fill="none" stroke="#38bdf8" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Quad Glowing Activation -->
    <line x1="370" y1="290" x2="415" y2="235" stroke="url(#activeMuscle)" stroke-width="15" stroke-linecap="round"/>
  `,
  motionArrows: `
    <path d="M 410 240 L 460 190" fill="none" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#arrow)"/>
  `
});

// 28. Leg Extension
buildSvg({
  filename: 'leg_extension.svg',
  exerciseName: 'Leg Extension Machine',
  dayTag: 'Day 6 • Legs',
  targetMuscle: 'Quadriceps (Rectus Femoris Isolation)',
  equipment: 'Plate/Pin Machine & Shin Roller',
  tempoCue: 'Full Knee Extension • Pause 1s at Top',
  figureSvg: `
    <!-- Machine Seat Frame -->
    <rect x="300" y="270" width="130" height="20" rx="3" fill="#1e293b" stroke="#334155"/>
    <rect x="300" y="170" width="18" height="110" rx="3" fill="#1e293b" stroke="#334155"/>

    <!-- Seated Lifter -->
    <line x1="315" y1="270" x2="315" y2="185" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="315" cy="160" r="16" fill="#334155" stroke="#64748b"/>

    <!-- Quad Thigh Resting on Seat -->
    <line x1="315" y1="270" x2="430" y2="270" stroke="#38bdf8" stroke-width="14" stroke-linecap="round"/>
    <!-- Intense Quad Muscle Glow -->
    <line x1="330" y1="265" x2="420" y2="265" stroke="url(#activeMuscle)" stroke-width="15" stroke-linecap="round"/>

    <!-- Shin Extended Horizontally Kicking Roller Pad -->
    <path d="M 430 270 L 530 270" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <!-- Shin Roller Pad -->
    <circle cx="510" cy="270" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  `,
  motionArrows: `
    <path d="M 460 340 Q 520 330 525 285" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 29. Lying Leg Curl
buildSvg({
  filename: 'lying_leg_curl.svg',
  exerciseName: 'Lying Hamstring Leg Curl',
  dayTag: 'Day 6 • Legs',
  targetMuscle: 'Hamstrings (Biceps Femoris)',
  equipment: 'Prone Bench & Ankle Roller',
  tempoCue: 'Curl Heels to Glutes • Keep Hips Pressed to Pad',
  figureSvg: `
    <!-- Prone Angled Bench -->
    <polygon points="250,310 480,310 500,325 240,325" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <rect x="360" y="325" width="20" height="60" fill="#0f172a"/>

    <!-- Lifter Lying Prone (Face Down) -->
    <line x1="280" y1="300" x2="430" y2="300" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="260" cy="295" r="15" fill="#334155" stroke="#64748b"/>

    <!-- Hamstrings Glowing on Back of Thigh -->
    <line x1="350" y1="295" x2="425" y2="295" stroke="url(#activeMuscle)" stroke-width="14" stroke-linecap="round"/>

    <!-- Lower Leg Curled Up to 90° Engaging Roller -->
    <path d="M 430 300 L 485 220" stroke="#38bdf8" stroke-width="12" stroke-linecap="round"/>
    <circle cx="485" cy="220" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  `,
  motionArrows: `
    <path d="M 520 295 Q 520 240 490 215" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// 30. Standing Calf Raises
buildSvg({
  filename: 'standing_calf_raises.svg',
  exerciseName: 'Standing Calf Raises',
  dayTag: 'Day 6 • Legs',
  targetMuscle: 'Gastrocnemius & Soleus',
  equipment: 'Elevated Block & Machine / Dumbbells',
  tempoCue: 'Full Heel Drop Below Block • 2s Peak Squeeze on Toes',
  figureSvg: `
    <!-- Elevated Calf Step Block -->
    <rect x="340" y="360" width="120" height="25" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>

    <!-- Standing Lifter Driven High on Balls of Feet -->
    <!-- Heels Elevated High in Air -->
    <line x1="380" y1="360" x2="385" y2="330" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
    <line x1="420" y1="360" x2="415" y2="330" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>

    <!-- Bulging Active Calves Glowing -->
    <ellipse cx="385" cy="290" rx="14" ry="24" fill="url(#activeMuscle)"/>
    <ellipse cx="415" cy="290" rx="14" ry="24" fill="url(#activeMuscle)"/>

    <line x1="400" y1="260" x2="400" y2="180" stroke="#1e293b" stroke-width="20" stroke-linecap="round"/>
    <circle cx="400" cy="155" r="16" fill="#334155" stroke="#64748b"/>
  `,
  motionArrows: `
    <path d="M 350 350 L 350 280" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
    <path d="M 450 350 L 450 280" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow)"/>
  `
});

// ==========================================
// DAY 7: REST & RECOVERY (3 Assets)
// ==========================================

// 31. Light Zone 2 Walk
buildSvg({
  filename: 'light_zone2_walk.svg',
  exerciseName: 'Light 30-Min Zone 2 Walk',
  dayTag: 'Day 7 • Recovery',
  targetMuscle: 'Cardiovascular Lymphatic Drainage',
  equipment: 'Outdoor Path / Gentle Treadmill Pace',
  tempoCue: 'Nasal Breathing Pace • 60-70% Max Heart Rate',
  figureSvg: `
    <!-- Walking Stride -->
    <path d="M 370 380 L 390 300 L 420 380" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="390" y1="300" x2="395" y2="200" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <circle cx="395" cy="170" r="16" fill="#334155" stroke="#64748b"/>
    <!-- Heart Rate Rhythm Line -->
    <path d="M 240 250 L 290 250 L 305 220 L 320 280 L 335 240 L 350 250 L 560 250" fill="none" stroke="#10b981" stroke-width="3"/>
    <circle cx="305" cy="220" r="4" fill="#10b981"/>
  `,
  motionArrows: `
    <path d="M 430 330 L 490 330" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrowSec)"/>
  `
});

// 32. Full Body Stretching & Mobility
buildSvg({
  filename: 'full_body_stretching.svg',
  exerciseName: 'Full Body Dynamic Mobility',
  dayTag: 'Day 7 • Recovery',
  targetMuscle: 'Thoracic Spine, Hip Flexors & Hamstrings',
  equipment: 'Yoga Mat & Foam Roller',
  tempoCue: '30-45s Gentle Holds • Deep Diaphragmatic Breaths',
  figureSvg: `
    <!-- Exercise Mat -->
    <rect x="230" y="340" width="340" height="14" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>

    <!-- Lifter in Deep Lunge / Hip Opener -->
    <path d="M 270 340 L 340 340 L 390 290 L 460 290 L 510 340" fill="none" stroke="#38bdf8" stroke-width="11" stroke-linecap="round"/>
    <!-- Upright Torso Reaching Overhead -->
    <line x1="390" y1="290" x2="390" y2="190" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
    <path d="M 390 190 L 370 120" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <path d="M 390 190 L 410 120" stroke="#38bdf8" stroke-width="9" stroke-linecap="round"/>
    <circle cx="390" cy="165" r="16" fill="#334155" stroke="#64748b"/>
    <!-- Mobility Glow -->
    <circle cx="390" cy="280" r="16" fill="url(#activeMuscle)"/>
  `,
  motionArrows: `
    <path d="M 390 230 Q 420 200 420 150" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4 3" marker-end="url(#arrowSec)"/>
  `
});

// 33. Hydration, Nutrition & Sleep
buildSvg({
  filename: 'hydration_nutrition_sleep.svg',
  exerciseName: 'CNS Restoration & Hydration',
  dayTag: 'Day 7 • Recovery',
  targetMuscle: 'Cellular Hydration, Muscle Synthesis & REM',
  equipment: '3-4L Water, High Protein & 7-9h Sleep',
  tempoCue: 'Restore Glycogen • Magnesium & Deep Sleep',
  figureSvg: `
    <!-- Hydration Flask -->
    <g transform="translate(260, 200)">
      <rect x="0" y="25" width="50" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <rect x="15" y="10" width="20" height="18" rx="3" fill="#38bdf8"/>
      <rect x="6" y="55" width="38" height="52" rx="4" fill="rgba(56, 189, 248, 0.4)"/>
      <text x="25" y="85" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="700">3-4L</text>
    </g>

    <!-- Nutrition Plate / Macro Synthesis -->
    <g transform="translate(370, 200)">
      <circle cx="45" cy="65" r="45" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <path d="M 45 20 A 45 45 0 0 1 90 65 L 45 65 Z" fill="#f59e0b"/>
      <path d="M 90 65 A 45 45 0 0 1 45 110 L 45 65 Z" fill="#10b981"/>
      <path d="M 45 110 A 45 45 0 0 1 0 65 L 45 65 Z" fill="#38bdf8"/>
    </g>

    <!-- 7-9h Sleep Crescent Moon -->
    <g transform="translate(500, 200)">
      <path d="M 40 20 A 45 45 0 1 0 75 90 A 35 35 0 1 1 40 20 Z" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="60" y="125" text-anchor="middle" fill="#fde68a" font-family="sans-serif" font-size="12" font-weight="700">7-9h SLEEP</text>
    </g>
  `,
  motionArrows: ``
});

console.log('All 33 exercise demonstration SVGs successfully created!');

