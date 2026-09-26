import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-slate-400">Manage your video projects and workspaces.</p>
        </div>
        <Button>New Project</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Demo Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">12 videos generated</p>
            <p className="text-xs text-slate-500 mt-2">Last updated 2 hours ago</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
