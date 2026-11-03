import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import { MacroRing } from '../components/MacroRing';
import {
  Plus,
  Search,
  Trash2,
  X,
  Apple,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';

export const NutritionTrackerPage = () => {
  const { showToast, triggerRefresh } = useFitness();
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Meal Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customFood, setCustomFood] = useState({
    name: '',
    category: 'Breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  const fetchNutrition = async () => {
    setLoading(true);
    try {
      const res = await api.getNutrition();
      if (res.success) {
        setNutrition(res);
      }
    } catch (err) {
      showToast('Could not load nutrition details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  // Search food items from DB
  useEffect(() => {
    if (!foodSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.searchFoods(foodSearch);
        if (res.success) {
          setSearchResults(res.foods || []);
        }
      } catch (e) {
        // ignore
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [foodSearch]);

  const handleSelectPredefinedFood = (item) => {
    setCustomFood({
      name: item.name,
      category: activeCategory,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber
    });
    setFoodSearch('');
    setSearchResults([]);
  };

  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    if (!customFood.name || !customFood.calories) {
      showToast('Please enter food name and calories', 'error');
      return;
    }

    try {
      const res = await api.addMeal({
        ...customFood,
        category: activeCategory
      });
      if (res.success) {
        setShowAddModal(false);
        setCustomFood({
          name: '',
          category: 'Breakfast',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: ''
        });
        showToast(`${res.meal.name} logged under ${activeCategory}!`, 'success');
        fetchNutrition();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Error logging food', 'error');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await api.deleteMeal(mealId);
      if (res.success) {
        showToast('Meal removed.', 'info');
        fetchNutrition();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete meal', 'error');
    }
  };

  const categories = [
    { key: 'Breakfast', label: 'Breakfast', icon: Coffee, color: 'var(--amber)' },
    { key: 'Lunch', label: 'Lunch', icon: Sun, color: 'var(--primary)' },
    { key: 'Dinner', label: 'Dinner', icon: Moon, color: 'var(--indigo)' },
    { key: 'Snacks', label: 'Snacks', icon: Cookie, color: 'var(--cyan)' }
  ];

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Nutrition Tracker" subtitle="Calorie targets, macro breakdown & meal logs" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Responsive 2-Column Grid on Laptops */}
        <div className="laptop-2-cols">
          {/* Left Column: Macro Overview & Quick Nutrition Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Macro Progress Rings Overview Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Daily Macro Budget
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
                    {nutrition?.consumed?.calories?.toLocaleString() || 1490} / {nutrition?.targets?.calories?.toLocaleString() || 2850} kcal
                  </h3>
                </div>
                <span className="badge badge-bulking">
                  {nutrition?.remaining?.calories || 1360} kcal remaining
                </span>
              </div>

              {/* 4 Rings */}
              <div className="grid-4" style={{ margin: '12px 0 16px' }}>
                <MacroRing
                  size={76}
                  strokeWidth={7}
                  percentage={nutrition?.percentage?.calories || 52}
                  color="var(--amber)"
                  label="Calories"
                  value={`${nutrition?.consumed?.calories || 1490}`}
                  sublabel="kcal"
                />
                <MacroRing
                  size={76}
                  strokeWidth={7}
                  percentage={nutrition?.percentage?.protein || 68}
                  color="var(--primary)"
                  label="Protein"
                  value={`${nutrition?.consumed?.protein || 112}g`}
                  sublabel={`/${nutrition?.targets?.protein || 165}g`}
                />
                <MacroRing
                  size={76}
                  strokeWidth={7}
                  percentage={nutrition?.percentage?.carbs || 44}
                  color="var(--cyan)"
                  label="Carbs"
                  value={`${nutrition?.consumed?.carbs || 145}g`}
                  sublabel={`/${nutrition?.targets?.carbs || 340}g`}
                />
                <MacroRing
                  size={76}
                  strokeWidth={7}
                  percentage={nutrition?.percentage?.fat || 58}
                  color="var(--purple)"
                  label="Fat"
                  value={`${nutrition?.consumed?.fat || 48}g`}
                  sublabel={`/${nutrition?.targets?.fat || 75}g`}
                />
              </div>

              {/* Fiber & Ratio strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Dietary Fiber: <b style={{ color: 'var(--text-primary)' }}>{nutrition?.consumed?.fiber || 20} g</b>
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Macro Split: 40% C / 35% P / 25% F
                </span>
              </div>
            </div>

            {/* Quick Food Search & Add Card for Laptops */}
            <div className="card" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>Quick Food Logger</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Instant meal lookup from verified fitness database
              </p>
              <button
                onClick={() => {
                  setActiveCategory('Breakfast');
                  setShowAddModal(true);
                }}
                className="btn btn-primary btn-full"
                style={{ height: '42px', fontSize: '13px' }}
              >
                <Plus size={16} />
                <span>Log Custom Meal or Food Item</span>
              </button>
            </div>
          </div>

          {/* Right Column: Meal Categories Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              const mealsInCat = nutrition?.categorizedMeals?.[cat.key] || [];
              const subtotalCalories = mealsInCat.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
              const subtotalProtein = mealsInCat.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);

              return (
                <div key={cat.key} className="card" style={{ padding: '16px' }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={17} color={cat.color} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{cat.label}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {subtotalCalories} kcal • {subtotalProtein}g protein
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCategory(cat.key);
                        setCustomFood(prev => ({ ...prev, category: cat.key }));
                        setShowAddModal(true);
                      }}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Meals under this category */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mealsInCat.map(meal => (
                      <div
                        key={meal.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px'
                        }}
                      >
                        <div>
                          <h5 style={{ fontWeight: 700 }}>{meal.name}</h5>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{meal.loggedAt}</span>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="icon-btn"
                            style={{ width: '26px', height: '26px', color: 'var(--rose)' }}
                            title="Delete food entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {mealsInCat.length === 0 && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                        No items logged for {cat.label.toLowerCase()} yet.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Food Modal Sheet */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Log Food Entry
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{activeCategory}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Quick Search Food Database */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Search Fit Health Food Database</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chicken breast, Eggs, Salmon, Oats..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>

              {/* Instant Search Suggestions Box */}
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  zIndex: 50,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPredefinedFood(item)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{item.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.servingSize} • P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)' }}>{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddMealSubmit}>
              <div className="form-group">
                <label className="form-label">Food or Recipe Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grilled Chicken & Jasmine Rice"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 520"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 45"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 55"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 14"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fiber (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 6"
                    value={customFood.fiber}
                    onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ height: '48px', fontSize: '15px', marginTop: '12px' }}
              >
                Log Meal to {activeCategory}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
