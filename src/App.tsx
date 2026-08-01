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
  CATEGORIES,
  INITIAL_FOODS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_CAFETERIA_SETTINGS,
} from './data/mockData';

const GUEST_STUDENT: UserProfile = {
  id: 'guest_student',
  name: 'GUB Guest Student',
  email: 'guest.student@green.edu.bd',
  role: 'student',
  studentId: 'N/A',
  department: 'GUB Campus',
  phone: '+880',
  walletBalance: 0,
  dietaryPreferences: {
    allergens: [],
    isHalal: true,
    isVegan: false,
    isVegetarian: false,
    isGlutenFree: false,
    dailyCalorieTarget: 2000,
  },
};

export default function App() {
  // Navigation / Routing path state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Auth & Roles State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | undefined>(undefined);

  // Login credentials state for specialized portals
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [kitchenEmail, setKitchenEmail] = useState('');
  const [kitchenPassword, setKitchenPassword] = useState('');
  const [portalError, setPortalError] = useState('');

  // Data
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [categories, setCategories] = useState<FoodCategory[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<CafeteriaSettings>(DEFAULT_CAFETERIA_SETTINGS);

  // Database Users for Administrator registration and student approvals
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPickupSlot, setSelectedPickupSlot] = useState<string>('12:10 PM - 12:20 PM');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Modal Toggles
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [studentDashboardTab, setStudentDashboardTab] = useState<'orders' | 'favorites' | 'reviews' | 'profile'>('orders');

  // Sync route on popstate and pushstate manually
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Patch history pushState and replaceState to trigger the popstate event so react state picks up manual route switches
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Custom route navigator helper
  const navigateToPath = (path: string) => {
    window.history.pushState({}, '', path);
  };

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

  // Fetch unread and read notifications for current authenticated user
  const fetchUserNotifications = async (userId: string) => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mappedNotifs: AppNotification[] = data.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.created_at
        }));
        setNotifications(mappedNotifs);
      }
    } catch (err) {
      console.error('Failed to load user notifications: ', err);
    }
  };

  // Load registered users directory for Admin panel approvals
  const fetchUsersDirectory = async () => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mappedUsers: UserProfile[] = data.map((profile: any) => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          studentId: profile.student_id,
          phone: profile.phone,
          department: profile.department,
          walletBalance: profile.wallet_balance || 0,
          isActive: profile.is_active,
          createdAt: profile.created_at,
          dietaryPreferences: profile.dietary_preferences || {
            allergens: [],
            isHalal: true,
            isVegan: false,
            isVegetarian: false,
            isGlutenFree: false,
            dailyCalorieTarget: 2000
          }
        }));
        setDbUsers(mappedUsers);
      }
    } catch (err) {
      // Local Fallback list is empty to avoid showing demo/mock users
      setDbUsers([]);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserNotifications(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBackendData();
    fetchUsersDirectory();

    // Check active Supabase Auth session on load
    const checkSession = async () => {
      try {
        const { supabase } = await import('./supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const adminEmailEnv = (import.meta as any).env?.VITE_ADMIN_EMAIL || 'admin@green.edu.bd';
          const kitchenEmailEnv = (import.meta as any).env?.VITE_KITCHEN_EMAIL || 'kitchen@green.edu.bd';
          const userEmail = session.user.email?.toLowerCase();

          let profile: any = null;
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (!error && data) {
              profile = data;
            }
          } catch (profileQueryErr) {
            console.error('Failed to query profile in checkSession, utilizing fallbacks:', profileQueryErr);
          }

          // Auto upgrade profile if they are configured via Admin Email env
          if (userEmail === adminEmailEnv.toLowerCase()) {
            if (!profile) {
              try {
                const { data: newProf, error } = await supabase.from('profiles').insert([{
                  id: session.user.id,
                  name: 'GUB Administrator',
                  email: session.user.email,
                  role: 'admin',
                  is_active: true
                }]).select().single();
                if (!error && newProf) {
                  profile = newProf;
                }
              } catch (insErr) {
                console.error('Failed to insert admin profile, using fallback profile representation:', insErr);
              }
              if (!profile) {
                profile = {
                  id: session.user.id,
                  name: 'GUB Administrator',
                  email: session.user.email,
                  role: 'admin',
                  is_active: true
                };
              }
            } else if (profile.role !== 'admin') {
              try {
                const { data: updProf, error } = await supabase.from('profiles').update({ role: 'admin', is_active: true }).eq('id', session.user.id).select().single();
                if (!error && updProf) {
                  profile = updProf;
                }
              } catch (updErr) {
                console.error('Failed to update admin profile role, using fallback:', updErr);
              }
              // Ensure role is updated in-memory
              profile.role = 'admin';
              profile.is_active = true;
            }
          } else if (userEmail === kitchenEmailEnv.toLowerCase()) {
            if (!profile) {
              try {
                const { data: newProf, error } = await supabase.from('profiles').insert([{
                  id: session.user.id,
                  name: 'GUB Kitchen Staff',
                  email: session.user.email,
                  role: 'staff',
                  is_active: true
                }]).select().single();
                if (!error && newProf) {
                  profile = newProf;
                }
              } catch (insErr) {
                console.error('Failed to insert kitchen profile, using fallback profile representation:', insErr);
              }
              if (!profile) {
                profile = {
                  id: session.user.id,
                  name: 'GUB Kitchen Staff',
                  email: session.user.email,
                  role: 'staff',
                  is_active: true
                };
              }
            } else if (profile.role !== 'staff') {
              try {
                const { data: updProf, error } = await supabase.from('profiles').update({ role: 'staff', is_active: true }).eq('id', session.user.id).select().single();
                if (!error && updProf) {
                  profile = updProf;
                }
              } catch (updErr) {
                console.error('Failed to update kitchen profile role, using fallback:', updErr);
              }
              // Ensure role is updated in-memory
              profile.role = 'staff';
              profile.is_active = true;
            }
          }

          if (profile) {
            const mappedUser: UserProfile = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              studentId: profile.student_id,
              phone: profile.phone,
              department: profile.department,
              walletBalance: profile.wallet_balance || 0,
              isActive: profile.is_active,
              dietaryPreferences: profile.dietary_preferences || {
                allergens: [],
                isHalal: true,
                isVegan: false,
                isVegetarian: false,
                isGlutenFree: false,
                dailyCalorieTarget: 2000
              }
            };

            // Double check portal protection match
            if (window.location.pathname === '/admin' && profile.role !== 'admin') {
              await supabase.auth.signOut();
              return;
            }
            if (window.location.pathname === '/kitchenstuff' && profile.role !== 'staff') {
              await supabase.auth.signOut();
              return;
            }
            if (window.location.pathname === '/' && profile.role !== 'student') {
              await supabase.auth.signOut();
              return;
            }

            setCurrentUser(mappedUser);
            setActiveRole(profile.role);
          }
        }
      } catch (err) {
        console.log('Session restore bypassed...');
      }
    };
    checkSession();

    // Wire up real-time status subscription from Supabase Realtime channel
    let orderSubscription: any;
    const initializeRealtime = async () => {
      if (!currentUser) return;
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

  // Handle generalized Portal Logouts
  const handleLogOut = async () => {
    try {
      const { supabase } = await import('./supabaseClient');
      await supabase.auth.signOut();
    } catch (err) {
      console.log('Bypassed signOut...');
    }
    setCurrentUser(null);
    setCartItems([]);
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
        prev.map((f) => (f.id === foodId ? { ...f, isAvailable, stockQuantity: stockQuantity !== undefined ? stockQuantity : f.stockQuantity } : f))
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

  const handleEditFood = async (foodId: string, updatedFields: Partial<FoodItem>) => {
    try {
      const { dbService } = await import('./services/dbService');
      await dbService.updateFood(foodId, updatedFields);
      const camelFood = await dbService.getFoods();
      setFoods(camelFood);
    } catch (err) {
      setFoods((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, ...updatedFields } : f))
      );
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
      const { toSnake, toCamel } = await import('./services/dbService');
      const dbCoupon = toSnake(newCoupon);
      const { data, error } = await supabase.from('coupons').insert([dbCoupon]).select().single();
      if (error) throw error;
      setCoupons((prev) => [toCamel(data), ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { supabase } = await import('./supabaseClient');
      await supabase.from('profiles').update({ role }).eq('id', userId);
      fetchUsersDirectory();
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

  // Student registration approvals
  const handleApproveStudent = async (userId: string) => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', userId);

      if (error) throw error;
      alert('Student registration approved successfully!');
      fetchUsersDirectory();
    } catch (err: any) {
      alert(err.message || 'Error occurred during student approval.');
    }
  };

  const handleRejectStudent = async (userId: string) => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      alert('Student registration rejected.');
      fetchUsersDirectory();
    } catch (err: any) {
      alert(err.message || 'Error occurred rejecting student registration.');
    }
  };

  // Direct Stock editor tracker
  const handleUpdateStockQuantity = async (foodId: string, stockQuantity: number) => {
    await handleUpdateStock(foodId, stockQuantity > 0, stockQuantity);
  };

  // Portal specialized logins
  const handleAdminPortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;
      if (data.user) {
        const adminEmailEnv = (import.meta as any).env?.VITE_ADMIN_EMAIL || 'admin@green.edu.bd';
        const userEmail = data.user.email?.toLowerCase();

        let profile: any = null;
        try {
          const { data: dbProf, error: queryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (!queryError && dbProf) {
            profile = dbProf;
          }
        } catch (profileQueryErr) {
          console.error('Failed to query profiles in admin login portal:', profileQueryErr);
        }

        // Check if admin matches VITE_ADMIN_EMAIL config directly
        if (userEmail === adminEmailEnv.toLowerCase()) {
          if (!profile) {
            try {
              const { data: newProf, error: insError } = await supabase.from('profiles').insert([{
                id: data.user.id,
                name: 'GUB Administrator',
                email: data.user.email,
                role: 'admin',
                is_active: true
              }]).select().single();
              if (!insError && newProf) {
                profile = newProf;
              }
            } catch (insErr) {
              console.error('Failed to insert admin profile on login, utilizing fallback:', insErr);
            }
            if (!profile) {
              profile = {
                id: data.user.id,
                name: 'GUB Administrator',
                email: data.user.email,
                role: 'admin',
                is_active: true
              };
            }
          } else if (profile.role !== 'admin') {
            try {
              const { data: updProf, error: updError } = await supabase.from('profiles').update({ role: 'admin', is_active: true }).eq('id', data.user.id).select().single();
              if (!updError && updProf) {
                profile = updProf;
              }
            } catch (updErr) {
              console.error('Failed to update admin profile role on login, utilizing fallback:', updErr);
            }
            // Ensure role and active properties are applied to fallback
            profile.role = 'admin';
            profile.is_active = true;
          }
        }

        if (profile?.role === 'admin') {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            walletBalance: profile.wallet_balance || 0,
            dietaryPreferences: profile.dietary_preferences || {
              allergens: [],
              isHalal: true,
              isVegan: false,
              isVegetarian: false,
              isGlutenFree: false,
              dailyCalorieTarget: 2000
            }
          });
          setActiveRole('admin');
        } else {
          await supabase.auth.signOut();
          setPortalError('Access Denied. Only registered GUB administrators can log in here.');
        }
      }
    } catch (err: any) {
      setPortalError(err.message || 'Error executing portal sign in.');
    }
  };

  const handleKitchenPortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: kitchenEmail,
        password: kitchenPassword,
      });
      if (error) throw error;
      if (data.user) {
        const kitchenEmailEnv = (import.meta as any).env?.VITE_KITCHEN_EMAIL || 'kitchen@green.edu.bd';
        const userEmail = data.user.email?.toLowerCase();

        let profile: any = null;
        try {
          const { data: dbProf, error: queryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (!queryError && dbProf) {
            profile = dbProf;
          }
        } catch (profileQueryErr) {
          console.error('Failed to query profiles in kitchen login portal:', profileQueryErr);
        }

        // Check if kitchen matches VITE_KITCHEN_EMAIL config directly
        if (userEmail === kitchenEmailEnv.toLowerCase()) {
          if (!profile) {
            try {
              const { data: newProf, error: insError } = await supabase.from('profiles').insert([{
                id: data.user.id,
                name: 'GUB Kitchen Staff',
                email: data.user.email,
                role: 'staff',
                is_active: true
              }]).select().single();
              if (!insError && newProf) {
                profile = newProf;
              }
            } catch (insErr) {
              console.error('Failed to insert kitchen profile on login, utilizing fallback:', insErr);
            }
            if (!profile) {
              profile = {
                id: data.user.id,
                name: 'GUB Kitchen Staff',
                email: data.user.email,
                role: 'staff',
                is_active: true
              };
            }
          } else if (profile.role !== 'staff') {
            try {
              const { data: updProf, error: updError } = await supabase.from('profiles').update({ role: 'staff', is_active: true }).eq('id', data.user.id).select().single();
              if (!updError && updProf) {
                profile = updProf;
              }
            } catch (updErr) {
              console.error('Failed to update kitchen profile role on login, utilizing fallback:', updErr);
            }
            // Ensure role and active properties are applied to fallback
            profile.role = 'staff';
            profile.is_active = true;
          }
        }

        if (profile?.role === 'staff') {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            walletBalance: profile.wallet_balance || 0,
            dietaryPreferences: profile.dietary_preferences || {
              allergens: [],
              isHalal: true,
              isVegan: false,
              isVegetarian: false,
              isGlutenFree: false,
              dailyCalorieTarget: 2000
            }
          });
          setActiveRole('staff');
        } else {
          await supabase.auth.signOut();
          setPortalError('Access Denied. Only registered GUB kitchen staff can log in here.');
        }
      }
    } catch (err: any) {
      setPortalError(err.message || 'Error executing portal sign in.');
    }
  };

  // Path Routing Rendering router switch
  if (currentPath === '/admin') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
        {currentUser && activeRole === 'admin' ? (
          <AdminDashboard
            foods={foods}
            categories={categories}
            coupons={coupons}
            auditLogs={auditLogs}
            users={dbUsers}
            orders={orders}
            settings={settings}
            onAddFood={handleAddFood}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
            onAddCoupon={handleAddCoupon}
            onUpdateUserRole={handleUpdateUserRole}
            onCreditWallet={() => {}}
            onUpdateSettings={handleUpdateSettings}
            onApproveStudent={handleApproveStudent}
            onRejectStudent={handleRejectStudent}
            onUpdateStock={handleUpdateStockQuantity}
            onLogOut={handleLogOut}
            onStaffCreated={fetchUsersDirectory}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mx-auto text-white font-black shadow-lg">
                  GUB
                </div>
                <h2 className="text-xl font-bold text-white">GUB Director Admin Portal</h2>
                <p className="text-xs text-stone-400">Campus Dining Operations & Menu Control Directory</p>
              </div>

              {portalError && (
                <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-xl">
                  {portalError}
                </div>
              )}

              <form onSubmit={handleAdminPortalLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Director Email Address</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="director@green.edu.bd"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Security Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors shadow-lg"
                >
                  Verify Credentials & Enter Panel
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateToPath('/')}
                  className="text-xs text-blue-400 hover:underline font-semibold"
                >
                  &larr; Back to Student Website
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === '/kitchenstuff') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
        {currentUser && activeRole === 'staff' ? (
          <StaffKitchenDashboard
            orders={orders}
            foods={foods}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateStock={handleUpdateStock}
            onLogOut={handleLogOut}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center mx-auto text-white font-black shadow-lg">
                  KDS
                </div>
                <h2 className="text-xl font-bold text-white">GUB Kitchen Display System</h2>
                <p className="text-xs text-stone-400">Order Bump Bar & Express Prep Operations Queue</p>
              </div>

              {portalError && (
                <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-xl">
                  {portalError}
                </div>
              )}

              <form onSubmit={handleKitchenPortalLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Staff Email Address</label>
                  <input
                    type="email"
                    required
                    value={kitchenEmail}
                    onChange={(e) => setKitchenEmail(e.target.value)}
                    placeholder="kitchen@green.edu.bd"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Kitchen PIN/Password</label>
                  <input
                    type="password"
                    required
                    value={kitchenPassword}
                    onChange={(e) => setKitchenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg"
                >
                  Verify Credentials & Enter Screen
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateToPath('/')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  &larr; Back to Student Website
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to '/' Student Portal (Primary Website)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
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
        onLogOut={handleLogOut}
        announcementText={settings.announcementBanner}
        onMarkNotificationAsRead={async (id) => {
          try {
            const { dbService } = await import('./services/dbService');
            await dbService.markNotificationAsRead(id);
            if (currentUser?.id) {
              fetchUserNotifications(currentUser.id);
            }
          } catch (err) {
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
          }
        }}
        onMarkAllNotificationsAsRead={async () => {
          if (!currentUser?.id) return;
          try {
            const { dbService } = await import('./services/dbService');
            await dbService.markAllNotificationsAsRead(currentUser.id);
            fetchUserNotifications(currentUser.id);
          } catch (err) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }
        }}
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
            currentUser={currentUser || GUEST_STUDENT}
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
            currentUser={currentUser || GUEST_STUDENT}
            orders={orders}
            onRefreshOrders={fetchBackendData}
            onReOrder={handleReOrder}
            onTopUpWallet={() => {}}
            activeTabSub={studentDashboardTab}
            setActiveTabSub={setStudentDashboardTab}
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
        dailyCalorieTarget={currentUser?.dietaryPreferences?.dailyCalorieTarget || 2000}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setActiveRole('student');
          setActiveTab('home');
        }}
      />
    </div>
  );
}
