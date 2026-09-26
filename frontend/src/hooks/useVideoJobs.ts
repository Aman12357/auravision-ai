import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';

export interface VideoJob {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  type: string;
  createdAt: string;
  duration?: string;
  resolution?: string;
  provider?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export function useVideoJobs() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['videoJobs'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/jobs');
      return response.data as VideoJob[];
    },
  });

  const submitJobMutation = useMutation({
    mutationFn: async (request: Record<string, any>) => {
      const response = await axios.post('/api/v1/jobs', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoJobs'] });
      dispatch(addToast({ title: 'Job Submitted', type: 'success' }));
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await axios.put(`/api/v1/jobs/${jobId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoJobs'] });
      dispatch(addToast({ title: 'Job Cancelled', type: 'info' }));
    },
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/jobs/stream');

    eventSource.onmessage = (event) => {
      const updatedJob = JSON.parse(event.data);
      
      queryClient.setQueryData(['videoJobs'], (old: VideoJob[] | undefined) => {
        if (!old) return old;
        return old.map(job => job.id === updatedJob.id ? { ...job, ...updatedJob } : job);
      });

      if (updatedJob.status === 'COMPLETED') {
        dispatch(addToast({ title: 'Video Processing Complete', type: 'success' }));
      } else if (updatedJob.status === 'FAILED') {
        dispatch(addToast({ title: 'Video Processing Failed', type: 'error' }));
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient, dispatch]);

  const activeJobsCount = useMemo(() => {
    if (!data) return 0;
    return data.filter(job => job.status === 'QUEUED' || job.status === 'PROCESSING').length;
  }, [data]);

  return {
    jobs: data || [],
    isLoading,
    submitJob: (req: any) => submitJobMutation.mutate(req),
    cancelJob: (id: string) => cancelJobMutation.mutate(id),
    activeJobsCount,
  };
}
