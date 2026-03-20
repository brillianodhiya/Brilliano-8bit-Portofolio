import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Heart } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import GachaSystem, { GachaItem } from "@/components/GachaSystem";
import { useGachaCollection } from "@/hooks/use-gacha-collection";
import { Layers } from "lucide-react";

const GIRL_NAMES = ["Aria", "Lyra", "Seraphina", "Luna", "Nova", "Ember", "Iris", "Selene", "Aurora", "Vesper", "Jade", "Ruby", "Sapphire", "Pearl", "Amethyst", "Flora", "Fauna", "Gaia", "Rhea", "Theia"];

export default function SummonGirls() {
  const [, navigate] = useLocation();
  const { addToCollection } = useGachaCollection();
  const [items, setItems] = useState<GachaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGirls = async () => {
      try {
        // Fetch from multiple categories to get diversity
        const categories = ['waifu', 'neko', 'shinobu', 'megumin'];
        const allItems: GachaItem[] = [];
        
        for (const cat of categories) {
          const response = await fetch(`https://api.waifu.pics/many/sfw/${cat}`, {
            method: 'POST',
            body: JSON.stringify({ exclude: [] }),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          const urls = data.files as string[];
          
          urls.slice(0, 10).forEach((url, i) => {
            const rand = Math.random();
            let rarity: 'SSR' | 'SR' | 'R' = 'R';
            if (rand < 0.08) rarity = 'SSR';
            else if (rand < 0.25) rarity = 'SR';
            
            allItems.push({
              id: `${cat}-${i}`,
              name: GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)] + " (" + cat.toUpperCase() + ")",
              rarity,
              image: url,
              category: 'anime',
            });
          });
        }
        
        setItems(allItems.sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("Failed to fetch girls", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGirls();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <SEO 
        title="Anime Girls Gacha | Summon Gate"
        description="Summon beautiful anime girls from across the multiverse using the waifu.pics API."
      />

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO GATE
        </button>
      </div>

      <div className="pixel-panel p-1 bg-card/30 border-pink-500/30 min-h-[600px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            <p className="font-display text-sm text-pink-400 uppercase tracking-widest">
              Syncing with the Waifu Network...
            </p>
          </div>
        ) : (
          <GachaSystem 
            items={items} 
            title="ANIME GIRLS SUMMON" 
            onClose={() => navigate("/secret-dungeon")}
            onResults={addToCollection}
            themeColor="pink"
            bgImage="https://images.weserv.nl/?url=https://wallpaperaccess.com/full/1513685.jpg&w=1200&h=600&fit=cover&blur=5"
          />
        )}
      </div>

      <div className="mt-8 flex justify-center">
            <button 
              onClick={() => { navigate("/secret-dungeon/collection"); playButtonSound(); }}
              className="pixel-btn bg-white/5 border-pink-500/20 px-8 py-3 text-[10px] tracking-[0.2em] hover:bg-pink-500/10 flex items-center gap-3"
            >
              <Layers size={14} className="text-pink-500" />
              VIEW COLLECTION
            </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="pixel-panel p-4 bg-background/50 border-pink-500/20">
          <h4 className="font-display text-xs text-pink-400 mb-2 uppercase italic">Gate Master's Note</h4>
          <p className="font-body text-sm text-muted-foreground">
            "The Waifu Network spans countless worlds. Each summon pulls a unique digital soul into our realm. Cherish your discoveries."
          </p>
        </div>
        <div className="pixel-panel p-4 bg-background/50 border-pink-400/20 flex flex-col items-center justify-center gap-3">
          <img src="https://images.squarespace-cdn.com/content/v1/65f4d9aad4c5d6603981303c/856124d5-920f-4d6a-9435-c19eeca4f9a2/aqua%2Bkonosuba%2Btop%2B10%2Banime%2Bgirls%2B2020.jpg" className="w-20 h-20 rounded-xl border-2 border-pink-500/50 object-cover shadow-[0_0_20px_rgba(236,72,153,0.3)] animate-float" alt="Aqua" />
          <div className="flex flex-col items-center">
            <Heart className="text-pink-500 fill-pink-500/20 animate-pulse" size={24} />
            <span className="font-display text-[10px] mt-1 uppercase tracking-widest text-muted-foreground">Love & Resonance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
