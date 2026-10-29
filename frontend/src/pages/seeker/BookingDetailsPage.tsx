import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { Booking } from '../../types/booking';
import BookingConversationThread from '../../components/messaging/BookingConversationThread';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const backLink = user?.role === 'provider' ? '/provider/bookings' : '/seeker/bookings';

  const loadBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await bookingService.decideBooking(id, {
        decision,
        rejection_reason: decision === 'reject' ? rejectReason : undefined
      });
      setRejecting(false);
      setRejectReason('');
      await loadBooking();
    } catch (err: any) {
      setError(err.message || 'Failed to process booking decision.');
    } finally {
      setActionLoading(false);
    }
  };

  const scrollToChat = () => {
    const chatEl = document.getElementById('conversation-section');
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
          {error || 'Booking not found'}
        </div>
        <Link to={backLink} className="text-cyan-400 text-sm hover:underline">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={backLink}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </Link>

      <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 sm:p-9 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
            {booking.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-500">ID: {booking.id.substring(0, 8)}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">{booking.resource_title}</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin size={13} className="text-cyan-400" />
            {booking.resource_location}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Scheduled Time:</span>
            <span className="font-mono text-cyan-300">
              {new Date(booking.start_time).toLocaleString()} → {new Date(booking.end_time).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Requested On:</span>
            <span>{new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {booking.seeker_name && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs">
            <span className="text-slate-400 block font-semibold mb-1">Applicant:</span>
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="text-white font-medium">{booking.seeker_name}</span>
            </div>
            {booking.seeker_email && (
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">{booking.seeker_email}</span>
              </div>
            )}
            {booking.seeker_organization && (
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="text-slate-300">{booking.seeker_organization}</span>
              </div>
            )}
          </div>
        )}

        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase mb-2">Project Purpose:</span>
          <p className="p-4 rounded-xl bg-[#08090D] border border-white/5 text-sm text-slate-200 leading-relaxed">
            {booking.purpose}
          </p>
        </div>

        {booking.rejection_reason && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/30 text-xs text-red-200">
            <span className="font-bold text-red-400 block mb-1">Rejection Reason:</span>
            <p>{booking.rejection_reason}</p>
          </div>
        )}

        {/* Provider Decision Actions (Accept / Reject / Message Seeker) */}
        {user?.role === 'provider' && booking.status === 'pending' && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            {rejecting ? (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/30 space-y-3">
                <span className="text-xs font-semibold text-red-400 block">Provide a reason for rejection (optional):</span>
                <input
                  type="text"
                  placeholder="e.g., Equipment undergoing maintenance / Conflict with scheduled lab..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#08090D] border border-white/10 text-xs text-white outline-none focus:border-red-400"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setRejecting(false)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDecision('reject')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-3">
                {/* Action 1: Message Seeker */}
                <button
                  onClick={scrollToChat}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                >
                  <MessageSquare size={15} />
                  Message Seeker
                </button>

                {/* Action 2: Reject Booking */}
                <button
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition"
                >
                  <XCircle size={15} />
                  Reject Booking
                </button>

                {/* Action 3: Accept Booking */}
                <button
                  onClick={() => handleDecision('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                >
                  <CheckCircle2 size={15} />
                  Accept Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Live Conversation Thread */}
      <div id="conversation-section" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-cyan-400" />
              Booking Inquiry & Messages
            </h2>
            <p className="text-xs text-slate-400">
              Private coordination channel for this booking request.
            </p>
          </div>
        </div>

        <BookingConversationThread
          bookingId={booking.id}
          resourceTitle={booking.resource_title || 'Resource'}
          bookingStatus={booking.status}
          participantName={user?.role === 'provider' ? (booking.seeker_name || 'Seeker') : 'Resource Provider'}
          participantRole={user?.role === 'provider' ? 'seeker' : 'provider'}
          participantOrg={user?.role === 'provider' ? (booking.seeker_organization || undefined) : undefined}
        />
      </div>
    </div>
  );
};

export default BookingDetailsPage;
