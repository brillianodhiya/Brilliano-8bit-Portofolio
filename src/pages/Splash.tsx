import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAchievements } from "@/hooks/use-achievements";
import { useTypingEffect } from "@/hooks/use-typing-effect";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { unlockAchievement } = useAchievements();
  
  const { displayedText } = useTypingEffect("BRILLIANO DHIYA ULHAQ", 100);

  const handleStart = () => {
    unlockAchievement("first_blood");
    window.dispatchEvent(new CustomEvent('portfolio-start'));
    setLocation("/hub");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative z-10 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <div className="relative inline-block mb-8">
          <motion.h1 
            className="font-display text-4xl md:text-6xl text-primary text-shadow-pixel-primary relative z-10 crt-flicker"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            PORTFOLIO<br/>QUEST
          </motion.h1>
          <div className="absolute top-0 left-0 w-full h-full bg-accent mix-blend-overlay opacity-50 blur-xl" />
        </div>
        
        <div className="h-8 mb-4">
          <p className="font-display text-sm md:text-base text-secondary">{displayedText}<span className="animate-blink">_</span></p>
        </div>
        <p className="font-body text-xl text-muted-foreground tracking-widest uppercase">Frontend Developer Class</p>
      </motion.div>

      <motion.button
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="font-display text-xl text-white animate-pulse"
      >
        - PRESS START -
      </motion.button>
      
      <div className="absolute bottom-8 left-0 right-0 text-center font-body text-muted-foreground text-sm">
        © {new Date().getFullYear()} Kanrishaurus. All rights reserved.
      </div>
    </div>
  );
}
