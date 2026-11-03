import React, { createContext, useContext, useState, useCallback } from 'react';

const FitnessContext = createContext(null);

export const FitnessProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState('members');
  const [toasts, setToasts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Selected Data Interfaces (out of the 3 choices: 'workout', 'nutrition', 'gyms')
  const [selectedFeatures, setSelectedFeaturesState] = useState(() => {
    try {
      const saved = localStorage.getItem('fit_health_selected_features');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore JSON parse error
    }
    return ['workout', 'nutrition', 'gyms'];
  });

  const setSelectedFeatures = useCallback((features) => {
    const valid = Array.isArray(features) && features.length > 0 ? features : ['workout', 'nutrition', 'gyms'];
    setSelectedFeaturesState(valid);
    try {
      localStorage.setItem('fit_health_selected_features', JSON.stringify(valid));
    } catch (e) {}
  }, []);

  const toggleFeatureSelection = useCallback((featureId) => {
    setSelectedFeaturesState(prev => {
      let updated;
      if (prev.includes(featureId)) {
        if (prev.length <= 1) {
          // Keep at least 1 feature active
          return prev;
        }
        updated = prev.filter(f => f !== featureId);
      } else {
        updated = [...prev, featureId];
      }
      try {
        localStorage.setItem('fit_health_selected_features', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const isFeatureSelected = useCallback((featureId) => {
    return selectedFeatures.includes(featureId);
  }, [selectedFeatures]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const navigateToAdminSection = useCallback((subSection = 'members') => {
    setAdminSubTab(subSection);
    setActiveTab('admin');
  }, []);

  return (
    <FitnessContext.Provider value={{
      activeTab,
      setActiveTab,
      adminSubTab,
      setAdminSubTab,
      navigateToAdminSection,
      selectedFeatures,
      setSelectedFeatures,
      toggleFeatureSelection,
      isFeatureSelected,
      toasts,
      showToast,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);
