'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setIsSuccess(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle={isSuccess ? "Check your email" : "Enter your email to receive a reset link"}
      isLoading={isSubmitting}
      footer={
        <Link href="/login" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      }
    >
      {isSuccess ? (
        <div className="flex flex-col items-center py-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary-400" />
          </div>
          <p className="text-surface-300 mb-6">
            We've sent a password reset OTP to <br/><span className="text-white font-medium">{email}</span>
          </p>
          <Link 
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="w-full py-2.5 px-4 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium transition-all"
          >
            Enter OTP manually
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-surface-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Reset OTP
          </button>
        </form>
      )}
    </AuthCard>
  );
}
