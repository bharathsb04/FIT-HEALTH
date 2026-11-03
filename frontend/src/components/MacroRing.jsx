import React from 'react';

export const MacroRing = ({
  size = 90,
  strokeWidth = 8,
  percentage = 0,
  color = '#10b981',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  label = '',
  value = '',
  sublabel = '',
  unit = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        {/* Center Text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: 1.1
        }}>
          <span style={{ fontSize: size > 80 ? '14px' : '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {value}{unit && <span style={{ fontSize: '9px', fontWeight: 600, marginLeft: '1px' }}>{unit}</span>}
          </span>
          {sublabel && (
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
