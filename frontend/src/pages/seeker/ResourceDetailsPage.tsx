import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import { Resource } from '../../types/resource';

export const ResourceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadResource() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getResourceById(id);
        setResource(data);

        // Prepopulate dates with tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        setStartDate(dateStr);
        setEndDate(dateStr);
      } catch (err: any) {
        setError(err.message || 'Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBookingError('');
    setBookingLoading(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${endDate}T${endTime}:00`);

      if (startDateTime >= endDateTime) {
        throw new Error('Start time must be before end time.');
      }

      await bookingService.createBooking({
        resource_id: id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        purpose,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/seeker/bookings');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error || 'Resource not found'}
        </div>
        <Link to="/seeker/explore" className="text-cyan-400 text-sm hover:underline">
          ← Back to resources
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60';

  return (
    <div className="space-y-6">
      <Link
        to="/seeker/explore"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft size={16} />
        Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Resource Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 sm:p-9 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                {resource.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono capitalize">
                {resource.status}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{resource.title}</h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin size={13} className="text-cyan-400" /> Location
                </span>
                <p className="text-sm font-medium text-white">{resource.location}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Users size={13} className="text-cyan-400" /> Capacity
                </span>
                <p className="text-sm font-medium text-white">{resource.capacity} person(s)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <DollarSign size={13} className="text-cyan-400" /> Usage Rate
                </span>
                <p className="text-sm font-medium text-white">
                  {resource.hourly_rate > 0 ? `$${resource.hourly_rate} / hr` : 'Free / Shared'}
                </p>
              </div>
            </div>

            {/* Rules & Eligibility */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-400" />
                Access & Safety Rules
              </h3>

              <div className="rounded-2xl bg-cyan-950/20 border border-cyan-800/30 p-4 space-y-3 text-xs leading-relaxed text-slate-300">
                <div>
                  <span className="font-bold text-cyan-300 block mb-1">Eligibility Criteria:</span>
                  <p>{resource.eligibility_criteria || 'Open to all authenticated community members.'}</p>
                </div>
                {resource.rules && (
                  <div className="pt-2 border-t border-cyan-800/30">
                    <span className="font-bold text-cyan-300 block mb-1">Facility Rules:</span>
                    <p>{resource.rules}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-xs text-slate-500 flex items-center justify-between">
              <span>Managed by {resource.organization_name || resource.owner_name || 'Provider'}</span>
              <span>Listed {new Date(resource.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 shadow-xl sticky top-24">
            <div className="mb-4 flex items-center gap-2 text-cyan-400 font-bold text-lg">
              <Calendar size={20} />
              Request Reservation
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Select your intended reservation window and explain your project needs.
            </p>

            {bookingSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <h4 className="font-bold text-sm">Request Submitted!</h4>
                <p className="text-xs text-emerald-300">
                  Redirecting to your bookings dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Intended Project Purpose *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your research or project objectives..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-70 mt-2 shadow-[0_0_15px_rgba(34,211,238,0.25)] text-sm"
                >
                  {bookingLoading && <Loader2 size={16} className="animate-spin" />}
                  {bookingLoading ? 'Submitting request...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;
