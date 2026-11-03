const db = require('../data/dbStorage');
const { encryptValue, decryptValue } = require('../services/cryptoService');
const providerRegistry = require('../services/providers/ProviderRegistry');

const VALID_TYPES = new Set([
  'steps',
  'heart_rate',
  'resting_heart_rate',
  'weight',
  'height',
  'body_fat',
  'bmi',
  'sleep',
  'active_calories',
  'total_calories',
  'distance',
  'oxygen_saturation',
  'blood_pressure',
  'exercise',
  'vo2_max'
]);

/**
 * Validates and sanitizes a single biometric record payload.
 */
function sanitizeRecord(rec, memberId, fallbackProvider = 'samsung-health') {
  if (!rec || typeof rec !== 'object') return null;

  const rawType = String(rec.type || '').trim().toLowerCase();
  if (!VALID_TYPES.has(rawType)) return null;

  const sourceRecordId = String(rec.sourceRecordId || rec.recordId || rec.id || '').trim();
  if (!sourceRecordId) return null;

  const provider = String(rec.provider || fallbackProvider || 'samsung-health').trim().toLowerCase();

  // Validate value
  let cleanValue = rec.value;
  if (rawType === 'blood_pressure') {
    if (typeof cleanValue !== 'object' || cleanValue === null) return null;
    const sys = Number(cleanValue.systolic);
    const dia = Number(cleanValue.diastolic);
    if (isNaN(sys) || isNaN(dia) || sys < 40 || sys > 260 || dia < 30 || dia > 180) {
      return null;
    }
    cleanValue = { systolic: Math.round(sys), diastolic: Math.round(dia) };
  } else if (rawType === 'exercise') {
    if (typeof cleanValue !== 'object' || cleanValue === null) {
      cleanValue = { title: String(cleanValue || 'Workout'), durationMinutes: 30 };
    }
  } else {
    const num = Number(cleanValue);
    if (isNaN(num) || num < 0) return null;
    cleanValue = Number(num.toFixed(2));
  }

  // Validate timestamps
  const startTime = rec.startTime ? new Date(rec.startTime).toISOString() : new Date().toISOString();
  const endTime = rec.endTime ? new Date(rec.endTime).toISOString() : startTime;

  return {
    memberId,
    type: rawType,
    value: cleanValue,
    unit: String(rec.unit || '').trim().slice(0, 20),
    startTime,
    endTime,
    provider,
    sourceRecordId,
    sourceApp: String(rec.sourceApp || provider).trim().slice(0, 100)
  };
}

/**
 * Helper to retrieve provider visual metadata
 */
function getProviderMeta(providerId) {
  const p = providerRegistry.getProvider(providerId);
  return {
    provider: providerId,
    providerName: p?.name || providerId,
    providerIcon: p?.icon || '📱',
    providerColor: p?.color || '#10b981'
  };
}

/**
 * POST /api/biometrics/sync
 * Bulk sync endpoint for Android, iOS companion apps and cloud sync jobs
 */
