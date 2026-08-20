import React, { useState } from 'react';
import {
  BarChart3,
  Utensils,
  Boxes,
  Ticket,
  Users,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
  reviews?: any[];
  onAddFood: (food: Partial<FoodItem>) => void;
  onEditFood: (foodId: string, food: Partial<FoodItem>) => void;
  onDeleteFood: (id: string) => void;
  onAddCoupon: (coupon: Partial<Coupon>) => void;
  onUpdateUserRole: (userId: string, role: any) => void;
  onCreditWallet: (userId: string, amount: number) => void;
  onUpdateSettings: (newSettings: Partial<CafeteriaSettings>) => void;
  onApproveStudent: (userId: string) => void;
  onRejectStudent: (userId: string) => void;
  onUpdateStock: (foodId: string, stockQuantity: number) => void;
  onLogOut: () => void;
  onStaffCreated?: () => void;
  onToggleSuspendUser?: (userId: string, isActive: boolean) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleSpecial?: (foodId: string, isSpecial: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  foods,
  categories,
  coupons,
  auditLogs,
  users,
  orders,
  settings,
  reviews = [],
  onAddFood,
  onEditFood,
  onDeleteFood,
  onAddCoupon,
  onUpdateUserRole,
  onCreditWallet,
  onUpdateSettings,
  onApproveStudent,
  onRejectStudent,
  onUpdateStock,
  onLogOut,
  onStaffCreated,
  onToggleSuspendUser,
  onDeleteUser,
  onToggleSpecial,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'foods' | 'approvals' | 'inventory' | 'coupons' | 'users' | 'feedback' | 'audit' | 'settings'
  >('analytics');

  // Add/Edit Food Modal state
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodPrice, setFoodPrice] = useState('240.00');
  const [foodPrepTime, setFoodPrepTime] = useState('10');
  const [foodImage, setFoodImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodCalories, setFoodCalories] = useState('500');
  const [foodProtein, setFoodProtein] = useState('35');
  const [foodCarbs, setFoodCarbs] = useState('50');
  const [foodFats, setFoodFats] = useState('15');
  const [foodSodium, setFoodSodium] = useState('250');
  const [foodStock, setFoodStock] = useState('50');
  const [foodMinAlert, setFoodMinAlert] = useState('10');
  const [foodIsSpecial, setFoodIsSpecial] = useState(false);

  // Add Coupon Modal state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('10');

  // Settings state
  const [announcementInput, setAnnouncementInput] = useState(settings.announcementBanner || '');

  // Staff Creation Form State
  const [staffRegistrationEmail, setStaffRegistrationEmail] = useState('');
  const [staffRegistrationPassword, setStaffRegistrationPassword] = useState('');
  const [staffRegistrationName, setStaffRegistrationName] = useState('');
  const [staffRegistrationPhone, setStaffRegistrationPhone] = useState('');
  const [staffRegistering, setStaffRegistering] = useState(false);

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

  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableCategories: FoodCategory[] = [
    { id: 'cat_breakfast', name: 'Breakfast', slug: 'breakfast', description: '', icon: 'Egg', image: '' },
    { id: 'cat_lunch', name: 'Lunch', slug: 'lunch', description: '', icon: 'CookingPot', image: '' },
    { id: 'cat_snack', name: 'Snack', slug: 'snack', description: '', icon: 'Cookie', image: '' },
  ];

  const handleOpenAddFood = () => {
    setEditingFoodId(null);
    setFoodName('');
    setFoodCategory('');
    setFoodPrice('240.00');
    setFoodPrepTime('10');
    setFoodImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80');
    setFoodDesc('');
    setFoodCalories('500');
    setFoodProtein('35');
    setFoodCarbs('50');
    setFoodFats('15');
    setFoodSodium('250');
    setFoodStock('50');
    setFoodMinAlert('10');
    setFoodIsSpecial(false);
    setShowFoodModal(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setEditingFoodId(food.id);
    setFoodName(food.name);
    setFoodCategory(food.categoryId);
    setFoodPrice(food.price.toString());
    setFoodPrepTime(food.prepTimeMinutes.toString());
    setFoodImage(food.imageUrl);
    setFoodDesc(food.description);
    setFoodCalories(food.nutrition?.calories?.toString() || '0');
    setFoodProtein(food.nutrition?.proteinGrams?.toString() || '0');
    setFoodCarbs(food.nutrition?.carbsGrams?.toString() || '0');
    setFoodFats(food.nutrition?.fatGrams?.toString() || '0');
    setFoodSodium(food.nutrition?.sodiumMg?.toString() || '0');
    setFoodStock(food.stockQuantity.toString());
    setFoodMinAlert(food.minStockAlert.toString());
    setFoodIsSpecial(!!food.isSpecial);
    setShowFoodModal(true);
  };

  const handleCreateOrUpdateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodCategory) {
      setToastNotification({ type: 'error', message: 'Please select a category (Breakfast, Lunch, or Snack).' });
      return;
    }
    const selectedCatObj = availableCategories.find((c) => c.id === foodCategory || c.slug.toLowerCase() === foodCategory.toLowerCase() || c.name.toLowerCase() === foodCategory.toLowerCase());
    const payload = {
      name: foodName,
      categoryId: selectedCatObj?.id || foodCategory,
      categoryName: selectedCatObj?.name || 'Snack',
      price: Number(foodPrice),
      prepTimeMinutes: Number(foodPrepTime),
      imageUrl: foodImage,
      description: foodDesc,
      isAvailable: true,
      isSpecial: foodIsSpecial,
      isPopular: true,
      dietaryTags: ['High Protein'],
      allergens: [],
      nutrition: {
        calories: Number(foodCalories),
        proteinGrams: Number(foodProtein),
        carbsGrams: Number(foodCarbs),
        fatGrams: Number(foodFats),
        sodiumMg: Number(foodSodium),
      },
      stockQuantity: Number(foodStock),
      minStockAlert: Number(foodMinAlert),
    };

    try {
      if (editingFoodId) {
        await onEditFood(editingFoodId, payload);
        setToastNotification({ type: 'success', message: `"${foodName}" updated successfully in database!` });
      } else {
        await onAddFood(payload);
        setToastNotification({ type: 'success', message: `"${foodName}" created successfully and added to menu database!` });
      }
      setShowFoodModal(false);
      setTimeout(() => setToastNotification(null), 5000);
    } catch (err: any) {
      setToastNotification({ type: 'error', message: `Error saving food item: ${err?.message || 'Failed to save food item to database.'}` });
      setTimeout(() => setToastNotification(null), 6000);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon({
      code: couponCode.toUpperCase(),
      discountType: 'percentage',
      discountValue: Number(couponValue),
      minOrderValue: 200.0,
      validUntil: '2026-12-31',
      isActive: true,
    });
    setShowAddCouponModal(false);
    setCouponCode('');
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffRegistering(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const { createClient } = await import('@supabase/supabase-js');

      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { data, error } = await tempClient.auth.signUp({
        email: staffRegistrationEmail,
        password: staffRegistrationPassword,
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: staffRegistrationName,
            email: staffRegistrationEmail,
            phone: staffRegistrationPhone,
            role: 'staff',
            is_active: true,
            wallet_balance: 0,
          }]);

        if (insertErr) throw insertErr;

        setStaffRegistrationEmail('');
        setStaffRegistrationPassword('');
        setStaffRegistrationName('');
        setStaffRegistrationPhone('');
        alert('GUB Kitchen staff account generated & synchronized successfully!');
        if (onStaffCreated) {
          onStaffCreated();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred generating GUB staff user.');
    } finally {
      setStaffRegistering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Banner Notification */}
      {toastNotification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg border ${
            toastNotification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-[#006A4E]'
              : 'bg-red-500/15 border-red-500/30 text-red-700'
          }`}
        >
          <span>{toastNotification.message}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-500 hover:text-slate-800 font-black ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="glass-modal p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-slate-900">GUB Cafeteria Admin Dashboard</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">Green University Of Bangladesh Campus Operations</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-2xl bg-[#006A4E]/10 border border-[#006A4E]/30 text-[#006A4E] font-extrabold text-xs">
            Role: GUB Director
          </span>
          <button
            onClick={onLogOut}
            className="px-4 py-2 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/30 font-bold text-xs hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex glass-panel p-1.5 rounded-2xl text-xs font-bold gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'analytics' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'foods' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Food Items ({foods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'approvals' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Student Approvals ({users.filter((u) => u.isActive === false).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'inventory' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock & Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'coupons' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupons</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'users' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Users</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'feedback' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Feedback ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'audit' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'settings' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
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
            <div className="glass-card p-5 rounded-3xl space-y-1">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase">Total Cafeteria Revenue</span>
              <span className="text-3xl font-black text-[#006A4E] block">৳{totalRevenue.toFixed(2)}</span>
            </div>
            <div className="glass-card p-5 rounded-3xl space-y-1">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase">Today Pre-Orders</span>
              <span className="text-3xl font-black text-slate-900 block">{orders.length}</span>
            </div>
            <div className="glass-card p-5 rounded-3xl space-y-1">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase">Avg Kitchen Prep</span>
              <span className="text-3xl font-black text-[#22C55E] block">8.2 Mins</span>
            </div>
            <div className="glass-card p-5 rounded-3xl space-y-1">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase">Active Users</span>
              <span className="text-3xl font-black text-[#006A4E] block">{users.length} Users</span>
            </div>
          </div>

          {/* Recharts Bar Graph: Hourly Order Distribution */}
          <div className="glass-modal p-6 rounded-3xl space-y-4 shadow-lg">
            <h3 className="font-extrabold text-slate-900 text-base">Peak Cafeteria Order Distribution (Hourly Spike)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChartData}>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', borderColor: '#e2e8f0', color: '#0f172a' }}
                  />
                  <Bar dataKey="count" fill="#006A4E" radius={[8, 8, 0, 0]} />
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
            <h2 className="font-black text-xl text-slate-900">Menu Item Catalog</h2>
            <button
              onClick={handleOpenAddFood}
              className="px-5 py-2.5 glass-button font-bold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="glass-table rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white/80 text-slate-900 font-black uppercase border-b border-slate-200/60">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Prep Time</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Today Special</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {foods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#006A4E]/10 flex items-center justify-center text-[#006A4E]">
                          <Utensils className="w-6 h-6" />
                        </div>
                        <p className="font-black text-slate-900 text-sm">No food items added yet</p>
                        <p className="text-xs text-slate-500 max-w-sm font-medium">
                          Click "Add New Food Item" above to add meals to the GUB Smart Café catalog.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  foods.map((food) => (
                    <tr key={food.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={food.imageUrl} alt={food.name} className="w-10 h-10 object-cover rounded-xl bg-slate-100" />
                        <span className="font-extrabold text-slate-900">{food.name}</span>
                      </td>
                      <td className="p-4 font-medium">{food.categoryName}</td>
                      <td className="p-4 font-black text-[#006A4E]">৳{food.price.toFixed(2)}</td>
                      <td className="p-4 font-medium">{food.prepTimeMinutes} mins</td>
                      <td className="p-4 font-bold">{food.stockQuantity}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleSpecial) {
                              onToggleSpecial(food.id, !food.isSpecial);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border ${
                            food.isSpecial
                              ? 'bg-[#F59E0B] text-slate-900 border-[#F59E0B] shadow-xs'
                              : 'bg-white/80 text-slate-500 border-slate-200/80 hover:bg-white hover:text-slate-800'
                          }`}
                        >
                          {food.isSpecial ? '★ Special' : '+ Tag Special'}
                        </button>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditFood(food)}
                          className="text-slate-500 hover:text-[#006A4E] p-1.5 rounded-lg hover:bg-white cursor-pointer"
                          title="Edit Food Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteFood(food.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white cursor-pointer"
                          title="Delete Food Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2.5: Student Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-black text-xl text-slate-900">Pending Student Registration Approvals</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">These student accounts have registered and are waiting to be accepted into GUB Smart Café.</p>
          </div>

          <div className="glass-table rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white/80 text-slate-900 font-black uppercase border-b border-slate-200/60">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {users.filter((u) => u.isActive === false).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      No student registration requests are currently pending approval.
                    </td>
                  </tr>
                ) : (
                  users.filter((u) => u.isActive === false).map((u) => (
                    <tr key={u.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4 font-extrabold text-slate-900">{u.name}</td>
                      <td className="p-4 text-[#006A4E] font-bold">{u.studentId || 'N/A'}</td>
                      <td className="p-4 font-medium">{u.department || 'N/A'}</td>
                      <td className="p-4 font-medium">{u.email}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => onApproveStudent(u.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-white font-extrabold text-[11px] cursor-pointer shadow-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onRejectStudent(u.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-[11px] border border-red-500/20 cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory */}
      {activeTab === 'inventory' && (
        <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-black text-xl text-slate-900">Cafeteria Food Item Stock Quantities</h2>
          <p className="text-xs text-slate-600 font-medium">Directly track and edit the current stocks of menu items below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <div key={food.id} className="glass-card p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-xs block truncate max-w-[150px]">{food.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                      food.stockQuantity <= food.minStockAlert ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-[#22C55E]/10 text-[#006A4E]'
                    }`}
                  >
                    {food.stockQuantity <= food.minStockAlert ? 'Low Stock' : 'OK'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-500 text-[10px] font-bold">Stock level:</span>
                  <div className="flex items-center gap-1 bg-white/80 border border-slate-200/80 p-1 rounded-xl">
                    <button
                      onClick={() => onUpdateStock(food.id, Math.max(0, food.stockQuantity - 1))}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={food.stockQuantity}
                      onChange={(e) => onUpdateStock(food.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-10 text-center bg-transparent text-slate-900 font-black text-xs border-0 outline-none p-0"
                    />
                    <button
                      onClick={() => onUpdateStock(food.id, food.stockQuantity + 1)}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-xl text-slate-900">Active Student Coupons</h2>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-5 py-2.5 glass-button font-bold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-3xl space-y-2">
                <span className="font-black text-[#006A4E] text-lg block">{c.code}</span>
                <p className="text-xs text-slate-700 font-medium">
                  {c.discountValue}% Off on orders above ৳{c.minOrderValue.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500 font-bold block">Used {c.usageCount} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Users / Role and Staff Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Staff Creation Form */}
          <div className="glass-modal rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h2 className="font-black text-xl text-slate-900">Create GUB Kitchen Staff Profile</h2>
            <p className="text-xs text-slate-600 font-medium">Register a kitchen staff account directly into the authentication directory.</p>
            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    value={staffRegistrationName}
                    onChange={(e) => setStaffRegistrationName(e.target.value)}
                    placeholder="e.g. Chef Rahat"
                    className="w-full glass-input rounded-2xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Kitchen Email (Username)</label>
                  <input
                    type="email"
                    required
                    value={staffRegistrationEmail}
                    onChange={(e) => setStaffRegistrationEmail(e.target.value)}
                    placeholder="chef.rahat@green.edu.bd"
                    className="w-full glass-input rounded-2xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={staffRegistrationPassword}
                    onChange={(e) => setStaffRegistrationPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-2xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={staffRegistrationPhone}
                    onChange={(e) => setStaffRegistrationPhone(e.target.value)}
                    placeholder="+88017XXXXXXXX"
                    className="w-full glass-input rounded-2xl p-3 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={staffRegistering}
                className="w-full py-3.5 rounded-2xl glass-button font-black text-xs transition-all cursor-pointer shadow-md"
              >
                {staffRegistering ? 'Registering Staff Securely...' : 'Register GUB Kitchen Staff & Sync Profile'}
              </button>
            </form>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h2 className="font-black text-xl text-slate-900">Campus User Directory</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 glass-card rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{u.email} • Role: <span className="capitalize text-[#006A4E] font-extrabold">{u.role}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role === 'super_admin' ? 'admin' : u.role}
                      onChange={(e) => onUpdateUserRole(u.id, e.target.value)}
                      className="glass-input rounded-xl p-1.5 text-xs text-[#006A4E] font-bold"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <button
                      onClick={() => {
                        alert(`Successfully triggered GUB Staff Password Reset invitation link to ${u.email}`);
                      }}
                      className="px-3 py-1.5 bg-white/80 border border-slate-200/80 text-slate-700 font-bold rounded-xl hover:bg-white cursor-pointer"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => {
                        if (onToggleSuspendUser) {
                          onToggleSuspendUser(u.id, u.isActive !== false);
                        }
                      }}
                      className={`px-3 py-1.5 font-extrabold rounded-xl cursor-pointer ${
                        u.isActive === false
                          ? 'bg-emerald-500/15 text-[#006A4E] border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-900 border border-amber-500/30'
                      }`}
                    >
                      {u.isActive === false ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => {
                        if (onDeleteUser) {
                          onDeleteUser(u.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/10 text-red-600 font-bold rounded-xl border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5.5: Student & Order Feedback */}
      {activeTab === 'feedback' && (
        <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-black text-xl text-slate-900">Student Meal & Service Feedback</h2>
          <p className="text-xs text-slate-600 font-medium">Ratings & feedback submitted by students regarding food items and orders.</p>
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
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-modal rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-black text-xl text-slate-900">System Audit Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 glass-card rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-black text-[#006A4E] block">{log.action}</span>
                  <span className="text-slate-700 font-medium">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <div className="glass-modal rounded-3xl p-6 space-y-4 text-xs shadow-xl">
          <h2 className="font-black text-xl text-slate-900">Cafeteria Operating Parameters</h2>
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Announcement Banner</label>
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
            />
          </div>
          <button
            onClick={() => onUpdateSettings({ announcementBanner: announcementInput })}
            className="px-6 py-3 glass-button font-black text-xs rounded-2xl cursor-pointer"
          >
            Save Announcement
          </button>
        </div>
      )}

      {/* Add/Edit Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-8 space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg">
              {editingFoodId ? 'Edit Menu Item Details' : 'Add New Menu Item'}
            </h3>
            <form onSubmit={handleCreateOrUpdateFood} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Food Name</label>
                  <input
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Grilled Chicken Wrap"
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    required
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="">Select Category</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price (৳)</label>
                  <input
                    type="number"
                    step="5"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={foodPrepTime}
                    onChange={(e) => setFoodPrepTime(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                  <input
                    type="text"
                    value={foodImage}
                    onChange={(e) => setFoodImage(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  placeholder="Describe ingredients, cooking style, etc."
                  className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              {/* Nutrition details */}
              <div className="glass-panel p-4 rounded-2xl space-y-3">
                <span className="font-extrabold text-[#006A4E] uppercase tracking-wider block">Nutrition Details</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={foodCalories}
                      onChange={(e) => setFoodCalories(e.target.value)}
                      className="w-full glass-input rounded-lg p-1.5 text-center text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={foodProtein}
                      onChange={(e) => setFoodProtein(e.target.value)}
                      className="w-full glass-input rounded-lg p-1.5 text-center text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={foodCarbs}
                      onChange={(e) => setFoodCarbs(e.target.value)}
                      className="w-full glass-input rounded-lg p-1.5 text-center text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Fats (g)</label>
                    <input
                      type="number"
                      value={foodFats}
                      onChange={(e) => setFoodFats(e.target.value)}
                      className="w-full glass-input rounded-lg p-1.5 text-center text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Sodium (mg)</label>
                    <input
                      type="number"
                      value={foodSodium}
                      onChange={(e) => setFoodSodium(e.target.value)}
                      className="w-full glass-input rounded-lg p-1.5 text-center text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Today Special Tag Toggle */}
              <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Chef's Today Special</span>
                  <span className="text-[11px] text-slate-500 font-medium">Tag item to showcase in "Chef's Today Specials" homepage section</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodIsSpecial}
                    onChange={(e) => setFoodIsSpecial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006A4E]"></div>
                </label>
              </div>

              {/* Initial stock and alert level */}
              <div className="grid grid-cols-2 gap-3 glass-panel p-4 rounded-2xl">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={foodStock}
                    onChange={(e) => setFoodStock(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Low Stock Alert Quantity</label>
                  <input
                    type="number"
                    value={foodMinAlert}
                    onChange={(e) => setFoodMinAlert(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 glass-button font-black rounded-xl cursor-pointer"
                >
                  Save Item Details
                </button>
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-5 py-3 bg-white/80 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="w-full max-w-sm glass-modal rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-black text-slate-900 text-base">Create Student Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. MIDTERM15"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-900 uppercase font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount %</label>
                <input
                  type="number"
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 glass-button font-bold rounded-xl cursor-pointer"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2.5 bg-white/80 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-white cursor-pointer"
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
