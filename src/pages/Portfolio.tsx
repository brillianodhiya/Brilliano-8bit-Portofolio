import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ExternalLink, Github } from "lucide-react";

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2 } from "lucide-react";

export default function Portfolio() {
  const { data: projectsData, isLoading } = usePortfolioData('projects');
  
  const PROJECTS = (projectsData || []).map((p: any) => ({
    ...p,
    desc: p.description,
    type: p.type || "Quest",
    color: p.color || "border-primary",
    image: p.image || "cartridge-1.png"
  }));

  const [selected, setSelected] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-primary">
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
      <div className="flex justify-between items-end border-b-4 border-white pb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-primary text-shadow-pixel">INVENTORY</h2>
          <p className="font-body text-xl text-muted-foreground mt-2">Projects & Artifacts Collected</p>
        </div>
        <div className="font-display text-sm text-secondary bg-background px-3 py-1 border-2 border-secondary hidden sm:block">
          CAPACITY: {PROJECTS.length}/99
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROJECTS.map((proj, idx) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelected(proj)}
            className={`pixel-panel p-4 cursor-pointer hover:-translate-y-2 transition-transform duration-200 group flex flex-col items-center text-center`}
          >
            <div className={`w-32 h-32 bg-background border-4 ${proj.color} mb-4 flex items-center justify-center overflow-hidden relative`}>
               <img 
                 src={`${import.meta.env.BASE_URL}images/${proj.image}`} 
                 alt={proj.title}
                 className="w-24 h-24 object-contain group-hover:scale-110 transition-transform rendering-pixelated"
               />
               <div className="absolute bottom-0 w-full bg-black/80 font-display text-[8px] py-1 text-white">
                 PRESS A
               </div>
            </div>
            
            <h3 className="font-display text-xs text-foreground mb-2 h-8 flex items-center justify-center">
              {proj.title}
            </h3>
            
            <span className="font-body text-lg text-muted-foreground bg-background px-2 w-full border border-muted">
              {proj.type}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`pixel-panel max-w-2xl w-full p-0 flex flex-col md:flex-row relative ${selected.color}`}
            >
              <button 
                onClick={() => setSelected(null)}
                className="absolute -top-4 -right-4 w-10 h-10 pixel-btn bg-destructive flex items-center justify-center z-10"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-2/5 bg-background p-6 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-white">
                 <img 
                   src={`${import.meta.env.BASE_URL}images/${selected.image}`} 
                   alt={selected.title}
                   className="w-32 h-32 md:w-48 md:h-48 object-contain rendering-pixelated mb-4 animate-float"
                 />
                 <div className="font-display text-[10px] text-center text-primary px-3 py-1 border-2 border-primary bg-primary/10">
                   STATUS: {selected.status}
                 </div>
              </div>

              <div className="w-full md:w-3/5 p-6 flex flex-col">
                <h2 className="font-display text-xl text-foreground text-shadow-pixel mb-2">{selected.title}</h2>
                <p className="font-display text-xs text-secondary mb-6">{selected.type}</p>
                
                <p className="font-body text-2xl leading-tight mb-6 flex-grow">
                  {selected.desc}
                </p>

                <div className="mb-6">
                  <h4 className="font-display text-[10px] text-muted-foreground mb-2">EQUIPPED GEAR:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.tech.map((t: string) => (
                      <span key={t} className="font-body text-lg px-2 bg-background border border-white text-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button className="pixel-btn bg-primary py-3 px-4 flex-1 flex justify-center items-center gap-2">
                    <ExternalLink size={16} /> LIVE DEMO
                  </button>
                  <button className="pixel-btn bg-card py-3 px-4 flex-1 flex justify-center items-center gap-2">
                    <Github size={16} /> SOURCE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
