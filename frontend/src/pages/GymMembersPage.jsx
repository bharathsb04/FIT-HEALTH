import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Calendar,
  Dumbbell,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  Tag,
  ArrowRight,
  Key,
  Sparkles,
  Activity,
  Lock,
  Heart,
  Footprints,
  Moon,
  Copy,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';

export const GymMembersPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useFitness();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Member Verification Code State (Admin Section Enrollment)
  const [verificationInput, setVerificationInput] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [fetchingPending, setFetchingPending] = useState(false);

  // Member Credentials Card / Modal State
  const [enrolledCredentials, setEnrolledCredentials] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Edit Member Modal State (Works for BOTH User and Admin)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    plan: 'Monthly Pro Fitness',
    assignedTrainer: 'Coach Marcus Vance',
    status: 'Active',
    expiryDate: '',
    notes: '',
    emergencyContact: '',
    fitnessGoal: 'Bulking & Strength'
  });

  // Admin Read-Only Biometrics State (Strictly checks member consent)
  const [showBiometricsModal, setShowBiometricsModal] = useState(false);
  const [biometricsMember, setBiometricsMember] = useState(null);
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [biometricsResult, setBiometricsResult] = useState(null);

  const handleOpenBiometricsModal = async (member) => {
    setBiometricsMember(member);
    setShowBiometricsModal(true);
    setBiometricsLoading(true);
    setBiometricsResult(null);

    const targetId = member.userId || member.id;
    try {
      const res = await api.getMemberBiometricsForAdmin(targetId);
      setBiometricsResult(res);
    } catch (err) {
      setBiometricsResult({
        success: false,
        consented: false,
        message: err.message || 'Member has not consented to sharing biometric data with gym administrators.'
      });
    } finally {
      setBiometricsLoading(false);
    }
  };

  const availablePlans = [
    'Monthly Pro Fitness',
    'Quarterly Strength & Conditioning',
    'Annual Elite Athlete Club',
    'Elite Gold Annual',
    'Single Day Access Pass'
  ];

  const trainers = [
    'Coach Marcus Vance (CSCS, USAW-2)',
    'Coach Priya Nair (Kettlebell & Mobility)',
    'Coach Vikram Rao (Strength & Powerlifting)',
    'None Assigned (General Floor Access)'
  ];

  const isAdmin = user?.role === 'admin';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getGymMembers();
      if (res && res.success) {
        setMembers(res.members || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load gym members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApplicants = async () => {
    if (!isAdmin) return;
    try {
      setFetchingPending(true);
      const res = await api.getPendingMembers();
      if (res && res.success) {
        setPendingApplicants(res.pending || []);
      }
    } catch (err) {
      console.warn('Could not load pending applicants:', err.message);
    } finally {
      setFetchingPending(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    if (isAdmin) {
      fetchPendingApplicants();
    }
  }, [isAdmin]);

  const handleVerifyMemberCode = async (codeOverride) => {
    const targetCode = (codeOverride || verificationInput).trim().toUpperCase();
    if (!targetCode) {
      showToast('Please enter a verification code (e.g. FH-VER-8659)', 'error');
      return;
    }
    setVerifyingCode(true);
    try {
      const res = await api.verifyMemberCode({ verificationCode: targetCode });
      if (res && res.success) {
        showToast(res.message || `Member ${res.member?.name || ''} verified and enrolled!`, 'success');
        setVerificationInput('');
        if (res.credentials) {
          setEnrolledCredentials(res.credentials);
          setShowCredentialsModal(true);
        }
        fetchMembers();
        fetchPendingApplicants();
      } else {
        showToast(res?.message || 'Verification failed. Code not found.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setVerifyingCode(false);
    }
  };

  // Check if a member card belongs to the logged-in user
  const isSelf = (member) => {
    if (!user) return false;
    if (member.email && user.email && member.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (member.userId && member.userId === user.id) return true;
    if (user.membershipId && user.membershipId === member.membershipId) return true;
    return false;
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditForm({
      id: member.id || member.membershipId,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      plan: member.plan || 'Monthly Pro Fitness',
      assignedTrainer: member.assignedTrainer || 'Coach Marcus Vance',
      status: member.status || 'Active',
      expiryDate: member.expiryDate || '',
      notes: member.notes || '',
      emergencyContact: member.emergencyContact || '',
      fitnessGoal: member.fitnessGoal || member.primaryGoal || member.goal || 'Bulking'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      setSavingEdit(true);
      const payload = {
        ...editForm,
        primaryGoal: editForm.fitnessGoal,
        goal: editForm.fitnessGoal
      };
      const res = await api.updateMemberDetails(editForm.id, payload);
      if (res && res.success) {
        showToast(res.message || 'Member profile updated successfully!', 'success');
        setShowEditModal(false);
        fetchMembers();
      } else {
        showToast(res.message || 'Failed to update member', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error updating member', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (member) => {
    if (!isAdmin) return;
    const newStatus = member.status === 'Active' ? 'Frozen' : 'Active';
    try {
      const res = await api.updateMemberStatus(member.id || member.membershipId, newStatus);
      if (res && res.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchMembers();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDirectCheckIn = async (member) => {
    const pin = member.checkInPin || member.pin || member.membershipId?.replace(/\D/g, '')?.slice(-4) || '7829';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    try {
      const res = await api.checkInMember({
        pin,
        identifier: member.id || member.membershipId || pin,
        memberName: member.name,
        checkInTime: timeStr
      });
      if (res && res.success) {
        showToast(res.message || `Checked in ${member.name} successfully!`, 'success');
        fetchMembers();
      } else {
        showToast(res?.message || 'Check-in failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Check-in error', 'error');
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.membershipId && m.membershipId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.phone && m.phone.includes(searchQuery)) ||
      (m.plan && m.plan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (m.status && m.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const activeCount = members.filter(m => m.status === 'Active').length;
  const expiredCount = members.filter(m => m.status === 'Expired' || m.status === 'Frozen').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 80px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '16px',
        padding: '24px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #22c55e)',
            color: '#0b0f19',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                GYM ATHLETE ROSTER
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                • Edit Enabled for Users &amp; Admin
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Gym Members Directory
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
              View all registered gym athletes and membership profiles. Members can edit their personal details and assigned trainer preferences; administrators can manage membership plans and statuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={fetchMembers}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '12px', gap: '5px' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh Roster
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('add-member')}
            className="btn btn-sm btn-primary"
            style={{ fontSize: '12px', gap: '5px' }}
          >
            <Plus size={13} />
            Add Gym Member
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Registered
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {members.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Gym athletes on roster
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Members
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e', marginTop: '4px' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Valid access &amp; facility pass
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Frozen / Expired
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#eab308', marginTop: '4px' }}>
            {expiredCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Pending renewal
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Access Mode
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isAdmin ? 'var(--amber)' : 'var(--cyan)', marginTop: '6px' }}>
            {isAdmin ? '🛡️ Administrator Access' : '🏋️ Gym Member Access'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isAdmin ? 'Full edit & roster authority' : 'Self-edit profile enabled'}
          </div>
        </div>
      </div>

      {/* Admin-Only: Verify & Add Member via Verification Code */}
      {isAdmin && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="var(--amber)" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Add Member via Verification Code
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Enter the verification code from the athlete's <strong>Add Gym Member</strong> pass to verify and activate their membership.
                </p>
              </div>
            </div>
            {pendingApplicants.length > 0 && (
              <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px' }}>
                {pendingApplicants.length} Pending Verification
              </span>
            )}
          </div>

          {/* Verification Code Input Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Verification Code (e.g. FH-VER-8659)"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyMemberCode();
                  }
                }}
                style={{
                  height: '44px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  paddingLeft: '38px',
                  borderColor: 'rgba(245, 158, 11, 0.4)'
                }}
              />
              <Key size={16} color="var(--amber)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>

            <button
              type="button"
              disabled={verifyingCode || !verificationInput.trim()}
              onClick={() => handleVerifyMemberCode()}
              className="btn btn-primary"
              style={{
                height: '44px',
                padding: '0 22px',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--amber), #d97706)',
                borderColor: 'var(--amber)',
                color: '#0b0f19',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{verifyingCode ? 'Verifying Code...' : 'Verify & Enroll Member'}</span>
            </button>
          </div>

          {/* Pending Applications Quick-Pick Chips */}
          {pendingApplicants.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Pending Applicant Codes (Click to auto-verify):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {pendingApplicants.map(app => (
                  <button
                    key={app.id || app.verificationCode}
                    type="button"
                    onClick={() => {
                      setVerificationInput(app.verificationCode);
                      handleVerifyMemberCode(app.verificationCode);
                    }}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--amber)' }}>{app.name}:</span>
                    <code style={{ fontFamily: 'monospace', fontWeight: 700 }}>{app.verificationCode}</code>
                    <ArrowRight size={12} color="var(--amber)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search members by name, email, member ID, phone, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', height: '40px', fontSize: '13px' }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'active', 'frozen', 'expired'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className="chip"
                style={{
                  textTransform: 'capitalize',
                  fontSize: '11px',
                  background: statusFilter === status ? 'var(--primary)' : 'var(--bg-surface)',
                  color: statusFilter === status ? '#0b0f19' : 'var(--text-secondary)',
                  borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border-color)',
                  fontWeight: 800,
                  padding: '6px 12px'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading gym members roster...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px dashed var(--border-color)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>
            No matching gym members found
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Try adjusting your search criteria or register a new member.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredMembers.map(member => {
            const isUserSelf = isSelf(member);
            const canEdit = isAdmin || isUserSelf;
            const isActive = member.status === 'Active';

            return (
              <div
                key={member.id || member.membershipId}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: isUserSelf
                    ? '1.5px solid rgba(6, 182, 212, 0.6)'
                    : '1px solid var(--border-color)',
                  background: isUserSelf
                    ? 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(6, 182, 212, 0.05) 100%)'
                    : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                {/* Left: Avatar & Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: isUserSelf
                      ? 'linear-gradient(135deg, #06b6d4, #22c55e)'
                      : (isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'),
                    color: isUserSelf ? '#0b0f19' : (isActive ? '#22c55e' : '#eab308'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px'
                  }}>
                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {member.name}
                      </strong>
                      <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                        {member.status || 'Active'}
                      </span>
                      {isUserSelf && (
                        <span className="badge badge-primary" style={{ fontSize: '9px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
                          YOU (CURRENT USER)
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                      }}>
                        {member.membershipId}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {member.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} color="var(--text-muted)" />
                          {member.email}
                        </span>
                      )}
                      {member.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} color="var(--text-muted)" />
                          {member.phone}
                        </span>
                      )}
                      {member.plan && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Dumbbell size={12} color="var(--primary)" />
                          {member.plan}
                        </span>
                      )}
                    </div>

                    {(member.assignedTrainer || member.fitnessGoal || member.primaryGoal || member.notes) && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Coach: <strong>{member.assignedTrainer || 'Marcus Vance'}</strong>
                        {(member.fitnessGoal || member.primaryGoal || member.goal) ? (
                          <span> • Goal: <strong style={{ color: 'var(--primary)' }}>{member.fitnessGoal || member.primaryGoal || member.goal}</strong></span>
                        ) : null}
                        {member.notes ? ` • Note: ${member.notes}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions & Edit Option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDirectCheckIn(member)}
                      className="btn btn-sm btn-primary"
                      style={{
                        fontSize: '11px',
                        padding: '6px 10px',
                        gap: '4px',
                        background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                        color: '#0b0f19',
                        fontWeight: 800,
                        border: 'none'
                      }}
                      title={`Check In ${member.name} (${member.membershipId})`}
                    >
                      <Clock size={12} />
                      <span>Check-In</span>
                    </button>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="btn btn-sm btn-secondary"
                      style={{
                        fontSize: '11px',
                        padding: '6px 12px',
                        gap: '5px',
                        fontWeight: 700,
                        border: isUserSelf ? '1px solid rgba(6, 182, 212, 0.5)' : undefined
                      }}
                      title={isUserSelf ? 'Edit your membership details' : 'Edit member record (Admin)'}
                    >
                      <Edit3 size={13} color={isUserSelf ? 'var(--cyan)' : 'var(--primary)'} />
                      {isUserSelf ? 'Edit My Details' : 'Edit Member'}
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setEnrolledCredentials({
                          name: member.name,
                          email: member.email,
                          password: member.temporaryPassword || member.initialPassword || `Fit@${member.membershipId?.replace(/\D/g, '')?.slice(-4) || '7829'}`,
                          membershipId: member.membershipId,
                          plan: member.plan,
                          expiryDate: member.expiryDate,
                          gymName: member.gymName || 'rsv gym and sports club'
                        });
                        setShowCredentialsModal(true);
                      }}
                      className="btn btn-sm btn-outline"
                      style={{
                        fontSize: '11px',
                        padding: '6px 10px',
                        gap: '4px',
                        borderColor: 'rgba(6, 182, 212, 0.4)',
                        color: 'var(--cyan)',
                        fontWeight: 700
                      }}
                      title="View member login credentials and password"
                    >
                      <Key size={12} />
                      <span>Credentials</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenBiometricsModal(member)}
                      className="btn btn-sm btn-outline"
                      style={{
                        fontSize: '11px',
                        padding: '6px 10px',
                        gap: '4px',
                        borderColor: 'rgba(244, 63, 94, 0.4)',
                        color: 'var(--rose)',
                        fontWeight: 700
                      }}
                      title={`View live biometrics for ${member.name} (Samsung Health)`}
                    >
                      <Activity size={12} />
                      <span>Biometrics</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(member)}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      title="Toggle Active / Frozen status"
                    >
                      {isActive ? 'Freeze' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Member Modal (Shared for Both User and Admin) */}
      {showEditModal && editingMember && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                    {isSelf(editingMember) ? 'Edit My Membership Profile' : `Edit Member: ${editingMember.name}`}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isAdmin ? 'Administrative Edit Mode' : 'Self-Service Profile Edit'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Admin-only Plan & Status Controls */}
              {isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                      Plan Tier (Admin)
                    </label>
                    <select
                      className="form-input"
                      value={editForm.plan}
                      onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                      style={{ fontSize: '12px' }}
                    >
                      {availablePlans.map((pl, idx) => (
                        <option key={idx} value={pl}>{pl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                      Status (Admin)
                    </label>
                    <select
                      className="form-input"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Assigned Coach / Trainer
                </label>
                <select
                  className="form-input"
                  value={editForm.assignedTrainer}
                  onChange={(e) => setEditForm({ ...editForm, assignedTrainer: e.target.value })}
                  style={{ fontSize: '12px' }}
                >
                  {trainers.map((tr, idx) => (
                    <option key={idx} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Primary Fitness Goal
                </label>
                <select
                  className="form-input"
                  value={editForm.fitnessGoal}
                  onChange={(e) => setEditForm({ ...editForm, fitnessGoal: e.target.value })}
                  style={{ fontSize: '12px' }}
                >
                  <option value="Bulking">Bulking (Muscle Mass)</option>
                  <option value="Cutting">Cutting (Fat Loss)</option>
                  <option value="Strength">Strength & Conditioning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="General fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Special Notes & Workout Preferences
                </label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Focus on strength training, recovery..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  style={{ fontSize: '12px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn btn-primary"
                  style={{ flex: 2, fontSize: '13px', fontWeight: 800, gap: '6px' }}
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Save Member Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Portal: Read-Only Member Biometrics Modal */}
      {showBiometricsModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: '26px', background: '#0e1626', borderColor: 'var(--border-color)',
            borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div className="flex-between" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Activity size={20} color="var(--rose)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {biometricsMember?.name}'s Biometrics
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Gym Admin Telemetry • {biometricsMember?.membershipId || biometricsMember?.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBiometricsModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {biometricsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                <span>Checking member privacy consent & loading telemetry...</span>
              </div>
            ) : biometricsResult && !biometricsResult.consented ? (
              /* Privacy Shield: Member has NOT granted consent */
              <div style={{
                textAlign: 'center', padding: '32px 18px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                borderRadius: '16px'
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <Lock size={26} color="var(--amber)" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  Biometric Data Protected
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 14px', lineHeight: 1.5 }}>
                  <strong>{biometricsMember?.name}</strong> has not granted consent to share personal health records with gym staff.
                </p>
                <div style={{
                  padding: '10px 14px', background: 'var(--bg-surface)',
                  borderRadius: '10px', fontSize: '11px', color: 'var(--text-muted)',
                  textAlign: 'left', lineHeight: 1.5
                }}>
                  💡 <strong>Privacy Policy:</strong> Health Connect biometrics (Heart rate, ECG, BP, Sleep) remain strictly confidential to the athlete unless they explicitly enable <em>"Share Biometrics with Gym Admin"</em> in their Fit Health Vitals settings.
                </div>
              </div>
            ) : biometricsResult && biometricsResult.consented && biometricsResult.metrics ? (
              /* Telemetry View: Member HAS granted consent */
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px',
                  marginBottom: '16px', fontSize: '11px'
                }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    ✅ Member Consent Active
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Synced: {new Date(biometricsResult.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Daily Steps</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                      {(biometricsResult.metrics.steps?.value || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Heart Rate</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--rose)', marginTop: '4px' }}>
                      {biometricsResult.metrics.heart_rate?.value || '--'} BPM
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Resting HR</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', marginTop: '4px' }}>
                      {biometricsResult.metrics.resting_heart_rate?.value || '--'} BPM
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Blood Pressure</span>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
                      {biometricsResult.metrics.blood_pressure?.value
                        ? `${biometricsResult.metrics.blood_pressure.value.systolic}/${biometricsResult.metrics.blood_pressure.value.diastolic} mmHg`
                        : '--'}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Blood Oxygen (SpO2)</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', marginTop: '4px' }}>
                      {biometricsResult.metrics.oxygen_saturation?.value || '--'}%
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Sleep Duration</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#8b5cf6', marginTop: '4px' }}>
                      {biometricsResult.metrics.sleep?.value ? `${Number(biometricsResult.metrics.sleep.value).toFixed(1)} hrs` : '--'}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Body Weight</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--amber)', marginTop: '4px' }}>
                      {biometricsResult.metrics.weight?.value ? `${biometricsResult.metrics.weight.value} kg` : '--'}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Body Fat %</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', marginTop: '4px' }}>
                      {biometricsResult.metrics.body_fat?.value ? `${biometricsResult.metrics.body_fat.value}%` : '--'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Device: {biometricsResult.deviceModel || 'Samsung Galaxy S24 Ultra'} • Source: Samsung Health
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No telemetry recorded for this member yet.
              </div>
            )}
          </div>
        </div>
      )}
      {/* MEMBER ACCOUNT CREDENTIALS & HANDOFF MODAL */}
      {showCredentialsModal && enrolledCredentials && (
        <div className="modal-overlay" onClick={() => setShowCredentialsModal(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="sheet-handle" />

            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#080c14'
                }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                    Member Login Credentials
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Gym member details &amp; self-login password
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Member Details Showcase Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                    Member Full Name
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {enrolledCredentials.name}
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 800 }}>
                  Active Member
                </span>
              </div>

              {/* Email / Username */}
              <div style={{
                background: 'rgba(8, 12, 20, 0.6)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Login Email / User ID
                  </span>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--cyan)' }}>
                    {enrolledCredentials.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(enrolledCredentials.email);
                    showToast('Email copied to clipboard!', 'info');
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                >
                  <Copy size={11} /> Copy
                </button>
              </div>

              {/* Password */}
              <div style={{
                background: 'rgba(8, 12, 20, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Member Login Password
                  </span>
                  <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>
                    {showPasswordText ? enrolledCredentials.password : '••••••••••••'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title={showPasswordText ? 'Hide Password' : 'Show Password'}
                  >
                    {showPasswordText ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(enrolledCredentials.password);
                      showToast('Password copied to clipboard!', 'success');
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px', gap: '4px', color: 'var(--amber)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
              </div>

              {/* Membership ID & Plan Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(8, 12, 20, 0.4)', borderRadius: '8px', padding: '8px 10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Membership ID</span>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {enrolledCredentials.membershipId}
                  </div>
                </div>
                <div style={{ background: 'rgba(8, 12, 20, 0.4)', borderRadius: '8px', padding: '8px 10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Plan / Expiry</span>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                    {enrolledCredentials.plan} ({enrolledCredentials.expiryDate})
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Security Concern Notice */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', color: '#f87171', display: 'block', marginBottom: '2px' }}>
                  Security &amp; Access Policy
                </strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  These credentials belong exclusively to the gym member. As a security measure, <strong>administrators cannot log in using member credentials on the Admin Portal</strong>. The member should take this email &amp; password and log in through the <strong>Member Login</strong> portal to access their workouts, nutrition, and gym privileges.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const summary = `Fit Health - Member Login Credentials\nMember: ${enrolledCredentials.name}\nGym: ${enrolledCredentials.gymName || 'rsv gym and sports club'}\nEmail: ${enrolledCredentials.email}\nPassword: ${enrolledCredentials.password}\nMembership ID: ${enrolledCredentials.membershipId}\nPlan: ${enrolledCredentials.plan}\nValid Until: ${enrolledCredentials.expiryDate}\n\nLogin at: Select 'Member Login' on the Fit Health sign-in page.`;
                  navigator.clipboard.writeText(summary);
                  setCopiedCreds(true);
                  showToast('Complete credentials card copied to clipboard!', 'success');
                  setTimeout(() => setCopiedCreds(false), 3000);
                }}
                className="btn btn-primary"
                style={{ flex: 1, height: '42px', fontSize: '12px', fontWeight: 800, gap: '6px' }}
              >
                {copiedCreds ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCreds ? 'Copied to Clipboard!' : 'Copy Login Details for Member'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0 20px', height: '42px', fontSize: '12px', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymMembersPage;

