import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { Snake } from "@/components/Snake";
import { SEO } from "@/components/SEO";

export default function ArcadeSnake() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto pb-12"
    >
      <SEO 
        title="Arcade: Snake | Secret Dungeon"
        description="Classical retro snake game with a Matrix/GameBoy-inspired aesthetic."
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO DUNGEON
        </button>
        
        <div className="pixel-panel px-4 py-2 bg-green-500/10 border-green-500/50">
          <span className="font-display text-[10px] text-green-400 uppercase">Arcade Mode: Snake Eater</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="pixel-panel p-6 bg-card/50 backdrop-blur-sm shadow-2xl min-h-[600px] flex items-center justify-center">
        <Snake />
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 text-center px-4">
        <p className="font-body text-muted-foreground italic text-sm">
          "The cycle of consumption. The hunger that drives growth. Beware the boundaries of your own expansion."
        </p>
      </div>
    </motion.div>
  );
}
