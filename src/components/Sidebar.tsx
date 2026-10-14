import React from 'react';
import { User } from '../types';

export type TabType =
  | 'dashboard'
  | 'rooms'
  | 'customers'
  | 'booking'
  | 'billing'
  | 'services'
  | 'reports'
  | 'ai-concierge';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  const navItems: { id: TabType; label: string; icon: string; color: string; badge?: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', color: '#6C5CE7' },
    { id: 'rooms', label: 'Room Management', icon: 'fa-bed', color: '#00B894' },
    { id: 'customers', label: 'Customer Directory', icon: 'fa-users', color: '#0984E3' },
    { id: 'booking', label: 'New Booking', icon: 'fa-calendar-check', color: '#FD79A8' },
    { id: 'billing', label: 'Checkout & Billing', icon: 'fa-file-invoice-dollar', color: '#FDCB6E' },
    { id: 'services', label: 'Auxiliary Services', icon: 'fa-concierge-bell', color: '#E17055' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'fa-chart-line', color: '#a29bfe' },
    { id: 'ai-concierge', label: 'AI Suite & Live Voice', icon: 'fa-wand-magic-sparkles', color: '#FD79A8', badge: 'Gemini' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-30 transition-all select-none">
      {/* Hotel Brand Header */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white text-lg shadow-md shadow-[#6C5CE7]/30">
          <i className="fa-solid fa-hotel"></i>
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Grand Horizon</h2>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Luxury Resort & Suites
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="mx-4 my-3 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-white">
            <i className={currentUser.role === 'ADMIN' ? 'fa-solid fa-user-shield text-[#6C5CE7]' : 'fa-solid fa-headset text-[#00B894]'}></i>
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.fullName}</p>
            <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5">
              {currentUser.authProvider === 'google' && (
                <span className="inline-flex items-center gap-0.5 text-[#FD79A8] font-bold">
                  <i className="fa-brands fa-google text-[9px]"></i> Google
                </span>
              )}
              <span>• {currentUser.role.toLowerCase()}</span>
            </p>
          </div>
        </div>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
            currentUser.role === 'ADMIN' ? 'bg-[#6C5CE7]/20 text-[#a29bfe] border border-[#6C5CE7]/30' : 'bg-[#00B894]/20 text-[#55efc4] border border-[#00B894]/30'
          }`}
        >
          {currentUser.role}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Core Modules
        </p>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] text-white shadow-md shadow-[#6C5CE7]/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <i
                className={`fa-solid ${item.icon} text-sm w-5 text-center transition-colors`}
                style={{ color: isActive ? '#ffffff' : item.color }}
              ></i>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-700/60 transition cursor-pointer"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
