import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, PlusCircle, Trash2, Edit, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { Resource } from '../../types/resource';

export const MyResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getMyResources();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await resourceService.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="eyebrow">Inventory Management</span>
          <h1 className="text-3xl font-bold tracking-tight">My Shared Resources</h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain your equipment, workspaces, and lab facilities available for booking.
          </p>
        </div>
        <Link to="/provider/resources/new" className="btn btn-primary text-sm py-2.5 px-4 self-start sm:self-auto">
          <PlusCircle size={16} />
          Add Resource
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-12 text-center space-y-4">
          <Building2 size={40} className="mx-auto text-slate-600" />
          <h3 className="text-lg font-semibold text-white">No resources listed yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Put your idle equipment or unused facilities to work by creating your first listing.
          </p>
          <Link to="/provider/resources/new" className="btn btn-primary text-xs py-2 px-5 inline-flex">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-4 flex flex-col justify-between hover:border-cyan-400/30 transition shadow-lg"
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

                <h3 className="text-lg font-bold text-white line-clamp-1">{r.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{r.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-cyan-400 shrink-0" />
                    <span>Capacity: {r.capacity} person(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-cyan-400 shrink-0" />
                    <span>Rate: {r.hourly_rate > 0 ? `$${r.hourly_rate} / hour` : 'Free / Community'}</span>
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
                  Added {new Date(r.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/provider/resources/edit/${r.id}`}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition"
                    title="Edit resource"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id, r.title)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResourcesPage;
