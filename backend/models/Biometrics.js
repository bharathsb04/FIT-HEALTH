const mongoose = require('mongoose');

const BiometricRecordSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'steps',
      'heart_rate',
      'resting_heart_rate',
      'weight',
      'height',
      'body_fat',
      'sleep',
      'active_calories',
      'total_calories',
      'distance',
      'oxygen_saturation',
      'blood_pressure',
      'exercise'
    ],
    index: true
  },
  valueEncrypted: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  sourceApp: {
    type: String,
    default: 'Samsung Health (Health Connect)'
  },
  recordId: {
    type: String,
    required: true,
    index: true
  },
  syncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique compound index preventing duplicate uploads of the same Health Connect record for a member
BiometricRecordSchema.index({ memberId: 1, recordId: 1 }, { unique: true });

module.exports = mongoose.model('Biometrics', BiometricRecordSchema);

