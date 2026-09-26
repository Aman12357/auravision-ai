import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize, Volume2, VolumeX, Download, Share2, AlertCircle, RotateCcw } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  resolution?: string;
  className?: string;
  onError?: () => void;
}

export function VideoPlayer({ src, poster, resolution = '1080p', className, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHovering) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case 'arrowleft':
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovering]);

  const handleMouseMove = () => {
    setIsHovering(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setIsHovering(false), 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / duration) * 100);
    }
  };

  if (hasError) {
    return (
      <div className={cn("bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-8 aspect-video", className)}>
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-slate-300 font-medium mb-4">Failed to load video</p>
        <button 
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            if(videoRef.current) videoRef.current.load();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative group bg-black rounded-xl overflow-hidden aspect-video", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if(isPlaying) setIsHovering(false); }}
    >
      <motion.video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        onEnded={() => setIsPlaying(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading && !poster ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"
          >
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolution Badge */}
      <div className="absolute top-4 right-4 z-20 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white border border-white/10">
        {resolution}
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {(isHovering || !isPlaying) && !hasError && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20"
          >
            {/* Seek Bar */}
            <div 
              className="w-full h-1.5 bg-white/20 hover:bg-white/30 rounded-full mb-4 cursor-pointer group-hover/seek:h-2 transition-all relative"
              onClick={handleProgressClick}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-violet-500 rounded-full"
                style={{ width: `${progress || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-violet-400 transition-colors">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-2 group/vol">
                  <button onClick={toggleMute} className="hover:text-violet-400 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-20 transition-all opacity-0 group-hover/vol:opacity-100 accent-violet-500 h-1.5"
                  />
                </div>

                <div className="text-sm font-medium tabular-nums text-white/80">
                  {formatDuration(currentTime)} / {formatDuration(duration || 0)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button title="Download" className="hover:text-violet-400 transition-colors">
                  <Download size={20} />
                </button>
                <button title="Share" className="hover:text-violet-400 transition-colors">
                  <Share2 size={20} />
                </button>
                <button onClick={toggleFullscreen} className="hover:text-violet-400 transition-colors">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
