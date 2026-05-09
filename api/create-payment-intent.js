// api/create-payment-intent.js
// Vercel Serverless Function — creates a Stripe Checkout Session for paid courses.
// The client redirects to Stripe Checkout; Stripe calls verify-payment.js on success.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Authenticate caller
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { courseId, orderId } = req.body;
  if (!courseId || !orderId) return res.status(400).json({ error: 'Missing courseId or orderId' });

  // Fetch order to get amount
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (orderError || !order) return res.status(404).json({ error: 'Order not found or already processed' });

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'sar',
          product_data: { name: course?.title || 'Course Enrollment' },
          unit_amount: Math.round(Number(order.amount) * 100), // Stripe expects fils
        },
        quantity: 1,
      }],
      metadata: {
        userId:     user.id,
        courseId:   courseId,
        orderId:    orderId,
        discountId: order.discount_code || '',
      },
      success_url: `${process.env.VITE_APP_URL}/?payment=success&courseId=${courseId}`,
      cancel_url:  `${process.env.VITE_APP_URL}/?payment=cancelled`,
      customer_email: user.email,
    });

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err.message);
    return res.status(500).json({ error: 'Payment initialization failed' });
  }
}
