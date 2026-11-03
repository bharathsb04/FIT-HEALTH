const mongoose = require('mongoose');

const AdminNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Maintenance', 'Finance', 'Members', 'Reminders'],
    default: 'General'
  },
  isPinned: { type: Boolean, default: false },
  colorLabel: {
    type: String,
    enum: ['emerald', 'cyan', 'amber', 'rose', 'violet', 'slate'],
    default: 'amber'
  },
  reminderDate: { type: String, default: '' }, // ISO Date string
  isPrivateToMe: { type: Boolean, default: false },
  createdBy: {
    id: { type: String, required: true },
    name: { type: String, default: 'Admin' },
    email: { type: String, default: '' },
    role: { type: String, default: 'admin' }
  },
  linkedDirectoryId: { type: String, default: '' },
  linkedEquipmentId: { type: String, default: '' },
  attachments: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.AdminNote || mongoose.model('AdminNote', AdminNoteSchema);
