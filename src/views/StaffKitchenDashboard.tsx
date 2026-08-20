import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  QrCode,
  Flame,
  Search,
} from 'lucide-react';
import { Order, OrderStatus, FoodItem } from '../types';

interface StaffKitchenDashboardProps {
  orders: Order[];
  foods: FoodItem[];
  reviews?: any[];
  onUpdateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    notes?: string,
    extraFields?: { cookingStation?: string; cookingStartedAt?: string; prepDurationMinutes?: number }
  ) => void;
  onUpdateStock: (foodId: string, isAvailable: boolean, stockQuantity?: number) => void;
  onLogOut: () => void;
}

export const StaffKitchenDashboard: React.FC<StaffKitchenDashboardProps> = ({
  orders,
  foods,
  reviews = [],
  onUpdateOrderStatus,
  onUpdateStock,
  onLogOut,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'feedback'>('queue');
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [prepTimes, setPrepTimes] = useState<{ [orderId: string]: number }>({});
  const [selectedStations, setSelectedStations] = useState<{ [orderId: string]: string }>({});

  // Live ticker for independent cooking timers
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const incomingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');

  // Auto-transition orders when cooking timer reaches 0
  React.useEffect(() => {
    preparingOrders.forEach((ord) => {
      const startTime = ord.cookingStartedAt ? new Date(ord.cookingStartedAt).getTime() : new Date(ord.createdAt).getTime();
      const prepMin = ord.prepDurationMinutes || 15;
      const totalSec = prepMin * 60;
      const elapsedSec = Math.floor((now - startTime) / 1000);
      const remainingSec = totalSec - elapsedSec;

      if (remainingSec <= 0) {
        onUpdateOrderStatus(
          ord.id,
          'ready',
          `Cooking timer completed (${prepMin} mins)`
        );
      }
    });
  }, [now, preparingOrders, onUpdateOrderStatus]);

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Kitchen Bump Bar Header */}
      <div className="glass-modal p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#006A4E] text-white font-black shadow-md shadow-emerald-900/20">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">GUB Kitchen Display System (KDS)</h1>
              <span className="px-3 py-0.5 rounded-full bg-[#006A4E]/10 text-[#006A4E] font-black text-xs border border-[#006A4E]/30">
                LIVE GUB KITCHEN
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Order Bump Bar & Real-time Counter Pickup Queue • Green University Of Bangladesh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setChimeEnabled(!chimeEnabled)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              chimeEnabled
                ? 'bg-[#006A4E]/10 border-[#006A4E]/30 text-[#006A4E]'
                : 'bg-white/60 border-slate-200 text-slate-500'
            }`}
          >
            {chimeEnabled ? <Volume2 className="w-4 h-4 text-[#006A4E]" /> : <VolumeX className="w-4 h-4" />}
            <span>{chimeEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue' ? 'glass-button shadow-md' : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            Bump Bar ({orders.filter((o) => o.orderStatus !== 'completed').length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'glass-button shadow-md' : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            Stock Toggles
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feedback' ? 'glass-button shadow-md' : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            Student Feedback ({reviews.length})
          </button>

          <button
            onClick={onLogOut}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        /* Kitchen 3-Column KanBan Queue */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Incoming Pre-Orders */}
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-3xl flex items-center justify-between text-slate-900">
              <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#006A4E]">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                1. Incoming Orders
              </span>
              <span className="bg-[#006A4E] text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                {incomingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {incomingOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 font-medium">No incoming pre-orders</p>
              ) : (
                incomingOrders.map((ord) => (
                  <div key={ord.id} className="glass-card p-5 rounded-3xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-start border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="font-black text-[#006A4E] text-sm block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {ord.studentName} • Slot: {ord.pickupTimeSlot}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-600 bg-white/80 border border-slate-200/80 px-2 py-1 rounded-lg">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-800">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-bold">
                          <span>
                            {it.quantity}x {it.foodName}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.kitchenNotes && (
                      <p className="text-[10px] text-[#006A4E] italic bg-white/80 p-2.5 rounded-xl border border-slate-200/80 font-semibold">
                        Note: {ord.kitchenNotes}
                      </p>
                    )}

                    <div className="space-y-2 bg-white/70 p-3 rounded-2xl border border-white/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-600 font-bold">Station:</span>
                        <select
                          value={selectedStations[ord.id] || 'Stove Station 1'}
                          onChange={(e) => setSelectedStations({ ...selectedStations, [ord.id]: e.target.value })}
                          className="glass-input rounded-xl p-1 text-xs text-[#006A4E] font-bold focus:outline-none"
                        >
                          <option value="Stove Station 1">Stove Station 1</option>
                          <option value="Stove Station 2">Stove Station 2</option>
                          <option value="Grill Station A">Grill Station A</option>
                          <option value="Grill Station B">Grill Station B</option>
                          <option value="Fryer / Express">Fryer / Express</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-600 font-bold">Timer Duration:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={prepTimes[ord.id] || 15}
                            onChange={(e) => setPrepTimes({ ...prepTimes, [ord.id]: Number(e.target.value) })}
                            className="w-14 glass-input rounded-xl p-1 text-center font-bold text-slate-900 text-xs"
                          />
                          <span className="text-[11px] text-slate-600 font-bold">Mins</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const prepMin = prepTimes[ord.id] || 15;
                        const station = selectedStations[ord.id] || 'Stove Station 1';
                        const readyDate = new Date(Date.now() + prepMin * 60000);
                        const estTimeStr = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        onUpdateOrderStatus(
                          ord.id,
                          'preparing',
                          `Station: ${station} | Est. prep: ${prepMin} mins (Ready ~ ${estTimeStr})`,
                          {
                            cookingStation: station,
                            cookingStartedAt: new Date().toISOString(),
                            prepDurationMinutes: prepMin,
                          }
                        );
                      }}
                      className="w-full py-3 glass-button font-black text-xs rounded-2xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-[#F59E0B]" />
                      <span>Accept & Start Cooking</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Currently Preparing */}
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-3xl flex items-center justify-between text-slate-900">
              <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#006A4E]">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                2. Cooking on Stove / Grill
              </span>
              <span className="bg-[#006A4E] text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {preparingOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 font-medium">No orders cooking currently</p>
              ) : (
                preparingOrders.map((ord) => {
                  const startTime = ord.cookingStartedAt ? new Date(ord.cookingStartedAt).getTime() : new Date(ord.createdAt).getTime();
                  const prepMin = ord.prepDurationMinutes || 15;
                  const totalSec = prepMin * 60;
                  const elapsedSec = Math.floor((now - startTime) / 1000);
                  const remainingSec = Math.max(0, totalSec - elapsedSec);
                  const displayMin = Math.floor(remainingSec / 60);
                  const displaySec = remainingSec % 60;

                  return (
                    <div key={ord.id} className="glass-card p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden">
                      <div className="flex justify-between items-start border-b border-slate-200/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#006A4E] text-sm block">{ord.orderNumber}</span>
                            <span className="text-[10px] font-extrabold bg-[#F59E0B]/15 text-amber-900 px-2 py-0.5 rounded-lg border border-[#F59E0B]/30">
                              {ord.cookingStation || 'Stove Station 1'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {ord.studentName} • Slot: {ord.pickupTimeSlot}
                          </span>
                        </div>
                      </div>

                      {/* Live Ticking Countdown Bar */}
                      <div className="bg-white/80 p-3 rounded-2xl border border-white/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                          <Clock className="w-4 h-4 text-[#006A4E] animate-spin" />
                          <span>Timer Remaining:</span>
                        </div>
                        <span className="font-mono text-base font-black text-[#006A4E]">
                          {String(displayMin).padStart(2, '0')}:{String(displaySec).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-800">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-bold">
                            <span>
                              {it.quantity}x {it.foodName}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'ready', 'Manual override ready')}
                        className="w-full py-3 bg-[#22C55E] hover:bg-[#16a34a] text-white font-black text-xs rounded-2xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Ready at Express Counter 1</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Ready Orders waiting for Pickup */}
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-3xl flex items-center justify-between text-slate-900">
              <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#006A4E]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                3. Ready for QR Pickup
              </span>
              <span className="bg-[#22C55E] text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 font-medium">No orders waiting at counter</p>
              ) : (
                readyOrders.map((ord) => (
                  <div key={ord.id} className="glass-card p-5 rounded-3xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-start border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="font-black text-[#006A4E] text-sm block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-800 font-bold">{ord.studentName}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#006A4E] bg-[#006A4E]/10 px-2.5 py-1 rounded-lg">
                        Counter 1
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700 font-medium">
                      {ord.items.map((it, idx) => (
                        <div key={idx}>
                          {it.quantity}x {it.foodName}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                      className="w-full py-2.5 bg-white/80 border border-slate-200 hover:bg-white text-slate-900 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-[#006A4E]" />
                      <span>Scan QR & Complete Pickup</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'feedback' ? (
        /* Student Feedback View for Kitchen Staff */
        <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-slate-900">Student Meal & Service Feedback</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Direct feedback and ratings from students to help improve preparation quality.
            </p>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-medium">No feedback submitted yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 glass-card rounded-2xl space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{rev.studentName}</span>
                      <span className="text-[#006A4E] font-bold">{rev.foodName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#F59E0B] font-black block">{rev.rating} ★</span>
                      <span className="text-[10px] text-slate-500 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-white/80 font-medium">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Kitchen Inventory Quick-Toggle */
        <div className="glass-modal rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Kitchen Menu Availability Switcher</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Mark items "Sold Out" instantly during GUB lunch rush to prevent student pre-orders.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search food item..."
                className="w-full glass-input rounded-2xl pl-10 p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 glass-card rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{food.name}</h4>
                    <span className="text-[10px] text-slate-500 block font-medium">Stock: {food.stockQuantity} units</span>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateStock(food.id, !food.isAvailable)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                    food.isAvailable
                      ? 'bg-[#22C55E]/15 text-[#006A4E] border border-[#22C55E]/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}
                >
                  {food.isAvailable ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
