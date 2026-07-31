import React, { useState } from 'react';
import { X, Key, Mail, ShieldAlert, User, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mx-auto text-white font-black shadow-lg">
            GUB
          </div>
          <h2 className="text-xl font-bold text-white">Smart Café Student Portal</h2>
          <p className="text-xs text-stone-400">Green University of Bangladesh Campus Pre-Ordering</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'login' ? 'bg-blue-600 text-white font-extrabold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'register' ? 'bg-blue-600 text-white font-extrabold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Register Student
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErrorMessage('');
            setSuccessMessage('');
            try {
              const { supabase } = await import('../supabaseClient');
              if (activeTab === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Load database profile
                const { data: profile, error: profileErr } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user?.id)
                  .single();

                if (profileErr) throw profileErr;

                if (!profile.is_active) {
                  await supabase.auth.signOut();
                  setErrorMessage('Your student registration is pending administrator approval. Please wait for the GUB Dining Office to review and accept your account.');
                  return;
                }

                if (profile.role !== 'student') {
                  await supabase.auth.signOut();
                  setErrorMessage('This login portal is strictly reserved for GUB students. Please use the appropriate URL to log in.');
                  return;
                }

                onSelectUser({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role,
                  studentId: profile.student_id,
                  phone: profile.phone,
                  department: profile.department,
                  walletBalance: profile.wallet_balance || 0,
                  dietaryPreferences: profile.dietary_preferences || {
                    allergens: [],
                    isHalal: true,
                    isVegan: false,
                    isVegetarian: false,
                    isGlutenFree: false,
                    dailyCalorieTarget: 2000
                  }
                });
                onClose();
              } else {
                // Register a new user
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user) {
                  const { error: insertErr } = await supabase.from('profiles').insert([{
                    id: data.user.id,
                    name: fullName,
                    email: email,
                    role: 'student',
                    student_id: studentIdInput,
                    phone: phoneInput,
                    department: departmentInput,
                    is_active: false // Needs admin approval!
                  }]);
                  if (insertErr) throw insertErr;

                  // Sign out user immediately since they are not approved yet
                  await supabase.auth.signOut();
                  setSuccessMessage('Registration request submitted successfully! Your account is now pending GUB administrator approval. Once accepted, you will be able to log in.');
                  setActiveTab('login');
                }
              }
            } catch (err: any) {
              setErrorMessage(err.message || 'Authentication error.');
            }
          }}
          className="space-y-4 text-xs"
        >
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aria Rahman"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">GUB Student ID</label>
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. UG-2024-8842"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +8801712345678"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-stone-300 font-semibold mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@green.edu.bd"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
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
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-colors shadow-lg"
          >
            {activeTab === 'login' ? 'Sign In to GUB Smart Café' : 'Request Student Account Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