exports.syncBiometrics = async (req, res) => {
  try {
    const memberId = req.userId;
    const { records, device, changeToken, provider = 'samsung-health' } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No biometric records provided for synchronization.'
      });
    }

    const targetProvider = String(provider).toLowerCase().trim();
    const batch = records.slice(0, 500);
    const nowIso = new Date().toISOString();
    let upsertCount = 0;

    for (const raw of batch) {
      const sanitized = sanitizeRecord(raw, memberId, targetProvider);
      if (!sanitized) continue;

      // Upsert by (memberId, provider, sourceRecordId) to prevent duplicates
      const existing = db.findOne('biometrics', b =>
        b.memberId === memberId &&
        (b.provider || 'samsung-health') === sanitized.provider &&
        (b.sourceRecordId || b.recordId) === sanitized.sourceRecordId
      );

      const encryptedVal = encryptValue(sanitized.value);

      if (existing) {
        db.update('biometrics', existing.id, {
          valueEncrypted: encryptedVal,
          unit: sanitized.unit,
          startTime: sanitized.startTime,
          endTime: sanitized.endTime,
          sourceApp: sanitized.sourceApp,
          provider: sanitized.provider,
          sourceRecordId: sanitized.sourceRecordId,
          syncedAt: nowIso
        });
      } else {
        db.create('biometrics', {
          memberId,
          type: sanitized.type,
          valueEncrypted: encryptedVal,
          unit: sanitized.unit,
          startTime: sanitized.startTime,
          endTime: sanitized.endTime,
          provider: sanitized.provider,
          sourceRecordId: sanitized.sourceRecordId,
          sourceApp: sanitized.sourceApp,
          syncedAt: nowIso
        });
      }
      upsertCount++;
    }

    // Update connection status in providerConnections table
    let conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === targetProvider);
    if (conn) {
      db.update('providerConnections', conn.id, {
        status: 'connected',
        lastSyncAt: nowIso,
        deviceModel: device || conn.deviceModel || 'Mobile Companion'
      });
    } else {
      const existingPrimary = db.findOne('providerConnections', c => c.memberId === memberId && c.isPrimary);
      db.create('providerConnections', {
        memberId,
        provider: targetProvider,
        status: 'connected',
        isPrimary: !existingPrimary,
        connectedAt: nowIso,
        lastSyncAt: nowIso,
        deviceModel: device || 'Mobile Companion'
      });
    }

    // Legacy sync metadata update
    const existingConsent = db.findOne('biometricsConsent', c => c.memberId === memberId);
    if (existingConsent) {
      db.update('biometricsConsent', existingConsent.id, {
        lastSyncTimestamp: nowIso,
        syncSource: targetProvider,
        deviceModel: device || 'Mobile Companion',
        ...(changeToken ? { latestChangeToken: changeToken } : {})
      });
    } else {
      db.create('biometricsConsent', {
        memberId,
        adminShareConsent: false,
        lastSyncTimestamp: nowIso,
        syncSource: targetProvider,
        deviceModel: device || 'Mobile Companion',
        ...(changeToken ? { latestChangeToken: changeToken } : {})
      });
    }

    console.log(`[Biometrics Sync] Synced ${upsertCount} records from ${targetProvider} for member ${memberId.slice(0, 8)}...`);

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized ${upsertCount} health metrics from ${targetProvider}.`,
      syncedCount: upsertCount,
      provider: targetProvider,
      lastSyncTimestamp: nowIso
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process biometric synchronization: ' + error.message
    });
  }
};

/**
 * GET /api/biometrics/latest
 * Snapshot of the member's most recent live biometrics across all connected apps,
 * prioritizing the primary provider to resolve conflicts without double-counting.
 */
exports.getLatestBiometrics = async (req, res) => {
  try {
    const memberId = req.userId;
    const consent = db.findOne('biometricsConsent', c => c.memberId === memberId);
    const records = db.find('biometrics', b => b.memberId === memberId) || [];
    const connections = db.find('providerConnections', c => c.memberId === memberId && c.status === 'connected') || [];

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        hasData: false,
        isCompanionConnected: connections.length > 0,
        connectedProvidersCount: connections.length,
        primaryProvider: providerRegistry.getPrimaryProvider(memberId),
        lastSyncTimestamp: null,
        metrics: null,
        message: 'No connected health app biometrics recorded yet.'
      });
    }

    const primaryProviderId = providerRegistry.getPrimaryProvider(memberId);

    // Group records by type, scoring by primary provider match and timestamp
    const metricMap = {};
    for (const rec of records) {
      const recType = rec.type;
      const recProvider = rec.provider || 'samsung-health';
      const isPrimary = recProvider === primaryProviderId;
      const recTime = new Date(rec.startTime || rec.syncedAt).getTime();

      const current = metricMap[recType];
      if (!current) {
        metricMap[recType] = { record: rec, time: recTime, isPrimary };
      } else {
        // Preference rule: if new record is from primary provider and current was not, replace
        if (isPrimary && !current.isPrimary) {
          metricMap[recType] = { record: rec, time: recTime, isPrimary };
        } else if (isPrimary === current.isPrimary && recTime > current.time) {
          // If both have equal primary status, pick the newest
          metricMap[recType] = { record: rec, time: recTime, isPrimary };
        }
      }
    }

    // Build decrypted metrics object with source provider metadata
    const metrics = {};
    for (const [type, data] of Object.entries(metricMap)) {
      const rec = data.record;
      const decryptedVal = decryptValue(rec.valueEncrypted);
      const meta = getProviderMeta(rec.provider || 'samsung-health');

      metrics[type] = {
        value: decryptedVal,
        unit: rec.unit,
        startTime: rec.startTime,
        endTime: rec.endTime,
        provider: meta.provider,
        providerName: meta.providerName,
        providerIcon: meta.providerIcon,
        providerColor: meta.providerColor,
        sourceApp: rec.sourceApp || meta.providerName,
        sourceRecordId: rec.sourceRecordId || rec.recordId,
        syncedAt: rec.syncedAt
      };
    }

    // Today's Date String
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute today's step count sum (avoiding double counting between duplicate providers)
    // Filter today step records preferentially from primary provider, or fallback to all
    const todayStepsPrimary = records.filter(r => r.type === 'steps' && (r.startTime || '').startsWith(todayStr) && (r.provider || 'samsung-health') === primaryProviderId);
    const todayStepsList = todayStepsPrimary.length > 0
      ? todayStepsPrimary
      : records.filter(r => r.type === 'steps' && (r.startTime || '').startsWith(todayStr));

    const todayTotalSteps = todayStepsList.reduce((acc, r) => {
      const v = Number(decryptValue(r.valueEncrypted));
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);

    // Compute today's active calories sum
    const todayCalPrimary = records.filter(r => r.type === 'active_calories' && (r.startTime || '').startsWith(todayStr) && (r.provider || 'samsung-health') === primaryProviderId);
    const todayCalList = todayCalPrimary.length > 0
      ? todayCalPrimary
      : records.filter(r => r.type === 'active_calories' && (r.startTime || '').startsWith(todayStr));

    const todayActiveKcal = todayCalList.reduce((acc, r) => {
      const v = Number(decryptValue(r.valueEncrypted));
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);

    // Compute today's distance sum
    const todayDistPrimary = records.filter(r => r.type === 'distance' && (r.startTime || '').startsWith(todayStr) && (r.provider || 'samsung-health') === primaryProviderId);
    const todayDistList = todayDistPrimary.length > 0
      ? todayDistPrimary
      : records.filter(r => r.type === 'distance' && (r.startTime || '').startsWith(todayStr));

    const todayDistanceMeters = todayDistList.reduce((acc, r) => {
      const v = Number(decryptValue(r.valueEncrypted));
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);

    if (todayTotalSteps > 0 && metrics.steps) {
      metrics.steps.todayTotal = todayTotalSteps;
    }

    // Most recent overall sync time
    const latestRec = records[records.length - 1];
    const overallLastSync = connections.find(c => c.provider === primaryProviderId)?.lastSyncAt ||
      consent?.lastSyncTimestamp ||
      latestRec?.syncedAt;

    const primaryMeta = getProviderMeta(primaryProviderId);

    return res.status(200).json({
      success: true,
      hasData: true,
      isCompanionConnected: true,
      connectedProvidersCount: connections.length,
      primaryProvider: primaryProviderId,
      primaryProviderName: primaryMeta.providerName,
      primaryProviderIcon: primaryMeta.providerIcon,
      lastSyncTimestamp: overallLastSync,
      adminShareConsent: Boolean(consent?.adminShareConsent),
      todaySummary: {
        steps: todayTotalSteps || (metrics.steps ? metrics.steps.value : 0),
        activeCalories: Math.round(todayActiveKcal) || (metrics.active_calories ? metrics.active_calories.value : 0),
        distanceMeters: Math.round(todayDistanceMeters) || (metrics.distance ? metrics.distance.value : 0)
      },
      metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest biometrics: ' + error.message
    });
  }
};

/**
 * GET /api/biometrics/history
 * History series by type, date range & optional provider filter
 */
exports.getBiometricsHistory = async (req, res) => {
  try {
    const memberId = req.userId;
    const { type, from, to, provider, limit = 100 } = req.query;

    let records = db.find('biometrics', b => b.memberId === memberId) || [];

    if (type) {
      records = records.filter(b => b.type === type.toLowerCase().trim());
    }

    if (provider) {
      records = records.filter(b => (b.provider || 'samsung-health') === provider.toLowerCase().trim());
    }

    if (from) {
      const fromTime = new Date(from).getTime();
      records = records.filter(b => new Date(b.startTime || b.syncedAt).getTime() >= fromTime);
    }

    if (to) {
      const toTime = new Date(to).getTime();
      records = records.filter(b => new Date(b.startTime || b.syncedAt).getTime() <= toTime);
    }

    records.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const parsedLimit = Math.min(Number(limit) || 100, 500);
    const sliced = records.slice(-parsedLimit);

    const series = sliced.map(rec => {
      const meta = getProviderMeta(rec.provider || 'samsung-health');
      return {
        id: rec.id,
        sourceRecordId: rec.sourceRecordId || rec.recordId,
        type: rec.type,
        value: decryptValue(rec.valueEncrypted),
        unit: rec.unit,
        startTime: rec.startTime,
        endTime: rec.endTime,
        provider: meta.provider,
        providerName: meta.providerName,
        providerIcon: meta.providerIcon,
        syncedAt: rec.syncedAt
      };
    });

    return res.status(200).json({
      success: true,
      count: series.length,
      series
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve biometrics history: ' + error.message
    });
  }
};

/**
 * GET /api/biometrics/summary
 * Daily aggregated biometrics for trend lines & bar charts across connected health apps
 */
exports.getBiometricsSummary = async (req, res) => {
  try {
    const memberId = req.userId;
    const days = Math.min(Number(req.query.days) || 7, 30);
    const records = db.find('biometrics', b => b.memberId === memberId) || [];
    const primaryProviderId = providerRegistry.getPrimaryProvider(memberId);

    const dayBuckets = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dayBuckets[dateKey] = {
        date: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        steps: 0,
        activeCalories: 0,
        heartRateAvg: null,
        heartRateSamples: [],
        restingHeartRate: null,
        sleepHours: null,
        weight: null,
        bloodPressure: null,
        oxygenSaturation: null,
        vo2Max: null
      };
    }

    for (const rec of records) {
      const recDate = (rec.startTime || '').split('T')[0];
      if (!dayBuckets[recDate]) continue;

      const bucket = dayBuckets[recDate];
      const val = decryptValue(rec.valueEncrypted);

      switch (rec.type) {
        case 'steps':
          bucket.steps = Math.max(bucket.steps, Number(val) || 0);
          break;
        case 'active_calories':
          bucket.activeCalories = Math.max(bucket.activeCalories, Number(val) || 0);
          break;
        case 'heart_rate':
          if (typeof val === 'number') bucket.heartRateSamples.push(val);
          break;
        case 'resting_heart_rate':
          bucket.restingHeartRate = Number(val);
          break;
        case 'sleep':
          bucket.sleepHours = Number(val);
          break;
        case 'weight':
          bucket.weight = Number(val);
          break;
        case 'blood_pressure':
          bucket.bloodPressure = val;
          break;
        case 'oxygen_saturation':
          bucket.oxygenSaturation = Number(val);
          break;
        case 'vo2_max':
          bucket.vo2Max = Number(val);
          break;
      }
    }

    const dailySummaries = Object.values(dayBuckets).map(b => {
      const hrAvg = b.heartRateSamples.length > 0
        ? Math.round(b.heartRateSamples.reduce((a, c) => a + c, 0) / b.heartRateSamples.length)
        : null;

      const { heartRateSamples, ...cleanBucket } = b;
      return {
        ...cleanBucket,
        heartRateAvg: hrAvg
      };
    });

    return res.status(200).json({
      success: true,
      days,
      primaryProvider: primaryProviderId,
      dailySummaries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate biometrics summary: ' + error.message
    });
  }
};

/**
 * GET /api/biometrics/consent
 */
exports.getConsent = async (req, res) => {
  try {
    const memberId = req.userId;
    const consent = db.findOne('biometricsConsent', c => c.memberId === memberId);
    return res.status(200).json({
      success: true,
      adminShareConsent: Boolean(consent?.adminShareConsent),
      lastSyncTimestamp: consent?.lastSyncTimestamp || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/biometrics/consent
 */
exports.updateConsent = async (req, res) => {
  try {
    const memberId = req.userId;
    const { adminShareConsent } = req.body;

    let consent = db.findOne('biometricsConsent', c => c.memberId === memberId);
    if (consent) {
      consent = db.update('biometricsConsent', consent.id, {
        adminShareConsent: Boolean(adminShareConsent),
        consentUpdatedAt: new Date().toISOString()
      });
    } else {
      consent = db.create('biometricsConsent', {
        memberId,
        adminShareConsent: Boolean(adminShareConsent),
        consentUpdatedAt: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: Boolean(adminShareConsent)
        ? 'Consent granted: Gym administrators can now view your biometrics for fitness coaching.'
        : 'Consent revoked: Gym administrators cannot view your biometrics.',
      adminShareConsent: Boolean(adminShareConsent)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/biometrics
 * Deletes all biometric records for the member
 */
exports.deleteBiometrics = async (req, res) => {
  try {
    const memberId = req.userId;
    const records = db.find('biometrics', b => b.memberId === memberId) || [];

    for (const r of records) {
      db.delete('biometrics', r.id);
    }

    const conns = db.find('providerConnections', c => c.memberId === memberId) || [];
    for (const c of conns) {
      db.update('providerConnections', c.id, { status: 'disconnected', encryptedTokens: null });
    }

    return res.status(200).json({
      success: true,
      message: `All synced biometric records (${records.length} items) have been permanently erased.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/biometrics/member/:memberId/latest
 * Admin-only member biometrics viewer with strict consent check
 */
