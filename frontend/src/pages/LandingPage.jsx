import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Activity,
  Dumbbell,
  MapPin,
  ShieldCheck,
  Heart,
  Moon,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Lock,
  Mail,
  Users,
  Check,
  Menu,
  X,
  Smartphone,
  Clock,
  Award,
  Layers,
  Compass,
  Database,
  KeyRound,
  Sun
} from 'lucide-react';
import { LoginPage } from './LoginPage';

export const LandingPage = ({
  onGetStarted,
  onLogin,
  onQuickLogin,
  onAdminLogin
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('workout');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Login Popup Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState('member'); // 'member' | 'admin'

  const openLoginModal = (role = 'member') => {
    setLoginModalRole(role);
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'How does the 6-Day Split Workout Planner adapt to my personal goals?',
      a: 'Fit Health automatically generates a personalized 6-day split tailored to whether your goal is Bulking, Cutting, Strength, or Maintenance. Each day targets specific muscle groups with set and rep targets, customizable exercises, live weight tracking, and workout completion recording.'
    },
    {
      q: 'How does the GPS Gym Locator & Instant Day Pass feature work?',
      a: 'The Gym Locator calculates real-time distances from your location to affiliated fitness centers, displaying amenities, equipment, and digital fee structures. You can book instant single-day passes or generate digital cash tokens to access gym facilities immediately.'
    },
    {
      q: 'Can I synchronize my smartwatch and wearable health metrics?',
      a: 'Yes. Fit Health includes wearable sync integration for Apple Health, Google Fit, Samsung Health, Galaxy Watch, Fitbit, Garmin Connect, and WHOOP. It monitors live heart rate, blood pressure, blood oxygen (SPO2), steps, and hydration.'
    },
    {
      q: 'What management tools are provided for Gym Administrators?',
      a: 'The Gym Admin Console gives facility managers full control: member check-in verification, equipment maintenance scheduling and service logs, interactive rate card publishing, collaboration redemption codes, and a confidential staff scratchpad.'
    },
    {
      q: 'How is my account and health data secured?',
      a: 'Fit Health uses industry-standard JWT (JSON Web Token) authentication, bcrypt password hashing, and single-use 6-digit SMTP email OTP verification. Application data is managed through Google Firebase Cloud Firestore with role-based least-privilege security rules.'
    },
    {
      q: 'Can I access Fit Health on both mobile phones and desktop displays?',
      a: 'Yes! Fit Health is designed with a responsive architecture featuring a mobile simulator preview mode, responsive bottom navigation for smartphones, and an expanded widescreen layout for laptops and 4K displays.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ─── 1. TOP NAVIGATION BAR ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8, 12, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 clamp(12px, 3vw, 24px)',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            <Activity size={22} color="#080c14" strokeWidth={2.5} />
          </div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '19px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #ffffff 30%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>
              Fit Health
            </span>
            <span className="brand-subtitle">
              Unified Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          gap: '28px',
          alignItems: 'center'
        }} className="landing-desktop-nav">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('preview')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Interactive Preview
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Benefits
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            FAQ
          </button>
        </nav>

        {/* Header Right Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Theme Toggle (Always visible on mobile & desktop) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="icon-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}
          >
            {theme === 'dark' ? <Sun size={18} color="var(--amber)" /> : <Moon size={18} color="var(--indigo)" />}
          </button>

          {/* Desktop-Only Action Buttons (Hidden on mobile < 768px) */}
          <div className="landing-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => openLoginModal('admin')}
              className="btn btn-secondary"
              style={{
                minHeight: '44px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                color: 'var(--amber)',
                whiteSpace: 'nowrap'
              }}
              title="Access the Gym Administrator Portal"
            >
              <ShieldCheck size={15} color="var(--amber)" />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('member')}
              className="btn btn-secondary"
              style={{
                minHeight: '44px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{
                minHeight: '44px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Hamburger Button (Only on < 768px, min 44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="icon-btn landing-mobile-menu-btn"
            style={{ width: '44px', height: '44px', borderRadius: '12px' }}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Drawer Menu (Full-width, thumb-friendly items) */}
      {mobileMenuOpen && (
        <>
          <div className="landing-drawer-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="landing-drawer-content">
            <button
              type="button"
              className="landing-drawer-item"
              onClick={() => scrollToSection('features')}
            >
              <span>Features</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
            <button
              type="button"
              className="landing-drawer-item"
              onClick={() => scrollToSection('preview')}
            >
              <span>Interactive Preview</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
            <button
              type="button"
              className="landing-drawer-item"
              onClick={() => scrollToSection('how-it-works')}
            >
              <span>How It Works</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
            <button
              type="button"
              className="landing-drawer-item"
              onClick={() => scrollToSection('benefits')}
            >
              <span>Benefits</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
            <button
              type="button"
              className="landing-drawer-item"
              onClick={() => scrollToSection('faq')}
            >
              <span>Frequently Asked Questions</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

            {/* Full-width Login & Portal Action Buttons on Mobile */}
            <button
              type="button"
              onClick={() => openLoginModal('member')}
              className="btn btn-secondary btn-full"
              style={{ minHeight: '48px', fontSize: '15px', fontWeight: 700 }}
            >
              Sign In to Fit Health
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('admin')}
              className="btn btn-secondary btn-full"
              style={{
                minHeight: '48px',
                fontSize: '15px',
                fontWeight: 700,
                borderColor: 'rgba(245, 158, 11, 0.4)',
                color: 'var(--amber)'
              }}
            >
              <ShieldCheck size={16} color="var(--amber)" />
              <span>Admin Portal Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
              className="btn btn-primary btn-full"
              style={{ minHeight: '48px', fontSize: '15px', fontWeight: 800 }}
            >
              <span>Start Free Journey</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* ─── 2. HERO SECTION ─── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(28px, 6vh, 60px) 16px 36px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Subtle Background Glow Accent */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(650px, 90vw)',
          height: '280px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(0,0,0,0) 80%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Main Headline */}
        <h1 style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(1.75rem, 7vw, 3rem)',
          fontWeight: 900,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          maxWidth: '920px',
          margin: '0 auto 16px',
          color: 'var(--text-primary)'
        }}>
          Transform Your Fitness Journey With Intelligent Tracking &amp;{' '}
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Gym Integration
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6,
          margin: '0 auto 28px'
        }}>
          The ultimate fitness companion unifying your <strong>6-Day Split Workout Planner</strong>,
          real-time <strong>Nutrition &amp; Vitals Sync</strong>, and a <strong>GPS-powered Gym Locator</strong> with
          instant day-pass booking and automated facility management.
        </p>

        {/* CTA Buttons Group: Stacked full-width on mobile, side-by-side on desktop */}
        <div className="hero-cta-group" style={{ position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: 800,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>Start Free Journey</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => openLoginModal('member')}
            className="btn btn-secondary"
            style={{
              padding: '14px 28px',
              minHeight: '48px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              background: 'rgba(26, 37, 60, 0.8)'
            }}
          >
            <Zap size={18} color="var(--primary)" />
            <span>Quick 3-Feature Login</span>
          </button>
        </div>

        {/* Feature Badges Grid */}
        <div
          className="hero-badges-grid"
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1000px',
            textAlign: 'left'
          }}
        >
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>6-Day Split Regimens</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bulking, Cutting &amp; Strength</div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="var(--cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Nutrition &amp; Macro Sync</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calorie rings &amp; wearable data</div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="var(--amber)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>GPS Gym Locator</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Instant passes &amp; cash tokens</div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="var(--indigo)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Facility Admin Console</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Check-in &amp; maintenance logs</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. INTERACTIVE APPLICATION PREVIEW SECTION ─── */}
      <section id="preview" style={{
        padding: '60px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Live Platform Preview
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Explore Core Application Interfaces
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
            Select an interface below to preview the actual tools and dashboards built into Fit Health.
          </p>
        </div>

        {/* Preview Selector Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {[
            { id: 'workout', label: '6-Day Split Planner', icon: Dumbbell, color: 'var(--primary)' },
            { id: 'nutrition', label: 'Nutrition & Macro Sync', icon: Activity, color: 'var(--cyan)' },
            { id: 'gyms', label: 'GPS Gym Locator & Passes', icon: MapPin, color: 'var(--amber)' },
            { id: 'admin', label: 'Admin Facility Console', icon: ShieldCheck, color: 'var(--indigo)' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activePreviewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePreviewTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: isActive ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Icon size={16} color={tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Display Window */}
        <div className="card" style={{
          background: 'var(--bg-surface)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {activePreviewTab === 'workout' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Active Routine</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>6-Day Hypertrophy Bulking Split</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-primary">Day 1: Chest &amp; Triceps</span>
                  <span className="badge badge-cyan">4 Exercises</span>
                </div>
              </div>

              {/* Sample Exercises */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Barbell Bench Press</span>
                    <CheckCircle2 size={16} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>4 Sets × 8-10 Reps • 85 kg</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '6px', fontWeight: 600 }}>Completed • 100% Volume</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Incline Dumbbell Press</span>
                    <CheckCircle2 size={16} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>3 Sets × 10-12 Reps • 28 kg</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '6px', fontWeight: 600 }}>Completed • Peak Contraction</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Cable Tricep Pushdown</span>
                    <Clock size={16} color="var(--amber)" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>3 Sets × 12-15 Reps • 32 kg</div>
                  <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '6px', fontWeight: 600 }}>In Progress • Set 2/3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full split features dynamic rest timers, PR history, and 1-click split reset.</span>
                <button type="button" onClick={onQuickLogin} className="btn btn-primary" style={{ fontSize: '13px' }}>
                  Launch Workout Planner →
                </button>
              </div>
            </div>
          )}

          {activePreviewTab === 'nutrition' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>Daily Macro Sync</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Target: 2,850 kcal • High Protein Regimen</h3>
                </div>
                <span className="badge badge-cyan">Auto-Calculated TDEE</span>
              </div>

              {/* Macro Rings Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Calories Remaining</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', margin: '4px 0' }}>820 kcal</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Consumed: 2,030 / 2,850</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Protein Intake</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--cyan)', margin: '4px 0' }}>158 g</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Goal: 185 g (85%)</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Hydration Sync</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>2.8 L</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Target: 3.5 Liters</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Resting Heart Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--rose)', margin: '4px 0' }}>62 bpm</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Synced via Google Fit</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Includes 50+ item food database search and wearable sync bridge.</span>
                <button type="button" onClick={onQuickLogin} className="btn btn-primary" style={{ fontSize: '13px' }}>
                  Open Nutrition Tracker →
                </button>
              </div>
            </div>
          )}

          {activePreviewTab === 'gyms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>GPS Network</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Nearby Verified Fitness Centers</h3>
                </div>
                <span className="badge badge-amber">21 Gyms in Database</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Iron Forge Fitness Club</h4>
                    <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700 }}>1.2 km away</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 10px' }}>Downtown Sector 4 • Open 05:00 - 23:00</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px' }}>Free Weights</span>
                    <span style={{ fontSize: '10px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px' }}>Sauna</span>
                    <span style={{ fontSize: '10px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px' }}>Shower</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>$15 / Day Pass</span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>Instant Cash Token</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Titan Strength Arena</h4>
                    <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700 }}>2.8 km away</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 10px' }}>Westside Plaza • 24/7 Access</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px' }}>Powerlifting Racks</span>
                    <span style={{ fontSize: '10px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px' }}>Lockers</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>$12 / Day Pass</span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>Instant Cash Token</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Book day passes directly or inspect fee cards and amenity checklists.</span>
                <button type="button" onClick={onQuickLogin} className="btn btn-primary" style={{ fontSize: '13px' }}>
                  Explore Gym Locator →
                </button>
              </div>
            </div>
          )}

          {activePreviewTab === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--indigo)', textTransform: 'uppercase' }}>Facility Management</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Gym Operations &amp; Check-In Hub</h3>
                </div>
                <span className="badge badge-indigo">Admin Portal Access</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Members</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>148 Members</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>12 Checked In Today</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Equipment Status</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>98% Operational</div>
                  <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '2px' }}>1 Machine Due For Oil</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Collaboration Code</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px', letterSpacing: '2px' }}>FH-COL-2026</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Instant Token Sync</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full rate card editor, equipment maintenance directory, and audit logs.</span>
                <button type="button" onClick={() => onLogin('admin')} className="btn btn-secondary" style={{ fontSize: '13px' }}>
                  Open Admin Console →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. FEATURES GRID SECTION ─── */}
      <section id="features" style={{
        padding: '70px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Comprehensive Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Engineered For Peak Performance
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '650px', margin: '8px auto 0' }}>
            Every tool is designed to work in synergy, removing guesswork and keeping your routines, nutrition, and gym access unified.
          </p>
        </div>

        <div className="features-responsive-grid">
          {/* Feature 1 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Dumbbell size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>6-Day Split Workout Planner</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Scientifically structured bulking, cutting, and maintenance programs. Track individual sets, weights, reps, rest periods, and exercise completion history in real time.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--primary)" /> Customizable exercises and set counts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--primary)" /> Dynamic rest timer and completion logs</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--primary)" /> Automatic volume and split resets</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Activity size={24} color="var(--cyan)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Nutrition &amp; Macro Ring Sync</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Personalized TDEE &amp; BMR calculations with interactive macro breakdown rings. Log breakfasts, lunches, dinners, and snacks with built-in food search.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--cyan)" /> Real-time calorie, protein, carb &amp; fat rings</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--cyan)" /> 50+ item verified food database search</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--cyan)" /> Daily hydration tracking in milliliters</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MapPin size={24} color="var(--amber)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>GPS Gym Locator &amp; Day Passes</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Discover nearby affiliated fitness centers with GPS distance calculations. View amenities, machine rosters, official fee cards, and book instant day passes.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--amber)" /> Interactive map with 21 seeded facilities</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--amber)" /> Instant digital day pass &amp; cash token generation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--amber)" /> Rate card inspection and membership verification</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck size={24} color="var(--indigo)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Gym Management Admin Console</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Turnkey management suite for gym coaches and owners. Track member check-ins, oversee machinery service schedules, edit fee tiers, and record notes.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--indigo)" /> Quick member check-in &amp; status overrides</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--indigo)" /> Equipment maintenance log &amp; service directory</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--indigo)" /> Digital fee structure publishing &amp; PDF preview</li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Heart size={24} color="var(--rose)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Wearable &amp; Vitals Integration</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Monitor resting heart rate, blood pressure, SPO2, steps, and daily activity. Connects seamlessly with Apple Health, Samsung Health, Google Fit, and Garmin.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--rose)" /> Biometric dashboard with trend histories</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--rose)" /> Multi-brand wearable connection status</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--rose)" /> Real-time calorie burn calibration</li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Sparkles size={24} color="var(--purple)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Sleep Recovery &amp; AI Assistant</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Optimize muscular recovery with restorative post-workout stretching routines, sleep quality logging, and an intelligent on-demand fitness coach.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--purple)" /> Guided mobility and stretching checklists</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--purple)" /> Sleep score and recovery recommendation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--purple)" /> Instant answers for form, diet, and routines</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── 5. HOW IT WORKS SECTION ─── */}
      <section id="how-it-works" style={{
        padding: '70px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Simple 3-Step Process
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '40px' }}>
            How Fit Health Empowers Your Regimen
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            textAlign: 'left'
          }}>
            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#080c14',
                fontWeight: 900,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '8px', marginBottom: '10px' }}>
                Configure Goals &amp; Metrics
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Set up your baseline metrics (height, weight, age, activity level) and select your primary objective (Bulking, Cutting, or Maintenance). Your custom 6-day split and macro goals are initialized instantly.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--cyan)',
                color: '#080c14',
                fontWeight: 900,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(6, 182, 212, 0.4)'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '8px', marginBottom: '10px' }}>
                Track Workouts &amp; Sync Vitals
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Follow your scheduled split routines day by day, record completed sets, monitor hydration, and sync biometric data from your smartwatch to keep your calorie burn and recovery balanced.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--amber)',
                color: '#080c14',
                fontWeight: 900,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '8px', marginBottom: '10px' }}>
                Connect With Local Gyms
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Locate partner gyms near you with GPS distances, review equipment inventories, generate instant cash tokens or digital day passes, and seamlessly verify check-ins at the facility front desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BENEFITS SECTION ─── */}
      <section id="benefits" style={{
        padding: '70px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Why Athletes &amp; Coaches Choose Fit Health
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Built With Modern Architectural Principles
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
            <Database size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Firestore Cloud Synchronized</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Powered by Google Firebase Cloud Firestore with automatic local database engine fallback for uninterrupted offline access and resilient storage.
            </p>
          </div>

          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
            <KeyRound size={24} color="var(--cyan)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>SMTP OTP Email Verification</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Single-use, HMAC-hashed 6-digit OTP authentication with 10-minute expiry and rate limiting to protect your account and personal fitness metrics.
            </p>
          </div>

          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
            <Lock size={24} color="var(--indigo)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>JWT Protected Security Rules</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Role-based access control (RBAC) ensuring members access only their logs while gym staff securely manage equipment, facilities, and rate cards.
            </p>
          </div>

          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
            <Smartphone size={24} color="var(--amber)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Cross-Device Responsive</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Fluid layouts optimized for smartphones, tablets, laptops, and ultra-wide desktop monitors with instant light/dark mode toggling.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 7. FREQUENTLY ASKED QUESTIONS (FAQ) ─── */}
      <section id="faq" style={{
        padding: '70px 24px',
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Got Questions?
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Find quick answers about Fit Health features, database synchronization, and security.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  background: 'var(--bg-surface)',
                  padding: 0,
                  overflow: 'hidden',
                  borderColor: isOpen ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 20px 18px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 8. CALL TO ACTION (CTA) BANNER ─── */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Ready to Elevate Your Training &amp; Gym Experience?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Join dedicated athletes and gym owners on Fit Health. Register in seconds with email OTP verification.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{
                padding: '13px 28px',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              Create Free Account
            </button>
            <button
              type="button"
              onClick={() => openLoginModal('member')}
              className="btn btn-secondary"
              style={{
                padding: '13px 28px',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '12px'
              }}
            >
              Launch Quick Login
            </button>
          </div>
        </div>
      </section>

      {/* ─── 9. FOOTER ─── */}
      <footer style={{
        marginTop: 'auto',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '50px 24px 30px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '36px'
        }}>
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={18} color="#080c14" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Fit Health</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
              The unified gym fitness companion. Real-time workout splits, nutrition macros, wearable vitals, and facility administration.
            </p>
          </div>

          {/* Col 2: Athlete Tools */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '0.5px' }}>
              Athlete Features
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li><button type="button" onClick={() => openLoginModal('member')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>6-Day Split Routines</button></li>
              <li><button type="button" onClick={() => openLoginModal('member')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Macro &amp; Calorie Tracking</button></li>
              <li><button type="button" onClick={() => openLoginModal('member')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>GPS Gym Day Passes</button></li>
              <li><button type="button" onClick={() => openLoginModal('member')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Sleep &amp; Active Recovery</button></li>
            </ul>
          </div>

          {/* Col 3: Facility Portal */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '0.5px' }}>
              Gym Management
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li><button type="button" onClick={() => openLoginModal('admin')} style={{ background: 'none', border: 'none', color: 'var(--amber)', padding: 0, cursor: 'pointer', fontWeight: 700 }}>🛡️ Admin Portal Login</button></li>
              <li><button type="button" onClick={() => openLoginModal('admin')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Member Check-In &amp; Verification</button></li>
              <li><button type="button" onClick={() => openLoginModal('admin')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Equipment Service Log</button></li>
              <li><button type="button" onClick={onGetStarted} style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: 0, cursor: 'pointer', fontWeight: 700 }}>✨ Create User / Admin Account</button></li>
            </ul>
          </div>

          {/* Col 4: Platform Security */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '0.5px' }}>
              Security Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" />
                <span>Firebase Cloud Firestore</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" />
                <span>SMTP 6-Digit Email OTP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" />
                <span>HMAC-SHA256 Token Vault</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" />
                <span>Bcrypt Password Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Fit Health Ecosystem. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="button" onClick={() => openLoginModal('member')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px' }}>
              Quick Login Interface
            </button>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* ─── 10. FLOATING LOGIN POPUP MODAL ─── */}
      {loginModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLoginModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
              position: 'relative'
            }}
          >
            <LoginPage
              initialRole={loginModalRole}
              isModal={true}
              onClose={() => setLoginModalOpen(false)}
              onSwitchToRegister={() => {
                setLoginModalOpen(false);
                onGetStarted();
              }}
              onSwitchToSplash={() => {
                setLoginModalOpen(false);
                onQuickLogin();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

