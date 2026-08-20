import React, { useState } from 'react';
import { X, Clock, Flame, AlertTriangle, ShoppingBag, Check } from 'lucide-react';
import { FoodItem, CartItemOption } from '../types';

interface FoodDetailModalProps {
  food: FoodItem;
  onClose: () => void;
  onAddToCart: (
    food: FoodItem,
    quantity: number,
    selectedOptions: CartItemOption[],
    specialInstructions: string
  ) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, CartItemOption>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Handle option toggles
  const handleOptionSelect = (
    groupId: string,
    groupTitle: string,
    optionId: string,
    optionName: string,
    price: number,
    isMultiple: boolean
  ) => {
    const key = isMultiple ? `${groupId}_${optionId}` : groupId;
    setSelectedOptions((prev) => {
      const next = { ...prev };
      if (isMultiple) {
        if (next[key]) {
          delete next[key];
        } else {
          next[key] = { groupId, groupTitle, optionId, optionName, price };
        }
      } else {
        next[key] = { groupId, groupTitle, optionId, optionName, price };
      }
      return next;
    });
  };

  // Calculate total unit price including options
  const optionsPrice = Object.values(selectedOptions).reduce((sum: number, opt: any) => sum + opt.price, 0);
  const unitPrice = food.price + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(food, quantity, Object.values(selectedOptions), specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Header Image */}
          <div className="relative h-64 -mx-6 -mt-6 bg-slate-100 overflow-hidden mb-4">
            <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#006A4E] text-white font-extrabold text-xs">
                  {food.categoryName}
                </span>
                <span className="px-3 py-1 rounded-full glass-card text-slate-900 font-bold text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#006A4E]" />
                  {food.prepTimeMinutes} Mins Kitchen Prep
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{food.name}</h2>
            </div>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed font-medium">{food.description}</p>

          {/* Macro Nutrition Breakdown Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                Nutrition Breakdown
              </span>
              <span className="text-xs text-slate-600 font-bold">Total {food.nutrition.calories} Calories</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
              <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
                <span className="block text-slate-500 text-[10px] font-bold">Protein</span>
                <span className="font-black text-[#22C55E] text-sm">{food.nutrition.proteinGrams}g</span>
              </div>
              <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
                <span className="block text-slate-500 text-[10px] font-bold">Carbs</span>
                <span className="font-black text-[#F59E0B] text-sm">{food.nutrition.carbsGrams}g</span>
              </div>
              <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
                <span className="block text-slate-500 text-[10px] font-bold">Fats</span>
                <span className="font-black text-orange-600 text-sm">{food.nutrition.fatGrams}g</span>
              </div>
              <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
                <span className="block text-slate-500 text-[10px] font-bold">Sodium</span>
                <span className="font-black text-blue-600 text-sm">{food.nutrition.sodiumMg || 0}mg</span>
              </div>
            </div>
          </div>

          {/* Allergens Warning */}
          {food.allergens && food.allergens.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Allergen Warning: </span>
                Contains {food.allergens.join(', ')}.
              </div>
            </div>
          )}

          {/* Customization Groups */}
          {food.customizationGroups && food.customizationGroups.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Customize Your Meal</h3>
              {food.customizationGroups.map((group) => (
                <div key={group.id} className="glass-panel p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs text-slate-900">{group.title}</span>
                    {group.required ? (
                      <span className="text-[10px] text-[#006A4E] bg-[#006A4E]/10 px-2 py-0.5 rounded-md font-extrabold">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">Optional</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isMultiple = group.type === 'multiple';
                      const key = isMultiple ? `${group.id}_${option.id}` : group.id;
                      const isSelected = selectedOptions[key]?.optionId === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            handleOptionSelect(
                              group.id,
                              group.title,
                              option.id,
                              option.name,
                              option.price,
                              isMultiple
                            )
                          }
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#006A4E]/10 border-[#006A4E] text-[#006A4E] font-bold shadow-sm'
                              : 'bg-white/60 border-slate-200/80 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded ${
                                !isMultiple ? 'rounded-full' : ''
                              } border flex items-center justify-center ${
                                isSelected ? 'bg-[#006A4E] border-[#006A4E] text-white' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          <span className="font-bold">
                            {option.price > 0 ? `+৳${option.price.toFixed(2)}` : 'Free'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra sauce on the side, no onions..."
              rows={2}
              className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium placeholder-slate-400"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-white/70 border-t border-slate-200/60 flex items-center justify-between gap-4 mt-auto">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-200/80 bg-white/80 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="w-10 text-center font-extrabold text-slate-900 text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 px-6 rounded-2xl glass-button font-black text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Pre-Order • ৳{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
