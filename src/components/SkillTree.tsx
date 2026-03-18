import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2, Sparkles, X, Lock, Swords } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category_id: string;
  description: string;
  unlocked: boolean;
  requires?: string[];
  icon: string;
}

interface Category {
  id: string;
  label: string;
  color: string;
  border: string;
}

function StarBar({ level, max = 5, isBoss = false, size = "sm" }: { level: number; max?: number; isBoss?: boolean; size?: "sm" | "lg" }) {
  const px = size === "lg" ? "w-3 h-3" : "w-2 h-2";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            px, "border transition-colors",
            isBoss
              ? (i < level ? "bg-red-600 border-red-400 shadow-[0_0_4px_#ff0000]" : "bg-transparent border-red-900")
              : (i < level ? "bg-[#ffd700] border-[#daa520]" : "bg-transparent border-white/30")
          )}
        />
      ))}
    </div>
  );
}

function SkillIcon({ icon, name, className }: { icon: string; name: string; className?: string }) {
  if (icon.startsWith('http')) {
    return (
      <div className={cn("pixel-icon overflow-hidden", className)}>
        <img src={icon} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  if (icon.startsWith('<svg')) {
    return (
      <div
        className={cn("pixel-icon flex items-center justify-center [&>svg]:w-full [&>svg]:h-full", className)}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  }
  return <span className={cn("select-none", className)}>{icon}</span>;
}

export function SkillTree() {
  const { isKanrishaurus } = useTheme();
  const [selected, setSelected] = useState<Skill | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: skillsData, isLoading: skillsLoading } = usePortfolioData('skills');
  const { data: categoriesData, isLoading: categoriesLoading } = usePortfolioData('skill_categories');

  if (skillsLoading || categoriesLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const SKILLS = (skillsData || []) as Skill[];
  const CATEGORIES = (categoriesData || []) as Category[];

  // "future" category = LOCKED SKILLS: filter by unlocked status, not category
  const filtered = (activeCategory === "all"
    ? SKILLS
    : activeCategory === "future"
      ? SKILLS.filter(s => !s.unlocked)
      : SKILLS.filter(s => s.category_id === activeCategory && s.unlocked)
  ).sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

  const unlockedCount = SKILLS.filter(s => s.unlocked).length;
  const totalCount = SKILLS.length;
  const lockedCount = SKILLS.filter(s => !s.unlocked).length;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Page Header — matching Portfolio/Experience style */}
      <div className={cn(
        "flex justify-between items-end border-b-4 pb-4",
        isKanrishaurus ? "border-red-600" : "border-white"
      )}>
        <div>
          <h2 className={cn(
            "font-display text-2xl md:text-3xl text-shadow-pixel flex items-center gap-2",
            isKanrishaurus ? "text-red-500" : "text-accent"
          )}>
            {isKanrishaurus ? <Swords size={24} /> : <Sparkles size={24} className="text-yellow-400" />}
            {isKanrishaurus ? "FORBIDDEN ABILITIES" : "SKILL TREE"}
          </h2>
          <p className="font-body text-xl text-muted-foreground mt-2">
            {isKanrishaurus
              ? "Forbidden knowledge acquired from the dark realm."
              : "Abilities learned throughout the campaign."}
          </p>
        </div>
        <div className={cn(
          "font-display text-sm bg-background px-3 py-1 border-2 hidden sm:block",
          isKanrishaurus ? "text-red-400 border-red-600" : "text-secondary border-secondary"
        )}>
          UNLOCKED: {isKanrishaurus ? "∞" : unlockedCount}/{isKanrishaurus ? "∞" : totalCount}
        </div>
      </div>

      {/* Category filter tabs — styled like pixel buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => { setActiveCategory("all"); playButtonSound(); }}
          className={cn(
            "font-display text-[8px] px-4 py-2 border-2 transition-all uppercase active:translate-y-1",
            activeCategory === "all"
              ? "bg-primary border-white text-primary-foreground shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]"
              : "bg-card border-muted text-muted-foreground hover:border-white hover:text-foreground"
          )}
        >
          ALL ({SKILLS.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = cat.id === "future"
            ? lockedCount
            : SKILLS.filter(s => s.category_id === cat.id && s.unlocked).length;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); playButtonSound(); }}
              className={cn(
                "font-display text-[8px] px-4 py-2 border-2 transition-all uppercase active:translate-y-1",
                activeCategory === cat.id
                  ? `${cat.border} border-white ${cat.color} shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]`
                  : "bg-card border-muted text-muted-foreground hover:border-white hover:text-foreground"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Skill grid — pixel-panel cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {filtered.map((skill, idx) => {
          const cat = CATEGORIES.find(c => c.id === skill.category_id);
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => { setSelected(skill); playButtonSound(); }}
              className={cn(
                "pixel-panel p-0 cursor-pointer group hover:-translate-y-1 transition-transform duration-200 flex flex-col overflow-hidden",
                !skill.unlocked && "opacity-40 grayscale",
                isKanrishaurus ? "hover:border-red-500" : "hover:border-accent"
              )}
            >
              {/* Icon area */}
              <div className="w-full aspect-square bg-background/30 flex items-center justify-center overflow-hidden relative p-2">
                <SkillIcon
                  icon={skill.icon}
                  name={skill.name}
                  className="w-full h-full text-3xl"
                />

                {/* Locked overlay */}
                {!skill.unlocked && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-1">
                    <Lock size={16} className="text-gray-500" />
                    <span className="font-display text-[7px] text-gray-500">LOCKED</span>
                  </div>
                )}

                {/* Level badge on corner */}
                {skill.unlocked && (
                  <div className={cn(
                    "absolute top-1 right-1 font-display text-[7px] px-1 border",
                    isKanrishaurus
                      ? "bg-red-900/80 border-red-600 text-red-300"
                      : "bg-background/80 border-white/30 text-accent"
                  )}>
                    {skill.level}/5
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className={cn(
                "p-2 border-t-4 flex flex-col items-center gap-1 bg-card/80",
                isKanrishaurus ? "border-red-800" : "border-white"
              )}>
                <div className="font-display text-[7px] sm:text-[8px] text-center leading-tight truncate w-full">
                  {skill.name}
                </div>
                <StarBar level={skill.level} isBoss={isKanrishaurus} />
                {cat && (
                  <div className={cn("font-display text-[5px] sm:text-[6px] uppercase tracking-wider", isKanrishaurus ? "text-red-500" : cat.color)}>
                    {cat.label.split(" ")[0]}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Skill detail modal */}
      <AnimatePresence>
        {selected && (() => {
          const cat = CATEGORIES.find(c => c.id === selected.category_id);
          return (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={cn(
                  "pixel-panel p-0 max-w-md w-full relative overflow-hidden flex flex-col",
                  isKanrishaurus ? "border-red-600" : ""
                )}
                onClick={e => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => { setSelected(null); playButtonSound(); }}
                  className="absolute top-2 right-2 w-8 h-8 pixel-btn bg-destructive flex items-center justify-center z-50 hover:scale-110 transition-transform"
                >
                  <X size={14} className="text-white" />
                </button>

                {/* Modal header with icon */}
                <div className={cn(
                  "bg-background/50 p-6 flex flex-col items-center gap-3 border-b-4",
                  isKanrishaurus ? "border-red-700" : "border-white"
                )}>
                  <div className={cn(
                    "w-20 h-20 pixel-panel p-2 flex items-center justify-center overflow-hidden",
                    isKanrishaurus ? "border-red-600" : ""
                  )}>
                    <SkillIcon
                      icon={selected.icon}
                      name={selected.name}
                      className="w-full h-full text-4xl"
                    />
                  </div>
                  <h3 className={cn(
                    "font-display text-base text-shadow-pixel text-center",
                    isKanrishaurus ? "text-red-400" : "text-accent"
                  )}>
                    {selected.name}
                  </h3>
                  <StarBar level={selected.level} isBoss={isKanrishaurus} size="lg" />
                </div>

                {/* Modal body */}
                <div className="p-5 flex flex-col gap-4">
                  {/* Category tag */}
                  {cat && (
                    <div className="flex justify-center">
                      <span className={cn(
                        "font-display text-[8px] uppercase px-3 py-1 border-2",
                        isKanrishaurus
                          ? "text-red-400 border-red-600 bg-red-900/20"
                          : `${cat.color} ${cat.border} bg-card`
                      )}>
                        {cat.label}
                      </span>
                    </div>
                  )}

                  <p className="font-body text-xl text-center text-foreground leading-relaxed">
                    {selected.description}
                  </p>

                  {/* Proficiency gauge */}
                  <div className="pixel-panel p-3 bg-background/30">
                    <div className="font-display text-[7px] text-muted-foreground mb-2 uppercase">Proficiency</div>
                    <div className="w-full h-4 bg-background border-2 border-white p-[2px]">
                      <div
                        className={cn("h-full transition-all duration-1000", isKanrishaurus ? "bg-red-600" : "bg-accent")}
                        style={{ width: `${(selected.level / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-display text-[6px] text-muted-foreground">NOVICE</span>
                      <span className={cn("font-display text-[7px]", isKanrishaurus ? "text-red-400" : "text-accent")}>
                        {selected.level}/5
                      </span>
                      <span className="font-display text-[6px] text-muted-foreground">MASTER</span>
                    </div>
                  </div>

                  {selected.requires && (
                    <div className="font-display text-[7px] text-center text-yellow-400 border border-yellow-600 bg-yellow-900/10 p-2">
                      ⚠ REQUIRES: {selected.requires.join(", ").toUpperCase()}
                    </div>
                  )}

                  {!selected.unlocked && (
                    <div className="flex items-center justify-center gap-2 font-display text-[8px] text-gray-500 border-2 border-gray-600 py-2 bg-gray-900/20">
                      <Lock size={12} /> SKILL NOT YET UNLOCKED
                    </div>
                  )}

                  <button
                    onClick={() => { setSelected(null); playButtonSound(); }}
                    className="w-full pixel-btn py-3 mt-2"
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
