const providerRegistry = require('../services/providers/ProviderRegistry');
const db = require('../data/dbStorage');

/**
 * GET /api/health/providers
 * Returns all 9 supported health providers enriched with member's connection status
 */
exports.getProviders = async (req, res) => {
  try {
    const memberId = req.userId;
    const providers = providerRegistry.getMemberProviders(memberId);
    return res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/health/connect/:provider
 * Initiates Cloud OAuth or returns step-by-step setup instructions for Mobile Companions (NO QR CODE)
 */
exports.connectProvider = async (req, res) => {
  try {
    const memberId = req.userId;
    const providerId = req.params.provider;

    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: `Unsupported health provider: ${providerId}`
      });
    }

    const connectResult = await provider.connect(memberId, req.body);
    return res.status(200).json({
      success: true,
      ...connectResult
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/health/callback/:provider
 * OAuth 2.0 callback endpoint for Cloud providers
 */
exports.handleOAuthCallback = async (req, res) => {
  try {
    const providerId = req.params.provider;
    const code = req.query.code || 'simulated_oauth_code';
    // State stores memberId
    const memberId = req.query.state || req.userId;

    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Missing member state parameter in OAuth callback.' });
    }

    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `Unsupported health provider: ${providerId}` });
    }

    const result = await provider.handleCallback(memberId, code, req.query);

    // If request comes from browser OAuth redirect, redirect to frontend vitals view
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml) {
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || (host && !host.includes('localhost') ? 'https' : 'http');
      const fallbackOrigin = host ? `${protocol}://${host}` : 'http://localhost:3000';
      const frontendUrl = process.env.FRONTEND_URL || fallbackOrigin;
      return res.redirect(`${frontendUrl}?connected_provider=${providerId}&status=success`);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/health/sync/:provider
 * Manually trigger data sync or simulated pull for connected provider
 */
exports.syncProvider = async (req, res) => {
  try {
    const memberId = req.userId;
    const providerId = req.params.provider;

    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `Unsupported health provider: ${providerId}` });
    }

    const result = await provider.sync(memberId, req.body);
    return res.status(200).json({
      success: true,
      provider: providerId,
      message: `Telemetry synchronized from ${provider.name}.`,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/health/set-primary/:provider
 * Mark provider as primary for conflict resolution
 */
exports.setPrimaryProvider = async (req, res) => {
  try {
    const memberId = req.userId;
    const providerId = req.params.provider;
    const result = providerRegistry.setPrimaryProvider(memberId, providerId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/health/disconnect/:provider
 * Unlink health provider with option to delete synced records
 */
exports.disconnectProvider = async (req, res) => {
  try {
    const memberId = req.userId;
    const providerId = req.params.provider;
    const deleteData = req.query.deleteData === 'true' || req.body?.deleteData === true;

    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `Unsupported health provider: ${providerId}` });
    }

    const result = await provider.disconnect(memberId, { deleteData });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

