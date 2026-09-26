import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, ArrowRight } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { VideoJob } from '@/types/video';

// Mock data assuming useVideoJobs hook will provide this
const mockVideos: VideoJob[] = [
  {
    id: '1',
    projectId: 'p1',
    workspaceId: 'w1',
    jobType: 'TEXT_TO_VIDEO',
    status: 'COMPLETED',
    progressPercent: 100,
    providerUsed: 'LOCAL_AI_ENGINE',
    estimatedCostCredits: 15,
    actualCostCredits: 15,
    errorMessage: null,
    retryCount: 0,
    queuedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    completedAt: new Date().toISOString(),
    assets: [],
    prompt: 'A cinematic shot of a neon cyberpunk city at night with flying cars',
    resultUrl: 'https://example.com/video1.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1601134988772-f3f500000000?q=80&w=600',
    duration: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    cost: 15,
    settings: { provider: 'runway', resolution: '1080p', fps: 30 }
  },
  {
    id: '2',
    projectId: 'p1',
    workspaceId: 'w1',
    jobType: 'TEXT_TO_VIDEO',
    status: 'COMPLETED',
    progressPercent: 100,
    providerUsed: 'LUMA',
    estimatedCostCredits: 30,
    actualCostCredits: 30,
    errorMessage: null,
    retryCount: 0,
    queuedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date().toISOString(),
    assets: [],
    prompt: 'Macro photography of a dew drop on a bright green leaf reflecting the morning sun',
    resultUrl: 'https://example.com/video2.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500000000000-000000000000?q=80&w=600',
    duration: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    cost: 30,
    settings: { provider: 'luma', resolution: '4K', fps: 60 }
  },
  {
    id: '3',
    projectId: 'p2',
    workspaceId: 'w1',
    jobType: 'TEXT_TO_VIDEO',
    status: 'PROCESSING',
    progressPercent: 45,
    providerUsed: 'PIKA',
    estimatedCostCredits: 15,
    actualCostCredits: null,
    errorMessage: null,
    retryCount: 0,
    queuedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    completedAt: null,
    assets: [],
    prompt: 'Astronaut walking on Mars, photorealistic, 8k',
    duration: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    cost: 15,
    settings: { provider: 'pika', resolution: '1080p', fps: 24 }
  }
];

export function RecentVideos() {
  const isLoading = false;
  const videos = mockVideos;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Recent Generations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900 rounded-xl h-64 animate-pulse border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Play size={40} className="text-slate-600 ml-2" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
        <p className="text-slate-400 mb-8 max-w-md">
          You haven't generated any videos in this workspace yet. Start creating amazing content!
        </p>
        <Link 
          href="/generate"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          Generate Your First Video
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Recent Generations</h2>
        <Link 
          href="/videos" 
          className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-colors"
          >
            {/* Thumbnail Area */}
            <div className="aspect-video bg-slate-900 relative overflow-hidden">
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt="thumbnail" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {video.status === 'PROCESSING' ? (
                    <>
                      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs font-medium text-violet-400">Generating...</span>
                    </>
                  ) : (
                    <Play className="text-slate-700" size={32} />
                  )}
                </div>
              )}
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {video.status === 'COMPLETED' && (
                  <button className="w-12 h-12 bg-violet-600/90 text-white rounded-full flex items-center justify-center backdrop-blur shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </button>
                )}
              </div>
              
              {video.duration && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-medium text-white">
                  {video.duration}s
                </div>
              )}
              {video.settings?.resolution && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-medium text-white">
                  {video.settings.resolution}
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-4">
              <p className="text-sm text-slate-200 line-clamp-2 mb-3 leading-snug font-medium" title={video.prompt}>
                {video.prompt}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock size={12} />
                  {formatRelativeTime(video.createdAt || video.queuedAt)}
                </div>
                
                <div className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                  video.status === 'COMPLETED' ? "bg-green-500/10 text-green-400" :
                  video.status === 'PROCESSING' ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                  video.status === 'FAILED' ? "bg-red-500/10 text-red-400" :
                  "bg-slate-500/10 text-slate-400"
                )}>
                  {video.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
