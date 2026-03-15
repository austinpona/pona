# Infinity Pearls

Handcrafted jewelry site with Stripe checkout and Supabase for orders.

## Run locally

```bash
npm install
cp .env.example .env   # then add your real keys
npm start
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub and import the project in [Vercel](https://vercel.com).
2. In the Vercel project **Settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_KEY`
3. In Stripe Dashboard → Webhooks, add endpoint:
   - URL: `https://your-app.vercel.app/webhook/stripe`
   - Event: `checkout.session.completed`
   - Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET` in Vercel.
4. Deploy. Your site will be at `https://your-app.vercel.app`.
