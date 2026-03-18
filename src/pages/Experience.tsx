import { motion } from "framer-motion";
import { Briefcase, Calendar, CheckCircle2, Loader2, Sparkles, Terminal } from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string[];
  tech: string[];
  display_order: number;
}

export default function Experience() {
  const { data: experienceData, isLoading } = usePortfolioData('experience');

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-accent">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const QUESTS = (experienceData || []) as Experience[];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12"
    >
      <SEO 
        title="Quest Log | Experience" 
        description="Explore the professional quest log and career journey of Brilliano Dhiya Ulhaq, featuring major campaigns in web development." 
      />
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-5xl text-accent text-shadow-pixel mb-4 uppercase flex items-center justify-center gap-3">
          <Sparkles className="text-yellow-400" /> QUEST LOG <Sparkles className="text-yellow-400" />
        </h2>
        <p className="font-body text-2xl text-muted-foreground">Major campaigns and missions completed in the professional realm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {QUESTS.map((quest, idx) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={playButtonSound}
            className="pixel-panel p-0 flex flex-col h-full overflow-hidden group hover:border-accent transition-colors bg-card/50"
          >
            {/* Header / Rank */}
            <div className="bg-muted/30 border-b-4 border-white p-4 flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-accent">
                <Briefcase size={14} className="flex-shrink-0" />
                <span className="font-display text-[8px] uppercase tracking-wider whitespace-nowrap">RANK: SENIOR</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                <Calendar size={12} className="flex-shrink-0" />
                <span className="font-body text-base italic">{quest.period}</span>
              </div>
            </div>

            {/* Main Quest Content */}
            <div className="flex-grow p-5 flex flex-col gap-4">
              <div>
                <div className="flex items-start justify-between mb-3 gap-3">
                  <h4 className="font-display text-lg text-secondary flex items-start gap-2 leading-tight">
                    <Terminal size={16} className="flex-shrink-0 mt-1" /> 
                    <span className="break-words">@{quest.company}</span>
                  </h4>
                </div>
                
                <h3 className="font-display text-[10px] leading-relaxed text-foreground uppercase mb-4 opacity-90">
                  {quest.position}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="font-display text-[7px] text-muted-foreground uppercase mb-1">Objectives Cleared:</div>
                  {quest.description.slice(0, 4).map((objective, oIdx) => (
                    <div key={oIdx} className="flex gap-2 group/obj">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-1 group-hover/obj:scale-110 transition-transform" />
                      <p className="font-body text-lg text-foreground/80 leading-snug italic line-clamp-2">
                        {objective}
                      </p>
                    </div>
                  ))}
                  {quest.description.length > 4 && (
                    <div className="font-display text-[6px] text-muted-foreground italic pl-6">+ More objectives hidden in logs...</div>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-auto pt-4 border-t-2 border-white/5 flex items-center justify-between gap-4">
                {quest.period.toLowerCase().includes('present') ? (
                  <div className="font-display text-[7px] text-cyan-400 animate-pulse whitespace-nowrap">
                    [ ONGOING_MISSION ]
                  </div>
                ) : (
                  <div className="font-display text-[7px] text-green-500 animate-pulse whitespace-nowrap">
                    [ MISSION_COMPLETED ]
                  </div>
                )}
              </div>
            </div>

            {/* Equipped Tech Footer */}
            {quest.tech && quest.tech.length > 0 && (
              <div className="bg-background/40 p-4 border-t-2 border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  {quest.tech.slice(0, 6).map((item, tIdx) => (
                    <span 
                      key={tIdx}
                      className="font-display text-[6px] bg-secondary/10 border border-secondary/50 text-secondary px-1.5 py-0.5 uppercase"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block pixel-panel border-accent p-4 animate-bounce">
          <p className="font-display text-[10px] text-accent">NEW QUESTS ARE BEING ADDED TO THE BACKLOG...</p>
        </div>
      </div>
    </motion.div>
  );
}
