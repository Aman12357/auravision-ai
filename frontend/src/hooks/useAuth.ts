// Mock auth hook for demonstration
import { useCallback } from 'react';

export const useAuth = () => {
  const authState = {
    user: { id: '1', name: 'Demo User', email: 'demo@auravideo.ai' },
    isAuthenticated: true,
    isLoading: false,
    accessToken: 'mock-token'
  };

  const logout = useCallback(() => {
    // router.push('/login');
    console.log('logout');
  }, []);

  return { ...authState, logout };
};
