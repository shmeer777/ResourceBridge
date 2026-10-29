import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  Inbox,
  ArrowLeft,
  Compass
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { ConversationSummary } from '../../types/message';
import BookingConversationThread from '../../components/messaging/BookingConversationThread';

export const SeekerMessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedBookingId) {
        // Pre-select conversation from query param or the first one
        const queryBooking = searchParams.get('bookingId');
        if (queryBooking && data.some((c) => c.booking_id === queryBooking)) {
          setSelectedBookingId(queryBooking);
        } else {
          setSelectedBookingId(data[0].booking_id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectedConversation = conversations.find((c) => c.booking_id === selectedBookingId);

  const formatTimestamp = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="eyebrow">Direct Coordination</span>
          <h1 className="text-3xl font-bold tracking-tight">Booking Inquiries & Messages</h1>
          <p className="text-sm text-slate-400 mt-1">
            Exchange questions, technical specifications, and scheduling details with resource providers.
          </p>
        </div>
        <Link to="/seeker/bookings" className="btn btn-quiet text-xs self-start sm:self-auto flex items-center gap-2">
          <Calendar size={14} />
          View All Bookings
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center space-y-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-[#101218]/50 p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Inbox size={28} />
          </div>
          <h3 className="text-lg font-bold text-white">No Conversations Yet</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            When you request a resource or inquire with a provider, your conversation thread will appear here.
          </p>
          <Link to="/seeker/explore" className="btn btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2">
            <Compass size={15} />
            Explore Resources
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
          {/* Conversation List Sidebar */}
          <div className="lg:col-span-5 flex flex-col space-y-2">
            <div className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Conversations ({conversations.length})</span>
              <span className="text-[10px] text-cyan-400 font-normal">Auto-syncing</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
              {conversations.map((c) => {
                const isSelected = c.booking_id === selectedBookingId;

                return (
                  <div
                    key={c.booking_id}
                    onClick={() => setSelectedBookingId(c.booking_id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left relative ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                        : 'bg-[#101218] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                        {c.resource_title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full shrink-0 ${
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

                    <div className="text-xs text-slate-400 mb-2 truncate">
                      Provider: <span className="text-slate-200">{c.provider_name}</span>
                    </div>

                    {c.last_message_content ? (
                      <p className="text-xs text-slate-400 line-clamp-1 italic bg-black/20 p-2 rounded-lg border border-white/5">
                        "{c.last_message_content}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No messages yet. Click to send an inquiry.</p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500">
                      <span>{c.last_message_at ? formatTimestamp(c.last_message_at) : 'Awaiting inquiry'}</span>
                      {c.unread_count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold">
                          {c.unread_count} new
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Detail Thread */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between px-1">
                  <Link
                    to={`/seeker/bookings/${selectedConversation.booking_id}`}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft size={13} />
                    View Booking Details & Status
                  </Link>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: #{selectedConversation.booking_id.substring(0, 8)}
                  </span>
                </div>

                <div className="h-[520px]">
                  <BookingConversationThread
                    key={selectedConversation.booking_id}
                    bookingId={selectedConversation.booking_id}
                    resourceTitle={selectedConversation.resource_title}
                    bookingStatus={selectedConversation.booking_status}
                    participantName={selectedConversation.provider_name}
                    participantRole="provider"
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 rounded-2xl border border-white/10 bg-[#101218]">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerMessagesPage;
