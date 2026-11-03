const mongoose = require('mongoose');

const SupplementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  tagline: { type: String, default: '' },
  purpose: { type: String, required: true },
  commonUsage: { type: String, required: true },
  timing: { type: String, required: true },
  considerations: { type: String, default: '' },
  safetyDisclaimer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Supplement || mongoose.model('Supplement', SupplementSchema);
