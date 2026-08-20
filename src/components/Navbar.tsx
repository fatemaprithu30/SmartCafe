import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User,
  Sparkles,
  Clock,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { UserProfile, UserRole, AppNotification, Order } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAiAssistant: () => void;
  notifications: AppNotification[];
  orders: Order[];
  onOpenAuth: () => void;
  onLogOut: () => void;
  announcementText?: string;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenAiAssistant,
  notifications,
  orders,
  onOpenAuth,
  onLogOut,
  announcementText,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
}) => {
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const activeReadyOrders = currentUser ? orders.filter(
    (o) => o.studentId === currentUser.id && o.orderStatus === 'ready'
  ) : [];
  const activePreparingOrders = currentUser ? orders.filter(
    (o) => o.studentId === currentUser.id && o.orderStatus === 'preparing'
  ) : [];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all shadow-sm">
      {/* Announcement Banner */}
      {announcementText && (
        <div className="bg-[#006A4E]/10 border-b border-[#006A4E]/20 px-4 py-1.5 text-xs text-[#006A4E] text-center flex items-center justify-center gap-2 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#006A4E] flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1">
                  Smart<span className="text-[#006A4E]">Cafe</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block -mt-1 font-bold">
                  Green University
                </span>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {[
                { id: 'home', label: 'Home' },
                { id: 'menu', label: 'Menu' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
                { id: 'faq', label: 'FAQ' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === link.id
                      ? 'bg-[#006A4E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Order Tracking Badges */}
            {activeRole === 'student' && activeReadyOrders.length > 0 && (
              <button
                onClick={() => setActiveTab('student-orders')}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 animate-pulse shadow-sm cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Order Ready! Show QR</span>
              </button>
            )}

            {activeRole === 'student' && activeReadyOrders.length === 0 && activePreparingOrders.length > 0 && (
              <button
                onClick={() => setActiveTab('student-orders')}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-800 animate-pulse shadow-sm cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Cooking in Kitchen 🔥</span>
              </button>
            )}

            {/* Cart Button */}
            {activeRole === 'student' && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-2xl glass-card hover:bg-white/80 text-slate-800 transition-all focus:outline-none cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#006A4E]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#006A4E] text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                  className="p-2.5 rounded-2xl glass-card hover:bg-white/80 text-slate-800 transition-all relative cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotificationsPopover && (
                  <div className="absolute right-0 mt-2 w-80 glass-modal rounded-3xl shadow-2xl z-50 p-4 text-xs">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60">
                      <span className="font-extrabold text-xs text-slate-900">
                        Notifications ({notifications.length})
                      </span>
                      {unreadNotifications.length > 0 && onMarkAllNotificationsAsRead && (
                        <button
                          onClick={() => onMarkAllNotificationsAsRead()}
                          className="text-[11px] text-[#006A4E] hover:underline font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4 font-medium">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.read && onMarkNotificationAsRead && onMarkNotificationAsRead(n.id)}
                            className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                              n.read
                                ? 'bg-white/40 border-slate-200/50 text-slate-500'
                                : 'bg-white/90 border-[#006A4E]/30 text-slate-900 font-medium shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <p className="font-bold">{n.title}</p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#006A4E] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Student Dashboard Shortcut */}
            {currentUser && activeRole === 'student' && (
              <button
                onClick={() => setActiveTab('student-orders')}
                className="p-2.5 rounded-2xl glass-card hover:bg-white/80 text-[#006A4E] transition-all cursor-pointer"
                title="Student Pre-Orders & QR Codes"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}

            {/* Auth / Profile or Logout trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="p-2.5 rounded-2xl glass-card hover:bg-white/80 text-slate-800 transition-all cursor-pointer"
                  title={`Logged in as ${currentUser.name}`}
                >
                  <User className="w-5 h-5 text-[#006A4E]" />
                </button>
                <button
                  onClick={onLogOut}
                  className="p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all border border-red-500/20 cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-2xl glass-button font-bold text-xs transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
