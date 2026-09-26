import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addNotification, markAsRead as markAsReadThunk, markAllAsRead as markAllAsReadThunk } from '@/store/notificationSlice';
import { addToast } from '@/store/uiSlice';

export function useNotifications() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<any>();
  const { notifications: reduxNotifications, unreadCount } = useSelector((state: any) => state.notifications);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/notifications');
      return response.data;
    },
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/notifications/unread-count');
      return response.data;
    },
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/notifications/stream');

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      dispatch(addNotification(notification));
      dispatch(addToast({
        title: notification.title,
        description: notification.message,
        type: 'info'
      }));
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.put(`/api/v1/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      dispatch(markAsReadThunk(id));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axios.put('/api/v1/notifications/read-all');
    },
    onSuccess: () => {
      dispatch(markAllAsReadThunk());
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data?.items || reduxNotifications,
    unreadCount: unreadData?.count || unreadCount,
    isLoading,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
}
