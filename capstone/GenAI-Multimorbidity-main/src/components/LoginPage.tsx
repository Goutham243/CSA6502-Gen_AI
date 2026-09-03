import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, Mail, ArrowRight, User as UserIcon, Activity } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; name?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. name@example.com).';
    }

    if (!fullName.trim()) {
      errs.name = 'Please enter your full name.';
    }

    if (!password) {
      errs.password = 'Please enter your password.';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin = cleanEmail === 'gouthamnatukula777@gmail.com';
      const cleanName = fullName.trim() || (isAdmin ? 'Goutham Natukula' : 'Patient User');

      const loggedInUser: User = {
        email: cleanEmail,
        name: cleanName,
        role: isAdmin ? 'admin' : 'patient',
      };

      onLoginSuccess(loggedInUser);
    }, 300);
  };

  // Helper demo fills for quick access
  const handleQuickPatient = () => {
    setEmail('patient.alex@example.com');
    setFullName('Alex Morgan');
    setPassword('health123');
    setErrors({});
  };

  const handleQuickAdmin = () => {
    setEmail('gouthamnatukula777@gmail.com');
    setFullName('Goutham Natukula');
    setPassword('admin2026');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased">
      {/* Top Logo and Tagline */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-sm text-white mb-4">
          <div className="relative flex items-center justify-center">
            {/* Minimal Medical Cross + Pulse Heartbeat Icon */}
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          MediSync <span className="text-blue-600">AI</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Personal Healthcare & Medication Guidance
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isRegistering ? 'Create Patient Account' : 'Welcome to MediSync'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in to view your health and medication guidance
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* Full Name Field (Required for all to ensure proper greeting & personalization) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="full-name-input">
                Your Full Name *
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="full-name-input"
                  type="text"
                  placeholder="e.g. Goutham or Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="email-input">
                Email Address *
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider" htmlFor="password-input">
                  Password *
                </label>
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer disabled:opacity-70 shadow-xs"
              >
                {isLoading ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <p className="text-[11px] text-slate-400 text-center font-medium">Quick Test Login Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="demo-patient-btn"
                type="button"
                onClick={handleQuickPatient}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-center cursor-pointer"
              >
                👤 Patient Login
              </button>
              <button
                id="demo-admin-btn"
                type="button"
                onClick={handleQuickAdmin}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 transition-colors text-center cursor-pointer"
                title="Logs in as gouthamnatukula777@gmail.com (Admin)"
              >
                🛡️ Admin (Goutham)
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          MediSync AI prioritizes patient privacy and data security.
        </p>
      </div>
    </div>
  );
};
