import { api } from './api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  saveSession(auth: AuthResponse) {
    localStorage.setItem('rb_token', auth.access_token);
    localStorage.setItem('rb_user', JSON.stringify(auth.user));
  },

  clearSession() {
    localStorage.removeItem('rb_token');
    localStorage.removeItem('rb_user');
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('rb_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('rb_token');
  },
};
