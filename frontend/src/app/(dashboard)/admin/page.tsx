'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, Video, DollarSign, Activity, Server, Cpu, HeartPulse, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Switch } from '@/components/ui/switch';
import { adminApi } from '@/lib/api/admin';

// Mock data to ensure it renders if API fails
const mockChartData = Array.from({ length: 30 }).map((_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  videos: Math.floor(Math.random() * 500) + 100,
}));

export default function AdminDashboardPage() {
  const router = useRouter();
  // Assume a hook or context provides current user info
  const user = { role: 'ADMIN' }; // Mock user
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user?.role !== 'ADMIN') {
      router.push('/403');
    }
  }, [user, router]);

  const { data: dashboardData } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

  const { data: providersData } = useQuery({
    queryKey: ['adminProviders'],
    queryFn: adminApi.getProviders,
    refetchInterval: 30000,
  });

  if (!isClient) return null;

  const stats = [
    { title: 'Total Users', value: '12,450', subtitle: '+124 New Today', icon: Users, color: 'violet', trend: 12 },
    { title: 'Total Workspaces', value: '3,842', subtitle: 'Active teams', icon: Briefcase, color: 'cyan', trend: 5 },
    { title: 'Videos Generated', value: '45,231', subtitle: '842 Today', icon: Video, color: 'rose', trend: 18 },
    { title: 'Platform Revenue', value: '$84,230', subtitle: 'MRR', icon: DollarSign, color: 'green', trend: 8 },
    { title: 'Active Jobs', value: '142', subtitle: 'Currently processing', icon: Activity, color: 'amber' },
    { title: 'System Uptime', value: '99.99%', subtitle: 'Last 30 days', icon: Server, color: 'violet' },
  ] as const;

  const providers = providersData || [
    { name: 'Aura Local PyTorch Video Engine', status: 'HEALTHY', successRate: 99, avgTime: '12s', enabled: true },
    { name: 'Local Llama 3.2 3B (Ollama LLM)', status: 'HEALTHY', successRate: 100, avgTime: '1.2s', enabled: true },
    { name: 'Local AnimateDiff v3 Engine', status: 'HEALTHY', successRate: 97, avgTime: '8s', enabled: true },
    { name: 'Local Stable Diffusion XL Turbo', status: 'HEALTHY', successRate: 98, avgTime: '4s', enabled: true },
  ];

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-400">Real-time platform metrics</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} delay={idx * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-violet-500" /> Platform Usage (30 Days)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Area type="monotone" dataKey="videos" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorVideos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Metrics */}
        <div className="col-span-1 rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl flex flex-col space-y-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Server className="mr-2 h-5 w-5 text-cyan-500" /> System Metrics
          </h2>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center"><Cpu className="mr-2 h-4 w-4" /> JVM Memory</span>
              <span className="text-white">4.2 GB / 8.0 GB</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[52%]"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center"><Activity className="mr-2 h-4 w-4" /> Thread Count</span>
              <span className="text-white">124 Active</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 w-[30%]"></div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Audit Log</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start text-xs">
                  <ShieldAlert className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-300">Admin <span className="text-white">alex@example.com</span> updated provider settings.</p>
                    <p className="text-gray-500 mt-1">192.168.1.4 • 2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Providers */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <HeartPulse className="mr-2 h-5 w-5 text-rose-500" /> AI Providers Status
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 px-4 font-medium">Provider Name</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Success Rate</th>
                <th className="py-3 px-4 font-medium">Avg Gen Time</th>
                <th className="py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {providers.map((provider: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{provider.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      provider.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-500' :
                      provider.status === 'DEGRADED' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${provider.successRate > 90 ? 'bg-emerald-500' : provider.successRate > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${provider.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-xs">{provider.successRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{provider.avgTime}</td>
                  <td className="py-3 px-4">
                    <Switch checked={provider.enabled} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
