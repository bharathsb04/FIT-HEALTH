import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';
import { Header } from '../components/Header';
import { MacroRing } from '../components/MacroRing';
import { LiveStreetGymMap } from '../components/LiveStreetGymMap';
import { WorkoutVideoDemonstrator } from '../components/WorkoutVideoDemonstrator';
import {
  Flame,
  Droplet,
  Footprints,
  Heart,
  Moon,
  Dumbbell,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Plus,
  Video,
  Film,
  Eye,
  Zap,
  X,
  QrCode,
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  MapPin,
  Calendar,
  Receipt,
  Copy,
  Activity,
  ShieldCheck,
  FileText,
  Gift,
  Key,
  Users,
  Image as ImageIcon,
  Utensils,
  Maximize2,
  Edit3,
  Compass,
  Navigation
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    setActiveTab,
    showToast,
    refreshTrigger,
    navigateToAdminSection,
    setAdminSubTab,
    selectedFeatures = ['workout', 'nutrition', 'gyms'],
    toggleFeatureSelection,
    setSelectedFeatures
  } = useFitness();
  const [loading, setLoading] = useState(true);

  // Active Data Interface flags based on user selection
  const isWorkoutActive = selectedFeatures?.includes('workout');
  const isNutritionActive = selectedFeatures?.includes('nutrition');
  const isGymsActive = selectedFeatures?.includes('gyms');

  // Dashboard Data State
  const [nutrition, setNutrition] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [hydration, setHydration] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [workoutViewMode, setWorkoutViewMode] = useState('video'); // 'video' | 'list'

  // Gym Membership Payment / Renewal Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('plan_monthly');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [onlineProvider, setOnlineProvider] = useState('upi_gpay'); // 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'card'
  const [upiIdInput, setUpiIdInput] = useState('alex@okaxis');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [nutRes, vitRes, hydRes, workRes, recRes, gymsRes, memRes] = await Promise.all([
        api.getNutrition(),
        api.getVitals(),
        api.getHydration(),
        api.getWorkouts(),
        api.getRecovery(),
        api.getNearbyGyms(28.6139, 77.2090, 25),
        api.getMembershipStatus()
      ]);

      if (nutRes.success) setNutrition(nutRes);
      if (vitRes.success) setVitals(vitRes.vitals);
      if (hydRes.success) setHydration(hydRes);
      if (workRes.success) setWorkoutPlan(workRes.plan);
      if (recRes.success) setRecovery(recRes);
      if (gymsRes && gymsRes.success) setNearbyGyms(gymsRes.gyms || []);
      if (memRes && memRes.success) setMembershipStatus(memRes);
    } catch (err) {
      console.warn('Dashboard fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const handleQuickAddWater = async () => {
    try {
      const res = await api.logHydration(250);
      setHydration(prev => ({
        ...prev,
        consumedLiters: res.consumedLiters,
        remainingLiters: res.remainingLiters,
        percentage: res.percentage
      }));
      showToast('+250ml water logged! 💧', 'info');
    } catch (e) {
      showToast('Could not log hydration', 'error');
    }
  };

  const handlePayMembership = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    try {
      const payload = {
        planId: selectedPlanId,
        paymentMethod,
        paymentDetails: paymentMethod === 'online' ? { provider: onlineProvider, upiId: upiIdInput } : {}
      };
      const res = await api.payMembership(payload);
      if (res.success) {
        setPaymentResult(res);
        showToast(
          paymentMethod === 'online' 
            ? '🎉 Payment received! Membership renewed instantly.' 
            : '🎟️ Cash Desk Voucher generated! Show this token at reception.',
          'success'
        );
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCopyText = (text, label = 'Copied') => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard! 📋`, 'info');
  };

  const activeDay = workoutPlan?.days?.[workoutPlan?.activeDayIndex || 0] || workoutPlan?.days?.[0];
  const goal = user?.primaryGoal || 'Bulking';
  const goalClass = goal.toLowerCase();
  const membership = membershipStatus?.membership;
  const hasEnrolledMembership = Boolean(membership && membershipStatus?.hasMembership !== false);
  const nearestGym = membershipStatus?.nearestGym || nearbyGyms[0] || null;
  const linkedGym = hasEnrolledMembership ? membershipStatus?.linkedGym : nearestGym;
  const availablePlans = (membershipStatus?.feePlans || []).filter(
    p => p.id !== 'plan_day_pass' && !p.name?.toLowerCase().includes('day pass')
  );
  const currentPlanDetails = availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0] || {
    id: 'plan_monthly',
    name: 'Monthly Pro Access',
    price: 1499,
    billingDuration: '1 Month'
  };

  return (
    <div style={{ minHeight: '100%' }}>
      <Header />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Readiness Motivational Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.08) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className={`badge badge-${goalClass}`}>{goal} MODE</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Daily Readiness Status</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              Your body is ready for today's workout.
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Recovery readiness score is <b style={{ color: 'var(--primary)' }}>{recovery?.recoveryScore || 88}%</b>. CNS and glycogen stores primed.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('recovery')}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '3px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
              {recovery?.recoveryScore || 88}
            </span>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>SCORE</span>
          </div>
        </div>

        {/* ACTIVE DATA INTERFACES CONTROLLER BAR */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                Active Data Interfaces ({selectedFeatures.length}/3)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {selectedFeatures.length === 3
                  ? 'All 3 modules active. Click any chip to toggle or hide specific datasets.'
                  : `Customized view: ${3 - selectedFeatures.length} dataset${3 - selectedFeatures.length > 1 ? 's' : ''} excluded. Click chip to re-enable.`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Workout Chip */}
            <button
              type="button"
              onClick={() => {
                if (isWorkoutActive && selectedFeatures.length <= 1) {
                  showToast('At least 1 interface must remain active', 'info');
                  return;
                }
                toggleFeatureSelection('workout');
                showToast(isWorkoutActive ? 'Excluded Workout Planner from dashboard' : 'Activated Workout Planner interface!', isWorkoutActive ? 'info' : 'success');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: isWorkoutActive ? '1px solid var(--primary)' : '1px dashed rgba(248, 113, 113, 0.4)',
                background: isWorkoutActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                color: isWorkoutActive ? 'var(--primary)' : '#f87171',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isWorkoutActive ? 'Click to exclude Workout interface' : 'Click to activate Workout interface'}
            >
              <Dumbbell size={13} />
              <span>Workout Planner</span>
              <span style={{ fontSize: '9px', fontWeight: 900 }}>{isWorkoutActive ? '✓' : '✕'}</span>
            </button>

            {/* Nutrition Chip */}
            <button
              type="button"
              onClick={() => {
                if (isNutritionActive && selectedFeatures.length <= 1) {
                  showToast('At least 1 interface must remain active', 'info');
                  return;
                }
                toggleFeatureSelection('nutrition');
                showToast(isNutritionActive ? 'Excluded Nutrition & Vitals from dashboard' : 'Activated Nutrition & Vitals interface!', isNutritionActive ? 'info' : 'success');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: isNutritionActive ? '1px solid var(--cyan)' : '1px dashed rgba(248, 113, 113, 0.4)',
                background: isNutritionActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                color: isNutritionActive ? 'var(--cyan)' : '#f87171',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isNutritionActive ? 'Click to exclude Nutrition interface' : 'Click to activate Nutrition interface'}
            >
              <Utensils size={13} />
              <span>Nutrition & Vitals</span>
              <span style={{ fontSize: '9px', fontWeight: 900 }}>{isNutritionActive ? '✓' : '✕'}</span>
            </button>

            {/* Gyms Chip */}
            <button
              type="button"
              onClick={() => {
                if (isGymsActive && selectedFeatures.length <= 1) {
                  showToast('At least 1 interface must remain active', 'info');
                  return;
                }
                toggleFeatureSelection('gyms');
                showToast(isGymsActive ? 'Excluded Gym Locator from dashboard' : 'Activated Gym Locator interface!', isGymsActive ? 'info' : 'success');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: isGymsActive ? '1px solid var(--amber)' : '1px dashed rgba(248, 113, 113, 0.4)',
                background: isGymsActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                color: isGymsActive ? 'var(--amber)' : '#f87171',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isGymsActive ? 'Click to exclude Gym Locator interface' : 'Click to activate Gym Locator interface'}
            >
              <MapPin size={13} />
              <span>GPS Gym Locator</span>
              <span style={{ fontSize: '9px', fontWeight: 900 }}>{isGymsActive ? '✓' : '✕'}</span>
            </button>

            {selectedFeatures.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFeatures(['workout', 'nutrition', 'gyms']);
                  showToast('All 3 data interfaces enabled!', 'success');
                }}
                className="chip"
                style={{ fontSize: '10px', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.4)', fontWeight: 800, cursor: 'pointer' }}
              >
                Reset (All 3)
              </button>
            )}
          </div>
        </div>

        {/* Quick Functional Hub Pills */}

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'bulking-cutting', label: 'Bulking & Cutting', icon: TrendingUp },
            { id: 'hydration', label: 'Hydration (3.5L)', icon: Droplet },
            { id: 'recovery', label: 'Sleep & Recovery', icon: Moon },
            { id: 'supplements', label: 'Supplements', icon: Sparkles },
            { id: 'progress', label: 'Weight & PRs', icon: Flame }
          ].map(hub => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.id}
                onClick={() => setActiveTab(hub.id)}
                className="chip"
                style={{ whiteSpace: 'nowrap', padding: '7px 14px', fontSize: '12px' }}
              >
                <Icon size={14} color="var(--primary)" />
                <span>{hub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Responsive Laptop 2-Column Section */}
        <div className="laptop-2-cols">
          {/* Column 1: Nutrition & Today's Workout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Daily Nutrition & Macronutrient Target Ring Card */}
            {isNutritionActive ? (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h4 className="card-title">Nutrition & Macro Target</h4>
                    <span className="card-subtitle">
                      {nutrition?.consumed?.calories || 1490} / {nutrition?.targets?.calories || 2850} kcal
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Log Meal <Plus size={12} />
                  </button>
                </div>

                {/* Macro Rings Grid */}
                <div className="grid-4" style={{ alignItems: 'center', margin: '8px 0 14px' }}>
                  <MacroRing
                    size={76}
                    strokeWidth={7}
                    percentage={nutrition?.percentage?.calories || 52}
                    color="var(--amber)"
                    label="Calories"
                    value={`${nutrition?.consumed?.calories || 1490}`}
                    sublabel="kcal"
                  />
                  <MacroRing
                    size={76}
                    strokeWidth={7}
                    percentage={nutrition?.percentage?.protein || 68}
                    color="var(--primary)"
                    label="Protein"
                    value={`${nutrition?.consumed?.protein || 112}g`}
                    sublabel={`/${nutrition?.targets?.protein || 165}g`}
                  />
                  <MacroRing
                    size={76}
                    strokeWidth={7}
                    percentage={nutrition?.percentage?.carbs || 44}
                    color="var(--cyan)"
                    label="Carbs"
                    value={`${nutrition?.consumed?.carbs || 145}g`}
                    sublabel={`/${nutrition?.targets?.carbs || 340}g`}
                  />
                  <MacroRing
                    size={76}
                    strokeWidth={7}
                    percentage={nutrition?.percentage?.fat || 58}
                    color="var(--purple)"
                    label="Fats"
                    value={`${nutrition?.consumed?.fat || 48}g`}
                    sublabel={`/${nutrition?.targets?.fat || 75}g`}
                  />
                </div>

                <div
                  onClick={() => setActiveTab('nutrition')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Remaining to goal: <b style={{ color: 'var(--text-primary)' }}>{nutrition?.remaining?.calories || 1360} kcal</b> • <b style={{ color: 'var(--primary)' }}>{nutrition?.remaining?.protein || 53}g Protein</b>
                  </span>
                  <ArrowRight size={14} color="var(--primary)" />
                </div>
              </div>
            ) : (
              /* NUTRITION INTERFACE EXCLUDED PLACEHOLDER */
              <div className="card" style={{
                padding: '16px 18px',
                border: '1.5px dashed rgba(6, 182, 212, 0.35)',
                background: 'rgba(6, 182, 212, 0.03)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan)' }}>
                    <Utensils size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>Nutrition & Macro Target Excluded</h4>
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', fontWeight: 800 }}>✕ EXCLUDED</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calorie & macro rings are hidden per your 3-choice selection.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleFeatureSelection('nutrition');
                    showToast('Activated Nutrition & Vitals interface!', 'success');
                  }}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '11px', color: 'var(--cyan)', borderColor: 'var(--cyan)', whiteSpace: 'nowrap' }}
                >
                  Activate
                </button>
              </div>
            )}

            {/* Today's Workout Routine Card & Visual Video Demonstrator */}
            {isWorkoutActive ? (
              <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.35)', padding: '18px' }}>
              <div className="card-header" style={{ marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Today's Preferred Routine
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 800,
                      background: 'rgba(16,185,129,0.15)', color: 'var(--primary)',
                      padding: '2px 6px', borderRadius: '4px'
                    }}>
                      {user?.primaryGoal || 'Bulking'} Protocol
                    </span>
                  </div>
                  <h4 className="card-title" style={{ marginTop: '2px', fontSize: '16px' }}>
                    {activeDay?.dayName || 'Day 1 — Chest + Triceps'}
                  </h4>
                </div>

                {/* View Mode Toggle: Video Demo vs Visual Chart vs List */}
                <div style={{
                  display: 'flex',
                  background: 'var(--bg-surface)',
                  borderRadius: '10px',
                  padding: '3px',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '2px'
                }}>
                  <button
                    type="button"
                    onClick={() => setWorkoutViewMode('video')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 8px', borderRadius: '7px', border: 'none',
                      background: workoutViewMode === 'video' ? 'var(--primary)' : 'transparent',
                      color: workoutViewMode === 'video' ? '#0b0f19' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Video size={12} />
                    <span>Video Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutViewMode('chart')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 8px', borderRadius: '7px', border: 'none',
                      background: workoutViewMode === 'chart' ? 'var(--primary)' : 'transparent',
                      color: workoutViewMode === 'chart' ? '#0b0f19' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ImageIcon size={12} />
                    <span>6-Day Chart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutViewMode('list')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 8px', borderRadius: '7px', border: 'none',
                      background: workoutViewMode === 'list' ? 'var(--primary)' : 'transparent',
                      color: workoutViewMode === 'list' ? '#0b0f19' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Dumbbell size={12} />
                    <span>List</span>
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Focus: {activeDay?.focus || 'Hypertrophy & Heavy Pressing Volume'} &bull; <b style={{ color: 'var(--primary)' }}>Personalized for {user?.name || 'Alex'}</b>
              </p>

              {/* RENDER: Visual Video Demonstrator */}
              {workoutViewMode === 'video' ? (
                <div style={{ marginBottom: '14px' }}>
                  <WorkoutVideoDemonstrator
                    workoutDay={activeDay}
                    initialExerciseIndex={activeVideoIndex}
                  />
                </div>
              ) : workoutViewMode === 'chart' ? (
                /* Visual 6-Day Workout Plan Poster & Disciplines */
                <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#070b13',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    textAlign: 'center',
                    padding: '8px',
                    position: 'relative'
                  }}>
                    <img
                      src="/images/6_day_workout_plan.jpg"
                      alt="6 Day Workout Plan"
                      style={{
                        width: '100%',
                        maxHeight: '360px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>

                  {/* 4 Pillars Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                    <div style={{ padding: '6px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <b style={{ color: 'var(--primary)', display: 'block' }}>🦾 STAY CONSISTENT</b>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Key to visible results</span>
                    </div>
                    <div style={{ padding: '6px 8px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                      <b style={{ color: 'var(--cyan)', display: 'block' }}>🍽️ EAT CLEAN</b>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>High protein fuel</span>
                    </div>
                    <div style={{ padding: '6px 8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <b style={{ color: '#38bdf8', display: 'block' }}>💧 STAY HYDRATED</b>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Drink throughout day</span>
                    </div>
                    <div style={{ padding: '6px 8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      <b style={{ color: 'var(--amber)', display: 'block' }}>🛌 ENOUGH SLEEP</b>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>7-8 hrs recovery</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Quick exercise preview list */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {activeDay?.exercises?.map((ex, i) => (
                    <div
                      key={ex.id || i}
                      onClick={() => {
                        setActiveVideoIndex(i);
                        setWorkoutViewMode('video');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ex.completed ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <div>
                          <span style={{ fontWeight: 600, color: ex.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: ex.completed ? 'line-through' : 'none' }}>
                            {ex.name}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--cyan)', display: 'block' }}>
                            Click to watch visual video demo
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {ex.sets} × {ex.reps} @ {ex.weight}
                        </span>
                        <Video size={14} color="var(--primary)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="btn btn-outline"
                  style={{ height: '44px', fontSize: '13px', fontWeight: 700, gap: '6px' }}
                >
                  <Eye size={15} color="var(--cyan)" />
                  <span>Fullscreen Video</span>
                </button>
                <button
                  id="btn-start-workout-dash"
                  className="btn btn-primary"
                  style={{ height: '44px', fontSize: '13px', fontWeight: 800, gap: '6px' }}
                  onClick={() => setActiveTab('workout')}
                >
                  <Play size={15} fill="#0b0f19" />
                  <span>Start Live Session</span>
                </button>
              </div>
            </div>
          ) : (
            /* WORKOUT INTERFACE EXCLUDED PLACEHOLDER */
            <div className="card" style={{
              padding: '16px 18px',
              border: '1.5px dashed rgba(16, 185, 129, 0.35)',
              background: 'rgba(16, 185, 129, 0.03)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)' }}>
                  <Dumbbell size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>6-Day Split Workout Planner Excluded</h4>
                    <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', fontWeight: 800 }}>✕ EXCLUDED</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily routine and exercise video demos are hidden per your 3-choice selection.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleFeatureSelection('workout');
                  showToast('Activated Workout Planner interface!', 'success');
                }}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '11px', color: 'var(--primary)', borderColor: 'var(--primary)', whiteSpace: 'nowrap' }}
              >
                Activate
              </button>
            </div>
          )}
        </div>

          {/* Column 2: 4 Biometrics + Gyms Teaser */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 4-Item Real-Time Biometric Grid */}
            {isNutritionActive ? (
              <div className="grid-2">
                {/* Hydration Card with 1-Click Increment */}
                <div className="card" style={{ padding: '16px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplet size={16} color="var(--cyan)" />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>Hydration</span>
                    </div>
                    <button
                      onClick={handleQuickAddWater}
                      className="btn btn-sm"
                      style={{ padding: '3px 8px', background: 'var(--cyan-subtle)', color: 'var(--cyan)', fontSize: '11px' }}
                      title="Quick log 250ml"
                    >
                      +250ml
                    </button>
                  </div>
                  <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {hydration?.consumedLiters || 2.25} L
                  </h4>
                  <div className="progress-bar-bg" style={{ height: '6px', margin: '10px 0 8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${hydration?.percentage || 64}%`, background: 'var(--cyan)' }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Target: {hydration?.targetLiters || 3.5} L ({hydration?.remainingLiters || 1.25} L left)
                  </span>
                </div>

                {/* Steps Activity Card */}
                <div className="card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('vitals')}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Footprints size={16} color="var(--primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>Daily Steps</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                      {Math.round(((vitals?.steps || 8420) / (vitals?.stepGoal || 10000)) * 100)}%
                    </span>
                  </div>
                  <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(vitals?.steps || 8420).toLocaleString()}
                  </h4>
                  <div className="progress-bar-bg" style={{ height: '6px', margin: '10px 0 8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.round(((vitals?.steps || 8420) / (vitals?.stepGoal || 10000)) * 100))}%`,
                        background: 'var(--primary)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Goal: {(vitals?.stepGoal || 10000).toLocaleString()} steps
                  </span>
                </div>

                {/* Live Heart Rate Card */}
                <div className="card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('vitals')}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Heart size={16} color="var(--rose)" />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>Heart Rate</span>
                    </div>
                    <span className="badge" style={{ background: 'var(--rose-subtle)', color: 'var(--rose)', fontSize: '9px' }}>
                      {vitals?.isWearableConnected ? 'LIVE SYNC' : 'RESTING'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {vitals?.liveBpm || vitals?.heartRateBpm || 68}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>BPM</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                    Resting: {vitals?.restingHeartRate || 58} BPM • Normal
                  </span>
                </div>

                {/* Sleep & CNS Recovery Card */}
                <div className="card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('recovery')}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Moon size={16} color="var(--indigo)" />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>Sleep Rest</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--indigo)', fontWeight: 700 }}>
                      {vitals?.sleepHours || 7.6}h / 8.0h
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {vitals?.sleepHours || 7.6}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>hours</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                    Quality: {recovery?.sleep?.quality || 'Excellent'} • 5 Cycles
                  </span>
                </div>
              </div>
            ) : (
              /* VITALS INTERFACE EXCLUDED PLACEHOLDER */
              <div className="card" style={{
                padding: '16px 18px',
                border: '1.5px dashed rgba(6, 182, 212, 0.35)',
                background: 'rgba(6, 182, 212, 0.03)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan)' }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>Vitals & Biometrics Sync Excluded</h4>
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', fontWeight: 800 }}>✕ EXCLUDED</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hydration, step counter, heart rate, and sleep rest are hidden.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleFeatureSelection('nutrition');
                    showToast('Activated Nutrition & Vitals interface!', 'success');
                  }}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '11px', color: 'var(--cyan)', borderColor: 'var(--cyan)', whiteSpace: 'nowrap' }}
                >
                  Activate
                </button>
              </div>
            )}

            {/* Nearest Gym & Static Map Section */}
            {isGymsActive ? (
              <div style={{ marginTop: '4px' }}>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Nearest Gym & Live Street Map
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Real-time GPS positioning & live navigation for active members
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gyms')}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '11px', height: '28px', gap: '4px' }}
                  >
                    <span>All Gyms</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <LiveStreetGymMap
                  gyms={nearbyGyms}
                  height="340px"
                  compact={true}
                  title="Real Street Map — Nearest Fitness Center"
                  onBookPass={(gym) => {
                    setActiveTab('gyms');
                    showToast(`Opening day pass booking for ${gym.name}...`, 'info');
                  }}
                  onSelectGym={(gym) => {
                    showToast(`Selected ${gym.name} • ${gym.distanceKm} km away`, 'info');
                  }}
                />
              </div>
            ) : (
              /* GPS GYM MAP EXCLUDED PLACEHOLDER */
              <div className="card" style={{
                padding: '16px 18px',
                border: '1.5px dashed rgba(245, 158, 11, 0.35)',
                background: 'rgba(245, 158, 11, 0.03)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber)' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>GPS Gym Locator & Live Street Map Excluded</h4>
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', fontWeight: 800 }}>✕ EXCLUDED</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interactive street map and nearby gyms discovery are hidden.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleFeatureSelection('gyms');
                    showToast('Activated GPS Gym Locator interface!', 'success');
                  }}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '11px', color: 'var(--amber)', borderColor: 'var(--amber)', whiteSpace: 'nowrap' }}
                >
                  Activate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
              workoutDay={activeDay}
              initialExerciseIndex={activeVideoIndex}
              isModal={true}
              onClose={() => setShowVideoModal(false)}
            />
          </div>
        </div>
      )}

      {/* GYM REDEMPTION & MEMBERSHIP PAYMENT MODAL (ONLINE & CASH) */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Gym Membership & Fee Payment</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Linked Center: <b style={{ color: 'var(--primary)' }}>{linkedGym?.name || 'Iron Fortress Barbell Club'}</b>
                </p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {/* If Payment/Voucher is Generated: Show Confirmation View */}
            {paymentResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: paymentResult.paymentMethod === 'online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `2px solid ${paymentResult.paymentMethod === 'online' ? 'var(--primary)' : 'var(--amber)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  {paymentResult.paymentMethod === 'online' ? (
                    <CheckCircle2 size={36} color="var(--primary)" />
                  ) : (
                    <Banknote size={36} color="var(--amber)" />
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800 }}>
                    {paymentResult.paymentMethod === 'online' ? 'Payment Successful!' : 'Cash Desk Voucher Issued!'}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {paymentResult.message}
                  </p>
                </div>

                {/* Voucher / Receipt Card */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gym Center</span>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{paymentResult.gymName || linkedGym?.name}</span>
                  </div>

                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selected Plan</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                      {paymentResult.plan?.name || currentPlanDetails.name} ({paymentResult.plan?.billingDuration || currentPlanDetails.billingDuration})
                    </span>
                  </div>

                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Amount</span>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>
                      ₹{(paymentResult.plan?.price || currentPlanDetails.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment Mode</span>
                    <span className="badge" style={{
                      fontSize: '10px',
                      background: paymentResult.paymentMethod === 'online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: paymentResult.paymentMethod === 'online' ? 'var(--primary)' : 'var(--amber)'
                    }}>
                      {paymentResult.paymentMethod === 'online' ? 'ONLINE (UPI / CARD)' : 'CASH AT FRONT DESK'}
                    </span>
                  </div>

                  {paymentResult.paymentMethod === 'cash' ? (
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px dashed var(--amber)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700, display: 'block' }}>
                          DESK REDEMPTION TOKEN
                        </span>
                        <code style={{ fontSize: '16px', fontWeight: 900, color: '#fbbf24' }}>
                          {paymentResult.cashToken?.tokenId || 'CASH-PASS-8392'}
                        </code>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          Hand ₹{(paymentResult.plan?.price || currentPlanDetails.price).toLocaleString('en-IN')} cash at front desk
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(paymentResult.cashToken?.tokenId || '', 'Desk Token')}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '11px', height: '32px' }}
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  ) : (
                    <div className="flex-between" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transaction Reference</span>
                      <code style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 700 }}>
                        {paymentResult.receiptId || 'FH-TXN-9281'}
                      </code>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setPaymentResult(null);
                  }}
                  className="btn btn-primary btn-full"
                  style={{ height: '42px', fontSize: '13px', fontWeight: 800 }}
                >
                  Done & Back to Dashboard
                </button>
              </div>
            ) : (
              /* Payment Form */
              <form onSubmit={handlePayMembership} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Fee Plan Selection (Prices in ₹ INR) */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                    1. Select Linked Gym Fee Plan (₹ INR)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {availablePlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                                  {plan.name}
                                </span>
                                {plan.badge && (
                                  <span className="badge" style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)' }}>
                                    {plan.badge}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {plan.billingDuration} &bull; {plan.features?.[0] || 'Full Gym & Equipment Access'}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                              ₹{plan.price?.toLocaleString('en-IN')}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              Incl. GST
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Payment Method Switcher: Online vs Cash */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                    2. Choose Payment Mode
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {/* Mode A: Online */}
                    <div
                      onClick={() => setPaymentMethod('online')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: paymentMethod === 'online' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                        border: paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <CreditCard size={20} color={paymentMethod === 'online' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 800, color: paymentMethod === 'online' ? 'var(--primary)' : 'var(--text-primary)' }}>
                        Online Payment
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        UPI, GPay, PhonePe, Cards
                      </span>
                    </div>

                    {/* Mode B: Cash at Front Desk */}
                    <div
                      onClick={() => setPaymentMethod('cash')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: paymentMethod === 'cash' ? 'rgba(245, 158, 11, 0.14)' : 'var(--bg-surface)',
                        border: paymentMethod === 'cash' ? '2px solid var(--amber)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <Banknote size={20} color={paymentMethod === 'cash' ? 'var(--amber)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 800, color: paymentMethod === 'cash' ? 'var(--amber)' : 'var(--text-primary)' }}>
                        Cash at Front Desk
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Pay Cash at Gym Reception
                      </span>
                    </div>
                  </div>

                  {/* Context Sub-Form based on Payment Method */}
                  {paymentMethod === 'online' ? (
                    <div style={{
                      padding: '12px 14px',
                      background: 'rgba(16, 185, 129, 0.06)',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { id: 'upi_gpay', label: 'Google Pay' },
                          { id: 'upi_phonepe', label: 'PhonePe' },
                          { id: 'upi_paytm', label: 'Paytm UPI' },
                          { id: 'card', label: 'Card' }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setOnlineProvider(opt.id)}
                            className="chip"
                            style={{
                              fontSize: '11px',
                              background: onlineProvider === opt.id ? 'var(--primary)' : 'var(--bg-surface)',
                              color: onlineProvider === opt.id ? '#0b0f19' : 'var(--text-secondary)',
                              borderColor: onlineProvider === opt.id ? 'var(--primary)' : 'var(--border-color)',
                              fontWeight: 700
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {onlineProvider === 'card' ? (
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Card Number (e.g. 4532 •••• •••• 8921)"
                          defaultValue="4532 8921 0932 7712"
                          style={{ height: '38px', fontSize: '12px' }}
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter UPI ID (e.g. yourname@oksbi)"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          style={{ height: '38px', fontSize: '12px' }}
                        />
                      )}
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        ⚡ Instant membership activation upon authorization.
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 14px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      <p style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>
                        How Front Desk Cash Payment Works:
                      </p>
                      <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                        <li>Click below to generate your <b>Cash Verification Voucher</b>.</li>
                        <li>Show the voucher token to the gym admin/receptionist.</li>
                        <li>Hand over <b>₹{currentPlanDetails.price?.toLocaleString('en-IN')}</b> cash. The admin will verify and activate your pass instantly.</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Total & Submit Button */}
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Payable</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{currentPlanDetails.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: '42px', padding: '0 24px', fontSize: '13px', fontWeight: 800 }}
                    disabled={processingPayment}
                  >
                    {processingPayment
                      ? 'Processing...'
                      : paymentMethod === 'online'
                      ? `Pay ₹${currentPlanDetails.price?.toLocaleString('en-IN')} Online`
                      : `Generate Cash Token (₹${currentPlanDetails.price?.toLocaleString('en-IN')})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
