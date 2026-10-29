import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Filter, MessageSquare } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';
import BookingConversationModal from '../../components/messaging/BookingConversationModal';

export const ProviderBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
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

  const handleDecision = async (id: string, decision: 'approve' | 'reject', reason?: string) => {
    setError('');
    try {
      await bookingService.decideBooking(id, { decision, rejection_reason: reason });
      setRejectingId(null);
      setRejectReason('');
      await loadBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status.');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filterStatus === 'all' ? true : b.status === filterStatus
  );

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
          <span className="eyebrow">Reservations & Access</span>
          <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review seeker requests, grant access, and monitor reservation statuses.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'pending', 'approved', 'checked_in', 'completed', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {st.replace('_', ' ')}
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

      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-12 text-center text-slate-400 space-y-2">
          <Calendar size={36} className="mx-auto text-slate-600" />
          <p>No bookings found for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-6 space-y-4 transition hover:border-white/20 shadow-lg"
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
                    to={`/provider/bookings/${b.id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {b.id.substring(0, 8)}...
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">Applicant:</span>{' '}
                    <span className="font-semibold text-white">{b.seeker_name}</span> (
                    {b.seeker_email})
                  </div>
                  {b.seeker_organization && (
                    <div>
                      <span className="text-slate-500">Organization:</span>{' '}
                      {b.seeker_organization}
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Requested slot:</span>{' '}
                    <span className="font-mono text-cyan-300">
                      {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-slate-400 font-semibold block mb-1">Stated Purpose:</span>
                  <p className="text-slate-200">{b.purpose}</p>
                </div>
              </div>

              {b.rejection_reason && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/30 text-xs text-red-200">
                  <span className="font-semibold text-red-400">Rejection Reason: </span>
                  {b.rejection_reason}
                </div>
              )}

              {b.status === 'pending' ? (
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-end gap-3">
                  {rejectingId === b.id ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#08090D] border border-white/10 text-xs text-white outline-none focus:border-red-400"
                      />
                      <button
                        onClick={() => handleDecision(b.id, 'reject', rejectReason)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 1. Message Seeker */}
                      <button
                        onClick={() => setActiveChatBooking(b)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                      >
                        <MessageSquare size={15} />
                        Message Seeker
                      </button>

                      {/* 2. Reject Booking */}
                      <button
                        onClick={() => setRejectingId(b.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition"
                      >
                        <XCircle size={15} />
                        Reject Booking
                      </button>

                      {/* 3. Accept Booking */}
                      <button
                        onClick={() => handleDecision(b.id, 'approve')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      >
                        <CheckCircle2 size={15} />
                        Accept Booking
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-white/5 flex items-center justify-end">
                  <button
                    onClick={() => setActiveChatBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition"
                  >
                    <MessageSquare size={14} />
                    Conversation History
                  </button>
                </div>
              )}
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
          participantName={activeChatBooking.seeker_name || 'Seeker'}
          participantRole="seeker"
          participantOrg={activeChatBooking.seeker_organization || undefined}
        />
      )}
    </div>
  );
};

export default ProviderBookingsPage;
