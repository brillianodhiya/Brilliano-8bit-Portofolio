import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function ArcadeSnake() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto pb-12 h-[80vh] flex flex-col"
    >
      <SEO 
        title="Arcade: Snake | Secret Dungeon"
        description="Coming Soon: Retro snake game."
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
        <div className="w-20 h-20 pixel-panel flex items-center justify-center bg-green-500/20 text-green-500 animate-pulse">
          <Construction size={40} />
        </div>
        
        <div>
          <h2 className="font-display text-3xl text-green-500 mb-2">SNAKE</h2>
          <p className="font-body text-xl text-muted-foreground uppercase tracking-widest text-shadow-pixel">
            Coming Soon — Hatching...
          </p>
        </div>

        <p className="font-body text-muted-foreground max-w-md mx-auto italic">
          "The snake is currently shedding its old code. Check back once it's fully grown."
        </p>

        <div className="font-display text-[8px] text-green-500/60 border border-green-500/20 px-4 py-2 mt-4 animate-pulse">
          WORK IN PROGRESS: INCUBATING REPTILIAN LOGIC...
        </div>
      </div>
    </motion.div>
  );
}
