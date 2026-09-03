import React from 'react';
import { NavigationTab, User } from '../types';
import { 
  LayoutDashboard, 
  Heart, 
  Utensils, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert,
  Activity,
  X,
  FileText,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onLogout: () => void;
  user: User;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  user,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isAdmin = user.role === 'admin' || user.email.toLowerCase() === 'gouthamnatukula777@gmail.com';

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'health-board', label: 'Patient Health Board', icon: Heart },
    { id: 'nutrition', label: 'Nutrition & Diet', icon: Utensils },
    { id: 'report', label: 'Clinical Health Report', icon: FileText },
    { id: 'profile', label: 'Profile & Demographics', icon: UserIcon },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Top Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => { onSelectTab('dashboard'); onCloseMobile?.(); }}
        >
          {/* Logo Concept: Minimal Medical Cross + Heartbeat AI Pulse */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
              MediSync <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Clinical Decision Support</span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Patient Portal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile?.();
              }}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 pl-3 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </button>
          );
        })}

        {/* Admin Navigation Tab (Only displayed if user is admin) */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              System Administration
            </div>
            <button
              id="sidebar-item-admin"
              onClick={() => {
                onSelectTab('admin');
                onCloseMobile?.();
              }}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-all cursor-pointer text-left ${
                currentTab === 'admin'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 pl-3'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className={`w-4 h-4 shrink-0 ${currentTab === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Admin Dashboard</span>
              </div>
              {currentTab === 'admin' && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-slate-800 block truncate">
                {user.name || 'Patient'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
