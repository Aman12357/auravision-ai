'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';

export default function VerifyOtpPage() {
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
        <OtpInput value={otp} onChange={(val) => {
          setOtp(val);
          if (val.length === 6) {
            // Auto submit
            setTimeout(() => {
              const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
              handleVerify(syntheticEvent);
            }, 100);
          }
        }} />
        
        <div className="w-full">
          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98] disabled:opacity-50"
          >
            Verify
          </button>
        </div>

        <div className="text-center text-sm text-surface-400">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className="text-primary-400 hover:text-primary-300 disabled:opacity-50 disabled:hover:text-primary-400 font-medium"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend now'}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
