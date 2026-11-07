import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import {
  workoutLibrary,
  getExercisesByLevel,
  findExerciseById
} from '../data/workoutLibrary';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles,
  Zap, Info, Activity, ShieldCheck, Eye, Compass, Gauge,
  Layers, Award, Check, Heart, MapPin, Wrench,
  Target, ArrowRight, Camera, Dumbbell, AlertTriangle,
  Maximize2, X, CheckCircle, Clock
} from 'lucide-react';

/**
 * Strict 1-to-1 Image Mapping for Intermediate Workout Split & All Gym Exercises
 */
export const STRICT_EXERCISE_IMAGES = {
  // DAY 1 — CHEST
  'barbell bench press': '/images/workouts/chest/bench-press.jpg',
  'bench press': '/images/workouts/chest/bench-press.jpg',
  'flat barbell bench press': '/images/workouts/chest/bench-press.jpg',
  'flat bench press': '/images/workouts/chest/bench-press.jpg',
  'incline dumbbell press': '/images/workouts/chest/incline-dumbbell-press.jpg',
  'incline bench press': '/images/workouts/chest/incline-dumbbell-press.jpg',
  'chest fly': '/images/workouts/chest/chest-fly.jpg',
  'dumbbell chest fly': '/images/workouts/chest/chest-fly.jpg',
  'dumbbell fly': '/images/workouts/chest/chest-fly.jpg',
  'dumbbell pullover': '/images/workouts/chest/dumbbell-pullover.jpg',
  'pullover': '/images/workouts/chest/dumbbell-pullover.jpg',
  'push-ups': '/images/workouts/chest/push-ups.jpg',
  'push ups': '/images/workouts/chest/push-ups.jpg',
  'pushup': '/images/workouts/chest/push-ups.jpg',
  'pushups': '/images/workouts/chest/push-ups.jpg',

  // DAY 2 — SHOULDERS
  'overhead press': '/images/workouts/shoulders/overhead-press.jpg',
  'overhead barbell press': '/images/workouts/shoulders/overhead-press.jpg',
  'barbell overhead press': '/images/workouts/shoulders/overhead-press.jpg',
  'military press': '/images/workouts/shoulders/overhead-press.jpg',
  'lateral raise': '/images/workouts/shoulders/lateral-raise.jpg',
  'dumbbell lateral raise': '/images/workouts/shoulders/lateral-raise.jpg',
  'dumbbell lateral raises': '/images/workouts/shoulders/lateral-raise.jpg',
  'lateral raises': '/images/workouts/shoulders/lateral-raise.jpg',
  'front raise': '/images/workouts/shoulders/front-raise.jpg',
  'front dumbbell raise': '/images/workouts/shoulders/front-raise.jpg',
  'front dumbbell raises': '/images/workouts/shoulders/front-raise.jpg',
  'rear delt fly': '/images/workouts/shoulders/rear-delt-fly.jpg',
  'rear delt dumbbell fly': '/images/workouts/shoulders/rear-delt-fly.jpg',
  'rear deltoid fly': '/images/workouts/shoulders/rear-delt-fly.jpg',
  'shrugs': '/images/workouts/shoulders/shrugs.jpg',
  'dumbbell shrugs': '/images/workouts/shoulders/shrugs.jpg',
  'barbell shrugs': '/images/workouts/shoulders/shrugs.jpg',

  // DAY 3 — BICEPS
  'barbell curl': '/images/workouts/biceps/barbell-curl.jpg',
  'standing barbell curl': '/images/workouts/biceps/barbell-curl.jpg',
  'dumbbell curl': '/images/workouts/biceps/dumbbell-curl.jpg',
  'standing dumbbell curl': '/images/workouts/biceps/dumbbell-curl.jpg',
  'hammer curl': '/images/workouts/biceps/hammer-curl.jpg',
  'dumbbell hammer curl': '/images/workouts/biceps/hammer-curl.jpg',
  'preacher curl': '/images/workouts/biceps/preacher-curl.jpg',
  'ez bar preacher curl': '/images/workouts/biceps/preacher-curl.jpg',
  'concentration curl': '/images/workouts/biceps/concentration-curl.jpg',
  'dumbbell concentration curl': '/images/workouts/biceps/concentration-curl.jpg',

  // DAY 4 — TRICEPS
  'close grip bench press': '/images/workouts/triceps/close-grip-bench-press.jpg',
  'close-grip bench press': '/images/workouts/triceps/close-grip-bench-press.jpg',
  'close grip barbell bench press': '/images/workouts/triceps/close-grip-bench-press.jpg',
  'rope push down': '/images/workouts/triceps/rope-pushdown.jpg',
  'rope pushdown': '/images/workouts/triceps/rope-pushdown.jpg',
  'cable rope pushdown': '/images/workouts/triceps/rope-pushdown.jpg',
  'overhead triceps extension': '/images/workouts/triceps/overhead-extension.jpg',
  'overhead dumbbell triceps extension': '/images/workouts/triceps/overhead-extension.jpg',
  'dumbbell overhead triceps extension': '/images/workouts/triceps/overhead-extension.jpg',
  'dips': '/images/workouts/triceps/dips.jpg',
  'bench dips': '/images/workouts/triceps/dips.jpg',
  'tricep dips': '/images/workouts/triceps/dips.jpg',
  'triceps kickback': '/images/workouts/triceps/triceps-kickback.jpg',
  'cable triceps kickback': '/images/workouts/triceps/triceps-kickback.jpg',
  'dumbbell triceps kickback': '/images/workouts/triceps/triceps-kickback.jpg',

  // DAY 5 — BACK
  'pull-ups': '/images/workouts/back/pull-ups.jpg',
  'pull ups': '/images/workouts/back/pull-ups.jpg',
  'pullup': '/images/workouts/back/pull-ups.jpg',
  'bodyweight pull-ups': '/images/workouts/back/pull-ups.jpg',
  'barbell row': '/images/workouts/back/barbell-row.jpg',
  'bent-over barbell row': '/images/workouts/back/barbell-row.jpg',
  'bent over barbell row': '/images/workouts/back/barbell-row.jpg',
  'lat pulldown': '/images/workouts/back/lat-pulldown.jpg',
  'wide-grip lat pulldown': '/images/workouts/back/lat-pulldown.jpg',
  'seated cable row': '/images/workouts/back/seated-cable-row.jpg',
  'cable row': '/images/workouts/back/seated-cable-row.jpg',
  'seated row': '/images/workouts/back/seated-cable-row.jpg',
  'deadlift': '/images/workouts/back/deadlift.jpg',
  'barbell deadlift': '/images/workouts/back/deadlift.jpg',
  'conventional deadlift': '/images/workouts/back/deadlift.jpg',

  // DAY 6 — LEGS
  'barbell squat': '/images/workouts/legs/barbell-squat.jpg',
  'back squat': '/images/workouts/legs/barbell-squat.jpg',
  'squat': '/images/workouts/legs/barbell-squat.jpg',
  'leg press': '/images/workouts/legs/leg-press.jpg',
  '45-degree leg press': '/images/workouts/legs/leg-press.jpg',
  'leg extension': '/images/workouts/legs/leg-extension.jpg',
  'seated leg extension': '/images/workouts/legs/leg-extension.jpg',
  'leg curl': '/images/workouts/legs/leg-curl.jpg',
  'lying leg curl': '/images/workouts/legs/leg-curl.jpg',
  'hamstring curl': '/images/workouts/legs/leg-curl.jpg',
  'calf raise': '/images/workouts/legs/calf-raise.jpg',
  'standing calf raise': '/images/workouts/legs/calf-raise.jpg',
  'standing barbell calf raise': '/images/workouts/legs/calf-raise.jpg',

  // DAY 7 — REST AND RECOVERY
  'walking': '/images/workouts/recovery/walking.jpg',
  'light walking': '/images/workouts/recovery/walking.jpg',
  'brisk walking': '/images/workouts/recovery/walking.jpg',
  'full body stretching': '/images/workouts/recovery/stretching.jpg',
  'stretching': '/images/workouts/recovery/stretching.jpg',
  'static stretching': '/images/workouts/recovery/stretching.jpg',
  'mobility exercises': '/images/workouts/recovery/mobility.jpg',
  'mobility work': '/images/workouts/recovery/mobility.jpg',
  'joint mobility': '/images/workouts/recovery/mobility.jpg'
};

