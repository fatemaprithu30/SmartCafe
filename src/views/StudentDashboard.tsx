import React, { useState } from 'react';
import {
  Clock,
  QrCode,
  CheckCircle2,
  RotateCcw,
  Star,
  Flame,
} from 'lucide-react';
import { Order, OrderStatus, UserProfile } from '../types';

interface StudentDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  onRefreshOrders: () => void;
  onReOrder: (items: any[]) => void;
  onTopUpWallet: (amount: number) => void;
  activeTabSub: 'orders' | 'favorites' | 'reviews' | 'profile';
  setActiveTabSub: (tab: 'orders' | 'favorites' | 'reviews' | 'profile') => void;
  onUpdateCalorieTarget?: (newTarget: number) => Promise<void> | void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  orders,
  onRefreshOrders,
  onReOrder,
  onTopUpWallet,
  activeTabSub,
  setActiveTabSub,
  onUpdateCalorieTarget,
}) => {
  const [selectedQrOrder, setSelectedQrOrder] = useState<Order | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [calorieInputVal, setCalorieInputVal] = useState(
    String(currentUser.dietaryPreferences?.dailyCalorieTarget || 2000)
  );
  const [calorieSaveSuccess, setCalorieSaveSuccess] = useState('');

  const myOrders = orders.filter((o) => o.studentId === currentUser.id);
  const activeOrders = myOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.orderStatus));

  const activeReadyOrder = activeOrders.find((o) => o.orderStatus === 'ready');
  const activePreparingOrder = activeOrders.find((o) => o.orderStatus === 'preparing');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#F59E0B]/15 text-amber-900 border border-[#F59E0B]/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#F59E0B]" />
            Received by Kitchen
          </span>
        );
      case 'preparing':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#006A4E]/15 text-[#006A4E] border border-[#006A4E]/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3 text-[#006A4E]" />
            Kitchen Cooking Now
          </span>
        );
      case 'ready':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#22C55E]/20 text-[#006A4E] border border-[#22C55E]/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
            READY AT COUNTER 1
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/80 border border-slate-200 text-slate-500">
            Picked Up
          </span>
        );
      default:
        return null;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalOrder) return;

    try {
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase.from('reviews').insert([{
        food_id: reviewModalOrder.items[0]?.foodId || null,
        food_name: reviewModalOrder.items[0]?.foodName || 'Campus Meal',
        student_id: currentUser.id,
        student_name: currentUser.name,
        rating: ratingInput,
        comment: reviewComment
      }]);
      if (error) throw error;
      setReviewModalOrder(null);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="glass-modal p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#006A4E] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-900/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#006A4E]/10 text-[#006A4E] font-black text-[10px] uppercase border border-[#006A4E]/20">
                Student ID: {currentUser.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{currentUser.department}</p>
          </div>
        </div>
      </div>

      {/* Active Order Alert Banners */}
      {activeReadyOrder ? (
        <div className="bg-[#22C55E]/15 border-2 border-[#22C55E]/40 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#22C55E] text-white font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-[#006A4E] text-base">Your Order #{activeReadyOrder.orderNumber} is READY!</h3>
              <p className="text-xs text-slate-700 font-medium">
                Pickup Slot: {activeReadyOrder.pickupTimeSlot} @ Express Counter 1. Show your QR Code.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedQrOrder(activeReadyOrder)}
            className="px-6 py-3 rounded-2xl glass-button font-black text-xs transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Open Pickup QR Code</span>
          </button>
        </div>
      ) : activePreparingOrder ? (
        <div className="bg-[#F59E0B]/15 border-2 border-[#F59E0B]/40 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#F59E0B] text-slate-900 font-bold">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-amber-900 text-base">Order #{activePreparingOrder.orderNumber} is Cooking! 🔥</h3>
              <p className="text-xs text-slate-700 font-medium">
                Slot: {activePreparingOrder.pickupTimeSlot} • Kitchen is preparing your meal now. {activePreparingOrder.kitchenNotes ? `(${activePreparingOrder.kitchenNotes})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedQrOrder(activePreparingOrder)}
            className="px-6 py-3 rounded-2xl glass-button font-black text-xs transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>View Order Pass</span>
          </button>
        </div>
      ) : null}

      {/* Dashboard Nav Tabs */}
      <div className="flex glass-panel p-1.5 rounded-2xl text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTabSub('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTabSub === 'orders'
              ? 'bg-[#006A4E] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          My Pre-Orders & Live Tracking ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTabSub('reviews')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTabSub === 'reviews'
              ? 'bg-[#006A4E] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          My Ratings & Reviews
        </button>
        <button
          onClick={() => setActiveTabSub('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTabSub === 'profile'
              ? 'bg-[#006A4E] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          Dietary Preferences & Allergens
        </button>
      </div>

      {/* Sub Tab 1: Orders & Realtime Tracker */}
      {activeTabSub === 'orders' && (
        <div className="space-y-6">
          {myOrders.length === 0 ? (
            <div className="glass-modal rounded-3xl p-12 text-center space-y-3 shadow-lg">
              <Clock className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-black text-slate-900 text-lg">No active pre-orders</h3>
              <p className="text-xs text-slate-600 font-medium">
                You haven't placed any cafeteria pre-orders yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="glass-panel rounded-3xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#006A4E] text-lg">{ord.orderNumber}</span>
                        {getStatusBadge(ord.orderStatus)}
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">
                        Placed on {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Slot: {ord.pickupTimeSlot}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQrOrder(ord)}
                        className="px-4 py-2 rounded-xl glass-card hover:bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-[#006A4E]" />
                        <span>Pickup QR</span>
                      </button>

                      {ord.orderStatus === 'completed' && (
                        <button
                          onClick={() => setReviewModalOrder(ord)}
                          className="px-4 py-2 rounded-xl bg-white/80 border border-slate-200 hover:bg-white text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Rate Meal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="bg-white/70 p-4 rounded-2xl border border-white/80 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                      Real-Time Kitchen Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-extrabold">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          ['pending', 'preparing', 'ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E]'
                            : 'bg-white/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        1. Received
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border ${
                          ['preparing', 'ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E]'
                            : 'bg-white/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        2. Cooking
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border ${
                          ['ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-[#22C55E]/15 border-[#22C55E] text-[#006A4E]'
                            : 'bg-white/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        3. Ready
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border ${
                          ord.orderStatus === 'completed'
                            ? 'bg-slate-200 border-slate-300 text-slate-900'
                            : 'bg-white/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        4. Collected
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{it.quantity}x</span>
                          <span className="font-medium">{it.foodName}</span>
                          {it.selectedOptionsText && (
                            <span className="text-[10px] text-slate-500">({it.selectedOptionsText})</span>
                          )}
                        </div>
                        <span className="font-black text-[#006A4E]">৳{it.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-medium">
                    <span className="text-slate-600">Total Paid: <strong className="text-slate-900 font-bold">৳{ord.total.toFixed(2)}</strong> ({ord.paymentMethod.replace('_', ' ')})</span>
                    <button
                      onClick={() => onReOrder(ord.items)}
                      className="text-[#006A4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Order Same Meal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub Tab 2: Reviews */}
      {activeTabSub === 'reviews' && (
        <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-black text-slate-900 text-lg">My Cafeteria Meal Ratings</h3>
          <p className="text-xs text-slate-600 font-medium">
            Ratings help our kitchen staff improve taste, spice levels, and turnaround times.
          </p>
          <div className="p-5 bg-white/70 rounded-2xl border border-white/80 text-xs text-slate-600 font-medium">
            Select an order from the "My Pre-Orders" tab above to leave a review.
          </div>
        </div>
      )}

      {/* Sub Tab 3: Dietary Preferences */}
      {activeTabSub === 'profile' && (
        <div className="glass-modal rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="font-black text-slate-900 text-lg">Dietary Restrictions & Daily Calorie Goal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <span className="font-extrabold text-[#006A4E] block uppercase tracking-wider">Food Type Filters & Allergens</span>
              <div className="space-y-2.5 font-medium">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input type="checkbox" className="accent-[#006A4E]" />
                  <span>Vegetarian Preference</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input type="checkbox" className="accent-[#006A4E]" />
                  <span>High Protein Preference</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#006A4E]" />
                  <span>Alert me if dish contains Peanuts</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input type="checkbox" className="accent-[#006A4E]" />
                  <span>Alert me if dish contains Dairy</span>
                </label>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <span className="font-extrabold text-[#006A4E] block uppercase tracking-wider">Daily Calorie Target</span>
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <input
                  type="number"
                  value={calorieInputVal}
                  onChange={(e) => setCalorieInputVal(e.target.value)}
                  className="glass-input rounded-xl p-2.5 text-xs text-slate-900 font-bold w-32"
                />
                <span className="text-slate-600 font-bold">kcal / day</span>
                <button
                  type="button"
                  onClick={async () => {
                    const val = parseInt(calorieInputVal, 10);
                    if (!isNaN(val) && val > 0 && onUpdateCalorieTarget) {
                      await onUpdateCalorieTarget(val);
                      setCalorieSaveSuccess('Goal saved!');
                      setTimeout(() => setCalorieSaveSuccess(''), 3000);
                    }
                  }}
                  className="px-4 py-2.5 glass-button font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Save Goal
                </button>
              </div>
              {calorieSaveSuccess && (
                <p className="text-[#006A4E] text-xs font-black">{calorieSaveSuccess}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pickup QR Code Modal */}
      {selectedQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm glass-modal rounded-3xl shadow-2xl p-6 text-center space-y-5">
            <button
              onClick={() => setSelectedQrOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] uppercase font-black text-[#006A4E] tracking-wider">
                Cafeteria Pickup Pass
              </span>
              <h3 className="text-xl font-black text-slate-900">Order #{selectedQrOrder.orderNumber}</h3>
              <p className="text-xs text-slate-600 font-medium">Express Counter 1 • Slot: {selectedQrOrder.pickupTimeSlot}</p>
            </div>

            {/* Simulated High-Res QR Code */}
            <div className="bg-white p-6 rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-xl border-4 border-[#006A4E]">
              <QrCode className="w-40 h-40 text-slate-900" />
              <span className="text-[9px] font-mono font-bold text-slate-900 mt-1">{selectedQrOrder.qrCodeData}</span>
            </div>

            <p className="text-xs text-slate-700 font-medium">
              Show this screen to the counter staff at Express Pickup 1 to collect your meal.
            </p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-modal rounded-3xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setReviewModalOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-black text-slate-900 text-lg">Rate Meal: {reviewModalOrder.items[0]?.foodName}</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Select Rating</label>
                <div className="flex gap-2 text-[#F59E0B]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingInput ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Comment / Taste Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the temperature, taste, and pickup speed?"
                  className="w-full glass-input rounded-2xl p-3 text-xs text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 glass-button font-black text-xs rounded-2xl shadow-md cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
