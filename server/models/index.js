const mongoose = require('mongoose');

// Project Model
const projectSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'submitted', 'revision-requested', 'completed', 'cancelled', 'disputed'],
      default: 'active',
    },
    agreedAmount: { type: Number, required: true },
    deadline: { type: Date, required: true },
    milestones: [
      {
        title: String,
        description: String,
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['pending', 'completed', 'paid'], default: 'pending' },
      },
    ],
    deliveries: [
      {
        message: String,
        attachments: [{ name: String, url: String }],
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    revisionCount: { type: Number, default: 0 },
    completedAt: { type: Date },
    paymentStatus: { type: String, enum: ['pending', 'escrow', 'released', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

// Review Model
const reviewSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    type: { type: String, enum: ['client-to-freelancer', 'freelancer-to-client'], required: true },
  },
  { timestamps: true }
);

// Payment Model
const paymentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'escrow'], default: 'pending' },
    gateway: { type: String, enum: ['stripe', 'razorpay'], required: true },
    gatewayPaymentId: { type: String },
    gatewayOrderId: { type: String },
    type: { type: String, enum: ['project-payment', 'milestone', 'refund'], default: 'project-payment' },
    platformFee: { type: Number, default: 0 },
    netAmount: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Message Model
const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [{ name: String, url: String }],
    isRead: { type: Boolean, default: false },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  },
  { timestamps: true }
);

module.exports = {
  Project: mongoose.model('Project', projectSchema),
  Review: mongoose.model('Review', reviewSchema),
  Payment: mongoose.model('Payment', paymentSchema),
  Message: mongoose.model('Message', messageSchema),
};
