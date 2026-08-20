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
    isVegetarian: false,
    isNonVegetarian: false,
    isHighProtein: false,
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
  const [selectedPickupSlot, setSelectedPickupSlot] = useState<string>('Lunch: 12:00 PM - 12:30 PM');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Modal Toggles & Toast Banner
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [studentDashboardTab, setStudentDashboardTab] = useState<'orders' | 'favorites' | 'reviews' | 'profile'>('orders');
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: 'preparing' | 'ready' | 'info' } | null>(null);

  // Track previous order statuses to trigger sound and toast alerts
  const prevOrderStatusesRef = React.useRef<{ [orderId: string]: string }>({});

  // Web Audio API Audio Chime Synthesizer
  const playAudioChime = (type: 'preparing' | 'ready') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'ready') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      }

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  // Monitor order status changes for current student and trigger toast & chime
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;

    orders.forEach((ord) => {
      if (ord.studentId === currentUser.id) {
        const prevStatus = prevOrderStatusesRef.current[ord.id];
        if (prevStatus && prevStatus !== ord.orderStatus) {
          if (ord.orderStatus === 'preparing') {
            playAudioChime('preparing');
            setActiveToast({
              id: `toast_${Date.now()}`,
              title: `Order #${ord.orderNumber} Cooking! 🍳`,
              message: `The kitchen has started preparing your order! ${ord.kitchenNotes || ''}`,
              type: 'preparing',
            });
          } else if (ord.orderStatus === 'ready') {
            playAudioChime('ready');
            setActiveToast({
              id: `toast_${Date.now()}`,
              title: `Order #${ord.orderNumber} Ready! 🎉`,
              message: `Your food is ready for pickup at Express Counter 1! Show your QR code.`,
              type: 'ready',
            });
          }
        }
        prevOrderStatusesRef.current[ord.id] = ord.orderStatus;
      }
    });
  }, [orders, currentUser]);

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

      // Load foods
      try {
        const f = await dbService.getFoods();
        setFoods(f || []);
      } catch (err) {
        console.error('Failed to load menu items:', err);
        setFoods([]);
      }

      // Load categories
      try {
        let c = await dbService.getCategories();
        if (c.length === 0) {
          const { DEFAULT_CATEGORIES } = await import('./data/mockData');
          c = await dbService.seedCategories(DEFAULT_CATEGORIES);
        }
        setCategories(c);
      } catch (err) {
        console.error('Failed to load/seed categories:', err);
      }

      // Load orders
      try {
        const o = await dbService.getOrders();
        setOrders(o);
      } catch (err) {
        console.error('Failed to load orders:', err);
      }

      // Load settings
      try {
        const set = await dbService.getSettings();
        if (set) setSettings(set);
      } catch (err) {
        console.error('Failed to load cafeteria settings:', err);
      }

      // Load reviews/feedback
      try {
        const { supabase } = await import('./supabaseClient');
        const { data: revsData, error: revsErr } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        if (!revsErr && revsData) {
          const mappedRevs: Review[] = revsData.map((r: any) => ({
            id: r.id,
            foodId: r.food_id,
            foodName: r.food_name,
            studentId: r.student_id,
            studentName: r.student_name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
          }));
          setReviews(mappedRevs);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
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
            isVegetarian: false,
            isNonVegetarian: false,
            isHighProtein: false,
            dailyCalorieTarget: 2000
          }
        }));
        setDbUsers(mappedUsers);
      }
    } catch (err) {
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
              profile.role = 'staff';
              profile.is_active = true;
            }
          }

          if (profile) {
            if (profile.is_active === false) {
              await supabase.auth.signOut();
              setCurrentUser(null);
              return;
            }

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
                isVegetarian: false,
                isNonVegetarian: false,
                isHighProtein: false,
                dailyCalorieTarget: 2000
              }
            };

            if (window.location.pathname === '/admin' && profile.role !== 'admin') {
              await supabase.auth.signOut();
              return;
            }
            if ((window.location.pathname === '/kitchenstaff' || window.location.pathname === '/kitchenstuff') && profile.role !== 'staff') {
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

    let orderSubscription: any;
    let notifSubscription: any;
    let pollInterval: any;

    const initializeRealtime = async () => {
      if (!currentUser) return;
      const { supabase } = await import('./supabaseClient');
      const { toCamel, dbService } = await import('./services/dbService');

      orderSubscription = supabase
        .channel('order-status-bumps')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          if (!payload.new) return;
          const camelPayload = toCamel(payload.new) as Order;

          setOrders((prev) => {
            const exists = prev.some((o) => o.id === camelPayload.id);
            if (exists) {
              return prev.map((o) => (o.id === camelPayload.id ? { ...o, ...camelPayload, items: o.items || camelPayload.items || [] } : o));
            } else {
              return [camelPayload, ...prev];
            }
          });

          if (currentUser && camelPayload.studentId === currentUser.id) {
            fetchUserNotifications(currentUser.id);
          }
        })
        .subscribe();

      notifSubscription = supabase
        .channel('user-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          if (!payload.new) return;
          const camelNotif = toCamel(payload.new) as AppNotification;
          if (camelNotif.userId === currentUser.id) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === camelNotif.id)) return prev;
              return [camelNotif, ...prev];
            });
          }
        })
        .subscribe();

      pollInterval = setInterval(async () => {
        try {
          const freshOrders = await dbService.getOrders();
          setOrders(freshOrders);
          if (currentUser?.id) {
            fetchUserNotifications(currentUser.id);
          }
        } catch (err) {
          // silent fallback
        }
      }, 3500);
    };

    initializeRealtime();

    return () => {
      if (orderSubscription) orderSubscription.unsubscribe();
      if (notifSubscription) notifSubscription.unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
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
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

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

  const sendNotification = async (userId: string, title: string, message: string) => {
    try {
      const { supabase } = await import('./supabaseClient');
      await supabase.from('notifications').insert([{
        user_id: userId,
        title,
        message,
        type: 'order_status',
        read: false,
      }]);
      if (currentUser?.id === userId) {
        fetchUserNotifications(userId);
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setActiveTab('student-orders');
    setStudentDashboardTab('orders');

    if (newOrder.studentId) {
      sendNotification(
        newOrder.studentId,
        `Order #${newOrder.orderNumber} Placed`,
        `Your pre-order #${newOrder.orderNumber} has been successfully placed!`
      );
    }
  };

  const handleReOrder = (items: any[]) => {
    items.forEach((it) => {
      const foodMatch = foods.find((f) => f.id === it.foodId);
      if (foodMatch) {
        handleAddToCart(foodMatch, it.quantity || 1, [], '');
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string,
    extraFields?: { cookingStation?: string; cookingStartedAt?: string; prepDurationMinutes?: number }
  ) => {
    try {
      const { dbService } = await import('./services/dbService');
      const updated = await dbService.updateOrderStatus(orderId, status, notes, extraFields);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      if (updated.studentId) {
        if (status === 'preparing') {
          sendNotification(
            updated.studentId,
            `Order #${updated.orderNumber} Accepted & Cooking`,
            `Your food is currently being prepared/cooked. ${notes ? `(${notes})` : ''}`
          );
        } else if (status === 'ready') {
          sendNotification(
            updated.studentId,
            `Order #${updated.orderNumber} Ready for Pickup`,
            `Your food is ready for pickup. Please collect your food from FoodZone.`
          );
        } else if (status === 'confirmed') {
          sendNotification(
            updated.studentId,
            `Order #${updated.orderNumber} Confirmed`,
            `Staff has accepted your order.`
          );
        }
      }
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
    }
  };

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

  const handleAddFood = async (newFood: Partial<FoodItem>) => {
    try {
      const { dbService } = await import('./services/dbService');
      const created = await dbService.addFood(newFood);
      setFoods((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('handleAddFood error:', err);
      throw err;
    }
  };

  const handleEditFood = async (foodId: string, updatedFields: Partial<FoodItem>) => {
    try {
      const { dbService } = await import('./services/dbService');
      await dbService.updateFood(foodId, updatedFields);
      const camelFood = await dbService.getFoods();
      setFoods(camelFood);
    } catch (err) {
      console.error('handleEditFood error:', err);
      throw err;
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

  const handleUpdateCalorieTarget = async (newTarget: number) => {
    if (!currentUser) return;
    try {
      const { dbService } = await import('./services/dbService');
      await dbService.updateUserCalorieTarget(currentUser.id, newTarget);
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              dietaryPreferences: {
                ...prev.dietaryPreferences,
                dailyCalorieTarget: newTarget,
              },
            }
          : null
      );
    } catch (err) {
      console.error('Failed to save calorie target to backend:', err);
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              dietaryPreferences: {
                ...prev.dietaryPreferences,
                dailyCalorieTarget: newTarget,
              },
            }
          : null
      );
    }
  };

  const handleToggleSuspendUser = async (userId: string, currentIsActive: boolean) => {
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentIsActive })
        .eq('id', userId);

      if (error) throw error;
      alert('User suspension status successfully updated!');
      fetchUsersDirectory();
    } catch (err: any) {
      alert(err.message || 'Error updating user status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user profile?')) return;
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      alert('User profile permanently deleted successfully!');
      fetchUsersDirectory();
    } catch (err: any) {
      alert(err.message || 'Error deleting user profile.');
    }
  };

  const handleUpdateStockQuantity = async (foodId: string, stockQuantity: number) => {
    await handleUpdateStock(foodId, stockQuantity > 0, stockQuantity);
  };

  const handleToggleSpecial = async (foodId: string, isSpecial: boolean) => {
    try {
      const { dbService } = await import('./services/dbService');
      const updated = await dbService.toggleSpecial(foodId, isSpecial);
      setFoods((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
    } catch (err) {
      setFoods((prev) => prev.map((f) => (f.id === foodId ? { ...f, isSpecial } : f)));
    }
  };

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
            profile.role = 'admin';
            profile.is_active = true;
          }
        }

        if (profile?.role === 'admin') {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            setPortalError('Access Denied. This administrator account has been suspended.');
            return;
          }
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            walletBalance: profile.wallet_balance || 0,
            dietaryPreferences: profile.dietary_preferences || {
              allergens: [],
              isVegetarian: false,
              isNonVegetarian: false,
              isHighProtein: false,
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
            profile.role = 'staff';
            profile.is_active = true;
          }
        }

        if (profile?.role === 'staff') {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            setPortalError('Access Denied. This kitchen staff account has been suspended.');
            return;
          }
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            walletBalance: profile.wallet_balance || 0,
            dietaryPreferences: profile.dietary_preferences || {
              allergens: [],
              isVegetarian: false,
              isNonVegetarian: false,
              isHighProtein: false,
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
      <div className="min-h-screen text-slate-900 flex flex-col font-sans antialiased selection:bg-[#006A4E] selection:text-white relative">
        {/* Persistent background mesh elements */}
        <div className="bg-mesh-container">
          <div className="mesh-blob-1" />
          <div className="mesh-blob-2" />
          <div className="mesh-blob-3" />
        </div>

        {currentUser && activeRole === 'admin' ? (
          <AdminDashboard
            foods={foods}
            categories={categories}
            coupons={coupons}
            auditLogs={auditLogs}
            users={dbUsers}
            orders={orders}
            settings={settings}
            reviews={reviews}
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
            onToggleSuspendUser={handleToggleSuspendUser}
            onDeleteUser={handleDeleteUser}
            onToggleSpecial={handleToggleSpecial}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-modal rounded-3xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#006A4E] flex items-center justify-center mx-auto text-white font-black text-lg shadow-lg shadow-emerald-900/20">
                  GUB
                </div>
                <h2 className="text-2xl font-black text-slate-900">GUB Admin Portal</h2>
                <p className="text-xs text-slate-600 font-medium">Campus Dining Operations & Management Directory</p>
              </div>

              {portalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 text-xs rounded-2xl font-medium">
                  {portalError}
                </div>
              )}

              <form onSubmit={handleAdminPortalLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Director Email Address</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="director@green.edu.bd"
                    className="w-full glass-input rounded-xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Security Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl glass-button font-black text-xs transition-all cursor-pointer"
                >
                  Verify Credentials & Enter Panel
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateToPath('/')}
                  className="text-xs text-[#006A4E] hover:underline font-bold"
                >
                  &larr; Back to Student Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === '/kitchenstaff' || currentPath === '/kitchenstuff') {
    return (
      <div className="min-h-screen text-slate-900 flex flex-col font-sans antialiased selection:bg-[#006A4E] selection:text-white relative">
        {/* Persistent background mesh elements */}
        <div className="bg-mesh-container">
          <div className="mesh-blob-1" />
          <div className="mesh-blob-2" />
          <div className="mesh-blob-3" />
        </div>

        {currentUser && activeRole === 'staff' ? (
          <StaffKitchenDashboard
            orders={orders}
            foods={foods}
            reviews={reviews}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateStock={handleUpdateStock}
            onLogOut={handleLogOut}
            onAddFood={handleAddFood}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-modal rounded-3xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#006A4E] flex items-center justify-center mx-auto text-white font-black text-lg shadow-lg shadow-emerald-900/20">
                  KDS
                </div>
                <h2 className="text-2xl font-black text-slate-900">GUB Kitchen Display System</h2>
                <p className="text-xs text-slate-600 font-medium">Order Bump Bar & Food Prep Queue</p>
              </div>

              {portalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 text-xs rounded-2xl font-medium">
                  {portalError}
                </div>
              )}

              <form onSubmit={handleKitchenPortalLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kitchen Staff Email Address</label>
                  <input
                    type="email"
                    required
                    value={kitchenEmail}
                    onChange={(e) => setKitchenEmail(e.target.value)}
                    placeholder="kitchen@green.edu.bd"
                    className="w-full glass-input rounded-xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kitchen Security Password</label>
                  <input
                    type="password"
                    required
                    value={kitchenPassword}
                    onChange={(e) => setKitchenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl p-3 text-slate-900 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl glass-button font-black text-xs transition-all cursor-pointer"
                >
                  Verify Credentials & Enter KDS
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateToPath('/')}
                  className="text-xs text-[#006A4E] hover:underline font-bold"
                >
                  &larr; Back to Student Portal
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
    <div className="min-h-screen text-slate-900 flex flex-col font-sans antialiased selection:bg-[#006A4E] selection:text-white relative">
      {/* Persistent background mesh elements */}
      <div className="bg-mesh-container">
        <div className="mesh-blob-1" />
        <div className="mesh-blob-2" />
        <div className="mesh-blob-3" />
      </div>

      {/* Sticky Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if ((tab === 'checkout' || tab === 'student-orders') && !currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setActiveTab(tab);
          setSelectedCategorySlug(undefined);
        }}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setIsCartOpen(true);
        }}
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
            currentUser={currentUser}
            onUpdateCalorieTarget={handleUpdateCalorieTarget}
            onAddToCart={handleAddToCart}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'faq' && <FAQView />}

        {activeTab === 'checkout' && (
          currentUser ? (
            <CheckoutView
              currentUser={currentUser}
              cartItems={cartItems}
              selectedPickupSlot={selectedPickupSlot}
              onSelectPickupSlot={setSelectedPickupSlot}
              appliedCoupon={appliedCoupon}
              onBackToMenu={() => setActiveTab('menu')}
              onOrderPlaced={handleOrderPlaced}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 glass-modal rounded-3xl text-center space-y-4 shadow-xl">
              <h2 className="text-xl font-black text-slate-900">Authentication Required</h2>
              <p className="text-xs text-slate-600 font-medium">Please sign in to place an order and proceed to checkout.</p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 glass-button font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Sign In / Login
              </button>
            </div>
          )
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
            onUpdateCalorieTarget={handleUpdateCalorieTarget}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          if ((tab === 'checkout' || tab === 'student-orders') && !currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setActiveTab(tab);
        }}
      />

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
        onProceedToCheckout={() => {
          if (!currentUser) {
            setIsCartOpen(false);
            setIsAuthOpen(true);
            return;
          }
          setActiveTab('checkout');
        }}
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

      {/* Real-time Order Toast Notification Banner */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full glass-modal border-2 border-[#006A4E] text-slate-900 p-4 rounded-2xl shadow-2xl animate-bounce flex items-start justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-[#006A4E]">{activeToast.title}</h4>
            <p className="text-xs text-slate-700 mt-0.5">{activeToast.message}</p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
