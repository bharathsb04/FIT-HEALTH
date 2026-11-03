import React from 'react';
import { useFitness } from '../contexts/FitnessContext';
import { useAuth } from '../contexts/AuthContext';
import { Home, Dumbbell, Utensils, MapPin, Activity, ShieldCheck, Wrench, BookOpen, Banknote } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, adminSubTab, navigateToAdminSection, selectedFeatures } = useFitness();
  const { user } = useAuth();

  const isWorkoutActive = selectedFeatures?.includes('workout');
  const isNutritionActive = selectedFeatures?.includes('nutrition');
  const isGymsActive = selectedFeatures?.includes('gyms');

  const allMemberNavItems = [
    { key: 'dashboard', label: 'Home', icon: Home, interface: 'core' },
    { key: 'workout', label: 'Workout', icon: Dumbbell, interface: 'workout' },
    { key: 'nutrition', label: 'Nutrition', icon: Utensils, interface: 'nutrition' },
    { key: 'gyms', label: 'Gyms', icon: MapPin, interface: 'gyms' },
    { key: 'vitals', label: 'Vitals', icon: Activity, interface: 'nutrition' }
  ];

  const memberNavItems = allMemberNavItems.filter(item => {
    if (item.interface === 'core') return true;
    if (item.interface === 'workout') return isWorkoutActive;
    if (item.interface === 'nutrition') return isNutritionActive;
    if (item.interface === 'gyms') return isGymsActive;
    return true;
  });

  const navItems = user?.role === 'admin'
    ? [
        { key: 'admin-overview', label: 'Overview', icon: ShieldCheck, adminTarget: 'members' },
        { key: 'admin-maintenance', label: 'Maintenance', icon: Wrench, adminTarget: 'equipment' },
        { key: 'admin-notes', label: 'Notes', icon: BookOpen, adminTarget: 'notes' },
        { key: 'admin-fees', label: 'Fees', icon: Banknote, adminTarget: 'fees' },
        { key: 'gyms', label: 'Gyms', icon: MapPin }
      ]
    : memberNavItems;

  const handleNavClick = (item) => {
    if (item.adminTarget) {
      navigateToAdminSection(item.adminTarget);
    } else {
      setActiveTab(item.key);
    }
  };

  const isItemActive = (item) => {
    if (user?.role === 'admin') {
      if (item.adminTarget) {
        if (activeTab === 'admin' || activeTab === 'dashboard') {
          if (item.adminTarget === 'equipment') {
            return adminSubTab === 'equipment' || adminSubTab === 'directory';
          }
          return adminSubTab === item.adminTarget;
        }
        return false;
      }
      return activeTab === item.key;
    }
    return activeTab === item.key;
  };

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = isItemActive(item);
        return (
          <button
            key={item.key}
            id={`nav-btn-${item.key}`}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
