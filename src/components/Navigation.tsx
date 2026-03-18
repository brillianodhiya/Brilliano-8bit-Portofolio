import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useProfile, calculateLevel } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";
import { useTheme } from "@/context/ThemeContext";

// Navigation component for the RPG-style portfolio

const NAV_ITEMS = [
  { path: "/hub", label: "STATUS", bossLabel: "DOMINANCE" },
  { path: "/portfolio", label: "INVENTORY", bossLabel: "WAR SPOILS" },
  { path: "/experience", label: "QUEST LOG", bossLabel: "CONQUEST" },
  { path: "/education", label: "LORE", bossLabel: "GENESIS" },
  { path: "/certifications", label: "TROPHIES", bossLabel: "REWARDS" },
  { path: "/gallery", label: "MAP", bossLabel: "TERRITORY" },
  { path: "/skills", label: "SKILLS", bossLabel: "POWERS" },
];

export function Navigation() {
  const { isKanrishaurus } = useTheme();
  const [location] = useLocation();
  const { data: profile } = useProfile();
  
  const birthDate = profile?.birth_date || '2000-08-24';
  const { level, exp } = calculateLevel(birthDate);

  if (location === "/") return null; // Don't show nav on splash screen

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Status Bar */}
      <div className={cn(
        "bg-background border-b-4 h-12 flex items-center px-2 sm:px-4 justify-between pixel-shadow relative transition-colors duration-500",
        isKanrishaurus ? "border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "border-white"
      )}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className={cn("font-display text-[8px] sm:text-[10px] text-shadow-pixel", isKanrishaurus ? "text-red-500" : "text-secondary")}>LVL</span>
            <span className="font-display text-xs sm:text-sm">{isKanrishaurus ? "999+" : level}</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className={cn("font-display text-[10px] text-shadow-pixel", isKanrishaurus ? "text-red-400" : "text-accent")}>EXP</span>
            <div className={cn("w-32 md:w-64 h-4 bg-muted border-2 p-[2px]", isKanrishaurus ? "border-red-500" : "border-white")}>
              <div className={cn("h-full transition-all duration-1000", isKanrishaurus ? "bg-red-600" : "bg-accent")} style={{ width: `${isKanrishaurus ? 100 : exp}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Nav Menu */}
      <nav className="flex justify-center -mt-1 relative z-10">
        <div className={cn("pixel-panel border-t-0 p-1 flex gap-0.5 sm:gap-2 flex-wrap justify-center max-w-[98vw]", isKanrishaurus && "border-red-600")}>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const label = isKanrishaurus ? item.bossLabel : item.label;
            
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  onClick={playButtonSound}
                  className={cn(
                    "font-display text-[7px] sm:text-[10px] px-2 sm:px-4 py-2 uppercase border-2 transition-all active:translate-y-1",
                    isActive 
                      ? (isKanrishaurus ? "bg-red-700 border-white text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)] translate-y-1" : "bg-primary border-white text-primary-foreground shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] translate-y-1")
                      : "bg-card border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
