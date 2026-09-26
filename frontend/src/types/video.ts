export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobType = 'TEXT_TO_VIDEO' | 'IMAGE_TO_VIDEO' | 'VIDEO_TO_VIDEO' | 'UPSCALE' | 'VOICE_OVER' | 'SUBTITLE_GENERATION' | 'MUSIC_GENERATION';
export type AssetType = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'SUBTITLE' | 'THUMBNAIL';
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface VideoAsset {
  id: string;
  assetType: AssetType;
  cdnUrl: string;
  storageKey: string;
  fileSizeBytes: number;
  durationSeconds: number;
  resolution: string;
  format: string;
  downloadCount: number;
  createdAt: string;
}

export interface VideoJob {
  id: string;
  jobType: JobType;
  status: JobStatus;
  progressPercent: number;
  providerUsed: string | null;
  estimatedCostCredits: number;
  actualCostCredits: number | null;
  errorMessage: string | null;
  retryCount: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  assets: VideoAsset[];
  projectId: string | null;
  workspaceId: string;
  prompt?: string;
  thumbnailUrl?: string;
  resultUrl?: string;
  duration?: number;
  cost?: number;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  thumbnailUrl: string | null;
  tags: string[];
  workspaceId: string;
  userId: string;
  jobCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalVideosGenerated: number;
  creditsUsedThisMonth: number;
  creditsBalance: number;
  activeJobs: number;
  completedJobs: number;
  storageUsedBytes: number;
  storageUsedFormatted: string;
}

export interface Scene {
  id: string;
  sceneIndex: number;
  title: string;
  prompt: string;
  negativePrompt?: string;
  duration: number;
  fps: number;
  resolution: string;
  aspectRatio: string;
  cameraMotion?: string;
  style?: string;
  mood?: string;
  status: string;
  createdAt: string;
}

export interface Storyboard {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  totalDuration: number;
  status: string;
  scenes: Scene[];
  createdAt: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  jobType: JobType;
  duration?: number;
  fps?: number;
  resolution?: string;
  aspectRatio?: string;
  cameraMotion?: string;
  lighting?: string;
  style?: string;
  mood?: string;
  environment?: string;
  weather?: string;
  seed?: number;
  referenceImageUrl?: string;
  projectId?: string;
}
