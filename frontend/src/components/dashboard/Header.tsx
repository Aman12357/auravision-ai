import React from 'react';

export function Header() {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0F172A]/80 flex items-center justify-between px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/20">
          450 Credits
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-700"></div>
      </div>
    </header>
  );
}
