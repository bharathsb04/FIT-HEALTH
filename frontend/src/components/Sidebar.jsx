import React from 'react';
import { useFitness } from '../contexts/FitnessContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Activity,
  Home,
  Dumbbell,
  Utensils,
  MapPin,
  TrendingUp,
  Droplet,
  Moon,
  Sun,
  Pill,
  Flame,
  Sparkles,
  ShieldCheck,
  LogOut,
  Banknote,
  Wrench,
  BookOpen,
  User,
  UserPlus,
  Users,
  Building2
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    adminSubTab,
    navigateToAdminSection,
    selectedFeatures,
    toggleFeatureSelection,
    setSelectedFeatures,
    showToast
  } = useFitness();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = user?.role === 'admin';
  const hasMembership = Boolean(user?.membershipId || user?.membershipStatus === 'Active');

  // Determine which navigation items to show based on selected data interfaces
  const isWorkoutActive = selectedFeatures?.includes('workout');
  const isNutritionActive = selectedFeatures?.includes('nutrition');
  const isGymsActive = selectedFeatures?.includes('gyms');

  const allNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, interface: 'core' },
    { key: 'add-member', label: isAdmin ? 'Add Gym Member' : 'ADD GYM', icon: Building2, interface: 'core', badge: 'ENROLL' },
    { key: 'members', label: 'Gym Members', icon: Users, interface: 'admin' },
    { key: 'fees', label: 'Fees Structure', icon: Banknote, interface: 'admin' },
    { key: 'maintenance', label: 'Gym Maintenance', icon: Wrench, interface: 'admin' },
    { key: 'notes', label: 'Gym Notes', icon: BookOpen, interface: 'admin' },
    { key: 'workout', label: 'Workout Planner', icon: Dumbbell, interface: 'workout' },
    { key: 'nutrition', label: 'Nutrition Tracker', icon: Utensils, interface: 'nutrition' },
    { key: 'gyms', label: 'Gym Locator & Maps', icon: MapPin, interface: 'gyms' },
    { key: 'vitals', label: 'Vitals & Biometrics', icon: Activity, interface: 'nutrition' },
    { key: 'bulking-cutting', label: 'Bulking & Cutting', icon: TrendingUp, interface: 'nutrition' },
    { key: 'hydration', label: 'Hydration', icon: Droplet, interface: 'nutrition' },
    { key: 'recovery', label: 'Sleep & Recovery', icon: Moon, interface: 'nutrition' },
    { key: 'supplements', label: 'Supplement Guide', icon: Pill, interface: 'nutrition' },
    { key: 'progress', label: 'Progress & Photos', icon: Flame, interface: 'core' },
    { key: 'profile', label: 'Profile & Membership', icon: User, interface: 'core' },
    { key: 'ai', label: 'AI Fitness Coach', icon: Sparkles, badge: 'AI', interface: 'core' }
  ];

  const isAdminSection = isAdmin || [
    'admin',
    'members',
    'gym-members',
    'fees',
    'gym-fees',
    'maintenance',
    'equipment',
    'directory',
    'notes',
    'add-member'
  ].includes(activeTab);

  const navItems = allNavItems.filter(item => {
    // Hide admin-only management elements from member users (Gym Members, Fees Structure, Gym Maintenance, Gym Notes)
    if (item.interface === 'admin' || ['members', 'fees', 'maintenance', 'notes'].includes(item.key)) {
      if (!isAdmin) {
        return false;
      }
    }

    // Exclude "Workout Planner" and "Bulking & Cutting" from navigation bar for admin section / admin role
    if (isAdminSection) {
      if (item.key === 'workout' || item.key === 'bulking-cutting') {
        return false;
      }
    }

    if (item.interface === 'core') return true;
    if (item.interface === 'admin') return isAdmin;
    if (item.interface === 'workout') return isWorkoutActive;
    if (item.interface === 'nutrition') return isNutritionActive;
    if (item.interface === 'gyms') return isGymsActive;
    return true;
  });

  const handleNavClick = (item) => {
    setActiveTab(item.key);
  };

  const isItemActive = (item) => {
    return activeTab === item.key;
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

  const handleToggleInterface = (id, name) => {
    const isCurrentlyActive = selectedFeatures.includes(id);
    if (isCurrentlyActive && selectedFeatures.length <= 1) {
      showToast('Keep at least 1 feature active', 'info');
      return;
    }
    toggleFeatureSelection(id);
    if (isCurrentlyActive) {
      showToast(`Excluded ${name} from your interface`, 'info');
      // If user was currently on this tab, go to dashboard
      setActiveTab('dashboard');
    } else {
      showToast(`Activated ${name} interface!`, 'success');
    }
  };

  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      {/* Brand Header */}
      <div
        className="sidebar-brand"
        onClick={() => {
          if (user?.role === 'admin') {
            navigateToAdminSection('members');
          } else {
            setActiveTab('dashboard');
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="sidebar-brand-icon">
          <Activity size={22} color="#0b0f19" strokeWidth={2.8} />
        </div>
        <div className="sidebar-brand-info">
          <h2 className="sidebar-brand-title">Fit Health</h2>
          <span className="sidebar-brand-subtitle">Gym Companion</span>
        </div>
      </div>

      {/* Active Data Interfaces Quick Toggle Widget (For Member App) */}
      {user?.role !== 'admin' && (
        <div style={{
          margin: '0 12px 14px',
          padding: '10px',
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Interfaces ({selectedFeatures.length}/3)
            </span>
            {selectedFeatures.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFeatures(['workout', 'nutrition', 'gyms']);
                  showToast('All 3 data interfaces enabled!', 'success');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                All 3
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Workout Pill */}
            <div
              onClick={() => handleToggleInterface('workout', 'Workout Planner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isWorkoutActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isWorkoutActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px dashed rgba(248, 113, 113, 0.3)',
                fontSize: '11px',
                color: isWorkoutActive ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: isWorkoutActive ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              title={isWorkoutActive ? 'Click to exclude Workout interface' : 'Click to activate Workout interface'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Dumbbell size={12} color={isWorkoutActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>Workout</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: isWorkoutActive ? 'var(--primary)' : '#f87171'
              }}>
                {isWorkoutActive ? '✓ Active' : '✕ Off'}
              </span>
            </div>

            {/* Nutrition Pill */}
            <div
              onClick={() => handleToggleInterface('nutrition', 'Nutrition & Vitals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isNutritionActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isNutritionActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px dashed rgba(248, 113, 113, 0.3)',
                fontSize: '11px',
                color: isNutritionActive ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: isNutritionActive ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              title={isNutritionActive ? 'Click to exclude Nutrition interface' : 'Click to activate Nutrition interface'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={12} color={isNutritionActive ? 'var(--cyan)' : 'var(--text-muted)'} />
                <span>Nutrition & Vitals</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: isNutritionActive ? 'var(--cyan)' : '#f87171'
              }}>
                {isNutritionActive ? '✓ Active' : '✕ Off'}
              </span>
            </div>

            {/* Gyms Pill */}
            <div
              onClick={() => handleToggleInterface('gyms', 'Gym Locator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isGymsActive ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isGymsActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px dashed rgba(248, 113, 113, 0.3)',
                fontSize: '11px',
                color: isGymsActive ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: isGymsActive ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              title={isGymsActive ? 'Click to exclude Gym Locator interface' : 'Click to activate Gym Locator interface'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={12} color={isGymsActive ? 'var(--amber)' : 'var(--text-muted)'} />
                <span>GPS Gyms</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: isGymsActive ? 'var(--amber)' : '#f87171'
              }}>
                {isGymsActive ? '✓ Active' : '✕ Off'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="sidebar-nav-list" aria-label="Main Navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          return (
            <button
              key={item.key}
              id={`sidebar-nav-${item.key}`}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              title={item.label}
            >
              <div className="sidebar-item-icon-wrapper">
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge && (
                <span className={`sidebar-item-badge ${item.badge.toLowerCase()}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Streak Widget (Only for Members) */}
      {user?.role !== 'admin' && (
        <div
          className="sidebar-streak-card"
          onClick={() => setActiveTab('progress')}
          role="button"
          tabIndex={0}
          title="View workout streak in Progress"
        >
          <div className="sidebar-streak-icon">
            <Flame size={18} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div className="sidebar-streak-info">
            <span className="sidebar-streak-val">{user?.streak || 14} Days Active</span>
            <span className="sidebar-streak-sub">Workout streak</span>
          </div>
        </div>
      )}


      {/* User & Settings Footer */}
      <div className="sidebar-footer">
        {/* Profile Card */}
        <div
          className="sidebar-user-card"
          onClick={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'profile')}
          role="button"
          tabIndex={0}
          title="Open User Profile"
        >
          <div
            className="sidebar-avatar"
            style={{
              background: user?.role === 'admin' ? 'linear-gradient(135deg, var(--amber), #d97706)' : undefined,
              color: user?.role === 'admin' ? '#0b0f19' : undefined
            }}
          >
            {user?.role === 'admin' ? 'AD' : getInitials(user?.name)}
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">{user?.name || 'Athlete'}</span>
            <span
              className="sidebar-user-role"
              style={{ color: user?.role === 'admin' ? 'var(--amber)' : 'var(--primary)' }}
            >
              {user?.role === 'admin' ? 'GYM ADMIN' : 'MEMBER'}
            </span>
          </div>
        </div>

        {/* Action Controls: Theme & Logout */}
        <div className="sidebar-actions-row">
          <button
            className="sidebar-action-btn theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
            <span className="sidebar-action-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            className="sidebar-action-btn logout-btn"
            onClick={logout}
            title="Log Out of Fit Health"
            aria-label="Log Out"
          >
            <LogOut size={17} color="#ef4444" />
            <span className="sidebar-action-label">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
