const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  weightKg: { type: Number, required: true },
  chestCm: { type: Number, default: null },
  armsCm: { type: Number, default: null },
  waistCm: { type: Number, default: null },
  thighsCm: { type: Number, default: null },
  benchPressKg: { type: Number, default: null },
  squatKg: { type: Number, default: null },
  deadliftKg: { type: Number, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
