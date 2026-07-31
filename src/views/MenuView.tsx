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
} from 'lucide-react';
import { FoodCategory, FoodItem } from '../types';
import { FoodCard } from '../components/FoodCard';

interface MenuViewProps {
  categories: FoodCategory[];
  foods: FoodItem[];
  selectedCategorySlug?: string;
  onSelectFood: (food: FoodItem) => void;
  onOpenAiAssistant: () => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  categories,
  foods,
  selectedCategorySlug,
  onSelectFood,
  onOpenAiAssistant,
  onQuickAdd,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategorySlug || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [maxPrepMinutes, setMaxPrepMinutes] = useState<number>(30);
  const [maxPrice, setMaxPrice] = useState<number>(15);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_asc' | 'price_desc' | 'prep_speed'>('popular');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Category match
      if (activeCategory !== 'all') {
        const cat = categories.find((c) => c.slug === activeCategory);
        if (cat && food.categoryId !== cat.id) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = food.name.toLowerCase().includes(q);
        const matchDesc = food.description.toLowerCase().includes(q);
        const matchCat = food.categoryName.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // Dietary tags match (must match all selected tags)
      if (selectedDietaryTags.length > 0) {
        const hasAllTags = selectedDietaryTags.every((tag) =>
          food.dietaryTags.some((t) => t.toLowerCase() === tag.toLowerCase())
        );
        if (!hasAllTags) return false;
      }

      // Prep time filter
      if (food.prepTimeMinutes > maxPrepMinutes) return false;

      // Price filter
      if (food.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'prep_speed') return a.prepTimeMinutes - b.prepTimeMinutes;
      return 0;
    });
  }, [foods, activeCategory, searchQuery, selectedDietaryTags, maxPrepMinutes, maxPrice, sortBy, categories]);

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
          onClick={onOpenAiAssistant}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/30 flex items-center justify-center gap-2 shrink-0 active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Gemini AI Meal Helper</span>
        </button>
      </div>

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
              {(selectedDietaryTags.length > 0 || activeCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                    setSelectedDietaryTags([]);
                    setMaxPrepMinutes(30);
                    setMaxPrice(15);
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
                placeholder="Search food name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dietary Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Dietary Preferences
              </label>
              <div className="space-y-1.5">
                {['Halal', 'Vegan', 'Vegetarian', 'High Protein', 'Gluten-Free', 'Dairy-Free'].map((tag) => {
                  const isChecked = selectedDietaryTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{tag}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
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
                <span className="font-bold text-blue-600">${maxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>
        </aside>

        {/* Menu Items Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Category Tabs & Sorting row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
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

          {/* Results Info */}
          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredFoods.length}</strong> menu items
            </span>
          </div>

          {/* Foods Grid */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onSelect={onSelectFood}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
