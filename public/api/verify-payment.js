// GET /api/verify-payment?session_id=xxx
// Confirms with Stripe that a checkout session was actually paid before
// unlocking local results. Never trust the client's word alone for this.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.status(200).json({ paid: session.payment_status === 'paid' });
  } catch (err) {
    console.error('verify-payment error:', err);
    res.status(500).json({ error: 'Could not verify payment' });
  }
};
