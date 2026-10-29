import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => {
  return (
    <aside className="w-64 border-r border-white/10 bg-[#101218] p-4 flex flex-col gap-2">
      {title && <h4 className="text-xs font-semibold uppercase text-slate-500 px-3 mb-2">{title}</h4>}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
