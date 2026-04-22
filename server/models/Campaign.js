const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  email: String,
  name: String,
  status: { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  sentAt: Date,
  error: String
});

const campaignSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  recipients: [recipientSchema],
  status: { type: String, enum: ['draft','sending','completed','failed'], default: 'draft' },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
