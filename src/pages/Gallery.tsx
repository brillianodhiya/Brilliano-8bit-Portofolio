import { useState } from "react";
import { motion } from "framer-motion";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2, Tv, Grid, Film, Image as ImageIcon, Maximize2 } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { RetroGalleryLightbox, GalleryItem } from "@/components/RetroGalleryLightbox";
import { RetroTv3D } from "@/components/3d/RetroTv3D";

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

export default function Gallery() {
  const { data: imagesData, isLoading } = usePortfolioData("gallery");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "IMAGES" | "VIDEOS">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "3D_TV">("GRID");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [tvChannelIndex, setTvChannelIndex] = useState<number>(0);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const allItems = (imagesData || []) as GalleryItem[];

  // Filter items by active tab
  const filteredItems = allItems.filter((item) => {
    if (filterCategory === "IMAGES") return !item.youtube_id;
    if (filterCategory === "VIDEOS") return !!item.youtube_id;
    return true;
  });


  const currentTvItem = filteredItems[tvChannelIndex % Math.max(1, filteredItems.length)] || allItems[0];

  const handleNextTvChannel = () => {
    playButtonSound();
    setTvChannelIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrevTvChannel = () => {
    playButtonSound();
    setTvChannelIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-6"
    >
      <SEO
        title="Map | Gallery & Videos"
        description="Captured memories and programming tutorials by Brilliano Dhiya Ulhaq. Screenshots and tech environment videos."
      />

      {/* Header Banner & Title */}
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-primary text-shadow-pixel mb-2 uppercase">
          CYBER MEMORY VAULT
        </h2>
        <p className="font-body text-xl md:text-2xl text-muted-foreground">
          Visual archives & broadcast feeds captured during the campaign.
        </p>
      </div>


      {/* Filter Tabs & View Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b-2 border-muted/50">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              playButtonSound();
              setFilterCategory("ALL");
              setTvChannelIndex(0);
            }}
            className={`pixel-btn px-3 py-1.5 font-display text-[10px] sm:text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
              filterCategory === "ALL"
                ? "bg-primary text-black border-black font-bold shadow-[2px_2px_0px_#000]"
                : "bg-background text-muted-foreground border-muted hover:text-foreground"
            }`}
          >
            <span>[ ALL FEEDS ]</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setFilterCategory("IMAGES");
              setTvChannelIndex(0);
            }}
            className={`pixel-btn px-3 py-1.5 font-display text-[10px] sm:text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
              filterCategory === "IMAGES"
                ? "bg-cyan-500 text-black border-black font-bold shadow-[2px_2px_0px_#000]"
                : "bg-background text-muted-foreground border-muted hover:text-foreground"
            }`}
          >
            <ImageIcon size={12} />
            <span>[ SCREENSHOTS ]</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setFilterCategory("VIDEOS");
              setTvChannelIndex(0);
            }}
            className={`pixel-btn px-3 py-1.5 font-display text-[10px] sm:text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
              filterCategory === "VIDEOS"
                ? "bg-red-600 text-white border-black font-bold shadow-[2px_2px_0px_#000]"
                : "bg-background text-muted-foreground border-muted hover:text-foreground"
            }`}
          >
            <Film size={12} />
            <span>[ VIDEOS ]</span>
          </button>
        </div>

        {/* View Mode Switcher: 2D Grid vs 3D CRT TV */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playButtonSound();
              setViewMode("GRID");
            }}
            className={`pixel-btn px-3 py-1.5 font-display text-[10px] sm:text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
              viewMode === "GRID"
                ? "bg-yellow-400 text-black border-black font-bold shadow-[2px_2px_0px_#000]"
                : "bg-zinc-900 text-muted-foreground border-zinc-700 hover:text-foreground"
            }`}
          >
            <Grid size={13} />
            <span>GRID VIEW</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setViewMode("3D_TV");
            }}
            className={`pixel-btn px-3 py-1.5 font-display text-[10px] sm:text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
              viewMode === "3D_TV"
                ? "bg-amber-700 text-white border-amber-900 font-bold shadow-[2px_2px_0px_#000]"
                : "bg-zinc-900 text-muted-foreground border-zinc-700 hover:text-foreground"
            }`}
          >
            <Tv size={13} />
            <span>3D CRT THEATER</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: 3D CRT TV THEATER SHOWCASE */}
      {viewMode === "3D_TV" && currentTvItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-6"
        >
          <div className="text-center font-mono text-xs text-amber-400 bg-amber-950/60 p-2 border border-amber-800 rounded">
            📺 3D CRT BROADCAST MODE — CLICK DIALS OR USE [<span className="text-white font-bold">◄ CH</span> / <span className="text-white font-bold">CH ►</span>] BUTTONS TO SURF CHANNELS
          </div>

          <RetroTv3D
            channelName={currentTvItem.title}
            channelUrl={currentTvItem.youtube_id ? `https://www.youtube.com/watch?v=${currentTvItem.youtube_id}` : ""}
            imageUrl={currentTvItem.url}
            channelDesc={`FEED ID: #${currentTvItem.id} • ${currentTvItem.youtube_id ? "VIDEO BROADCAST" : "STATIC CAPTURE"}`}
            channelNumber={(tvChannelIndex % filteredItems.length) + 1}
            onNextChannel={handleNextTvChannel}
            onPrevChannel={handlePrevTvChannel}
          />

          {/* Interactive Channel Thumbnail Selector Ribbon */}
          <div className="bg-zinc-950 p-4 rounded-xl border-2 border-zinc-800">
            <div className="font-display text-xs text-muted-foreground mb-3 uppercase flex items-center gap-2">
              <Tv size={14} className="text-primary" />
              <span>CHANNEL SURF LIST ({filteredItems.length} CHANNELS)</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {filteredItems.map((item, idx) => {
                const isActive = idx === (tvChannelIndex % filteredItems.length);
                const isVid = !!item.youtube_id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playButtonSound();
                      setTvChannelIndex(idx);
                    }}
                    className={`relative shrink-0 w-32 aspect-video rounded overflow-hidden border-2 transition-all cursor-pointer group ${
                      isActive
                        ? "border-primary scale-105 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                        : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-500"
                    }`}
                  >
                    {isVid ? (
                      <img
                        src={`https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={resolveImageUrl(item.url)} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-white">
                      CH-{String(idx + 1).padStart(2, "0")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW MODE 2: 2D RETRO GRID VIEW */}
      {viewMode === "GRID" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((img: GalleryItem, idx: number) => {
            const isVideo = !!img.youtube_id;

            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  playButtonSound();
                  setLightboxIndex(idx);
                }}
                onContextMenu={(e) => e.preventDefault()}
                className="pixel-panel p-2 md:p-4 bg-background group cursor-pointer select-none relative transition-transform hover:-translate-y-1"
              >
                <div className="border-4 border-muted overflow-hidden relative aspect-video bg-black">
                  {isVideo ? (
                    <img
                      src={`https://img.youtube.com/vi/${img.youtube_id}/hqdefault.jpg`}
                      alt={img.title}
                      draggable={false}
                      className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={img.title}
                      draggable={false}
                      className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  )}

                  {/* CRT Scanline & Color Overlay */}
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-40 pointer-events-none group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50" />

                  {/* Hover Inspect Icon Button */}
                  <div className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-opacity">
                    <div className="pixel-btn px-3 py-1.5 bg-primary text-black font-display text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000]">
                      <Maximize2 size={14} />
                      <span>INSPECT MEMORY</span>
                    </div>
                  </div>

                  {isVideo && (
                    <div className="absolute top-2 right-2 z-50 bg-red-600 text-white font-display text-[8px] px-2 py-1 border-2 border-white shadow-pixel flex items-center gap-1">
                      <Film size={10} />
                      <span>VIDEO</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                  <span className="font-display text-xs md:text-sm text-foreground uppercase truncate flex-1 text-shadow-pixel">
                    {img.title}
                  </span>
                  <span className="font-mono text-[10px] text-primary/80 font-bold shrink-0 bg-black/40 px-2 py-0.5 border border-primary/30 rounded">
                    {isVideo ? "VIDEO_FEED.MP4" : `FILE_${String(img.id).slice(0, 8).toUpperCase()}.DAT`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FULL-SCREEN RETRO CRT LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <RetroGalleryLightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
        />
      )}
    </motion.div>
  );
}
