import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AiMealAssistantModal } from './components/AiMealAssistantModal';
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
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [studentDashboardTab, setStudentDashboardTab] = useState<'orders' | 'favorites' | 'reviews' | 'profile'>('orders');

  // Fetch initial data from Express backend API
  const fetchBackendData = async () => {
    try {
      const [fRes, cRes, oRes, setRes, notifRes] = await Promise.all([
        fetch('/api/foods'),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/settings'),
        fetch('/api/notifications'),
      ]);

      if (fRes.ok) setFoods(await fRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.log('Using local mock data state (Backend server fallback)');
    }
  };

  useEffect(() => {
    fetchBackendData();
    // Poll for realtime kitchen updates every 5 seconds
    const interval = setInterval(() => {
      fetchBackendData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync role change
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    const matchUser = INITIAL_USERS.find((u) => u.role === newRole) || currentUser;
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
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.coupon.code, discountAmount: data.discountAmount });
        return { success: true, message: `Applied code ${data.coupon.code}! Saved $${data.discountAmount.toFixed(2)}` };
      } else {
        return { success: false, message: data.message || 'Invalid promo coupon' };
      }
    } catch (err) {
      // Local fallback
      if (code.toUpperCase() === 'WELCOME10') {
        const disc = subtotal * 0.1;
        setAppliedCoupon({ code: 'WELCOME10', discountAmount: disc });
        return { success: true, message: `Applied WELCOME10! Saved $${disc.toFixed(2)}` };
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
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status, kitchenNotes: notes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
        );
      }
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
    }
  };

  // Kitchen Quick Stock Toggle
  const handleUpdateStock = async (foodId: string, isAvailable: boolean, stockQuantity?: number) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable, stockQuantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFoods((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
      } else {
        setFoods((prev) =>
          prev.map((f) => (f.id === foodId ? { ...f, isAvailable } : f))
        );
      }
    } catch (err) {
      setFoods((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, isAvailable } : f))
      );
    }
  };

  // Admin Actions
  const handleAddFood = async (newFood: Partial<FoodItem>) => {
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      });
      if (res.ok) {
        const created = await res.json();
        setFoods((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await fetch(`/api/foods/${id}`, { method: 'DELETE' });
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setFoods((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleAddCoupon = async (newCoupon: Partial<Coupon>) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (newSet: Partial<CafeteriaSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSet),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
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
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
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
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            categories={categories}
            foods={foods}
            selectedCategorySlug={selectedCategorySlug}
            onSelectFood={(food) => setSelectedFoodForDetail(food)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
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

      {/* Gemini AI Meal Concierge Modal */}
      <AiMealAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        availableFoods={foods}
        onAddComboToCart={(items) => {
          items.forEach((item) => handleAddToCart(item, 1, [], ''));
        }}
      />

      {/* Auth / Demo Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          if (user.role === 'staff') setActiveTab('staff-kitchen');
          else if (user.role === 'admin' || user.role === 'super_admin') setActiveTab('admin-dashboard');
          else setActiveTab('home');
        }}
      />
    </div>
  );
}
