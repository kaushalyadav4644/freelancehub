const User = require('../models/User');
const Job = require('../models/Job');
const { Project, Payment, Review } = require('../models/index');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalJobs, totalProjects, totalPayments,
      recentUsers, recentJobs, revenueData,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Project.countDocuments(),
      Payment.countDocuments({ status: { $in: ['completed', 'escrow', 'released'] } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Job.find().sort({ createdAt: -1 }).limit(5).populate('clientId', 'name'),
      Payment.aggregate([
        { $match: { status: { $in: ['completed', 'escrow'] } } },
        { $group: { _id: null, total: { $sum: '$amount' }, fees: { $sum: '$platformFee' } } },
      ]),
    ]);

    const clientCount = await User.countDocuments({ role: 'client' });
    const freelancerCount = await User.countDocuments({ role: 'freelancer' });
    const openJobs = await Job.countDocuments({ status: 'open' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      stats: {
        totalUsers, totalJobs, totalProjects, totalPayments,
        clientCount, freelancerCount, openJobs, completedProjects,
        totalRevenue: revenueData[0]?.total || 0,
        platformFees: revenueData[0]?.fees || 0,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { isActive, role, isVerified } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/jobs
exports.getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find().populate('clientId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(),
    ]);
    res.json({ success: true, jobs, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('payerId', 'name email')
      .populate('payeeId', 'name email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
