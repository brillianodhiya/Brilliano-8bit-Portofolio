import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Layers, Sparkles, X, Trash2, Search, Download, Maximize2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { useGachaCollection } from "@/hooks/use-gacha-collection";
import { GachaItem } from "@/components/GachaSystem";
import { cn } from "@/lib/utils";

export default function GachaCollection() {
  const [, navigate] = useLocation();
  const { collection, clearCollection } = useGachaCollection();
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'SSR' | 'SR' | 'R'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'UMA' | 'ANIME'>('ALL');
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

  const rarities = {
    SSR: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', icon: '🌟' },
    SR: { color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', icon: '✨' },
    R: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', icon: '🔷' },
  };

  const filteredItems = collection.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = rarityFilter === 'ALL' || item.rarity === rarityFilter;
    const matchesSource = sourceFilter === 'ALL' || 
                         (sourceFilter === 'UMA' && item.category === 'uma') ||
                         (sourceFilter === 'ANIME' && item.category === 'anime');
    return matchesSearch && matchesRarity && matchesSource;
  }).sort((a, b) => {
    // Sort by rarity (SSR > SR > R)
    const order = { SSR: 0, SR: 1, R: 2 };
    return order[a.rarity as keyof typeof order] - order[b.rarity as keyof typeof order];
  });

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
      window.open(item.image, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-pixel pt-20 pb-12 selection:bg-purple-500/30">
      <SEO 
        title="Gacha Collection | Neural Inventory"
        description="View and manage your collected digital souls and horse girls from the Summon Gate."
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
              className="w-12 h-12 pixel-btn bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border-white/10"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
               <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic tracking-tighter">
                 ARTIFACT REPOSITORY
               </h1>
               <p className="text-[10px] text-gray-500 font-display tracking-[0.3em] mt-1 uppercase">GACHA COLLECTION INVENTORY</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl backdrop-blur-xl">
               <Layers size={18} className="text-purple-500" />
               <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest leading-none">Total Artifacts</span>
                  <span className="text-lg font-black">{collection.length}</span>
               </div>
            </div>
            
            <button 
              onClick={() => { if(confirm("Clear entire collection?")) { clearCollection(); playButtonSound(); } }}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl transition-all group"
              title="Clear Collection"
            >
              <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
           <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH ARTIFACT NAME..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/5 focus:border-purple-500/50 rounded-2xl py-4 pl-14 pr-6 text-xs tracking-widest outline-none transition-all placeholder:text-gray-700"
              />
           </div>

            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
              {(['ALL', 'UMA', 'ANIME'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSourceFilter(s); playButtonSound(); }}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                    sourceFilter === s 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "text-gray-500 hover:bg-white/5"
                  )}
                >
                  {s === 'UMA' ? 'UMA MUSUME' : s}
                </button>
              ))}
           </div>

           <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
              {(['ALL', 'SSR', 'SR', 'R'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRarityFilter(r); playButtonSound(); }}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                    rarityFilter === r 
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                    : "text-gray-500 hover:bg-white/5"
                  )}
                >
                  {r}
                </button>
              ))}
           </div>
        </div>

        {/* Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => { playButtonSound(); setSelectedItem(item); }}
                  className={cn(
                    "pixel-panel p-2 flex flex-col items-center relative group cursor-pointer hover:-translate-y-2 transition-transform",
                    rarities[item.rarity as keyof typeof rarities].bg,
                    rarities[item.rarity as keyof typeof rarities].border
                  )}
                >
                   <div className="absolute -top-2 -right-2 z-10 text-xl group-hover:scale-125 transition-transform">
                      {rarities[item.rarity as keyof typeof rarities].icon}
                   </div>

                   {item.category && (
                     <div className="absolute -top-2 -left-2 z-10 bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[6px] font-bold tracking-tighter">
                       {item.category.toUpperCase()}
                     </div>
                   )}
                   
                   <div className="w-full aspect-square overflow-hidden mb-3 relative rounded-xl">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   
                   <span className={cn("font-display text-[8px] uppercase text-center mb-1 truncate w-full px-1", rarities[item.rarity as keyof typeof rarities].color)}>
                      {item.name}
                   </span>
                   
                   <div className={cn("px-2 py-0.5 rounded-sm font-display text-[6px] tracking-widest", rarities[item.rarity as keyof typeof rarities].bg, rarities[item.rarity as keyof typeof rarities].color)}>
                      {item.rarity}
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
             <Layers className="text-gray-800 mb-6 animate-pulse" size={64} />
             <p className="font-display text-sm text-gray-600 tracking-[0.3em] uppercase">NO ARTIFACTS FOUND</p>
             <Link href="/secret-dungeon">
                <button className="mt-8 pixel-btn bg-purple-500/10 border-purple-500/20 px-8 py-3 text-[10px] tracking-widest hover:bg-purple-500/20">
                  RETURN TO SUMMON GATE
                </button>
             </Link>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className={cn(
                "pixel-panel max-w-lg w-full p-10 flex flex-col items-center gap-8 relative",
                rarities[selectedItem.rarity as keyof typeof rarities].bg,
                rarities[selectedItem.rarity as keyof typeof rarities].border
              )}
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => { setSelectedItem(null); setIsFullscreen(false); }}
                  className="absolute -top-4 -right-4 w-12 h-12 pixel-btn bg-destructive flex items-center justify-center hover:scale-110 transition-transform shadow-2xl z-[110]"
                >
                  <X size={24} className="text-white" />
                </button>

                <div className="absolute top-6 left-6 flex gap-3 z-[110]">
                   <button 
                     onClick={() => handleDownload(selectedItem)}
                     className="w-12 h-12 pixel-btn bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                     title="Download Artifact"
                   >
                     <Download size={20} className="text-white" />
                   </button>
                   <button 
                     onClick={() => setIsFullscreen(!isFullscreen)}
                     className="w-12 h-12 pixel-btn bg-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                     title="Toggle Fullscreen"
                   >
                     <Maximize2 size={20} className="text-white" />
                   </button>
                </div>

              <div className="flex flex-col items-center text-center">
                 <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="text-yellow-400 animate-pulse" size={16} />
                    <span className={cn("font-display text-sm tracking-[0.3em] uppercase", rarities[selectedItem.rarity as keyof typeof rarities].color)}>
                       {rarities[selectedItem.rarity as keyof typeof rarities].icon} {selectedItem.rarity} RECORD
                    </span>
                    <Sparkles className="text-yellow-400 animate-pulse" size={16} />
                 </div>
                 <h3 className="font-display text-3xl text-white uppercase text-shadow-pixel leading-none">{selectedItem.name}</h3>
              </div>

              <div 
                className={cn(
                  "aspect-square rounded-[32px] overflow-hidden border-8 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative transition-all duration-500",
                  isFullscreen ? "fixed inset-0 z-[120] w-screen h-screen rounded-none border-0 cursor-zoom-out" : "w-full md:w-80 md:h-80"
                )}
                onClick={() => isFullscreen && setIsFullscreen(false)}
              >
                 <img 
                   src={selectedItem.image} 
                   alt={selectedItem.name} 
                   className={cn("w-full h-full", isFullscreen ? "object-contain bg-black/95" : "object-cover")}
                 />
                 {!isFullscreen && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />}
                 
                 {isFullscreen && (
                   <button 
                     onClick={() => setIsFullscreen(false)}
                     className="absolute top-10 right-10 w-20 h-20 pixel-btn bg-black/50 border-white/20 flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-md"
                   >
                     <X size={40} className="text-white" />
                   </button>
                 )}
              </div>

              {selectedItem.description && (
                <div className="bg-black/40 p-6 rounded-3xl border border-white/5 relative">
                   <p className="text-xs text-gray-400 font-sans leading-relaxed text-center italic">
                     "{selectedItem.description}"
                   </p>
                </div>
              )}

              <div className="w-full grid grid-cols-2 gap-4">
                 <div className="p-4 bg-black/60 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Persistence</p>
                    <p className="text-xs font-black text-white uppercase">EPHEMERAL_SOUL</p>
                 </div>
                 <div className="p-4 bg-black/60 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Rarity</p>
                    <p className={cn("text-xs font-black uppercase", rarities[selectedItem.rarity as keyof typeof rarities].color)}>{selectedItem.rarity}</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-purple-500/[0.05] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-pink-600/[0.05] blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
