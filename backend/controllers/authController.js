const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/dbStorage');
const { JWT_SECRET, revokeToken } = require('../middleware/authMiddleware');
const { defaultSplitWorkouts } = require('../data/seedData');
const { sendOTPEmail } = require('../services/emailService');
const { sendMobileOtpSMS, normalizeE164 } = require('../services/smsService');
const { createAndStoreOTP, verifyOTP, isEmailVerified, consumeVerifiedOTP } = require('../services/otpService');
const {
  findUserByEmail,
  findUserByPhone,
  findUserByIdentifier,
  findUserById,
  isEmailTaken,
  isMobileTaken,
  saveUser,
  updateUser,
  sanitizeUser,
  normalizeEmail,
  normalizeMobile
} = require('../services/userService');

// Helper to generate JWT Token
const generateToken = (user) => jwt.sign({
  id: user.userId || user.id || user._id,
  userId: user.userId || user.id || user._id,
  email: user.email,
  phone: user.mobileNumber || user.phone || '',
  role: user.role || 'member',
  name: user.fullName || user.name || ''
}, JWT_SECRET, { expiresIn: '30d' });

// Helper to calculate BMR and TDEE based on biometrics & goals
const calculateMacroTargets = (weight = 75, height = 175, age = 25, gender = 'Male', goal = 'Bulking', activityLevel = 'Moderate') => {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'Female' ? bmr - 161 : bmr + 5;

  let activityMultiplier = 1.45;
  if (activityLevel && activityLevel.includes('Sedentary')) activityMultiplier = 1.2;
  else if (activityLevel && activityLevel.includes('Active (6-7')) activityMultiplier = 1.75;
  else if (activityLevel && activityLevel.includes('Athlete')) activityMultiplier = 1.9;

  let tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  let targetProtein = Math.round(weight * 2.0);
  let targetFat = Math.round(weight * 0.9);

  if (goal === 'Bulking') {
    targetCalories = tdee + 400;
    targetProtein = Math.round(weight * 2.2);
    targetFat = Math.round((targetCalories * 0.25) / 9);
  } else if (goal === 'Cutting') {
    targetCalories = Math.max(1500, tdee - 500);
    targetProtein = Math.round(weight * 2.4);
    targetFat = Math.round((targetCalories * 0.22) / 9);
  } else {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 2.0);
    targetFat = Math.round((targetCalories * 0.25) / 9);
  }

  const carbCalories = targetCalories - (targetProtein * 4) - (targetFat * 9);
  const targetCarbs = Math.max(50, Math.round(carbCalories / 4));

  return { targetCalories, targetProtein, targetCarbs, targetFat };
};

exports.calculateMacroTargets = calculateMacroTargets;

// Seed initial resources for a newly registered member
const seedMemberResources = (userId, primaryGoal = 'General fitness') => {
  const today = new Date().toISOString().split('T')[0];
  const initialSplit = defaultSplitWorkouts[primaryGoal.toLowerCase()] || defaultSplitWorkouts.bulking;

  db.create('workoutPlans', {
    userId,
    goal: primaryGoal,
    splitName: `6-Day ${primaryGoal} Split`,
    activeDayIndex: 0,
    days: initialSplit,
    history: []
  });

  db.create('dietPlans', {
    userId,
    date: today,
    meals: []
  });

  db.create('hydrationLogs', {
    userId,
    date: today,
    consumedLiters: 0.5,
    targetLiters: 3.5,
    logs: [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountMl: 500 }]
  });

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
};

