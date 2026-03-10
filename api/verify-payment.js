// api/verify-payment.js — Vercel Serverless Function
// Handles Stripe Checkout Session creation and webhook verification

import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Your Stripe Price ID for the $9/month plan
// Create this in your Stripe Dashboard: Products → Add Product → $9/month recurring
const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_YOUR_PRICE_ID_HERE'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to environment variables.' })
  }

  // ─── Webhook handling ───────────────────────────────────────────────────────
  // POST /api/verify-payment with stripe-signature header = webhook event
  if (req.headers['stripe-signature']) {
    return handleWebhook(req, res)
  }

  // ─── Direct API calls from frontend ─────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, email, successUrl, cancelUrl, sessionId } = req.body || {}

  // Create a Stripe Checkout session
  if (action === 'create-checkout') {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    try {
      // Check if customer already exists
      let customerId
      const customers = await stripe.customers.list({ email, limit: 1 })
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [
          {
            price: PREMIUM_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/app?upgraded=true`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/pricing`,
        metadata: {
          userEmail: email,
        },
        subscription_data: {
          metadata: {
            userEmail: email,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      })

      return res.status(200).json({ url: session.url, sessionId: session.id })

    } catch (err) {
      console.error('Checkout creation error:', err)
      return res.status(500).json({ error: err.message || 'Failed to create checkout session' })
    }
  }

  // Verify a completed session (called after redirect back from Stripe)
  if (action === 'verify-session') {
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      })

      const isPaid = session.payment_status === 'paid' || session.status === 'complete'

      return res.status(200).json({
        success: isPaid,
        email: session.customer_details?.email || session.metadata?.userEmail,
        plan: isPaid ? 'premium' : 'free',
        subscriptionId: session.subscription?.id || null,
        customerId: session.customer?.id || null,
      })

    } catch (err) {
      console.error('Session verification error:', err)
      return res.status(500).json({ error: err.message || 'Failed to verify session' })
    }
  }

  // Get subscription status
  if (action === 'get-subscription') {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    try {
      const customers = await stripe.customers.list({ email, limit: 1 })
      if (customers.data.length === 0) {
        return res.status(200).json({ plan: 'free', active: false })
      }

      const customerId = customers.data[0].id
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      })

      const hasActive = subscriptions.data.length > 0

      return res.status(200).json({
        plan: hasActive ? 'premium' : 'free',
        active: hasActive,
        subscriptionId: hasActive ? subscriptions.data[0].id : null,
        currentPeriodEnd: hasActive ? subscriptions.data[0].current_period_end : null,
      })

    } catch (err) {
      console.error('Subscription check error:', err)
      return res.status(500).json({ error: err.message || 'Failed to check subscription' })
    }
  }

  // Cancel subscription
  if (action === 'cancel-subscription') {
    const { subscriptionId } = req.body || {}
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    try {
      // Cancel at period end (not immediately)
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })

      return res.status(200).json({
        success: true,
        cancelAt: subscription.cancel_at,
        message: 'Subscription will cancel at the end of the billing period.',
      })

    } catch (err) {
      console.error('Cancellation error:', err)
      return res.status(500).json({ error: err.message || 'Failed to cancel subscription' })
    }
  }

  return res.status(400).json({ error: 'Invalid action. Valid actions: create-checkout, verify-session, get-subscription, cancel-subscription' })
}

// ─── Stripe Webhook Handler ───────────────────────────────────────────────────
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event
  try {
    // Stripe needs the raw body for signature verification
    // In Vercel, req.body may already be parsed — you need raw body
    const rawBody = JSON.stringify(req.body)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  console.log('Stripe webhook event:', event.type)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userEmail = session.metadata?.userEmail || session.customer_details?.email

      if (userEmail && session.payment_status === 'paid') {
        console.log(`✅ Payment completed for: ${userEmail}`)
        // In a real app: update your database here
        // e.g., await db.users.update({ email: userEmail }, { plan: 'premium' })
        // For this localStorage-based app, the frontend handles it via verify-session
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer

      try {
        const customer = await stripe.customers.retrieve(customerId)
        const userEmail = customer.email
        if (userEmail) {
          console.log(`❌ Subscription cancelled for: ${userEmail}`)
          // In a real app: update your database here
          // e.g., await db.users.update({ email: userEmail }, { plan: 'free' })
        }
      } catch (err) {
        console.error('Error retrieving customer for cancellation webhook:', err)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log(`💳 Payment failed for customer: ${invoice.customer}`)
      // Notify user, pause access, etc.
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      console.log(`🔄 Subscription updated: ${subscription.id}, status: ${subscription.status}`)
      break
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}
