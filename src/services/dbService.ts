import { supabase } from '../supabaseClient';
import { FoodItem, FoodCategory, Order, Coupon, AppNotification, CafeteriaSettings, AuditLog, UserProfile } from '../types';

// Helper to convert snake_case object to camelCase
export function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key: string) => {
      const camelKey = key.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Helper to convert camelCase object to snake_case
export function toSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnake(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export const dbService = {
  // Foods
  async getFoods(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return toCamel(data || []) as FoodItem[];
  },

  async addFood(food: Partial<FoodItem>): Promise<FoodItem> {
    const generatedSlug = food.slug || (food.name || 'food-item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    const foodWithSlug = { ...food, slug: generatedSlug };
    const dbFood = toSnake(foodWithSlug);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([dbFood])
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as FoodItem;
  },

  async deleteFood(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateFood(id: string, food: Partial<FoodItem>): Promise<FoodItem> {
    const dbFood = toSnake(food);
    const { data, error } = await supabase
      .from('menu_items')
      .update(dbFood)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as FoodItem;
  },

  async updateStock(id: string, isAvailable: boolean, stockQuantity?: number): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available: isAvailable, stock_quantity: stockQuantity })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as FoodItem;
  },

  // Categories
  async getCategories(): Promise<FoodCategory[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    if (error) throw error;
    return toCamel(data || []) as FoodCategory[];
  },

  async seedCategories(categoriesList: Partial<FoodCategory>[]): Promise<FoodCategory[]> {
    const dbCategories = categoriesList.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      image: cat.image
    }));
    const { data, error } = await supabase
      .from('categories')
      .insert(dbCategories)
      .select();
    if (error) throw error;
    return toCamel(data || []) as FoodCategory[];
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return toCamel(data || []) as Order[];
  },

  async addOrder(order: Partial<Order>): Promise<Order> {
    const dbOrder = toSnake(order);
    const { data, error } = await supabase
      .from('orders')
      .insert([dbOrder])
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as Order;
  },

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status, kitchen_notes: notes })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as Order;
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*');
    if (error) throw error;
    return toCamel(data || []) as Coupon[];
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return toCamel(data || []) as AppNotification[];
  },

  // Settings
  async getSettings(): Promise<CafeteriaSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'cafeteria')
      .single();
    if (error) throw error;
    return toCamel(data) as CafeteriaSettings;
  },

  async updateSettings(settings: Partial<CafeteriaSettings>): Promise<CafeteriaSettings> {
    const dbSettings = toSnake(settings);
    const { data, error } = await supabase
      .from('settings')
      .update(dbSettings)
      .eq('id', 'cafeteria')
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as CafeteriaSettings;
  },

  // Notifications
  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    if (error) throw error;
  }
};
