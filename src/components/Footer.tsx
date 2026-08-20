import React from 'react';
import { UtensilsCrossed, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="glass-panel text-slate-700 text-sm mt-auto border-t border-white/60 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#006A4E] flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl text-slate-900">
                Smart<span className="text-[#006A4E]">Cafe</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Official online food pre-ordering & kitchen display system for Green University of Bangladesh students, faculty, and campus cafeteria staff.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#006A4E] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Daily Fresh Ingredients & Macro Tracker</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('menu')} className="text-slate-600 hover:text-[#006A4E] transition-colors cursor-pointer">
                  Full Cafeteria Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-[#006A4E] transition-colors cursor-pointer">
                  Today's Chef Specials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-orders')} className="text-slate-600 hover:text-[#006A4E] transition-colors cursor-pointer">
                  Track Pre-Order & QR Pickup
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="text-slate-600 hover:text-[#006A4E] transition-colors cursor-pointer">
                  Pre-Ordering FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">Operating Hours</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Breakfast Window:</span>
                <span className="text-slate-900 font-bold">08:00 AM - 10:00 AM</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Lunch Peak:</span>
                <span className="text-slate-900 font-bold">12:00 PM - 03:00 PM</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Snack Window:</span>
                <span className="text-slate-900 font-bold">03:00 PM - 04:30 PM</span>
              </li>
              <li className="text-[11px] text-[#006A4E] pt-1 font-bold">
                ⚡ Pre-orders open during operating window.
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">Campus Dining Office</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                <span className="text-slate-700">Green University of Bangladesh Campus Cafeteria, Ground Floor</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#006A4E] shrink-0" />
                <span className="text-slate-700">+880 1711223344 (Cafeteria Desk)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#006A4E] shrink-0" />
                <span className="text-slate-700">cafe-support@green.edu.bd</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <p>© {new Date().getFullYear()} SmartCafe. Built for Green University of Bangladesh Pre-Ordering.</p>
          <div className="flex items-center gap-1 text-[#006A4E]">
            <span>Designed for fast, queue-free campus dining</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
