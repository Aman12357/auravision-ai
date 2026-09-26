import api from '@/lib/api';

export const workspaceApi = {
  getWorkspaces: () => api.get('/api/v1/workspaces'),
  createWorkspace: (data: { name: string; description?: string }) => api.post('/api/v1/workspaces', data),
  getMembers: (workspaceId: string) => api.get(`/api/v1/workspaces/${workspaceId}/members`),
  inviteMember: (workspaceId: string, data: { email: string; role: string }) => api.post(`/api/v1/workspaces/${workspaceId}/invites`, data),
  getCreditBalance: (workspaceId: string) => api.get(`/api/v1/workspaces/${workspaceId}/credits`),
  getTransactions: (workspaceId: string, params?: object) => api.get(`/api/v1/workspaces/${workspaceId}/transactions`, { params }),
  getNotifications: (params?: object) => api.get('/api/v1/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/api/v1/notifications/${id}/read`),
  getUnreadCount: () => api.get('/api/v1/notifications/unread-count')
};
