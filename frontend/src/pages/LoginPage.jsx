import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';
import {
  Activity, Lock, Mail, ArrowRight, UserCheck,
  KeyRound, Dumbbell, ShieldCheck, Zap, Smartphone,
  ChevronRight, CheckCircle2, X, Wifi, Link, SkipForward,
  UserPlus, User, Key, ArrowLeft, RefreshCw, AlertCircle,
  Eye, EyeOff, Globe, Check
} from 'lucide-react';
import { OtpPinInput } from '../components/OtpPinInput';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91 (India)' },
  { code: '+1', label: '🇺🇸 / 🇨🇦 +1 (USA/Canada)' },
  { code: '+44', label: '🇬🇧 +44 (UK)' },
  { code: '+61', label: '🇦🇺 +61 (Australia)' },
  { code: '+971', label: '🇦🇪 +971 (UAE)' },
  { code: '+65', label: '🇸🇬 +65 (Singapore)' },
  { code: '+49', label: '🇩🇪 +49 (Germany)' },
  { code: '+33', label: '🇫🇷 +33 (France)' },
  { code: '+81', label: '🇯🇵 +81 (Japan)' },
  { code: '+82', label: '🇰🇷 +82 (South Korea)' },
  { code: '+60', label: '🇲🇾 +60 (Malaysia)' },
  { code: '+966', label: '🇸🇦 +966 (Saudi Arabia)' }
];

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
  const { login, loginWithOTP, register, registerAdmin } = useAuth();
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

  /* ─── Sign Up State ─── */
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCountryCode, setSignupCountryCode] = useState('+91');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirmPass, setShowSignupConfirmPass] = useState(false);
  const [adminInviteCode, setAdminInviteCode] = useState('');

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [emailCodeHint, setEmailCodeHint] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Mobile SMS OTP state
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpCode, setMobileOtpCode] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const [verifyingMobileOtp, setVerifyingMobileOtp] = useState(false);
  const [mobileCodeHint, setMobileCodeHint] = useState('');
  const [mobileCooldown, setMobileCooldown] = useState(0);

  const [signupSubmitting, setSignupSubmitting] = useState(false);

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (mobileCooldown > 0) {
      const timer = setTimeout(() => setMobileCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileCooldown]);

  /* ─── Login State ─── */
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'email_otp' | 'mobile_otp'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Email OTP Login
  const [loginEmail, setLoginEmail] = useState('');
  const [emailLoginOtpSent, setEmailLoginOtpSent] = useState(false);
  const [emailLoginOtpCode, setEmailLoginOtpCode] = useState('');
  const [emailLoginCodeHint, setEmailLoginCodeHint] = useState('');
  const [sendingEmailLoginOtp, setSendingEmailLoginOtp] = useState(false);

  // Mobile OTP Login
  const [loginCountryCode, setLoginCountryCode] = useState('+91');
  const [loginPhone, setLoginPhone] = useState('');
  const [mobileLoginOtpSent, setMobileLoginOtpSent] = useState(false);
  const [mobileLoginOtpCode, setMobileLoginOtpCode] = useState('');
  const [mobileLoginCodeHint, setMobileLoginCodeHint] = useState('');
  const [sendingMobileLoginOtp, setSendingMobileLoginOtp] = useState(false);

  const [destinationTab, setDestinationTab] = useState('nutrition');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ─── Sign Up Handlers ─── */
  const getFullSignupPhone = () => {
    const raw = signupMobile.trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw.replace(/[\s\-]/g, '');
    const cleanDigits = raw.replace(/\D/g, '');
    return `${signupCountryCode}${cleanDigits}`;
  };

  const handleSendEmailOTP = async () => {
    const cleanEmail = signupEmail.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid email address first.');
      return;
    }
    setSendingEmailOtp(true);
    setError('');
    try {
      const res = await api.sendEmailOTP(cleanEmail, 'registration', role);
      setEmailOtpSent(true);
      setEmailCooldown(60);
      if (res?.verificationCode) {
        setEmailCodeHint(String(res.verificationCode));
      } else {
        setEmailCodeHint('');
      }
      showToast(res?.message || `6-digit verification code dispatched to ${cleanEmail}`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to send email verification code.');
      showToast(err.message || 'Email dispatch failed', 'error');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    const cleanEmail = signupEmail.trim();
    const code = emailOtpCode.trim();
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code received on your email.');
      return;
    }
    setVerifyingEmailOtp(true);
    setError('');
    try {
      const res = await api.verifyEmailOTP(cleanEmail, code, 'registration');
      if (res.success) {
        setEmailVerified(true);
        showToast('✓ Email address successfully verified!', 'success');
      } else {
        setError(res.message || 'Email verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired email verification code.');
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const handleSendMobileOTP = async () => {
    const fullPhone = getFullSignupPhone();
    const digits = signupMobile.replace(/\D/g, '');
    if (!digits || digits.length < 8) {
      setError('Please enter a valid mobile number with at least 8 digits.');
      return;
    }
    setSendingMobileOtp(true);
    setError('');
    try {
      const res = await api.sendMobileOTP(fullPhone, 'registration', role);
      setMobileOtpSent(true);
      setMobileCooldown(60);
      if (res?.verificationCode) {
        setMobileCodeHint(String(res.verificationCode));
      } else {
        setMobileCodeHint('');
      }
      showToast(res?.message || `SMS verification code sent to ${fullPhone}`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to dispatch SMS verification code.');
      showToast(err.message || 'SMS dispatch failed', 'error');
    } finally {
      setSendingMobileOtp(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    const fullPhone = getFullSignupPhone();
    const code = mobileOtpCode.trim();
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit SMS code received on your mobile.');
      return;
    }
    setVerifyingMobileOtp(true);
    setError('');
    try {
      const res = await api.verifyMobileOTP(fullPhone, code, 'registration');
      if (res.success) {
        setMobileVerified(true);
        showToast('✓ Mobile number successfully verified via SMS!', 'success');
      } else {
        setError(res.message || 'Mobile verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired SMS verification code.');
    } finally {
      setVerifyingMobileOtp(false);
    }
  };

  const handleCompleteSignup = async (e) => {
    if (e) e.preventDefault();
    const name = signupName.trim();
    const cleanEmail = signupEmail.trim();
    const fullPhone = getFullSignupPhone();

    if (!name) {
      setError('Please provide your full name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!fullPhone || signupMobile.replace(/\D/g, '').length < 8) {
      setError('Please enter a valid mobile phone number.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please ensure both password fields match.');
      return;
    }
    if (role === 'admin' && !adminInviteCode.trim()) {
      setError('Admin registration strictly requires an authorized Administrator Invitation Code.');
      return;
    }

    setSignupSubmitting(true);
    setError('');

    try {
      // Auto-verify email OTP if user entered 6 digits without clicking verify
      let isEmailDone = emailVerified;
      if (!isEmailDone && emailOtpCode.trim().length === 6) {
        try {
          const vEmail = await api.verifyEmailOTP(cleanEmail, emailOtpCode.trim(), 'registration');
          if (vEmail.success) {
            isEmailDone = true;
            setEmailVerified(true);
          }
        } catch (_) {}
      }

      // Auto-verify mobile OTP if user entered 6 digits without clicking verify
      let isMobileDone = mobileVerified;
      if (!isMobileDone && mobileOtpCode.trim().length === 6) {
        try {
          const vMobile = await api.verifyMobileOTP(fullPhone, mobileOtpCode.trim(), 'registration');
          if (vMobile.success) {
            isMobileDone = true;
            setMobileVerified(true);
          }
        } catch (_) {}
      }

      if (!isEmailDone && !isMobileDone) {
        throw new Error('Both email address and mobile number must be verified with their 6-digit verification codes before completing registration.');
      }
      if (!isEmailDone) {
        throw new Error('Please enter the 6-digit verification code sent to your email.');
      }
      if (!isMobileDone) {
        throw new Error('Please enter the 6-digit SMS verification code sent to your mobile phone.');
      }

      const payload = {
        name,
        fullName: name,
        email: cleanEmail,
        mobileNumber: fullPhone,
        phone: fullPhone,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        emailOtp: emailOtpCode.trim(),
        mobileOtp: mobileOtpCode.trim(),
        role,
        ...(role === 'admin' && {
          adminInviteCode: adminInviteCode.trim(),
          adminSecretKey: adminInviteCode.trim()
        }),
        age: 24,
        gender: 'Male',
        height: 175,
        weight: 75,
        targetWeight: 80,
        primaryGoal: 'General fitness',
        fitnessLevel: 'Intermediate',
        dietaryPreference: 'High Protein',
        workoutExperience: '1-2 Years'
      };

      let res;
      if (role === 'admin') {
        res = await registerAdmin(payload);
      } else {
        res = await register(payload);
      }

      showToast(`🎉 Welcome to Fit Health, ${name}! Your account has been verified and created.`, 'success');

      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setStep(2); // Show optional wearable app connect step
      }
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setSignupSubmitting(false);
    }
  };

  /* ─── Login Handlers ─── */
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    const id = loginIdentifier.trim();
    if (!id || !password) {
      setError('Please provide your registered Email or Mobile Number and Password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(id, password, role);
      if (role === 'admin' && res?.user?.role !== 'admin') {
        throw new Error('Security Alert: Access denied. Member credentials cannot be used to log in to the Admin Portal. Please switch to the Member Login tab.');
      }
      setLoggedInUser(res?.user || { email: id });
      const isAdmin = res?.user?.role === 'admin';
      if (isAdmin) {
        setActiveTab('admin');
        showToast('Gym Administrator authenticated! Welcome to Admin Console.', 'success');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailLoginOTP = async () => {
    const clean = loginEmail.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Please provide a valid registered email address.');
      return;
    }
    setSendingEmailLoginOtp(true);
    setError('');
    try {
      const res = await api.sendEmailOTP(clean, 'login', role);
      setEmailLoginOtpSent(true);
      if (res?.verificationCode) {
        setEmailLoginCodeHint(String(res.verificationCode));
      } else {
        setEmailLoginCodeHint('');
      }
      showToast(res?.message || `6-digit authentication code dispatched to ${clean}!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to dispatch email login code.');
    } finally {
      setSendingEmailLoginOtp(false);
    }
  };

  const handleEmailOTPLogin = async (e) => {
    if (e) e.preventDefault();
    const clean = loginEmail.trim();
    const code = emailLoginOtpCode.trim();
    if (!clean || code.length !== 6) {
      setError('Please enter your email and the 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginWithOTP(clean, code, role);
      if (role === 'admin' && res?.user?.role !== 'admin') {
        throw new Error('Security Alert: Access denied. Member credentials cannot be used to log in to the Admin Portal. Please switch to the Member Login tab.');
      }
      setLoggedInUser(res?.user || { email: clean });
      if (role === 'admin') {
        setActiveTab('admin');
        showToast('Administrator authenticated via Email Code!', 'success');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Email authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const getFullLoginPhone = () => {
    const raw = loginPhone.trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw.replace(/[\s\-]/g, '');
    const cleanDigits = raw.replace(/\D/g, '');
    return `${loginCountryCode}${cleanDigits}`;
  };

  const handleSendMobileLoginOTP = async () => {
    const fullPhone = getFullLoginPhone();
    const digits = loginPhone.replace(/\D/g, '');
    if (!digits || digits.length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setSendingMobileLoginOtp(true);
    setError('');
    try {
      const res = await api.sendMobileOTP(fullPhone, 'login', role);
      setMobileLoginOtpSent(true);
      if (res?.verificationCode) {
        setMobileLoginCodeHint(String(res.verificationCode));
      } else {
        setMobileLoginCodeHint('');
      }
      showToast(res?.message || `SMS authentication code sent to ${fullPhone}!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to dispatch SMS login code.');
    } finally {
      setSendingMobileLoginOtp(false);
    }
  };

  const handleMobileOTPLogin = async (e) => {
    if (e) e.preventDefault();
    const fullPhone = getFullLoginPhone();
    const code = mobileLoginOtpCode.trim();
    if (!fullPhone || code.length !== 6) {
      setError('Please enter your mobile number and the 6-digit SMS code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginWithOTP(fullPhone, code, role);
      if (role === 'admin' && res?.user?.role !== 'admin') {
        throw new Error('Security Alert: Access denied. Member credentials cannot be used to log in to the Admin Portal. Please switch to the Member Login tab.');
      }
      setLoggedInUser(res?.user || { phone: fullPhone });
      if (role === 'admin') {
        setActiveTab('admin');
        showToast('Administrator authenticated via SMS Code!', 'success');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'SMS authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginDirectToFeature = async (featureId, featureName) => {
    const id = loginIdentifier.trim();
    if (!id || !password) {
      setError('Please enter your Email or Mobile Number and Password to sign in.');
      return;
    }
    setLoading(true);
    setError('');
    setDestinationTab(featureId);
    try {
      const res = await login(id, password, role);
      if (role === 'admin' && res?.user?.role !== 'admin') {
        throw new Error('Security Alert: Access denied. Member credentials cannot be used to log in to the Admin Portal. Please switch to the Member Login tab.');
      }
      setLoggedInUser(res?.user || { email: id });
      const isAdmin = res?.user?.role === 'admin';
      if (isAdmin) {
        setActiveTab('admin');
        showToast('Admin access granted.', 'success');
      } else {
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

  /* ─── Step 2: App connect state ─── */
  const [step, setStep] = useState(1); // 1 = creds, 2 = connect app
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

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
          /* ─── Fit Health Dual-Verified Sign Up (Email Address + Mobile Number) ─── */
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
                  {role === 'admin' ? '🛡️ Admin Account Registration' : '🏋️ Member Account Registration'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Provide both Email Address and Mobile Number. Both contacts must be verified with their 6-digit codes before completion.
              </p>
            </div>

            {error && (
              <div className="card" style={{ padding: '12px', background: 'var(--rose-subtle)', borderColor: 'var(--rose)', color: 'var(--rose)', fontSize: '13px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCompleteSignup}>
              {/* 1. Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bharath S"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>
              </div>

              {/* 2. Email Address & Verification */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Email Address *</label>
                  {emailVerified ? (
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. athlete@fithealth.io"
                      value={signupEmail}
                      onChange={(e) => { setSignupEmail(e.target.value); setEmailVerified(false); }}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={sendingEmailOtp || emailCooldown > 0}
                      className="btn btn-secondary"
                      style={{ height: '44px', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 800, padding: '0 12px' }}
                    >
                      {sendingEmailOtp ? 'Sending...' : emailCooldown > 0 ? `Resend (${emailCooldown}s)` : emailOtpSent ? 'Resend Code' : 'Send Email OTP'}
                    </button>
                  )}
                </div>

                {/* Email OTP Input Box */}
                {emailOtpSent && !emailVerified && (
                  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                        Enter 6-Digit Email Code:
                      </span>
                      {emailCodeHint && (
                        <span onClick={() => setEmailOtpCode(emailCodeHint)} style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                          Autofill {emailCodeHint}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        className="form-input"
                        placeholder="6-digit email code"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 800 }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOTP}
                        disabled={verifyingEmailOtp || emailOtpCode.length !== 6}
                        className="btn btn-primary"
                        style={{ height: '44px', padding: '0 14px', fontSize: '11px', fontWeight: 800 }}
                      >
                        {verifyingEmailOtp ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Mobile Number & SMS Verification */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Mobile Number (with country code) *</label>
                  {mobileVerified ? (
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    className="form-input"
                    value={signupCountryCode}
                    onChange={(e) => setSignupCountryCode(e.target.value)}
                    style={{ width: '110px', padding: '0 8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={signupMobile}
                      onChange={(e) => { setSignupMobile(e.target.value); setMobileVerified(false); }}
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                    <Smartphone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  </div>
                  {!mobileVerified && (
                    <button
                      type="button"
                      onClick={handleSendMobileOTP}
                      disabled={sendingMobileOtp || mobileCooldown > 0}
                      className="btn btn-secondary"
                      style={{ height: '44px', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 800, padding: '0 12px' }}
                    >
                      {sendingMobileOtp ? 'Sending...' : mobileCooldown > 0 ? `Resend (${mobileCooldown}s)` : mobileOtpSent ? 'Resend SMS' : 'Send SMS OTP'}
                    </button>
                  )}
                </div>

                {/* Mobile SMS OTP Input Box */}
                {mobileOtpSent && !mobileVerified && (
                  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                        Enter 6-Digit SMS Code:
                      </span>
                      {mobileCodeHint && (
                        <span onClick={() => setMobileOtpCode(mobileCodeHint)} style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                          Autofill {mobileCodeHint}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        className="form-input"
                        placeholder="6-digit SMS code"
                        value={mobileOtpCode}
                        onChange={(e) => setMobileOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 800 }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMobileOTP}
                        disabled={verifyingMobileOtp || mobileOtpCode.length !== 6}
                        className="btn btn-primary"
                        style={{ height: '44px', padding: '0 14px', fontSize: '11px', fontWeight: 800 }}
                      >
                        {verifyingMobileOtp ? 'Verifying...' : 'Verify SMS'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Password */}
              <div className="form-group">
                <label className="form-label">Password * (min 6 characters)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                    minLength={6}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <button
                    type="button"
                    onClick={() => setShowSignupPass(!showSignupPass)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Confirm Password *</label>
                  {signupConfirmPassword && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: signupPassword === signupConfirmPassword ? 'var(--primary)' : 'var(--rose)' }}>
                      {signupPassword === signupConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupConfirmPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                    minLength={6}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPass(!showSignupConfirmPass)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showSignupConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 6. Admin Invite Code (Admin Only) */}
              {role === 'admin' && (
                <div className="form-group" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <label className="form-label" style={{ color: 'var(--amber)', fontWeight: 800 }}>
                    🛡️ Administrator Invitation Code *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ADMIN-SECRET-KEY-2026"
                      value={adminInviteCode}
                      onChange={(e) => setAdminInviteCode(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <Key size={16} color="var(--amber)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Administrator privileges strictly require an authorized invite code issued by the facility owner.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={signupSubmitting}
                style={{
                  height: '48px',
                  fontSize: '14px',
                  fontWeight: 800,
                  marginTop: '16px',
                  background: role === 'admin'
                    ? 'linear-gradient(135deg, var(--amber), #d97706)'
                    : 'linear-gradient(135deg, var(--primary), #059669)',
                  borderColor: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                  color: '#0b0f19'
                }}
              >
                <CheckCircle2 size={18} />
                <span>{signupSubmitting ? 'Registering Account...' : 'Complete Registration & Launch Fit Health →'}</span>
              </button>
            </form>
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
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}>
                {role === 'admin' ? '🛡️ Gym Admin Secure Login' : '🏋️ Gym Member Secure Login'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {role === 'admin' ? 'Admin Portal Access' : 'Verified Accounts Only'}
              </span>
            </div>

            {/* Auth Method 3-Option Switcher: Password vs Email OTP vs Mobile OTP */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px',
              background: 'var(--bg-primary)', padding: '3px',
              borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(''); }}
                style={{
                  padding: '8px 4px', borderRadius: '7px', border: 'none',
                  background: authMethod === 'password' ? 'var(--bg-surface)' : 'transparent',
                  color: authMethod === 'password' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <Lock size={12} />
                <span>Password</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email_otp'); setError(''); }}
                style={{
                  padding: '8px 4px', borderRadius: '7px', border: 'none',
                  background: authMethod === 'email_otp' ? 'var(--bg-surface)' : 'transparent',
                  color: authMethod === 'email_otp' ? 'var(--cyan)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <Mail size={12} />
                <span>Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('mobile_otp'); setError(''); }}
                style={{
                  padding: '8px 4px', borderRadius: '7px', border: 'none',
                  background: authMethod === 'mobile_otp' ? 'var(--bg-surface)' : 'transparent',
                  color: authMethod === 'mobile_otp' ? (role === 'admin' ? 'var(--amber)' : 'var(--primary)') : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <Smartphone size={12} />
                <span>Mobile OTP</span>
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
              </div>
            )}

            {/* OPTION A: Password Login (Accepts Email or Mobile Number) */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address or Mobile Number *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-identifier"
                      type="text"
                      className="form-input"
                      placeholder="e.g. athlete@fithealth.io or +91 98765 43210"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password *</label>
                    <button
                      type="button"
                      onClick={() => onSwitchToForgot(loginIdentifier, role)}
                      style={{ fontSize: '12px', color: role === 'admin' ? '#f59e0b' : 'var(--cyan)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      type={showLoginPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      required
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
            )}

            {/* OPTION B1: Email OTP Login */}
            {authMethod === 'email_otp' && (
              <form onSubmit={handleEmailOTPLogin}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. athlete@fithealth.io"
                      value={loginEmail}
                      onChange={(e) => { setEmailLoginOtpSent(false); setLoginEmail(e.target.value); }}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  </div>
                </div>

                {!emailLoginOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailLoginOTP}
                    className="btn btn-primary btn-full"
                    style={{
                      height: '46px', fontSize: '14px', marginTop: '8px',
                      background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                    }}
                    disabled={sendingEmailLoginOtp}
                  >
                    <span>{sendingEmailLoginOtp ? 'Dispatching Verification Code...' : 'Send 6-Digit Email Code'}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 800, color: 'var(--cyan)' }}>
                          Enter 6-Digit Email Code *
                        </label>
                        <button
                          type="button"
                          onClick={() => setEmailLoginOtpSent(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Change Email
                        </button>
                      </div>

                      {emailLoginCodeHint && (
                        <div
                          onClick={() => setEmailLoginOtpCode(emailLoginCodeHint)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px dashed var(--cyan)',
                            color: 'var(--cyan)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                          }}
                        >
                          <span>💡 Code sent: <strong>{emailLoginCodeHint}</strong></span>
                          <span style={{ fontSize: '10px', textDecoration: 'underline' }}>Tap to Autofill</span>
                        </div>
                      )}

                      <OtpPinInput
                        value={emailLoginOtpCode}
                        onChange={setEmailLoginOtpCode}
                        role={role}
                        error={Boolean(error)}
                        autoFocus={true}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      style={{
                        height: '48px', fontSize: '15px', marginTop: '16px',
                        background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                      }}
                      disabled={loading || emailLoginOtpCode.length !== 6}
                    >
                      <CheckCircle2 size={18} />
                      <span>{loading ? 'Authenticating...' : 'Verify Code & Sign In →'}</span>
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* OPTION B2: Mobile SMS OTP Login */}
            {authMethod === 'mobile_otp' && (
              <form onSubmit={handleMobileOTPLogin}>
                <div className="form-group">
                  <label className="form-label">Registered Mobile Number *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      className="form-input"
                      value={loginCountryCode}
                      onChange={(e) => setLoginCountryCode(e.target.value)}
                      style={{ width: '110px', padding: '0 8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 9876543210"
                        value={loginPhone}
                        onChange={(e) => { setMobileLoginOtpSent(false); setLoginPhone(e.target.value); }}
                        style={{ paddingLeft: '38px' }}
                        required
                      />
                      <Smartphone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    </div>
                  </div>
                </div>

                {!mobileLoginOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendMobileLoginOTP}
                    className="btn btn-primary btn-full"
                    style={{
                      height: '46px', fontSize: '14px', marginTop: '8px',
                      background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                    }}
                    disabled={sendingMobileLoginOtp}
                  >
                    <span>{sendingMobileLoginOtp ? 'Dispatching SMS Code...' : 'Send 6-Digit SMS Code'}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 800, color: role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}>
                          Enter 6-Digit SMS Code *
                        </label>
                        <button
                          type="button"
                          onClick={() => setMobileLoginOtpSent(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Change Number
                        </button>
                      </div>

                      {mobileLoginCodeHint && (
                        <div
                          onClick={() => setMobileLoginOtpCode(mobileLoginCodeHint)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: role === 'admin' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: role === 'admin' ? '1px dashed var(--amber)' : '1px dashed var(--primary)',
                            color: role === 'admin' ? 'var(--amber)' : 'var(--primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                          }}
                        >
                          <span>💡 Code sent: <strong>{mobileLoginCodeHint}</strong></span>
                          <span style={{ fontSize: '10px', textDecoration: 'underline' }}>Tap to Autofill</span>
                        </div>
                      )}

                      <OtpPinInput
                        value={mobileLoginOtpCode}
                        onChange={setMobileLoginOtpCode}
                        role={role}
                        error={Boolean(error)}
                        autoFocus={true}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      style={{
                        height: '48px', fontSize: '15px', marginTop: '16px',
                        background: role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined
                      }}
                      disabled={loading || mobileLoginOtpCode.length !== 6}
                    >
                      <CheckCircle2 size={18} />
                      <span>{loading ? 'Authenticating...' : 'Verify SMS Code & Sign In →'}</span>
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
                  } else if (loginMobile && !signupMobile) {
                    setSignupMobile(loginMobile.trim());
                    setSignupContactType('mobile');
                    setSignupPassword(password || '');
                    if (!signupName) setSignupName('Athlete');
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
                Create Account with Mobile Number or Email →
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
