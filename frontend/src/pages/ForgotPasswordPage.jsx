import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { KeyRound, Mail, ArrowLeft, Lock, Eye, EyeOff, RefreshCw, Shield, User } from 'lucide-react';
import { OtpPinInput } from '../components/OtpPinInput';

export const ForgotPasswordPage = ({
  onBackToLogin,
  initialEmail = '',
  initialRole = 'member'
}) => {
  const { showToast } = useFitness();
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Enter new password
  const [role, setRole] = useState(initialRole || 'member');
  const [email, setEmail] = useState(initialEmail || '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialRole) setRole(initialRole);
  }, [initialEmail, initialRole]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const isAdmin = role === 'admin';
  const accentColor = isAdmin ? '#f59e0b' : '#10b981';

  const handleRequestCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await api.forgotPassword(cleanEmail, role);
      setMsg(res.message || `A 6-digit password recovery code has been dispatched to ${cleanEmail}.`);
      setResetCode('');
      setStep(2);
      setCountdown(45);
      showToast(`Verification code sent to ${cleanEmail}`, 'info');
    } catch (err) {
      setError(err.message || 'Failed to dispatch password recovery OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!resetCode || resetCode.trim().length !== 6) {
      return setError('Please enter the complete 6-digit OTP verification code.');
    }
    if (!newPassword || newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.resetPassword(cleanEmail, newPassword, resetCode.trim(), role);
      showToast(res.message || 'Password successfully updated! You can now log in.', 'success');
      setTimeout(() => {
        onBackToLogin();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
      <button
        onClick={onBackToLogin}
        className="icon-btn"
        style={{ width: '38px', height: '38px', marginBottom: '20px' }}
        title="Back to login"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Role Selector Tabs (Member vs Admin) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <button
          type="button"
          onClick={() => { setRole('member'); setError(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: !isAdmin ? '#10b981' : 'transparent',
            color: !isAdmin ? '#0b0f19' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <User size={15} /> Member Recovery
        </button>
        <button
          type="button"
          onClick={() => { setRole('admin'); setError(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: isAdmin ? '#f59e0b' : 'transparent',
            color: isAdmin ? '#0b0f19' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Shield size={15} /> Admin Recovery
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <KeyRound size={26} color={accentColor} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
          {isAdmin ? 'Admin Portal Recovery' : 'Member Password Recovery'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
          {step === 1
            ? `Enter your email to receive a real 6-digit recovery code.`
            : `Enter the 6-digit verification code sent to ${email}`}
        </p>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', background: 'var(--rose-subtle)', borderColor: 'var(--rose)', color: 'var(--rose)', fontSize: '13px', marginBottom: '18px', borderRadius: '10px' }}>
          {error}
        </div>
      )}

      {msg && (
        <div className="card" style={{ padding: '12px 16px', background: isAdmin ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)', borderColor: accentColor, color: accentColor, fontSize: '13px', marginBottom: '18px', borderRadius: '10px' }}>
          {msg}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestCode}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label">
              {isAdmin ? 'Gym Admin Email Address' : 'Gym Member Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder={isAdmin ? "admin@fithealth.io" : "athlete@fithealth.io"}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{
              height: '48px',
              fontSize: '15px',
              fontWeight: 700,
              marginTop: '12px',
              backgroundColor: accentColor,
              borderColor: accentColor,
              color: '#0b0f19'
            }}
            disabled={loading}
          >
            {loading ? 'Dispatching Verification Code...' : 'Send Recovery OTP Email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>6-Digit Verification Code</label>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: accentColor, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Change Email
              </button>
            </div>

            <OtpPinInput
              value={resetCode}
              onChange={setResetCode}
              role={role}
              error={Boolean(error)}
              autoFocus={true}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valid for 10 minutes</span>
              {countdown > 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className="spin" /> Resend in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestCode}
                  style={{ background: 'none', border: 'none', color: accentColor, fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{
              height: '48px',
              fontSize: '15px',
              fontWeight: 700,
              backgroundColor: accentColor,
              borderColor: accentColor,
              color: '#0b0f19'
            }}
            disabled={loading}
          >
            {loading ? 'Verifying & Updating...' : 'Verify OTP & Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};
