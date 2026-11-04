import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { useTheme } from '../contexts/ThemeContext';
import { Flame, Sparkles, User as UserIcon, Laptop, Smartphone, Sun, Moon } from 'lucide-react';

export const Header = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { setActiveTab } = useFitness();
  const { isLaptop, isRealMobileScreen, deviceMode, setDeviceMode, theme, toggleTheme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = (name) => {
    if (!name) return 'FH';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const goalClass = (user?.primaryGoal || 'Bulking').toLowerCase();

  return (
    <header className="app-header">
      <div className="header-user-info" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
        <div className="user-avatar">
          {getInitials(user?.name)}
        </div>
        <div className="header-title-block">
          <h2>{title || (user?.role === 'admin' ? `Gym Admin Portal` : `${getGreeting()}, ${user?.name?.split(' ')[0] || 'Athlete'}`)}</h2>
          <p className="header-subtitle">
            {subtitle || (
              user?.role === 'admin' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-fitness">ADMIN ACTIVE</span>
                  <span>• {user?.gymName || 'Gym Center Operations'}</span>
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`badge badge-${goalClass}`}>
                    {user?.primaryGoal || 'BULKING'}
                  </span>
                  <span>• Day ready</span>
                </span>
              )
            )}
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Device Switcher Pill: Shown on Laptop / Desktop to toggle between Laptop and Mobile UI */}
        {!isRealMobileScreen && (
          <div className="device-switcher-pill" title="Toggle between Widescreen Laptop UI and Mobile View">
            <button
              type="button"
              className={`device-toggle-btn ${isLaptop ? 'active' : ''}`}
              onClick={() => setDeviceMode('laptop')}
            >
              <Laptop size={13} />
              <span>Laptop UI</span>
            </button>
            <button
              type="button"
              className={`device-toggle-btn ${!isLaptop ? 'active' : ''}`}
              onClick={() => setDeviceMode('mobile')}
            >
              <Smartphone size={13} />
              <span>Mobile UI</span>
            </button>
          </div>
        )}

        {/* Streak Indicator (Only for regular members) */}
        {user?.role !== 'admin' && (
          <div
            className="chip"
            title="Workout & Fitness Logging Streak"
            onClick={() => setActiveTab('progress')}
            style={{ cursor: 'pointer' }}
          >
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{user?.streak || 14}d</span>
          </div>
        )}

        {/* Quick Theme Toggle on Laptop */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          style={{ display: 'inline-flex' }}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* AI Assistant Button */}
        <button
          className="icon-btn"
          onClick={() => setActiveTab('ai')}
          title="Fit Health AI Fitness Advisor"
        >
          <Sparkles size={18} color="var(--primary)" />
        </button>

        {/* User Profile */}
        <button
          className="icon-btn"
          onClick={() => setActiveTab('profile')}
          title="User Profile & Settings"
        >
          <UserIcon size={18} />
        </button>
      </div>
    </header>
  );
};
