import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, X, Download, Maximize2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";

export interface GachaItem {
  id: string;
  name: string;
  rarity: 'SSR' | 'SR' | 'R';
  image: string;
  description?: string;
  category?: 'uma' | 'anime';
}

interface GachaSystemProps {
  items?: GachaItem[];
  title: string;
  onClose?: () => void;
  bgImage?: string;
  themeColor?: string;
  onSummon?: (count: number) => GachaItem[];
  onResults?: (items: GachaItem[]) => void;
  description?: string;
}

export default function GachaSystem({ 
  items = [], 
  title, 
  onClose, 
  bgImage, 
  themeColor = "purple",
  onSummon,
  onResults,
  description
}: GachaSystemProps) {
  const [isSummoning, setIsSummoning] = useState(false);
  const [results, setResults] = useState<GachaItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  type RarityKey = 'SSR' | 'SR' | 'R';

  const rarities: Record<RarityKey, { color: string; bg: string; border: string; chance: number; icon: string; }> = {
    SSR: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', chance: 0.03, icon: '🌟' },
    SR: { color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', chance: 0.18, icon: '✨' },
    R: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', chance: 0.79, icon: '🔷' },
  };

  const getRandomItem = () => {
    const rand = Math.random();
    let rarity: 'SSR' | 'SR' | 'R' = 'R';
    
    if (rand < rarities.SSR.chance) rarity = 'SSR';
    else if (rand < rarities.SSR.chance + rarities.SR.chance) rarity = 'SR';
    
    const pool = items.filter(item => item.rarity === rarity);
    if (pool.length === 0) return items[Math.floor(Math.random() * items.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSummon = (count: number) => {
    playButtonSound();
    setIsSummoning(true);
    setShowResults(false);
    setPullCount(count);
    setSelectedItem(null);
    
    setTimeout(() => {
      let newResults: GachaItem[];
      if (onSummon) {
        newResults = onSummon(count);
      } else {
        newResults = Array.from({ length: count }, () => getRandomItem());
      }
      setResults(newResults);
      setIsSummoning(false);
      setShowResults(true);
      if (onResults) onResults(newResults);
    }, 2000);
  };

  const handleDownload = async (item: GachaItem) => {
    try {
      const response = await fetch(item.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\s+/g, '_')}_${item.rarity}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image", error);
      // Fallback to direct link
      window.open(item.image, '_blank');
    }
  };

  return (
    <div className="relative w-full h-fit min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className={cn("absolute inset-0 opacity-10 pointer-events-none", isSummoning && "animate-pulse")}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        {bgImage && <img src={bgImage} alt="" className="w-full h-full object-cover" />}
      </div>

      <AnimatePresence mode="wait">
        {!showResults && !isSummoning && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center z-10 p-10"
          >
            <h2 className={cn("font-display text-4xl mb-4 text-shadow-pixel uppercase", `text-${themeColor}-400`)}>
              {title}
            </h2>
            
            {description && (
              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto line-clamp-3">
                {description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button
                onClick={() => handleSummon(1)}
                className="pixel-btn px-8 py-4 bg-background border-primary hover:bg-primary/10 flex flex-col items-center gap-1 group"
              >
                <span className="font-display text-lg">SINGLE SUMMON</span>
                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors uppercase">1 DRAW</span>
              </button>
              
              <button
                onClick={() => handleSummon(10)}
                className="pixel-btn px-8 py-4 bg-background border-purple-500 hover:bg-purple-500/10 flex flex-col items-center gap-1 group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg">MULTI SUMMON</span>
                  <span className="bg-purple-500 text-white text-[8px] px-1 animate-bounce">BEST!</span>
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-purple-400 transition-colors uppercase">10 DRAWS (SR+)</span>
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {Object.entries(rarities).map(([rarity, info]) => (
                <div key={rarity} className="flex flex-col items-center">
                  <span className={cn("font-display text-sm", info.color)}>{rarity}</span>
                  <span className="text-[8px] text-muted-foreground">{(info.chance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isSummoning && (
          <motion.div
            key="summoning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center z-20"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={cn("w-32 h-32 border-4 border-dashed rounded-full", `border-${themeColor}-500/50`)}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center text-6xl"
              >
                🔮
              </motion.div>
            </div>
            <p className="mt-8 font-display text-xl animate-pulse tracking-widest uppercase">
              Summoning from the void...
            </p>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center p-4 z-10 overflow-x-hidden"
          >
            <div className="w-full flex flex-wrap items-center justify-center gap-4 py-10 pb-32 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {results.map((item: GachaItem, idx: number) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                  onClick={() => { playButtonSound(); setSelectedItem(item); }}
                  className={cn(
                    "pixel-panel w-28 md:w-36 p-2 flex flex-col items-center relative group min-h-[140px] cursor-pointer hover:-translate-y-2 transition-transform",
                    rarities[item.rarity].bg,
                    rarities[item.rarity].border
                  )}
                >
                  <div className="absolute -top-2 -right-2 z-10 text-lg group-hover:scale-125 transition-transform">
                    {rarities[item.rarity].icon}
                  </div>
                  
                  <div className="w-full aspect-square overflow-hidden mb-2 relative rounded-lg">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className={cn("absolute inset-0 opacity-20", rarities[item.rarity].bg)} />
                  </div>
                  
                  <span className={cn("font-display text-[7px] uppercase text-center mb-1 truncate w-full", rarities[item.rarity].color)}>
                    {item.name}
                  </span>
                  
                  <div className={cn("px-2 py-0.5 rounded-sm font-display text-[6px] tracking-widest", rarities[item.rarity].bg, rarities[item.rarity].color)}>
                    {item.rarity}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="absolute bottom-10 flex gap-4 z-[60]">
              <button
                onClick={() => handleSummon(pullCount)}
                className="pixel-btn px-6 py-2 bg-background flex items-center gap-2 text-sm hover:bg-white/5"
              >
                <RotateCcw size={14} /> SUMMON AGAIN
              </button>
              <button
                onClick={onClose}
                className="pixel-btn px-6 py-2 bg-white/5 border-white/10 flex items-center gap-2 text-sm hover:bg-white/10"
              >
                <X size={14} /> FINISH
              </button>
            </div>
            
            {results.some(item => item.rarity === 'SSR') && (
              <div className="absolute inset-0 pointer-events-none z-40">
                <Sparkles className="absolute top-1/4 left-1/4 text-yellow-400 animate-ping" size={40} />
                <Sparkles className="absolute top-1/3 right-1/4 text-yellow-400 animate-ping" size={30} />
                <Sparkles className="absolute bottom-1/3 left-1/3 text-yellow-400 animate-ping" size={20} />
              </div>
            )}

            {/* Item Preview Modal */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
                  onClick={() => setSelectedItem(null)}
                >
                  <motion.div 
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    className={cn(
                      "pixel-panel max-w-sm w-full p-8 flex flex-col items-center gap-6 relative",
                      rarities[selectedItem.rarity].bg,
                      rarities[selectedItem.rarity].border
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => { setSelectedItem(null); setIsFullscreen(false); }}
                      className="absolute -top-4 -right-4 w-10 h-10 pixel-btn bg-destructive flex items-center justify-center hover:scale-110 transition-transform z-[110]"
                    >
                      <X size={20} className="text-white" />
                    </button>

                    <div className="absolute top-4 left-4 flex gap-2 z-[110]">
                       <button 
                         onClick={() => handleDownload(selectedItem)}
                         className="w-10 h-10 pixel-btn bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform"
                         title="Download Artifact"
                       >
                         <Download size={18} className="text-white" />
                       </button>
                       <button 
                         onClick={() => setIsFullscreen(!isFullscreen)}
                         className="w-10 h-10 pixel-btn bg-purple-600 flex items-center justify-center hover:scale-110 transition-transform"
                         title="Toggle Fullscreen"
                       >
                         <Maximize2 size={18} className="text-white" />
                       </button>
                    </div>

                    <div className="flex flex-col items-center text-center">
                       <span className={cn("font-display text-xs mb-2 tracking-[0.2em]", rarities[selectedItem.rarity].color)}>
                          {rarities[selectedItem.rarity].icon} {selectedItem.rarity} ACQUIRED
                       </span>
                       <h3 className="font-display text-2xl text-white uppercase text-shadow-pixel">{selectedItem.name}</h3>
                    </div>

                    <div 
                      className={cn(
                        "aspect-square rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl relative transition-all duration-500",
                        isFullscreen ? "fixed inset-0 z-[120] w-screen h-screen rounded-none border-0 cursor-zoom-out" : "w-64"
                      )}
                      onClick={() => isFullscreen && setIsFullscreen(false)}
                    >
                       <img 
                         src={selectedItem.image} 
                         alt={selectedItem.name} 
                         className={cn("w-full h-full", isFullscreen ? "object-contain bg-black/95" : "object-cover")}
                       />
                       {!isFullscreen && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
                       
                       {isFullscreen && (
                         <button 
                           onClick={() => setIsFullscreen(false)}
                           className="absolute top-10 right-10 w-16 h-16 pixel-btn bg-black/50 border-white/20 flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-md"
                         >
                           <X size={32} className="text-white" />
                         </button>
                       )}
                    </div>

                    {selectedItem.description && (
                      <p className="text-[10px] text-gray-400 font-sans leading-relaxed text-center px-4">
                        {selectedItem.description}
                      </p>
                    )}

                    <div className="w-full grid grid-cols-2 gap-4 mt-2">
                       <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Type</p>
                          <p className="text-xs font-bold text-white uppercase">{title.split(' ')[0]}</p>
                       </div>
                       <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Rarity</p>
                          <p className={cn("text-xs font-bold uppercase", rarities[selectedItem.rarity].color)}>{selectedItem.rarity}</p>
                       </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
