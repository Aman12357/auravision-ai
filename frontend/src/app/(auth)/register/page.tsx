'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { registerThunk } from '@/store/authSlice';
import { AppDispatch } from '@/store';
import { AuthCard } from '@/components/auth/AuthCard';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');
  
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(passwordValue);

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(registerThunk({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password
      }));
      
      if (registerThunk.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Please verify your email.');
        router.push(`/verify-otp?purpose=EMAIL_VERIFICATION&email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(resultAction.payload as string || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Join us to create amazing videos"
      isLoading={isSubmitting}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-surface-500" />
            </div>
            <input
              {...register('fullName')}
              type="text"
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-surface-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Full Name"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-accent-500">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-surface-500" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-surface-500 focus:ring-2 focus:ring-primary-500"
                placeholder="Email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-accent-500">{errors.email.message}</p>}
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-surface-500 font-mono">@</span>
              </div>
              <input
                {...register('username')}
                type="text"
                className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-surface-500 focus:ring-2 focus:ring-primary-500"
                placeholder="Username"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-accent-500">{errors.username.message}</p>}
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-surface-500" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2 pl-10 pr-10 text-white placeholder:text-surface-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-500"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {passwordValue && (
            <div className="mt-2 flex h-1 gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full ${
                    i < strength 
                      ? strength < 3 ? 'bg-accent-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500'
                      : 'bg-surface-700'
                  }`}
                />
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-accent-500">{errors.password.message}</p>}
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Check className="h-5 w-5 text-surface-500" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-surface-900/50 border border-surface-700/50 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-surface-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Confirm Password"
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-accent-500">{errors.confirmPassword.message}</p>}
        </div>

        <label className="flex items-start text-xs text-surface-300 cursor-pointer">
          <input {...register('acceptTerms')} type="checkbox" className="mt-0.5 rounded border-surface-700 bg-surface-900 text-primary-500 mr-2" />
          <span>I agree to the <Link href="/terms" className="text-primary-400">Terms of Service</Link> and <Link href="/privacy" className="text-primary-400">Privacy Policy</Link></span>
        </label>
        {errors.acceptTerms && <p className="text-xs text-accent-500">{errors.acceptTerms.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-medium transition-all shadow-glow-primary active:scale-[0.98] mt-2"
        >
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
