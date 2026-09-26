'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInput } from '@/components/auth/OtpInput';
import { api } from '@/lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthTokens } from '@/store/authSlice';
import { RootState } from '@/store';
import Link from 'next/link';

export default function TwoFactorPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { twoFactorToken } = useSelector((state: RootState) => state.auth);
  
  const [code, setCode] = useState('');
  const [isBackup, setIsBackup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code) return;
    
    setIsSubmitting(true);
    try {
      const endpoint = isBackup ? '/api/auth/verify-2fa-backup' : '/api/auth/verify-2fa';
      const payload = isBackup 
        ? { token: twoFactorToken, backupCode: code }
        : { token: twoFactorToken, code };
        
      const response = await api.post(endpoint, payload);
      dispatch(setAuthTokens({ access: response.data.accessToken, refresh: response.data.refreshToken }));
      toast.success('Verification successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Two-Factor Authentication"
      subtitle={isBackup ? "Enter one of your emergency backup codes" : "Enter the code from your authenticator app"}
      isLoading={isSubmitting}
      footer={
        <Link href="/login" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      }
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
          <ShieldCheck className="w-8 h-8 text-primary-400" />
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center">
          {isBackup ? (
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="w-full max-w-[200px] text-center bg-surface-900/50 border border-surface-700/50 rounded-xl py-3 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono tracking-widest uppercase"
            />
          ) : (
            <OtpInput value={code} onChange={(val) => {
              setCode(val);
              if (val.length === 6) {
                setTimeout(() => handleVerify(), 100);
              }
            }} length={6} />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (isBackup ? code.length < 8 : code.length !== 6)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98] disabled:opacity-50"
        >
          Verify Code
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setIsBackup(!isBackup); setCode(''); }}
            className="text-sm text-surface-400 hover:text-white transition-colors"
          >
            {isBackup ? 'Use authenticator app' : 'Use backup code'}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
