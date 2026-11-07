const db = require('../data/dbStorage');
const { calculateMacroTargets } = require('./authController');
const { findUserById, updateUser } = require('../services/userService');
const { getFirestore } = require('../config/firebase');

exports.getProfile = async (req, res) => {
  try {
    const user = (await findUserById(req.userId)) || req.user;
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
    const user = (await findUserById(req.userId)) || req.user;
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
    const resolvedGoal = primaryGoal || req.body.goal || req.body.fitnessGoal;
    const updatedGoal = resolvedGoal || user.primaryGoal || user.fitnessGoal || user.goal;
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
      ...(resolvedGoal && { primaryGoal: resolvedGoal, goal: resolvedGoal, fitnessGoal: resolvedGoal }),
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

    const updated = (await updateUser(req.userId, updates)) || db.update('users', req.userId, updates) || { ...user, ...updates };

    // Sync goal and biometrics with gymMembers roster
    try {
      const userEmail = (user.email || updated.email || '').toLowerCase();
      const existingRosterMember = db.findOne('gymMembers', m => 
        (m.email && m.email.toLowerCase() === userEmail) || 
        (m.userId && m.userId === req.userId) || 
        (user.membershipId && m.membershipId === user.membershipId)
      );

      if (existingRosterMember) {
        const memberGoalUpdates = {
          ...(resolvedGoal && { fitnessGoal: resolvedGoal, primaryGoal: resolvedGoal, goal: resolvedGoal }),
          ...(updated.name && { name: updated.name }),
          ...(updated.phone && { phone: updated.phone }),
          ...(req.body.assignedTrainer && { assignedTrainer: req.body.assignedTrainer })
        };
        db.update('gymMembers', existingRosterMember.id, memberGoalUpdates);
        
        const firestore = getFirestore();
        if (firestore) {
          firestore.collection('gymMembers').doc(existingRosterMember.id).set(memberGoalUpdates, { merge: true }).catch(() => {});
        }
      }
    } catch (syncErr) {
      console.warn('Non-blocking gymMember goal sync warning:', syncErr.message);
    }

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
        fitnessGoal: resolvedGoal || updated.primaryGoal || updated.fitnessGoal || 'Bulking',
        primaryGoal: resolvedGoal || updated.primaryGoal || updated.fitnessGoal || 'Bulking',
        goal: resolvedGoal || updated.primaryGoal || updated.fitnessGoal || 'Bulking',
        joinDate: new Date().toISOString().split('T')[0],
        expiryDate: req.body.membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      if (existingRosterMember) {
        db.update('gymMembers', existingRosterMember.id, memberData);
      } else {
        db.create('gymMembers', { id: `mem_${Date.now()}`, ...memberData });
      }

      const firestore = getFirestore();
      if (firestore) {
        const memDocId = existingRosterMember?.id || `mem_${req.userId}`;
        firestore.collection('gymMembers').doc(memDocId).set(memberData, { merge: true }).catch(() => {});
      }
    } else if (req.body.membershipStatus === 'None') {
      const existingRosterMember = db.findOne('gymMembers', m => m.email?.toLowerCase() === user.email.toLowerCase());
      if (existingRosterMember) {
        db.update('gymMembers', existingRosterMember.id, { status: 'Expired' });
        const firestore = getFirestore();
        if (firestore) {
          firestore.collection('gymMembers').doc(existingRosterMember.id).set({ status: 'Expired' }, { merge: true }).catch(() => {});
        }
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
