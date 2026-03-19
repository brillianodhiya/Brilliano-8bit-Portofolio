import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { KeyPress } from "@/hooks/use-konami-code";

interface KeyVizProps {
  keyPresses: KeyPress[];
  progress: number;
  total: number;
  isActive: boolean;
}

export function KeyViz({ keyPresses, progress, total, isActive }: KeyVizProps) {
  if (!isActive && keyPresses.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] hidden md:flex flex-col items-center gap-3 pointer-events-none">
      {/* Key presses display */}
      <div className="flex gap-2 items-center">
        <AnimatePresence mode="popLayout">
          {keyPresses.map((press) => (
            <motion.div
              key={press.id}
              initial={{ scale: 0, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className={cn(
                "min-w-[40px] h-[40px] flex items-center justify-center font-display text-sm",
                "border-2 shadow-[2px_2px_0_rgba(0,0,0,0.5)] select-none",
                press.correct
                  ? "bg-green-800 border-green-400 text-green-200"
                  : "bg-red-800 border-red-400 text-red-200 animate-pulse"
              )}
            >
              {press.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {isActive && progress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-panel p-2 bg-background/90 backdrop-blur-sm"
        >
          <div className="flex gap-1 items-center">
            <span className="font-display text-[7px] text-muted-foreground mr-2">SECRET CODE</span>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 border transition-colors duration-200",
                  i < progress
                    ? "bg-accent border-accent shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                    : "bg-transparent border-white/20"
                )}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
