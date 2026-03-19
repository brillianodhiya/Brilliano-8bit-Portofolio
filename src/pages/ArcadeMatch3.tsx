import { motion } from "framer-motion";
import { ArrowLeft, Construction, Star } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function ArcadeMatch3() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-4xl mx-auto pb-12 h-[80vh] flex flex-col"
    >
      <SEO 
        title="Arcade: Candy Match | Secret Dungeon"
        description="Coming Soon: Sweet match-3 puzzle adventure."
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
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-10 h-10 pixel-panel flex items-center justify-center bg-pink-500/20 text-pink-500 animate-pulse">
              <Star size={20} fill="currentColor" fillOpacity={0.2} />
            </div>
          ))}
        </div>
        
        <div>
          <h2 className="font-display text-3xl text-pink-500 mb-2 uppercase">Candy Match</h2>
          <p className="font-body text-xl text-muted-foreground uppercase tracking-widest">
            Coming Soon — Sweetening...
          </p>
        </div>

        <p className="font-body text-muted-foreground max-w-md mx-auto italic">
          "The sugars are crystallizing. A match-3 adventure of epic proportions is being prepared."
        </p>

        <div className="font-display text-[8px] text-pink-500/60 border border-pink-500/20 px-4 py-2 mt-4 animate-pulse uppercase">
          Work in Progress: Refining Delicious Layouts...
        </div>
      </div>
    </motion.div>
  );
}
