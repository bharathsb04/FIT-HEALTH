import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  IndianRupee,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  CreditCard,
  Banknote,
  FileText,
  AlertCircle,
  Building2,
  Phone,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Zap,
  Tag,
  Receipt,
  QrCode,
  Image as ImageIcon,
  Eye,
  Maximize2,
  Share2,
  Gift,
  Key,
  Users,
  Copy,
  CheckCheck,
  BadgeCheck,
  Lock,
  RotateCw,
  ArrowDownCircle,
  HelpCircle,
  Sparkle,
  Edit3,
  Plus,
  Trash2,
  Upload,
  Camera,
  Save,
  Ticket,
  History,
  Award,
  Percent,
  Coins
} from 'lucide-react';

export const GymFeesPage = () => {
  const { user } = useAuth();
  const { showToast, setActiveTab, navigateToAdminSection } = useFitness();

  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [selectedGymId, setSelectedGymId] = useState('gym_1');
  const [allGyms, setAllGyms] = useState([]);

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'card' | 'cash'
  const [processingPayment, setProcessingPayment] = useState(false);

  // Gym Redemption & Admin Collaboration State
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionDetails, setRedemptionDetails] = useState(null);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [verifyingCollaboration, setVerifyingCollaboration] = useState(false);
  const [copiedColabCode, setCopiedColabCode] = useState(false);
  const [showRedemptionBanner, setShowRedemptionBanner] = useState(true);

  // Available Redemptions & Payment Redemption State
  const [availableRedemptions, setAvailableRedemptions] = useState([]);
  const [appliedRedemption, setAppliedRedemption] = useState(null);
  const [customPromoInput, setCustomPromoInput] = useState('');
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'colab' | 'token' | 'voucher'
  const [redemptionModalTab, setRedemptionModalTab] = useState('pass'); // 'pass' | 'history'

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfRateCardData, setPdfRateCardData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Admin Fee Plan & Rate Card Editing State
  const [showFeePlanModal, setShowFeePlanModal] = useState(false);
  const [feePlanModalMode, setFeePlanModalMode] = useState('create'); // 'create' | 'edit'
  const [feePlanForm, setFeePlanForm] = useState({
    id: '',
    name: '',
    duration_days: 30,
    billingDuration: '1 Month(s)',
    price: 0,
    admission_fee: 0,
    discount: '',
    tax_percent: 18,
    features: '',
    is_active: true,
    is_popular: false,
    badge: ''
  });
  const [savingPlan, setSavingPlan] = useState(false);

  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [editRateCardNote, setEditRateCardNote] = useState('');
  const [editFeeImage, setEditFeeImage] = useState('');
  const [rateCardImageInput, setRateCardImageInput] = useState('');
  const [savingRateCard, setSavingRateCard] = useState(false);

  const fetchGymsAndFees = async () => {
    try {
      setLoading(true);
      const [feesRes, statusRes, gymsRes, redemptionRes] = await Promise.all([
        api.getGymFees(selectedGymId).catch(() => null),
        api.getMembershipStatus().catch(() => null),
        api.getGyms().catch(() => null),
        api.getRedemptionDetails().catch(() => null)
      ]);

      if (feesRes && feesRes.success) {
        setFeeData(feesRes);
      }
      if (statusRes && statusRes.success) {
        setMembershipStatus(statusRes);
        if (statusRes.gymId && selectedGymId === 'gym_1') {
          setSelectedGymId(statusRes.gymId);
        }
      }
      if (gymsRes && gymsRes.data) {
        setAllGyms(gymsRes.data);
      }
      if (redemptionRes && redemptionRes.success) {
        setRedemptionDetails(redemptionRes.redemption);
        if (redemptionRes.availableRedemptions && redemptionRes.availableRedemptions.length > 0) {
          setAvailableRedemptions(redemptionRes.availableRedemptions);
        }
        if (redemptionRes.history && redemptionRes.history.length > 0) {
          setRedemptionHistory(redemptionRes.history);
        }
      }
    } catch (err) {
      console.error('Failed to load gym fee data:', err);
      showToast('Could not load gym fees. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymsAndFees();
  }, [selectedGymId]);

  const handleOpenAddPlanModal = () => {
    setFeePlanModalMode('create');
    setFeePlanForm({
      id: '',
      name: '',
      duration_days: 30,
      billingDuration: '1 Month(s)',
      price: 1999,
      admission_fee: 0,
      discount: '',
      tax_percent: 18,
      features: 'Full Gym Floor Access, Locker Room Facility, General Trainer Support',
      is_active: true,
      is_popular: false,
      badge: ''
    });
    setShowFeePlanModal(true);
  };

  const handleOpenEditPlanModal = (plan) => {
    setFeePlanModalMode('edit');
    setFeePlanForm({
      id: plan.id,
      name: plan.name || '',
      duration_days: plan.duration_days || 30,
      billingDuration: plan.billingDuration || `${Math.round((plan.duration_days || 30) / 30)} Month(s)`,
      price: plan.price || 0,
      admission_fee: plan.admission_fee || 0,
      discount: plan.discount || '',
      tax_percent: plan.tax_percent !== undefined ? plan.tax_percent : 18,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features || ''),
      is_active: plan.is_active !== false,
      is_popular: Boolean(plan.is_popular),
      badge: plan.badge || ''
    });
    setShowFeePlanModal(true);
  };

  const handleSaveFeePlanModal = async (e) => {
    e.preventDefault();
    if (!feePlanForm.name.trim() || feePlanForm.price === '') {
      showToast('Plan Name and Price are required.', 'warning');
      return;
    }

    setSavingPlan(true);
    try {
      const payload = {
        ...feePlanForm,
        gym_id: selectedGymId || 'gym_1',
        features: typeof feePlanForm.features === 'string'
          ? feePlanForm.features.split(',').map(s => s.trim()).filter(Boolean)
          : feePlanForm.features
      };

      let res;
      if (feePlanModalMode === 'create') {
        res = await api.createFeePlan(payload);
      } else {
        res = await api.updateFeePlan(feePlanForm.id, payload);
      }

      if (res && res.success) {
        showToast(res.message || 'Fee plan updated successfully!', 'success');
        setShowFeePlanModal(false);
        await fetchGymsAndFees();
      } else {
        showToast(res?.message || 'Failed to save plan', 'error');
      }
    } catch (err) {
      showToast('Error saving plan: ' + err.message, 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleTogglePlanVisibility = async (plan) => {
    try {
      const newStatus = plan.is_active === false;
      const res = await api.updateFeePlan(plan.id, { is_active: newStatus });
      if (res && res.success) {
        showToast(`Plan ${plan.name} is now ${newStatus ? 'Visible' : 'Hidden'}!`, 'success');
        await fetchGymsAndFees();
      }
    } catch (err) {
      showToast('Failed to toggle visibility: ' + err.message, 'error');
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${name}"?`)) return;
    try {
      const res = await api.deleteFeePlan(id);
      if (res && res.success) {
        showToast(`Plan "${name}" deleted successfully!`, 'success');
        await fetchGymsAndFees();
      }
    } catch (err) {
      showToast('Failed to delete plan: ' + err.message, 'error');
    }
  };

  const handleOpenRateCardModal = () => {
    setEditRateCardNote(feeData?.rateCardNote || 'All plans include locker facility & floor coach guidance. Rates inclusive of GST.');
    setEditFeeImage(feeData?.feeStructureImage || '');
    setRateCardImageInput('');
    setShowRateCardModal(true);
  };

  const handleRateCardFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file must be under 5MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditFeeImage(event.target.result);
      showToast('Rate card image loaded! Click Save to publish.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyRateCardUrl = () => {
    if (!rateCardImageInput.trim()) return;
    setEditFeeImage(rateCardImageInput.trim());
    setRateCardImageInput('');
    showToast('Image URL applied! Click Save to publish.', 'info');
  };

  const handleSaveRateCard = async (e) => {
    e.preventDefault();
    setSavingRateCard(true);
    try {
      const res = await api.updateGymFeeStructure({
        feeStructureImage: editFeeImage,
        rateCardNote: editRateCardNote
      });
      if (res && res.success) {
        showToast('Official rate card document and notes saved!', 'success');
        setShowRateCardModal(false);
        await fetchGymsAndFees();
      } else {
        showToast(res?.message || 'Failed to update rate card', 'error');
      }
    } catch (err) {
      showToast('Failed to save rate card: ' + err.message, 'error');
    } finally {
      setSavingRateCard(false);
    }
  };

  const handleOpenPdfRateCard = async () => {
    try {
      setLoadingPdf(true);
      setShowPdfModal(true);
      const res = await api.getGymFeesPdf(selectedGymId);
      if (res && res.success) {
        setPdfRateCardData(res.pdfData);
      }
    } catch (err) {
      showToast('Failed to generate rate card digital copy.', 'error');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const res = await api.getMemberReceiptPdf(receiptId || 'txn_101');
      if (res && res.success) {
        setActiveReceipt(res.receipt);
        setShowReceiptModal(true);
      }
    } catch (err) {
      showToast('Could not load receipt invoice.', 'error');
    }
  };

  const handleInitiateUpgrade = (plan) => {
    setSelectedPlanForUpgrade(plan);
    setAppliedRedemption(null);
    setShowUpgradeModal(true);
  };

  const handleApplyRedemption = (rdm, planPrice) => {
    let discount = 0;
    if (rdm.discountPercent) {
      discount = Math.round(planPrice * (rdm.discountPercent / 100));
    } else if (rdm.discount) {
      discount = rdm.discount;
    }
    setAppliedRedemption({
      ...rdm,
      discount
    });
    if (rdm.type === 'cash_token' || rdm.id === 'rdm_desk_token') {
      setPaymentMode('cash');
    }
    showToast(`🎟️ Applied ${rdm.name} (${rdm.code})${discount > 0 ? ` - ₹${discount.toLocaleString('en-IN')} Saved!` : ''}`, 'success');
  };

  const handleRemoveRedemption = () => {
    setAppliedRedemption(null);
    showToast('Redemption pass removed.', 'info');
  };

  const handleApplyCustomCode = (e) => {
    e.preventDefault();
    const code = customPromoInput.trim().toUpperCase();
    if (!code) return;
    const planPrice = selectedPlanForUpgrade ? (selectedPlanForUpgrade.price + (selectedPlanForUpgrade.admission_fee || 0)) : 11999;

    if (code === '778899' || code === 'ADMIN' || code.includes('COLAB')) {
      const discount = Math.round(planPrice * 0.1);
      setAppliedRedemption({
        id: 'rdm_custom_colab',
        code,
        name: 'Admin Collaboration Pass',
        badge: '10% REBATE',
        discount,
        color: '#10b981'
      });
      showToast(`🎟️ Applied Admin Code ${code} - ₹${discount.toLocaleString('en-IN')} Saved!`, 'success');
    } else if (code.includes('500') || code.includes('LOYAL')) {
      setAppliedRedemption({
        id: 'rdm_custom_loyal',
        code,
        name: 'Loyalty Renewal Pass',
        badge: '₹500 OFF',
        discount: 500,
        color: '#06b6d4'
      });
      showToast(`🎟️ Applied Loyalty Pass ${code} - ₹500 Saved!`, 'success');
    } else if (code.includes('DESK') || code.includes('CASH')) {
      setAppliedRedemption({
        id: 'rdm_custom_desk',
        code,
        name: 'Front Desk Cash Token',
        badge: 'PAY AT DESK',
        discount: 0,
        color: '#f97316'
      });
      setPaymentMode('cash');
      showToast(`🎟️ Applied Desk Cash Token ${code}!`, 'success');
    } else {
      const discount = Math.round(planPrice * 0.05);
      setAppliedRedemption({
        id: 'rdm_custom_gen',
        code,
        name: `Redemption Pass (${code})`,
        badge: '5% OFF',
        discount,
        color: '#f59e0b'
      });
      showToast(`🎟️ Applied Redemption Code ${code} - ₹${discount.toLocaleString('en-IN')} Saved!`, 'success');
    }
    setCustomPromoInput('');
  };

  const handleProcessUpgrade = async (e) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    try {
      setProcessingPayment(true);
      const basePrice = selectedPlanForUpgrade.price + (selectedPlanForUpgrade.admission_fee || 0);
      const discount = appliedRedemption ? Number(appliedRedemption.discount || 0) : 0;
      const finalPaidAmount = Math.max(0, basePrice - discount);

      const res = await api.payMembership({
        gymId: selectedGymId,
        planName: selectedPlanForUpgrade.name,
        planId: selectedPlanForUpgrade.id,
        amount: finalPaidAmount,
        customAmount: finalPaidAmount,
        appliedRedemption: appliedRedemption ? {
          id: appliedRedemption.id,
          code: appliedRedemption.code,
          name: appliedRedemption.name,
          discount: appliedRedemption.discount,
          badge: appliedRedemption.badge
        } : null,
        paymentMethod: paymentMode === 'cash' ? 'Pay at Desk (Cash/Token)' : (paymentMode === 'card' ? 'Credit/Debit Card' : 'Instant UPI')
      });

      if (res && res.success) {
        try {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        showToast(`🎉 Payment of ₹${finalPaidAmount.toLocaleString('en-IN')} successful! Redemption pass activated.`, 'success');
        setShowUpgradeModal(false);
        setAppliedRedemption(null);
        await fetchGymsAndFees();
        // Automatically open the Redemption & Admin Collaboration pop-up
        setShowRedemptionModal(true);
      } else {
        showToast(res.message || 'Payment could not be completed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCollaborateWithAdmin = async (e) => {
    if (e) e.preventDefault();
    if (!adminPinInput.trim()) {
      showToast('Please enter the 6-digit Gym Admin Collaboration PIN.', 'error');
      return;
    }

    try {
      setVerifyingCollaboration(true);
      const res = await api.redeemGymCode(adminPinInput.trim(), selectedGymId);
      if (res && res.success) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 }
          });
        } catch (_) {}

        showToast(res.message || '🎉 Successfully Collaborated with Gym Admin!', 'success');
        setAdminPinInput('');
        await fetchGymsAndFees();
      } else {
        showToast(res.message || 'Collaboration verification failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Invalid collaboration PIN. Try demo PIN 778899.', 'error');
    } finally {
      setVerifyingCollaboration(false);
    }
  };

  const handleCopyCollaborationCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedColabCode(true);
    showToast(`Copied code ${code} to clipboard!`, 'success');
    setTimeout(() => setCopiedColabCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSelectedGym = allGyms.find(g => g.id === selectedGymId) || (membershipStatus?.nearestGym) || allGyms[0];
  const gymName = feeData?.gymName || currentSelectedGym?.name || user?.gymName || 'Local Fitness Center';
  const gymAddress = feeData?.gymAddress || currentSelectedGym?.address || user?.gymBranch || 'Within 5km of Your Current Location';
  const plans = feeData?.publishedPlans || feeData?.feePlans || [];
  const terms = feeData?.gymTerms || {};

  return (
    <div style={{ minHeight: '100%' }}>
      <Header
        title="Gym Membership & Fees"
        subtitle={`Official Rate Card & Subscriptions for ${gymName}`}
        rightAction={
          <div style={{ display: 'flex', gap: '8px' }}>
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={handleOpenAddPlanModal}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '5px', background: 'linear-gradient(135deg, var(--amber), #d97706)', color: '#0b0f19', fontWeight: 800 }}
              >
                <Plus size={13} />
                <span>Add Fee Plan</span>
              </button>
            )}
            <button
              onClick={handleOpenPdfRateCard}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
            >
              <Download size={13} />
              <span>Rate Card (PDF)</span>
            </button>
          </div>
        }
      />

      <div className="page-container" style={{ padding: '16px 20px 40px' }}>
        
        {/* Top Gym Branch Selector & Official Verification Banner */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b0f19',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
            }}>
              <Building2 size={24} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{gymName}</h3>
                <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                  <ShieldCheck size={11} /> VERIFIED RATES
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Version {feeData?.version || 'v2.4'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {gymAddress} &bull; All rates listed in <b>Indian Rupees (₹ INR)</b>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {allGyms.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Select Branch:</span>
                <select
                  className="form-input"
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                  style={{ fontSize: '11px', height: '32px', padding: '0 8px', width: 'auto', background: 'var(--bg-surface)' }}
                >
                  {allGyms.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchGymsAndFees}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              title="Refresh Fee Plans"
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
            </button>

            <button
              onClick={handleOpenPdfRateCard}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', gap: '4px' }}
            >
              <Printer size={12} /> Print Schedule
            </button>
          </div>
        </div>

        {/* GYM ADMIN FEE EDITING CONTROLS BANNER */}
        {user?.role === 'admin' && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--amber), #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0f19',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
              }}>
                <Banknote size={22} strokeWidth={2.4} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#fef08a' }}>
                    Gym Admin &bull; Live Fee Structure Management
                  </h4>
                  <span className="badge" style={{ background: '#eab308', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                    ADMIN EDIT MODE ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Modify prices in ₹ INR, configure registration fees, add custom features, update the digital rate card copy, or reorder plans.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenAddPlanModal}
                className="btn btn-sm btn-primary"
                style={{
                  fontSize: '12px',
                  padding: '7px 16px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--amber), #d97706)',
                  color: '#0b0f19',
                  border: 'none',
                  gap: '5px'
                }}
              >
                <Plus size={14} /> Add New Plan
              </button>

              <button
                type="button"
                onClick={handleOpenRateCardModal}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}
              >
                <Edit3 size={13} /> Edit Rate Card Graphic & Notes
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigateToAdminSection) navigateToAdminSection('fees');
                  else setActiveTab('admin');
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}
              >
                <ShieldCheck size={13} /> Full Admin Desk Console
              </button>
            </div>
          </div>
        )}

        {/* GYM REDEMPTION & ADMIN COLLABORATION NOTIFICATION POP-UP BANNER */}
        {showRedemptionBanner && redemptionDetails && membershipStatus?.hasMembership !== false && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              boxShadow: '0 8px 24px rgba(234, 179, 8, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #eab308, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0f19',
                boxShadow: '0 6px 16px rgba(234, 179, 8, 0.35)'
              }}>
                <Gift size={22} strokeWidth={2.4} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#eab308', color: '#0b0f19', fontSize: '10px', fontWeight: 900 }}>
                    🎁 GYM REDEMPTION NOTIFICATION
                  </span>
                  <span style={{ fontSize: '12px', color: '#fef08a', fontWeight: 700 }}>
                    Paid Amount: ₹{Number(membershipStatus?.amountPaid || redemptionDetails?.amountPaid || 11999).toLocaleString('en-IN')}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {redemptionDetails?.isCollaborated ? (
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Verified & Collaborated with Gym Administrator ({redemptionDetails?.verifiedByAdmin || 'Coach Marcus Vance'})!
                    </span>
                  ) : (
                    <span>
                      Redemption Code <b>{redemptionDetails?.collaborationCode || 'FH-COLAB-7829'}</b> ready. Collaborate with Admin using PIN (<b>778899</b>) to sync access!
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowRedemptionModal(true)}
                className="btn btn-sm btn-primary"
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #eab308, #10b981)',
                  color: '#0b0f19',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
                  gap: '6px'
                }}
              >
                <Users size={14} />
                <span>{redemptionDetails?.isCollaborated ? 'View Colab Pass' : 'Collaborate with Admin'}</span>
              </button>

              <button
                onClick={() => setShowRedemptionBanner(false)}
                className="icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                title="Dismiss banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* CURRENT ACTIVE PLAN HIGHLIGHT CARD */}
        <div
          className="card"
          style={{
            padding: '20px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Zap size={20} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Current Membership Status
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {membershipStatus?.currentPlan || 'Elite Gold Annual All-Access'}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowRedemptionModal(true)}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '5px', background: 'linear-gradient(135deg, #eab308, #10b981)', color: '#0b0f19', fontWeight: 800, border: 'none' }}
              >
                <Gift size={13} /> Gym Redemption Pass
              </button>
              <span className="badge badge-fitness" style={{ fontSize: '11px', padding: '6px 12px' }}>
                <CheckCircle2 size={13} /> {membershipStatus?.status || 'Active & Valid'}
              </span>
              <button
                onClick={() => handleViewReceipt(membershipStatus?.recentReceiptId || 'REC-2026-7829')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '4px' }}
              >
                <Receipt size={12} /> View Receipt
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            padding: '14px',
            background: 'rgba(11, 15, 25, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Valid Until / Expiry
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--primary)" />
                {membershipStatus?.expiryDate || '14 Oct 2026'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Amount Paid (₹ INR)
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{(membershipStatus?.amountPaid || 11999).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Balance Due
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: (membershipStatus?.amountDue || 0) > 0 ? 'var(--rose)' : 'var(--primary)' }}>
                ₹{(membershipStatus?.amountDue || 0).toLocaleString('en-IN')} (Nil)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Official Desk Receipt #
              </span>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--cyan)' }}>
                {membershipStatus?.recentReceiptNumber || 'REC-2026-7829'}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GYM MEMBERSHIP CYCLIC LIFECYCLE MATRIX (USER PAYMENT -> JOIN -> DUE -> REDEMPTION -> LOOP) */}
        {/* ========================================================================= */}
        <div
          className="card"
          style={{
            padding: '24px 20px',
            marginBottom: '28px',
            background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Cyclic Watermark Background */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            opacity: 0.05,
            pointerEvents: 'none'
          }}>
            <RotateCw size={220} />
          </div>

          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0f19',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)'
              }}>
                <RotateCw size={24} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>
                    Gym Membership & Payment Cyclic Lifecycle
                  </h3>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.18)', color: 'var(--primary)', fontSize: '10px', fontWeight: 900 }}>
                    🔁 CLOSED-LOOP AUTOMATION
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Joined Date ➔ Cash/Online Payment ➔ Receipt Date ➔ Next Due Date ➔ Redemption ➔ Continuous Loop
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700, background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                Active Cycle: <b>{membershipStatus?.currentPlan || 'Elite Gold Annual'}</b>
              </span>
            </div>
          </div>

          {/* Cyclic Stages Grid Flow */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            position: 'relative'
          }}>
            {/* STEP 1: JOINED GYM & DUE DATE CALCULATION */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background: 'var(--primary)',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Step 1: Join Date
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                <Calendar size={18} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Gym Joining Date
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>
                {membershipStatus?.joinedDate || '15 Jan 2026'}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Initial join date sets the membership baseline duration (<b>365 Days</b>) and initial cycle due date.
              </p>
            </div>

            {/* STEP 2: PAYMENT (CASH OR ONLINE) */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background: 'var(--cyan)',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Step 2: Payment
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                <CreditCard size={18} color="var(--cyan)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cash or Online
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--cyan)', marginBottom: '4px' }}>
                Online UPI / Desk Cash
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                Paid <b>₹{(membershipStatus?.amountPaid || 11999).toLocaleString('en-IN')}</b> via instant QR / Desk Payment Mode.
              </p>

              <button
                onClick={() => setShowUpgradeModal(true)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '10px', padding: '4px 8px', width: '100%', justifyContent: 'center' }}
              >
                Change Payment / Renew
              </button>
            </div>

            {/* STEP 3: RECEIPT DATE & TAX INVOICE */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background: 'var(--amber)',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Step 3: Receipt Date
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                <Receipt size={18} color="var(--amber)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Receipt Generation
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--amber)', marginBottom: '4px' }}>
                {membershipStatus?.recentReceiptNumber || 'REC-2026-7829'}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                Issued on <b>{membershipStatus?.joinedDate || '15 Jan 2026'}</b> with digital GST invoice confirmation.
              </p>

              <button
                onClick={() => handleViewReceipt(membershipStatus?.recentReceiptId || 'REC-2026-7829')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '10px', padding: '4px 8px', width: '100%', justifyContent: 'center' }}
              >
                <FileText size={11} /> View Receipt
              </button>
            </div>

            {/* STEP 4: NEXT DUE DATE & GRACE PERIOD */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background: '#c084fc',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Step 4: Next Due Date
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                <Clock size={18} color="#c084fc" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Renewal Due Date
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 900, color: '#c084fc', marginBottom: '4px' }}>
                {membershipStatus?.expiryDate || '15 Jan 2027'}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Active for <b>279 Days</b>. Includes a 5-day grace period before next cycle billing.
              </p>
            </div>

            {/* STEP 5: REDEMPTION & ADMIN COLLABORATION */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background: 'linear-gradient(135deg, #eab308, #10b981)',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Step 5: Redemption
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                <Gift size={18} color="#eab308" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Admin Collaboration
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 900, color: '#fef08a', marginBottom: '4px' }}>
                {redemptionDetails?.collaborationCode || 'FH-COLAB-7829'}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                {redemptionDetails?.isCollaborated
                  ? '● Collaborated & Verified with Gym Administrator.'
                  : 'Enter Admin PIN 778899 to synchronize desk access.'}
              </p>

              <button
                onClick={() => setShowRedemptionModal(true)}
                className="btn btn-sm btn-primary"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  width: '100%',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #eab308, #10b981)',
                  color: '#0b0f19',
                  border: 'none',
                  fontWeight: 800
                }}
              >
                <Key size={11} /> Open Colab Pass
              </button>
            </div>
          </div>

          {/* Cyclic Flow Bar / Visual Loop Connector */}
          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)' }}>
              <RotateCw size={16} color="var(--primary)" className="spin-slow" />
              <span>
                <b>Continuous Closed Loop:</b> When the due date arrives (<b>{membershipStatus?.expiryDate || '15 Jan 2027'}</b>), the member selects Cash/Online to renew, generating the next receipt date, next due date, and new redemption pass!
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                ● LOOP CYCLE ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* PUBLISHED FEE STRUCTURE PRICING CARDS */}
        <div style={{ marginBottom: '32px' }}>
          <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Banknote size={20} color="var(--primary)" />
                Available Membership Plans & Fee Tiers
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Select a plan to renew or upgrade your gym access. Read-only official rates published by gym administration.
              </p>
            </div>

            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', fontSize: '11px', fontWeight: 800 }}>
              {plans.length} Official Plans Published
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              <span>Loading fee schedule in ₹ INR...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 10px', color: 'var(--amber)' }} />
              <p style={{ fontSize: '14px', fontWeight: 600 }}>No active fee plans published for this branch yet.</p>
              <span style={{ fontSize: '12px' }}>Please contact front desk reception for manual registration.</span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px'
            }}>
              {plans.map((plan, idx) => {
                const isPopular = plan.is_popular || plan.badge?.toLowerCase().includes('popular') || idx === 1;
                const price = Number(plan.price) || 0;
                const admissionFee = Number(plan.admission_fee) || 0;
                const taxPercent = plan.tax_percent !== undefined ? plan.tax_percent : 18;

                return (
                  <div
                    key={plan.id || idx}
                    className="card"
                    style={{
                      padding: '22px',
                      borderRadius: '16px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: isPopular
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.98) 100%)'
                        : 'var(--bg-card)',
                      border: isPopular
                        ? '2px solid rgba(16, 185, 129, 0.6)'
                        : '1px solid var(--border-color)',
                      boxShadow: isPopular
                        ? '0 12px 30px rgba(16, 185, 129, 0.2)'
                        : '0 4px 15px rgba(0, 0, 0, 0.15)',
                      transform: isPopular ? 'scale(1.02)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Popular / Promo Badge */}
                    {plan.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '20px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                        color: '#0b0f19',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                      }}>
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Plan Duration & Title */}
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          color: isPopular ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {plan.billingDuration || `${plan.duration_days || 30} Days Validity`}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginTop: '4px', color: 'var(--text-primary)' }}>
                          {plan.name}
                        </h4>
                      </div>

                      {/* Pricing Tag */}
                      <div style={{
                        padding: '14px',
                        background: 'rgba(11, 15, 25, 0.5)',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary)' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            / {plan.billingDuration || 'term'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <div>
                            Admission / Registration: <b>{admissionFee > 0 ? `₹${admissionFee.toLocaleString('en-IN')}` : 'Nil (₹0)'}</b>
                          </div>
                          {plan.discount && (
                            <div style={{ color: '#34d399', fontWeight: 700 }}>
                              Offer / Savings: {plan.discount}
                            </div>
                          )}
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            GST ({taxPercent}%): Included in final desk invoice
                          </div>
                        </div>
                      </div>

                      {/* Features Included */}
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          What's Included:
                        </span>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(Array.isArray(plan.features) ? plan.features : (plan.features ? String(plan.features).split(',') : ['Full Floor Access', 'Locker Facility'])).map((feat, fIdx) => (
                            <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '1px'
                              }}>
                                <Check size={10} strokeWidth={3} />
                              </div>
                              <span>{typeof feat === 'string' ? feat.trim() : feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiateUpgrade(plan)}
                      className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                      style={{ height: '42px', fontSize: '13px', fontWeight: 800, gap: '6px' }}
                    >
                      <span>{user?.role === 'admin' ? 'Test Member Checkout' : 'Upgrade / Renew Plan'}</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Admin Plan Editing Toolbar */}
                    {user?.role === 'admin' && (
                      <div style={{
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditPlanModal(plan)}
                          className="btn btn-sm btn-primary"
                          style={{
                            flex: 1,
                            fontSize: '11px',
                            padding: '6px 0',
                            gap: '4px',
                            background: 'linear-gradient(135deg, var(--amber), #d97706)',
                            color: '#0b0f19',
                            fontWeight: 800
                          }}
                        >
                          <Edit3 size={12} /> Edit Plan Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePlanVisibility(plan)}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '11px', padding: '6px 10px', gap: '4px' }}
                          title={plan.is_active !== false ? 'Hide from member view' : 'Make visible to members'}
                        >
                          <Eye size={12} /> {plan.is_active !== false ? 'Visible' : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          className="btn btn-sm"
                          style={{
                            fontSize: '11px',
                            padding: '6px 10px',
                            color: 'var(--rose)',
                            background: 'rgba(244, 63, 94, 0.12)'
                          }}
                          title="Delete this fee plan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DEDICATED SECTION: OFFICIAL FEE STRUCTURE IMAGE & RATE CARD DOCUMENT */}
        <div className="card" style={{
          padding: '22px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)'
        }}>
          <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0f19',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                <ImageIcon size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Official Fee Structure Image & Rate Card Document</h4>
                  <span className="badge badge-fitness" style={{ fontSize: '10px' }}>OFFICIAL NOTICE</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Official rate card poster & membership document issued directly by <b>{gymName}</b> management.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={handleOpenRateCardModal}
                  className="btn btn-sm btn-primary"
                  style={{
                    fontSize: '11px',
                    padding: '6px 14px',
                    fontWeight: 800,
                    gap: '5px',
                    background: 'linear-gradient(135deg, var(--amber), #d97706)',
                    color: '#0b0f19'
                  }}
                  title="Upload or change official rate card graphic poster & notes"
                >
                  <Edit3 size={13} /> Edit / Upload Rate Card
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                title="Inspect image in full-screen"
              >
                <Maximize2 size={13} /> Fullscreen Zoom
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                title="Print digital rate card"
              >
                <Printer size={13} /> Print Document
              </button>

              <button
                type="button"
                onClick={handleOpenPdfRateCard}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '11px', padding: '6px 14px', fontWeight: 800, gap: '5px' }}
              >
                <Download size={13} /> Download PDF
              </button>
            </div>
          </div>

          {/* Graphic / Image Display Container */}
          <div
            onClick={() => setShowImageModal(true)}
            style={{
              background: '#070b13',
              borderRadius: '14px',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              padding: '20px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
            }}
          >
            {feeData?.feeStructureImage ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img
                    src={feeData.feeStructureImage}
                    alt="Official Fee Structure Document"
                    style={{
                      width: '100%',
                      maxHeight: '440px',
                      objectFit: 'contain',
                      borderRadius: '10px',
                      background: '#0b0f19'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(11, 15, 25, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--primary)',
                    fontWeight: 700
                  }}>
                    <Maximize2 size={12} /> Click to Expand Fullscreen
                  </div>
                </div>
              </div>
            ) : (
              /* High-Resolution Branded Rate Card Poster Replica */
              <div>
                <div style={{
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(16, 185, 129, 0.35)',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    FIT HEALTH ATHLETIC CENTER &bull; OFFICIAL DIGITAL RATE SCHEDULE
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: '6px 0 2px' }}>
                    {gymName}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    {gymAddress} &bull; Hours: 05:00 AM - 11:30 PM &bull; Currency: INR (₹)
                  </p>
                </div>

                {/* Plans List inside Poster */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {plans.map((p, pIdx) => (
                    <div
                      key={p.id || pIdx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                          {p.name} {p.badge && <span className="badge badge-fitness" style={{ fontSize: '9px', marginLeft: '4px' }}>{p.badge}</span>}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Duration: <b>{p.billingDuration || `${p.duration_days} Days`}</b>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>
                          GST INCL.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}>
                  <div>
                    <b style={{ color: 'var(--cyan)' }}>Notice:</b> {feeData?.rateCardNote || 'All plans include locker facility & floor coach guidance. Rates inclusive of GST.'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>VERIFIED DIGITAL ASSET</span>
                    <QrCode size={22} color="var(--primary)" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GYM TERMS & CONDITIONS (READ-ONLY FOR MEMBERS) */}
        <div className="card" style={{ padding: '22px', marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Official Membership Policies & Terms</h4>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Set by {gymName} Administration
            </span>
          </div>


          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                💳 Refund & Cancellation
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {terms.refund_policy || 'Memberships are non-refundable after 7 days from purchase. Unused personal training sessions may be credited.'}
              </p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--cyan)', display: 'block', marginBottom: '4px' }}>
                ❄️ Membership Freeze Policy
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {terms.freeze_policy || 'Quarterly and Annual tiers are eligible for up to 30 days of medical or travel freeze with 48h advance notice.'}
              </p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--amber)', display: 'block', marginBottom: '4px' }}>
                ⏳ Late Fee & Grace Period
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {terms.late_fee_policy || 'A 5-day grace period is provided after expiration. Late renewal incurs a ₹200 desk reactivating surcharge.'}
              </p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc', display: 'block', marginBottom: '4px' }}>
                🏋️ Floor Rules & Hygiene
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {terms.rules || 'Personal sweat towels and clean athletic shoes mandatory on all lifting platforms and cardio decks.'}
              </p>
            </div>
          </div>
        </div>

        {/* PAYMENT & RECEIPT HISTORY TABLE */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="var(--primary)" />
                Membership Payment & Desk Receipts
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Download digital GST-compliant payment receipts for personal expense or reimbursement.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                id: 'txn_101',
                receiptNumber: 'REC-2026-7829',
                plan: 'Elite Gold Annual All-Access',
                date: '14 Oct 2025',
                amount: 11999,
                mode: 'Online UPI (GPay)',
                status: 'Paid & Verified'
              },
              {
                id: 'txn_102',
                receiptNumber: 'REC-2025-4512',
                plan: 'Quarterly Power Pass',
                date: '14 Jul 2025',
                amount: 3999,
                mode: 'Front Desk Cash Token',
                status: 'Paid'
              }
            ].map((txn) => (
              <div
                key={txn.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FileText size={18} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>{txn.plan}</span>
                      <code style={{ fontSize: '11px', color: 'var(--cyan)' }}>[{txn.receiptNumber}]</code>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Date: {txn.date} &bull; Mode: <b>{txn.mode}</b>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--primary)', display: 'block', fontWeight: 700 }}>
                      ● {txn.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewReceipt(txn.id)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}
                  >
                    <Download size={12} /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GYM REDEMPTION & COLLABORATION HISTORY AUDIT CARD */}
        <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
          <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #eab308, #10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0b0f19'
                }}>
                  <Gift size={18} strokeWidth={2.4} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Gym Redemption & Collaboration History
                </h4>
                <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', fontSize: '10px', fontWeight: 800 }}>
                  AUDIT LOG
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
                Complete verifiable history of redeemed membership passes, admin collaboration codes, desk tokens, and fee rebates.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setRedemptionModalTab('pass');
                  setShowRedemptionModal(true);
                }}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '11px', padding: '6px 12px', gap: '6px', background: 'linear-gradient(135deg, #eab308, #10b981)', color: '#0b0f19', border: 'none' }}
              >
                <QrCode size={13} /> Active Pass & QR
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            marginBottom: '14px'
          }}>
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>TOTAL REDEMPTIONS</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#34d399' }}>
                {(redemptionHistory.length > 0 ? redemptionHistory : [
                  { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }
                ]).length} Passes
              </span>
            </div>

            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>FEE REBATE SAVINGS</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--cyan)' }}>
                ₹{(redemptionHistory.length > 0 ? redemptionHistory : [
                  { discountAmount: 1200 }, { discountAmount: 500 }, { discountAmount: 225 }
                ]).reduce((acc, cur) => acc + (Number(cur.discountAmount) || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>CURRENT PASS</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={14} color="#10b981" /> {redemptionDetails?.collaborationCode || 'FH-COLAB-7829'}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Redemptions' },
              { id: 'colab', label: 'Admin Collaboration Passes' },
              { id: 'token', label: 'Front Desk Tokens' },
              { id: 'voucher', label: 'Loyalty & Promo Vouchers' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHistoryFilter(f.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: historyFilter === f.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: historyFilter === f.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                  color: historyFilter === f.id ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* History List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(redemptionHistory.length > 0 ? redemptionHistory : [
              {
                id: 'rdm_active_current',
                code: redemptionDetails?.collaborationCode || 'FH-COLAB-7829',
                title: 'Admin Collaboration & Floor Access Pass',
                type: 'Collaboration Pass',
                planName: membershipStatus?.currentPlan || 'Elite Gold Annual All-Access',
                gymName: feeData?.gymName || 'rsv gym and sports club',
                amountPaid: 11999,
                discountAmount: 1200,
                benefit: '10% Fee Rebate + Floor & App Access Unlocked',
                status: redemptionDetails?.isCollaborated ? 'Verified & Active' : 'Ready for Admin Collaboration',
                verifiedBy: redemptionDetails?.verifiedByAdmin || 'Coach Marcus Vance (Gym Administrator)',
                date: redemptionDetails?.collaboratedAt || '2026-10-18T10:15:00.000Z',
                receiptNumber: 'REC-2026-7829',
                isCurrent: true,
                badgeColor: '#10b981'
              },
              {
                id: 'rdm_hist_loyal',
                code: 'LOYALTY-FIT-500',
                title: 'BCA 2026 Loyalty Renewal Pass',
                type: 'Loyalty Reward Voucher',
                planName: 'Quarterly Power Pass Renewal',
                gymName: feeData?.gymName || 'rsv gym and sports club',
                amountPaid: 3499,
                discountAmount: 500,
                benefit: '₹500 Flat Loyalty Fee Rebate Applied',
                status: 'Redeemed & Verified',
                verifiedBy: 'Coach Marcus Vance (Gym Administrator)',
                date: '2026-07-14T11:30:00.000Z',
                receiptNumber: 'REC-2025-4512',
                isCurrent: false,
                badgeColor: '#06b6d4'
              },
              {
                id: 'rdm_token_desk',
                code: 'CASH-DESK-7829',
                title: 'Front Desk Cash Payment Token',
                type: 'Desk Cash Token',
                planName: 'Quarterly Pro Athlete',
                gymName: feeData?.gymName || 'rsv gym and sports club',
                amountPaid: 3999,
                discountAmount: 0,
                benefit: 'Direct Cash Payment at Reception Counter',
                status: 'Redeemed at Reception',
                verifiedBy: 'Front Desk Receptionist',
                date: '2026-04-10T09:40:00.000Z',
                receiptNumber: 'DESK-RCP-9102',
                isCurrent: false,
                badgeColor: '#f59e0b'
              },
              {
                id: 'rdm_hist_welcome',
                code: 'FIT-WELCOME-2026',
                title: 'New Member Induction & Floor Pass',
                type: 'Welcome Voucher',
                planName: 'Monthly Strength Starter',
                gymName: feeData?.gymName || 'rsv gym and sports club',
                amountPaid: 1274,
                discountAmount: 225,
                benefit: '15% Seasonal Welcome Discount',
                status: 'Redeemed & Verified',
                verifiedBy: 'Front Desk Receptionist',
                date: '2026-01-08T08:20:00.000Z',
                receiptNumber: 'REC-2025-1099',
                isCurrent: false,
                badgeColor: '#8b5cf6'
              }
            ])
              .filter(item => {
                if (historyFilter === 'colab') return item.type?.toLowerCase().includes('colab') || item.code?.includes('COLAB');
                if (historyFilter === 'token') return item.type?.toLowerCase().includes('token') || item.code?.includes('CASH') || item.type?.toLowerCase().includes('desk');
                if (historyFilter === 'voucher') return item.type?.toLowerCase().includes('voucher') || item.type?.toLowerCase().includes('reward') || item.type?.toLowerCase().includes('promo');
                return true;
              })
              .map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: item.isCurrent ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(234, 179, 8, 0.05))' : 'var(--bg-surface)',
                    border: item.isCurrent ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.badgeColor || 'var(--primary)',
                      flexShrink: 0
                    }}>
                      {item.type?.includes('token') || item.type?.includes('Cash') ? (
                        <Coins size={18} />
                      ) : item.type?.includes('Loyalty') ? (
                        <Award size={18} />
                      ) : (
                        <Ticket size={18} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                        <code style={{
                          fontSize: '11px',
                          color: '#fef08a',
                          background: 'rgba(234, 179, 8, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 800
                        }}>
                          {item.code}
                        </code>
                        {item.isCurrent && (
                          <span style={{ fontSize: '9px', fontWeight: 900, background: '#10b981', color: '#0b0f19', padding: '1px 5px', borderRadius: '4px' }}>
                            ACTIVE FLOOR PASS
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                        Plan: <b>{item.planName}</b> &bull; {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {item.benefit && (
                          <span style={{ display: 'block', color: 'var(--cyan)', fontWeight: 600, marginTop: '2px' }}>
                            Perk: {item.benefit}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>
                        ₹{Number(item.amountPaid || 0).toLocaleString('en-IN')}
                      </span>
                      {item.discountAmount > 0 && (
                        <span style={{ fontSize: '10px', color: '#34d399', display: 'block', fontWeight: 700 }}>
                          Saved ₹{Number(item.discountAmount).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: item.status?.includes('Active') || item.status?.includes('Verified') ? '#34d399' : '#fbbf24',
                        display: 'block'
                      }}>
                        ● {item.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setRedemptionModalTab('pass');
                          setShowRedemptionModal(true);
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}
                      >
                        <QrCode size={12} /> View Pass
                      </button>
                      {item.receiptNumber && (
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(item.receiptNumber)}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}
                        >
                          <Receipt size={12} /> Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: UPGRADE / RENEW PLAN PAYMENT FLOW */}
      {showUpgradeModal && selectedPlanForUpgrade && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Confirm Membership Plan</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Linked to: {gymName}
                  </span>
                </div>
              </div>

              <button onClick={() => setShowUpgradeModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleProcessUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Plan Summary Box with Dynamic Discount Breakdown */}
              <div style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div className="flex-between">
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{selectedPlanForUpgrade.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    {appliedRedemption && appliedRedemption.discount > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '6px' }}>
                        ₹{Number(selectedPlanForUpgrade.price + (selectedPlanForUpgrade.admission_fee || 0)).toLocaleString('en-IN')}
                      </span>
                    )}
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{Math.max(0, Number(selectedPlanForUpgrade.price + (selectedPlanForUpgrade.admission_fee || 0)) - (appliedRedemption ? Number(appliedRedemption.discount || 0) : 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Duration: <b>{selectedPlanForUpgrade.billingDuration || `${selectedPlanForUpgrade.duration_days || 30} Days`}</b>
                  {selectedPlanForUpgrade.admission_fee > 0 && ` + Registration ₹${selectedPlanForUpgrade.admission_fee}`}
                </div>

                {appliedRedemption && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#34d399" />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399' }}>
                        Redemption Pass Applied: <b>{appliedRedemption.code}</b>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {appliedRedemption.discount > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#34d399' }}>
                          - ₹{Number(appliedRedemption.discount).toLocaleString('en-IN')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveRedemption}
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 800, padding: 0
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════════════════════
                 LIST OF GYM REDEMPTIONS AVAILABLE DURING PAYMENT
                 ══════════════════════════════════════════════════════ */}
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ticket size={14} color="var(--primary)" />
                    <span>Select Gym Redemption / Fee Voucher</span>
                  </label>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>
                    {(availableRedemptions.length > 0 ? availableRedemptions : [
                      { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
                    ]).length} Options Available
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '185px', overflowY: 'auto', paddingRight: '2px' }}>
                  {(availableRedemptions.length > 0 ? availableRedemptions : [
                    {
                      id: 'rdm_colab_pass',
                      code: redemptionDetails?.collaborationCode || 'FH-COLAB-7829',
                      name: 'Admin Collaboration Pass',
                      badge: '10% REBATE',
                      type: 'colab_pass',
                      discountPercent: 10,
                      description: 'Sync with Gym Admin to unlock full floor & application features + 10% fee rebate.',
                      color: '#10b981'
                    },
                    {
                      id: 'rdm_loyal_500',
                      code: 'LOYALTY-FIT-500',
                      name: 'BCA 2026 Loyalty Renewal Pass',
                      badge: '₹500 FLAT OFF',
                      type: 'loyalty_voucher',
                      discount: 500,
                      description: 'Instant ₹500 discount for continuous fitness renewals and committed members.',
                      color: '#06b6d4'
                    },
                    {
                      id: 'rdm_early_bird',
                      code: 'EARLYBIRD-15',
                      name: 'Early Bird Fitness Season Pass',
                      badge: '15% OFF',
                      type: 'promo_pass',
                      discountPercent: 15,
                      description: '15% Off discount for off-peak and morning training session registrations.',
                      color: '#f59e0b'
                    },
                    {
                      id: 'rdm_pt_consult',
                      code: 'FREE-PT-PASS',
                      name: 'Complimentary Personal Training Pass',
                      badge: 'FREE ₹1,500 PT',
                      type: 'perk_pass',
                      discount: 0,
                      description: 'Includes 1 complimentary 1-on-1 Personal Trainer assessment and body check.',
                      color: '#8b5cf6'
                    },
                    {
                      id: 'rdm_desk_token',
                      code: 'CASH-DESK-TOKEN',
                      name: 'Front Desk Cash Payment Token',
                      badge: 'PAY AT DESK',
                      type: 'cash_token',
                      discount: 0,
                      description: 'Generate an instant digital token to pay cash directly at the front reception counter.',
                      color: '#f97316'
                    }
                  ]).map((rdm) => {
                    const isSelected = appliedRedemption?.id === rdm.id || appliedRedemption?.code === rdm.code;
                    const planPrice = selectedPlanForUpgrade ? (selectedPlanForUpgrade.price + (selectedPlanForUpgrade.admission_fee || 0)) : 11999;
                    const discountVal = rdm.discountPercent ? Math.round(planPrice * (rdm.discountPercent / 100)) : (rdm.discount || 0);

                    return (
                      <div
                        key={rdm.id}
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveRedemption();
                          } else {
                            handleApplyRedemption(rdm, planPrice);
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? '#0b0f19' : (rdm.color || 'var(--text-secondary)'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {rdm.type === 'cash_token' ? <Coins size={14} /> : <Ticket size={14} />}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {rdm.name}
                              </span>
                              <span style={{
                                fontSize: '9px', fontWeight: 900,
                                background: isSelected ? '#10b981' : (rdm.color || 'var(--cyan)'),
                                color: '#0b0f19', padding: '1px 5px', borderRadius: '4px'
                              }}>
                                {rdm.badge || (discountVal > 0 ? `₹${discountVal} OFF` : 'PERK')}
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                              Code: <b style={{ color: '#fef08a' }}>{rdm.code}</b> {discountVal > 0 && `(Save ₹${discountVal.toLocaleString('en-IN')})`}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              handleRemoveRedemption();
                            } else {
                              handleApplyRedemption(rdm, planPrice);
                            }
                          }}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            color: isSelected ? '#0b0f19' : 'var(--text-primary)',
                            fontSize: '10px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          {isSelected ? '✓ Applied' : 'Apply'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Promo Code / PIN Input */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Have an Admin PIN / Code? (e.g. 778899)"
                    value={customPromoInput}
                    onChange={(e) => setCustomPromoInput(e.target.value)}
                    style={{ height: '34px', fontSize: '11px', padding: '0 10px' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomCode}
                    disabled={!customPromoInput.trim()}
                    className="btn btn-secondary"
                    style={{ height: '34px', fontSize: '11px', padding: '0 12px', fontWeight: 800, flexShrink: 0 }}
                  >
                    Apply Code
                  </button>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                  Select Payment Option (₹ INR)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'upi', label: 'Instant UPI', desc: 'GPay / PhonePe / QR' },
                    { key: 'card', label: 'Debit/Credit', desc: 'Visa / MasterCard' },
                    { key: 'cash', label: 'Desk Token', desc: 'Pay Cash at Reception' }
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setPaymentMode(mode.key)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: paymentMode === mode.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: paymentMode === mode.key ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                        color: paymentMode === mode.key ? 'var(--primary)' : 'var(--text-primary)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 800 }}>{mode.label}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMode === 'cash' && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '11px',
                  color: '#fbbf24'
                }}>
                  💡 A digital cash payment token will be generated. Present it at the gym front desk reception to collect cash and activate membership immediately.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={processingPayment}
                style={{ height: '44px', fontSize: '13px', fontWeight: 800, marginTop: '6px' }}
              >
                {processingPayment ? (
                  'Processing Transaction...'
                ) : (
                  `Pay ₹${Math.max(0, (Number(selectedPlanForUpgrade.price) + (Number(selectedPlanForUpgrade.admission_fee) || 0)) - (appliedRedemption ? Number(appliedRedemption.discount || 0) : 0)).toLocaleString('en-IN')} & Activate${appliedRedemption && appliedRedemption.discount > 0 ? ` (Saved ₹${appliedRedemption.discount.toLocaleString('en-IN')})` : ''}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BRANDED DIGITAL RATE CARD SCHEDULE (PDF VIEWER) */}
      {showPdfModal && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19'
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Official Digital Rate Card Schedule</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Branded Rate Schedule & Terms for {gymName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={handlePrint} className="btn btn-sm btn-primary" style={{ fontSize: '11px', padding: '5px 12px', gap: '4px' }}>
                  <Printer size={12} /> Print / Save PDF
                </button>
                <button onClick={() => setShowPdfModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {loadingPdf ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Generating high-res schedule...</div>
            ) : (
              <div
                id="printable-rate-card"
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {/* Rate Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #10b981', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {gymName}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
                      {gymAddress} &bull; Hours: 05:00 AM - 11:30 PM
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Affiliation: Fit Health Central Directory &bull; Currency: INR (₹)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', background: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                      OFFICIAL RATE SCHEDULE
                    </span>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      Version {feeData?.version || 'v2.4'} &bull; {new Date().toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Plans Table */}
                <div style={{ marginBottom: '18px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: 800 }}>Plan Tier</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: 800 }}>Duration</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>Price (₹ INR)</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>Admission Fee</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: 800 }}>Features & Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p, pIdx) => (
                        <tr key={pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 800, color: '#0f172a' }}>
                            {p.name}
                            {p.badge && <span style={{ marginLeft: '4px', fontSize: '9px', padding: '2px 5px', background: '#dcfce7', color: '#15803d', borderRadius: '4px' }}>{p.badge}</span>}
                          </td>
                          <td style={{ padding: '10px 8px', color: '#475569' }}>
                            {p.billingDuration || `${p.duration_days} Days`}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#64748b' }}>
                            {p.admission_fee > 0 ? `₹${Number(p.admission_fee).toLocaleString('en-IN')}` : 'Nil'}
                          </td>
                          <td style={{ padding: '10px 8px', color: '#334155', fontSize: '11px' }}>
                            {(Array.isArray(p.features) ? p.features.join(' • ') : p.features || 'Full Gym Access')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms Box */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569', marginBottom: '14px' }}>
                  <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Official Terms & Policies:</b>
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Refund:</b> {terms.refund_policy || 'Non-refundable after 7 days.'}</p>
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Freeze:</b> {terms.freeze_policy || 'Up to 30 days freeze on annual tiers.'}</p>
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Late Fee:</b> {terms.late_fee_policy || '5-day grace period on expiration.'}</p>
                </div>

                {/* Footer Signature */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span>Verified by Fit Health Gym Network</span>
                  <span>Authorized Administrator &bull; {gymName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL TAX INVOICE & PAYMENT RECEIPT */}
      {showReceiptModal && activeReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Official Payment Receipt</h3>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)' }}>
                    Receipt #{activeReceipt.receiptNumber}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handlePrint} className="btn btn-sm btn-primary" style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}>
                  <Printer size={12} /> Print
                </button>
                <button onClick={() => setShowReceiptModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{activeReceipt.gymName || gymName}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Front Desk Membership Receipt</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <code style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>{activeReceipt.receiptNumber}</code>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(activeReceipt.transactionDate || Date.now()).toLocaleDateString('en-IN')}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '14px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>MEMBER NAME</span>
                  <b>{activeReceipt.memberName || user?.name || 'Alex Mercer'}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>MEMBERSHIP ID</span>
                  <b>{activeReceipt.membershipId || user?.membershipId || 'FH-MEM-7829'}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>PLAN SUBSCRIBED</span>
                  <b>{activeReceipt.planName}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>PAYMENT MODE</span>
                  <b>{activeReceipt.paymentMode}</b>
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Paid Amount (INR)</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                    ₹{Number(activeReceipt.amountPaid || activeReceipt.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                  ● PAID IN FULL
                </span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                Thank you for training with {gymName}! Keep this digital receipt for records.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULLSCREEN FEE STRUCTURE IMAGE & DOCUMENT INSPECTOR */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19'
                }}>
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Official Fee Structure Document</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Published by {gymName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={handlePrint} className="btn btn-sm btn-secondary" style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}>
                  <Printer size={12} /> Print
                </button>
                <button onClick={() => setShowImageModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div style={{
              background: '#070b13',
              borderRadius: '12px',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              padding: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
              maxHeight: '75vh',
              overflowY: 'auto'
            }}>
              {feeData?.feeStructureImage ? (
                <img
                  src={feeData.feeStructureImage}
                  alt="Official Gym Fee Structure"
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'contain' }}
                />
              ) : (
                <div>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(16, 185, 129, 0.3)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
                      FIT HEALTH ATHLETIC CENTER &bull; OFFICIAL FEE SCHEDULE
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                      {gymName}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {gymAddress} &bull; Reception: {feeData?.gymPhone || '+91 98765 43210'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {plans.map((plan, idx) => (
                      <div
                        key={plan.id || idx}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                            {plan.name} {plan.badge && <span className="badge badge-fitness" style={{ fontSize: '9px', marginLeft: '4px' }}>{plan.badge}</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Duration: <b>{plan.billingDuration || `${plan.duration_days} Days`}</b> &bull; {Array.isArray(plan.features) ? plan.features.join(' • ') : plan.features}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>
                            ₹{Number(plan.price).toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>
                            GST INCL.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    <div>
                      <b style={{ color: 'var(--cyan)' }}>Rate Card Policy:</b> {feeData?.rateCardNote || 'Official digital fee schedule verified by gym administration.'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <QrCode size={26} color="var(--primary)" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="btn btn-primary btn-full"
                style={{ height: '40px', fontSize: '12px', fontWeight: 800 }}
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GYM REDEMPTION & ADMIN COLLABORATION POP-UP */}
      {showRedemptionModal && (
        <div className="modal-overlay" onClick={() => setShowRedemptionModal(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              background: 'linear-gradient(165deg, #0b0f19 0%, #111827 100%)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(234, 179, 8, 0.15)'
            }}
          >
            <div className="sheet-handle" />

            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eab308, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19',
                  boxShadow: '0 6px 16px rgba(234, 179, 8, 0.4)'
                }}>
                  <Gift size={24} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>
                      Gym Redemption Pass
                    </h3>
                    <span className="badge" style={{ background: '#eab308', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                      ADMIN SYNC
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Official Payment Proof & Admin-User Collaboration
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowRedemptionModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '12px',
              gap: '6px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                type="button"
                onClick={() => setRedemptionModalTab('pass')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: redemptionModalTab === 'pass'
                    ? 'linear-gradient(135deg, #eab308, #10b981)'
                    : 'transparent',
                  color: redemptionModalTab === 'pass' ? '#0b0f19' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: redemptionModalTab === 'pass' ? '0 4px 12px rgba(234, 179, 8, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Ticket size={14} /> Active Pass & QR Sync
              </button>
              <button
                type="button"
                onClick={() => setRedemptionModalTab('history')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: redemptionModalTab === 'history'
                    ? 'linear-gradient(135deg, #eab308, #10b981)'
                    : 'transparent',
                  color: redemptionModalTab === 'history' ? '#0b0f19' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: redemptionModalTab === 'history' ? '0 4px 12px rgba(234, 179, 8, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <History size={14} /> Redemption History ({redemptionHistory.length || 4})
              </button>
            </div>

            {/* TAB 1: ACTIVE PASS & DUAL POINT VERIFICATION */}
            {redemptionModalTab === 'pass' && (
              <>
                {/* Paid Amount & Plan Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))',
                  borderRadius: '14px',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div className="flex-between" style={{ marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        User Paid Plan
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                        {membershipStatus?.currentPlan || redemptionDetails?.planName || 'Elite Gold Annual All-Access'}
                      </h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                        Amount Paid
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>
                        ₹{Number(membershipStatus?.amountPaid || redemptionDetails?.amountPaid || 11999).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Member Name:</span>
                      <b style={{ color: 'var(--text-primary)' }}>{user?.name || redemptionDetails?.memberName || 'Alex Mercer'}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Membership ID:</span>
                      <b style={{ color: 'var(--cyan)' }}>{user?.membershipId || redemptionDetails?.membershipId || 'FH-MEM-7829'}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Daily Check-In PIN:</span>
                      <b style={{ color: 'var(--primary)', letterSpacing: '1px' }}>#{user?.checkInPin || user?.membershipId?.replace(/\D/g, '')?.slice(-4) || '7829'}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Gym Center:</span>
                      <b style={{ color: 'var(--text-primary)' }}>{gymName}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payment Status:</span>
                      <b style={{ color: 'var(--primary)' }}>● Paid & Confirmed</b>
                    </div>
                  </div>
                </div>

                {/* Collaboration Pass Code & QR Token */}
                <div style={{
                  background: '#070b13',
                  borderRadius: '14px',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  padding: '16px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: 'linear-gradient(135deg, #eab308, #10b981)',
                    color: '#0b0f19',
                    fontSize: '9px',
                    fontWeight: 900,
                    padding: '3px 12px',
                    borderBottomLeftRadius: '8px',
                    textTransform: 'uppercase'
                  }}>
                    Pass Token
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Your Unique Redemption & Collaboration Code
                  </span>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1.5px dashed #eab308',
                    borderRadius: '10px',
                    margin: '4px 0 10px'
                  }}>
                    <Key size={18} color="#eab308" />
                    <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '2px', color: '#fef08a' }}>
                      {redemptionDetails?.collaborationCode || 'FH-COLAB-7829'}
                    </span>
                    <button
                      onClick={() => handleCopyCollaborationCode(redemptionDetails?.collaborationCode || 'FH-COLAB-7829')}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.06)' }}
                      title="Copy Collaboration Code"
                    >
                      {copiedColabCode ? <CheckCheck size={14} color="var(--primary)" /> : <Copy size={14} color="var(--text-muted)" />}
                    </button>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                    Present this code or QR pass at the <b>{gymName}</b> front reception desk to collaborate with the Gym Administrator.
                  </p>
                </div>

                {/* Admin Collaboration Verification / Sync Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={16} color="var(--cyan)" />
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                      Admin-User Dual Point Verification
                    </h4>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    background: 'rgba(6, 182, 212, 0.08)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    marginBottom: '12px'
                  }}>
                    🔒 <b>Point-to-Point Code Verification:</b> This exact verification code must match between the <b>User App</b> and the <b>Gym Administrator Console</b> to synchronize workout access.
                  </div>

                  {redemptionDetails?.isCollaborated ? (
                    <div style={{
                      padding: '14px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.1))',
                      border: '1.5px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0b0f19',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}>
                          <BadgeCheck size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary)' }}>
                            ● Point Verified & Synchronized with Admin
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Matched by: <b>{redemptionDetails?.verifiedByAdmin || 'Coach Marcus Vance (Gym Admin)'}</b>
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '11px', color: '#dcfce7', marginBottom: '12px' }}>
                        🎉 Code verification complete! Your gym floor pass and full application features are unlocked.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setShowRedemptionModal(false);
                          setActiveTab('dashboard');
                          showToast('🚀 Welcome! You can now use all features of Fit Health.', 'success');
                        }}
                        className="btn btn-primary btn-full"
                        style={{
                          height: '42px',
                          fontSize: '13px',
                          fontWeight: 900,
                          background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                          color: '#0b0f19',
                          border: 'none',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          gap: '8px'
                        }}
                      >
                        <span>🚀 Launch & Use Application (Go to Dashboard)</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCollaborateWithAdmin}>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Enter the matching <b>6-digit Admin Collaboration Code / PIN</b> below:
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter Matching Admin PIN (e.g. 778899)"
                            value={adminPinInput}
                            onChange={(e) => setAdminPinInput(e.target.value)}
                            style={{
                              height: '42px',
                              fontSize: '13px',
                              fontWeight: 700,
                              letterSpacing: '1px',
                              paddingLeft: '36px',
                              borderColor: 'rgba(234, 179, 8, 0.4)'
                            }}
                          />
                          <Lock
                            size={15}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'var(--text-muted)'
                            }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={verifyingCollaboration || !adminPinInput.trim()}
                          className="btn btn-primary"
                          style={{
                            height: '42px',
                            padding: '0 18px',
                            fontSize: '12px',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #eab308, #10b981)',
                            color: '#0b0f19',
                            border: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {verifyingCollaboration ? (
                            <>
                              <RefreshCw size={13} className="spin" /> Matching...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} /> Verify Code
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Admin Matching PIN: <b style={{ color: '#fef08a' }}>778899</b>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdminPinInput('778899')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--cyan)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Use Matching PIN 778899
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowRedemptionModal(false);
                          setActiveTab('dashboard');
                          showToast('Proceeding to Application Dashboard...', 'info');
                        }}
                        className="btn btn-secondary btn-full"
                        style={{
                          height: '38px',
                          fontSize: '12px',
                          fontWeight: 700,
                          gap: '6px'
                        }}
                      >
                        <span>Skip to Application &bull; Access Dashboard</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: COMPLETE REDEMPTION HISTORY AUDIT */}
            {redemptionModalTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {/* History Filter Pills */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { key: 'all', label: 'All History' },
                    { key: 'colab', label: '🤝 Colab Passes' },
                    { key: 'token', label: '🪙 Cash Tokens' },
                    { key: 'voucher', label: '🎟️ Vouchers' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setHistoryFilter(filter.key)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: historyFilter === filter.key ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: historyFilter === filter.key ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: historyFilter === filter.key ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Scrollable History List */}
                <div style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px'
                }}>
                  {(redemptionHistory.length > 0 ? redemptionHistory : [
                    {
                      id: 'rdm_active_current',
                      code: redemptionDetails?.collaborationCode || 'FH-COLAB-7829',
                      title: 'Admin Collaboration & Floor Access Pass',
                      type: 'Collaboration Pass',
                      planName: membershipStatus?.currentPlan || 'Elite Gold Annual All-Access',
                      gymName: feeData?.gymName || 'rsv gym and sports club',
                      amountPaid: 11999,
                      discountAmount: 1200,
                      benefit: '10% Fee Rebate + Floor & App Access Unlocked',
                      status: redemptionDetails?.isCollaborated ? 'Verified & Active' : 'Ready for Admin Collaboration',
                      verifiedBy: redemptionDetails?.verifiedByAdmin || 'Coach Marcus Vance (Gym Administrator)',
                      date: redemptionDetails?.collaboratedAt || '2026-10-18T10:15:00.000Z',
                      receiptNumber: 'REC-2026-7829',
                      isCurrent: true,
                      badgeColor: '#10b981'
                    },
                    {
                      id: 'rdm_hist_loyal',
                      code: 'LOYALTY-FIT-500',
                      title: 'BCA 2026 Loyalty Renewal Pass',
                      type: 'Loyalty Reward Voucher',
                      planName: 'Quarterly Power Pass Renewal',
                      gymName: feeData?.gymName || 'rsv gym and sports club',
                      amountPaid: 3499,
                      discountAmount: 500,
                      benefit: '₹500 Flat Loyalty Fee Rebate Applied',
                      status: 'Redeemed & Verified',
                      verifiedBy: 'Coach Marcus Vance (Gym Administrator)',
                      date: '2026-07-14T11:30:00.000Z',
                      receiptNumber: 'REC-2025-4512',
                      isCurrent: false,
                      badgeColor: '#06b6d4'
                    },
                    {
                      id: 'rdm_token_desk',
                      code: 'CASH-DESK-7829',
                      title: 'Front Desk Cash Payment Token',
                      type: 'Desk Cash Token',
                      planName: 'Quarterly Pro Athlete',
                      gymName: feeData?.gymName || 'rsv gym and sports club',
                      amountPaid: 3999,
                      discountAmount: 0,
                      benefit: 'Direct Cash Payment at Reception Counter',
                      status: 'Redeemed at Reception',
                      verifiedBy: 'Front Desk Receptionist',
                      date: '2026-04-10T09:40:00.000Z',
                      receiptNumber: 'DESK-RCP-9102',
                      isCurrent: false,
                      badgeColor: '#f59e0b'
                    },
                    {
                      id: 'rdm_hist_welcome',
                      code: 'FIT-WELCOME-2026',
                      title: 'New Member Induction & Floor Pass',
                      type: 'Welcome Voucher',
                      planName: 'Monthly Strength Starter',
                      gymName: feeData?.gymName || 'rsv gym and sports club',
                      amountPaid: 1274,
                      discountAmount: 225,
                      benefit: '15% Seasonal Welcome Discount',
                      status: 'Redeemed & Verified',
                      verifiedBy: 'Front Desk Receptionist',
                      date: '2026-01-08T08:20:00.000Z',
                      receiptNumber: 'REC-2025-1099',
                      isCurrent: false,
                      badgeColor: '#8b5cf6'
                    }
                  ])
                    .filter(item => {
                      if (historyFilter === 'colab') return item.type?.toLowerCase().includes('colab') || item.code?.includes('COLAB');
                      if (historyFilter === 'token') return item.type?.toLowerCase().includes('token') || item.code?.includes('CASH') || item.type?.toLowerCase().includes('desk');
                      if (historyFilter === 'voucher') return item.type?.toLowerCase().includes('voucher') || item.type?.toLowerCase().includes('reward') || item.type?.toLowerCase().includes('promo');
                      return true;
                    })
                    .map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: item.isCurrent
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(234, 179, 8, 0.05))'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: item.isCurrent ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.badgeColor || 'var(--primary)',
                            flexShrink: 0
                          }}>
                            {item.type?.includes('token') || item.type?.includes('Cash') ? (
                              <Coins size={16} />
                            ) : item.type?.includes('Loyalty') ? (
                              <Award size={16} />
                            ) : (
                              <Ticket size={16} />
                            )}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                                {item.title}
                              </span>
                              <span style={{
                                fontSize: '10px',
                                color: '#fef08a',
                                background: 'rgba(234, 179, 8, 0.15)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 800
                              }}>
                                {item.code}
                              </span>
                              {item.isCurrent && (
                                <span style={{ fontSize: '8px', fontWeight: 900, background: '#10b981', color: '#0b0f19', padding: '1px 4px', borderRadius: '3px' }}>
                                  ACTIVE PASS
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                              Plan: <b>{item.planName}</b> &bull; {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {item.verifiedBy && (
                              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>
                                Verified by: {item.verifiedBy}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary)', display: 'block' }}>
                            ₹{Number(item.amountPaid || 0).toLocaleString('en-IN')}
                          </span>
                          {item.discountAmount > 0 && (
                            <span style={{ fontSize: '9px', color: '#34d399', fontWeight: 700, display: 'block' }}>
                              Saved ₹{Number(item.discountAmount).toLocaleString('en-IN')}
                            </span>
                          )}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyCollaborationCode(item.code)}
                              className="icon-btn"
                              style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.06)' }}
                              title="Copy Pass Code"
                            >
                              <Copy size={11} color="var(--text-muted)" />
                            </button>
                            {item.receiptNumber && (
                              <button
                                type="button"
                                onClick={() => handleViewReceipt(item.receiptNumber)}
                                className="icon-btn"
                                style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.06)' }}
                                title="View Tax Invoice"
                              >
                                <Receipt size={11} color="var(--cyan)" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                  fontSize: '11px',
                  color: '#fef08a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={14} color="#eab308" />
                  <span>All historical redemptions, vouchers and desk tokens are permanently synchronized with the Gym Admin database.</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowRedemptionModal(false);
                  handleViewReceipt(membershipStatus?.recentReceiptId || 'REC-2026-7829');
                }}
                className="btn btn-secondary"
                style={{ flex: 1, height: '40px', fontSize: '12px', gap: '6px' }}
              >
                <Receipt size={14} /> View Tax Invoice
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRedemptionModal(false);
                  setActiveTab('dashboard');
                }}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '40px',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  color: '#0b0f19',
                  border: 'none'
                }}
              >
                Use Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MODAL 1: CREATE / EDIT GYM FEE PLAN */}
      {showFeePlanModal && (
        <div className="modal-overlay" onClick={() => setShowFeePlanModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--amber), #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19'
                }}>
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                    {feePlanModalMode === 'create' ? 'Add New Gym Fee Plan (₹ INR)' : 'Edit Fee Plan Details'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {gymName} &bull; Official Membership Pricing Schedule
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFeePlanModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFeePlanModal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>Plan Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Elite Gold Annual All-Access"
                  value={feePlanForm.name}
                  onChange={(e) => setFeePlanForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ height: '38px', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Price in ₹ (INR)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>₹</span>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="11999"
                      value={feePlanForm.price}
                      onChange={(e) => setFeePlanForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      required
                      style={{ paddingLeft: '24px', height: '38px', fontSize: '13px', fontWeight: 800 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Duration (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="365"
                    value={feePlanForm.duration_days}
                    onChange={(e) => setFeePlanForm(prev => ({
                      ...prev,
                      duration_days: Number(e.target.value),
                      billingDuration: `${Math.round(Number(e.target.value) / 30)} Month(s)`
                    }))}
                    required
                    style={{ height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Admission / Registration Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={feePlanForm.admission_fee}
                    onChange={(e) => setFeePlanForm(prev => ({ ...prev, admission_fee: Number(e.target.value) }))}
                    style={{ height: '38px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>GST / Tax (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="18"
                    value={feePlanForm.tax_percent}
                    onChange={(e) => setFeePlanForm(prev => ({ ...prev, tax_percent: Number(e.target.value) }))}
                    style={{ height: '38px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Discount or Offer Tag (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Save 25%, ₹2000 Off"
                    value={feePlanForm.discount}
                    onChange={(e) => setFeePlanForm(prev => ({ ...prev, discount: e.target.value }))}
                    style={{ height: '38px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Badge (e.g. Most Popular)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Most Popular"
                    value={feePlanForm.badge}
                    onChange={(e) => setFeePlanForm(prev => ({ ...prev, badge: e.target.value }))}
                    style={{ height: '38px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Included Features (Comma Separated)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Personal Trainer Consultation, Locker Facility, Steam Bath, Diet Plan"
                  value={feePlanForm.features}
                  onChange={(e) => setFeePlanForm(prev => ({ ...prev, features: e.target.value }))}
                  style={{ fontSize: '12px', resize: 'vertical' }}
                />
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Member Visibility</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                    {feePlanForm.is_active ? 'Visible on member fee schedule' : 'Hidden from members (Draft tier)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeePlanForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`btn btn-sm ${feePlanForm.is_active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                  {feePlanForm.is_active ? 'Active & Published' : 'Hidden'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowFeePlanModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '40px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    height: '40px',
                    fontSize: '13px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--amber), #d97706)',
                    color: '#0b0f19',
                    border: 'none',
                    gap: '6px'
                  }}
                >
                  <Save size={14} />
                  <span>{savingPlan ? 'Saving Plan...' : (feePlanModalMode === 'create' ? 'Create Fee Plan (₹ INR)' : 'Save Plan Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL 2: EDIT RATE CARD IMAGE & POLICY NOTES */}
      {showRateCardModal && (
        <div className="modal-overlay" onClick={() => setShowRateCardModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19'
                }}>
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Official Rate Card Document & Notes</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Upload official notice board graphic or configure policy note
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRateCardModal(false)}
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRateCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Graphic Preview */}
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Rate Card Poster Graphic</label>
                {editFeeImage ? (
                  <div style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#070b13',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    marginBottom: '8px'
                  }}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <span className="badge badge-fitness" style={{ fontSize: '10px' }}>CUSTOM GRAPHIC LOADED</span>
                      <button
                        type="button"
                        onClick={() => setEditFeeImage('')}
                        className="btn btn-sm"
                        style={{ fontSize: '10px', padding: '2px 8px', color: 'var(--rose)', background: 'rgba(244, 63, 94, 0.12)' }}
                      >
                        Reset to Vector Graphic
                      </button>
                    </div>
                    <img
                      src={editFeeImage}
                      alt="Custom Rate Card"
                      style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px dashed var(--border-color)',
                    textAlign: 'center',
                    marginBottom: '8px'
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                      Currently using system high-res interactive vector poster.
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      You can upload a custom gym poster image (PNG/JPG) or attach an image link.
                    </span>
                  </div>
                )}
              </div>

              {/* Upload File */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    height: '38px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <Camera size={14} />
                  <span>Upload Poster File (Image)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRateCardFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Or Attach URL */}
              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>Or Paste Image URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/rate-card.jpg"
                    value={rateCardImageInput}
                    onChange={(e) => setRateCardImageInput(e.target.value)}
                    style={{ height: '36px', fontSize: '12px', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyRateCardUrl}
                    className="btn btn-secondary"
                    style={{ height: '36px', fontSize: '12px', padding: '0 12px' }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Policy Notes */}
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Official Rate Card Policy Note & Inclusions
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. All plans include locker facility & floor coach guidance. Rates inclusive of GST."
                  value={editRateCardNote}
                  onChange={(e) => setEditRateCardNote(e.target.value)}
                  style={{ fontSize: '12px', resize: 'vertical' }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  This text appears at the bottom of the digital rate card and print copies.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowRateCardModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '40px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRateCard}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    height: '40px',
                    fontSize: '13px',
                    fontWeight: 800,
                    gap: '6px'
                  }}
                >
                  <Save size={14} />
                  <span>{savingRateCard ? 'Saving Rate Card...' : 'Save Rate Card Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

