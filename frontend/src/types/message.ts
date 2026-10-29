export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'provider' | 'seeker' | string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageCreatePayload {
  content: string;
}

export interface ConversationSummary {
  booking_id: string;
  resource_id: string;
  resource_title: string;
  seeker_id: string;
  seeker_name: string;
  seeker_email: string;
  provider_id: string;
  provider_name: string;
  booking_status: string;
  booking_start_time: string;
  booking_end_time: string;
  last_message_content?: string | null;
  last_message_at?: string | null;
  last_message_sender_role?: string | null;
  unread_count: number;
  total_messages: number;
}
