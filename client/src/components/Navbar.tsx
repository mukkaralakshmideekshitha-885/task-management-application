import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  CheckSquare,
  LogOut,
  Plus,
  Radio,
  User as UserIcon,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Pro
                </span>
              </div>
            </div>
          </div>

          {/* Realtime Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200/80">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>{isConnected ? 'Real-Time Sync Active' : 'Connecting to Server...'}</span>
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                <div className="flex items-center gap-1">
                  {user?.role === 'ADMIN' && <Shield className="w-2.5 h-2.5 text-indigo-600" />}
                  <span className="text-[10px] text-slate-500 capitalize">{user?.role?.toLowerCase()}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="p-2 text-white bg-indigo-600 rounded-lg shadow-sm"
              aria-label="Create Task"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                <Radio className="w-3 h-3" />
                {isConnected ? 'Syncing' : 'Offline'}
              </span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
