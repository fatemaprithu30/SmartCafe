import React from 'react';
import { Star, Clock, Flame, ShieldAlert, Plus, Sparkles } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onSelect: (food: FoodItem) => void;
  onQuickAdd?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect, onQuickAdd }) => {
  const isOutOfStock = !food.isAvailable || food.stockQuantity <= 0;

  return (
    <div className="group relative glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between">
      <div>
        {/* Food Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={food.imageUrl}
            alt={food.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {food.isSpecial && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#006A4E] text-white flex items-center gap-1 shadow-md shadow-emerald-950/30">
                <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                Chef's Special
              </span>
            )}
            {food.isPopular && !food.isSpecial && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F59E0B] text-slate-900 shadow-md">
                🔥 Popular
              </span>
            )}
          </div>

          {/* Prep Time Badge */}
          <div className="absolute top-3 right-3 glass-card text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{food.prepTimeMinutes} mins</span>
          </div>

          {/* Rating Tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-black text-slate-900 glass-card px-2.5 py-1 rounded-xl shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span>{food.rating.toFixed(1)}</span>
            <span className="text-slate-500 font-medium">({food.reviewCount})</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-black text-slate-900 text-lg leading-snug group-hover:text-[#006A4E] transition-colors line-clamp-1">
              {food.name}
            </h3>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-medium">
            {food.description}
          </p>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {food.dietaryTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-white/70 text-[10px] font-bold text-slate-700 border border-slate-200/80"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Nutrition Info Row */}
          <div className="flex items-center gap-3 text-xs text-slate-600 bg-white/60 p-2.5 rounded-2xl border border-white/80 mb-1 font-medium">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-slate-900 font-black">{food.nutrition.calories}</span> kcal
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div>
              <span className="text-slate-900 font-black">{food.nutrition.proteinGrams}g</span> protein
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-3 flex items-center justify-between border-t border-slate-200/50 mt-auto bg-white/30">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-extrabold">Price</span>
          <span className="text-xl font-black text-[#006A4E]">৳{food.price.toFixed(2)}</span>
        </div>

        {isOutOfStock ? (
          <span className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-xs flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            Sold Out
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(food)}
              className="px-3 py-2 rounded-xl bg-white/80 border border-slate-200 hover:bg-white text-slate-800 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Option
            </button>
            <button
              onClick={() => (onQuickAdd ? onQuickAdd(food) : onSelect(food))}
              className="px-3.5 py-2 rounded-xl glass-button font-bold text-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