exports.getMemberBiometricsForAdmin = async (req, res) => {
  try {
    const targetMemberId = req.params.memberId;
    if (!targetMemberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }

    const consent = db.findOne('biometricsConsent', c => c.memberId === targetMemberId);
    if (!consent || !consent.adminShareConsent) {
      return res.status(403).json({
        success: false,
        consented: false,
        message: 'Member has not consented to sharing biometric data with gym administrators.'
      });
    }

    const records = db.find('biometrics', b => b.memberId === targetMemberId) || [];
    const metricMap = {};
    for (const rec of records) {
      const recTime = new Date(rec.startTime || rec.syncedAt).getTime();
      const current = metricMap[rec.type];
      if (!current || recTime > current.time) {
        metricMap[rec.type] = { record: rec, time: recTime };
      }
    }

    const metrics = {};
    for (const [type, data] of Object.entries(metricMap)) {
      const rec = data.record;
      const meta = getProviderMeta(rec.provider || 'samsung-health');
      metrics[type] = {
        value: decryptValue(rec.valueEncrypted),
        unit: rec.unit,
        startTime: rec.startTime,
        endTime: rec.endTime,
        provider: meta.provider,
        providerName: meta.providerName,
        providerIcon: meta.providerIcon,
        syncedAt: rec.syncedAt
      };
    }

    return res.status(200).json({
      success: true,
      consented: true,
      lastSyncTimestamp: consent.lastSyncTimestamp,
      metrics
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
