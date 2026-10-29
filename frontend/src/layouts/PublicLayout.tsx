import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

export const PublicLayout: React.FC = () => {
  return (
    <div className="site-shell min-h-screen bg-[#08090D] text-white">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>
        <nav className="topnav">
          <Link to="/how-it-works">How it works</Link>
          <ThemeToggle />
          <Link to="/role-selection" className="nav-cta">
            Sign in / Join <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="footer max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-slate-500 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="brand-mark w-6 h-6 text-xs">R</span>
          <span>ResourceBridge &copy; {new Date().getFullYear()}</span>
        </div>
        <span>Connecting underutilized equipment with innovators.</span>
      </footer>
    </div>
  );
};

export default PublicLayout;
