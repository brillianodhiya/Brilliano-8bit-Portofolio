import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { KONAMI_CODE, KEY_LABELS } from "@/hooks/use-konami-code";
import { toggleNesController } from "@/lib/nes-controller-state";

interface NesControllerProps {
  onButtonPress: (key: string) => void;
  progress: number;
  total: number;
  isOpen: boolean;
}

function DpadButton({
  direction,
  keyCode,
  onPress,
  className,
}: {
  direction: "up" | "down" | "left" | "right";
  keyCode: string;
  onPress: (key: string) => void;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);

  const arrows: Record<string, string> = {
    up: "▲",
    down: "▼",
    left: "◀",
    right: "▶",
  };

  const handlePress = () => {
    setPressed(true);
    playButtonSound();
    onPress(keyCode);
    setTimeout(() => setPressed(false), 150);
  };

  return (
    <button
      onPointerDown={handlePress}
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center",
        "bg-[#2a2a2a] border-2 border-[#1a1a1a] text-gray-300",
        "active:bg-[#1a1a1a] transition-colors select-none touch-none",
        "shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]",
        pressed && "bg-[#1a1a1a] shadow-[inset_0_2px_0_rgba(0,0,0,0.5)] translate-y-[1px]",
        className
      )}
    >
      <span className="font-display text-[8px] sm:text-[10px]">{arrows[direction]}</span>
    </button>
  );
}

function ActionButton({
  label,
  keyCode,
  onPress,
  color,
}: {
  label: string;
  keyCode: string;
  onPress: (key: string) => void;
  color: string;
}) {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    playButtonSound();
    onPress(keyCode);
    setTimeout(() => setPressed(false), 150);
  };

  return (
    <button
      onPointerDown={handlePress}
      className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center",
        "border-2 text-white font-display text-xs sm:text-sm",
        "active:brightness-75 transition-all select-none touch-none",
        "shadow-[inset_0_-3px_0_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.5)]",
        pressed && "shadow-[inset_0_3px_0_rgba(0,0,0,0.4)] translate-y-[2px]",
        color
      )}
    >
      {label}
    </button>
  );
}

export function NesController({ onButtonPress, progress, total, isOpen }: NesControllerProps) {
  const nextKey = KONAMI_CODE[progress];
  const nextLabel = nextKey ? KEY_LABELS[nextKey] || nextKey.toUpperCase() : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100vw-2rem)] max-w-md sm:max-w-lg md:max-w-xl"
        >
          {/* NES Controller body */}
          <div
            className={cn(
              "relative px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between",
              "bg-gradient-to-b from-[#b0b0b0] to-[#8a8a8a]",
              "border-4 border-[#4a4a4a] rounded-lg",
              "shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.6)]"
            )}
          >
            {/* Top ridge line */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-[#6a6a6a]" />

            {/* Close button */}
            <button
              onClick={() => { playButtonSound(); toggleNesController(); }}
              className="absolute -top-3 -right-3 w-7 h-7 bg-[#333] border-2 border-[#555] rounded-sm flex items-center justify-center text-gray-300 hover:bg-red-800 hover:border-red-500 hover:text-white transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none z-10"
              title="Close Controller"
            >
              <span className="font-display text-[10px] leading-none">✕</span>
            </button>

            {/* Label — top hint bar */}
            <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="pixel-panel p-1.5 sm:p-2 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-[6px] sm:text-[7px] text-muted-foreground">NEXT:</span>
                  <span className={cn(
                    "font-display text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 border",
                    progress > 0
                      ? "text-accent border-accent bg-accent/10 animate-pulse"
                      : "text-muted-foreground border-muted"
                  )}>
                    {nextLabel || "↑"}
                  </span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: total }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-1 sm:w-1.5 sm:h-1.5 border transition-colors",
                          i < progress
                            ? "bg-accent border-accent"
                            : "bg-transparent border-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* D-Pad */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1a1a1a] border border-[#333]" />
              </div>

              <div className="grid grid-cols-3 gap-0">
                <div />
                <DpadButton direction="up" keyCode="ArrowUp" onPress={onButtonPress} className="rounded-t-md" />
                <div />

                <DpadButton direction="left" keyCode="ArrowLeft" onPress={onButtonPress} className="rounded-l-md" />
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#2a2a2a] border-2 border-[#1a1a1a]" />
                <DpadButton direction="right" keyCode="ArrowRight" onPress={onButtonPress} className="rounded-r-md" />

                <div />
                <DpadButton direction="down" keyCode="ArrowDown" onPress={onButtonPress} className="rounded-b-md" />
                <div />
              </div>
            </div>

            {/* Select / Start (center, decorative) */}
            <div className="flex flex-col items-center gap-0.5 self-end flex-shrink-0">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 sm:w-8 h-2.5 sm:h-3 bg-[#2a2a2a] rounded-full border border-[#1a1a1a]" />
                  <span className="font-display text-[4px] sm:text-[5px] text-[#4a4a4a] uppercase">Select</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 sm:w-8 h-2.5 sm:h-3 bg-[#2a2a2a] rounded-full border border-[#1a1a1a]" />
                  <span className="font-display text-[4px] sm:text-[5px] text-[#4a4a4a] uppercase">Start</span>
                </div>
              </div>
            </div>

            {/* A/B Buttons */}
            <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0" style={{ transform: "rotate(-15deg)" }}>
              <ActionButton label="B" keyCode="b" onPress={onButtonPress} color="bg-[#c62828] border-[#8b1a1a]" />
              <ActionButton label="A" keyCode="a" onPress={onButtonPress} color="bg-[#c62828] border-[#8b1a1a]" />
            </div>

            {/* Brilliano label */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
              <span className="font-display text-[5px] sm:text-[6px] text-[#5a5a5a] tracking-[2px] sm:tracking-[3px] uppercase">Brilliano</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
