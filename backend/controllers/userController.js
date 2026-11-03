const db = require('../data/dbStorage');
const { calculateMacroTargets } = require('./authController');

exports.getProfile = async (req, res) => {
  try {
    const user = db.findById('users', req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = db.findById('users', req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      age,
      gender,
      height,
      weight,
      targetWeight,
      fitnessLevel,
      primaryGoal,
      activityLevel,
      dietaryPreference,
      workoutExperience,
      settings
    } = req.body;

    const updatedWeight = weight !== undefined ? Number(weight) : user.weight;
    const updatedHeight = height !== undefined ? Number(height) : user.height;
    const updatedAge = age !== undefined ? Number(age) : user.age;
    const updatedGender = gender || user.gender;
    const updatedGoal = primaryGoal || user.primaryGoal;
    const updatedActivity = activityLevel || user.activityLevel;

    // Recalculate macros if biometrics or goal changed
    const { targetCalories, targetProtein, targetCarbs, targetFat } = calculateMacroTargets(
      updatedWeight,
      updatedHeight,
      updatedAge,
      updatedGender,
      updatedGoal,
      updatedActivity
    );

    const updates = {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(age !== undefined && { age: Number(age) }),
      ...(gender && { gender }),
      ...(height !== undefined && { height: Number(height) }),
      ...(weight !== undefined && { weight: Number(weight) }),
      ...(targetWeight !== undefined && { targetWeight: Number(targetWeight) }),
      ...(fitnessLevel && { fitnessLevel }),
      ...(primaryGoal && { primaryGoal }),
      ...(activityLevel && { activityLevel }),
      ...(dietaryPreference && { dietaryPreference }),
      ...(workoutExperience && { workoutExperience }),
      ...(settings && { settings: { ...user.settings, ...settings } }),
      ...(req.body.gymId !== undefined && { gymId: req.body.gymId }),
      ...(req.body.gymName !== undefined && { gymName: req.body.gymName }),
      ...(req.body.gymBranch !== undefined && { gymBranch: req.body.gymBranch }),
      ...(req.body.membershipId !== undefined && { membershipId: req.body.membershipId }),
      ...(req.body.membershipStatus !== undefined && { membershipStatus: req.body.membershipStatus }),
      ...(req.body.membershipPlan !== undefined && { membershipPlan: req.body.membershipPlan }),
      ...(req.body.membershipTier !== undefined && { membershipTier: req.body.membershipTier }),
      ...(req.body.assignedTrainer !== undefined && { assignedTrainer: req.body.assignedTrainer }),
      ...(req.body.membershipExpiry !== undefined && { membershipExpiry: req.body.membershipExpiry }),
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    };

    const updated = db.update('users', req.userId, updates);

    // If membership was added/updated to Active, sync with gymMembers roster
    if (req.body.membershipStatus === 'Active' && (req.body.membershipId || user.membershipId)) {
      const memId = req.body.membershipId || user.membershipId || `FH-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      const existingRosterMember = db.findOne('gymMembers', m => m.email?.toLowerCase() === user.email.toLowerCase() || m.membershipId === memId);
      const memberData = {
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '+91 98765 00000',
        plan: req.body.membershipPlan || 'Elite Gold Annual',
        tier: req.body.membershipTier || 'Gold',
        membershipId: memId,
        checkInPin: memId.replace(/\D/g, '').slice(-4) || '1234',
        assignedTrainer: req.body.assignedTrainer || 'Coach Marcus Vance',
        status: 'Active',
        gymId: req.body.gymId || 'gym_1',
        gymName: req.body.gymName || 'RSV Gym and Sports Club',
        joinDate: new Date().toISOString().split('T')[0],
        expiryDate: req.body.membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      if (existingRosterMember) {
        db.update('gymMembers', existingRosterMember.id, memberData);
      } else {
        db.create('gymMembers', { id: `mem_${Date.now()}`, ...memberData });
      }
    } else if (req.body.membershipStatus === 'None') {
      const existingRosterMember = db.findOne('gymMembers', m => m.email?.toLowerCase() === user.email.toLowerCase());
      if (existingRosterMember) {
        db.update('gymMembers', existingRosterMember.id, { status: 'Expired' });
      }
    }
    const { password: _, ...safeUser } = updated;

    return res.status(200).json({
      success: true,
      message: 'Profile and personalized fitness targets successfully updated.',
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
