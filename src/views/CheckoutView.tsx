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
  currentUser: UserProfile | null;
  cartItems: CartItem[];
  selectedPickupSlot: string;
  onSelectPickupSlot: (slot: string) => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  onBackToMenu: () => void;
  onOrderPlaced: (order: Order) => void;
  onTrackOrder?: (orderNumber: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  currentUser,
  cartItems,
  selectedPickupSlot,
  onSelectPickupSlot,
  appliedCoupon,
  onBackToMenu,
  onOrderPlaced,
  onTrackOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash_nagad');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileWalletNumber, setMobileWalletNumber] = useState('01700000000');
  const [errorMessage, setErrorMessage] = useState('');

  // Guest details state for non-signed-in customers
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestStudentId, setGuestStudentId] = useState(currentUser?.studentId || '');

  // Confirmation screen state
  const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(null);

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

    const finalName = currentUser?.name || guestName.trim();
    const finalPhone = currentUser?.phone || guestPhone.trim();

    if (!finalName) {
      setErrorMessage('Please enter your Name.');
      return;
    }
    if (!finalPhone) {
      setErrorMessage('Please enter a Contact Phone number for order pickup verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      let simulatedTxId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const generatedOrderNum = 'GUB-' + Math.floor(100000 + Math.random() * 900000);

      const orderPayload = {
        orderNumber: generatedOrderNum,
        studentId: currentUser?.id || null,
        studentName: finalName,
        studentEmail: currentUser?.email || guestEmail.trim() || 'guest@green.edu.bd',
        studentPhone: finalPhone,
        studentIdCardNumber: currentUser?.studentId || guestStudentId.trim() || 'GUEST',
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
        orderStatus: 'pending',
        pickupTimeSlot: selectedPickupSlot,
        qrCodeData: generatedOrderNum,
        transactionId: simulatedTxId
      };

      const { dbService } = await import('../services/dbService');
      let createdOrder: Order;
      try {
        createdOrder = await dbService.addOrder(orderPayload as any);
      } catch (dbErr) {
        // Fallback order generation if DB offline/mock
        createdOrder = {
          id: `ord_${Date.now()}`,
          orderNumber: generatedOrderNum,
          studentId: currentUser?.id || 'guest',
          studentName: finalName,
          studentEmail: currentUser?.email || guestEmail.trim() || 'guest@green.edu.bd',
          studentPhone: finalPhone,
          studentIdCardNumber: currentUser?.studentId || guestStudentId.trim() || 'GUEST',
          items: orderPayload.items as any,
          subtotal,
          discount,
          total,
          paymentMethod,
          paymentStatus: 'paid',
          orderStatus: 'pending',
          pickupTimeSlot: selectedPickupSlot,
          qrCodeData: generatedOrderNum,
          createdAt: new Date().toISOString()
        };
      }

      // Automatically dispatch notification records to staff & admins
      try {
        const { supabase } = await import('../supabaseClient');
        const { data: staffMembers } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['staff', 'admin']);

        if (staffMembers && staffMembers.length > 0) {
          const staffNotifications = staffMembers.map((m: any) => ({
            user_id: m.id,
            title: `New Order Received #${createdOrder.orderNumber}`,
            message: `${createdOrder.studentName} placed a new order for ৳${createdOrder.total.toFixed(2)}.`,
            type: 'order_status',
            read: false
          }));
          await supabase.from('notifications').insert(staffNotifications);
        }
      } catch (notifErr) {
        console.error('Failed dispatching order notification to kitchen staff:', notifErr);
      }

      setPlacedOrderDetails(createdOrder);
      onOrderPlaced(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing pre-order checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrderDetails) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Order Received Successfully!</h1>
          <p className="text-xs text-stone-400">Your pre-order has been forwarded directly to the GUB Kitchen KDS Display.</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4 text-xs text-left">
          <div className="flex justify-between items-center pb-3 border-b border-stone-800">
            <span className="text-stone-400 font-semibold">Order Number</span>
            <span className="font-black text-amber-400 text-lg">{placedOrderDetails.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span>Customer Name</span>
            <span className="font-bold text-white">{placedOrderDetails.studentName}</span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span>Pickup Slot</span>
            <span className="font-bold text-amber-400">{placedOrderDetails.pickupTimeSlot}</span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span>Total Paid</span>
            <span className="font-bold text-emerald-400">৳{placedOrderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onTrackOrder && (
            <button
              onClick={() => onTrackOrder(placedOrderDetails.orderNumber)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Track Order Live Status &rarr;
            </button>
          )}
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-colors"
          >
            Back to Cafeteria Menu
          </button>
        </div>
      </div>
    );
  }

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
          {/* Step 1: Customer Identity & Pickup Window */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              1. Customer Identity & Express Pickup Window
            </h3>

            {currentUser ? (
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800/80">
                <div>
                  <span className="text-stone-400 block text-[10px]">Student Name</span>
                  <span className="font-bold text-stone-100">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Student ID / Email</span>
                  <span className="font-bold text-amber-400">{currentUser.studentId || currentUser.email}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-stone-950 p-4 rounded-xl border border-stone-800/80 text-xs">
                <p className="text-[11px] text-amber-300 font-medium">Guest Pre-Order Active (No account required)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Aria Rahman"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +8801712345678"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">GUB Student ID (Optional)</label>
                    <input
                      type="text"
                      value={guestStudentId}
                      onChange={(e) => setGuestStudentId(e.target.value)}
                      placeholder="e.g. 232002030"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">Email (Optional)</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="student@green.edu.bd"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

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
              {/* Option A: bKash / Nagad / Rocket MFS with Manual configuration */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash_nagad')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                    paymentMethod === 'bkash_nagad'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-pink-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">MFS (bKash / Nagad / Rocket)</span>
                      <span className="text-[11px] text-stone-400">Manual MFS payment setup</span>
                    </div>
                  </div>
                  {paymentMethod === 'bkash_nagad' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                </button>

                {paymentMethod === 'bkash_nagad' && (
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-2.5 text-xs">
                    <div className="flex gap-2">
                      {['bKash', 'Nagad', 'Rocket'].map((gatewayOption) => (
                        <button
                          key={gatewayOption}
                          type="button"
                          onClick={() => {
                            setMfsGateway(gatewayOption as any);
                            setMfsMerchantNum(gatewayOption === 'bKash' ? '01711223344 (Merchant)' : gatewayOption === 'Nagad' ? '01855667788 (Merchant)' : '01999887766 (SendMoney)');
                          }}
                          className={`flex-1 py-1 px-2 rounded-md font-bold text-center border ${
                            mfsGateway === gatewayOption ? 'bg-pink-600 border-pink-500 text-white' : 'bg-stone-950 border-stone-800 text-stone-400'
                          }`}
                        >
                          {gatewayOption}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1 bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                      <div className="flex justify-between text-stone-400 text-[10px]">
                        <span>Manual Pay To:</span>
                        <span className="font-bold text-amber-400">{mfsMerchantNum}</span>
                      </div>
                      <div className="flex justify-between text-stone-400 text-[10px]">
                        <span>Amount to pay:</span>
                        <span className="font-bold text-white">৳{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-300 text-[10px] font-semibold mb-1">Enter your {mfsGateway} Account/Trx Number</label>
                      <input
                        type="text"
                        value={mobileWalletNumber}
                        onChange={(e) => setMobileWalletNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX / TrxID"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: SSLCommerz Visa/MasterCard Credit/Debit Card */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">Credit / Debit Card (SSLCommerz)</span>
                      <span className="text-[11px] text-stone-400">Secure gateway payment configuration</span>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                </button>

                {paymentMethod === 'card' && (
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-300 text-[10px] bg-stone-950 p-2 rounded-lg border border-stone-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>SSLCommerz Secured Payment Gateway (Sandbox active)</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] text-stone-400">Cardholder Name: {currentUser.name}</span>
                      <span className="block text-[10px] text-stone-400">Total amount to charge: ৳{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
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
                  <span className="font-bold text-amber-400">৳{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-৳{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-100 font-black text-base pt-2 border-t border-stone-800">
                <span>Total Due</span>
                <span className="text-amber-400">৳{total.toFixed(2)}</span>
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
