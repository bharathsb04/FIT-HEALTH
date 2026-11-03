import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import { WorkoutVideoDemonstrator } from '../components/WorkoutVideoDemonstrator';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  Play,
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
  Award
} from 'lucide-react';

export const WorkoutPlannerPage = () => {
  const { showToast, triggerRefresh } = useFitness();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Visual Blueprint Poster Modal state
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Active workout session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState(0);

  // One-by-one Step mode state
  const [plannerViewMode, setPlannerViewMode] = useState('step'); // 'step' (One-by-one) | 'list' (All)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);

  // Video demonstrator state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Instructions toggle map
  const [openInstructions, setOpenInstructions] = useState({});

  // Add custom exercise modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: '',
    targetMuscle: 'Chest',
    sets: 3,
    reps: '10-12',
    weight: '25 kg',
    restTime: 60,
    instructions: 'Keep core engaged and execute deliberate concentric contraction.'
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
            showToast('⏰ Rest period over! Ready for next set.', 'success');
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
      const res = await api.updateWorkout(exerciseId, {
        completed: !currentStatus,
        dayIndex: selectedDayIndex
      });
      if (res.success) {
        // Update local state
        setWorkoutPlan(res.plan);
        if (!currentStatus) {
          showToast('Set recorded! Keep the intensity high.', 'success');
        }
      }
    } catch (err) {
      showToast('Error updating exercise', 'error');
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
      // ignore quick debounce
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
          particleCount: 80,
          spread: 70,
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
        showToast(`Split updated to ${goal} protocol!`, 'success');
      }
    } catch (err) {
      showToast('Failed to switch split', 'error');
    }
  };

  const days = workoutPlan?.days || [];
  const currentDay = days[selectedDayIndex] || days[0];
  const completedExercises = currentDay?.exercises?.filter(e => e.completed)?.length || 0;
  const totalExercises = currentDay?.exercises?.length || 0;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Workout Planner" subtitle="6-Day Split Progression & Set Logging" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Active Session Timer Floating Bar */}
        {sessionActive && (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
              borderColor: 'var(--primary)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: '64px',
              zIndex: 35,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>LIVE WORKOUT IN PROGRESS</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>{formatTimer(sessionTimerSeconds)}</h4>
              </div>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              Finish & Log
            </button>
          </div>
        )}

        {/* Top Control Bar: Goal Switcher & History Button */}
        <div className="flex-between" style={{ marginBottom: '-6px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Bulking', 'Cutting', 'Maintenance'].map(g => (
              <button
                key={g}
                onClick={() => handleGoalSplitReset(g)}
                className={`chip ${workoutPlan?.goal?.toLowerCase() === g.toLowerCase() ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {g}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowPosterModal(true)}
              className="btn btn-sm btn-primary"
              style={{
                fontSize: '11px',
                padding: '5px 12px',
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                color: '#0b0f19',
                fontWeight: 800,
                border: 'none',
                gap: '5px'
              }}
            >
              <ImageIcon size={13} />
              <span>Visual Chart</span>
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              <History size={13} />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Visual 6-Day Workout Blueprint Showcase Card */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            boxShadow: '0 8px 24px rgba(234, 179, 8, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(234, 179, 8, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="#eab308" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fef08a', letterSpacing: '0.5px' }}>
                    6 DAY WORKOUT PLAN • BE GREAT
                  </h3>
                  <span className="badge" style={{ background: '#eab308', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                    VISUAL BLUEPRINT
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  FOCUS. TRAIN. TRANSFORM. &bull; Complete Muscle Group Breakdown & Daily Rep Targets
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPosterModal(true)}
              className="btn btn-sm btn-outline"
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderColor: '#eab308',
                color: '#fef08a',
                fontWeight: 700,
                gap: '5px'
              }}
            >
              <Maximize2 size={12} />
              <span>Full Visual Infographic</span>
            </button>
          </div>

          {/* Quick Day Chips on the Poster Banner */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { num: 1, name: 'Chest', icon: '🏋️‍♂️' },
              { num: 2, name: 'Shoulder', icon: '👑' },
              { num: 3, name: 'Biceps', icon: '💪' },
              { num: 4, name: 'Triceps', icon: '⚡' },
              { num: 5, name: 'Back', icon: '🧗‍♂️' },
              { num: 6, name: 'Legs', icon: '🦵' },
              { num: 7, name: 'Recovery', icon: '🧘‍♂️' }
            ].map((d, i) => (
              <button
                key={d.num}
                type="button"
                onClick={() => {
                  setSelectedDayIndex(i);
                  setCurrentStepIndex(0);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: selectedDayIndex === i ? '#eab308' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedDayIndex === i ? '1px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedDayIndex === i ? '#0b0f19' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: selectedDayIndex === i ? 800 : 600,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{d.icon}</span>
                <span>Day {d.num}: {d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Four Pillars of Transformation Widget (from visual plan) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--primary)', background: 'rgba(16, 185, 129, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <TrendingUp size={15} color="var(--primary)" />
              <b style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '0.4px' }}>STAY CONSISTENT</b>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Consistency is the key to see results.
            </p>
          </div>

          <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--cyan)', background: 'rgba(6, 182, 212, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Utensils size={15} color="var(--cyan)" />
              <b style={{ fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.4px' }}>EAT CLEAN</b>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Eat enough protein & healthy foods to fuel your body.
            </p>
          </div>

          <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid #38bdf8', background: 'rgba(56, 189, 248, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Droplet size={15} color="#38bdf8" />
              <b style={{ fontSize: '11px', color: '#38bdf8', letterSpacing: '0.4px' }}>STAY HYDRATED</b>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Drink plenty of water throughout the day.
            </p>
          </div>

          <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--amber)', background: 'rgba(245, 158, 11, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Moon size={15} color="var(--amber)" />
              <b style={{ fontSize: '11px', color: 'var(--amber)', letterSpacing: '0.4px' }}>GET ENOUGH SLEEP</b>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              7-8 hours of sleep is essential for muscle recovery.
            </p>
          </div>
        </div>

        {/* 6-Day Split Carousel Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {days.map((day, idx) => (
            <button
              key={day.dayNumber || idx}
              onClick={() => {
                setSelectedDayIndex(idx);
                setCurrentStepIndex(0);
              }}
              className="card"
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                minWidth: '110px',
                textAlign: 'center',
                borderColor: selectedDayIndex === idx ? 'var(--primary)' : 'var(--border-color)',
                background: selectedDayIndex === idx ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: selectedDayIndex === idx ? 'var(--primary)' : 'var(--text-muted)' }}>
                DAY {day.dayNumber}
              </span>
              <h5 style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap' }}>
                {day.dayName.split('—')[1]?.trim() || day.dayName}
              </h5>
            </button>
          ))}
        </div>

        {/* Current Day Routine Banner */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="card-header" style={{ marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                6-DAY SPLIT • DAY {currentDay?.dayNumber}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{currentDay?.dayName}</h3>
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
                <Video size={14} color="var(--primary)" />
                <span>Video Guide</span>
              </button>

              {!sessionActive ? (
                <button
                  onClick={() => {
                    setSessionActive(true);
                    showToast('Workout session started! Timer running.', 'info');
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '12px', padding: '8px 16px', gap: '6px' }}
                >
                  <Play size={14} fill="#fff" />
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
                <span>Complete & Log</span>
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            Focus: {currentDay?.focus || 'Compound lifting with optimal rest intervals'}
          </p>

          {/* Day Completion Progress Bar */}
          <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Exercises Completed: <b style={{ color: 'var(--primary)' }}>{completedExercises} of {totalExercises}</b></span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '7px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%`, background: 'var(--primary)' }}
            />
          </div>
        </div>

        {/* WORKOUT DETAILS (Sequential full-width layout after Day Splits & Banner) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
          <div className="flex-between">
            <div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {plannerViewMode === 'step'
                  ? `Workout Details: Exercise ${currentStepIndex + 1} of ${currentDay?.exercises?.length || 0}`
                  : `All Workout Exercises (${currentDay?.exercises?.length || 0})`}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                {plannerViewMode === 'step' ? 'Step-by-step guided focus with video demonstrations' : 'Full workout overview'}
              </span>
            </div>

            {/* View Switcher: Step (One by One) vs All */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  display: 'flex',
                  background: 'var(--bg-surface)',
                  borderRadius: '10px',
                  padding: '3px',
                  border: '1px solid var(--border-color)'
                }}>
                  <button
                    type="button"
                    onClick={() => setPlannerViewMode('step')}
                    style={{
                      padding: '5px 10px', borderRadius: '7px', border: 'none',
                      background: plannerViewMode === 'step' ? 'var(--primary)' : 'transparent',
                      color: plannerViewMode === 'step' ? '#0b0f19' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    1-by-1 Step
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlannerViewMode('list')}
                    style={{
                      padding: '5px 10px', borderRadius: '7px', border: 'none',
                      background: plannerViewMode === 'list' ? 'var(--primary)' : 'transparent',
                      color: plannerViewMode === 'list' ? '#0b0f19' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    All List
                  </button>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════
               MODE 1: ONE-BY-ONE STEP DETAIL VIEW
               ══════════════════════════════════════════════════ */}
            {plannerViewMode === 'step' && currentDay?.exercises?.length > 0 && (() => {
              const ex = currentDay.exercises[currentStepIndex] || currentDay.exercises[0];
              const isFirst = currentStepIndex === 0;
              const isLast = currentStepIndex === (currentDay.exercises.length - 1);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Step Stepper Header Chips */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    overflowX: 'auto', paddingBottom: '4px'
                  }}>
                    {currentDay.exercises.map((item, idx) => {
                      const isActive = currentStepIndex === idx;
                      return (
                        <button
                          key={item.id || idx}
                          onClick={() => setCurrentStepIndex(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            border: isActive
                              ? '2px solid var(--primary)'
                              : item.completed
                              ? '1px solid rgba(16,185,129,0.4)'
                              : '1px solid var(--border-color)',
                            background: isActive
                              ? 'rgba(16,185,129,0.18)'
                              : item.completed
                              ? 'rgba(16,185,129,0.08)'
                              : 'var(--bg-surface)',
                            color: isActive
                              ? 'var(--primary)'
                              : item.completed
                              ? 'var(--primary)'
                              : 'var(--text-muted)',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {item.completed ? (
                            <CheckCircle2 size={12} color="var(--primary)" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                          <span>{item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 2-Column Responsive Desktop Grid for Focused Exercise */}
                  <div className="laptop-2-cols" style={{ alignItems: 'flex-start', gap: '16px' }}>
                    {/* Left Column: Embedded Visual Video Demonstrator */}
                    <div>
                      <WorkoutVideoDemonstrator
                        workoutDay={currentDay}
                        initialExerciseIndex={currentStepIndex}
                      />
                    </div>

                    {/* Right Column: Rest Timer & Set Execution Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Rest Countdown Timer Bar */}
                      <div className="card" style={{
                        padding: '14px 16px',
                        background: restTimerActive ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface)',
                        borderColor: restTimerActive ? 'var(--cyan)' : 'var(--border-color)'
                      }}>
                        <div className="flex-between" style={{ marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} color={restTimerActive ? 'var(--cyan)' : 'var(--text-muted)'} />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: restTimerActive ? 'var(--cyan)' : 'var(--text-primary)' }}>
                              {restTimerActive ? `Resting: ${restCountdown}s Remaining` : `Rest Interval: ${ex.restTime || 60}s`}
                            </span>
                          </div>

                          {/* Quick Rest Presets */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[45, 60, 90, 120].map(sec => (
                              <button
                                key={sec}
                                onClick={() => handleStartRest(sec)}
                                className="btn btn-sm"
                                style={{
                                  padding: '3px 7px', fontSize: '10px', fontWeight: 700,
                                  background: restCountdown === sec && restTimerActive ? 'var(--cyan)' : 'var(--bg-secondary)',
                                  color: restCountdown === sec && restTimerActive ? '#0b0f19' : 'var(--text-secondary)'
                                }}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>

                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                          Rest between heavy sets to replenish muscle ATP and optimize mechanical tension.
                        </p>
                      </div>

                      {/* Exercise Set Controls & Completion */}
                      <div className="card" style={{ padding: '16px' }}>
                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              onClick={() => handleToggleComplete(ex.id, ex.completed)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                border: `2px solid ${ex.completed ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: ex.completed ? 'var(--primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              {ex.completed && <CheckCircle2 size={18} color="#0b0f19" strokeWidth={3} />}
                            </button>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: 800, color: ex.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: ex.completed ? 'line-through' : 'none' }}>
                                {ex.name}
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                                Target: {ex.targetMuscle}
                              </span>
                            </div>
                          </div>

                          <span className={`badge ${ex.completed ? 'badge-completed' : 'badge-fitness'}`}>
                            {ex.completed ? '✅ Completed' : 'Pending Sets'}
                          </span>
                        </div>

                        {/* Inputs */}
                        <div className="grid-3" style={{ gap: '8px', marginBottom: '14px' }}>
                          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>Sets</span>
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => handleUpdateExerciseValue(ex.id, 'sets', e.target.value)}
                              style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '14px', fontWeight: 800, outline: 'none' }}
                            />
                          </div>
                          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>Target Reps</span>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => handleUpdateExerciseValue(ex.id, 'reps', e.target.value)}
                              style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '14px', fontWeight: 800, outline: 'none' }}
                            />
                          </div>
                          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>Working Load</span>
                            <input
                              type="text"
                              value={ex.weight}
                              onChange={(e) => handleUpdateExerciseValue(ex.id, 'weight', e.target.value)}
                              style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '14px', fontWeight: 800, outline: 'none' }}
                            />
                          </div>
                        </div>

                        {/* Navigation Buttons: Previous / Mark Done & Next / Next */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px' }}>
                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                            disabled={isFirst}
                            className="btn btn-outline"
                            style={{
                              padding: '0 14px', height: '44px', fontSize: '12px', fontWeight: 700,
                              opacity: isFirst ? 0.4 : 1, cursor: isFirst ? 'default' : 'pointer'
                            }}
                          >
                            ⬅️ Previous
                          </button>

                          <button
                            onClick={async () => {
                              if (!ex.completed) {
                                await handleToggleComplete(ex.id, false);
                              }
                              if (!isLast) {
                                setCurrentStepIndex(prev => prev + 1);
                                handleStartRest(ex.restTime || 60);
                              } else {
                                showToast('🎉 All exercises completed in this split! You can log your workout now.', 'success');
                              }
                            }}
                            className="btn btn-primary"
                            style={{ height: '44px', fontSize: '13px', fontWeight: 800, gap: '6px' }}
                          >
                            <CheckCircle2 size={16} />
                            <span>{isLast ? 'Complete Last Exercise' : 'Mark Done & Next ➡️'}</span>
                          </button>

                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.min(currentDay.exercises.length - 1, prev + 1))}
                            disabled={isLast}
                            className="btn btn-outline"
                            style={{
                              padding: '0 14px', height: '44px', fontSize: '12px', fontWeight: 700,
                              opacity: isLast ? 0.4 : 1, cursor: isLast ? 'default' : 'pointer'
                            }}
                          >
                            Next ➡️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ══════════════════════════════════════════════════
               MODE 2: ALL EXERCISES LIST OVERVIEW
               ══════════════════════════════════════════════════ */}
            {plannerViewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentDay?.exercises?.map((ex, i) => {
                  const isOpen = openInstructions[ex.id];
                  return (
                    <div
                      key={ex.id || i}
                      className="card"
                      style={{
                        padding: '14px',
                        borderColor: ex.completed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                        background: ex.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-secondary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <button
                            onClick={() => handleToggleComplete(ex.id, ex.completed)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '8px',
                              border: `2px solid ${ex.completed ? 'var(--primary)' : 'var(--border-color)'}`,
                              background: ex.completed ? 'var(--primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: '2px',
                              cursor: 'pointer'
                            }}
                          >
                            {ex.completed && <CheckCircle2 size={16} color="#0b0f19" strokeWidth={3} />}
                          </button>

                          <div>
                            <h4 style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: ex.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: ex.completed ? 'line-through' : 'none'
                            }}>
                              {ex.name}
                            </h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Target: <b style={{ color: 'var(--cyan)' }}>{ex.targetMuscle}</b>
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStepIndex(i);
                              setPlannerViewMode('step');
                            }}
                            className="btn btn-sm"
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: 'var(--primary)',
                              gap: '4px',
                              borderRadius: '6px'
                            }}
                          >
                            <Video size={12} />
                            <span>1-by-1 Detail</span>
                          </button>

                          <button
                            onClick={() => setOpenInstructions(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                            className="icon-btn"
                            style={{ width: '28px', height: '28px' }}
                            title="View form instructions"
                          >
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(ex.id)}
                            className="icon-btn"
                            style={{ width: '28px', height: '28px', color: 'var(--rose)' }}
                            title="Delete exercise"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid-3" style={{ marginTop: '12px', gap: '8px' }}>
                        <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Sets</span>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => handleUpdateExerciseValue(ex.id, 'sets', e.target.value)}
                            style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                          />
                        </div>
                        <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Target Reps</span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExerciseValue(ex.id, 'reps', e.target.value)}
                            style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                          />
                        </div>
                        <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Load / Weight</span>
                          <input
                            type="text"
                            value={ex.weight}
                            onChange={(e) => handleUpdateExerciseValue(ex.id, 'weight', e.target.value)}
                            style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                          />
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--primary)', fontWeight: 700 }}>
                            <Info size={13} />
                            <span>Form & Execution Tips</span>
                          </div>
                          <p style={{ margin: 0 }}>{ex.instructions}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Add Custom Exercise</h3>
              <button onClick={() => setShowAddModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomExercise}>
              <div className="form-group">
                <label className="form-label">Exercise Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Incline Dumbbell Hammer Curl"
                  value={customEx.name}
                  onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Muscle</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Upper Chest / Lats"
                    value={customEx.targetMuscle}
                    onChange={(e) => setCustomEx({ ...customEx, targetMuscle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Weight</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 30 kg"
                    value={customEx.weight}
                    onChange={(e) => setCustomEx({ ...customEx, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Sets</label>
                  <input
                    type="number"
                    className="form-input"
                    value={customEx.sets}
                    onChange={(e) => setCustomEx({ ...customEx, sets: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Reps</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customEx.reps}
                    onChange={(e) => setCustomEx({ ...customEx, reps: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ height: '46px', marginTop: '12px' }}>
                Save Exercise to Routine
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Workout History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Workout History</h3>
              <button onClick={() => setShowHistory(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(workoutPlan?.history || []).map((hist, idx) => (
                <div key={idx} className="card" style={{ padding: '12px 16px', background: 'var(--bg-surface)' }}>
                  <div className="flex-between">
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{hist.dayName}</h4>
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
              workoutDay={currentDay}
              initialExerciseIndex={activeVideoIndex}
              isModal={true}
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
                    6 DAY WORKOUT PLAN • VISUAL BLUEPRINT
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
                  { num: 6, name: 'Day 6: Legs', icon: '🦵' }
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
