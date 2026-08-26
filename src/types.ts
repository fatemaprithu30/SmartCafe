export type UserRole = 'student' | 'staff' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  walletBalance: number;
  dietaryPreferences: {
    allergens: string[];
    isVegetarian: boolean;
    isNonVegetarian: boolean;
    isHighProtein: boolean;
    dailyCalorieTarget: number;
  };
  isActive?: boolean;
  createdAt?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  itemCount?: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sodiumMg?: number;
  sugarGrams?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  prepTimeMinutes: number;
  imageUrl: string;
  isAvailable: boolean;
  isSpecial: boolean;
  isPopular: boolean;
  rating: number;
  reviewCount: number;
  dietaryTags: string[]; // e.g. ['Vegetarian', 'Non-Vegetarian', 'High Protein']
  allergens: string[]; // e.g. ['Peanuts', 'Dairy', 'Gluten', 'Eggs']
  nutrition: NutritionInfo;
  customizationGroups?: CustomizationGroup[];
  stockQuantity: number;
  minStockAlert: number;
  orderCount?: number;
}

export interface CartItemOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart entry id
  food: FoodItem;
  quantity: number;
  selectedOptions: CartItemOption[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'student_id' | 'bkash_nagad' | 'card' | 'cash';

export interface OrderItem {
  foodId: string;
  foodName: string;
  foodImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptionsText?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentIdCardNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  orderStatus: OrderStatus;
  pickupTimeSlot: string; // e.g., "12:10 PM - 12:20 PM"
  qrCodeData: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime: string; // e.g., "12:15 PM"
  kitchenNotes?: string;
  cookingStation?: string; // e.g. "Stove Station 1", "Grill Station A", "Fryer / Express"
  cookingStartedAt?: string; // ISO string when cooking started
  prepDurationMinutes?: number; // Minutes allocated for cooking
}

export interface Review {
  id: string;
  foodId: string;
  foodName: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}


export interface AuditLog {
  id: string;
  userRole: UserRole;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_status' | 'stock_alert' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  todayRevenue: number;
  todayOrdersCount: number;
  activePreOrders: number;
  avgPrepTimeMinutes: number;
  topSellingFoods: { name: string; salesCount: number; revenue: number }[];
  hourlyOrderDistribution: { hour: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  dietaryBreakdown: { tag: string; percentage: number }[];
}

export interface CafeteriaSettings {
  isAcceptingOrders: boolean;
  openingTime: string;
  closingTime: string;
  slotIntervalMinutes: number;
  maxOrdersPerSlot: number;
  taxRatePercent: number;
  studentDiscountPercent: number;
  announcementBanner?: string;
}
