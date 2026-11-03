import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  TrendingUp,
  Trophy,
  Flame,
  Plus,
  Scale,
  Calendar,
  Ruler,
  CheckCircle2,
  X
} from 'lucide-react';

export const ProgressPage = () => {
  const { user } = useAuth();
  const { showToast, triggerRefresh } = useFitness();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // New progress measurement entry modal
  const [showModal, setShowModal] = useState(false);
  const [logForm, setLogForm] = useState({
    weightKg: user?.weight || 78.5,
    chestCm: 104,
    armsCm: 38.5,
    waistCm: 82.5,
    thighsCm: 58.0,
    benchPressKg: 85,
    squatKg: 115,
    deadliftKg: 140,
    notes: ''
  });

  const fetchProgress = async () => {
    try {
      const res = await api.getProgress();
      if (res.success) {
        setProgress(res);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!logForm.weightKg) {
      showToast('Weight is required', 'error');
      return;
    }

    try {
      const res = await api.logProgress(logForm);
      if (res.success) {
        setShowModal(false);
        showToast('Body metrics and PR record logged!', 'success');
        fetchProgress();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Error recording progress', 'error');
    }
  };

  const records = progress?.records || [];
  const currentWeight = progress?.currentWeight || user?.weight || 78.5;
  const targetWeight = progress?.targetWeight || user?.targetWeight || 84.0;
  const startingWeight = progress?.startingWeight || 76.8;

  // Weight progress points for SVG curve
  const weights = records.map(r => r.weightKg);
  const minW = Math.min(...(weights.length ? weights : [75])) - 1;
  const maxW = Math.max(...(weights.length ? weights : [85])) + 1;
  const rangeW = maxW - minW || 1;

  // SVG coordinates
  const svgWidth = 340;
  const svgHeight = 120;
  const points = records.map((r, i) => {
    const x = records.length > 1 ? (i / (records.length - 1)) * (svgWidth - 40) + 20 : svgWidth / 2;
    const y = svgHeight - 20 - ((r.weightKg - minW) / rangeW) * (svgHeight - 40);
    return { x, y, weight: r.weightKg, date: r.date };
  });

  const svgPathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Progress & Records" subtitle="Biometric tracking & strength progression" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Streak & Consistency Bar */}
        <div className="card" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', borderColor: 'var(--amber)' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={24} color="#000" fill="#000" />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>
                  Unbroken Consistency
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{progress?.streak || 14} Day Streak</h3>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              <Plus size={13} /> Log Stats
            </button>
          </div>
        </div>

        {/* Responsive 2-Column Grid on Laptop Screens */}
        <div className="laptop-2-cols">
          {/* Left Column: Weight Progression Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BODYWEIGHT TREND</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                    {currentWeight} kg
                    <span style={{ fontSize: '12px', color: 'var(--primary)', marginLeft: '6px', fontWeight: 700 }}>
                      ({(progress?.totalWeightChange >= 0 ? '+' : '') + (progress?.totalWeightChange || 1.7)} kg total)
                    </span>
                  </h3>
                </div>
                <span className="badge badge-bulking">Target: {targetWeight} kg</span>
              </div>

              {/* SVG Line Graph */}
              <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '10px 0' }}>
                <svg width={svgWidth} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
                  {/* Grid lines */}
                  <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="20" y1="60" x2={svgWidth - 20} y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="20" y1="100" x2={svgWidth - 20} y2="100" stroke="var(--border-subtle)" strokeDasharray="3 3" />

                  {/* Area fill */}
                  {points.length > 1 && (
                    <path
                      d={`${svgPathD} L ${points[points.length - 1].x} ${svgHeight - 10} L ${points[0].x} ${svgHeight - 10} Z`}
                      fill="rgba(16, 185, 129, 0.12)"
                    />
                  )}

                  {/* Main stroke line */}
                  {svgPathD && (
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Points */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="var(--primary)" stroke="#0b0f19" strokeWidth="2" />
                      <text x={p.x} y={p.y - 10} fill="var(--text-primary)" fontSize="10" fontWeight="700" textAnchor="middle">
                        {p.weight}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="grid-3" style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Start</span>
                  <p style={{ fontWeight: 800 }}>{startingWeight} kg</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Current</span>
                  <p style={{ fontWeight: 800, color: 'var(--primary)' }}>{currentWeight} kg</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Goal</span>
                  <p style={{ fontWeight: 800, color: 'var(--amber)' }}>{targetWeight} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: PRs & Body Measurements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Personal Records (PR) Hall of Fame */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Trophy size={16} color="var(--amber)" />
                  <span>Personal Records (PRs)</span>
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifetime Max</span>
              </div>

              <div className="grid-3" style={{ gap: '8px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Bench Press</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
                    {progress?.personalRecords?.benchPressKg || 82.5} kg
                  </h3>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Barbell Squat</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                    {progress?.personalRecords?.squatKg || 112.5} kg
                  </h3>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Deadlift</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyan)', marginTop: '2px' }}>
                    {progress?.personalRecords?.deadliftKg || 135} kg
                  </h3>
                </div>
              </div>
            </div>

            {/* Body Circumference Measurements */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Ruler size={16} color="var(--cyan)" />
                  <span>Body Circumference Metrics</span>
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Latest Check</span>
              </div>

              <div className="grid-4" style={{ gap: '8px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Chest</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{progress?.latestMeasurements?.chestCm || 103.5} cm</h4>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Arms</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{progress?.latestMeasurements?.armsCm || 38.4} cm</h4>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Waist</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{progress?.latestMeasurements?.waistCm || 82.5} cm</h4>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Thighs</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{progress?.latestMeasurements?.thighsCm || 58.2} cm</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Progress Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Log Biometrics & PRs</h3>
              <button onClick={() => setShowModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProgress}>
              <div className="form-group">
                <label className="form-label">Bodyweight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={logForm.weightKg}
                  onChange={(e) => setLogForm({ ...logForm, weightKg: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={logForm.chestCm}
                    onChange={(e) => setLogForm({ ...logForm, chestCm: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={logForm.armsCm}
                    onChange={(e) => setLogForm({ ...logForm, armsCm: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={logForm.waistCm}
                    onChange={(e) => setLogForm({ ...logForm, waistCm: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={logForm.thighsCm}
                    onChange={(e) => setLogForm({ ...logForm, thighsCm: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Bench (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={logForm.benchPressKg}
                    onChange={(e) => setLogForm({ ...logForm, benchPressKg: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Squat (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={logForm.squatKg}
                    onChange={(e) => setLogForm({ ...logForm, squatKg: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadlift (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={logForm.deadliftKg}
                    onChange={(e) => setLogForm({ ...logForm, deadliftKg: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ height: '46px', marginTop: '10px' }}>
                Save Progress Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
