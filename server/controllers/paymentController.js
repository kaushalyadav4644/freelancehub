const { Payment, Project } = require('../models/index');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {}

// POST /api/payments/stripe/create-intent
exports.createStripePaymentIntent = async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Stripe not configured' });

    const { projectId, amount } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: { projectId, clientId: req.user._id.toString() },
    });

    const payment = await Payment.create({
      projectId, jobId: project.jobId,
      payerId: req.user._id, payeeId: project.freelancerId,
      amount, gateway: 'stripe',
      gatewayPaymentId: paymentIntent.id,
      status: 'pending',
      platformFee: amount * 0.05,
      netAmount: amount * 0.95,
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/stripe/confirm
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const payment = await Payment.findOne({ gatewayPaymentId: paymentIntentId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'escrow';
    await payment.save();

    await Project.findByIdAndUpdate(payment.projectId, { paymentStatus: 'escrow' });

    res.json({ success: true, message: 'Payment confirmed, funds in escrow', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/razorpay/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!Razorpay || !process.env.RAZORPAY_KEY_ID) {
      return res.status(503).json({ success: false, message: 'Razorpay not configured' });
    }

    const { projectId, amount } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `project_${projectId}`,
    });

    const payment = await Payment.create({
      projectId, jobId: project.jobId,
      payerId: req.user._id, payeeId: project.freelancerId,
      amount, currency: 'INR', gateway: 'razorpay',
      gatewayOrderId: order.id, status: 'pending',
      platformFee: amount * 0.05,
      netAmount: amount * 0.95,
    });

    res.json({ success: true, order, payment, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/my
exports.getMyPayments = async (req, res) => {
  try {
    const filter = req.user.role === 'freelancer'
      ? { payeeId: req.user._id }
      : { payerId: req.user._id };

    const payments = await Payment.find(filter)
      .populate('projectId', 'status')
      .populate('jobId', 'title')
      .populate('payerId', 'name')
      .populate('payeeId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
