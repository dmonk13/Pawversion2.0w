import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Check, Lock, ArrowLeft } from 'lucide-react';

interface PaymentPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [upiId, setUpiId] = useState('');

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'number') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setCardData({ ...cardData, number: formatted.substring(0, 19) });
    } else if (field === 'expiry') {
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }
      setCardData({ ...cardData, expiry: cleaned.substring(0, 5) });
    } else if (field === 'cvv') {
      setCardData({ ...cardData, cvv: value.replace(/\D/g, '').substring(0, 3) });
    } else {
      setCardData({ ...cardData, [field]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const isCardValid = cardData.number.replace(/\s/g, '').length === 16 &&
                      cardData.name.length > 0 &&
                      cardData.expiry.length === 5 &&
                      cardData.cvv.length === 3;

  const isUpiValid = upiId.includes('@') && upiId.length > 5;
  const isFormValid = paymentMethod === 'card' ? isCardValid : isUpiValid;

  return (
    <div className="fixed inset-0 z-[160] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Back</span>
          </button>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Complete Payment</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Upgrade to PawPal Pro</p>

          <div className="mt-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300 font-bold">Pro Plan (Monthly)</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹89</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cancel anytime, no commitment</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 block">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === 'card'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <CreditCard size={24} className={paymentMethod === 'card' ? 'text-orange-500' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Card
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === 'upi'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Smartphone size={24} className={paymentMethod === 'upi' ? 'text-orange-500' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${paymentMethod === 'upi' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                UPI
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {paymentMethod === 'card' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">Card Number</label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => handleCardInputChange('name', e.target.value)}
                    placeholder="Name on Card"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">Expiry</label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">CVV</label>
                    <input
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      placeholder="123"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@paytm"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                  Enter your UPI ID and approve the payment request in your UPI app
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Lock size={12} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Secure Payment</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your payment information is encrypted and secure</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Check size={20} strokeWidth={3} />
                Pay ₹89/month
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Cancel anytime • Secure payment • No hidden fees
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
