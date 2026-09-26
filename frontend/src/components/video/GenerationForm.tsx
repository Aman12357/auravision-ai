import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Sliders, ChevronDown, ChevronUp, Image as ImageIcon, 
  Video, FileText, Type, Maximize, Play, Square, Settings, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { videosApi } from '@/lib/api/videos';

// Schema
const formSchema = z.object({
  mode: z.enum(['text2video', 'image2video', 'video2video']),
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
  negativePrompt: z.string().max(1000).optional(),
  duration: z.number().min(5).max(120),
  fps: z.enum(['24', '30', '60']),
  resolution: z.enum(['720p', '1080p', '2K', '4K']),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']),
  cameraMotion: z.enum(['None', 'Pan Left', 'Pan Right', 'Zoom In', 'Zoom Out', 'Dolly', 'Orbit', 'Tilt Up', 'Tilt Down']),
  style: z.string(),
  lighting: z.string(),
  mood: z.string(),
  seed: z.number().optional(),
  settings: z.object({
    filmGrain: z.boolean(),
    motionBlur: z.boolean(),
    depthOfField: z.boolean()
  }),
  provider: z.string()
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  mode: 'text2video',
  prompt: '',
  negativePrompt: '',
  duration: 5,
  fps: '30',
  resolution: '1080p',
  aspectRatio: '16:9',
  cameraMotion: 'None',
  style: 'Cinematic',
  lighting: 'Natural/Sun',
  mood: 'Epic',
  seed: Math.floor(Math.random() * 1000000),
  settings: {
    filmGrain: false,
    motionBlur: false,
    depthOfField: true
  },
  provider: 'auto'
};

const styles = ['Realistic', 'Cinematic', 'Anime', '3D', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Fantasy'];
const lightings = ['Natural/Sun', 'Studio/Lightbulb', 'Cinematic/Film', 'Golden Hour/Sunset', 'Night/Moon'];
const moods = ['Epic', 'Calm', 'Dramatic', 'Playful', 'Dark', 'Romantic', 'Mysterious', 'Energetic'];
const providers = [
  { id: 'auto', name: 'Auto (Recommended)', quality: 5, speed: 4, cost: 2 },
  { id: 'runway', name: 'Runway Gen-2', quality: 5, speed: 3, cost: 3 },
  { id: 'pika', name: 'Pika Labs', quality: 4, speed: 5, cost: 1 },
  { id: 'luma', name: 'Luma Dream Machine', quality: 5, speed: 2, cost: 3 },
];

export function GenerationForm({ workspaceId, onSubmitJob }: { workspaceId: string, onSubmitJob: (data: FormValues) => Promise<void> }) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNegative, setShowNegative] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const watchAll = watch();

  useEffect(() => {
    // Credit cost estimator
    let resMult = 1;
    if (watchAll.resolution === '1080p') resMult = 1.5;
    else if (watchAll.resolution === '2K') resMult = 2;
    else if (watchAll.resolution === '4K') resMult = 3;
    
    let qualMult = providers.find(p => p.id === watchAll.provider)?.cost || 2;
    
    setEstimatedCost(Math.ceil(watchAll.duration * resMult * qualMult));
  }, [watchAll.duration, watchAll.resolution, watchAll.provider]);

  const handleEnhance = async () => {
    const prompt = watchAll.prompt;
    if (!prompt) return;
    
    setIsEnhancing(true);
    try {
      const response = await videosApi.enhancePrompt(prompt);
      if (response.data?.data?.enhancedPrompt) {
        setValue('prompt', response.data.data.enhancedPrompt);
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const submitForm = async (data: FormValues) => {
    if (estimatedCost > 100) {
      if (!window.confirm(`This generation will cost ${estimatedCost} credits. Proceed?`)) {
        return;
      }
    }
    
    setIsSubmitting(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + 5;
      });
    }, 500);

    try {
      await onSubmitJob(data);
      setProgress(100);
      setTimeout(() => {
        setIsSubmitting(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Failed to submit job:", error);
      setIsSubmitting(false);
      setProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="w-full bg-[#0F172A] rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(['text2video', 'image2video', 'video2video'] as const).map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => setValue('mode', mode)}
            className={cn(
              "flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors",
              watchAll.mode === mode ? "text-violet-400 border-b-2 border-violet-500" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {mode === 'text2video' && <Type size={18} />}
            {mode === 'image2video' && <ImageIcon size={18} />}
            {mode === 'video2video' && <Video size={18} />}
            {mode === 'text2video' ? 'Text to Video' : mode === 'image2video' ? 'Image to Video' : 'Video to Video'}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
        {/* Prompt Section */}
        <div className="space-y-4">
          <div className="relative">
            <Controller
              name="prompt"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Describe your video in detail..."
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                />
              )}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-500">
              {watchAll.prompt.length} / 2000
            </div>
            {errors.prompt && <span className="text-red-400 text-xs mt-1 block">{errors.prompt.message}</span>}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleEnhance}
              disabled={isEnhancing || !watchAll.prompt}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-violet-300 hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm font-medium border border-violet-900/50"
            >
              {isEnhancing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles size={16} />
                </motion.div>
              ) : (
                <Sparkles size={16} />
              )}
              {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowNegative(!showNegative)}
              className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              Negative Prompt {showNegative ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {showNegative && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Controller
                  name="negativePrompt"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Things to avoid (e.g., blurry, low quality, distorted...)"
                      className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500 resize-none mt-2"
                    />
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Settings Accordion */}
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm font-medium text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Sliders size={18} />
              Advanced Settings
            </div>
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-800 bg-slate-900/30"
              >
                <div className="p-5 space-y-6">
                  {/* Duration & FPS */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 flex justify-between">
                        <span>Duration</span>
                        <span>{watchAll.duration}s</span>
                      </label>
                      <Controller
                        name="duration"
                        control={control}
                        render={({ field }) => (
                          <input 
                            type="range" 
                            min="5" max="120" step="5"
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full accent-violet-500"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">FPS</label>
                      <div className="flex bg-slate-800 rounded-lg p-1">
                        {['24', '30', '60'].map(fps => (
                          <button
                            key={fps} type="button"
                            onClick={() => setValue('fps', fps as any)}
                            className={cn(
                              "flex-1 py-1 text-xs rounded-md transition-colors",
                              watchAll.fps === fps ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {fps}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resolution & Aspect Ratio */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Resolution</label>
                      <div className="flex bg-slate-800 rounded-lg p-1">
                        {['720p', '1080p', '2K', '4K'].map(res => (
                          <button
                            key={res} type="button"
                            onClick={() => setValue('resolution', res as any)}
                            className={cn(
                              "flex-1 py-1 text-xs rounded-md transition-colors",
                              watchAll.resolution === res ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Aspect Ratio</label>
                      <div className="flex bg-slate-800 rounded-lg p-1">
                        {['16:9', '9:16', '1:1', '4:3'].map(ar => (
                          <button
                            key={ar} type="button"
                            onClick={() => setValue('aspectRatio', ar as any)}
                            className={cn(
                              "flex-1 py-1 text-xs rounded-md transition-colors flex justify-center items-center",
                              watchAll.aspectRatio === ar ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Style Grid */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Style</label>
                    <div className="grid grid-cols-4 gap-2">
                      {styles.map(style => (
                        <button
                          key={style} type="button"
                          onClick={() => setValue('style', style)}
                          className={cn(
                            "py-2 text-xs rounded-lg border transition-all text-center",
                            watchAll.style === style ? "border-violet-500 bg-violet-500/20 text-white" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Provider Selection */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">AI Provider</label>
          <div className="space-y-2">
            {providers.map(provider => (
              <button
                key={provider.id} type="button"
                onClick={() => setValue('provider', provider.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                  watchAll.provider === provider.id ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                )}
              >
                <span className="text-sm font-medium text-slate-200">{provider.name}</span>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span title="Quality">Q: {provider.quality}/5</span>
                  <span title="Speed">S: {provider.speed}/5</span>
                  <span title="Cost" className="text-cyan-400 flex items-center">
                    <Sparkles size={12} className="mr-1"/> {provider.cost}x
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Submit */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-sm text-slate-400">Estimated Cost</span>
          <span className="text-lg font-bold text-violet-400 flex items-center gap-1">
            <Sparkles size={18} /> {estimatedCost} Credits
          </span>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !watchAll.prompt}
          className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex flex-col items-center">
              <span className="z-10 relative">Generating... ({progress}%)</span>
              <div 
                className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300 ease-out z-0" 
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Play size={20} fill="currentColor" /> Generate Video
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
