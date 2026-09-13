import { useState, useRef, useEffect } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { playButtonSound } from "@/lib/audio";

interface RetroTv3DProps {
  channelName: string;
  channelUrl: string;
  channelDesc: string;
  channelNumber: number;
  imageUrl?: string;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
}

export function RetroTv3D({
  channelName,
  channelUrl,
  channelDesc,
  channelNumber,
  imageUrl,
  onNextChannel,
  onPrevChannel,
}: RetroTv3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("rotateX(0deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);
  const [knobRotation, setKnobRotation] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 20;
    const rotateY = ((x - centerX) / centerX) * 25;

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform("rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  const handleKnobClick = (isNext = true) => {
    setKnobRotation((prev) => prev + (isNext ? 45 : -45));
    playButtonSound();
    if (isNext && onNextChannel) {
      onNextChannel();
    } else if (!isNext && onPrevChannel) {
      onPrevChannel();
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // 1. Direct video ID format (watch?v=ID or embed/ID or youtu.be/ID)
    const videoMatch = url.match(/(?:watch\?v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoMatch && videoMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${videoMatch[1]}`;
    }

    // 2. Channel Handle format (@handle)
    if (url.includes("@")) {
      const handle = url.split("@")[1]?.split("/")[0]?.split("?")[0];
      if (handle) {
        return `https://www.youtube-nocookie.com/embed?listType=user_uploads&list=${handle}`;
      }
    }

    return url;
  };

  const embedUrl = getEmbedUrl(channelUrl);
  const isImage = !!imageUrl;

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-3xl mx-auto my-6 select-none [perspective:1400px] cursor-grab active:cursor-grabbing py-4"
    >
      {/* 3D Dynamic Ambient Ground Shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-black/60 blur-xl rounded-full pointer-events-none transition-transform duration-200"
        style={{ transform: `translateX(-50%) translateZ(-80px) scale(${isHovered ? 1.1 : 1})` }}
      />

      {/* 3D CRT TV Main Cabinet Assembly */}
      <div
        className="w-full relative transition-transform duration-200 ease-out [transform-style:preserve-3d] flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 border-4 border-amber-800"
        style={{
          transform,
          boxShadow: isHovered
            ? "0 35px 70px -10px rgba(239, 68, 68, 0.35), inset 0 0 25px rgba(245, 158, 11, 0.25)"
            : "0 25px 50px -10px rgba(0,0,0,0.95)",
        }}
      >
        {/* REAR CRT TUBE SHELL */}
        <div
          className="absolute inset-x-16 top-8 bottom-8 bg-gradient-to-b from-neutral-900 via-stone-900 to-black rounded-3xl border-4 border-stone-800 flex flex-col items-center justify-between p-4 shadow-2xl pointer-events-none"
          style={{ transform: "translateZ(-80px)", transformOrigin: "center" }}
        >
          {/* Back Air Vents / Heat Grill */}
          <div className="w-full flex flex-col gap-1.5 opacity-60">
            <div className="h-1.5 w-full bg-black rounded-full border-b border-stone-700" />
            <div className="h-1.5 w-full bg-black rounded-full border-b border-stone-700" />
            <div className="h-1.5 w-full bg-black rounded-full border-b border-stone-700" />
            <div className="h-1.5 w-full bg-black rounded-full border-b border-stone-700" />
          </div>

          {/* CRT Warning Label & Coaxial Port */}
          <div className="w-full flex items-center justify-between px-2 text-stone-500 font-mono text-[8px]">
            <div className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 px-1.5 py-0.5 rounded uppercase font-bold">
              ⚡ HIGH VOLTAGE CRT
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-700 border border-stone-500 flex items-center justify-center text-[5px] text-white">
                RF
              </div>
              <span>MODEL: CRT-1998</span>
            </div>
          </div>
        </div>

        {/* Tapered Side Walls */}
        <div
          className="absolute top-0 inset-x-4 h-20 bg-gradient-to-b from-amber-900 to-stone-900 rounded-t-2xl border-t-2 border-x-2 border-amber-700/60 pointer-events-none"
          style={{ transform: "translateZ(-40px) rotateX(-75deg)", transformOrigin: "top" }}
        />
        <div
          className="absolute bottom-0 inset-x-4 h-20 bg-stone-950 rounded-b-2xl border-b-2 border-x-2 border-stone-800 pointer-events-none"
          style={{ transform: "translateZ(-40px) rotateX(75deg)", transformOrigin: "bottom" }}
        />
        <div
          className="absolute top-4 bottom-4 left-0 w-20 bg-gradient-to-r from-amber-950 to-stone-900 rounded-l-2xl border-l-2 border-y-2 border-amber-800 pointer-events-none opacity-95"
          style={{ transform: "translateZ(-40px) rotateY(-75deg)", transformOrigin: "left" }}
        />
        <div
          className="absolute top-4 bottom-4 right-0 w-20 bg-gradient-to-l from-amber-950 to-stone-900 rounded-r-2xl border-r-2 border-y-2 border-amber-800 pointer-events-none opacity-95"
          style={{ transform: "translateZ(-40px) rotateY(75deg)", transformOrigin: "right" }}
        />

        {/* 3D Antennas */}
        <div 
          className="absolute -top-12 flex gap-20 z-20 pointer-events-none transition-transform duration-300"
          style={{ transform: `translateZ(30px) rotateX(${isHovered ? "-12deg" : "0deg"})` }}
        >
          <div className="w-2 h-14 bg-gradient-to-t from-amber-900 via-stone-400 to-slate-200 -rotate-35 origin-bottom rounded-full shadow-2xl border-r border-white/50" />
          <div className="w-2 h-14 bg-gradient-to-t from-amber-900 via-stone-400 to-slate-200 rotate-35 origin-bottom rounded-full shadow-2xl border-l border-white/50" />
        </div>

        {/* Top TV Status Bar & Info Header */}
        <div className="w-full flex items-center justify-between mb-3 px-2 z-10 min-w-0 [transform-style:preserve-3d]" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2 overflow-hidden">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(255,0,0,0.9)] border border-red-300 shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs text-red-300 font-bold uppercase tracking-widest truncate block min-w-0 flex-1 text-shadow-pixel">
              BROADCAST // CH-{String(channelNumber).padStart(2, "0")}: {channelName}
            </span>
          </div>

          {channelUrl && !isImage && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playButtonSound}
              className="pixel-btn px-2.5 py-1 text-[9px] bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shrink-0 shadow-md transition-transform hover:scale-105"
            >
              OPEN SOURCE <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Main CRT Screen Outer Bezel Frame */}
        <div 
          className="relative w-full aspect-video bg-stone-900 rounded-2xl p-2 sm:p-3 border-4 border-amber-950 shadow-[inset_0_5px_20px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden"
          style={{ transform: "translateZ(15px)" }}
        >
          {/* CRT Screen Display Container */}
          <div className="relative w-full h-full rounded-xl bg-black border-4 border-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
            {isImage ? (
              !imgError ? (
                <img
                  key={imageUrl}
                  src={resolveImageUrl(imageUrl)}
                  alt={channelName}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center relative z-10 text-center p-4">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] animate-pulse" />
                  <div className="font-display text-red-500 text-xs sm:text-sm mb-2 animate-bounce">⚡ NO SIGNAL // 404</div>
                  <div className="font-mono text-[10px] text-zinc-300 max-w-[240px] truncate">
                    {channelName}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-500 mt-1">
                    MEDIA FILE UNREACHABLE
                  </div>
                </div>
              )
            ) : (
              <iframe
                key={channelUrl}
                src={embedUrl}
                title={channelName}
                className="w-full h-full border-0 relative z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* CRT Glass Lens Effect & Reflection Overlay */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-75" />
            <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.85)_100%)]" />
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-60" />
          </div>
        </div>

        {/* Lower Control Panel: 3D Knobs, Grille & Info Bar */}
        <div 
          className="w-full flex flex-col sm:flex-row items-center justify-between mt-3 px-3 pt-2.5 border-t-2 border-amber-900/80 gap-3 z-10 min-w-0"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Channel Description */}
          <div className="flex items-center gap-2 text-amber-200 min-w-0 flex-1 overflow-hidden mr-2">
            <span className="text-sm shrink-0">📡</span>
            <span className="font-mono text-[10px] sm:text-xs text-amber-200/90 truncate block min-w-0 flex-1">
              {channelDesc}
            </span>
          </div>

          {/* Right Side Control Knobs & Channel Buttons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Channel Surf Prev/Next Buttons */}
            {onNextChannel && onPrevChannel && (
              <div className="flex items-center gap-2 px-1">
                <button
                  type="button"
                  onClick={() => handleKnobClick(false)}
                  className="pixel-btn w-8 h-8 flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black border-2 border-white font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5"
                  title="Previous Channel"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => handleKnobClick(true)}
                  className="pixel-btn w-8 h-8 flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black border-2 border-white font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5"
                  title="Next Channel"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Rotatable 3D Dial Knobs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleKnobClick(true)}
                title="Click to turn Volume Knob"
                className="flex flex-col items-center group/knob cursor-pointer"
              >
                <div 
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 via-amber-900 to-amber-950 border-2 border-amber-600 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-200 group-hover/knob:scale-110"
                  style={{ transform: `rotate(${knobRotation}deg)` }}
                >
                  <div className="w-1 h-3 bg-amber-200 rounded-full -translate-y-1" />
                </div>
                <span className="font-mono text-[7px] text-amber-300 font-bold mt-0.5">VOL</span>
              </button>

              <button
                type="button"
                onClick={() => handleKnobClick(true)}
                title="Click to turn Channel Knob"
                className="flex flex-col items-center group/knob cursor-pointer"
              >
                <div 
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 via-amber-900 to-amber-950 border-2 border-amber-600 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-200 group-hover/knob:scale-110"
                  style={{ transform: `rotate(${-knobRotation * 1.5}deg)` }}
                >
                  <div className="w-1 h-3 bg-amber-200 rounded-full -translate-y-1" />
                </div>
                <span className="font-mono text-[7px] text-amber-300 font-bold mt-0.5">CH</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
