import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  XCircle,
  AlertCircle,
  MapPin,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import BookingConversationModal from '../../components/messaging/BookingConversationModal';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(id);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'checked_in':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'completed':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'cancelled':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
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
          <span className="eyebrow">Reservations & History</span>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track status, review provider approvals, and perform check-ins.
          </p>
        </div>
        <Link to="/seeker/explore" className="btn btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          Find More Resources
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-12 text-center text-slate-400 space-y-3">
          <Calendar size={40} className="mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-white">No bookings yet</h3>
          <p className="text-sm max-w-sm mx-auto">
            Explore shared resources and submit your first reservation request.
          </p>
          <Link to="/seeker/explore" className="btn btn-primary text-xs py-2 px-5 inline-flex">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-6 space-y-4 shadow-lg transition hover:border-white/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(
                      b.status
                    )}`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white">{b.resource_title || 'Resource'}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/seeker/bookings/${b.id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                  <div className="text-xs text-slate-500 font-mono">
                    Requested {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                    <span>{b.resource_location || 'Campus / Workshop'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Scheduled slot:</span>{' '}
                    <span className="font-mono text-cyan-300">
                      {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Your Project Purpose:</span>
                  <p className="text-slate-200">{b.purpose}</p>
                </div>
              </div>

              {b.rejection_reason && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/30 text-xs text-red-200">
                  <span className="font-semibold text-red-400">Provider Note: </span>
                  {b.rejection_reason}
                </div>
              )}

              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {b.checked_in_at && `Checked in: ${new Date(b.checked_in_at).toLocaleTimeString()}`}
                  {b.checked_out_at && ` • Completed: ${new Date(b.checked_out_at).toLocaleTimeString()}`}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveChatBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
                  >
                    <MessageSquare size={14} />
                    Message Provider
                  </button>

                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-white/5 transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {(b.status === 'approved' || b.status === 'checked_in') && (
                    <Link
                      to={`/seeker/check-in/${b.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:brightness-110 transition shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                    >
                      <ClipboardCheck size={15} />
                      {b.status === 'checked_in' ? 'Perform Check-Out' : 'Perform Check-In'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {activeChatBooking && (
        <BookingConversationModal
          isOpen={!!activeChatBooking}
          onClose={() => setActiveChatBooking(null)}
          bookingId={activeChatBooking.id}
          resourceTitle={activeChatBooking.resource_title || 'Resource'}
          bookingStatus={activeChatBooking.status}
          participantName="Resource Provider"
          participantRole="provider"
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
