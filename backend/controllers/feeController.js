const db = require('../data/dbStorage');
const { defaultGymFeePlans, defaultGymTerms } = require('../data/seedData');

// 1. GET /api/gyms/:id/fees (Public to logged-in users / members)
exports.getGymFees = async (req, res) => {
  try {
    const gymId = req.params.id || 'gym_1';
    const gyms = db.getCollection('gyms') || [];
    const allPlans = db.getCollection('gymFeePlans') || defaultGymFeePlans;
    const gymTermsMap = db.data.gymTerms || defaultGymTerms;

    const gym = gyms.find(g => g.id === gymId) || gyms[0] || {
      id: gymId,
      name: 'rsv gym and sports club',
      address: '442 Fitness Boulevard, Downtown Metro',
      phone: '+91 98765 43210',
      currency: 'INR'
    };

    // Filter plans for this gym (or fallback to gym_1 if newly switched)
    let gymPlans = allPlans.filter(p => p.gym_id === gym.id);
    if (gymPlans.length === 0) {
      gymPlans = allPlans.filter(p => p.gym_id === 'gym_1' || !p.gym_id);
    }

    // Sort by sort_order
    gymPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const terms = gymTermsMap[gym.id] || gymTermsMap['gym_1'] || defaultGymTerms['gym_1'];

    return res.status(200).json({
      success: true,
      gymId: gym.id,
      gymName: gym.name,
      gymAddress: gym.address,
      gymPhone: gym.phone,
      gymLogo: gym.image,
      feeStructureImage: gym.feeStructureImage || null,
      rateCardNote: gym.rateCardNote || 'Official fee schedule and rate document issued by gym management.',
      currency: 'INR',
      feePlans: gymPlans,
      publishedPlans: gymPlans.filter(p => p.is_active !== false),
      gymTerms: terms,
      is_published: terms?.is_published !== false,
      last_published_at: terms?.last_published_at || new Date().toISOString(),
      version: terms?.version || 'v2.4'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve gym fee structure',
      error: error.message
    });
  }
};

// 2. GET /api/gyms/:id/fees/pdf (Digital PDF / Branded Rate Card Export)
exports.getGymFeesPdf = async (req, res) => {
  try {
    const gymId = req.params.id || 'gym_1';
    const gyms = db.getCollection('gyms') || [];
    const allPlans = db.getCollection('gymFeePlans') || defaultGymFeePlans;
    const gymTermsMap = db.data.gymTerms || defaultGymTerms;

    const gym = gyms.find(g => g.id === gymId) || gyms[0];
    let gymPlans = allPlans.filter(p => (p.gym_id === gym.id || p.gym_id === 'gym_1') && p.is_active !== false);
    gymPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const terms = gymTermsMap[gym.id] || gymTermsMap['gym_1'] || defaultGymTerms['gym_1'];

    const pdfData = {
      title: `Official Membership Fee Schedule - ${gym.name}`,
      gym: {
        id: gym.id,
        name: gym.name,
        address: gym.address,
        phone: gym.phone,
        hours: gym.openingHours || '05:00 AM - 11:30 PM',
        email: 'contact@fithealth.io',
        director: 'Gym Administrator'
      },
      currency: 'INR (₹)',
      generatedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      version: terms?.version || 'v2.4',
      plans: gymPlans.map(p => ({
        id: p.id,
        name: p.name,
        duration: p.billingDuration || `${p.duration_days} Days`,
        priceFormatted: `₹${Number(p.price).toLocaleString('en-IN')}`,
        admissionFeeFormatted: p.admission_fee ? `₹${Number(p.admission_fee).toLocaleString('en-IN')}` : 'Nil',
        discount: p.discount || 'Standard Rate',
        gst: p.tax_percent ? `${p.tax_percent}% Included` : 'Included',
        features: p.features || []
      })),
      terms: {
        refund: terms?.refund_policy || 'Standard 7-day refund policy applies.',
        freeze: terms?.freeze_policy || '30-day freeze allowance on quarterly/annual tiers.',
        late_fee: terms?.late_fee_policy || '5-day grace period on expiration.',
        rules: terms?.rules || 'Towel mandatory on workout floors.'
      },
      digitalVerification: {
        qrCode: `FITHEALTH:RATES:${gym.id}:${terms?.version || 'v2.4'}`,
        authorizedBy: 'Fit Health Central Directory & Gym Admin'
      }
    };

    return res.status(200).json({
      success: true,
      pdfData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF rate card payload',
      error: error.message
    });
  }
};

