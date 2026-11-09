// Fit Health API Service Client

const getBaseUrl = () => {
  // In production builds, use relative '/api' unless a non-localhost remote URL is explicitly specified
  if (import.meta.env?.PROD) {
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0 && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      const cleanUrl = envUrl.trim().replace(/\/$/, '');
      return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
    }
    return '/api';
  }

  // Read configured API URL from Vite environment during development (frontend/.env: VITE_API_URL=http://localhost:5000)
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const cleanUrl = envUrl.trim().replace(/\/$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    // If running in native Capacitor/Cordova app wrapper
    if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:' || window.location.protocol === 'file:') {
      return `http://127.0.0.1:5000/api`;
    }
    return '/api';
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('fit_health_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    err.userNotFound = Boolean(data.userNotFound);
    throw err;
  }
  return data;
}

export const api = {
  // Authentication & Session
  register: async (payload) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  registerAdmin: async (payload) => {
    const res = await fetch(`${BASE_URL}/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  checkAvailability: async (email, mobileNumber) => {
    const res = await fetch(`${BASE_URL}/auth/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mobileNumber })
    });
    return handleResponse(res);
  },

  login: async (identifier, password, role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier, password, role })
    });
    return handleResponse(res);
  },

  logout: async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Email & Mobile SMS OTP Endpoints
  sendOTP: async (identifier, purpose = 'registration', role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier, phone: identifier, purpose, role })
    });
    return handleResponse(res);
  },

  verifyOTP: async (identifier, otp, purpose = 'registration') => {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier, phone: identifier, otp, purpose })
    });
    return handleResponse(res);
  },

  sendEmailOTP: async (email, purpose = 'registration', role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/send-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose, role })
    });
    return handleResponse(res);
  },

  verifyEmailOTP: async (email, otp, purpose = 'registration') => {
    const res = await fetch(`${BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose })
    });
    return handleResponse(res);
  },

  sendMobileOTP: async (phone, purpose = 'registration', role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/send-mobile-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, mobileNumber: phone, purpose, role })
    });
    return handleResponse(res);
  },

  verifyMobileOTP: async (phone, otp, purpose = 'registration') => {
    const res = await fetch(`${BASE_URL}/auth/verify-mobile-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, mobileNumber: phone, otp, purpose })
    });
    return handleResponse(res);
  },

  resendOTP: async (email, purpose = 'registration', role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose, role })
    });
    return handleResponse(res);
  },

  loginWithOTP: async (email, otp, role = 'member') => {
    const res = await fetch(`${BASE_URL}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, role })
    });
    return handleResponse(res);
  },

  forgotPassword: async (email, role) => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return handleResponse(res);
  },

  resetPassword: async (email, newPassword, code, role) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword, code, role })
    });
    return handleResponse(res);
  },

  // User Profile
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (payload) => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Gym Locator
  getGyms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/gyms${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getNearbyGyms: async (lat, lng, radius = 5) => {
    const res = await fetch(`${BASE_URL}/gyms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getGymById: async (id) => {
    const res = await fetch(`${BASE_URL}/gyms/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  bookDayPass: async (gymId, payload) => {
    const res = await fetch(`${BASE_URL}/gyms/${gymId}/book-pass`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Workout Planner
  getWorkouts: async () => {
    const res = await fetch(`${BASE_URL}/workouts`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createExercise: async (dayIndex, exercise) => {
    const res = await fetch(`${BASE_URL}/workouts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dayIndex, exercise })
    });
    return handleResponse(res);
  },

  updateWorkout: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/workouts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteExercise: async (id) => {
    const res = await fetch(`${BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  completeWorkout: async (dayIndex, durationMinutes = 50) => {
    const res = await fetch(`${BASE_URL}/workouts/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dayIndex, durationMinutes })
    });
    return handleResponse(res);
  },

  resetSplit: async (goal) => {
    const res = await fetch(`${BASE_URL}/workouts/reset-split`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ goal })
    });
    return handleResponse(res);
  },

  // Nutrition Tracker
  getNutrition: async (date) => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE_URL}/nutrition${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  addMeal: async (mealPayload) => {
    const res = await fetch(`${BASE_URL}/nutrition/meal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mealPayload)
    });
    return handleResponse(res);
  },

  updateMeal: async (id, mealPayload) => {
    const res = await fetch(`${BASE_URL}/nutrition/meal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(mealPayload)
    });
    return handleResponse(res);
  },

  deleteMeal: async (id) => {
    const res = await fetch(`${BASE_URL}/nutrition/meal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  searchFoods: async (query) => {
    const res = await fetch(`${BASE_URL}/nutrition/foods/search?q=${encodeURIComponent(query || '')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Live Biometrics (Samsung Health / Health Connect Bridge)
  getLatestBiometrics: async () => {
    const res = await fetch(`${BASE_URL}/biometrics/latest`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getBiometricsHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/biometrics/history${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getBiometricsSummary: async (days = 7) => {
    const res = await fetch(`${BASE_URL}/biometrics/summary?days=${days}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getBiometricsConsent: async () => {
    const res = await fetch(`${BASE_URL}/biometrics/consent`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateBiometricsConsent: async (adminShareConsent) => {
    const res = await fetch(`${BASE_URL}/biometrics/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminShareConsent })
    });
    return handleResponse(res);
  },

  deleteBiometricsData: async () => {
    const res = await fetch(`${BASE_URL}/biometrics`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMemberBiometricsForAdmin: async (memberId) => {
    const res = await fetch(`${BASE_URL}/biometrics/member/${memberId}/latest`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  syncSampleBiometrics: async (records, deviceModel = 'Samsung Galaxy S24 Ultra (Samsung Health)') => {
    const res = await fetch(`${BASE_URL}/biometrics/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ records, device: deviceModel })
    });
    return handleResponse(res);
  },

  // Health Providers Hub (Unified Adapter Pattern)
  getHealthProviders: async () => {
    const res = await fetch(`${BASE_URL}/health/providers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  connectHealthProvider: async (providerId, payload = {}) => {
    const res = await fetch(`${BASE_URL}/health/connect/${providerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  syncHealthProvider: async (providerId, payload = {}) => {
    const res = await fetch(`${BASE_URL}/health/sync/${providerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  setPrimaryHealthProvider: async (providerId) => {
    const res = await fetch(`${BASE_URL}/health/set-primary/${providerId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  disconnectHealthProvider: async (providerId, deleteData = false) => {
    const res = await fetch(`${BASE_URL}/health/disconnect/${providerId}?deleteData=${deleteData}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Vitals
  getVitals: async (date) => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE_URL}/vitals${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  logVitals: async (payload) => {
    const res = await fetch(`${BASE_URL}/vitals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  syncWearable: async (deviceType = 'Google Fit', action = 'connect') => {
    const res = await fetch(`${BASE_URL}/vitals/sync-wearable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deviceType, action })
    });
    return handleResponse(res);
  },

  // Hydration
  getHydration: async (date) => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE_URL}/hydration${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  logHydration: async (amountMl, action = 'add') => {
    const res = await fetch(`${BASE_URL}/hydration`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amountMl, action })
    });
    return handleResponse(res);
  },

  // Progress
  getProgress: async () => {
    const res = await fetch(`${BASE_URL}/progress`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  logProgress: async (payload) => {
    const res = await fetch(`${BASE_URL}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Supplements
  getSupplements: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/supplements${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Recovery & Sleep
  getRecovery: async (date) => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE_URL}/recovery${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  toggleStretch: async (stretchId) => {
    const res = await fetch(`${BASE_URL}/recovery/stretching-complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stretchId })
    });
    return handleResponse(res);
  },

  // AI Assistant
  askAssistant: async (question) => {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question })
    });
    return handleResponse(res);
  },

  // Gym Admin Management
  getAdminDashboard: async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  checkInMember: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateMemberStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/admin/members/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  addGymMember: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateGymMember: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/members/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteGymMember: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateGymFeeStructure: async (data) => {
    const body = Array.isArray(data) ? { plans: data } : data;
    const res = await fetch(`${BASE_URL}/admin/fee-structure`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  switchAdminGym: async (gymId) => {
    const res = await fetch(`${BASE_URL}/admin/link-gym`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ gymId })
    });
    return handleResponse(res);
  },

  confirmCashToken: async (tokenId) => {
    const res = await fetch(`${BASE_URL}/admin/confirm-cash-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tokenId })
    });
    return handleResponse(res);
  },

  customizeGymDetails: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/customize-gym`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Member Gym Redemption & Payment
  getMembershipStatus: async () => {
    const res = await fetch(`${BASE_URL}/gyms/membership-status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  payMembership: async (payload) => {
    const res = await fetch(`${BASE_URL}/gyms/pay-membership`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  applyMembership: async (payload) => {
    const res = await fetch(`${BASE_URL}/gyms/apply-membership`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getMyMembershipApplications: async () => {
    const res = await fetch(`${BASE_URL}/gyms/my-applications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  verifyMemberCode: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/verify-member-code`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeof payload === 'string' ? { verificationCode: payload } : payload)
    });
    return handleResponse(res);
  },

  getPendingMembers: async () => {
    const res = await fetch(`${BASE_URL}/admin/pending-members`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getGymMembers: async () => {
    const res = await fetch(`${BASE_URL}/gyms/members`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateMemberDetails: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/gyms/members/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Fee Structure & Rate Card APIs
  getGymFees: async (gymId = 'gym_1') => {
    const res = await fetch(`${BASE_URL}/gyms/${gymId}/fees`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getGymFeesPdf: async (gymId = 'gym_1') => {
    const res = await fetch(`${BASE_URL}/gyms/${gymId}/fees/pdf`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMemberReceiptPdf: async (receiptId) => {
    const res = await fetch(`${BASE_URL}/gyms/receipt/${receiptId}/pdf`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Admin Fee Structure Management
  createFeePlan: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/fees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateFeePlan: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/fees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteFeePlan: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/fees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  reorderFeePlans: async (orderList) => {
    const res = await fetch(`${BASE_URL}/admin/fees/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderList })
    });
    return handleResponse(res);
  },

  updateGymTerms: async (gymId, payload) => {
    const res = await fetch(`${BASE_URL}/admin/gyms/${gymId}/terms`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  publishFeeStructure: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/fees/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Member Gym Redemption & Collaboration Code
  getRedemptionDetails: async () => {
    const res = await fetch(`${BASE_URL}/gyms/redemption-details`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getRedemptionHistory: async () => {
    const res = await fetch(`${BASE_URL}/gyms/redemption-history`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  redeemGymCode: async (code, gymId = 'gym_1', note = '') => {
    const res = await fetch(`${BASE_URL}/gyms/redeem-code`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, gymId, note })
    });
    return handleResponse(res);
  },

  // Admin Redemption Verification & Sync
  adminVerifyRedemptionCode: async (redemptionCode, action = 'approve') => {
    const res = await fetch(`${BASE_URL}/admin/verify-redemption-code`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ redemptionCode, action })
    });
    return handleResponse(res);
  },

  getAdminCollaborationCode: async () => {
    const res = await fetch(`${BASE_URL}/admin/collaboration-code`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Gym Machines & Equipment Maintenance
  getEquipment: async () => {
    const res = await fetch(`${BASE_URL}/admin/equipment`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  addEquipment: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/equipment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateEquipment: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/equipment/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteEquipment: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  logEquipmentService: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/equipment/${id}/service-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Maintenance Directory (Admin Only)
  getMaintenanceDirectory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/directory${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getDirectoryEntry: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/directory/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createDirectoryEntry: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/directory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateDirectoryEntry: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/directory/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteDirectoryEntry: async (id, permanent = false) => {
    const res = await fetch(`${BASE_URL}/admin/directory/${id}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  exportDirectoryCsv: async () => {
    const res = await fetch(`${BASE_URL}/admin/directory/export-csv`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    return res.text();
  },

  // Admin Confidential Notes & Sentences Scratchpad (Admin Only)
  getAdminNotes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/notes${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAdminNoteById: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/notes/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createAdminNote: async (payload) => {
    const res = await fetch(`${BASE_URL}/admin/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateAdminNote: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/admin/notes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  deleteAdminNote: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};



