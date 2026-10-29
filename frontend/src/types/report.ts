export interface ConditionReport {
  id: string;
  booking_id?: string | null;
  resource_id: string;
  reporter_id: string;
  reporter_name?: string | null;
  report_type: 'check_in' | 'check_out' | 'incident' | 'general';
  condition_rating: 'excellent' | 'good' | 'fair' | 'damaged';
  notes: string;
  image_url?: string | null;
  created_at: string;
}

export interface ConditionReportCreatePayload {
  booking_id?: string;
  resource_id: string;
  report_type: 'check_in' | 'check_out' | 'incident' | 'general';
  condition_rating: 'excellent' | 'good' | 'fair' | 'damaged';
  notes: string;
  image_url?: string;
}

export interface Incident {
  id: string;
  booking_id?: string | null;
  resource_id: string;
  reporter_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
}
