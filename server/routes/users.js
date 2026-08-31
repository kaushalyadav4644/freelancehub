const router = require('express').Router();
const { getProfile, updateProfile, getFreelancers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/freelancers', getFreelancers);
router.get('/:id', getUserById);
module.exports = router;
