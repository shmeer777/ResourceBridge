import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const Navbar: React.FC = () => {
  return (
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
  );
};

export default Navbar;
