const router = require('express').Router();
const { createApplication, getJobApplications, getMyApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
router.post('/', protect, authorize('freelancer'), createApplication);
router.get('/my', protect, authorize('freelancer'), getMyApplications);
router.get('/job/:jobId', protect, authorize('client', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('client', 'admin'), updateApplicationStatus);
module.exports = router;
