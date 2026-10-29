export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'checked_in'
  | 'completed';

export interface Booking {
  id: string;
  resource_id: string;
  seeker_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: BookingStatus;
  rejection_reason?: string | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  created_at: string;
  updated_at: string;
  resource_title?: string | null;
  resource_location?: string | null;
  resource_category?: string | null;
  seeker_name?: string | null;
  seeker_email?: string | null;
  seeker_organization?: string | null;
}

export interface BookingCreatePayload {
  resource_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
}

export interface BookingDecisionPayload {
  decision: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface BookingCheckPayload {
  notes?: string;
  condition_rating?: 'excellent' | 'good' | 'fair' | 'damaged';
  image_url?: string;
}
