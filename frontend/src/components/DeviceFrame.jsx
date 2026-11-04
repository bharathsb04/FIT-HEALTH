import React from 'react';

/**
 * Clean Application Container
 * Provides a clean, responsive wrapper that adapts naturally across
 * mobile phones, tablets, and laptops without artificial device overlays or fake status bars.
 */
export const DeviceFrame = ({ children }) => {
  return (
    <div className="app-container">
      {children}
    </div>
  );
};
