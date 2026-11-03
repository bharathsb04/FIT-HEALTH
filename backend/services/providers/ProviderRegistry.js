const db = require('../../data/dbStorage');
const FitbitProvider = require('./FitbitProvider');
const GarminProvider = require('./GarminProvider');
const WithingsProvider = require('./WithingsProvider');
const OuraProvider = require('./OuraProvider');
const WhoopProvider = require('./WhoopProvider');
const PolarProvider = require('./PolarProvider');
const SamsungHealthProvider = require('./SamsungHealthProvider');
const GoogleFitProvider = require('./GoogleFitProvider');
const AppleHealthProvider = require('./AppleHealthProvider');

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.register(new SamsungHealthProvider());
    this.register(new GoogleFitProvider());
    this.register(new AppleHealthProvider());
    this.register(new FitbitProvider());
    this.register(new GarminProvider());
    this.register(new WithingsProvider());
    this.register(new OuraProvider());
    this.register(new WhoopProvider());
    this.register(new PolarProvider());
  }

  register(providerInstance) {
    this.providers.set(providerInstance.id, providerInstance);
  }

  getProvider(providerId) {
    if (!providerId) return null;
    const cleanId = providerId.toLowerCase().trim();
    return this.providers.get(cleanId) || null;
  }

  getAllProviders() {
    return Array.from(this.providers.values());
  }

  /**
   * Returns metadata for all supported health apps enriched with member's real-time connection status
   */
  getMemberProviders(memberId) {
    const connections = db.find('providerConnections', c => c.memberId === memberId) || [];
    const connMap = new Map(connections.map(c => [c.provider, c]));

    return this.getAllProviders().map(p => {
      const conn = connMap.get(p.id);
      const isConnected = conn && conn.status === 'connected';
      const isExpired = conn && conn.status === 'expired';

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        brand: p.brand,
        icon: p.icon,
        color: p.color,
        description: p.description,
        supportedMetrics: p.supportedMetrics,
        mode: p.type === 'cloud_oauth' ? (p.isDemoMode() ? 'demo' : 'live') : 'companion',
        status: isConnected ? 'connected' : (isExpired ? 'needs_relogin' : 'disconnected'),
        isPrimary: Boolean(conn?.isPrimary),
        lastSyncAt: conn?.lastSyncAt || null,
        connectedAt: conn?.connectedAt || null
      };
    });
  }

  /**
   * Sets member's primary provider for conflict resolution & priority aggregation
   */
  setPrimaryProvider(memberId, providerId) {
    const cleanId = providerId.toLowerCase().trim();
    const provider = this.getProvider(cleanId);
    if (!provider) {
      throw new Error(`Invalid provider identifier: ${providerId}`);
    }

    const connections = db.find('providerConnections', c => c.memberId === memberId) || [];
    let targetFound = false;

    for (const c of connections) {
      const isTarget = c.provider === cleanId;
      db.update('providerConnections', c.id, { isPrimary: isTarget });
      if (isTarget) targetFound = true;
    }

    if (!targetFound) {
      db.create('providerConnections', {
        memberId,
        provider: cleanId,
        status: 'connected',
        isPrimary: true,
        connectedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: `${provider.name} set as primary biometrics provider.`
    };
  }

  /**
   * Returns member's primary provider ID
   */
  getPrimaryProvider(memberId) {
    const primary = db.findOne('providerConnections', c => c.memberId === memberId && c.isPrimary && c.status === 'connected');
    if (primary) return primary.provider;

    const anyConnected = db.findOne('providerConnections', c => c.memberId === memberId && c.status === 'connected');
    return anyConnected ? anyConnected.provider : 'samsung-health';
  }
}

// Export singleton instance
module.exports = new ProviderRegistry();

