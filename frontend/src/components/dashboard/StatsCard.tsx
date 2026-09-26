'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: number;
  color: 'violet' | 'cyan' | 'rose' | 'amber' | 'green';
  delay?: number;
}

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
    shadow: 'hover:shadow-violet-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-500',
    shadow: 'hover:shadow-cyan-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    shadow: 'hover:shadow-rose-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    shadow: 'hover:shadow-amber-500/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    shadow: 'hover:shadow-emerald-500/20',
  },
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color, delay = 0 }: StatsCardProps) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
  const isNumber = !isNaN(numericValue) && typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = numericValue;
    const duration = 1000;
    const incrementTime = Math.abs(Math.floor(duration / (end || 1)));
    
    if (end === 0) return;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numericValue, isNumber]);

  const displayValue = isNumber ? count : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl p-6 transition-all duration-300 hover:bg-gray-900 hover:shadow-xl ${colorMap[color].shadow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">{displayValue}</h3>
            {trend !== undefined && (
              <span
                className={`flex items-center text-sm font-medium ${
                  trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {trend >= 0 ? (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                )}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`rounded-full p-3 ${colorMap[color].bg}`}>
          <Icon className={`h-6 w-6 ${colorMap[color].text}`} />
        </div>
      </div>
    </motion.div>
  );
}
