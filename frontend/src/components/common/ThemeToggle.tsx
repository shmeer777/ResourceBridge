import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`theme-toggle inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border select-none ${
        theme === 'dark'
          ? 'bg-white/5 border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/10'
          : 'bg-white border-slate-300 text-slate-700 hover:text-cyan-700 hover:border-cyan-500 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Moon size={15} className="text-cyan-400" />
          {showLabel && <span className="hidden sm:inline">Dark</span>}
        </>
      ) : (
        <>
          <Sun size={15} className="text-amber-500" />
          {showLabel && <span className="hidden sm:inline text-slate-800">Light</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

