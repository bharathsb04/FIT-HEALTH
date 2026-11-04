import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const getGpuInfo = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // safe fallback
  }
  return 'Hardware Accelerated';
};

const calculateMetrics = () => {
  if (typeof window === 'undefined') {
    return {
      windowWidth: 1440,
      windowHeight: 900,
      screenWidth: 1920,
      screenHeight: 1080,
      availWidth: 1920,
      availHeight: 1040,
      dpr: 1,
      scalePercent: 100,
      aspectRatio: '16:9',
      aspectRatioLabel: '16:9 (Widescreen)',
      colorDepth: 24,
      deviceCategory: 'Laptop / Desktop (FHD)',
      orientation: 'landscape-primary',
      effectiveResolution: '1920 × 1080',
      gpu: 'Accelerated'
    };
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const sw = window.screen.width;
  const sh = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  const ratio = (w / (h || 1)).toFixed(2);

  let category = 'Laptop / Desktop (FHD)';
  if (w >= 1920) category = 'Ultra-Wide / 4K Desktop (XL)';
  else if (w >= 1366) category = 'Standard Laptop Display (FHD)';
  else if (w >= 1024) category = 'Compact Laptop Display (HD)';
  else if (w >= 768) category = 'Tablet / Split Screen';
  else category = 'Mobile Phone Display';

  let aspectLabel = '16:9 Widescreen';
  const numRatio = w / (h || 1);
  if (Math.abs(numRatio - 16 / 9) < 0.15) aspectLabel = '16:9 Widescreen';
  else if (Math.abs(numRatio - 16 / 10) < 0.15) aspectLabel = '16:10 Laptop Display';
  else if (Math.abs(numRatio - 21 / 9) < 0.2) aspectLabel = '21:9 Ultra-Wide';
  else if (Math.abs(numRatio - 4 / 3) < 0.15) aspectLabel = '4:3 Standard';
  else if (numRatio < 1) aspectLabel = 'Portrait Display';

  return {
    windowWidth: w,
    windowHeight: h,
    screenWidth: sw,
    screenHeight: sh,
    availWidth: window.screen.availWidth || sw,
    availHeight: window.screen.availHeight || sh,
    dpr: Math.round(dpr * 100) / 100,
    scalePercent: Math.round(dpr * 100),
    aspectRatio: ratio,
    aspectRatioLabel: aspectLabel,
    colorDepth: window.screen.colorDepth || 24,
    deviceCategory: category,
    orientation: window.screen?.orientation?.type || (w > h ? 'landscape' : 'portrait'),
    effectiveResolution: `${Math.round(w * dpr)} × ${Math.round(h * dpr)}`,
    gpu: getGpuInfo()
  };
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('fit_health_theme') || 'dark');
  
  // Dynamic metrics calculation
  const [displayMetrics, setDisplayMetrics] = useState(calculateMetrics);
  
  // Device Mode: 'laptop' | 'mobile'
  const [deviceMode, setDeviceModeState] = useState(() => {
    const saved = localStorage.getItem('fit_health_device_mode');
    if (saved === 'mobile' || saved === 'laptop') return saved;
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'laptop';
  });

  const [isFullScreen, setIsFullScreen] = useState(() => {
    const saved = localStorage.getItem('fit_health_fullscreen');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' ? window.innerWidth > 768 : true;
  });

  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Resize and Orientation Listener to capture live display changes
  useEffect(() => {
    const handleResize = () => {
      const metrics = calculateMetrics();
      setDisplayMetrics(metrics);
      // Auto-switch to mobile if actual screen is small and mode not explicitly pinned
      if (metrics.windowWidth < 768) {
        setIsFullScreen(true);
      }
    };

    const handleFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fit_health_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fit_health_fullscreen', isFullScreen);
  }, [isFullScreen]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isRealMobileScreen = displayMetrics.windowWidth < 768;
  const isLaptop = !isRealMobileScreen && deviceMode !== 'mobile';
  const isMobile = !isLaptop;

  const setDeviceMode = (mode) => {
    setDeviceModeState(mode);
    localStorage.setItem('fit_health_device_mode', mode);
    setIsFullScreen(mode === 'laptop');
  };

  const toggleDeviceMode = () => {
    setDeviceMode(isLaptop ? 'mobile' : 'laptop');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
      const next = !prev;
      setDeviceModeState(next ? 'laptop' : 'mobile');
      localStorage.setItem('fit_health_device_mode', next ? 'laptop' : 'mobile');
      return next;
    });
  };

  const toggleNativeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Native fullscreen error:', err.message);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isFullScreen,
      toggleFullScreen,
      setIsFullScreen,
      deviceMode,
      setDeviceMode,
      toggleDeviceMode,
      isLaptop,
      isMobile,
      isRealMobileScreen,
      displayMetrics,
      showDisplayModal,
      setShowDisplayModal,
      isNativeFullscreen,
      toggleNativeFullscreen
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
