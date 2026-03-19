import { motion } from "framer-motion";
import { ArrowLeft, Construction, Rocket } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function ArcadeShooter() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto pb-12 h-[80vh] flex flex-col"
    >
      <SEO 
        title="Arcade: Space Shooter | Secret Dungeon"
        description="Coming Soon: Galactic combat in a retro shooter style."
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
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 pixel-panel flex items-center justify-center bg-orange-500/20 text-orange-500"
        >
          <Rocket size={40} />
        </motion.div>
        
        <div>
          <h2 className="font-display text-3xl text-orange-500 mb-2 uppercase">Space Shooter</h2>
          <p className="font-body text-xl text-muted-foreground uppercase tracking-widest">
            Coming Soon — Launching...
          </p>
        </div>

        <p className="font-body text-muted-foreground max-w-md mx-auto italic">
          "Fueling the rockets and recalibrating the lasers. The galaxy will soon be yours to defend."
        </p>

        <div className="font-display text-[8px] text-orange-500/60 border border-orange-500/20 px-4 py-2 mt-4 animate-pulse uppercase">
          Work in Progress: Charging Plasma Cannons...
        </div>
      </div>
    </motion.div>
  );
}
