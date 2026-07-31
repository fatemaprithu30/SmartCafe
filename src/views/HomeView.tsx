import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Clock,
  QrCode,
  ShieldCheck,
  Flame,
  ArrowRight,
  CookingPot,
  Sandwich,
  Salad,
  Egg,
  Coffee,
  Cookie,
  Star,
  Users,
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
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'CookingPot':
        return <CookingPot className="w-5 h-5 text-blue-600" />;
      case 'Sandwich':
        return <Sandwich className="w-5 h-5 text-blue-600" />;
      case 'Salad':
        return <Salad className="w-5 h-5 text-emerald-600" />;
      case 'Egg':
        return <Egg className="w-5 h-5 text-blue-600" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-blue-600" />;
      case 'Cookie':
        return <Cookie className="w-5 h-5 text-orange-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Official Campus Cafeteria Pre-Ordering Platform</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              Skip the <span className="text-blue-400 underline decoration-blue-500/40">25-Minute Lines</span>.
              <br className="hidden sm:inline" /> Pre-Order & Pickup Hot.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Select your pickup time slot, customize dietary preferences, pay with your Student ID card or mobile wallet, and grab your meal instantly with a live QR code.
            </p>
          </div>

          {/* Search & AI Assistant Quick Bar */}
          <div className="max-w-2xl mx-auto bg-slate-800/90 border border-slate-700 p-2 rounded-xl shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigateToMenu();
                }}
                placeholder="Search chicken zinger, teriyaki rice bowl, karak chai..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => onNavigateToMenu()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shrink-0 flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-98"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-slate-300 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block font-black text-blue-400 text-xl sm:text-2xl">0 Mins</span>
              <span className="text-slate-400 text-[11px] font-medium">Waiting Time at Counter</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block font-black text-blue-400 text-xl sm:text-2xl">100%</span>
              <span className="text-slate-400 text-[11px] font-medium">Halal & Daily Nutrition</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block font-black text-blue-400 text-xl sm:text-2xl">1,400+</span>
              <span className="text-slate-400 text-[11px] font-medium">Pre-Orders Served Daily</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block font-black text-blue-400 text-xl sm:text-2xl">4.9 ★</span>
              <span className="text-slate-400 text-[11px] font-medium">Student Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Horizontal Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Cafeteria Menu Categories</h2>
            <p className="text-xs text-slate-500">Freshly made every morning in our campus kitchen</p>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateToMenu(cat.slug)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500/50 hover:shadow-sm text-center transition-all group flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Chef's Daily Specials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Chef's Today Specials</h2>
              <p className="text-xs text-slate-500">Limited quantities prepared for peak lunch hours</p>
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
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How Pre-Ordering Works</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed specifically for busy campus schedules between lecture halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm shadow-blue-500/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Select Meal & Time Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your favorite meals, customize spice/extras, and pick a 10-minute pickup window (e.g. 12:10 PM).
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm shadow-blue-500/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Kitchen Cooks & Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our kitchen staff receives your order on their bump bar screen, prepares it hot, and sends a live alert.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Scan QR & Express Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Walk up to Express Counter 1, show your order QR code on your phone, and grab your packaged meal immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Campus Meals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Most Loved Campus Favorites</h2>
              <p className="text-xs text-slate-500">High rating & fast turnaround time</p>
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
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-slate-200 text-sm italic leading-relaxed">
              "Pre-ordering my Teriyaki Rice Bowl at 11:45 AM before my physics lecture ends means I walk past a 40-person line straight to Express Counter 1. Total game changer!"
            </p>
            <span className="text-xs font-bold text-blue-400 block">— Aria R., Computer Science '26</span>
          </div>

          <div className="shrink-0 space-y-2 text-center sm:text-right">
            <button
              onClick={() => onNavigateToMenu()}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-sm shadow-blue-500/30"
            >
              Order Meal Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
