import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import {
  workoutLibrary,
  getExercisesByLevel,
  findExerciseById
} from '../data/workoutLibrary';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2,
  ChevronLeft, ChevronRight, CheckCircle2, Flame, Sparkles,
  Zap, Info, Activity, ShieldCheck, Eye, Compass, Gauge,
  Film, Layers, Award, Check, Heart, Radio, MapPin, Wrench,
  Target, ArrowRight, Video, Camera, Dumbbell, AlertTriangle
} from 'lucide-react';

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
      match = workoutLibrary[lvl].find(ex => 
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
  const base = match || currentList[0];
  return {
    ...base,
    name: exerciseName || base.name,
    targetMuscle: targetMuscle || base.targetMuscle
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  // Tab View Modes: Video vs AI Form Guide vs Gym Machine
  const [mediaSource, setMediaSource] = useState('video'); // 'video' | 'guide' | 'machine'

  // Sync index when parent changes active exercise step
  useEffect(() => {
    if (initialExerciseIndex !== undefined && initialExerciseIndex >= 0 && initialExerciseIndex < (exercises.length || 1)) {
      setCurrentIndex(initialExerciseIndex);
      setIsPlaying(true);
    }
  }, [initialExerciseIndex]);

  const currentExercise = exercises[currentIndex] || {
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'Chest',
    sets: 4,
    reps: '8-10',
    weight: '70 kg',
    instructions: 'Arch lower back slightly, retract scapulae, lower bar under control to mid-chest, drive up explosively.'
  };

  // Get rich metadata from workoutLibrary
  const visualMeta = getExerciseMeta(currentExercise.name, currentExercise.targetMuscle, activeLevel);
  const machine = visualMeta.machine || {
    name: 'Standard Exercise Station',
    type: 'Gym Machine / Free Weights',
    gymZone: 'Zone A • Main Floor',
    setupGuide: 'Adjust seat and pin resistance according to working sets.',
    equipmentChecklist: ['Towel', 'Spring collars'],
    alternatives: []
  };

  const handleNextEx = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevEx = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleLevelChange = (newLevel) => {
    setActiveLevel(newLevel);
    if (onSelectLevel) {
      onSelectLevel(newLevel);
    }
  };

  const levelColor = activeLevel === 'beginner' 
    ? '#10b981' 
    : activeLevel === 'intermediate' 
    ? '#06b6d4' 
    : '#f59e0b';

  const isYouTube = visualMeta.videoUrl && (visualMeta.videoUrl.includes('youtube') || visualMeta.videoUrl.includes('youtu.be'));

  /* ─────────────────────────────────────────────────────────────
     RENDER 1: RESPONSIVE REAL DEMONSTRATION VIDEO PLAYER
     ───────────────────────────────────────────────────────────── */
  const renderVideoStream = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '14px',
          overflow: 'hidden',
          background: '#070b13',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
        }}>
          {/* Header Badge Overlay: Level, Target Muscle & Equipment */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: levelColor,
                color: '#080c14',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {activeLevel.toUpperCase()}
              </span>

              <span style={{
                background: 'rgba(8, 12, 20, 0.85)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {visualMeta.targetMuscle} • {visualMeta.equipment || 'Exercise'}
              </span>
            </div>

            <span style={{
              background: 'rgba(8, 12, 20, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--primary)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 800
            }}>
              🎯 {currentExercise.sets || visualMeta.sets} Sets × {currentExercise.reps || visualMeta.reps}
            </span>
          </div>

          {/* Video or Fallback Poster */}
          {visualMeta.videoUrl ? (
            isYouTube ? (
              <iframe
                key={`${visualMeta.id}-${currentIndex}-${playbackSpeed}`}
                src={`${visualMeta.videoUrl}${visualMeta.videoUrl.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&playsinline=1`}
                title={`${currentExercise.name} Real Form Demonstration`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video
                ref={videoRef}
                src={visualMeta.videoUrl}
                poster={visualMeta.videoPoster || visualMeta.imageUrl}
                playsInline
                preload="metadata"
                autoPlay={isPlaying}
                muted={isMuted}
                loop
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onLoadedData={() => setVideoLoaded(true)}
              />
            )
          ) : (
            /* Visual Poster Image with Placeholder Badge */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={visualMeta.imageUrl || `/exercises/${activeLevel}/${visualMeta.targetMuscle?.toLowerCase()}.svg`}
                alt={currentExercise.name}
                loading="lazy"
                onError={(e) => { e.target.src = '/exercises/fallback.svg'; }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.7)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(8,12,20,0.6)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <Dumbbell size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
                  {currentExercise.name}
                </h4>
                <span className="badge badge-fitness" style={{ fontSize: '11px' }}>
                  📹 Video demonstration coming soon &bull; Form guide available below
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Control Bar: Play/Pause, Replay, Speeds */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-sm btn-primary"
              style={{ padding: '6px 12px', fontSize: '11px', gap: '4px', fontWeight: 800 }}
              title={isPlaying ? 'Pause Demonstration' : 'Play Demonstration'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 150);
                }
              }}
              className="btn btn-sm btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}
              title="Replay from start"
            >
              <RotateCcw size={12} />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="icon-btn"
              style={{ width: '30px', height: '30px' }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>

          {/* Speed Presets: 0.5x, 1x, 1.5x */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginRight: '2px' }}>
              SPEED:
            </span>
            {[0.5, 1, 1.5].map(spd => (
              <button
                key={spd}
                type="button"
                onClick={() => handleSpeedChange(spd)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: playbackSpeed === spd ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: playbackSpeed === spd ? '#080c14' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Form Cue Banner */}
        {visualMeta.formCue && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Sparkles size={16} color="var(--cyan)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
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
      {/* Exercise Title & Navigation Bar */}
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

        {/* Stepper buttons */}
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

      {/* Media Source Tab Selector: Video vs AI Form Guide vs Gym Machine */}
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
          onClick={() => setMediaSource('video')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: mediaSource === 'video' ? 'var(--primary)' : 'transparent',
            color: mediaSource === 'video' ? '#080c14' : 'var(--text-secondary)',
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
          <Film size={14} />
          <span>Demonstration Video</span>
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
      {mediaSource === 'video' && renderVideoStream()}
      {mediaSource === 'guide' && renderAIFormGuide()}
      {mediaSource === 'machine' && renderGymMachineGuide()}
    </div>
  );
};
