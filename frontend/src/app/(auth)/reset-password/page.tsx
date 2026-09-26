'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';

function ResetPasswordContent() {
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

        <div>
          <label className="block text-sm text-surface-400 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-900/50 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-white placeholder-surface-500"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm text-surface-400 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-900/50 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-white placeholder-surface-500"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Reset Password
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#4893FC] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
