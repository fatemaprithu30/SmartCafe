import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQView: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does pre-ordering work at the Green University of Bangladesh cafeteria?',
      a: 'Select your meals on GUB Smart Café, choose a pickup time slot, and pay via bKash, Nagad, Rocket, or credit card. When your slot arrives, visit FoodZone Express Counter and scan your live QR code to pick up your packaged meal without waiting in line.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We support manual MFS payments (bKash, Nagad, and Rocket) as well as secure Credit/Debit cards through SSLCommerz.',
    },
    {
      q: 'What happens if I miss my chosen pickup slot?',
      a: 'Pre-ordered meals are kept warm in heat-sealed holding bins at Express Counter for up to 30 minutes after your slot. After 30 minutes, contact kitchen staff with your order number.',
    },
    {
      q: 'How are allergens and dietary requirements handled?',
      a: 'All food items list full macro nutrition (Calories, Protein, Carbs, Fat) and allergen tags (Gluten, Peanuts, Dairy, Eggs). You can also filter the entire menu using our sliders and search controls.',
    },
    {
      q: 'Can I cancel or modify my pre-order after placing it?',
      a: 'You can cancel your pre-order for a refund as long as the kitchen status is "Pending". Once the status shifts to "Preparing", cancellation is locked as ingredients are already cooking.',
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-[#006A4E] text-xs font-bold shadow-sm">
          <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Pre-Ordering & Express Pickup FAQ</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Everything you need to know about GUB campus dining pre-orders, QR scanning, and MFS payments.
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
              >
                <span className="font-extrabold text-sm sm:text-base text-slate-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#006A4E] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
