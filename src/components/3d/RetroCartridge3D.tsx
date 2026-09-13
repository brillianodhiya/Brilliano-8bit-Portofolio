import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  ZoomIn,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";

interface RetroCartridge3DProps {
  title: string;
  type?: string;
  company?: string;
  status?: string;
  images: string[];
  currentImageIdx: number;
  onNextImage?: () => void;
  onPrevImage?: () => void;
  tech?: string[];
  color?: string;
  demoUrl?: string;
  githubUrl?: string;
  desc?: string;
  onClose?: () => void;
}

export function RetroCartridge3D({
  title,
  type = "QUEST",
  company = "Independent",
  status = "COMPLETED",
  images = [],
  currentImageIdx = 0,
  onNextImage,
  onPrevImage,
  tech = [],
  color = "border-primary",
  demoUrl,
  githubUrl,
  desc = "",
  onClose,
}: RetroCartridge3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial 3D angle so depth and volume are instantly visible
  const [rotationY, setRotationY] = useState<number>(-18);
  const [rotationX, setRotationX] = useState<number>(10);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  const getImageUrl = (image?: string) => {
    if (!image) return `${import.meta.env.BASE_URL}images/cartridge-1.png`;
    if (image.startsWith("http")) return image;
    return `${import.meta.env.BASE_URL}images/${image}`;
  };

  const currentImage = images[currentImageIdx] || images[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotationY((prev) => prev + deltaX * 0.8);
    setRotationX((prev) => Math.max(-45, Math.min(45, prev - deltaY * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY * -0.0015;
    setZoomScale((prev) => Math.min(1.8, Math.max(0.7, prev + delta)));
  };

  const handleFlip = () => {
    playButtonSound();
    setIsFlipped(!isFlipped);
    setRotationY((prev) => prev + 180);
  };

  const isConfidential = (!demoUrl?.trim() && !githubUrl?.trim()) || status === "CONFIDENTIAL";

  return (
    <div
      onWheel={handleWheel}
      className="relative flex flex-col items-center select-none z-50"
    >
      {/* 3D Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleFlip}
        className={cn(
          "relative w-80 h-[480px] md:w-[360px] md:h-[520px] cursor-grab active:cursor-grabbing [perspective:1400px] my-2"
        )}
      >
        {/* 3D Rotating & Zooming Volumetric Box */}
        <div
          className="w-full h-full relative transition-transform duration-100 ease-out [transform-style:preserve-3d]"
          style={{
            transform: `scale3d(${zoomScale}, ${zoomScale}, ${zoomScale}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          }}
        >
          {/* 1. FRONT FACE (Pushed forward by Z=12px) */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-3xl border-4 bg-gradient-to-b from-slate-900 via-zinc-900 to-black p-4 md:p-5 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.95)] [backface-visibility:hidden] [transform:translateZ(12px)]",
              color
            )}
          >
            {/* Top Grooves / Ridges */}
            <div className="w-full flex justify-between items-center gap-1.5 opacity-70">
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
            </div>

            {/* Main Cartridge Front Sticker */}
            <div className="w-full flex-1 my-2 rounded-2xl p-3 md:p-4 bg-slate-950 border-2 border-white/20 flex flex-col justify-between relative overflow-hidden group shadow-inner">
              {/* Scanlines & Holographic Sheen */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Sticker Header: Type pill without blinking star icon & Status pill */}
              <div className="flex justify-between items-center z-10 mb-1 gap-2 w-full">
                <span className="font-display text-[8px] md:text-[9px] text-white/90 bg-black/80 px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider truncate max-w-[170px]">
                  {type}
                </span>
                <span className="font-display text-[7.5px] text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold uppercase shrink-0">
                  {status}
                </span>
              </div>

              {/* Cartridge Cover Image with Screenshot Switcher Controls & Lightbox Click */}
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  playButtonSound();
                  setIsLightboxOpen(true);
                }}
                className="w-full aspect-[16/10] my-1 rounded-xl overflow-hidden border-2 border-white/20 relative bg-black shadow-inner flex items-center justify-center group/img cursor-zoom-in"
              >
                <img
                  src={getImageUrl(currentImage)}
                  alt={title}
                  className="w-full h-full object-contain bg-black rendering-pixelated group-hover/img:scale-105 transition-transform duration-500"
                />

                {/* Click to Enlarge Hover Cue */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                  <span className="font-display text-[9px] text-white bg-black/90 px-2.5 py-1 rounded-md border border-white/40 flex items-center gap-1.5 shadow-lg">
                    <ZoomIn size={12} className="text-primary" /> CLICK TO ENLARGE
                  </span>
                </div>

                {/* Screenshot Switcher Chevron Overlay with Drag Prevention */}
                {images.length > 1 && (
                  <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex justify-between items-center z-30 pointer-events-auto">
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        playButtonSound();
                        onPrevImage?.();
                      }}
                      className="w-9 h-9 rounded-full bg-black/90 hover:bg-primary hover:text-black text-white border-2 border-white/40 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
                      title="Previous Screenshot"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        playButtonSound();
                        onNextImage?.();
                      }}
                      className="w-9 h-9 rounded-full bg-black/90 hover:bg-primary hover:text-black text-white border-2 border-white/40 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
                      title="Next Screenshot"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Screenshot Index Badge */}
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 font-display text-[8px] text-white bg-black/90 px-2 py-0.5 rounded border border-white/40 z-20 font-bold shadow-md">
                    {currentImageIdx + 1}/{images.length}
                  </div>
                )}
              </div>

              {/* Sticker Footer Title & Company */}
              <div className="bg-black/90 p-2 md:p-2.5 rounded-lg border border-white/20 z-10 text-center min-h-[46px] flex flex-col items-center justify-center">
                <h3 className="font-display text-[10px] md:text-xs text-white uppercase text-shadow-pixel leading-tight break-words max-w-full px-1">
                  {title}
                </h3>
                <p className="font-body text-[10px] text-muted-foreground truncate mt-0.5">
                  🏢 {company}
                </p>
              </div>
            </div>

            {/* Bottom Metallic Connector Pins */}
            <div className="w-full h-5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-md border border-black/60 flex items-center justify-evenly px-2 shadow-inner">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-1 h-full bg-black/60" />
              ))}
            </div>
          </div>

          {/* 2. BACK FACE (Pushed backward by Z=-12px and rotated Y=180) */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-3xl border-4 bg-gradient-to-b from-zinc-950 via-slate-900 to-black p-4 md:p-5 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.95)] [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(12px)]",
              color
            )}
          >
            {/* Top Ridges */}
            <div className="w-full flex justify-between items-center gap-1.5 opacity-70">
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
              <div className="h-2.5 flex-1 bg-black/90 rounded-sm border-b border-white/20" />
            </div>

            {/* Back Technical Spec Sticker */}
            <div className="w-full flex-1 my-2 rounded-2xl p-3 md:p-4 bg-zinc-900 border-2 border-white/20 flex flex-col justify-between relative overflow-hidden shadow-inner">
              {/* Sticker Header */}
              <div className="border-b border-white/20 pb-1.5 mb-1.5 flex justify-between items-center">
                <span className="font-display text-[9px] text-primary tracking-widest uppercase font-bold">
                  TECHNICAL SPECIFICATION
                </span>
                <span className="font-mono text-[8px] text-muted-foreground">
                  REV-8BIT
                </span>
              </div>

              {/* Title & Company */}
              <div className="mb-1.5">
                <h4 className="font-display text-[11px] md:text-xs text-white uppercase leading-tight break-words">
                  {title}
                </h4>
                <p className="font-body text-[10px] text-muted-foreground">
                  🏢 {company} | {type}
                </p>
              </div>

              {/* Description & Tech Stack */}
              <div
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 overflow-y-auto max-h-48 my-1 custom-scrollbar pr-1 touch-pan-y"
              >
                {desc && (
                  <p className="font-body text-xs md:text-sm text-gray-200 leading-snug mb-2.5 bg-black/60 p-2.5 rounded-lg border border-white/10 italic">
                    "{desc}"
                  </p>
                )}

                <p className="font-display text-[8px] text-muted-foreground uppercase mb-1 font-bold">
                  EQUIPPED TECH STACK:
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tech.map((t) => (
                    <span
                      key={t}
                      className="font-body text-xs bg-black px-2 py-0.5 rounded border border-white/20 text-white font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Embedded Action Buttons on Back Label */}
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="mt-2 pt-2 border-t border-white/20 flex flex-col gap-2 z-30 pointer-events-auto"
              >
                {isConfidential ? (
                  <div className="p-2 bg-red-950/80 border border-red-500/40 rounded flex items-center justify-center gap-2">
                    <Shield size={14} className="text-red-400 animate-pulse" />
                    <span className="font-display text-[8px] text-red-300 uppercase">
                      CONFIDENTIAL NDA (RESTRICTED)
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    {demoUrl?.trim() && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          playButtonSound();
                          window.open(demoUrl, "_blank");
                        }}
                        className="pixel-btn py-2 px-3 flex-1 bg-primary text-black font-display text-[9px] flex items-center justify-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      >
                        <ExternalLink size={12} /> LIVE DEMO
                      </button>
                    )}
                    {githubUrl?.trim() && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          playButtonSound();
                          window.open(githubUrl, "_blank");
                        }}
                        className="pixel-btn py-2 px-3 flex-1 bg-card text-white font-display text-[9px] flex items-center justify-center gap-1 border border-white/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Github size={12} /> SOURCE CODE
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Metallic Connector Pins */}
            <div className="w-full h-5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-md border border-black/60 flex items-center justify-evenly px-2 shadow-inner">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-1 h-full bg-black/60" />
              ))}
            </div>
          </div>

          {/* 3. LEFT SIDE WALL (Depth thickness = 24px) */}
          <div
            className="w-[24px] h-full absolute left-0 top-0 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 border-y-4 border-l-2 border-white/30 rounded-l-2xl [transform:rotateY(-90deg)_translateZ(12px)] [transform-origin:left_center] flex flex-col justify-around py-8 shadow-inner"
          >
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
          </div>

          {/* 4. RIGHT SIDE WALL (Depth thickness = 24px) */}
          <div
            className="w-[24px] h-full absolute right-0 top-0 bg-gradient-to-l from-zinc-950 via-slate-900 to-zinc-950 border-y-4 border-r-2 border-white/30 rounded-r-2xl [transform:rotateY(90deg)_translateZ(12px)] [transform-origin:right_center] flex flex-col justify-around py-8 shadow-inner"
          >
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
            <div className="w-full h-12 bg-black/80 border-y border-white/20" />
          </div>

          {/* 5. TOP SIDE WALL (Cartridge insertion slot top edge) */}
          <div
            className="h-[24px] w-full absolute top-0 left-0 bg-gradient-to-b from-zinc-950 via-slate-900 to-black border-x-4 border-t-2 border-white/30 rounded-t-2xl [transform:rotateX(90deg)_translateZ(12px)] [transform-origin:center_top] flex justify-around items-center px-4 shadow-inner"
          >
            <div className="h-full w-8 bg-black/90 border-x border-white/20" />
            <div className="h-full w-8 bg-black/90 border-x border-white/20" />
            <div className="h-full w-8 bg-black/90 border-x border-white/20" />
          </div>

          {/* 6. BOTTOM SIDE WALL (Connector pin opening bottom edge) */}
          <div
            className="h-[24px] w-full absolute bottom-0 left-0 bg-gradient-to-t from-zinc-950 via-slate-900 to-black border-x-4 border-b-2 border-white/30 rounded-b-2xl [transform:rotateX(-90deg)_translateZ(12px)] [transform-origin:center_bottom] flex justify-center items-center shadow-inner"
          >
            <div className="w-11/12 h-2.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded border border-black/80" />
          </div>
        </div>
      </div>

      {/* Fullscreen High-Res Screenshot Lightbox Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[20000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-8 cursor-zoom-out"
          >
            {/* Header Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl flex justify-between items-center mb-3 px-2 z-10"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs md:text-sm text-primary uppercase text-shadow-pixel tracking-wider">
                  {title}
                </span>
                {images.length > 1 && (
                  <span className="font-mono text-xs text-white/80 bg-black/80 px-2.5 py-0.5 rounded border border-white/20 font-bold">
                    SCREENSHOT {currentImageIdx + 1}/{images.length}
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-600 text-white border border-white/30 flex items-center justify-center transition-colors cursor-pointer shadow-lg active:scale-90"
                title="Close Enlarged View"
              >
                <X size={22} />
              </button>
            </div>

            {/* Main High-Res Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl max-h-[82vh] rounded-2xl border-4 border-white/30 bg-slate-950 p-2 md:p-4 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center cursor-default"
            >
              <img
                src={getImageUrl(currentImage)}
                alt={title}
                className="max-w-full max-h-[76vh] object-contain rounded-lg shadow-inner"
              />

              {/* Prev / Next controls inside Lightbox */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playButtonSound();
                      onPrevImage?.();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/90 hover:bg-primary hover:text-black text-white border-2 border-white/40 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer z-20"
                    title="Previous Screenshot"
                  >
                    <ChevronLeft size={26} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playButtonSound();
                      onNextImage?.();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/90 hover:bg-primary hover:text-black text-white border-2 border-white/40 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer z-20"
                    title="Next Screenshot"
                  >
                    <ChevronRight size={26} />
                  </button>
                </>
              )}
            </motion.div>

            <p className="mt-3 font-display text-[9px] md:text-[10px] text-white/50 uppercase tracking-widest">
              CLICK ANYWHERE OUTSIDE OR PRESS ESC TO CLOSE
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
