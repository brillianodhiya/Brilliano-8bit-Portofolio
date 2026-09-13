import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ExternalLink, Tv, Film, Image as ImageIcon } from "lucide-react";
import { playButtonSound } from "@/lib/audio";

export interface GalleryItem {
  id: string | number;
  title: string;
  url?: string;
  youtube_id?: string;
  description?: string;
  category?: string;
  date?: string;
}

interface RetroGalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function RetroGalleryLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: RetroGalleryLightboxProps) {
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [imgError, setImgError] = useState(false);

  const currentItem = items[currentIndex];

  useEffect(() => {
    setImgError(false);
  }, [currentIndex]);

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    if (cleanPath.startsWith("images/")) {
      return `${import.meta.env.BASE_URL}${cleanPath}`;
    }
    return `${import.meta.env.BASE_URL}images/${cleanPath}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playButtonSound();
        onClose();
      } else if (e.key === "ArrowLeft") {
        playButtonSound();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        onNavigate(prevIndex);
      } else if (e.key === "ArrowRight") {
        playButtonSound();
        const nextIndex = (currentIndex + 1) % items.length;
        onNavigate(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!currentItem) return null;

  const isVideo = !!currentItem.youtube_id;

  const handlePrev = () => {
    playButtonSound();
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onNavigate(prevIndex);
  };

  const handleNext = () => {
    playButtonSound();
    const nextIndex = (currentIndex + 1) % items.length;
    onNavigate(nextIndex);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 select-none overflow-hidden animate-in fade-in duration-200"
      onClick={() => {
        playButtonSound();
        onClose();
      }}
    >
      {/* Top Controls Header Bar */}
      <div
        className="w-full max-w-6xl flex items-center justify-between z-10 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-zinc-900 border-2 border-primary/60 text-primary font-display text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000]">
            {isVideo ? <Film size={14} className="text-red-400" /> : <ImageIcon size={14} className="text-cyan-400" />}
            <span>FEED [{String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}]</span>
          </div>

          <button
            onClick={() => {
              playButtonSound();
              setScanlinesEnabled(!scanlinesEnabled);
            }}
            className="hidden sm:flex pixel-btn px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono border-2 border-zinc-700 items-center gap-1.5 cursor-pointer"
          >
            <Tv size={12} />
            <span>SCANLINES: {scanlinesEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display text-xs md:text-sm text-foreground truncate max-w-[280px] sm:max-w-md md:max-w-lg text-shadow-pixel">
          {currentItem.title}
        </h3>

        {/* Close ESC Button */}
        <button
          onClick={() => {
            playButtonSound();
            onClose();
          }}
          className="pixel-btn px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-display text-xs flex items-center gap-1 border-2 border-white shadow-[3px_3px_0px_#000] cursor-pointer"
        >
          <X size={16} />
          <span className="hidden sm:inline">ESC</span>
        </button>
      </div>

      {/* Main CRT Screen Viewing Area */}
      <div
        className="relative w-full max-w-5xl my-auto aspect-video bg-zinc-950 rounded-2xl border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Curved Glass Screen Container */}
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <iframe
              className="w-full h-full border-0 relative z-10"
              src={`https://www.youtube-nocookie.com/embed/${currentItem.youtube_id}?autoplay=1`}
              title={currentItem.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : !imgError ? (
            <img
              src={resolveImageUrl(currentItem.url)}
              alt={currentItem.title}
              onError={() => setImgError(true)}
              draggable={false}
              className="w-full h-full object-contain relative z-10"
            />
          ) : (
            <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center relative z-10 text-center p-4">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] animate-pulse" />
              <div className="font-display text-red-500 text-sm mb-2 animate-bounce">⚡ NO SIGNAL // 404</div>
              <div className="font-mono text-xs text-zinc-300 max-w-sm truncate">
                {currentItem.title}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 mt-2">
                IMAGE FILE UNREACHABLE OR NOT FOUND
              </div>
            </div>
          )}

          {/* Optional CRT Scanlines Effect Overlay */}
          {scanlinesEnabled && (
            <>
              <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-60" />
              <div className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.85)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-50" />
            </>
          )}

          {/* Navigation Prev Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-40 pixel-btn p-2 bg-zinc-900/80 hover:bg-primary text-foreground hover:text-black border-2 border-white/60 shadow-[3px_3px_0px_#000] transition-transform hover:scale-110 cursor-pointer"
            title="Previous Memory (Left Arrow)"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Navigation Next Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-40 pixel-btn p-2 bg-zinc-900/80 hover:bg-primary text-foreground hover:text-black border-2 border-white/60 shadow-[3px_3px_0px_#000] transition-transform hover:scale-110 cursor-pointer"
            title="Next Memory (Right Arrow)"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Bottom Metadata & Controls Bar */}
      <div
        className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 z-10 bg-zinc-950/90 p-3 rounded-xl border-2 border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>
            <span className="text-zinc-500">TYPE: </span>
            <span className="text-primary font-bold uppercase">{isVideo ? "MP4 VIDEO FEED" : "IMAGE CAPTURE"}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-zinc-500">FORMAT: </span>
            <span className="text-foreground">1080P RETRO</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isVideo ? (
            <a
              href={`https://www.youtube.com/watch?v=${currentItem.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playButtonSound}
              className="pixel-btn px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-display text-[10px] flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            >
              <span>OPEN YOUTUBE</span>
              <ExternalLink size={12} />
            </a>
          ) : currentItem.url ? (
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playButtonSound}
              className="pixel-btn px-3 py-1.5 bg-accent text-black hover:bg-yellow-300 font-display text-[10px] flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            >
              <span>OPEN FULL RESOLUTION</span>
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