// 3. GET /api/gyms/receipt/:id/pdf (Digital Payment Receipt / Tax Invoice)
exports.getMemberReceiptPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const txns = db.getCollection('membershipTransactions') || [];
    const targetTxn = txns.find(t => t.id === id || t.receiptNumber === id);
    if (!targetTxn) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    return res.status(200).json({
      success: true,
      receipt: targetTxn
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve receipt',
      error: error.message
    });
  }
};

// 4. POST /api/admin/fees (Create Fee Plan - Admin Only)
exports.createFeePlan = async (req, res) => {
  try {
    const {
      gym_id = 'gym_1',
      name,
      duration_days = 30,
      billingDuration,
      price,
      admission_fee = 0,
      discount = '',
      tax_percent = 18,
      features = [],
      is_active = true,
      is_popular = false,
      badge = ''
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Plan Name and Price are required.' });
    }

    const allPlans = db.getCollection('gymFeePlans') || [];
    const gymPlans = allPlans.filter(p => p.gym_id === gym_id);

    const newPlan = {
      id: `plan_${Date.now()}_${gym_id}`,
      gym_id,
      name: name.trim(),
      duration_days: Number(duration_days) || 30,
      billingDuration: billingDuration || `${Math.round((Number(duration_days) || 30) / 30)} Month(s)`,
      price: Number(price) || 0,
      admission_fee: Number(admission_fee) || 0,
      discount: discount || '',
      tax_percent: Number(tax_percent) || 18,
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : ['Full Gym Access']),
      is_active: Boolean(is_active),
      is_popular: Boolean(is_popular),
      badge: badge || (is_popular ? 'Most Popular' : ''),
      sort_order: gymPlans.length + 1,
      updated_at: new Date().toISOString()
    };

    db.create('gymFeePlans', newPlan);

    return res.status(201).json({
      success: true,
      message: `Fee plan "${newPlan.name}" created successfully in ₹ INR!`,
      plan: newPlan
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create fee plan',
      error: error.message
    });
  }
};

// 5. PUT /api/admin/fees/:id (Update Fee Plan - Admin Only)
exports.updateFeePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.findOne('gymFeePlans', p => p.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Fee plan not found.' });
    }

    const updatedData = {
      ...(updates.name ? { name: updates.name.trim() } : {}),
      ...(updates.duration_days !== undefined ? { duration_days: Number(updates.duration_days) } : {}),
      ...(updates.billingDuration ? { billingDuration: updates.billingDuration } : {}),
      ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
      ...(updates.admission_fee !== undefined ? { admission_fee: Number(updates.admission_fee) } : {}),
      ...(updates.discount !== undefined ? { discount: updates.discount } : {}),
      ...(updates.tax_percent !== undefined ? { tax_percent: Number(updates.tax_percent) } : {}),
      ...(updates.features !== undefined ? {
        features: Array.isArray(updates.features) ? updates.features : (typeof updates.features === 'string' ? updates.features.split(',').map(s => s.trim()).filter(Boolean) : [])
      } : {}),
      ...(updates.is_active !== undefined ? { is_active: Boolean(updates.is_active) } : {}),
      ...(updates.is_popular !== undefined ? { is_popular: Boolean(updates.is_popular) } : {}),
      ...(updates.badge !== undefined ? { badge: updates.badge } : {}),
      ...(updates.sort_order !== undefined ? { sort_order: Number(updates.sort_order) } : {}),
      updated_at: new Date().toISOString()
    };

    const updated = db.update('gymFeePlans', p => p.id === id, updatedData);

    return res.status(200).json({
      success: true,
      message: `Fee plan "${updated.name}" updated successfully!`,
      plan: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update fee plan',
      error: error.message
    });
  }
};

// 6. DELETE /api/admin/fees/:id (Delete Fee Plan - Admin Only)
exports.deleteFeePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plans = db.getCollection('gymFeePlans') || [];
    const plan = plans.find(p => p.id === id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Fee plan not found.' });
    }

    db.data.gymFeePlans = plans.filter(p => p.id !== id);
    db.save();

    return res.status(200).json({
      success: true,
      message: `Fee plan "${plan.name}" deleted successfully!`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete fee plan',
      error: error.message
    });
  }
};

