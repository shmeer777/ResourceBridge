import React from 'react';
import { getBookingStatusBadge } from '../../utils/statusHelpers';

interface BookingStatusProps {
  status: string;
}

export const BookingStatus: React.FC<BookingStatusProps> = ({ status }) => {
  const badge = getBookingStatusBadge(status);
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
};

export default BookingStatus;
