const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    // Freelancer specific
    skills: [{ type: String }],
    hourlyRate: { type: Number, default: 0 },
    experience: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'entry' },
    portfolio: [
      {
        title: String,
        description: String,
        link: String,
        image: String,
      },
    ],
    // Stats
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    // Payment
    stripeCustomerId: { type: String },
    razorpayContactId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
