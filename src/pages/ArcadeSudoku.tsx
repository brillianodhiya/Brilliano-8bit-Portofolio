import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function ArcadeSudoku() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto pb-12 h-[80vh] flex flex-col"
    >
      <SEO 
        title="Arcade: Sudoku | Secret Dungeon"
        description="Coming Soon: Logic-based number placement puzzle."
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
        <div className="w-20 h-20 pixel-panel flex items-center justify-center bg-accent/20 text-accent animate-bounce">
          <Construction size={40} />
        </div>
        
        <div>
          <h2 className="font-display text-3xl text-accent mb-2">SUDOKU</h2>
          <p className="font-body text-xl text-muted-foreground uppercase tracking-widest">
            Coming Soon — Under Construction
          </p>
        </div>

        <p className="font-body text-muted-foreground max-w-md mx-auto italic">
          "The numbers are still being calculated. Check back after the next dungeon excavation."
        </p>

        <div className="font-display text-[8px] text-accent/60 border border-accent/20 px-4 py-2 mt-4 animate-pulse">
          WORK IN PROGRESS: EXCAVATING LOGIC CHAMBERS...
        </div>
      </div>
    </motion.div>
  );
}
