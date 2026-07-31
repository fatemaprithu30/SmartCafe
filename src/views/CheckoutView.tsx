import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
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
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  currentUser,
  cartItems,
  selectedPickupSlot,
  onSelectPickupSlot,
  appliedCoupon,
  onBackToMenu,
  onOrderPlaced,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('student_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileWalletNumber, setMobileWalletNumber] = useState('01700000000');
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const isWalletSufficient = currentUser.walletBalance >= total;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your tray is empty');
      return;
    }

    if (paymentMethod === 'student_id' && !isWalletSufficient) {
      setErrorMessage(
        `Insufficient Student ID wallet balance ($${currentUser.walletBalance.toFixed(
          2
        )}). Please select bKash/Nagad or credit card.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        studentId: currentUser.id,
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
        paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
        pickupTimeSlot: selectedPickupSlot,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Failed to create order');

      const createdOrder: Order = await res.json();
      
      // If student id wallet, deduct balance client state
      if (paymentMethod === 'student_id') {
        currentUser.walletBalance -= total;
      }

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
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors border border-stone-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Pre-Order Checkout</h1>
          <p className="text-xs text-stone-400">Confirm pickup slot & campus payment method</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Checkout Steps */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Student Identity & Slot */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              1. Student Identity & Express Pickup Slot
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800/80">
              <div>
                <span className="text-stone-400 block text-[10px]">Student Name</span>
                <span className="font-bold text-stone-100">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Student ID Card #</span>
                <span className="font-bold text-amber-400">{currentUser.studentId || 'UG-2024-8842'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Select Cafeteria Express Pickup Window
              </label>
              <select
                value={selectedPickupSlot}
                onChange={(e) => onSelectPickupSlot(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
              >
                {[
                  '12:00 PM - 12:10 PM',
                  '12:10 PM - 12:20 PM',
                  '12:20 PM - 12:30 PM',
                  '12:30 PM - 12:40 PM',
                  '12:40 PM - 12:50 PM',
                  '01:00 PM - 01:10 PM',
                  '01:15 PM - 01:25 PM',
                ].map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} (Express Counter 1)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              2. Select Payment Architecture
            </h3>

            <div className="space-y-3">
              {/* Option A: Student ID Card Balance */}
              <button
                type="button"
                onClick={() => setPaymentMethod('student_id')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                  paymentMethod === 'student_id'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Student ID Card Wallet Balance</span>
                    <span className="text-[11px] text-stone-400">
                      Available Balance: ${currentUser.walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                {paymentMethod === 'student_id' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
              </button>

              {/* Option B: bKash / Nagad / Mobile Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash_nagad')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                  paymentMethod === 'bkash_nagad'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-pink-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">bKash / Nagad / Mobile Banking</span>
                    <span className="text-[11px] text-stone-400">Instant digital wallet checkout</span>
                  </div>
                </div>
                {paymentMethod === 'bkash_nagad' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
              </button>

              {/* Option C: Credit/Debit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-blue-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Credit / Debit Card (Visa/MasterCard)</span>
                    <span className="text-[11px] text-stone-400">Secure gateway payment</span>
                  </div>
                </div>
                {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tray Summary & Submit */}
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-stone-800 pb-2">
              Order Summary ({cartItems.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs text-stone-300">
                  <div>
                    <span className="font-semibold text-stone-100">{item.food.name}</span>
                    <span className="text-stone-500 block text-[10px]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-amber-400">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-100 font-black text-base pt-2 border-t border-stone-800">
                <span>Total Due</span>
                <span className="text-amber-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Pre-Order...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
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
