import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';
import { ArrowRight, ArrowLeft, Check, Sparkles, Target, User, Activity, Dumbbell, Mail, KeyRound, X, ShieldCheck, RefreshCw } from 'lucide-react';
import { OtpPinInput } from '../components/OtpPinInput';

export const OnboardingPage = ({ onSwitchToLogin, onSwitchToAdminLogin, onBackToLanding }) => {
  const { register, loginWithOTP, login } = useAuth();
  const { showToast } = useFitness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [existingAccountDetected, setExistingAccountDetected] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    height: 178,
    weight: 76,
    targetWeight: 82,
    primaryGoal: 'Bulking', // Bulking | Cutting | Maintenance | General fitness
    fitnessLevel: 'Intermediate',
    activityLevel: 'Moderately Active (3-5 days/week)',
    dietaryPreference: 'High Protein',
    workoutExperience: '1-2 Years',
    role: 'member'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Dynamic estimate of targets
  const estimatedCalories = (() => {
    let bmr = (10 * Number(formData.weight)) + (6.25 * Number(formData.height)) - (5 * Number(formData.age));
    bmr = formData.gender === 'Female' ? bmr - 161 : bmr + 5;
    let tdee = Math.round(bmr * 1.45);
    if (formData.primaryGoal === 'Bulking') return tdee + 400;
    if (formData.primaryGoal === 'Cutting') return Math.max(1500, tdee - 500);
    return tdee;
  })();

  const estimatedProtein = Math.round(
    Number(formData.weight) * (formData.primaryGoal === 'Cutting' ? 2.4 : 2.2)
  );

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) return setError('Please enter your full name');
      if (!formData.email.trim() || !formData.email.includes('@')) return setError('Please enter a valid email address');
      if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleInitiateSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.sendOTP(formData.email, 'registration', formData.role);
      setShowOtpModal(true);
      setOtpCode(''); // Clean input, user enters code from their email
      setResendCountdown(30);
      if (res?.accountExists) {
        setExistingAccountDetected(true);
        setDetectedRole(res.role || 'member');
      }
      showToast(res?.message || `Verification code sent to ${formData.email}`, 'info');
    } catch (err) {
      console.warn('OTP send warning:', err.message);
      setError(err.message || 'Failed to dispatch verification code. Please check your email and connection.');
      showToast(err.message || 'Failed to dispatch verification code.', 'error');
      setShowOtpModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      return setError('Please enter the 6-digit verification code.');
    }
    setOtpLoading(true);
    setError('');

    try {
      await api.verifyOTP(formData.email, otpCode.trim(), 'registration');
      const regRes = await register({
        ...formData,
        age: formData.age ? Number(formData.age) : 24,
      });

      if (regRes?.isExistingUser) {
        showToast(`Welcome back, ${regRes.user?.name || 'Athlete'}! Email verified and logged in.`, 'success');
      } else {
        showToast('Email verified & profile configured! Welcome to Fit Health.', 'success');
      }
    } catch (err) {
      // If error message indicates account already exists, auto-login with the verified OTP!
      if (err.message && (err.message.includes('already exists') || err.message.includes('Please log in'))) {
        try {
          await loginWithOTP(formData.email, otpCode.trim());
          showToast(`Welcome back! Successfully logged in with verification code.`, 'success');
          return;
        } catch (loginErr) {
          setError('An account with this email already exists. Click below to sign in.');
          setExistingAccountDetected(true);
        }
      } else {
        setError(err.message || 'Verification failed. Please verify the code.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpResending(true);
    setError('');
    try {
      await api.resendOTP(formData.email, 'registration', formData.role);
      setOtpCode(''); // Keep clean for user entry from email
      setResendCountdown(30);
      showToast(`Fresh verification code dispatched to ${formData.email}`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please wait before retrying.');
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar with Step Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <button
          onClick={step > 1 ? handleBack : onBackToLanding ? onBackToLanding : onSwitchToLogin}
          className="icon-btn"
          title="Back"
          style={{ width: '34px', height: '34px' }}
        >
          <ArrowLeft size={16} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Step {step} of 4
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onSwitchToAdminLogin || (() => onSwitchToLogin('admin'))}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--amber)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={12} color="var(--amber)" />
            Admin Portal
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="progress-bar-bg" style={{ height: '4px', marginBottom: '24px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${(step / 4) * 100}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--cyan))'
          }}
        />
      </div>

      {error && (
        <div className="card" style={{ padding: '10px 14px', background: 'var(--rose-subtle)', borderColor: 'var(--rose)', color: 'var(--rose)', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Step 1: Account & Identity */}
      {step === 1 && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <User size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '20px' }}>Create Your Account</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Set up your credentials and choose your account role (Member or Gym Admin).
          </p>

          {/* Account Role Selector: Member vs Admin */}
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Account Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                onClick={() => handleChange('role', 'member')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: formData.role === 'member' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: formData.role === 'member' ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-surface)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Dumbbell size={16} color={formData.role === 'member' ? 'var(--primary)' : 'var(--text-muted)'} />
                  {formData.role === 'member' && <Check size={14} color="var(--primary)" />}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
                  Gym Member / Athlete
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Workouts, calories, biometrics &amp; passes
                </div>
              </div>

              <div
                onClick={() => handleChange('role', 'admin')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: formData.role === 'admin' ? '2px solid var(--amber)' : '1px solid var(--border-color)',
                  background: formData.role === 'admin' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ShieldCheck size={16} color={formData.role === 'admin' ? 'var(--amber)' : 'var(--text-muted)'} />
                  {formData.role === 'admin' && <Check size={14} color="var(--amber)" />}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
                  Gym Admin / Manager
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Rosters, verification codes &amp; equipment
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                min="14"
                max="90"
                placeholder="Age (e.g. 24)"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Quick Gateway to Admin Portal */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Gym Staff or Facility Administrator?
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Sign in to the Gym Admin Portal for roster &amp; verification codes
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onSwitchToAdminLogin || (() => onSwitchToLogin('admin'))}
              className="btn btn-sm btn-outline"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                borderColor: 'var(--amber)',
                color: 'var(--amber)',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Admin Portal →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Body Biometrics */}
      {step === 2 && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Activity size={20} color="var(--cyan)" />
            <h2 style={{ fontSize: '20px' }}>Body Measurements</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Used to compute precise Basal Metabolic Rate (BMR) and macro splits.
          </p>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Height (cm)</label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>{formData.height} cm</span>
            </div>
            <input
              type="range"
              min="140"
              max="220"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Current Weight (kg)</label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{formData.weight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="0.5"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Target Weight (kg)</label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)' }}>{formData.targetWeight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="0.5"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--amber)' }}
            />
          </div>

          <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>Weight Delta: <b>{Math.abs(formData.targetWeight - formData.weight).toFixed(1)} kg</b> ({formData.targetWeight >= formData.weight ? 'Surplus goal' : 'Deficit goal'})</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Fitness Goals */}
      {step === 3 && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Target size={20} color="var(--amber)" />
            <h2 style={{ fontSize: '20px' }}>Your Primary Goal</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Select your focus to calibrate your personalized 6-day split.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              { id: 'Bulking', title: 'Bulking Mode', desc: 'Caloric surplus for maximum muscle hypertrophy & strength', color: 'var(--amber)' },
              { id: 'Cutting', title: 'Cutting Mode', desc: 'Targeted caloric deficit to shed body fat while preserving lean tissue', color: 'var(--rose)' },
              { id: 'Maintenance', title: 'Maintenance Mode', desc: 'Preserve composition, build endurance and refine lifts', color: 'var(--cyan)' },
              { id: 'General fitness', title: 'General Fitness', desc: 'Cardiovascular longevity, mobility and balanced strength', color: 'var(--primary)' }
            ].map(g => (
              <div
                key={g.id}
                onClick={() => handleChange('primaryGoal', g.id)}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderColor: formData.primaryGoal === g.id ? g.color : 'var(--border-color)',
                  background: formData.primaryGoal === g.id ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: formData.primaryGoal === g.id ? g.color : 'var(--text-primary)' }}>
                    {g.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{g.desc}</p>
                </div>
                {formData.primaryGoal === g.id && (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#000" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Fitness Level</label>
            <div className="grid-2">
              {['Beginner', 'Intermediate', 'Advanced', 'Athlete'].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => handleChange('fitnessLevel', lvl)}
                  className={`btn ${formData.fitnessLevel === lvl ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', padding: '10px' }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Lifestyle & Review Targets */}
      {step === 4 && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Dumbbell size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '20px' }}>Lifestyle & Plan Review</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Finalize preferences and inspect your calculated fitness targets.
          </p>

          <div className="form-group">
            <label className="form-label">Dietary Preference</label>
            <select
              className="form-select"
              value={formData.dietaryPreference}
              onChange={(e) => handleChange('dietaryPreference', e.target.value)}
            >
              <option value="High Protein Non-Veg">High Protein Non-Veg</option>
              <option value="High Protein Vegetarian">High Protein Vegetarian</option>
              <option value="Plant-Based / Vegan">Plant-Based / Vegan</option>
              <option value="Keto / Low Carb">Keto / Low Carb</option>
              <option value="Balanced Macro">Balanced Macro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Level</label>
            <select
              className="form-select"
              value={formData.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
            >
              <option value="Sedentary (Desk Job)">Sedentary (Desk Job)</option>
              <option value="Lightly Active (1-2 days/week)">Lightly Active (1-2 days/week)</option>
              <option value="Moderately Active (3-5 days/week)">Moderately Active (3-5 days/week)</option>
              <option value="Very Active (6-7 days/week)">Very Active (6-7 days/week)</option>
              <option value="Competitive Athlete">Competitive Athlete</option>
            </select>
          </div>

          {/* Calculated Output Preview */}
          <div className="card" style={{ padding: '16px', background: 'var(--bg-surface)', borderColor: 'var(--primary)', marginBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Calculated Targets ({formData.primaryGoal})
              </span>
              <Sparkles size={15} color="var(--primary)" />
            </div>

            <div className="grid-2" style={{ gap: '10px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Calories</span>
                <h4 style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: 800 }}>{estimatedCalories} kcal</h4>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Protein</span>
                <h4 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 800 }}>{estimatedProtein} g</h4>
              </div>
            </div>

            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
              * Calibrated using Mifflin-St Jeor formula & hypertrophy protein standards.
            </p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {step < 4 ? (
          <button
            id="btn-onboarding-next"
            className="btn btn-primary btn-full"
            style={{ height: '48px', fontSize: '15px' }}
            onClick={handleNext}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            id="btn-onboarding-submit"
            className="btn btn-primary btn-full"
            style={{ height: '48px', fontSize: '15px' }}
            disabled={loading}
            onClick={handleInitiateSubmit}
          >
            <span>{loading ? 'Sending Verification Code...' : 'Verify Email & Create Profile'}</span>
            <Check size={18} />
          </button>
        )}
      </div>

      {/* Email OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 12, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '460px',
            width: '100%',
            background: 'var(--bg-primary)',
            border: formData.role === 'admin' ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1.5px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '20px',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: formData.role === 'admin' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              {formData.role === 'admin' ? (
                <ShieldCheck size={28} color="var(--amber)" />
              ) : (
                <Mail size={28} color="var(--primary)" />
              )}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span className={formData.role === 'admin' ? 'badge badge-amber' : 'badge badge-primary'} style={{ fontSize: '10px', padding: '3px 8px', letterSpacing: '0.5px' }}>
                {formData.role === 'admin' ? '🛡️ GYM ADMIN VERIFICATION' : '🏋️ GYM MEMBER VERIFICATION'}
              </span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              Verify Your Account
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              We dispatched a 6-digit verification code to <strong style={{ color: formData.role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}>{formData.email}</strong>. Enter it below to activate your account.
            </p>

            {existingAccountDetected && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>
                  ⚡ Existing Account Registered
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
                  An account for <strong>{formData.email}</strong> is already registered. Enter your code to log in immediately, or switch directly to Sign In.
                </p>
                <button
                  type="button"
                  onClick={() => onSwitchToLogin ? onSwitchToLogin(formData.role) : null}
                  className="btn btn-sm"
                  style={{
                    width: '100%',
                    background: 'var(--amber)',
                    color: '#0b0f19',
                    fontWeight: 800,
                    fontSize: '12px',
                    height: '34px'
                  }}
                >
                  Sign In to Existing Account →
                </button>
              </div>
            )}

            {error && !existingAccountDetected && (
              <div className="card" style={{ padding: '10px', background: 'var(--rose-subtle)', borderColor: 'var(--rose)', color: 'var(--rose)', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* 6-Digit Segmented Numeric Verification Code Input */}
            <div style={{ marginBottom: '18px' }}>
              <OtpPinInput
                value={otpCode}
                onChange={setOtpCode}
                role={formData.role}
                error={Boolean(error)}
                autoFocus={true}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '0 4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code expires in 10 minutes</span>
                {resendCountdown > 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} className="spin" /> Resend in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: formData.role === 'admin' ? 'var(--amber)' : 'var(--primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    disabled={otpResending}
                  >
                    {otpResending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowOtpModal(false); setError(''); }}
                className="btn btn-secondary"
                style={{ flex: 1, height: '46px', fontSize: '13px' }}
              >
                Back / Edit
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndRegister}
                className="btn btn-primary"
                style={{
                  flex: 2,
                  height: '46px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: formData.role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                }}
                disabled={otpLoading}
              >
                {otpLoading ? 'Verifying...' : existingAccountDetected ? 'Verify & Sign In' : 'Verify & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
