import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, Sparkles, RefreshCcw, Layers, Info } from "lucide-react";
import GachaSystem, { GachaItem } from "@/components/GachaSystem";
import { SEO } from "@/components/SEO";
import { playButtonSound } from "@/lib/audio";
import { useUmaData } from "@/hooks/use-uma-data";
import { useGachaCollection } from "@/hooks/use-gacha-collection";
import { cn } from "@/lib/utils";

export default function SummonUma() {
  const { characterPool, supportPool, currentBanners, loading, error, isLive } = useUmaData();
  const { addToCollection } = useGachaCollection();
  const [activeTab, setActiveTab] = useState<'character' | 'support'>('character');
  const [sparkPoints, setSparkPoints] = useState<{ character: number; support: number }>({
    character: 0,
    support: 0
  });

  // Load spark points from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('uma_spark_points_v2');
    if (saved) {
      try {
        setSparkPoints(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load spark points", e);
      }
    }
  }, []);

  // Save spark points to localStorage
  useEffect(() => {
    localStorage.setItem('uma_spark_points_v2', JSON.stringify(sparkPoints));
  }, [sparkPoints]);

  const handleSummon = (count: number) => {
    const pool = activeTab === 'character' ? characterPool : supportPool;
    const banner = activeTab === 'character' ? currentBanners.character : currentBanners.support;
    
    if (pool.length === 0) return [];

    const results: GachaItem[] = [];

    for (let i = 0; i < count; i++) {
       let rarity: 'SSR' | 'SR' | 'R';
       const rand = Math.random();

       // 10th pull guarantee (at least SR/2-star)
       if (count === 10 && i === 9) {
         if (rand < 0.03) rarity = 'SSR';
         else rarity = 'SR';
       } else {
         if (rand < 0.03) rarity = 'SSR';
         else if (rand < 0.21) rarity = 'SR'; // 3% + 18%
         else rarity = 'R';
       }

       let selectedItem: GachaItem | null = null;

       if (rarity === 'SSR' && banner && banner.featured.length > 0) {
         // Featured Rate-Up logic (Total SSR is 3%, Featured is 0.75% per model)
         const featuredItems = pool.filter(item => banner.featured.includes(item.id));
         const featuredChancePerItem = 0.0075 / 0.03; 
         
         for (const item of featuredItems) {
            if (Math.random() < featuredChancePerItem) {
              selectedItem = item;
              break;
            }
         }
       }

       if (!selectedItem) {
         const rarityPool = pool.filter(item => item.rarity === rarity);
         selectedItem = rarityPool[Math.floor(Math.random() * rarityPool.length)] || pool[0];
       }

       results.push({ ...selectedItem, id: `${selectedItem.id}-${Date.now()}-${i}`, category: 'uma' });
    }

    setSparkPoints(prev => ({
      ...prev,
      [activeTab]: prev[activeTab] + count
    }));

    return results;
  };

  const currentBanner = activeTab === 'character' ? currentBanners.character : currentBanners.support;

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-white font-pixel pt-20 pb-10 uppercase selection:bg-yellow-500/30">
      <SEO 
        title="Uma Musume Gacha | Summon Gate"
        description="Live gacha simulation for Uma Musume Pretty Derby. Features current banners, support cards, and spark system."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <Link href="/secret-dungeon">
            <button 
              onClick={playButtonSound}
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border-2 border-white/10 rounded-2xl transition-all shadow-lg hover:shadow-white/5"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-display tracking-[0.2em] text-xs">EXIT TO GATE</span>
            </button>
          </Link>
          <div className="text-right border-r-4 border-yellow-500 pr-6">
             <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600 bg-clip-text text-transparent italic tracking-tighter">
               UMA MUSUME
             </h1>
             <p className="text-[10px] text-gray-500 font-display tracking-[0.3em] mt-1 leading-none">PRETTY DERBY - SUMMON GATE</p>
          </div>
        </div>

        {/* Banner Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-8 p-1.5 bg-black/50 border-2 border-white/10 rounded-3xl backdrop-blur-md">
          <button
            onClick={() => { playButtonSound(); setActiveTab('character'); }}
            className={cn(
              "py-5 flex flex-col items-center justify-center gap-2 transition-all rounded-2xl group",
              activeTab === 'character' 
              ? "bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 text-yellow-500 border border-yellow-500/30 shadow-xl shadow-yellow-500/10" 
              : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className={cn("transition-transform group-hover:rotate-12", activeTab === 'character' && "animate-pulse")} />
              <span className="font-display text-base tracking-widest">RECRUIT</span>
            </div>
            <span className="text-[9px] font-bold opacity-60 tracking-widest">TRAINEE ROSTER</span>
          </button>
          
          <button
            onClick={() => { playButtonSound(); setActiveTab('support'); }}
            className={cn(
              "py-5 flex flex-col items-center justify-center gap-2 transition-all rounded-2xl group",
              activeTab === 'support' 
              ? "bg-gradient-to-br from-blue-500/30 to-blue-600/10 text-blue-400 border border-blue-500/30 shadow-xl shadow-blue-500/10" 
              : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <Layers size={20} className={cn("transition-transform group-hover:rotate-12", activeTab === 'support' && "animate-pulse")} />
              <span className="font-display text-base tracking-widest">SUPPORT</span>
            </div>
            <span className="text-[9px] font-bold opacity-60 tracking-widest">CARD ARCHIVE</span>
          </button>
        </div>

        {/* Banner Display Panel - Refactored for Persistency */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full mb-10 rounded-[32px] overflow-hidden border-4 border-white/5 shadow-[0_35px_60_rgba(0,0,0,0.5)] group bg-black/40">
          
          {/* Base Visuals (Bootstrap or Live) */}
          {currentBanner ? (
            <>
              <img 
                src={currentBanner.image} 
                alt={currentBanner.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[30s] ease-linear"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-10">
                 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                   <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-3">
                        {isLive ? (
                          <div className="flex items-center gap-2 bg-yellow-500 text-black text-[9px] px-3 py-1 rounded-full font-black tracking-widest animate-pulse">
                            <RefreshCcw size={10} />
                            <span>LIVE NEURAL LINK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-red-500/80 text-white text-[9px] px-3 py-1 rounded-full font-black tracking-widest">
                            <Info size={10} />
                            <span>BOOTSTRAP MODE</span>
                          </div>
                        )}
                        <span className="text-[10px] text-gray-400 font-display tracking-widest">VER. 2026.03</span>
                     </div>
                     <h2 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter drop-shadow-2xl italic">
                        {currentBanner.name}
                     </h2>
                     <p className="text-[11px] text-gray-400 font-sans max-w-lg leading-relaxed lowercase">
                       Experience enhanced recruitment rates for featured trainers and support cards. 
                       Each summon generates resonance points for the Spark exchange system.
                     </p>
                   </div>
                   
                   <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[24px] min-w-[280px] shadow-2xl relative z-20">
                     <div className="flex justify-between items-center mb-4">
                       <div>
                         <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Spark Limit</p>
                         <p className="text-xs font-bold text-yellow-500 tracking-widest">EXCHANGE AVAILABLE</p>
                       </div>
                       <span className="text-xl font-black text-white">{sparkPoints[activeTab]}<span className="text-[10px] text-gray-500 ml-1">/ 200</span></span>
                     </div>
                     
                     <div className="w-full h-4 bg-black/60 rounded-full border border-white/5 overflow-hidden p-0.5 mb-5 relative">
                       <div 
                         className={cn(
                           "h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(234,179,8,0.4)]",
                           activeTab === 'character' ? "bg-gradient-to-r from-yellow-700 to-yellow-400" : "bg-gradient-to-r from-blue-700 to-blue-400"
                         )}
                         style={{ width: `${Math.min((sparkPoints[activeTab] / 200) * 100, 100)}%` }}
                       />
                       {sparkPoints[activeTab] >= 200 && (
                         <div className="absolute inset-0 animate-ping bg-white/10 rounded-full" />
                       )}
                     </div>
                     
                     <button 
                       disabled={sparkPoints[activeTab] < 200}
                       className={cn(
                         "w-full py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all transform active:scale-95",
                         sparkPoints[activeTab] >= 200 
                         ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_15px_30px_-10px_rgba(234,179,8,0.5)]" 
                         : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                       )}
                     >
                       RECRUIT FEATURED TARGET
                     </button>
                   </div>
                 </div>
              </div>
            </>
          ) : (
             <div className="absolute inset-0 bg-[#0f0a08] flex items-center justify-center">
                <p className="text-[10px] tracking-[0.5em] text-white/20 animate-pulse font-display">INITIALIZING NEURAL LINK...</p>
             </div>
          )}
        </div>

        {/* Gacha System Integrated with Status Overlays */}
        <div className="relative bg-black/40 border-2 border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/5 min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl z-40 p-12 text-center animate-in fade-in duration-500">
              <div className="relative mb-8">
                <RefreshCcw className="animate-spin text-yellow-500 absolute inset-0" size={64} />
                <div className="w-16 h-16 border-4 border-yellow-500/20 rounded-full" />
              </div>
              <p className="text-xl animate-pulse font-display tracking-[0.4em] text-yellow-500 mb-2 uppercase">SYNCHRONIZING</p>
              <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed lowercase">Aligning local data nodes with GameTora live manifest...</p>
            </div>
          )}

          {error && !loading && (
             <div className="absolute inset-x-0 top-0 z-50 p-6">
               <div className="bg-red-500/90 backdrop-blur-xl px-6 py-4 rounded-3xl flex items-center justify-between shadow-2xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <RefreshCcw size={18} className="text-white animate-pulse" />
                    <div className="flex flex-col">
                       <p className="text-[10px] font-black tracking-widest text-white leading-none uppercase">SYNC_INTERRUPTED</p>
                       <p className="text-[8px] text-white/60 font-medium uppercase mt-1 tracking-tighter">ERROR: {error}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playButtonSound(); window.location.reload(); }}
                    className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all"
                  >
                    RETRY
                  </button>
               </div>
             </div>
          )}

          <GachaSystem 
            title={activeTab === 'character' ? "TRAINEE RECRUITMENT" : "SUPPORT CARD SELECTION"}
            onSummon={handleSummon}
            onResults={addToCollection}
            themeColor={activeTab === 'character' ? 'yellow' : 'blue'}
            description={
               activeTab === 'character' 
               ? "Standard Rates: 3-Star (3.0%), 2-Star (18.0%), 1-Star (79.0%). Featured targets have significantly boosted rates (~0.75% per model)."
               : "Standard Rates: SSR (3.0%), SR (18.0%), R (79.0%). 10-DRAWS guarantee at least one SR or above card in the final slot."
            }
          />
        </div>

        <div className="mt-8 flex justify-center">
            <Link href="/secret-dungeon/collection">
               <button className="pixel-btn bg-white/5 border-white/10 px-8 py-3 text-[10px] tracking-[0.2em] hover:bg-white/10 flex items-center gap-3">
                  <Layers size={14} className="text-yellow-500" />
                  VIEW COLLECTION
               </button>
            </Link>
        </div>
        
        {/* Footnotes & Rules */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Sparkles size={14} className="text-yellow-500" />
                </div>
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol Rules</h3>
              </div>
              <ul className="text-[10px] text-gray-500 space-y-2 list-none font-medium">
                <li className="flex gap-2">
                  <span className="text-yellow-500/60 font-black">01</span>
                  <span>SSR Total Resonance chance remains strictly at 3.0% per individual draw.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-500/60 font-black">02</span>
                  <span>Featured targets utilize prioritized weights within the 3% pool (approx. 0.75% ea).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-500/60 font-black">03</span>
                  <span>10-Pull sequence enforces a minimum SR/2☆ threshold for the final manifest slot.</span>
                </li>
              </ul>
           </div>
           
           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <RefreshCcw size={14} className="text-blue-500" />
                </div>
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Neural Link Sync</h3>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium mb-4 capitalize">
                Synchronized with peripheral GameTora data nodes. pools reflect active trainee lineups and new support card releases.
              </p>
              <div className="flex items-center justify-between text-[8px] text-gray-600 font-bold uppercase tracking-widest border-t border-white/5 pt-4">
                 <span>Status:{isLive ? 'Optimized' : 'Bootstrap'}</span>
                 <span>Ref: {new Date().toLocaleTimeString()}</span>
              </div>
           </div>
        </div>
        
        <div className="mt-12 text-center">
           <p className="text-[8px] text-gray-600 font-bold tracking-[0.4em] uppercase">All Assets and Data Provided by GameTora & Cygames Inc.</p>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-yellow-500/[0.03] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/[0.03] blur-[100px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#1a0f0a_80%)] opacity-80" />
      </div>
    </div>
  );
}
