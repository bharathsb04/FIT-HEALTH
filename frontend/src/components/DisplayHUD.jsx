import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Monitor,
  Maximize2,
  Minimize2,
  Info,
  ChevronUp,
  ChevronDown,
  Crosshair,
  X
} from 'lucide-react';

export const DisplayHUD = () => {
  const {
    displayMetrics,
    setShowDisplayModal,
    isNativeFullscreen,
    toggleNativeFullscreen
  } = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectedElement, setInspectedElement] = useState(null);

  // Element Inspector logic when inspectMode is enabled on laptop screen
  useEffect(() => {
    if (!inspectMode) {
      setInspectedElement(null);
      return;
    }

    let previousOutline = null;
    let previousTarget = null;

    const handleMouseMove = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) return;

      // Don't inspect the HUD itself or modals
      if (target.closest('.display-hud-container') || target.closest('.modal-overlay')) {
        return;
      }

      if (previousTarget && previousTarget !== target) {
        previousTarget.style.outline = previousOutline || '';
      }

      previousTarget = target;
      previousOutline = target.style.outline;
      target.style.outline = '2px solid #10b981';

      const rect = target.getBoundingClientRect();
      const computed = window.getComputedStyle(target);
      const tag = target.tagName.toLowerCase();
      const classList = target.className && typeof target.className === 'string'
        ? target.className.split(' ').filter(c => c && !c.includes('active')).slice(0, 2).join('.')
        : '';
      const selector = classList ? `${tag}.${classList}` : tag;

      const pctWidth = ((rect.width / window.innerWidth) * 100).toFixed(1);

      setInspectedElement({
        selector,
        tag: tag.toUpperCase(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        pctWidth,
        display: computed.display,
        fontSize: computed.fontSize,
        padding: computed.padding,
        color: computed.color
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setInspectMode(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousTarget) {
        previousTarget.style.outline = previousOutline || '';
      }
    };
  }, [inspectMode]);

  // Only display on tablet/laptop screens
  if (displayMetrics.windowWidth < 768) return null;

  return (
    <div
      className="display-hud-container"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 900,
        pointerEvents: 'auto',
        fontFamily: 'var(--font-family, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}
    >
      {/* Live Element Hover / Access Tooltip when in Inspector Mode */}
      {inspectMode && inspectedElement && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(Math.max(inspectedElement.left, 12), window.innerWidth - 300)}px`,
            top: `${Math.max(inspectedElement.top - 46, 12)}px`,
            background: 'rgba(5, 8, 15, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11px',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 10px rgba(16, 185, 129, 0.4)',
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: '#10b981', fontWeight: 800 }}>&lt;{inspectedElement.selector}&gt;</span>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ fontWeight: 700, color: '#38bdf8' }}>{inspectedElement.width} × {inspectedElement.height} px</span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>({inspectedElement.pctWidth}% screen)</span>
          <span style={{ color: '#a855f7', fontSize: '10px' }}>{inspectedElement.display}</span>
        </div>
      )}

      {/* Expanded Full Display Telemetry Drawer */}
      {expanded && (
        <div
          className="card"
          style={{
            width: '320px',
            padding: '14px',
            background: 'rgba(11, 15, 25, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            marginBottom: '4px'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Monitor size={14} color="var(--primary)" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Laptop Display Details</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>App Viewport:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                {displayMetrics.windowWidth} × {displayMetrics.windowHeight} px
              </span>
            </div>

            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>Screen Resolution:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayMetrics.screenWidth} × {displayMetrics.screenHeight} px
              </span>
            </div>

            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>DPR / Scale:</span>
              <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>
                {displayMetrics.dpr}x ({displayMetrics.scalePercent}%)
              </span>
            </div>

            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>Aspect Ratio:</span>
              <span style={{ fontWeight: 700, color: 'var(--amber)' }}>
                {displayMetrics.aspectRatioLabel}
              </span>
            </div>

            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>Display Category:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayMetrics.deviceCategory}
              </span>
            </div>

            <div className="flex-between">
              <span style={{ color: 'var(--text-muted)' }}>GPU Engine:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={displayMetrics.gpu}>
                {displayMetrics.gpu}
              </span>
            </div>

            {/* Currently Inspected Element details when hovering on laptop */}
            {inspectedElement && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Accessed Element:
                </span>
                <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>&lt;{inspectedElement.selector}&gt;</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                    <span>Size: {inspectedElement.width}×{inspectedElement.height}px</span>
                    <span>{inspectedElement.pctWidth}% screen</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDisplayModal(true)}
            className="btn btn-secondary btn-full"
            style={{ height: '30px', fontSize: '11px', marginTop: '10px' }}
          >
            <Info size={12} /> Full Hardware & Screen Modal
          </button>
        </div>
      )}

      {/* Main Bottom HUD Bar */}
      <div
        className="card"
        style={{
          padding: '6px 10px',
          background: 'rgba(11, 15, 25, 0.90)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Real-Time Screen Resolution Chip */}
        <button
          onClick={() => setShowDisplayModal(true)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '12px',
            transition: 'background 0.2s'
          }}
          title="Click to view full screen and viewport specifications"
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary)'
            }}
          />
          <Monitor size={13} color="var(--primary)" />
          <span>
            {displayMetrics.windowWidth} × {displayMetrics.windowHeight}
          </span>
          <span style={{ color: 'var(--cyan)', fontSize: '10px', fontWeight: 600 }}>
            {displayMetrics.scalePercent}%
          </span>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />

        {/* Element Inspector Toggle Button */}
        <button
          onClick={() => setInspectMode(prev => !prev)}
          style={{
            background: inspectMode ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
            border: inspectMode ? '1px solid var(--primary)' : '1px solid transparent',
            color: inspectMode ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
          title={inspectMode ? 'Disable Element Inspector (ESC)' : 'Inspect Elements & Display Details on Screen'}
        >
          <Crosshair size={12} color={inspectMode ? 'var(--primary)' : 'currentColor'} />
          <span>{inspectMode ? 'Inspecting...' : 'Inspect Elements'}</span>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />

        {/* Native Fullscreen Quick Toggle */}
        <button
          onClick={toggleNativeFullscreen}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px'
          }}
          title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
        >
          {isNativeFullscreen ? <Minimize2 size={13} color="var(--primary)" /> : <Maximize2 size={13} />}
        </button>

        {/* Toggle Details Drawer */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          style={{
            background: expanded ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            borderRadius: '6px',
            fontSize: '10px'
          }}
          title={expanded ? 'Collapse Display Drawer' : 'Expand Display Details'}
        >
          <span>Specs</span>
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>
    </div>
  );
};
