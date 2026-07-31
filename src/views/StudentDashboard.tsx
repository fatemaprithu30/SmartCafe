import React, { useState } from 'react';
import {
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Star,
  Heart,
  Flame,
  Wallet,
  ShieldCheck,
  User,
  Volume2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Order, OrderStatus, UserProfile, FoodItem, Review } from '../types';

interface StudentDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  onRefreshOrders: () => void;
  onReOrder: (items: any[]) => void;
  onTopUpWallet: (amount: number) => void;
  activeTabSub: 'orders' | 'favorites' | 'reviews' | 'profile';
  setActiveTabSub: (tab: 'orders' | 'favorites' | 'reviews' | 'profile') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  orders,
  onRefreshOrders,
  onReOrder,
  onTopUpWallet,
  activeTabSub,
  setActiveTabSub,
}) => {
  const [selectedQrOrder, setSelectedQrOrder] = useState<Order | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const myOrders = orders.filter((o) => o.studentId === currentUser.id);
  const activeOrders = myOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.orderStatus));
  const completedOrders = myOrders.filter((o) => o.orderStatus === 'completed');

  const activeReadyOrder = activeOrders.find((o) => o.orderStatus === 'ready');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Received by Kitchen
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            Kitchen Cooking Now
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            READY AT COUNTER 1
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400">
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
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: reviewModalOrder.items[0]?.foodId || 'food_1',
          foodName: reviewModalOrder.items[0]?.foodName || 'Campus Meal',
          studentId: currentUser.id,
          studentName: currentUser.name,
          rating: ratingInput,
          comment: reviewComment,
        }),
      });
      setReviewModalOrder(null);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 font-black text-xl flex items-center justify-center shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                Student ID: {currentUser.studentId}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{currentUser.department}</p>
          </div>
        </div>

        {/* Student Wallet Quick Card */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center gap-4 w-full md:w-auto shrink-0">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">
              Student ID Wallet Balance
            </span>
            <span className="text-2xl font-black text-amber-400">${currentUser.walletBalance.toFixed(2)}</span>
          </div>
          <button
            onClick={() => onTopUpWallet(20)}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Top Up $20</span>
          </button>
        </div>
      </div>

      {/* Ready Order Floating Alert Banner */}
      {activeReadyOrder && (
        <div className="bg-emerald-500/15 border-2 border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500 text-stone-950 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-300 text-sm">Your Order #{activeReadyOrder.orderNumber} is READY!</h3>
              <p className="text-xs text-stone-300">
                Pickup Slot: {activeReadyOrder.pickupTimeSlot} @ Express Counter 1. Show your QR Code.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedQrOrder(activeReadyOrder)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition-colors shrink-0 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Pickup QR Code</span>
          </button>
        </div>
      )}

      {/* Dashboard Nav Tabs */}
      <div className="flex border-b border-stone-800 text-xs font-semibold gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTabSub('orders')}
          className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTabSub === 'orders'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          My Pre-Orders & Live Tracking ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTabSub('reviews')}
          className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTabSub === 'reviews'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          My Ratings & Reviews
        </button>
        <button
          onClick={() => setActiveTabSub('profile')}
          className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTabSub === 'profile'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          Dietary Preferences & Allergens
        </button>
      </div>

      {/* Sub Tab 1: Orders & Realtime Tracker */}
      {activeTabSub === 'orders' && (
        <div className="space-y-6">
          {myOrders.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No active pre-orders</h3>
              <p className="text-xs text-stone-400">
                You haven't placed any cafeteria pre-orders yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-base">{ord.orderNumber}</span>
                        {getStatusBadge(ord.orderStatus)}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        Placed on {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Slot: {ord.pickupTimeSlot}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQrOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-stone-700"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Pickup QR</span>
                      </button>

                      {ord.orderStatus === 'completed' && (
                        <button
                          onClick={() => setReviewModalOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rate Meal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                      Real-Time Kitchen Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div
                        className={`p-2 rounded-lg border ${
                          ['pending', 'preparing', 'ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-900 border-stone-800 text-stone-600'
                        }`}
                      >
                        1. Received
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          ['preparing', 'ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-900 border-stone-800 text-stone-600'
                        }`}
                      >
                        2. Cooking
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          ['ready', 'completed'].includes(ord.orderStatus)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-stone-900 border-stone-800 text-stone-600'
                        }`}
                      >
                        3. Ready
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          ord.orderStatus === 'completed'
                            ? 'bg-stone-800 border-stone-700 text-stone-200'
                            : 'bg-stone-900 border-stone-800 text-stone-600'
                        }`}
                      >
                        4. Collected
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-stone-300">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{it.quantity}x</span>
                          <span>{it.foodName}</span>
                          {it.selectedOptionsText && (
                            <span className="text-[10px] text-stone-500">({it.selectedOptionsText})</span>
                          )}
                        </div>
                        <span className="font-bold text-amber-400">${it.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                    <span className="text-stone-400">Total Paid: <strong className="text-white">${ord.total.toFixed(2)}</strong> ({ord.paymentMethod.replace('_', ' ')})</span>
                    <button
                      onClick={() => onReOrder(ord.items)}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
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
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">My Cafeteria Meal Ratings</h3>
          <p className="text-xs text-stone-400">
            Ratings help our kitchen staff improve taste, spice levels, and turnaround times.
          </p>
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400">
            Select an order from the "My Pre-Orders" tab above to leave a review.
          </div>
        </div>
      )}

      {/* Sub Tab 3: Dietary Preferences */}
      {activeTabSub === 'profile' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-white text-base">Dietary Restrictions & Daily Calorie Goal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <span className="font-bold text-amber-400 block uppercase">Allergens & Halal Settings</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-stone-300">
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                  <span>Only display 100% Halal certified options</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                  <span>Alert me if dish contains Peanuts</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input type="checkbox" className="accent-amber-500" />
                  <span>Alert me if dish contains Dairy</span>
                </label>
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <span className="font-bold text-amber-400 block uppercase">Daily Calorie Target</span>
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                <input
                  type="number"
                  defaultValue={currentUser.dietaryPreferences.dailyCalorieTarget}
                  className="bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-white font-bold w-32 focus:outline-none focus:border-amber-500"
                />
                <span className="text-stone-400">kcal / day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup QR Code Modal */}
      {selectedQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 text-center space-y-5">
            <button
              onClick={() => setSelectedQrOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Cafeteria Pickup Pass
              </span>
              <h3 className="text-lg font-black text-white">Order #{selectedQrOrder.orderNumber}</h3>
              <p className="text-xs text-stone-400">Express Counter 1 • Slot: {selectedQrOrder.pickupTimeSlot}</p>
            </div>

            {/* Simulated High-Res QR Code */}
            <div className="bg-white p-6 rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-xl border-4 border-amber-400">
              <QrCode className="w-40 h-40 text-stone-950" />
              <span className="text-[9px] font-mono font-bold text-stone-950 mt-1">{selectedQrOrder.qrCodeData}</span>
            </div>

            <p className="text-xs text-stone-300">
              Show this screen to the counter staff at Express Pickup 1 to collect your meal.
            </p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setReviewModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="font-bold text-white text-base">Rate Meal: {reviewModalOrder.items[0]?.foodName}</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-semibold">Select Rating</label>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-semibold">Comment / Taste Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the temperature, taste, and pickup speed?"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors"
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
