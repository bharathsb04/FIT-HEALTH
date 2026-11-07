import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  Shield,
  LogOut,
  Trash2,
  Edit3,
  CheckCircle2,
  Watch,
  Smartphone,
  Sparkles,
  Monitor,
  Maximize2,
  X,
  Building2,
  Award,
  Plus,
  Calendar,
  MapPin,
  Check
} from 'lucide-react';

const AVAILABLE_GYMS = [
  { id: 'gym_1', name: 'RSV Gym and Sports Club', address: '442 Fitness Boulevard, Downtown Metro', branch: 'Downtown Flagship' },
  { id: 'gym_2', name: 'Iron Fortress Barbell Club', address: '120 Powerlifting Way, Sector 5', branch: 'Sector 5 Branch' },
  { id: 'gym_3', name: 'Titan Strength Arena', address: '88 Westside Plaza, Olympic Road', branch: 'Westside Hub' },
  { id: 'gym_4', name: 'Pulse Fitness & CrossFit Studio', address: '14 North Avenue, High Intensity Park', branch: 'North Hub' },
  { id: 'gym_5', name: 'Olympus Peak Athletic Center', address: '77 Skyview Terrace, Uptown District', branch: 'Uptown Suite' }
];

const MEMBERSHIP_PLANS = [
  { id: 'plan_monthly', name: 'Standard Monthly All-Access', tier: 'Silver', price: 1499, duration: '1 Month' },
  { id: 'plan_quarterly', name: 'Pro Quarterly Conditioning', tier: 'Gold', price: 3999, duration: '3 Months' },
  { id: 'plan_annual', name: 'Elite Gold Annual All-Access', tier: 'Platinum', price: 11999, duration: '12 Months' },
  { id: 'plan_flex', name: 'Morning Flex & Cardio Pass', tier: 'Bronze', price: 999, duration: '1 Month' }
];

const TRAINERS = [
  'Coach Marcus Vance (Head Strength Coach)',
  'Coach Sarah Jenkins (Functional Movement)',
  'Coach David Miller (Hypertrophy & Bulking)',
  'Self-Guided (No Trainer Assigned)'
];

