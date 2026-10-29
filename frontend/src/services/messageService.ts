import { api } from './api';
import { Message, MessageCreatePayload, ConversationSummary } from '../types/message';

export const messageService = {
  async getMessages(bookingId: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/bookings/${bookingId}/messages`);
    return response.data;
  },

  async sendMessage(bookingId: string, payload: MessageCreatePayload): Promise<Message> {
    const response = await api.post<Message>(`/bookings/${bookingId}/messages`, payload);
    return response.data;
  },

  async getConversations(): Promise<ConversationSummary[]> {
    const response = await api.get<ConversationSummary[]>('/bookings/conversations');
    return response.data;
  },
};
