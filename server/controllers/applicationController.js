const Application = require('../models/Application');
const Job = require('../models/Job');
const { Project } = require('../models/index');

// POST /api/applications
exports.createApplication = async (req, res) => {
  try {
    const { jobId, proposal, bidAmount, deliveryTime, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ success: false, message: 'Job is no longer accepting applications' });
    if (job.clientId.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job' });

    const existing = await Application.findOne({ jobId, freelancerId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this job' });

    const application = await Application.create({
      jobId, proposal, bidAmount, deliveryTime, coverLetter,
      freelancerId: req.user._id,
      clientId: job.clientId,
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    await application.populate('freelancerId', 'name avatar skills rating reviewCount experience hourlyRate');
    res.status(201).json({ success: true, message: 'Application submitted', application });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Already applied to this job' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/applications/job/:jobId
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name avatar skills rating reviewCount experience hourlyRate bio completedJobs')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/applications/my
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user._id })
      .populate('jobId', 'title budget deadline status category clientId')
      .populate({ path: 'jobId', populate: { path: 'clientId', select: 'name avatar' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      // Create project
      await Project.create({
        jobId: application.jobId._id,
        applicationId: application._id,
        freelancerId: application.freelancerId,
        clientId: req.user._id,
        agreedAmount: application.bidAmount,
        deadline: new Date(Date.now() + application.deliveryTime * 24 * 60 * 60 * 1000),
      });

      // Update job status & assign freelancer
      await Job.findByIdAndUpdate(application.jobId._id, {
        status: 'in-progress',
        assignedFreelancer: application.freelancerId,
      });

      // Reject other applications
      await Application.updateMany(
        { jobId: application.jobId._id, _id: { $ne: application._id } },
        { status: 'rejected' }
      );
    }

    res.json({ success: true, message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
