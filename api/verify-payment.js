// api/verify-payment.js
// Vercel Serverless Function — Stripe webhook handler.
// Stripe calls this endpoint after a successful payment. We verify the
// webhook signature (prevents forged requests), then grant enrollment.
//
// Setup:
//   1. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to Vercel env vars.
//   2. In Stripe Dashboard → Webhooks, add this endpoint URL and select
//      the event: payment_intent.succeeded
//   3. Copy the signing secret into STRIPE_WEBHOOK_SECRET.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, courseId, orderId, discountId } = session.metadata;

    if (!userId || !courseId) {
      console.error('Missing metadata in payment intent:', intent.id);
      return res.status(400).json({ error: 'Missing metadata' });
    }

    // Complete enrollment atomically via stored procedure
    const { error } = await supabase.rpc('complete_enrollment', {
      p_user_id:   userId,
      p_course_id: courseId,
      p_order_id:  orderId,
    });

    if (error) {
      console.error('complete_enrollment error:', error.message);
      return res.status(500).json({ error: 'Enrollment failed' });
    }

    // Increment discount code usage if a code was applied
    if (discountId) {
      await supabase.rpc('increment_discount_uses', { discount_id_arg: discountId }).catch(() => {});
    }

    console.info(`Enrollment complete: user=${userId} course=${courseId}`);
  }

  return res.status(200).json({ received: true });
}
