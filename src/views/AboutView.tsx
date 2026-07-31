import React from 'react';
import { ShieldCheck, Clock, Award, Users, Heart, Sparkles, Utensils } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>University Campus Dining Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Modernizing Campus Dining</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Smart Café was built to solve cafeteria overcrowding during peak 12 PM - 2 PM lecture breaks, allowing students and faculty to pre-order fresh meals with live QR pickup.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Zero Waiting Time</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By reserving a 10-minute pickup slot, your meal is packaged hot right as you walk up to Express Counter 1.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">100% Halal & Clean Sourcing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All meat products are 100% Halal certified, sourced daily from local organic farms with full allergen disclosure.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Student ID Wallet Payment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seamless single-tap payments using your Student ID Card balance, bKash, Nagad, or credit cards.
          </p>
        </div>
      </div>

      {/* Kitchen Standards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-blue-600" />
          Our Kitchen Standards & Nutrition Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-blue-600 mb-1">Calorie & Macro Breakdown</h4>
            <p className="text-slate-500">
              Every dish features verified protein, carb, fat, and sodium metrics calculated by certified campus dietitians.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-blue-600 mb-1">Zero Food Waste Protocol</h4>
            <p className="text-slate-500">
              Pre-ordering allows kitchen chefs to cook precise batch quantities, reducing daily campus food waste by 85%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
