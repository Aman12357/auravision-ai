import { User } from './user';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  requiresTwoFactor: boolean;
  twoFactorToken?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password?: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_OTP' | 'PHONE_VERIFICATION';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}
