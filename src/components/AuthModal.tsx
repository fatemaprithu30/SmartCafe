import React, { useState } from 'react';
import { X, User, ChefHat, ShieldAlert, Sparkles, LogIn, Key, Mail, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto text-stone-950 font-black shadow-lg">
            SC
          </div>
          <h2 className="text-xl font-bold text-white">Smart Café Portal Access</h2>
          <p className="text-xs text-stone-400">Pre-Ordering & Cafeteria Management System</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'demo' ? 'bg-amber-500 text-stone-950 font-extrabold' : 'text-stone-400 hover:text-white'
            }`}
          >
            ⚡ Quick Demo Accounts
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'login' ? 'bg-amber-500 text-stone-950 font-extrabold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'register' ? 'bg-amber-500 text-stone-950 font-extrabold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === 'demo' ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 text-center">
              Click any role to test account views immediately:
            </p>

            {INITIAL_USERS.map((user) => {
              const isCurrent = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-200 hover:border-stone-700 hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      {user.role === 'student' && <User className="w-4 h-4 text-blue-400" />}
                      {user.role === 'staff' && <ChefHat className="w-4 h-4 text-emerald-400" />}
                      {user.role === 'admin' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                      {user.role === 'super_admin' && <ShieldAlert className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {user.name}
                        <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block">{user.email}</span>
                    </div>
                  </div>

                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-stone-300 font-semibold mb-1">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@univ.edu"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs transition-colors shadow-lg"
            >
              {activeTab === 'login' ? 'Sign In to Smart Café' : 'Create Student Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
