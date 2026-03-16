import { motion } from "framer-motion";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2 } from "lucide-react";
import { playButtonSound } from "@/lib/audio";

export default function Gallery() {
  const { data: imagesData, isLoading } = usePortfolioData('gallery');

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const IMAGES = (imagesData || []) as any[];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-8"
    >
      <div className="text-center mb-4">
        <h2 className="font-display text-3xl text-primary text-shadow-pixel mb-4">SCREENSHOTS</h2>
        <p className="font-body text-2xl text-muted-foreground">Memories captured during the campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {IMAGES.map((img: any, idx: number) => (
          <motion.div 
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.2 }}
            onClick={playButtonSound}
            className="pixel-panel p-2 md:p-4 bg-background group cursor-pointer"
          >
            <div className="border-4 border-muted overflow-hidden relative aspect-video">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity" />
              {/* gallery scenic tech environment */}
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              {/* Scanlines overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50" />
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
              <span className="font-display text-[10px] text-foreground uppercase">{img.title}</span>
              <span className="font-body text-lg text-muted-foreground">FILE_{img.id}.DAT</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
