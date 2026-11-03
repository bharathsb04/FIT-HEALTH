const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  age: { type: Number, default: 25 },
  gender: { type: String, enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'], default: 'Male' },
  height: { type: Number, default: 175 }, // in cm
  weight: { type: Number, default: 75 }, // in kg
  targetWeight: { type: Number, default: 80 }, // in kg
  fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Athlete'], default: 'Intermediate' },
  primaryGoal: { type: String, enum: ['Bulking', 'Cutting', 'Maintenance', 'General fitness'], default: 'Bulking' },
  activityLevel: { type: String, default: 'Moderately Active (3-5 days/week)' },
  dietaryPreference: { type: String, default: 'High Protein' },
  workoutExperience: { type: String, default: '1-2 Years' },
  targetCalories: { type: Number, default: 2800 },
  targetProtein: { type: Number, default: 160 },
  targetCarbs: { type: Number, default: 320 },
  targetFat: { type: Number, default: 75 },
  waterTargetLiters: { type: Number, default: 3.5 },
  sleepTargetHours: { type: Number, default: 8.0 },
  streak: { type: Number, default: 1 },
  avatarUrl: { type: String, default: '' },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  membershipId: { type: String, default: '' },
  membershipStatus: { type: String, enum: ['None', 'Active', 'Pending', 'Expired', 'Frozen'], default: 'None' },
  membershipPlan: { type: String, default: '' },
  gymId: { type: String, default: null },
  gymName: { type: String, default: '' },
  gymBranch: { type: String, default: '' },
  adminBadge: { type: String, default: '' },
  settings: {
    notifications: { type: Boolean, default: true },
    wearableSync: { type: Boolean, default: true },
    unitSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' }
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
