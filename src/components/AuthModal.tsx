import React, { useState } from 'react';
import { X, Key, Mail, Search, ShieldCheck } from 'lucide-react';
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
  const [smartCafeSearch, setSmartCafeSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-900 p-6 sm:p-8 space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Green University Branding Banner */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-center gap-3">
            {/* GUB Tree Logo SVG */}
            <svg className="w-10 h-10 text-emerald-600 shrink-0" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5 L20 35 H35 L10 65 H30 L5 90 H95 L70 65 H90 L65 35 H80 Z" />
            </svg>
            <div className="text-left">
              <span className="text-2xl font-black italic tracking-tight block">
                <span className="text-emerald-600">Green</span> <span className="text-sky-600">University of Bangladesh</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                SmartCafé Official Access Portal
              </span>
            </div>
          </div>

          {/* GUB SmartCafe Integrated Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-4" />
            <input
              type="text"
              value={smartCafeSearch}
              onChange={(e) => setSmartCafeSearch(e.target.value)}
              placeholder="Search GUB SmartCafe meals, menu, or portal info..."
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-inner"
            />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            {activeTab === 'login' ? 'Student Login' : 'Student Account Registration'}
          </h2>
          <p className="text-xs text-slate-500">
            Enter your credentials to pre-order food from GUB SmartCafé.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'login' ? 'bg-emerald-600 text-white font-black shadow' : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'register' ? 'bg-emerald-600 text-white font-black shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Student
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
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
                if (!studentIdInput) {
                  setErrorMessage('Please enter your GUB Student ID.');
                  return;
                }

                // Retrieve university email address mapped to this student ID in the profiles directory
                const { data: dbProfiles, error: pQueryErr } = await supabase
                  .from('profiles')
                  .select('email, is_active, role')
                  .eq('student_id', studentIdInput.trim());

                if (pQueryErr) throw pQueryErr;
                if (!dbProfiles || dbProfiles.length === 0) {
                  setErrorMessage('Invalid Student ID. No registered student profile was found for this ID.');
                  return;
                }

                const profileDetails = dbProfiles[0];
                if (profileDetails.role !== 'student') {
                  setErrorMessage('This login portal is strictly reserved for GUB students. Please use the appropriate URL to log in.');
                  return;
                }

                if (!profileDetails.is_active) {
                  setErrorMessage('Your student registration is pending administrator approval. Please wait for the GUB Dining Office to review and accept your account.');
                  return;
                }

                // Successfully found email and verified state, authenticate using email + password credentials
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: profileDetails.email,
                  password
                });
                if (error) {
                  if (error.message && error.message.toLowerCase().includes('invalid login credentials')) {
                    setErrorMessage('Incorrect Password. Please check your password and try again.');
                  } else {
                    throw error;
                  }
                  return;
                }

                // Load complete database profile
                const { data: profile, error: profileErr } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user?.id)
                  .single();

                if (profileErr) throw profileErr;

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
                    isVegetarian: false,
                    isNonVegetarian: false,
                    isHighProtein: false,
                    dailyCalorieTarget: 2000
                  }
                });
                onClose();
              } else {
                // Register a new user
                // Prevent duplicate Student ID or Email checks
                const { data: dupCheck, error: dupErr } = await supabase
                  .from('profiles')
                  .select('id, student_id, email')
                  .or(`student_id.eq.${studentIdInput.trim()},email.eq.${email.trim()}`);

                if (dupErr) throw dupErr;

                if (dupCheck && dupCheck.length > 0) {
                  const hasDupId = dupCheck.some((p: any) => p.student_id?.toLowerCase() === studentIdInput.trim().toLowerCase());
                  const hasDupEmail = dupCheck.some((p: any) => p.email?.toLowerCase() === email.trim().toLowerCase());
                  if (hasDupId) {
                    setErrorMessage('Student already exists. This Student ID is already registered.');
                    return;
                  }
                  if (hasDupEmail) {
                    setErrorMessage('Registration failed. This university email is already in use.');
                    return;
                  }
                }

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

                  // Insert notification records automatically for all GUB administrators
                  try {
                    const { data: admins } = await supabase
                      .from('profiles')
                      .select('id')
                      .eq('role', 'admin');

                    if (admins && admins.length > 0) {
                      const notificationInserts = admins.map((admin: any) => ({
                        user_id: admin.id,
                        title: 'New Student Registration Pending',
                        message: `New student registered: ${fullName} (ID: ${studentIdInput})`,
                        type: 'system',
                        read: false
                      }));
                      await supabase.from('notifications').insert(notificationInserts);
                    }
                  } catch (notifErr) {
                    console.error('Failed to dispatch registration notifications to admin: ', notifErr);
                  }

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
          {activeTab === 'login' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GUB Student ID</label>
              <input
                type="text"
                required
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="232002030"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
              />
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aria Rahman"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">GUB Student ID</label>
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="232002030"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">University Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@green.edu.bd"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-98"
          >
            {activeTab === 'login' ? 'LOG IN' : 'Request Student Account Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
