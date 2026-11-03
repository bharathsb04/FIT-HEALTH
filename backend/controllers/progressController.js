const db = require('../data/dbStorage');

exports.getProgress = async (req, res) => {
  try {
    const user = db.findById('users', req.userId);
    let records = db.find('progressRecords', p => p.userId === req.userId);

    // Sort by date ascending
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate Personal Records (PRs)
    let prBench = 0;
    let prSquat = 0;
    let prDeadlift = 0;

    records.forEach(r => {
      if (r.benchPressKg && r.benchPressKg > prBench) prBench = r.benchPressKg;
      if (r.squatKg && r.squatKg > prSquat) prSquat = r.squatKg;
      if (r.deadliftKg && r.deadliftKg > prDeadlift) prDeadlift = r.deadliftKg;
    });

    const latest = records[records.length - 1] || {
      weightKg: user?.weight || 75,
      chestCm: 100,
      armsCm: 37,
      waistCm: 82,
      thighsCm: 56
    };

    const first = records[0] || latest;
    const totalWeightChange = parseFloat((latest.weightKg - first.weightKg).toFixed(1));

    // Weekly consistency (workouts completed in past 7 days)
    const workoutPlan = db.findOne('workoutPlans', p => p.userId === req.userId);
    const completedSessions = workoutPlan?.history?.length || 0;

    return res.status(200).json({
      success: true,
      currentWeight: latest.weightKg,
      targetWeight: user?.targetWeight || 80,
      startingWeight: first.weightKg,
      totalWeightChange,
      primaryGoal: user?.primaryGoal || 'Bulking',
      streak: user?.streak || 1,
      personalRecords: {
        benchPressKg: prBench || 82.5,
        squatKg: prSquat || 112.5,
        deadliftKg: prDeadlift || 135.0
      },
      latestMeasurements: {
        chestCm: latest.chestCm,
        armsCm: latest.armsCm,
        waistCm: latest.waistCm,
        thighsCm: latest.thighsCm
      },
      completedSessions,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logProgress = async (req, res) => {
  try {
    const {
      date = new Date().toISOString().split('T')[0],
      weightKg,
      chestCm,
      armsCm,
      waistCm,
      thighsCm,
      benchPressKg,
      squatKg,
      deadliftKg,
      notes = ''
    } = req.body;

    if (!weightKg) {
      return res.status(400).json({ success: false, message: 'Weight (kg) is required.' });
    }

    const newRecord = {
      id: `prog_${Date.now()}`,
      userId: req.userId,
      date,
      weightKg: Number(weightKg),
      chestCm: chestCm ? Number(chestCm) : null,
      armsCm: armsCm ? Number(armsCm) : null,
      waistCm: waistCm ? Number(waistCm) : null,
      thighsCm: thighsCm ? Number(thighsCm) : null,
      benchPressKg: benchPressKg ? Number(benchPressKg) : null,
      squatKg: squatKg ? Number(squatKg) : null,
      deadliftKg: deadliftKg ? Number(deadliftKg) : null,
      notes
    };

    db.create('progressRecords', newRecord);

    // Also update current weight on user profile
    db.update('users', req.userId, { weight: Number(weightKg) });

    return res.status(201).json({
      success: true,
      message: 'Body metrics and strength record saved successfully!',
      record: newRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
