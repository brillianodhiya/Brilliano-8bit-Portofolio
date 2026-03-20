import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { BubbleBlast } from "@/components/BubbleBlast";
import { SEO } from "@/components/SEO";

export default function ArcadeBubble() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl mx-auto pb-12"
    >
      <SEO 
        title="Arcade: Bubble Blast | Secret Dungeon"
        description="Pop the colorful bubbles in this addictive high-speed arcade game."
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO DUNGEON
        </button>
        
        <div className="pixel-panel px-4 py-2 bg-blue-500/10 border-blue-500/50">
          <span className="font-display text-[10px] text-blue-400 uppercase">Arcade Mode: Bubble_Protocol</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="pixel-panel p-2 md:p-8 bg-card/40 backdrop-blur-md shadow-2xl min-h-[600px] flex items-center justify-center overflow-hidden">
        <BubbleBlast />
      </div>

      {/* Footer Legend */}
      <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
        <p className="font-body text-muted-foreground italic text-xs leading-relaxed opacity-60">
          "The beauty of the bubble lies in its impermanence. A single link can shatter the most complex patterns. Aim true, and clear the neural congestion."
        </p>
      </div>
    </motion.div>
  );
}
