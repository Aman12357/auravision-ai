import Cookies from 'js-cookie';
import { User } from '@/types/user';

const ACCESS_TOKEN_KEY = 'aura_access_token';
const REFRESH_TOKEN_KEY = 'aura_refresh_token';

export const getAccessToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const setTokens = (access: string, refresh: string): void => {
  Cookies.set(ACCESS_TOKEN_KEY, access, { secure: true, sameSite: 'strict' });
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { secure: true, sameSite: 'strict' });
};

export const clearTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const decodeToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const getUserFromToken = (): User | null => {
  const token = getAccessToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.user || null;
};
