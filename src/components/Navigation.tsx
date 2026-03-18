import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useProfile, calculateLevel } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";

// Navigation component for the RPG-style portfolio

const NAV_ITEMS = [
  { path: "/hub", label: "STATUS" },
  { path: "/portfolio", label: "INVENTORY" },
  { path: "/experience", label: "QUEST LOG" },
  { path: "/education", label: "LORE" },
  { path: "/certifications", label: "TROPHIES" },
  { path: "/gallery", label: "MAP" },
  { path: "/skills", label: "SKILLS" },
];

export function Navigation() {
  const [location] = useLocation();
  const { data: profile } = useProfile();
  
  const birthDate = profile?.birth_date || '2000-08-24';
  const { level, exp } = calculateLevel(birthDate);

  if (location === "/") return null; // Don't show nav on splash screen

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Status Bar */}
      <div className="bg-background border-b-4 border-white h-12 flex items-center px-2 sm:px-4 justify-between pixel-shadow relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-display text-[8px] sm:text-[10px] text-secondary text-shadow-pixel">LVL</span>
            <span className="font-display text-xs sm:text-sm">{level}</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-display text-[10px] text-accent text-shadow-pixel">EXP</span>
            <div className="w-32 md:w-64 h-4 bg-muted border-2 border-white p-[2px]">
              <div className="h-full bg-accent" style={{ width: `${exp}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Nav Menu */}
      <nav className="flex justify-center -mt-1 relative z-10">
        <div className="pixel-panel border-t-0 p-1 flex gap-0.5 sm:gap-2 flex-wrap justify-center max-w-[98vw]">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  onClick={playButtonSound}
                  className={cn(
                    "font-display text-[7px] sm:text-[10px] px-2 sm:px-4 py-2 uppercase border-2 transition-all active:translate-y-1",
                    isActive 
                      ? "bg-primary border-white text-primary-foreground shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] translate-y-1" 
                      : "bg-card border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
