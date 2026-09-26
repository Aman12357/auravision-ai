'use client';

import React from 'react';
import { AuraVideoStudio } from '@/components/studio/AuraVideoStudio';

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Generate Video Studio</h2>
        <p className="text-sm text-slate-400">Create stunning 4K 60FPS videos & images from text prompts or keyframe references.</p>
      </div>

      <AuraVideoStudio />
    </div>
  );
}
