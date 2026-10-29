import { api } from './api';
import { User } from '../types/auth';

export interface UserUpdatePayload {
  full_name?: string;
  organization_name?: string;
  password?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(payload: UserUpdatePayload): Promise<User> {
    const response = await api.patch<User>('/users/me', payload);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};
