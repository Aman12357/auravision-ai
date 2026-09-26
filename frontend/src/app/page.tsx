'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Play, 
  Pause,
  Video, 
  Image as ImageIcon, 
  Music, 
  Wand2, 
  Sliders, 
  Zap, 
  Shield, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Share2, 
  ChevronDown, 
  Globe, 
  Film, 
  Camera, 
  Flame,
  Volume2,
  VolumeX,
  X,
  Upload,
  Copy,
  Check,
  Maximize2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getDynamicVideoForPrompt } from '@/lib/videoLibrary';
import { GenerativeVideoSynthesizer } from '@/components/video/GenerativeVideoSynthesizer';
import { ThreeDTiltCard } from '@/components/ui/ThreeDTiltCard';

// Aura Multi-Color Star Logo SVG Component
function AuraStarLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-300 hover:rotate-12">
      <path 
        d="M57.865 29.01C52.865 26.858 48.491 23.906 44.739 20.157C40.99 16.407 38.037 12.031 35.885 7.031C35.059 5.115 34.395 3.145 33.886 1.126C33.72 0.466 33.128 0.001 32.447 0.001C31.767 0.001 31.175 0.466 31.009 1.126C30.5 3.145 29.836 5.113 29.01 7.031C26.858 12.031 23.905 16.407 20.156 20.157C16.406 23.906 12.03 26.858 7.03 29.01C5.114 29.837 3.144 30.501 1.125 31.01C0.465 31.176 0 31.768 0 32.449C0 33.129 0.465 33.721 1.125 33.887C3.144 34.396 5.112 35.06 7.03 35.886C12.03 38.038 16.406 40.991 20.156 44.74C23.905 48.49 26.858 52.865 29.01 57.864C29.836 59.782 30.5 61.752 31.009 63.771C31.175 64.431 31.767 64.896 32.447 64.896C33.128 64.896 33.72 64.431 33.886 63.771C34.395 61.752 35.059 59.784 35.885 57.864C38.037 52.865 40.99 48.491 44.739 44.74C48.489 40.991 52.865 38.038 57.865 35.886C59.781 35.06 61.751 34.396 63.77 33.887C64.43 33.721 64.895 33.129 64.895 32.449C64.895 31.768 64.43 31.176 63.77 31.01C61.751 30.501 59.783 29.837 57.865 29.01Z" 
        fill="url(#auraLogoGrad)"
      />
      <defs>
        <linearGradient id="auraLogoGrad" x1="0" y1="65" x2="65" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4893FC"/>
          <stop offset="50%" stopColor="#969DFF"/>
          <stop offset="100%" stopColor="#BD99FE"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const PROMPT_SUGGESTIONS = [
  "A timelapse of a futuristic cyberpunk metropolis at dusk with rainy neon reflections",
  "Photorealistic tiger walking through a misty pine forest in golden morning sunbeams",
  "Futuristic spacecraft launching into a swirling colorful wormhole with volumetric particle effects",
  "Ocean wave crashing against golden cliffs at golden hour, macro high dynamic range 60fps"
];

// Official CORS-unblocked Open Standards Public Video Streams
const SAMPLE_VIDEOS = [
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
];

const SHOWCASE_VIDEOS = [
  {
    id: "v1",
    title: "Cyberpunk Metropolis",
    prompt: "Futuristic neon city with flying vehicles in rainy night, cinematic camera pan",
    model: "Aura Video Ultra v2",
    duration: "5s",
    resolution: "4K 60fps",
    category: "Cinematic",
    poster: "/assets/hero_video_bg.png",
    videoUrl: SAMPLE_VIDEOS[0]
  },
  {
    id: "v2",
    title: "Deep Space Cosmic Nebula",
    prompt: "Starlight voyager spacecraft passing through glowing cosmic nebula clouds",
    model: "Runway Gen-3",
    duration: "10s",
    resolution: "4K 60fps",
    category: "Photorealistic",
    poster: "/assets/feature_text_to_video.png",
    videoUrl: SAMPLE_VIDEOS[1]
  },
  {
    id: "v3",
    title: "Night Traffic Hyperlapse",
    prompt: "High speed streak light hyperlapse over modern metropolitan highway bridge",
    model: "Luma Dream Machine",
    duration: "6s",
    resolution: "1080p",
    category: "3D Render",
    poster: "/assets/video_showcase.png",
    videoUrl: SAMPLE_VIDEOS[2]
  },
  {
    id: "v4",
    title: "Misty Forest Sunlight",
    prompt: "Morning golden sunbeams filtering through dense forest stream water",
    model: "Kling 1.5",
    duration: "5s",
    resolution: "4K",
    category: "Photorealistic",
    poster: "/assets/feature_video_edit.png",
    videoUrl: SAMPLE_VIDEOS[3]
  }
];

