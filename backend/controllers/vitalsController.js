const db = require('../data/dbStorage');

exports.getVitals = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    let vitals = db.findOne('vitalsLogs', v => v.userId === req.userId && v.date === today);

    if (!vitals) {
      vitals = db.create('vitalsLogs', {
        userId: req.userId,
        date: today,
        heartRateBpm: 72,
        restingHeartRate: 62,
        maxHeartRate: 156,
        steps: 3200,
        stepGoal: 10000,
        activeCaloriesBurned: 240,
        sleepHours: 7.2,
        sleepTargetHours: 8.0,
        recoveryScore: 82,
        syncSource: 'Manual',
        isWearableConnected: false,
        wearableDevice: 'None',
        lastSyncTimestamp: new Date().toISOString(),
        cardioZones: {
          warmUpMinutes: 15,
          fatBurnMinutes: 20,
          cardioMinutes: 10,
          peakMinutes: 5
        }
      });
    }

    // Historical 7-day trend
    const allUserVitals = db.find('vitalsLogs', v => v.userId === req.userId);

    // Mock live heart rate pulse stream (fluctuates realistic +/- 3 bpm if wearable connected)
    const simulatedBpm = vitals.isWearableConnected
      ? vitals.heartRateBpm + Math.floor(Math.random() * 7 - 3)
      : vitals.heartRateBpm;

    return res.status(200).json({
      success: true,
      vitals: {
        ...vitals,
        liveBpm: simulatedBpm
      },
      history: allUserVitals.slice(-7)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logVitals = async (req, res) => {
  try {
    const today = req.body.date || new Date().toISOString().split('T')[0];
    const {
      heartRateBpm,
      restingHeartRate,
      steps,
      stepGoal,
      activeCaloriesBurned,
      sleepHours,
      recoveryScore,
      cardioZones
    } = req.body;

    let vitals = db.findOne('vitalsLogs', v => v.userId === req.userId && v.date === today);

    const updates = {
      ...(heartRateBpm !== undefined && { heartRateBpm: Number(heartRateBpm) }),
      ...(restingHeartRate !== undefined && { restingHeartRate: Number(restingHeartRate) }),
      ...(steps !== undefined && { steps: Number(steps) }),
      ...(stepGoal !== undefined && { stepGoal: Number(stepGoal) }),
      ...(activeCaloriesBurned !== undefined && { activeCaloriesBurned: Number(activeCaloriesBurned) }),
      ...(sleepHours !== undefined && { sleepHours: Number(sleepHours) }),
      ...(recoveryScore !== undefined && { recoveryScore: Number(recoveryScore) }),
      ...(cardioZones && { cardioZones }),
      lastSyncTimestamp: new Date().toISOString()
    };

    if (vitals) {
      vitals = db.update('vitalsLogs', vitals.id, updates);
    } else {
      vitals = db.create('vitalsLogs', {
        userId: req.userId,
        date: today,
        ...updates
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vitals recorded successfully.',
      vitals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncWearable = async (req, res) => {
  try {
    const { deviceType = 'Google Fit', action = 'connect' } = req.body;
    const today = new Date().toISOString().split('T')[0];
    let vitals = db.findOne('vitalsLogs', v => v.userId === req.userId && v.date === today);

    if (action === 'disconnect') {
      if (vitals) {
        vitals = db.update('vitalsLogs', vitals.id, {
          isWearableConnected: false,
          wearableDevice: 'Disconnected',
          syncSource: 'Manual',
          lastSyncTimestamp: new Date().toISOString()
        });
      }
      return res.status(200).json({
        success: true,
        message: `${deviceType} has been disconnected.`,
        vitals
      });
    }

    // Connect & Synchronize realistic wearable metrics
    const syncedSteps = Math.floor(7500 + Math.random() * 2500);
    const syncedBpm = Math.floor(64 + Math.random() * 12);
    const syncedSleep = parseFloat((7.2 + Math.random() * 1.2).toFixed(1));
    const syncedCalories = Math.floor(450 + Math.random() * 220);
    const recoveryScore = Math.min(98, Math.max(65, Math.floor(75 + (syncedSleep - 7) * 10)));

    const updates = {
      isWearableConnected: true,
      wearableDevice: deviceType,
      syncSource: deviceType,
      steps: syncedSteps,
      heartRateBpm: syncedBpm,
      restingHeartRate: 59,
      maxHeartRate: 158,
      sleepHours: syncedSleep,
      activeCaloriesBurned: syncedCalories,
      recoveryScore,
      cardioZones: {
        warmUpMinutes: 22,
        fatBurnMinutes: 38,
        cardioMinutes: 28,
        peakMinutes: 14
      },
      lastSyncTimestamp: new Date().toISOString()
    };

    if (vitals) {
      vitals = db.update('vitalsLogs', vitals.id, updates);
    } else {
      vitals = db.create('vitalsLogs', {
        userId: req.userId,
        date: today,
        ...updates
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized with ${deviceType} cloud health API!`,
      vitals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
