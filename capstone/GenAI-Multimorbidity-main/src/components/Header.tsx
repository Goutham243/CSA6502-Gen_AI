import React from 'react';
import { NavigationTab, User } from '../types';
import { Menu, Heart, Activity } from 'lucide-react';

interface HeaderProps {
  currentTab: NavigationTab;
  user: User;
  onOpenMobileMenu: () => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  user,
  onOpenMobileMenu,
  onSelectTab,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Health Details Intake';
      case 'health-board':
        return 'Patient Health Board';
      case 'nutrition':
        return 'Nutrition & Diet Guidance';
      case 'report':
        return 'Clinical Health Report';
      case 'profile':
        return 'My Profile';
      case 'admin':
        return 'Administrator Center';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand indicator for mobile */}
        <div className="md:hidden flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900">MediSync</span>
        </div>

        {/* Current Active Section Badge (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Current View:</span>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            {getTabTitle()}
          </span>
        </div>
      </div>

      {/* Right side user badge */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="View profile"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {user.name ? user.name.slice(0, 1).toUpperCase() : 'P'}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
            {user.name || 'Patient'}
          </span>
        </button>
      </div>
    </header>
  );
};
