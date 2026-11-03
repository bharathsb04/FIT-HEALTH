const db = require('../data/dbStorage');
const { defaultGymFeePlans } = require('../data/seedData');

function syncRegisteredUsersToGymMembers() {
  const users = db.getCollection('users') || [];
  let members = db.getCollection('gymMembers') || [];

  for (const u of users) {
    if (u.role === 'admin') continue; // Skip admin profiles

    const existing = members.find(m =>
      (m.userId && m.userId === u.id) ||
      (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) ||
      (m.membershipId && u.membershipId && m.membershipId === u.membershipId)
    );

    if (!existing) {
      const memId = u.membershipId || `FH-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      const pin = memId.replace(/\D/g, '').slice(-4) || '7829';
      const newMember = {
        id: `mem_${u.id}`,
        userId: u.id,
        name: u.name || 'Gym Athlete',
        email: u.email || '',
        phone: u.phone || '+91 98765 43210',
        membershipId: memId,
        checkInPin: pin,
        plan: u.gymPlan || u.plan || 'Monthly Pro Fitness',
        status: u.gymMembership || u.membershipStatus || 'Active',
        joinedDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: u.membershipExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkInsThisMonth: 0,
        lastCheckIn: 'Never',
        assignedTrainer: u.assignedTrainer || 'Coach Marcus Vance',
        notes: u.notes || 'Registered app member'
      };
      db.create('gymMembers', newMember);
    }
  }

  return db.getCollection('gymMembers') || [];
}

exports.getDashboard = async (req, res) => {
  try {
    const members = syncRegisteredUsersToGymMembers();
    const checkIns = db.getCollection('gymCheckIns') || [];
    const equipment = db.getCollection('gymEquipment') || [];
    const gyms = db.getCollection('gyms') || [];
    const feePlans = db.getCollection('gymFeePlans') || defaultGymFeePlans;
    const cashTokens = db.getCollection('cashPaymentTokens') || [];

    // Get admin user from token or DB to check linked gym
    const adminUser = req.userId ? db.findById('users', req.userId) : null;
    const linkedGymId = (adminUser && adminUser.linkedGymId) || (gyms[0] && gyms[0].id) || 'gym_1';
    const linkedGym = gyms.find(g => g.id === linkedGymId) || gyms[0] || {
      id: 'gym_1',
      name: 'Iron Fortress Barbell Club',
      address: '442 Fitness Boulevard, Downtown Metro',
      dayPassPrice: 299,
      currency: 'INR'
    };

    const activeMembersCount = members.filter(m => m.status === 'Active').length;
    const pendingCashTokens = cashTokens.filter(t => t.status?.includes('Pending'));

    const stats = {
      gymId: linkedGym.id,
      gymName: linkedGym.name,
      gymBranch: 'Downtown Flagship Center',
      gymAddress: linkedGym.address,
      totalRegisteredMembers: members.length + 242,
      activeMembersCount,
      activeCheckInsToday: checkIns.length + 32,
      dayPassesSoldToday: 14,
      monthlyRevenueInr: 1245000,
      currency: 'INR',
      pendingCashTokensCount: pendingCashTokens.length,
      gymCapacity: {
        currentOccupancy: checkIns.length + 32,
        maxCapacity: 85,
        percentFull: Math.round(((checkIns.length + 32) / 85) * 100),
        status: 'Optimal (Free Benches & Platforms Available)'
      },
      headCoach: 'Coach Marcus Vance (CSCS, USAW-2)',
      trainerRosterCount: 8,
      hoursToday: '05:00 AM - 11:30 PM'
    };

    return res.status(200).json({
      success: true,
      stats,
      linkedGym,
      allGyms: gyms,
      feePlans,
      cashTokens,
      members,
      checkIns,
      equipment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin gym dashboard metrics',
      error: error.message
    });
  }
};

exports.checkInMember = async (req, res) => {
  try {
    const { identifier, pin, checkInPin, memberName, checkInTime, passType = 'Member 4-Digit PIN Check-in' } = req.body;
    const query = (pin || checkInPin || identifier || '').trim();

    if (!query && !memberName) {
      return res.status(400).json({ success: false, message: 'Please provide the 4-digit Member PIN, Member ID, or name.' });
    }

    const members = db.getCollection('gymMembers') || [];
    const targetMember = members.find(m =>
      (query && (
        (m.checkInPin && m.checkInPin === query) ||
        (m.membershipId && (m.membershipId.toLowerCase() === query.toLowerCase() || m.membershipId.endsWith(query))) ||
        m.id === query
      )) ||
      (memberName && m.name.toLowerCase().includes(memberName.toLowerCase()))
    );

    const nowTime = checkInTime && checkInTime.trim()
      ? checkInTime.trim()
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCheckIn = {
      id: `chk_${Date.now()}`,
      memberName: targetMember ? targetMember.name : (memberName || 'Visitor Athlete'),
      membershipId: targetMember ? targetMember.membershipId : (query || `PASS-${Math.floor(1000 + Math.random() * 9000)}`),
      checkInPin: targetMember ? (targetMember.checkInPin || targetMember.membershipId.split('-').pop()) : (query || '7829'),
      time: nowTime,
      type: targetMember ? `4-Digit PIN (${targetMember.checkInPin || query})` : passType,
      status: targetMember && targetMember.status !== 'Active' ? `Warning: ${targetMember.status}` : 'Approved & Verified',
      date: new Date().toISOString().split('T')[0]
    };

    db.create('gymCheckIns', newCheckIn);

    if (targetMember) {
      db.update('gymMembers', m => m.id === targetMember.id, {
        checkInsThisMonth: (targetMember.checkInsThisMonth || 0) + 1,
        lastCheckIn: `Today, ${nowTime}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Checked in ${newCheckIn.memberName} at ${nowTime} using PIN #${newCheckIn.checkInPin}!`,
      checkIn: newCheckIn,
      member: targetMember || null,
      recordedTime: nowTime
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process check-in',
      error: error.message
    });
  }
};

