# AutoGen — AI Content Automation SaaS

A full-stack SaaS for generating marketing content (Shopify descriptions, email sequences, Facebook ads, LinkedIn posts, YouTube scripts, blog outlines) using Mistral-7B-Instruct via Together AI.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Together AI → mistral-7b-instruct-v0.1
- **Payments**: Stripe Checkout + Webhooks
- **Auth**: Email + localStorage (no external auth service needed)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:
```env
# Together AI (https://api.together.xyz)
TOGETHER_API_KEY=your_together_ai_key_here

# Stripe (https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
STRIPE_PRICE_ID=price_...        # Your $9/month Price ID
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe webhook dashboard
```

Create a `.env` file for Vite (frontend):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
```

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Create a product: "AutoGen Premium" at $9/month (recurring)
3. Copy the **Price ID** → paste into `STRIPE_PRICE_ID`
4. Go to Webhooks → Add endpoint: `https://yourdomain.vercel.app/api/verify-payment`
5. Select events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Copy **Signing Secret** → paste into `STRIPE_WEBHOOK_SECRET`

### 4. Together AI Setup

1. Sign up at [api.together.xyz](https://api.together.xyz)
2. Go to API Keys → Create new key
3. Paste into `TOGETHER_API_KEY`

### 5. Run locally
```bash
npm run dev
```

For API routes locally, use Vercel CLI:
```bash
npm install -g vercel
vercel dev
```

### 6. Deploy to Vercel

```bash
vercel --prod
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables:
- `TOGETHER_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY` (mark as "Build" variable)

### 7. Google AdSense (Optional)

Uncomment the AdSense script in `public/index.html` and replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID.

## Features

- ✅ 6 content types: Shopify, Email, Facebook Ads, LinkedIn, YouTube, Blog
- ✅ Free tier: 5 generations/month
- ✅ Premium: Unlimited generations ($9/month via Stripe)
- ✅ Generation history stored in localStorage
- ✅ Export to .txt (Premium)
- ✅ Email + password auth (localStorage-based)
- ✅ Responsive design
- ✅ AdSense-ready

## File Structure

```
/
├── api/
│   ├── generate.js          # AI generation endpoint
│   └── verify-payment.js    # Stripe checkout + webhooks
├── public/
│   └── index.html           # AdSense-ready HTML
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── GeneratorApp.jsx  # Main generator UI
│   │   ├── PricingPage.jsx
│   │   ├── Header.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx              # Routes
│   ├── App.css              # Design system
│   └── main.jsx
├── package.json
├── vite.config.js
├── vercel.json
└── tailwind.config.js
```

## Upgrading Auth

The current auth is localStorage-based (no backend needed). To add a real database:
1. Add Supabase/PlanetScale/MongoDB
2. Update `LoginPage.jsx` to call an `/api/auth` endpoint
3. Replace localStorage user updates with DB calls in `verify-payment.js` webhooks
