import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User,
  Sparkles,
  Search,
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
}) => {
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const activeReadyOrders = currentUser ? orders.filter(
    (o) => o.studentId === currentUser.id && o.orderStatus === 'ready'
  ) : [];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/95 border-b border-slate-800 text-slate-100 transition-all shadow-md">
      {/* Announcement Banner */}
      {announcementText && (
        <div className="bg-blue-900/40 border-b border-blue-800/50 px-4 py-1.5 text-xs text-blue-200 text-center flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                  GUB<span className="text-blue-400 font-extrabold">Café</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-semibold">
                  Green University
                </span>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'home'
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'faq'
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                FAQ
              </button>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Ready Order Badge Banner */}
            {activeReadyOrders.length > 0 && activeRole === 'student' && (
              <button
                onClick={() => setActiveTab('student-orders')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-pulse"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Order Ready! Show QR</span>
              </button>
            )}

            {/* Cart Button */}
            {activeRole === 'student' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors focus:outline-none border border-slate-700/50"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow">
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
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors relative border border-slate-700/50"
                >
                  <Bell className="w-5 h-5 text-slate-300" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-slate-900" />
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotificationsPopover && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="font-semibold text-xs text-slate-200">
                        Notifications ({notifications.length})
                      </span>
                      <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Real-Time</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
                          >
                            <p className="font-semibold text-slate-100">{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors border border-slate-700/50"
                title="Student Pre-Orders & QR Codes"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}

            {/* Auth / Profile or Logout trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuth}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/50"
                  title={`Logged in as ${currentUser.name}`}
                >
                  <User className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  onClick={onLogOut}
                  className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors border border-red-900/30"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
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
