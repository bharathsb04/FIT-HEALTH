const db = require('../data/dbStorage');
const { stretchingGuide } = require('../data/seedData');

exports.getRecovery = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    const user = db.findById('users', req.userId);

    const vitals = db.findOne('vitalsLogs', v => v.userId === req.userId && v.date === today) || {
      sleepHours: 7.5,
      sleepTargetHours: 8.0,
      heartRateBpm: 68,
      restingHeartRate: 60,
      recoveryScore: 84
    };

    const hydration = db.findOne('hydrationLogs', h => h.userId === req.userId && h.date === today) || {
      consumedLiters: 2.0,
      targetLiters: 3.5
    };

    const workoutPlan = db.findOne('workoutPlans', p => p.userId === req.userId);
    const activeWorkout = workoutPlan?.days[workoutPlan.activeDayIndex] || null;

    // Stretching state
    let stretches = db.data.stretchingState?.stretches || stretchingGuide;

    // Sleep Calculator helper: Calculate optimal bedtimes based on 90-min cycles (5 cycles = 7.5 hrs, 6 cycles = 9 hrs + 15m to fall asleep)
    const wakeUpTimes = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM'];
    const sleepCalculator = wakeUpTimes.map(wake => {
      return {
        wakeTime: wake,
        bedtimes: ['09:45 PM (6 cycles - 9.0 hrs)', '11:15 PM (5 cycles - 7.5 hrs)', '12:45 AM (4 cycles - 6.0 hrs)']
      };
    });

    // Smart recovery suggestions based on sleep, hydration, and vitals
    const suggestions = [];
    if (vitals.sleepHours < 7.0) {
      suggestions.push('Sleep deficit detected: Aim for a 20-minute power nap or an earlier bedtime tonight to reduce cortisol.');
    } else {
      suggestions.push('Optimal sleep duration: Your central nervous system has refreshed sufficiently for high-intensity lifting.');
    }

    if (hydration.consumedLiters < (hydration.targetLiters * 0.6)) {
      suggestions.push('Electrolytes & Fluid: Drink 500ml of water with a pinch of pink salt before lifting to prevent cramping.');
    }

    suggestions.push('Post-workout contrast shower: 3 mins warm / 1 min cool to boost peripheral blood circulation.');
    suggestions.push('Spine decompression: Perform 2 sets of 45-second dead hangs to decompress lumbar discs.');

    return res.status(200).json({
      success: true,
      recoveryScore: vitals.recoveryScore || 85,
      readinessStatus: vitals.recoveryScore >= 80 ? 'Optimal Readiness — Ready to crush today\'s heavy sets!' : 'Moderate Readiness — Focus on form and controlled pacing.',
      sleep: {
        durationHours: vitals.sleepHours,
        targetHours: user?.sleepTargetHours || 8.0,
        quality: vitals.sleepHours >= 7.5 ? 'Excellent' : 'Fair',
        history: [
          { day: 'Mon', hours: 7.2 },
          { day: 'Tue', hours: 6.8 },
          { day: 'Wed', hours: 8.1 },
          { day: 'Thu', hours: 7.5 },
          { day: 'Fri', hours: 7.8 },
          { day: 'Sat', hours: 8.5 },
          { day: 'Sun', hours: vitals.sleepHours }
        ]
      },
      vitalsSummary: {
        restingHeartRate: vitals.restingHeartRate || 60,
        currentBpm: vitals.heartRateBpm || 70,
        hydrationConsumed: hydration.consumedLiters,
        hydrationTarget: hydration.targetLiters
      },
      todayWorkoutFocus: activeWorkout ? activeWorkout.dayName : 'Rest & Recovery',
      suggestions,
      sleepCalculator,
      stretchingGuide: stretches
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleStretching = async (req, res) => {
  try {
    const { stretchId } = req.body;
    let stretches = db.data.stretchingState?.stretches || stretchingGuide;

    const stretch = stretches.find(s => s.id === stretchId);
    if (!stretch) {
      return res.status(404).json({ success: false, message: 'Stretch exercise not found.' });
    }

    stretch.completed = !stretch.completed;
    db.data.stretchingState = {
      userId: req.userId,
      stretches,
      lastUpdated: new Date().toISOString()
    };
    db.save();

    return res.status(200).json({
      success: true,
      message: `Updated completion status for "${stretch.name}".`,
      stretch,
      stretches
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
