import React, { useState } from 'react';
import { DEFAULT_FALLBACK_IMAGE } from '../data/supplementProductMapping';

export const SupplementProductImage = ({
  src,
  fallbackSrc,
  alt = 'Supplement product',
  discount = null,
  size = 108
}) => {
  const primarySrc = src || fallbackSrc || DEFAULT_FALLBACK_IMAGE;
  const backupSrc = fallbackSrc || DEFAULT_FALLBACK_IMAGE;

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (!hasError && currentSrc !== backupSrc) {
      setHasError(true);
      setCurrentSrc(backupSrc);
    } else if (currentSrc !== DEFAULT_FALLBACK_IMAGE) {
      setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        maxWidth: `${size}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#0d131f',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
      className="supplement-product-image-container"
    >
      {/* Loading Skeleton Pulse */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #111827 25%, #1f2937 50%, #111827 75%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.5s infinite',
            borderRadius: '12px'
          }}
        />
      )}

      {/* Main Product Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: '6px',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.25s ease, transform 0.25s ease'
        }}
      />

      {/* Discount Badge */}
      {discount && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 900,
            letterSpacing: '0.3px',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          {discount}
        </div>
      )}
    </div>
  );
};
