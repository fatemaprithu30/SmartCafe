import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { MenuView } from './views/MenuView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { FAQView } from './views/FAQView';
import { CheckoutView } from './views/CheckoutView';
import { StudentDashboard } from './views/StudentDashboard';
import { StaffKitchenDashboard } from './views/StaffKitchenDashboard';
import { AdminDashboard } from './views/AdminDashboard';

import {
  UserProfile,
  UserRole,
  FoodItem,
  FoodCategory,
  CartItem,
  CartItemOption,
  Order,
  OrderStatus,
  Review,
  Coupon,
  AuditLog,
  AppNotification,
  CafeteriaSettings,
} from './types';

import {
  INITIAL_USERS,
  CATEGORIES,
  INITIAL_FOODS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_CAFETERIA_SETTINGS,
} from './data/mockData';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | undefined>(undefined);

  // Data
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [categories, setCategories] = useState<FoodCategory[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<CafeteriaSettings>(DEFAULT_CAFETERIA_SETTINGS);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPickupSlot, setSelectedPickupSlot] = useState<string>('12:10 PM - 12:20 PM');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Modal Toggles
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [studentDashboardTab, setStudentDashboardTab] = useState<'orders' | 'favorites' | 'reviews' | 'profile'>('orders');

  // Fetch initial data using migrated live database services
  const fetchBackendData = async () => {
    try {
      const { dbService } = await import('./services/dbService');
      const [f, c, o, set] = await Promise.all([
        dbService.getFoods(),
        dbService.getCategories(),
        dbService.getOrders(),
        dbService.getSettings()
      ]);
      if (f.length > 0) setFoods(f);
      if (c.length > 0) setCategories(c);
      if (o.length > 0) setOrders(o);
      if (set) setSettings(set);
    } catch (err) {
      console.log('Using fallback local states...');
    }
  };

  useEffect(() => {
    fetchBackendData();

    // Wire up real-time status subscription from Supabase Realtime channel
    let orderSubscription: any;
    const initializeRealtime = async () => {
      const { supabase } = await import('./supabaseClient');
      orderSubscription = supabase
        .channel('order-status-bumps')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
          const updatedOrder = payload.new as Order;
          setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? { ...o, orderStatus: updatedOrder.orderStatus, kitchenNotes: updatedOrder.kitchenNotes } : o));

          // Trigger local browser alert simulation
          if (updatedOrder.studentId === currentUser.id) {
            const nextNotif = {
              id: `notif_${Date.now()}`,
              userId: currentUser.id,
              title: `Order #${updatedOrder.orderNumber} status update`,
              message: `Your food has updated to state: ${updatedOrder.orderStatus.toUpperCase()}`,
              type: 'order_status' as any,
              read: false,
              createdAt: new Date().toISOString()
            };
            setNotifications((prev) => [nextNotif, ...prev]);
          }
        })
        .subscribe();
    };

    initializeRealtime();

    return () => {
      if (orderSubscription) orderSubscription.unsubscribe();
    };
  }, [currentUser]);

  // Sync role change
  const handleRoleChange = (newRole: UserRole) => {
    const roleMap = newRole === 'super_admin' ? 'admin' : newRole;
    setActiveRole(roleMap);
    const matchUser = INITIAL_USERS.find((u) => u.role === roleMap) || currentUser;
    setCurrentUser(matchUser);
  };

  // Add Item to Cart Tray
  const handleAddToCart = (
    food: FoodItem,
    quantity: number,
    selectedOptions: CartItemOption[],
    specialInstructions: string
  ) => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = food.price + optionsPrice;
    const totalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      food,
      quantity,
      selectedOptions,
      specialInstructions,
      unitPrice,
      totalPrice,
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleQuickAdd = (food: FoodItem) => {
    handleAddToCart(food, 1, [], '');
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
            : item
        )
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Apply Coupon
  const handleApplyCoupon = async (code: string) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
    try {
      const { dbService } = await import('./services/dbService');
      const allCoupons = await dbService.getCoupons();
      const match = allCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

      if (match) {
        let disc = 0;
        if (match.discountType === 'percentage') {
          disc = (subtotal * match.discountValue) / 100;
        } else {
          disc = match.discountValue;
        }
        setAppliedCoupon({ code: match.code, discountAmount: disc });
        return { success: true, message: `Applied code ${match.code}! Saved ৳${disc.toFixed(2)}` };
      } else {
        throw new Error('No active coupon matching this code was found.');
      }
    } catch (err) {
      // Local fallback
      if (code.toUpperCase() === 'WELCOME10') {
        const disc = subtotal * 0.1;
        setAppliedCoupon({ code: 'WELCOME10', discountAmount: disc });
        return { success: true, message: `Applied WELCOME10! Saved ৳${disc.toFixed(2)}` };
      }
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Handle Order Placed
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setActiveTab('student-orders');
    setStudentDashboardTab('orders');
  };

  // Re-Order Same Meal
  const handleReOrder = (items: any[]) => {
    items.forEach((it) => {
      const foodMatch = foods.find((f) => f.id === it.foodId);
      if (foodMatch) {
        handleAddToCart(foodMatch, it.quantity || 1, [], '');
      }
    });
    setIsCartOpen(true);
  };

  // Top Up Wallet
  const handleTopUpWallet = async (amount: number) => {
    try {
      const res = await fetch(`/api/users/${currentUser.id}/wallet`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountToAdd: amount }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
      } else {
        setCurrentUser((prev) => ({ ...prev, walletBalance: prev.walletBalance + amount }));
      }
    } catch (err) {
      setCurrentUser((prev) => ({ ...prev, walletBalance: prev.walletBalance + amount }));
    }
  };

  // Kitchen Bump Bar Status Shift
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const { dbService } = await import('./services/dbService');
      const updated = await dbService.updateOrderStatus(orderId, status, notes);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
    }
  };

  // Kitchen Quick Stock Toggle
  const handleUpdateStock = async (foodId: string, isAvailable: boolean, stockQuantity?: number) => {
    try {
      const { dbService } = await import('./services/dbService');
      const updated = await dbService.updateStock(foodId, isAvailable, stockQuantity);
      setFoods((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
    } catch (err) {
      setFoods((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, isAvailable } : f))
      );
    }
  };

  // Admin Actions
  const handleAddFood = async (newFood: Partial<FoodItem>) => {
    try {
      const { dbService } = await import('./services/dbService');
      const created = await dbService.addFood(newFood);
      setFoods((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      const { dbService } = await import('./services/dbService');
      await dbService.deleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setFoods((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleAddCoupon = async (newCoupon: Partial<Coupon>) => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.from('coupons').insert([newCoupon]).select().single();
      if (error) throw error;
      setCoupons((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { supabase } = await import('./supabaseClient');
      await supabase.from('profiles').update({ role }).eq('id', userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (newSet: Partial<CafeteriaSettings>) => {
    try {
      const { dbService } = await import('./services/dbService');
      const updated = await dbService.updateSettings(newSet);
      setSettings(updated);
    } catch (err) {
      setSettings((prev) => ({ ...prev, ...newSet }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCategorySlug(undefined);
        }}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiAssistant={() => {}}
        notifications={notifications}
        orders={orders}
        onOpenAuth={() => setIsAuthOpen(true)}
        announcementText={settings.announcementBanner}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            categories={categories}
            foods={foods}
            onSelectFood={(food) => setSelectedFoodForDetail(food)}
            onNavigateToMenu={(catSlug) => {
              if (catSlug) setSelectedCategorySlug(catSlug);
              setActiveTab('menu');
            }}
            onOpenAiAssistant={() => {}}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            categories={categories}
            foods={foods}
            selectedCategorySlug={selectedCategorySlug}
            onSelectFood={(food) => setSelectedFoodForDetail(food)}
            onOpenAiAssistant={() => {}}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'faq' && <FAQView />}

        {activeTab === 'checkout' && (
          <CheckoutView
            currentUser={currentUser}
            cartItems={cartItems}
            selectedPickupSlot={selectedPickupSlot}
            onSelectPickupSlot={setSelectedPickupSlot}
            appliedCoupon={appliedCoupon}
            onBackToMenu={() => setActiveTab('menu')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {activeTab === 'student-orders' && (
          <StudentDashboard
            currentUser={currentUser}
            orders={orders}
            onRefreshOrders={fetchBackendData}
            onReOrder={handleReOrder}
            onTopUpWallet={handleTopUpWallet}
            activeTabSub={studentDashboardTab}
            setActiveTabSub={setStudentDashboardTab}
          />
        )}

        {activeTab === 'staff-kitchen' && (
          <StaffKitchenDashboard
            orders={orders}
            foods={foods}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            foods={foods}
            categories={categories}
            coupons={coupons}
            auditLogs={auditLogs}
            users={INITIAL_USERS}
            orders={orders}
            settings={settings}
            onAddFood={handleAddFood}
            onDeleteFood={handleDeleteFood}
            onAddCoupon={handleAddCoupon}
            onUpdateUserRole={handleUpdateUserRole}
            onCreditWallet={handleTopUpWallet}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Food Detail Modal */}
      {selectedFoodForDetail && (
        <FoodDetailModal
          food={selectedFoodForDetail}
          onClose={() => setSelectedFoodForDetail(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        selectedPickupSlot={selectedPickupSlot}
        onSelectPickupSlot={setSelectedPickupSlot}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={() => setActiveTab('checkout')}
      />

      {/* Gemini AI Meal Concierge Modal disabled as requested */}

      {/* Auth / Demo Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          const userRole = user.role === 'super_admin' ? 'admin' : user.role;
          setCurrentUser({ ...user, role: userRole });
          setActiveRole(userRole);
          if (userRole === 'staff') setActiveTab('staff-kitchen');
          else if (userRole === 'admin') setActiveTab('admin-dashboard');
          else setActiveTab('home');
        }}
      />
    </div>
  );
}
