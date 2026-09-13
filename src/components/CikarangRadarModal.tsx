import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Radio, Zap, X, Globe, Clock, ShieldCheck, Thermometer } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { useAchievements } from "@/hooks/use-achievements";

interface CikarangRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CikarangRadarModal({ isOpen, onClose }: CikarangRadarModalProps) {
  const { unlockAchievement } = useAchievements();
  const [time, setTime] = useState<string>("");
  const [teleporting, setTeleporting] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format to WIB (Asia/Jakarta - UTC+7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat("en-GB", options).format(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTeleport = () => {
    playButtonSound();
    setTeleporting(true);
    unlockAchievement("cikarang_explorer");
    setTimeout(() => {
      setTeleporting(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg pixel-panel p-5 bg-stone-950 border-4 border-accent shadow-[0_0_50px_rgba(0,255,200,0.3)] text-white overflow-hidden flex flex-col gap-4"
          >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="text-emerald-400 animate-pulse" size={18} />
                <span className="font-display text-xs text-emerald-400 uppercase tracking-widest text-shadow-pixel">
                  RADAR BEACON // CIKARANG_ID
                </span>
              </div>
              <button
                type="button"
                onClick={() => { playButtonSound(); onClose(); }}
                className="pixel-btn px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                <X size={14} />
              </button>
            </div>

            {/* Retro 8-Bit Radar Visual Screen */}
            <div className="relative w-full h-52 bg-slate-950 rounded-xl border-4 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Concentric Radar Grid Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-48 h-48 rounded-full border border-emerald-500/40" />
                <div className="absolute w-36 h-36 rounded-full border border-emerald-500/40" />
                <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40" />
                <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40" />
                <div className="absolute w-full h-[1px] bg-emerald-500/30" />
                <div className="absolute h-full w-[1px] bg-emerald-500/30" />
              </div>

              {/* Radar Sweeping Sector Light Line */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(16,185,129,0.35)_360deg)] animate-[spin_4s_linear_infinite]" />
              </div>

              {/* Central Pulsing Cikarang Location Pin Marker */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping" />
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.9)]">
                    <MapPin size={20} className="text-emerald-400" />
                  </div>
                </div>
                <div className="mt-1 bg-black/90 px-2.5 py-0.5 rounded border border-emerald-400 shadow-md">
                  <span className="font-display text-[9px] text-emerald-300 tracking-wider uppercase">
                    CIKARANG HQ
                  </span>
                </div>
              </div>

              {/* Scanline Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70" />
              
              {/* Corner Coordinate HUD */}
              <div className="absolute top-2 left-2 font-mono text-[8px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30">
                LAT: 6.2847° S // LON: 107.1706° E
              </div>
              <div className="absolute bottom-2 right-2 font-mono text-[8px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PING: 12ms [ONLINE]
              </div>
            </div>

            {/* Location Specs & Info Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="pixel-panel p-2.5 bg-card/60 flex items-center gap-2 border-emerald-500/30">
                <Globe size={16} className="text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-muted-foreground uppercase">REGION</span>
                  <span className="font-bold text-white text-[10px] truncate">Cikarang, Indonesia</span>
                </div>
              </div>

              <div className="pixel-panel p-2.5 bg-card/60 flex items-center gap-2 border-emerald-500/30">
                <Clock size={16} className="text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-muted-foreground uppercase">LOCAL TIME (WIB)</span>
                  <span className="font-bold text-cyan-300 text-[10px] font-mono">{time} WIB</span>
                </div>
              </div>

              <div className="pixel-panel p-2.5 bg-card/60 flex items-center gap-2 border-emerald-500/30">
                <ShieldCheck size={16} className="text-yellow-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-muted-foreground uppercase">ZONE TITLE</span>
                  <span className="font-bold text-yellow-300 text-[9px] truncate">Cyber-Industrial Forge</span>
                </div>
              </div>

              <div className="pixel-panel p-2.5 bg-card/60 flex items-center gap-2 border-emerald-500/30">
                <Thermometer size={16} className="text-orange-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-muted-foreground uppercase">CLIMATE</span>
                  <span className="font-bold text-orange-300 text-[10px]">☀️ 32°C Tropical</span>
                </div>
              </div>
            </div>

            {/* Teleport Signal Action Button */}
            <button
              type="button"
              onClick={handleTeleport}
              disabled={teleporting}
              className="pixel-btn py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 font-display text-[10px] uppercase tracking-wider transition-all shadow-lg active:translate-y-0.5"
            >
              <Zap size={14} className={teleporting ? "animate-spin text-yellow-300" : "text-yellow-300"} />
              <span>{teleporting ? "TRANSMITTING SIGNAL..." : "SEND TELEPORT SIGNAL"}</span>
            </button>

            {teleporting && (
              <div className="text-center font-display text-[8px] text-emerald-400 animate-pulse">
                ⚡ SIGNAL ESTABLISHED WITH CIKARANG TECH NODE! ACHIEVEMENT UNLOCKED! 🏆
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
