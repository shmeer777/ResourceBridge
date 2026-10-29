import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ClipboardCheck,
  Building2,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { resourceService } from '../../services/resourceService';
import { messageService } from '../../services/messageService';
import { Booking } from '../../types/booking';
import { Resource } from '../../types/resource';
import { ConversationSummary } from '../../types/message';

export const SeekerDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bookData, resData, convData] = await Promise.all([
          bookingService.getMyBookings(),
          resourceService.getResources(),
          messageService.getConversations().catch(() => [] as ConversationSummary[]),
        ]);
        setBookings(bookData);
        setFeaturedResources(resData.slice(0, 3));
        setConversations(convData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const approvedBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'checked_in');
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unread_count, 0);

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
          <span className="eyebrow">Seeker Workspace</span>
          <h1 className="text-3xl font-bold tracking-tight">Discover & Book</h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore shared equipment and technical spaces, submit requests, and check in.
          </p>
        </div>
        <Link
          to="/seeker/explore"
          className="btn btn-primary self-start sm:self-auto text-sm py-2.5 px-4"
        >
          <Compass size={16} />
          Browse Resources
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Approved Bookings</span>
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-300">{approvedBookings.length}</div>
          <p className="mt-1 text-xs text-slate-500">Ready for check-in or ongoing</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Pending Requests</span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-300">{pendingBookings.length}</div>
          <p className="mt-1 text-xs text-slate-500">Awaiting provider review</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Messages & Inquiries</span>
            <MessageSquare size={20} className="text-cyan-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white flex items-center gap-2">
            <span>{conversations.length}</span>
            {unreadMessagesCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono">
                {unreadMessagesCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Provider coordination threads</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Total Reservations</span>
            <Calendar size={20} className="text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">{bookings.length}</div>
          <p className="mt-1 text-xs text-slate-500">All-time booking requests</p>
        </div>
      </div>

      {/* Booking Inquiries & Conversations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={18} className="text-cyan-400" />
            Booking Conversations & Inquiries
          </h2>
          <Link
            to="/seeker/messages"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All messages {conversations.length > 0 && `(${conversations.length})`} <ArrowRight size={14} />
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-6 text-center text-slate-400 text-xs">
            No inquiries exchanged yet. Submit a booking request to open direct messaging with providers.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversations.slice(0, 4).map((c) => (
              <div
                key={c.booking_id}
                className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-3 shadow-md hover:border-cyan-400/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white truncate max-w-[220px]">
                      {c.resource_title}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        c.booking_status === 'pending'
                          ? 'bg-amber-400/10 text-amber-300'
                          : c.booking_status === 'approved'
                          ? 'bg-emerald-400/10 text-emerald-300'
                          : 'bg-slate-400/10 text-slate-400'
                      }`}
                    >
                      {c.booking_status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    Provider: <span className="text-slate-300">{c.provider_name}</span>
                  </p>
                  {c.last_message_content ? (
                    <p className="text-xs text-slate-300 mt-2 bg-black/20 p-2 rounded-xl border border-white/5 line-clamp-2 italic">
                      "{c.last_message_content}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-2">No messages yet.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Ref #{c.booking_id.substring(0, 8)}
                  </span>
                  <Link
                    to={`/seeker/messages?bookingId=${c.booking_id}`}
                    className="inline-flex items-center gap-1 text-cyan-400 font-semibold hover:underline"
                  >
                    Open Chat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active & Upcoming Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" />
            Active & Upcoming Reservations
          </h2>
          <Link
            to="/seeker/bookings"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View all bookings <ArrowRight size={14} />
          </Link>
        </div>

        {approvedBookings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-8 text-center text-slate-400">
            <Calendar size={32} className="mx-auto mb-2 text-slate-600" />
            <p>No active reservations at the moment.</p>
            <Link to="/seeker/explore" className="text-cyan-400 text-xs font-semibold hover:underline mt-2 inline-block">
              Explore available equipment & spaces →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {approvedBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-[#101218] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-white/20"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        b.status === 'checked_in'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {b.status === 'checked_in' ? 'Currently Checked In' : 'Confirmed & Approved'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{b.resource_title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={13} className="text-cyan-400" />
                    <span>{b.resource_location || 'Campus / Lab'}</span>
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    <span className="font-medium text-slate-300">Time window:</span>{' '}
                    {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <Link
                    to={`/seeker/check-in/${b.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-slate-950 font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                  >
                    <ClipboardCheck size={15} />
                    {b.status === 'checked_in' ? 'Complete & Check Out' : 'Check In & Inspect'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Resources for Discovery */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Compass size={18} className="text-cyan-400" />
            Discover Technical Resources
          </h2>
          <Link
            to="/seeker/explore"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Explore all listings <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredResources.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-3 flex flex-col justify-between hover:border-cyan-400/40 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-medium">
                    {r.category}
                  </span>
                  <span className="text-emerald-400 font-mono capitalize">{r.status}</span>
                </div>
                <h3 className="font-bold text-white text-base line-clamp-1">{r.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                <span className="truncate">{r.location}</span>
                <Link
                  to={`/seeker/resources/${r.id}`}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
