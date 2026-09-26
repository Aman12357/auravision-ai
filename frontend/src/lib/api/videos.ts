import api from '@/lib/api';
import type { VideoJob, Project, DashboardStats, VideoGenerationRequest, Storyboard } from '@/types/video';

export const videosApi = {
  // Jobs
  submitJob: (workspaceId: string, request: VideoGenerationRequest) => 
    api.post<{ data: VideoJob }>('/api/v1/jobs', request, { headers: { 'X-Workspace-Id': workspaceId } }),
  getJobs: (workspaceId: string, params?: { page?: number; size?: number; status?: string }) =>
    api.get('/api/v1/jobs', { params, headers: { 'X-Workspace-Id': workspaceId } }),
  getJob: (jobId: string) => api.get<{ data: VideoJob }>(`/api/v1/jobs/${jobId}`),
  cancelJob: (jobId: string) => api.put(`/api/v1/jobs/${jobId}/cancel`),
  // Projects
  getProjects: (workspaceId: string, params?: object) =>
    api.get('/api/v1/projects', { params, headers: { 'X-Workspace-Id': workspaceId } }),
  createProject: (workspaceId: string, data: { name: string; description?: string; tags?: string[] }) =>
    api.post('/api/v1/projects', data, { headers: { 'X-Workspace-Id': workspaceId } }),
  getDashboardStats: (workspaceId: string) =>
    api.get<{ data: DashboardStats }>('/api/v1/projects/dashboard-stats', { headers: { 'X-Workspace-Id': workspaceId } }),
  // Storyboards
  createStoryboard: (data: object) => api.post('/api/v1/storyboards', data),
  generateStoryboard: (prompt: string, projectId: string) =>
    api.post('/api/v1/storyboards/generate', { prompt, projectId }),
  // Assets
  getAssets: (workspaceId: string, params?: object) =>
    api.get('/api/v1/assets', { params, headers: { 'X-Workspace-Id': workspaceId } }),
  downloadAsset: (assetId: string) => api.post(`/api/v1/assets/${assetId}/download`),
  deleteAsset: (assetId: string) => api.delete(`/api/v1/assets/${assetId}`),
  // AI
  enhancePrompt: (prompt: string) => api.post<{ data: { enhancedPrompt: string } }>('/api/v1/ai/enhance-prompt', { prompt }),
  estimateCost: (workspaceId: string, request: VideoGenerationRequest) =>
    api.post<{ data: { credits: number } }>('/api/v1/credits/estimate', request, { headers: { 'X-Workspace-Id': workspaceId } }),
};
