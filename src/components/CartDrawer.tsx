import React from 'react';
import { X, Trash2, Clock, ShoppingBag, ArrowRight, Flame } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  selectedPickupSlot: string;
  onSelectPickupSlot: (slot: string) => void;
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
  onProceedToCheckout,
  dailyCalorieTarget = 2000,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = subtotal;

  // Total Calories calculation
  const totalCalories = cartItems.reduce((acc, item) => {
    const itemCalories = item.food.nutrition?.calories || 0;
    return acc + (itemCalories * item.quantity);
  }, 0);

  const caloriePercentage = Math.min(100, (totalCalories / dailyCalorieTarget) * 100);

  // Available pickup time slots categorized by Breakfast, Lunch, and Snack
  const timeSlots = [
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-modal border-l border-white/80 text-slate-900 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 bg-white/70 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#006A4E] flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-black text-base text-slate-900">Your Pre-Order Tray</h2>
            <span className="text-xs bg-[#006A4E] px-2.5 py-0.5 rounded-full font-black text-white">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mx-auto text-[#006A4E]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-900 font-extrabold text-base">Your tray is empty</p>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                Browse our menu to pre-order fresh cafeteria meals and skip the GUB lunch line.
              </p>
            </div>
          ) : (
            <>
              {/* Pickup Time Slot Picker */}
              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <label className="text-xs font-black text-[#006A4E] flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#006A4E]" />
                  Select Cafeteria Pickup Time Slot
                </label>
                <select
                  value={selectedPickupSlot}
                  onChange={(e) => onSelectPickupSlot(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs text-slate-900 font-bold"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Express Pickup Counter)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-medium">
                  ⚡ Pre-ordering guarantees your meal is hot & packaged when you arrive.
                </p>
              </div>

              {/* Total Calories Progress Bar */}
              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-[#F59E0B]" />
                    Total Calories in Cart
                  </span>
                  <span className="font-black text-[#006A4E]">{totalCalories} / {dailyCalorieTarget} kcal</span>
                </div>
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#22C55E] via-[#F59E0B] to-red-500 h-full transition-all duration-300"
                    style={{ width: `${caloriePercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Daily calorie budget tracking computed on chosen menu item specs.
                </p>
              </div>

              {/* Item List */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 glass-card rounded-2xl flex gap-3.5 items-start"
                  >
                    <img
                      src={item.food.imageUrl}
                      alt={item.food.name}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.food.name}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                          {item.selectedOptions.map((o) => `${o.optionName} (+৳${o.price})`).join(', ')}
                        </p>
                      )}

                      {item.specialInstructions && (
                        <p className="text-[10px] text-[#006A4E] italic line-clamp-1 mt-0.5 font-semibold">
                          "{item.specialInstructions}"
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        <span className="font-black text-[#006A4E] text-xs">
                          ৳{item.totalPrice.toFixed(2)}
                        </span>

                        <div className="flex items-center border border-slate-200/80 bg-white/80 rounded-xl">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-l-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-r-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-white/70 border-t border-slate-200/60 space-y-3.5">
            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-200/60">
                <span>Total Pre-Order</span>
                <span className="text-[#006A4E]">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 glass-button font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
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