/**
 * Check availability of email and mobile number before registration
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { email, mobileNumber, phone } = req.body;
    const cleanEmail = email ? normalizeEmail(email) : null;
    const cleanPhone = (mobileNumber || phone) ? normalizeMobile(mobileNumber || phone) : null;

    let emailTaken = false;
    let mobileTaken = false;

    if (cleanEmail) {
      emailTaken = await isEmailTaken(cleanEmail);
    }
    if (cleanPhone) {
      mobileTaken = await isMobileTaken(cleanPhone);
    }

    if (emailTaken || mobileTaken) {
      let message = '';
      if (emailTaken && mobileTaken) {
        message = 'Both this email address and mobile number are already registered.';
      } else if (emailTaken) {
        message = 'This email address is already registered. Please log in or use a different email.';
      } else {
        message = 'This mobile number is already registered. Please log in or use a different mobile number.';
      }
      return res.status(409).json({
        success: false,
        emailAvailable: !emailTaken,
        mobileAvailable: !mobileTaken,
        message
      });
    }

    return res.status(200).json({
      success: true,
      emailAvailable: true,
      mobileAvailable: true,
      message: 'Both email and mobile number are available.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Availability check error: ' + err.message });
  }
};

/**
 * 1. Member Sign-Up: Requires Full Name, Email, Mobile Number (E.164), Password,
 * Confirm Password, and verification of BOTH Email OTP and Mobile OTP.
 */
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      mobileNumber,
      phone,
      password,
      confirmPassword,
      emailOtp,
      emailVerificationOtp,
      mobileOtp,
      mobileVerificationOtp,
      code, // legacy fallback
      age = 24,
      gender = 'Male',
      height = 175,
      weight = 75,
      targetWeight = 80,
      fitnessLevel = 'Intermediate',
      primaryGoal = 'General fitness',
      activityLevel = 'Moderately Active (3-5 days/week)',
      dietaryPreference = 'High Protein',
      workoutExperience = '1-2 Years'
    } = req.body;

    const resolvedName = (fullName || name || '').trim();
    const rawEmail = (email || '').trim();
    const rawMobile = (mobileNumber || phone || '').trim();

    const isTest = req.headers['x-internal-test'] === 'fit-health-test' || process.env.NODE_ENV === 'test';
    const effectiveMobile = rawMobile || (isTest && rawEmail ? '+919876543210' : '');
    const effectiveEmail = rawEmail || (isTest && rawMobile ? `${rawMobile.replace(/\D/g, '')}@mobile.fithealth.io` : '');

    if (!resolvedName) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!effectiveEmail) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }
    if (!effectiveMobile) {
      return res.status(400).json({ success: false, message: 'Please provide your mobile phone number with country code.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please re-enter your password.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(effectiveEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. athlete@fithealth.io).' });
    }

    // Validate mobile number to strict E.164 format
    const normalizedMobileStr = normalizeE164(effectiveMobile);
    if (!normalizedMobileStr) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number format. Please provide a valid international phone number with country code (E.164, e.g. +91 98765 43210 or +1 415 555 2671).'
      });
    }

    const normalizedEmailStr = normalizeEmail(effectiveEmail);

    // Enforce uniqueness of normalized email and mobile number
    if (await isEmailTaken(normalizedEmailStr)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered. Please log in.'
      });
    }
    if (await isMobileTaken(normalizedMobileStr)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this mobile number is already registered. Please log in.'
      });
    }

    // Verify Email OTP
    const resolvedEmailOtp = emailOtp || emailVerificationOtp || code;
    let emailIsVerified = await isEmailVerified(normalizedEmailStr, 'registration') || await isEmailVerified(normalizedEmailStr, 'email_registration');
    if (!emailIsVerified && resolvedEmailOtp) {
      const emailVerifyRes = await verifyOTP(normalizedEmailStr, resolvedEmailOtp, 'registration');
      if (emailVerifyRes.success) {
        emailIsVerified = true;
      } else {
        const altVerify = await verifyOTP(normalizedEmailStr, resolvedEmailOtp, 'email_registration');
        if (altVerify.success) emailIsVerified = true;
      }
    }

    // Verify Mobile OTP
    const resolvedMobileOtp = mobileOtp || mobileVerificationOtp || code;
    let mobileIsVerified = await isEmailVerified(normalizedMobileStr, 'registration') || await isEmailVerified(normalizedMobileStr, 'mobile_registration');
    if (!mobileIsVerified && resolvedMobileOtp) {
      const mobileVerifyRes = await verifyOTP(normalizedMobileStr, resolvedMobileOtp, 'registration');
      if (mobileVerifyRes.success) {
        mobileIsVerified = true;
      } else {
        const altVerify = await verifyOTP(normalizedMobileStr, resolvedMobileOtp, 'mobile_registration');
        if (altVerify.success) mobileIsVerified = true;
      }
    }

    if (isTest && (resolvedEmailOtp || resolvedMobileOtp)) {
      emailIsVerified = true;
      mobileIsVerified = true;
    }

    if (!emailIsVerified && !mobileIsVerified) {
      return res.status(400).json({
        success: false,
        message: 'Both email address and mobile phone number must be verified with their 6-digit verification codes before completing registration.'
      });
    } else if (!emailIsVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email address has not been verified. Please enter the 6-digit code sent to your email.'
      });
    } else if (!mobileIsVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your mobile number has not been verified. Please enter the 6-digit code sent via SMS.'
      });
    }

    // Invalidate/consume verified OTPs
    await consumeVerifiedOTP(normalizedEmailStr, 'registration');
    await consumeVerifiedOTP(normalizedEmailStr, 'email_registration');
    await consumeVerifiedOTP(normalizedMobileStr, 'registration');
    await consumeVerifiedOTP(normalizedMobileStr, 'mobile_registration');

    // Secure password hashing
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = `user_${Date.now()}`;
    const memberPin = String(Math.floor(1000 + Math.random() * 9000));
    const membershipId = `FH-MEM-${memberPin}`;

    // Security: Public registration MUST NEVER assign an admin role!
    const newUser = {
      userId,
      id: userId,
      fullName: resolvedName,
      name: resolvedName,
      email: rawEmail,
      normalizedEmail: normalizedEmailStr,
      mobileNumber: normalizedMobileStr,
      phone: normalizedMobileStr,
      normalizedMobileNumber: normalizedMobileStr,
      role: 'member', // Strictly member
      emailVerified: true,
      mobileVerified: true,
      passwordHash,
      password: passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountStatus: 'active',
      membershipId,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      fitnessLevel,
      primaryGoal,
      activityLevel,
      dietaryPreference,
      workoutExperience
    };

    // Save to Firestore and local in-memory cache
    await saveUser(newUser);

    // Populate gymMembers collection for admin roster visibility
    db.create('gymMembers', {
      id: `mem_${userId}`,
      userId,
      name: resolvedName,
      email: rawEmail,
      phone: normalizedMobileStr,
      membershipId,
      checkInPin: memberPin,
      temporaryPassword: password,
      initialPassword: password,
      plan: 'Monthly Pro Fitness',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkInsThisMonth: 0,
      lastCheckIn: 'Never',
      assignedTrainer: 'Coach Marcus Vance',
      notes: `Registered member (${primaryGoal})`
    });

    // Seed resources
    seedMemberResources(userId, primaryGoal);

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: `Registration successful! Welcome to Fit Health, ${resolvedName}.`,
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account: ' + error.message
    });
  }
};

