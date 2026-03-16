import { supabase } from "@/lib/supabaseClient";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_blood", title: "Press Start", description: "Entered the portfolio.", unlocked: false },
  { id: "explorer", title: "Explorer", description: "Visited all main pages.", unlocked: false },
  { id: "music_lover", title: "DJ Pixel", description: "Played the background music.", unlocked: false },
  { id: "cv_download", title: "Loot Acquired", description: "Downloaded the CV.", unlocked: false },
  { id: "hidden_persona", title: "The Hidden Boss", description: "You found the Kanrishaurus persona!", unlocked: false },
  { id: "legendary_hero", title: "Legendary Hero", description: "You have joined the Avatar World!", unlocked: false },
  { id: "high_scorer", title: "High Scorer", description: "Reached 10,000 points and unlocked Avatar World!", unlocked: false },
  { id: "reluctant_hero", title: "The Reluctant Hero", description: "Attempted to escape destiny. (Failure)", unlocked: false },
  { id: "destiny_unavoidable", title: "Destiny Unavoidable", description: "Witnessed the critical dialogue error.", unlocked: false },
  { id: "music_skip", title: "Disc Jockey", description: "Skipped through the playlist.", unlocked: false },
  { id: "dino_click", title: "Dino Clicker", description: "Interacted with the Pixel Dino.", unlocked: false },
  { id: "dino_rawr", title: "Jurassic Park", description: "The Dino gave a mighty RAWRR!", unlocked: false },
];

// We use a simple Zustand store (simulated with React state + Context in standard apps, but here we just use a basic observer pattern if Zustand isn't available. Wait, I didn't add zustand to requirements. I will implement a lightweight custom pub/sub or just use React Context if needed, but I'll write a simple custom hook using global state for ease).

// Lightweight global state for achievements since we didn't install zustand
let globalAchievements = [...INITIAL_ACHIEVEMENTS];
let recentUnlock: Achievement | null = null;
const listeners = new Set<() => void>();

const trackAchievementPlayer = async () => {
  if (!supabase) return;
  const HAS_PLAYED_KEY = 'portfolio_has_played_achievements';
  
  if (!localStorage.getItem(HAS_PLAYED_KEY)) {
    try {
      // Use RPC if available or manual increment
      // For simplicity in this schema, we select then update
      const { data } = await supabase
        .from('portfolio_page_visits')
        .select('count')
        .eq('id', 'achievement_players')
        .single();
        
      if (data !== null) {
        await supabase
          .from('portfolio_page_visits')
          .update({ count: (data.count || 0) + 1 })
          .eq('id', 'achievement_players');
          
        localStorage.setItem(HAS_PLAYED_KEY, 'true');
      }
    } catch (err) {
      console.error("Failed to track achievement player:", err);
    }
  }
};

const notify = () => listeners.forEach(l => l());

export const unlockAchievement = (id: string) => {
  const ach = globalAchievements.find(a => a.id === id);
  if (ach && !ach.unlocked) {
    ach.unlocked = true;
    recentUnlock = ach;
    notify();

    // Play achievement sound
    const audio = new Audio(`${import.meta.env.BASE_URL}achievement.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    // Track this player globally if not already tracked
    trackAchievementPlayer();
    
    // Auto clear recent after 4 seconds
    setTimeout(() => {
      if (recentUnlock?.id === id) {
        recentUnlock = null;
        notify();
      }
    }, 4000);
  }
};

export function useAchievements() {
  const clearRecent = () => {
    recentUnlock = null;
    notify();
  };

  return {
    achievements: globalAchievements,
    recentUnlock,
    unlockAchievement,
    clearRecent,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
