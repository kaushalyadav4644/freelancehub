const { Project } = require('../models/index');
const Job = require('../models/Job');
const User = require('../models/User');

// GET /api/projects/my
exports.getMyProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'freelancer'
      ? { freelancerId: req.user._id }
      : { clientId: req.user._id };

    const projects = await Project.find(filter)
      .populate('jobId', 'title category budget')
      .populate('freelancerId', 'name avatar rating')
      .populate('clientId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('jobId')
      .populate('freelancerId', 'name avatar skills rating bio')
      .populate('clientId', 'name avatar')
      .populate('applicationId');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isAuthorized =
      project.freelancerId._id.toString() === req.user._id.toString() ||
      project.clientId._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects/:id/submit
exports.submitDelivery = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.freelancerId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    project.deliveries.push({ message, attachments });
    project.status = 'submitted';
    await project.save();

    res.json({ success: true, message: 'Work submitted for review', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/projects/:id/approve
exports.approveDelivery = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    project.status = 'completed';
    project.completedAt = new Date();
    project.paymentStatus = 'released';
    await project.save();

    // Update job status
    await Job.findByIdAndUpdate(project.jobId, { status: 'completed' });

    // Update stats
    await User.findByIdAndUpdate(project.freelancerId, {
      $inc: { completedJobs: 1, totalEarnings: project.agreedAmount },
    });
    await User.findByIdAndUpdate(project.clientId, {
      $inc: { totalSpent: project.agreedAmount },
    });

    res.json({ success: true, message: 'Delivery approved, project completed', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/projects/:id/revision
exports.requestRevision = async (req, res) => {
  try {
    const { feedback } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    project.status = 'revision-requested';
    project.revisionCount += 1;
    project.deliveries.push({ message: `Revision requested: ${feedback}`, attachments: [] });
    await project.save();

    res.json({ success: true, message: 'Revision requested', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
