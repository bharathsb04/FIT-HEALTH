const mongoose = require('mongoose');

const DirectoryEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technician', 'Vendor/Supplier', 'AMC/Service Contract', 'Emergency Contact', 'Cleaning/Housekeeping', 'Other'],
    default: 'Technician'
  },
  companyName: { type: String, default: '' },
  phone: { type: String, required: true },
  alternatePhone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  specialization: { type: String, default: '' },
  linkedEquipment: [{ type: String }], // Equipment IDs or names
  contractStartDate: { type: String, default: '' },
  contractEndDate: { type: String, default: '' },
  serviceFrequency: { type: String, default: 'On-Call' }, // 'Monthly', 'Quarterly', 'Bi-Annual', 'Annual', 'On-Call'
  lastServiceDate: { type: String, default: '' },
  nextServiceDue: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.DirectoryEntry || mongoose.model('DirectoryEntry', DirectoryEntrySchema);
