import { api } from './api';
import {
  Booking,
  BookingCreatePayload,
  BookingDecisionPayload,
  BookingCheckPayload
} from '../types/booking';

export const bookingService = {
  async createBooking(payload: BookingCreatePayload): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', payload);
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my');
    return response.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async decideBooking(id: string, payload: BookingDecisionPayload): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/decision`, payload);
    return response.data;
  },

  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  async checkIn(id: string, payload: BookingCheckPayload): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${id}/check-in`, payload);
    return response.data;
  },

  async checkOut(id: string, payload: BookingCheckPayload): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${id}/check-out`, payload);
    return response.data;
  },
};
