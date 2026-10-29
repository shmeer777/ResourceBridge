import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';

export const CheckInOutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [conditionRating, setConditionRating] = useState<'excellent' | 'good' | 'fair' | 'damaged'>('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setError('');
    setSubmitting(true);

    try {
      if (booking.status === 'checked_in') {
        // Perform Check-Out
        await bookingService.checkOut(booking.id, {
          condition_rating: conditionRating,
          notes: notes || 'Checked out successfully with normal wear.',
        });
      } else {
        // Perform Check-In
        await bookingService.checkIn(booking.id, {
          condition_rating: conditionRating,
          notes: notes || 'Checked in and equipment verified intact.',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/seeker/bookings');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
        <Link to="/seeker/bookings" className="text-cyan-400 text-sm hover:underline">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const isCheckOut = booking?.status === 'checked_in';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/seeker/bookings"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </Link>

      <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 sm:p-9 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <span className="eyebrow">
              {isCheckOut ? 'Step 2: Check-Out & Return' : 'Step 1: Check-In & Inspection'}
            </span>
            <h1 className="text-2xl font-bold text-white">
              {isCheckOut ? 'Resource Check-Out' : 'Resource Check-In'}
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Target Resource:</span>
            <span className="font-semibold text-white">{booking?.resource_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location:</span>
            <span>{booking?.resource_location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reserved Window:</span>
            <span className="font-mono text-cyan-300">
              {booking && new Date(booking.start_time).toLocaleString()}
            </span>
          </div>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h3 className="font-bold text-base">
              {isCheckOut ? 'Check-Out Completed!' : 'Check-In Recorded!'}
            </h3>
            <p className="text-xs text-emerald-300">
              Condition log saved. Redirecting to bookings dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Current Condition Rating *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['excellent', 'good', 'fair', 'damaged'] as const).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setConditionRating(rating)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      conditionRating === rating
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'border-white/10 bg-[#08090D] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Condition Notes & Inspection Observations
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isCheckOut
                    ? 'Note equipment status after your session. Any wear, residue, or bit changes?'
                    : 'Note any pre-existing scratches, cleanliness, or operational findings before beginning...'
                }
                className="w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-70 shadow-[0_0_15px_rgba(34,211,238,0.25)] text-sm"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting
                ? 'Submitting...'
                : isCheckOut
                ? 'Complete Check-Out & Return'
                : 'Confirm Check-In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckInOutPage;
