export interface Resource {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image_url?: string | null;
  capacity: number;
  hourly_rate: number;
  eligibility_criteria?: string | null;
  rules?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name?: string | null;
  organization_name?: string | null;
}

export interface ResourceCreatePayload {
  title: string;
  description: string;
  category: string;
  location: string;
  image_url?: string;
  capacity?: number;
  hourly_rate?: number;
  eligibility_criteria?: string;
  rules?: string;
  status?: string;
}

export interface ResourceUpdatePayload {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  image_url?: string;
  capacity?: number;
  hourly_rate?: number;
  eligibility_criteria?: string;
  rules?: string;
  status?: string;
}

export interface AvailabilitySlot {
  id: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}
