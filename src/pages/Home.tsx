import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Download, Terminal, Coffee, Code2, Cpu, Loader2 } from "lucide-react";
import { CommitGraph } from "@/components/CommitGraph";
import { useAchievements } from "@/hooks/use-achievements";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { useProfile, usePortfolioData, calculateLevel } from "@/hooks/use-portfolio-data";
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function Home() {
  const { unlockAchievement } = useAchievements();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = usePortfolioData('attributes');
  const [isAlternate, setIsAlternate] = useState(false);
  
  const birthDate = profile?.birth_date || '2000-08-24';
  const { level, exp } = calculateLevel(birthDate);

  // RPG Dialogue Logic
  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [dialogueGlitched, setDialogueGlitched] = useState(false);
  const DIALOGUE_BASE = "🏰 Quest: New Hero Summoned! Brilliano has spawned in your party. Accept mission to build legendary realm?";
  const DIALOGUE_GLITCH = "⚠️ ERROR: Critical failure in escaping. Re-summoning heroes... Destiny is unavoidable.";
  const { displayedText, isComplete } = useTypingEffect(dialogueGlitched ? DIALOGUE_GLITCH : DIALOGUE_BASE, 30);

  useEffect(() => {
    // Just to ensure achievements listener is primed
    unlockAchievement("explorer");
  }, []);

  const handleDownload = () => {
    playButtonSound();
    unlockAchievement("cv_download");
    window.open("https://drive.google.com/file/d/1bXnsBuyn_voV-xzwK4ts-9uA89QFzFF2/view?usp=sharing", "_blank");
  };

  const playSound = (type: 'coin' | 'playful' | 'boss') => {
    const file = type === 'coin' ? '8-bit-coin.mp3' : type === 'playful' ? 'playful.mp3' : 'boss-attack.mp3';
    const audio = new Audio(`${import.meta.env.BASE_URL}${file}`);
    audio.volume = type === 'boss' ? 0.5 : 0.3;
    audio.play().catch(() => {}); // Browser might block auto-play
  };

  const handleNoHover = () => {
    playSound('playful');
    // Move to a random nearby position
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 100;
    setNoPos({ x: randomX, y: randomY });
  };

  const handleNo = () => {
    setDialogueGlitched(true);
    unlockAchievement("reluctant_hero");
    unlockAchievement("destiny_unavoidable");
    // Pulse the screen or something? The red glitch text might be enough or we can add a class
    setTimeout(() => {
      setDialogueGlitched(false);
      setNoPos({ x: 0, y: 0 });
    }, 4000);
  };

  const handleYes = () => {
    playSound('coin');
    setAccepted(true);
    unlockAchievement("legendary_hero");
  };

  // Helper to colorize hardcoded text
  const renderRichText = (fullText: string) => {
    return fullText.split(/(Brilliano|Accept mission|World 1-1)/g).map((part, i) => {
      if (part === "Brilliano") return <span key={i} style={{ color: '#FFD700' }}>{part}</span>;
      if (part === "Accept mission") return <span key={i} style={{ color: '#00FFFF' }}>{part}</span>;
      if (part === "World 1-1") return <span key={i} style={{ color: '#00FF00' }}>{part}</span>;
      return part;
    });
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full flex flex-col lg:flex-row gap-8 transition-colors duration-500", isAlternate && "theme-red")}
    >
      <SEO 
        title="Status | Brilliano Portfolio" 
        description="Check the stats and attributes of Brilliano Dhiya Ulhaq, a Technical Project Lead and Senior Frontend Developer." 
      />
      {/* Left Column: Character Profile */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="pixel-panel p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
          
          <div className="relative mb-6">
            <div 
              onClick={() => {
                const next = !isAlternate;
                setIsAlternate(next);
                if (next) {
                  unlockAchievement("hidden_persona");
                  playSound('boss');
                }
              }}
              className="w-32 h-32 md:w-48 md:h-48 border-4 border-white relative bg-muted animate-float cursor-pointer group hover:border-primary transition-colors overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={isAlternate ? 'alt' : 'normal'}
                  initial={{ filter: 'brightness(2) grayscale(1)', opacity: 0 }}
                  animate={{ filter: 'brightness(1) grayscale(0)', opacity: 1 }}
                  exit={{ filter: 'brightness(2) grayscale(1)', opacity: 0 }}
                  src={isAlternate 
                    ? `${import.meta.env.BASE_URL}me-alternate2.png`
                    : (profile?.avatar_url 
                      ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${import.meta.env.BASE_URL}${profile.avatar_url}`) 
                      : `${import.meta.env.BASE_URL}images/pixel-avatar.png`)} 
                  alt={isAlternate ? "Kanrishaurus" : (profile?.name || 'Brilliano')} 
                  className="w-full h-full object-cover rendering-pixelated"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground border-2 border-white px-2 py-1 font-display text-[10px] z-10">
              LVL.{isAlternate ? "999+" : level}
            </div>
          </div>
          
          <div className="w-full mb-6">
            <div className="flex justify-between font-display text-[8px] mb-1 text-primary">
              <span>EXP</span>
              <span>{exp}%</span>
            </div>
            <div className="w-full h-2 bg-background border-2 border-primary p-[1px]">
              <div className="h-full bg-primary" style={{ width: `${exp}%` }} />
            </div>
          </div>
          
          <h2 className="font-display text-xl text-center mb-2 text-shadow-pixel text-accent uppercase tracking-tighter">
            {isAlternate ? 'KANRISHAURUS' : (profile?.full_name || 'BRILLIANO D.U.')}
          </h2>
          <p className="font-body text-2xl text-muted-foreground mb-6 uppercase tracking-widest border-b-2 border-muted pb-2 w-full text-center">
            Class: {profile?.class_name || 'Web Mage'}
          </p>

          <div className="w-full space-y-4">
            <h3 className="font-display text-xs text-secondary mb-2 uppercase italic tracking-widest">
              {isAlternate ? '- ALTERNATE STATS -' : '- ATTRIBUTES -'}
            </h3>
            {[
              ...(stats || []),
              ...(isAlternate ? [{ name: "Unique Skill", val: 100, color: "bg-primary" }] : [])
            ].map((stat: any) => (
              <div key={stat.name}>
                <div className="flex justify-between font-body text-lg mb-1">
                  <span>{stat.name}</span>
                  <span>{isAlternate ? "99+" : stat.val}</span>
                </div>
                <div className="w-full h-3 bg-background border-2 border-white p-[1px]">
                  <div 
                    className={`h-full ${stat.color} transition-all duration-1000`} 
                    style={{ width: `${isAlternate ? 100 : stat.val}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleDownload}
            className="mt-8 w-full py-4 pixel-btn flex items-center justify-center gap-2 group"
          >
            <Download size={16} className="group-active:translate-y-1" />
            <span>LOOT CV ITEM</span>
          </button>
        </div>

        {/* Quick Tools */}
        <div className="pixel-panel p-4 grid grid-cols-4 gap-2">
          <div 
            onClick={playButtonSound}
            className="flex flex-col items-center gap-1 p-2 bg-background border-2 border-transparent hover:border-white transition-colors cursor-pointer"
          >
            <Terminal size={20} className="text-primary" />
            <span className="font-display text-[8px]">CMD</span>
          </div>
          <div 
            onClick={playButtonSound}
            className="flex flex-col items-center gap-1 p-2 bg-background border-2 border-transparent hover:border-white transition-colors cursor-pointer"
          >
            <Code2 size={20} className="text-secondary" />
            <span className="font-display text-[8px]">CODE</span>
          </div>
          <div 
            onClick={playButtonSound}
            className="flex flex-col items-center gap-1 p-2 bg-background border-2 border-transparent hover:border-white transition-colors cursor-pointer"
          >
            <Cpu size={20} className="text-accent" />
            <span className="font-display text-[8px]">SYS</span>
          </div>
          <div 
            onClick={playButtonSound}
            className="flex flex-col items-center gap-1 p-2 bg-background border-2 border-transparent hover:border-white transition-colors cursor-pointer"
          >
            <Coffee size={20} className="text-destructive" />
            <span className="font-display text-[8px]">FUEL</span>
          </div>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        
        {/* Dialogue Box */}
        <div className="pixel-panel p-6 relative">
          <div className="absolute -top-3 left-6 bg-background px-2 font-display text-[10px] text-secondary">
            DIALOGUE
          </div>
          
          <div className={cn("font-body text-2xl leading-relaxed min-h-[100px] transition-colors duration-300", dialogueGlitched && "text-destructive brightness-125")}>
            {isComplete ? renderRichText(dialogueGlitched ? DIALOGUE_GLITCH : DIALOGUE_BASE) : displayedText}
            <span className="animate-blink">_</span>
          </div>

          {isComplete && !accepted && !dialogueGlitched && (
            <div className="mt-8 flex gap-4">
              <button 
                onClick={handleYes}
                onMouseEnter={() => playSound('coin')}
                className="pixel-btn bg-primary px-8 py-2 text-white hover:bg-primary/80 transition-colors"
                title="Yes, join the party!"
              >
                [YES]
              </button>
              <motion.button 
                animate={{ x: noPos.x, y: noPos.y }}
                onMouseEnter={handleNoHover}
                onClick={handleNo}
                className="pixel-btn bg-destructive px-8 py-2 text-white"
                title="No, maybe later..."
              >
                [NO]
              </motion.button>
            </div>
          )}

          {accepted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 border-2 border-secondary bg-secondary/5"
            >
              <h4 className="font-display text-[12px] text-secondary mb-2">QUEST COMPLETED! REMAINING REWARD:</h4>
              <p className="font-body text-xl">
                Please contact me at: <span className="text-accent underline cursor-pointer">brillidhiya@gmail.com</span>
              </p>
            </motion.div>
          )}

          <div className="mt-6 font-body text-xl text-muted-foreground opacity-60">
            {profile?.bio || "I craft digital experiences with pixel-perfect precision. Specialized in React, modern CSS, and bringing creative concepts to life on the web canvas."}
          </div>
        </div>

        {/* Git Stats Panel */}
        <div className="pixel-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-sm md:text-base text-primary text-shadow-pixel">
              ACTIVITY LOG
            </h3>
            <span className="font-body text-xl text-muted-foreground">Contributions</span>
          </div>
          <CommitGraph />
        </div>

        {/* Mini Map / Location */}
        <div className="pixel-panel p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/2 aspect-video bg-background border-4 border-white relative overflow-hidden flex items-center justify-center group cursor-crosshair">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,212,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="w-4 h-4 bg-destructive rounded-full animate-ping absolute" />
            <span className="font-display text-[10px] text-primary z-10 bg-background/80 px-2 py-1 uppercase">LOCATION: {profile?.location || 'INDONESIA'}</span>
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="font-display text-sm text-accent mb-4">CURRENT REGION</h3>
            <ul className="space-y-2 font-body text-xl">
              <li className="flex items-center gap-2"><span className="text-primary">►</span> Base: Earth</li>
              <li className="flex items-center gap-2"><span className="text-secondary">►</span> Timezone: {profile?.timezone || 'GMT+7'}</li>
              <li className="flex items-center gap-2"><span className="text-destructive">►</span> Weather: {profile?.weather || 'Tropical'}</li>
            </ul>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
