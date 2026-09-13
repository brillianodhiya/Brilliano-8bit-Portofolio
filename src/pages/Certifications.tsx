import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Shield, Zap, Loader2, Sparkles, Eye, ExternalLink, Trophy } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { RetroCertificate3D, AwardItem } from "@/components/3d/RetroCertificate3D";

const ICON_MAP: Record<string, any> = {
  Award, Star, Shield, Zap, Trophy
};

const RARITY_THEMES: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  LEGENDARY: { 
    text: "text-yellow-400", 
    bg: "bg-yellow-400/20", 
    border: "border-yellow-500/50",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]" 
  },
  EPIC: { 
    text: "text-orange-400", 
    bg: "bg-orange-400/20", 
    border: "border-orange-500/50",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
  },
  RARE: { 
    text: "text-cyan-400", 
    bg: "bg-cyan-400/20", 
    border: "border-cyan-500/50",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.3)]" 
  },
};

export default function Certifications() {
  const { data: awardsData, isLoading } = usePortfolioData('awards');

  const [rarityFilter, setRarityFilter] = useState<"ALL" | "LEGENDARY" | "EPIC" | "RARE">("ALL");
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);

  const AWARDS = useMemo(() => {
    return (awardsData || []).map((award: any) => {
      const rarityKey = (award.rarity?.toUpperCase() || 'RARE') as keyof typeof RARITY_THEMES;
      const theme = RARITY_THEMES[rarityKey] || RARITY_THEMES.RARE;
      
      return {
        ...award,
        color: theme.text,
        bg: theme.bg,
        border: theme.border,
        glow: theme.glow,
        icon: (typeof award.icon === 'string' && award.icon.startsWith('http')) 
          ? award.icon 
          : (ICON_MAP[award.icon] || Award)
      };
    });
  }, [awardsData]);

  const counts = useMemo(() => ({
    LEGENDARY: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'LEGENDARY').length,
    EPIC: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'EPIC').length,
    RARE: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'RARE').length,
    TOTAL: AWARDS.length,
  }), [AWARDS]);

  const filteredAwards = useMemo(() => {
    if (rarityFilter === "ALL") return AWARDS;
    return AWARDS.filter((a: any) => a.rarity?.toUpperCase() === rarityFilter);
  }, [AWARDS, rarityFilter]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-accent">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-8"
    >
      <SEO 
        title="Trophy Room & Certifications" 
        description="View professional certifications, credentials, and achievements unlocked by Brilliano Dhiya Ulhaq." 
      />

      {/* HEADER BANNER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-white pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="font-display text-3xl text-accent text-shadow-pixel">TROPHY ROOM</h2>
          </div>
          <p className="font-body text-xl text-muted-foreground">
            Professional credentials & achievements unlocked outside the main quest line.
          </p>
        </div>
        
        {/* RPG Achievement Rarity Badges */}
        <div className="pixel-panel bg-background/80 p-3 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded">
            <Trophy size={14} className="text-yellow-400" />
            <div className="flex flex-col">
              <span className="font-display text-[7px] text-yellow-400">LEGENDARY</span>
              <span className="font-display text-xs text-foreground">{counts.LEGENDARY}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded">
            <Star size={14} className="text-orange-400" />
            <div className="flex flex-col">
              <span className="font-display text-[7px] text-orange-400">EPIC</span>
              <span className="font-display text-xs text-foreground">{counts.EPIC}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded">
            <Award size={14} className="text-cyan-400" />
            <div className="flex flex-col">
              <span className="font-display text-[7px] text-cyan-400">RARE</span>
              <span className="font-display text-xs text-foreground">{counts.RARE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2 border-2 border-white/10 rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              playButtonSound();
              setRarityFilter("ALL");
            }}
            className={`pixel-btn py-1.5 px-3 text-[9px] font-display flex items-center gap-1.5 transition-all ${
              rarityFilter === "ALL" ? "bg-accent text-black font-bold" : "bg-black/60 text-white/80 hover:bg-white/10"
            }`}
          >
            <Sparkles size={12} />
            <span>ALL [{counts.TOTAL}]</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setRarityFilter("LEGENDARY");
            }}
            className={`pixel-btn py-1.5 px-3 text-[9px] font-display flex items-center gap-1.5 transition-all ${
              rarityFilter === "LEGENDARY" ? "bg-yellow-400 text-black font-bold" : "bg-black/60 text-yellow-400/80 hover:bg-yellow-500/20"
            }`}
          >
            <Trophy size={12} />
            <span>LEGENDARY [{counts.LEGENDARY}]</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setRarityFilter("EPIC");
            }}
            className={`pixel-btn py-1.5 px-3 text-[9px] font-display flex items-center gap-1.5 transition-all ${
              rarityFilter === "EPIC" ? "bg-orange-400 text-black font-bold" : "bg-black/60 text-orange-400/80 hover:bg-orange-500/20"
            }`}
          >
            <Star size={12} />
            <span>EPIC [{counts.EPIC}]</span>
          </button>

          <button
            onClick={() => {
              playButtonSound();
              setRarityFilter("RARE");
            }}
            className={`pixel-btn py-1.5 px-3 text-[9px] font-display flex items-center gap-1.5 transition-all ${
              rarityFilter === "RARE" ? "bg-cyan-400 text-black font-bold" : "bg-black/60 text-cyan-400/80 hover:bg-cyan-500/20"
            }`}
          >
            <Award size={12} />
            <span>RARE [{counts.RARE}]</span>
          </button>
        </div>
      </div>

      {/* RPG TROPHY CABINET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAwards.map((award: any, idx: number) => {
            const Icon = award.icon;
            const isUrl = typeof Icon === 'string' && Icon.startsWith('http');

            return (
              <motion.div
                key={award.id || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                onClick={() => {
                  playButtonSound();
                  setSelectedAward(award);
                }}
                className={`pixel-panel p-0 flex overflow-hidden group cursor-pointer border-2 ${award.border} ${award.glow} transition-all`}
              >
                {/* Left Badge Showcase Column */}
                <div className={`w-28 md:w-36 flex items-center justify-center border-r-2 border-white/20 ${award.bg} relative overflow-hidden flex-shrink-0`}>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shine_3s_infinite]" />
                  
                  {/* Standardized Icon Box */}
                  <div className="w-16 h-16 bg-white p-1.5 border-2 border-white shadow-[4px_4px_0_rgba(0,0,0,0.4)] z-10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                    {isUrl ? (
                      <img 
                        src={Icon as string} 
                        alt={award.title} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <Icon size={32} className={`${award.color} drop-shadow-sm`} />
                    )}
                  </div>
                </div>
                
                {/* Right Details Column */}
                <div className="p-4 md:p-6 flex flex-col justify-between flex-grow bg-card/90">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-display text-[9px] ${award.color} tracking-widest font-bold`}>
                        ★ {award.rarity || "RARE"}
                      </span>
                      <span className="font-display text-[9px] text-muted-foreground">
                        {award.date}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-sm leading-snug text-foreground mb-2 group-hover:text-accent transition-colors">
                      {award.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                    <p className="font-body text-lg text-muted-foreground uppercase font-bold truncate max-w-[180px]">
                      @{award.issuer}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playButtonSound();
                          setSelectedAward(award);
                        }}
                        className="pixel-btn py-1 px-2.5 bg-accent/20 hover:bg-accent hover:text-black border border-accent text-accent text-[8px] font-display flex items-center gap-1 group/inspect"
                      >
                        <Eye size={12} />
                        <span>INSPECT 3D</span>
                      </button>

                      {award.certificate_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playButtonSound();
                            window.open(award.certificate_url, "_blank");
                          }}
                          className="pixel-btn py-1 px-2 bg-primary/20 hover:bg-primary/40 border border-primary text-primary text-[8px] flex items-center gap-1"
                          title="Open Credential URL"
                        >
                          <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 3D HOLOGRAPHIC CERTIFICATE SHOWCASE MODAL OVERLAY */}
      <AnimatePresence>
        {selectedAward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
          >
            <RetroCertificate3D
              award={selectedAward}
              onClose={() => setSelectedAward(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
