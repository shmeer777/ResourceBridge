import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import { Resource } from '../../types/resource';
import { Booking } from '../../types/booking';

export const ProviderDashboard: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resData, bookData] = await Promise.all([
        resourceService.getMyResources(),
        bookingService.getMyBookings(),
      ]);
      setResources(resData);
      setBookings(bookData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (bookingId: string, decision: 'approve' | 'reject') => {
    setActionError('');
    try {
      await bookingService.decideBooking(bookingId, { decision });
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update booking decision.');
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'checked_in');

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="eyebrow">Provider Workspace</span>
          <h1 className="text-3xl font-bold tracking-tight">Overview & Requests</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your shared resources and approve incoming access requests.
          </p>
        </div>
        <Link
          to="/provider/resources/new"
          className="btn btn-primary self-start sm:self-auto text-sm py-2.5 px-4"
        >
          <PlusCircle size={16} />
          Create New Listing
        </Link>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {actionError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Active Resources</span>
            <Building2 size={20} className="text-cyan-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">{resources.length}</div>
          <p className="mt-1 text-xs text-slate-500">Available for public discovery</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Pending Requests</span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-300">{pendingBookings.length}</div>
          <p className="mt-1 text-xs text-slate-500">Awaiting your approval</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Confirmed / In-Use</span>
            <Calendar size={20} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-300">{activeBookings.length}</div>
          <p className="mt-1 text-xs text-slate-500">Scheduled or in session</p>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Pending Booking Requests
          </h2>
          <Link
            to="/provider/bookings"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View all bookings <ArrowRight size={14} />
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-8 text-center text-slate-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-600" />
            <p>No pending booking requests at this time.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-[#101218] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-white/20"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      Pending Approval
                    </span>
                    <span className="text-xs text-slate-500">
                      Requested {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {b.resource_title || 'Resource'}
                  </h3>
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-slate-400">Seeker:</span>{' '}
                    {b.seeker_name} ({b.seeker_email})
                    {b.seeker_organization && ` • ${b.seeker_organization}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-300">Time window:</span>{' '}
                    {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                  </p>
                  <div className="p-3 mt-2 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
                    <span className="text-slate-400 font-medium">Purpose: </span>
                    {b.purpose}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleDecision(b.id, 'reject')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision(b.id, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  >
                    <CheckCircle2 size={15} />
                    Approve Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Resources Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 size={18} className="text-cyan-400" />
            Your Shared Resources
          </h2>
          <Link
            to="/provider/resources"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Manage all ({resources.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#101218]/40 p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">You haven't listed any resources yet.</p>
            <Link to="/provider/resources/new" className="btn btn-primary text-xs py-2 px-4 inline-flex">
              List your first resource
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-medium">
                      {r.category}
                    </span>
                    <span className="capitalize text-emerald-400 font-mono">{r.status}</span>
                  </div>
                  <h3 className="font-bold text-white text-base line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{r.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>{r.location}</span>
                  <span className="font-semibold text-white">
                    {r.hourly_rate > 0 ? `$${r.hourly_rate}/hr` : 'Free to share'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
