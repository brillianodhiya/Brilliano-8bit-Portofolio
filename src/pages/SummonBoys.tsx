import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Zap, Layers } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import GachaSystem, { GachaItem } from "@/components/GachaSystem";
import { useGachaCollection } from "@/hooks/use-gacha-collection";

const BOY_NAMES = ["Kaito", "Ren", "Haruto", "Sora", "Itsuki", "Yuki", "Riku", "Toma", "Asahi", "Minato", "Ryoma", "Shinnosuke", "Taiga", "Kenji", "Hiroki", "Daiki", "Sho", "Tsubasa", "Kazuki", "Hayato"];

export default function SummonBoys() {
  const [, navigate] = useLocation();
  const { addToCollection } = useGachaCollection();
  const [items, setItems] = useState<GachaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoys = async () => {
      try {
        // Fetch from nekos.best husbando category
        const response = await fetch('https://nekos.best/api/v2/husbando?amount=20');
        const data = await response.json();
        const results = data.results as any[];
        
        const gachaItems: GachaItem[] = results.map((res: any, i: number) => {
          const rand = Math.random();
          let rarity: 'SSR' | 'SR' | 'R' = 'R';
          if (rand < 0.1) rarity = 'SSR';
          else if (rand < 0.3) rarity = 'SR';
          
          return {
            id: `boy-${i}`,
            name: (res.artist_name || BOY_NAMES[Math.floor(Math.random() * BOY_NAMES.length)]),
            rarity,
            image: res.url,
            category: 'anime',
          };
        });
        
        setItems(gachaItems);
      } catch (err) {
        console.error("Failed to fetch boys", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBoys();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <SEO 
        title="Anime Boys Gacha | Summon Gate"
        description="Summon cool anime boys and husbandos from the multiverse using the nekos.best API."
      />

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO GATE
        </button>
      </div>

      <div className="pixel-panel p-1 bg-card/30 border-blue-500/30 min-h-[600px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="font-display text-sm text-blue-400 uppercase tracking-widest">
              Gazing into the Husbando Abyss...
            </p>
          </div>
        ) : (
          <GachaSystem 
            items={items} 
            title="ANIME BOYS SUMMON" 
            onClose={() => navigate("/secret-dungeon")}
            onResults={addToCollection}
            themeColor="blue"
            bgImage="https://images.weserv.nl/?url=https://wallpaperaccess.com/full/5681146.jpg&w=1200&h=600&fit=cover&blur=5"
          />
        )}
      </div>

      <div className="mt-8 flex justify-center">
            <button 
              onClick={() => { navigate("/secret-dungeon/collection"); playButtonSound(); }}
              className="pixel-btn bg-white/5 border-blue-500/20 px-8 py-3 text-[10px] tracking-[0.2em] hover:bg-blue-500/10 flex items-center gap-3"
            >
              <Layers size={14} className="text-blue-500" />
              VIEW COLLECTION
            </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="pixel-panel p-4 bg-background/50 border-blue-500/20">
          <h4 className="font-display text-xs text-blue-400 mb-2 uppercase italic">Gate Researcher's Log</h4>
          <p className="font-body text-sm text-muted-foreground">
            "The Husbando Abyss is deep and full of surprises. From warriors to scholars, each pull brings a unique presence to our realm."
          </p>
        </div>
        <div className="pixel-panel p-4 bg-background/50 border-blue-400/20 flex flex-col items-center justify-center gap-3">
          <img src="https://imgix.ranker.com/user_node_img/4373/87455191/original/satoru-gojo-u-2029987413?auto=format&q=60&fit=crop&fm=pjpg&dpr=2&w=355" className="w-20 h-20 rounded-xl border-2 border-blue-500/50 object-cover shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-float" alt="Gojo" />
          <div className="flex flex-col items-center">
            <Zap className="text-blue-500 fill-blue-500/20 animate-bounce" size={24} />
            <span className="font-display text-[10px] mt-1 uppercase tracking-widest text-muted-foreground">Power & Resonance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
