import { motion } from "framer-motion";
import { Award, Star, Shield, Zap, Loader2 } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

const ICON_MAP: Record<string, any> = {
  Award, Star, Shield, Zap
};

const RARITY_THEMES: Record<string, { text: string; bg: string }> = {
  LEGENDARY: { text: "text-yellow-400", bg: "bg-yellow-400/20" },
  EPIC: { text: "text-orange-400", bg: "bg-orange-400/20" },
  RARE: { text: "text-blue-400", bg: "bg-blue-400/20" },
};

export default function Certifications() {
  const { data: awardsData, isLoading } = usePortfolioData('awards');

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-accent">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const AWARDS = (awardsData || []).map((award: any) => {
    const rarityKey = award.rarity?.toUpperCase() || 'RARE';
    const theme = RARITY_THEMES[rarityKey] || RARITY_THEMES.RARE;
    
    return {
      ...award,
      color: theme.text,
      bg: theme.bg,
      icon: (typeof award.icon === 'string' && award.icon.startsWith('http')) 
        ? award.icon 
        : (ICON_MAP[award.icon] || Award)
    };
  });

  const counts = {
    LEGENDARY: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'LEGENDARY').length,
    EPIC: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'EPIC').length,
    RARE: AWARDS.filter((a: any) => a.rarity?.toUpperCase() === 'RARE').length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-8"
    >
      <SEO 
        title="Trophy Room | Certifications" 
        description="View the certifications and professional achievements unlocked by Brilliano Dhiya Ulhaq." 
      />
      <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-white pb-6 mb-4">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="font-display text-3xl text-accent text-shadow-pixel">TROPHY ROOM</h2>
          <p className="font-body text-2xl text-muted-foreground mt-2">Achievements unlocked outside the main quest.</p>
        </div>
        
        <div className="pixel-panel bg-background p-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-yellow-400 mb-1">LEGENDARY</span>
            <span className="font-body text-xl">{counts.LEGENDARY}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-orange-400 mb-1">EPIC</span>
            <span className="font-body text-xl">{counts.EPIC}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-blue-400 mb-1">RARE</span>
            <span className="font-body text-xl">{counts.RARE}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AWARDS.map((award: any, idx: number) => {
          const Icon = award.icon;
          const isUrl = typeof Icon === 'string' && Icon.startsWith('http');

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -4 }}
              onClick={playButtonSound}
              className="pixel-panel p-0 flex overflow-hidden group cursor-pointer"
            >
              <div className={`w-24 md:w-32 flex items-center justify-center border-r-4 border-white ${award.bg} relative overflow-hidden flex-shrink-0`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shine_3s_infinite]" />
                
                {/* Standardized Icon Container */}
                <div className="w-16 h-16 bg-white p-1 border-2 border-white shadow-[2px_2px_0_rgba(0,0,0,0.3)] z-10 flex items-center justify-center overflow-hidden">
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
              
              <div className="p-4 md:p-6 flex flex-col justify-center flex-grow bg-card">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-display text-[10px] ${award.color} text-shadow-pixel`}>
                    {award.rarity}
                  </span>
                  <span className="font-display text-[10px] text-muted-foreground">
                    {award.date}
                  </span>
                </div>
                
                <h3 className="font-display text-sm leading-loose text-foreground mb-2">
                  {award.title}
                </h3>
                
                <div className="flex justify-between items-end mt-auto pt-2">
                  <p className="font-body text-xl text-muted-foreground uppercase">
                    {award.issuer}
                  </p>
                  
                  {award.certificate_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playButtonSound();
                        window.open(award.certificate_url, "_blank");
                      }}
                      className="pixel-btn bg-primary/20 hover:bg-primary/40 border-primary text-primary px-3 py-1 text-[8px] flex items-center gap-1 group/btn"
                    >
                      <span>VIEW CERT</span>
                      <Award size={10} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
}
