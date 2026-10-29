import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Filter, Compass, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { Resource } from '../../types/resource';

export const ExploreResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'All',
    'Equipment',
    'Workspace',
    'Lab Facility',
    'Tools & Machinery',
    'High Performance Computing',
    'Vehicle & Transport',
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getResources({
        search: search || undefined,
        category: selectedCategory === 'All' || !selectedCategory ? undefined : selectedCategory,
      });
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/10">
        <span className="eyebrow">Public Inventory</span>
        <h1 className="text-3xl font-bold tracking-tight">Explore Shared Resources</h1>
        <p className="text-sm text-slate-400 mt-1">
          Search specialized lab equipment, prototyping tools, and technical spaces available for reservation.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by keywords, equipment model, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#101218] pl-11 pr-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 transition shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c === 'All' ? '' : c)}
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

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-12 text-center text-slate-400 space-y-2">
          <Compass size={36} className="mx-auto text-slate-600" />
          <p>No resources found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-4 flex flex-col justify-between hover:border-cyan-400/40 transition shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    {r.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono capitalize">
                    {r.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {r.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-cyan-400 shrink-0" />
                    <span>Rate: {r.hourly_rate > 0 ? `$${r.hourly_rate} / hour` : 'Free to share'}</span>
                  </div>
                </div>

                {r.eligibility_criteria && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-200">
                    <span className="font-semibold text-cyan-400">Eligibility: </span>
                    {r.eligibility_criteria}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {r.organization_name || r.owner_name || 'Verified Provider'}
                </span>
                <Link
                  to={`/seeker/resources/${r.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold hover:brightness-110 transition shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                >
                  Request Booking →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreResourcesPage;
