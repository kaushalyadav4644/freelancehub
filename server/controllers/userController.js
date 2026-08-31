const User = require('../models/User');
const { Review } = require('../models/index');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'location', 'phone', 'skills', 'hourlyRate', 'experience', 'portfolio', 'avatar'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/freelancers
exports.getFreelancers = async (req, res) => {
  try {
    const { page = 1, limit = 12, skills, experience, minRate, maxRate, search } = req.query;
    const filter = { role: 'freelancer', isActive: true };

    if (skills) filter.skills = { $in: skills.split(',') };
    if (experience) filter.experience = experience;
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [freelancers, total] = await Promise.all([
      User.find(filter).select('-password').sort({ rating: -1, completedJobs: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      freelancers,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const reviews = await Review.find({ revieweeId: req.params.id })
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, user, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
