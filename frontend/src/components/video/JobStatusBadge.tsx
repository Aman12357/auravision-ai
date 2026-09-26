import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { VideoJob } from '@/hooks/useVideoJobs';

interface JobStatusBadgeProps {
  status: VideoJob['status'];
  className?: string;
}

export function JobStatusBadge({ status, className = '' }: JobStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'QUEUED':
        return {
          icon: Clock,
          text: 'Queued',
          classes: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        };
      case 'PROCESSING':
        return {
          icon: Loader2,
          text: 'Processing',
          classes: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
          spin: true,
        };
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          text: 'Completed',
          classes: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          text: 'Failed',
          classes: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
        };
      case 'CANCELLED':
      default:
        return {
          icon: MinusCircle,
          text: 'Cancelled',
          classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${config.classes} ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${config.spin ? 'animate-spin' : ''}`} />
      {config.text}
    </div>
  );
}
