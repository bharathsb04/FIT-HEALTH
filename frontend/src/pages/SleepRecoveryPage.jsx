import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  Moon,
  Zap,
  Activity,
  Droplet,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const SleepRecoveryPage = () => {
  const { showToast, triggerRefresh } = useFitness();
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active stretch countdown timer
  const [activeStretch, setActiveStretch] = useState(null);
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState(45);
  const [timerRunning, setTimerRunning] = useState(false);

  const fetchRecovery = async () => {
    try {
      const res = await api.getRecovery();
      if (res.success) {
        setRecovery(res);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecovery();
  }, []);

  const handleToggleStretch = async (stretchId) => {
    try {
      const res = await api.toggleStretch(stretchId);
      if (res.success) {
        setRecovery(prev => ({
          ...prev,
          stretchingGuide: res.stretches
        }));
        showToast(res.message, 'success');
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to update stretch', 'error');
    }
  };

  const handleStartStretchTimer = (stretch) => {
    setActiveStretch(stretch);
    const durationMatch = stretch.duration.match(/\d+/);
    const secs = durationMatch ? Number(durationMatch[0]) : 45;
    setStretchSecondsLeft(secs);
    setTimerRunning(true);
  };

  // Timer interval for stretching
  useEffect(() => {
    let interval = null;
    if (timerRunning && stretchSecondsLeft > 0) {
      interval = setInterval(() => {
        setStretchSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (stretchSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      showToast(`Stretch finished! Excellent mobility work.`, 'success');
      if (activeStretch) {
        handleToggleStretch(activeStretch.id);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, stretchSecondsLeft, activeStretch]);

  const score = recovery?.recoveryScore || 85;
  const sleep = recovery?.sleep || { durationHours: 7.6, targetHours: 8.0, quality: 'Optimal', history: [] };

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Sleep & Recovery" subtitle="CNS Restoration, Sleep Cycles & Mobility" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Responsive 2-Column Grid on Laptop Screens */}
        <div className="laptop-2-cols">
          {/* Left Column: Readiness, Sleep Chart & Calculator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Readiness Score Hero Card */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)',
                borderColor: 'var(--indigo)',
                padding: '20px'
              }}
            >
              <div className="flex-between">
                <span className="badge" style={{ background: 'var(--indigo-subtle)', color: 'var(--indigo)' }}>
                  RECOVERY READINESS
                </span>
                <Zap size={18} color="var(--indigo)" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 8px' }}>
                <div>
                  <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff' }}>
                    {score}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/100</span>
                  </h2>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                    {recovery?.readinessStatus || 'Optimal Readiness — Ready to lift heavy!'}
                  </h4>
                </div>

                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  border: '4px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-surface)'
                }}>
                  <Activity size={26} color="var(--primary)" />
                </div>
              </div>

              {/* Vitals summary bar */}
              <div className="grid-3" style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Resting HR</span>
                  <h5 style={{ fontSize: '13px', fontWeight: 800 }}>{recovery?.vitalsSummary?.restingHeartRate || 60} bpm</h5>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sleep Duration</span>
                  <h5 style={{ fontSize: '13px', fontWeight: 800 }}>{sleep.durationHours} hrs</h5>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hydration Status</span>
                  <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--cyan)' }}>Optimal</h5>
                </div>
              </div>
            </div>

            {/* 7-Day Sleep Duration Bar Chart */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <div>
                  <h4 className="card-title">Sleep History & Duration</h4>
                  <span className="card-subtitle">{sleep.durationHours}h logged today (Target: {sleep.targetHours}h)</span>
                </div>
                <Moon size={18} color="var(--indigo)" />
              </div>

              {/* Mini CSS Bar Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                {(sleep.history || []).map((h, i) => {
                  const maxH = 9.0;
                  const barHeight = Math.min(100, Math.round((h.hours / maxH) * 100));
                  const isToday = i === (sleep.history.length - 1);

                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {h.hours}h
                      </span>
                      <div style={{ width: '18px', height: `${barHeight}px`, background: isToday ? 'var(--primary)' : 'var(--indigo)', borderRadius: '4px', opacity: isToday ? 1 : 0.65 }} />
                      <span style={{ fontSize: '10px', color: isToday ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isToday ? 800 : 400 }}>
                        {h.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sleep Cycle Calculator */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '6px' }}>
                90-Minute Sleep Cycle Calculator
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Waking at the completion of a 90-minute sleep cycle prevents grogginess. Optimal bedtimes:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(recovery?.sleepCalculator || []).slice(0, 3).map((calc, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--indigo)' }}>Wake Up: {calc.wakeTime}</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Ideal Bedtimes: {calc.bedtimes.join('  •  ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recovery Protocol & Mobility Stretching Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Recovery Action Suggestions */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '10px' }}>
                Physiological Recovery Protocol
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(recovery?.suggestions || []).map((sug, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stretching & Mobility Guide with Interactive Timer */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h4 className="card-title">Mobility & Stretching Guide</h4>
                  <span className="card-subtitle">Decompress spine and lengthen hip flexors</span>
                </div>
                <span className="badge badge-fitness">
                  {(recovery?.stretchingGuide || []).filter(s => s.completed).length} / {(recovery?.stretchingGuide || []).length} Completed
                </span>
              </div>

              {/* Active Timer Box */}
              {activeStretch && (
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--primary)',
                    padding: '14px',
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>ACTIVE STRETCH TIMER</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 8px' }}>{activeStretch.name}</h4>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary)' }}>
                    00:{stretchSecondsLeft.toString().padStart(2, '0')}
                  </h2>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '6px 14px' }}
                    >
                      {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                      <span>{timerRunning ? 'Pause' : 'Resume'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveStretch(null);
                        setTimerRunning(false);
                      }}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '6px 10px' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Stretches list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(recovery?.stretchingGuide || []).map(stretch => (
                  <div
                    key={stretch.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <button
                        onClick={() => handleToggleStretch(stretch.id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: `2px solid ${stretch.completed ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: stretch.completed ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        {stretch.completed && <CheckCircle2 size={14} color="#000" strokeWidth={3} />}
                      </button>

                      <div>
                        <h5 style={{ fontWeight: 700, textDecoration: stretch.completed ? 'line-through' : 'none', color: stretch.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {stretch.name}
                        </h5>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {stretch.targetArea} • {stretch.duration}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartStretchTimer(stretch)}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      title="Start timed stretch"
                    >
                      <Play size={11} /> Timer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
