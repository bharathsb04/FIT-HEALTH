import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Monitor,
  Maximize2,
  Minimize2,
  X,
  Layers,
  Cpu,
  Tv,
  CheckCircle2,
  Smartphone,
  Eye,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const DisplayInspectorModal = () => {
  const {
    showDisplayModal,
    setShowDisplayModal,
    displayMetrics,
    isFullScreen,
    toggleFullScreen,
    isNativeFullscreen,
    toggleNativeFullscreen,
    theme,
    toggleTheme
  } = useTheme();

  if (!showDisplayModal) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => setShowDisplayModal(false)}
      style={{
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          borderRadius: '20px'
        }}
      >
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <Monitor size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Display & Screen Specifications</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Real-time active viewport and screen dimensions on your device
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDisplayModal(false)}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Active Display Highlight Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-fitness" style={{ fontSize: '10px' }}>ACTIVE DISPLAY</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayMetrics.deviceCategory}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--primary)' }}>
              {displayMetrics.windowWidth} <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>×</span> {displayMetrics.windowHeight} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>px viewport</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Monitor Resolution</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {displayMetrics.screenWidth} × {displayMetrics.screenHeight}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--cyan)', display: 'block', fontWeight: 600 }}>
              {displayMetrics.scalePercent}% OS Scaling
            </span>
          </div>
        </div>

        {/* Detailed Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Available Workspace
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800 }}>
              {displayMetrics.availWidth} × {displayMetrics.availHeight} px
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Excluding OS taskbar
            </span>
          </div>

          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Device Pixel Ratio
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
              {displayMetrics.dpr}x DPR
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              {displayMetrics.dpr >= 2 ? 'Retina / HiDPI' : 'Standard DPI'}
            </span>
          </div>

          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Aspect Ratio
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--cyan)' }}>
              {displayMetrics.aspectRatioLabel}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Ratio: {displayMetrics.aspectRatio}:1
            </span>
          </div>

          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Color Depth & HDR
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800 }}>
              {displayMetrics.colorDepth}-Bit TrueColor
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              sRGB / Wide Gamut
            </span>
          </div>

          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Orientation
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800 }}>
              {displayMetrics.orientation}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Landscape Laptop View
            </span>
          </div>

          <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Layout Engine
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--amber)' }}>
              {isFullScreen ? 'Full Laptop Display' : '440px Phone Bezel'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
              Responsive 2-Col Grid
            </span>
          </div>
        </div>

        {/* Hardware Acceleration & Element Rendering Details */}
        <div
          className="card"
          style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            marginBottom: '20px',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={16} color="var(--primary)" />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Hardware Acceleration & Element Access</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GPU Renderer:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayMetrics.gpu}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Multi-Column Display:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Active (Desktop 2-Col & 3-Col Grids)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Max Content Width:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1,400 px centered</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Browser Native Fullscreen:</span>
              <span style={{ fontWeight: 600, color: isNativeFullscreen ? 'var(--primary)' : 'var(--text-muted)' }}>
                {isNativeFullscreen ? 'Enabled (F11 Fullscreen)' : 'Standard Windowed'}
              </span>
            </div>
          </div>
        </div>

        {/* Display Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleNativeFullscreen}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '180px', height: '42px', fontSize: '13px' }}
          >
            {isNativeFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isNativeFullscreen ? 'Exit Native Fullscreen' : 'Enable Native Fullscreen (F11)'}</span>
          </button>

          <button
            onClick={toggleFullScreen}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '180px', height: '42px', fontSize: '13px' }}
          >
            {isFullScreen ? <Smartphone size={16} /> : <Monitor size={16} />}
            <span>{isFullScreen ? 'Switch to Phone Frame (440px)' : 'Switch to Full Laptop Display'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
