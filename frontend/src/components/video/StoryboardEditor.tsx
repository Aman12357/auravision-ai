import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Trash2, Settings2, Play, Image as ImageIcon, GripVertical } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { VideoPlayer } from './VideoPlayer';

interface Scene {
  id: string;
  index: number;
  prompt: string;
  duration: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  thumbnailUrl?: string;
  style: string;
  camera: string;
}

const mockScenes: Scene[] = [
  { id: '1', index: 1, prompt: 'A wide shot of a futuristic city...', duration: 5, status: 'COMPLETED', videoUrl: 'demo1.mp4', style: 'Cinematic', camera: 'Pan Right' },
  { id: '2', index: 2, prompt: 'Close up on the main character looking up...', duration: 3, status: 'PROCESSING', style: 'Cinematic', camera: 'Zoom In' },
  { id: '3', index: 3, prompt: 'Fast paced action scene flying through cars...', duration: 8, status: 'PENDING', style: 'Cinematic', camera: 'Tracking' },
];

export function StoryboardEditor() {
  const [scenes, setScenes] = useState<Scene[]>(mockScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id);

  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  const addScene = () => {
    const newScene: Scene = {
      id: Math.random().toString(36).substr(2, 9),
      index: scenes.length + 1,
      prompt: '',
      duration: 5,
      status: 'PENDING',
      style: 'Cinematic',
      camera: 'None'
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneId(newScene.id);
  };

  const removeScene = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Delete this scene?')) {
      const newScenes = scenes.filter(s => s.id !== id);
      setScenes(newScenes);
      if(selectedSceneId === id) {
        setSelectedSceneId(newScenes[0]?.id || '');
      }
    }
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
      
      {/* Top Timeline / Scene List */}
      <div className="h-64 border-b border-slate-800 bg-slate-900/50 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Storyboard
          </h2>
          <div className="text-sm text-slate-400 font-medium">
            Total Duration: {formatDuration(totalDuration)}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto flex gap-4 pb-2 items-center">
          <Reorder.Group 
            axis="x" 
            values={scenes} 
            onReorder={setScenes} 
            className="flex gap-4 h-full"
          >
            {scenes.map((scene, idx) => (
              <Reorder.Item 
                key={scene.id} 
                value={scene}
                onClick={() => setSelectedSceneId(scene.id)}
                className={cn(
                  "relative w-64 h-full bg-slate-800 rounded-lg border-2 cursor-pointer flex flex-col overflow-hidden shrink-0 transition-colors",
                  selectedSceneId === scene.id ? "border-violet-500" : "border-slate-700 hover:border-slate-500"
                )}
              >
                {/* Drag Handle & Info */}
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <GripVertical size={12} className="text-slate-400" />
                  Scene {idx + 1}
                </div>
                
                <div className="absolute top-2 right-2 z-10 text-white text-xs bg-black/60 px-2 py-1 rounded backdrop-blur">
                  {scene.duration}s
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "absolute bottom-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                  scene.status === 'COMPLETED' ? "bg-green-500/20 text-green-400 border border-green-500/50" :
                  scene.status === 'PROCESSING' ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" :
                  scene.status === 'FAILED' ? "bg-red-500/20 text-red-400 border border-red-500/50" :
                  "bg-slate-500/20 text-slate-400 border border-slate-500/50"
                )}>
                  {scene.status}
                </div>

                <button 
                  onClick={(e) => removeScene(scene.id, e)}
                  className="absolute bottom-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded backdrop-blur transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                {/* Thumbnail Area */}
                <div className="flex-1 bg-slate-900 flex items-center justify-center">
                  {scene.thumbnailUrl ? (
                    <img src={scene.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover opacity-80" />
                  ) : scene.status === 'PROCESSING' ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs text-blue-400 font-medium">Generating...</span>
                    </div>
                  ) : (
                    <ImageIcon size={32} className="text-slate-700" />
                  )}
                </div>

                <div className="p-3 border-t border-slate-700 bg-slate-800 text-xs text-slate-300 truncate">
                  {scene.prompt || "No prompt provided..."}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add Button */}
          <button 
            onClick={addScene}
            className="w-16 h-full shrink-0 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:border-violet-500 hover:text-violet-400 hover:bg-violet-500/5 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Video Preview */}
        <div className="flex-1 p-6 flex flex-col bg-slate-950">
          <h3 className="text-lg font-bold text-white mb-4">Scene Preview</h3>
          <div className="flex-1 flex items-center justify-center">
            {selectedScene?.videoUrl ? (
              <VideoPlayer 
                src={selectedScene.videoUrl} 
                poster={selectedScene.thumbnailUrl}
                className="w-full max-w-4xl shadow-2xl" 
              />
            ) : (
              <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>No video generated for this scene yet</p>
                <button className="mt-4 flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-violet-900/20">
                  <Play size={18} fill="currentColor" /> Generate Scene
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Scene Settings Panel */}
        <div className="w-96 border-l border-slate-800 bg-slate-900 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Settings2 className="text-violet-400" />
            <h3 className="text-lg font-bold text-white">Scene Settings</h3>
          </div>

          {selectedScene ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Prompt</label>
                <textarea 
                  value={selectedScene.prompt}
                  onChange={e => updateScene(selectedScene.id, { prompt: e.target.value })}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-violet-500 focus:outline-none resize-none"
                  placeholder="Describe this specific scene..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex justify-between">
                  <span>Duration</span>
                  <span>{selectedScene.duration}s</span>
                </label>
                <input 
                  type="range" min="1" max="10" 
                  value={selectedScene.duration}
                  onChange={e => updateScene(selectedScene.id, { duration: parseInt(e.target.value) })}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Camera Motion</label>
                <select 
                  value={selectedScene.camera}
                  onChange={e => updateScene(selectedScene.id, { camera: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                >
                  {['None', 'Pan Left', 'Pan Right', 'Zoom In', 'Zoom Out', 'Tracking', 'Dolly'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors mb-3">
                  Generate This Scene
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 mt-10">Select a scene to edit</div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
        <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-violet-900/20 transition-all hover:scale-105 active:scale-95">
          <Play size={20} fill="currentColor" /> Generate Full Storyboard
        </button>
      </div>
    </div>
  );
}
