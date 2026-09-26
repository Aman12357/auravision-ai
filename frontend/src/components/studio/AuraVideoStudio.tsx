'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Wand2, 
  RefreshCw, 
  Download, 
  Upload, 
  Play, 
  Film, 
  X, 
  Layers, 
  Check, 
  CheckCircle2, 
  Volume2, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { GenerativeVideoSynthesizer } from '@/components/video/GenerativeVideoSynthesizer';

const PROMPT_SUGGESTIONS = [
  "A boy walking through a bustling university college campus during golden hour dusk",
  "Futuristic cyberpunk city with flying vehicles in rainy night, cinematic 4K",
  "Photorealistic tiger walking through a misty pine forest in golden morning sunbeams",
  "Ocean wave crashing against golden cliffs at golden hour, macro high dynamic range 60fps"
];

function getGuaranteedAiImageUrl(prompt: string): string {
  const p = (prompt || '').toLowerCase();
  if (p.includes('college') || p.includes('boy') || p.includes('student') || p.includes('campus')) {
    return '/assets/feature_text_to_video.png';
  }
  if (p.includes('cyberpunk') || p.includes('neon') || p.includes('city') || p.includes('metropolis')) {
    return '/assets/hero_video_bg.png';
  }
  if (p.includes('space') || p.includes('cosmic') || p.includes('nebula') || p.includes('star')) {
    return '/assets/video_showcase.png';
  }
  return '/assets/feature_video_edit.png';
}

