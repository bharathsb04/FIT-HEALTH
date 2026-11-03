/**
 * BaseHealthProvider
 * Common abstract interface for all health app providers (Cloud OAuth + Mobile Companions).
 * Enforces unified connect(), disconnect(), sync(), and normalize() contracts.
 */
class BaseHealthProvider {
  constructor(options = {}) {
    this.id = options.id || 'base';
    this.name = options.name || 'Base Health Provider';
    this.type = options.type || 'cloud_oauth'; // 'cloud_oauth' | 'mobile_companion'
    this.icon = options.icon || '❤️';
    this.brand = options.brand || 'Health';
    this.color = options.color || '#10b981';
    this.supportedMetrics = options.supportedMetrics || [];
    this.description = options.description || '';
  }

  /**
   * Evaluates whether this provider operates in built-in Demo / Simulation mode.
   * True if its CLIENT_ID starts with "demo_" or is empty/unset.
   */
  isDemoMode() {
    if (this.type !== 'cloud_oauth') return false;
    const cid = (this.clientId || '').trim().toLowerCase();
    return !cid || cid.startsWith('demo_');
  }

  /**
   * Generates authorization URL for Cloud OAuth or returns step-by-step setup guides for Mobile Companions.
   */
  async connect(memberId, params = {}) {
    throw new Error(`connect() not implemented for provider ${this.id}`);
  }

  /**
   * Handles OAuth authorization code exchange, token encryption and persists connection.
   */
  async handleCallback(memberId, code, state = {}) {
    throw new Error(`handleCallback() not implemented for provider ${this.id}`);
  }

  /**
   * Disconnects provider and revokes credentials.
   */
  async disconnect(memberId, options = {}) {
    throw new Error(`disconnect() not implemented for provider ${this.id}`);
  }

  /**
   * Fetches latest biometric telemetry from provider API or processes mobile payload.
   */
  async sync(memberId, options = {}) {
    throw new Error(`sync() not implemented for provider ${this.id}`);
  }

  /**
   * Normalizes provider-specific telemetry into the unified Fit Health biometrics schema.
   * Universal output:
   * {
   *   memberId: string,
   *   type: 'steps' | 'heart_rate' | 'resting_heart_rate' | 'sleep' | 'weight' | 'height' | 'body_fat' | 'bmi' | 'calories' | 'active_calories' | 'total_calories' | 'distance' | 'oxygen_saturation' | 'blood_pressure' | 'exercise' | 'vo2_max',
   *   value: number | object,
   *   unit: string,
   *   startTime: string (ISO),
   *   endTime: string (ISO),
   *   provider: string,
   *   sourceRecordId: string,
   *   syncedAt: string (ISO)
   * }
   */
  normalize(rawRecord, memberId) {
    throw new Error(`normalize() not implemented for provider ${this.id}`);
  }

  /**
   * Refreshes OAuth access token using refresh token.
   */
  async refreshToken(connection) {
    return connection;
  }
}

module.exports = BaseHealthProvider;

