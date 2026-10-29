import { api } from './api';
import {
  Resource,
  ResourceCreatePayload,
  ResourceUpdatePayload,
  AvailabilitySlot
} from '../types/resource';

export interface ResourceFilterParams {
  category?: string;
  location?: string;
  search?: string;
  status?: string;
  owner_id?: string;
}

export const resourceService = {
  async getResources(filters?: ResourceFilterParams): Promise<Resource[]> {
    const response = await api.get<Resource[]>('/resources', { params: filters });
    return response.data;
  },

  async getMyResources(): Promise<Resource[]> {
    const response = await api.get<Resource[]>('/resources/my');
    return response.data;
  },

  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  async createResource(payload: ResourceCreatePayload): Promise<Resource> {
    const response = await api.post<Resource>('/resources', payload);
    return response.data;
  },

  async updateResource(id: string, payload: ResourceUpdatePayload): Promise<Resource> {
    const response = await api.patch<Resource>(`/resources/${id}`, payload);
    return response.data;
  },

  async deleteResource(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/resources/${id}`);
    return response.data;
  },

  async getAvailability(resourceId: string): Promise<AvailabilitySlot[]> {
    const response = await api.get<AvailabilitySlot[]>(`/resources/${resourceId}/availability`);
    return response.data;
  },

  async addAvailability(
    resourceId: string,
    slot: { start_time: string; end_time: string; is_available?: boolean }
  ): Promise<AvailabilitySlot> {
    const response = await api.post<AvailabilitySlot>(`/resources/${resourceId}/availability`, slot);
    return response.data;
  },
};
