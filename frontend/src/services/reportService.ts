import { api } from './api';
import { ConditionReport, ConditionReportCreatePayload, Incident } from '../types/report';

export const reportService = {
  async submitConditionReport(payload: ConditionReportCreatePayload): Promise<ConditionReport> {
    const response = await api.post<ConditionReport>('/reports/condition', payload);
    return response.data;
  },

  async getConditionReports(params?: { resource_id?: string; booking_id?: string }): Promise<ConditionReport[]> {
    const response = await api.get<ConditionReport[]>('/reports/condition', { params });
    return response.data;
  },

  async reportIncident(payload: {
    resource_id: string;
    booking_id?: string;
    severity: string;
    description: string;
  }): Promise<Incident> {
    const response = await api.post<Incident>('/reports/incidents', payload);
    return response.data;
  },
};
