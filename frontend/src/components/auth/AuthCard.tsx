'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
}

export function AuthCard({ title, subtitle, children, footer, isLoading }: AuthCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-dark rounded-2xl p-8 relative overflow-hidden w-full shadow-glow-primary"
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-surface-400">{subtitle}</p>}
      </div>

      <div className="relative">
        {children}
        
        {isLoading && (
          <div className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {footer && (
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-surface-400">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
