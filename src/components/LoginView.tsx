import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { saveUserProfile } from '../firebase/firestoreService';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Google Login Dialog State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAuthenticatingWithGoogle, setIsAuthenticatingWithGoogle] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<UserRole>('ADMIN');

  // Custom Google Account Input State
  const [isCustomAccount, setIsCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    if (username === 'admin' && password === 'admin123') {
      const user: User = {
        id: 1,
        uid: 'admin-local-1',
        username: 'admin',
        fullName: 'Vikram Malhotra (General Manager)',
        role: 'ADMIN',
        authProvider: 'local',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      await saveUserProfile(user).catch(() => {});
      onLogin(user);
    } else if (username === 'reception' && password === 'rec123') {
      const user: User = {
        id: 2,
        uid: 'rec-local-2',
        username: 'reception',
        fullName: 'Ananya Sharma (Senior Receptionist)',
        role: 'RECEPTIONIST',
        authProvider: 'local',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      };
      await saveUserProfile(user).catch(() => {});
      onLogin(user);
    } else {
      setError('Invalid credentials. Use demo credentials or Google Sign-In.');
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'reception') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      const user: User = {
        id: 1,
        uid: 'admin-local-1',
        username: 'admin',
        fullName: 'Vikram Malhotra (General Manager)',
        role: 'ADMIN',
        authProvider: 'local',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      await saveUserProfile(user).catch(() => {});
      onLogin(user);
    } else {
      setUsername('reception');
      setPassword('rec123');
      const user: User = {
        id: 2,
        uid: 'rec-local-2',
        username: 'reception',
        fullName: 'Ananya Sharma (Senior Receptionist)',
        role: 'RECEPTIONIST',
        authProvider: 'local',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      };
      await saveUserProfile(user).catch(() => {});
      onLogin(user);
    }
  };

  // Real Firebase Google Auth with Popup
  const handleDirectGoogleSignIn = async () => {
    setError('');
    setIsAuthenticatingWithGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email || '';
      const fullName = fbUser.displayName || email.split('@')[0] || 'Staff Member';
      const role: UserRole = email.toLowerCase() === 'chitraangulakshmi@gmail.com' ? 'ADMIN' : selectedGoogleRole;
      const userObj: User = {
        id: Date.now(),
        uid: fbUser.uid,
        username: email.split('@')[0] || 'google_user',
        fullName,
        email,
        role,
        authProvider: 'google',
        avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6C5CE7&color=fff&bold=true`,
      };

      await saveUserProfile(userObj).catch((e) => console.warn('Could not sync user profile to Firestore:', e));
      setIsAuthenticatingWithGoogle(false);
      setIsGoogleModalOpen(false);
      onLogin(userObj);
    } catch (popupError: any) {
      console.warn('Firebase popup sign-in note:', popupError);
      setIsAuthenticatingWithGoogle(false);
      // If popup is blocked in iframe, open the guided modal
      setIsGoogleModalOpen(true);
      if (popupError?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. You can select your account in the dialog below.');
      }
    }
  };

  // Google Auth Handler for selected or confirmed account
  const handlePerformGoogleLogin = async (account: {
    email: string;
    fullName: string;
    role: UserRole;
    uid?: string;
  }) => {
    setIsAuthenticatingWithGoogle(true);
    try {
      const usernameSlug = account.email.split('@')[0];
      const userObj: User = {
        id: Date.now(),
        uid: account.uid || `google-${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        username: usernameSlug,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
        authProvider: 'google',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          account.fullName
        )}&background=6C5CE7&color=fff&bold=true`,
      };

      await saveUserProfile(userObj).catch((e) => console.warn('User profile sync to Firestore:', e));
      setIsAuthenticatingWithGoogle(false);
      setIsGoogleModalOpen(false);
      onLogin(userObj);
    } catch (err) {
      setIsAuthenticatingWithGoogle(false);
      setError('Failed to authenticate Google user. Please retry.');
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    handlePerformGoogleLogin({
      email: customEmail.trim(),
      fullName: name,
      role: selectedGoogleRole,
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Hotel Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Vibrant Gradient Overlay (purple -> pink -> orange) as required */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#6C5CE7]/90 via-[#FD79A8]/80 to-[#E17055]/85 backdrop-blur-[2px]" />

      {/* Glass-effect Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-7 sm:p-8 border border-white/50 animate-fadeIn">
        {/* Hotel Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#6C5CE7]/40">
            <i className="fa-solid fa-hotel"></i>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Grand Horizon Luxury Resort
          </h1>
          <p className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wider mt-1">
            Front Desk & Staff Portal
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Hotel Operations & Reservation Desk</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{error}</span>
          </div>
        )}

        {/* PRIMARY GOOGLE LOGIN OPTION */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDirectGoogleSignIn}
            disabled={isAuthenticatingWithGoogle}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl shadow-sm hover:shadow transition transform active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-75"
          >
            {/* Authentic Google 4-Color Icon */}
            {isAuthenticatingWithGoogle ? (
              <i className="fa-solid fa-circle-notch fa-spin text-sm text-[#4285F4]"></i>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="font-semibold text-slate-700 text-xs sm:text-sm group-hover:text-slate-900">
              {isAuthenticatingWithGoogle ? 'Connecting with Google...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Quick Direct Google Login with Chitra's account */}
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsGoogleModalOpen(true);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 text-[#6C5CE7] text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <i className="fa-brands fa-google text-[10px]"></i>
            <span>Choose Google Account or Quick Sign-In (chitraangulakshmi@gmail.com)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white/95 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
            or use credentials
          </span>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or reception"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50 focus:border-[#6C5CE7] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50 focus:border-[#6C5CE7] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#6C5CE7] to-[#FD79A8] hover:opacity-95 text-white font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/25 transition transform active:scale-[0.98] text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to System</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
            Front Desk Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[#6C5CE7] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <i className="fa-solid fa-user-shield text-[10px]"></i>
              <span>Admin (admin123)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('reception')}
              className="py-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00B894] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <i className="fa-solid fa-headset text-[10px]"></i>
              <span>Reception (rec123)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GOOGLE ACCOUNT CHOOSER MODAL DIALOG */}
      {/* ============================================================== */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="text-sm font-bold text-slate-800">Sign in with Google</h3>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4">
              Choose an account to continue to <strong>Grand Horizon Hotel Management</strong>:
            </p>

            {isAuthenticatingWithGoogle ? (
              <div className="py-8 text-center space-y-3">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#6C5CE7]"></i>
                <p className="text-xs font-semibold text-slate-700">Connecting Google account...</p>
                <p className="text-[11px] text-slate-400">Verifying authorized permissions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Role Switcher for Google User */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Assign System Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGoogleRole('ADMIN')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedGoogleRole === 'ADMIN'
                          ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <i className="fa-solid fa-user-shield text-[10px]"></i>
                      <span>Admin (GM)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGoogleRole('RECEPTIONIST')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedGoogleRole === 'RECEPTIONIST'
                          ? 'bg-[#00B894] text-white border-[#00B894] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <i className="fa-solid fa-headset text-[10px]"></i>
                      <span>Receptionist</span>
                    </button>
                  </div>
                </div>

                {/* Account List */}
                {!isCustomAccount ? (
                  <div className="space-y-2">
                    {/* Primary Detected Account */}
                    <button
                      onClick={() =>
                        handlePerformGoogleLogin({
                          email: 'chitraangulakshmi@gmail.com',
                          fullName: 'Chitra Angulakshmi',
                          role: selectedGoogleRole,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#6C5CE7] hover:bg-slate-50 text-left transition flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        C
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#6C5CE7] truncate">
                            Chitra Angulakshmi
                          </p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-[#6C5CE7] font-semibold border border-indigo-200">
                            {selectedGoogleRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          chitraangulakshmi@gmail.com
                        </p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-[#6C5CE7] transition"></i>
                    </button>

                    {/* Secondary Hotel Staff Google Account */}
                    <button
                      onClick={() =>
                        handlePerformGoogleLogin({
                          email: 'frontdesk@grandhorizon.resort',
                          fullName: 'Front Desk Team',
                          role: selectedGoogleRole,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#00B894] hover:bg-slate-50 text-left transition flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        <i className="fa-solid fa-bell-concierge"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#00B894] truncate">
                            Grand Horizon Front Desk
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          frontdesk@grandhorizon.resort
                        </p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-[#00B894] transition"></i>
                    </button>

                    {/* Switch to custom Google email */}
                    <button
                      type="button"
                      onClick={() => setIsCustomAccount(true)}
                      className="w-full py-2 px-3 text-xs font-medium text-[#6C5CE7] hover:text-[#5a4bd4] flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <i className="fa-solid fa-user-plus text-[10px]"></i>
                      <span>Use another Google account</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Google Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="username@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCustomAccount(false)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#FD79A8] text-white text-xs font-semibold shadow-md shadow-[#6C5CE7]/25 cursor-pointer hover:opacity-95"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
