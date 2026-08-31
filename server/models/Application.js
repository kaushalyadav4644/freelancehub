const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proposal: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    deliveryTime: { type: Number, required: true }, // in days
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    coverLetter: { type: String },
    attachments: [{ name: String, url: String }],
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
