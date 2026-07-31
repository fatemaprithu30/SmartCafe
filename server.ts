import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
} from './src/data/mockData.js';
import { FoodItem, Order, OrderStatus, Review, Coupon, AuditLog, AppNotification } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let users = [...INITIAL_USERS];
let categories = [...CATEGORIES];
let foods: FoodItem[] = [...INITIAL_FOODS];
let orders: Order[] = [...INITIAL_ORDERS];
let reviews: Review[] = [...INITIAL_REVIEWS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let cafeteriaSettings = { ...DEFAULT_CAFETERIA_SETTINGS };

// Gemini AI Setup (Lazy initialization on endpoint)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Helper to record audit logs
function logAction(userRole: any, userName: string, action: string, details: string) {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userRole,
    userName,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(log);
}

// API ROUTES

// 1. Foods API
app.get('/api/foods', (req, res) => {
  res.json(foods);
});

app.post('/api/foods', (req, res) => {
  const newFood: FoodItem = {
    id: `food_${Date.now()}`,
    slug: req.body.name ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'food-item',
    rating: 5.0,
    reviewCount: 0,
    ...req.body,
  };
  foods.unshift(newFood);
  logAction('admin', 'Admin', 'Food Item Created', `Added new menu item: ${newFood.name}`);
  res.status(201).json(newFood);
});

app.put('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  const index = foods.findIndex((f) => f.id === id);
  if (index !== -1) {
    foods[index] = { ...foods[index], ...req.body };
    logAction('admin', 'Admin', 'Food Item Updated', `Updated menu item: ${foods[index].name}`);
    return res.json(foods[index]);
  }
  res.status(404).json({ error: 'Food item not found' });
});

app.delete('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  const target = foods.find((f) => f.id === id);
  foods = foods.filter((f) => f.id !== id);
  if (target) {
    logAction('admin', 'Admin', 'Food Item Removed', `Deleted menu item: ${target.name}`);
  }
  res.json({ success: true });
});

// Toggle Food Availability / Stock
app.patch('/api/foods/:id/stock', (req, res) => {
  const { id } = req.params;
  const { isAvailable, stockQuantity } = req.body;
  const index = foods.findIndex((f) => f.id === id);
  if (index !== -1) {
    if (typeof isAvailable === 'boolean') foods[index].isAvailable = isAvailable;
    if (typeof stockQuantity === 'number') foods[index].stockQuantity = stockQuantity;
    logAction('staff', 'Kitchen Staff', 'Stock Quick Toggle', `Updated stock status for ${foods[index].name}`);
    return res.json(foods[index]);
  }
  res.status(404).json({ error: 'Food item not found' });
});

// 2. Categories API
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// 3. Orders API
app.get('/api/orders', (req, res) => {
  const { studentId, status } = req.query;
  let filtered = [...orders];
  if (studentId) {
    filtered = filtered.filter((o) => o.studentId === studentId);
  }
  if (status) {
    filtered = filtered.filter((o) => o.orderStatus === status);
  }
  res.json(filtered);
});

app.post('/api/orders', (req, res) => {
  const orderNum = `SCAF-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const readyEstimateMinutes = 15;
  const estimatedReadyTimeObj = new Date(now.getTime() + readyEstimateMinutes * 60 * 1000);
  
  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber: orderNum,
    studentId: req.body.studentId || 'user_student_1',
    studentName: req.body.studentName || 'Aria Rahman',
    studentEmail: req.body.studentEmail || 'aria.student@univ.edu',
    studentPhone: req.body.studentPhone || '+1 (555) 234-5678',
    studentIdCardNumber: req.body.studentIdCardNumber || 'UG-2024-8842',
    items: req.body.items || [],
    subtotal: req.body.subtotal || 0,
    discount: req.body.discount || 0,
    couponCode: req.body.couponCode,
    total: req.body.total || 0,
    paymentMethod: req.body.paymentMethod || 'student_id',
    paymentStatus: req.body.paymentStatus || 'paid',
    orderStatus: 'pending',
    pickupTimeSlot: req.body.pickupTimeSlot || '12:15 PM - 12:25 PM',
    qrCodeData: `${orderNum}-${req.body.studentName || 'STUDENT'}-PICKUP`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    estimatedReadyTime: estimatedReadyTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  orders.unshift(newOrder);

  // Update stock quantities
  newOrder.items.forEach((item) => {
    const food = foods.find((f) => f.id === item.foodId);
    if (food) {
      food.stockQuantity = Math.max(0, food.stockQuantity - item.quantity);
    }
  });

  // Create notification
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: newOrder.studentId,
    title: 'Order Placed Successfully! 🛒',
    message: `Order #${newOrder.orderNumber} is received by the kitchen. Pickup slot: ${newOrder.pickupTimeSlot}`,
    type: 'order_status',
    read: false,
    createdAt: now.toISOString(),
  });

  logAction('student', newOrder.studentName, 'Pre-Order Created', `Placed order #${newOrder.orderNumber} for $${newOrder.total}`);

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { orderStatus, kitchenNotes } = req.body as { orderStatus: OrderStatus; kitchenNotes?: string };
  const order = orders.find((o) => o.id === id);

  if (order) {
    order.orderStatus = orderStatus;
    order.updatedAt = new Date().toISOString();
    if (kitchenNotes) order.kitchenNotes = kitchenNotes;

    let msg = `Order #${order.orderNumber} status updated to ${orderStatus.toUpperCase()}`;
    if (orderStatus === 'preparing') {
      msg = `🍳 Kitchen started preparing your order #${order.orderNumber}`;
    } else if (orderStatus === 'ready') {
      msg = `🔔 Order #${order.orderNumber} is READY FOR PICKUP at Counter 1! Show your QR code.`;
    } else if (orderStatus === 'completed') {
      msg = `✅ Order #${order.orderNumber} has been picked up. Enjoy your meal!`;
    }

    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: order.studentId,
      title: orderStatus === 'ready' ? 'Food Ready at Pickup Counter! 🍲' : `Order #${order.orderNumber} Update`,
      message: msg,
      type: 'order_status',
      read: false,
      createdAt: new Date().toISOString(),
    });

    logAction('staff', 'Kitchen Staff', 'Order Status Shift', `Shifted order #${order.orderNumber} to ${orderStatus}`);

    return res.json(order);
  }
  res.status(404).json({ error: 'Order not found' });
});

