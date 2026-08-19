import React, { useState } from 'react';
import { X, Trash2, Clock, Ticket, ShoppingBag, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  selectedPickupSlot: string;
  onSelectPickupSlot: (slot: string) => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
  dailyCalorieTarget?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  selectedPickupSlot,
  onSelectPickupSlot,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
  dailyCalorieTarget = 2000,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  // Total Calories calculation
  const totalCalories = cartItems.reduce((acc, item) => {
    const itemCalories = item.food.nutrition?.calories || 0;
    return acc + (itemCalories * item.quantity);
  }, 0);

  const caloriePercentage = Math.min(100, (totalCalories / dailyCalorieTarget) * 100);

  // Available pickup time slots categorized by Breakfast, Lunch, and Snacks
  const timeSlots = [
    'Breakfast: 08:30 AM - 09:00 AM',
    'Breakfast: 09:00 AM - 09:30 AM',
    'Breakfast: 09:30 AM - 10:00 AM',
    'Snacks: 10:00 AM - 11:00 AM',
    'Snacks: 11:00 AM - 12:00 PM',
    'Lunch: 12:00 PM - 12:30 PM',
    'Lunch: 12:30 PM - 01:00 PM',
    'Lunch: 01:00 PM - 01:30 PM',
    'Lunch: 01:30 PM - 02:00 PM',
    'Lunch: 02:00 PM - 02:30 PM',
    'Lunch: 02:30 PM - 03:00 PM',
    'Snacks: 03:00 PM - 03:45 PM',
    'Snacks: 03:45 PM - 04:30 PM',
  ];

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await onApplyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white">Your Pre-Order Tray</h2>
            <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full font-bold text-amber-400">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-stone-300 font-semibold text-sm">Your tray is empty</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Browse our menu to pre-order fresh cafeteria meals and skip the GUB lunch line.
              </p>
            </div>
          ) : (
            <>
              {/* Pickup Time Slot Picker */}
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Select Cafeteria Pickup Time Slot
                </label>
                <select
                  value={selectedPickupSlot}
                  onChange={(e) => onSelectPickupSlot(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 font-semibold focus:border-amber-500 focus:outline-none"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Express Pickup Counter)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500">
                  ⚡ Pre-ordering guarantees your meal is hot & packaged when you arrive.
                </p>
              </div>

              {/* Total Calories Progress Bar */}
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Total Calories in Cart
                  </span>
                  <span className="font-bold text-amber-400">{totalCalories} / {dailyCalorieTarget} kcal</span>
                </div>
                <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${caloriePercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  Daily calorie budget tracking computed on chosen menu item specs.
                </p>
              </div>

              {/* Item List */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-950/70 rounded-xl border border-stone-800/80 flex gap-3 items-start"
                  >
                    <img
                      src={item.food.imageUrl}
                      alt={item.food.name}
                      className="w-16 h-16 object-cover rounded-lg bg-stone-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-stone-100 truncate">{item.food.name}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-500 hover:text-red-400 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                          {item.selectedOptions.map((o) => `${o.optionName} (+৳${o.price})`).join(', ')}
                        </p>
                      )}

                      {item.specialInstructions && (
                        <p className="text-[10px] text-amber-400/80 italic line-clamp-1 mt-0.5">
                          "{item.specialInstructions}"
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-amber-400 text-xs">
                          ৳{item.totalPrice.toFixed(2)}
                        </span>

                        <div className="flex items-center border border-stone-800 bg-stone-900 rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-l-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-r-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  Have a Promo Code? (Try: WELCOME10)
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Code: {appliedCoupon.code} (-৳{appliedCoupon.discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs text-stone-400 hover:text-red-400 underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 uppercase focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Student Coupon Discount</span>
                  <span>-৳{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-100 font-black text-base pt-2 border-t border-stone-800">
                <span>Total Pre-Order</span>
                <span className="text-amber-400">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
