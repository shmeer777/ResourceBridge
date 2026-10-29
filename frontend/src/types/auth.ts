export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'provider' | 'seeker';
  organization_name?: string | null;
  organization_type?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: 'provider' | 'seeker';
  organization_name?: string;
  organization_type?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: 'provider' | 'seeker';
}
