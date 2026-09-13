import { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Move,
  ShieldCheck,
  Terminal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { QuestItem } from "@/pages/Experience";

interface RetroLanyardBadgeProps {
  quest: QuestItem;
  onClose: () => void;
  onNextQuest?: () => void;
  onPrevQuest?: () => void;
  hasMultiple?: boolean;
  currentIndex?: number;
  totalQuests?: number;
}

export function RetroLanyardBadge({
  quest,
  onClose,
  onNextQuest,
  onPrevQuest,
  hasMultiple = false,
  currentIndex = 0,
  totalQuests = 1,
}: RetroLanyardBadgeProps) {
  const isOngoing = quest.period.toLowerCase().includes("present");
  const [hasDragged, setHasDragged] = useState(false);

  // Helper for image logo URLs
  const getImageUrl = (image?: string) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${import.meta.env.BASE_URL}images/${image}`;
  };

  const logoUrl = getImageUrl(quest.logo);

  // Physics Motion Values for 3D Drag & Spring Bounce
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics config for high-elasticity "mental-mental" bounce
  const springConfig = { stiffness: 600, damping: 12, mass: 0.8 };

  const rotateX = useSpring(useTransform(y, [-180, 180], [28, -28]), springConfig);
  const rotateY = useSpring(useTransform(x, [-180, 180], [-28, 28]), springConfig);
  const rotateZ = useSpring(useTransform(x, [-180, 180], [-16, 16]), springConfig);

  // Real-time Dynamic SVG Strap Path Binding
  const strapD = useTransform([x, y], ([latestX, latestY]) => {
    const lx = latestX as number;
    const ly = latestY as number;
    const targetX = 150 + lx;
    const targetY = 85 + ly;
    const ctrlX = 150 + lx * 0.35;
    const ctrlY = 40 + ly * 0.35;
    return `M 150 0 Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;
  });

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-xl mx-auto pt-16 md:pt-20 [perspective:1200px]">
      {/* DRAG & PULL INSTRUCTION BADGE */}
      {!hasDragged && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-accent text-black px-3 py-1 rounded-full font-display text-[9px] font-bold shadow-2xl flex items-center gap-1.5 animate-bounce pointer-events-none border border-black/40">
          <Move size={12} /> DRAG & PULL LANYARD TO SWING / BOUNCE!
        </div>
      )}

      {/* DYNAMIC STRETCHABLE FABRIC LANYARD STRAP (SVG) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] pointer-events-none z-0 overflow-visible">
        <svg className="w-full h-full overflow-visible">
          {/* Shadow line */}
          <motion.path
            d={strapD}
            stroke="black"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          {/* Main Woven Strap Fabric */}
          <motion.path
            d={strapD}
            stroke="url(#lanyardGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Pattern Stripe */}
          <motion.path
            d={strapD}
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="6,6"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <defs>
            <linearGradient id="lanyardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="50%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3D BOUNCY INTERACTIVE ID CARD BADGE */}
      <motion.div
        drag
        dragConstraints={{ left: -140, right: 140, top: -60, bottom: 140 }}
        dragElastic={0.55} // High elasticity for bouncy rubber feel
        dragTransition={{ bounceStiffness: 450, bounceDamping: 14 }}
        style={{
          x,
          y,
          rotateX,
          rotateY,
          rotateZ,
          transformStyle: "preserve-3d",
        }}
        onDragStart={() => setHasDragged(true)}
        className="relative z-10 w-full pixel-panel p-5 md:p-6 bg-gradient-to-b from-zinc-950 via-slate-950 to-black border-4 border-purple-500/70 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col gap-4 rounded-3xl cursor-grab active:cursor-grabbing group overflow-hidden"
      >
        {/* Top Metallic Buckle & Punch Slot */}
        <div className="w-full flex justify-center -mt-3 mb-1 relative pointer-events-none">
          <div className="w-12 h-3.5 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 rounded-md border border-black shadow-md flex items-center justify-center -top-3 absolute">
            <div className="w-6 h-1 bg-black/80 rounded-full" />
          </div>
          <div className="w-16 h-3 bg-black/90 rounded-full border-2 border-white/30 shadow-inner flex items-center justify-center mt-2">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* ID Card Header Bar */}
        <div className="flex justify-between items-center border-b-2 border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-yellow-400" />
            <span className="font-display text-[9px] md:text-[10px] text-yellow-400 uppercase tracking-widest font-bold">
              OFFICIAL EMPLOYEE ID PASS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display text-[8px] bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded border border-purple-400/40 uppercase font-bold">
              RANK: {quest.rank || "MEMBER"}
            </span>

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                playButtonSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white border border-white/30 flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-90"
              title="Close ID Pass"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Profile & Company Section (Includes Supabase Company Logo) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/60 p-3.5 rounded-2xl border border-white/10 shadow-inner">
          {/* Company Logo or Avatar Badge Box */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-2 border-white/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-md group/logo p-1.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={quest.company}
                className="w-full h-full object-contain rendering-pixelated group-hover/logo:scale-110 transition-transform"
              />
            ) : (
              <>
                <Terminal size={32} className="text-black" />
                <span className="font-display text-[6px] text-gray-600 mt-1 uppercase font-bold">COMPANY</span>
              </>
            )}
          </div>

          {/* Company Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg md:text-2xl text-white uppercase text-shadow-pixel leading-tight truncate">
                @{quest.company}
              </h3>
            </div>

            <p className="font-display text-xs text-yellow-400 uppercase tracking-wider font-bold mb-2">
              {quest.position}
            </p>

            <div className="flex flex-wrap items-center gap-3 font-body text-xs text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-muted-foreground" />
                <span className="italic font-semibold">{quest.period}</span>
              </div>

              <div
                className={cn(
                  "font-display text-[7.5px] px-2 py-0.5 rounded border font-bold uppercase",
                  isOngoing
                    ? "text-cyan-400 bg-cyan-950/80 border-cyan-500/50"
                    : "text-green-400 bg-green-950/80 border-green-500/50"
                )}
              >
                [ {isOngoing ? "ACTIVE_EMPLOYEE" : "CAMPAIGN_CLEARED"} ]
              </div>
            </div>
          </div>
        </div>

        {/* Objectives & Deliverables List */}
        <div
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="my-1 flex-1 max-h-[38vh] overflow-y-auto custom-scrollbar bg-black/80 p-4 rounded-xl border border-white/10 touch-pan-y"
        >
          <div className="font-display text-[8.5px] text-muted-foreground uppercase tracking-widest mb-3 font-bold flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-green-400" /> RESPONSIBILITIES & OBJECTIVES CLEARED:
          </div>

          <div className="space-y-3">
            {quest.description.map((obj, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="font-display text-[8.5px] text-accent bg-accent/20 px-1.5 py-0.5 rounded border border-accent/40 shrink-0 mt-0.5 font-bold">
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <p className="font-body text-base md:text-lg text-gray-200 leading-relaxed italic">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipped Tech Stack */}
        {quest.tech && quest.tech.length > 0 && (
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="font-display text-[7.5px] text-muted-foreground uppercase font-bold">
              EQUIPPED SKILLS & STACK:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quest.tech.map((t) => (
                <span
                  key={t}
                  className="font-display text-[7.5px] bg-secondary/20 text-secondary border border-secondary/50 px-2 py-0.5 rounded uppercase font-bold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Card Footer Bar / Pass Navigation */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex justify-between items-center pt-2 border-t border-white/10"
        >
          {hasMultiple ? (
            <div className="flex justify-between items-center w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playButtonSound();
                  onPrevQuest?.();
                }}
                className="pixel-btn py-1.5 px-3 bg-black/80 hover:bg-accent hover:text-black text-white text-[8.5px] font-display flex items-center gap-1 border border-white/20 cursor-pointer"
              >
                <ChevronLeft size={14} /> PREV PASS
              </button>

              <span className="font-mono text-[9px] text-muted-foreground font-bold">
                PASS ID [{currentIndex + 1}/{totalQuests}]
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playButtonSound();
                  onNextQuest?.();
                }}
                className="pixel-btn py-1.5 px-3 bg-black/80 hover:bg-accent hover:text-black text-white text-[8.5px] font-display flex items-center gap-1 border border-white/20 cursor-pointer"
              >
                NEXT PASS <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="w-full text-center font-mono text-[8px] text-muted-foreground uppercase">
              OFFICIAL VERIFIED WORK PASS
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
