import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import {
  ShieldCheck,
  Users,
  UserCheck,
  IndianRupee,
  Activity,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Dumbbell,
  Check,
  Eye,
  RefreshCw,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Banknote,
  CreditCard,
  Edit3,
  Save,
  Trash2,
  Tag,
  ShieldAlert,
  Image as ImageIcon,
  Printer,
  Download,
  Upload,
  Share2,
  Maximize2,
  FileText,
  FileSpreadsheet,
  Camera,
  Receipt,
  Gift,
  Key,
  BadgeCheck,
  Lock,
  Unlock,
  Wrench,
  Pin,
  Star,
  CheckSquare,
  AlertCircle,
  Bell,
  Calendar,
  ExternalLink,
  Copy,
  BookOpen,
  Filter,
  UserPlus
} from 'lucide-react';



export const AdminDashboardPage = ({ initialSubTab }) => {
  const { user } = useAuth();
  const { showToast, setActiveTab, adminSubTab, setAdminSubTab } = useFitness();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSubTab, setActiveSubTabState] = useState(initialSubTab || adminSubTab || 'members'); // 'members' | 'fees' | 'checkins' | 'equipment' | 'directory' | 'notes'

  const setActiveSubTab = (tab) => {
    setActiveSubTabState(tab);
    if (setAdminSubTab) {
      setAdminSubTab(tab);
    }
  };

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTabState(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (!initialSubTab && adminSubTab) {
      setActiveSubTabState(adminSubTab);
    }
  }, [adminSubTab, initialSubTab]);

  const [maintenanceNavOpen, setMaintenanceNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Member Code Verification State (Add Member via Verification Code)
  const [memberVerificationCode, setMemberVerificationCode] = useState('');
  const [verifyingMemberCode, setVerifyingMemberCode] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [loadingPendingApplicants, setLoadingPendingApplicants] = useState(false);
  const [showPendingQueue, setShowPendingQueue] = useState(true);

  // Gym Machines & Equipment Maintenance State
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentZoneFilter, setEquipmentZoneFilter] = useState('all');
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState('all');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [newEquipmentForm, setNewEquipmentForm] = useState({
    name: '',
    zone: 'Zone A • Free Weights (East Bay)',
    brand: 'Eleiko / Hammer Strength',
    serialNumber: '',
    condition: 'Operational',
    status: 'Operational',
    lastInspection: new Date().toISOString().split('T')[0],
    nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    technicianNotes: ''
  });
  const [showServiceLogModal, setShowServiceLogModal] = useState(false);
  const [selectedEquipmentForService, setSelectedEquipmentForService] = useState(null);
  const [serviceLogForm, setServiceLogForm] = useState({
    technician: 'Ramesh Sharma (Matrix Certified)',
    action: 'Routine lubrication, cable tension & torque bolt safety check',
    newCondition: 'Operational',
    nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Maintenance Directory State (Technicians, AMC, Vendors, Emergency)
  const [directoryList, setDirectoryList] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryCategoryFilter, setDirectoryCategoryFilter] = useState('all');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directorySort, setDirectorySort] = useState('name');
  const [showAddDirectoryModal, setShowAddDirectoryModal] = useState(false);
  const [editingDirectoryEntry, setEditingDirectoryEntry] = useState(null);
  const [savingDirectory, setSavingDirectory] = useState(false);
  const [directoryToDelete, setDirectoryToDelete] = useState(null);
  const [showDeleteDirectoryModal, setShowDeleteDirectoryModal] = useState(false);
  const [directoryForm, setDirectoryForm] = useState({
    name: '',
    category: 'Technician',
    companyName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    specialization: '',
    linkedEquipment: [],
    contractStartDate: '',
    contractEndDate: '',
    serviceFrequency: 'Monthly',
    lastServiceDate: new Date().toISOString().split('T')[0],
    nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rating: 5,
    notes: ''
  });

  // Admin-Only Confidential Notes & Sentences Scratchpad State
  const [adminNotes, setAdminNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesCategoryFilter, setNotesCategoryFilter] = useState('all');
  const [notesColorFilter, setNotesColorFilter] = useState('all');
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [draftAutosavedAt, setDraftAutosavedAt] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [newNoteForm, setNewNoteForm] = useState({
    title: '',
    body: '',
    category: 'General',
    isPinned: false,
    colorLabel: 'amber',
    reminderDate: '',
    isPrivateToMe: false,
    linkedDirectoryId: '',
    linkedEquipmentId: '',
    attachments: []
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteForm, setEditingNoteForm] = useState({
    title: '',
    body: '',
    category: 'General',
    isPinned: false,
    colorLabel: 'amber',
    reminderDate: '',
    isPrivateToMe: false,
    linkedDirectoryId: '',
    linkedEquipmentId: ''
  });

  // Quick Check-in form (Unique 4-digit PIN + Time Tracker)
  const [checkInInput, setCheckInInput] = useState('');
  const [customCheckInTime, setCustomCheckInTime] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [recentVerification, setRecentVerification] = useState(null);

  // Gym Redemption & Member Collaboration State
  const [redemptionCodeInput, setRedemptionCodeInput] = useState('');
  const [verifyingRedemption, setVerifyingRedemption] = useState(false);
  const [recentColabVerification, setRecentColabVerification] = useState(null);

  // Fee Structure & Digital Rate Card State (Admin-Only)
  const [feePlans, setFeePlans] = useState([]);
  const [savingFees, setSavingFees] = useState(false);
  const [publishingFees, setPublishingFees] = useState(false);
  const [confirmingToken, setConfirmingToken] = useState(null);
  const [feeStructureImage, setFeeStructureImage] = useState('');
  const [rateCardNote, setRateCardNote] = useState('All plans include locker facility & floor coach guidance. Rates inclusive of GST.');
  const [showFeeImageModal, setShowFeeImageModal] = useState(false);
  const [feeImageUploadInput, setFeeImageUploadInput] = useState('');
  const [rateCardDesignTheme, setRateCardDesignTheme] = useState('gold'); // 'gold' | 'emerald' | 'cyber'

  // Fee Terms & Policies State
  const [gymTerms, setGymTerms] = useState({
    refund_policy: 'Memberships are non-refundable after 7 days from purchase. Unused personal training sessions may be credited.',
    freeze_policy: 'Quarterly and Annual tiers are eligible for up to 30 days of medical or travel freeze with 48h advance notice.',
    late_fee_policy: 'A 5-day grace period is provided after expiration. Late renewal incurs a ₹200 desk reactivating surcharge.',
    rules: 'Personal sweat towels and clean athletic shoes mandatory on all lifting platforms and cardio decks.',
    version: 'v2.4',
    is_published: true,
    last_published_at: '2026-10-07T12:00:00Z',
    version_history: []
  });
  const [savingTerms, setSavingTerms] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);

  // Plan Create / Edit Modal State
  const [showFeePlanModal, setShowFeePlanModal] = useState(false);
  const [feePlanModalMode, setFeePlanModalMode] = useState('create'); // 'create' | 'edit'
  const [feePlanForm, setFeePlanForm] = useState({
    id: '',
    name: '',
    duration_days: 30,
    billingDuration: '1 Month',
    price: 1999,
    admission_fee: 0,
    discount: '',
    tax_percent: 18,
    features: 'Full Gym Access, Locker Facility, Strength Floor, Cardio Arena',
    is_active: true,
    is_popular: false,
    badge: ''
  });

  // Branded Rate Card PDF & Receipt Modals
  const [showPdfRateCardModal, setShowPdfRateCardModal] = useState(false);
  const [pdfRateCardData, setPdfRateCardData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Customize Gym Profile & Instructions State
  const [showEditGymModal, setShowEditGymModal] = useState(false);
  const [customizingGym, setCustomizingGym] = useState(false);
  const [customGymForm, setCustomGymForm] = useState({
    gymId: 'gym_1',
    name: '',
    address: '',
    tagLine: '',
    phone: '',
    openingHours: '05:00 AM - 11:30 PM',
    instructions: '1. Personal sweat towel is mandatory on all workout floors.\n2. Re-rack all barbell plates, dumbbells, and accessories immediately after sets.\n3. Chalk stations are strictly for Olympic platforms and power cages.\n4. Wipe down cardio screens and bench pads with provided sanitizing spray after use.',
    notice: 'Official Gym Notice: Peak floor hours are 06:00 PM - 08:30 PM. Group classes start on the hour.',
    dayPassPrice: 299
  });

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Elite Gold Annual All-Access',
    planId: 'plan_annual',
    assignedTrainer: 'Coach Marcus Vance',
    amountPaid: 11999,
    amountDue: 0,
    paymentMode: 'Desk UPI (GPay/PhonePe)',
    notes: ''
  });

  // Edit Member Modal State
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [savingEditMember, setSavingEditMember] = useState(false);
  const [editMemberForm, setEditMemberForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    plan: 'Elite Gold Annual All-Access',
    planId: 'plan_annual',
    assignedTrainer: 'Coach Marcus Vance',
    status: 'Active',
    expiryDate: '',
    amountPaid: 11999,
    amountDue: 0,
    paymentMode: 'Desk UPI (GPay/PhonePe)',
    receiptNumber: '',
    notes: ''
  });

  // Delete Member Modal State
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [res, feesRes, notesRes, eqRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getGymFees('gym_1').catch(() => null),
        api.getAdminNotes().catch(() => null),
        api.getEquipment().catch(() => null)
      ]);

      if (res.success) {
        setDashboardData(res);
        if (eqRes && eqRes.success && eqRes.equipment) {
          setEquipmentList(eqRes.equipment);
        } else if (res.equipment) {
          setEquipmentList(res.equipment);
        }

        if (notesRes && notesRes.success && notesRes.notes) {
          setAdminNotes(notesRes.notes);
        }

        if (feesRes && feesRes.success && feesRes.feePlans) {
          setFeePlans(feesRes.feePlans.filter(p => p.id !== 'plan_day_pass' && !p.name?.toLowerCase().includes('day pass')));
          if (feesRes.gymTerms) {
            setGymTerms(feesRes.gymTerms);
          }
        } else if (res.feePlans) {
          setFeePlans(
            res.feePlans.filter(p => p.id !== 'plan_day_pass' && !p.name?.toLowerCase().includes('day pass'))
          );
        }
        if (res.linkedGym?.feeStructureImage) {
          setFeeStructureImage(res.linkedGym.feeStructureImage);
        }
        if (res.linkedGym?.rateCardNote) {
          setRateCardNote(res.linkedGym.rateCardNote);
        }
      }
      fetchMaintenanceDirectoryOnly();
      fetchAdminNotesOnly();
      fetchEquipmentOnly();
      fetchPendingApplicants();
    } catch (err) {
      showToast('Error loading gym admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminNotesOnly = async () => {
    try {
      setLoadingNotes(true);
      const res = await api.getAdminNotes();
      if (res.success && res.notes) {
        setAdminNotes(res.notes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchEquipmentOnly = async () => {
    try {
      const res = await api.getEquipment();
      if (res.success && res.equipment) {
        setEquipmentList(res.equipment);
      }

    } catch (_) { }
  };
  const fetchMaintenanceDirectoryOnly = async () => {
    try {
      setDirectoryLoading(true);
      const res = await api.getMaintenanceDirectory();
      if (res.success && res.directory) {
        setDirectoryList(res.directory);
      }
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setDirectoryLoading(false);
    }
  };

  const fetchPendingApplicants = async () => {
    try {
      setLoadingPendingApplicants(true);
      const res = await api.getPendingMembers();
      if (res && res.success) {
        setPendingApplicants(res.pending || []);
      }
    } catch (err) {
      console.warn('Failed to load pending applicants:', err.message);
    } finally {
      setLoadingPendingApplicants(false);
    }
  };

  const handleVerifyMemberCode = async (codeToVerify) => {
    const targetCode = (codeToVerify || memberVerificationCode).trim();
    if (!targetCode) {
      showToast('Please enter a verification code (e.g. FH-VER-8924)', 'error');
      return;
    }
    try {
      setVerifyingMemberCode(true);
      const res = await api.verifyMemberCode(targetCode);
      if (res && res.success) {
        setVerificationResult(res);
        showToast(res.message || 'Member verified and enrolled successfully!', 'success');
        setMemberVerificationCode('');
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        await fetchDashboard();
        await fetchPendingApplicants();
      } else {
        showToast(res.message || 'Verification failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to verify member code', 'error');
    } finally {
      setVerifyingMemberCode(false);
    }
  };

  // --- Directory Handlers ---
  const handleOpenAddDirectory = () => {
    setEditingDirectoryEntry(null);
    setDirectoryForm({
      name: '',
      category: 'Technician',
      companyName: '',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      specialization: '',
      linkedEquipment: [],
      contractStartDate: '',
      contractEndDate: '',
      serviceFrequency: 'Monthly',
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rating: 5,
      notes: ''
    });
    setShowAddDirectoryModal(true);
  };

  const handleOpenEditDirectory = (entry) => {
    setEditingDirectoryEntry(entry);
    setDirectoryForm({
      name: entry.name || '',
      category: entry.category || 'Technician',
      companyName: entry.companyName || '',
      phone: entry.phone || '',
      alternatePhone: entry.alternatePhone || '',
      email: entry.email || '',
      address: entry.address || '',
      specialization: entry.specialization || '',
      linkedEquipment: Array.isArray(entry.linkedEquipment) ? entry.linkedEquipment : [],
      contractStartDate: entry.contractStartDate || '',
      contractEndDate: entry.contractEndDate || '',
      serviceFrequency: entry.serviceFrequency || 'Monthly',
      lastServiceDate: entry.lastServiceDate || '',
      nextServiceDue: entry.nextServiceDue || '',
      rating: entry.rating || 5,
      notes: entry.notes || ''
    });
    setShowAddDirectoryModal(true);
  };

  const handleSaveDirectorySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!directoryForm.name.trim() || !directoryForm.phone.trim()) {
      showToast('Contact name and primary phone number are required.', 'warning');
      return;
    }

    setSavingDirectory(true);
    try {
      if (editingDirectoryEntry) {
        const res = await api.updateDirectoryEntry(editingDirectoryEntry.id, directoryForm);
        if (res.success) {
          showToast(`✅ Contact "${res.entry?.name || directoryForm.name}" updated!`, 'success');
          setShowAddDirectoryModal(false);
          setEditingDirectoryEntry(null);
          fetchMaintenanceDirectoryOnly();
        }
      } else {
        const res = await api.createDirectoryEntry(directoryForm);
        if (res.success) {
          showToast(`🎉 Contact "${res.entry?.name || directoryForm.name}" added to Maintenance Directory!`, 'success');
          setShowAddDirectoryModal(false);
          fetchMaintenanceDirectoryOnly();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save directory contact', 'error');
    } finally {
      setSavingDirectory(false);
    }
  };

  const handleOpenDeleteDirectoryConfirm = (entry) => {
    setDirectoryToDelete(entry);
    setShowDeleteDirectoryModal(true);
  };

  const handleConfirmDeleteDirectory = async () => {
    if (!directoryToDelete) return;
    try {
      const res = await api.deleteDirectoryEntry(directoryToDelete.id);
      if (res.success) {
        showToast(res.message || `Contact "${directoryToDelete.name}" removed`, 'success');
        setShowDeleteDirectoryModal(false);
        setDirectoryToDelete(null);
        fetchMaintenanceDirectoryOnly();
      }
    } catch (err) {
      showToast('Failed to delete directory entry: ' + err.message, 'error');
    }
  };

  const handleExportDirectoryCsv = async () => {
    try {
      const csvText = await api.exportDirectoryCsv();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Gym_Maintenance_Directory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Maintenance Directory exported to CSV!', 'success');
    } catch (err) {
      showToast('Failed to export CSV: ' + err.message, 'error');
    }
  };

  // --- Equipment Action Handlers ---
  const handleAddEquipmentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newEquipmentForm.name.trim() || !newEquipmentForm.zone.trim()) {
      showToast('Please enter machine name and gym zone.', 'warning');
      return;
    }

    setSavingEquipment(true);
    try {
      const res = await api.addEquipment(newEquipmentForm);
      if (res.success) {
        showToast(res.message || 'Equipment added successfully!', 'success');
        setShowAddEquipmentModal(false);
        setNewEquipmentForm({
          name: '',
          zone: 'Zone A • Free Weights (East Bay)',
          brand: 'Eleiko / Hammer Strength',
          serialNumber: '',
          condition: 'Operational',
          status: 'Operational',
          lastInspection: new Date().toISOString().split('T')[0],
          nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          technicianNotes: ''
        });
        fetchEquipmentOnly();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add equipment', 'error');
    } finally {
      setSavingEquipment(false);
    }
  };

  const handleUpdateEquipmentStatus = async (id, condition) => {
    try {
      const statusMap = {
        'Operational': 'Operational',
        'Excellent': 'Operational',
        'Optimal': 'Operational',
        'Needs Maintenance': 'Service Scheduled',
        'Under Repair': 'Under Repair',
        'Out of Service': 'Decommissioned'
      };
      const res = await api.updateEquipment(id, {
        condition,
        status: statusMap[condition] || 'Operational',
        lastInspection: new Date().toISOString().split('T')[0]
      });
      if (res.success) {
        showToast(res.message || 'Updated machine condition!', 'success');
        fetchEquipmentOnly();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteEquipmentItem = async (item) => {
    if (!window.confirm(`Are you sure you want to decommission and remove "${item.name}" (${item.zone}) from the equipment roster?`)) {
      return;
    }
    try {
      const res = await api.deleteEquipment(item.id);
      if (res.success) {
        showToast(res.message || 'Equipment removed', 'success');
        fetchEquipmentOnly();
      }
    } catch (err) {
      showToast('Failed to delete equipment', 'error');
    }
  };

  const handleOpenServiceLog = (item) => {
    setSelectedEquipmentForService(item);
    setServiceLogForm({
      technician: 'Ramesh Sharma (Matrix Certified)',
      action: 'Routine lubrication, cable tension & torque bolt safety check',
      newCondition: 'Operational',
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowServiceLogModal(true);
  };

  const handleServiceLogSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEquipmentForService) return;

    setSavingEquipment(true);
    try {
      const res = await api.logEquipmentService(selectedEquipmentForService.id, serviceLogForm);
      if (res.success) {
        showToast(res.message || 'Logged service event successfully!', 'success');
        setShowServiceLogModal(false);
        fetchEquipmentOnly();
      }
    } catch (err) {
      showToast('Failed to log service: ' + err.message, 'error');
    } finally {
      setSavingEquipment(false);
    }
  };

  // --- Admin Confidential Notes Action Handlers ---
  const handleCreateNoteSubmit = async (e) => {
    if (e) e.preventDefault();
    const noteText = (newNoteForm.body || '').trim();
    if (!noteText) {
      showToast('Please enter note sentences / context before saving.', 'warning');
      return;
    }

    setSavingNote(true);
    try {
      const res = await api.createAdminNote(newNoteForm);
      if (res.success) {
        showToast('🔒 Confidential admin note saved securely!', 'success');
        setNewNoteForm({
          title: '',
          body: '',
          category: 'General',
          isPinned: false,
          colorLabel: 'amber',
          reminderDate: '',
          isPrivateToMe: false,
          linkedDirectoryId: '',
          linkedEquipmentId: '',
          attachments: []
        });
        localStorage.removeItem('fit_health_admin_note_draft');
        setDraftAutosavedAt(null);
        fetchAdminNotesOnly();
      }
    } catch (err) {
      showToast('Failed to save note: ' + err.message, 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleStartEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteForm({
      title: note.title || '',
      body: note.body || note.content || '',
      category: note.category || 'General',
      isPinned: Boolean(note.isPinned),
      colorLabel: note.colorLabel || 'amber',
      reminderDate: note.reminderDate || '',
      isPrivateToMe: Boolean(note.isPrivateToMe),
      linkedDirectoryId: note.linkedDirectoryId || '',
      linkedEquipmentId: note.linkedEquipmentId || ''
    });
  };

  const handleSaveEditNote = async (id) => {
    if (!editingNoteForm.body?.trim()) {
      showToast('Note body sentences cannot be empty.', 'warning');
      return;
    }

    try {
      const res = await api.updateAdminNote(id, editingNoteForm);
      if (res.success) {
        showToast('✅ Admin note updated successfully!', 'success');
        setEditingNoteId(null);
        fetchAdminNotesOnly();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update note', 'error');
    }
  };

  const handleTogglePinNote = async (note) => {
    try {
      const res = await api.updateAdminNote(note.id, {
        isPinned: !note.isPinned
      });
      if (res.success) {
        showToast(note.isPinned ? 'Unpinned note' : '⭐ Pinned note to top!', 'info');
        fetchAdminNotesOnly();
      }
    } catch (err) {
      showToast('Failed to toggle pin', 'error');
    }
  };

  const handleOpenDeleteNoteConfirm = (note) => {
    setNoteToDelete(note);
    setShowDeleteNoteModal(true);
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      const res = await api.deleteAdminNote(noteToDelete.id);
      if (res.success) {
        showToast('🗑️ Note permanently removed', 'success');
        setShowDeleteNoteModal(false);
        setNoteToDelete(null);
        fetchAdminNotesOnly();
      }
    } catch (err) {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleCopyNoteText = (note) => {
    const textToCopy = `${note.title ? `${note.title}\n` : ''}${note.body || note.content || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showToast('📋 Note sentences copied to clipboard!', 'info');
    }
  };

  // Draft autosave effect
  useEffect(() => {
    const savedDraft = localStorage.getItem('fit_health_admin_note_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && (parsed.body || parsed.title)) {
          setNewNoteForm(prev => ({ ...prev, ...parsed }));
          setDraftAutosavedAt('Restored draft from previous session');
        }
      } catch (_) { }
    }
  }, []);

  const handleNoteBodyChange = (value) => {
    setNewNoteForm(prev => {
      const updated = { ...prev, body: value };
      try {
        localStorage.setItem('fit_health_admin_note_draft', JSON.stringify(updated));
        setDraftAutosavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (_) { }
      return updated;
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickCheckIn = async (e) => {
    if (e) e.preventDefault();
    if (!checkInInput.trim()) return;

    setCheckInLoading(true);
    try {
      const res = await api.checkInMember({
        pin: checkInInput.trim(),
        identifier: checkInInput.trim(),
        checkInTime: customCheckInTime.trim() || undefined
      });
      if (res.success) {
        showToast(res.message, 'success');
        setRecentVerification(res.checkIn);
        setCheckInInput('');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleDirectCheckIn = async (member) => {
    try {
      const pin = member.checkInPin || member.membershipId?.replace(/\D/g, '')?.slice(-4) || '7829';
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const res = await api.checkInMember({
        pin,
        identifier: member.id || member.membershipId || pin,
        memberName: member.name,
        checkInTime: nowTime
      });
      if (res && res.success) {
        showToast(res.message || `Checked in ${member.name} successfully at ${nowTime}!`, 'success');
        fetchDashboard();
      } else {
        showToast(res?.message || `Failed to check in ${member.name}`, 'error');
      }
    } catch (err) {
      showToast(`Check-in error for ${member.name}: ${err.message}`, 'error');
    }
  };

  const handleVerifyRedemptionCode = async (e) => {
    if (e) e.preventDefault();
    if (!redemptionCodeInput.trim()) {
      showToast('Please enter the member redemption code or membership ID.', 'warning');
      return;
    }

    setVerifyingRedemption(true);
    try {
      const res = await api.adminVerifyRedemptionCode(redemptionCodeInput.trim());
      if (res.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) { }

        showToast(res.message || 'Member redemption verified and collaborated!', 'success');
        setRecentColabVerification(res);
        setRedemptionCodeInput('');
        fetchDashboard();
      } else {
        showToast(res.message || 'Redemption verification failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to verify member redemption code.', 'error');
    } finally {
      setVerifyingRedemption(false);
    }
  };

  const handleUpdateStatus = async (memberId, newStatus) => {
    try {
      const res = await api.updateMemberStatus(memberId, newStatus);
      if (res.success) {
        showToast(`Updated member to ${newStatus}`, 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addGymMember(newMemberForm);
      if (res.success) {
        showToast(`Member ${res.member.name} registered successfully!`, 'success');
        setShowAddModal(false);
        setNewMemberForm({
          name: '',
          email: '',
          phone: '',
          plan: 'Elite Gold Annual',
          assignedTrainer: 'Coach Marcus Vance',
          notes: ''
        });
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    }
  };

  // Edit & Delete Member Handlers
  const handleOpenEditMember = (member) => {
    setEditMemberForm({
      id: member.id || member.membershipId,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      plan: member.plan || 'Elite Gold Annual',
      assignedTrainer: member.assignedTrainer || 'Coach Marcus Vance',
      status: member.status || 'Active',
      expiryDate: member.expiryDate || '',
      notes: member.notes || ''
    });
    setShowEditMemberModal(true);
  };

  const handleSaveEditMember = async (e) => {
    e.preventDefault();
    if (!editMemberForm.name.trim() || !editMemberForm.email.trim()) {
      showToast('Name and Email are required', 'warning');
      return;
    }

    setSavingEditMember(true);
    try {
      const res = await api.updateGymMember(editMemberForm.id, editMemberForm);
      if (res.success) {
        showToast(`✅ Member "${res.member.name}" updated successfully!`, 'success');
        setShowEditMemberModal(false);
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update member', 'error');
    } finally {
      setSavingEditMember(false);
    }
  };

  const handleOpenDeleteConfirm = (member) => {
    setMemberToDelete(member);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setDeletingMember(true);
    try {
      const res = await api.deleteGymMember(memberToDelete.id || memberToDelete.membershipId);
      if (res.success) {
        showToast(`🗑️ Member "${memberToDelete.name}" removed from gym roster`, 'success');
        setShowDeleteConfirmModal(false);
        setMemberToDelete(null);
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete member', 'error');
    } finally {
      setDeletingMember(false);
    }
  };

  // Fee Structure & Rate Card Handlers
  const handleOpenAddFeePlanModal = () => {
    setFeePlanModalMode('create');
    setFeePlanForm({
      id: '',
      name: '',
      duration_days: 30,
      billingDuration: '1 Month',
      price: 1999,
      admission_fee: 0,
      discount: '',
      tax_percent: 18,
      features: 'Full Gym Floor Access, Locker Facility, Strength Arena',
      is_active: true,
      is_popular: false,
      badge: ''
    });
    setShowFeePlanModal(true);
  };

  const handleOpenEditFeePlanModal = (plan) => {
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

    setSavingFees(true);
    try {
      const payload = {
        ...feePlanForm,
        gym_id: dashboardData?.linkedGym?.id || 'gym_1',
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

      if (res.success) {
        showToast(res.message || 'Fee plan saved successfully!', 'success');
        setShowFeePlanModal(false);
        fetchDashboard();
      }
    } catch (err) {
      showToast('Error saving fee plan: ' + err.message, 'error');
    } finally {
      setSavingFees(false);
    }
  };

  const handleDeleteFeePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to delete fee plan "${planName}"?`)) return;
    try {
      const res = await api.deleteFeePlan(planId);
      if (res.success) {
        showToast(res.message || 'Fee plan deleted', 'info');
        fetchDashboard();
      }
    } catch (err) {
      showToast('Failed to delete fee plan: ' + err.message, 'error');
    }
  };

  const handleMovePlanUp = async (index) => {
    if (index === 0) return;
    const reordered = [...feePlans];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Assign new sort_orders
    const orderList = reordered.map((p, i) => ({ id: p.id, sort_order: i + 1 }));
    setFeePlans(reordered);

    try {
      await api.reorderFeePlans(orderList);
      showToast('Plan order updated!', 'info');
    } catch (err) {
      showToast('Failed to persist order', 'warning');
    }
  };

  const handleMovePlanDown = async (index) => {
    if (index === feePlans.length - 1) return;
    const reordered = [...feePlans];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const orderList = reordered.map((p, i) => ({ id: p.id, sort_order: i + 1 }));
    setFeePlans(reordered);

    try {
      await api.reorderFeePlans(orderList);
      showToast('Plan order updated!', 'info');
    } catch (err) {
      showToast('Failed to persist order', 'warning');
    }
  };

  const handleTogglePlanActive = async (plan) => {
    try {
      const newStatus = plan.is_active === false ? true : false;
      const res = await api.updateFeePlan(plan.id, { is_active: newStatus });
      if (res.success) {
        showToast(`Plan is now ${newStatus ? 'Active & Visible' : 'Hidden from Members'}`, 'info');
        fetchDashboard();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handlePublishFeeSchedule = async (shouldPublish = true) => {
    setPublishingFees(true);
    try {
      const gymId = dashboardData?.linkedGym?.id || 'gym_1';
      const res = await api.publishFeeStructure({
        gym_id: gymId,
        publish: shouldPublish,
        version_note: shouldPublish ? 'Published live update to all member interfaces.' : 'Unpublished fee schedule.'
      });
      if (res.success) {
        showToast(res.message, 'success');
        if (res.gymTerms) {
          setGymTerms(res.gymTerms);
        }
        fetchDashboard();
      }
    } catch (err) {
      showToast('Publish failed: ' + err.message, 'error');
    } finally {
      setPublishingFees(false);
    }
  };

  const handleSaveGymTerms = async (e) => {
    e.preventDefault();
    setSavingTerms(true);
    try {
      const gymId = dashboardData?.linkedGym?.id || 'gym_1';
      const res = await api.updateGymTerms(gymId, gymTerms);
      if (res.success) {
        showToast('✅ Gym terms & policies saved successfully!', 'success');
        if (res.gymTerms) {
          setGymTerms(res.gymTerms);
        }
      }
    } catch (err) {
      showToast('Failed to save policies: ' + err.message, 'error');
    } finally {
      setSavingTerms(false);
    }
  };

  const handleOpenPdfRateCard = async () => {
    try {
      setLoadingPdf(true);
      setShowPdfRateCardModal(true);
      const gymId = dashboardData?.linkedGym?.id || 'gym_1';
      const res = await api.getGymFeesPdf(gymId);
      if (res.success) {
        setPdfRateCardData(res.pdfData);
      }
    } catch (err) {
      showToast('Failed to load PDF rate card payload', 'error');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const res = await api.getMemberReceiptPdf(receiptId || 'txn_101');
      if (res.success) {
        setActiveReceipt(res.receipt);
        setShowReceiptModal(true);
      }
    } catch (err) {
      showToast('Failed to load receipt details', 'error');
    }
  };

  const handleSelectPlanForNewMember = (planName) => {
    const selected = feePlans.find(p => p.name === planName);
    if (selected) {
      const price = (Number(selected.price) || 0) + (Number(selected.admission_fee) || 0);
      setNewMemberForm(prev => ({
        ...prev,
        plan: selected.name,
        planId: selected.id,
        amountPaid: price,
        amountDue: 0
      }));
    } else {
      setNewMemberForm(prev => ({ ...prev, plan: planName }));
    }
  };

  const handleSelectPlanForEditMember = (planName) => {
    const selected = feePlans.find(p => p.name === planName);
    if (selected) {
      const price = (Number(selected.price) || 0) + (Number(selected.admission_fee) || 0);
      const days = Number(selected.duration_days) || 30;
      const nextExp = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
      setEditMemberForm(prev => ({
        ...prev,
        plan: selected.name,
        planId: selected.id,
        amountPaid: price,
        amountDue: 0,
        expiryDate: nextExp
      }));
    } else {
      setEditMemberForm(prev => ({ ...prev, plan: planName }));
    }
  };

  const handleSaveFeeStructure = async () => {
    setSavingFees(true);
    try {
      const res = await api.updateGymFeeStructure({
        plans: feePlans,
        feeStructureImage,
        rateCardNote
      });
      if (res.success) {
        showToast('✅ Gym Fees Structure & Digital Fee Copy Asset published in ₹ INR!', 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast('Failed to save fee structure: ' + err.message, 'error');
    } finally {
      setSavingFees(false);
    }
  };

  const handleFeeImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFeeStructureImage(event.target.result);
      showToast('Digital Fee Structure Image loaded! Click Save to publish.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyFeeImageUrl = () => {
    if (!feeImageUploadInput.trim()) {
      showToast('Please enter a valid image URL', 'warning');
      return;
    }
    setFeeStructureImage(feeImageUploadInput.trim());
    setFeeImageUploadInput('');
    showToast('Digital Fee Image URL applied! Click Save to store.', 'success');
  };

  const handlePrintRateCard = () => {
    window.print();
  };

  const handleCopyRateCardSummary = () => {
    const lines = [
      `🏛️ ${stats.gymName || 'Gym'} - Official Fee Structure`,
      `📍 ${stats.gymBranch || stats.gymAddress || 'Flagship Branch'}`,
      `🕒 Hours: ${dashboardData?.linkedGym?.openingHours || '05:00 AM - 11:30 PM'}`,
      `📞 Contact: ${dashboardData?.linkedGym?.phone || '+91 98123 45678'}`,
      `---------------------------------`,
      ...feePlans.map(p => `• ${p.name}: ₹${p.price?.toLocaleString('en-IN')}/${p.billingDuration || `${p.duration_days} Days`}`),
      `---------------------------------`,
      `📌 Note: ${rateCardNote}`
    ];
    navigator.clipboard?.writeText(lines.join('\n'));
    showToast('Digital Rate Card text summary copied to clipboard! 📋', 'info');
  };


  const handleSwitchGym = async (gymId) => {
    try {
      const res = await api.switchAdminGym(gymId);
      if (res.success) {
        showToast(`Linked admin console to ${res.linkedGym.name}`, 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast('Could not switch gym: ' + err.message, 'error');
    }
  };

  const handleConfirmCashToken = async (tokenId) => {
    setConfirmingToken(tokenId);
    try {
      const res = await api.confirmCashToken(tokenId);
      if (res.success) {
        showToast(res.message, 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setConfirmingToken(null);
    }
  };

  const handleOpenCustomizeGym = () => {
    const currentGym = dashboardData?.linkedGym || {};
    setCustomGymForm({
      gymId: currentGym.id || 'gym_1',
      name: currentGym.name || stats.gymName || 'Iron Fortress Barbell Club',
      address: currentGym.address || stats.gymAddress || '442 Fitness Boulevard, Downtown Metro',
      tagLine: currentGym.tagLine || 'Premier Strength, Hypertrophy & Performance Facility',
      phone: currentGym.phone || '+91 98123 45678',
      openingHours: currentGym.openingHours || '05:00 AM - 11:30 PM',
      instructions: currentGym.instructions || '1. Personal sweat towel is mandatory on all workout floors.\n2. Re-rack all barbell plates, dumbbells, and accessories immediately after sets.\n3. Chalk stations are strictly for Olympic platforms and power cages.\n4. Wipe down cardio screens and bench pads with provided sanitizing spray after use.',
      notice: currentGym.notice || 'Official Gym Notice: Peak floor hours are 06:00 PM - 08:30 PM. Group classes start on the hour.',
      dayPassPrice: currentGym.dayPassPrice || 299
    });
    setShowEditGymModal(true);
  };

  const handleSaveCustomGym = async (e) => {
    e.preventDefault();
    if (!customGymForm.name.trim()) {
      showToast('Gym Name is required', 'warning');
      return;
    }
    setCustomizingGym(true);
    try {
      const res = await api.customizeGymDetails(customGymForm);
      if (res.success) {
        showToast(`🎉 Gym name updated to "${res.gym.name}"!`, 'success');
        setShowEditGymModal(false);
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update gym details', 'error');
    } finally {
      setCustomizingGym(false);
    }
  };

  const members = dashboardData?.members || [];
  const checkIns = dashboardData?.checkIns || [];
  const equipment = dashboardData?.equipment || [];
  const stats = dashboardData?.stats || {
    totalRegisteredMembers: 248,
    activeCheckInsToday: 37,
    dayPassesSoldToday: 14,
    monthlyRevenueInr: 1245000,
    currency: 'INR',
    gymCapacity: { percentFull: 44, status: 'Optimal' },
    gymName: 'Iron Fortress Barbell Club',
    gymBranch: 'Downtown Flagship'
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ minHeight: '100%' }}>
      <Header
        title="Gym Admin Portal"
        subtitle={`${stats.gymName || 'Iron Fortress Barbell Club'} • ${stats.gymBranch || 'Downtown Flagship'}`}
        rightAction={
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '11px', padding: '5px 10px', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          >
            <Eye size={12} /> Member View
          </button>
        }
      />

      <div className="page-container" style={{ padding: '16px 20px 40px' }}>

        {/* Top Gym Center Info Banner with Linked Gym Switcher */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
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
              <ShieldCheck size={26} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{stats.gymName}</h3>
                <span className="badge badge-fitness" style={{ fontSize: '10px' }}>ADMIN CONSOLE</span>
                <button
                  type="button"
                  onClick={handleOpenCustomizeGym}
                  className="btn btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '3px 9px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    gap: '4px'
                  }}
                  title="Customize Gym Name & Details"
                >
                  <Edit3 size={11} />
                  <span>Customize Name</span>
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Linked Branch: <b>{stats.gymBranch || stats.gymAddress}</b> &bull; Administrator: <b>{user?.name || 'Gym Admin'}</b>
              </p>

            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Linked Gym Branch Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Switch Gym:</span>
              <select
                className="form-input"
                value={dashboardData?.linkedGym?.id || 'gym_1'}
                onChange={(e) => handleSwitchGym(e.target.value)}
                style={{ fontSize: '11px', height: '32px', padding: '0 8px', width: 'auto', background: 'var(--bg-surface)' }}
              >
                {(dashboardData?.allGyms || [
                  { id: 'gym_1', name: 'Iron Fortress Barbell Club (Downtown)' },
                  { id: 'gym_2', name: 'MetroFlex Hardcore Gym (South Extension)' },
                  { id: 'gym_3', name: 'Pulse Performance Studio (Connaught Place)' },
                  { id: 'gym_4', name: 'Cult Fitness & Cross Training (Cyber Hub)' },
                  { id: 'gym_5', name: 'Olympus Strength & Spa Club (Aerocity)' }
                ]).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCustomizeGym}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              title="Customize Gym Profile & Name"
            >
              <Edit3 size={12} /> Edit Gym Details
            </button>

            <button
              onClick={fetchDashboard}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              title="Refresh Gym Metrics"
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '11px', padding: '6px 14px' }}
            >
              <Plus size={13} /> Add Member
            </button>
          </div>
        </div>

        {/* 4 Admin KPI Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Card 1: Total Members */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Registered Members
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)' }}>
                <Users size={16} color="var(--primary)" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
              {stats.totalRegisteredMembers}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
              ● 242 Active • 4 Frozen • 2 Expired
            </span>
          </div>

          {/* Card 2: Today's Check-ins & Capacity */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Today Check-Ins
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)' }}>
                <UserCheck size={16} color="var(--cyan)" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--cyan)' }}>
              {stats.activeCheckInsToday}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Capacity: <b>{stats.gymCapacity?.percentFull || 44}%</b> ({stats.gymCapacity?.status || 'Optimal'})
            </span>
          </div>

          {/* Card 3: Day Passes Verified */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Day Passes Today
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)' }}>
                <QrCode size={16} color="var(--amber)" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--amber)' }}>
              {stats.dayPassesSoldToday}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              ₹4,186 instant pass revenue
            </span>
          </div>

          {/* Card 4: Monthly Gym Revenue */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Monthly Gym Revenue (INR)
              </span>
              <div style={{
                padding: '4px 8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc', fontWeight: 900, fontSize: '14px'
              }}>
                ₹
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#c084fc' }}>
              ₹{(stats.monthlyRevenueInr || 1245000).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
              ↑ 14% vs last month • 98% collected
            </span>
          </div>
        </div>

        {/* Front Desk 4-Digit Member PIN Check-in & Time Recording Terminal */}
        <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div className="flex-between" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
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
                <Clock size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc' }}>
                    Front Desk 4-Digit PIN Check-In Terminal
                  </h4>
                  <span className="badge" style={{ background: 'var(--primary)', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                    INDIVIDUAL 4-DIGIT PIN
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Record member arrival time with their unique 4-digit PIN
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick Demo PINs:</span>
              <button
                type="button"
                onClick={() => setCheckInInput('7829')}
                className="chip"
                style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                Alex: <b>7829</b>
              </button>
              <button
                type="button"
                onClick={() => setCheckInInput('8104')}
                className="chip"
                style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
              >
                Sarah: <b>8104</b>
              </button>
              <button
                type="button"
                onClick={() => setCheckInInput('6492')}
                className="chip"
                style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              >
                David: <b>6492</b>
              </button>
              <button
                type="button"
                onClick={() => setCheckInInput('5321')}
                className="chip"
                style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
              >
                Elena: <b>5321</b>
              </button>
            </div>
          </div>

          <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Input 1: 4-digit User PIN */}
            <div style={{ position: 'relative', flex: 2, minWidth: '180px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 4-Digit Member PIN (e.g. 7829)..."
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                style={{
                  height: '44px',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  paddingLeft: '38px',
                  borderColor: 'rgba(16, 185, 129, 0.4)'
                }}
              />
              <Key size={16} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>

            {/* Input 2: Custom Check-In Time */}
            <div style={{ position: 'relative', flex: 1, minWidth: '140px', display: 'flex', gap: '4px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Time (e.g. 08:30 AM)"
                value={customCheckInTime}
                onChange={(e) => setCustomCheckInTime(e.target.value)}
                style={{ height: '44px', fontSize: '12px', paddingLeft: '32px' }}
              />
              <Clock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '15px' }} />
              <button
                type="button"
                onClick={() => setCustomCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                className="btn btn-sm btn-secondary"
                style={{ height: '44px', padding: '0 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                title="Use Current Local Time"
              >
                Live Time
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                height: '44px',
                padding: '0 22px',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                color: '#0b0f19',
                border: 'none',
                gap: '6px'
              }}
              disabled={checkInLoading || !checkInInput.trim()}
            >
              {checkInLoading ? (
                <>
                  <RefreshCw size={14} className="spin" /> Recording...
                </>
              ) : (
                <>
                  <Check size={16} /> Record Check-In
                </>
              )}
            </button>
          </form>

          {recentVerification && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                  <BadgeCheck size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Verified: <b>{recentVerification.memberName}</b> (PIN #{recentVerification.checkInPin || recentVerification.membershipId})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  Floor Access Logged at <b>{recentVerification.time}</b> &bull; Status: {recentVerification.status}
                </span>
              </div>

              <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                ● CHECK-IN RECORDED
              </span>
            </div>
          )}
        </div>

        {/* GYM REDEMPTION & ADMIN-USER COLLABORATION VERIFICATION DESK */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            boxShadow: '0 8px 24px rgba(234, 179, 8, 0.12)'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={18} color="#eab308" />
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a' }}>
                Gym Member Redemption & Collaboration Desk
              </h4>
              <span className="badge" style={{ background: '#eab308', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                SYNC PIN: 778899
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Verify member paid redemption pass (e.g. <code style={{ color: '#fef08a' }}>FH-COLAB-7829</code> or <code style={{ color: 'var(--cyan)' }}>FH-MEM-7829</code>)
            </span>
          </div>

          <form onSubmit={handleVerifyRedemptionCode} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Member Collaboration Code (e.g. FH-COLAB-7829 or FH-MEM-7829)..."
                value={redemptionCodeInput}
                onChange={(e) => setRedemptionCodeInput(e.target.value)}
                style={{
                  height: '42px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  paddingLeft: '36px',
                  borderColor: 'rgba(234, 179, 8, 0.4)'
                }}
              />
              <Key size={16} color="#eab308" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                height: '42px',
                padding: '0 20px',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #eab308, #10b981)',
                color: '#0b0f19',
                border: 'none'
              }}
              disabled={verifyingRedemption || !redemptionCodeInput.trim()}
            >
              {verifyingRedemption ? (
                <>
                  <RefreshCw size={14} className="spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Verify & Collaborate
                </>
              )}
            </button>
          </form>

          {recentColabVerification && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                  <BadgeCheck size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Collaborated with {recentColabVerification.member?.name} ({recentColabVerification.member?.membershipId})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  Plan: <b>{recentColabVerification.payment?.planName}</b> &bull; Paid Amount: <b>₹{Number(recentColabVerification.payment?.amountPaid || 11999).toLocaleString('en-IN')}</b>
                </span>
              </div>

              <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                ● ACCESS SYNCHRONIZED
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs: Member Directory | Fees Structure | Check-In Log | Maintenance (Group: Equipment + Directory) | Admin Notes */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setActiveSubTab('members')}
            className={`btn btn-sm ${activeSubTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '7px 16px' }}
          >
            <Users size={14} /> Member Roster ({filteredMembers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('fees')}
            className={`btn btn-sm ${activeSubTab === 'fees' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '7px 16px', position: 'relative' }}
          >
            <Banknote size={14} /> Gym Fees Structure & Desk Payments
            {(dashboardData?.cashTokens?.filter(t => t.status?.includes('Pending'))?.length || 0) > 0 && (
              <span style={{
                marginLeft: '6px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: 'var(--amber)',
                color: '#0b0f19',
                fontSize: '10px',
                fontWeight: 900
              }}>
                {dashboardData?.cashTokens?.filter(t => t.status?.includes('Pending'))?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('checkins')}
            className={`btn btn-sm ${activeSubTab === 'checkins' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '7px 16px' }}
          >
            <Clock size={14} /> Today's Check-In Log ({checkIns.length})
          </button>

          {/* Maintenance Nav Group (Equipment Maintenance + Directory) */}
          <div style={{ display: 'inline-flex', position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              borderRadius: '8px',
              border: (activeSubTab === 'equipment' || activeSubTab === 'directory') ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: (activeSubTab === 'equipment' || activeSubTab === 'directory') ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
              overflow: 'hidden',
              padding: '2px'
            }}>
              <button
                type="button"
                onClick={() => setActiveSubTab('equipment')}
                className={`btn btn-sm ${activeSubTab === 'equipment' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: activeSubTab === 'equipment' ? 800 : 600
                }}
                title="Manage Gym Machine Fleet & Maintenance Logs"
              >
                <Wrench size={13} />
                <span>Equipment Maintenance ({equipmentList.length || equipment.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className={`btn btn-sm ${activeSubTab === 'directory' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: activeSubTab === 'directory' ? 800 : 600,
                  position: 'relative'
                }}
                title="Technicians, AMC Contractors & Emergency Directory"
              >
                <BookOpen size={13} />
                <span>Directory ({directoryList.length})</span>
                {directoryList.some(d => d.isContractExpiringSoon || d.isOverdue) && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--amber)',
                    marginLeft: '4px',
                    display: 'inline-block'
                  }} />
                )}
              </button>
            </div>
          </div>

          {/* Top-Level Admin Notes Nav Item */}
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`btn btn-sm ${activeSubTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '12px',
              padding: '7px 16px',
              background: activeSubTab === 'notes' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
              color: activeSubTab === 'notes' ? '#0b0f19' : undefined,
              fontWeight: activeSubTab === 'notes' ? 800 : undefined,
              position: 'relative'
            }}
          >
            <Lock size={14} /> Admin Notes ({adminNotes.length})
            {adminNotes.filter(n => n.isReminderDue || n.isReminderOverdue).length > 0 && (
              <span style={{
                marginLeft: '6px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 900
              }}>
                {adminNotes.filter(n => n.isReminderDue || n.isReminderOverdue).length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: MEMBER DIRECTORY */}
        {activeSubTab === 'members' && (
          <div>
            {/* Dedicated Admin Member Verification Code Section */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
              border: '1.5px solid rgba(34, 197, 94, 0.35)',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                    color: '#0b0f19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Verify & Add Member via Code
                      </h3>
                      <span className="badge badge-success" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                        CODE PASS
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Enter the member's verification code (e.g. <code>FH-VER-8924</code>) to enroll them into active gym records.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={fetchPendingApplicants}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', gap: '4px' }}
                  >
                    <RefreshCw size={12} className={loadingPendingApplicants ? 'spin' : ''} />
                    Refresh Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '11px', gap: '4px' }}
                  >
                    <Plus size={12} /> Direct Add
                  </button>
                </div>
              </div>

              {/* Code Verification Input Row */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Verification Code (e.g. FH-VER-8924)"
                    value={memberVerificationCode}
                    onChange={(e) => setMemberVerificationCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyMemberCode();
                      }
                    }}
                    style={{
                      height: '42px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      paddingLeft: '36px',
                      borderColor: 'rgba(34, 197, 94, 0.4)'
                    }}
                  />
                  <Key size={16} color="#22c55e" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>

                <button
                  type="button"
                  disabled={verifyingMemberCode || !memberVerificationCode.trim()}
                  onClick={() => handleVerifyMemberCode()}
                  className="btn btn-primary"
                  style={{
                    height: '42px',
                    padding: '0 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    gap: '8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {verifyingMemberCode ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify & Enroll Member
                    </>
                  )}
                </button>
              </div>

              {/* Success Result Box */}
              {verificationResult && verificationResult.member && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Member {verificationResult.member.name} Enrolled Successfully!
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Member ID: <strong>{verificationResult.member.membershipId}</strong> • Plan: {verificationResult.member.plan} • Receipt: {verificationResult.member.receiptNumber}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationResult(null)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Pending Applicants Queue */}
              {pendingApplicants && pendingApplicants.filter(p => p.status === 'Pending Admin Verification').length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(34, 197, 94, 0.2)', paddingTop: '12px' }}>
                  <div
                    onClick={() => setShowPendingQueue(!showPendingQueue)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#eab308" />
                      Pending Verification Applications (
                      {pendingApplicants.filter(p => p.status === 'Pending Admin Verification').length})
                    </div>
                    {showPendingQueue ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {showPendingQueue && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {pendingApplicants
                        .filter(p => p.status === 'Pending Admin Verification')
                        .map(app => (
                          <div
                            key={app.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13px' }}>{app.name}</strong>
                                <span style={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: '#22c55e',
                                  background: 'rgba(34, 197, 94, 0.1)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {app.verificationCode}
                                </span>
                                {app.isCustomGym && (
                                  <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                    CUSTOM GYM TAG
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {app.email} • {app.plan} • <strong>{app.gymName}</strong>
                                {app.gymLocation && (
                                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                                    ({app.gymLocation})
                                  </span>
                                )}
                                {' • '}{new Date(app.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={verifyingMemberCode}
                              onClick={() => handleVerifyMemberCode(app.verificationCode)}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '11px', padding: '5px 12px', gap: '4px' }}
                            >
                              <ShieldCheck size={12} />
                              Verify & Enroll
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search & Filter Controls */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search members by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '38px', fontSize: '12px', paddingLeft: '32px' }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'active', 'frozen', 'expired'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="chip"
                    style={{
                      textTransform: 'capitalize',
                      fontSize: '11px',
                      background: statusFilter === status ? 'var(--primary)' : 'var(--bg-surface)',
                      color: statusFilter === status ? '#0b0f19' : 'var(--text-secondary)',
                      borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border-color)',
                      fontWeight: 700
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Roster List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: member.status === 'Active'
                        ? 'linear-gradient(135deg, var(--primary), var(--cyan))'
                        : member.status === 'Frozen'
                          ? 'linear-gradient(135deg, var(--amber), #d97706)'
                          : 'linear-gradient(135deg, var(--rose), #be123c)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#0b0f19',
                      fontSize: '14px'
                    }}>
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{member.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                          [{member.membershipId}]
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: 'var(--primary)',
                          letterSpacing: '1px'
                        }}>
                          PIN #{member.checkInPin || member.membershipId?.replace(/\D/g, '')?.slice(-4) || '7829'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {member.email} • {member.phone || 'No phone'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Plan: <b>{member.plan}</b> • Coach: <b>{member.assignedTrainer}</b>
                      </p>
                    </div>
                  </div>

                  {/* Attendance & Status Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Monthly Check-ins</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                        {member.checkInsThisMonth || 0} visits
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>
                        Last: {member.lastCheckIn}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '95px' }}>
                      <span
                        className="badge"
                        style={{
                          textAlign: 'center',
                          fontSize: '10px',
                          background: member.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : member.status === 'Frozen' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: member.status === 'Active' ? 'var(--primary)' : member.status === 'Frozen' ? 'var(--amber)' : 'var(--rose)',
                          borderColor: member.status === 'Active' ? 'rgba(16, 185, 129, 0.4)' : member.status === 'Frozen' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                        }}
                      >
                        {member.status}
                      </span>

                      {/* Status toggle button */}
                      <select
                        value={member.status}
                        onChange={(e) => handleUpdateStatus(member.id, e.target.value)}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Frozen">Freeze</option>
                        <option value="Expired">Expire</option>
                      </select>
                    </div>

                    {/* Quick PIN Check-In & Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleDirectCheckIn(member)}
                        className="btn btn-sm btn-primary"
                        style={{
                          fontSize: '11px',
                          height: '30px',
                          padding: '0 10px',
                          background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                          color: '#0b0f19',
                          fontWeight: 800,
                          border: 'none',
                          gap: '4px'
                        }}
                        title={`Check In ${member.name} (${member.membershipId})`}
                      >
                        <Clock size={11} />
                        <span>Check-In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditMember(member)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '11px', height: '30px', padding: '0 8px', gap: '4px' }}
                        title="Edit Member Details"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteConfirm(member)}
                        className="icon-btn"
                        style={{ width: '30px', height: '30px', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        title="Delete Member from Gym List"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GYM FEES STRUCTURE & DESK CASH PAYMENTS */}
        {activeSubTab === 'fees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. FRONT DESK CASH VERIFICATION QUEUE */}
            <div className="card" style={{ padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--amber)'
                  }}>
                    <Banknote size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Front Desk Cash Payment Vouchers</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Members who opted to pay cash at the desk. Verify cash receipt and activate their membership.
                    </p>
                  </div>
                </div>

                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', fontSize: '11px' }}>
                  {(dashboardData?.cashTokens?.filter(t => t.status?.includes('Pending'))?.length || 0)} Pending Verification
                </span>
              </div>

              {/* Tokens List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(dashboardData?.cashTokens || [
                  {
                    id: 'cash_1',
                    tokenCode: 'CASH-PASS-8392',
                    memberName: 'Alex Morgan',
                    memberEmail: 'alex@fithealth.io',
                    planName: 'Monthly Pro Access',
                    amount: 1499,
                    currency: 'INR',
                    status: 'Pending Front Desk Payment',
                    createdAt: '2026-10-07T14:10:00Z'
                  }
                ]).map((token) => {
                  const isPending = token.status?.includes('Pending');
                  return (
                    <div
                      key={token.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface)',
                        border: isPending ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          border: `1px dashed ${isPending ? 'var(--amber)' : 'var(--primary)'}`
                        }}>
                          <code style={{ fontSize: '13px', fontWeight: 900, color: isPending ? '#fbbf24' : 'var(--primary)' }}>
                            {token.tokenCode}
                          </code>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800 }}>{token.memberName}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({token.memberEmail || 'Member'})</span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Plan: <b style={{ color: 'var(--text-primary)' }}>{token.planName}</b> &bull; Created: {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Cash to Collect</span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
                            ₹{token.amount?.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmCashToken(token.id)}
                            disabled={confirmingToken === token.id}
                            className="btn btn-primary"
                            style={{ height: '36px', padding: '0 16px', fontSize: '12px', fontWeight: 800, background: 'linear-gradient(135deg, var(--amber), #d97706)', color: '#0b0f19' }}
                          >
                            <CheckCircle2 size={14} />
                            <span>{confirmingToken === token.id ? 'Collecting...' : 'Collect Cash & Activate'}</span>
                          </button>
                        ) : (
                          <span className="badge badge-fitness" style={{ fontSize: '11px', padding: '6px 12px' }}>
                            <Check size={12} /> {token.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. GYM FEE STRUCTURE MANAGEMENT & PUBLISH CONTROLS (INR) */}
            <div className="card" style={{ padding: '22px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(11, 15, 25, 1) 100%)' }}>
              <div className="flex-between" style={{ marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-primary)' }}>
                      Gym Fees Structure & Rate Plans (₹ INR)
                    </h4>
                    <span className={`badge ${gymTerms?.is_published !== false ? 'badge-fitness' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                      {gymTerms?.is_published !== false ? '● PUBLISHED LIVE' : '○ DRAFT / HIDDEN'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 800 }}>
                      Version {gymTerms?.version || 'v2.4'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Manage membership subscription plans, reorder tiers, edit admission fees & taxes. Changes go live to members instantly.
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Last Published: <b>{new Date(gymTerms?.last_published_at || Date.now()).toLocaleString('en-IN')}</b>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleOpenAddFeePlanModal}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '12px', padding: '6px 14px', gap: '5px' }}
                  >
                    <Plus size={14} /> Create Fee Plan
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublishFeeSchedule(gymTerms?.is_published === false ? true : !gymTerms?.is_published)}
                    disabled={publishingFees}
                    className={`btn btn-sm ${gymTerms?.is_published !== false ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ fontSize: '12px', padding: '6px 14px', gap: '5px' }}
                  >
                    <RefreshCw size={13} className={publishingFees ? 'spin' : ''} />
                    <span>{publishingFees ? 'Publishing...' : (gymTerms?.is_published !== false ? 'Unpublish Schedule' : 'Publish Live (Go Live)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVersionHistoryModal(true)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px', gap: '5px' }}
                    title="View Version History"
                  >
                    <Clock size={13} /> Version Log ({gymTerms?.version_history?.length || 1})
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPdfRateCard}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px', gap: '5px' }}
                    title="Download / Print Branded Rate Card"
                  >
                    <Download size={13} /> Rate Card (PDF)
                  </button>
                </div>
              </div>

              {/* Fee Plans Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {feePlans.map((plan, idx) => {
                  const isActive = plan.is_active !== false;
                  const price = Number(plan.price) || 0;
                  const admissionFee = Number(plan.admission_fee) || 0;
                  const taxPercent = plan.tax_percent !== undefined ? plan.tax_percent : 18;

                  return (
                    <div
                      key={plan.id || idx}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: '14px',
                        border: plan.is_popular ? '2px solid rgba(16, 185, 129, 0.6)' : (isActive ? '1px solid var(--border-color)' : '1px dashed rgba(244, 63, 94, 0.4)'),
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        position: 'relative',
                        opacity: isActive ? 1 : 0.75
                      }}
                    >
                      {/* Top Bar: Sort Order, Active Status, Action Buttons */}
                      <div className="flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', fontSize: '11px', fontWeight: 800 }}>
                            #{idx + 1} &bull; {plan.billingDuration || `${plan.duration_days || 30} Days`}
                          </span>
                          <span className={`badge ${isActive ? 'badge-fitness' : 'badge-rose'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                            {isActive ? 'ACTIVE' : 'HIDDEN'}
                          </span>
                          {plan.badge && (
                            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', borderRadius: '4px', fontWeight: 800 }}>
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        {/* Reorder Buttons (Move Up/Down) & Edit/Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMovePlanUp(idx)}
                            disabled={idx === 0}
                            className="icon-btn"
                            style={{ width: '26px', height: '26px', opacity: idx === 0 ? 0.3 : 1 }}
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePlanDown(idx)}
                            disabled={idx === feePlans.length - 1}
                            className="icon-btn"
                            style={{ width: '26px', height: '26px', opacity: idx === feePlans.length - 1 ? 0.3 : 1 }}
                            title="Move Down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFeePlanModal(plan)}
                            className="icon-btn"
                            style={{ width: '26px', height: '26px', color: 'var(--cyan)' }}
                            title="Edit Plan"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeePlan(plan.id, plan.name)}
                            className="icon-btn"
                            style={{ width: '26px', height: '26px', color: 'var(--rose)' }}
                            title="Delete Plan"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Plan Title & Price */}
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {plan.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            / {plan.billingDuration || 'cycle'}
                          </span>
                        </div>
                      </div>

                      {/* Details Strip */}
                      <div style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(11, 15, 25, 0.6)',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <div>
                          Admission: <b>{admissionFee > 0 ? `₹${admissionFee.toLocaleString('en-IN')}` : 'Nil'}</b> &bull; GST: <b>{taxPercent}%</b>
                        </div>
                        {plan.discount && (
                          <div style={{ color: '#34d399', fontWeight: 700 }}>
                            Offer: {plan.discount}
                          </div>
                        )}
                      </div>

                      {/* Features Included */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          Included Amenities:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(Array.isArray(plan.features) ? plan.features : (plan.features ? String(plan.features).split(',') : ['Full Access'])).map((f, fIdx) => (
                            <span
                              key={fIdx}
                              style={{
                                fontSize: '10px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              ✓ {typeof f === 'string' ? f.trim() : f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePlanActive(plan)}
                          className="btn btn-sm btn-secondary"
                          style={{ flex: 1, fontSize: '11px', padding: '5px 0' }}
                        >
                          {isActive ? 'Hide from Users' : 'Activate Plan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditFeePlanModal(plan)}
                          className="btn btn-sm btn-primary"
                          style={{ flex: 1, fontSize: '11px', padding: '5px 0' }}
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. EDITABLE TERMS & CONDITIONS BOX */}
              <form onSubmit={handleSaveGymTerms} style={{
                padding: '18px',
                borderRadius: '12px',
                background: 'rgba(11, 15, 25, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginTop: '16px'
              }}>
                <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="var(--primary)" />
                    <h5 style={{ fontSize: '14px', fontWeight: 800 }}>Editable Terms & Conditions (Per Gym Policies)</h5>
                  </div>
                  <button
                    type="submit"
                    disabled={savingTerms}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '11px', padding: '6px 16px', fontWeight: 800 }}
                  >
                    <Save size={12} /> {savingTerms ? 'Saving Policies...' : 'Save Policies Live'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Refund Policy</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={gymTerms.refund_policy}
                      onChange={(e) => setGymTerms(prev => ({ ...prev, refund_policy: e.target.value }))}
                      placeholder="Enter refund and cancellation terms..."
                      style={{ fontSize: '11px', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Membership Freeze Policy</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={gymTerms.freeze_policy}
                      onChange={(e) => setGymTerms(prev => ({ ...prev, freeze_policy: e.target.value }))}
                      placeholder="Enter freeze allowance guidelines..."
                      style={{ fontSize: '11px', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Late Fee & Grace Period</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={gymTerms.late_fee_policy}
                      onChange={(e) => setGymTerms(prev => ({ ...prev, late_fee_policy: e.target.value }))}
                      placeholder="Enter late fee policy..."
                      style={{ fontSize: '11px', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Gym Floor Rules & Hygiene</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={gymTerms.rules}
                      onChange={(e) => setGymTerms(prev => ({ ...prev, rules: e.target.value }))}
                      placeholder="Enter general rules..."
                      style={{ fontSize: '11px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </form>
            </div>


            {/* 3. DIGITAL COPY OF FEE STRUCTURE & RATE CARD POSTER (ADMIN ONLY) */}
            <div className="card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Digital Copy of Fee Structure & Rate Card</h4>
                      <span className="badge badge-fitness" style={{ fontSize: '10px' }}>ADMIN ASSET ONLY</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      High-resolution digital rate card poster for {stats.gymName}. Use for front desk printing, member notice board, or digital sharing.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowFeeImageModal(true)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                    title="Open full-screen digital rate card"
                  >
                    <Maximize2 size={13} /> Inspect / Fullscreen
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintRateCard}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                    title="Print fee structure rate card"
                  >
                    <Printer size={13} /> Print Poster
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyRateCardSummary}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                    title="Copy text summary to clipboard"
                  >
                    <Share2 size={13} /> Copy Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFeeStructure}
                    disabled={savingFees}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '11px', padding: '6px 16px', fontWeight: 800, gap: '5px' }}
                  >
                    <Save size={13} /> {savingFees ? 'Saving...' : 'Save Digital Copy Asset'}
                  </button>
                </div>
              </div>

              {/* 2-Column Section: Digital Graphic Preview & Upload Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
                {/* Left: Digital Copy Rate Card Poster */}
                <div style={{
                  background: '#070b13',
                  borderRadius: '14px',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  padding: '20px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Watermark Logo & Ambient */}
                  <div style={{
                    position: 'absolute',
                    right: '-30px',
                    top: '-30px',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />

                  {feeStructureImage ? (
                    <div>
                      <div className="flex-between" style={{ marginBottom: '10px' }}>
                        <span className="badge badge-fitness" style={{ fontSize: '10px' }}>CUSTOM UPLOADED RATE CARD IMAGE</span>
                        <button
                          type="button"
                          onClick={() => setFeeStructureImage('')}
                          className="btn btn-sm"
                          style={{ fontSize: '10px', padding: '2px 8px', color: 'var(--rose)', background: 'rgba(244, 63, 94, 0.1)' }}
                        >
                          Reset to Vector Poster
                        </button>
                      </div>
                      <img
                        src={feeStructureImage}
                        alt="Digital Fee Structure"
                        style={{
                          width: '100%',
                          maxHeight: '380px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: '#0b0f19'
                        }}
                      />
                    </div>
                  ) : (
                    /* High-Res Dynamic Digital Poster Replica */
                    <div>
                      {/* Poster Header */}
                      <div style={{
                        borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
                        paddingBottom: '14px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                              ★ OFFICIAL MEMBERSHIP SCHEDULE ★
                            </span>
                          </div>
                          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
                            {stats.gymName || 'rsv gym and sports club'}
                          </h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {stats.gymBranch || stats.gymAddress || 'Flagship Center'} &bull; Tel: {dashboardData?.linkedGym?.phone || '+91 98765 43210'}
                          </span>
                        </div>

                        <div style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          textAlign: 'right'
                        }}>
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, display: 'block' }}>CURRENCY</span>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>INDIAN RUPEES (₹)</span>
                        </div>
                      </div>

                      {/* Fee Tier List Table in Poster */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                        {feePlans.map((plan, i) => (
                          <div
                            key={plan.id || i}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: i === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                              border: i === 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                                  {plan.name}
                                </span>
                                {plan.badge && (
                                  <span className="badge badge-fitness" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                    {plan.badge}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                Duration: <b>{plan.billingDuration}</b> &bull; {Array.isArray(plan.features) ? plan.features.slice(0, 2).join(' • ') : plan.features}
                              </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                                ₹{plan.price?.toLocaleString('en-IN')}
                              </span>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>
                                GST INCLUDED
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Poster Footer: Notes & QR Code */}
                      <div style={{
                        paddingTop: '10px',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ maxWidth: '75%' }}>
                          <span style={{ color: 'var(--cyan)', fontWeight: 700, display: 'block' }}>📌 Official Policy Note:</span>
                          <span style={{ fontSize: '10px' }}>{rateCardNote}</span>
                        </div>

                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          textAlign: 'center'
                        }}>
                          <QrCode size={24} color="var(--primary)" style={{ margin: '0 auto' }} />
                          <span style={{ fontSize: '8px', fontWeight: 700, display: 'block', marginTop: '2px' }}>DESK SCAN</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Asset Management & Uploader Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Upload Custom Digital Copy Box */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={16} color="var(--primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>Upload Fee Poster Image (File)</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Upload a photo of your printed gym notice board or custom designed flyer (PNG, JPG, max 5MB).
                    </p>

                    <label
                      className="btn btn-secondary"
                      style={{
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
                      <span>Choose Fee Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeeImageFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Or Attach Fee Image URL */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={16} color="var(--cyan)" />
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>Or Attach External Image URL</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/fee-rate-card.jpg"
                        value={feeImageUploadInput}
                        onChange={(e) => setFeeImageUploadInput(e.target.value)}
                        style={{ height: '36px', fontSize: '12px', flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyFeeImageUrl}
                        className="btn btn-secondary"
                        style={{ height: '36px', fontSize: '12px', padding: '0 12px' }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Rate Card Footer Policy & Notes */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                      Rate Card Policy & Inclusions Note
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={rateCardNote}
                      onChange={(e) => setRateCardNote(e.target.value)}
                      placeholder="e.g. All plans include locker facility & floor coach guidance. Rates inclusive of GST."
                      style={{ fontSize: '12px', resize: 'vertical' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      This note will appear at the bottom of the digital rate card copy.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* TAB 3: TODAY'S LIVE CHECK-IN & VISITOR LOG */}
        {activeSubTab === 'checkins' && (
          <div className="card" style={{ padding: '16px' }}>
            <h4 className="card-title" style={{ marginBottom: '14px' }}>
              <Clock size={16} color="var(--primary)" />
              <span>Today's Live Check-in & Visitor Attendance</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checkIns.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="flex-between"
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: log.type.includes('Day Pass') ? '3px solid var(--amber)' : '3px solid var(--primary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: log.type.includes('Day Pass') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: log.type.includes('Day Pass') ? 'var(--amber)' : 'var(--primary)'
                    }}>
                      {log.type.includes('Day Pass') ? <QrCode size={16} /> : <UserCheck size={16} />}
                    </div>

                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700 }}>{log.memberName}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ID: {log.membershipId} • Type: <b style={{ color: log.type.includes('Day Pass') ? 'var(--amber)' : 'var(--primary)' }}>{log.type}</b>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {log.time}
                    </span>
                    <span className="badge badge-fitness" style={{ fontSize: '9px', display: 'block', marginTop: '2px' }}>
                      {log.status || 'Verified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GYM MACHINES & EQUIPMENT MAINTENANCE */}
        {activeSubTab === 'equipment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Metrics Summary */}
            <div className="grid-4" style={{ gap: '12px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--primary)', background: 'rgba(16, 185, 129, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>TOTAL GYM MACHINES</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {(equipmentList.length || equipment.length)} Units
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tracked in Active Floor Roster</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--cyan)', background: 'rgba(6, 182, 212, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>OPERATIONAL & CERTIFIED</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', marginTop: '2px' }}>
                  {(equipmentList.length ? equipmentList : equipment).filter(e => e.condition === 'Operational' || e.condition === 'Excellent' || e.condition === 'Optimal' || e.condition === 'Good' || e.condition?.includes('Good')).length} Active
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Ready for athlete usage</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--amber)', background: 'rgba(245, 158, 11, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>SERVICE SCHEDULED</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--amber)', marginTop: '2px' }}>
                  {(equipmentList.length ? equipmentList : equipment).filter(e => e.condition === 'Needs Maintenance' || e.status?.includes('Scheduled')).length} Units
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Technician dispatched</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--rose)', background: 'rgba(244, 63, 94, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>UNDER REPAIR</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--rose)', marginTop: '2px' }}>
                  {(equipmentList.length ? equipmentList : equipment).filter(e => e.condition === 'Under Repair' || e.condition === 'Out of Service' || e.status === 'Under Repair').length} Units
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Isolated for safety</span>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={18} color="var(--primary)" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Gym Machines & Equipment Fleet</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Preventative maintenance logs, cable inspections & technician schedules
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddEquipmentModal(true)}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '12px', padding: '7px 14px', gap: '6px' }}
                  >
                    <Plus size={14} />
                    <span>Add New Machine</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchEquipmentOnly}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '7px 12px' }}
                    title="Refresh Equipment List"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Search & Zone Filter */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search machines by name, zone, brand, or serial #..."
                    value={equipmentSearchQuery}
                    onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                    style={{ height: '36px', fontSize: '12px', paddingLeft: '32px' }}
                  />
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {['all', 'Zone A', 'Zone C', 'Zone D', 'Zone E', 'Zone F'].map(z => (
                    <button
                      key={z}
                      onClick={() => setEquipmentZoneFilter(z)}
                      className="chip"
                      style={{
                        fontSize: '11px',
                        background: equipmentZoneFilter === z ? 'var(--primary)' : 'var(--bg-surface)',
                        color: equipmentZoneFilter === z ? '#0b0f19' : 'var(--text-secondary)',
                        borderColor: equipmentZoneFilter === z ? 'var(--primary)' : 'var(--border-color)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {z === 'all' ? 'All Zones' : z}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment Grid Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {(equipmentList.length ? equipmentList : equipment)
                .filter(item => {
                  if (equipmentZoneFilter !== 'all' && !item.zone?.toLowerCase().includes(equipmentZoneFilter.toLowerCase())) return false;
                  if (equipmentStatusFilter !== 'all' && item.condition !== equipmentStatusFilter) return false;
                  if (equipmentSearchQuery) {
                    const q = equipmentSearchQuery.toLowerCase();
                    const matchName = item.name?.toLowerCase().includes(q);
                    const matchZone = item.zone?.toLowerCase().includes(q);
                    const matchBrand = item.brand?.toLowerCase().includes(q);
                    const matchSerial = item.serialNumber?.toLowerCase().includes(q);
                    const matchTag = item.qrAssetTag?.toLowerCase().includes(q);
                    if (!matchName && !matchZone && !matchBrand && !matchSerial && !matchTag) return false;
                  }
                  return true;
                })
                .map(item => {
                  const isHealthy = item.condition === 'Operational' || item.condition === 'Excellent' || item.condition === 'Optimal' || item.condition?.includes('Good');
                  const isWarning = item.condition === 'Needs Maintenance' || item.status?.includes('Scheduled');
                  const isDanger = item.condition === 'Under Repair' || item.condition === 'Out of Service';

                  return (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        borderLeft: `4px solid ${isHealthy ? 'var(--primary)' : isWarning ? 'var(--amber)' : 'var(--rose)'}`,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(11,15,25,0.95) 100%)'
                      }}
                    >
                      <div>
                        <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {item.name}
                            </h4>
                            <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                              {item.brand || 'Universal'} &bull; {item.zone}
                            </span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span
                              className="badge"
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                background: isHealthy ? 'rgba(16, 185, 129, 0.2)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                color: isHealthy ? 'var(--primary)' : isWarning ? 'var(--amber)' : 'var(--rose)',
                                borderColor: isHealthy ? 'rgba(16, 185, 129, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                              }}
                            >
                              ● {item.condition}
                            </span>
                          </div>
                        </div>

                        {/* Machine Details & Asset Tag */}
                        <div style={{
                          margin: '8px 0',
                          padding: '8px 10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px'
                        }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Serial / Model:</span>
                            <b style={{ color: 'var(--text-primary)' }}>{item.serialNumber || 'SN-7721'}</b>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Asset QR Tag:</span>
                            <code style={{ color: 'var(--cyan)', fontWeight: 800 }}>{item.qrAssetTag || 'EQ-AST-0101'}</code>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Last Inspection:</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.lastInspection || 'Oct 5, 2026'}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Next Due:</span>
                            <span style={{ color: isWarning ? 'var(--amber)' : 'var(--text-primary)', fontWeight: 700 }}>
                              {item.nextDue || 'Nov 5, 2026'}
                            </span>
                          </div>
                        </div>

                        {/* Technician Remarks */}
                        {item.technicianNotes && (
                          <p style={{
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            borderLeft: '2px solid rgba(255,255,255,0.1)',
                            margin: '4px 0 0'
                          }}>
                            💬 <b>Tech Note:</b> {item.technicianNotes}
                          </p>
                        )}

                        {/* Assigned Technician / Vendor from Directory */}
                        {(() => {
                          const assignedVendor = directoryList.find(d =>
                            (d.linkedEquipment && (d.linkedEquipment.includes(item.id) || d.linkedEquipment.includes(item.name))) ||
                            (item.brand && d.companyName && d.companyName.toLowerCase().includes(item.brand.toLowerCase().split(' ')[0]))
                          );
                          if (assignedVendor) {
                            return (
                              <div style={{
                                marginTop: '6px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '11px'
                              }}>
                                <div>
                                  <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>📇 Assigned Specialist:</span>{' '}
                                  <b style={{ color: '#f8fafc' }}>{assignedVendor.name}</b> ({assignedVendor.companyName})
                                </div>
                                <a
                                  href={`tel:${assignedVendor.phone}`}
                                  style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <Phone size={10} /> Call
                                </a>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Service History Logs */}
                        {item.serviceLogs && item.serviceLogs.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                              Recent Service History ({item.serviceLogs.length})
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                              &bull; {item.serviceLogs[0].date}: {item.serviceLogs[0].action} (<i>{item.serviceLogs[0].technician}</i>)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Machine Quick Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                        {/* Status Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status:</span>
                          <select
                            value={item.condition}
                            onChange={(e) => handleUpdateEquipmentStatus(item.id, e.target.value)}
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Operational">Operational</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Optimal">Optimal</option>
                            <option value="Needs Maintenance">Needs Maintenance</option>
                            <option value="Under Repair">Under Repair</option>
                            <option value="Out of Service">Out of Service</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenServiceLog(item)}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '11px', height: '28px', padding: '0 8px', gap: '4px' }}
                            title="Log Service Event / Technician Action"
                          >
                            <Wrench size={11} />
                            <span>Log Service</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEquipmentItem(item)}
                            className="icon-btn"
                            style={{ width: '28px', height: '28px', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                            title="Decommission & Remove Machine"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4.5: MAINTENANCE DIRECTORY (Technicians, AMC, Vendors, Emergency) */}
        {activeSubTab === 'directory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Directory Summary Statistics */}
            <div className="grid-4" style={{ gap: '12px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--primary)', background: 'rgba(16, 185, 129, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>TOTAL DIRECTORY CONTACTS</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {directoryList.length} Active
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Technicians, Vendors & Housekeeping</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--cyan)', background: 'rgba(6, 182, 212, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>AMC SERVICE CONTRACTS</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', marginTop: '2px' }}>
                  {directoryList.filter(e => e.category === 'AMC/Service Contract').length} Contracts
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Scheduled regular inspections</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--amber)', background: 'rgba(245, 158, 11, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>CONTRACT EXPIRING SOON</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--amber)', marginTop: '2px' }}>
                  {directoryList.filter(e => e.isContractExpiringSoon).length} Expiring
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Within 30 calendar days</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--rose)', background: 'rgba(244, 63, 94, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>SERVICE DUE OVERDUE</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--rose)', marginTop: '2px' }}>
                  {directoryList.filter(e => e.isOverdue).length} Overdue
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Inspection date passed</span>
              </div>
            </div>

            {/* Directory Action & Filter Bar */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="var(--primary)" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Maintenance & Facility Directory</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Searchable contacts for engineers, suppliers, emergency plumbers, and AMC contractors
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportDirectoryCsv}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '7px 12px', gap: '5px' }}
                    title="Export all contacts to CSV spreadsheet"
                  >
                    <FileSpreadsheet size={13} color="var(--cyan)" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddDirectory}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '12px', padding: '7px 14px', gap: '6px' }}
                  >
                    <Plus size={14} />
                    <span>Add New Contact / AMC</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchMaintenanceDirectoryOnly}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '12px', padding: '7px 12px' }}
                    title="Refresh Directory"
                  >
                    <RefreshCw size={13} className={directoryLoading ? 'spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Search, Category Filter, and Sort */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name, company, phone, or specialization..."
                    value={directorySearchQuery}
                    onChange={(e) => setDirectorySearchQuery(e.target.value)}
                    style={{ height: '36px', fontSize: '12px', paddingLeft: '32px' }}
                  />
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {['all', 'Technician', 'Vendor/Supplier', 'AMC/Service Contract', 'Emergency Contact', 'Cleaning/Housekeeping'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDirectoryCategoryFilter(cat)}
                      className="chip"
                      style={{
                        fontSize: '11px',
                        background: directoryCategoryFilter === cat ? 'var(--primary)' : 'var(--bg-surface)',
                        color: directoryCategoryFilter === cat ? '#0b0f19' : 'var(--text-secondary)',
                        borderColor: directoryCategoryFilter === cat ? 'var(--primary)' : 'var(--border-color)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat === 'all' ? 'All Contacts' : cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sort:</span>
                  <select
                    className="form-input"
                    value={directorySort}
                    onChange={(e) => setDirectorySort(e.target.value)}
                    style={{ height: '36px', fontSize: '11px', padding: '0 8px' }}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="nextServiceDue">Next Service Due</option>
                    <option value="contractEndDate">Contract Expiry</option>
                    <option value="rating">Rating (Highest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Directory Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '14px' }}>
              {directoryList
                .filter(item => {
                  if (directoryCategoryFilter !== 'all' && item.category !== directoryCategoryFilter) return false;
                  if (directorySearchQuery) {
                    const q = directorySearchQuery.toLowerCase();
                    const matchName = item.name?.toLowerCase().includes(q);
                    const matchComp = item.companyName?.toLowerCase().includes(q);
                    const matchPhone = item.phone?.toLowerCase().includes(q);
                    const matchSpec = item.specialization?.toLowerCase().includes(q);
                    const matchEmail = item.email?.toLowerCase().includes(q);
                    if (!matchName && !matchComp && !matchPhone && !matchSpec && !matchEmail) return false;
                  }
                  return true;
                })
                .sort((a, b) => {
                  if (directorySort === 'nextServiceDue') return new Date(a.nextServiceDue || '9999') - new Date(b.nextServiceDue || '9999');
                  if (directorySort === 'contractEndDate') return new Date(a.contractEndDate || '9999') - new Date(b.contractEndDate || '9999');
                  if (directorySort === 'rating') return (b.rating || 0) - (a.rating || 0);
                  return (a.name || '').localeCompare(b.name || '');
                })
                .map(item => {
                  const isAMC = item.category === 'AMC/Service Contract';
                  const isEmergency = item.category === 'Emergency Contact';
                  const isTech = item.category === 'Technician';

                  return (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        borderLeft: `4px solid ${item.isOverdue ? 'var(--rose)' : item.isContractExpiringSoon ? 'var(--amber)' : isEmergency ? 'var(--rose)' : isAMC ? 'var(--cyan)' : 'var(--primary)'}`,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(11,15,25,0.95) 100%)'
                      }}
                    >
                      <div>
                        {/* Header: Name, Company, Category & Alerts */}
                        <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {item.name}
                              </h4>
                              {item.rating && (
                                <span style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Star size={11} fill="#f59e0b" /> {item.rating}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 700, display: 'block' }}>
                              {item.companyName || 'Independent Contractor'}
                            </span>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            <span
                              className="badge"
                              style={{
                                fontSize: '10px',
                                background: isEmergency ? 'rgba(244, 63, 94, 0.2)' : isAMC ? 'rgba(6, 182, 212, 0.2)' : isTech ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                color: isEmergency ? 'var(--rose)' : isAMC ? 'var(--cyan)' : isTech ? 'var(--primary)' : 'var(--text-secondary)'
                              }}
                            >
                              {item.category}
                            </span>

                            {item.isContractExpiringSoon && (
                              <span style={{ fontSize: '9px', fontWeight: 900, background: '#f59e0b', color: '#0b0f19', padding: '1px 6px', borderRadius: '4px' }}>
                                ⚠️ CONTRACT EXPIRING SOON
                              </span>
                            )}

                            {item.isOverdue && (
                              <span style={{ fontSize: '9px', fontWeight: 900, background: '#ef4444', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                                🚨 SERVICE OVERDUE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specialization */}
                        {item.specialization && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>🔧 Specialization:</span>
                            <span>{item.specialization}</span>
                          </div>
                        )}

                        {/* Contact Channels (Click to Call / Click to Email) */}
                        <div style={{
                          padding: '8px 10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                            <a
                              href={`tel:${item.phone}`}
                              style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Phone size={12} /> {item.phone}
                            </a>
                          </div>

                          {item.alternatePhone && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Alt Phone:</span>
                              <a
                                href={`tel:${item.alternatePhone}`}
                                style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Phone size={11} /> {item.alternatePhone}
                              </a>
                            </div>
                          )}

                          {item.email && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                              <a
                                href={`mailto:${item.email}`}
                                style={{ color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Mail size={12} /> {item.email}
                              </a>
                            </div>
                          )}

                          {item.address && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', paddingTop: '2px', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                              📍 {item.address}
                            </div>
                          )}
                        </div>

                        {/* Contract Dates & Service Interval */}
                        {(item.contractEndDate || item.nextServiceDue || item.serviceFrequency) && (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 8px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '4px'
                          }}>
                            {item.serviceFrequency && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Frequency:</span> <b>{item.serviceFrequency}</b>
                              </div>
                            )}
                            {item.contractEndDate && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Contract Ends:</span>{' '}
                                <b style={{ color: item.isContractExpiringSoon ? 'var(--amber)' : 'inherit' }}>{item.contractEndDate}</b>
                              </div>
                            )}
                            {item.lastServiceDate && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Last Visit:</span> {item.lastServiceDate}
                              </div>
                            )}
                            {item.nextServiceDue && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Next Due:</span>{' '}
                                <b style={{ color: item.isOverdue ? 'var(--rose)' : 'inherit' }}>{item.nextServiceDue}</b>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Linked Equipment Tags */}
                        {item.linkedEquipment && item.linkedEquipment.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                              Linked Equipment ({item.linkedEquipment.length})
                            </span>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {item.linkedEquipment.slice(0, 3).map((eq, idx) => (
                                <span key={idx} style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan)', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                                  {eq}
                                </span>
                              ))}
                              {item.linkedEquipment.length > 3 && (
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                  +{item.linkedEquipment.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
                            "{item.notes}"
                          </p>
                        )}
                      </div>

                      {/* Card Action Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`tel:${item.phone}`}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '11px', height: '28px', padding: '0 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Phone size={11} /> Call Now
                          </a>
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '11px', height: '28px', padding: '0 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Mail size={11} /> Email
                            </a>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDirectory(item)}
                            className="icon-btn"
                            style={{ width: '28px', height: '28px' }}
                            title="Edit Contact / Terms"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteDirectoryConfirm(item)}
                            className="icon-btn"
                            style={{ width: '28px', height: '28px', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                            title="Remove from Directory"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {directoryList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <BookOpen size={32} color="var(--primary)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '13px' }}>No contacts found in Maintenance Directory. Add technicians and AMC contracts above.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONFIDENTIAL ADMIN NOTES & SENTENCES (ADMIN ONLY) */}
        {activeSubTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Reminder Alert Banner if overdue or due notes exist */}
            {adminNotes.some(n => n.isReminderOverdue || n.isReminderDue) && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="#ef4444" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fca5a5' }}>
                      Operational Reminders Pending
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                      You have {adminNotes.filter(n => n.isReminderOverdue || n.isReminderDue).length} note reminders scheduled or overdue.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotesCategoryFilter('Reminders')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  View Reminders
                </button>
              </div>
            )}

            {/* Admin-Only Security Warning Banner */}
            <div
              className="card"
              style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.1)'
              }}
            >
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fef08a'
                  }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#fef08a' }}>
                        CONFIDENTIAL ADMIN NOTES & OPERATIONS LOG
                      </h3>
                      <span className="badge" style={{ background: '#f59e0b', color: '#0b0f19', fontSize: '9px', fontWeight: 900 }}>
                        RESTRICTED • ADMIN ONLY
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Only administrators can view, write, and persist private sentences, reminders, and staff remarks.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {draftAutosavedAt && (
                    <span style={{ fontSize: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={11} /> {draftAutosavedAt.includes('Restored') ? draftAutosavedAt : `Draft saved @ ${draftAutosavedAt}`}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={fetchAdminNotesOnly}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', gap: '5px' }}
                  >
                    <RefreshCw size={12} className={loadingNotes ? 'spin' : ''} />
                    <span>Sync Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sentence Composer & Note Creator */}
            <div className="card" style={{ padding: '18px 20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={16} color="var(--primary)" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>
                    Write & Save Confidential Sentences
                  </h4>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Draft autosaved &bull; Author: <b>{user?.name || 'Coach Marcus Vance'}</b>
                </span>
              </div>

              <form onSubmit={handleCreateNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="grid-3" style={{ gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Note Title / Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Q4 Machine Cable Servicing & Tension Calibration"
                      value={newNoteForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewNoteForm(prev => {
                          const updated = { ...prev, title: val };
                          try {
                            localStorage.setItem('fit_health_admin_note_draft', JSON.stringify(updated));
                          } catch (_) { }
                          return updated;
                        });
                      }}
                      style={{ height: '38px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Category</label>
                    <select
                      className="form-input"
                      value={newNoteForm.category}
                      onChange={(e) => setNewNoteForm(prev => ({ ...prev, category: e.target.value }))}
                      style={{ height: '38px', fontSize: '12px' }}
                    >
                      <option value="General">General Operations</option>
                      <option value="Maintenance">Machine Maintenance</option>
                      <option value="Finance">Finance & Desk Payments</option>
                      <option value="Members">Member Remarks</option>
                      <option value="Reminders">Reminders & Tasks</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Color Label & Pin</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className="form-input"
                        value={newNoteForm.colorLabel}
                        onChange={(e) => setNewNoteForm(prev => ({ ...prev, colorLabel: e.target.value }))}
                        style={{ height: '38px', fontSize: '12px', flex: 1 }}
                      >
                        <option value="amber">Amber Gold</option>
                        <option value="emerald">Emerald Green</option>
                        <option value="cyan">Cyan Blue</option>
                        <option value="rose">Rose Red</option>
                        <option value="violet">Violet Purple</option>
                        <option value="slate">Slate Gray</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setNewNoteForm(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                        className={`btn btn-sm ${newNoteForm.isPinned ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ height: '38px', padding: '0 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                        title="Pin to top of notes feed"
                      >
                        <Pin size={13} fill={newNoteForm.isPinned ? '#0b0f19' : 'none'} />
                        <span>{newNoteForm.isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Linking & Privacy Row */}
                <div className="grid-3" style={{ gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Reminder Date & Time (Optional)</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={newNoteForm.reminderDate ? newNoteForm.reminderDate.substring(0, 16) : ''}
                      onChange={(e) => setNewNoteForm(prev => ({ ...prev, reminderDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                      style={{ height: '36px', fontSize: '11px' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Link to Directory Contact</label>
                    <select
                      className="form-input"
                      value={newNoteForm.linkedDirectoryId}
                      onChange={(e) => setNewNoteForm(prev => ({ ...prev, linkedDirectoryId: e.target.value }))}
                      style={{ height: '36px', fontSize: '11px' }}
                    >
                      <option value="">None (Standalone note)</option>
                      {directoryList.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.companyName || d.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Link to Gym Machine</label>
                    <select
                      className="form-input"
                      value={newNoteForm.linkedEquipmentId}
                      onChange={(e) => setNewNoteForm(prev => ({ ...prev, linkedEquipmentId: e.target.value }))}
                      style={{ height: '36px', fontSize: '11px' }}
                    >
                      <option value="">None (Facility-wide)</option>
                      {(equipmentList.length ? equipmentList : equipment).map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sentences Textarea */}
                <div>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                      Written Sentences & Operational Notes (Admin Only)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', color: newNoteForm.isPrivateToMe ? 'var(--amber)' : 'var(--text-muted)' }}>
                      <input
                        type="checkbox"
                        checked={newNoteForm.isPrivateToMe}
                        onChange={(e) => setNewNoteForm(prev => ({ ...prev, isPrivateToMe: e.target.checked }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>🔒 Private to Me (Only I can view this)</span>
                    </label>
                  </div>
                  <textarea
                    className="form-input"
                    placeholder="Write detailed sentences, staff instructions, machine maintenance memos, or confidential member remarks..."
                    rows={4}
                    value={newNoteForm.body}
                    onChange={(e) => handleNoteBodyChange(e.target.value)}
                    style={{ fontSize: '13px', lineHeight: 1.6, padding: '10px 14px' }}
                    required
                  />
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingNote || !newNoteForm.body.trim()}
                    style={{
                      height: '38px',
                      padding: '0 24px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                      color: '#0b0f19',
                      border: 'none',
                      gap: '6px'
                    }}
                  >
                    {savingNote ? (
                      <>
                        <RefreshCw size={13} className="spin" /> Saving Note...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Confidential Sentences
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Notes Feed & Filter Bar */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search saved sentence context by keywords..."
                    value={notesSearchQuery}
                    onChange={(e) => setNotesSearchQuery(e.target.value)}
                    style={{ height: '36px', fontSize: '12px', paddingLeft: '32px' }}
                  />
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {['all', 'General', 'Maintenance', 'Finance', 'Members', 'Reminders'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNotesCategoryFilter(cat)}
                      className="chip"
                      style={{
                        fontSize: '11px',
                        background: notesCategoryFilter === cat ? 'var(--primary)' : 'var(--bg-surface)',
                        color: notesCategoryFilter === cat ? '#0b0f19' : 'var(--text-secondary)',
                        borderColor: notesCategoryFilter === cat ? 'var(--primary)' : 'var(--border-color)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat === 'all' ? 'All Notes' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {adminNotes
                  .filter(note => {
                    if (notesCategoryFilter !== 'all' && note.category !== notesCategoryFilter) return false;
                    if (notesSearchQuery) {
                      const q = notesSearchQuery.toLowerCase();
                      const matchTitle = note.title?.toLowerCase().includes(q);
                      const matchBody = (note.body || note.content)?.toLowerCase().includes(q);
                      if (!matchTitle && !matchBody) return false;
                    }
                    return true;
                  })
                  .map(note => {
                    const isEditing = editingNoteId === note.id;
                    const colorHex = note.colorLabel === 'emerald' ? 'var(--primary)'
                      : note.colorLabel === 'cyan' ? 'var(--cyan)'
                        : note.colorLabel === 'rose' ? 'var(--rose)'
                          : note.colorLabel === 'violet' ? '#c084fc'
                            : note.colorLabel === 'slate' ? '#94a3b8'
                              : '#f59e0b';

                    const linkedVendor = directoryList.find(d => d.id === note.linkedDirectoryId);
                    const linkedMachine = (equipmentList.length ? equipmentList : equipment).find(e => e.id === note.linkedEquipmentId);

                    return (
                      <div
                        key={note.id}
                        className="card"
                        style={{
                          padding: '16px',
                          borderLeft: `4px solid ${colorHex}`,
                          background: note.isPinned
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : 'var(--bg-surface)'
                        }}
                      >
                        {/* Note Header */}
                        <div className="flex-between" style={{ marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {note.isPinned && (
                              <span style={{ fontSize: '10px', fontWeight: 900, background: '#f59e0b', color: '#0b0f19', padding: '2px 6px', borderRadius: '4px' }}>
                                ⭐ PINNED
                              </span>
                            )}
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {note.title || 'Confidential Admin Note'}
                            </h4>
                            <span className="badge" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)' }}>
                              {note.category}
                            </span>
                            {note.isPrivateToMe && (
                              <span className="badge" style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                🔒 Private to Me
                              </span>
                            )}
                            {note.reminderDate && (
                              <span className="badge" style={{
                                fontSize: '10px',
                                background: note.isReminderOverdue ? 'rgba(239, 68, 68, 0.2)' : note.isReminderDue ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                                color: note.isReminderOverdue ? 'var(--rose)' : note.isReminderDue ? 'var(--amber)' : 'var(--cyan)'
                              }}>
                                ⏰ {new Date(note.reminderDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today'}
                          </span>
                        </div>

                        {/* Note Body (or In-Line Edit Form) */}
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={editingNoteForm.title}
                              onChange={(e) => setEditingNoteForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Title..."
                              style={{ fontSize: '12px' }}
                            />
                            <textarea
                              className="form-input"
                              rows={3}
                              value={editingNoteForm.body}
                              onChange={(e) => setEditingNoteForm(prev => ({ ...prev, body: e.target.value }))}
                              style={{ fontSize: '12px', lineHeight: 1.5 }}
                            />
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '11px' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditNote(note.id)}
                                className="btn btn-sm btn-primary"
                                style={{ fontSize: '11px', gap: '4px' }}
                              >
                                <Save size={12} /> Save Updates
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            margin: '4px 0 10px',
                            whiteSpace: 'pre-wrap',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)'
                          }}>
                            {note.body || note.content}
                          </p>
                        )}

                        {/* Cross-entity Links (Directory or Machine) */}
                        {(linkedVendor || linkedMachine) && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {linkedVendor && (
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                                📇 Linked Contact: <b>{linkedVendor.name}</b> ({linkedVendor.phone})
                              </span>
                            )}
                            {linkedMachine && (
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                🛠️ Linked Machine: <b>{linkedMachine.name}</b>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Note Footer */}
                        <div className="flex-between" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ✍️ {note.createdBy?.name || note.author || 'Coach Marcus Vance'}
                          </span>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyNoteText(note)}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '10px', height: '26px', padding: '0 8px', gap: '3px' }}
                              title="Copy Sentence Text"
                            >
                              <Copy size={11} />
                              <span>Copy</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTogglePinNote(note)}
                              className="icon-btn"
                              style={{ width: '26px', height: '26px', color: note.isPinned ? '#f59e0b' : 'var(--text-muted)' }}
                              title={note.isPinned ? 'Unpin Note' : 'Pin to Top'}
                            >
                              <Pin size={11} fill={note.isPinned ? '#f59e0b' : 'none'} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartEditNote(note)}
                              className="icon-btn"
                              style={{ width: '26px', height: '26px' }}
                              title="Edit Note Sentences"
                            >
                              <Edit3 size={11} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteNoteConfirm(note)}
                              className="icon-btn"
                              style={{ width: '26px', height: '26px', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                              title="Delete Note"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {adminNotes.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-app)',
                    borderRadius: '16px',
                    border: '1.5px dashed var(--border-color)',
                    margin: '12px 0'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <BookOpen size={24} color="var(--amber)" />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Notes Section is Blank
                    </h4>
                    <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                      No confidential notes or sentences written yet. Use the note editor above to compose your first private entry.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 1. ADD MEMBER MODAL (LINKED TO FEE PLANS) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '16px' }}>
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
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Register & Roster New Member</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Auto-links fee plan, calculates expiry & generates desk receipt
                  </span>
                </div>
              </div>

              <button onClick={() => setShowAddModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Liam Sterling"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. liam@example.com"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Linked Fee Plan Selector */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Select Membership Fee Plan</span>
                  <span style={{ color: 'var(--primary)', fontSize: '11px' }}>Auto-fills fee & expiry</span>
                </label>
                <select
                  className="form-input"
                  value={newMemberForm.plan}
                  onChange={(e) => handleSelectPlanForNewMember(e.target.value)}
                  style={{ height: '38px', fontSize: '12px', fontWeight: 700 }}
                >
                  {feePlans.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} — ₹{Number(p.price).toLocaleString('en-IN')} ({p.billingDuration || `${p.duration_days} Days`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desk Payment & Fee Auto-Calculation Strip */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
              }}>
                <div>
                  <label className="form-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Amount Paid (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newMemberForm.amountPaid}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                    style={{ height: '32px', fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Balance Due (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newMemberForm.amountDue}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, amountDue: Number(e.target.value) }))}
                    style={{ height: '32px', fontSize: '12px', fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Payment Mode</label>
                  <select
                    className="form-input"
                    value={newMemberForm.paymentMode}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                    style={{ height: '32px', fontSize: '11px' }}
                  >
                    <option value="Desk UPI (GPay/PhonePe)">Desk UPI</option>
                    <option value="Front Desk Cash">Desk Cash</option>
                    <option value="Card (POS Terminal)">Card (POS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Assigned Strength Coach</label>
                <select
                  className="form-input"
                  value={newMemberForm.assignedTrainer}
                  onChange={(e) => setNewMemberForm(prev => ({ ...prev, assignedTrainer: e.target.value }))}
                >
                  <option value="Coach Marcus Vance">Coach Marcus Vance (Head Coach)</option>
                  <option value="Elena Rostova">Elena Rostova (Olympic Lifting)</option>
                  <option value="None">None (Open Gym Access)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Member Notes / Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Registered at front desk, morning batch"
                  value={newMemberForm.notes}
                  onChange={(e) => setNewMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ height: '42px', fontSize: '13px', fontWeight: 800, marginTop: '8px' }}
              >
                Register Member & Issue Receipt →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. CREATE / EDIT FEE PLAN MODAL */}
      {showFeePlanModal && (
        <div className="modal-overlay" onClick={() => setShowFeePlanModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
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
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                    {feePlanModalMode === 'create' ? 'Create New Fee Plan' : 'Edit Fee Plan Details'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Linked to: {stats.gymName}
                  </span>
                </div>
              </div>

              <button onClick={() => setShowFeePlanModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveFeePlanModal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Plan Name</label>
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
                  <label className="form-label">Price in ₹ (INR)</label>
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
                  <label className="form-label">Duration (Days)</label>
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
                  <label className="form-label">Admission / Registration Fee (₹)</label>
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
                  <label className="form-label">GST / Tax (%)</label>
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
                  <label className="form-label">Discount or Offer Tag (Optional)</label>
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
                  <label className="form-label">Badge (e.g. Most Popular)</label>
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
                <label className="form-label">Included Features (Comma Separated)</label>
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
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Plan Visibility Status</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                    {feePlanForm.is_active ? 'Visible to all members' : 'Hidden from member screen'}
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

              <button
                type="submit"
                disabled={savingFees}
                className="btn btn-primary btn-full"
                style={{ height: '42px', fontSize: '13px', fontWeight: 800, marginTop: '6px' }}
              >
                <Save size={14} />
                <span>{savingFees ? 'Saving Fee Plan...' : (feePlanModalMode === 'create' ? 'Create Fee Plan (₹ INR)' : 'Save Changes')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. VERSION HISTORY LOG MODAL */}
      {showVersionHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowVersionHistoryModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)'
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Rate Card Version History</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Published audit log & schedule revisions
                  </span>
                </div>
              </div>

              <button onClick={() => setShowVersionHistoryModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(gymTerms?.version_history || [
                {
                  version: 'v2.4',
                  timestamp: gymTerms.last_published_at || new Date().toISOString(),
                  updated_by: 'Gym Administrator',
                  note: 'Current live rate schedule with updated INR pricing.',
                  plan_count: feePlans.length
                }
              ]).map((vItem, vIdx) => (
                <div
                  key={vIdx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-fitness" style={{ fontSize: '11px', fontWeight: 900 }}>
                        {vItem.version}
                      </span>
                      {vIdx === 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800 }}>● CURRENT ACTIVE</span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(vItem.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 2px' }}>
                    {vItem.note || 'Rate card revision published.'}
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Author: <b>{vItem.updated_by || 'Admin'}</b> &bull; Plans Active: <b>{vItem.plan_count || feePlans.length}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. BRANDED DIGITAL RATE CARD SCHEDULE (PDF VIEWER) */}
      {showPdfRateCardModal && (
        <div className="modal-overlay" onClick={() => setShowPdfRateCardModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                    Branded Rate Schedule & Terms for {stats.gymName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={handlePrintRateCard} className="btn btn-sm btn-primary" style={{ fontSize: '11px', padding: '5px 12px', gap: '4px' }}>
                  <Printer size={12} /> Print / Save PDF
                </button>
                <button onClick={() => setShowPdfRateCardModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {loadingPdf ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Generating high-res schedule...</div>
            ) : (
              <div
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
                      {stats.gymName || 'rsv gym and sports club'}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
                      {stats.gymBranch || stats.gymAddress} &bull; Hours: {dashboardData?.linkedGym?.openingHours || '05:00 AM - 11:30 PM'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Director: Gym Administrator &bull; Currency: INR (₹)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', background: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                      OFFICIAL RATE SCHEDULE
                    </span>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      Version {gymTerms?.version || 'v2.4'} &bull; {new Date().toLocaleDateString('en-IN')}
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
                      {feePlans.map((p, pIdx) => (
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
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Refund:</b> {gymTerms.refund_policy || 'Non-refundable after 7 days.'}</p>
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Freeze:</b> {gymTerms.freeze_policy || 'Up to 30 days freeze on annual tiers.'}</p>
                  <p style={{ margin: '0 0 2px 0' }}>• <b>Late Fee:</b> {gymTerms.late_fee_policy || '5-day grace period on expiration.'}</p>
                </div>

                {/* Footer Signature */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span>Verified by Fit Health Gym Network</span>
                  <span>Authorized Administrator &bull; {stats.gymName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DIGITAL TAX INVOICE & RECEIPT MODAL */}
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
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Desk Payment Receipt</h3>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)' }}>
                    Receipt #{activeReceipt.receiptNumber}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handlePrintRateCard} className="btn btn-sm btn-primary" style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}>
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
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{activeReceipt.gymName || stats.gymName}</h4>
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
                  <b>{activeReceipt.memberName || 'Alex Mercer'}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>MEMBERSHIP ID</span>
                  <b>{activeReceipt.membershipId || 'FH-MEM-7829'}</b>
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
                Thank you for training with {stats.gymName}! Keep this digital receipt for records.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Gym Profile & Name Modal */}
      {showEditGymModal && (
        <div className="modal-overlay" onClick={() => setShowEditGymModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Customize Gym Profile & Name</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Updates live on all member dashboards immediately
                  </span>
                </div>
              </div>

              <button onClick={() => setShowEditGymModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomGym} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '78vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Official Gym Center Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Iron Fortress Barbell Club"
                  value={customGymForm.name}
                  onChange={(e) => setCustomGymForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ height: '40px', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div>
                <label className="form-label">Branch Location / Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 442 Fitness Boulevard, Downtown Metro"
                  value={customGymForm.address}
                  onChange={(e) => setCustomGymForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Operating Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 05:00 AM - 11:30 PM"
                    value={customGymForm.openingHours}
                    onChange={(e) => setCustomGymForm(prev => ({ ...prev, openingHours: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Reception Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98123 45678"
                    value={customGymForm.phone}
                    onChange={(e) => setCustomGymForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Official Gym Instructions & Floor Rules (Configured by Admin Only) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span>Official Member Instructions & Floor Rules</span>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>(Admin Controlled)</span>
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Enter guidelines, hygiene rules, towel policies, equipment safety instructions..."
                  value={customGymForm.instructions}
                  onChange={(e) => setCustomGymForm(prev => ({ ...prev, instructions: e.target.value }))}
                  style={{ fontSize: '12px', resize: 'vertical', lineHeight: 1.4 }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  These instructions are strictly read-only for members and displayed directly on their dashboard.
                </span>
              </div>

              {/* Gym Notice / Daily Announcement */}
              <div>
                <label className="form-label">Gym Notice / Daily Announcement</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Peak floor hours are 06:00 PM - 08:30 PM. Group classes start on the hour."
                  value={customGymForm.notice}
                  onChange={(e) => setCustomGymForm(prev => ({ ...prev, notice: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Tagline / Facility Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Strength & Olympic Lifting"
                    value={customGymForm.tagLine}
                    onChange={(e) => setCustomGymForm(prev => ({ ...prev, tagLine: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Day Pass Price (₹ INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="299"
                    value={customGymForm.dayPassPrice}
                    onChange={(e) => setCustomGymForm(prev => ({ ...prev, dayPassPrice: e.target.value }))}
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Live Preview on Member Dashboard
                </span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {customGymForm.name || 'Your Gym Name'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {customGymForm.address || 'Location Address'} &bull; Hours: <b>{customGymForm.openingHours || '05:00 AM - 11:30 PM'}</b>
                </div>
                {customGymForm.instructions && (
                  <div style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(11, 15, 25, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'pre-line'
                  }}>
                    <b style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>Official Instructions:</b>
                    {customGymForm.instructions}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={customizingGym}
                style={{ height: '42px', fontSize: '13px', fontWeight: 800, marginTop: '4px' }}
              >
                <Save size={14} />
                <span>{customizingGym ? 'Updating Live Gym...' : 'Save & Publish to All Members'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {showEditMemberModal && (
        <div className="modal-overlay" onClick={() => setShowEditMemberModal(false)}>
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
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Edit Member Details</h3>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
                    ID: {editMemberForm.id}
                  </span>
                </div>
              </div>

              <button onClick={() => setShowEditMemberModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editMemberForm.name}
                  onChange={(e) => setEditMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editMemberForm.email}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editMemberForm.phone}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Membership Plan</label>
                  <select
                    className="form-input"
                    value={editMemberForm.plan}
                    onChange={(e) => handleSelectPlanForEditMember(e.target.value)}
                  >
                    {feePlans.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} (₹{Number(p.price).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Membership Status</label>
                  <select
                    className="form-input"
                    value={editMemberForm.status}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Assigned Strength Coach</label>
                  <select
                    className="form-input"
                    value={editMemberForm.assignedTrainer}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, assignedTrainer: e.target.value }))}
                  >
                    <option value="Coach Marcus Vance">Coach Marcus Vance (Head Coach)</option>
                    <option value="Elena Rostova">Elena Rostova (Olympic Lifting)</option>
                    <option value="None">None (Open Gym Access)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editMemberForm.expiryDate}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Amount Paid & Due */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Amount Paid (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editMemberForm.amountPaid}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="form-label">Balance Due (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editMemberForm.amountDue}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, amountDue: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Member Notes / Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  value={editMemberForm.notes}
                  onChange={(e) => setEditMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditMemberModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '42px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEditMember}
                  style={{ flex: 2, height: '42px', fontSize: '13px', fontWeight: 800 }}
                >
                  <Save size={14} />
                  <span>{savingEditMember ? 'Saving...' : 'Save Member Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      {showDeleteConfirmModal && memberToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="sheet-handle" />

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid var(--rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--rose)'
            }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Remove Member from Gym?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Are you sure you want to remove <b>{memberToDelete.name}</b> (<code style={{ color: 'var(--cyan)' }}>{memberToDelete.membershipId}</code>) from the gym list?
            </p>

            <div style={{
              margin: '16px 0',
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <div>Plan: <b>{memberToDelete.plan}</b></div>
              <div>Email: <b>{memberToDelete.email}</b></div>
              <div>Status: <span className="badge" style={{ fontSize: '10px' }}>{memberToDelete.status}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '42px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                disabled={deletingMember}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '42px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--rose), #be123c)',
                  color: '#fff'
                }}
              >
                {deletingMember ? 'Removing...' : 'Yes, Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN DIGITAL FEE STRUCTURE & RATE CARD INSPECTOR MODAL */}
      {showFeeImageModal && (
        <div className="modal-overlay" onClick={() => setShowFeeImageModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="sheet-handle" />

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
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Digital Rate Card Copy (Admin Inspector)</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Official Fee Schedule &bull; {stats.gymName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrintRateCard}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeeImageModal(false)}
                  className="icon-btn"
                  style={{ width: '30px', height: '30px' }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Poster Inspector Body */}
            <div style={{
              background: '#070b13',
              borderRadius: '12px',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              padding: '22px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
              maxHeight: '75vh',
              overflowY: 'auto'
            }}>
              {feeStructureImage ? (
                <img
                  src={feeStructureImage}
                  alt="Official Fee Structure Rate Card"
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'contain' }}
                />
              ) : (
                <div>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(16, 185, 129, 0.3)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
                      FIT HEALTH ATHLETIC CENTER &bull; OFFICIAL FEE SCHEDULE
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                      {stats.gymName || 'rsv gym and sports club'}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {stats.gymBranch || stats.gymAddress} &bull; Reception: {dashboardData?.linkedGym?.phone || '+91 98765 43210'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {feePlans.map((plan, idx) => (
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
                            {plan.name} {plan.badge && <span className="badge badge-fitness" style={{ fontSize: '9px' }}>{plan.badge}</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Duration: <b>{plan.billingDuration}</b> &bull; {Array.isArray(plan.features) ? plan.features.join(' • ') : plan.features}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>
                            ₹{plan.price?.toLocaleString('en-IN')}
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
                      <b style={{ color: 'var(--cyan)' }}>Rate Card Policy:</b> {rateCardNote}
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
                onClick={handleCopyRateCardSummary}
                className="btn btn-secondary"
                style={{ flex: 1, height: '40px', fontSize: '12px', gap: '6px' }}
              >
                <Share2 size={13} /> Copy Details to Share
              </button>
              <button
                type="button"
                onClick={() => setShowFeeImageModal(false)}
                className="btn btn-primary"
                style={{ flex: 1, height: '40px', fontSize: '12px', fontWeight: 800 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ADD NEW GYM EQUIPMENT / MACHINE MODAL */}
      {showAddEquipmentModal && (
        <div className="modal-overlay" onClick={() => setShowAddEquipmentModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '16px' }}>
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
                  <Wrench size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Register Gym Machine / Equipment</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Add machine to fleet with QR asset tag & preventative maintenance interval
                  </span>
                </div>
              </div>

              <button onClick={() => setShowAddEquipmentModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddEquipmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Machine / Equipment Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ISO-Lateral Incline Chest Press"
                  value={newEquipmentForm.name}
                  onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Gym Floor Zone / Area</label>
                  <select
                    className="form-input"
                    value={newEquipmentForm.zone}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, zone: e.target.value }))}
                  >
                    <option value="Zone A • Free Weights (East Bay)">Zone A • Free Weights (East Bay)</option>
                    <option value="Zone A • Olympic Platforms">Zone A • Olympic Platforms</option>
                    <option value="Zone B • Selectorized Machine Bay">Zone B • Selectorized Machine Bay</option>
                    <option value="Zone C • Cable Station #4">Zone C • Cable Stations</option>
                    <option value="Zone D • Plate-Loaded Arena">Zone D • Plate-Loaded Arena</option>
                    <option value="Zone E • Cardio Loft">Zone E • Cardio Loft</option>
                    <option value="Zone F • Recovery Suite">Zone F • Recovery Suite</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Brand / Manufacturer</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hammer Strength / Eleiko / Matrix"
                    value={newEquipmentForm.brand}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Serial Number / Model ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HS-CP-9901"
                    value={newEquipmentForm.serialNumber}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Initial Condition Status</label>
                  <select
                    className="form-input"
                    value={newEquipmentForm.condition}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, condition: e.target.value, status: e.target.value === 'Under Repair' ? 'Under Repair' : 'Operational' }))}
                  >
                    <option value="Operational">Operational</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Last Inspection Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEquipmentForm.lastInspection}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, lastInspection: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Next Maintenance Due</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEquipmentForm.nextDue}
                    onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, nextDue: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Initial Technician Notes & Calibration</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. Assembled by Matrix tech, cables lubricated and torque calibrated to factory spec."
                  rows={2}
                  value={newEquipmentForm.technicianNotes}
                  onChange={(e) => setNewEquipmentForm(prev => ({ ...prev, technicianNotes: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={savingEquipment}
                style={{ height: '44px', fontWeight: 800, marginTop: '8px' }}
              >
                {savingEquipment ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Adding Machine...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Save & Register Machine
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. LOG MACHINE SERVICE EVENT / ACTION MODAL */}
      {showServiceLogModal && selectedEquipmentForService && (
        <div className="modal-overlay" onClick={() => setShowServiceLogModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--amber)'
                }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Log Maintenance Event</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedEquipmentForService.name} &bull; {selectedEquipmentForService.zone}
                  </span>
                </div>
              </div>

              <button onClick={() => setShowServiceLogModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleServiceLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Technician / Engineer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Sharma (Matrix Certified)"
                  value={serviceLogForm.technician}
                  onChange={(e) => setServiceLogForm(prev => ({ ...prev, technician: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Service Action Performed / Repairs Log</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. Replaced worn pulley cable, lubricated guide rods with silicone spray, calibrated safety locks."
                  rows={3}
                  value={serviceLogForm.action}
                  onChange={(e) => setServiceLogForm(prev => ({ ...prev, action: e.target.value }))}
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Updated Machine Condition</label>
                  <select
                    className="form-input"
                    value={serviceLogForm.newCondition}
                    onChange={(e) => setServiceLogForm(prev => ({ ...prev, newCondition: e.target.value }))}
                  >
                    <option value="Operational">Operational</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Next Inspection Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={serviceLogForm.nextDue}
                    onChange={(e) => setServiceLogForm(prev => ({ ...prev, nextDue: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={savingEquipment}
                style={{ height: '44px', fontWeight: 800, marginTop: '8px', background: 'linear-gradient(135deg, var(--amber), #d97706)', color: '#0b0f19', border: 'none' }}
              >
                {savingEquipment ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Recording Log...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Save Service Record & Update Machine
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 11. ADD / EDIT MAINTENANCE DIRECTORY CONTACT MODAL */}
      {showAddDirectoryModal && (
        <div className="modal-overlay" onClick={() => setShowAddDirectoryModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                    {editingDirectoryEntry ? 'Edit Facility Directory Contact' : 'Add Maintenance Contact / Vendor'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Maintain full contact cards for technicians, AMC contracts, vendors & emergency support
                  </span>
                </div>
              </div>

              <button onClick={() => setShowAddDirectoryModal(false)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveDirectorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Contact / Specialist Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Sharma"
                    value={directoryForm.name}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Category *</label>
                  <select
                    className="form-input"
                    value={directoryForm.category}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="Technician">Technician</option>
                    <option value="AMC / Service Provider">AMC / Service Provider</option>
                    <option value="Equipment Vendor">Equipment Vendor</option>
                    <option value="Emergency Contact">Emergency Contact</option>
                    <option value="Housekeeping / Facility">Housekeeping / Facility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Company / Service Agency</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apex Gym Tech Solutions Pvt Ltd"
                    value={directoryForm.companyName}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Specialization / Trade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Commercial Treadmills & AC Motors"
                    value={directoryForm.specialization}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, specialization: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Primary Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={directoryForm.phone}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Alternate / Emergency Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 00000"
                    value={directoryForm.alternatePhone}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, alternatePhone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="tech@apexfit.in"
                    value={directoryForm.email}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Rating / Reliability</label>
                  <select
                    className="form-input"
                    value={directoryForm.rating}
                    onChange={(e) => setDirectoryForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5.0 - Top Priority & Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ 4.0 - Highly Reliable</option>
                    <option value={3}>⭐⭐⭐ 3.0 - Standard Service</option>
                    <option value={2}>⭐⭐ 2.0 - Backup Contact</option>
                    <option value={1}>⭐ 1.0 - Use With Caution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Address / Office Workshop</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Plot 44, Industrial Area, Sector 18"
                  value={directoryForm.address}
                  onChange={(e) => setDirectoryForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              {/* Linked Equipment Multi-Select */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Linked Equipment / Fleet Responsibility</label>
                <div style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {equipmentList.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No equipment registered yet</span>
                  ) : (
                    equipmentList.map(eq => {
                      const isChecked = directoryForm.linkedEquipment?.includes(eq.name);
                      return (
                        <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDirectoryForm(prev => ({
                                  ...prev,
                                  linkedEquipment: [...(prev.linkedEquipment || []), eq.name]
                                }));
                              } else {
                                setDirectoryForm(prev => ({
                                  ...prev,
                                  linkedEquipment: (prev.linkedEquipment || []).filter(name => name !== eq.name)
                                }));
                              }
                            }}
                          />
                          <span><b>{eq.name}</b> ({eq.zone})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Contract & Inspection Schedule */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '10px' }}>
                  CONTRACT & SERVICE SCHEDULE
                </div>

                <div className="grid-2" style={{ marginBottom: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Contract Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={directoryForm.contractStartDate}
                      onChange={(e) => setDirectoryForm(prev => ({ ...prev, contractStartDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Contract End Date (AMC Expiry)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={directoryForm.contractEndDate}
                      onChange={(e) => setDirectoryForm(prev => ({ ...prev, contractEndDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Service Frequency</label>
                    <select
                      className="form-input"
                      value={directoryForm.serviceFrequency}
                      onChange={(e) => setDirectoryForm(prev => ({ ...prev, serviceFrequency: e.target.value }))}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Bi-Annually">Bi-Annually</option>
                      <option value="Annual">Annual</option>
                      <option value="On-Demand">On-Demand</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Last Service Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={directoryForm.lastServiceDate}
                      onChange={(e) => setDirectoryForm(prev => ({ ...prev, lastServiceDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Next Service Due</label>
                    <input
                      type="date"
                      className="form-input"
                      value={directoryForm.nextServiceDue}
                      onChange={(e) => setDirectoryForm(prev => ({ ...prev, nextServiceDue: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Internal Notes / Service Terms & SLAs</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. 24/7 breakdown response within 4 hours. Dedicated technician Ramesh is on-call for emergency barbell & cable repairs."
                  rows={2}
                  value={directoryForm.notes}
                  onChange={(e) => setDirectoryForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddDirectoryModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '42px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingDirectory}
                  style={{ flex: 2, height: '42px', fontSize: '13px', fontWeight: 800 }}
                >
                  {savingDirectory ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Saving Contact...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> {editingDirectoryEntry ? 'Update Directory Contact' : 'Save New Contact'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. DELETE DIRECTORY CONTACT CONFIRMATION MODAL */}
      {showDeleteDirectoryModal && directoryToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteDirectoryModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="sheet-handle" />

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid var(--rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--rose)'
            }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Remove Directory Contact?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Are you sure you want to remove <b>{directoryToDelete.name}</b> ({directoryToDelete.category}) from the Maintenance Directory?
            </p>

            <div style={{
              margin: '16px 0',
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <div>Category: <span className="badge" style={{ fontSize: '10px' }}>{directoryToDelete.category}</span></div>
              {directoryToDelete.companyName && <div>Company: <b>{directoryToDelete.companyName}</b></div>}
              <div>Phone: <b style={{ color: 'var(--cyan)' }}>{directoryToDelete.phone}</b></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteDirectoryModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '42px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDirectory}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '42px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--rose), #be123c)',
                  color: '#fff'
                }}
              >
                Yes, Remove Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. DELETE ADMIN NOTE CONFIRMATION MODAL */}
      {showDeleteNoteModal && noteToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteNoteModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="sheet-handle" />

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid var(--rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--rose)'
            }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Delete Confidential Note?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this admin note?
            </p>

            <div style={{
              margin: '16px 0',
              padding: '12px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '12px',
              textAlign: 'left',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {noteToDelete.title && <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{noteToDelete.title}</div>}
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{noteToDelete.body || noteToDelete.content}"
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteNoteModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '42px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteNote}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '42px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--rose), #be123c)',
                  color: '#fff'
                }}
              >
                Yes, Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


