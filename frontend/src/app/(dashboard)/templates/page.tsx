'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Star, TrendingUp, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = ['All', 'Cinematic', 'Social Media', 'Marketing', 'Gaming', 'Fantasy'];

const templates = [
  { id: 1, name: 'Cinematic City Sunrise', category: 'Cinematic', tags: ['4K', 'Aerial', 'Realistic'], desc: 'A cinematic aerial shot of a modern city skyline at sunrise...', bg: 'from-orange-500/20 to-purple-600/20', prompt: 'A cinematic aerial shot of a modern city skyline at sunrise, golden light reflecting off glass skyscrapers, birds flying in formation, 4K ultra-realistic' },
  { id: 2, name: 'Ocean Depths', category: 'Cinematic', tags: ['Nature', 'Underwater'], desc: 'Deep underwater camera pan through bioluminescent coral reef...', bg: 'from-blue-600/20 to-cyan-400/20', prompt: 'Deep underwater camera pan through bioluminescent coral reef, exotic fish swimming in perfect formation, shafts of light piercing through crystal water' },
  { id: 3, name: 'TikTok Viral Dance', category: 'Social Media', tags: ['Vertical', 'Dynamic'], desc: 'High energy dynamic camera following a hip-hop dancer...', bg: 'from-pink-500/20 to-violet-500/20', prompt: 'High energy dynamic camera following a hip-hop dancer in a neon-lit cyberpunk alleyway, rapid zoom effects, glitch transitions, perfect loop' },
  { id: 4, name: 'Product Reveal Drop', category: 'Marketing', tags: ['Commercial', 'Sleek'], desc: 'Slow motion product rotation with dramatic rim lighting...', bg: 'from-gray-600/20 to-slate-800/20', prompt: 'Slow motion product rotation with dramatic rim lighting, particles floating in background, sleek dark studio environment, commercial style 8k' },
  { id: 5, name: 'Cyberpunk Chase', category: 'Gaming', tags: ['Action', 'Sci-fi'], desc: 'Fast-paced FPV drone shot racing through neon-lit streets...', bg: 'from-yellow-400/20 to-red-600/20', prompt: 'Fast-paced FPV drone shot racing through neon-lit futuristic city streets, flying cars, rain slicked roads reflecting neon signs' },
  { id: 6, name: 'Enchanted Forest', category: 'Fantasy', tags: ['Magical', 'Slow-mo'], desc: 'Sunlight filtering through ancient trees with glowing spores...', bg: 'from-green-500/20 to-emerald-800/20', prompt: 'Sunlight filtering through ancient mossy trees, glowing magical spores floating in the air, a tiny fairy darting between branches, magical fantasy lighting' },
  // Adding more to meet requirements
  { id: 7, name: 'Minimalist App Promo', category: 'Marketing', tags: ['Clean', 'UI'], desc: 'Abstract shapes assembling into a smartphone...', bg: 'from-blue-300/20 to-indigo-500/20', prompt: 'Abstract clean white 3D shapes assembling smoothly into a modern smartphone, floating UI elements, bright studio lighting, minimalist' },
  { id: 8, name: 'Cosmic Nebula', category: 'Cinematic', tags: ['Space', 'Epic'], desc: 'Slow flythrough of a colorful interstellar nebula...', bg: 'from-indigo-800/20 to-purple-900/20', prompt: 'Slow epic flythrough of a colorful interstellar nebula, millions of stars, massive dust clouds glowing pink and blue, James Webb space telescope style' },
  { id: 9, name: 'Vintage 8mm Film', category: 'Social Media', tags: ['Retro', 'Nostalgia'], desc: 'Summer beach day with heavy film grain and light leaks...', bg: 'from-yellow-700/20 to-orange-800/20', prompt: 'Summer beach day, people surfing, heavy vintage 8mm film grain, warm nostalgic color grading, authentic light leaks and scratches' },
  { id: 10, name: 'Dragon Flight', category: 'Fantasy', tags: ['Epic', 'Creature'], desc: 'Majestic red dragon flying over snow-capped mountains...', bg: 'from-red-900/20 to-slate-900/20', prompt: 'Majestic red dragon flying gracefully over snow-capped mountain peaks, breathing a small puff of smoke, cinematic tracking shot, photorealistic scales' },
  { id: 11, name: 'Anime Fight Intro', category: 'Gaming', tags: ['2D Style', 'Action'], desc: 'Two warriors clashing swords with energy sparks...', bg: 'from-fuchsia-600/20 to-blue-600/20', prompt: 'High-octane anime style animation, two warriors clashing swords, massive energy sparks, speed lines background, cel-shaded style' },
  { id: 12, name: 'Food Commercial', category: 'Marketing', tags: ['Macro', 'Slow-mo'], desc: 'Extreme macro shot of a burger being assembled...', bg: 'from-orange-400/20 to-yellow-600/20', prompt: 'Extreme macro slow motion shot, fresh ingredients falling perfectly to assemble a gourmet burger, splashing sauce, dark background, commercial lighting' },
  { id: 13, name: 'Vaporwave Grid', category: 'Gaming', tags: ['Retro', 'Synth'], desc: 'Endless flight over a glowing neon wireframe grid...', bg: 'from-pink-600/20 to-cyan-500/20', prompt: 'Endless seamless loop flight over a glowing neon magenta wireframe grid landscape, large synthwave sun on the horizon, retro 80s aesthetic' },
  { id: 14, name: 'Spooky Castle', category: 'Fantasy', tags: ['Horror', 'Dark'], desc: 'Lightning flashing behind a gothic castle silhouette...', bg: 'from-slate-800/20 to-black/20', prompt: 'Lightning flashing behind a massive gothic castle silhouette on a steep cliff, heavy rain, stormy night, cinematic horror atmosphere' },
  { id: 15, name: 'Instagram Story', category: 'Social Media', tags: ['Vertical', 'Aesthetic'], desc: 'Aesthetic morning coffee pouring sequence...', bg: 'from-stone-400/20 to-amber-700/20', prompt: 'Aesthetic morning routine, perfectly poured latte art in a cozy cafe, soft natural morning sunlight, 9:16 aspect ratio, warm tones' },
  { id: 16, name: 'Microscopic Life', category: 'Cinematic', tags: ['Sci-fi', 'Macro'], desc: 'Tardigrade swimming through water droplets...', bg: 'from-teal-600/20 to-blue-800/20', prompt: 'Electron microscope style render of a tardigrade swimming gracefully through water droplets, glowing internal structures, depth of field' },
  { id: 17, name: 'E-Sports Logo Reveal', category: 'Gaming', tags: ['3D', 'Energetic'], desc: 'Metal logo assembling with electric arcs...', bg: 'from-blue-700/20 to-cyan-300/20', prompt: 'Aggressive metallic logo assembling from fragments in mid-air, heavy electric arcs zapping across the surface, dark stadium background' },
  { id: 18, name: 'Real Estate Drone', category: 'Marketing', tags: ['Architecture', 'Smooth'], desc: 'Smooth drone push-in on a modern luxury villa...', bg: 'from-emerald-300/20 to-teal-700/20', prompt: 'Smooth drone push-in shot of a modern luxury glass villa at twilight, interior lights glowing warmly, infinity pool reflecting the sky, high end real estate' },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  const filteredTemplates = activeCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const handleUseTemplate = (prompt: string) => {
    // Navigate to generate page with prompt pre-filled
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header & Featured */}
      <div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Start With Inspiration</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Choose from our curated library of high-quality prompts to instantly generate stunning videos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[templates[0], templates[4], templates[11]].map((featured, i) => (
            <motion.div 
              key={featured.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative h-64 rounded-2xl p-6 flex flex-col justify-end overflow-hidden group cursor-pointer bg-gradient-to-br ${featured.bg} border border-gray-800 hover:border-gray-600 transition-all`}
              onClick={() => handleUseTemplate(featured.prompt)}
            >
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur rounded-full text-xs font-medium text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> Featured
              </div>
              <div className="relative z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-2xl font-bold text-white mb-2">{featured.name}</h3>
                <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-75">{featured.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template, i) => (
          <motion.div 
            key={template.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 8) * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/10 transition-all group flex flex-col h-full"
          >
            <div className={`h-36 bg-gradient-to-br ${template.bg} p-4 relative`}>
              <span className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur rounded text-[10px] uppercase font-bold text-white tracking-wider">
                {template.category}
              </span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
              
              <div className="flex gap-2 flex-wrap mb-3">
                {template.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">{template.desc}</p>
              
              <button 
                onClick={() => handleUseTemplate(template.prompt)}
                className="w-full py-2 bg-gray-800 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-violet-600"
              >
                <Play className="w-4 h-4 fill-current" /> Use Template
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
