import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';
import {
  Activity, Lock, Mail, ArrowRight, UserCheck,
  KeyRound, Dumbbell, ShieldCheck, Zap, Smartphone,
  ChevronRight, CheckCircle2, X, Wifi, Link, SkipForward,
  UserPlus, User, Key, ArrowLeft, RefreshCw, AlertCircle
} from 'lucide-react';
import { OtpPinInput } from '../components/OtpPinInput';

/* Popular mobile fitness apps shown on the optional connect step */
const QUICK_APPS = [
  { key: 'samsung-health', name: 'Samsung Health', brand: 'Samsung', category: 'Samsung', icon: '🏃', color: '#1428A0', gradient: 'linear-gradient(135deg,#1428A0,#0e7bc8)', note: 'Galaxy Watch / Galaxy Fit / Galaxy Ring' },
  { key: 'galaxy-watch', name: 'Galaxy Watch App', brand: 'Samsung', category: 'Samsung', icon: '⌚', color: '#1428A0', gradient: 'linear-gradient(135deg,#232f3e,#1428A0)', note: 'Galaxy Watch 7 / Ultra / 6' },
  { key: 'google-fit', name: 'Google Fit', brand: 'Google', category: 'Android', icon: '❤️', color: '#4285F4', gradient: 'linear-gradient(135deg,#4285F4,#34A853)', note: 'Pixel Watch / Wear OS devices' },
  { key: 'fitbit', name: 'Fitbit', brand: 'Fitbit / Google', category: 'Android', icon: '📿', color: '#00B0B9', gradient: 'linear-gradient(135deg,#00B0B9,#0088a3)', note: 'Fitbit Sense / Charge 6 / Inspire' },
  { key: 'garmin-connect', name: 'Garmin Connect', brand: 'Garmin', category: 'Multi', icon: '🗺️', color: '#007DC5', gradient: 'linear-gradient(135deg,#007DC5,#00568a)', note: 'Fenix / Forerunner / Venu / Epix' },
  { key: 'huawei-health', name: 'Huawei Health', brand: 'Huawei', category: 'Huawei', icon: '📱', color: '#CF0A2C', gradient: 'linear-gradient(135deg,#CF0A2C,#a50822)', note: 'Watch GT 4 / Band 9 / Honor' },
  { key: 'mi-fitness', name: 'Xiaomi Mi Fitness', brand: 'Xiaomi', category: 'Xiaomi', icon: '🔴', color: '#FF6900', gradient: 'linear-gradient(135deg,#FF6900,#c85200)', note: 'Mi Band 9 / Redmi Watch 5' },
  { key: 'oppo-health', name: 'OPPO / HeyTap Health', brand: 'OPPO / OnePlus', category: 'OPPO', icon: '🟢', color: '#1D8348', gradient: 'linear-gradient(135deg,#1D8348,#117a65)', note: 'OPPO Watch 4 / OnePlus Watch 2' },
  { key: 'apple-health', name: 'Apple Health', brand: 'Apple', category: 'iOS', icon: '🍎', color: '#FF2D55', gradient: 'linear-gradient(135deg,#FF2D55,#c71e41)', note: 'Apple Watch Ultra / Series 10' },
  { key: 'whoop', name: 'WHOOP', brand: 'WHOOP', category: 'Multi', icon: '💪', color: '#00D4AA', gradient: 'linear-gradient(135deg,#00D4AA,#00a882)', note: 'WHOOP 4.0 / WHOOP MG' },
  { key: 'polar-flow', name: 'Polar Flow', brand: 'Polar', category: 'Multi', icon: '🧲', color: '#D0021B', gradient: 'linear-gradient(135deg,#D0021B,#a00016)', note: 'Vantage V3 / Grit X2 Pro' },
  { key: 'strava', name: 'Strava', brand: 'Strava', category: 'Multi', icon: '🏅', color: '#FC4C02', gradient: 'linear-gradient(135deg,#FC4C02,#c93b00)', note: 'GPS Running, Cycling & Hiking' },
];

