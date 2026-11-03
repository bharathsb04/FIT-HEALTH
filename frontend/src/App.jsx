import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FitnessProvider, useFitness } from './contexts/FitnessContext';

// Components
import { DeviceFrame } from './components/DeviceFrame';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SplashPage } from './pages/SplashPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { GymLocatorPage } from './pages/GymLocatorPage';
import { WorkoutPlannerPage } from './pages/WorkoutPlannerPage';
import { NutritionTrackerPage } from './pages/NutritionTrackerPage';
import { BulkingCuttingPage } from './pages/BulkingCuttingPage';
import { VitalsPage } from './pages/VitalsPage';
import { SupplementGuidePage } from './pages/SupplementGuidePage';
import { HydrationPage } from './pages/HydrationPage';
import { SleepRecoveryPage } from './pages/SleepRecoveryPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GymFeesPage } from './pages/GymFeesPage';
import { AddGymMemberPage } from './pages/AddGymMemberPage';
import { GymMembersPage } from './pages/GymMembersPage';

const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { activeTab, setActiveTab, isFeatureSelected, toggleFeatureSelection } = useFitness();
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'splash' | 'onboarding' | 'login' | 'forgot'
  const [authRole, setAuthRole] = useState('member'); // 'member' | 'admin'
  const [forgotEmail, setForgotEmail] = useState('');

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading Fit Health...</span>
      </div>
    );
  }

  // Unauthenticated views
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <div className="screen-content" style={{ paddingBottom: 0, width: '100%', height: '100%' }}>
          <Toast />
          <LandingPage
            onGetStarted={() => setAuthView('onboarding')}
            onLogin={(role) => {
              setAuthRole(role || 'member');
              setAuthView('login');
            }}
            onQuickLogin={() => setAuthView('splash')}
            onAdminLogin={() => {
              setAuthRole('admin');
              setAuthView('login');
            }}
          />
        </div>
      );
    }

    return (
      <div className="screen-content" style={{ paddingBottom: 0 }}>
        <Toast />
        {authView === 'splash' && (
          <SplashPage
            onGetStarted={() => setAuthView('onboarding')}
            onLogin={() => setAuthView('login')}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
        {authView === 'onboarding' && (
          <OnboardingPage
            onSwitchToLogin={(role) => {
              setAuthRole(role === 'admin' ? 'admin' : 'member');
              setAuthView('login');
            }}
            onSwitchToAdminLogin={() => {
              setAuthRole('admin');
              setAuthView('login');
            }}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
        {authView === 'login' && (
          <LoginPage
            initialRole={authRole}
            onSwitchToRegister={() => setAuthView('onboarding')}
            onSwitchToForgot={(email, role) => {
              if (email) setForgotEmail(email);
              if (role) setAuthRole(role);
              setAuthView('forgot');
            }}
            onSwitchToSplash={() => setAuthView('splash')}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
        {authView === 'forgot' && (
          <ForgotPasswordPage
            initialEmail={forgotEmail}
            initialRole={authRole}
            onBackToLogin={() => setAuthView('login')}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
      </div>
    );
  }

  // Authenticated application views
  const renderAuthenticatedPage = () => {
    // If admin is active or admin user is on default dashboard
    if (activeTab === 'admin' || (user?.role === 'admin' && activeTab === 'dashboard')) {
      return <AdminDashboardPage />;
    }

    // Dynamic interface check for excluded choices
    const featureMap = {
      workout: 'workout',
      nutrition: 'nutrition',
      vitals: 'nutrition',
      'bulking-cutting': 'nutrition',
      hydration: 'nutrition',
      recovery: 'nutrition',
      supplements: 'nutrition',
      gyms: 'gyms',
      fees: 'gyms',
      'gym-fees': 'gyms'
    };

    const requiredFeature = featureMap[activeTab];
    if (requiredFeature && !isFeatureSelected(requiredFeature)) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1.5px dashed rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800
            }}>
              ✕
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Interface Excluded
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                {requiredFeature === 'workout' && '6-Day Split Workout Planner is Excluded'}
                {requiredFeature === 'nutrition' && 'Nutrition & Vitals Sync is Excluded'}
                {requiredFeature === 'gyms' && 'GPS Gym Locator is Excluded'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                You have not selected this interface in your 3-choice data selection. You can activate it at any time to access this module and its real-time data sets.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => toggleFeatureSelection(requiredFeature)}
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
              >
                Activate Interface
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'admin':
        return <AdminDashboardPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'fees':
      case 'gym-fees':
        return <GymFeesPage />;
      case 'members':
      case 'gym-members':
        return <GymMembersPage onNavigate={setActiveTab} />;
      case 'maintenance':
      case 'equipment':
        return <AdminDashboardPage initialSubTab="equipment" />;
      case 'notes':
        return <AdminDashboardPage initialSubTab="notes" />;
      case 'workout':
        return <WorkoutPlannerPage />;
      case 'nutrition':
        return <NutritionTrackerPage />;
      case 'gyms':
        return <GymLocatorPage />;
      case 'vitals':
        return <VitalsPage />;
      case 'bulking-cutting':
        return <BulkingCuttingPage />;
      case 'hydration':
        return <HydrationPage />;
      case 'recovery':
        return <SleepRecoveryPage />;
      case 'supplements':
        return <SupplementGuidePage />;
      case 'progress':
        return <ProgressPage />;
      case 'add-member':
        return <AddGymMemberPage onNavigate={setActiveTab} />;
      case 'profile':
        return <ProfilePage />;
      case 'ai':
        return <AIAssistantPage />;
      default:
        return <DashboardPage />;
    }
  };


  return (
    <div className="authenticated-layout">
      {/* Sideways Navigation Bar after Login */}
      <Sidebar />
      <div className="main-content-area">
        <Toast />
        <main className="screen-content">
          {renderAuthenticatedPage()}
        </main>
        {/* Mobile Navigation Bar (visible based on display size) */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FitnessProvider>
          <ErrorBoundary>
            <DeviceFrame>
              <AppNavigator />
            </DeviceFrame>
          </ErrorBoundary>
        </FitnessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
