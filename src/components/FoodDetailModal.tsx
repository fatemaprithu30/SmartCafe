import React, { useState } from 'react';
import { X, Clock, Flame, Star, AlertTriangle, ShoppingBag, Check } from 'lucide-react';
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
  const optionsPrice = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.price, 0);
  const unitPrice = food.price + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(food, quantity, Object.values(selectedOptions), specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Header Image */}
          <div className="relative h-64 -mx-6 -mt-6 bg-stone-800 overflow-hidden mb-4">
            <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-bold text-xs">
                  {food.categoryName}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-stone-800/90 text-amber-300 font-semibold text-xs flex items-center gap-1 border border-stone-700">
                  <Clock className="w-3.5 h-3.5" />
                  {food.prepTimeMinutes} Mins Kitchen Prep
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{food.name}</h2>
            </div>
          </div>

          <p className="text-stone-300 text-sm leading-relaxed">{food.description}</p>

          {/* Macro Nutrition Breakdown Card */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                Nutrition Breakdown
              </span>
              <span className="text-xs text-stone-400">Total {food.nutrition.calories} Calories</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="block text-stone-400 text-[10px]">Protein</span>
                <span className="font-bold text-emerald-400 text-sm">{food.nutrition.proteinGrams}g</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="block text-stone-400 text-[10px]">Carbs</span>
                <span className="font-bold text-amber-400 text-sm">{food.nutrition.carbsGrams}g</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="block text-stone-400 text-[10px]">Fats</span>
                <span className="font-bold text-orange-400 text-sm">{food.nutrition.fatGrams}g</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="block text-stone-400 text-[10px]">Sodium</span>
                <span className="font-bold text-blue-400 text-sm">{food.nutrition.sodiumMg || 0}mg</span>
              </div>
            </div>
          </div>

          {/* Allergens Warning */}
          {food.allergens && food.allergens.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Allergen Warning: </span>
                Contains {food.allergens.join(', ')}.
              </div>
            </div>
          )}

          {/* Customization Groups */}
          {food.customizationGroups && food.customizationGroups.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-stone-200 uppercase tracking-wider">Customize Your Meal</h3>
              {food.customizationGroups.map((group) => (
                <div key={group.id} className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-xs text-stone-200">{group.title}</span>
                    {group.required ? (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500">Optional</span>
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
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors border ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded ${
                                !isMultiple ? 'rounded-full' : ''
                              } border flex items-center justify-center ${
                                isSelected ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-700'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          <span className="font-bold">
                            {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Free'}
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
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra sauce on the side, no onions..."
              rows={2}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:border-amber-500 focus:outline-none placeholder-stone-600"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-4 mt-auto">
          {/* Quantity Selector */}
          <div className="flex items-center border border-stone-800 bg-stone-900 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-sm flex items-center justify-center"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-stone-100 text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-sm flex items-center justify-center"
            >
              +
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Pre-Order • ${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
