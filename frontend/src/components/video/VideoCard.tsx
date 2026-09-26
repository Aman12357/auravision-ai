'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Trash2, Share2, Film, Clock } from 'lucide-react';
import { VideoJob, useVideoJobs } from '@/hooks/useVideoJobs';
import { JobStatusBadge } from './JobStatusBadge';

interface VideoCardProps {
  job: VideoJob;
  onPlay?: (job: VideoJob) => void;
}

export function VideoCard({ job, onPlay }: VideoCardProps) {
  const { cancelJob } = useVideoJobs();

  const handleDownload = () => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, '_blank');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this video job?')) {
      cancelJob(job.id);
    }
  };

  const handleShare = async () => {
    if (job.downloadUrl) {
      try {
        await navigator.clipboard.writeText(job.downloadUrl);
        // Toast would normally be triggered here
        alert('URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-lg"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
        {job.thumbnailUrl ? (
          <img src={job.thumbnailUrl} alt="Video thumbnail" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-cyan-900/40">
            <Play className="h-12 w-12 text-white/50" />
          </div>
        )}

        <div className="absolute right-2 top-2">
          <JobStatusBadge status={job.status} />
        </div>

        {job.status === 'COMPLETED' && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            onClick={() => onPlay?.(job)}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-lg shadow-violet-600/50 transition-transform hover:scale-110">
              <Play className="h-6 w-6 fill-white text-white ml-1" />
            </div>
          </div>
        )}

        {job.status === 'PROCESSING' && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-800">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Film className="h-4 w-4" />
            <span className="capitalize">{job.type.replace('_', ' ').toLowerCase()}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>2 mins ago</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex space-x-2">
            {job.resolution && (
              <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                {job.resolution}
              </span>
            )}
            {job.provider && (
              <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                {job.provider}
              </span>
            )}
          </div>

          <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            {job.status === 'COMPLETED' && (
              <>
                <button
                  onClick={handleDownload}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="rounded p-1.5 text-gray-400 hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
