import React from 'react';
import { ShieldCheck, Clock, Award, Sparkles, Utensils } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-[#006A4E] text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>Green University of Bangladesh Campus Dining Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Modernizing GUB Campus Dining</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          GUB Smart Café was built to solve cafeteria overcrowding during peak 12 PM - 2 PM lecture breaks, allowing Green University of Bangladesh students and faculty to pre-order fresh meals with live QR pickup.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Zero Waiting Time</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            By reserving a 10-minute pickup slot, your meal is packaged hot right as you walk up to Express Counter 1.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shadow-md shadow-green-900/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Fresh & Clean Sourcing</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            All GUB cafeteria food items are prepared fresh daily using quality ingredients sourced from local suppliers with full allergen disclosure.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Fast Payment Integration</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Seamless payments using bKash, Nagad, Rocket, or SSLCommerz credit/debit cards.
          </p>
        </div>
      </div>

      {/* Kitchen Standards */}
      <div className="glass-modal rounded-3xl p-8 space-y-6 shadow-xl">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-[#006A4E]" />
          GUB Cafe Standards & Sourcing Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 font-medium">
          <div className="p-5 bg-white/70 rounded-2xl border border-white/80">
            <h4 className="font-extrabold text-[#006A4E] text-sm mb-1">Calorie & Macro Breakdown</h4>
            <p className="text-slate-600">
              Every dish features verified protein, carb, fat, and sodium metrics calculated by certified campus dietitians.
            </p>
          </div>
          <div className="p-5 bg-white/70 rounded-2xl border border-white/80">
            <h4 className="font-extrabold text-[#006A4E] text-sm mb-1">Zero Food Waste Protocol</h4>
            <p className="text-slate-600">
              Pre-ordering allows GUB kitchen chefs to cook precise batch quantities, reducing daily campus food waste by 85%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
