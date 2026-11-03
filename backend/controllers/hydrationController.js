const db = require('../data/dbStorage');

exports.getHydration = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    let hydration = db.findOne('hydrationLogs', h => h.userId === req.userId && h.date === today);

    const user = db.findById('users', req.userId);
    const targetLiters = user?.waterTargetLiters || 3.5;

    if (!hydration) {
      hydration = db.create('hydrationLogs', {
        userId: req.userId,
        date: today,
        consumedLiters: 0,
        targetLiters,
        logs: []
      });
    }

    const remainingLiters = Math.max(0, parseFloat((targetLiters - hydration.consumedLiters).toFixed(2)));
    const percentage = Math.min(100, Math.round((hydration.consumedLiters / targetLiters) * 100));

    // Smart friendly reminder message
    let reminder = 'Stay refreshed! Optimal hydration accelerates muscle recovery.';
    if (percentage < 30) reminder = 'Morning hydration boost: Drink 500ml to kickstart your metabolism.';
    else if (percentage < 70) reminder = 'Great progress! Keep sipping water before your workout session.';
    else if (percentage < 100) reminder = 'Almost at your daily goal! A couple more glasses to reach 100%.';
    else reminder = 'Hydration target accomplished! Excellent job maintaining fluid balance.';

    return res.status(200).json({
      success: true,
      date: today,
      targetLiters,
      consumedLiters: parseFloat(hydration.consumedLiters.toFixed(2)),
      remainingLiters,
      percentage,
      reminder,
      logs: hydration.logs || []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logHydration = async (req, res) => {
  try {
    const today = req.body.date || new Date().toISOString().split('T')[0];
    const { amountMl, action = 'add' } = req.body; // e.g. 250, 500, 750, 1000

    let hydration = db.findOne('hydrationLogs', h => h.userId === req.userId && h.date === today);
    const user = db.findById('users', req.userId);
    const targetLiters = user?.waterTargetLiters || 3.5;

    if (!hydration) {
      hydration = db.create('hydrationLogs', {
        userId: req.userId,
        date: today,
        consumedLiters: 0,
        targetLiters,
        logs: []
      });
    }

    if (action === 'reset') {
      hydration = db.update('hydrationLogs', hydration.id, {
        consumedLiters: 0,
        logs: []
      });
      return res.status(200).json({
        success: true,
        message: 'Hydration reset for today.',
        hydration
      });
    }

    const additionLiters = (Number(amountMl) || 250) / 1000;
    const newTotal = parseFloat((hydration.consumedLiters + additionLiters).toFixed(2));
    const newLogEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amountMl: Number(amountMl) || 250
    };

    hydration.logs.unshift(newLogEntry);
    hydration = db.update('hydrationLogs', hydration.id, {
      consumedLiters: newTotal,
      logs: hydration.logs
    });

    const remainingLiters = Math.max(0, parseFloat((targetLiters - newTotal).toFixed(2)));
    const percentage = Math.min(100, Math.round((newTotal / targetLiters) * 100));

    return res.status(200).json({
      success: true,
      message: `Added ${amountMl} ml of water!`,
      targetLiters,
      consumedLiters: newTotal,
      remainingLiters,
      percentage,
      logs: hydration.logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
