import React, { useState } from 'react';
import { X, Sparkles, Flame, DollarSign, Clock, ShieldCheck, Plus, Check } from 'lucide-react';
import { FoodItem, CartItemOption } from '../types';

interface AiMealAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableFoods: FoodItem[];
  onAddComboToCart: (items: FoodItem[]) => void;
}

export const AiMealAssistantModal: React.FC<AiMealAssistantModalProps> = ({
  isOpen,
  onClose,
  availableFoods,
  onAddComboToCart,
}) => {
  const [calorieBudget, setCalorieBudget] = useState(600);
  const [maxPrice, setMaxPrice] = useState(8.0);
  const [maxMinutes, setMaxMinutes] = useState(15);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>(['Halal']);
  const [cravingsPrompt, setCravingsPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  if (!isOpen) return null;

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/meal-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorieTarget: calorieBudget,
          maxPrice,
          timeAvailableMinutes: maxMinutes,
          dietaryTags: selectedDietaryTags,
          cravingsPrompt,
        }),
      });

      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('Failed to generate AI meal recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCombo = () => {
    if (!aiResult || !aiResult.suggestedItems) return;
    const itemsToAdd: FoodItem[] = [];
    aiResult.suggestedItems.forEach((suggested: any) => {
      const foodMatch = availableFoods.find(
        (f) => f.id === suggested.foodId || f.name.toLowerCase().includes(suggested.name.toLowerCase())
      );
      if (foodMatch) itemsToAdd.push(foodMatch);
    });

    if (itemsToAdd.length > 0) {
      onAddComboToCart(itemsToAdd);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Gemini AI Cafeteria Concierge</h2>
              <p className="text-[11px] text-stone-400">Personalized smart meal combos & macro planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          <form onSubmit={handleGenerateRecommendation} className="space-y-4">
            {/* Calorie Goal Slider */}
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Target Meal Calorie Limit
                </span>
                <span className="font-bold text-amber-400 text-sm">{calorieBudget} kcal</span>
              </div>
              <input
                type="range"
                min={200}
                max={1200}
                step={50}
                value={calorieBudget}
                onChange={(e) => setCalorieBudget(Number(e.target.value))}
                className="w-full accent-amber-500 bg-stone-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Budget & Time Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Max Budget
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Max Time
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-stone-400 text-xs">Mins</span>
                </div>
              </div>
            </div>

            {/* Dietary Tags Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                Dietary Preferences & Requirements
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Halal', 'Vegan', 'Vegetarian', 'High Protein', 'Gluten-Free', 'Dairy-Free'].map((tag) => {
                  const isChecked = selectedDietaryTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cravings prompt */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Specific Cravings or Class Schedule Notes
              </label>
              <input
                type="text"
                value={cravingsPrompt}
                onChange={(e) => setCravingsPrompt(e.target.value)}
                placeholder="e.g. Need high protein lunch before 1 PM CS lecture..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:border-amber-500 focus:outline-none placeholder-stone-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Consulting Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  <span>Generate Recommended Meal Combo</span>
                </>
              )}
            </button>
          </form>

          {/* AI Output Card */}
          {aiResult && (
            <div className="bg-stone-950 p-4 rounded-xl border border-amber-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Recommended Meal Combo
                  </span>
                  <h3 className="text-base font-bold text-white">{aiResult.recommendationTitle}</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-400">${aiResult.totalComboPrice?.toFixed(2)}</span>
                  <span className="text-[10px] text-stone-400 block">{aiResult.totalComboCalories} kcal</span>
                </div>
              </div>

              <p className="text-xs text-stone-300 italic">{aiResult.explanation}</p>

              <div className="space-y-2">
                {aiResult.suggestedItems?.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
                    <div className="flex justify-between font-semibold text-stone-200">
                      <span>{item.name}</span>
                      <span className="text-amber-400">${item.price?.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">{item.reasoning}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddCombo}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Combo to Cart Tray</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
