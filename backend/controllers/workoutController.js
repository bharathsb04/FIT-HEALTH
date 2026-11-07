const db = require('../data/dbStorage');
const { defaultSplitWorkouts } = require('../data/seedData');
const workoutLibrary = require('../data/workoutLibrary.json');

exports.getWorkoutLibrary = async (req, res) => {
  try {
    const { level, muscle } = req.query;
    if (level && workoutLibrary[level.toLowerCase()]) {
      let list = workoutLibrary[level.toLowerCase()];
      if (muscle && muscle !== 'All') {
        list = list.filter(ex => ex.targetMuscle.toLowerCase() === muscle.toLowerCase());
      }
      return res.status(200).json({ success: true, count: list.length, exercises: list });
    }
    return res.status(200).json({ success: true, library: workoutLibrary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);

    // If no plan exists yet, create default plan for user
    if (!plan) {
      const user = db.findById('users', req.userId);
      const goal = user?.primaryGoal || 'Bulking';
      const days = defaultSplitWorkouts[goal.toLowerCase()] || defaultSplitWorkouts.bulking;

      plan = db.create('workoutPlans', {
        userId: req.userId,
        goal,
        splitName: `6-Day ${goal} Split`,
        activeDayIndex: 0,
        days: JSON.parse(JSON.stringify(days)),
        history: []
      });
    }

    return res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const { dayIndex = 0, exercise } = req.body;
    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found for user.' });
    }

    if (!exercise || !exercise.name) {
      return res.status(400).json({ success: false, message: 'Exercise name is required.' });
    }

    const newExercise = {
      id: `ex_${Date.now()}`,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle || 'General',
      sets: Number(exercise.sets) || 3,
      reps: exercise.reps || '10-12',
      weight: exercise.weight || '20 kg',
      restTime: Number(exercise.restTime) || 60,
      instructions: exercise.instructions || 'Perform with controlled form.',
      completed: false
    };

    if (plan.days[dayIndex]) {
      plan.days[dayIndex].exercises.push(newExercise);
      db.update('workoutPlans', plan.id, { days: plan.days });
    }

    return res.status(201).json({
      success: true,
      message: 'Exercise added to workout day.',
      exercise: newExercise,
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const { id } = req.params; // Exercise id or plan day
    const { dayIndex, completed, weight, reps, sets } = req.body;
    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    let updatedExercise = null;
    plan.days.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.id === id) {
          if (completed !== undefined) ex.completed = completed;
          if (weight !== undefined) ex.weight = weight;
          if (reps !== undefined) ex.reps = reps;
          if (sets !== undefined) ex.sets = Number(sets);
          updatedExercise = ex;
        }
      });
    });

    if (dayIndex !== undefined && dayIndex >= 0 && dayIndex < plan.days.length) {
      plan.activeDayIndex = dayIndex;
    }

    db.update('workoutPlans', plan.id, { days: plan.days, activeDayIndex: plan.activeDayIndex });

    return res.status(200).json({
      success: true,
      message: 'Workout updated.',
      exercise: updatedExercise,
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params; // Exercise ID to remove
    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    plan.days.forEach(day => {
      day.exercises = day.exercises.filter(ex => ex.id !== id);
    });

    db.update('workoutPlans', plan.id, { days: plan.days });

    return res.status(200).json({
      success: true,
      message: 'Exercise deleted from workout routine.',
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeWorkout = async (req, res) => {
  try {
    const { dayIndex = 0, durationMinutes = 55 } = req.body;
    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const currentDay = plan.days[dayIndex] || plan.days[0];
    const completedCount = currentDay.exercises.filter(e => e.completed).length;

    // Estimate volume
    let totalVolume = 0;
    currentDay.exercises.forEach(ex => {
      const wMatch = (ex.weight || '').match(/\d+/);
      const rMatch = (ex.reps || '').match(/\d+/);
      const w = wMatch ? Number(wMatch[0]) : 20;
      const r = rMatch ? Number(rMatch[0]) : 10;
      totalVolume += (ex.sets || 3) * r * w;
    });

    const historyRecord = {
      date: new Date().toISOString().split('T')[0],
      dayName: currentDay.dayName,
      durationMinutes: Number(durationMinutes),
      exercisesCompleted: completedCount,
      totalVolumeKg: totalVolume
    };

    plan.history.unshift(historyRecord);

    // Advance to next day split
    const nextDayIndex = (dayIndex + 1) % plan.days.length;
    plan.activeDayIndex = nextDayIndex;

    // Reset completion checkboxes for fresh session next time
    currentDay.exercises.forEach(e => e.completed = false);

    db.update('workoutPlans', plan.id, {
      days: plan.days,
      history: plan.history,
      activeDayIndex: nextDayIndex
    });

    // Update user streak
    const user = db.findById('users', req.userId);
    if (user) {
      db.update('users', req.userId, { streak: (user.streak || 0) + 1 });
    }

    return res.status(200).json({
      success: true,
      message: `Workout "${currentDay.dayName}" recorded successfully!`,
      session: historyRecord,
      streak: (user?.streak || 0) + 1,
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetSplit = async (req, res) => {
  try {
    const { goal = 'Bulking' } = req.body;
    const baseSplit = defaultSplitWorkouts[goal.toLowerCase()] || defaultSplitWorkouts.bulking;

    let plan = db.findOne('workoutPlans', p => p.userId === req.userId);
    const freshDays = JSON.parse(JSON.stringify(baseSplit));

    if (plan) {
      db.update('workoutPlans', plan.id, {
        goal,
        splitName: `6-Day ${goal} Split`,
        activeDayIndex: 0,
        days: freshDays
      });
      plan = db.findById('workoutPlans', plan.id);
    } else {
      plan = db.create('workoutPlans', {
        userId: req.userId,
        goal,
        splitName: `6-Day ${goal} Split`,
        activeDayIndex: 0,
        days: freshDays,
        history: []
      });
    }

    return res.status(200).json({
      success: true,
      message: `Workout split reset to ${goal} 6-day cycle.`,
      plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
