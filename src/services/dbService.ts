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

export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
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
    const foods = toCamel(data || []) as FoodItem[];

    return foods.map(f => {
      let rawCat = (f.categoryName || f.categoryId || 'Snack').toString().trim();
      let normalizedCat = 'Snack';
      if (rawCat.toLowerCase().includes('breakfast')) {
        normalizedCat = 'Breakfast';
      } else if (rawCat.toLowerCase().includes('lunch')) {
        normalizedCat = 'Lunch';
      } else {
        normalizedCat = 'Snack';
      }
      return {
        ...f,
        categoryName: normalizedCat
      };
    });
  },

  async addFood(food: Partial<FoodItem>): Promise<FoodItem> {
    const generatedSlug = food.slug || (food.name || 'food-item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    let rawCategory = (food.categoryName || food.categoryId || 'Snack').toString().trim();
    let normalizedCategoryName = 'Snack';
    if (rawCategory.toLowerCase().includes('breakfast')) {
      normalizedCategoryName = 'Breakfast';
    } else if (rawCategory.toLowerCase().includes('lunch')) {
      normalizedCategoryName = 'Lunch';
    } else {
      normalizedCategoryName = 'Snack';
    }

    let resolvedCategoryId: string | null = null;

    if (food.categoryId && isValidUuid(food.categoryId)) {
      resolvedCategoryId = food.categoryId;
    } else {
      try {
        const categories = await dbService.getCategories();
        const match = categories.find(c =>
          c.name.toLowerCase() === normalizedCategoryName.toLowerCase() ||
          c.slug.toLowerCase() === normalizedCategoryName.toLowerCase()
        );

        if (match && isValidUuid(match.id)) {
          resolvedCategoryId = match.id;
        }
      } catch (err) {
        console.error('Failed to resolve category UUID:', err);
      }
    }

    const foodWithSlug = {
      ...food,
      slug: generatedSlug,
      categoryId: resolvedCategoryId,
      categoryName: normalizedCategoryName,
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
    let normalizedCategoryName: string | undefined = undefined;
    let resolvedCategoryId: string | null | undefined = undefined;

    if (food.categoryName || food.categoryId) {
      let rawCategory = (food.categoryName || food.categoryId || '').toString().trim();
      if (rawCategory.toLowerCase().includes('breakfast')) {
        normalizedCategoryName = 'Breakfast';
      } else if (rawCategory.toLowerCase().includes('lunch')) {
        normalizedCategoryName = 'Lunch';
      } else {
        normalizedCategoryName = 'Snack';
      }

      if (food.categoryId && isValidUuid(food.categoryId)) {
        resolvedCategoryId = food.categoryId;
      } else {
        try {
          const categories = await dbService.getCategories();
          const match = categories.find(c =>
            c.name.toLowerCase() === normalizedCategoryName!.toLowerCase() ||
            c.slug.toLowerCase() === normalizedCategoryName!.toLowerCase()
          );

          if (match && isValidUuid(match.id)) {
            resolvedCategoryId = match.id;
          } else {
            resolvedCategoryId = null;
          }
        } catch (err) {
          console.error('Failed to resolve category UUID:', err);
          resolvedCategoryId = null;
        }
      }
    }

    const updatedPayload = {
      ...food,
      ...(resolvedCategoryId !== undefined && { categoryId: resolvedCategoryId }),
      ...(normalizedCategoryName !== undefined && { categoryName: normalizedCategoryName }),
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
    const cats = toCamel(data || []) as FoodCategory[];

    const requiredCats = [
      { name: 'Breakfast', slug: 'breakfast', description: 'Morning quick bites, oats, parathas, eggs & hot drinks (8:00 AM – 10:00 AM)', icon: 'Egg', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lunch', slug: 'lunch', description: 'Hearty rice bowls, biryanis, curries & balanced entrees (12:00 PM – 3:00 PM)', icon: 'CookingPot', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80' },
      { name: 'Snack', slug: 'snack', description: 'Burgers, wraps, samosas & tea-time snacks (10:00 AM–12:00 PM & 3:00 PM–4:30 PM)', icon: 'Cookie', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
    ];

    // Remove any categories that are not Breakfast, Lunch, or Snack
    const extraCategories = cats.filter(c => !requiredCats.some(r => r.slug === c.slug.toLowerCase() || r.name.toLowerCase() === c.name.toLowerCase()));
    if (extraCategories.length > 0) {
      for (const extra of extraCategories) {
        try {
          await supabase.from('categories').delete().eq('id', extra.id);
        } catch (e) {
          console.error('Failed to delete extra category:', extra.name, e);
        }
      }
    }

    // Insert missing required categories or rename "Snacks" to "Snack"
    for (const req of requiredCats) {
      const existing = cats.find(c => c.slug.toLowerCase() === req.slug || c.name.toLowerCase() === req.name.toLowerCase() || (req.slug === 'snack' && c.name.toLowerCase() === 'snacks'));
      if (existing) {
        if (existing.name !== req.name || existing.slug !== req.slug) {
          try {
            await supabase.from('categories').update({ name: req.name, slug: req.slug }).eq('id', existing.id);
          } catch (e) {
            console.error('Failed to rename category:', e);
          }
        }
      } else {
        try {
          await supabase.from('categories').insert([{
            name: req.name,
            slug: req.slug,
            description: req.description,
            icon: req.icon,
            image: req.image
          }]);
        } catch (e) {
          console.error('Failed to seed category:', req.name, e);
        }
      }
    }

    const { data: updatedData } = await supabase.from('categories').select('*');
    return toCamel(updatedData || []) as FoodCategory[];
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
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('notifications')) {
          console.warn("Table 'public.notifications' is missing in Supabase schema cache.");
          return [];
        }
        throw error;
      }
      return toCamel(data || []) as AppNotification[];
    } catch (err) {
      return [];
    }
  },

  // Settings
  async getSettings(): Promise<CafeteriaSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'cafeteria')
      .maybeSingle();

    if (error) {
      console.warn('Could not query cafeteria settings from Supabase:', error.message);
    }

    if (data) {
      return toCamel(data) as CafeteriaSettings;
    }

    // Attempt to seed default cafeteria settings if row is missing
    const defaultSettingsPayload = {
      id: 'cafeteria',
      is_accepting_orders: true,
      opening_time: '07:30 AM',
      closing_time: '08:30 PM',
      slot_interval_minutes: 10,
      max_orders_per_slot: 20,
      tax_rate_percent: 0.00,
      student_discount_percent: 5.00,
      announcement_banner: 'Welcome to GUB Smart Café!'
    };

    try {
      const { data: insertedData } = await supabase
        .from('settings')
        .upsert([defaultSettingsPayload], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (insertedData) {
        return toCamel(insertedData) as CafeteriaSettings;
      }
    } catch (seedErr) {
      console.warn('Auto-seed of cafeteria settings row failed:', seedErr);
    }

    return toCamel(defaultSettingsPayload) as CafeteriaSettings;
  },

  async updateSettings(settings: Partial<CafeteriaSettings>): Promise<CafeteriaSettings> {
    const dbSettings = {
      id: 'cafeteria',
      ...toSnake(settings)
    };
    const { data, error } = await supabase
      .from('settings')
      .upsert([dbSettings], { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (data) return toCamel(data) as CafeteriaSettings;

    return toCamel({ id: 'cafeteria', ...settings }) as CafeteriaSettings;
  },

  // Notifications
  async markNotificationAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error && error.code !== 'PGRST205') throw error;
    } catch (err) {
      // Fallback
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
      if (error && error.code !== 'PGRST205') throw error;
    } catch (err) {
      // Fallback
    }
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
