import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { Booking } from '../../types/booking';
import { BookingStatus } from './BookingStatus';
import { formatDateTime } from '../../utils/formatDate';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, showActions = true }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-4 shadow-lg transition hover:border-white/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <BookingStatus status={booking.status} />
          <h3 className="text-base font-bold text-white">{booking.resource_title || 'Resource'}</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {new Date(booking.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-cyan-400 shrink-0" />
          <span>{booking.resource_location || 'Campus / Workshop'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-cyan-400 shrink-0" />
          <span className="font-mono text-cyan-300">
            {formatDateTime(booking.start_time)} → {formatDateTime(booking.end_time)}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
        <span className="text-slate-400 font-semibold block mb-0.5">Purpose:</span>
        <p>{booking.purpose}</p>
      </div>

      {showActions && (
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <Link
            to={`/seeker/bookings/${booking.id}`}
            className="text-xs text-cyan-400 hover:underline"
          >
            Details
          </Link>
          {booking.status === 'pending' && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="text-xs text-slate-400 hover:text-red-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
