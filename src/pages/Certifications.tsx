import { motion } from "framer-motion";
import { Award, Star, Shield, Zap, Loader2 } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";

const ICON_MAP: Record<string, any> = {
  Award, Star, Shield, Zap
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

  const AWARDS = (awardsData || []).map((award: any) => ({
    ...award,
    icon: ICON_MAP[award.icon] || Award
  }));
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-white pb-6 mb-4">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="font-display text-3xl text-accent text-shadow-pixel">TROPHY ROOM</h2>
          <p className="font-body text-2xl text-muted-foreground mt-2">Achievements unlocked outside the main quest.</p>
        </div>
        
        <div className="pixel-panel bg-background p-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-yellow-400 mb-1">LEGENDARY</span>
            <span className="font-body text-xl">1</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-orange-400 mb-1">EPIC</span>
            <span className="font-body text-xl">1</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-[8px] text-blue-400 mb-1">RARE</span>
            <span className="font-body text-xl">1</span>
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
              <div className={`w-24 md:w-32 flex items-center justify-center border-r-4 border-white ${award.bg} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shine_3s_infinite]" />
                {isUrl ? (
                  <img src={Icon as string} alt={award.title} className="w-12 h-12 object-contain pixelated" />
                ) : (
                  <Icon size={48} className={award.color} />
                )}
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
                <p className="font-body text-xl text-muted-foreground uppercase">
                  {award.issuer}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
}
