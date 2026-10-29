import React from 'react';
import { Search } from 'lucide-react';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by keywords, equipment model, or location..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#101218] pl-11 pr-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 transition shadow-inner"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c === 'All' ? '' : c)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              (c === 'All' && !selectedCategory) || selectedCategory === c
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                : 'bg-[#101218] text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResourceFilters;
