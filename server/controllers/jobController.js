const Job = require('../models/Job');
const Application = require('../models/Application');

// GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, skills, minBudget, maxBudget,
      experience, search, status = 'open', sortBy = 'createdAt',
    } = req.query;

    const filter = { status };

    if (category) filter.category = category;
    if (experience) filter.experienceLevel = experience;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) filter['budget.min'].$gte = Number(minBudget);
      if (maxBudget) filter['budget.min'].$lte = Number(maxBudget);
    }
    if (search) filter.$text = { $search: search };

    const sortOptions = { createdAt: -1, budget: 1 };
    const sort = sortBy === 'budget' ? { 'budget.min': -1 } : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate('clientId', 'name avatar rating reviewCount').sort(sort).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      jobs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('clientId', 'name avatar bio rating reviewCount location completedJobs createdAt');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, clientId: req.user._id });
    await job.populate('clientId', 'name avatar');
    res.status(201).json({ success: true, message: 'Job posted successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Job updated', job: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/jobs/client/my-jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate('assignedFreelancer', 'name avatar rating')
      .sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
