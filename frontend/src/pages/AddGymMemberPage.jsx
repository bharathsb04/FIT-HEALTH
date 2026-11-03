import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle,
  Copy,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  QrCode,
  ArrowRight,
  RefreshCw,
  Check,
  Dumbbell,
  Phone,
  Mail,
  User,
  Tag,
  Edit3,
  Building2,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { api } from '../services/api';

export const AddGymMemberPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useFitness();

  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [applications, setApplications] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [latestCode, setLatestCode] = useState(null);

  // Customization Tag Mode for Gym Facility & Location
  const [isCustomGym, setIsCustomGym] = useState(false);

  // Enrollment Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gymName: 'rsv gym and sports club',
    gymId: 'gym_1',
    gymLocation: '442 Fitness Boulevard, Downtown Metro',
    isCustomGym: false,
    plan: 'Monthly Pro Fitness',
    planId: 'plan_monthly',
    amount: 1999,
    durationDays: 30,
    preferredTrainer: 'Coach Marcus Vance (CSCS, USAW-2)',
    notes: ''
  });

  const availableGyms = [
    { id: 'gym_1', name: 'rsv gym and sports club', address: '442 Fitness Boulevard, Downtown Metro' },
    { id: 'gym_2', name: 'Iron Fortress Barbell Club', address: '12 West Avenue, North Sector' },
    { id: 'gym_3', name: 'Peak Performance CrossFit', address: '88 Olympic Way, South Hub' }
  ];

  const DEFAULT_PLANS = [
    { id: 'plan_monthly', name: 'Monthly Pro Fitness', durationDays: 30, amount: 1999, tag: 'Most Popular' },
    { id: 'plan_quarterly', name: 'Quarterly Strength & Conditioning', durationDays: 90, amount: 4999, tag: 'Best Value' },
    { id: 'plan_annual', name: 'Annual Elite Athlete Club', durationDays: 365, amount: 14999, tag: 'VIP Access' },
    { id: 'plan_daypass', name: 'Single Day Access Pass', durationDays: 1, amount: 299, tag: 'Trial' }
  ];

  const [availablePlans, setAvailablePlans] = useState(DEFAULT_PLANS);
  const [showFeeEditorModal, setShowFeeEditorModal] = useState(false);
  const [editingPlans, setEditingPlans] = useState([]);
  const [savingFeeStructure, setSavingFeeStructure] = useState(false);

  const trainers = [
    'Coach Marcus Vance (CSCS, USAW-2)',
    'Coach Priya Nair (Kettlebell & Mobility)',
    'Coach Vikram Rao (Strength & Powerlifting)',
    'None Assigned (General Floor Access)'
  ];

  const loadFeeStructure = async (gymId = 'gym_1') => {
    try {
      const res = await api.getGymFees(gymId);
      if (res && res.success && res.feePlans && res.feePlans.length > 0) {
        const mapped = res.feePlans.map(p => ({
          id: p.id,
          name: p.name,
          durationDays: Number(p.duration_days) || Number(p.durationDays) || 30,
          amount: Number(p.price) || Number(p.amount) || 1999,
          tag: p.badge || p.tag || (p.is_popular ? 'Most Popular' : '')
        }));
        setAvailablePlans(mapped);

        // Synchronize selected plan with loaded plans if necessary
        setFormData(prev => {
          const match = mapped.find(p => p.id === prev.planId);
          if (match) {
            return {
              ...prev,
              plan: match.name,
              amount: match.amount,
              durationDays: match.durationDays
            };
          } else if (mapped.length > 0) {
            return {
              ...prev,
              plan: mapped[0].name,
              planId: mapped[0].id,
              amount: mapped[0].amount,
              durationDays: mapped[0].durationDays
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Could not load custom fee structure, using active plans:', err.message);
    }
  };

  const loadApplications = async () => {
    try {
      setFetchingHistory(true);
      const res = await api.getMyMembershipApplications();
      if (res && res.success) {
        setApplications(res.applications || []);
        // If there is an active/pending code, set the latest code
        if (res.applications && res.applications.length > 0) {
          const pending = res.applications.find(a => a.status === 'Pending Admin Verification');
          if (pending) {
            setLatestCode(pending);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch existing applications:', err.message);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadApplications();
    loadFeeStructure(formData.gymId || 'gym_1');
  }, []);

  const handleOpenFeeEditor = () => {
    setEditingPlans(availablePlans.map(p => ({ ...p })));
    setShowFeeEditorModal(true);
  };

  const handlePlanChange = (index, field, value) => {
    setEditingPlans(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddNewPlan = () => {
    const newId = `plan_custom_${Date.now()}`;
    const newPlan = {
      id: newId,
      name: 'Custom Fitness Tier',
      durationDays: 60,
      amount: 2999,
      tag: 'Special Offer'
    };
    setEditingPlans(prev => [...prev, newPlan]);
  };

  const handleDeletePlan = (index) => {
    if (editingPlans.length <= 1) {
      showToast('You must keep at least 1 membership fee tier.', 'warning');
      return;
    }
    setEditingPlans(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetToDefaults = () => {
    setEditingPlans(DEFAULT_PLANS.map(p => ({ ...p })));
    showToast('Reset fee structure to standard Fit Health plans.', 'info');
  };

  const handleSaveFeeStructure = async () => {
    for (const p of editingPlans) {
      if (!p.name || !p.name.trim()) {
        showToast('All plan tiers must have a valid title.', 'error');
        return;
      }
      if (isNaN(Number(p.amount)) || Number(p.amount) < 0) {
        showToast(`Please enter a valid price for ${p.name}.`, 'error');
        return;
      }
      if (isNaN(Number(p.durationDays)) || Number(p.durationDays) <= 0) {
        showToast(`Please enter a valid duration in days for ${p.name}.`, 'error');
        return;
      }
    }

    setSavingFeeStructure(true);
    try {
      const sanitizedPlans = editingPlans.map((p, idx) => ({
        id: p.id || `plan_${Date.now()}_${idx}`,
        gym_id: formData.gymId && formData.gymId !== 'custom' ? formData.gymId : 'gym_1',
        name: p.name.trim(),
        duration_days: Number(p.durationDays),
        durationDays: Number(p.durationDays),
        billingDuration: `${p.durationDays} Days`,
        price: Number(p.amount),
        amount: Number(p.amount),
        admission_fee: 0,
        discount: p.discount || '',
        tax_percent: 18,
        features: p.features || ['Full gym floor access', 'Standard locker rooms'],
        is_active: true,
        is_popular: p.tag === 'Most Popular',
        badge: p.tag || '',
        tag: p.tag || '',
        sort_order: idx + 1
      }));

      const res = await api.updateGymFeeStructure({ plans: sanitizedPlans });
      if (res && res.success) {
        setAvailablePlans(editingPlans);
        const currentUpdated = editingPlans.find(p => p.id === formData.planId) || editingPlans[0];
        if (currentUpdated) {
          setFormData(prev => ({
            ...prev,
            plan: currentUpdated.name,
            planId: currentUpdated.id,
            amount: Number(currentUpdated.amount),
            durationDays: Number(currentUpdated.durationDays)
          }));
        }
        showToast('Gym fee structure updated and published successfully! 💰', 'success');
        setShowFeeEditorModal(false);
      } else {
        showToast(res?.message || 'Failed to update fee structure.', 'error');
      }
    } catch (err) {
      showToast('Error saving fee structure: ' + err.message, 'error');
    } finally {
      setSavingFeeStructure(false);
    }
  };

  const handlePlanSelect = (selectedPlan) => {
    setFormData(prev => ({
      ...prev,
      plan: selectedPlan.name,
      planId: selectedPlan.id,
      amount: selectedPlan.amount,
      durationDays: selectedPlan.durationDays
    }));
  };

  const handleGymSelect = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomGym(true);
      setFormData(prev => ({
        ...prev,
        gymId: 'custom',
        gymName: '',
        gymLocation: '',
        isCustomGym: true
      }));
      return;
    }

    const selected = availableGyms.find(g => g.id === val);
    if (selected) {
      setIsCustomGym(false);
      setFormData(prev => ({
        ...prev,
        gymId: selected.id,
        gymName: selected.name,
        gymLocation: selected.address,
        isCustomGym: false
      }));
      loadFeeStructure(selected.id);
    }
  };

  const handleToggleCustomGym = () => {
    if (isCustomGym) {
      const defaultGym = availableGyms[0];
      setIsCustomGym(false);
      setFormData(prev => ({
        ...prev,
        gymId: defaultGym.id,
        gymName: defaultGym.name,
        gymLocation: defaultGym.address,
        isCustomGym: false
      }));
    } else {
      setIsCustomGym(true);
      setFormData(prev => ({
        ...prev,
        gymId: 'custom',
        gymName: '',
        gymLocation: '',
        isCustomGym: true
      }));
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Verification code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Please provide your name and email.', 'error');
      return;
    }

    if (isCustomGym && !formData.gymName?.trim()) {
      showToast('Please enter the custom gym name.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        isCustomGym,
        gymName: isCustomGym ? formData.gymName.trim() : formData.gymName,
        gymLocation: isCustomGym ? (formData.gymLocation || '').trim() : formData.gymLocation
      };

      const res = await api.applyMembership(payload);
      if (res && res.success) {
        setLatestCode(res.application);
        showToast(`Verification code generated: ${res.verificationCode}`, 'success');
        await loadApplications();
      } else {
        showToast(res.message || 'Failed to submit application', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error submitting application', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '20px 16px 80px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.25)',
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
            background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
            color: '#0b0f19',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
          }}>
            <UserPlus size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                MEMBERSHIP REGISTRATION
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Step 1: Generate Code</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Add Gym Member & Generate Verification Code
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
              Enroll a member or athlete, choose a training plan, and generate a unique <strong>Verification Code</strong>. The gym administrator will enter this code in the Admin section to activate the membership.
            </p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('admin')}
            className="btn btn-secondary"
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} color="var(--primary)" />
            Open Admin Verify Section
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Grid Layout: Active Pass Card & Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: latestCode ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Pass Code Card (Displays when code is generated or user has pending code) */}
        {latestCode && (
          <div className="card" style={{
            border: latestCode.status === 'Active'
              ? '2px solid rgba(34, 197, 94, 0.6)'
              : '2px solid rgba(6, 182, 212, 0.6)',
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(11, 15, 25, 0.85) 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Hologram Accent Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: latestCode.status === 'Active'
                ? 'linear-gradient(90deg, #22c55e, #10b981)'
                : 'linear-gradient(90deg, #06b6d4, #3b82f6)'
            }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <QrCode size={16} color="var(--primary)" />
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--primary)' }}>
                      DIGITAL GYM PASS
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 0' }}>
                    {latestCode.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {latestCode.email}
                  </span>
                </div>
                <span className={`badge ${latestCode.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                  {latestCode.status === 'Active' ? 'Active & Enrolled' : 'Pending Admin Verification'}
                </span>
              </div>

              {/* Large Monospace Verification Code Display */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1.5px dashed rgba(6, 182, 212, 0.45)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                margin: '14px 0'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  Verification Code to Present to Admin
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '2.5px',
                  color: '#22c55e',
                  textShadow: '0 0 16px rgba(34, 197, 94, 0.4)'
                }}>
                  {latestCode.verificationCode}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(latestCode.verificationCode)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', gap: '6px' }}
                  >
                    {copiedCode === latestCode.verificationCode ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                    {copiedCode === latestCode.verificationCode ? 'Copied to Clipboard!' : 'Copy Verification Code'}
                  </button>
                </div>
              </div>

              {/* Details List */}
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span>Home Gym:</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{latestCode.gymName}</strong>
                      {latestCode.isCustomGym && (
                        <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 5px', gap: '2px', display: 'inline-flex', alignItems: 'center' }}>
                          <Tag size={9} />
                          CUSTOM
                        </span>
                      )}
                    </div>
                    {latestCode.gymLocation && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        📍 {latestCode.gymLocation}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span>Plan Tier:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{latestCode.plan} ({latestCode.durationDays} Days)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span>Fee / Amount:</span>
                  <strong style={{ color: '#22c55e' }}>₹{latestCode.amount?.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span>Trainer:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{latestCode.preferredTrainer || 'Marcus Vance'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                  <span>Created:</span>
                  <span>{new Date(latestCode.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Instruction Footer */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--cyan)' }}>How to finalize membership:</strong>
              <div style={{ marginTop: '4px' }}>
                1. Take a screenshot or copy code <strong>{latestCode.verificationCode}</strong>.<br />
                2. Share this code with the gym administrator.<br />
                3. Once the admin enters this code into the Admin Dashboard, your membership will become immediately active.
              </div>
            </div>
          </div>
        )}

        {/* Member Application Form */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                Membership Application Form
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Fill in member details to produce an active verification code pass
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Name & Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ fontSize: '13px', height: '40px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="alex@fitness.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ fontSize: '13px', height: '40px' }}
                />
              </div>
            </div>

            {/* Phone & Gym Selector Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ fontSize: '13px', height: '40px' }}
                />
              </div>

              {/* Gym Facility with Customization Tag */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Home Gym Facility
                  </label>

                  {/* Customization Tag Button */}
                  <button
                    type="button"
                    onClick={handleToggleCustomGym}
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: isCustomGym ? '1px solid var(--cyan)' : '1px solid var(--primary)',
                      background: isCustomGym ? 'rgba(6, 182, 212, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                      color: isCustomGym ? 'var(--cyan)' : 'var(--primary)',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    title="Click to toggle custom gym name and location"
                  >
                    <Tag size={10} />
                    {isCustomGym ? '🏷️ Custom Gym Active' : '+ Customization Tag'}
                  </button>
                </div>

                {!isCustomGym ? (
                  <>
                    <select
                      className="form-input"
                      value={formData.gymId}
                      onChange={handleGymSelect}
                      style={{ fontSize: '13px', height: '40px' }}
                    >
                      {availableGyms.map(gym => (
                        <option key={gym.id} value={gym.id}>
                          {gym.name}
                        </option>
                      ))}
                      <option value="custom">✨ Customize Gym Name & Location (+ Custom Tag)</option>
                    </select>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={10} />
                      {formData.gymLocation || '442 Fitness Boulevard, Downtown Metro'}
                    </div>
                  </>
                ) : (
                  /* Customization Tag Mode: Custom Gym Name & Location Inputs */
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1.5px dashed rgba(6, 182, 212, 0.45)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 16px rgba(6, 182, 212, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-primary" style={{ fontSize: '10px', gap: '4px', display: 'inline-flex', alignItems: 'center', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
                        <Tag size={10} />
                        CUSTOMIZATION TAG APPLIED
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleCustomGym}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Revert to Partner Gyms
                      </button>
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        <Building2 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        Custom Gym / Center Name *
                      </label>
                      <input
                        type="text"
                        required={isCustomGym}
                        className="form-input"
                        placeholder="e.g. Golds Gym, Cult.Fit, Powerhouse..."
                        value={formData.gymName}
                        onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                        style={{ fontSize: '12px', height: '36px', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        Custom Gym Location / Branch Address *
                      </label>
                      <input
                        type="text"
                        required={isCustomGym}
                        className="form-input"
                        placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                        value={formData.gymLocation}
                        onChange={(e) => setFormData({ ...formData, gymLocation: e.target.value })}
                        style={{ fontSize: '12px', height: '36px', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Tier Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Select Membership Plan Tier *</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    ({availablePlans.length} active tiers)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleOpenFeeEditor}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Configure & edit membership fee tiers"
                >
                  <Edit3 size={13} />
                  Edit Fee Structure
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {availablePlans.map(plan => {
                  const isSelected = formData.planId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800 }}>
                          {plan.tag || 'Standard'}
                        </span>
                        {isSelected && <Check size={14} color="var(--primary)" />}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
                        {plan.name}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', color: '#22c55e' }}>
                        ₹{Number(plan.amount).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {plan.durationDays} Days Access
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trainer Assignment */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                Preferred Trainer / Coach
              </label>
              <select
                className="form-input"
                value={formData.preferredTrainer}
                onChange={(e) => setFormData({ ...formData, preferredTrainer: e.target.value })}
                style={{ fontSize: '13px', height: '40px' }}
              >
                {trainers.map((tr, idx) => (
                  <option key={idx} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Notes / Health Conditions */}
            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                Special Notes / Health Goals (Optional)
              </label>
              <textarea
                rows={2}
                className="form-input"
                placeholder="e.g. Focus on strength training, recovering from mild knee strain..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ fontSize: '12px', resize: 'vertical' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: '8px',
                height: '46px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Generating Verification Code...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Verification Code & Submit Application
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* History of Submitted Applications */}
      <div className="card" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Submitted Verification Codes & History
            </h3>
            <span className="badge badge-secondary" style={{ fontSize: '10px' }}>
              {applications.length} Records
            </span>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '11px', gap: '4px' }}
          >
            <RefreshCw size={12} className={fetchingHistory ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        {fetchingHistory ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            border: '1.5px dashed var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600 }}>
              No applications submitted yet.
            </p>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Fill in the form above to generate your first gym verification code pass.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {applications.map(app => {
              const isCurrent = latestCode && latestCode.id === app.id;
              const isActive = app.status === 'Active' || app.status === 'Enrolled';
              return (
                <div
                  key={app.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isCurrent ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: isActive ? '#22c55e' : '#eab308',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      {isActive ? <CheckCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: 800,
                          color: 'var(--text-primary)'
                        }}>
                          {app.verificationCode}
                        </span>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                          {app.status}
                        </span>
                        {app.isCustomGym && (
                          <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 5px', gap: '2px', display: 'inline-flex', alignItems: 'center' }}>
                            <Tag size={9} />
                            CUSTOM GYM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {app.name} • {app.plan} • <strong>{app.gymName}</strong>
                        {app.gymLocation && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                            ({app.gymLocation})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(app.verificationCode)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}
                    >
                      {copiedCode === app.verificationCode ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                      {copiedCode === app.verificationCode ? 'Copied' : 'Copy'}
                    </button>
                    {isCurrent ? null : (
                      <button
                        type="button"
                        onClick={() => setLatestCode(app)}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '11px', padding: '5px 10px' }}
                      >
                        View Pass
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fee Structure Configuration & Editing Modal */}
      {showFeeEditorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="card" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-primary)',
            border: '1.5px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sliders size={18} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Edit Membership Fee Structure
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 40px' }}>
                  Customize plan names, fees in ₹ INR, validity duration, and badge tags for this gym.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeEditorModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* List of Fee Plans being edited */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {editingPlans.map((plan, idx) => (
                <div
                  key={plan.id || idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                      TIER #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: 'var(--rose)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Remove this tier"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                        Plan Title
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={plan.name}
                        onChange={(e) => handlePlanChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Monthly Pro"
                        style={{ fontSize: '12px', height: '34px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                        Fee Amount (₹ INR)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={plan.amount}
                        onChange={(e) => handlePlanChange(idx, 'amount', e.target.value)}
                        placeholder="1999"
                        min="0"
                        style={{ fontSize: '12px', height: '34px', color: '#22c55e', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={plan.durationDays}
                        onChange={(e) => handlePlanChange(idx, 'durationDays', e.target.value)}
                        placeholder="30"
                        min="1"
                        style={{ fontSize: '12px', height: '34px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                        Badge / Tag (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={plan.tag}
                        onChange={(e) => handlePlanChange(idx, 'tag', e.target.value)}
                        placeholder="e.g. Most Popular"
                        style={{ fontSize: '12px', height: '34px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions within Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddNewPlan}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  Add Plan Tier
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="btn btn-sm"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    fontSize: '11px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={12} />
                  Reset Defaults
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowFeeEditorModal(false)}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '12px', height: '36px', padding: '0 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFeeStructure}
                  className="btn btn-sm btn-primary"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    height: '36px',
                    padding: '0 18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  disabled={savingFeeStructure}
                >
                  <Check size={14} />
                  {savingFeeStructure ? 'Saving...' : 'Save & Publish Fee Structure'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddGymMemberPage;
