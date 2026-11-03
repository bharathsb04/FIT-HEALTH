const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class AppleHealthProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'apple-health',
      name: 'Apple Health',
      type: 'mobile_companion',
      brand: 'Apple',
      icon: '🍎',
      color: '#FF2D55',
      description: 'Apple Watch Series & Ultra, HealthKit workouts, heart rate zones, ECG & active energy',
      supportedMetrics: [
        'steps', 'heart_rate', 'resting_heart_rate', 'sleep', 'weight',
        'active_calories', 'total_calories', 'distance', 'oxygen_saturation', 'blood_pressure', 'vo2_max', 'exercise'
      ]
    });
  }

  async connect(memberId) {
    return {
      success: true,
      provider: this.id,
      type: this.type,
      requiresOAuth: false,
      title: 'Connect Apple Health',
      steps: [
        {
          step: 1,
          title: 'Install Fit Health Sync on iPhone',
          instruction: 'Install the Fit Health Sync iOS companion app onto your iPhone via Xcode or TestFlight from the ios-companion directory.'
        },
        {
          step: 2,
          title: 'Sign In to Your Fit Health Account',
          instruction: 'Open the iOS app and enter your Fit Health member email and password to bind your personal member ID.'
        },
        {
          step: 3,
          title: 'Allow Apple HealthKit Permissions',
          instruction: 'When prompted by iOS HealthKit, toggle "Turn On All" to authorize reading Steps, Heart Rate, Sleep, Active Energy, and Workouts.'
        },
        {
          step: 4,
          title: 'Tap "Sync now" to Stream Apple Watch Data',
          instruction: 'Tap "Sync now" in the iOS companion app to initiate the first upload. Background HealthKit observer queries will keep it updated automatically.'
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
    return { success: true, provider: this.id, message: 'Apple Health disconnected.' };
  }

  async sync(memberId) {
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

module.exports = AppleHealthProvider;