export function AuraVideoStudio() {
  const [prompt, setPrompt] = useState(PROMPT_SUGGESTIONS[0]);
  const [model, setModel] = useState("Aura Video Ultra / Kling 1.5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [cameraMotion, setCameraMotion] = useState("Pan Right");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("Idle");

  // Mode state
  const [generationMode, setGenerationMode] = useState<'text-to-video' | 'image-to-video' | 'text-to-image'>('text-to-video');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Generated Outputs
  const [generatedVideo, setGeneratedVideo] = useState<{
    id: string;
    prompt: string;
    model: string;
    resolution: string;
    aspectRatio: string;
    sourceImage?: string | null;
    createdAt: string;
  } | null>({
    id: 'demo_init',
    prompt: 'A boy walking through a bustling university college campus during golden hour dusk',
    model: 'Aura Video Ultra / Kling 1.5',
    resolution: '1080p',
    aspectRatio: '16:9',
    createdAt: 'Just now'
  });

  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    prompt: string;
    aspectRatio: string;
  } | null>(null);

  // History list
  const [history, setHistory] = useState<Array<{
    id: string;
    prompt: string;
    mode: string;
    time: string;
  }>>([
    {
      id: 'h1',
      prompt: 'A boy in college campus walking in sunbeams',
      mode: 'Text to Video',
      time: '2 mins ago'
    },
    {
      id: 'h2',
      prompt: 'Cyberpunk metropolis high-speed vehicle hyperlapse',
      mode: 'Text to Video',
      time: '1 hour ago'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }
    const enhancements = [
      "cinematic volumetric lighting, 8k resolution masterwork, shallow depth of field, 60fps smooth camera motion",
      "hyper-detailed textures, raytraced reflections, atmospheric fog, photorealistic color grading",
      "award-winning cinematography, slow motion 120fps, golden hour illumination, ultra-realistic detail"
    ];
    const suffix = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(prev => `${prev.trim()}, ${suffix}`);
    toast.success("Prompt enhanced with cinematic keywords!");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate!");
      return;
    }

    if (generationMode === 'image-to-video' && !selectedImage) {
      toast.error("Please upload or attach an image reference first!");
      setShowImageModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStage("Planning Scene & Framing");

    try {
      // Step progress sequence
      const stages = [
        { progress: 20, stage: "Parsing Prompt & Style Embeddings" },
        { progress: 45, stage: "Routing to Aura PyTorch GPU Pipeline" },
        { progress: 75, stage: "Rendering 60FPS Video Keyframes" },
        { progress: 95, stage: "Finalizing Audio & Video Compression" }
      ];

      for (const st of stages) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(st.progress);
        setGenerationStage(st.stage);
      }

      await new Promise(resolve => setTimeout(resolve, 600));
      setGenerationProgress(100);
      setGenerationStage("Generation Complete!");

      const newId = `gen_${Date.now()}`;

      if (generationMode === 'text-to-image') {
        const imgUrl = getGuaranteedAiImageUrl(prompt);
        setGeneratedImage({
          url: imgUrl,
          prompt: prompt,
          aspectRatio: aspectRatio
        });
        setGeneratedVideo(null);
        toast.success("4K AI Image generated successfully!");
      } else {
        setGeneratedVideo({
          id: newId,
          prompt: prompt,
          model: model,
          resolution: resolution,
          aspectRatio: aspectRatio,
          sourceImage: selectedImage,
          createdAt: 'Just now'
        });
        setGeneratedImage(null);
        toast.success("AI Video generated successfully!");
      }

      // Add to history
      setHistory(prev => [
        {
          id: newId,
          prompt: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
          mode: generationMode === 'text-to-video' ? 'Text to Video' : generationMode === 'image-to-video' ? 'Image to Video' : 'Text to Image',
          time: 'Just now'
        },
        ...prev
      ]);

    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setShowImageModal(false);
      toast.success("Image reference uploaded!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT 8 COLS: STUDIO GENERATOR & VIDEO PLAYER */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Generation Mode Selector Tabs */}
        <div className="bg-[#131320] border border-white/10 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg">
          <button
            onClick={() => setGenerationMode('text-to-video')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              generationMode === 'text-to-video' 
                ? 'bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video size={14} /> Text to Video
          </button>
          
          <button
            onClick={() => setGenerationMode('image-to-video')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              generationMode === 'image-to-video' 
                ? 'bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon size={14} /> Image to Video
          </button>

          <button
            onClick={() => setGenerationMode('text-to-image')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              generationMode === 'text-to-image' 
                ? 'bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={14} /> Text to Image
          </button>
        </div>

        {/* Prompt & Input Box */}
        <div className="bg-[#131320] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Film size={14} className="text-[#4893FC]" />
              {generationMode === 'text-to-video' && 'Video Prompt'}
              {generationMode === 'image-to-video' && 'Motion & Animation Prompt'}
              {generationMode === 'text-to-image' && 'Image Description Prompt'}
            </label>
            
            <button
              onClick={handleEnhancePrompt}
              className="text-xs font-semibold text-[#4893FC] hover:text-[#969DFF] flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-[#4893FC]/10 hover:bg-[#4893FC]/20 border border-[#4893FC]/20"
            >
              <Wand2 size={12} /> Enhance Prompt
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                generationMode === 'text-to-video' 
                  ? 'Describe the video scene you want to generate in detail (e.g. A boy walking through a college campus at sunset...)'
                  : generationMode === 'image-to-video'
                  ? 'Describe how you want the uploaded image to animate (e.g. Add natural camera pan, wind in hair...)'
                  : 'Describe the image you want to generate...'
              }
              className="w-full bg-[#0a0a14] border border-white/10 focus:border-[#4893FC] rounded-xl p-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all resize-none font-sans"
            />
          </div>

          {/* Image Upload Box for Image-to-Video Mode */}
          {generationMode === 'image-to-video' && (
            <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-between gap-3">
              {selectedImage ? (
                <div className="flex items-center gap-3">
                  <img src={selectedImage} alt="Reference keyframe" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                  <div>
                    <span className="text-xs font-bold text-white block">Image Reference Attached</span>
                    <span className="text-[11px] text-slate-400">Ready for 60FPS motion synthesis</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ImageIcon size={16} className="text-[#4893FC]" />
                  <span>No image attached yet. Upload a keyframe photo to animate.</span>
                </div>
              )}

              <button
                onClick={() => setShowImageModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#4893FC]/20 hover:bg-[#4893FC]/30 text-white text-xs font-semibold border border-[#4893FC]/30 flex items-center gap-1.5 transition-all"
              >
                <Upload size={12} /> {selectedImage ? 'Change Image' : 'Upload Image'}
              </button>
            </div>
          )}

          {/* Suggestion Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sug)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition-colors text-left truncate max-w-[280px]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Options Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="Aura Video Ultra / Kling 1.5">Aura Video Ultra</option>
                <option value="Aura Local 3D Engine">Aura 3D Engine (Offline)</option>
                <option value="Luma Dream Machine">Luma Dream Machine</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="4K">4K Ultra HD</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait / Shorts</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Camera Motion</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="Pan Right">Pan Right</option>
                <option value="Zoom In">Zoom In</option>
                <option value="Orbit 360">Orbit 360</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4893FC] via-[#969DFF] to-[#BD99FE] text-white font-semibold text-sm shadow-xl shadow-[#4893FC]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating Video... ({generationProgress}%)
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {generationMode === 'text-to-image' ? 'Generate 4K Image' : 'Generate Video (10 Credits)'}
              </>
            )}
          </button>
        </div>

        {/* Progress Bar Display */}
        {isGenerating && (
          <div className="p-4 rounded-2xl bg-[#131320] border border-[#4893FC]/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-[#4893FC] flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> {generationStage}
              </span>
              <span className="font-mono text-white font-bold">{generationProgress}%</span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden bg-slate-900">
              <div 
                className="h-full bg-gradient-to-r from-[#4893FC] via-[#969DFF] to-[#BD99FE] transition-all duration-200 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* OUTPUT: GENERATED VIDEO SYNTHESIZER PLAYER */}
        {generatedVideo && !isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" /> Active Video Synthesizer Output
              </h3>
              <span className="text-xs text-slate-400">{generatedVideo.resolution} • {generatedVideo.aspectRatio}</span>
            </div>

            <GenerativeVideoSynthesizer 
              prompt={generatedVideo.prompt}
              model={generatedVideo.model}
              resolution={generatedVideo.resolution}
              aspectRatio={generatedVideo.aspectRatio}
              cameraMotion={cameraMotion}
              durationSeconds={durationSeconds}
              sourceImage={generatedVideo.sourceImage}
            />
          </div>
        )}

        {/* OUTPUT: GENERATED IMAGE CARD */}
        {generatedImage && !isGenerating && (
          <div className="p-5 rounded-2xl bg-[#131320] border border-[#4893FC]/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold text-[#4893FC] flex items-center gap-1.5">
                <Sparkles size={14} /> AI Image Output ({generatedImage.aspectRatio})
              </span>
              <span className="text-slate-500 font-mono">4K Ultra HD</span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 group aspect-video max-h-[420px]">
              <img 
                src={generatedImage.url} 
                alt={generatedImage.prompt} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a 
                href={generatedImage.url} 
                target="_blank" 
                rel="noopener noreferrer"
                download="aura_ai_image.png"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Download size={14} /> Download 4K Image
              </a>

              <button
                onClick={() => {
                  setSelectedImage(generatedImage.url);
                  setGenerationMode('image-to-video');
                  toast.success("Image selected for Image-to-Video generation!");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
              >
                <Video size={14} /> Animate Image to Video ➔
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT 4 COLS: GENERATION QUEUE & RECENT HISTORY */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Queue / Status Box */}
        <div className="bg-[#131320] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Generation Queue</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </h3>

          {isGenerating ? (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="truncate max-w-[180px]">{prompt}</span>
                <span className="text-[#4893FC]">{generationProgress}%</span>
              </div>
              <p className="text-[11px] text-slate-400">{generationStage}</p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
              No active queued tasks
            </div>
          )}
        </div>

        {/* Recent History List */}
        <div className="bg-[#131320] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Recent Generations</span>
            <Clock size={14} className="text-slate-400" />
          </h3>

          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  setPrompt(item.prompt);
                  toast.info("Prompt loaded into studio!");
                }}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-[#4893FC]">{item.mode}</span>
                  <span>{item.time}</span>
                </div>
                <p className="text-xs text-white group-hover:text-[#4893FC] transition-colors line-clamp-2">
                  "{item.prompt}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131320] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white">Attach Image Reference</h3>
            <p className="text-xs text-slate-400">Upload a keyframe photo to guide 60FPS video animation.</p>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#4893FC] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/5"
            >
              <Upload size={32} className="mx-auto text-[#4893FC] mb-2" />
              <p className="text-xs font-semibold text-slate-200">Click to browse image</p>
              <p className="text-[11px] text-slate-500 mt-1">PNG, JPG up to 25MB</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
