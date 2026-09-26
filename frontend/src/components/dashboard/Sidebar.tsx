'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, FolderKanban, History, Layers, HardDrive, Sparkles } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate', href: '/generate', icon: Video },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'History', href: '/history', icon: History },
    { name: 'Templates', href: '/templates', icon: Layers },
    { name: 'Storage', href: '/storage', icon: HardDrive },
  ];

  return (
    <aside className="w-64 bg-[#0A0D18] border-r border-white/10 flex flex-col justify-between select-none">
      <div>
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4893FC]" />
              Aura <span className="font-normal text-slate-400">AI</span>
            </span>
          </Link>
        </div>

        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#4893FC]/15 text-[#4893FC] border-l-2 border-[#4893FC] font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="font-medium text-slate-300">Google OAuth Active</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </aside>
  );
}
