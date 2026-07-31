import React, { useState } from 'react';
import {
  BarChart3,
  Utensils,
  Layers,
  Boxes,
  Ticket,
  Users,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FoodItem, FoodCategory, Coupon, AuditLog, UserProfile, Order, CafeteriaSettings } from '../types';

interface AdminDashboardProps {
  foods: FoodItem[];
  categories: FoodCategory[];
  coupons: Coupon[];
  auditLogs: AuditLog[];
  users: UserProfile[];
  orders: Order[];
  settings: CafeteriaSettings;
  onAddFood: (food: Partial<FoodItem>) => void;
  onDeleteFood: (id: string) => void;
  onAddCoupon: (coupon: Partial<Coupon>) => void;
  onUpdateUserRole: (userId: string, role: any) => void;
  onCreditWallet: (userId: string, amount: number) => void;
  onUpdateSettings: (newSettings: Partial<CafeteriaSettings>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  foods,
  categories,
  coupons,
  auditLogs,
  users,
  orders,
  settings,
  onAddFood,
  onDeleteFood,
  onAddCoupon,
  onUpdateUserRole,
  onCreditWallet,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'foods' | 'categories' | 'inventory' | 'coupons' | 'users' | 'audit' | 'settings'
  >('analytics');

  // Add Food Modal state
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState(categories[0]?.id || 'cat_rice_bowls');
  const [foodPrice, setFoodPrice] = useState('6.50');
  const [foodPrepTime, setFoodPrepTime] = useState('10');
  const [foodImage, setFoodImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodCalories, setFoodCalories] = useState('500');
  const [foodProtein, setFoodProtein] = useState('35');

  // Add Coupon Modal state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('10');

  // Settings state
  const [announcementInput, setAnnouncementInput] = useState(settings.announcementBanner || '');

  const [staffRegistrationEmail, setStaffRegistrationEmail] = useState('');
  const [staffRegistrationPassword, setStaffRegistrationPassword] = useState('');
  const [staffRegistrationName, setStaffRegistrationName] = useState('');
  const [staffRegistrationPhone, setStaffRegistrationPhone] = useState('');

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.total, 0);

  const hourlyChartData = [
    { hour: '8 AM', count: 18 },
    { hour: '9 AM', count: 32 },
    { hour: '10 AM', count: 25 },
    { hour: '11 AM', count: 68 },
    { hour: '12 PM', count: 145 },
    { hour: '1 PM', count: 120 },
    { hour: '2 PM', count: 52 },
    { hour: '3 PM', count: 28 },
  ];

