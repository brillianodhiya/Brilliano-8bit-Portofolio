import { useState, useRef } from "react";

interface ArcadeCartridge3DProps {
  title: string;
  color?: string;
  icon?: string;
  desc?: string;
  logoImg?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ArcadeCartridge3D({
  title,
  color = "#ff0055",
  icon = "🎮",
  desc = "Classic Retro Game",
  logoImg,
  isSelected = false,
  onClick,
  className = "w-full h-48",
}: ArcadeCartridge3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("rotateX(10deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 18;
    const rotateY = ((x - centerX) / centerX) * 18;

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform("rotateX(10deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative cursor-pointer select-none [perspective:1000px] ${className}`}
    >
      <div
        className="w-full h-full relative transition-transform duration-200 ease-out [transform-style:preserve-3d] flex flex-col items-center justify-between p-3 rounded-xl border-2 border-white/20 bg-slate-900 shadow-2xl overflow-hidden"
        style={{
          transform,
          boxShadow: isHovered
            ? `0 20px 30px -10px ${color}66, inset 0 0 15px ${color}33`
            : "0 10px 20px -5px rgba(0,0,0,0.8)",
        }}
      >
        {/* Top Cartridge Grooves / Ridges */}
        <div className="w-full flex justify-between items-center gap-1.5 opacity-60">
          <div className="h-1.5 flex-1 bg-black/80 rounded-sm border-b border-white/10" />
          <div className="h-1.5 flex-1 bg-black/80 rounded-sm border-b border-white/10" />
          <div className="h-1.5 flex-1 bg-black/80 rounded-sm border-b border-white/10" />
          <div className="h-1.5 flex-1 bg-black/80 rounded-sm border-b border-white/10" />
        </div>

        {/* Center Game Label Sticker (Retro Cartridge Art) */}
        <div
          className="w-full flex-1 my-2 rounded-lg p-2.5 flex flex-col justify-between items-center relative overflow-hidden border border-white/30"
          style={{
            background: `linear-gradient(135deg, ${color}dd 0%, ${color}44 100%), #11111a`,
          }}
        >
          {/* Subtle Scanlines on Sticker */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />

          {/* Top Arcade Tag */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="font-display text-[7px] text-white/80 uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded border border-white/20">
              8-BIT ARCADE
            </span>
            <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: color }} />
          </div>

          {/* Center Graphic Logo / Icon & Title */}
          <div className="flex flex-col items-center justify-center my-auto z-10 w-full px-1">
            {logoImg ? (
              <img 
                src={logoImg} 
                alt={title} 
                className="h-12 w-auto object-contain rendering-pixelated filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform" 
              />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <div className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-white/30 shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  <h4 className="font-display text-[10px] text-white text-center tracking-wider uppercase truncate max-w-[130px] text-shadow-pixel">
                    {title}
                  </h4>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="font-mono text-[8px] text-white/70 text-center truncate max-w-full z-10">
            {desc}
          </p>
        </div>

        {/* Bottom Golden Connector Pins */}
        <div className="w-11/12 h-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-sm border border-black/40 flex items-center justify-evenly px-1 shadow-inner">
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
          <div className="w-1 h-full bg-black/40" />
        </div>
      </div>
    </div>
  );
}
