import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer border-t border-white/5 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="brand-mark w-6 h-6 text-xs">R</span>
          <span className="font-semibold text-slate-300">ResourceBridge</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
          <Link to="/role-selection" className="hover:text-white transition">Get Started</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
