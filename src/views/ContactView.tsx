import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Green University Of Bangladesh Cafe</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium">
          Have questions about your GUB pre-orders, dietary restrictions, or payment confirmation? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6 glass-panel p-8 rounded-3xl">
          <h3 className="font-black text-slate-900 text-xl">Dining Office Contact</h3>

          <div className="space-y-5 text-xs text-slate-700 font-medium">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#006A4E] text-white shrink-0 shadow-md shadow-emerald-900/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">GUB Location</span>
                <span>Green University of Bangladesh Campus Cafeteria, Ground Floor</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#006A4E] text-white shrink-0 shadow-md shadow-emerald-900/20">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">GUB Cafe Hotline</span>
                <span>+880 1711223344 (Cafeteria Manager)</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#006A4E] text-white shrink-0 shadow-md shadow-emerald-900/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">Email Support</span>
                <span>cafe-support@green.edu.bd</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#006A4E] text-white shrink-0 shadow-md shadow-emerald-900/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">GUB Cafe Operating Window</span>
                <span>Sunday - Saturday: 08:00 AM to 04:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-modal p-8 rounded-3xl shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-[#22C55E] mx-auto" />
              <h3 className="font-black text-slate-900 text-lg">Message Sent to GUB Cafeteria Staff</h3>
              <p className="text-xs text-slate-600 font-medium">
                Thank you, {name}! Our cafeteria manager will review your feedback shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-black text-slate-900 text-xl mb-4">Send Feedback or Query</h3>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aria Rahman"
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">GUB University Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@green.edu.bd"
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about food quality, pickup times, or dietary suggestions..."
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 glass-button font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
