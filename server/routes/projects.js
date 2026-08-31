const router = require('express').Router();
const { getMyProjects, getProject, submitDelivery, approveDelivery, requestRevision } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
router.get('/my', protect, getMyProjects);
router.get('/:id', protect, getProject);
router.post('/:id/submit', protect, submitDelivery);
router.put('/:id/approve', protect, approveDelivery);
router.put('/:id/revision', protect, requestRevision);
module.exports = router;