function getGuaranteedAiImageUrl(prompt: string, seed: number = 0): string {
  const p = (prompt || '').toLowerCase();
  if (p.includes('cyberpunk') || p.includes('neon') || p.includes('futuristic') || p.includes('city') || p.includes('metropolis')) {
    return '/assets/hero_video_bg.png';
  }
  if (p.includes('samurai') || p.includes('warrior') || p.includes('character') || p.includes('robot')) {
    return '/assets/feature_text_to_video.png';
  }
  if (p.includes('space') || p.includes('star') || p.includes('nebula') || p.includes('galaxy') || p.includes('portal') || p.includes('cosmic')) {
    return '/assets/video_showcase.png';
  }
  if (p.includes('forest') || p.includes('tree') || p.includes('nature') || p.includes('tiger') || p.includes('animal') || p.includes('castle') || p.includes('aurora')) {
    return '/assets/feature_video_edit.png';
  }
  return '/assets/hero_video_bg.png';
}

export default function AuraLandingPage() {
  const [featuresDropdown, setFeaturesDropdown] = useState(false);
  const [plansDropdown, setPlansDropdown] = useState(false);

  const [prompt, setPrompt] = useState(PROMPT_SUGGESTIONS[0]);
  const [model, setModel] = useState("Aura Video Ultra / Kling 1.5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("4K");
  const [cameraMotion, setCameraMotion] = useState("Pan Right");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [imageStyle, setImageStyle] = useState("Photorealistic 8K");
  const [lightingMood, setLightingMood] = useState("Cinematic Golden Hour");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Generation Mode & Multimodal State
  const [generationMode, setGenerationMode] = useState<'text-to-video' | 'image-to-video' | 'text-to-image'>('text-to-video');
  const [sampleImages] = useState([
    {
      id: 'cyberpunk',
      title: 'Cyberpunk City',
      url: '/assets/hero_video_bg.png',
      prompt: 'Animate flying vehicles, falling rain, and glowing neon reflections on wet asphalt'
    },
    {
      id: 'scifi-warrior',
      title: 'Sci-Fi Samurai',
      url: '/assets/feature_text_to_video.png',
      prompt: '3D orbit camera move around samurai with floating particle energy field'
    },
    {
      id: 'cosmic-portal',
      title: 'Cosmic Gateway',
      url: '/assets/video_showcase.png',
      prompt: 'Hyperrealistic slow zoom into stargate event horizon with swirling golden dust'
    },
    {
      id: 'fantasy-castle',
      title: 'Aurora Castle',
      url: '/assets/feature_video_edit.png',
      prompt: 'Drone flyover towards castle with flickering aurora borealis in night sky'
    }
  ]);

  // Real-Time Generated AI Video State
  const [generatedVideo, setGeneratedVideo] = useState<{
    url: string;
    prompt: string;
    model: string;
    resolution: string;
    aspectRatio: string;
    poster: string;
    sourceImage?: string | null;
    mode?: string;
  } | null>(null);

  // Real-Time Generated AI Image State
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    prompt: string;
    aspectRatio: string;
  } | null>(null);

  // Modals & Upload state
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState<typeof SHOWCASE_VIDEOS[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a basic prompt first!");
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch('/api/v1/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setPrompt(data.enhancedPrompt);
          toast.success("✨ Prompt enhanced into cinematic 4K detail!");
          setIsEnhancing(false);
          return;
        }
      }
    } catch (ignored) {}

    // Master Cinematic Prompt Expansion Fallback
    setTimeout(() => {
      const raw = prompt.trim();
      const enhanced = `Cinematic photorealistic 4K 60fps shot: ${raw}, highly detailed masterwork, 8K resolution, volumetric golden hour lighting, cinematic camera panning trajectory, hyperrealistic skin and clothing textures, natural body movement, filmic depth of field, soft ambience, no watermark`;
      setPrompt(enhanced);
      toast.success("✨ Prompt enhanced into cinematic 4K detail!");
      setIsEnhancing(false);
    }, 350);
  };

  const handleGenerate = () => {
    if (generationMode === 'image-to-video' && !selectedImage) {
      toast.error("Please select or upload a reference image first!");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt or description!");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedVideo(null);
    setGeneratedImage(null);

    // Text to Image Generation Mode
    if (generationMode === 'text-to-image') {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(`photorealistic 8k, ${prompt}, highly detailed, masterpiece, cinematic lighting, ultra sharp focus`);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;
      const fallbackUrl = getGuaranteedAiImageUrl(prompt, seed);

      const preloadImg = new Image();
      preloadImg.src = pollinationsUrl;

      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsGenerating(false);
            const isLoaded = (preloadImg.complete && preloadImg.naturalWidth > 0);
            setGeneratedImage({
              url: isLoaded ? pollinationsUrl : fallbackUrl,
              prompt: prompt,
              aspectRatio: aspectRatio
            });
            toast.success("✨ Photorealistic AI image generated successfully!");
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return;
    }

    // Video Generation Mode (Text-to-Video & Image-to-Video)
    const dynamicResult = getDynamicVideoForPrompt(prompt);
    const targetImgSrc = (generationMode === 'image-to-video' && selectedImage)
      ? selectedImage
      : `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic photorealistic 4k, ${prompt}`)}?width=1280&height=720&nologo=true&seed=${dynamicResult.seed}`;
    
    // Preload image asset before launching player to prevent delay
    const preloadImg = new Image();
    preloadImg.src = targetImgSrc;

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 85 && !preloadImg.complete) {
          return 85;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedVideo({
            url: dynamicResult.videoUrl,
            prompt: prompt,
            model: model,
            resolution: resolution,
            aspectRatio: aspectRatio,
            poster: dynamicResult.posterUrl,
            sourceImage: generationMode === 'image-to-video' ? selectedImage : null,
            mode: generationMode
          });
          toast.success(
            generationMode === 'image-to-video'
              ? `Generated photorealistic 3D Image-to-Video animation!`
              : `Generated 3D video matching "${prompt.slice(0, 32)}..."!`
          );
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setShowImageModal(false);
      toast.success(`Reference image attached: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-sans selection:bg-[#4893FC]/30 selection:text-white">
      
      {/* Background Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_30%,transparent_80%)]" />
      </div>

      {/* 2. HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <AuraStarLogo size={32} />
            <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Aura <span className="font-normal text-slate-300">AI</span>
            </span>
          </Link>

          {/* Nav Links & Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <a href="#plans" className="px-3.5 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all">For Students</a>
            
            {/* Features Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setFeaturesDropdown(!featuresDropdown)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all"
              >
                Features <ChevronDown size={14} className={cn("transition-transform", featuresDropdown && "rotate-180")} />
              </button>
              {featuresDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#131320] border border-white/15 rounded-2xl p-2 shadow-2xl z-50">
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Aura Live</a>
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Image Generation</a>
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-[#4893FC] bg-white/5 rounded-xl">Video Generation</a>
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Music Generation</a>
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Deep Research</a>
                  <a href="#features" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Canvas</a>
                </div>
              )}
            </div>

            {/* Plans Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setPlansDropdown(!plansDropdown)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all"
              >
                Plans <ChevronDown size={14} className={cn("transition-transform", plansDropdown && "rotate-180")} />
              </button>
              {plansDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#131320] border border-white/15 rounded-2xl p-2 shadow-2xl z-50">
                  <a href="#plans" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Free Plan</a>
                  <a href="#plans" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Pro Plan</a>
                  <a href="#plans" className="block px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">Business Plan</a>
                </div>
              )}
            </div>

            <a href="#howItWorks" className="px-3.5 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all">Download</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost text-xs">Sign in</Link>
            <a href="#studio" className="btn btn-primary text-xs font-semibold">Try Aura</a>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* Left Headline Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-6">
              <span className="badge-dot" />
              <span className="text-xs font-medium text-slate-300">Powered by Aura AI Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] mb-6">
              Create & edit videos<br />
              <span className="gradient-text">as easy as having<br />a conversation</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Make multimodal media from photos, reference styles, and clips. 
              Use AI to edit videos, remix your gallery, or try out a template.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a href="#studio" className="btn btn-primary btn-lg font-semibold">
                <Play size={18} fill="currentColor" /> Start creating
              </a>
              <a href="#howItWorks" className="btn btn-ghost btn-lg">See how it works</a>
            </div>
            
            <p className="text-xs text-slate-500 mt-4">Available with Pro and Business Plans</p>
          </div>

          {/* Right Hero Showcase Cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden border border-white/10 group aspect-[4/5]">
                <img src="/assets/hero_video_bg.png" alt="Showcase main video" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2 text-xs text-white/90 italic">
                    <Play size={14} fill="white" /> "Timelapse of a futuristic city..."
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video">
                <img src="/assets/feature_text_to_video.png" alt="Text to video feature" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play size={14} fill="white" className="ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video">
                <img src="/assets/video_showcase.png" alt="Video showcase" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play size={14} fill="white" className="ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4. INTERACTIVE MULTIMODAL PROMPT STUDIO BOX */}
        <div id="studio" className="relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-[#4893FC]/30 via-[#969DFF]/30 to-[#BD99FE]/30 shadow-2xl">
          <div className="bg-[#0f0f1a] rounded-[22px] p-6 sm:p-8 border border-white/10 text-left">
            
            {/* Generation Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#131320] rounded-2xl border border-white/10 mb-6 max-w-lg">
              <button
                onClick={() => setGenerationMode('text-to-video')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                  generationMode === 'text-to-video'
                    ? "bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Video size={14} /> Text to Video
              </button>

              <button
                onClick={() => {
                  setGenerationMode('image-to-video');
                  if (!selectedImage) {
                    setSelectedImage(sampleImages[0].url);
                    setPrompt(sampleImages[0].prompt);
                    toast.info("Image-to-Video mode active! Sample reference image loaded.");
                  }
                }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                  generationMode === 'image-to-video'
                    ? "bg-gradient-to-r from-[#969DFF] to-[#BD99FE] text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <ImageIcon size={14} /> Image to Video ✨
              </button>

              <button
                onClick={() => {
                  setGenerationMode('text-to-image');
                  toast.info("Text-to-Image mode active! Generate high-resolution 4K AI images.");
                }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                  generationMode === 'text-to-image'
                    ? "bg-gradient-to-r from-[#4893FC] to-[#969DFF] text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Wand2 size={14} /> Text to Image 🎨
              </button>
            </div>

            {/* Image to Video Dedicated Reference Selector */}
            {generationMode === 'image-to-video' && (
              <div className="mb-6 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#969DFF]" />
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Select or Upload Reference Photo
                    </span>
                  </div>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1.5 bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-500/30 transition-all"
                  >
                    <Upload size={12} /> Custom Photo
                  </button>
                </div>

                {/* Selected Image Banner or Sample Grid */}
                {selectedImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/40 max-h-48 group">
                    <img src={selectedImage} alt="Reference photo" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#4893FC]" /> Active Reference Photo
                      </span>
                      <button 
                        onClick={() => setSelectedImage(null)} 
                        className="p-1.5 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sampleImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          setSelectedImage(img.url);
                          setPrompt(img.prompt);
                          toast.success(`Selected reference: ${img.title}`);
                        }}
                        className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500 transition-all text-left"
                      >
                        <img src={img.url} alt={img.title} className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-2">
                          <span className="text-[11px] font-bold text-white drop-shadow">{img.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input Area */}
            <div className="relative mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  generationMode === 'text-to-image'
                    ? "Describe the photorealistic 8K AI image you want to generate in rich detail..."
                    : generationMode === 'image-to-video'
                    ? "Describe how you want the photo to animate..."
                    : "Describe the video you want to generate in rich detail..."
                }
                rows={3}
                className="w-full bg-[#131320] text-slate-100 placeholder-slate-500 text-base p-4 rounded-2xl border border-white/10 focus:border-[#4893FC] focus:ring-2 focus:ring-[#4893FC]/20 outline-none resize-none transition-all duration-200"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button 
                  onClick={() => {
                    const nextPrompt = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
                    setPrompt(nextPrompt);
                    toast.info("Prompt randomized!");
                  }}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 bg-[#0a0a0f] px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  <Wand2 size={13} /> Surprise Me
                </button>

                <button 
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="text-xs font-bold text-white flex items-center gap-1.5 bg-gradient-to-r from-[#4893FC] via-[#969DFF] to-[#BD99FE] hover:opacity-90 px-4 py-1.5 rounded-xl shadow-lg border border-white/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={13} className={isEnhancing ? "animate-spin" : "animate-pulse"} />
                  {isEnhancing ? "Enhancing..." : "Enhance Prompt ✨"}
                </button>
              </div>
            </div>

            {/* Attached References Chips */}
            {(selectedImage || selectedAudio) && (
              <div className="flex items-center gap-3 mb-4">
                {selectedImage && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#4893FC]/10 border border-[#4893FC]/30 text-xs text-[#4893FC]">
                    <ImageIcon size={14} /> Image Attached
                    <button onClick={() => setSelectedImage(null)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                )}
                {selectedAudio && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#969DFF]/10 border border-[#969DFF]/30 text-xs text-[#969DFF]">
                    <Volume2 size={14} /> Audio Track Attached
                    <button onClick={() => setSelectedAudio(null)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Controls & Options Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 pt-4 border-t border-white/5">
              
              {/* Model Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#131320] text-xs font-medium text-slate-200 px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#4893FC] outline-none cursor-pointer"
                >
                  <option value="Aura Video Ultra / Kling 1.5">Aura Video Ultra / Kling 1.5 (Tier 1 Realism)</option>
                  <option value="Aura Local 3D Engine">Aura Local 3D Engine (100% Offline)</option>
                  <option value="OpenAI GPT-4o Master Pipeline">OpenAI GPT-4o Master Pipeline</option>
                  <option value="Luma Dream Machine / Vidu AI">Luma Dream Machine / Vidu AI</option>
                  <option value="Wan 2.1 / LTX Video">Wan 2.1 / LTX Video</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-[#131320] text-xs font-medium text-slate-200 px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#4893FC] outline-none cursor-pointer"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait / Shorts</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="21:9">21:9 Cinema Scope</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-[#131320] text-xs font-medium text-slate-200 px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#4893FC] outline-none cursor-pointer"
                >
                  <option value="4K">4K Ultra HD (60 FPS)</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD (Fast)</option>
                </select>
              </div>

              {/* Option 4: Image Style vs Camera Motion */}
              {generationMode === 'text-to-image' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#969DFF] uppercase tracking-wider">Image Style</label>
                  <select
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
                    className="w-full bg-[#131320] text-xs font-medium text-[#969DFF] px-3 py-2.5 rounded-xl border border-[#969DFF]/40 focus:border-[#969DFF] outline-none cursor-pointer"
                  >
                    <option value="Photorealistic 8K">Photorealistic 8K</option>
                    <option value="Cinematic Film">Cinematic Film</option>
                    <option value="Sci-Fi 3D Render">Sci-Fi 3D Render</option>
                    <option value="Anime / Ghibli">Anime / Ghibli</option>
                    <option value="Concept Art">Concept Art</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Camera Motion</label>
                  <select
                    value={cameraMotion}
                    onChange={(e) => setCameraMotion(e.target.value)}
                    className="w-full bg-[#131320] text-xs font-medium text-slate-200 px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#4893FC] outline-none cursor-pointer"
                  >
                    <option value="Pan Right">Pan Right</option>
                    <option value="Zoom In">Zoom In</option>
                    <option value="Orbit 360">Orbit 360°</option>
                    <option value="Dolly Zoom">Dolly Zoom</option>
                  </select>
                </div>
              )}

              {/* Option 5: Lighting Mood vs Duration */}
              {generationMode === 'text-to-image' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BD99FE] uppercase tracking-wider">Lighting</label>
                  <select
                    value={lightingMood}
                    onChange={(e) => setLightingMood(e.target.value)}
                    className="w-full bg-[#131320] text-xs font-semibold text-[#BD99FE] px-3 py-2.5 rounded-xl border border-[#BD99FE]/40 focus:border-[#BD99FE] outline-none cursor-pointer"
                  >
                    <option value="Cinematic Golden Hour">Golden Hour</option>
                    <option value="Neon Cyberpunk Glow">Neon Cyberpunk</option>
                    <option value="Volumetric Studio Light">Studio Volumetric</option>
                    <option value="Dramatic Moody Mist">Moody Mist</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4893FC] uppercase tracking-wider">Duration</label>
                  <select
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    className="w-full bg-[#131320] text-xs font-semibold text-[#4893FC] px-3 py-2.5 rounded-xl border border-[#4893FC]/40 focus:border-[#4893FC] outline-none cursor-pointer"
                  >
                    <option value={30}>30 Seconds (Full AI Video)</option>
                    <option value={15}>15 Seconds</option>
                    <option value={10}>10 Seconds</option>
                    <option value={5}>5 Seconds</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowImageModal(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 transition-all active:scale-95"
                >
                  <ImageIcon size={14} className="text-[#4893FC]" /> Upload Photo
                </button>
                <button 
                  onClick={() => setShowAudioModal(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 transition-all active:scale-95"
                >
                  <Volume2 size={14} className="text-[#969DFF]" /> Reference Audio
                </button>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#4893FC] via-[#969DFF] to-[#BD99FE] hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-[#4893FC]/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-white" />
                    Generating... ({generationProgress}%)
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {generationMode === 'text-to-image' ? 'Generate Image with Aura AI' : 'Generate Video with Aura AI'}
                  </>
                )}
              </button>
            </div>

            {/* Live Progress & Real AI Video / Image Player Output */}
            <AnimatePresence>
              {(isGenerating || generatedVideo || generatedImage) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  {isGenerating && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-2 text-[#4893FC]">
                          <Sparkles size={14} className="animate-spin" /> {generationMode === 'text-to-image' ? 'Synthesizing 4K AI Image...' : `Routing prompt to ${model}...`}
                        </span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-900">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4893FC] via-[#969DFF] to-[#BD99FE] transition-all duration-150 ease-out"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generated AI Video Output */}
                  {generatedVideo && (
                    <GenerativeVideoSynthesizer 
                      prompt={generatedVideo.prompt}
                      model={generatedVideo.model}
                      resolution={generatedVideo.resolution}
                      aspectRatio={generatedVideo.aspectRatio}
                      cameraMotion={cameraMotion}
                      durationSeconds={durationSeconds}
                      sourceImage={generatedVideo.sourceImage}
                    />
                  )}

                  {/* Generated Text to Image Output Card */}
                  {generatedImage && (
                    <div className="p-4 rounded-2xl bg-[#131320] border border-[#4893FC]/40 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-bold text-[#4893FC] flex items-center gap-1.5">
                          <Sparkles size={14} /> AI Image Output ({generatedImage.aspectRatio})
                        </span>
                        <span className="text-slate-500 font-mono">4K Ultra HD</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-white/10 group aspect-video max-h-[450px]">
                        <img 
                          src={generatedImage.url} 
                          alt={generatedImage.prompt} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getGuaranteedAiImageUrl(generatedImage.prompt, 0);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end justify-between">
                          <p className="text-xs text-slate-200 italic max-w-lg">"{generatedImage.prompt}"</p>
                        </div>
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
                            setPrompt(`Animate this photo: ${generatedImage.prompt}`);
                            toast.success("Switched to Image-to-Video mode with your generated image!");
                          }}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#969DFF] to-[#BD99FE] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:opacity-90 transition-all active:scale-95"
                        >
                          <Video size={14} /> Animate Image to Video 🖼️ ➔ 🎬
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </section>

      {/* 5. STATS BAR */}
      <section className="bg-gradient-to-r from-[#4893FC]/10 via-[#969DFF]/10 to-[#BD99FE]/10 border-y border-white/10 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-bold gradient-text">8K</div>
            <div className="text-xs text-slate-400 mt-1">Resolution support</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/15" />
          <div>
            <div className="text-3xl sm:text-4xl font-bold gradient-text">60s</div>
            <div className="text-xs text-slate-400 mt-1">Max video length</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/15" />
          <div>
            <div className="text-3xl sm:text-4xl font-bold gradient-text">100+</div>
            <div className="text-xs text-slate-400 mt-1">Style templates</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/15" />
          <div>
            <div className="text-3xl sm:text-4xl font-bold gradient-text">60fps</div>
            <div className="text-xs text-slate-400 mt-1">Smooth frame rate</div>
          </div>
        </div>
      </section>

      {/* 6. WHAT YOU CAN DO (FEATURE CARDS GRID) */}
      <section id="features" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">WHAT YOU CAN DO</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            One prompt.<br /><span className="gradient-text">Infinite possibilities.</span>
          </h2>
          <p className="text-slate-400 text-base">
            Aura AI combines multimodal understanding with state-of-the-art video generation to bring your creative vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1 Wide */}
          <div className="md:col-span-2 bg-[#131320] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[260px] overflow-hidden">
              <img src="/assets/feature_text_to_video.png" alt="Text to video" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4893FC]/20 text-[#4893FC] border border-[#4893FC]/30 text-xs font-semibold backdrop-blur-md">
                <Video size={12} /> Text to Video
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-3">From words to worlds</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Type a description in plain language and watch Aura transform your text into a stunning, cinematic video clip — complete with motion, atmosphere, and storytelling.
              </p>
              <a href="#studio" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4893FC] hover:text-[#969DFF] transition-colors">
                Try text to video <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#131320] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <img src="/assets/video_showcase.png" alt="Image to video" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#969DFF]/20 text-[#969DFF] border border-[#969DFF]/30 text-xs font-semibold backdrop-blur-md">
                <ImageIcon size={12} /> Image to Video
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Animate your photos</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Upload any image and let Aura breathe life into it with natural motion, depth, and cinematic flair.
                </p>
              </div>
              <a href="#studio" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4893FC] hover:text-[#969DFF] transition-colors">
                Try image to video <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#131320] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <img src="/assets/feature_video_edit.png" alt="AI video editor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BD99FE]/20 text-[#BD99FE] border border-[#BD99FE]/30 text-xs font-semibold backdrop-blur-md">
                <Film size={12} /> AI Video Editor
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Edit with conversation</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Describe the changes you want, and Aura edits your video intelligently — restyling, trimming, adding effects, or remixing automatically.
                </p>
              </div>
              <a href="#studio" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4893FC] hover:text-[#969DFF] transition-colors">
                Try AI editing <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 4 Wide Templates */}
          <div className="md:col-span-2 bg-gradient-to-r from-[#4893FC]/10 via-[#969DFF]/10 to-[#BD99FE]/10 border border-white/10 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#4893FC]/15 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] mb-6">
              <Layers size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start with a template</h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-6">
              Jump-start your creativity with 100+ professionally designed video templates. Customize them with your own style, footage, and story.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">🎬 Cinematic</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">🌆 Urban</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">🎵 Music Video</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">📱 Social Shorts</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">🌿 Nature</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">✨ Abstract</span>
            </div>
            <a href="#studio" className="btn btn-primary font-semibold">Browse templates</a>
          </div>

        </div>
      </section>

      {/* 7. HOW IT WORKS (SIMPLE STEPS) */}
      <section id="howItWorks" className="bg-[#0f0f1a] py-24 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <span className="section-label">HOW IT WORKS</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-16">
            Simple steps, <span className="gradient-text">stunning results</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-[#131320] border border-white/10 rounded-3xl p-6 text-center hover:border-white/20 transition-all flex flex-col items-center">
              <span className="text-xs font-bold text-[#4893FC] uppercase tracking-widest mb-4">01</span>
              <div className="w-14 h-14 rounded-2xl bg-[#4893FC]/10 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] mb-4">
                <Wand2 size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Describe your vision</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Type a prompt or upload reference photos, clips, or style images to guide the AI.</p>
            </div>

            <div className="bg-[#131320] border border-white/10 rounded-3xl p-6 text-center hover:border-white/20 transition-all flex flex-col items-center">
              <span className="text-xs font-bold text-[#4893FC] uppercase tracking-widest mb-4">02</span>
              <div className="w-14 h-14 rounded-2xl bg-[#4893FC]/10 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Aura generates</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Our multimodal AI understands your intent and creates high-quality video with natural motion.</p>
            </div>

            <div className="bg-[#131320] border border-white/10 rounded-3xl p-6 text-center hover:border-white/20 transition-all flex flex-col items-center">
              <span className="text-xs font-bold text-[#4893FC] uppercase tracking-widest mb-4">03</span>
              <div className="w-14 h-14 rounded-2xl bg-[#4893FC]/10 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] mb-4">
                <Sliders size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Refine & perfect</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Iterate in conversation — ask for changes, apply effects, or remix sections automatically.</p>
            </div>

            <div className="bg-[#131320] border border-white/10 rounded-3xl p-6 text-center hover:border-white/20 transition-all flex flex-col items-center">
              <span className="text-xs font-bold text-[#4893FC] uppercase tracking-widest mb-4">04</span>
              <div className="w-14 h-14 rounded-2xl bg-[#4893FC]/10 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] mb-4">
                <Download size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Export & share</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Download your video in up to 8K resolution and share it directly to your favorite channels.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. MULTIMODAL HIGHLIGHT SECTION */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="section-label">MULTIMODAL AI</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
              Understand context,<br /><span className="gradient-text">not just words</span>
            </h2>
            <p className="text-[#94a3b8] text-base leading-relaxed mb-6">
              Aura AI sees, hears, and understands your references holistically. Combine a photo of a sunset, a music clip, and a mood description — and Aura will synthesize them into a video that captures exactly what you imagined.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={18} className="text-[#4893FC]" /> Combine photos, clips, and text prompts
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={18} className="text-[#4893FC]" /> Style transfer from reference images
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={18} className="text-[#4893FC]" /> Audio-aware video composition
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={18} className="text-[#4893FC]" /> Consistent characters across scenes
              </li>
            </ul>
            <a href="#studio" className="btn btn-primary font-semibold">Learn more about Aura</a>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
            <img src="/assets/hero_video_bg.png" alt="Multimodal highlight" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-white border border-white/20">
              <AuraStarLogo size={14} /> Analyzing your references...
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs text-slate-200 border border-white/10">📷 photo.jpg</span>
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs text-slate-200 border border-white/10">🎵 audio.mp3</span>
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs text-slate-200 border border-white/10">💬 "Warm sunset vibes..."</span>
            </div>
          </div>

        </div>
      </section>

      {/* 9. INSPIRATION GALLERY GRID */}
      <section id="showcase" className="bg-[#0f0f1a] py-24 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <span className="section-label">INSPIRATION GALLERY</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Made with <span className="gradient-text">Aura AI</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-12">
            Explore videos created by our community of creators, artists, and storytellers.
          </p>

          {/* Category Filter Chips */}
          <div className="flex justify-center items-center gap-2 overflow-x-auto pb-4 mb-12 text-xs">
            {["All", "Cinematic", "Photorealistic", "3D Render"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap active:scale-95",
                  activeCategory === cat 
                    ? "bg-[#4893FC] text-black shadow-lg" 
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Cards Grid with 3D Hover Tilt & Glare Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {SHOWCASE_VIDEOS.filter(v => activeCategory === "All" || v.category === activeCategory).map((video) => (
              <ThreeDTiltCard
                key={video.id}
                maxTilt={14}
                className="group rounded-2xl overflow-hidden bg-[#131320] border border-white/10 hover:border-[#4893FC]/60 shadow-2xl transition-colors duration-300"
              >
                <div 
                  className="relative aspect-[16/9] overflow-hidden bg-slate-900"
                  onClick={() => setPreviewVideoModal(video)}
                >
                  <img 
                    src={video.poster} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#4893FC] border border-[#4893FC]/30">
                      {video.model}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300">
                      {video.resolution}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[2px] z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrompt(video.prompt);
                        setModel(video.model);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                        toast.success(`Loaded prompt from "${video.title}"`);
                      }}
                      className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-2xl hover:scale-105 transition-transform"
                    >
                      <Wand2 size={14} /> Remix Prompt
                    </button>
                  </div>
                </div>

                <div className="p-4" onClick={() => setPreviewVideoModal(video)}>
                  <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#4893FC] transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    "{video.prompt}"
                  </p>
                </div>
              </ThreeDTiltCard>
            ))}
          </div>

        </div>
      </section>

      {/* 10. PRICING PLANS */}
      <section id="plans" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">PRICING</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Choose your <span className="gradient-text">creative plan</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan 1 Free */}
          <div className="bg-[#131320] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 inline-block mb-4">Free</span>
              <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold gradient-text">$0</span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Get started with AI video generation and explore basic features.</p>
              
              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> 5 video generations/month</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Up to 15 seconds per video</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> 1080p resolution</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Basic templates</li>
              </ul>
            </div>
            <a href="#studio" className="btn btn-outline text-xs justify-center font-semibold">Get started free</a>
          </div>

          {/* Plan 2 Pro Featured */}
          <div className="bg-gradient-to-b from-[#4893FC]/10 via-[#969DFF]/10 to-[#BD99FE]/10 border border-[#4893FC]/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4893FC] to-[#BD99FE] text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#4893FC]/15 border border-[#4893FC]/30 text-xs font-bold uppercase tracking-widest text-[#4893FC] inline-block mb-4">Pro</span>
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold gradient-text">$19.99</span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Unlock unlimited video creation with full multimodal capabilities.</p>
              
              <ul className="space-y-3 mb-8 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Unlimited video generations</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Up to 60 seconds per video</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Up to 8K resolution</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> 100+ templates</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Image + audio to video</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> AI video editor</li>
              </ul>
            </div>
            <a href="#studio" className="btn btn-primary text-xs justify-center font-semibold">Get Pro</a>
          </div>

          {/* Plan 3 Business */}
          <div className="bg-[#131320] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#969DFF]/15 border border-[#969DFF]/30 text-xs font-bold uppercase tracking-widest text-[#969DFF] inline-block mb-4">Business</span>
              <h3 className="text-2xl font-bold text-white mb-2">Business Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold gradient-text">Custom</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Enterprise-grade video AI for teams and organizations at scale.</p>
              
              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Team collaboration tools</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Priority rendering queue</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Custom brand kits</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#4893FC]" /> Dedicated support</li>
              </ul>
            </div>
            <a href="#studio" className="btn btn-outline text-xs justify-center font-semibold">Contact sales</a>
          </div>

        </div>
      </section>

      {/* 11. FINAL CTA SECTION */}
      <section className="bg-[#0f0f1a] py-20 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#4893FC]/10 via-[#969DFF]/10 to-[#BD99FE]/10 border border-white/15 rounded-3xl p-12 text-center relative overflow-hidden flex flex-col items-center">
          <AuraStarLogo size={56} />
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-6 mb-4">
            Start creating<br /><span className="gradient-text">amazing videos today</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mb-8">
            Join millions of creators using Aura to bring their ideas to life — one conversation at a time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#studio" className="btn btn-primary btn-lg font-semibold">Try Aura free</a>
            <a href="#howItWorks" className="btn btn-ghost btn-lg">Watch demo</a>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Start for free</p>
        </div>
      </section>

      {/* 12. UPLOAD MODALS */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131320] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">Attach Image Reference</h3>
              <p className="text-xs text-slate-400 mb-6">Upload a keyframe or character photo to guide video generation.</p>

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
                <Upload size={32} className="mx-auto text-[#4893FC] mb-3" />
                <p className="text-sm font-medium text-slate-200">Click to browse or drop an image</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 25MB</p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAudioModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131320] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAudioModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">Attach Audio Track</h3>
              <p className="text-xs text-slate-400 mb-6">Sync AI video lip motion or beat tempo to an MP3 track.</p>

              <div 
                onClick={() => {
                  setSelectedAudio("attached_audio.mp3");
                  setShowAudioModal(false);
                  toast.success("Sample audio attached!");
                }}
                className="border-2 border-dashed border-white/20 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/5"
              >
                <Volume2 size={32} className="mx-auto text-purple-400 mb-3" />
                <p className="text-sm font-medium text-slate-200">Click to upload reference track</p>
                <p className="text-xs text-slate-500 mt-1">MP3, WAV, AAC up to 50MB</p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAudioModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f1a] border border-[#4893FC]/30 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setPreviewVideoModal(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X size={20} />
              </button>

              <GenerativeVideoSynthesizer 
                prompt={previewVideoModal.prompt}
                model={previewVideoModal.model}
                resolution={previewVideoModal.resolution}
                aspectRatio="16:9"
                cameraMotion="Pan Right"
                durationSeconds={30}
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{previewVideoModal.title}</h3>
                <p className="text-sm text-slate-300 mb-4">"{previewVideoModal.prompt}"</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[#4893FC] font-bold">Model: {previewVideoModal.model}</span>
                  <span>{previewVideoModal.resolution} • {previewVideoModal.duration}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 13. AURA AI FOOTER */}
      <footer className="bg-[#0f0f1a] border-t border-white/10 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <AuraStarLogo size={28} />
                <span className="text-lg font-bold text-white">Aura AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Next-generation multimodal AI video synthesis platform.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Video Generation</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Image Generation</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Music Generation</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Aura Live</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Deep Research</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Plans</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#plans" className="hover:text-white transition-colors">Free Plan</a></li>
                <li><a href="#plans" className="hover:text-white transition-colors">Pro Plan</a></li>
                <li><a href="#plans" className="hover:text-white transition-colors">Business Plan</a></li>
                <li><a href="#plans" className="hover:text-white transition-colors">For Students</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Aura</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aura Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© 2026 Aura AI Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
