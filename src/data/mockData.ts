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
    id: 'cat_snacks',
    name: 'Snacks',
    slug: 'snacks',
    description: 'Samosas, burgers, rolls, light bites & tea-time refreshers.',
    icon: 'Cookie',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_FOODS: FoodItem[] = [
  {
    id: 'food_1',
    name: 'GUB Special Chicken Biryani',
    slug: 'gub-special-chicken-biryani',
    description: 'Fragrant Kacchi style basmati rice cooked with tender chicken, potato and aromatic spices.',
    price: 180,
    categoryId: 'cat_lunch',
    categoryName: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    prepTimeMinutes: 10,
    isAvailable: true,
    isPopular: true,
    isSpecial: true,
    rating: 4.8,
    reviewCount: 42,
    stockQuantity: 50,
    minStockAlert: 5,
    dietaryTags: ['Non-Vegetarian', 'High Protein'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 650,
      proteinGrams: 32,
      carbsGrams: 75,
      fatGrams: 22,
      sodiumMg: 850
    }
  },
  {
    id: 'food_2',
    name: 'Crispy Chicken Zinger Burger',
    slug: 'crispy-chicken-zinger-burger',
    description: 'Crispy fried chicken breast fillet with fresh lettuce, mayonnaise and toasted sesame bun.',
    price: 140,
    categoryId: 'cat_snacks',
    categoryName: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    prepTimeMinutes: 12,
    isAvailable: true,
    isPopular: true,
    isSpecial: false,
    rating: 4.6,
    reviewCount: 28,
    stockQuantity: 30,
    minStockAlert: 5,
    dietaryTags: ['Non-Vegetarian', 'High Protein'],
    allergens: ['Gluten', 'Egg'],
    nutrition: {
      calories: 520,
      proteinGrams: 28,
      carbsGrams: 48,
      fatGrams: 24,
      sodiumMg: 920
    }
  }
];

export const CATEGORIES: FoodCategory[] = DEFAULT_CATEGORIES;
export const INITIAL_FOODS: FoodItem[] = DEFAULT_FOODS;
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
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
  announcementBanner: '⚡ SmartCafe Hours: 8:30 AM – 4:30 PM | Breakfast: 8:30–10:00 AM | Snacks: 10:00 AM–12:00 PM & 3:00–4:30 PM | Lunch: 12:00–3:00 PM',
};
