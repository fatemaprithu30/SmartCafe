import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Minus,
  Trash2,
  Flame,
  Dumbbell,
  Wheat,
  PieChart,
  ShoppingBag,
  Target,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { FoodItem, UserProfile } from '../types';

interface SelectedItem {
  food: FoodItem;
  quantity: number;
}

interface NutritionCalculatorProps {
  foods: FoodItem[];
  currentUser: UserProfile | null;
  onUpdateCalorieTarget: (newTarget: number) => Promise<void> | void;
  onAddToCart?: (food: FoodItem, quantity: number, selectedOptions: any[], specialInstructions: string) => void;
  onOpenAuth?: () => void;
}

export const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({
  foods,
  currentUser,
  onUpdateCalorieTarget,
  onAddToCart,
  onOpenAuth,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<string>(
    String(currentUser?.dietaryPreferences?.dailyCalorieTarget || 2000)
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const dailyCalorieTarget = currentUser?.dietaryPreferences?.dailyCalorieTarget || 2000;

  // Add food item to list
  const handleAddItem = (foodId: string) => {
    if (!foodId) return;
    const food = foods.find((f) => f.id === foodId);
    if (!food) return;

    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.food.id === foodId);
      if (existing) {
        return prev.map((item) =>
          item.food.id === foodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
    setSelectedFoodId('');
  };

  const handleUpdateQuantity = (foodId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.food.id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedItem[]
    );
  };

  const handleRemoveItem = (foodId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  // Calculate totals automatically
  const totals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const qty = item.quantity;
        const nut = item.food.nutrition || {
          calories: 0,
          proteinGrams: 0,
          carbsGrams: 0,
          fatGrams: 0,
          fiberGrams: 0,
          sodiumMg: 0,
          sugarGrams: 0,
        };

        acc.calories += (nut.calories || 0) * qty;
        acc.protein += (nut.proteinGrams || 0) * qty;
        acc.carbs += (nut.carbsGrams || 0) * qty;
        acc.fat += (nut.fatGrams || 0) * qty;
        acc.fiber += (nut.fiberGrams || 0) * qty;
        acc.sodium += (nut.sodiumMg || 0) * qty;
        acc.sugar += (nut.sugarGrams || 0) * qty;
        acc.price += (item.food.price || 0) * qty;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0, price: 0 }
    );
  }, [selectedItems]);

  const percentageReached = Math.min(
    100,
    Math.round((totals.calories / dailyCalorieTarget) * 100)
  );

  const handleSaveCalorieTarget = async () => {
    const val = parseInt(targetInput, 10);
    if (!isNaN(val) && val > 0) {
      await onUpdateCalorieTarget(val);
      setIsEditingTarget(false);
      setSaveSuccessMsg('Daily calorie goal updated!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  const handleAddAllToCart = () => {
    if (!currentUser && onOpenAuth) {
      onOpenAuth();
      return;
    }
    if (onAddToCart) {
      selectedItems.forEach((item) => {
        onAddToCart(item.food, item.quantity, [], '');
      });
    }
  };

  return (
    <div className="glass-modal rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#006A4E] flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Cafeteria Nutrition Calculator
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Select food items to compute total calories & macronutrients before ordering.
            </p>
          </div>
        </div>

        {/* Calorie Goal Persisted Box */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-4 min-w-[250px]">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Daily Calorie Goal
              </span>
              {isEditingTarget ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-20 glass-input rounded-xl px-2 py-0.5 text-xs font-bold text-slate-900"
                    placeholder="2000"
                  />
                  <button
                    onClick={handleSaveCalorieTarget}
                    className="p-1 bg-[#006A4E] text-white rounded-lg hover:bg-[#0A4D39] transition-colors cursor-pointer"
                    title="Save Goal"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingTarget(false)}
                    className="p-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm font-black text-slate-900">
                  {dailyCalorieTarget.toLocaleString()} kcal
                </span>
              )}
            </div>
          </div>

          {!isEditingTarget && (
            <button
              onClick={() => {
                setTargetInput(String(dailyCalorieTarget));
                setIsEditingTarget(true);
              }}
              className="p-2 text-slate-500 hover:text-[#006A4E] hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
              title="Edit Calorie Goal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#006A4E] text-xs rounded-2xl font-extrabold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22C55E]" /> {saveSuccessMsg}
        </div>
      )}

      {/* Main Grid: Item Selector & Selected Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Item Selection & Selected Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedFoodId}
              onChange={(e) => {
                setSelectedFoodId(e.target.value);
                if (e.target.value) handleAddItem(e.target.value);
              }}
              className="flex-1 glass-input rounded-2xl p-3 text-xs font-bold text-slate-900"
            >
              <option value="">-- Choose Food Item to Calculate --</option>
              {foods
                .filter((f) => f.isAvailable)
                .map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} (৳{food.price} • {food.nutrition?.calories || 0} kcal)
                  </option>
                ))}
            </select>
          </div>

          {/* Selected Items List */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="bg-white/60 px-4 py-3 flex items-center justify-between border-b border-slate-200/60 text-xs font-black text-slate-900">
              <span>Selected Items ({selectedItems.length})</span>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-[#006A4E]" />
                <p className="text-xs font-bold text-slate-800">No food items selected yet.</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Select items from the dropdown above to calculate total nutritional values.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/60 max-h-64 overflow-y-auto">
                {selectedItems.map(({ food, quantity }) => (
                  <div
                    key={food.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{food.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {(food.nutrition?.calories || 0) * quantity} kcal (৳
                          {(food.price * quantity).toFixed(2)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200/80 rounded-xl bg-white/80">
                        <button
                          onClick={() => handleUpdateQuantity(food.id, -1)}
                          className="p-1 hover:bg-slate-100 rounded-l-xl text-slate-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(food.id, 1)}
                          className="p-1 hover:bg-slate-100 rounded-r-xl text-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(food.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Macro Summary Cards & Progress Bar */}
        <div className="lg:col-span-5 glass-card text-slate-900 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-200/60 pb-3">
              <PieChart className="w-4 h-4 text-[#F59E0B]" />
              Nutritional Summary
            </h3>

            {/* Total Calories & Progress Bar */}
            <div className="bg-white/70 p-4 rounded-2xl border border-white/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                  Selected Calories
                </span>
                <span className="text-xs font-black text-[#006A4E]">
                  {totals.calories} / {dailyCalorieTarget} kcal
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentageReached > 100
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-[#22C55E] to-[#F59E0B]'
                  }`}
                  style={{ width: `${percentageReached}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-600 pt-0.5 font-medium">
                <span>Progress Reached</span>
                <span
                  className={`font-black ${
                    percentageReached > 100 ? 'text-red-600' : 'text-[#006A4E]'
                  }`}
                >
                  {percentageReached}%
                </span>
              </div>
            </div>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/60 p-3 rounded-2xl border border-white/80 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-black uppercase">
                  <Dumbbell className="w-3 h-3 text-[#006A4E]" /> Protein
                </div>
                <div className="text-sm font-black text-slate-900">{totals.protein.toFixed(1)}g</div>
              </div>

              <div className="bg-white/60 p-3 rounded-2xl border border-white/80 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-black uppercase">
                  <Wheat className="w-3 h-3 text-[#22C55E]" /> Carbs
                </div>
                <div className="text-sm font-black text-slate-900">{totals.carbs.toFixed(1)}g</div>
              </div>

              <div className="bg-white/60 p-3 rounded-2xl border border-white/80 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-black uppercase">
                  <PieChart className="w-3 h-3 text-[#F59E0B]" /> Fat
                </div>
                <div className="text-sm font-black text-slate-900">{totals.fat.toFixed(1)}g</div>
              </div>
            </div>

            {/* Micronutrients row */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 bg-white/50 p-2.5 rounded-2xl border border-white/80 text-center font-medium">
              <div>
                Fiber: <strong className="text-slate-900 font-bold">{totals.fiber.toFixed(1)}g</strong>
              </div>
              <div>
                Sodium: <strong className="text-slate-900 font-bold">{totals.sodium.toFixed(0)}mg</strong>
              </div>
              <div>
                Sugar: <strong className="text-slate-900 font-bold">{totals.sugar.toFixed(1)}g</strong>
              </div>
            </div>
          </div>

          {/* Add Calculated Items to Cart Button */}
          {selectedItems.length > 0 && onAddToCart && (
            <button
              onClick={handleAddAllToCart}
              className="w-full py-3.5 glass-button font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Selected Items to Order Tray (৳{totals.price.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
