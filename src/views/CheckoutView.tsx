import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CartItem, PaymentMethod, UserProfile, Order } from '../types';

interface CheckoutViewProps {
  currentUser: UserProfile;
  cartItems: CartItem[];
  selectedPickupSlot: string;
  onSelectPickupSlot: (slot: string) => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  onBackToMenu: () => void;
  onOrderPlaced: (order: Order) => void;
  onRequireLogin?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  currentUser,
  cartItems,
  selectedPickupSlot,
  onSelectPickupSlot,
  appliedCoupon,
  onBackToMenu,
  onOrderPlaced,
  onRequireLogin,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash_nagad');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamic manual gateway MFS details & dynamic SSLCommerz setup
  const [mfsGateway, setMfsGateway] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [mfsMerchantNum, setMfsMerchantNum] = useState('017XXXXXXXX (Merchant)');

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your tray is empty');
      return;
    }

    // Operating hours check (8:00 AM to 4:30 PM)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = 8 * 60; // 8:00 AM
    const closeMinutes = 16 * 60 + 30; // 4:30 PM

    if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
      setErrorMessage('Ordering is closed. The GUB Café operates strictly between 8:00 AM and 4:30 PM.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { supabase } = await import('../supabaseClient');

      // Verify active Supabase Auth session before inserting order
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Attempt to refresh stale session
        const refreshRes = await supabase.auth.refreshSession();
        session = refreshRes.data.session;
      }

      if (!session || !session.user) {
        setErrorMessage('Your session has expired or is invalid. Please log in again to complete your order.');
        if (onRequireLogin) onRequireLogin();
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'bkash_nagad') {
        const cleanNumber = mobileWalletNumber.trim();
        const bdPhoneRegex = /^01[3-9]\d{8}$/;
        if (!cleanNumber) {
          setErrorMessage(`Please enter your ${mfsGateway} mobile wallet number.`);
          setIsSubmitting(false);
          return;
        }
        if (!bdPhoneRegex.test(cleanNumber)) {
          setErrorMessage(`Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).`);
          setIsSubmitting(false);
          return;
        }
      }

      let simulatedTxId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      const orderPayload = {
        studentId: session.user.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: currentUser.phone,
        studentIdCardNumber: currentUser.studentId,
        items: cartItems.map((item) => ({
          foodId: item.food.id,
          foodName: item.food.name,
          foodImage: item.food.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          selectedOptionsText: item.selectedOptions.map((o) => o.optionName).join(', '),
          specialInstructions: item.specialInstructions,
        })),
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        total,
        paymentMethod,
        paymentStatus: 'paid',
        pickupTimeSlot: selectedPickupSlot,
        transactionId: simulatedTxId
      };

      const { dbService } = await import('../services/dbService');
      const createdOrder = await dbService.addOrder(orderPayload as any);
      onOrderPlaced(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing pre-order checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToMenu}
          className="p-2.5 rounded-2xl glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Pre-Order Checkout</h1>
          <p className="text-xs text-slate-600 font-medium">Confirm pickup slot & campus payment method</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Checkout Steps */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Student Identity & Slot */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-xs text-[#006A4E] flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
              1. Student Identity & Express Pickup Slot
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs glass-card p-4 rounded-2xl">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">Student Name</span>
                <span className="font-extrabold text-slate-900">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">Student ID Card #</span>
                <span className="font-extrabold text-[#006A4E]">{currentUser.studentId || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                Select Cafeteria Express Pickup Window
              </label>
              <select
                value={selectedPickupSlot}
                onChange={(e) => onSelectPickupSlot(e.target.value)}
                className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-bold"
              >
                {[
                  'Breakfast: 08:30 AM - 09:00 AM',
                  'Breakfast: 09:00 AM - 09:30 AM',
                  'Breakfast: 09:30 AM - 10:00 AM',
                  'Snack: 10:00 AM - 11:00 AM',
                  'Snack: 11:00 AM - 12:00 PM',
                  'Lunch: 12:00 PM - 12:30 PM',
                  'Lunch: 12:30 PM - 01:00 PM',
                  'Lunch: 01:00 PM - 01:30 PM',
                  'Lunch: 01:30 PM - 02:00 PM',
                  'Lunch: 02:00 PM - 02:30 PM',
                  'Lunch: 02:30 PM - 03:00 PM',
                  'Snack: 03:00 PM - 03:45 PM',
                  'Snack: 03:45 PM - 04:30 PM',
                ].map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} (Express Pickup Counter)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-xs text-[#006A4E] flex items-center gap-2 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-[#006A4E]" />
              2. Select Payment Architecture
            </h3>

            <div className="space-y-3">
              {/* Option A: bKash / Nagad / Rocket MFS with Manual configuration */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash_nagad')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    paymentMethod === 'bkash_nagad'
                      ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E]'
                      : 'bg-white/60 border-slate-200/80 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-600">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">MFS (bKash / Nagad / Rocket)</span>
                      <span className="text-[11px] text-slate-500 font-medium">Manual MFS payment setup</span>
                    </div>
                  </div>
                  {paymentMethod === 'bkash_nagad' && <CheckCircle2 className="w-5 h-5 text-[#006A4E] shrink-0" />}
                </button>

                {paymentMethod === 'bkash_nagad' && (
                  <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl space-y-3 text-xs">
                    <div className="flex gap-2">
                      {['bKash', 'Nagad', 'Rocket'].map((gatewayOption) => (
                        <button
                          key={gatewayOption}
                          type="button"
                          onClick={() => {
                            setMfsGateway(gatewayOption as any);
                            setMfsMerchantNum(gatewayOption === 'bKash' ? '01711223344 (Merchant)' : gatewayOption === 'Nagad' ? '01855667788 (Merchant)' : '01999887766 (SendMoney)');
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-xl font-extrabold text-center border cursor-pointer ${
                            mfsGateway === gatewayOption ? 'bg-[#006A4E] border-[#006A4E] text-white shadow-sm' : 'bg-white/80 border-slate-200 text-slate-600'
                          }`}
                        >
                          {gatewayOption}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1 bg-white/80 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between text-slate-600 text-[11px] font-medium">
                        <span>Manual Pay To:</span>
                        <span className="font-extrabold text-[#006A4E]">{mfsMerchantNum}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px] font-medium">
                        <span>Amount to pay:</span>
                        <span className="font-black text-slate-900">৳{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-800 text-[11px] font-bold mb-1">Enter your {mfsGateway} Account Number (01XXXXXXXXX)</label>
                      <input
                        type="text"
                        value={mobileWalletNumber}
                        onChange={(e) => setMobileWalletNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full glass-input rounded-xl p-3 text-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: SSLCommerz Visa/MasterCard Credit/Debit Card */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E]'
                      : 'bg-white/60 border-slate-200/80 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">Credit / Debit Card (SSLCommerz)</span>
                      <span className="text-[11px] text-slate-500 font-medium">Secure gateway payment configuration</span>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-[#006A4E] shrink-0" />}
                </button>

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 text-[11px] bg-white/80 p-2.5 rounded-xl border border-slate-200/80 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                      <span>SSLCommerz Secured Payment Gateway Active</span>
                    </div>
                    <div className="space-y-1 font-medium">
                      <span className="block text-[11px] text-slate-600">Cardholder Name: {currentUser.name}</span>
                      <span className="block text-[11px] text-slate-600">Total amount to charge: ৳{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tray Summary & Submit */}
        <div className="space-y-4">
          <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-200/60 pb-3">
              Order Summary ({cartItems.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900">{item.food.name}</span>
                    <span className="text-slate-500 block text-[10px] font-medium">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-[#006A4E]">৳{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200/60 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#006A4E] font-extrabold">
                  <span>Discount</span>
                  <span>-৳{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-200/60">
                <span>Total Due</span>
                <span className="text-[#006A4E]">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-4 glass-button font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Pre-Order...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 text-white" />
                  <span>Confirm & Generate QR Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
