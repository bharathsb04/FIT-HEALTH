const mongoose = require('mongoose');

const CardioZonesSchema = new mongoose.Schema({
  warmUpMinutes: { type: Number, default: 0 },
  fatBurnMinutes: { type: Number, default: 0 },
  cardioMinutes: { type: Number, default: 0 },
  peakMinutes: { type: Number, default: 0 }
});

const VitalsLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  heartRateBpm: { type: Number, default: 72 },
  restingHeartRate: { type: Number, default: 60 },
  maxHeartRate: { type: Number, default: 160 },
  steps: { type: Number, default: 0 },
  stepGoal: { type: Number, default: 10000 },
  activeCaloriesBurned: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 7.5 },
  sleepTargetHours: { type: Number, default: 8.0 },
  recoveryScore: { type: Number, default: 85 }, // 0 - 100
  syncSource: { type: String, default: 'Manual Entry' },
  isWearableConnected: { type: Boolean, default: false },
  wearableDevice: { type: String, default: 'None' },
  lastSyncTimestamp: { type: Date, default: Date.now },
  cardioZones: CardioZonesSchema
}, { timestamps: true });

module.exports = mongoose.models.VitalsLog || mongoose.model('VitalsLog', VitalsLogSchema);
