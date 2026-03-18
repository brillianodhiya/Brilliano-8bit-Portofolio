import { motion } from "framer-motion";
import { BookOpen, GraduationCap, MapPin, Loader2 } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";

export default function Education() {
  const { data: educationData, isLoading } = usePortfolioData('education');

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-secondary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const TIMELINE = (educationData || []).map((item: any, idx: number) => ({
    ...item,
    icon: idx === 0 ? GraduationCap : BookOpen,
    color: idx === 0 ? "text-secondary" : "text-primary",
    border: idx === 0 ? "border-secondary" : "border-primary"
  }));
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-secondary text-shadow-pixel mb-4">LORE & ORIGIN</h2>
        <p className="font-body text-2xl text-muted-foreground">The chronicles of past training.</p>
      </div>

      <div className="relative pixel-panel px-4 py-8 md:p-8">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-1/2 top-12 bottom-12 w-2 bg-background border-x-2 border-muted md:-translate-x-1" />

        <div className="space-y-12 relative z-10">
          {TIMELINE.map((item: any, idx: number) => {
            const Icon = item.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                onClick={playButtonSound}
                className={`flex flex-col md:flex-row items-center gap-6 cursor-pointer ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`w-full md:w-1/2 pixel-panel p-4 md:p-5 bg-background ${item.border} ml-10 md:ml-0`}>
                  <div className="font-display text-[10px] md:text-xs text-muted-foreground mb-2">{item.year}</div>
                  <h3 className={`font-display text-xs md:text-base mb-2 ${item.color} leading-relaxed md:leading-loose`}>{item.title}</h3>
                  <div className="flex items-center gap-1 font-body text-base md:text-lg text-foreground mb-4 opacity-80">
                    <MapPin size={12} className="md:w-[14px] md:h-[14px]" /> {item.location}
                  </div>
                  <p className="font-body text-lg md:text-xl leading-snug text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Node */}
                <div className="absolute left-4 md:relative md:left-auto w-10 h-10 md:w-12 md:h-12 bg-background border-4 border-white flex items-center justify-center flex-shrink-0 z-20 md:mx-auto -translate-x-1/2 md:translate-x-0 mt-4 md:mt-0">
                  <Icon size={18} className={`${item.color} md:w-5 md:h-5`} />
                </div>
                
                {/* Empty space for alternating layout */}
                <div className="hidden md:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
        
        {/* End marker */}
        <div className="absolute bottom-4 left-6 md:left-1/2 w-4 h-4 bg-white md:-translate-x-2 -translate-x-1/2 rotate-45" />
      </div>
    </motion.div>
  );
}
