'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'EMAIL_VERIFICATION';
  
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/api/auth/verify-otp', { email, otp, purpose });
      toast.success('Verification successful');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
      setOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/api/auth/send-otp', { email, purpose });
      toast.success('New code sent');
      setCountdown(60);
    } catch (error) {
      toast.error('Failed to send code');
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
      isLoading={isSubmitting}
    >
      <form onSubmit={handleVerify} className="space-y-8 flex flex-col items-center">
        <OtpInput value={otp} onChange={setOtp} length={6} />
        
        <div className="w-full space-y-4">
          <button
            type="submit"
            disabled={otp.length !== 6 || isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Verify Code
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-sm text-surface-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#4893FC] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