// 7. PUT /api/admin/fees/reorder (Reorder Plans - Admin Only)
exports.reorderFeePlans = async (req, res) => {
  try {
    const { orderList } = req.body; // array of { id, sort_order }
    if (!orderList || !Array.isArray(orderList)) {
      return res.status(400).json({ success: false, message: 'orderList array is required.' });
    }

    const orderMap = {};
    orderList.forEach(item => {
      orderMap[item.id] = item.sort_order;
    });

    db.data.gymFeePlans = (db.data.gymFeePlans || []).map(p => {
      if (orderMap[p.id] !== undefined) {
        return {
          ...p,
          sort_order: orderMap[p.id],
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });
    db.save();

    return res.status(200).json({
      success: true,
      message: 'Fee plans reordered successfully!',
      feePlans: db.data.gymFeePlans
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reorder fee plans',
      error: error.message
    });
  }
};

// 8. PUT /api/admin/gyms/:id/terms (Update Gym Terms - Admin Only)
exports.updateGymTerms = async (req, res) => {
  try {
    const gymId = req.params.id || 'gym_1';
    const { refund_policy, freeze_policy, late_fee_policy, rules, version_note } = req.body;

    if (!db.data.gymTerms) {
      db.data.gymTerms = JSON.parse(JSON.stringify(defaultGymTerms));
    }

    const currentTerms = db.data.gymTerms[gymId] || db.data.gymTerms['gym_1'] || defaultGymTerms['gym_1'];
    const nowIso = new Date().toISOString();

    const currentVerNum = parseFloat((currentTerms.version || 'v2.4').replace('v', '')) || 2.4;
    const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;

    const newHistoryEntry = {
      version: nextVer,
      timestamp: nowIso,
      updated_by: req.user?.name || 'Gym Administrator',
      note: version_note || 'Updated gym terms, refund & freeze policies.',
      plan_count: (db.data.gymFeePlans || []).filter(p => p.gym_id === gymId && p.is_active !== false).length
    };

    const updatedTerms = {
      ...currentTerms,
      gym_id: gymId,
      refund_policy: refund_policy !== undefined ? refund_policy : currentTerms.refund_policy,
      freeze_policy: freeze_policy !== undefined ? freeze_policy : currentTerms.freeze_policy,
      late_fee_policy: late_fee_policy !== undefined ? late_fee_policy : currentTerms.late_fee_policy,
      rules: rules !== undefined ? rules : currentTerms.rules,
      version: nextVer,
      version_history: [newHistoryEntry, ...(currentTerms.version_history || [])],
      updated_at: nowIso
    };

    db.data.gymTerms[gymId] = updatedTerms;
    db.save();

    return res.status(200).json({
      success: true,
      message: 'Gym terms and policies updated successfully!',
      gymTerms: updatedTerms
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update gym terms',
      error: error.message
    });
  }
};

// 9. POST /api/admin/fees/publish (Publish Fee Schedule - Admin Only)
exports.publishFeeStructure = async (req, res) => {
  try {
    const { gym_id = 'gym_1', publish = true, version_note } = req.body;

    if (!db.data.gymTerms) {
      db.data.gymTerms = JSON.parse(JSON.stringify(defaultGymTerms));
    }

    const currentTerms = db.data.gymTerms[gym_id] || db.data.gymTerms['gym_1'] || defaultGymTerms['gym_1'];
    const nowIso = new Date().toISOString();

    const currentVerNum = parseFloat((currentTerms.version || 'v2.4').replace('v', '')) || 2.4;
    const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;

    const newHistoryEntry = {
      version: nextVer,
      timestamp: nowIso,
      updated_by: req.user?.name || 'Gym Administrator',
      note: version_note || (publish ? 'Published updated fee plans live to members.' : 'Unpublished fee schedule.'),
      plan_count: (db.data.gymFeePlans || []).filter(p => p.gym_id === gym_id && p.is_active !== false).length
    };

    const updatedTerms = {
      ...currentTerms,
      gym_id,
      is_published: Boolean(publish),
      last_published_at: nowIso,
      version: nextVer,
      version_history: [newHistoryEntry, ...(currentTerms.version_history || [])],
      updated_at: nowIso
    };

    db.data.gymTerms[gym_id] = updatedTerms;
    db.save();

    return res.status(200).json({
      success: true,
      message: publish
        ? `🎉 Fee structure published live (${nextVer})! All members now see the updated plans.`
        : 'Fee structure unpublished.',
      gymTerms: updatedTerms,
      version: nextVer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to publish fee structure',
      error: error.message
    });
  }
};
