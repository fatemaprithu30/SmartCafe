import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FAQView: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does pre-ordering work at the Green University of Bangladesh cafeteria?',
      a: 'Select your meals on GUB Smart Café, choose a 10-minute pickup slot (e.g., 12:10 PM - 12:20 PM), and pay via bKash, Nagad, Rocket, or credit card. When your slot arrives, visit Express Counter 1 and scan your live QR code to pick up your packaged meal without waiting in line.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We support manual MFS payments (bKash, Nagad, and Rocket) as well as secure Credit/Debit cards through SSLCommerz.',
    },
    {
      q: 'What happens if I miss my chosen 10-minute pickup slot?',
      a: 'Pre-ordered meals are kept warm in heat-sealed holding bins at Express Counter 1 for up to 30 minutes after your slot. After 30 minutes, contact kitchen staff with your order number.',
    },
    {
      q: 'How are allergens and dietary requirements handled?',
      a: 'All food items list full macro nutrition (Calories, Protein, Carbs, Fat) and allergen tags (Gluten, Peanuts, Dairy, Eggs). You can also filter the entire menu by Halal, Vegan, High Protein, or Gluten-Free.',
    },
    {
      q: 'Can I cancel or modify my pre-order after placing it?',
      a: 'You can cancel your pre-order for a refund as long as the kitchen status is "Pending". Once the status shifts to "Preparing", cancellation is locked as ingredients are already cooking.',
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Pre-Ordering & Express Pickup FAQ</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need to know about GUB campus dining pre-orders, QR scanning, and MFS payments.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-bold text-sm text-slate-900">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
