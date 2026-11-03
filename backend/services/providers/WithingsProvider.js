const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class WithingsProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'withings',
      name: 'Withings Health Mate',
      type: 'cloud_oauth',
      brand: 'Withings',
      icon: '⚖️',
      color: '#00A3A6',
      description: 'Smart body composition scales, cellular BPM monitors & vascular health',
      supportedMetrics: [
        'weight', 'body_fat', 'bmi', 'blood_pressure', 'heart_rate', 'sleep', 'steps'
      ]
    });

    this.clientId = process.env.WITHINGS_CLIENT_ID || '';
    this.clientSecret = process.env.WITHINGS_CLIENT_SECRET || '';
    this.redirectUri = process.env.WITHINGS_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health/callback/withings`;
  }

  async connect(memberId) {
    const isDemo = this.isDemoMode();
    const authUrl = isDemo
      ? `/api/health/callback/withings?code=simulated_withings_auth_code&state=${memberId}`
      : `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${encodeURIComponent(this.clientId)}&state=${memberId}&scope=user.info,user.metrics,user.activity&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    return {
      success: true,
      provider: this.id,
      authUrl,
      type: this.type,
      mode: isDemo ? 'demo' : 'live',
      requiresOAuth: true,
      message: isDemo
        ? 'Withings running in built-in Demo / Simulation mode (CLIENT_ID starts with demo_ or is empty).'
        : 'Redirect member to Withings authorization page'
    };
  }

  async handleCallback(memberId) {
    const nowIso = new Date().toISOString();
    const tokenPayload = { accessToken: `withings_at_${Date.now()}` };

    let conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) {
      db.update('providerConnections', conn.id, {
        status: 'connected',
        encryptedTokens: encryptValue(tokenPayload),
        lastSyncAt: nowIso
      });
    } else {
      const existingPrimary = db.findOne('providerConnections', c => c.memberId === memberId && c.isPrimary);
      db.create('providerConnections', {
        memberId,
        provider: this.id,
        status: 'connected',
        encryptedTokens: encryptValue(tokenPayload),
        isPrimary: !existingPrimary,
        connectedAt: nowIso,
        lastSyncAt: nowIso
      });
    }

    await this.sync(memberId);
    return { success: true, provider: this.id, message: 'Withings Health Mate connected.' };
  }

  async disconnect(memberId, options = {}) {
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { status: 'disconnected', encryptedTokens: null });
    if (options.deleteData) {
      const records = db.find('biometrics', b => b.memberId === memberId && b.provider === this.id);
      for (const r of records) db.delete('biometrics', r.id);
    }
    return { success: true, provider: this.id, message: 'Withings disconnected.' };
  }

  async sync(memberId) {
    const now = new Date();
    const nowIso = now.toISOString();

    const rawMetrics = [
      { id: `wi_wt_${Date.now()}`, type: 'weight', value: 75.6, unit: 'kg', startTime: nowIso, endTime: nowIso },
      { id: `wi_fat_${Date.now()}`, type: 'body_fat', value: 14.3, unit: '%', startTime: nowIso, endTime: nowIso },
      { id: `wi_bmi_${Date.now()}`, type: 'bmi', value: 23.9, unit: 'kg/m²', startTime: nowIso, endTime: nowIso },
      { id: `wi_bp_${Date.now()}`, type: 'blood_pressure', value: { systolic: 117, diastolic: 75 }, unit: 'mmHg', startTime: nowIso, endTime: nowIso },
      { id: `wi_hr_${Date.now()}`, type: 'heart_rate', value: 66, unit: 'bpm', startTime: nowIso, endTime: nowIso }
    ];

    let upsertCount = 0;
    for (const raw of rawMetrics) {
      const normalized = this.normalize(raw, memberId);
      const existing = db.findOne('biometrics', b => b.memberId === memberId && b.provider === this.id && b.sourceRecordId === normalized.sourceRecordId);
      const encryptedVal = encryptValue(normalized.value);

      if (existing) {
        db.update('biometrics', existing.id, {
          valueEncrypted: encryptedVal,
          unit: normalized.unit,
          startTime: normalized.startTime,
          endTime: normalized.endTime,
          syncedAt: nowIso
        });
      } else {
        db.create('biometrics', {
          memberId,
          type: normalized.type,
          valueEncrypted: encryptedVal,
          unit: normalized.unit,
          startTime: normalized.startTime,
          endTime: normalized.endTime,
          provider: this.id,
          sourceRecordId: normalized.sourceRecordId,
          syncedAt: nowIso
        });
      }
      upsertCount++;
    }

    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { lastSyncAt: nowIso });

    return { success: true, count: upsertCount, syncedAt: nowIso };
  }

  normalize(rawRecord, memberId) {
    return {
      memberId,
      type: rawRecord.type,
      value: rawRecord.value,
      unit: rawRecord.unit || '',
      startTime: rawRecord.startTime || new Date().toISOString(),
      endTime: rawRecord.endTime || rawRecord.startTime || new Date().toISOString(),
      provider: this.id,
      sourceRecordId: String(rawRecord.id || rawRecord.sourceRecordId),
      syncedAt: new Date().toISOString()
    };
  }
}

module.exports = WithingsProvider;

