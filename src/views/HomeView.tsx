import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Clock,
  Flame,
  ArrowRight,
  CookingPot,
  Sandwich,
  Salad,
  Egg,
  Coffee,
  Cookie,
  Star,
  ChevronRight,
} from 'lucide-react';
import { FoodCategory, FoodItem } from '../types';
import { FoodCard } from '../components/FoodCard';

interface HomeViewProps {
  categories: FoodCategory[];
  foods: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
  onNavigateToMenu: (categorySlug?: string) => void;
  onOpenAiAssistant: () => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  foods,
  onSelectFood,
  onNavigateToMenu,
  onOpenAiAssistant,
  onQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const specials = foods.filter((f) => f.isSpecial);
  const populars = foods.filter((f) => f.isPopular);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#006A4E]" />;
      case 'CookingPot':
        return <CookingPot className="w-5 h-5 text-[#006A4E]" />;
      case 'Sandwich':
        return <Sandwich className="w-5 h-5 text-[#006A4E]" />;
      case 'Salad':
        return <Salad className="w-5 h-5 text-[#22C55E]" />;
      case 'Egg':
        return <Egg className="w-5 h-5 text-[#006A4E]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#006A4E]" />;
      case 'Cookie':
        return <Cookie className="w-5 h-5 text-[#F59E0B]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#006A4E]" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden text-slate-900">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-[#006A4E] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>SmartCafe • Campus Cafeteria Pre-Ordering</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Skip the Line. <span className="text-[#006A4E]">Pre-Order Hot Meals.</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
              Order fresh food, choose your pickup time slot, and grab your meal instantly with a QR code.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto glass-modal p-2.5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigateToMenu();
                }}
                placeholder="enter the food you like"
                className="w-full glass-input rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400"
              />
            </div>

            <button
              onClick={() => onNavigateToMenu()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl glass-button font-extrabold text-xs sm:text-sm transition-all shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-98"
            >
              <span>Explore SmartCafe Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Operating Hours Window Banner */}
          <div className="glass-panel p-5 rounded-3xl text-left space-y-3 max-w-xl mx-auto shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2 text-[#006A4E] font-extrabold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>SmartCafe Operating Hours: 8:00 AM – 4:30 PM</span>
              </div>
              <span className="text-[10px] bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#006A4E] px-2.5 py-0.5 rounded-full font-extrabold">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 text-center text-[11px]">
              <div className="bg-white/70 p-2.5 rounded-2xl border border-white/80">
                <span className="text-slate-500 block text-[10px] font-bold">Breakfast</span>
                <span className="font-extrabold text-slate-900">8:00 AM – 10:00 AM</span>
              </div>
              <div className="bg-white/70 p-2.5 rounded-2xl border border-white/80">
                <span className="text-slate-500 block text-[10px] font-bold">Snacks</span>
                <span className="font-extrabold text-slate-900">10:00 AM – 12:00 PM<br/>&amp; 3:00 PM – 4:30 PM</span>
              </div>
              <div className="bg-white/70 p-2.5 rounded-2xl border border-white/80">
                <span className="text-slate-500 block text-[10px] font-bold">Lunch</span>
                <span className="font-extrabold text-slate-900">12:00 PM – 3:00 PM</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-slate-800 text-xs">
            <div className="p-4 rounded-3xl glass-card text-center">
              <span className="block font-black text-[#006A4E] text-2xl sm:text-3xl">0 Mins</span>
              <span className="text-slate-600 text-[11px] font-bold">Waiting Time at Counter</span>
            </div>
            <div className="p-4 rounded-3xl glass-card text-center">
              <span className="block font-black text-[#006A4E] text-2xl sm:text-3xl">100%</span>
              <span className="text-slate-600 text-[11px] font-bold">Daily Fresh Nutrition</span>
            </div>
            <div className="p-4 rounded-3xl glass-card text-center">
              <span className="block font-black text-[#006A4E] text-2xl sm:text-3xl">1,400+</span>
              <span className="text-slate-600 text-[11px] font-bold">Pre-Orders Served Daily</span>
            </div>
            <div className="p-4 rounded-3xl glass-card text-center">
              <span className="block font-black text-[#006A4E] text-2xl sm:text-3xl">4.9 ★</span>
              <span className="text-slate-600 text-[11px] font-bold">Student Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Horizontal Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Cafeteria Menu Categories</h2>
            <p className="text-xs text-slate-600 font-medium">Freshly made every morning in our campus kitchen</p>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs text-[#006A4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateToMenu(cat.slug)}
              className="p-5 rounded-3xl glass-card glass-card-hover text-center transition-all group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#006A4E]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Chef's Daily Specials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#006A4E] text-white shadow-md shadow-emerald-900/20">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Chef's Today Specials</h2>
              <p className="text-xs text-slate-600 font-medium">Limited quantities prepared for peak lunch hours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specials.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelect={onSelectFood}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>

      {/* How Smart Café Works - 3-Step Feature Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How Pre-Ordering Works</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Designed specifically for GUB students' schedules between lecture halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#006A4E] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-emerald-900/20">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Select Meal & Time Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Choose your favorite meals, customize options, and pick a pickup time slot.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#006A4E] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-emerald-900/20">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Kitchen Cooks & Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our kitchen staff receives your order on their display system, cooks it fresh, and alerts you.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#22C55E] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-green-900/20">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Scan QR & Express Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Walk up to FoodZone Express Counter, show your order QR code, and grab your packaged meal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Campus Meals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Most Loved GUB Campus Favorites</h2>
              <p className="text-xs text-slate-600 font-medium">High rating & fast turnaround time</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {populars.slice(0, 4).map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelect={onSelectFood}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>

      {/* Student Testimonials Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-modal p-8 rounded-3xl text-slate-900 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <Star className="w-4 h-4 fill-[#F59E0B]" />
              <Star className="w-4 h-4 fill-[#F59E0B]" />
              <Star className="w-4 h-4 fill-[#F59E0B]" />
              <Star className="w-4 h-4 fill-[#F59E0B]" />
              <Star className="w-4 h-4 fill-[#F59E0B]" />
            </div>
            <p className="text-slate-800 text-sm italic leading-relaxed font-medium">
              "Pre-ordering my meal at 11:45 AM before my CSE lecture ends means I walk past a 40-person line straight to GUB Express Counter 1. Total game changer!"
            </p>
            <span className="text-xs font-bold text-[#006A4E] block">— Aria R., Computer Science '26</span>
          </div>

          <div className="shrink-0 space-y-2 text-center sm:text-right">
            <button
              onClick={() => onNavigateToMenu()}
              className="px-8 py-3.5 rounded-2xl glass-button font-black text-sm transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              Order Meal Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
