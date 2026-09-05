// POST /api/webhook
// Optional but recommended: Stripe calls this directly when a payment succeeds,
// which is more reliable than only trusting the browser redirect back from
// Checkout (a closed tab or flaky connection can break that redirect).
//
// This starter just logs the event. If you later add a database, this is
// where you'd mark an order as paid instead of relying on verify-payment.js.
//
// Setup: Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
//   URL: https://yourdomain.com/api/webhook
//   Event to send: checkout.session.completed
// Copy the "Signing secret" it gives you into STRIPE_WEBHOOK_SECRET.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Vercel needs the raw request body to verify the Stripe signature.
module.exports.config = {
  api: { bodyParser: false },
};

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment completed for session:', session.id);
    // TODO once you add a database: mark this session/order as paid.
  }

  res.status(200).json({ received: true });
};
