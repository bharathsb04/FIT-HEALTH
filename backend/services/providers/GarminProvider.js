const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class GarminProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'garmin',
      name: 'Garmin Connect',
      type: 'cloud_oauth',
      brand: 'Garmin',
      icon: '🧭',
      color: '#007CC3',
      description: 'Endurance training, stress scores, heart rate variability, SpO2 & VO2 Max',
      supportedMetrics: [
        'steps', 'heart_rate', 'resting_heart_rate', 'sleep', 'weight',
        'active_calories', 'total_calories', 'distance', 'oxygen_saturation', 'vo2_max', 'exercise'
      ]
    });

    this.clientId = process.env.GARMIN_CLIENT_ID || '';
    this.clientSecret = process.env.GARMIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.GARMIN_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health/callback/garmin`;
  }

  async connect(memberId) {
    const isDemo = this.isDemoMode();
    const authUrl = isDemo
      ? `/api/health/callback/garmin?code=simulated_garmin_auth_code&state=${memberId}`
      : `https://connect.garmin.com/oauth-service/oauth/authorize?response_type=code&client_id=${encodeURIComponent(this.clientId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${memberId}`;

    return {
      success: true,
      provider: this.id,
      authUrl,
      type: this.type,
      mode: isDemo ? 'demo' : 'live',
      requiresOAuth: true,
      message: isDemo
        ? 'Garmin running in built-in Demo / Simulation mode (CLIENT_ID starts with demo_ or is empty).'
        : 'Redirect member to Garmin Connect authorization page'
    };
  }

  async handleCallback(memberId, code) {
    const nowIso = new Date().toISOString();
    const tokenPayload = {
      accessToken: `garmin_at_${Date.now()}`,
      refreshToken: `garmin_rt_${Date.now()}`
    };

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
    return { success: true, provider: this.id, message: 'Garmin Connect linked successfully.' };
  }

  async disconnect(memberId, options = {}) {
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) {
      db.update('providerConnections', conn.id, { status: 'disconnected', encryptedTokens: null });
    }
    if (options.deleteData) {
      const records = db.find('biometrics', b => b.memberId === memberId && b.provider === this.id);
      for (const r of records) db.delete('biometrics', r.id);
    }
    return { success: true, provider: this.id, message: 'Garmin Connect disconnected.' };
  }

  async sync(memberId) {
    const now = new Date();
    const nowIso = now.toISOString();

    const rawMetrics = [
      { id: `gm_step_${now.toISOString().split('T')[0]}`, type: 'steps', value: 11200, unit: 'steps', startTime: nowIso, endTime: nowIso },
      { id: `gm_hr_${Date.now()}`, type: 'heart_rate', value: 65, unit: 'bpm', startTime: nowIso, endTime: nowIso },
      { id: `gm_rhr_${Date.now()}`, type: 'resting_heart_rate', value: 52, unit: 'bpm', startTime: nowIso, endTime: nowIso },
      { id: `gm_sleep_${Date.now()}`, type: 'sleep', value: 8.2, unit: 'hours', startTime: new Date(now - 8.5 * 3600000).toISOString(), endTime: nowIso },
      { id: `gm_cal_${now.toISOString().split('T')[0]}`, type: 'active_calories', value: 780, unit: 'kcal', startTime: nowIso, endTime: nowIso },
      { id: `gm_totcal_${now.toISOString().split('T')[0]}`, type: 'total_calories', value: 2680, unit: 'kcal', startTime: nowIso, endTime: nowIso },
      { id: `gm_dist_${Date.now()}`, type: 'distance', value: 8900, unit: 'meters', startTime: nowIso, endTime: nowIso },
      { id: `gm_spo2_${Date.now()}`, type: 'oxygen_saturation', value: 99.0, unit: '%', startTime: nowIso, endTime: nowIso },
      { id: `gm_vo2_${Date.now()}`, type: 'vo2_max', value: 52.4, unit: 'ml/kg/min', startTime: nowIso, endTime: nowIso },
      { id: `gm_ex_${Date.now()}`, type: 'exercise', value: { title: 'Tempo Trail Run & Intervals', durationMinutes: 55 }, unit: 'workout', startTime: nowIso, endTime: nowIso }
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

module.exports = GarminProvider;

