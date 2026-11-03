const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  targetMuscle: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  weight: { type: String, default: 'Bodyweight' },
  restTime: { type: Number, default: 60 }, // in seconds
  instructions: { type: String, default: '' },
  completed: { type: Boolean, default: false }
});

const WorkoutDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dayName: { type: String, required: true },
  focus: { type: String, default: '' },
  exercises: [ExerciseSchema]
});

const WorkoutHistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  dayName: { type: String, required: true },
  durationMinutes: { type: Number, default: 45 },
  exercisesCompleted: { type: Number, default: 0 },
  totalVolumeKg: { type: Number, default: 0 }
});

const WorkoutPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  goal: { type: String, enum: ['Bulking', 'Cutting', 'Maintenance', 'General fitness'], default: 'Bulking' },
  splitName: { type: String, default: '6-Day Split Workout Plan' },
  activeDayIndex: { type: Number, default: 0 },
  days: [WorkoutDaySchema],
  history: [WorkoutHistorySchema]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', WorkoutPlanSchema);
