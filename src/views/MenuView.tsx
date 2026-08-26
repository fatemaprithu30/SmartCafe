import React, { useState, useMemo } from 'react';
import {
  Search,
  Flame,
  Clock,
  SlidersHorizontal,
  Check,
  Utensils,
  Egg,
  CookingPot,
  Cookie,
  Calendar,
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
  const WEEK_DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayDayName = useMemo(() => {
    const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return map[new Date().getDay()];
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>(selectedCategorySlug || 'all');
  const [selectedDay, setSelectedDay] = useState<string>(todayDayName); // Default to today's day
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

      // Day filter
      if (selectedDay !== 'All Days') {
        if (food.availableDays && food.availableDays.length > 0) {
          const matchesDay = food.availableDays.some(
            (d) => d.toLowerCase() === selectedDay.toLowerCase()
          );
          if (!matchesDay) return false;
        }
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
      description: 'Morning quick bites, oats, parathas, eggs & hot drinks (8:00 AM – 10:00 AM)',
      icon: Egg,
      color: 'from-[#006A4E]/10 to-[#22C55E]/10 border-[#006A4E]/30 text-[#006A4E]',
      badgeColor: 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/30',
    },
    {
      slug: 'lunch',
      name: 'Lunch',
      description: 'Hearty rice bowls, biryanis, curries & balanced entrees (12:00 PM – 3:00 PM)',
      icon: CookingPot,
      color: 'from-[#006A4E]/10 to-teal-500/10 border-[#006A4E]/30 text-[#006A4E]',
      badgeColor: 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/30',
    },
    {
      slug: 'snack',
      name: 'Snack',
      description: 'Burgers, wraps, samosas & tea-time snacks (10:00 AM–12:00 PM & 3:00 PM–4:30 PM)',
      icon: Cookie,
      color: 'from-[#F59E0B]/10 to-orange-500/10 border-[#F59E0B]/30 text-[#F59E0B]',
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-modal p-8 rounded-3xl text-slate-900 shadow-xl">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">University Cafeteria Menu</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Browse all hot meals, wraps, salads, breakfast & cold brews. Pre-order in advance.
          </p>
        </div>
        <button
          onClick={() => setShowCalculatorTab((prev) => !prev)}
          className="px-5 py-3 rounded-2xl glass-button font-black text-xs transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Flame className="w-4 h-4 text-[#F59E0B]" />
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
          <div className="glass-panel rounded-3xl p-6 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#006A4E]" />
                Menu Filters
              </span>
              {(activeCategory !== 'all' || selectedDay !== 'All Days' || searchQuery || maxPrice !== 1000 || maxCalories !== 2000 || maxPrepMinutes !== 30) && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSelectedDay('All Days');
                    setSearchQuery('');
                    setMaxPrepMinutes(30);
                    setMaxPrice(1000);
                    setMaxCalories(2000);
                  }}
                  className="text-[11px] text-[#006A4E] hover:underline font-bold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="enter the food you like"
                className="w-full glass-input rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400"
              />
            </div>

            {/* Day Filter Sidebar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
                  Day-Wise Menu
                </label>
                {selectedDay === todayDayName && (
                  <span className="text-[10px] font-black bg-[#22C55E]/15 text-[#006A4E] px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                    Today
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDay('All Days')}
                  className={`p-2 rounded-xl text-xs font-extrabold transition-all border text-center cursor-pointer ${
                    selectedDay === 'All Days'
                      ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-xs'
                      : 'bg-white/60 border-slate-200/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  All Days
                </button>
                {WEEK_DAYS.map((day) => {
                  const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
                  const isToday = todayDayName.toLowerCase() === day.toLowerCase();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`p-2 rounded-xl text-xs transition-all border text-center cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#006A4E] text-white font-black border-[#006A4E] shadow-xs'
                          : 'bg-white/60 border-slate-200/80 text-slate-700 font-bold hover:bg-white'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      {isToday && (
                        <span className={`text-[9px] px-1 rounded-md font-black ${isSelected ? 'bg-white/30 text-white' : 'bg-[#006A4E]/10 text-[#006A4E]'}`}>
                          ★
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Categories
              </label>
              <div className="space-y-2">
                {[
                  { slug: 'all', name: 'All Categories' },
                  { slug: 'breakfast', name: 'Breakfast' },
                  { slug: 'lunch', name: 'Lunch' },
                  { slug: 'snack', name: 'Snack' },
                ].map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E] font-extrabold shadow-sm'
                          : 'bg-white/60 border-slate-200/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isActive ? 'bg-[#006A4E] border-[#006A4E] text-white' : 'border-slate-300'
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
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#006A4E]" /> Max Kitchen Time
                </span>
                <span className="text-[#006A4E]">{maxPrepMinutes} Mins</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={maxPrepMinutes}
                onChange={(e) => setMaxPrepMinutes(Number(e.target.value))}
                className="w-full accent-[#006A4E] bg-slate-200/80 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Max Budget Price</span>
                <span className="text-[#006A4E]">৳{maxPrice.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#006A4E] bg-slate-200/80 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Calorie-based Filter Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" /> Max Calories
                </span>
                <span className="text-[#F59E0B]">{maxCalories} kcal</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={25}
                value={maxCalories}
                onChange={(e) => setMaxCalories(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-slate-200/80 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>
        </aside>

        {/* Menu Items Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Day Navigation Bar Header */}
          <div className="glass-panel p-4 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#006A4E]" />
                <h3 className="font-black text-slate-900 text-sm">
                  Filter Menu by Schedule: <span className="text-[#006A4E]">{selectedDay}</span>
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Today is <strong className="text-[#006A4E] font-black">{todayDayName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedDay('All Days')}
                className={`px-4 py-2 rounded-2xl font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedDay === 'All Days'
                    ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                Full Menu (All Days)
              </button>

              <button
                onClick={() => setSelectedDay(todayDayName)}
                className={`px-4 py-2 rounded-2xl font-extrabold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                  selectedDay.toLowerCase() === todayDayName.toLowerCase()
                    ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-md'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-[#006A4E] hover:bg-emerald-500/20'
                }`}
              >
                <span>Today's Menu ({todayDayName})</span>
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              </button>

              {WEEK_DAYS.filter((d) => d.toLowerCase() !== todayDayName.toLowerCase()).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-2xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedDay.toLowerCase() === day.toLowerCase()
                      ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-md'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info & Sort Selector Bar */}
          <div className="flex items-center justify-between gap-4 glass-card p-4 rounded-2xl">
            <span className="text-xs text-slate-600 font-medium">
              Showing <strong className="text-slate-900 font-black">{filteredFoods.length}</strong> items for <strong className="text-[#006A4E] font-black">{selectedDay}</strong>
            </span>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-slate-600 font-bold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs text-[#006A4E] font-bold focus:outline-none"
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
            <div className="glass-modal rounded-3xl p-12 text-center space-y-4 shadow-lg">
              <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-8 h-8 text-[#006A4E]" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">No items match your filters</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Try resetting your search query, increasing max prep time, or adjusting price limits.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {categorizedFoods
                .filter((section) => activeCategory === 'all' || activeCategory === section.slug)
                .map((section) => {
                  const Icon = section.icon;
                  return (
                    <section key={section.slug} className="space-y-4 glass-panel p-6 rounded-3xl">
                      {/* Section Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${section.color} border shadow-xs`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-2xl font-black text-slate-900">{section.name}</h2>
                              <span className={`px-3 py-0.5 text-xs font-bold rounded-full border ${section.badgeColor}`}>
                                {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 font-medium">{section.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items Grid for this Category Section */}
                      {section.items.length === 0 ? (
                        <div className="p-8 text-center glass-card rounded-2xl border-dashed">
                          <p className="text-xs text-slate-500 font-medium">
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
