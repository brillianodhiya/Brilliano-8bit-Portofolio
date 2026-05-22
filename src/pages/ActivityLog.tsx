import { motion } from "framer-motion";
import { CommitGraph } from "@/components/CommitGraph";
import { SEO } from "@/components/SEO";
import { playButtonSound } from "@/lib/audio";
import { ArrowLeft, Diamond, Activity, Calendar } from "lucide-react";
import { useLocation } from "wouter";

export default function ActivityLog() {
  const [, navigate] = useLocation();

  const handleBack = () => {
    playButtonSound();
    navigate("/hub");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-6"
    >
      <SEO 
        title="Activity Log | Brilliano Portfolio"
        description="View the dynamic contributions and activity log of Brilliano Dhiya Ulhaq."
      />

      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="pixel-btn flex items-center gap-2 px-4 py-2 text-xs mb-4"
        >
          <ArrowLeft size={12} />
          <span>RETURN TO HUB</span>
        </button>

        {/* Dedicated Activity Log Panel */}
        <div className="pixel-panel p-6 md:p-8 relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b-2 border-muted">
            <div>
              <h2 className="font-display text-xl text-primary text-shadow-pixel tracking-tighter uppercase flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                CONTRIBUTION RADAR
              </h2>
              <p className="font-body text-lg text-muted-foreground mt-1">
                Real-time tracking of code commits, pull requests, and dynamic quest logs.
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 border-2 border-secondary/20">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="font-display text-[9px] text-secondary">365-DAY GRID</span>
            </div>
          </div>

          {/* Interactive Commit Graph */}
          <div className="my-6">
            <CommitGraph />
          </div>

          {/* Retro Legend / Description */}
          <div className="mt-8 p-4 bg-muted/10 border-2 border-white/5 space-y-3">
            <h4 className="font-display text-[10px] text-accent flex items-center gap-1.5 uppercase italic">
              <Diamond size={10} className="fill-accent text-accent" />
              Developer Activity Log Legend
            </h4>
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              This interactive matrix records daily XP gains. High contribution periods unlock premium status rewards, boosting agility (AGI) and intelligence (INT) stats in real-time. Commits with intensity greater than 10 unlock <strong>ELITE RADIANCE</strong> markers.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
