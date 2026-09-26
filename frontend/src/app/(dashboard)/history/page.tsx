import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">History</h2>
        <p className="text-muted-foreground text-slate-400">View all your past generations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <span className="text-slate-500">Thumbnail</span>
            </div>
            <CardContent className="p-4">
              <p className="text-sm font-medium line-clamp-2">A cinematic shot of a cyberpunk city at night with neon lights...</p>
              <p className="text-xs text-slate-500 mt-2">2 days ago • 1080p</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
