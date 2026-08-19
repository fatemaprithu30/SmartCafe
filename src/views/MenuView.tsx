import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Flame,
  Clock,
  SlidersHorizontal,
  X,
  Check,
  Utensils,
  Egg,
  CookingPot,
  Cookie,
} from 'lucide-react';
import { FoodCategory, FoodItem, UserProfile } from '../types';
import { FoodCard } from '../components/FoodCard';
import { NutritionCalculator } from '../components/NutritionCalculator';

interface MenuViewProps {
  categories: FoodCategory[];
  foods: FoodItem[];
  selectedCategorySlug?: string;
  onSelectFood: (food: FoodItem) => void;
  onOpenAiAssistant: () => void;
  onQuickAdd: (food: FoodItem) => void;
  currentUser?: UserProfile | null;
  onUpdateCalorieTarget?: (newTarget: number) => Promise<void> | void;
  onAddToCart?: (food: FoodItem, quantity: number, selectedOptions: any[], specialInstructions: string) => void;
  onOpenAuth?: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  categories,
  foods,
  selectedCategorySlug,
  onSelectFood,
  onOpenAiAssistant,
  onQuickAdd,
  currentUser = null,
  onUpdateCalorieTarget = () => {},
  onAddToCart,
  onOpenAuth,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategorySlug || 'all');
  const [showCalculatorTab, setShowCalculatorTab] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrepMinutes, setMaxPrepMinutes] = useState<number>(30);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [maxCalories, setMaxCalories] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_asc' | 'price_desc' | 'prep_speed'>('popular');

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Search query (Strictly match food item name, case-insensitive)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = food.name.toLowerCase().includes(q);
        if (!matchName) return false;
      }

      // Category filter
      if (activeCategory !== 'all') {
        const catMatch = categories.find((c) => c.slug.toLowerCase() === activeCategory.toLowerCase());
        const catId = catMatch?.id;
        const matchCat =
          (catId && food.categoryId === catId) ||
          (food.categoryName && food.categoryName.toLowerCase() === activeCategory.toLowerCase()) ||
          (food.categoryId && food.categoryId.toLowerCase().includes(activeCategory.toLowerCase()));
        if (!matchCat) return false;
      }

      // Prep time filter
      if (food.prepTimeMinutes > maxPrepMinutes) return false;

      // Price filter
      if (food.price > maxPrice) return false;

      // Calorie filter
      if (food.nutrition?.calories && food.nutrition.calories > maxCalories) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'prep_speed') return a.prepTimeMinutes - b.prepTimeMinutes;
      return 0;
    });
  }, [foods, searchQuery, activeCategory, categories, maxPrepMinutes, maxPrice, maxCalories, sortBy]);

  // Defined target sections for University Cafeteria
  const targetCategorySections = [
    {
      slug: 'breakfast',
      name: 'Breakfast',
      description: 'Morning quick bites, oats, parathas, eggs & hot drinks (8:30 AM – 10:00 AM)',
      icon: Egg,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      slug: 'lunch',
      name: 'Lunch',
      description: 'Hearty rice bowls, biryanis, curries & balanced entrees (12:00 PM – 3:00 PM)',
      icon: CookingPot,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      slug: 'snacks',
      name: 'Snacks',
      description: 'Burgers, wraps, samosas & tea-time snacks (10:00 AM–12:00 PM & 3:00 PM–4:30 PM)',
      icon: Cookie,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
  ];

  // Group filtered foods into their respective sections
  const categorizedFoods = useMemo(() => {
    return targetCategorySections.map((sec) => {
      const catMatch = categories.find((c) => c.slug.toLowerCase() === sec.slug.toLowerCase());
      const catId = catMatch?.id;

      const items = filteredFoods.filter((f) => {
        if (catId && f.categoryId === catId) return true;
        if (f.categoryName && f.categoryName.toLowerCase() === sec.name.toLowerCase()) return true;
        if (f.categoryId && f.categoryId.toLowerCase().includes(sec.slug.toLowerCase())) return true;
        return false;
      });

      return {
        ...sec,
        categoryInfo: catMatch,
        items,
      };
    });
  }, [filteredFoods, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">University Cafeteria Menu</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse all hot meals, wraps, salads, breakfast & cold brews. Pre-order in advance.
          </p>
        </div>
        <button
          onClick={() => setShowCalculatorTab((prev) => !prev)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Flame className="w-4 h-4 fill-stone-950" />
          <span>{showCalculatorTab ? 'Hide Nutrition Calculator' : 'Open Nutrition Calculator'}</span>
        </button>
      </div>

      {/* Embedded Nutrition Calculator */}
      {showCalculatorTab && (
        <NutritionCalculator
          foods={foods}
          currentUser={currentUser}
          onUpdateCalorieTarget={onUpdateCalorieTarget}
          onAddToCart={onAddToCart}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* Main Layout Grid (Filters sidebar + Menu items) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Menu Filters
              </span>
              {(activeCategory !== 'all' || searchQuery || maxPrice !== 1000 || maxCalories !== 2000 || maxPrepMinutes !== 30) && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                    setMaxPrepMinutes(30);
                    setMaxPrice(1000);
                    setMaxCalories(2000);
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="enter the food you like"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Categories
              </label>
              <div className="space-y-1.5">
                {[
                  { slug: 'all', name: 'All Categories' },
                  { slug: 'breakfast', name: 'Breakfast' },
                  { slug: 'lunch', name: 'Lunch' },
                  { slug: 'snacks', name: 'Snacks' },
                ].map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prep Time Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Max Kitchen Time
                </span>
                <span className="font-bold text-blue-600">{maxPrepMinutes} Mins</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={maxPrepMinutes}
                onChange={(e) => setMaxPrepMinutes(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Max Budget Price</span>
                <span className="font-bold text-blue-600">৳{maxPrice.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Calorie-based Filter Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Max Calories
                </span>
                <span className="font-bold text-amber-600">{maxCalories} kcal</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={25}
                value={maxCalories}
                onChange={(e) => setMaxCalories(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>
        </aside>

        {/* Menu Items Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Results Info & Sort Selector Bar */}
          <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-900 font-bold">{filteredFoods.length}</strong> menu items
            </span>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-blue-600 font-semibold focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated ★</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="prep_speed">Fastest Kitchen Prep</option>
              </select>
            </div>
          </div>

          {/* Categorized Food Sections */}
          {filteredFoods.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No items match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting your dietary options, increasing max prep time, or searching for a different keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {categorizedFoods
                .filter((section) => activeCategory === 'all' || activeCategory === section.slug)
                .map((section) => {
                  const Icon = section.icon;
                  return (
                    <section key={section.slug} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      {/* Section Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} border shadow-xs`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-extrabold text-slate-900">{section.name}</h2>
                              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${section.badgeColor}`}>
                                {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items Grid for this Category Section */}
                      {section.items.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400 font-medium">
                            No {section.name.toLowerCase()} items match your current filter criteria.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                          {section.items.map((food) => (
                            <FoodCard
                              key={food.id}
                              food={food}
                              onSelect={onSelectFood}
                              onQuickAdd={onQuickAdd}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
