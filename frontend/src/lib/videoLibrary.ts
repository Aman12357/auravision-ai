export interface VideoTemplate {
  id: string;
  keywords: string[];
  title: string;
  videoUrl: string;
  posterUrl: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgDark: string;
}

export const DIVERSE_VIDEO_LIBRARY: VideoTemplate[] = [
  {
    id: "dragon",
    keywords: ["dragon", "monster", "beast", "creature", "flying", "castle", "fantasy", "fire", "flame"],
    title: "Celestial Fire Dragon",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    posterUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    category: "Fantasy",
    primaryColor: "#F97316",
    secondaryColor: "#EF4444",
    accentColor: "#F59E0B",
    bgDark: "#110905"
  },
  {
    id: "car",
    keywords: ["car", "vehicle", "drive", "drifting", "speed", "highway", "racing", "ferrari", "porsche", "bmw"],
    title: "Supercar Speed Hyperlapse",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    posterUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
    category: "Action",
    primaryColor: "#EC4899",
    secondaryColor: "#8B5CF6",
    accentColor: "#06B6D4",
    bgDark: "#0B0716"
  },
  {
    id: "cat",
    keywords: ["cat", "kitten", "pet", "animal", "cute", "piano", "guitar", "music", "playing"],
    title: "Cinematic Feline Symphony",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    posterUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
    category: "Lifestyle",
    primaryColor: "#F59E0B",
    secondaryColor: "#10B981",
    accentColor: "#38BDF8",
    bgDark: "#0B0F0D"
  },
  {
    id: "robot",
    keywords: ["robot", "cyborg", "ai", "mech", "android", "futuristic", "technology", "lab", "iron"],
    title: "Autonomous Cyber Android",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
    category: "Sci-Fi",
    primaryColor: "#06B6D4",
    secondaryColor: "#3B82F6",
    accentColor: "#A855F7",
    bgDark: "#040B14"
  },
  {
    id: "cyberpunk",
    keywords: ["cyberpunk", "samurai", "tokyo", "neon", "city", "rain", "future", "futuristic", "sci-fi"],
    title: "Cyberpunk Metropolis",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    posterUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop",
    category: "Cinematic",
    primaryColor: "#06B6D4",
    secondaryColor: "#A855F7",
    accentColor: "#EC4899",
    bgDark: "#05050D"
  },
  {
    id: "space",
    keywords: ["space", "voyager", "nebula", "star", "galaxy", "cosmos", "planet", "alien", "spacecraft", "astronaut"],
    title: "Deep Space Nebula",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    category: "Photorealistic",
    primaryColor: "#818CF8",
    secondaryColor: "#C084FC",
    accentColor: "#38BDF8",
    bgDark: "#03040B"
  },
  {
    id: "nature",
    keywords: ["tiger", "forest", "nature", "animal", "lion", "wildlife", "trees", "mountain", "pine", "green", "snow"],
    title: "Wilderness Sunlight",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    posterUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop",
    category: "Photorealistic",
    primaryColor: "#10B981",
    secondaryColor: "#84CC16",
    accentColor: "#F59E0B",
    bgDark: "#040F0A"
  },
  {
    id: "ocean",
    keywords: ["ocean", "wave", "water", "sea", "beach", "sunset", "underwater", "surf", "coastal", "island", "diver"],
    title: "Ocean Wave Horizon",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    category: "Cinematic",
    primaryColor: "#0EA5E9",
    secondaryColor: "#06B6D4",
    accentColor: "#F59E0B",
    bgDark: "#020A14"
  }
];

export function getDynamicVideoForPrompt(userPrompt: string): { 
  videoUrl: string; 
  posterUrl: string; 
  title: string; 
  seed: number;
  template: VideoTemplate;
  detectedSubject: string;
} {
  const lower = (userPrompt || "").toLowerCase();
  
  // 1. Semantic keyword matching
  for (const item of DIVERSE_VIDEO_LIBRARY) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      const seed = Math.floor(Math.abs(hashString(userPrompt)) % 900000) + 100000;
      return {
        videoUrl: item.videoUrl,
        posterUrl: item.posterUrl,
        title: item.title,
        seed,
        template: item,
        detectedSubject: item.id
      };
    }
  }

  // 2. Hash-based dynamic selection for any custom prompt
  const hash = Math.abs(hashString(userPrompt));
  const selectedIndex = hash % DIVERSE_VIDEO_LIBRARY.length;
  const match = DIVERSE_VIDEO_LIBRARY[selectedIndex];
  const seed = (hash % 900000) + 100000;

  return {
    videoUrl: match.videoUrl,
    posterUrl: match.posterUrl,
    title: match.title,
    seed,
    template: match,
    detectedSubject: match.id
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