/**
 * Resolves comprehensive metadata for any exercise name, target muscle, or level.
 */
export function getExerciseMeta(exerciseName = '', targetMuscle = '', preferredLevel = 'intermediate') {
  const normLevel = (preferredLevel || 'intermediate').toLowerCase();
  const currentList = workoutLibrary[normLevel] || workoutLibrary.intermediate;
  const cleanName = (exerciseName || '').toLowerCase().trim();

  // 1. Direct or substring match in current level
  let match = currentList.find(ex => ex.name.toLowerCase() === cleanName);
  if (!match) {
    match = currentList.find(ex => 
      cleanName.includes(ex.name.toLowerCase()) || 
      ex.name.toLowerCase().includes(cleanName)
    );
  }

  // 2. Search other levels
  if (!match) {
    for (const lvl of ['beginner', 'intermediate', 'advanced']) {
      match = workoutLibrary[lvl]?.find(ex => 
        ex.name.toLowerCase() === cleanName || 
        cleanName.includes(ex.name.toLowerCase()) || 
        ex.name.toLowerCase().includes(cleanName)
      );
      if (match) break;
    }
  }

  // 3. Fallback by muscle group in preferred level
  if (!match && targetMuscle) {
    const cleanMuscle = targetMuscle.toLowerCase();
    match = currentList.find(ex => cleanMuscle.includes(ex.targetMuscle.toLowerCase()) || ex.targetMuscle.toLowerCase().includes(cleanMuscle));
  }

  // 4. Default fallback
  const base = match || currentList[0] || {};

  // Check strict image lookup dictionary
  const strictImg = STRICT_EXERCISE_IMAGES[cleanName] || 
    Object.keys(STRICT_EXERCISE_IMAGES).find(key => cleanName.includes(key) || key.includes(cleanName)) ? 
    STRICT_EXERCISE_IMAGES[Object.keys(STRICT_EXERCISE_IMAGES).find(key => cleanName.includes(key) || key.includes(cleanName))] : null;

  return {
    ...base,
    name: exerciseName || base.name || 'Exercise',
    targetMuscle: targetMuscle || base.targetMuscle || 'General',
    imageUrl: strictImg || base.imageUrl || '/exercises/fallback.svg'
  };
}

