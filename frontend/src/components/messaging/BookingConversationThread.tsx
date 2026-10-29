import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  CheckCheck
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { Message } from '../../types/message';
import { useAuth } from '../../hooks/useAuth';

interface BookingConversationThreadProps {
  bookingId: string;
  resourceTitle?: string;
  bookingStatus?: string;
  participantName?: string;
  participantRole?: 'provider' | 'seeker' | string;
  participantOrg?: string;
}

export const BookingConversationThread: React.FC<BookingConversationThreadProps> = ({
  bookingId,
  resourceTitle,
  bookingStatus,
  participantName,
  participantRole,
  participantOrg
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const data = await messageService.getMessages(bookingId);
      setMessages(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Optional polling every 10 seconds for real-time conversation updates
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setError('');
    setSending(true);
    try {
      const newMsg = await messageService.sendMessage(bookingId, { content: trimmed });
      setMessages((prev) => [...prev, newMsg]);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#101218] overflow-hidden shadow-2xl transition">
      {/* Conversation Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">
                {participantName || (user?.role === 'provider' ? 'Seeker Inquiry' : 'Provider Coordination')}
              </h3>
              {participantRole && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {participantRole}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {resourceTitle ? `Re: ${resourceTitle}` : `Booking #${bookingId.substring(0, 8)}`}
              {participantOrg ? ` • ${participantOrg}` : ''}
            </p>
          </div>
        </div>

        {bookingStatus && (
          <div className="shrink-0 text-right">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                bookingStatus === 'pending'
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                  : bookingStatus === 'approved'
                  ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                  : 'bg-slate-400/10 text-slate-300 border-slate-400/20'
              }`}
            >
              {bookingStatus.replace('_', ' ')}
            </span>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Ref: #{bookingId.substring(0, 8)}</div>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-[280px] max-h-[460px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
            <Loader2 className="animate-spin text-cyan-400" size={24} />
            <span className="text-xs">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
              <MessageSquare size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">No messages yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Use this private channel to ask questions about eligibility, scheduling, or technical requirements.
                Messaging will not change the booking status.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            const showDateHeader =
              index === 0 ||
              formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at);

            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                    <span className="font-medium text-slate-300">
                      {isMe ? 'You' : msg.sender_name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                      {msg.sender_role}
                    </span>
                    <span>{formatTime(msg.created_at)}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed break-words shadow-md ${
                      isMe
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-sm shadow-[0_2px_12px_rgba(6,182,212,0.2)]'
                        : 'bg-white/10 text-slate-100 rounded-tl-sm border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {isMe && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 px-1">
                      {msg.is_read ? (
                        <>
                          <CheckCheck size={12} className="text-cyan-400" />
                          <span>Read</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} className="text-slate-500" />
                          <span>Sent</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-red-400" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Input Composer */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-white/10 bg-[#08090D] flex items-end gap-3">
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an inquiry or coordination note (Ctrl+Enter to send)..."
          disabled={sending}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:bg-white/[0.08] transition resize-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {sending ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <>
              <span>Send</span>
              <Send size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingConversationThread;
