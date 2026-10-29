import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  Layers,
  LogOut,
  PlusCircle,
  Settings,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';

export const ProviderLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login/provider');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="site-shell min-h-screen bg-[#08090D] text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#08090D]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/provider" className="brand flex items-center gap-3">
              <span className="brand-mark">R</span>
              <span className="font-bold text-lg tracking-tight">ResourceBridge</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/provider" end className={navItemClass}>
                <Layers size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/provider/resources" className={navItemClass}>
                <Building2 size={16} />
                My Resources
              </NavLink>
              <NavLink to="/provider/availability" className={navItemClass}>
                <Clock size={16} />
                Availability
              </NavLink>
              <NavLink to="/provider/bookings" className={navItemClass}>
                <Calendar size={16} />
                Booking Requests
              </NavLink>
              <NavLink to="/provider/messages" className={navItemClass}>
                <MessageSquare size={16} />
                Messages
              </NavLink>
              <NavLink to="/provider/reports" className={navItemClass}>
                <ClipboardList size={16} />
                Condition Reports
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/provider/resources/new"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-slate-950 hover:brightness-110 transition shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <PlusCircle size={15} />
              Add Resource
            </Link>

            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user?.full_name}</div>
                <div className="text-xs text-cyan-400 font-mono">
                  {user?.organization_name || 'Provider Account'}
                </div>
              </div>

              <ThemeToggle showLabel={false} />

              <NavLink
                to="/provider/settings"
                title="Account Settings"
                className={({ isActive }) =>
                  `p-2 rounded-xl transition ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Settings size={18} />
              </NavLink>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default ProviderLayout;
