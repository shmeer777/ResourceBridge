import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Compass,
  Layers,
  LogOut,
  Settings,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';

export const SeekerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login/seeker');
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
            <Link to="/seeker" className="brand flex items-center gap-3">
              <span className="brand-mark">R</span>
              <span className="font-bold text-lg tracking-tight">ResourceBridge</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/seeker" end className={navItemClass}>
                <Layers size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/seeker/explore" className={navItemClass}>
                <Compass size={16} />
                Explore Resources
              </NavLink>
              <NavLink to="/seeker/bookings" className={navItemClass}>
                <Calendar size={16} />
                My Bookings
              </NavLink>
              <NavLink to="/seeker/messages" className={navItemClass}>
                <MessageSquare size={16} />
                Messages
              </NavLink>
              <NavLink to="/seeker/reports" className={navItemClass}>
                <ClipboardList size={16} />
                Usage & Reports
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/seeker/explore"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 transition shadow-[0_0_15px_rgba(34,211,238,0.25)]"
            >
              <Compass size={15} />
              Find Resources
            </Link>

            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user?.full_name}</div>
                <div className="text-xs text-blue-400 font-mono">
                  {user?.organization_name || 'Resource Seeker'}
                </div>
              </div>

              <ThemeToggle showLabel={false} />

              <NavLink
                to="/seeker/settings"
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

export default SeekerLayout;
