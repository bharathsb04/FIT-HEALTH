import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';
import { Header } from '../components/Header';
import {
  TrendingUp,
  Scale,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Sliders,
  Target,
  ArrowRight,
  Info
} from 'lucide-react';

export const BulkingCuttingPage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast, triggerRefresh } = useFitness();
  const [selectedGoal, setSelectedGoal] = useState(user?.primaryGoal || 'Bulking');
  const [nutrition, setNutrition] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBulkingCuttingData = async () => {
    try {
      const [nutRes, progRes] = await Promise.all([
        api.getNutrition(),
        api.getProgress()
      ]);
      if (nutRes.success) setNutrition(nutRes);
      if (progRes.success) setProgress(progRes);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkingCuttingData();
  }, []);

  const handleApplyGoal = async (newGoal) => {
    try {
      setSelectedGoal(newGoal);
      await updateUserProfile({ primaryGoal: newGoal, goal: newGoal, fitnessGoal: newGoal });
      await api.resetSplit(newGoal);
      showToast(`Protocol switched to ${newGoal.toUpperCase()} MODE!`, 'success');
      fetchBulkingCuttingData();
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update goal', 'error');
    }
  };

  const isBulking = (user?.primaryGoal || 'Bulking') === 'Bulking';
  const isCutting = (user?.primaryGoal || 'Bulking') === 'Cutting';
  const targetCalories = user?.targetCalories || (isBulking ? 2850 : 2100);
  const targetProtein = user?.targetProtein || (isBulking ? 165 : 175);
  const targetCarbs = user?.targetCarbs || (isBulking ? 340 : 220);
  const targetFat = user?.targetFat || (isBulking ? 75 : 65);

  const consumedCalories = nutrition?.consumed?.calories || 1490;
  const consumedProtein = nutrition?.consumed?.protein || 112;
  const consumedCarbs = nutrition?.consumed?.carbs || 145;
  const consumedFat = nutrition?.consumed?.fat || 48;

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Bulking & Cutting" subtitle="Physique Phase Management & Macro Targets" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Responsive 2-Column Grid on Laptop Screens */}
        <div className="laptop-2-cols">
          {/* Left Column: Active Phase Hero & Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Goal Hero Card */}
            <div
              className="card"
              style={{
                background: isBulking
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
                borderColor: isBulking ? 'var(--amber)' : 'var(--rose)',
                padding: '20px'
              }}
            >
              <div className="flex-between">
                <span className={`badge badge-${(user?.primaryGoal || 'Bulking').toLowerCase()}`}>
                  ACTIVE REGIMEN
                </span>
                <Target size={18} color={isBulking ? 'var(--amber)' : 'var(--rose)'} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.5px' }}>
                {user?.primaryGoal?.toUpperCase() || 'BULKING'} MODE
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isBulking
                  ? 'Controlled caloric surplus of +400 kcal to fuel maximum myofibrillar hypertrophy while keeping adipose accretion low.'
                  : isCutting
                  ? 'Moderate caloric deficit of -500 kcal to oxidize body fat while preserving lean muscular tissue with elevated protein.'
                  : 'Iso-caloric maintenance protocol to optimize athletic performance, strength, and steady recovery.'}
              </p>

              {/* Quick Macro Specs Strip */}
              <div className="grid-4" style={{ marginTop: '16px', background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Daily Target</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--amber)' }}>{targetCalories} kcal</h4>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Protein</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>{targetProtein} g</h4>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Carbs</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyan)' }}>{targetCarbs} g</h4>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fats</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--purple)' }}>{targetFat} g</h4>
                </div>
              </div>
            </div>

            {/* Phase Selector Chips */}
            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
                Switch Physique Phase Protocol
              </span>
              <div className="grid-2" style={{ gap: '8px' }}>
                {['Bulking', 'Cutting', 'Maintenance', 'General fitness'].map(g => (
                  <button
                    key={g}
                    onClick={() => handleApplyGoal(g)}
                    className={`btn ${user?.primaryGoal === g ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '10px' }}
                  >
                    {user?.primaryGoal === g && <CheckCircle2 size={14} />}
                    <span>{g}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Target vs Actual, Trajectory & Disclaimer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Target vs Actual Table */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '14px' }}>
                Today's Target vs. Actual Ingestion
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Calories', target: `${targetCalories} kcal`, actual: `${consumedCalories} kcal`, delta: `${consumedCalories - targetCalories} kcal`, color: 'var(--amber)' },
                  { label: 'Protein', target: `${targetProtein} g`, actual: `${consumedProtein} g`, delta: `${consumedProtein - targetProtein} g`, color: 'var(--primary)' },
                  { label: 'Carbs', target: `${targetCarbs} g`, actual: `${consumedCarbs} g`, delta: `${consumedCarbs - targetCarbs} g`, color: 'var(--cyan)' },
                  { label: 'Fat', target: `${targetFat} g`, actual: `${consumedFat} g`, delta: `${consumedFat - targetFat} g`, color: 'var(--purple)' }
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color }} />
                      <span style={{ fontWeight: 600 }}>{row.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target: <b>{row.target}</b></span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Actual: {row.actual}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Weight Trajectory Card */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <h4 className="card-title">Weekly Bodyweight Trajectory</h4>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                  {isBulking ? '+0.3 kg / week' : '-0.5 kg / week'}
                </span>
              </div>

              <div className="grid-3" style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Starting</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{progress?.startingWeight || 76.8} kg</h4>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{user?.weight || 78.5} kg</h4>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--amber)' }}>{user?.targetWeight || 84.0} kg</h4>
                </div>
              </div>
            </div>

            {/* Mandatory Health Disclaimer */}
            <div
              className="card"
              style={{
                background: 'rgba(244, 63, 94, 0.06)',
                borderColor: 'rgba(244, 63, 94, 0.25)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <ShieldAlert size={20} color="var(--rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase' }}>
                  Nutritional Guidance Disclaimer
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
                  Nutritional targets and caloric recommendations provided in this application are automated estimations calculated from standard metabolic formulas. They do not constitute personalized medical or clinical dietary advice. Always consult a licensed physician or registered dietitian prior to initiating aggressive bulking or cutting protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
