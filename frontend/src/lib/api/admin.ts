import axios from 'axios';

export const adminApi = {
  getDashboard: async () => {
    const { data } = await axios.get('/api/v1/admin/dashboard');
    return data;
  },
  getUsers: async (params?: Record<string, any>) => {
    const { data } = await axios.get('/api/v1/admin/users', { params });
    return data;
  },
  lockUser: async (id: string) => {
    const { data } = await axios.put(`/api/v1/admin/users/${id}/lock`);
    return data;
  },
  unlockUser: async (id: string) => {
    const { data } = await axios.put(`/api/v1/admin/users/${id}/unlock`);
    return data;
  },
  getProviders: async () => {
    const { data } = await axios.get('/api/v1/admin/providers');
    return data;
  },
  toggleProvider: async (name: string, enabled: boolean) => {
    const { data } = await axios.put(`/api/v1/admin/providers/${name}/toggle`, { enabled });
    return data;
  },
  getAuditLogs: async (params?: Record<string, any>) => {
    const { data } = await axios.get('/api/v1/admin/audit-logs', { params });
    return data;
  },
  getMetrics: async () => {
    const { data } = await axios.get('/api/v1/admin/metrics');
    return data;
  },
  getAnalytics: async (days: number) => {
    const { data } = await axios.get('/api/v1/analytics/workspace', { params: { days } });
    return data;
  },
};