export const ProfilePage = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme, displayMetrics, setShowDisplayModal, isNativeFullscreen, toggleNativeFullscreen } = useTheme();
  const { showToast, triggerRefresh } = useFitness();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [savingMembership, setSavingMembership] = useState(false);

  const [membershipForm, setMembershipForm] = useState({
    gymId: user?.gymId || 'gym_1',
    planId: 'plan_annual',
    trainer: user?.assignedTrainer || 'Coach Marcus Vance',
    customCode: user?.membershipId || ''
  });

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    age: user?.age || 24,
    height: user?.height || 178,
    weight: user?.weight || 78.5,
    targetWeight: user?.targetWeight || 84.0,
    fitnessLevel: user?.fitnessLevel || 'Intermediate',
    primaryGoal: user?.primaryGoal || user?.goal || user?.fitnessGoal || 'Bulking',
    activityLevel: user?.activityLevel || 'Moderately Active (3-5 days/week)',
    dietaryPreference: user?.dietaryPreference || 'High Protein'
  });

  useEffect(() => {
    if (user) {
      const activeGoal = user.primaryGoal || user.goal || user.fitnessGoal || 'Bulking';
      setEditForm({
        name: user.name || '',
        age: user.age || 24,
        height: user.height || 178,
        weight: user.weight || 78.5,
        targetWeight: user.targetWeight || 84.0,
        fitnessLevel: user.fitnessLevel || 'Intermediate',
        primaryGoal: activeGoal,
        activityLevel: user.activityLevel || 'Moderately Active (3-5 days/week)',
        dietaryPreference: user.dietaryPreference || 'High Protein'
      });
      setMembershipForm(prev => ({
        ...prev,
        gymId: user.gymId || prev.gymId || 'gym_1',
        trainer: user.assignedTrainer || prev.trainer || 'Coach Marcus Vance',
        customCode: user.membershipId || prev.customCode || ''
      }));
    }
  }, [user, showEditModal]);

  const handleSaveMembership = async (e) => {
    if (e) e.preventDefault();
    setSavingMembership(true);
    try {
      const selectedGym = AVAILABLE_GYMS.find(g => g.id === membershipForm.gymId) || AVAILABLE_GYMS[0];
      const selectedPlan = MEMBERSHIP_PLANS.find(p => p.id === membershipForm.planId) || MEMBERSHIP_PLANS[2];
      const code = membershipForm.customCode?.trim() || `FH-MEM-${Math.floor(1000 + Math.random() * 9000)}`;

      await updateUserProfile({
        gymId: selectedGym.id,
        gymName: selectedGym.name,
        gymBranch: selectedGym.branch,
        membershipId: code,
        membershipStatus: 'Active',
        membershipPlan: selectedPlan.name,
        membershipTier: selectedPlan.tier,
        assignedTrainer: membershipForm.trainer,
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      setShowMembershipModal(false);
      showToast(`🎉 Gym Membership activated at ${selectedGym.name}!`, 'success');
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update membership', 'error');
    } finally {
      setSavingMembership(false);
    }
  };

  const handleRemoveMembership = async () => {
    if (!window.confirm('Are you sure you want to remove your gym membership from your profile?')) return;
    try {
      await updateUserProfile({
        gymId: null,
        gymName: null,
        gymBranch: null,
        membershipId: null,
        membershipStatus: 'None',
        membershipPlan: null,
        membershipTier: null,
        assignedTrainer: null
      });
      showToast('Gym Membership removed from profile.', 'info');
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to remove membership', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        goal: editForm.primaryGoal,
        fitnessGoal: editForm.primaryGoal
      };
      await updateUserProfile(payload);
      setShowEditModal(false);
      showToast('Profile and biometric targets successfully updated!', 'success');
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'FH';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="My Profile" subtitle="Account Settings & Biometric Parameters" />

      <div className="page-container" style={{ padding: '16px 20px 40px' }}>
        <div className="laptop-2-cols" style={{ gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: User Profile & Connected Wearables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User Profile Card */}
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '78px',
                height: '78px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '26px',
                fontWeight: 800,
                color: '#0b0f19',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
              }}>
                {getInitials(user?.name)}
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{user?.name || 'Gym Member'}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email || ''}</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                <span className={`badge badge-${(user?.primaryGoal || user?.goal || user?.fitnessGoal || 'Bulking').toLowerCase().replace(/\s+/g, '-')}`}>
                  {user?.primaryGoal || user?.goal || user?.fitnessGoal || 'Bulking'}
                </span>
                <span className="badge badge-fitness">
                  {user?.fitnessLevel || 'Intermediate'}
                </span>
              </div>

              <div className="grid-3" style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginTop: '18px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Age</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{user?.age || 24} yrs</h4>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Height</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{user?.height || 178} cm</h4>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Weight</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{user?.weight || 78.5} kg</h4>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary btn-full"
                style={{ marginTop: '16px', height: '42px', fontSize: '13px', fontWeight: 700 }}
              >
                <Edit3 size={15} /> Edit Profile & Targets
              </button>
            </div>

            {/* Dedicated Gym Membership Card */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <h4 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="var(--primary)" />
                  <span>Gym Membership & Club Enrollment</span>
                </h4>
                <span className={`badge ${user?.membershipStatus === 'Active' ? 'badge-fitness' : ''}`} style={{ fontSize: '10px' }}>
                  {user?.membershipStatus === 'Active' ? '● ENROLLED' : 'NOT ENROLLED'}
                </span>
              </div>

              {user?.membershipStatus === 'Active' ? (
                <div>
                  <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                    <div className="flex-between">
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{user?.gymName || 'RSV Gym and Sports Club'}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{user?.membershipPlan || 'Elite Gold Annual All-Access'}</span>
                      </div>
                      <span className="badge badge-fitness" style={{ fontSize: '11px' }}>{user?.membershipTier || 'Gold'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Membership ID:</span>
                        <div style={{ fontWeight: 800, color: 'var(--cyan)' }}>{user?.membershipId || 'FH-MEM-7829'}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Assigned Trainer:</span>
                        <div style={{ fontWeight: 700 }}>{user?.assignedTrainer || 'Coach Marcus Vance'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMembershipForm({
                          gymId: user?.gymId || 'gym_1',
                          planId: 'plan_annual',
                          trainer: user?.assignedTrainer || 'Coach Marcus Vance',
                          customCode: user?.membershipId || ''
                        });
                        setShowMembershipModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: '12px', height: '38px', fontWeight: 700 }}
                    >
                      <Edit3 size={13} /> Change Membership
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMembership}
                      className="btn btn-outline"
                      style={{ fontSize: '12px', height: '38px', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 6px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                    No gym membership is currently linked to your profile. You can enroll in an affiliated gym or bind an existing membership code.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMembershipForm({
                        gymId: 'gym_1',
                        planId: 'plan_annual',
                        trainer: 'Coach Marcus Vance',
                        customCode: ''
                      });
                      setShowMembershipModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ height: '40px', fontSize: '13px', fontWeight: 700, padding: '0 20px', gap: '6px' }}
                  >
                    <Plus size={15} /> Add Gym Membership
                  </button>
                </div>
              )}
            </div>

            {/* Connected Wearables Card */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '14px' }}>
                <Watch size={16} color="var(--primary)" />
                <span>Connected Wearables & Biometric Sensors</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Watch size={16} color="var(--cyan)" />
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Smart Watch / Wearable</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Apple Watch Ultra / Galaxy Watch 6</span>
                    </div>
                  </div>
                  <span className="badge badge-fitness" style={{ fontSize: '10px' }}>Synced</span>
                </div>
                <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={16} color="var(--primary)" />
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Mobile Motion Coprocessor</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pedometer & Accelerometer Active</span>
                    </div>
                  </div>
                  <span className="chip" style={{ fontSize: '10px', color: 'var(--primary)' }}>Real-time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preferences, Settings, Session */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Application Settings Section */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                <Settings size={16} color="var(--primary)" />
                <span>Preferences & Settings</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Theme Toggle */}
                <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {theme === 'dark' ? <Moon size={16} color="var(--indigo)" /> : <Sun size={16} color="var(--amber)" />}
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Appearance Theme</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current: {theme === 'dark' ? 'Dark Obsidian' : 'Clean Light'}</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Toggle
                  </button>
                </div>

                {/* Units Setting */}
                <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={16} color="var(--cyan)" />
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Unit System</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Metric (kg, cm, ml)</span>
                    </div>
                  </div>
                  <span className="chip" style={{ fontSize: '11px' }}>Metric</span>
                </div>

                {/* Push Notifications */}
                <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={16} color="var(--amber)" />
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Hydration & Workout Alerts</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Friendly push reminders</span>
                    </div>
                  </div>
                  <span className="badge badge-fitness">Active</span>
                </div>
              </div>
            </div>

            {/* Account Safety Actions */}
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px', color: 'var(--rose)' }}>
                Account Session
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={logout}
                  className="btn btn-secondary btn-full"
                  style={{ color: 'var(--text-primary)', height: '42px', fontSize: '13px' }}
                >
                  <LogOut size={16} /> Sign Out of Fit Health
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-outline btn-full"
                  style={{ color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', height: '42px', fontSize: '13px' }}
                >
                  <Trash2 size={15} /> Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Edit Biometrics & Goal</h3>
              <button onClick={() => setShowEditModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Primary Goal</label>
                  <select
                    className="form-select"
                    value={editForm.primaryGoal}
                    onChange={(e) => setEditForm({ ...editForm, primaryGoal: e.target.value })}
                  >
                    <option value="Bulking">Bulking</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Strength">Strength & Conditioning</option>
                    <option value="General fitness">General Fitness</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fitness Level</label>
                  <select
                    className="form-select"
                    value={editForm.fitnessLevel}
                    onChange={(e) => setEditForm({ ...editForm, fitnessLevel: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Athlete">Athlete</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ height: '46px', marginTop: '12px' }}>
                Save Profile & Recalculate Targets
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--rose-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trash2 size={26} color="var(--rose)" />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Delete Account?</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 20px' }}>
                This will delete your user profile and all workout records. This action cannot be reversed.
              </p>

              <div className="grid-2" style={{ gap: '10px' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    showToast('Account data reset.', 'info');
                  }}
                  className="btn btn-primary"
                  style={{ background: 'var(--rose)' }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Enroll Gym Membership Modal */}
      {showMembershipModal && (
        <div className="modal-overlay" onClick={() => setShowMembershipModal(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  {user?.membershipStatus === 'Active' ? 'Change Gym Membership' : 'Add Gym Membership'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Enroll into an affiliated fitness center or link your existing membership code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMembershipModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMembership}>
              {/* Gym Selection */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Affiliated Fitness Center</label>
                <select
                  className="form-input"
                  value={membershipForm.gymId}
                  onChange={(e) => setMembershipForm({ ...membershipForm, gymId: e.target.value })}
                  style={{ height: '44px', fontWeight: 700 }}
                  required
                >
                  {AVAILABLE_GYMS.map(gym => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name} ({gym.branch})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  📍 {AVAILABLE_GYMS.find(g => g.id === membershipForm.gymId)?.address}
                </span>
              </div>

              {/* Membership Plan Tier */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Membership Tier & Plan</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {MEMBERSHIP_PLANS.map(plan => {
                    const isSelected = membershipForm.planId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setMembershipForm({ ...membershipForm, planId: plan.id })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800 }}>{plan.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{plan.duration} &bull; Tier: {plan.tier}</div>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary)' }}>
                          ₹{plan.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trainer Assignment */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Assigned Trainer</label>
                <select
                  className="form-input"
                  value={membershipForm.trainer}
                  onChange={(e) => setMembershipForm({ ...membershipForm, trainer: e.target.value })}
                  style={{ height: '42px', fontSize: '13px' }}
                >
                  {TRAINERS.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Custom Membership ID / Token (Optional) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Existing Membership ID or Code (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FH-MEM-7829 (leave blank for auto-generation)"
                  value={membershipForm.customCode}
                  onChange={(e) => setMembershipForm({ ...membershipForm, customCode: e.target.value })}
                  style={{ height: '42px', fontSize: '13px', letterSpacing: '1px' }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  If you already registered at the front desk, enter your assigned ID here.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowMembershipModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '44px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, height: '44px', fontWeight: 800 }}
                  disabled={savingMembership}
                >
                  {savingMembership ? 'Activating...' : 'Confirm & Activate Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