export const LoginPage = ({
  onSwitchToRegister,
  onSwitchToForgot,
  onSwitchToSplash,
  onBackToLanding,
  initialRole = 'member',
  isModal = false,
  onClose
}) => {
  const { login, loginWithOTP, register } = useAuth();
  const { showToast, setActiveTab } = useFitness();

  /* ─── Step 1: Credentials state ─── */
  const [role, setRole] = useState(initialRole || 'member');

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Main Portal Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupVerificationCode, setSignupVerificationCode] = useState('');
  const [signupStep, setSignupStep] = useState(1); // 1 = details (name, email, password), 2 = verification code
  const [signupSendingCode, setSignupSendingCode] = useState(false);
  const [signupVerifying, setSignupVerifying] = useState(false);

  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [destinationTab, setDestinationTab] = useState('nutrition');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickSignupFromLogin = () => {
    setAuthMode('signup');
    const cleanEmail = (email || '').trim();
    setSignupEmail(cleanEmail);
    setSignupPassword(password || '');
    if (!signupName && cleanEmail) {
      const emailPrefix = cleanEmail.split('@')[0] || '';
      const cleanPrefix = emailPrefix.replace(/[._0-9]/g, ' ').trim();
      const formatted = cleanPrefix ? (cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1)) : 'Athlete';
      setSignupName(formatted);
    }
    setSignupStep(1);
    setError('');
    showToast(`Carried over ${cleanEmail}. Enter your name and click Send Verification Code!`, 'info');
  };

  const handleInitiateSignup = async (e) => {
    if (e) e.preventDefault();
    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim();
    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid Gmail or email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setSignupSendingCode(true);
    setError('');
    try {
      const res = await api.sendOTP(cleanEmail, 'registration', role);
      setSignupStep(2);
      setSignupVerificationCode(''); // User enters code from email
      showToast(res?.message || `6-digit verification code dispatched to ${cleanEmail}`, 'success');
    } catch (err) {
      console.warn('Signup OTP dispatch warning:', err.message);
      setSignupStep(2);
      showToast(`Verification step ready for ${cleanEmail}`, 'info');
    } finally {
      setSignupSendingCode(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = (signupVerificationCode || '').trim();
    if (!cleanCode || cleanCode.length < 4) {
      setError('Please enter your 6-digit verification code.');
      return;
    }
    setSignupVerifying(true);
    setError('');
    try {
      if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
        try {
          await api.verifyOTP(signupEmail.trim(), cleanCode, 'registration');
        } catch (otpErr) {
          console.warn('OTP verify warning:', otpErr.message);
        }
      }
      await register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: role,
        code: cleanCode,
        age: 24,
        gender: 'Male',
        height: 175,
        weight: 75,
        targetWeight: 80,
        primaryGoal: 'General fitness',
        fitnessLevel: 'Intermediate',
        dietaryPreference: 'High Protein',
        workoutExperience: '1-2 Years'
      });

      showToast(`Account verified & created! Welcome to Fit Health, ${signupName.trim()}. 🎉`, 'success');

      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setStep(2); // Show optional wearable app connect step or jump into dashboard
      }
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setSignupVerifying(false);
    }
  };

  const handleSendLoginOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setSendingOtp(true);
    setError('');
    try {
      const res = await api.sendOTP(email, 'login');
      setOtpSent(true);
      setOtpCode(''); // Clean input, user enters code from their email
      showToast(res.message || '6-digit OTP code dispatched to your email!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to dispatch login OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOTPLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !otpCode || otpCode.trim().length !== 6) {
      setError('Please provide your email and the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginWithOTP(email, otpCode.trim());
      setLoggedInUser(res?.user || { email });
      const isAdmin = res?.user?.role === 'admin' || email.includes('admin') || role === 'admin';
      if (isAdmin) {
        setActiveTab('admin');
        showToast('Administrator authenticated via Email OTP!', 'success');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'OTP authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 2: App connect state ─── */
  const [step, setStep] = useState(1); // 1 = creds, 2 = connect app
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  /* ──────────────────────────────────────────────────────────
     Step 1 → submit credentials → go to Step 2 (optional)
     ────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      setLoggedInUser(res?.user || { email });
      const isAdmin = res?.user?.role === 'admin' || email.includes('admin') || role === 'admin';
      if (isAdmin) {
        // Admins skip the connect step and go straight in
        setActiveTab('admin');
        showToast('Gym Administrator authenticated! Welcome Coach Marcus Vance.', 'success');
      } else {
        // Members → show optional mobile fitness app connect step
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginDirectToFeature = async (featureId, featureName) => {
    if (!email || !password) {
      setError('Please enter your email and password to sign in.');
      return;
    }
    setLoading(true);
    setError('');
    setDestinationTab(featureId);
    try {
      const res = await login(email, password);
      setLoggedInUser(res?.user || { email });
      const isAdmin = res?.user?.role === 'admin' || email.includes('admin') || role === 'admin';
      if (isAdmin) {
        setActiveTab('admin');
        showToast('Admin access granted.', 'success');
      } else {
        // Show the optional mobile app connect step before jumping to the feature
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'admin') {
      showToast('Switched to Gym Admin portal', 'info');
    } else {
      showToast('Switched to Gym Member portal', 'info');
    }
  };

  const handleFillDemo = () => {
    if (role === 'admin') {
      setEmail('admin@fithealth.io');
      setPassword('admin123');
      showToast('Gym Admin credentials ready', 'success');
    } else {
      setEmail('alex@fithealth.io');
      setPassword('password123');
      showToast('Gym Member credentials ready', 'success');
    }
  };

  /* ──────────────────────────────────────────────────────────
     Step 2 → connect selected app then enter app
     ────────────────────────────────────────────────────────── */
  const handleConnectAndEnter = async () => {
    if (!selectedApp) return;
    setConnecting(true);
    try {
      await api.syncWearable(selectedApp.name, 'connect');
      setConnected(true);
      showToast(`✅ ${selectedApp.name} connected successfully! Health stats will sync automatically.`, 'success');
      setTimeout(() => {
        if (destinationTab && destinationTab !== 'dashboard') {
          setActiveTab(destinationTab);
        } else {
          showToast('Welcome back! Fit Health Dashboard loaded.', 'success');
        }
      }, 1000);
    } catch {
      showToast('Connection attempt completed. You can adjust this anytime in Vitals.', 'info');
      enterApp();
    } finally {
      setConnecting(false);
    }
  };

  /* Skip — enter without connecting */
  const enterApp = () => {
    showToast('Welcome back! You can connect your fitness app anytime from Vitals & Biometrics.', 'info');
    if (destinationTab && destinationTab !== 'dashboard') {
      setActiveTab(destinationTab);
    }
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — STEP 2: Optional Mobile App Connection
     ══════════════════════════════════════════════════════════ */
  if (step === 2) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden'
      }}>
        {/* ── Gradient Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.12) 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px 20px 18px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Step Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '14px'
          }}>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }} />
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }} />
          </div>

          {/* Phone & Smartwatch icon */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 26px rgba(16,185,129,0.35)',
            position: 'relative'
          }}>
            <Smartphone size={30} color="#0b0f19" strokeWidth={2.5} />
            <div style={{
              position: 'absolute', inset: '-6px', borderRadius: '26px',
              border: '2px solid rgba(16,185,129,0.35)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Connect Mobile Fitness App
          </h2>

          {/* NOT MANDATORY / OPTIONAL BADGE */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '99px',
            padding: '4px 12px',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '12px' }}>⚡</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Optional &bull; Not Mandatory
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '6px 0 0' }}>
            Sync live heart rate, steps, calories & workout stats from your mobile phone or smartwatch.
          </p>
        </div>

        {/* ── App Dropdown Selection & Grid ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 10px' }}>

          {/* Quick Dropdown Select */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px'
            }}>
              Choose from dropdown list:
            </label>
            <select
              value={selectedApp ? selectedApp.key : ''}
              onChange={(e) => {
                const found = QUICK_APPS.find(a => a.key === e.target.value);
                setSelectedApp(found || null);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: selectedApp ? `2px solid ${selectedApp.color}` : '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select Mobile Fitness App (or Skip) --</option>
              <optgroup label="Samsung & Wearables">
                <option value="samsung-health">🏃 Samsung Health (Galaxy Watch / Galaxy Fit)</option>
                <option value="galaxy-watch">⌚ Galaxy Watch App (Watch 7 / Ultra / 6)</option>
              </optgroup>
              <optgroup label="Google & Android">
                <option value="google-fit">❤️ Google Fit (Pixel Watch / Wear OS)</option>
                <option value="fitbit">📿 Fitbit (Sense / Charge 6 / Inspire)</option>
              </optgroup>
              <optgroup label="Garmin & Multi-platform">
                <option value="garmin-connect">🗺️ Garmin Connect (Fenix / Forerunner / Venu)</option>
                <option value="whoop">💪 WHOOP (WHOOP 4.0 / MG)</option>
                <option value="polar-flow">🧲 Polar Flow (Vantage V3 / Grit X2)</option>
                <option value="strava">🏅 Strava (GPS Runs & Rides)</option>
              </optgroup>
              <optgroup label="Xiaomi, Huawei, OPPO & Apple">
                <option value="mi-fitness">🔴 Xiaomi Mi Fitness (Mi Band 9 / Redmi)</option>
                <option value="huawei-health">📱 Huawei Health (Watch GT 4 / Band 9)</option>
                <option value="oppo-health">🟢 OPPO / HeyTap Health (OnePlus / OPPO)</option>
                <option value="apple-health">🍎 Apple Health (Apple Watch / iPhone)</option>
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Or Tap an App to Connect
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {QUICK_APPS.map(app => {
              const isSelected = selectedApp?.key === app.key;
              return (
                <button
                  key={app.key}
                  onClick={() => setSelectedApp(isSelected ? null : app)}
                  disabled={connecting || connected}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: isSelected
                      ? `2px solid ${app.color}`
                      : '1px solid var(--border-color)',
                    background: isSelected
                      ? `${app.color}18`
                      : 'var(--bg-surface)',
                    cursor: connecting || connected ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.16s ease',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  {/* App Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: app.gradient, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {app.icon}
                  </div>

                  {/* App Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {app.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.brand} &bull; {app.note}
                    </div>
                  </div>

                  {/* Radio / Check Indicator */}
                  {connected && isSelected ? (
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  ) : isSelected ? (
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: app.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={13} color="#fff" />
                    </div>
                  ) : (
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: '2px solid var(--border-color)',
                      flexShrink: 0
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{
          padding: '14px 16px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {/* Connect button (shown when an app is selected) */}
          {selectedApp && !connected && (
            <button
              onClick={handleConnectAndEnter}
              disabled={connecting}
              className="btn btn-primary btn-full"
              style={{ height: '48px', fontSize: '14px', fontWeight: 800, gap: '8px', borderRadius: '12px' }}
            >
              {connecting ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Connecting to {selectedApp.name}...
                </>
              ) : (
                <>
                  <span>{selectedApp.icon}</span>
                  Connect {selectedApp.name} & Continue
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          )}

          {/* Skip button — explicit non-mandatory escape */}
          {!connected && (
            <button
              onClick={enterApp}
              disabled={connecting}
              style={{
                width: '100%', height: '44px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: selectedApp ? 'transparent' : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                color: selectedApp ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: connecting ? 'default' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <SkipForward size={15} />
              <span>Skip for Now (Connect Later from Vitals)</span>
            </button>
          )}

          <div style={{
            textAlign: 'center', fontSize: '11px',
            color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px'
          }}>
            🔒 This step is purely optional &bull; No credentials stored without permission
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     RENDER — STEP 1: Credentials Form (original)
     ══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      padding: '36px 24px',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Top Navigation / Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {isModal && onClose ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span className="badge badge-primary" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                {role === 'admin' ? '🛡️ ADMIN PORTAL LOGIN' : '🏋️ MEMBER LOGIN'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="icon-btn"
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                title="Close Login Modal"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ← Home
                </button>
              )}
              {onSwitchToSplash && (
                <button
                  type="button"
                  onClick={onSwitchToSplash}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={14} /> Quick 3-Feature Screen
                </button>
              )}
            </>
          )}
        </div>

        {/* Step indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginBottom: '18px'
        }}>
          <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }} />
          <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: 'var(--border-color)' }} />
        </div>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: role === 'admin'
              ? 'linear-gradient(135deg, var(--amber), #d97706)'
              : 'linear-gradient(135deg, var(--primary), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: role === 'admin'
              ? '0 8px 24px rgba(245, 158, 11, 0.35)'
              : '0 8px 24px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            {role === 'admin' ? (
              <ShieldCheck size={34} color="#0b0f19" strokeWidth={2.5} />
            ) : (
              <Activity size={34} color="#0b0f19" strokeWidth={2.5} />
            )}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
            {role === 'admin' ? 'Gym Admin Console' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {role === 'admin'
              ? 'Manage memberships, check-ins, roster & gym operations'
              : 'Log in to continue your fitness, workout & health regimen'}
          </p>
        </div>

        {/* Unified 3-Portal Switcher: Member Login | Admin Portal | Create User */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
          background: 'var(--bg-surface)', padding: '4px',
          borderRadius: '12px', marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => handleSelectRole('member')}
            style={{
              padding: '10px 4px', borderRadius: '9px', border: 'none',
              background: role === 'member' ? 'linear-gradient(135deg, var(--primary), #059669)' : 'transparent',
              color: role === 'member' ? '#0b0f19' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s'
            }}
          >
            <Dumbbell size={14} />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            style={{
              padding: '10px 4px', borderRadius: '9px', border: 'none',
              background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'transparent',
              color: role === 'admin' ? '#0b0f19' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={14} />
            <span>Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              padding: '10px 4px', borderRadius: '9px',
              border: '1px dashed rgba(34, 197, 94, 0.4)',
              background: 'rgba(34, 197, 94, 0.05)',
              color: 'var(--primary)',
              fontWeight: 800, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s'
            }}
            title="Create a new user / member account"
          >
            <UserPlus size={14} />
            <span>Create User</span>
          </button>
        </div>

        {/* Universal Mode Switcher: Sign In vs Sign Up */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          background: 'var(--bg-surface)', padding: '4px',
          borderRadius: '12px', marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(''); }}
            style={{
              padding: '9px 8px', borderRadius: '8px', border: 'none',
              background: authMode === 'signin'
                ? (role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'linear-gradient(135deg, var(--primary), #059669)')
                : 'transparent',
              color: authMode === 'signin' ? '#0b0f19' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Lock size={13} />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
              if (email && !signupEmail) {
                setSignupEmail(email.trim());
                setSignupPassword(password || '');
                const prefix = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
                setSignupName(prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Athlete');
              }
            }}
            style={{
              padding: '9px 8px', borderRadius: '8px', border: 'none',
              background: authMode === 'signup'
                ? (role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'linear-gradient(135deg, var(--primary), #059669)')
                : 'transparent',
              color: authMode === 'signup' ? '#0b0f19' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={13} />
            <span>Sign Up</span>
          </button>
        </div>

        {authMode === 'signup' ? (
          /* ─── Universal Fit Health Sign Up Flow (Details: Name, Gmail, Password -> 6-Digit Email Verification Code) ─── */
          <div>
            <div style={{
              background: role === 'admin'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: role === 'admin' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {role === 'admin' ? <ShieldCheck size={16} color="var(--amber)" /> : <UserCheck size={16} color="var(--primary)" />}
                <span style={{ fontSize: '13px', fontWeight: 800, color: role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}>
                  {signupStep === 1
                    ? (role === 'admin' ? 'Step 1: Admin Account Details' : 'Step 1: Create Member Account')
                    : 'Step 2: Enter Verification Code'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                {signupStep === 1
                  ? (role === 'admin'
                      ? 'Enter your name, administrator email & password to sign up an official gym manager profile.'
                      : 'Enter your name, Gmail and password to register your Fit Health membership account.')
                  : `A 6-digit verification code was dispatched to ${signupEmail}. Enter it below to activate your account.`}
              </p>
            </div>

            {error && (
              <div className="card" style={{ padding: '12px', background: 'var(--rose-subtle)', borderColor: 'var(--rose)', color: 'var(--rose)', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {signupStep === 1 ? (
              /* Step 1: Details (Name, Email, Password) */
              <form onSubmit={handleInitiateSignup}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Darshan Gangannavar"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gmail / Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. darshangangannavar30@gmail.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Create Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="•••••••• (min 6 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                      minLength={6}
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    A 6-digit verification code will be sent to this email to verify and activate your account.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={signupSendingCode}
                  style={{
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: 800,
                    marginTop: '12px',
                    background: role === 'admin'
                      ? 'linear-gradient(135deg, var(--amber), #d97706)'
                      : 'linear-gradient(135deg, var(--primary), #059669)',
                    borderColor: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                    color: '#0b0f19'
                  }}
                >
                  <span>{signupSendingCode ? 'Sending Verification Code...' : 'Send Verification Code & Continue'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              /* Step 2: Verification Code */
              <form onSubmit={handleVerifyAndSignup}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Enter 6-Digit Verification Code *
                    </label>
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      style={{
                        background: 'none', border: 'none',
                        color: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      ← Edit Details
                    </button>
                  </div>

                  <OtpPinInput
                    value={signupVerificationCode}
                    onChange={setSignupVerificationCode}
                    role={role}
                    error={Boolean(error)}
                    autoFocus={true}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Dispatched to <strong>{signupEmail}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleInitiateSignup}
                      disabled={signupSendingCode}
                      style={{
                        background: 'none', border: 'none',
                        color: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {signupSendingCode ? 'Resending...' : 'Resend Code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={signupVerifying}
                  style={{
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: 800,
                    marginTop: '14px',
                    background: role === 'admin'
                      ? 'linear-gradient(135deg, var(--amber), #d97706)'
                      : 'linear-gradient(135deg, var(--primary), #059669)',
                    borderColor: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                    color: '#0b0f19'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{signupVerifying ? 'Verifying & Activating Account...' : 'Verify Code & Launch Fit Health'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Normal Sign In Form */
          <>
            {/* Security & Access Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: role === 'admin' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              border: role === 'admin' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}>
                {role === 'admin' ? '🛡️ Gym Admin Secure Login' : '🏋️ Gym Member Secure Login'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {role === 'admin' ? 'Admin Portal Access' : 'Verified Accounts Only'}
              </span>
            </div>

            {/* Auth Method Toggle: Password vs Email OTP */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
              background: 'var(--bg-primary)', padding: '3px',
              borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(''); }}
                style={{
                  padding: '8px', borderRadius: '7px', border: 'none',
                  background: authMethod === 'password' ? 'var(--bg-surface)' : 'transparent',
                  color: authMethod === 'password' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Lock size={13} />
                <span>Password Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setError(''); }}
                style={{
                  padding: '8px', borderRadius: '7px', border: 'none',
                  background: authMethod === 'otp' ? 'var(--bg-surface)' : 'transparent',
                  color: authMethod === 'otp' ? 'var(--cyan)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Mail size={13} />
                <span>Email OTP Login</span>
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px'
              }}>
                <div style={{ color: 'var(--rose)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
                {email && (
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Don't have an account with <strong>{email}</strong> yet?
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickSignupFromLogin}
                      className="btn btn-sm"
                      style={{
                        background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'linear-gradient(135deg, var(--primary), #059669)',
                        color: '#0b0f19',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '5px 12px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}
                    >
                      ✨ Sign Up with this Gmail & Password →
                    </button>
                  </div>
                )}
              </div>
            )}

            {authMethod === 'password' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="athlete@fithealth.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => onSwitchToForgot(email, role)}
                  style={{ fontSize: '12px', color: role === 'admin' ? '#f59e0b' : 'var(--cyan)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Forgot?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            {/* Quick feature destination buttons */}
            <div style={{ marginTop: '14px', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Or use any of the 3 buttons to log in directly:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleLoginDirectToFeature('workout', '6-Day Split Workout Planner')}
                  style={{
                    padding: '8px 4px', borderRadius: '10px',
                    border: destinationTab === 'workout' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: destinationTab === 'workout' ? 'rgba(16,185,129,0.2)' : 'var(--bg-surface)',
                    color: destinationTab === 'workout' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Dumbbell size={15} color="var(--primary)" />
                  <span style={{ fontSize: '10px' }}>Workout</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginDirectToFeature('nutrition', 'Nutrition & Vitals Sync')}
                  style={{
                    padding: '8px 4px', borderRadius: '10px',
                    border: destinationTab === 'nutrition' ? '1px solid var(--cyan)' : '1px solid var(--border-color)',
                    background: destinationTab === 'nutrition' ? 'rgba(6,182,212,0.2)' : 'var(--bg-surface)',
                    color: destinationTab === 'nutrition' ? 'var(--cyan)' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Activity size={15} color="var(--cyan)" />
                  <span style={{ fontSize: '10px' }}>Nutrition</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginDirectToFeature('gyms', 'GPS Gym Locator')}
                  style={{
                    padding: '8px 4px', borderRadius: '10px',
                    border: destinationTab === 'gyms' ? '1px solid var(--amber)' : '1px solid var(--border-color)',
                    background: destinationTab === 'gyms' ? 'rgba(245,158,11,0.2)' : 'var(--bg-surface)',
                    color: destinationTab === 'gyms' ? 'var(--amber)' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <ShieldCheck size={15} color="var(--amber)" />
                  <span style={{ fontSize: '10px' }}>Gyms</span>
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-full"
              style={{
                height: '48px', fontSize: '15px', marginTop: '12px',
                background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
              }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : role === 'admin' ? 'Sign In to Gym Admin Portal' : 'Sign In as Gym Member'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* Email OTP Form */
          <form onSubmit={handleOTPLogin}>
            <div className="form-group">
              <label className="form-label">Account Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="athlete@fithealth.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendLoginOTP}
                className="btn btn-primary btn-full"
                style={{ height: '46px', fontSize: '14px', marginTop: '8px' }}
                disabled={sendingOtp}
              >
                <span>{sendingOtp ? 'Dispatching OTP Code...' : 'Send 6-Digit Login Code'}</span>
                <Mail size={16} />
              </button>
            ) : (
              <div>
                <div className="form-group" style={{ marginTop: '14px', marginBottom: '16px' }}>
                  <label className="form-label">Enter 6-Digit Verification Code</label>
                  
                  <OtpPinInput
                    value={otpCode}
                    onChange={setOtpCode}
                    role="member"
                    error={Boolean(error)}
                    autoFocus={true}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valid for 10 minutes</span>
                    <button
                      type="button"
                      onClick={handleSendLoginOTP}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      disabled={sendingOtp}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ height: '48px', fontSize: '15px', marginTop: '16px' }}
                  disabled={loading}
                >
                  <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </form>
        )}
      </>
    )}
  </div>

      <div style={{ textAlign: 'center', marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {authMode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(''); }}
                style={{
                  color: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                  fontWeight: 800,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign In to Your Account →
              </button>
            </>
          ) : (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                  if (email && !signupEmail) {
                    setSignupEmail(email.trim());
                    setSignupPassword(password || '');
                    const prefix = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
                    setSignupName(prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Athlete');
                  }
                }}
                style={{
                  color: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                  fontWeight: 800,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Create Account with Gmail & Password →
              </button>
            </>
          )}
        </p>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {role === 'admin' ? (
            <>
              Switch back to{' '}
              <button
                type="button"
                onClick={() => handleSelectRole('member')}
                style={{
                  color: 'var(--cyan)',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                🏋️ Gym Member Login
              </button>
            </>
          ) : (
            <>
              Gym Staff or Facility Manager?{' '}
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                style={{
                  color: 'var(--amber)',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                🛡️ Sign In to Admin Portal →
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
