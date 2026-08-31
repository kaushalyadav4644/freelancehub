const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'video-audio', 'other'],
      required: true,
    },
    skills: [{ type: String }],
    budget: {
      type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
      min: { type: Number, required: true },
      max: { type: Number },
    },
    deadline: { type: Date, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    applicationsCount: { type: Number, default: 0 },
    attachments: [{ name: String, url: String }],
    experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'intermediate' },
    duration: { type: String, enum: ['less-than-1-month', '1-3-months', '3-6-months', 'more-than-6-months'] },
    isRemote: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
