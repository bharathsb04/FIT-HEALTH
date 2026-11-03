import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Wifi, Battery } from 'lucide-react';

export const DeviceFrame = ({ children }) => {
  const { isFullScreen } = useTheme();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app-container ${isFullScreen ? 'full-screen-container' : 'simulator-container'}`}>
      {/* Main Container */}
      <div className={`mobile-device-wrapper ${isFullScreen ? 'full-screen-mode' : ''}`}>
        {/* If in Mobile Simulator Frame: Show Phone Status Bar & Dynamic Island */}
        {!isFullScreen && (
          <div className="device-status-bar">
            <span>{time || '09:41'}</span>
            <div className="device-island">
              <div className="island-camera"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>
        )}

        {/* Content Shell */}
        {children}
      </div>
    </div>
  );
};
