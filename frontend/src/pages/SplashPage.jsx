import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import {
  Activity,
  ShieldCheck,
  Dumbbell,
  ArrowRight,
  Check,
  Sparkles,
  UserCheck,
  Lock,
  Mail,
  User,
  Target,
  Zap,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';

export const SplashPage = ({ onGetStarted, onLogin, onBackToLanding }) => {
  const { register, login } = useAuth();
  const { showToast, setActiveTab, selectedFeatures, setSelectedFeatures, toggleFeatureSelection } = useFitness();

  // Active view: 'register' | 'login'
  const [activeTab, setActiveTabMode] = useState('login'); // default to login so user can log in with all 3 buttons right away
  const [showInputModal, setShowInputModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Complete User Inputs State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    targetWeight: '',
    primaryGoal: 'Bulking',
    fitnessLevel: 'Intermediate',
    activityLevel: 'Moderately Active (3-5 days/week)',
    dietaryPreference: 'High Protein'
  });

  // Login form state
  const [loginRole, setLoginRole] = useState('member'); // 'member' | 'admin'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Target tab to open upon login (defaulted to nutrition or first active feature)
  const [targetLoginTab, setTargetLoginTab] = useState('nutrition'); // 'dashboard' | 'workout' | 'nutrition' | 'gyms'

  // Toggle selection of any of the 3 feature buttons: allow 1, 2, or all 3 selected!
  const toggleFeature = (id) => {
    const isCurrentlyActive = selectedFeatures.includes(id);
    if (isCurrentlyActive && selectedFeatures.length <= 1) {
      showToast('Keep at least 1 feature active', 'info');
      return;
    }
    toggleFeatureSelection(id);
    const featureName = id === 'workout' ? 'Workout Planner' : id === 'nutrition' ? 'Nutrition & Vitals' : 'Gym Locator';
    if (isCurrentlyActive) {
      showToast(`Excluded ${featureName} interface`, 'info');
    } else {
      showToast(`Activated ${featureName} interface!`, 'success');
    }
  };

  const handleSelectAllThree = () => {
    setSelectedFeatures(['workout', 'nutrition', 'gyms']);
    showToast('All 3 core features enabled: Workout, Nutrition, and Gyms!', 'success');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Direct login to a specific button/feature
  const handleLoginDirectToFeature = async (featureId, featureName) => {
    if (!loginEmail || !loginPassword) {
      if (featureId) setActiveTab(featureId);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (featureId && featureId !== 'dashboard' && !selectedFeatures.includes(featureId)) {
        setSelectedFeatures([...selectedFeatures, featureId]);
      }
      await login(loginEmail, loginPassword);
      if (featureId) {
        setActiveTab(featureId);
      }
      showToast(`Logged in successfully! Launching ${featureName || 'Fit Health'}...`, 'success');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Live macro estimate
  const estimatedCalories = (() => {
    let bmr = (10 * Number(formData.weight || 75)) + (6.25 * Number(formData.height || 175)) - (5 * Number(formData.age || 24));
    bmr = formData.gender === 'Female' ? bmr - 161 : bmr + 5;
    let tdee = Math.round(bmr * 1.45);
    if (formData.primaryGoal === 'Bulking') return tdee + 400;
    if (formData.primaryGoal === 'Cutting') return Math.max(1500, tdee - 500);
    return tdee;
  })();

  const estimatedProtein = Math.round(
    Number(formData.weight || 75) * (formData.primaryGoal === 'Cutting' ? 2.4 : 2.2)
  );

  // Submit all user inputs and register
  const handleRegisterAllInputs = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return setError('Please provide your athlete name');
    if (!formData.email.trim() || !formData.email.includes('@')) return setError('Please enter a valid email address');
    if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    setError('');
    try {
      await register({
        ...formData,
        age: formData.age ? Number(formData.age) : 24,
        height: formData.height ? Number(formData.height) : 175,
        weight: formData.weight ? Number(formData.weight) : 75,
        selectedFeatures
      });
      showToast(`Account created with all ${selectedFeatures.length} features active! Welcome to Fit Health.`, 'success');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  // Standard Login Submit
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(loginEmail, loginPassword);
      const isUserAdmin = res?.user?.role === 'admin' || loginEmail.includes('admin') || loginRole === 'admin';
      if (isUserAdmin) {
        setActiveTab('admin');
        showToast('Gym Administrator authenticated! Welcome Coach Marcus Vance.', 'success');
      } else if (targetLoginTab && targetLoginTab !== 'dashboard') {
        setActiveTab(targetLoginTab);
        showToast(`Welcome back Alex! Opening ${targetLoginTab === 'workout' ? 'Workout Planner' : targetLoginTab === 'nutrition' ? 'Nutrition Tracker' : 'Gym Locator'}...`, 'success');
      } else {
        showToast(`Welcome back Alex! Logged in with all ${selectedFeatures.length} features active.`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      width: '100%',
      padding: '24px 20px 32px',
      background: 'radial-gradient(circle at 50% 15%, #172554 0%, var(--bg-primary) 70%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {onBackToLanding && (
        <div style={{ width: '100%', maxWidth: '1060px', margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={onBackToLanding}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            ← Back to Landing Page
          </button>
        </div>
      )}
      <div style={{
        width: '100%',
        maxWidth: '1060px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* LEFT COLUMN: Brand Emblem & ALL THREE Selectable / Login Buttons */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Animated Brand Emblem */}
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 12px 30px rgba(16, 185, 129, 0.35)'
          }}>
            <Activity size={38} color="#0b0f19" strokeWidth={2.8} />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Fit Health
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px', marginBottom: '14px' }}>
            The Ultimate Gym Fitness Companion for the Health Conscious
          </p>

          {/* Interactive Feature Selection Notice & Select All Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              background: selectedFeatures.length === 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: selectedFeatures.length === 3 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              fontSize: '11px',
              color: selectedFeatures.length === 3 ? 'var(--primary)' : 'var(--amber)',
              fontWeight: 700
            }}>
              <Sparkles size={12} />
              <span>
                {selectedFeatures.length === 3
                  ? '✓ All 3 Data Interfaces Active'
                  : `⚡ ${selectedFeatures.length} of 3 Selected (${['workout', 'nutrition', 'gyms'].filter(f => !selectedFeatures.includes(f)).map(f => f === 'workout' ? 'Workout' : f === 'nutrition' ? 'Nutrition' : 'Gyms').join(', ')} Excluded)`}
              </span>
            </div>

            {selectedFeatures.length < 3 && (
              <button
                type="button"
                onClick={handleSelectAllThree}
                className="chip"
                style={{ fontSize: '10px', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.35)', cursor: 'pointer', fontWeight: 700 }}
              >
                Reset (Use All 3)
              </button>
            )}
          </div>

          {/* ALL THREE Interactive Buttons: Selectable + Direct 1-Click Login to Each Feature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '390px' }}>

            {/* BUTTON 1: 6-Day Split Workout Planner */}
            <div
              onClick={() => toggleFeature('workout')}
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedFeatures.includes('workout')
                  ? '2px solid var(--primary)'
                  : '1.5px dashed rgba(248, 113, 113, 0.45)',
                background: selectedFeatures.includes('workout')
                  ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.16), var(--bg-card))'
                  : 'rgba(15, 23, 42, 0.55)',
                boxShadow: selectedFeatures.includes('workout')
                  ? '0 0 16px rgba(16, 185, 129, 0.25)'
                  : 'none',
                opacity: selectedFeatures.includes('workout') ? 1 : 0.62,
                transform: selectedFeatures.includes('workout') ? 'translateY(-2px)' : 'none',
                transition: 'all 0.25s ease',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: selectedFeatures.includes('workout') ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedFeatures.includes('workout') ? '#0b0f19' : 'var(--text-muted)'
                }}>
                  <Dumbbell size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: selectedFeatures.includes('workout') ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      6-Day Split Workout Planner
                    </h4>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: selectedFeatures.includes('workout') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.18)',
                      color: selectedFeatures.includes('workout') ? 'var(--primary)' : '#f87171',
                      border: selectedFeatures.includes('workout') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)',
                      fontWeight: 800
                    }}>
                      {selectedFeatures.includes('workout') ? '✓ Active' : '✕ Excluded'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedFeatures.includes('workout') ? 'Personalized bulking & cutting regimens' : 'Click to activate Workout interface'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 1-Click Direct Login Button to this Feature */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogin('member');
                  }}
                  className="btn btn-sm btn-primary"
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    height: '26px',
                    background: selectedFeatures.includes('workout') ? 'linear-gradient(135deg, var(--primary), #059669)' : 'rgba(255,255,255,0.1)',
                    color: selectedFeatures.includes('workout') ? '#0b0f19' : 'var(--text-primary)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                  title="Navigate to Login"
                >
                  <Zap size={10} /> Login
                </button>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedFeatures.includes('workout') ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  border: selectedFeatures.includes('workout') ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                  color: selectedFeatures.includes('workout') ? '#0b0f19' : 'var(--text-muted)',
                  fontSize: '10px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {selectedFeatures.includes('workout') ? <Check size={12} strokeWidth={3} /> : '✕'}
                </div>
              </div>
            </div>

            {/* BUTTON 2: Nutrition & Vitals Sync */}
            <div
              onClick={() => toggleFeature('nutrition')}
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedFeatures.includes('nutrition')
                  ? '2px solid var(--cyan)'
                  : '1.5px dashed rgba(248, 113, 113, 0.45)',
                background: selectedFeatures.includes('nutrition')
                  ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.16), var(--bg-card))'
                  : 'rgba(15, 23, 42, 0.55)',
                boxShadow: selectedFeatures.includes('nutrition')
                  ? '0 0 16px rgba(6, 182, 212, 0.25)'
                  : 'none',
                opacity: selectedFeatures.includes('nutrition') ? 1 : 0.62,
                transform: selectedFeatures.includes('nutrition') ? 'translateY(-2px)' : 'none',
                transition: 'all 0.25s ease',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: selectedFeatures.includes('nutrition') ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedFeatures.includes('nutrition') ? '#0b0f19' : 'var(--text-muted)'
                }}>
                  <Activity size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: selectedFeatures.includes('nutrition') ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Nutrition & Vitals Sync
                    </h4>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: selectedFeatures.includes('nutrition') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(239, 68, 68, 0.18)',
                      color: selectedFeatures.includes('nutrition') ? 'var(--cyan)' : '#f87171',
                      border: selectedFeatures.includes('nutrition') ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)',
                      fontWeight: 800
                    }}>
                      {selectedFeatures.includes('nutrition') ? '✓ Active' : '✕ Excluded'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedFeatures.includes('nutrition') ? 'Macro rings, hydration & wearable data' : 'Click to activate Nutrition interface'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 1-Click Direct Login Button to this Feature */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogin('member');
                  }}
                  className="btn btn-sm btn-primary"
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    height: '26px',
                    background: selectedFeatures.includes('nutrition') ? 'linear-gradient(135deg, var(--cyan), #0284c7)' : 'rgba(255,255,255,0.1)',
                    color: selectedFeatures.includes('nutrition') ? '#0b0f19' : 'var(--text-primary)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                  title="Navigate to Login"
                >
                  <Zap size={10} /> Login
                </button>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedFeatures.includes('nutrition') ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
                  border: selectedFeatures.includes('nutrition') ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                  color: selectedFeatures.includes('nutrition') ? '#0b0f19' : 'var(--text-muted)',
                  fontSize: '10px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {selectedFeatures.includes('nutrition') ? <Check size={12} strokeWidth={3} /> : '✕'}
                </div>
              </div>
            </div>

            {/* BUTTON 3: GPS Gym Locator */}
            <div
              onClick={() => toggleFeature('gyms')}
              className="card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedFeatures.includes('gyms')
                  ? '2px solid var(--amber)'
                  : '1.5px dashed rgba(248, 113, 113, 0.45)',
                background: selectedFeatures.includes('gyms')
                  ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.16), var(--bg-card))'
                  : 'rgba(15, 23, 42, 0.55)',
                boxShadow: selectedFeatures.includes('gyms')
                  ? '0 0 16px rgba(245, 158, 11, 0.25)'
                  : 'none',
                opacity: selectedFeatures.includes('gyms') ? 1 : 0.62,
                transform: selectedFeatures.includes('gyms') ? 'translateY(-2px)' : 'none',
                transition: 'all 0.25s ease',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: selectedFeatures.includes('gyms') ? 'var(--amber)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedFeatures.includes('gyms') ? '#0b0f19' : 'var(--text-muted)'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: selectedFeatures.includes('gyms') ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      GPS Gym Locator
                    </h4>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: selectedFeatures.includes('gyms') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.18)',
                      color: selectedFeatures.includes('gyms') ? 'var(--amber)' : '#f87171',
                      border: selectedFeatures.includes('gyms') ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)',
                      fontWeight: 800
                    }}>
                      {selectedFeatures.includes('gyms') ? '✓ Active' : '✕ Excluded'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedFeatures.includes('gyms') ? 'Nearby gyms with instant day passes' : 'Click to activate Gym Locator interface'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 1-Click Direct Login Button to this Feature */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogin('member');
                  }}
                  className="btn btn-sm btn-primary"
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    height: '26px',
                    background: selectedFeatures.includes('gyms') ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'rgba(255,255,255,0.1)',
                    color: selectedFeatures.includes('gyms') ? '#0b0f19' : 'var(--text-primary)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                  title="Navigate to Login"
                >
                  <Zap size={10} /> Login
                </button>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedFeatures.includes('gyms') ? 'var(--amber)' : 'rgba(255,255,255,0.06)',
                  border: selectedFeatures.includes('gyms') ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                  color: selectedFeatures.includes('gyms') ? '#0b0f19' : 'var(--text-muted)',
                  fontSize: '10px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {selectedFeatures.includes('gyms') ? <Check size={12} strokeWidth={3} /> : '✕'}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Selection Alert if less than 3 are selected */}
          {selectedFeatures.length < 3 && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              fontSize: '11px',
              color: 'var(--amber)',
              width: '100%',
              maxWidth: '390px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              boxSizing: 'border-box'
            }}>
              <span>
                ⚡ <b>Customized Interface:</b> App will only show your {selectedFeatures.length} active dataset{selectedFeatures.length > 1 ? 's' : ''}.
              </span>
              <button
                type="button"
                onClick={handleSelectAllThree}
                style={{
                  background: 'var(--primary)',
                  color: '#0b0f19',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All 3
              </button>
            </div>
          )}

          {/* Quick Action Navigation Buttons on Mobile / Left Column */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '390px', marginTop: '16px' }}>
            <button
              id="btn-login-all-three"
              className="btn btn-primary btn-full"
              style={{ height: '44px', fontSize: '13px', fontWeight: 800 }}
              onClick={() => onLogin('member')}
            >
              <Zap size={14} />
              <span>
                {selectedFeatures.length === 3
                  ? 'Log In with All 3 Features Active'
                  : `Log In with ${selectedFeatures.length} Active Interface${selectedFeatures.length > 1 ? 's' : ''}`}
              </span>
            </button>

            <button
              id="btn-get-started-inputs"
              className="btn btn-secondary"
              style={{ height: '44px', fontSize: '12px', padding: '0 14px', whiteSpace: 'nowrap' }}
              onClick={onGetStarted}
            >
              Register ({selectedFeatures.length}/3 Inputs)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Image Showcase & User / Admin Login Directory */}
        <div className="card" style={{
          padding: '0',
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* THE LOGIN HERO IMAGE SHOWCASE */}
          <div style={{
            position: 'relative',
            height: '240px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
              alt="Fit Health Gym and Workout"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.85) contrast(1.1)'
              }}
            />
            {/* Vignette Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(11, 15, 25, 0.98) 0%, rgba(11, 15, 25, 0.35) 50%, rgba(11, 15, 25, 0.7) 100%)'
            }} />

            {/* Badges on Image */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(11, 15, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                <Lock size={12} />
                Secure Login Portal
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(11, 15, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--cyan)'
              }}>
                <Sparkles size={12} />
                Fit Health Pro
              </span>
            </div>

            {/* Hero Caption */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              right: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 4px',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                Elevate Your Discipline
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: 0,
                lineHeight: 1.4
              }}>
                Unified 6-day split regimens, live biometric sync and nearby gym passes.
              </p>
            </div>
          </div>

          {/* LOGIN DIRECTORY NAVIGATION FOR USER & ADMIN */}
          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Login Directory
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Select your portal to navigate to the secure login screen
                </p>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Direct Links
              </span>
            </div>

            {/* DIRECTORY LINK 1: GYM MEMBER (USER) */}
            <div
              id="directory-member-login"
              onClick={() => onLogin('member')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(11, 15, 25, 0.8))',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.15)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  flexShrink: 0
                }}>
                  <Dumbbell size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Gym Member Login
                    </h5>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: 'var(--primary)',
                      fontWeight: 800
                    }}>
                      User Portal
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                    Workouts, nutrition tracker, vitals sync & day passes
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* DIRECTORY LINK 2: GYM ADMIN */}
            <div
              id="directory-admin-login"
              onClick={() => onLogin('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(11, 15, 25, 0.8))',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--amber)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.15)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--amber), #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Gym Admin Portal
                    </h5>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: 'var(--amber)',
                      fontWeight: 800
                    }}>
                      Admin Console
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                    Member roster, floor check-ins, fee plans & gym maintenance
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--amber)',
                fontWeight: 800,
                fontSize: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* REGISTER ACCOUNT FOOTER */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 4px 0',
              borderTop: '1px solid var(--border-color)',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                New to Fit Health?
              </span>
              <button
                type="button"
                onClick={onGetStarted}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cyan)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Create Athlete Account <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Input Modal */}
      {showInputModal && (
        <div className="modal-overlay" onClick={() => setShowInputModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                {activeTab === 'register' ? 'Athlete Profile Inputs' : 'Log In to Account'}
              </h3>
              <button onClick={() => setShowInputModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            {activeTab === 'register' ? (
              <form onSubmit={handleRegisterAllInputs} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ height: '38px', fontSize: '13px' }}
                  required
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{ height: '38px', fontSize: '13px' }}
                  required
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password (min 6 chars)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{ height: '38px', fontSize: '13px' }}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    style={{ height: '36px', fontSize: '12px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    style={{ height: '36px', fontSize: '12px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    style={{ height: '36px', fontSize: '12px', textAlign: 'center' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ height: '42px', fontSize: '13px', fontWeight: 800, marginTop: '8px' }}
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Create Account & Start →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--bg-surface)', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('member');
                    }}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      border: 'none',
                      background: loginRole === 'member' ? 'var(--primary)' : 'transparent',
                      color: loginRole === 'member' ? '#0b0f19' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🏋️ Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('admin');
                    }}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      border: 'none',
                      background: loginRole === 'admin' ? 'var(--amber)' : 'transparent',
                      color: loginRole === 'admin' ? '#0b0f19' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ Admin
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {loginRole === 'admin' ? '🛡️ Gym Admin Secure Login' : '🏋️ Gym Member Secure Login'}
                </div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ height: '38px', fontSize: '13px' }}
                  required
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ height: '38px', fontSize: '13px' }}
                  required
                />
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Select Destination Feature:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setTargetLoginTab('workout')}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: targetLoginTab === 'workout' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        background: targetLoginTab === 'workout' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                        color: targetLoginTab === 'workout' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🏋️ Workout
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLoginTab('nutrition')}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: targetLoginTab === 'nutrition' ? '1px solid var(--cyan)' : '1px solid var(--border-color)',
                        background: targetLoginTab === 'nutrition' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
                        color: targetLoginTab === 'nutrition' ? 'var(--cyan)' : 'var(--text-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🥗 Nutrition
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLoginTab('gyms')}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: targetLoginTab === 'gyms' ? '1px solid var(--amber)' : '1px solid var(--border-color)',
                        background: targetLoginTab === 'gyms' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface)',
                        color: targetLoginTab === 'gyms' ? 'var(--amber)' : 'var(--text-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      📍 Gyms
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{
                    height: '42px',
                    fontSize: '13px',
                    fontWeight: 800,
                    marginTop: '8px',
                    background: loginRole === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                  }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : loginRole === 'admin' ? 'Sign In as Gym Admin →' : 'Sign In as Member →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
