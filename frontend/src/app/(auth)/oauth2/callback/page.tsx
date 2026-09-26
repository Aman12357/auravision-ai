'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const errParam = searchParams.get('error');
      const msgParam = searchParams.get('message');
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (errParam === 'access_denied') {
        setError(msgParam || 'Login or Gmail access denied');
        toast.error('Google login or Gmail access was denied.');
        return;
      }

      if (errParam) {
        setError(msgParam || 'Google OAuth Authentication Failed');
        return;
      }

      if (token) {
        // Save Google OAuth session details
        localStorage.setItem('aura_auth_token', token);
        if (email) {
          localStorage.setItem('aura_user_email', email);
        }
        localStorage.setItem('aura_google_auth', 'true');
        
        toast.success('Successfully authenticated via Google OAuth 2.0!');
        
        // Redirect to Dashboard
        setTimeout(() => {
          router.push('/dashboard?gauth=success');
        }, 1000);
        return;
      }

      // Fallback redirect if no params
      router.push('/dashboard');
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
      {error ? (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl font-medium transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[#4893FC]/20 text-[#4893FC] rounded-full flex items-center justify-center mb-6">
            <Loader2 size={32} className="animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Google Authentication</h2>
          <p className="text-slate-400">Verifying session & creating secure user connection...</p>
        </div>
      )}
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-[#4893FC]" />
        </div>
      }>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
