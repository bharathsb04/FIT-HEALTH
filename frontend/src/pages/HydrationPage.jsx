import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  Droplet,
  Plus,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  Bell,
  Waves
} from 'lucide-react';

export const HydrationPage = () => {
  const { showToast, triggerRefresh } = useFitness();
  const [hydration, setHydration] = useState(null);
  const [customMl, setCustomMl] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHydration = async () => {
    try {
      const res = await api.getHydration();
      if (res.success) {
        setHydration(res);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHydration();
  }, []);

  const handleLogWater = async (amount) => {
    try {
      const res = await api.logHydration(amount);
      if (res.success) {
        setHydration(prev => ({
          ...prev,
          consumedLiters: res.consumedLiters,
          remainingLiters: res.remainingLiters,
          percentage: res.percentage,
          logs: res.logs
        }));
        showToast(`Logged +${amount} ml of water! 💧`, 'success');
        triggerRefresh();
      }
    } catch (err) {
      showToast('Could not log hydration', 'error');
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.logHydration(0, 'reset');
      if (res.success) {
        showToast('Daily water log reset.', 'info');
        fetchHydration();
        triggerRefresh();
      }
    } catch (e) {
      showToast('Failed to reset', 'error');
    }
  };

  const percentage = hydration?.percentage || 0;

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Hydration Tracker" subtitle="Cellular Fluid Balance & Performance Electrolytes" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Friendly Reminder Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Bell size={20} color="var(--cyan)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>Smart Hydration Reminder</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {hydration?.reminder || 'Drink 500ml water before lifting to preserve blood volume and avoid cramping.'}
            </p>
          </div>
        </div>

        {/* Responsive 2-Column Grid on Laptop Screens */}
        <div className="laptop-2-cols">
          {/* Left Column: Center Circular Hydration Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="card" style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 50% 120%, rgba(6, 182, 212, 0.4) 0%, var(--bg-surface) 70%)',
                border: '4px solid var(--cyan)',
                margin: '0 auto 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.25)',
                position: 'relative'
              }}>
                <Droplet size={34} color="var(--cyan)" fill="var(--cyan)" style={{ marginBottom: '4px' }} />
                <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#ffffff' }}>
                  {hydration?.consumedLiters || 2.25} L
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  of {hydration?.targetLiters || 3.5} L Target
                </span>
              </div>

              <div className="flex-between" style={{ maxWidth: '280px', margin: '0 auto 12px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Target Reached</span>
                <span style={{ fontWeight: 800, color: 'var(--cyan)' }}>{percentage}%</span>
              </div>

              <div className="progress-bar-bg" style={{ height: '8px', maxWidth: '280px', margin: '0 auto 16px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percentage}%`, background: 'var(--cyan)' }}
                />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Remaining today: <b style={{ color: 'var(--text-primary)' }}>{hydration?.remainingLiters || 1.25} Liters</b>
              </p>
            </div>
          </div>

          {/* Right Column: Quick Add Amounts & Intake History Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Quick Add Presets Grid */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                Quick-Add Amount
              </h4>

              <div className="grid-4" style={{ gap: '8px' }}>
                {[
                  { ml: 250, label: 'Cup (250ml)' },
                  { ml: 500, label: 'Bottle (500ml)' },
                  { ml: 750, label: 'Shaker (750ml)' },
                  { ml: 1000, label: 'Jug (1.0 L)' }
                ].map(item => (
                  <button
                    key={item.ml}
                    onClick={() => handleLogWater(item.ml)}
                    className="btn btn-secondary"
                    style={{
                      padding: '12px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <Droplet size={18} color="var(--cyan)" />
                    <span style={{ fontWeight: 700 }}>+{item.ml >= 1000 ? '1L' : `${item.ml}ml`}</span>
                  </button>
                ))}
              </div>

              {/* Custom ml input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Custom ml (e.g. 350)"
                  value={customMl}
                  onChange={(e) => setCustomMl(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
                <button
                  onClick={() => {
                    if (customMl && Number(customMl) > 0) {
                      handleLogWater(Number(customMl));
                      setCustomMl('');
                    }
                  }}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Daily Drink Timestamp History */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h4 className="card-title">Today's Intake Log</h4>
                <button
                  onClick={handleReset}
                  style={{ fontSize: '11px', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(hydration?.logs || []).map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Droplet size={14} color="var(--cyan)" />
                      <span style={{ fontWeight: 600 }}>{log.amountMl} ml</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{log.time}</span>
                  </div>
                ))}

                {(!hydration?.logs || hydration.logs.length === 0) && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '12px 0' }}>
                    No hydration logged yet today. Tap +250ml or +500ml above to begin!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
