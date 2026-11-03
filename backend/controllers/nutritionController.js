const db = require('../data/dbStorage');

exports.getNutrition = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    let dietLog = db.findOne('dietPlans', d => d.userId === req.userId && d.date === today);

    if (!dietLog) {
      dietLog = db.create('dietPlans', {
        userId: req.userId,
        date: today,
        meals: []
      });
    }

    const user = db.findById('users', req.userId);
    const targetCalories = user?.targetCalories || 2800;
    const targetProtein = user?.targetProtein || 160;
    const targetCarbs = user?.targetCarbs || 320;
    const targetFat = user?.targetFat || 75;

    // Calculate totals consumed
    const meals = dietLog.meals || [];
    const totals = meals.reduce((acc, m) => {
      acc.calories += Number(m.calories) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fat += Number(m.fat) || 0;
      acc.fiber += Number(m.fiber) || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    // Group meals by category
    const categorizedMeals = {
      Breakfast: meals.filter(m => m.category === 'Breakfast'),
      Lunch: meals.filter(m => m.category === 'Lunch'),
      Dinner: meals.filter(m => m.category === 'Dinner'),
      Snacks: meals.filter(m => m.category === 'Snacks')
    };

    return res.status(200).json({
      success: true,
      date: today,
      targets: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat
      },
      consumed: totals,
      remaining: {
        calories: Math.max(0, targetCalories - totals.calories),
        protein: Math.max(0, targetProtein - totals.protein),
        carbs: Math.max(0, targetCarbs - totals.carbs),
        fat: Math.max(0, targetFat - totals.fat)
      },
      percentage: {
        calories: Math.min(100, Math.round((totals.calories / targetCalories) * 100)),
        protein: Math.min(100, Math.round((totals.protein / targetProtein) * 100)),
        carbs: Math.min(100, Math.round((totals.carbs / targetCarbs) * 100)),
        fat: Math.min(100, Math.round((totals.fat / targetFat) * 100))
      },
      categorizedMeals,
      allMeals: meals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMeal = async (req, res) => {
  try {
    const { category, name, calories, protein, carbs, fat, fiber = 0, date } = req.body;

    if (!category || !name || calories === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Meal category (Breakfast/Lunch/Dinner/Snacks), food name, and calories are required.'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    let dietLog = db.findOne('dietPlans', d => d.userId === req.userId && d.date === targetDate);

    if (!dietLog) {
      dietLog = db.create('dietPlans', {
        userId: req.userId,
        date: targetDate,
        meals: []
      });
    }

    const newMeal = {
      id: `meal_${Date.now()}`,
      category,
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    dietLog.meals.push(newMeal);
    db.update('dietPlans', dietLog.id, { meals: dietLog.meals });

    return res.status(201).json({
      success: true,
      message: `${name} logged under ${category}.`,
      meal: newMeal
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, calories, protein, carbs, fat, fiber } = req.body;
    const today = req.query.date || new Date().toISOString().split('T')[0];

    const dietLog = db.findOne('dietPlans', d => d.userId === req.userId && d.date === today);
    if (!dietLog) {
      return res.status(404).json({ success: false, message: 'Diet log not found for this date.' });
    }

    const mealIndex = dietLog.meals.findIndex(m => m.id === id);
    if (mealIndex === -1) {
      return res.status(404).json({ success: false, message: 'Meal entry not found.' });
    }

    dietLog.meals[mealIndex] = {
      ...dietLog.meals[mealIndex],
      ...(category && { category }),
      ...(name && { name }),
      ...(calories !== undefined && { calories: Number(calories) }),
      ...(protein !== undefined && { protein: Number(protein) }),
      ...(carbs !== undefined && { carbs: Number(carbs) }),
      ...(fat !== undefined && { fat: Number(fat) }),
      ...(fiber !== undefined && { fiber: Number(fiber) })
    };

    db.update('dietPlans', dietLog.id, { meals: dietLog.meals });

    return res.status(200).json({
      success: true,
      message: 'Meal updated successfully.',
      meal: dietLog.meals[mealIndex]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const today = req.query.date || new Date().toISOString().split('T')[0];

    const dietLog = db.findOne('dietPlans', d => d.userId === req.userId && d.date === today);
    if (!dietLog) {
      return res.status(404).json({ success: false, message: 'Diet log not found.' });
    }

    dietLog.meals = dietLog.meals.filter(m => m.id !== id);
    db.update('dietPlans', dietLog.id, { meals: dietLog.meals });

    return res.status(200).json({
      success: true,
      message: 'Meal entry deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchFoods = async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    const foodItems = db.getCollection('foodItems');

    const results = foodItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );

    return res.status(200).json({
      success: true,
      count: results.length,
      foods: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
