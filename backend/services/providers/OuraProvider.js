const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class OuraProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'oura',
      name: 'Oura Ring',
      type: 'cloud_oauth',
      brand: 'Oura Health',
      icon: '💍',
      color: '#D4AF37',
      description: 'Sleep architecture, nocturnal resting heart rate, recovery readiness & skin temperature',
      supportedMetrics: [
        'sleep', 'resting_heart_rate', 'heart_rate', 'oxygen_saturation', 'active_calories'
      ]
    });

    this.clientId = process.env.OURA_CLIENT_ID || '';
    this.clientSecret = process.env.OURA_CLIENT_SECRET || '';
    this.redirectUri = process.env.OURA_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health/callback/oura`;
  }

  async connect(memberId) {
    const isDemo = this.isDemoMode();
    const authUrl = isDemo
      ? `/api/health/callback/oura?code=simulated_oura_auth_code&state=${memberId}`
      : `https://cloud.ouraring.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(this.clientId)}&state=${memberId}&scope=daily%20heartrate%20workout%20personal%20session&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    return {
      success: true,
      provider: this.id,
      authUrl,
      type: this.type,
      mode: isDemo ? 'demo' : 'live',
      requiresOAuth: true,
      message: isDemo
        ? 'Oura running in built-in Demo / Simulation mode (CLIENT_ID starts with demo_ or is empty).'
        : 'Redirect member to Oura Ring authorization page'
    };
  }

  async handleCallback(memberId) {
    const nowIso = new Date().toISOString();
    const tokenPayload = { accessToken: `oura_at_${Date.now()}` };

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
    return { success: true, provider: this.id, message: 'Oura Ring connected.' };
  }

  async disconnect(memberId, options = {}) {
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { status: 'disconnected', encryptedTokens: null });
    if (options.deleteData) {
      const records = db.find('biometrics', b => b.memberId === memberId && b.provider === this.id);
      for (const r of records) db.delete('biometrics', r.id);
    }
    return { success: true, provider: this.id, message: 'Oura Ring disconnected.' };
  }

  async sync(memberId) {
    const now = new Date();
    const nowIso = now.toISOString();

    const rawMetrics = [
      { id: `ou_sleep_${Date.now()}`, type: 'sleep', value: 8.35, unit: 'hours', startTime: new Date(now - 8.5 * 3600000).toISOString(), endTime: nowIso },
      { id: `ou_rhr_${Date.now()}`, type: 'resting_heart_rate', value: 54, unit: 'bpm', startTime: nowIso, endTime: nowIso },
      { id: `ou_spo2_${Date.now()}`, type: 'oxygen_saturation', value: 99.2, unit: '%', startTime: nowIso, endTime: nowIso }
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

module.exports = OuraProvider;