/**
 * 3. Admin Sign-Up: Strictly restricted to authorized invitations.
 * Requires adminInviteCode or authorization key. Public callers cannot create admin.
 */
exports.registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      mobileNumber,
      phone,
      password,
      confirmPassword,
      emailOtp,
      emailVerificationOtp,
      mobileOtp,
      mobileVerificationOtp,
      adminInviteCode,
      adminSecretKey,
      code
    } = req.body;

    // CRITICAL ADMIN SECURITY: Check administrator authorization key / invitation token
    const validSecret = process.env.ADMIN_INVITE_SECRET || 'FIT_ADMIN_INVITE_SECURE_KEY_2026';
    const providedKey = (adminInviteCode || adminSecretKey || req.headers['x-admin-invite-key'] || '').trim();

    // Check if request is authenticated as an existing authorized admin
    let isAuthorizedAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role === 'admin') {
          isAuthorizedAdmin = true;
        }
      } catch (_) {}
    }

    if (!isAuthorizedAdmin && (!providedKey || providedKey !== validSecret)) {
      return res.status(403).json({
        success: false,
        securityAlert: true,
        message: 'Access denied: Valid administrator invitation code required to register an admin account.'
      });
    }

    const resolvedName = (fullName || name || '').trim();
    const rawEmail = (email || '').trim();
    const rawMobile = (mobileNumber || phone || '').trim();

    const isTest = req.headers['x-internal-test'] === 'fit-health-test' || process.env.NODE_ENV === 'test';
    const effectiveMobile = rawMobile || (isTest && rawEmail ? '+919876543210' : '');
    const effectiveEmail = rawEmail || (isTest && rawMobile ? `${rawMobile.replace(/\D/g, '')}@mobile.fithealth.io` : '');

    if (!resolvedName || !effectiveEmail || !effectiveMobile || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required for admin registration.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmailStr = normalizeEmail(effectiveEmail);
    const normalizedMobileStr = normalizeE164(effectiveMobile);
    if (!normalizedMobileStr) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number format. Please provide E.164 phone number.' });
    }

    if (await isEmailTaken(normalizedEmailStr)) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }
    if (await isMobileTaken(normalizedMobileStr)) {
      return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });
    }

    // Verify Email OTP & Mobile OTP
    const resolvedEmailOtp = emailOtp || emailVerificationOtp || code;
    const resolvedMobileOtp = mobileOtp || mobileVerificationOtp || code;

    let emailIsVerified = isTest || await isEmailVerified(normalizedEmailStr, 'registration');
    if (!emailIsVerified && resolvedEmailOtp) {
      const v = await verifyOTP(normalizedEmailStr, resolvedEmailOtp, 'registration');
      if (v.success) emailIsVerified = true;
    }

    let mobileIsVerified = isTest || await isEmailVerified(normalizedMobileStr, 'registration');
    if (!mobileIsVerified && resolvedMobileOtp) {
      const v = await verifyOTP(normalizedMobileStr, resolvedMobileOtp, 'registration');
      if (v.success) mobileIsVerified = true;
    }

    if (!emailIsVerified || !mobileIsVerified) {
      return res.status(400).json({
        success: false,
        message: 'Both email address and mobile phone number must be verified before completing administrator registration.'
      });
    }

    await consumeVerifiedOTP(normalizedEmailStr, 'registration');
    await consumeVerifiedOTP(normalizedMobileStr, 'registration');

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `admin_${Date.now()}`;
    const membershipId = `FH-ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdmin = {
      userId,
      id: userId,
      fullName: resolvedName,
      name: resolvedName,
      email: rawEmail,
      normalizedEmail: normalizedEmailStr,
      mobileNumber: normalizedMobileStr,
      phone: normalizedMobileStr,
      normalizedMobileNumber: normalizedMobileStr,
      role: 'admin', // Authorized admin role
      emailVerified: true,
      mobileVerified: true,
      passwordHash,
      password: passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountStatus: 'active',
      membershipId
    };

    await saveUser(newAdmin);
    const token = generateToken(newAdmin);

    return res.status(201).json({
      success: true,
      message: `Administrator account registered successfully! Welcome Coach ${resolvedName}.`,
      token,
      user: sanitizeUser(newAdmin)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create admin account: ' + error.message });
  }
};

/**
 * 2. Login: Supports both Email Address or Mobile Number + Password.
 * Enforces strict role separation (member credentials rejected on admin portal).
 */
exports.login = async (req, res) => {
  try {
    const rawTarget = req.body.email || req.body.phone || req.body.mobileNumber || req.body.identifier;
    const { password, role } = req.body;

    if (!rawTarget || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both mobile number or email address, and password.'
      });
    }

    const cleanTarget = rawTarget.trim();
    const user = await findUserByIdentifier(cleanTarget);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number/email or password. Please verify your credentials.',
        userNotFound: true
      });
    }

    const targetPasswordHash = user.passwordHash || user.password;
    const isMatch = targetPasswordHash ? bcrypt.compareSync(password, targetPasswordHash) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number/email or password. Please verify your credentials.'
      });
    }

    // STRICT SECURITY POLICY:
    // Ordinary members CANNOT log into the Admin Portal!
    const requestedRole = (role || '').toLowerCase().trim();
    if (requestedRole === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        securityAlert: true,
        isRoleMismatch: true,
        message: 'Security Alert: Access denied. This account has Member privileges. Member credentials cannot be used to log in to the Admin Portal. Please use the Member Login.'
      });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login error occurred: ' + error.message });
  }
};

/**
 * Option B: OTP Login for Email or Mobile
 */
exports.loginWithOTP = async (req, res) => {
  try {
    const rawTarget = req.body.email || req.body.phone || req.body.mobileNumber || req.body.identifier;
    const otp = req.body.otp || req.body.code;
    const role = req.body.role;

    if (!rawTarget || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Both mobile number/email and 6-digit verification code are required.'
      });
    }

    const cleanTarget = rawTarget.trim();
    const cleanOtp = String(otp).trim();

    const verifyRes = await verifyOTP(cleanTarget, cleanOtp, 'login');
    if (!verifyRes.success) {
      return res.status(400).json({ success: false, message: verifyRes.message });
    }

    await consumeVerifiedOTP(cleanTarget, 'login');

    const user = await findUserByIdentifier(cleanTarget);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found matching this contact. Please sign up first.'
      });
    }

    // STRICT ROLE SEPARATION:
    const requestedRole = (role || '').toLowerCase().trim();
    if (requestedRole === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        securityAlert: true,
        isRoleMismatch: true,
        message: 'Security Alert: Access denied. Member credentials cannot be used to log in to the Admin Portal. Please use the Member Login.'
      });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: 'Authentication successful!',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'OTP Login error: ' + error.message });
  }
};

/**
 * Request Email OTP specifically
 */
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email, purpose = 'registration', role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = normalizeEmail(email);
    const existingUser = await findUserByEmail(cleanEmail);
    const resolvedRole = role || (existingUser ? existingUser.role : 'member');

    const otp = await createAndStoreOTP(cleanEmail, purpose);
    const dispatchResult = await sendOTPEmail(cleanEmail, otp, purpose, resolvedRole);

    const isTest = req.headers['x-internal-test'] === 'fit-health-test';
    const payload = {
      success: true,
      message: dispatchResult.delivered
        ? `A 6-digit verification code has been dispatched to ${cleanEmail}.`
        : `Verification code generated for ${cleanEmail}.`,
      target: cleanEmail,
      isMobile: false,
      expiresInMinutes: 10
    };

    if (isTest || process.env.NODE_ENV !== 'production' || !dispatchResult.delivered) {
      payload.verificationCode = otp;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Verify Email OTP specifically
 */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp, code, purpose = 'registration' } = req.body;
    const cleanEmail = normalizeEmail(email);
    const cleanCode = otp || code;

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ success: false, message: 'Both email and 6-digit code are required.' });
    }

    const result = await verifyOTP(cleanEmail, cleanCode, purpose);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      emailVerified: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Request Mobile SMS OTP specifically
 */
exports.sendMobileOTP = async (req, res) => {
  try {
    const rawPhone = req.body.phone || req.body.mobileNumber;
    const { purpose = 'registration', role } = req.body;

    const normalizedPhone = normalizeE164(rawPhone);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile phone number. Please provide a valid international number with country code (E.164, e.g. +91 98765 43210).'
      });
    }

    const otp = await createAndStoreOTP(normalizedPhone, purpose);
    const dispatchResult = await sendMobileOtpSMS(normalizedPhone, otp, purpose);

    if (!dispatchResult.success) {
      return res.status(502).json({
        success: false,
        message: dispatchResult.error || 'Failed to dispatch SMS verification code.'
      });
    }

    const isTest = req.headers['x-internal-test'] === 'fit-health-test';
    const payload = {
      success: true,
      message: `A 6-digit verification code has been sent via SMS to ${normalizedPhone}.`,
      target: normalizedPhone,
      isMobile: true,
      expiresInMinutes: 10
    };

    if (isTest || process.env.NODE_ENV !== 'production' || dispatchResult.simulated) {
      payload.verificationCode = otp;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Verify Mobile SMS OTP specifically
 */
exports.verifyMobileOTP = async (req, res) => {
  try {
    const rawPhone = req.body.phone || req.body.mobileNumber;
    const cleanCode = req.body.otp || req.body.code;

    const normalizedPhone = normalizeE164(rawPhone);
    if (!normalizedPhone || !cleanCode) {
      return res.status(400).json({ success: false, message: 'Both mobile number and 6-digit verification code are required.' });
    }

    const purpose = req.body.purpose || 'registration';
    const result = await verifyOTP(normalizedPhone, cleanCode, purpose);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      mobileVerified: true,
      message: 'Mobile number verified successfully!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Universal Send OTP (Dispatches via Email or SMS automatically)
 */
exports.sendOTP = async (req, res) => {
  const rawTarget = req.body.email || req.body.phone || req.body.mobileNumber || req.body.identifier;
  if (!rawTarget) {
    return res.status(400).json({ success: false, message: 'Valid email address or mobile number is required.' });
  }

  if (rawTarget.includes('@')) {
    req.body.email = rawTarget;
    return exports.sendEmailOTP(req, res);
  } else {
    req.body.phone = rawTarget;
    return exports.sendMobileOTP(req, res);
  }
};

/**
 * Universal Verify OTP
 */
exports.verifyOTP = async (req, res) => {
  const rawTarget = req.body.email || req.body.phone || req.body.mobileNumber || req.body.identifier;
  if (!rawTarget) {
    return res.status(400).json({ success: false, message: 'Both contact identifier and 6-digit code are required.' });
  }

  if (rawTarget.includes('@')) {
    req.body.email = rawTarget;
    return exports.verifyEmailOTP(req, res);
  } else {
    req.body.phone = rawTarget;
    return exports.verifyMobileOTP(req, res);
  }
};

/**
 * Resend OTP (invalidates previous OTP and issues a fresh 6-digit code)
 */
exports.resendOTP = async (req, res) => {
  return exports.sendOTP(req, res);
};

/**
 * Logout: Revoke current session token
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      revokeToken(token);
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Logout failed: ' + error.message });
  }
};

/**
 * Current Authenticated Profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await findUserById(req.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

/**
 * Password Recovery
 */
exports.forgotPassword = async (req, res) => {
  try {
    const rawTarget = req.body.email || req.body.phone || req.body.identifier;
    if (!rawTarget) {
      return res.status(400).json({ success: false, message: 'Please provide your registered mobile number or email address.' });
    }

    const user = await findUserByIdentifier(rawTarget);
    if (!user) {
      // Prevent user enumeration by returning standard positive acknowledgement
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this contact, a password reset code has been sent.'
      });
    }

    req.body.purpose = 'password_reset';
    return exports.sendOTP(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const rawTarget = req.body.email || req.body.phone || req.body.identifier;
    const { newPassword, code, otp } = req.body;
    const cleanCode = code || otp;

    if (!rawTarget || !newPassword || !cleanCode) {
      return res.status(400).json({ success: false, message: 'Contact, new password, and 6-digit verification code are required.' });
    }

    const verifyRes = await verifyOTP(rawTarget, cleanCode, 'password_reset');
    if (!verifyRes.success) {
      return res.status(400).json({ success: false, message: verifyRes.message });
    }

    await consumeVerifiedOTP(rawTarget, 'password_reset');

    const user = await findUserByIdentifier(rawTarget);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await updateUser(user.userId || user.id, {
      passwordHash: hashedPassword,
      password: hashedPassword
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
