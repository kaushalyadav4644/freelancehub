const router = require('express').Router();
const { createStripePaymentIntent, confirmStripePayment, createRazorpayOrder, getMyPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
router.post('/stripe/create-intent', protect, authorize('client'), createStripePaymentIntent);
router.post('/stripe/confirm', protect, authorize('client'), confirmStripePayment);
router.post('/razorpay/create-order', protect, authorize('client'), createRazorpayOrder);
router.get('/my', protect, getMyPayments);
module.exports = router;
