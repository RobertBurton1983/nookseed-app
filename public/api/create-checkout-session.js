// POST /api/create-checkout-session
// Creates a Stripe Checkout session for the one-time $9 "local matches" unlock.
// Requires env var STRIPE_SECRET_KEY and DOMAIN (your deployed site URL, no trailing slash).

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // one-time charge, not a subscription
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Nookseed — Local Matches',
              description: 'Unlock real classes, studios, and groups near you for your three hobby matches.',
            },
            unit_amount: 900, // $9.00, in cents
          },
          quantity: 1,
        },
      ],
      // Bring the user back to the results section with the session id attached,
      // so the frontend can verify payment and unlock local results.
      success_url: `${process.env.DOMAIN}/?session_id={CHECKOUT_SESSION_ID}#results`,
      cancel_url: `${process.env.DOMAIN}/?canceled=true#results`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
};
