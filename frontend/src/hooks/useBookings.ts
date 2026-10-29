import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { Booking, BookingCreatePayload } from '../types/booking';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (payload: BookingCreatePayload) => {
    const newBooking = await bookingService.createBooking(payload);
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = async (id: string) => {
    const updated = await bookingService.cancelBooking(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchBookings,
    createBooking,
    cancelBooking,
  };
}
