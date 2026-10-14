import React from 'react';
import { User } from '../types';
import { TabType } from './Sidebar';

interface TopbarProps {
  currentUser: User;
  currentTab: TabType;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNewBookingClick: () => void;
  onOpenAIConcierge?: () => void;
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  currentTab,
  darkMode,
  onToggleDarkMode,
  onNewBookingClick,
  onOpenAIConcierge,
  onLogout,
}) => {
  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Operations Dashboard', sub: 'Real-time room occupancy, revenue metrics & analytics' };
      case 'rooms':
        return { title: 'Room Inventory Management', sub: 'Single, Double, Deluxe, and Royal Suite accommodation catalog' };
      case 'customers':
        return { title: 'Customer & Guest Directory', sub: 'Guest KYC verification, contact information & search' };
      case 'booking':
        return { title: 'Room Reservation Desk', sub: 'Check date availability, prevent double booking & calculate tariffs' };
      case 'billing':
        return { title: 'Checkout & Bill Settlement', sub: '12% GST computation, auxiliary services ledger & printable tax invoice' };
      case 'services':
        return { title: 'Auxiliary Services Catalog', sub: 'In-room dining, laundry dry cleaning, spa therapy & transfers' };
      case 'reports':
        return { title: 'Hotel Analytics & Reports', sub: 'Daily check-in logs, occupancy performance & CSV export' };
      case 'ai-concierge':
        return { title: 'AI Concierge & Live Voice Suite', sub: 'Gemini 3.8 Live Voice, Multi-Turn Assistant, Maps & Search Grounding, and Audio Dictation' };
      default:
        return { title: 'Grand Horizon HMS', sub: 'Hotel Operations' };
    }
  };

  const { title, sub } = getTabTitle(currentTab);

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between transition-colors z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick AI Concierge Button */}
        {onOpenAIConcierge && (
          <button
            onClick={onOpenAIConcierge}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              currentTab === 'ai-concierge'
                ? 'bg-[#FD79A8]/20 text-[#FD79A8] border-[#FD79A8]/40 shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/40 text-[#6C5CE7] dark:text-[#a29bfe] border-purple-200 dark:border-purple-800 hover:bg-purple-100'
            }`}
            title="Open Gemini AI Concierge & Voice Assistant"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
            <span className="hidden sm:inline">AI Suite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FD79A8] animate-pulse"></span>
          </button>
        )}

        {/* Quick New Booking Button */}
        <button
          onClick={onNewBookingClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] hover:opacity-95 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i>
          <span>New Reservation</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer text-sm"
          title="Toggle Dark / Light Mode"
        >
          <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-500'}`}></i>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            {currentUser.authProvider === 'google' && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <i className="fa-brands fa-google text-[9px] text-[#4285F4]"></i>
              </span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {currentUser.fullName.split(' ')[0]}
            </p>
            <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
              <span>{currentUser.role.toLowerCase()}</span>
              {currentUser.authProvider === 'google' && (
                <span className="text-[9px] font-bold text-[#6C5CE7]">• Google</span>
              )}
            </span>
          </div>
          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            title="Sign Out"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-500 flex items-center justify-center transition cursor-pointer text-xs"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </header>
  );
};
