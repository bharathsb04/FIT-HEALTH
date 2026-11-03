const BaseHealthProvider = require('./BaseHealthProvider');
const db = require('../../data/dbStorage');
const { encryptValue } = require('../cryptoService');

class GoogleFitProvider extends BaseHealthProvider {
  constructor() {
    super({
      id: 'google-fit',
      name: 'Google Fit / Health Connect',
      type: 'mobile_companion',
      brand: 'Google',
      icon: '❤️',
      color: '#4285F4',
      description: 'Pixel Watch, Wear OS & Android mobile fitness data via Health Connect',
      supportedMetrics: [
        'steps', 'heart_rate', 'resting_heart_rate', 'sleep', 'weight',
        'active_calories', 'total_calories', 'distance', 'oxygen_saturation', 'exercise'
      ]
    });
  }

  async connect(memberId) {
    return {
      success: true,
      provider: this.id,
      type: this.type,
      requiresOAuth: false,
      title: 'Connect Google Fit / Health Connect',
      steps: [
        {
          step: 1,
          title: 'Open Health Connect Settings on Android',
          instruction: 'On your Android device (Android 14+), go to Settings → Security & privacy → Health Connect (or open Health Connect app on Android 9–13).'
        },
        {
          step: 2,
          title: 'Install Fit Health Companion Bridge',
          instruction: 'Install the Fit Health Companion app on your Android device from the project repository.'
        },
        {
          step: 3,
          title: 'Sign In to Fit Health',
          instruction: 'Launch the companion app and sign in using your Fit Health member account credentials.'
        },
        {
          step: 4,
          title: 'Authorize Health Connect Data Access',
          instruction: 'Tap "Grant Permissions" to allow reading Steps, Heart Rate, Calories, Sleep, and Distance.'
        },
        {
          step: 5,
          title: 'Initiate Telemetry Sync',
          instruction: 'Tap "Sync now" to push your Wear OS and Google Fit records to your Fit Health web dashboard.'
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
    return { success: true, provider: this.id, message: 'Google Fit / Health Connect unlinked.' };
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

module.exports = GoogleFitProvider;

