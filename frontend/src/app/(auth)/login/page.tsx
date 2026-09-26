'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginThunk } from '@/store/authSlice';
import { AppDispatch } from '@/store';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(loginThunk({ email: data.email, password: data.password }));
      
      if (loginThunk.fulfilled.match(resultAction)) {
        toast.success('Login successful');
        if (resultAction.payload.requiresTwoFactor) {
          router.push('/two-factor');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(resultAction.payload as string || 'Failed to login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      isLoading={isSubmitting}
      footer={
        <>
          Don't have an account?{' '}
          <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </>
      }
    >
      <SocialLoginButtons />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-surface-500" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-accent-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-200 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-surface-500" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-accent-500">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-surface-300">
            <input type="checkbox" className="rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500 mr-2" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>
    </AuthCard>
  );
}
