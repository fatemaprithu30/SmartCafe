import React from 'react';
import { Star, Clock, Flame, ShieldAlert, Plus, Sparkles, Check } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onSelect: (food: FoodItem) => void;
  onQuickAdd?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect, onQuickAdd }) => {
  const isLowStock = food.stockQuantity > 0 && food.stockQuantity <= food.minStockAlert;
  const isOutOfStock = !food.isAvailable || food.stockQuantity <= 0;

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Food Image Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={food.imageUrl}
            alt={food.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {food.isSpecial && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Chef's Special
              </span>
            )}
            {food.isPopular && !food.isSpecial && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-sm">
                🔥 Popular
              </span>
            )}
          </div>

          {/* Prep Time Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{food.prepTimeMinutes} mins</span>
          </div>

          {/* Rating Tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-bold text-slate-800 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{food.rating.toFixed(1)}</span>
            <span className="text-slate-500 font-normal">({food.reviewCount})</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {food.description}
          </p>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {food.dietaryTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Nutrition Info Row */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-1">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-slate-800 font-bold">{food.nutrition.calories}</span> kcal
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div>
              <span className="text-slate-800 font-bold">{food.nutrition.proteinGrams}g</span> protein
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-2 flex items-center justify-between border-t border-slate-100 mt-auto bg-slate-50/50">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Pre-Order</span>
          <span className="text-lg font-extrabold text-blue-600">৳{food.price.toFixed(2)}</span>
        </div>

        {isOutOfStock ? (
          <span className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 font-semibold text-xs flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            Sold Out
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(food)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
            >
              Option
            </button>
            <button
              onClick={() => (onQuickAdd ? onQuickAdd(food) : onSelect(food))}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1 active:scale-95"
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
