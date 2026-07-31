import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  QrCode,
  Flame,
  Search,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Order, OrderStatus, FoodItem } from '../types';

interface StaffKitchenDashboardProps {
  orders: Order[];
  foods: FoodItem[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  onUpdateStock: (foodId: string, isAvailable: boolean, stockQuantity?: number) => void;
}

export const StaffKitchenDashboard: React.FC<StaffKitchenDashboardProps> = ({
  orders,
  foods,
  onUpdateOrderStatus,
  onUpdateStock,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory'>('queue');
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');

  const incomingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Kitchen Bump Bar Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 p-6 rounded-3xl border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500 text-stone-950 font-black shadow-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Kitchen Display System (KDS)</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                LIVE KITCHEN
              </span>
            </div>
            <p className="text-xs text-stone-400">Order Bump Bar & Real-time Counter Pickup Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setChimeEnabled(!chimeEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              chimeEnabled
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
          >
            {chimeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{chimeEnabled ? 'Kitchen Sound On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'queue' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Order Bump Bar ({orders.filter((o) => o.orderStatus !== 'completed').length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'inventory' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Stock Toggles
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        /* Kitchen 3-Column KanBan Queue */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Incoming Pre-Orders */}
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between text-amber-300">
              <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                1. Incoming Orders
              </span>
              <span className="bg-amber-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full">
                {incomingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {incomingOrders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-8">No incoming pre-orders</p>
              ) : (
                incomingOrders.map((ord) => (
                  <div key={ord.id} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-start border-b border-stone-800 pb-2">
                      <div>
                        <span className="font-black text-amber-400 text-sm block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-stone-400">
                          {ord.studentName} • Slot: {ord.pickupTimeSlot}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-950 px-2 py-1 rounded">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-200">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-semibold">
                          <span>
                            {it.quantity}x {it.foodName}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.kitchenNotes && (
                      <p className="text-[10px] text-amber-400 italic bg-stone-950 p-2 rounded">
                        Note: {ord.kitchenNotes}
                      </p>
                    )}

                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Start Cooking Order</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Currently Preparing */}
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-2xl flex items-center justify-between text-blue-300">
              <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-blue-400" />
                2. Cooking on Stove / Grill
              </span>
              <span className="bg-blue-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {preparingOrders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-8">No orders cooking currently</p>
              ) : (
                preparingOrders.map((ord) => (
                  <div key={ord.id} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-start border-b border-stone-800 pb-2">
                      <div>
                        <span className="font-black text-blue-400 text-sm block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-stone-400">
                          {ord.studentName} • Slot: {ord.pickupTimeSlot}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-stone-950 px-2 py-1 rounded">
                        Target: {ord.estimatedReadyTime}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-200">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-semibold">
                          <span>
                            {it.quantity}x {it.foodName}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'ready')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready at Pickup Counter 1</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Ready Orders waiting for Pickup */}
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between text-emerald-300">
              <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3. Ready for QR Pickup
              </span>
              <span className="bg-emerald-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-8">No orders waiting at counter</p>
              ) : (
                readyOrders.map((ord) => (
                  <div key={ord.id} className="bg-stone-900 border border-emerald-500/40 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-start border-b border-stone-800 pb-2">
                      <div>
                        <span className="font-black text-emerald-400 text-sm block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-stone-300 font-bold">{ord.studentName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">
                        Counter 1
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-300">
                      {ord.items.map((it, idx) => (
                        <div key={idx}>
                          {it.quantity}x {it.foodName}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                      className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Scan QR & Complete Pickup</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Kitchen Inventory Quick-Toggle */
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Kitchen Menu Availability Switcher</h2>
              <p className="text-xs text-stone-400">
                Mark items "Sold Out" instantly during lunch rush to prevent student pre-orders.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search food item..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-12 h-12 object-cover rounded-xl bg-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{food.name}</h4>
                    <span className="text-[10px] text-stone-400 block">Stock: {food.stockQuantity} units</span>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateStock(food.id, !food.isAvailable)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                    food.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-950/80 text-red-300 border border-red-800'
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
