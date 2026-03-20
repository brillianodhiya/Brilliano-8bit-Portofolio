import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { Sudoku } from "@/components/Sudoku";
import { SEO } from "@/components/SEO";

export default function ArcadeSudoku() {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto pb-12"
    >
      <SEO 
        title="Arcade: Sudoku | Secret Dungeon"
        description="Solve the ancient number puzzles in the Logic Chamber."
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO DUNGEON
        </button>
        
        <div className="pixel-panel px-4 py-2 bg-accent/10 border-accent/50">
          <span className="font-display text-[10px] text-accent">ARCADE MODE: SUDOKU</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="pixel-panel p-6 bg-card/50 backdrop-blur-sm shadow-2xl min-h-[600px] flex items-center justify-center">
        <Sudoku />
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 text-center">
        <p className="font-body text-muted-foreground italic text-sm">
          "The logic of the ancients remains unbroken. Can you restore the sequence?"
        </p>
      </div>
    </motion.div>
  );
}
