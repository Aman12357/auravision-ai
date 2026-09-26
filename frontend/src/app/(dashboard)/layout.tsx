import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#030712] text-slate-200 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/10 bg-[#0F172A]/80 flex items-center px-6 backdrop-blur-xl">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