// 4. Coupons & Discounts API
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = coupons.find((c) => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
  }

  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order value for this coupon is $${coupon.minOrderValue.toFixed(2)}`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    valid: true,
    coupon,
    discountAmount: Math.min(discountAmount, subtotal),
  });
});

app.post('/api/coupons', (req, res) => {
  const newCoupon: Coupon = {
    id: `coup_${Date.now()}`,
    usageCount: 0,
    ...req.body,
  };
  coupons.unshift(newCoupon);
  logAction('admin', 'Admin', 'Coupon Created', `Added promo code: ${newCoupon.code}`);
  res.status(201).json(newCoupon);
});

// 5. Reviews API
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const newReview: Review = {
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  reviews.unshift(newReview);

  // Update food rating
  const food = foods.find((f) => f.id === newReview.foodId);
  if (food) {
    const totalScore = food.rating * food.reviewCount + newReview.rating;
    food.reviewCount += 1;
    food.rating = Number((totalScore / food.reviewCount).toFixed(1));
  }

  res.status(201).json(newReview);
});

// 6. Users & Roles API
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.put('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = users.find((u) => u.id === id);
  if (user) {
    user.role = role;
    logAction('super_admin', 'Director Office', 'User Role Modified', `Changed ${user.name}'s role to ${role}`);
    return res.json(user);
  }
  res.status(404).json({ error: 'User not found' });
});

app.patch('/api/users/:id/wallet', (req, res) => {
  const { id } = req.params;
  const { amountToAdd } = req.body;
  const user = users.find((u) => u.id === id);
  if (user) {
    user.walletBalance += Number(amountToAdd || 0);
    logAction('admin', 'Admin', 'Campus Wallet Recharged', `Added $${amountToAdd} to ${user.name}'s ID wallet`);
    return res.json(user);
  }
  res.status(404).json({ error: 'User not found' });
});

// 7. Audit Logs & Settings
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

app.get('/api/settings', (req, res) => {
  res.json(cafeteriaSettings);
});

app.put('/api/settings', (req, res) => {
  cafeteriaSettings = { ...cafeteriaSettings, ...req.body };
  logAction('admin', 'Admin', 'Cafeteria Settings Updated', 'Modified store operational parameters');
  res.json(cafeteriaSettings);
});

// 8. Notifications API
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.patch('/api/notifications/read-all', (req, res) => {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  res.json({ success: true });
});

// 9. Analytics Summary Endpoint
app.get('/api/analytics', (req, res) => {
  const todayRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const activePreOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.orderStatus)).length;

  res.json({
    todayRevenue,
    todayOrdersCount: orders.length,
    activePreOrders,
    avgPrepTimeMinutes: 8.5,
    topSellingFoods: [
      { name: 'Spicy Campus Chicken Zinger Wrap', salesCount: 218, revenue: 1144.5 },
      { name: 'Grilled Teriyaki Chicken Rice Bowl', salesCount: 142, revenue: 923.0 },
      { name: 'Beef Kebab Biryani Rice Box', salesCount: 118, revenue: 855.5 },
      { name: 'Campus Karak Chai & Samosa', salesCount: 310, revenue: 1007.5 },
    ],
    hourlyOrderDistribution: [
      { hour: '8 AM', count: 18 },
      { hour: '9 AM', count: 32 },
      { hour: '10 AM', count: 25 },
      { hour: '11 AM', count: 68 },
      { hour: '12 PM', count: 145 },
      { hour: '1 PM', count: 120 },
      { hour: '2 PM', count: 52 },
      { hour: '3 PM', count: 28 },
      { hour: '4 PM', count: 40 },
      { hour: '5 PM', count: 62 },
    ],
    revenueByDay: [
      { date: 'Mon', revenue: 620 },
      { date: 'Tue', revenue: 780 },
      { date: 'Wed', revenue: 840 },
      { date: 'Thu', revenue: 910 },
      { date: 'Fri', revenue: 1150 },
      { date: 'Sat', revenue: 450 },
      { date: 'Sun', revenue: 380 },
    ],
    dietaryBreakdown: [
      { tag: 'Halal', percentage: 65 },
      { tag: 'Vegetarian/Vegan', percentage: 22 },
      { tag: 'High Protein', percentage: 48 },
      { tag: 'Gluten-Free', percentage: 12 },
    ],
  });
});

