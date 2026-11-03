const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  openingHours: { type: String, default: '06:00 AM - 10:00 PM' },
  equipment: [{ type: String }],
  vibe: { type: String, default: 'Modern & High-Energy' },
  crowdLevel: { type: String, enum: ['Low', 'Moderate', 'Peak', 'High'], default: 'Moderate' },
  peakHours: { type: String, default: '06:00 PM - 08:30 PM' },
  facilities: [{ type: String }],
  dayPassPrice: { type: Number, default: 15.0 },
  currency: { type: String, default: 'USD' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Gym || mongoose.model('Gym', GymSchema);
