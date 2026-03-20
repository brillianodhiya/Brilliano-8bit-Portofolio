import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Copy, Check, Lock, Unlock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

interface ColorSlot {
  hex: string;
  locked: boolean;
}

export default function WorkshopColor() {
  const [, navigate] = useLocation();
  const [palette, setPalette] = useState<ColorSlot[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30) + 70; // High saturation
    const l = Math.floor(Math.random() * 30) + 40; // Medium lightness
    return hslToHex(h, s, l);
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const shufflePalette = () => {
    playButtonSound();
    const newPalette = palette.length === 0 
      ? Array(5).fill(null).map(() => ({ hex: generateColor(), locked: false }))
      : palette.map(slot => slot.locked ? slot : { hex: generateColor(), locked: false });
    setPalette(newPalette);
  };

  useEffect(() => {
    shufflePalette();
  }, []);

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    playButtonSound();
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleLock = (index: number) => {
    playButtonSound();
    setPalette(palette.map((slot, i) => i === index ? { ...slot, locked: !slot.locked } : slot));
  };

  return (
    <div className="min-h-screen bg-[#0a0f12] text-white font-pixel p-4 md:p-10 flex flex-col gap-8">
      <SEO 
        title="Workshop: Color Palette | Secret Dungeon"
        description="Generate professional-grade color schemes for your next neural construct."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-4 border-l-4 border-cyan-500 pl-6">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                COLOR PALETTE
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1">HARMONY GENESIS VER 2.0</p>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-6">
        {/* Main Controls */}
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl">
                 <Zap size={20} className="text-cyan-400 animate-pulse" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white/40 tracking-widest">CURRENT PROTOCOL</p>
                 <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">TRIADIC HARMONY ACTIVE</p>
              </div>
           </div>
           
           <button
             onClick={shufflePalette}
             className="pixel-panel bg-cyan-500 text-black px-8 py-4 flex items-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 group shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/50"
           >
             <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
             <span className="font-display text-[12px] tracking-widest">SHUFFLE DATA</span>
           </button>
        </div>

        {/* Palette Grid */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 h-[60vh] md:h-auto">
          <AnimatePresence mode="popLayout">
            {palette.map((slot, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
              >
                <div 
                  className="flex-grow cursor-pointer relative"
                  style={{ backgroundColor: slot.hex }}
                  onClick={() => copyToClipboard(slot.hex, idx)}
                >
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-4 bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/20">
                         {copiedIndex === idx ? <Check size={24} /> : <Copy size={24} />}
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-black/80 backdrop-blur-3xl flex flex-col items-center gap-4">
                   <div className="flex flex-col items-center">
                      <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest">HEX CODE</p>
                      <p className="text-lg font-black tracking-tighter uppercase">{slot.hex}</p>
                   </div>
                   
                   <button
                     onClick={(e) => { e.stopPropagation(); toggleLock(idx); }}
                     className={cn(
                       "p-4 rounded-2xl border transition-all transform active:scale-90",
                       slot.locked 
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_5px_15px_rgba(6,182,212,0.4)]" 
                        : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
                     )}
                   >
                     {slot.locked ? <Lock size={20} /> : <Unlock size={20} />}
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Hints */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 px-2">
           <div className="text-[8px] text-gray-600 tracking-[0.5em] font-bold uppercase">
             Neural Link Ref: {new Date().toLocaleDateString()} // Harmonic Core V2
           </div>
           <div className="flex gap-6">
              <p className="text-[10px] text-gray-400 font-bold italic tracking-widest leading-none">
                "Click a swatch to extract its digital essence."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
