const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class SamsungHealthProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'samsung-health',
      name: 'Samsung Health',
      type: 'mobile_companion',
      brand: 'Samsung',
      icon: '🏃',
      color: '#1428A0',
      description: 'Galaxy Watch, Galaxy Fit & Galaxy Ring health telemetry via Android Health Connect',
      supportedMetrics: [
        'steps', 'heart_rate', 'resting_heart_rate', 'sleep', 'weight',
        'height', 'body_fat', 'active_calories', 'total_calories', 'distance', 'oxygen_saturation', 'blood_pressure', 'exercise'
      ]
    });
  }

  async connect(memberId) {
    return {
      success: true,
      provider: this.id,
      type: this.type,
      requiresOAuth: false,
      title: 'Connect Samsung Health',
      steps: [
        {
          step: 1,
          title: 'Enable Health Connect in Samsung Health',
          instruction: 'Open the Samsung Health app on your Android device → Tap Settings (⋮) → Connected services / Health Connect, and toggle ON data sharing.'
        },
        {
          step: 2,
          title: 'Install the Fit Health Android Companion App',
          instruction: 'Install the Fit Health Companion app on your Android phone from the android-companion build or download directory.'
        },
        {
          step: 3,
          title: 'Sign In to Your Fit Health Account',
          instruction: 'Open the companion app and sign in with your Fit Health member username and password so telemetry maps to your account.'
        },
        {
          step: 4,
          title: 'Grant Health Connect Permissions',
          instruction: 'Allow read permissions for the requested biometrics (Steps, Heart Rate, Sleep, BP, Body Composition).'
        },
        {
          step: 5,
          title: 'Run Initial Telemetry Sync',
          instruction: 'Tap "Sync now" in the companion app to complete the initial 30-day telemetry upload.'
        }
      ]
    };
  }

  async disconnect(memberId, options = {}) {
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { status: 'disconnected' });
    if (options.deleteData) {
      const records = db.find('biometrics', b => b.memberId === memberId && b.provider === this.id);
      for (const r of records) db.delete('biometrics', r.id);
    }
    return { success: true, provider: this.id, message: 'Samsung Health unlinked.' };
  }

  async sync(memberId, options = {}) {
    // When called from manual sync/simulation or mobile upload
    const conn = db.findOne('providerConnections', c => c.memberId === memberId && c.provider === this.id);
    if (conn) db.update('providerConnections', conn.id, { lastSyncAt: new Date().toISOString() });
    return { success: true, provider: this.id };
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
      sourceRecordId: String(rawRecord.recordId || rawRecord.sourceRecordId || rawRecord.id),
      syncedAt: new Date().toISOString()
    };
  }
}

module.exports = SamsungHealthProvider;

