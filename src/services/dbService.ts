import { supabase } from '../supabaseClient';
import { FoodItem, FoodCategory, Order, Coupon, AppNotification, CafeteriaSettings, AuditLog, UserProfile } from '../types';

// Helper to convert snake_case object to camelCase
export function toCamel(obj: any): any {
  if (obj === undefined || obj === null) return obj;
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (typeof obj === 'object' && obj.constructor === Object) {
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
  if (obj === undefined || obj === null) return obj;
  if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (typeof obj === 'object' && obj.constructor === Object) {
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

    let resolvedCategoryId = food.categoryId;
    let resolvedCategoryName = food.categoryName;

    // Check if categoryId is a valid UUID
    const isUuid = resolvedCategoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedCategoryId);

    if (!isUuid) {
      try {
        const categories = await dbService.getCategories();
        const match = categories.find(c =>
          c.id === resolvedCategoryId ||
          c.slug.toLowerCase() === String(resolvedCategoryId).toLowerCase() ||
          c.name.toLowerCase() === String(resolvedCategoryId).toLowerCase() ||
          (resolvedCategoryName && c.name.toLowerCase() === resolvedCategoryName.toLowerCase())
        );

        if (match) {
          resolvedCategoryId = match.id;
          resolvedCategoryName = match.name;
        } else {
          resolvedCategoryId = undefined;
        }
      } catch (err) {
        console.error('Failed to resolve category UUID:', err);
        resolvedCategoryId = undefined;
      }
    }

    if (!resolvedCategoryName) {
      resolvedCategoryName = 'General';
    }

    const foodWithSlug = {
      ...food,
      slug: generatedSlug,
      categoryId: resolvedCategoryId,
      categoryName: resolvedCategoryName,
    };
    const dbFood = toSnake(foodWithSlug);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([dbFood])
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as FoodItem;
  },

  async toggleSpecial(id: string, isSpecial: boolean): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_special: isSpecial })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data) as FoodItem;
  },

  async incrementOrderCounts(items: { foodId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      if (!item.foodId) continue;
      try {
        const { data } = await supabase
          .from('menu_items')
          .select('order_count')
          .eq('id', item.foodId)
          .single();
        const currentCount = data?.order_count || 0;
        await supabase
          .from('menu_items')
          .update({ order_count: currentCount + (item.quantity || 1) })
          .eq('id', item.foodId);
      } catch (err) {
        console.error('Failed to increment order count for food item:', item.foodId, err);
      }
    }
  },

  async deleteFood(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateFood(id: string, food: Partial<FoodItem>): Promise<FoodItem> {
    let resolvedCategoryId = food.categoryId;
    let resolvedCategoryName = food.categoryName;

    if (resolvedCategoryId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedCategoryId);
      if (!isUuid) {
        try {
          const categories = await dbService.getCategories();
          const match = categories.find(c =>
            c.id === resolvedCategoryId ||
            c.slug.toLowerCase() === String(resolvedCategoryId).toLowerCase() ||
            c.name.toLowerCase() === String(resolvedCategoryId).toLowerCase() ||
            (resolvedCategoryName && c.name.toLowerCase() === resolvedCategoryName.toLowerCase())
          );

          if (match) {
            resolvedCategoryId = match.id;
            resolvedCategoryName = match.name;
          } else {
            resolvedCategoryId = undefined;
          }
        } catch (err) {
          console.error('Failed to resolve category UUID:', err);
          resolvedCategoryId = undefined;
        }
      }
    }

    const updatedPayload = {
      ...food,
      ...(resolvedCategoryId !== undefined && { categoryId: resolvedCategoryId }),
      ...(resolvedCategoryName !== undefined && { categoryName: resolvedCategoryName }),
    };

    const dbFood = toSnake(updatedPayload);
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
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const camelOrders = toCamel(data || []) as any[];
    return camelOrders.map(ord => ({
      ...ord,
      items: ord.orderItems || []
    })) as Order[];
  },

  async addOrder(order: Partial<Order> & { items: any[] }): Promise<Order> {
    const orderNumber = 'GUB-' + Date.now().toString().slice(-6);
    const qrCodeData = orderNumber + '-STUDENT-PICKUP';

    // Construct the database orders row fields (omitting items array)
    const orderFields = {
      orderNumber,
      studentId: order.studentId,
      studentName: order.studentName,
      studentEmail: order.studentEmail,
      studentPhone: order.studentPhone,
      studentIdCardNumber: order.studentIdCardNumber,
      subtotal: order.subtotal,
      discount: order.discount,
      couponCode: order.couponCode,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'paid',
      orderStatus: 'pending',
      pickupTimeSlot: order.pickupTimeSlot,
      qrCodeData,
      estimatedReadyTime: order.estimatedReadyTime || '15 mins',
      kitchenNotes: order.kitchenNotes || ''
    };

    const dbOrder = toSnake(orderFields);
    const { data: ordData, error: ordErr } = await supabase
      .from('orders')
      .insert([dbOrder])
      .select()
      .single();

    if (ordErr) throw ordErr;

    const createdOrder = toCamel(ordData);

    // Now insert each order item into order_items table
    if (order.items && order.items.length > 0) {
      const dbItems = order.items.map(it => toSnake({
        orderId: createdOrder.id,
        foodId: it.foodId,
        foodName: it.foodName,
        foodImage: it.foodImage,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        selectedOptionsText: it.selectedOptionsText || '',
        specialInstructions: it.specialInstructions || ''
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(dbItems);

      if (itemsErr) throw itemsErr;

      // Increment food order counts in menu_items table
      await dbService.incrementOrderCounts(
        order.items.map((it) => ({ foodId: it.foodId, quantity: it.quantity }))
      );
    }

    return {
      ...createdOrder,
      items: order.items
    } as Order;
  },

  async updateOrderStatus(
    id: string,
    status: string,
    notes?: string,
    extraFields?: { cookingStation?: string; cookingStartedAt?: string; prepDurationMinutes?: number }
  ): Promise<Order> {
    const updatePayload: any = { order_status: status, kitchen_notes: notes };
    if (extraFields?.cookingStation !== undefined) updatePayload.cooking_station = extraFields.cookingStation;
    if (extraFields?.cookingStartedAt !== undefined) updatePayload.cooking_started_at = extraFields.cookingStartedAt;
    if (extraFields?.prepDurationMinutes !== undefined) updatePayload.prep_duration_minutes = extraFields.prepDurationMinutes;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      // If table missing dynamic columns on fallback DB, perform update without custom station columns
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from('orders')
        .update({ order_status: status, kitchen_notes: notes })
        .eq('id', id)
        .select('*, order_items(*)')
        .single();

      if (fallbackErr) throw fallbackErr;
      const camelFallback = toCamel(fallbackData) as any;
      return {
        ...camelFallback,
        cookingStation: extraFields?.cookingStation || camelFallback.cookingStation,
        cookingStartedAt: extraFields?.cookingStartedAt || camelFallback.cookingStartedAt,
        prepDurationMinutes: extraFields?.prepDurationMinutes || camelFallback.prepDurationMinutes,
        items: camelFallback.orderItems || []
      } as Order;
    }

    const camelOrder = toCamel(data) as any;
    return {
      ...camelOrder,
      items: camelOrder.orderItems || []
    } as Order;
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
  },

  // User Profile Dietary Preferences & Calorie Target
  async updateUserCalorieTarget(userId: string, newTarget: number): Promise<UserProfile> {
    // First retrieve current profile
    const { data: current, error: fetchErr } = await supabase
      .from('profiles')
      .select('dietary_preferences')
      .eq('id', userId)
      .single();

    const existingPrefs = current?.dietary_preferences || {
      allergens: [],
      isVegetarian: false,
      isNonVegetarian: false,
      isHighProtein: false,
      dailyCalorieTarget: 2000
    };

    const updatedPrefs = {
      ...existingPrefs,
      dailyCalorieTarget: newTarget
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({ dietary_preferences: updatedPrefs })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return toCamel(data) as UserProfile;
  }
};
