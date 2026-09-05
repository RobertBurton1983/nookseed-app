Nookseed
A field guide for curiosity — a hobby-matching app with a free quiz result
and a $9 one-time unlock for real local classes/studios/groups near you.
What's here
```
public/index.html            The whole app: quiz, matching, results, payment UI
api/create-checkout-session.js   Starts a Stripe Checkout session ($9, one-time)
api/verify-payment.js            Confirms a session was actually paid
api/webhook.js                   (Optional) Stripe's own payment confirmation
api/local-matches.js             Looks up real nearby places via Google Places
```
There's no database and no user accounts by design, matching the app's own
"your answers stay ephemeral" promise. Payment state lives only in the
Stripe session itself, checked fresh each time.
1. Install dependencies
```
npm install
```
2. Set up environment variables
Copy `.env.example` to `.env` and fill in real values — see the comments in
that file for exactly where to find each one (Stripe dashboard, Google Cloud
console). You'll need:
`STRIPE_SECRET_KEY`
`DOMAIN`
`GOOGLE_PLACES_API_KEY`
`STRIPE_WEBHOOK_SECRET` (only if you set up the optional webhook)
In Vercel, add the same variables under Project → Settings →
Environment Variables instead of relying on the local `.env` file.
3. Run locally
The easiest way to test both the static site and the API functions together
is the Vercel CLI:
```
npm install -g vercel
vercel dev
```
This serves the app at `http://localhost:3000` with the `/api/*` functions
working exactly as they will in production.
4. Test the payment flow before going live
Stripe test mode (while your key starts with `sk_test_`) lets you complete a
full checkout with a fake card — no real money moves:
Card number: `4242 4242 4242 4242`
Any future expiry date, any 3-digit CVC, any postal code
Confirm that after "paying," you land back on the results page with local
matches unlocked.
5. Deploy
```
vercel --prod
```
Or connect the GitHub repo to a Vercel project in their dashboard for
automatic deploys on every push.
6. Go live
When you're ready to accept real payments:
In Stripe, finish account activation (business info, bank account).
Swap `STRIPE_SECRET_KEY` for your live secret key (starts `sk_live_`).
Update `DOMAIN` to your real production URL.
Make one real $9 purchase yourself to confirm money actually arrives.
Optional: the webhook
`api/webhook.js` is a more reliable way to know a payment succeeded than
only trusting the browser redirect (a closed tab breaks that redirect, but
not the webhook). It's not required for the app to work today — it just
logs confirmed payments. Set it up in Stripe Dashboard → Developers →
Webhooks, pointing at `https://yourdomain.com/api/webhook`, listening for
`checkout.session.completed`.
If you later add a database, that's the place to mark orders as paid
instead of `verify-payment.js`.
