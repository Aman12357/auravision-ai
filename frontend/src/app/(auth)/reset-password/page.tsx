'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Check } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter a valid 6-digit OTP');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    
    setIsSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard title="Password Reset Successfully">
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-surface-300">Redirecting to login...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create New Password"
      subtitle={`Enter the OTP sent to ${email}`}
      isLoading={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-surface-400 mb-2">Reset Code</label>
          <OtpInput value={otp} onChange={setOtp} length={6} />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-surface-500" />
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="New Password"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Check className="h-5 w-5 text-surface-500" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Confirm New Password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 6 || !newPassword}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98] disabled:opacity-50"
        >
          Reset Password
        </button>
      </form>
    </AuthCard>
  );
}
