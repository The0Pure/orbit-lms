// src/components/PaymentModal.jsx
import { useState, useEffect } from 'react';
import { X, Shield, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import toast from 'react-hot-toast';

const AMAZON_MERCHANT_ID = import.meta.env.VITE_AMAZON_PAY_MERCHANT_ID || 'YOUR_MERCHANT_ID';
const AMAZON_STORE_ID = import.meta.env.VITE_AMAZON_PAY_STORE_ID || 'YOUR_STORE_ID';
const AMAZON_SANDBOX = import.meta.env.VITE_AMAZON_PAY_SANDBOX !== 'false';

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [step, setStep] = useState('method'); // method | processing | success
  const [method, setMethod] = useState(null);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const { user, enrollCourse } = useAuth();
  const { addOrder } = useCourses();

  useEffect(() => {
    // Check Apple Pay availability
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      setApplePayAvailable(true);
    }
  }, []);

  const handleApplePay = () => {
    if (!window.ApplePaySession) {
      toast.error('Apple Pay not available on this device');
      return;
    }

    const request = {
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: `Orbit — ${course.title}`,
        amount: course.price.toString(),
      },
    };

    const session = new ApplePaySession(3, request);

    session.onvalidatemerchant = async (event) => {
      // In production: call your backend to validate the merchant
      // const merchantSession = await validateApplePaySession(event.validationURL);
      // session.completeMerchantValidation(merchantSession);
      console.log('Merchant validation URL:', event.validationURL);
      // For demo, we simulate success
      processPayment('apple_pay');
    };

    session.onpaymentauthorized = (event) => {
      // In production: send event.payment.token to your payment processor
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
      processPayment('apple_pay');
    };

    session.oncancel = () => {
      toast('Apple Pay cancelled');
    };

    session.begin();
  };

  const handleAmazonPay = async () => {
    setMethod('amazon_pay');
    setStep('processing');

    try {
      // Call our Vercel API route to create checkout session
      const res = await fetch('/api/amazon-pay-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          currency: 'USD',
          courseId: course.id,
          courseName: course.title,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // In production: redirect to data.redirectUrl (Amazon Pay hosted page)
        // window.location.href = data.redirectUrl;
        // For demo sandbox mode — simulate success:
        setTimeout(() => processPayment('amazon_pay'), 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error('Amazon Pay error. Check your credentials.');
      setStep('method');
    }
  };

  const handleCardPayment = (e) => {
    e.preventDefault();
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      toast.error('Please fill all card fields');
      return;
    }
    setStep('processing');
    setTimeout(() => processPayment('card'), 2000);
  };

  const processPayment = (paymentMethod) => {
    setStep('processing');
    setTimeout(() => {
      // Record order
      addOrder({
        userId: user?.id || 'guest',
        courseId: course.id,
        amount: course.price,
        paymentMethod,
        status: 'completed',
      });
      // Enroll student
      enrollCourse(course.id);
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-orbit-cream-light">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl hover:bg-orbit-bg text-gray-400">
            <X size={20} />
          </button>
          <h2 className="font-display text-xl font-bold text-orbit-navy">Complete Enrollment</h2>
          <div className="mt-3 p-3 bg-orbit-bg rounded-xl flex items-center gap-3">
            <span className="text-2xl">{course.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-orbit-navy text-sm truncate">{course.title}</p>
              <p className="text-xs text-gray-500">{course.instructor}</p>
            </div>
            <span className="font-display text-xl font-bold text-orbit-navy shrink-0">${course.price}</span>
          </div>
        </div>

        <div className="p-6">
          {/* ── STEP: Select method ── */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-500 mb-4">Select payment method</p>

              {/* Apple Pay */}
              {applePayAvailable && (
                <button
                  onClick={handleApplePay}
                  className="w-full py-3.5 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-95 transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Pay with Apple Pay
                </button>
              )}

              {/* Amazon Pay */}
              <button
                onClick={handleAmazonPay}
                className="w-full py-3.5 bg-[#FF9900] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e88b00] active:scale-95 transition-all"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.13c.16-.068.286-.09.375-.066.11.044.155.12.135.23-.02.1-.063.2-.127.3-3.26 4.193-7.264 5.89-12.008 5.09a22.4 22.4 0 0 1-9.25-4.53c-.11-.1-.167-.21-.168-.31a.28.28 0 0 1 .063-.133zM5.41 15.47l.01.02.013-.01-.023-.01zM24 11.86a2.84 2.84 0 0 1-.398 1.447l-.013-.012a2.836 2.836 0 0 0-2.436-1.377c-1.025 0-1.842.497-2.45 1.49-.61.993-.913 2.22-.913 3.68 0 .936.145 1.79.434 2.56l.01-.01a5.1 5.1 0 0 1-.55.7l.02.017-.11-.015a7.048 7.048 0 0 1-1.77-4.76c0-1.955.534-3.62 1.6-5 1.065-1.378 2.45-2.067 4.15-2.067 1.54 0 2.77.59 3.693 1.77a.22.22 0 0 1 .08.157.22.22 0 0 1-.077.173z"/>
                </svg>
                Pay with Amazon Pay
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-orbit-cream-light" />
                <span className="text-xs text-gray-400 font-medium">or card</span>
                <div className="flex-1 h-px bg-orbit-cream-light" />
              </div>

              {/* Card form */}
              <form onSubmit={handleCardPayment} className="space-y-3">
                <div>
                  <label className="orbit-label">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="orbit-input"
                    value={cardData.name}
                    onChange={e => setCardData({ ...cardData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="orbit-label">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="orbit-input"
                    maxLength={19}
                    value={cardData.number}
                    onChange={e => setCardData({ ...cardData, number: e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="orbit-label">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="orbit-input"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="orbit-label">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="orbit-input"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g,'') })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 mt-2">
                  <CreditCard size={17} /> Pay ${course.price}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                <Shield size={13} /> Payments are secure and encrypted
              </div>
            </div>
          )}

          {/* ── STEP: Processing ── */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 size={48} className="text-orbit-gold animate-spin mx-auto mb-5" />
              <p className="font-semibold text-orbit-navy text-lg">Processing Payment...</p>
              <p className="text-gray-500 text-sm mt-2">Please do not close this window</p>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-orbit-teal/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={44} className="text-orbit-teal" />
              </div>
              <p className="font-display text-xl font-bold text-orbit-navy">Enrolled!</p>
              <p className="text-gray-500 text-sm mt-2">Taking you to your course...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
