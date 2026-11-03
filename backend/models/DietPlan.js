const mongoose = require('mongoose');

const MealItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'], required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }, // in grams
  carbs: { type: Number, required: true }, // in grams
  fat: { type: Number, required: true }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
  loggedAt: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
});

const DietPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  meals: [MealItemSchema]
}, { timestamps: true });

module.exports = mongoose.models.DietPlan || mongoose.model('DietPlan', DietPlanSchema);
