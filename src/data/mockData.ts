import {
  FoodCategory,
  FoodItem,
  UserProfile,
  Order,
  Review,
  AuditLog,
  AppNotification,
  CafeteriaSettings,
} from '../types';

export const DEFAULT_CATEGORIES: FoodCategory[] = [
  {
    id: 'cat_breakfast',
    name: 'Breakfast',
    slug: 'breakfast',
    description: 'Oatmeal, parathas, eggs, pancakes & energizing morning quick bites.',
    icon: 'Egg',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_lunch',
    name: 'Lunch',
    slug: 'lunch',
    description: 'Hearty meals, rice bowls, curries & balanced midday entrees.',
    icon: 'CookingPot',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat_snack',
    name: 'Snack',
    slug: 'snack',
    description: 'Samosas, burgers, rolls, light bites & tea-time refreshers.',
    icon: 'Cookie',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_FOODS: FoodItem[] = [];

export const CATEGORIES: FoodCategory[] = DEFAULT_CATEGORIES;
export const INITIAL_FOODS: FoodItem[] = DEFAULT_FOODS;
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_CAFETERIA_SETTINGS: CafeteriaSettings = {
  isAcceptingOrders: true,
  openingTime: '08:30 AM',
  closingTime: '04:30 PM',
  slotIntervalMinutes: 10,
  maxOrdersPerSlot: 20,
  taxRatePercent: 0,
  studentDiscountPercent: 5,
  announcementBanner: '⚡ SmartCafe Hours: 8:30 AM – 4:30 PM | Breakfast: 8:30–10:00 AM | Snack: 10:00 AM–12:00 PM & 3:00–4:30 PM | Lunch: 12:00–3:00 PM',
};