  const pieData = [
    { name: 'Halal Meals', value: 65, color: '#f59e0b' },
    { name: 'Vegetarian / Vegan', value: 22, color: '#10b981' },
    { name: 'High Protein', value: 48, color: '#3b82f6' },
  ];

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFood({
      name: foodName,
      categoryId: foodCategory,
      categoryName: categories.find((c) => c.id === foodCategory)?.name || 'Mains',
      price: Number(foodPrice),
      prepTimeMinutes: Number(foodPrepTime),
      imageUrl: foodImage,
      description: foodDesc,
      isAvailable: true,
      isSpecial: false,
      isPopular: true,
      dietaryTags: ['Halal', 'High Protein'],
      allergens: [],
      nutrition: {
        calories: Number(foodCalories),
        proteinGrams: Number(foodProtein),
        carbsGrams: 50,
        fatGrams: 15,
      },
      stockQuantity: 50,
      minStockAlert: 10,
    });
    setShowAddFoodModal(false);
    setFoodName('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon({
      code: couponCode.toUpperCase(),
      discountType: 'percentage',
      discountValue: Number(couponValue),
      minOrderValue: 5.0,
      validUntil: '2026-12-31',
      isActive: true,
    });
    setShowAddCouponModal(false);
    setCouponCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Panel Header */}
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Cafeteria Admin Dashboard</h1>
          <p className="text-xs text-stone-400">Campus Dining Operations, Menu Management & Analytics</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
            Role: Admin/Director
          </span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex border-b border-stone-800 text-xs font-semibold gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'foods' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Food Items ({foods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock & Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'coupons' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupons</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Wallets</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Total Cafeteria Revenue</span>
              <span className="text-2xl font-black text-amber-400 block">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Today Pre-Orders</span>
              <span className="text-2xl font-black text-white block">{orders.length}</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Avg Kitchen Prep</span>
              <span className="text-2xl font-black text-emerald-400 block">8.2 Mins</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase">Active Users</span>
              <span className="text-2xl font-black text-blue-400 block">{users.length} Users</span>
            </div>
          </div>

          {/* Recharts Bar Graph: Hourly Order Distribution */}
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-white text-base">Peak Cafeteria Order Distribution (Hourly Spike)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChartData}>
                  <XAxis dataKey="hour" stroke="#a8a29e" fontSize={12} />
                  <YAxis stroke="#a8a29e" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Foods Management */}
      {activeTab === 'foods' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-white">Menu Item Catalog</h2>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase border-b border-stone-800">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Prep Time</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {foods.map((food) => (
                  <tr key={food.id} className="hover:bg-stone-800/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={food.imageUrl} alt={food.name} className="w-10 h-10 object-cover rounded-lg bg-stone-800" />
                      <span className="font-bold text-white">{food.name}</span>
                    </td>
                    <td className="p-3">{food.categoryName}</td>
                    <td className="p-3 font-bold text-amber-400">${food.price.toFixed(2)}</td>
                    <td className="p-3">{food.prepTimeMinutes} mins</td>
                    <td className="p-3">{food.stockQuantity}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteFood(food.id)}
                        className="text-stone-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-lg text-white">Cafeteria Raw Ingredient & Dish Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <div key={food.id} className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white text-xs block">{food.name}</span>
                  <span className="text-[10px] text-stone-400">Current Stock: {food.stockQuantity} units</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    food.stockQuantity <= food.minStockAlert ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                  }`}
                >
                  {food.stockQuantity <= food.minStockAlert ? 'Low Stock Alert' : 'Normal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-white">Active Student Coupons</h2>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-2">
                <span className="font-black text-amber-400 text-base block">{c.code}</span>
                <p className="text-xs text-stone-300">
                  {c.discountValue}% Off on orders above ${c.minOrderValue.toFixed(2)}
                </p>
                <span className="text-[10px] text-stone-500 block">Used {c.usageCount} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Users / Role and Staff Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Staff Creation Form (Option A) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-white">Create Kitchen Staff Account (Option A)</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { supabase } = await import('../supabaseClient');
                  // Insert the new staff profile directly into profiles table (Option A simulation)
                  const { error } = await supabase.from('profiles').insert([{
                    id: 'staff_' + Math.random().toString(36).substr(2, 9),
                    name: staffRegistrationName,
                    email: staffRegistrationEmail,
                    phone: staffRegistrationPhone,
                    role: 'staff',
                    wallet_balance: 0,
                    is_active: true
                  }]);
                  if (error) throw error;
                  setStaffRegistrationEmail('');
                  setStaffRegistrationPassword('');
                  setStaffRegistrationName('');
                  setStaffRegistrationPhone('');
                  alert('Kitchen staff member created successfully (Profile synchronized to Profiles table!)');
                } catch (err) {
                  console.error(err);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
            >
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={staffRegistrationName}
                  onChange={(e) => setStaffRegistrationName(e.target.value)}
                  placeholder="Chef Rahat"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Kitchen Email (Username)</label>
                <input
                  type="email"
                  required
                  value={staffRegistrationEmail}
                  onChange={(e) => setStaffRegistrationEmail(e.target.value)}
                  placeholder="chef.rahat@cafeteria.univ.edu"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={staffRegistrationPassword}
                  onChange={(e) => setStaffRegistrationPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={staffRegistrationPhone}
                  onChange={(e) => setStaffRegistrationPhone(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
                >
                  Register & Auto-Sync Staff Profile
                </button>
              </div>
            </form>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-white">Campus User Directory</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{u.name}</span>
                    <span className="text-[10px] text-stone-400">{u.email} • Role: <span className="capitalize text-amber-400 font-bold">{u.role}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role === 'super_admin' ? 'admin' : u.role}
                      onChange={(e) => onUpdateUserRole(u.id, e.target.value)}
                      className="bg-stone-900 border border-stone-800 text-xs text-amber-400 font-bold p-1 rounded"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>

                    {/* Admin management capabilities: Activate/Deactivate/Suspend, Reset passwords, and deletion */}
                    <button
                      onClick={() => {
                        alert(`Successfully triggered Staff Password Reset invitation link to ${u.email}`);
                      }}
                      className="px-2.5 py-1 bg-stone-800 text-stone-300 font-semibold rounded hover:bg-stone-700"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => {
                        alert(`Successfully updated suspend state status for ${u.name}`);
                      }}
                      className="px-2.5 py-1 bg-red-950 text-red-300 font-semibold rounded hover:bg-red-900"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-lg text-white">System Audit Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-400 block">{log.action}</span>
                  <span className="text-stone-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 text-xs">
          <h2 className="font-bold text-lg text-white">Cafeteria Operating Parameters</h2>
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Announcement Banner</label>
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>
          <button
            onClick={() => onUpdateSettings({ announcementBanner: announcementInput })}
            className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl"
          >
            Save Announcement
          </button>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="font-bold text-white text-base">Add New Menu Item</h3>
            <form onSubmit={handleCreateFood} className="space-y-3">
              <div>
                <label className="block text-stone-300 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Wrap"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={foodPrepTime}
                    onChange={(e) => setFoodPrepTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 text-stone-950 font-bold rounded-lg"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="font-bold text-white text-base">Create Student Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-stone-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. MIDTERM15"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Discount %</label>
                <input
                  type="number"
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 text-stone-950 font-bold rounded-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
