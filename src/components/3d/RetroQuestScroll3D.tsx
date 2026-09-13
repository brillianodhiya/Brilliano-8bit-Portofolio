import { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Terminal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";

export interface QuestItem {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string[];
  tech: string[];
  display_order?: number;
  rank?: string;
  rank_boss?: string;
}

interface RetroQuestScroll3DProps {
  quest: QuestItem;
  onClose?: () => void;
  onNextQuest?: () => void;
  onPrevQuest?: () => void;
  hasMultiple?: boolean;
}

export function RetroQuestScroll3D({
  quest,
  onClose,
  onNextQuest,
  onPrevQuest,
  hasMultiple = false
}: RetroQuestScroll3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D rotation state for volumetric scroll inspection
  const [rotationY, setRotationY] = useState<number>(-12);
  const [rotationX, setRotationX] = useState<number>(8);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotationY((prev) => prev + deltaX * 0.7);
    setRotationX((prev) => Math.max(-35, Math.min(35, prev - deltaY * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY * -0.0015;
    setZoomScale((prev) => Math.min(1.6, Math.max(0.75, prev + delta)));
  };

  const resetAngle = () => {
    playButtonSound();
    setRotationX(8);
    setRotationY(-12);
    setZoomScale(1);
  };

  const isOngoing = quest.period.toLowerCase().includes("present");

  return (
    <div
      onWheel={handleWheel}
      className="relative flex flex-col items-center select-none z-50 w-full max-w-2xl mx-auto"
    >
      {/* Top Floating Controls */}
      <div className="w-full flex justify-between items-center mb-3 px-2 z-50">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs md:text-sm text-yellow-400 uppercase text-shadow-pixel tracking-wider flex items-center gap-1.5">
            <Sparkles size={16} /> QUEST BRIEFING: @{quest.company}
          </span>
        </div>

        <button
          onClick={() => {
            playButtonSound();
            onClose?.();
          }}
          className="w-9 h-9 rounded-full bg-black/90 hover:bg-red-600 text-white border border-white/30 flex items-center justify-center transition-colors cursor-pointer shadow-xl active:scale-90"
          title="Close Quest Log"
        >
          <X size={20} />
        </button>
      </div>

      {/* 3D Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[520px] md:h-[560px] cursor-grab active:cursor-grabbing [perspective:1400px] my-1"
      >
        {/* 3D Volumetric Scroll Body */}
        <div
          className="w-full h-full relative transition-transform duration-100 ease-out [transform-style:preserve-3d]"
          style={{
            transform: `scale3d(${zoomScale}, ${zoomScale}, ${zoomScale}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          }}
        >
          {/* Main Front Parchment / Terminal Face (Z = 10px) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl border-4 border-amber-500/50 bg-gradient-to-b from-amber-950/90 via-zinc-950 to-black p-5 md:p-6 flex flex-col justify-between shadow-[0_30px_80px_rgba(0,0,0,0.95)] [backface-visibility:hidden] [transform:translateZ(10px)] overflow-hidden">
            {/* Top Metallic Scroll Rod & Grooves */}
            <div className="w-full flex items-center justify-between gap-2 pb-3 border-b-2 border-amber-500/30">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-amber-400" />
                <span className="font-display text-[9px] md:text-[10px] text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                  RANK: {quest.rank || "MEMBER"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="font-body text-sm md:text-base text-gray-300 italic font-semibold">
                  {quest.period}
                </span>
              </div>
            </div>

            {/* Scroll Header Titles */}
            <div className="my-3">
              <div className="flex items-center gap-2 mb-1">
                <Terminal size={18} className="text-primary shrink-0" />
                <h3 className="font-display text-lg md:text-2xl text-white uppercase text-shadow-pixel leading-tight break-words">
                  @{quest.company}
                </h3>
              </div>
              <h4 className="font-display text-xs md:text-sm text-yellow-400 uppercase tracking-wider pl-6">
                {quest.position}
              </h4>
            </div>

            {/* Scrollable Objectives List inside 3D space */}
            <div
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto custom-scrollbar my-2 pr-2 bg-black/60 p-4 rounded-xl border border-white/10 touch-pan-y"
            >
              <div className="font-display text-[9px] text-muted-foreground uppercase tracking-widest mb-3 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-400" /> OBJECTIVES & CAMPAIGN DELIVERABLES CLEARED:
              </div>

              <div className="space-y-3">
                {quest.description.map((obj, i) => (
                  <div key={i} className="flex gap-3 items-start group/item">
                    <span className="font-display text-[9px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 mt-0.5">
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    <p className="font-body text-base md:text-lg text-gray-200 leading-relaxed italic">
                      {obj}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipped Tech Footer */}
            {quest.tech && quest.tech.length > 0 && (
              <div className="mt-2 pt-3 border-t border-white/15 flex flex-col gap-1.5">
                <span className="font-display text-[8px] text-muted-foreground uppercase font-bold">
                  EQUIPPED TECH & SPELLS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quest.tech.map((t) => (
                    <span
                      key={t}
                      className="font-display text-[8px] bg-secondary/20 text-secondary border border-secondary/50 px-2 py-0.5 rounded uppercase font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status Footer Badge */}
            <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/10">
              <div
                className={cn(
                  "font-display text-[8px] md:text-[9px] px-2.5 py-1 rounded border font-bold uppercase tracking-wider animate-pulse",
                  isOngoing
                    ? "text-cyan-400 bg-cyan-950/80 border-cyan-500/50"
                    : "text-green-400 bg-green-950/80 border-green-500/50"
                )}
              >
                [ {isOngoing ? "ONGOING_MISSION" : "MISSION_COMPLETED"} ]
              </div>

              <span className="font-mono text-[8px] text-muted-foreground uppercase">
                3D PARCHMENT INSPECTOR
              </span>
            </div>
          </div>

          {/* Back Side Wall (Z = -10px) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl border-4 border-amber-600/40 bg-zinc-950 p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(10px)]">
            <div className="font-display text-xs text-amber-400 text-center">
              QUEST LOG ARCHIVE BACK COVER
            </div>
          </div>

          {/* 3D Left Depth Wall */}
          <div className="w-[20px] h-full absolute left-0 top-0 bg-gradient-to-r from-amber-950 to-zinc-950 border-y-4 border-l-2 border-amber-500/30 rounded-l-xl [transform:rotateY(-90deg)_translateZ(10px)] [transform-origin:left_center]" />

          {/* 3D Right Depth Wall */}
          <div className="w-[20px] h-full absolute right-0 top-0 bg-gradient-to-l from-amber-950 to-zinc-950 border-y-4 border-r-2 border-amber-500/30 rounded-r-xl [transform:rotateY(90deg)_translateZ(10px)] [transform-origin:right_center]" />
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div className="w-full flex items-center justify-between gap-3 mt-3 px-2 z-50">
        {hasMultiple ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playButtonSound();
                onPrevQuest?.();
              }}
              className="pixel-btn py-1.5 px-3 bg-black/80 hover:bg-primary hover:text-black text-white text-[9px] font-display flex items-center gap-1 border border-white/20"
            >
              <ChevronLeft size={14} /> PREV QUEST
            </button>
            <button
              onClick={() => {
                playButtonSound();
                onNextQuest?.();
              }}
              className="pixel-btn py-1.5 px-3 bg-black/80 hover:bg-primary hover:text-black text-white text-[9px] font-display flex items-center gap-1 border border-white/20"
            >
              NEXT QUEST <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={resetAngle}
          className="pixel-btn py-1.5 px-3 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 text-[9px] font-display flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={12} /> RESET ANGLE
        </button>
      </div>
    </div>
  );
}
