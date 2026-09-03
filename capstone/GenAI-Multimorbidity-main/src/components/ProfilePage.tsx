import React, { useState } from 'react';
import { User, HealthProfile, Medication } from '../types';
import { User as UserIcon, Mail, ShieldCheck, LogOut, Check, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  profile: HealthProfile;
  medications?: Medication[];
  onUpdateUserName: (newName: string) => void;
  onSaveProfile?: (profile: HealthProfile) => void;
  onLogout?: () => void;
  onBackToDashboard?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  profile,
  medications = [],
  onUpdateUserName,
  onSaveProfile,
  onLogout,
  onBackToDashboard,
}) => {
  const [name, setName] = useState(user.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateUserName(name.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div id="patient-profile-page" className="space-y-6 max-w-2xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center">
            {user.name ? user.name.slice(0, 2).toUpperCase() : 'PT'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name || 'Patient'}</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
              {user.role === 'admin' ? 'Administrator' : 'Verified Patient Profile'}
            </span>
          </div>
        </div>

        {/* Update Name Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="edit-name-input">
              Full Name (Used for Greetings & Reports)
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="edit-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Registered Email
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              id="save-profile-btn"
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Name Updated!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* Profile Summary snapshot */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Health Data Snapshot</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Conditions</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{profile.diseases.join(', ') || 'None'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Diet Preference</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{profile.dietaryPreference || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Sign Out of MediSync AI</p>
            <p className="text-[11px] text-slate-500">Safely terminate your current session on this device.</p>
          </div>
          <button
            id="profile-logout-btn"
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </div>
  );
};
