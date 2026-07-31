import React from 'react';
import { UtensilsCrossed, Clock, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                Smart<span className="text-blue-400">Café</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official online food pre-ordering & kitchen queue system for university students, faculty, and campus cafeteria staff.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal Certified & Daily Macro Tracker</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-blue-400 transition-colors">
                  Full Cafeteria Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">
                  Today's Chef Specials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-orders')} className="hover:text-blue-400 transition-colors">
                  Track Pre-Order & QR Pickup
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-blue-400 transition-colors">
                  Pre-Ordering FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Operating Hours</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span>Breakfast Window:</span>
                <span className="text-slate-300 font-medium">07:30 AM - 10:30 AM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Lunch Peak:</span>
                <span className="text-slate-300 font-medium">11:30 AM - 03:00 PM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Snacks & Dinner:</span>
                <span className="text-slate-300 font-medium">03:30 PM - 08:30 PM</span>
              </li>
              <li className="text-[11px] text-blue-400 pt-1 font-medium">
                ⚡ Pre-orders open 2 hours before each slot.
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Campus Dining Office</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Student Center Building 2, Ground Floor Dining Hall</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+1 (555) 019-2834 (Cafeteria Desk)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>dining@univ.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smart Café System. Built for University Campus Pre-Ordering.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Designed for fast, queue-free campus dining</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