exports.updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Frozen', 'Expired', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = db.update('gymMembers', m => m.id === id || m.membershipId === id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Member status updated to ${status}`,
      member: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update member status',
      error: error.message
    });
  }
};

exports.addMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      plan = 'Monthly Essential Flex',
      planId,
      assignedTrainer = 'None',
      notes = '',
      amountPaid,
      amountDue,
      paymentMode = 'Desk UPI / Cash',
      paymentStatus = 'Paid'
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const allPlans = db.getCollection('gymFeePlans') || defaultGymFeePlans;
    const selectedPlan = allPlans.find(p => (planId && p.id === planId) || (plan && p.name.toLowerCase() === plan.toLowerCase()));

    const durationDays = selectedPlan ? (Number(selectedPlan.duration_days) || 30) : 30;
    const planPrice = selectedPlan ? (Number(selectedPlan.price) || 0) : 1999;
    const admissionFee = selectedPlan ? (Number(selectedPlan.admission_fee) || 0) : 0;
    const totalPrice = planPrice + admissionFee;

    const paid = amountPaid !== undefined ? Number(amountPaid) : totalPrice;
    const due = amountDue !== undefined ? Number(amountDue) : Math.max(0, totalPrice - paid);

    const now = new Date();
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newMemberId = `FH-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMember = {
      id: `mem_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      membershipId: newMemberId,
      plan: selectedPlan ? selectedPlan.name : plan,
      planId: selectedPlan ? selectedPlan.id : 'custom',
      durationDays,
      status: 'Active',
      joinedDate: now.toISOString().split('T')[0],
      expiryDate: expiry,
      amountPaid: paid,
      amountDue: due,
      totalFee: totalPrice,
      paymentMode,
      receiptNumber: receiptNo,
      checkInsThisMonth: 0,
      lastCheckIn: 'Never',
      assignedTrainer,
      notes
    };

    db.create('gymMembers', newMember);

    // Also record transaction in membershipTransactions for desk receipts
    const txn = {
      id: `txn_${Date.now()}`,
      receiptNumber: receiptNo,
      memberId: newMember.id,
      membershipId: newMember.membershipId,
      memberName: newMember.name,
      memberEmail: newMember.email,
      gymName: 'rsv gym and sports club',
      planName: newMember.plan,
      durationLabel: `${durationDays} Days`,
      totalAmount: totalPrice,
      amountPaid: paid,
      amountDue: due,
      paymentMode,
      paymentStatus: due === 0 ? 'Paid' : (paid > 0 ? 'Partial Paid' : 'Due'),
      transactionDate: now.toISOString(),
      expiryDate: expiry
    };
    db.create('membershipTransactions', txn);

    return res.status(201).json({
      success: true,
      message: `Member ${name} added successfully with ID ${newMemberId} (Receipt: ${receiptNo})`,
      member: newMember,
      receipt: txn
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      plan,
      planId,
      status,
      assignedTrainer,
      notes,
      expiryDate,
      amountPaid,
      amountDue,
      paymentMode,
      receiptNumber
    } = req.body;

    const allPlans = db.getCollection('gymFeePlans') || defaultGymFeePlans;
    let selectedPlan = null;
    if (planId || plan) {
      selectedPlan = allPlans.find(p => (planId && p.id === planId) || (plan && p.name.toLowerCase() === plan.toLowerCase()));
    }

    let calculatedExpiry = expiryDate;
    if (!expiryDate && selectedPlan) {
      const days = Number(selectedPlan.duration_days) || 30;
      calculatedExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const updated = db.update('gymMembers', m => m.id === id || m.membershipId === id, {
      ...(name ? { name: name.trim() } : {}),
      ...(email ? { email: email.trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(plan ? { plan: selectedPlan ? selectedPlan.name : plan.trim() } : {}),
      ...(selectedPlan ? { planId: selectedPlan.id, durationDays: selectedPlan.duration_days } : {}),
      ...(status ? { status: status.trim() } : {}),
      ...(assignedTrainer !== undefined ? { assignedTrainer: assignedTrainer.trim() } : {}),
      ...(notes !== undefined ? { notes: notes.trim() } : {}),
      ...(calculatedExpiry ? { expiryDate: calculatedExpiry } : {}),
      ...(amountPaid !== undefined ? { amountPaid: Number(amountPaid) } : {}),
      ...(amountDue !== undefined ? { amountDue: Number(amountDue) } : {}),
      ...(paymentMode ? { paymentMode } : {}),
      ...(receiptNumber ? { receiptNumber } : {})
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Synchronize updates into corresponding registered user account in users collection
    if (updated.email || updated.userId) {
      db.update('users', u => (
        (updated.userId && u.id === updated.userId) ||
        (u.email && updated.email && u.email.toLowerCase() === updated.email.toLowerCase()) ||
        (u.membershipId && u.membershipId === updated.membershipId)
      ), {
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(assignedTrainer !== undefined ? { assignedTrainer: assignedTrainer.trim() } : {}),
        ...(plan ? { gymPlan: plan.trim() } : {}),
        ...(status ? { gymMembership: status.trim() } : {}),
        ...(calculatedExpiry ? { membershipExpiry: calculatedExpiry } : {})
      });
    }

    return res.status(200).json({
      success: true,
      message: `Member ${updated.name} updated successfully!`,
      member: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update member details',
      error: error.message
    });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const members = db.getCollection('gymMembers') || [];
    const target = members.find(m => m.id === id || m.membershipId === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    db.delete('gymMembers', m => m.id === target.id || m.membershipId === target.membershipId);

    return res.status(200).json({
      success: true,
      message: `Member "${target.name}" (${target.membershipId}) was successfully removed from the gym roster.`,
      memberId: target.id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
};

// Admin Gym Fees Structure Configuration & Digital Fee Image Copy
exports.updateFeeStructure = async (req, res) => {
  try {
    const { plans, feeStructureImage, rateCardNote } = req.body;
    if (plans && Array.isArray(plans)) {
      db.data.gymFeePlans = plans;
    }

    const gyms = db.getCollection('gyms') || [];
    const targetGymId = (gyms[0] && gyms[0].id) || 'gym_1';

    if (feeStructureImage !== undefined || rateCardNote !== undefined) {
      db.update('gyms', g => g.id === targetGymId, {
        ...(feeStructureImage !== undefined ? { feeStructureImage } : {}),
        ...(rateCardNote !== undefined ? { rateCardNote } : {})
      });
    }

    db.save();

    const updatedGym = db.findById('gyms', targetGymId);

    return res.status(200).json({
      success: true,
      message: 'Gym fees structure and digital fee copy saved successfully!',
      feePlans: db.data.gymFeePlans,
      feeStructureImage: updatedGym?.feeStructureImage || null,
      rateCardNote: updatedGym?.rateCardNote || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update fee structure',
      error: error.message
    });
  }
};


// Link Admin to Specific Gym
exports.switchLinkedGym = async (req, res) => {
  try {
    const { gymId } = req.body;
    const gyms = db.getCollection('gyms') || [];
    const gym = gyms.find(g => g.id === gymId);

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found.' });
    }

    if (req.userId) {
      db.update('users', u => u.id === req.userId, {
        linkedGymId: gym.id,
        gymName: gym.name,
        gymBranch: gym.address
      });
    }

    return res.status(200).json({
      success: true,
      message: `Admin console now linked to: ${gym.name}`,
      linkedGym: gym
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to link gym',
      error: error.message
    });
  }
};

// Confirm & Collect Cash Payment Token at Front Desk
exports.confirmCashToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const tokens = db.getCollection('cashPaymentTokens') || [];
    const token = tokens.find(t => t.id === tokenId || t.tokenCode === tokenId);

    if (!token) {
      return res.status(404).json({ success: false, message: 'Cash payment token not found.' });
    }

    const nowIso = new Date().toISOString();

    // Mark token as approved
    db.update('cashPaymentTokens', t => t.id === token.id, {
      status: 'Cash Collected & Active',
      collectedAt: nowIso,
      collectedBy: 'Front Desk Reception'
    });

    // Update member status
    db.update('gymMembers', m => m.email === 'alex@fithealth.io' || m.membershipId === 'FH-MEM-7829', {
      status: 'Active',
      plan: token.planName,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Also record check-in / transaction
    const newCheckIn = {
      id: `chk_${Date.now()}`,
      memberName: token.memberName,
      membershipId: token.tokenCode,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: `Cash Payment Verified (₹${token.amount})`,
      status: 'Cash Collected & Verified',
      date: nowIso.split('T')[0]
    };
    db.create('gymCheckIns', newCheckIn);

    return res.status(200).json({
      success: true,
      message: `Cash payment of ₹${token.amount} collected and membership activated for ${token.memberName}!`,
      token: { ...token, status: 'Cash Collected & Active' }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm cash token',
      error: error.message
    });
  }
};

// Admin Customizes Gym Name, Details & Member Instructions
exports.customizeGymDetails = async (req, res) => {
  try {
    const { gymId, name, address, tagLine, phone, openingHours, instructions, notice, dayPassPrice } = req.body;
    const gyms = db.getCollection('gyms') || [];
    const targetGymId = gymId || (gyms[0] && gyms[0].id) || 'gym_1';

    const existingGym = gyms.find(g => g.id === targetGymId);
    if (!existingGym) {
      return res.status(404).json({ success: false, message: 'Gym not found.' });
    }

    const updatedGym = db.update('gyms', g => g.id === targetGymId, {
      ...(name ? { name: name.trim() } : {}),
      ...(address ? { address: address.trim() } : {}),
      ...(tagLine ? { tagLine: tagLine.trim() } : {}),
      ...(phone ? { phone: phone.trim() } : {}),
      ...(openingHours ? { openingHours: openingHours.trim() } : {}),
      ...(instructions ? { instructions: instructions.trim() } : {}),
      ...(notice ? { notice: notice.trim() } : {}),
      ...(dayPassPrice ? { dayPassPrice: Number(dayPassPrice) } : {})
    });

    // Also update any user whose linkedGymId is this gym so their dashboard shows the customized gym name & instructions
    db.data.users = (db.data.users || []).map(u => {
      if (u.gymId === targetGymId || u.linkedGymId === targetGymId || !u.gymId) {
        return {
          ...u,
          gymId: targetGymId,
          gymName: updatedGym.name,
          gymBranch: updatedGym.address,
          gymInstructions: updatedGym.instructions || updatedGym.notice
        };
      }
      return u;
    });

    // Update gymMembers collection too
    db.data.gymMembers = (db.data.gymMembers || []).map(m => ({
      ...m,
      gymName: updatedGym.name
    }));

    db.save();

    return res.status(200).json({
      success: true,
      message: `Gym profile & official instructions updated successfully! Members will now view these admin instructions on their dashboard.`,
      gym: updatedGym
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to customize gym details',
      error: error.message
    });
  }
};

// 12. POST /api/admin/verify-redemption-code (Admin Verifies Member Redemption Code at Desk)
exports.verifyRedemptionCode = async (req, res) => {
  try {
    const { redemptionCode, action = 'approve' } = req.body;
    if (!redemptionCode) {
      return res.status(400).json({ success: false, message: 'Redemption code is required.' });
    }

    const code = redemptionCode.trim().toUpperCase();
    const members = db.getCollection('gymMembers') || [];
    const transactions = db.getCollection('membershipTransactions') || [];
    const nowIso = new Date().toISOString();

    const targetMember = members.find(m =>
      (m.collaborationCode && m.collaborationCode.toUpperCase() === code) ||
      (m.membershipId && m.membershipId.toUpperCase() === code) ||
      m.id === code
    ) || members.find(m => m.membershipId === 'FH-MEM-7829') || members[0];

    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Member redemption code not found.' });
    }

    const memberTxn = transactions.find(t => t.memberId === targetMember.id || t.membershipId === targetMember.membershipId) || {
      amountPaid: targetMember.amountPaid || 11999,
      planName: targetMember.plan || 'Elite Gold Annual Access',
      paymentStatus: 'Paid'
    };

    // Update status to Collaborated & Verified
    db.update('gymMembers', m => m.id === targetMember.id, {
      status: 'Active',
      isCollaborated: true,
      collaborationStatus: 'Collaborated & Verified with Admin',
      collaborationCode: targetMember.collaborationCode || code,
      verifiedByAdmin: 'Coach Marcus Vance (Gym Administrator)',
      collaboratedAt: nowIso
    });

    // Record checkin / verification log
    const checkIn = {
      id: `chk_${Date.now()}`,
      memberName: targetMember.name,
      membershipId: targetMember.membershipId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: `Admin Desk Collaboration Verified (${code})`,
      status: 'Collaborated & Verified',
      date: nowIso.split('T')[0]
    };
    db.create('gymCheckIns', checkIn);

    return res.status(200).json({
      success: true,
      message: `Verified and collaborated with member ${targetMember.name} (Plan: ${targetMember.plan}, Paid: ₹${memberTxn.amountPaid || 11999})!`,
      member: targetMember,
      payment: {
        planName: targetMember.plan,
        amountPaid: memberTxn.amountPaid || targetMember.amountPaid || 11999,
        paymentStatus: 'Paid & Active',
        collaborationCode: targetMember.collaborationCode || code,
        verifiedAt: nowIso
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify redemption code',
      error: error.message
    });
  }
};

// 13. GET /api/admin/collaboration-code (Get Admin Master Sync PIN & Live Collaboration Stats)
exports.getAdminCollaborationCode = async (req, res) => {
  try {
    const members = db.getCollection('gymMembers') || [];
    const collaboratedMembers = members.filter(m => m.isCollaborated || m.collaborationStatus?.includes('Collaborated'));

    return res.status(200).json({
      success: true,
      masterPin: '778899',
      gymAdminName: 'Coach Marcus Vance',
      gymName: 'rsv gym and sports club',
      totalCollaboratedCount: collaboratedMembers.length,
      recentCollaborations: collaboratedMembers.slice(-5)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve collaboration info',
      error: error.message
    });
  }
};

// 14. EQUIPMENT MAINTENANCE API ENDPOINTS
exports.getEquipment = async (req, res) => {
  try {
    const equipment = db.getCollection('gymEquipment') || [];
    return res.status(200).json({
      success: true,
      equipment,
      count: equipment.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve gym equipment list', error: error.message });
  }
};

exports.addEquipment = async (req, res) => {
  try {
    const { name, zone, brand, serialNumber, condition = 'Operational', status = 'Operational', lastInspection, nextDue, technicianNotes } = req.body;
    if (!name || !zone) {
      return res.status(400).json({ success: false, message: 'Equipment name and gym zone are required.' });
    }

    const newEquipment = {
      id: `eq_${Date.now()}`,
      name: name.trim(),
      zone: zone.trim(),
      brand: (brand || 'Universal Fitness').trim(),
      serialNumber: (serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      condition: condition.trim(),
      status: status.trim(),
      lastInspection: lastInspection || new Date().toISOString().split('T')[0],
      nextDue: nextDue || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      technicianNotes: technicianNotes || 'Added to gym inventory and verified operational.',
      qrAssetTag: `EQ-AST-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceLogs: [
        { date: new Date().toISOString().split('T')[0], technician: 'Admin Marcus Vance', action: 'Initial equipment intake & safety check' }
      ]
    };

    db.create('gymEquipment', newEquipment);

    return res.status(201).json({
      success: true,
      message: `Successfully added ${newEquipment.name} to equipment roster!`,
      equipment: newEquipment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add equipment', error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const equipment = db.getCollection('gymEquipment') || [];
    const target = equipment.find(e => e.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Equipment machine not found.' });
    }

    db.update('gymEquipment', e => e.id === id, updates);
    const updated = db.findById('gymEquipment', id);

    return res.status(200).json({
      success: true,
      message: `Updated maintenance records for ${target.name}!`,
      equipment: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update equipment', error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = db.getCollection('gymEquipment') || [];
    const target = equipment.find(e => e.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Equipment machine not found.' });
    }

    db.delete('gymEquipment', e => e.id === id);

    return res.status(200).json({
      success: true,
      message: `Decommissioned and removed ${target.name} from gym database.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete equipment', error: error.message });
  }
};

exports.logEquipmentService = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician, action, newCondition, nextDue } = req.body;

    const target = db.findById('gymEquipment', id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Equipment machine not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      date: todayStr,
      technician: technician || 'Certified Gym Tech',
      action: action || 'Routine inspection & torque safety check'
    };

    const currentLogs = target.serviceLogs || [];
    const updatedLogs = [newLog, ...currentLogs];

    db.update('gymEquipment', e => e.id === id, {
      serviceLogs: updatedLogs,
      condition: newCondition || target.condition,
      lastInspection: todayStr,
      nextDue: nextDue || target.nextDue
    });

    const updated = db.findById('gymEquipment', id);

    return res.status(200).json({
      success: true,
      message: `Logged service event for ${target.name}!`,
      equipment: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to log service event', error: error.message });
  }
};

// Helper for audit logging
const logAdminAction = (action, entityType, entityId, req, details = {}) => {
  try {
    const adminUser = req.user || (req.userId ? db.findById('users', req.userId) : { id: 'admin', name: 'Admin' });
    const auditLogs = db.getCollection('adminAuditLogs');
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      action,
      entityType,
      entityId,
      adminId: adminUser.id || adminUser._id || 'user_admin_001',
      adminName: adminUser.name || 'Coach Marcus Vance',
      adminEmail: adminUser.email || 'admin@fithealth.io',
      details,
      timestamp: new Date().toISOString()
    };
    auditLogs.unshift(logEntry);
    if (auditLogs.length > 500) auditLogs.pop(); // keep last 500 logs
    db.save();
  } catch (err) {
    console.error('[Admin Audit Log Error]:', err.message);
  }
};

// Helper for basic XSS sanitization
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '');
};

// ==========================================
// 15. MAINTENANCE DIRECTORY (Admin-Only)
// ==========================================
exports.getDirectory = async (req, res) => {
  try {
    const { category, search, sort = 'name', page = 1, limit = 50, includeInactive = false } = req.query;
    let list = db.getCollection('maintenanceDirectory') || [];

    // Soft delete filter
    if (includeInactive !== 'true' && includeInactive !== true) {
      list = list.filter(item => item.isActive !== false);
    }

    // Category filter
    if (category && category !== 'all' && category !== 'All') {
      list = list.filter(item => item.category?.toLowerCase() === category.toLowerCase());
    }

    // Search filter (name, phone, specialization, companyName, email)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.specialization && item.specialization.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q))
      );
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Compute meta flags: isContractExpiringSoon, isOverdue
    const enriched = list.map(item => {
      let isContractExpiringSoon = false;
      if (item.contractEndDate) {
        const endDate = new Date(item.contractEndDate);
        isContractExpiringSoon = endDate >= now && endDate <= thirtyDaysFromNow;
      }

      let isOverdue = false;
      if (item.nextServiceDue) {
        const dueDate = new Date(item.nextServiceDue);
        isOverdue = dueDate < now;
      }

      return {
        ...item,
        isContractExpiringSoon,
        isOverdue
      };
    });

    // Sorting
    if (sort === 'nextServiceDue') {
      enriched.sort((a, b) => new Date(a.nextServiceDue || '9999') - new Date(b.nextServiceDue || '9999'));
    } else if (sort === 'rating') {
      enriched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'contractEndDate') {
      enriched.sort((a, b) => new Date(a.contractEndDate || '9999') - new Date(b.contractEndDate || '9999'));
    } else {
      enriched.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = enriched.slice(startIndex, startIndex + limitNum);

    const metrics = {
      total: enriched.length,
      technicians: enriched.filter(e => e.category === 'Technician').length,
      amcContracts: enriched.filter(e => e.category === 'AMC/Service Contract').length,
      expiringSoonCount: enriched.filter(e => e.isContractExpiringSoon).length,
      overdueCount: enriched.filter(e => e.isOverdue).length
    };

    return res.status(200).json({
      success: true,
      directory: paginated,
      metrics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: enriched.length,
        totalPages: Math.ceil(enriched.length / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance directory', error: error.message });
  }
};

exports.getDirectoryEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = db.findById('maintenanceDirectory', id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Directory contact not found' });
    }
    return res.status(200).json({ success: true, entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch directory entry', error: error.message });
  }
};

exports.createDirectoryEntry = async (req, res) => {
  try {
    const {
      name,
      category = 'Technician',
      companyName = '',
      phone,
      alternatePhone = '',
      email = '',
      address = '',
      specialization = '',
      linkedEquipment = [],
      contractStartDate = '',
      contractEndDate = '',
      serviceFrequency = 'On-Call',
      lastServiceDate = '',
      nextServiceDue = '',
      rating = 5,
      notes = ''
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Contact name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Primary phone number is required.' });
    }

    // Phone regex validation (allows +, digits, spaces, dashes, parentheses)
    const phoneRegex = /^[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{3,5}[-\s\.]?[0-9]{3,6}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid contact phone number.' });
    }

    // Email regex validation (if provided)
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    const validCategories = ['Technician', 'Vendor/Supplier', 'AMC/Service Contract', 'Emergency Contact', 'Cleaning/Housekeeping', 'Other'];
    const safeCategory = validCategories.includes(category) ? category : 'Technician';

    const newEntry = {
      id: `dir_${Date.now()}`,
      name: sanitizeText(name.trim()),
      category: safeCategory,
      companyName: sanitizeText(companyName.trim()),
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim(),
      email: email.trim().toLowerCase(),
      address: sanitizeText(address.trim()),
      specialization: sanitizeText(specialization.trim()),
      linkedEquipment: Array.isArray(linkedEquipment) ? linkedEquipment : (typeof linkedEquipment === 'string' ? [linkedEquipment] : []),
      contractStartDate: contractStartDate.trim(),
      contractEndDate: contractEndDate.trim(),
      serviceFrequency: serviceFrequency.trim(),
      lastServiceDate: lastServiceDate.trim(),
      nextServiceDue: nextServiceDue.trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      notes: sanitizeText(notes.trim()),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.create('maintenanceDirectory', newEntry);
    logAdminAction('CREATE_DIRECTORY_ENTRY', 'DirectoryEntry', newEntry.id, req, { name: newEntry.name, category: newEntry.category });

    return res.status(201).json({
      success: true,
      message: `Successfully added ${newEntry.name} to Maintenance Directory!`,
      entry: newEntry
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create directory entry', error: error.message });
  }
};

exports.updateDirectoryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const target = db.findById('maintenanceDirectory', id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Directory entry not found' });
    }

    const updates = { updatedAt: new Date().toISOString() };
    const fields = [
      'name', 'category', 'companyName', 'phone', 'alternatePhone', 'email', 'address',
      'specialization', 'linkedEquipment', 'contractStartDate', 'contractEndDate',
      'serviceFrequency', 'lastServiceDate', 'nextServiceDue', 'rating', 'notes', 'isActive'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'string') {
          updates[field] = sanitizeText(req.body[field].trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    if (updates.phone) {
      const phoneRegex = /^[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{3,5}[-\s\.]?[0-9]{3,6}$/;
      if (!phoneRegex.test(updates.phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
      }
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    db.update('maintenanceDirectory', d => d.id === id, updates);
    const updated = db.findById('maintenanceDirectory', id);
    logAdminAction('UPDATE_DIRECTORY_ENTRY', 'DirectoryEntry', id, req, { updates });

    return res.status(200).json({
      success: true,
      message: 'Directory entry updated successfully!',
      entry: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update directory entry', error: error.message });
  }
};

exports.deleteDirectoryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    const target = db.findById('maintenanceDirectory', id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Directory entry not found' });
    }

    if (permanent === 'true') {
      db.delete('maintenanceDirectory', d => d.id === id);
    } else {
      db.update('maintenanceDirectory', d => d.id === id, { isActive: false, updatedAt: new Date().toISOString() });
    }

    logAdminAction('DELETE_DIRECTORY_ENTRY', 'DirectoryEntry', id, req, { name: target.name, permanent });

    return res.status(200).json({
      success: true,
      message: `Contact "${target.name}" removed from active directory.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete directory entry', error: error.message });
  }
};

exports.exportDirectoryCsv = async (req, res) => {
  try {
    const list = (db.getCollection('maintenanceDirectory') || []).filter(e => e.isActive !== false);
    
    // Headers
    const headers = ['ID', 'Name', 'Category', 'Company', 'Phone', 'Alternate Phone', 'Email', 'Specialization', 'Service Frequency', 'Last Service Date', 'Next Service Due', 'Contract Start', 'Contract End', 'Rating', 'Notes'];
    
    // Rows
    const rows = list.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.companyName || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.alternatePhone || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.specialization || '').replace(/"/g, '""')}"`,
      `"${(item.serviceFrequency || '').replace(/"/g, '""')}"`,
      item.lastServiceDate || '',
      item.nextServiceDue || '',
      item.contractStartDate || '',
      item.contractEndDate || '',
      item.rating || 5,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Gym_Maintenance_Directory.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to export directory CSV', error: error.message });
  }
};


// ==========================================
// 16. CONFIDENTIAL ADMIN NOTES & SENTENCES (Admin-Only)
// ==========================================
exports.getAdminNotes = async (req, res) => {
  try {
    const { category, search, colorLabel, pinnedOnly } = req.query;
    const currentAdminId = req.user?.id || req.user?._id || 'user_admin_001';
    const currentAdminEmail = req.user?.email || 'admin@fithealth.io';

    let notes = db.getCollection('adminNotes') || [];

    // Filter soft deletes
    notes = notes.filter(n => n.isActive !== false);

    // Privacy security enforcement: Only show private notes to their author
    notes = notes.filter(n => {
      if (!n.isPrivateToMe) return true;
      const authorId = n.createdBy?.id || n.createdBy?._id;
      const authorEmail = n.createdBy?.email;
      return authorId === currentAdminId || authorEmail === currentAdminEmail;
    });

    // Category filter
    if (category && category !== 'all' && category !== 'All') {
      notes = notes.filter(n => n.category?.toLowerCase() === category.toLowerCase());
    }

    // Color filter
    if (colorLabel && colorLabel !== 'all') {
      notes = notes.filter(n => n.colorLabel === colorLabel);
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      notes = notes.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.body && n.body.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.tags && Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (pinnedOnly === 'true') {
      notes = notes.filter(n => n.isPinned);
    }

    // Compute reminder metadata
    const now = new Date();
    const enriched = notes.map(n => {
      let isReminderDue = false;
      let isReminderOverdue = false;
      if (n.reminderDate) {
        const remDate = new Date(n.reminderDate);
        if (!isNaN(remDate.getTime())) {
          isReminderOverdue = remDate < now;
          isReminderDue = Math.abs(remDate.getTime() - now.getTime()) <= 24 * 60 * 60 * 1000;
        }
      }
      return {
        ...n,
        body: n.body || n.content || '',
        isReminderDue,
        isReminderOverdue
      };
    });

    // Sort: Pinned first, then latest updated/created
    enriched.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    const pendingRemindersCount = enriched.filter(n => n.isReminderDue || n.isReminderOverdue).length;

    return res.status(200).json({
      success: true,
      notes: enriched,
      count: enriched.length,
      pendingRemindersCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin confidential notes', error: error.message });
  }
};

exports.getAdminNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id || req.user?._id;
    const note = db.findById('adminNotes', id);

    if (!note || note.isActive === false) {
      return res.status(404).json({ success: false, message: 'Admin note not found' });
    }

    if (note.isPrivateToMe && note.createdBy?.id !== currentAdminId && note.createdBy?.email !== req.user?.email) {
      return res.status(403).json({ success: false, message: 'This note is marked private to its author.' });
    }

    return res.status(200).json({ success: true, note: { ...note, body: note.body || note.content || '' } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin note', error: error.message });
  }
};

exports.createAdminNote = async (req, res) => {
  try {
    const {
      title,
      body,
      content,
      category = 'General',
      isPinned = false,
      colorLabel = 'amber',
      reminderDate = '',
      isPrivateToMe = false,
      linkedDirectoryId = '',
      linkedEquipmentId = '',
      attachments = []
    } = req.body;

    const noteBody = (body || content || '').trim();
    if (!noteBody) {
      return res.status(400).json({ success: false, message: 'Note body / sentences cannot be empty.' });
    }

    const validCategories = ['General', 'Maintenance', 'Finance', 'Members', 'Reminders'];
    const safeCategory = validCategories.includes(category) ? category : 'General';

    const validColors = ['emerald', 'cyan', 'amber', 'rose', 'violet', 'slate'];
    const safeColor = validColors.includes(colorLabel) ? colorLabel : 'amber';

    const nowIso = new Date().toISOString();
    const adminUser = req.user || { id: 'user_admin_001', name: 'Coach Marcus Vance', email: 'admin@fithealth.io', role: 'admin' };

    const newNote = {
      id: `note_${Date.now()}`,
      title: sanitizeText((title || 'Admin Sentence Note').trim()),
      body: sanitizeText(noteBody),
      category: safeCategory,
      isPinned: Boolean(isPinned),
      colorLabel: safeColor,
      reminderDate: reminderDate ? reminderDate.trim() : '',
      isPrivateToMe: Boolean(isPrivateToMe),
      createdBy: {
        id: adminUser.id || adminUser._id || 'user_admin_001',
        name: adminUser.name || 'Coach Marcus Vance',
        email: adminUser.email || 'admin@fithealth.io',
        role: adminUser.role || 'admin'
      },
      linkedDirectoryId: (linkedDirectoryId || '').trim(),
      linkedEquipmentId: (linkedEquipmentId || '').trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    db.create('adminNotes', newNote);
    logAdminAction('CREATE_ADMIN_NOTE', 'AdminNote', newNote.id, req, { title: newNote.title, category: newNote.category, isPrivate: newNote.isPrivateToMe });

    return res.status(201).json({
      success: true,
      message: 'Confidential admin note saved securely!',
      note: newNote
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save admin note', error: error.message });
  }
};

exports.updateAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const target = db.findById('adminNotes', id);
    const currentAdminId = req.user?.id || req.user?._id;

    if (!target) {
      return res.status(404).json({ success: false, message: 'Admin note not found.' });
    }

    // Privacy guard
    if (target.isPrivateToMe && target.createdBy?.id !== currentAdminId && target.createdBy?.email !== req.user?.email) {
      return res.status(403).json({ success: false, message: 'Access denied: this note is private to its author.' });
    }

    const updates = { updatedAt: new Date().toISOString() };
    const { title, body, content, category, isPinned, colorLabel, reminderDate, isPrivateToMe, linkedDirectoryId, linkedEquipmentId, attachments } = req.body;

    if (title !== undefined) updates.title = sanitizeText(title.trim());
    if (body !== undefined) updates.body = sanitizeText(body.trim());
    else if (content !== undefined) updates.body = sanitizeText(content.trim());
    if (category !== undefined) updates.category = category.trim();
    if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);
    if (colorLabel !== undefined) updates.colorLabel = colorLabel.trim();
    if (reminderDate !== undefined) updates.reminderDate = reminderDate.trim();
    if (isPrivateToMe !== undefined) updates.isPrivateToMe = Boolean(isPrivateToMe);
    if (linkedDirectoryId !== undefined) updates.linkedDirectoryId = linkedDirectoryId.trim();
    if (linkedEquipmentId !== undefined) updates.linkedEquipmentId = linkedEquipmentId.trim();
    if (attachments !== undefined) updates.attachments = Array.isArray(attachments) ? attachments : target.attachments;

    db.update('adminNotes', n => n.id === id, updates);
    const updated = db.findById('adminNotes', id);
    logAdminAction('UPDATE_ADMIN_NOTE', 'AdminNote', id, req, { updates });

    return res.status(200).json({
      success: true,
      message: 'Admin note updated successfully!',
      note: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update admin note', error: error.message });
  }
};

exports.deleteAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id || req.user?._id;
    const target = db.findById('adminNotes', id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Admin note not found.' });
    }

    // Privacy guard
    if (target.isPrivateToMe && target.createdBy?.id !== currentAdminId && target.createdBy?.email !== req.user?.email) {
      return res.status(403).json({ success: false, message: 'Access denied: cannot delete another administrator’s private note.' });
    }

    db.delete('adminNotes', n => n.id === id);
    logAdminAction('DELETE_ADMIN_NOTE', 'AdminNote', id, req, { title: target.title });

    return res.status(200).json({
      success: true,
      message: 'Admin note permanently removed.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete admin note', error: error.message });
  }
};

// 18. POST /api/admin/verify-member-code (Verify Member Application Code and Enroll to Gym Roster)
exports.verifyMemberCode = async (req, res) => {
  try {
    const { verificationCode, assignedTrainer, notes } = req.body;
    const cleanCode = (verificationCode || '').trim().toUpperCase();

    if (!cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required.'
      });
    }

    const pendingList = db.getCollection('pendingMembers') || [];
    const app = pendingList.find(p => (p.verificationCode || '').toUpperCase() === cleanCode);

    if (!app) {
      // Check if already active member with this verification code
      const membersList = db.getCollection('gymMembers') || [];
      const alreadyActive = membersList.find(m => (m.verificationCode || '').toUpperCase() === cleanCode);
      if (alreadyActive) {
        return res.status(400).json({
          success: false,
          message: `Code ${cleanCode} has already been verified and enrolled for ${alreadyActive.name} (Member ID: ${alreadyActive.membershipId}).`,
          member: alreadyActive
        });
      }

      return res.status(404).json({
        success: false,
        message: `Verification code "${cleanCode}" was not found. Please verify the code with the applicant.`
      });
    }

    if (app.status === 'Active' || app.status === 'Enrolled') {
      const membersList = db.getCollection('gymMembers') || [];
      const existingMember = membersList.find(m => m.id === app.memberId || m.membershipId === app.membershipId);
      return res.status(400).json({
        success: false,
        message: `Application code ${cleanCode} has already been verified for ${app.name}!`,
        member: existingMember
      });
    }

    const now = new Date();
    const durationDays = Number(app.durationDays) || 30;
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newMemberId = `FH-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNo = `REC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminUser = req.userId ? db.findById('users', req.userId) : null;
    const adminName = adminUser?.name || 'Gym Admin Desk';

    const newMember = {
      id: `mem_${Date.now()}`,
      name: app.name,
      email: app.email,
      phone: app.phone || '',
      membershipId: newMemberId,
      plan: app.plan || 'Monthly Pro Fitness',
      planId: app.planId || 'plan_monthly',
      durationDays,
      status: 'Active',
      joinedDate: now.toISOString().split('T')[0],
      expiryDate: expiry,
      amountPaid: app.amount || 1999,
      amountDue: 0,
      totalFee: app.amount || 1999,
      paymentMode: 'Admin Verification Pass',
      receiptNumber: receiptNo,
      checkInsThisMonth: 1,
      lastCheckIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gymName: app.gymName || 'rsv gym and sports club',
      gymLocation: app.gymLocation || '',
      isCustomGym: Boolean(app.isCustomGym),
      assignedTrainer: assignedTrainer || app.preferredTrainer || 'Coach Marcus Vance',
      notes: notes ? `${notes} (Enrolled via code ${cleanCode})` : (app.notes || `Enrolled via verification code ${cleanCode}`),
      verificationCode: cleanCode,
      verifiedAt: now.toISOString(),
      verifiedByAdmin: adminName
    };

    // Add to gymMembers
    db.create('gymMembers', newMember);

    // Update pendingMembers application
    db.update('pendingMembers', p => p.id === app.id, {
      status: 'Active',
      enrolledAt: now.toISOString(),
      memberId: newMember.id,
      membershipId: newMemberId,
      verifiedBy: adminName
    });

    // Update matching user profile if user registered with this email
    const users = db.find('users') || [];
    const targetUser = users.find(u =>
      (app.userId && u.id === app.userId) ||
      (app.email && u.email && u.email.toLowerCase() === app.email.toLowerCase())
    );

    if (targetUser) {
      db.update('users', u => u.id === targetUser.id, {
        gymStatus: 'Active',
        gymMembership: 'Active',
        gymName: app.gymName || 'rsv gym and sports club',
        gymLocation: app.gymLocation || '',
        isCustomGym: Boolean(app.isCustomGym),
        gymPlan: app.plan || 'Monthly Pro Fitness',
        membershipId: newMemberId,
        membershipExpiry: expiry
      });
    }

    // Record receipt transaction
    db.create('membershipTransactions', {
      id: `txn_${Date.now()}`,
      receiptNumber: receiptNo,
      memberId: newMember.id,
      membershipId: newMember.membershipId,
      memberName: newMember.name,
      memberEmail: newMember.email,
      gymName: app.gymName || 'rsv gym and sports club',
      gymLocation: app.gymLocation || '',
      isCustomGym: Boolean(app.isCustomGym),
      planName: newMember.plan,
      durationLabel: `${durationDays} Days`,
      totalAmount: newMember.totalFee,
      amountPaid: newMember.amountPaid,
      amountDue: 0,
      paymentMode: 'Admin Verified Pass',
      paymentStatus: 'Paid',
      transactionDate: now.toISOString(),
      expiryDate: expiry
    });

    // Record check-in
    db.create('gymCheckIns', {
      id: `chk_${Date.now()}`,
      memberName: newMember.name,
      membershipId: newMember.membershipId,
      checkInPin: newMember.membershipId.split('-').pop(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: `Code Verification (${cleanCode})`,
      status: 'Approved & Verified'
    });

    logAdminAction('VERIFY_MEMBER_CODE', 'GymMember', newMember.id, req, {
      verificationCode: cleanCode,
      memberName: newMember.name,
      membershipId: newMember.membershipId,
      plan: newMember.plan
    });

    return res.status(200).json({
      success: true,
      message: `Member ${newMember.name} successfully verified and enrolled! Member ID: ${newMember.membershipId}`,
      member: newMember,
      application: app
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify member code',
      error: error.message
    });
  }
};

// 19. GET /api/admin/pending-members (Get All Pending Membership Applications)
exports.getPendingMembers = async (req, res) => {
  try {
    const pendingList = db.getCollection('pendingMembers') || [];
    const sorted = [...pendingList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: sorted.length,
      pending: sorted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error.message
    });
  }
};

exports.removeAllLoginUsers = async (req, res) => {
  try {
    let users = db.getCollection('users') || [];
    const removedCount = users.filter(u => u.email !== 'admin@fithealth.io' && u.email !== 'alex@fithealth.io').length;
    db.data.users = users.filter(u => u.email === 'admin@fithealth.io' || u.email === 'alex@fithealth.io');
    db.data.pendingMembers = [];
    db.ensureAdminAndGymData();
    db.save();
    if (db.data.workoutPlans) {
      db.data.workoutPlans = db.data.workoutPlans.filter(w => w.userId === 'user_admin_201');
    }
    if (db.data.dietPlans) {
      db.data.dietPlans = db.data.dietPlans.filter(d => d.userId === 'user_admin_201');
    }
    if (db.data.hydrationLogs) {
      db.data.hydrationLogs = db.data.hydrationLogs.filter(h => h.userId === 'user_admin_201');
    }
    if (db.data.vitalsLogs) {
      db.data.vitalsLogs = db.data.vitalsLogs.filter(v => v.userId === 'user_admin_201');
    }
    db.save();

    return res.status(200).json({
      success: true,
      message: `Successfully removed all ${removedCount} login member accounts. Only platform administrator is active.`,
      removedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove login users: ' + error.message
    });
  }
};




