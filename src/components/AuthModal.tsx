import React, { useState } from 'react';
import { X, Key, Mail } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg glass-modal border border-white/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 p-6 sm:p-8 space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-card text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Green University Branding Banner */}
        <div className="text-center space-y-2 border-b border-slate-200/60 pb-4">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/gub-logo.png"
              alt="GUB Logo"
              className="w-10 h-12 object-contain shrink-0"
            />
            <div className="text-left">
              <span className="text-2xl font-black italic tracking-tight block">
                <span className="text-[#006A4E]">Green</span> <span className="text-sky-600">University of Bangladesh</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
                SmartCafé Official Access Portal
              </span>
            </div>
          </div>

        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900">
            {activeTab === 'login' ? 'Student Login' : 'Student Account Registration'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Enter your credentials to pre-order food from GUB SmartCafé.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/60 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-[#006A4E] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Student
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-700 text-xs rounded-2xl font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs rounded-2xl font-medium">
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
                const inputVal = studentIdInput.trim();
                if (!inputVal) {
                  setErrorMessage('Please enter your GUB Student ID or Email Address.');
                  return;
                }

                let loginEmail = inputVal;

                // If inputVal is not an email, search profiles by student_id
                if (!inputVal.includes('@')) {
                  const { data: dbProfiles, error: pQueryErr } = await supabase
                    .from('profiles')
                    .select('email, is_active, role')
                    .eq('student_id', inputVal);

                  if (pQueryErr) {
                    console.error('Error querying profiles by student_id:', pQueryErr);
                  }

                  if (!dbProfiles || dbProfiles.length === 0) {
                    setErrorMessage('Invalid Student ID. No registered student profile was found for this ID.');
                    return;
                  }

                  const profileDetails = dbProfiles[0];
                  if (profileDetails.role !== 'student') {
                    setErrorMessage('This login portal is strictly reserved for GUB students. Please use the appropriate URL to log in.');
                    return;
                  }

                  if (profileDetails.is_active === false) {
                    setErrorMessage('Your student registration is pending administrator approval. Please wait for the GUB Dining Office to review and accept your account.');
                    return;
                  }
                  loginEmail = profileDetails.email;
                }

                const { data, error } = await supabase.auth.signInWithPassword({
                  email: loginEmail,
                  password
                });

                if (error) {
                  if (error.message && error.message.toLowerCase().includes('invalid login credentials')) {
                    setErrorMessage('Incorrect Student ID/Email or Password. Please check your credentials and try again.');
                  } else {
                    setErrorMessage(error.message || 'Login failed.');
                  }
                  return;
                }

                if (!data.user) {
                  setErrorMessage('Login failed. Could not retrieve user session.');
                  return;
                }

                // Retrieve profile after successful authentication
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user.id)
                  .maybeSingle();

                if (profile) {
                  if (profile.role !== 'student') {
                    await supabase.auth.signOut();
                    setErrorMessage('This portal is strictly reserved for GUB students.');
                    return;
                  }

                  if (profile.is_active === false) {
                    await supabase.auth.signOut();
                    setErrorMessage('Your student account is pending administrator approval.');
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
                      isVegetarian: false,
                      isNonVegetarian: false,
                      isHighProtein: false,
                      dailyCalorieTarget: 2000
                    }
                  });
                } else {
                  // Fallback in-memory profile if profiles row is not created yet
                  onSelectUser({
                    id: data.user.id,
                    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Student',
                    email: data.user.email || '',
                    role: 'student',
                    studentId: inputVal,
                    phone: '+880',
                    department: 'GUB Campus',
                    walletBalance: 0,
                    dietaryPreferences: {
                      allergens: [],
                      isVegetarian: false,
                      isNonVegetarian: false,
                      isHighProtein: false,
                      dailyCalorieTarget: 2000
                    }
                  });
                }
                onClose();
              } else {
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
                    is_active: false
                  }]);
                  if (insertErr) throw insertErr;

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
              <label className="block text-slate-700 font-bold mb-1.5">GUB Student ID</label>
              <input
                type="text"
                required
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="Enter your Student ID"
                className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
              />
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">GUB Student ID</label>
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="Enter your Student ID"
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Department</label>
                <input
                  type="text"
                  required
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter your contact no."
                  className="w-full glass-input rounded-2xl p-3.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">University Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@green.edu.bd"
                    className="w-full glass-input rounded-2xl pl-10 p-3.5 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full glass-input rounded-2xl pl-10 p-3.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl glass-button font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/20 active:scale-98 cursor-pointer"
          >
            {activeTab === 'login' ? 'LOG IN' : 'Request Student Account Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
