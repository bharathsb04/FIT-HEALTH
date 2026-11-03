const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class WhoopProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'whoop',
      name: 'Whoop',
      type: 'cloud_oauth',
      brand: 'Whoop Inc.',
      icon: '⚡',
      color: '#FF2D55',
      description: '24/7 strain optimization, cardiovascular recovery percentage & sleep debt',
      supportedMetrics: [
        'heart_rate', 'resting_heart_rate', 'sleep', 'active_calories', 'exercise'
      ]
    });

    this.clientId = process.env.WHOOP_CLIENT_ID || '';
    this.clientSecret = process.env.WHOOP_CLIENT_SECRET || '';
    this.redirectUri = process.env.WHOOP_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health/callback/whoop`;
  }

  async connect(memberId) {
    const isDemo = this.isDemoMode();
    const authUrl = isDemo
      ? `/api/health/callback/whoop?code=simulated_whoop_auth_code&state=${memberId}`
      : `https://api.prod.whoop.com/oauth/oauth2/auth?response_type=code&client_id=${encodeURIComponent(this.clientId)}&state=${memberId}&scope=read:recovery%20read:cycles%20read:workout%20read:sleep&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    return {
      success: true,
      provider: this.id,
      authUrl,
      type: this.type,
      mode: isDemo ? 'demo' : 'live',
      requiresOAuth: true,
      message: isDemo
        ? 'Whoop running in built-in Demo / Simulation mode (CLIENT_ID starts with demo_ or is empty).'
        : 'Redirect member to Whoop authorization page'
    };
  }

  async handleCallback(memberId) {
    const nowIso = new Date().toISOString();
    const tokenPayload = { accessToken: `whoop_at_${Date.now()}` };

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
    return { success: true, provider: this.id, message: 'Whoop band linked successfully.' };
  }

  async disconnect(memberId, options = {}) {
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { status: 'disconnected', encryptedTokens: null });
    if (options.deleteData) {
      const records = db.find('biometrics', b => b.memberId === memberId && b.provider === this.id);
      for (const r of records) db.delete('biometrics', r.id);
    }
    return { success: true, provider: this.id, message: 'Whoop disconnected.' };
  }

  async sync(memberId) {
    const now = new Date();
    const nowIso = now.toISOString();

    const rawMetrics = [
      { id: `wp_rhr_${Date.now()}`, type: 'resting_heart_rate', value: 53, unit: 'bpm', startTime: nowIso, endTime: nowIso },
      { id: `wp_sleep_${Date.now()}`, type: 'sleep', value: 7.9, unit: 'hours', startTime: new Date(now - 8 * 3600000).toISOString(), endTime: nowIso },
      { id: `wp_cal_${now.toISOString().split('T')[0]}`, type: 'active_calories', value: 710, unit: 'kcal', startTime: nowIso, endTime: nowIso },
      { id: `wp_ex_${Date.now()}`, type: 'exercise', value: { title: 'High Strain Barbell Complex', durationMinutes: 60 }, unit: 'workout', startTime: nowIso, endTime: nowIso }
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

module.exports = WhoopProvider;

