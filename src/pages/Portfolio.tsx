import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ExternalLink, Github, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2 } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { useTheme } from "@/context/ThemeContext";

const PROJECT_COLORS = [
  "border-primary",
  "border-secondary",
  "border-accent",
  "border-destructive",
  "border-blue-400",
  "border-purple-400",
  "border-pink-400"
];

export default function Portfolio() {
  const { isKanrishaurus } = useTheme();
  const { data: projectsData, isLoading } = usePortfolioData('projects');
  
  const PROJECTS = (projectsData || []).map((p: any, idx: number) => ({
    ...p,
    desc: p.description,
    type: p.type || "Quest",
    color: isKanrishaurus ? "border-red-500" : (p.color || PROJECT_COLORS[idx % PROJECT_COLORS.length]),
    images: p.images || ["cartridge-1.png"],
    demoUrl: p.demo_url,
    githubUrl: p.github_url,
    company: p.company || "Independent"
  }));

  const [selected, setSelected] = useState<any | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const nextImage = () => {
    if (!selected) return;
    playButtonSound();
    setCurrentImageIdx((prev) => (prev + 1) % selected.images.length);
  };

  const prevImage = () => {
    if (!selected) return;
    playButtonSound();
    setCurrentImageIdx((prev) => (prev - 1 + selected.images.length) % selected.images.length);
  };

  const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${import.meta.env.BASE_URL}images/${image}`;
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ONGOING':
        return "text-accent border-accent bg-accent/10 animate-pulse";
      case 'MAINTENANCE':
        return "text-secondary border-secondary bg-secondary/10 animate-pulse";
      case 'PAUSED':
        return "text-muted-foreground border-muted-foreground bg-muted/20";
      case 'OUTDATED':
        return "text-destructive border-destructive bg-destructive/10 animate-pulse";
      default: // COMPLETED or others
        return "text-primary border-primary bg-primary/10";
    }
  };

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
      <SEO 
        title="Inventory | Projects" 
        description="Explore the inventory of web applications, systems, and artifacts built by Brilliano Dhiya Ulhaq." 
      />
      <div className="flex justify-between items-end border-b-4 border-white pb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-primary text-shadow-pixel">
            {isKanrishaurus ? "WAR SPOILS" : "INVENTORY"}
          </h2>
          <p className="font-body text-xl text-muted-foreground mt-2">
            {isKanrishaurus ? "Artifacts seized from defeated systems" : "Projects & Artifacts Collected"}
          </p>
        </div>
        <div className="font-display text-sm text-secondary bg-background px-3 py-1 border-2 border-secondary hidden sm:block">
          CAPACITY: {isKanrishaurus ? "INF" : PROJECTS.length}/{isKanrishaurus ? "INF" : "99"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROJECTS.map((proj, idx) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => {
              setSelected(proj);
              setCurrentImageIdx(0);
              playButtonSound();
            }}
            className={`pixel-panel p-4 cursor-pointer hover:-translate-y-2 transition-transform duration-200 group flex flex-col items-center text-center`}
          >
            <div className={`w-32 h-32 bg-background border-4 ${proj.color} mb-4 flex items-center justify-center overflow-hidden relative p-2`}>
               <div className="pixel-img-frame w-full h-full">
                 <img 
                   src={getImageUrl(proj.images[0])} 
                   alt={proj.title}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform rendering-pixelated"
                 />
               </div>
               <div className="absolute bottom-0 w-full bg-black/80 font-display text-[8px] py-1 text-white z-10">
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

      <AnimatePresence>
        {selected && (
          <div 
            className="fixed inset-0 z-[9999] flex items-start justify-center p-2 md:p-4 bg-background/90 backdrop-blur-md cursor-pointer overflow-y-auto pt-20 pb-10"
            onClick={() => {
              setSelected(null);
              playButtonSound();
            }}
          >
            {/* Mobile-Fixed Close Button (Persistent while scrolling) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
                playButtonSound();
              }}
              className="fixed top-6 right-6 w-12 h-12 pixel-btn bg-destructive flex items-center justify-center z-[10000] md:hidden shadow-2xl scale-110 active:scale-95 transition-transform"
            >
              <X size={24} className="text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`pixel-panel max-w-4xl w-full p-0 flex flex-col md:flex-row relative cursor-default ${selected.color} my-4 md:my-8`}
            >
              {/* Desktop-only Close Button */}
              <button 
                onClick={() => {
                  setSelected(null);
                  playButtonSound();
                }}
                className="hidden md:flex absolute -top-4 -right-4 w-10 h-10 pixel-btn bg-destructive items-center justify-center z-50 hover:scale-110 transition-transform"
              >
                <X size={20} className="text-white" />
              </button>

              <div className="w-full md:w-2/5 bg-background p-6 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-white relative group/modal min-h-[300px]">
                 {/* Carousel Controls */}
                 {selected.images.length > 1 && (
                   <>
                     <button 
                       onClick={prevImage}
                       className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 pixel-btn flex items-center justify-center z-20 md:opacity-0 group-hover/modal:opacity-100 transition-opacity bg-primary/80"
                     >
                       <ChevronLeft size={16} />
                     </button>
                     <button 
                       onClick={nextImage}
                       className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pixel-btn flex items-center justify-center z-20 md:opacity-0 group-hover/modal:opacity-100 transition-opacity bg-primary/80"
                     >
                       <ChevronRight size={16} />
                     </button>
                     <div className="absolute top-2 left-2 font-display text-[8px] text-primary bg-background/80 px-2 py-1 border border-primary z-20">
                       {currentImageIdx + 1}/{selected.images.length}
                     </div>
                   </>
                 )}

                 <div 
                   className="relative cursor-zoom-in group/img"
                   onClick={() => {
                     playButtonSound();
                     window.open(getImageUrl(selected.images[currentImageIdx]), "_blank");
                   }}
                 >
                   <AnimatePresence mode="wait">
                     <motion.div
                       key={currentImageIdx}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 1.05 }}
                       className="pixel-img-frame w-full max-h-[250px] md:max-h-[350px] overflow-hidden"
                     >
                       <img 
                         src={getImageUrl(selected.images[currentImageIdx])} 
                         alt={selected.title}
                         className="w-full h-full object-contain rendering-pixelated animate-float"
                       />
                     </motion.div>
                   </AnimatePresence>
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <ExternalLink size={24} className="text-white drop-shadow-md" />
                   </div>
                 </div>

                 <div className={cn(
                   "font-display text-[10px] text-center px-3 py-1 border-2 mt-auto",
                   getStatusStyles(selected.status)
                 )}>
                   STATUS: {selected.status}
                 </div>
              </div>

              <div className="w-full md:w-3/5 p-6 flex flex-col">
                <h2 className="font-display text-xl text-foreground text-shadow-pixel mb-1">{selected.title}</h2>
                <div className="flex gap-2 items-center mb-6">
                  <span className="font-display text-[8px] text-secondary uppercase bg-secondary/10 px-2 py-0.5 border border-secondary/20">
                    {selected.type}
                  </span>
                  <span className="font-display text-[8px] text-accent uppercase bg-accent/10 px-2 py-0.5 border border-accent/20">
                    🏢 {selected.company}
                  </span>
                </div>
                
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

                <div className="flex flex-col gap-4 mt-auto">
                  {(!selected.demoUrl?.trim() && !selected.githubUrl?.trim()) ? (
                    <div className="pixel-panel bg-destructive/10 border-destructive p-4 flex flex-col items-center gap-2">
                       <Shield size={24} className="text-destructive animate-pulse" />
                       <span className="font-display text-[10px] text-destructive">CONFIDENTIAL SOURCE</span>
                       <p className="font-body text-sm text-center text-muted-foreground">
                         This is a private company application. Source code and live demo are restricted due to NDA/Confidentiality.
                       </p>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          playButtonSound();
                          if (selected.demoUrl?.trim()) window.open(selected.demoUrl, "_blank");
                        }}
                        className={cn(
                          "pixel-btn py-3 px-4 flex-1 flex justify-center items-center gap-2",
                          selected.demoUrl?.trim() ? "bg-primary" : "bg-gray-700 opacity-50 cursor-not-allowed"
                        )}
                        disabled={!selected.demoUrl?.trim()}
                      >
                        <ExternalLink size={16} /> LIVE DEMO
                      </button>
                      <button 
                        onClick={() => {
                          playButtonSound();
                          if (selected.githubUrl?.trim()) window.open(selected.githubUrl, "_blank");
                        }}
                        className={cn(
                          "pixel-btn py-3 px-4 flex-1 flex justify-center items-center gap-2",
                          selected.githubUrl?.trim() ? "bg-card" : "bg-gray-700 opacity-50 cursor-not-allowed"
                        )}
                        disabled={!selected.githubUrl?.trim()}
                      >
                        <Github size={16} /> SOURCE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
