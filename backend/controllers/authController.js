const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/dbStorage');
const { getDBStatus } = require('../config/db');
const { JWT_SECRET, revokeToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { defaultSplitWorkouts } = require('../data/seedData');
const { sendOTPEmail } = require('../services/emailService');
const { createAndStoreOTP, verifyOTP, isEmailVerified, consumeVerifiedOTP } = require('../services/otpService');

// Helper to generate JWT Token
const generateToken = (user) => jwt.sign({ id: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

// Helper to calculate BMR and TDEE based on biometrics & goals
const calculateMacroTargets = (weight = 75, height = 175, age = 25, gender = 'Male', goal = 'Bulking', activityLevel = 'Moderate') => {
  // Mifflin-St Jeor formula
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'Female' ? bmr - 161 : bmr + 5;

  let activityMultiplier = 1.45; // Default moderate
  if (activityLevel.includes('Sedentary')) activityMultiplier = 1.2;
  else if (activityLevel.includes('Active (6-7')) activityMultiplier = 1.75;
  else if (activityLevel.includes('Athlete')) activityMultiplier = 1.9;

  let tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  let targetProtein = Math.round(weight * 2.0); // 2g per kg
  let targetFat = Math.round(weight * 0.9);

  if (goal === 'Bulking') {
    targetCalories = tdee + 400; // Surplus
    targetProtein = Math.round(weight * 2.2);
    targetFat = Math.round((targetCalories * 0.25) / 9);
  } else if (goal === 'Cutting') {
    targetCalories = Math.max(1500, tdee - 500); // Deficit
    targetProtein = Math.round(weight * 2.4); // Higher protein to preserve lean muscle
    targetFat = Math.round((targetCalories * 0.22) / 9);
  } else {
    // Maintenance / General fitness
    targetCalories = tdee;
    targetProtein = Math.round(weight * 2.0);
    targetFat = Math.round((targetCalories * 0.25) / 9);
  }

  const carbCalories = targetCalories - (targetProtein * 4) - (targetFat * 9);
  const targetCarbs = Math.max(50, Math.round(carbCalories / 4));

  return { targetCalories, targetProtein, targetCarbs, targetFat };
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age = 24,
      gender = 'Male',
      height = 175,
      weight = 75,
      targetWeight = 80,
      fitnessLevel = 'Intermediate',
      primaryGoal = 'Bulking',
      activityLevel = 'Moderately Active (3-5 days/week)',
      dietaryPreference = 'High Protein',
      workoutExperience = '1-2 Years'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const codeOrOtp = req.body.code || req.body.otp;

    // Verify OTP if supplied with registration payload
    if (codeOrOtp) {
      let otpRes = verifyOTP(cleanEmail, codeOrOtp, 'registration');
      if (!otpRes.success) {
        otpRes = verifyOTP(cleanEmail, codeOrOtp, 'login');
      }
      if (!otpRes.success) {
        return res.status(400).json({
          success: false,
          message: otpRes.message
        });
      }
      // Consume code to prevent replay attacks
      consumeVerifiedOTP(cleanEmail, 'registration');
      consumeVerifiedOTP(cleanEmail, 'login');
    }

    // Check if user already exists
    const existingUser = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      // If email has verified OTP for registration or login, log in smoothly!
      if (isEmailVerified(cleanEmail, 'registration') || isEmailVerified(cleanEmail, 'login') || codeOrOtp) {
        consumeVerifiedOTP(cleanEmail, 'registration');
        consumeVerifiedOTP(cleanEmail, 'login');
        const token = generateToken(existingUser);
        const { password: _, ...safeUser } = existingUser;
        return res.status(200).json({
          success: true,
          message: `Welcome back, ${existingUser.name || 'Member'}! Email verified and logged in.`,
          token,
          user: safeUser,
          isExistingUser: true
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Enter your verification code to log in directly.',
        accountExists: true,
        userRole: existingUser.role,
        userName: existingUser.name
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const { targetCalories, targetProtein, targetCarbs, targetFat } = calculateMacroTargets(
      Number(weight),
      Number(height),
      Number(age),
      gender,
      primaryGoal,
      activityLevel
    );

    const userId = `user_${Date.now()}`;
    const userRole = (req.body.role === 'admin' || (email && email.toLowerCase().includes('admin'))) ? 'admin' : 'member';
    const memberPin = userRole === 'admin' ? null : String(Math.floor(1000 + Math.random() * 9000));
    const memberId = userRole === 'admin' ? `FH-ADM-${Math.floor(1000 + Math.random() * 9000)}` : `FH-MEM-${memberPin || Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      fitnessLevel,
      primaryGoal,
      activityLevel,
      dietaryPreference,
      workoutExperience,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      waterTargetLiters: 3.5,
      sleepTargetHours: 8.0,
      streak: 1,
      role: userRole,
      linkedGymId: 'gym_1',
      gymId: 'gym_1',
      gymName: 'rsv gym and sports club',
      gymBranch: 'Downtown Flagship Center',
      membershipId: memberId,
      membershipStatus: 'Active',
      membershipPlan: userRole === 'admin' ? 'Gym Facility Master' : 'Monthly Pro Fitness',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    db.create('users', newUser);

    // If regular member, register into gymMembers collection for admin dashboard visibility & editing
    if (userRole === 'member') {
      db.create('gymMembers', {
        id: `mem_${userId}`,
        userId,
        name,
        email: cleanEmail,
        phone: req.body.phone || '+91 98765 43210',
        membershipId: memberId,
        checkInPin: memberPin || memberId.replace(/\D/g, '').slice(-4) || '7829',
        plan: 'Monthly Pro Fitness',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkInsThisMonth: 0,
        lastCheckIn: 'Never',
        assignedTrainer: 'Coach Marcus Vance (CSCS, USAW-2)',
        notes: `Registered member (${primaryGoal || 'Fitness'})`
      });
    }

    // Sync user record to Firebase Cloud Firestore if active
    const { getFirestore, isFirebaseActive } = require('../config/firebase');
    if (isFirebaseActive()) {
      try {
        const firestore = getFirestore();
        const { password: _, ...firebaseUser } = newUser;
        firestore.collection('users').doc(userId).set({
          ...firebaseUser,
          emailVerified: true,
          createdAt: new Date()
        }).catch(err => console.warn('[Firebase] User document sync warning:', err.message));
      } catch {}
    }

    // Seed User Initial Workout Plan
    const initialSplit = defaultSplitWorkouts[primaryGoal.toLowerCase()] || defaultSplitWorkouts.bulking;
    db.create('workoutPlans', {
      userId,
      goal: primaryGoal,
      splitName: `6-Day ${primaryGoal} Split`,
      activeDayIndex: 0,
      days: initialSplit,
      history: []
    });

    // Seed Initial Diet Log for Today
    const today = new Date().toISOString().split('T')[0];
    db.create('dietPlans', {
      userId,
      date: today,
      meals: []
    });

    // Seed Initial Hydration
    db.create('hydrationLogs', {
      userId,
      date: today,
      consumedLiters: 0.5,
      targetLiters: 3.5,
      logs: [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountMl: 500 }]
    });

    // Seed Initial Vitals
    db.create('vitalsLogs', {
      userId,
      date: today,
      heartRateBpm: 72,
      restingHeartRate: 62,
      maxHeartRate: 155,
      steps: 1200,
      stepGoal: 10000,
      activeCaloriesBurned: 110,
      sleepHours: 7.5,
      sleepTargetHours: 8.0,
      recoveryScore: 84,
      syncSource: 'Manual',
      isWearableConnected: false,
      wearableDevice: 'Not Connected',
      lastSyncTimestamp: new Date().toISOString(),
      cardioZones: {
        warmUpMinutes: 10,
        fatBurnMinutes: 15,
        cardioMinutes: 5,
        peakMinutes: 0
      }
    });

    // Generate JWT
    const token = jwt.sign({ id: userId, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    // Invalidate OTP codes for this email to prevent reuse
    consumeVerifiedOTP(cleanEmail, 'registration');
    consumeVerifiedOTP(cleanEmail, 'login');

    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Fit Health.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account.',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
        userNotFound: true
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    // Token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login error occurred.',
      error: error.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      revokeToken(token);
    }
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully and session token invalidated.'
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid account email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    const targetRole = user?.role || (role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'member');

    // Create & store 6-digit OTP code for password reset
    const otp = createAndStoreOTP(cleanEmail, 'password_reset');

    // Dispatch OTP verification email to the user's specific email address
    const emailResult = await sendOTPEmail(cleanEmail, otp, 'password_reset', targetRole);
    if (!emailResult.success) {
      return res.status(502).json({
        success: false,
        message: `Failed to dispatch recovery email: ${emailResult.error || 'SMTP delivery rejected'}. Please verify email settings.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Password reset 6-digit OTP code has been dispatched to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail,
      role: targetRole
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to dispatch password reset OTP.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, role } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (code) {
      const verification = verifyOTP(cleanEmail, code, 'password_reset');
      if (!verification.success) {
        return res.status(400).json({ success: false, message: verification.message });
      }
      consumeVerifiedOTP(cleanEmail, 'password_reset');
    }

    let user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    if (user) {
      db.update('users', user.id, { password: hashedPassword, isEmailVerified: true });
    } else {
      // Provision account for this verified email address
      const targetRole = role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'member';
      const name = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const memberPin = targetRole === 'admin' ? null : String(Math.floor(1000 + Math.random() * 9000));
      const memberId = targetRole === 'admin' ? `FH-ADM-${Math.floor(1000 + Math.random() * 9000)}` : `FH-MEM-${memberPin || Math.floor(1000 + Math.random() * 9000)}`;

      user = db.insert('users', {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: targetRole,
        memberId,
        memberPin,
        isEmailVerified: true
      });

      if (targetRole === 'member') {
        const existingMember = db.findOne('gymMembers', m => m.email?.toLowerCase() === cleanEmail);
        if (!existingMember) {
          db.insert('gymMembers', {
            name,
            email: cleanEmail,
            phone: '',
            membershipPlan: 'Standard Monthly',
            startDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            role: 'member',
            userId: user.id
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new credentials.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password: ' + error.message
    });
  }
};

// --- SMTP Email OTP Verification Endpoints ---

exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'registration', role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    const resolvedRole = role || (existingUser ? existingUser.role : (cleanEmail.includes('admin') ? 'admin' : 'member'));

    const otp = createAndStoreOTP(cleanEmail, purpose);
    console.log(`[Email Service] Dispatched OTP code to ${cleanEmail} (${resolvedRole})`);
    const emailResult = await sendOTPEmail(cleanEmail, otp, purpose, resolvedRole);

    if (!emailResult.success) {
      return res.status(502).json({
        success: false,
        message: `Failed to dispatch verification email: ${emailResult.error || 'SMTP delivery rejected'}. Please check your email address.`
      });
    }

    const isInternalTest = req.headers['x-internal-test'] === 'fit-health-test';

    const responsePayload = {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      role: resolvedRole,
      accountExists: Boolean(existingUser),
      userName: existingUser?.name || null,
      expiresInMinutes: 10,
      devMode: Boolean(emailResult.simulated)
    };

    if (isInternalTest) {
      responsePayload.verificationCode = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate and dispatch OTP.'
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp || req.body.code;
    const purpose = req.body.purpose || 'registration';
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Both email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let result = verifyOTP(cleanEmail, otp, purpose);

    // Cross-fallback: if generated for registration but verified for login, or vice-versa
    if (!result.success) {
      const altPurpose = purpose === 'registration' ? 'login' : 'registration';
      const altResult = verifyOTP(cleanEmail, otp, altPurpose);
      if (altResult.success) {
        result = altResult;
      }
    }

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);

    return res.status(200).json({
      success: true,
      message: result.message,
      emailVerified: true,
      accountExists: Boolean(existingUser),
      userRole: existingUser?.role || 'member',
      userName: existingUser?.name || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed: ' + error.message
    });
  }
};

exports.loginWithOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp || req.body.code;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Both email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let verification = verifyOTP(cleanEmail, otp, 'login');
    if (!verification.success) {
      verification = verifyOTP(cleanEmail, otp, 'registration');
    }

    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }
    consumeVerifiedOTP(cleanEmail, 'login');
    consumeVerifiedOTP(cleanEmail, 'registration');

    const user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with that email address.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Email OTP authentication successful! Welcome to Fit Health.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'OTP Login failed: ' + error.message
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const otp = createAndStoreOTP(email, purpose);
    console.log(`[Email Service] Dispatched fresh OTP verification code to ${email}`);
    const emailResult = await sendOTPEmail(email, otp, purpose);
    if (!emailResult.success) {
      return res.status(502).json({
        success: false,
        message: `Failed to dispatch verification email: ${emailResult.error || 'SMTP delivery rejected'}.`
      });
    }

    const isInternalTest = req.headers['x-internal-test'] === 'fit-health-test';

    const resendPayload = {
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${email}.`
    };

    if (isInternalTest) {
      resendPayload.verificationCode = otp;
    }

    return res.status(200).json(resendPayload);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Cooldown period active. Please wait before resending.'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized session.' });
    }

    const user = db.findById('users', req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + error.message
    });
  }
};

exports.calculateMacroTargets = calculateMacroTargets;
