import { motion } from "framer-motion";
import { ArrowLeft, Construction, Circle } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function ArcadeBubble() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto pb-12 h-[80vh] flex flex-col"
    >
      <SEO 
        title="Arcade: Bubble Blast | Secret Dungeon"
        description="Coming Soon: Pop the colorful bubbles in this addictive arcade game."
      />

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO DUNGEON
        </button>
      </div>

      <div className="flex-grow pixel-panel bg-card/30 flex flex-col items-center justify-center gap-6 p-12 text-center border-dashed border-2 border-white/10">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-12 h-12 pixel-panel flex items-center justify-center bg-blue-400/20 text-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
              <Circle size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
          ))}
        </div>
        
        <div>
          <h2 className="font-display text-3xl text-blue-400 mb-2 uppercase">Bubble Blast</h2>
          <p className="font-body text-xl text-muted-foreground uppercase tracking-widest">
            Coming Soon — Filling with Air...
          </p>
        </div>

        <p className="font-body text-muted-foreground max-w-md mx-auto italic">
          "The bubbles are being pressurized for maximum popping satisfaction. Stay tuned."
        </p>

        <div className="font-display text-[8px] text-blue-400/60 border border-blue-400/20 px-4 py-2 mt-4 animate-pulse uppercase">
          Work in Progress: Generating Spherical Logic...
        </div>
      </div>
    </motion.div>
  );
}