export const WorkoutVideoDemonstrator = ({
  workoutDay,
  initialExerciseIndex = 0,
  onClose,
  isModal = false,
  selectedLevel = 'intermediate',
  onSelectLevel
}) => {
  const { user } = useAuth();
  const { showToast } = useFitness();

  const [activeLevel, setActiveLevel] = useState(
    selectedLevel || user?.fitnessLevel?.toLowerCase() || 'intermediate'
  );

  useEffect(() => {
    if (selectedLevel) {
      setActiveLevel(selectedLevel.toLowerCase());
    }
  }, [selectedLevel]);

  const exercises = workoutDay?.exercises || [];
  const [currentIndex, setCurrentIndex] = useState(initialExerciseIndex);
  const [completedExercises, setCompletedExercises] = useState({});
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Tab View Modes: Image Demonstration vs AI Form Guide vs Gym Machine
  const [mediaSource, setMediaSource] = useState('image'); // 'image' | 'guide' | 'machine'

  // Sync index when parent changes active exercise step
  useEffect(() => {
    if (initialExerciseIndex !== undefined && initialExerciseIndex >= 0 && initialExerciseIndex < (exercises.length || 1)) {
      setCurrentIndex(initialExerciseIndex);
    }
  }, [initialExerciseIndex]);

  const currentExercise = exercises[currentIndex] || {
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest',
    sets: 4,
    reps: '8-10',
    weight: '75 kg',
    instructions: 'Arch lower back slightly, retract scapulae, lower bar under control to lower sternum, drive up explosively.'
  };

  // Get rich metadata from workoutLibrary & strict image mapping
  const visualMeta = getExerciseMeta(currentExercise.name, currentExercise.targetMuscle, activeLevel);
  
  // Strict exercise demonstration image resolution
  const cleanCurrentName = (currentExercise.name || '').toLowerCase().trim();
  const demonstrationImage = STRICT_EXERCISE_IMAGES[cleanCurrentName] || 
    visualMeta.imageUrl || 
    '/images/workouts/chest/bench-press.jpg';

  const machine = visualMeta.machine || {
    name: `${visualMeta.equipment || 'Exercise'} Station`,
    type: 'Gym Machine / Free Weights',
    gymZone: 'Zone A • Main Gym Floor',
    setupGuide: 'Adjust seat and pin resistance according to target working sets.',
    equipmentChecklist: ['Workout Towel', 'Appropriate Weights'],
    alternatives: []
  };

  const handleNextEx = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevEx = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleExerciseComplete = () => {
    const key = `${workoutDay?.day || 1}-${currentIndex}`;
    const nextState = !completedExercises[key];
    setCompletedExercises(prev => ({ ...prev, [key]: nextState }));
    if (nextState && showToast) {
      showToast(`Completed ${currentExercise.name}! Great form!`, 'success');
    }
  };

  const isCurrentCompleted = !!completedExercises[`${workoutDay?.day || 1}-${currentIndex}`];

  const levelColor = activeLevel === 'beginner' 
    ? '#10b981' 
    : activeLevel === 'intermediate' 
    ? '#06b6d4' 
    : '#f59e0b';

  /* ─────────────────────────────────────────────────────────────
     RENDER 1: HIGH-QUALITY STATIC EXERCISE DEMONSTRATION IMAGE VIEWER
     (Completely replaces video player with responsive 16:9 image viewer)
     ───────────────────────────────────────────────────────────── */
  const renderImageDemonstration = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Main 16:9 Image Showcase Container */}
        <div 
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#070b13',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
            userSelect: 'none'
          }}
        >
          {/* Static Demonstration Photograph */}
          <img
            key={`${demonstrationImage}-${currentIndex}`}
            src={demonstrationImage}
            alt={`${currentExercise.name} Real Demonstration`}
            loading="lazy"
            onError={(e) => {
              // Graceful fallback to svg or default image
              e.target.onerror = null;
              e.target.src = '/exercises/fallback.svg';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'opacity 0.25s ease'
            }}
          />

          {/* Top Subtle Vignette Gradient for Overlay Contrast */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to bottom, rgba(7, 11, 19, 0.85) 0%, rgba(7, 11, 19, 0) 100%)',
            pointerEvents: 'none',
            zIndex: 5
          }} />

          {/* Bottom Vignette Gradient */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '90px',
            background: 'linear-gradient(to top, rgba(7, 11, 19, 0.92) 0%, rgba(7, 11, 19, 0.4) 50%, rgba(7, 11, 19, 0) 100%)',
            pointerEvents: 'none',
            zIndex: 5
          }} />

          {/* Top Left Overlay: Exercise Difficulty & Name */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: levelColor,
              color: '#080c14',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              {activeLevel.toUpperCase()}
            </span>

            <span style={{
              background: 'rgba(8, 12, 20, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              {currentExercise.name}
            </span>
          </div>

          {/* Top Right Overlay: Target Muscle, Equipment & Sets/Reps */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            <span style={{
              background: 'rgba(8, 12, 20, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {visualMeta.targetMuscle} • {visualMeta.equipment || 'Gym Equipment'}
            </span>

            <span style={{
              background: 'rgba(8, 12, 20, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 900,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              🎯 {currentExercise.sets || visualMeta.sets || 4} Sets × {currentExercise.reps || visualMeta.reps || '8-12'}
            </span>
          </div>

          {/* Bottom Overlay Info & Fullscreen Button */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: 'rgba(8, 12, 20, 0.85)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#94a3b8',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Camera size={11} color="var(--primary)" />
                Static Form Demonstration
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              style={{
                background: 'rgba(8, 12, 20, 0.85)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
              title="Expand image fullscreen"
            >
              <Maximize2 size={12} />
              <span>Zoom</span>
            </button>
          </div>
        </div>

        {/* Clean Exercise Control Bar (Replaces Video Player Controls) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Previous / Next Quick Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handlePrevEx}
              disabled={currentIndex === 0}
              className="btn btn-sm btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 800,
                gap: '4px',
                opacity: currentIndex === 0 ? 0.35 : 1
              }}
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNextEx}
              disabled={currentIndex >= exercises.length - 1}
              className="btn btn-sm btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 800,
                gap: '4px',
                opacity: currentIndex >= exercises.length - 1 ? 0.35 : 1
              }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginLeft: '6px' }}>
              Step {currentIndex + 1} / {exercises.length || 1}
            </span>
          </div>

          {/* Mark Complete Checkbox / Target Load Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock size={11} color="var(--cyan)" />
              {visualMeta.restSeconds || 90}s Rest
            </span>

            <button
              type="button"
              onClick={toggleExerciseComplete}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isCurrentCompleted ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                color: isCurrentCompleted ? '#080c14' : 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={13} />
              <span>{isCurrentCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>
          </div>
        </div>

        {/* Form Cue Banner */}
        {visualMeta.formCue && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Sparkles size={16} color="var(--cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--cyan)' }}>Form Cue: </strong>
              {visualMeta.formCue}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER 2: PRECISION AI FORM GUIDE & BIOMECHANICS
     ───────────────────────────────────────────────────────────── */
  const renderAIFormGuide = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Step-by-Step Execution Protocol */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Check size={16} strokeWidth={3} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>
                Step-by-Step Execution Protocol
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Biomechanically safe movement cadence for {activeLevel} lifters
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(visualMeta.steps || [currentExercise.instructions]).map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 900, flexShrink: 0, marginTop: '1px'
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes to Avoid */}
        {visualMeta.commonMistakes && visualMeta.commonMistakes.length > 0 && (
          <div className="card" style={{ padding: '16px', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#f87171' }}>
                  Common Mistakes to Avoid
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Protect joints and prevent injury during heavy training
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visualMeta.commonMistakes.map((mistake, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '13px' }}>✕</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {mistake}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load & Target Muscles Grid */}
        <div className="grid-2" style={{ gap: '10px' }}>
          <div className="card" style={{ padding: '12px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              Primary Target Muscle
            </span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {visualMeta.targetMuscle}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Equipment: {visualMeta.equipment}
            </span>
          </div>

          <div className="card" style={{ padding: '12px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              Suggested Working Load
            </span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>
              {currentExercise.weight || visualMeta.suggestedLoad || 'Moderate'}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Rest: {currentExercise.restTime || visualMeta.restSeconds || 60}s between sets
            </span>
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
        {/* Machine Identity Banner */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Wrench size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {machine.name}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {machine.type}
                </span>
              </div>
            </div>

            <span className="badge badge-success" style={{ fontSize: '10px' }}>
              📍 {machine.gymZone || 'Gym Floor'}
            </span>
          </div>

          {/* Setup / Pin Calibration */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '12px',
            marginTop: '14px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan)', display: 'block', marginBottom: '4px' }}>
              📐 Seat &amp; Pin Calibration Guide
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
              {machine.setupGuide || machine.pinSetup || 'Adjust seat so handle grips align with mid-chest. Verify weight stack pin is fully engaged.'}
            </p>
          </div>

          {/* Equipment Checklist */}
          {machine.equipmentChecklist && machine.equipmentChecklist.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Required Equipment Checklist:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {machine.equipmentChecklist.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Machine Alternatives Swaps */}
        {machine.alternatives && machine.alternatives.length > 0 && (
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)' }}>
              🔄 In-Gym Machine Alternatives &amp; Swaps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {machine.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    gap: '8px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{alt.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                      {alt.zone} &bull; {alt.swapReason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="workout-video-demonstrator-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Exercise Title & Navigation Header Bar */}
      <div className="flex-between" style={{ alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: levelColor,
              color: '#080c14',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>
              {activeLevel}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
              EXERCISE {currentIndex + 1} OF {exercises.length || 1}
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0', color: 'var(--text-primary)' }}>
            {currentExercise.name}
          </h3>
        </div>

        {/* Stepper Navigation Buttons (< >) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={handlePrevEx}
            disabled={currentIndex === 0}
            className="icon-btn"
            style={{ width: '32px', height: '32px', opacity: currentIndex === 0 ? 0.35 : 1 }}
            title="Previous Exercise"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextEx}
            disabled={currentIndex >= exercises.length - 1}
            className="icon-btn"
            style={{ width: '32px', height: '32px', opacity: currentIndex >= exercises.length - 1 ? 0.35 : 1 }}
            title="Next Exercise"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Media Source Tab Selector: Demonstration Image vs AI Form Guide vs Gym Machine */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid var(--border-color)',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setMediaSource('image')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: mediaSource === 'image' ? 'var(--primary)' : 'transparent',
            color: mediaSource === 'image' ? '#080c14' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Camera size={14} />
          <span>Exercise Demonstration</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaSource('guide')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: mediaSource === 'guide' ? 'var(--primary)' : 'transparent',
            color: mediaSource === 'guide' ? '#080c14' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={14} />
          <span>AI Form Guide</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaSource('machine')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: mediaSource === 'machine' ? 'var(--primary)' : 'transparent',
            color: mediaSource === 'machine' ? '#080c14' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Wrench size={14} />
          <span>Gym Machine</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {mediaSource === 'image' && renderImageDemonstration()}
      {mediaSource === 'guide' && renderAIFormGuide()}
      {mediaSource === 'machine' && renderGymMachineGuide()}

      {/* Fullscreen Lightbox Zoom Modal */}
      {isZoomModalOpen && (
        <div 
          onClick={() => setIsZoomModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 13, 0.94)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#070b13',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: '#fff' }}>
                  {currentExercise.name}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {visualMeta.targetMuscle} • {visualMeta.equipment}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ width: '100%', maxHeight: '70vh', overflow: 'hidden', background: '#000' }}>
              <img
                src={demonstrationImage}
                alt={currentExercise.name}
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {visualMeta.formCue && (
              <div style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <strong style={{ color: 'var(--cyan)', fontSize: '12px' }}>Form Cue: </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{visualMeta.formCue}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutVideoDemonstrator;
