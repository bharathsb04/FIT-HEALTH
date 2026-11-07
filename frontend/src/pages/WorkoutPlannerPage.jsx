import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { WorkoutVideoDemonstrator, getExerciseMeta } from '../components/WorkoutVideoDemonstrator';
import {
  workoutLibrary,
  getExercisesByLevel,
  getExercisesByLevelAndMuscle
} from '../data/workoutLibrary';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  Play,
  Pause,
  CheckCircle2,
  Plus,
  RotateCcw,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Trash2,
  SkipForward,
  Trophy,
  History,
  Video,
  Eye,
  Zap,
  Film,
  X,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Check,
  CheckCheck,
  Heart,
  Droplet,
  Utensils,
  Moon,
  TrendingUp,
  Info,
  Award,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Compass,
  Gauge,
  Calendar,
  Footprints,
  BedDouble,
  Target,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const WorkoutPlannerPage = () => {
  const { user } = useAuth();
  const { showToast, triggerRefresh } = useFitness();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(
    (user?.fitnessLevel?.toLowerCase() === 'beginner' || user?.fitnessLevel?.toLowerCase() === 'advanced')
      ? user.fitnessLevel.toLowerCase()
      : 'intermediate'
  );

  // Visual Blueprint Poster Modal state
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Active workout session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState(0);

  // One-by-one Step mode state
  const [plannerViewMode, setPlannerViewMode] = useState('list'); // 'step' (One-by-one) | 'list' (All cards)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);

  // Video demonstrator state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Instructions & technique toggle map
  const [openInstructions, setOpenInstructions] = useState({});

  // Warm-up & Cooldown interactive state
  const [showWarmupGuide, setShowWarmupGuide] = useState(false);
  const [warmupTimerActive, setWarmupTimerActive] = useState(false);
  const [warmupCountdown, setWarmupCountdown] = useState(300); // 5 mins

  // Day 7 Recovery State: Hydration & Stretch Timer
  const [waterGlasses, setWaterGlasses] = useState(() => {
    try {
      return Number(localStorage.getItem('fit_health_water_recovery') || 4);
    } catch (e) {
      return 4;
    }
  });
  const [stretchTimerActive, setStretchTimerActive] = useState(false);
  const [stretchCountdown, setStretchCountdown] = useState(45); // 45s per stretch

  // Add custom exercise modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: '',
    targetMuscle: 'Chest',
    sets: 3,
    reps: '10-12',
    weight: '25 kg',
    restTime: 60,
    instructions: ''
  });

  // History modal
  const [showHistory, setShowHistory] = useState(false);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkouts();
      if (res.success && res.plan) {
        setWorkoutPlan(res.plan);
        setSelectedDayIndex(res.plan.activeDayIndex || 0);
      }
    } catch (err) {
      showToast('Could not load workout plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Workout Session Timer
  useEffect(() => {
    let interval = null;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Rest countdown timer
  useEffect(() => {
    let interval = null;
    if (restTimerActive && restCountdown > 0) {
      interval = setInterval(() => {
        setRestCountdown(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            showToast('⏰ Rest period over! Ready for your next set.', 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restCountdown === 0) {
      setRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restCountdown]);

  // Warmup timer
  useEffect(() => {
    let interval = null;
    if (warmupTimerActive && warmupCountdown > 0) {
      interval = setInterval(() => {
        setWarmupCountdown(prev => {
          if (prev <= 1) {
            setWarmupTimerActive(false);
            showToast('🔥 Warm-up complete! CNS primed for working sets.', 'success');
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [warmupTimerActive, warmupCountdown]);

  // Stretch timer
  useEffect(() => {
    let interval = null;
    if (stretchTimerActive && stretchCountdown > 0) {
      interval = setInterval(() => {
        setStretchCountdown(prev => {
          if (prev <= 1) {
            setStretchTimerActive(false);
            showToast('🧘 Stretch hold complete! Switch to next side or pose.', 'success');
            return 45;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stretchTimerActive, stretchCountdown]);

  const handleStartRest = (seconds = 60) => {
    setRestCountdown(seconds);
    setRestTimerActive(true);
    showToast(`⏱️ ${seconds}s rest timer started. Catch your breath!`, 'info');
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = async (exerciseId, currentStatus) => {
    try {
      const ex = currentDay?.exercises?.find(e => e.id === exerciseId);
      const totalSets = Number(ex?.sets) || 4;
      const nextStatus = !currentStatus;
      const updatedSets = Array(totalSets).fill(nextStatus);

      const res = await api.updateWorkout(exerciseId, {
        completed: nextStatus,
        completedSets: updatedSets,
        dayIndex: selectedDayIndex
      });
      if (res.success) {
        setWorkoutPlan(res.plan);
        if (nextStatus) {
          showToast('✅ Exercise completed! Great discipline.', 'success');
        }
      }
    } catch (err) {
      showToast('Error updating exercise status', 'error');
    }
  };

  const handleToggleSet = async (exerciseId, setIdx, currentVal) => {
    try {
      const ex = currentDay?.exercises?.find(e => e.id === exerciseId);
      if (!ex) return;
      const totalSets = Number(ex.sets) || 4;
      const currentSets = (ex.completedSets && ex.completedSets.length === totalSets)
        ? [...ex.completedSets]
        : Array(totalSets).fill(false);
      
      currentSets[setIdx] = !currentVal;
      const allDone = currentSets.every(Boolean);

      // Trigger rest timer when finishing a set
      if (!currentVal && ex.restTime) {
        handleStartRest(Number(ex.restTime) || 60);
      }

      const res = await api.updateWorkout(exerciseId, {
        dayIndex: selectedDayIndex,
        completedSets: currentSets,
        completed: allDone
      });

      if (res.success) {
        setWorkoutPlan(res.plan);
        if (!currentVal) {
          showToast(`Set ${setIdx + 1} of ${totalSets} recorded! Rest timer started.`, 'success');
        }
      }
    } catch (err) {
      showToast('Could not record set', 'error');
    }
  };

  const handleUpdateExerciseValue = async (exerciseId, field, value) => {
    try {
      const res = await api.updateWorkout(exerciseId, {
        [field]: value,
        dayIndex: selectedDayIndex
      });
      if (res.success) {
        setWorkoutPlan(res.plan);
      }
    } catch (err) {
      // debounce ignore
    }
  };

  const handleAddCustomExercise = async (e) => {
    e.preventDefault();
    if (!customEx.name.trim()) return;

    try {
      const res = await api.createExercise(selectedDayIndex, customEx);
      if (res.success) {
        setWorkoutPlan(res.plan);
        setShowAddModal(false);
        setCustomEx({
          name: '',
          targetMuscle: 'Chest',
          sets: 3,
          reps: '10-12',
          weight: '25 kg',
          restTime: 60,
          instructions: ''
        });
        showToast(`Added ${customEx.name} to routine!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add exercise', 'error');
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      const res = await api.deleteExercise(exerciseId);
      if (res.success) {
        setWorkoutPlan(res.plan);
        showToast('Exercise removed from workout.', 'info');
      }
    } catch (err) {
      showToast('Could not delete exercise', 'error');
    }
  };

  const handleFinishWorkout = async () => {
    try {
      const durationMins = Math.max(1, Math.round(sessionTimerSeconds / 60));
      const res = await api.completeWorkout(selectedDayIndex, durationMins);
      if (res.success) {
        setWorkoutPlan(res.plan);
        setSessionActive(false);
        setSessionTimerSeconds(0);

        // Confetti celebration
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 }
        });

        showToast(`🎉 Workout complete! ${res.session.totalVolumeKg.toLocaleString()} kg total volume moved!`, 'success', 4000);
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Error completing workout', 'error');
    }
  };

  const handleGoalSplitReset = async (goal) => {
    try {
      const res = await api.resetSplit(goal);
      if (res.success) {
        setWorkoutPlan(res.plan);
        setSelectedDayIndex(0);
        showToast(`Split updated to ${goal} 7-day protocol!`, 'success');
      }
    } catch (err) {
      showToast('Failed to switch split', 'error');
    }
  };

  const handleAddWater = () => {
    setWaterGlasses(prev => {
      const next = Math.min(16, prev + 1);
      try { localStorage.setItem('fit_health_water_recovery', next); } catch (e) {}
      showToast(`💧 ${next * 250}ml of 3,500ml hydration goal logged!`, 'info');
      return next;
    });
  };

  const days = workoutPlan?.days || [];
  const currentDay = days[selectedDayIndex] || days[0];

  const getCanonicalMuscle = (group = '') => {
    const g = (group || '').toLowerCase();
    if (g.includes('chest') || g.includes('pectoral')) return 'Chest';
    if (g.includes('back') || g.includes('lat') || g.includes('row')) return 'Back';
    if (g.includes('shoulder') || g.includes('delt')) return 'Shoulders';
    if (g.includes('leg') || g.includes('quad') || g.includes('hamstring') || g.includes('squat')) return 'Legs';
    if (g.includes('bicep') || g.includes('tricep') || g.includes('arm')) return 'Arms';
    if (g.includes('core') || g.includes('ab')) return 'Core';
    if (g.includes('cardio') || g.includes('hiit') || g.includes('recovery')) return 'Cardio';
    return 'Chest';
  };

  const currentMuscleGroup = getCanonicalMuscle(currentDay?.targetGroup || currentDay?.dayName || 'Chest');

  // Enriched exercises for currentDay with workoutLibrary metadata
  const enrichedExercises = (currentDay?.exercises || []).map(ex => {
    const meta = getExerciseMeta(ex.name, ex.targetMuscle || currentMuscleGroup, ex.level || selectedLevel);
    return {
      ...meta,
      ...ex,
      level: ex.level || selectedLevel,
      imageUrl: ex.imageUrl || meta.imageUrl || `/exercises/${selectedLevel}/${currentMuscleGroup.toLowerCase()}.svg`,
      videoUrl: ex.videoUrl || meta.videoUrl,
      videoPoster: ex.imageUrl || meta.videoPoster || meta.imageUrl,
      formCue: ex.technique || meta.formCue || ex.instructions,
      steps: ex.instructions ? [ex.instructions, ...(ex.technique ? [ex.technique] : [])] : (meta.steps || ['Perform with controlled form.']),
      commonMistakes: ex.commonMistakes || meta.commonMistakes || ['Avoid swinging weight', 'Keep core braced throughout']
    };
  });

  const completedExercises = enrichedExercises.filter(e => e.completed)?.length || 0;
  const totalExercises = enrichedExercises.length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  // Weekly Dashboard calculations (Training Days: Days 1-6)
  const trainingDays = days.slice(0, 6);
  const completedDaysCount = trainingDays.filter(day => 
    day.exercises && day.exercises.length > 0 && day.exercises.every(e => e.completed)
  ).length;
  const remainingDaysCount = Math.max(0, 6 - completedDaysCount);
  const totalWeeklyExercises = trainingDays.reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
  const totalWeeklyCompletedExercises = trainingDays.reduce((acc, d) => acc + (d.exercises?.filter(e => e.completed)?.length || 0), 0);
  const weeklyProgressPercent = totalWeeklyExercises > 0
    ? Math.round((totalWeeklyCompletedExercises / totalWeeklyExercises) * 100)
    : 0;

  const handleLoadLevelRoutine = async (levelToLoad) => {
    try {
      setSelectedLevel(levelToLoad);
      const canonicalMuscle = getCanonicalMuscle(currentDay?.targetGroup || currentDay?.dayName || 'Chest');
      const curated = getExercisesByLevelAndMuscle(levelToLoad, canonicalMuscle);
      if (!curated || curated.length === 0) return;

      const formatted = curated.map((ex, idx) => ({
        id: `ex_${levelToLoad}_${Date.now()}_${idx}`,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: ex.sets || (levelToLoad === 'beginner' ? 3 : levelToLoad === 'advanced' ? 5 : 4),
        reps: ex.reps || (levelToLoad === 'beginner' ? '12-15' : levelToLoad === 'advanced' ? '6-8' : '8-12'),
        weight: ex.suggestedLoad || 'Moderate',
        restTime: ex.restSeconds || 60,
        instructions: ex.formCue || ex.steps?.[0] || 'Perform with controlled form.',
        completed: false,
        completedSets: Array(ex.sets || 4).fill(false),
        imageUrl: ex.imageUrl,
        level: levelToLoad
      }));

      const updatedDays = [...days];
      updatedDays[selectedDayIndex] = {
        ...currentDay,
        exercises: formatted
      };
      setWorkoutPlan(prev => ({ ...prev, days: updatedDays }));
      setCurrentStepIndex(0);
      showToast(`⚡ Activated ${levelToLoad.toUpperCase()} protocol (${formatted.length} exercises)!`, 'success');
    } catch (e) {
      console.warn('Could not load level routine:', e);
    }
  };

  const isRecoveryDay = selectedDayIndex === 6 || currentDay?.dayNumber === 7;

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Workout Planner" subtitle="Intermediate 7-Day Protocol & Progressive Overload" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Active Session Timer Floating Bar */}
        {sessionActive && (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(15, 23, 42, 0.95))',
              borderColor: '#f59e0b',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: '64px',
              zIndex: 35,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.2s infinite' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#fef3c7', fontWeight: 800, letterSpacing: '0.5px' }}>
                  ⚡ LIVE INTERMEDIATE WORKOUT IN PROGRESS
                </span>
                <h4 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', color: '#ffffff', margin: 0 }}>
                  {formatTimer(sessionTimerSeconds)}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setSessionActive(false)}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '12px', padding: '6px 12px', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <Pause size={14} />
                <span>Pause</span>
              </button>

              <button
                onClick={handleFinishWorkout}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '12px', padding: '8px 16px', background: '#f59e0b', color: '#080c14', fontWeight: 800 }}
              >
                Finish &amp; Log
              </button>
            </div>
          </div>
        )}

        {/* 6. WEEKLY DASHBOARD (Top of Workout Page) */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #080c14 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            padding: '22px 24px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Header Row: Welcome Member & Intermediate Badge */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Flame size={13} color="#f59e0b" />
                  INTERMEDIATE TRAINING LEVEL
                </span>

                <span style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#6ee7b7',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  Current: Week 1 of 4
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '8px 0 2px' }}>
                Welcome Back, {user?.name || 'Athlete'}! 💪
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                7-Day Intermediate Split &bull; Muscle Hypertrophy, Progressive Overload &amp; CNS Recovery
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowPosterModal(true)}
                className="btn btn-sm btn-outline"
                style={{
                  fontSize: '11px',
                  padding: '8px 14px',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  color: '#fde68a',
                  fontWeight: 700,
                  gap: '6px'
                }}
              >
                <Maximize2 size={13} color="#f59e0b" />
                <span>6-Day Blueprint Poster</span>
              </button>

              <button
                onClick={() => setShowHistory(true)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '8px 12px', gap: '6px' }}
              >
                <History size={13} />
                <span>Log History</span>
              </button>
            </div>
          </div>

          {/* Key Metric Cards: Weekly Progress, Completed Days, Remaining Days, Completed Exercises */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}>
            {/* Metric 1: Weekly Progress % */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                WEEKLY WORKOUT PROGRESS
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b' }}>
                  {weeklyProgressPercent}%
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px', marginTop: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${weeklyProgressPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #eab308)' }}
                />
              </div>
            </div>

            {/* Metric 2: Completed Training Days */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                COMPLETED TRAINING DAYS
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>
                  {completedDaysCount}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>of 6 Days Target</span>
              </div>
              <span style={{ fontSize: '11px', color: completedDaysCount >= 6 ? '#10b981' : 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                {completedDaysCount >= 6 ? '✨ Week Completed!' : `${6 - completedDaysCount} days left`}
              </span>
            </div>

            {/* Metric 3: Remaining Training Days */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                REMAINING TRAINING DAYS
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>
                  {remainingDaysCount}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Days Left</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                + 1 Dedicated Rest Day
              </span>
            </div>

            {/* Metric 4: Total Completed Exercises */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                TOTAL COMPLETED EXERCISES
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#fef08a' }}>
                  {totalWeeklyCompletedExercises}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>of {totalWeeklyExercises} Sets</span>
              </div>
              <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                ⚡ Strict Form &amp; Tempo
              </span>
            </div>
          </div>

          {/* 7-DAY INTERACTIVE WEEKLY NAVIGATION LAYOUT */}
          <div>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fde68a', letterSpacing: '0.4px' }}>
                📅 7-DAY SCHEDULE &bull; SELECT WORKOUT DAY:
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Active: Day {selectedDayIndex + 1} ({currentDay?.targetGroup})
              </span>
            </div>

            <div className="horizontal-scroll-row" style={{ gap: '8px', paddingBottom: '4px' }}>
              {days.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                const isRecovery = idx === 6 || day.dayNumber === 7;
                const isCompleted = !isRecovery && day.exercises && day.exercises.length > 0 && day.exercises.every(e => e.completed);
                const isUpcoming = !isCompleted && !isSelected && !isRecovery;

                return (
                  <button
                    key={day.dayNumber || idx}
                    type="button"
                    onClick={() => {
                      setSelectedDayIndex(idx);
                      setCurrentStepIndex(0);
                    }}
                    style={{
                      flex: '1 0 125px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: isSelected
                        ? (isRecovery ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.18)')
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected
                        ? (isRecovery ? '2px solid #38bdf8' : '2px solid #f59e0b')
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 0 16px rgba(245, 158, 11, 0.25)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="flex-between" style={{ width: '100%' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        color: isSelected ? (isRecovery ? '#38bdf8' : '#f59e0b') : 'var(--text-muted)'
                      }}>
                        DAY {day.dayNumber || idx + 1}
                      </span>

                      {/* Visual Indicators: Completed / Today / Upcoming / Recovery */}
                      {isCompleted && (
                        <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Check size={11} strokeWidth={3} /> Done
                        </span>
                      )}
                      {isSelected && !isCompleted && (
                        <span style={{ fontSize: '9px', color: isRecovery ? '#38bdf8' : '#f59e0b', fontWeight: 800 }}>
                          ● Today
                        </span>
                      )}
                      {isUpcoming && (
                        <span style={{ fontSize: '9px', color: '#64748b' }}>
                          Upcoming
                        </span>
                      )}
                      {isRecovery && (
                        <span style={{ fontSize: '9px', color: '#38bdf8', fontWeight: 700 }}>
                          🧘 Rest
                        </span>
                      )}
                    </div>

                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {day.dayName?.split('—')[1]?.trim() || day.dayName || day.targetGroup}
                    </h4>

                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {isRecovery ? 'Rest & Repair' : `${day.exercises?.length || 5} Exercises`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8. WARM-UP & SAFETY GUIDE BANNER */}
        {!isRecoveryDay && (
          <div
            className="card"
            style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '14px 18px',
              borderRadius: '12px'
            }}
          >
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame size={18} color="#f59e0b" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fef08a', margin: 0 }}>
                    5–10 MIN DYNAMIC WARM-UP &bull; INJURY PREVENTION
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {currentDay?.warmup || 'Perform arm circles, band pull-aparts, rotator cuff activations and 2 progressive warm-up sets.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWarmupTimerActive(!warmupTimerActive)}
                  className="btn btn-xs btn-outline"
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    fontWeight: 700,
                    gap: '4px'
                  }}
                >
                  <Clock size={12} />
                  <span>{warmupTimerActive ? `Timer: ${formatTimer(warmupCountdown)}` : 'Start 5m Warmup'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWarmupGuide(!showWarmupGuide)}
                  className="btn btn-xs btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  {showWarmupGuide ? 'Hide Steps' : 'View Protocol'}
                </button>
              </div>
            </div>

            {showWarmupGuide && (
              <div style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}>
                <div>1. <b>Light Cardio (3 mins):</b> Treadmill, bike, or jumping jacks.</div>
                <div>2. <b>Joint Mobility (2 mins):</b> Arm circles, hip 90/90s, and cat-cow.</div>
                <div>3. <b>Band Activation (2 mins):</b> Band pull-aparts and face-pulls.</div>
                <div>4. <b>Pyramid Sets (3 mins):</b> 50% &amp; 70% working weight for 5 reps.</div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            DAY 7: DEDICATED REST AND RECOVERY SCREEN
            ========================================================================= */}
        {isRecoveryDay ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Banner */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '20px 22px',
                borderRadius: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Heart size={20} color="#38bdf8" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
                    RECOVERY &bull; DAY 7 OF 7
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    Rest, Repair &amp; CNS Restoration
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                No intense weight training today. True muscle hypertrophy and strength adaptations take place during rest. Follow the 3 recovery pillars below to ensure full tissue repair, glycogen restocking, and CNS reset.
              </p>
            </div>

            {/* 3 Dedicated Recovery Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              
              {/* Card 1: Light Zone 2 Walk */}
              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#070b13',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img
                    src="/exercises/intermediate/light_zone2_walk.svg"
                    alt="Light Zone 2 Walk"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                  />
                </div>

                <div>
                  <div className="flex-between">
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>1. Light 30-min Zone 2 Walk</h4>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>Active Recovery</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    Target: Lymphatic Flow &bull; 60-70% Max Heart Rate
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    A brisk outdoor or treadmill walk stimulates blood circulation and flushes lactic waste without draining glycogen or stressing joints.
                  </p>
                </div>

                <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => handleStartRest(1800)}
                    className="btn btn-sm btn-primary"
                    style={{ width: '100%', background: '#10b981', color: '#080c14', fontWeight: 800 }}
                  >
                    Start 30-Min Walk Timer
                  </button>
                </div>
              </div>

              {/* Card 2: Full Body Dynamic Stretching */}
              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#070b13',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img
                    src="/exercises/intermediate/full_body_stretching.svg"
                    alt="Full Body Stretching"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                  />
                </div>

                <div>
                  <div className="flex-between">
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>2. Stretching &amp; Mobility</h4>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>Joint Restoration</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    Target: Thoracic Spine, Hip Flexors, Hamstrings &amp; Fascia
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    Perform 5 guided mobility poses: hip 90/90s, world's greatest stretch, kneeling quad stretch, and deep diaphragmatic belly breathing.
                  </p>
                </div>

                <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setStretchTimerActive(!stretchTimerActive)}
                    className="btn btn-sm btn-outline"
                    style={{ width: '100%', borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 800 }}
                  >
                    {stretchTimerActive ? `Pose Timer: ${stretchCountdown}s` : 'Start 45s Stretch Timer'}
                  </button>
                </div>
              </div>

              {/* Card 3: Hydration, Nutrition & Sleep */}
              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#070b13',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img
                    src="/exercises/intermediate/hydration_nutrition_sleep.svg"
                    alt="Hydration Nutrition Sleep"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                  />
                </div>

                <div>
                  <div className="flex-between">
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>3. Hydration, Nutrition &amp; Sleep</h4>
                    <span className="badge badge-warning" style={{ fontSize: '10px' }}>Recovery Triad</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#fef3c7', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    Target: 3–4L Water &bull; 2.0g/kg Protein &bull; 7–9h REM Sleep
                  </span>
                  
                  {/* Interactive Water Logger */}
                  <div style={{
                    margin: '10px 0',
                    background: 'rgba(56, 189, 248, 0.08)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}>
                    <div className="flex-between" style={{ fontSize: '11px', fontWeight: 700 }}>
                      <span>Hydration Tracker:</span>
                      <span style={{ color: '#38bdf8' }}>{waterGlasses * 250}ml / 3,500ml</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '14px',
                            cursor: 'pointer',
                            opacity: i < waterGlasses ? 1 : 0.25
                          }}
                          onClick={handleAddWater}
                          title={`Glass ${i + 1} (250ml)`}
                        >
                          💧
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={handleAddWater}
                    className="btn btn-sm btn-primary"
                    style={{ width: '100%', background: '#38bdf8', color: '#080c14', fontWeight: 800 }}
                  >
                    + Log 250ml Water Glass
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* =========================================================================
              DAYS 1–6: LIFTING WORKOUT ROUTINE & EXERCISE CARDS
              ========================================================================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Current Day Routine Banner */}
            <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
              <div className="card-header" style={{ marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    INTERMEDIATE SPLIT &bull; DAY {currentDay?.dayNumber} &bull; {currentDay?.targetGroup?.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '2px', color: '#ffffff' }}>
                    {currentDay?.dayName}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVideoIndex(0);
                      setShowVideoModal(true);
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '12px', padding: '7px 12px', gap: '6px' }}
                  >
                    <Video size={14} color="#f59e0b" />
                    <span>Watch Demos</span>
                  </button>

                  {!sessionActive ? (
                    <button
                      onClick={() => {
                        setSessionActive(true);
                        showToast('Workout session started! Timer running.', 'info');
                      }}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '12px', padding: '8px 16px', gap: '6px', background: '#f59e0b', color: '#080c14', fontWeight: 800 }}
                    >
                      <Play size={14} fill="#080c14" />
                      <span>Start Workout</span>
                    </button>
                  ) : (
                    <span className="badge badge-fitness">Session Live</span>
                  )}

                  <button
                    id="btn-complete-workout"
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', gap: '6px' }}
                    onClick={handleFinishWorkout}
                  >
                    <Trophy size={14} />
                    <span>Complete &amp; Log</span>
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Focus: {currentDay?.focus || 'Compound strength & muscle hypertrophy with strict tempo.'}
              </p>

              {/* Day Completion Progress Bar */}
              <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Exercises Completed: <b style={{ color: '#f59e0b' }}>{completedExercises} of {totalExercises}</b></span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '7px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%`, background: '#f59e0b' }}
                />
              </div>
            </div>

            {/* Rest Interval Countdown Banner (When Active) */}
            {restTimerActive && (
              <div
                className="card"
                style={{
                  padding: '12px 18px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.9))',
                  border: '1px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#f59e0b" />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fef3c7' }}>REST INTERVAL ACTIVE</span>
                    <h4 style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#ffffff', margin: 0 }}>
                      {restCountdown}s remaining
                    </h4>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setRestCountdown(prev => prev + 30)}
                    className="btn btn-xs btn-outline"
                    style={{ fontSize: '10px' }}
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setRestTimerActive(false)}
                    className="btn btn-xs btn-secondary"
                    style={{ fontSize: '10px' }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* View Mode Toggle: All List vs 1-by-1 Step */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  {plannerViewMode === 'step'
                    ? `Step-by-Step Focus: Exercise ${currentStepIndex + 1} of ${enrichedExercises.length || 0}`
                    : `Day ${currentDay?.dayNumber} Workout Cards (${enrichedExercises.length || 0} Exercises)`}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                  Each exercise features its individual biomechanical demonstration image, sets, reps &amp; cues.
                </span>
              </div>

              <div style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setPlannerViewMode('list')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: plannerViewMode === 'list' ? '#f59e0b' : 'transparent',
                    color: plannerViewMode === 'list' ? '#080c14' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  All Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerViewMode('step')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: plannerViewMode === 'step' ? '#f59e0b' : 'transparent',
                    color: plannerViewMode === 'step' ? '#080c14' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  1-by-1 Step
                </button>
              </div>
            </div>

            {/* =========================================================================
                VIEW MODE: 1-BY-1 STEP VIEW
                ========================================================================= */}
            {plannerViewMode === 'step' && enrichedExercises[currentStepIndex] && (() => {
              const ex = enrichedExercises[currentStepIndex];
              const isFirst = currentStepIndex === 0;
              const isLast = currentStepIndex === enrichedExercises.length - 1;
              const totalSetsCount = Number(ex.sets) || 4;

              return (
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #080c14 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {/* Step Header */}
                  <div className="flex-between">
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                        EXERCISE {currentStepIndex + 1} OF {enrichedExercises.length}
                      </span>
                      <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>
                        {ex.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 700 }}>
                        Target: {ex.targetMuscle} &bull; ⚙️ {ex.equipment || 'Equipment'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleComplete(ex.id, ex.completed)}
                      className={`btn btn-sm ${ex.completed ? 'btn-success' : 'btn-outline'}`}
                      style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{ex.completed ? 'Completed' : 'Mark Completed'}</span>
                    </button>
                  </div>

                  {/* Specific Demonstration Image (16:9 Responsive) */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#070b13',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative'
                  }}>
                    <img
                      src={ex.imageUrl || `/exercises/${selectedLevel}/${currentMuscleGroup.toLowerCase()}.svg`}
                      alt={ex.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                    />

                    {/* Quick Video Launcher Overlay */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVideoIndex(currentStepIndex);
                        setShowVideoModal(true);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(8, 12, 20, 0.85)',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        color: '#fde68a',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Video size={13} color="#f59e0b" />
                      <span>Watch Demo Video</span>
                    </button>
                  </div>

                  {/* 4. WORKOUT CARD PARAMETERS (Sets, Reps, Rest, Weight) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px'
                  }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>SETS</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>{ex.sets} Sets</span>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>REPETITIONS</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>{ex.reps}</span>
                    </div>

                    <div
                      style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer' }}
                      onClick={() => handleStartRest(Number(ex.restTime) || 60)}
                      title="Click to start rest timer"
                    >
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>REST INTERVAL</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8' }}>⏱️ {ex.restTime || 60}s</span>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>WORKING LOAD</span>
                      <input
                        type="text"
                        value={ex.weight || ''}
                        onChange={(e) => handleUpdateExerciseValue(ex.id, 'weight', e.target.value)}
                        placeholder="e.g. 75 kg"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fef08a',
                          fontSize: '16px',
                          fontWeight: 800,
                          width: '100%',
                          outline: 'none',
                          padding: 0
                        }}
                      />
                    </div>
                  </div>

                  {/* 5. INTERACTIVE SET-BY-SET COMPLETION TRACKING */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 14px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#fde68a', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      ⚡ LOG WORKING SETS (Tap set when completed to trigger rest timer):
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Array.from({ length: totalSetsCount }).map((_, sIdx) => {
                        const isSetDone = ex.completedSets ? !!ex.completedSets[sIdx] : ex.completed;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleToggleSet(ex.id, sIdx, isSetDone)}
                            style={{
                              flex: '1 0 85px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: isSetDone ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                              background: isSetDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              color: isSetDone ? '#6ee7b7' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <CheckCircle2 size={14} color={isSetDone ? '#10b981' : 'currentColor'} />
                            <span>Set {sIdx + 1} {isSetDone ? '✓' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 8. PROPER TECHNIQUE, INSTRUCTIONS & BREATHING CUE */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45
                  }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>Proper Technique:</strong>
                      {ex.technique || ex.instructions || 'Perform with controlled 3-second descent and explosive contraction.'}
                    </div>

                    <div style={{ background: 'rgba(56, 189, 248, 0.06)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                      <strong style={{ color: '#38bdf8' }}>Breathing Cue: </strong>
                      {ex.breathing || 'Exhale forcefully past the sticking point; inhale deeply during the eccentric return.'}
                    </div>

                    {ex.commonMistakes && ex.commonMistakes.length > 0 && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                        <strong style={{ color: '#ef4444' }}>Mistakes to Avoid: </strong>
                        {ex.commonMistakes.join(' • ')}
                      </div>
                    )}
                  </div>

                  {/* Previous / Next Step Navigation */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                      disabled={isFirst}
                      className="btn btn-outline"
                      style={{
                        padding: '0 16px', height: '46px', fontSize: '13px', fontWeight: 700,
                        opacity: isFirst ? 0.35 : 1, cursor: isFirst ? 'default' : 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (!ex.completed) {
                          await handleToggleComplete(ex.id, false);
                        }
                        if (!isLast) {
                          setCurrentStepIndex(prev => prev + 1);
                        } else {
                          showToast('🎉 All exercises in routine completed!', 'success');
                        }
                      }}
                      className="btn btn-primary"
                      style={{
                        height: '46px',
                        fontSize: '13px',
                        fontWeight: 800,
                        background: '#f59e0b',
                        color: '#080c14'
                      }}
                    >
                      <span>{ex.completed ? 'Next Exercise' : 'Log Done & Next'}</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => setCurrentStepIndex(prev => Math.min(enrichedExercises.length - 1, prev + 1))}
                      disabled={isLast}
                      className="btn btn-outline"
                      style={{
                        padding: '0 16px', height: '46px', fontSize: '13px', fontWeight: 700,
                        opacity: isLast ? 0.35 : 1, cursor: isLast ? 'default' : 'pointer'
                      }}
                    >
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* =========================================================================
                VIEW MODE: ALL CARDS LIST VIEW
                ========================================================================= */}
            {plannerViewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enrichedExercises.map((ex, i) => {
                  const isExpanded = !!openInstructions[ex.id];
                  const totalSetsCount = Number(ex.sets) || 4;

                  return (
                    <div
                      key={ex.id || i}
                      className="card"
                      style={{
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #080c14 100%)',
                        borderColor: ex.completed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: ex.completed ? '0 4px 16px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        borderRadius: '14px'
                      }}
                    >
                      {/* Top Header: Exercise Name, Muscle, Completed Status & Controls */}
                      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(ex.id, ex.completed)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              border: `2px solid ${ex.completed ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                              background: ex.completed ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {ex.completed && <Check size={18} color="#080c14" strokeWidth={3} />}
                          </button>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4 style={{
                                fontSize: '16px',
                                fontWeight: 800,
                                margin: 0,
                                color: ex.completed ? 'var(--text-muted)' : '#ffffff',
                                textDecoration: ex.completed ? 'line-through' : 'none'
                              }}>
                                {i + 1}. {ex.name}
                              </h4>

                              <span style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                fontWeight: 800,
                                textTransform: 'uppercase'
                              }}>
                                INTERMEDIATE
                              </span>
                            </div>

                            <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                              Target: {ex.targetMuscle} &bull; ⚙️ {ex.equipment || 'Exercise'}
                            </span>
                          </div>
                        </div>

                        {/* Top Right Buttons: Video Demo & Expand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVideoIndex(i);
                              setShowVideoModal(true);
                            }}
                            className="btn btn-xs btn-outline"
                            style={{
                              fontSize: '11px',
                              padding: '6px 10px',
                              borderColor: 'rgba(245, 158, 11, 0.4)',
                              color: '#fde68a',
                              gap: '4px'
                            }}
                          >
                            <Video size={13} color="#f59e0b" />
                            <span>Demo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStepIndex(i);
                              setPlannerViewMode('step');
                            }}
                            className="btn btn-xs btn-secondary"
                            style={{ fontSize: '11px', padding: '6px 10px' }}
                          >
                            Step Focus
                          </button>
                        </div>
                      </div>

                      {/* Main Card Content: Specific Demonstration Image + Details */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '14px',
                        alignItems: 'center'
                      }}>
                        {/* 1. Exercise Demonstration Image (16:9) */}
                        <div style={{
                          width: '100%',
                          aspectRatio: '16 / 9',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#070b13',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          <img
                            src={ex.imageUrl || `/exercises/${selectedLevel}/${currentMuscleGroup.toLowerCase()}.svg`}
                            alt={ex.name}
                            loading="lazy"
                            onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        {/* 2. Sets, Reps, Rest, Weight & Technique */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '8px'
                          }}>
                            <div style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>SETS</span>
                              <span style={{ fontSize: '16px', fontWeight: 900, color: '#f59e0b' }}>{ex.sets} Sets</span>
                            </div>

                            <div style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>TARGET REPS</span>
                              <span style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>{ex.reps}</span>
                            </div>

                            <div
                              style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              onClick={() => handleStartRest(Number(ex.restTime) || 60)}
                              title="Click to start rest timer"
                            >
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>REST TIME</span>
                              <span style={{ fontSize: '16px', fontWeight: 900, color: '#38bdf8' }}>⏱️ {ex.restTime || 60}s</span>
                            </div>

                            <div style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>WORKING LOAD</span>
                              <input
                                type="text"
                                value={ex.weight || ''}
                                onChange={(e) => handleUpdateExerciseValue(ex.id, 'weight', e.target.value)}
                                placeholder="Weight"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#fef08a',
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  width: '100%',
                                  outline: 'none',
                                  padding: 0
                                }}
                              />
                            </div>
                          </div>

                          {/* Interactive Set-by-Set Pills */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Sets:</span>
                            {Array.from({ length: totalSetsCount }).map((_, sIdx) => {
                              const isSetDone = ex.completedSets ? !!ex.completedSets[sIdx] : ex.completed;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleToggleSet(ex.id, sIdx, isSetDone)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: isSetDone ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                                    background: isSetDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                    color: isSetDone ? '#6ee7b7' : 'var(--text-secondary)',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>Set {sIdx + 1}</span>
                                  {isSetDone ? '✓' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Instructions, Technique & Breathing Details Toggle */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                        <div className="flex-between">
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                            <strong style={{ color: '#ffffff' }}>Technique: </strong>
                            {ex.technique || ex.instructions || 'Perform with controlled form and full range of motion.'}
                          </p>

                          <button
                            type="button"
                            onClick={() => setOpenInstructions(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#f59e0b',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              marginLeft: '8px'
                            }}
                          >
                            <span>{isExpanded ? 'Less' : 'Form Guide'}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            fontSize: '11px',
                            color: 'var(--text-secondary)'
                          }}>
                            <div>
                              <strong style={{ color: '#38bdf8' }}>Breathing Technique: </strong>
                              {ex.breathing || 'Exhale on concentric effort; inhale on eccentric return.'}
                            </div>
                            {ex.commonMistakes && ex.commonMistakes.length > 0 && (
                              <div>
                                <strong style={{ color: '#ef4444' }}>Common Mistakes: </strong>
                                {ex.commonMistakes.join(' • ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* WORKOUT SESSION HISTORY MODAL */}
      {showHistory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: '#0a0e1a',
              border: '1px solid var(--border-color)',
              padding: '20px'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Workout Session History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="icon-btn"
                style={{ width: '28px', height: '28px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(workoutPlan?.history || []).map((hist, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex-between">
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{hist.dayName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{hist.date}</span>
                  </div>
                  <div className="grid-3" style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>⏱️ {hist.durationMinutes} mins</span>
                    <span>✅ {hist.exercisesCompleted} Exercises</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>⚡ {hist.totalVolumeKg?.toLocaleString()} kg</span>
                  </div>
                </div>
              ))}

              {(!workoutPlan?.history || workoutPlan.history.length === 0) && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>
                  No logged workout sessions yet. Finish today's workout to see your history!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN WORKOUT VIDEO DEMONSTRATION MODAL */}
      {showVideoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <WorkoutVideoDemonstrator
              workoutDay={{ ...currentDay, exercises: enrichedExercises }}
              initialExerciseIndex={activeVideoIndex}
              isModal={true}
              selectedLevel={selectedLevel}
              onSelectLevel={handleLoadLevelRoutine}
              onClose={() => setShowVideoModal(false)}
            />
          </div>
        </div>
      )}

      {/* 6-DAY WORKOUT PLAN FULL VISUAL POSTER MODAL */}
      {showPosterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowPosterModal(false)}>
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '94vh',
              overflowY: 'auto',
              background: '#070b13',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              padding: '18px 20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ImageIcon size={20} color="#eab308" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fef08a' }}>
                    6 DAY WORKOUT PLAN &bull; VISUAL BLUEPRINT
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    FOCUS. TRAIN. TRANSFORM. &bull; Official Workout Infographic
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPosterModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
                title="Close Visual Chart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Poster Image Container */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <img
                src="/images/6_day_workout_plan.jpg"
                alt="6 Day Workout Plan - Focus, Train, Transform"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>

            {/* Jump to Day Buttons */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Quick Jump to Routine in Planner:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '6px' }}>
                {[
                  { num: 1, name: 'Day 1: Chest', icon: '🏋️‍♂️' },
                  { num: 2, name: 'Day 2: Shoulder', icon: '👑' },
                  { num: 3, name: 'Day 3: Biceps', icon: '💪' },
                  { num: 4, name: 'Day 4: Triceps', icon: '⚡' },
                  { num: 5, name: 'Day 5: Back', icon: '🧗‍♂️' },
                  { num: 6, name: 'Day 6: Legs', icon: '🦵' },
                  { num: 7, name: 'Day 7: Recovery', icon: '🧘‍♂️' }
                ].map((d, i) => (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => {
                      setSelectedDayIndex(i);
                      setCurrentStepIndex(0);
                      setShowPosterModal(false);
                      showToast(`Switched to ${d.name} routine!`, 'info');
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '8px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}
                  >
                    <span>{d.icon} {d.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Motto */}
            <div style={{
              padding: '10px 14px',
              background: 'rgba(234, 179, 8, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#fef08a', letterSpacing: '1px' }}>
                ⚡ DISCIPLINE TODAY, RESULTS TOMORROW. ⚡
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