// 10. Gemini AI Meal Assistant Route
app.post('/api/ai/meal-recommendation', async (req, res) => {
  const { calorieTarget, maxPrice, timeAvailableMinutes, dietaryTags, cravingsPrompt } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback smart recommendation if API key is not configured
      const availableFoods = foods.filter(
        (f) =>
          f.isAvailable &&
          f.price <= (maxPrice || 15) &&
          f.prepTimeMinutes <= (timeAvailableMinutes || 30)
      );
      
      const picked = availableFoods.slice(0, 3);
      return res.json({
        source: 'smart_filter',
        recommendationTitle: 'Quick Campus Meal Combo',
        explanation: 'Selected based on your target budget, prep time limit, and dietary tags.',
        suggestedItems: picked.map((f) => ({
          foodId: f.id,
          name: f.name,
          price: f.price,
          calories: f.nutrition.calories,
          proteinGrams: f.nutrition.proteinGrams,
          prepTime: f.prepTimeMinutes,
          reasoning: `Great fit! Delivers ${f.nutrition.proteinGrams}g protein in just ${f.prepTimeMinutes} mins.`,
        })),
        totalComboPrice: picked.reduce((a, b) => a + b.price, 0),
        totalComboCalories: picked.reduce((a, b) => a + b.nutrition.calories, 0),
      });
    }

    const availableFoodsSummary = foods.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.categoryName,
      price: f.price,
      calories: f.nutrition.calories,
      protein: f.nutrition.proteinGrams,
      prepTime: f.prepTimeMinutes,
      dietaryTags: f.dietaryTags,
      allergens: f.allergens,
    }));

    const prompt = `You are the AI Nutritionist & Cafeteria Concierge for Smart Café.
The student provided these preferences:
- Calorie target: ${calorieTarget || 'flexible (~500-700 kcal)'}
- Maximum budget: $${maxPrice || '10.00'}
- Max prep/waiting time: ${timeAvailableMinutes || '15'} minutes
- Dietary preferences: ${dietaryTags ? dietaryTags.join(', ') : 'None specified'}
- Custom cravings/notes: "${cravingsPrompt || 'Suggest a delicious balanced campus lunch'}"

Available Cafeteria Menu Items:
${JSON.stringify(availableFoodsSummary, null, 2)}

Provide a JSON response with this EXACT structure:
{
  "recommendationTitle": "Catchy Combo Name",
  "explanation": "Friendly 2-sentence explanation of why this combo fits their target",
  "suggestedItems": [
    {
      "foodId": "food_1",
      "name": "Food Name",
      "reasoning": "Short 1-line reason why this fits"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    // Enrich with full food items
    const enrichedItems = (parsed.suggestedItems || []).map((item: any) => {
      const match = foods.find((f) => f.id === item.foodId || f.name.toLowerCase() === item.name.toLowerCase());
      return {
        foodId: match?.id || item.foodId,
        name: match?.name || item.name,
        price: match?.price || 5.0,
        calories: match?.nutrition.calories || 400,
        proteinGrams: match?.nutrition.proteinGrams || 20,
        prepTime: match?.prepTimeMinutes || 10,
        imageUrl: match?.imageUrl,
        reasoning: item.reasoning,
      };
    });

    res.json({
      source: 'gemini_ai',
      recommendationTitle: parsed.recommendationTitle || 'AI Personalized Campus Combo',
      explanation: parsed.explanation || 'Crafted especially for your schedule and nutritional goals.',
      suggestedItems: enrichedItems,
      totalComboPrice: enrichedItems.reduce((a: number, b: any) => a + b.price, 0),
      totalComboCalories: enrichedItems.reduce((a: number, b: any) => a + b.calories, 0),
    });
  } catch (err: any) {
    console.error('Gemini AI error, using fallback filter:', err.message);
    const fallback = foods.slice(0, 2);
    res.json({
      source: 'fallback',
      recommendationTitle: 'Campus High-Energy Pair',
      explanation: 'Our top popular combo tailored for university students on the go.',
      suggestedItems: fallback.map((f) => ({
        foodId: f.id,
        name: f.name,
        price: f.price,
        calories: f.nutrition.calories,
        proteinGrams: f.nutrition.proteinGrams,
        prepTime: f.prepTimeMinutes,
        imageUrl: f.imageUrl,
        reasoning: 'High student rating and fast kitchen turnaround time.',
      })),
      totalComboPrice: fallback.reduce((a, b) => a + b.price, 0),
      totalComboCalories: fallback.reduce((a, b) => a + b.nutrition.calories, 0),
    });
  }
});

// START EXPRESS SERVER WITH VITE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Café Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
