import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row auth-bg-mesh relative overflow-hidden">
      {/* Abstract decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Left side content / Form area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-between items-center">
            <Link href="/" className="text-2xl font-heading font-bold gradient-text flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm">A</span>
              Aura Video AI
            </Link>
            <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right side decorative area (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center justify-center p-12 z-10 relative">
        <div className="relative w-full max-w-lg aspect-square">
          <div className="absolute inset-0 glass-dark rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="text-center p-8">
              <h2 className="text-3xl font-heading font-bold mb-4 text-white">Create Stunning Videos with AI</h2>
              <p className="text-surface-300">Join the next generation of content creators using our premium platform.</p>
            </div>
            {/* Animated video frames */}
            <div className="absolute -left-10 top-10 w-32 h-24 glass-dark rounded-xl animate-slide-up shadow-glow-primary border border-primary-500/30" />
            <div className="absolute -right-10 bottom-20 w-40 h-28 glass-dark rounded-xl animate-slide-up shadow-glow-secondary border border-secondary-500/30" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
