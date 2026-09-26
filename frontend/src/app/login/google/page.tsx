'use client';
import { useEffect } from 'react';

export default function LoginGoogleRedirectPage() {
  useEffect(() => {
    window.location.href = 'http://localhost:5000/login/google';
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#4893FC] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-300">Redirecting to Flask Google OAuth consent...</p>
      </div>
    </div>
  );
}
