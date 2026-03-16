import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2 } from "lucide-react";

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

function StarBar({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 border border-white/50"
          style={{ background: i < level ? "#ffd700" : "transparent" }}
        />
      ))}
    </div>
  );
}

export function SkillTree() {
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

  const filtered = activeCategory === "all"
    ? SKILLS
    : SKILLS.filter(s => s.category_id === activeCategory);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl text-accent text-shadow-pixel mb-3">SKILL TREE</h2>
        <p className="font-body text-xl text-muted-foreground">Abilities learned throughout the campaign.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setActiveCategory("all")}
          className={`font-display text-[8px] px-3 py-2 border-2 transition-all ${activeCategory === "all" ? "bg-primary border-white text-primary-foreground" : "bg-card border-muted text-muted-foreground hover:border-white"}`}
        >
          ALL
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`font-display text-[8px] px-3 py-2 border-2 transition-all ${activeCategory === cat.id ? `${cat.color} border-white` : "bg-card border-muted text-muted-foreground hover:border-white"}`}
          >
            {cat.label.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Skill grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((skill, idx) => {
          const cat = CATEGORIES.find(c => c.id === skill.category_id);
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelected(skill)}
              className={`pixel-panel p-3 flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform ${!skill.unlocked ? "opacity-50 grayscale" : ""}`}
              style={{ borderColor: skill.unlocked ? undefined : "#555" }}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                {skill.icon.startsWith('http') ? (
                  <img src={skill.icon} alt={skill.name} className="w-8 h-8 object-contain pixelated" />
                ) : (
                  <span className="text-3xl">{skill.icon}</span>
                )}
              </div>
              <div className="font-display text-[8px] text-center leading-loose">{skill.name}</div>
              <StarBar level={skill.level} />
              {!skill.unlocked && (
                <div className="font-display text-[7px] text-gray-500">LOCKED</div>
              )}
              {cat && (
                <div className={`font-display text-[6px] ${cat.color}`}>
                  {cat.label.split(" ")[0]}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Skill detail modal */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="pixel-panel p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                {selected.icon.startsWith('http') ? (
                  <img src={selected.icon} alt={selected.name} className="w-16 h-16 object-contain pixelated" />
                ) : (
                  <div className="text-5xl text-center">{selected.icon}</div>
                )}
              </div>
              <h3 className="font-display text-base text-center text-accent mb-2">{selected.name}</h3>

              <div className="flex justify-center mb-4">
                <StarBar level={selected.level} />
              </div>

              <div className="font-display text-[8px] text-muted-foreground text-center mb-3 uppercase">
                {CATEGORIES.find(c => c.id === selected.category_id)?.label}
              </div>

              <p className="font-body text-xl text-center text-foreground mb-4">
                {selected.description}
              </p>

              {selected.requires && (
                <div className="font-display text-[7px] text-center text-yellow-400">
                  REQUIRES: {selected.requires.join(", ").toUpperCase()}
                </div>
              )}

              {!selected.unlocked && (
                <div className="mt-3 text-center font-display text-[8px] text-gray-500 border-2 border-gray-600 py-2">
                  🔒 SKILL NOT YET UNLOCKED
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full pixel-btn py-2"
              >
                CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
