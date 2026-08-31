const { Review, Project } = require('../models/index');
const User = require('../models/User');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment, type } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'completed') return res.status(400).json({ success: false, message: 'Project must be completed first' });

    const isAuthorized =
      (type === 'client-to-freelancer' && project.clientId.toString() === req.user._id.toString()) ||
      (type === 'freelancer-to-client' && project.freelancerId.toString() === req.user._id.toString());

    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Not authorized' });

    const existing = await Review.findOne({ projectId, reviewerId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Review already submitted' });

    const review = await Review.create({
      projectId, revieweeId, rating, comment, type,
      reviewerId: req.user._id,
      jobId: project.jobId,
    });

    // Update user rating
    const reviews = await Review.find({ revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });

    await review.populate('reviewerId', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/user/:userId
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name avatar')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
