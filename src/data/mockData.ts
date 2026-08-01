import {
  FoodCategory,
  FoodItem,
  UserProfile,
  Order,
  Review,
  Coupon,
  AuditLog,
  AppNotification,
  CafeteriaSettings,
} from '../types';

export const DEFAULT_CATEGORIES: FoodCategory[] = [
  {
    id: 'cat_specials',
    name: "Chef's Daily Specials",
    slug: 'specials',
    description: 'Freshly prepared daily specials curated for campus energy.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_rice_bowls',
    name: 'Warm Rice Bowls & Mains',
    slug: 'rice-bowls',
    description: 'Hearty, balanced main courses with basmati rice & grilled proteins.',
    icon: 'CookingPot',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_burgers_wraps',
    name: 'Burgers & Wraps',
    slug: 'burgers-wraps',
    description: 'Quick-grab artisanal wraps, grilled paninis & campus burgers.',
    icon: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_healthy',
    name: 'Salads & Lean Bowls',
    slug: 'healthy',
    description: 'High-protein, low-calorie greens & grain superfood bowls.',
    icon: 'Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_breakfast',
    name: 'Morning Breakfast',
    slug: 'breakfast',
    description: 'Oatmeal, parathas, eggs, pancakes & energizing morning quick bites.',
    icon: 'Egg',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_beverages',
    name: 'Artisan Teas & Cold Brews',
    slug: 'beverages',
    description: 'Campus Karak Chai, iced matchas, fresh juices & espresso drinks.',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_snacks',
    name: 'Snacks & Desserts',
    slug: 'snacks',
    description: 'Samosas, baked muffins, fruit pots & frozen yogurts.',
    icon: 'Cookie',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
];

// Purged hardcoded items as requested for a clean live database experience
export const CATEGORIES: FoodCategory[] = [];
export const INITIAL_FOODS: FoodItem[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_CAFETERIA_SETTINGS: CafeteriaSettings = {
  isAcceptingOrders: true,
  openingTime: '07:30 AM',
  closingTime: '08:30 PM',
  slotIntervalMinutes: 10,
  maxOrdersPerSlot: 20,
  taxRatePercent: 0,
  studentDiscountPercent: 5,
  announcementBanner: '⚡ GUB Midterm Special: Pre-order early to beat the 12:00 PM - 1:15 PM lunch queue!',
};
