// api/amazon-pay-session.js
// Creates Amazon Pay checkout session server-side (required for security)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency = 'USD', courseId, courseName } = req.body;

  // In production: use Amazon Pay SDK (@amazonpay/amazon-pay-api-sdk-nodejs)
  // npm install @amazonpay/amazon-pay-api-sdk-nodejs
  // Full docs: https://developer.amazon.com/docs/amazon-pay-checkout/introduction.html

  const sessionPayload = {
    webCheckoutDetails: {
      checkoutReviewReturnUrl: `${process.env.VITE_APP_URL}/checkout/review`,
      checkoutResultReturnUrl: `${process.env.VITE_APP_URL}/checkout/success`,
    },
    storeId: process.env.VITE_AMAZON_PAY_STORE_ID,
    paymentDetails: {
      paymentIntent: 'Authorize',
      canHandlePendingAuthorization: false,
      chargeAmount: {
        amount: amount.toString(),
        currencyCode: currency,
      },
    },
    merchantMetadata: {
      merchantReferenceId: `ORBIT-${courseId}-${Date.now()}`,
      merchantStoreName: 'Orbit Learning',
      noteToBuyer: `Course: ${courseName}`,
    },
  };

  // TODO: Replace with actual Amazon Pay SDK call:
  // const Client = require('@amazonpay/amazon-pay-api-sdk-nodejs');
  // const client = new Client.WebStoreClient({ ... });
  // const session = await client.createCheckoutSession(sessionPayload, headers);

  // Sandbox mock response for now
  return res.status(200).json({
    success: true,
    checkoutSessionId: `mock-session-${Date.now()}`,
    redirectUrl: 'https://payments.amazon.com/checkout/...',
    note: 'Replace with real Amazon Pay SDK integration. See comments in /api/amazon-pay-session.js',
  });
}
