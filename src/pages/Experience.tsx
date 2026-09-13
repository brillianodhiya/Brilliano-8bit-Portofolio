import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Trophy,
  X
} from "lucide-react";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { ReactBitsLanyard3D } from "@/components/3d/ReactBitsLanyard3D";

export interface QuestItem {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string[];
  tech: string[];
  display_order?: number;
  rank?: string;
  rank_boss?: string;
  logo?: string;
}

// Helper for image logo URLs
const getImageUrl = (image?: string) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.BASE_URL}images/${image}`;
};

// Helper to parse dates and calculate duration in months
function calculateExperienceMonths(period: string): number {
  try {
    const parts = period.split("-").map((p) => p.trim());
    if (parts.length < 2) return 12;

    const parseDate = (str: string): Date => {
      if (str.toLowerCase() === "present") return new Date();
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const tokens = str.toLowerCase().split(/\s+/);
      let month = 0;
      let year = new Date().getFullYear();

      for (const t of tokens) {
        const mIdx = monthNames.findIndex((m) => t.includes(m));
        if (mIdx !== -1) month = mIdx;
        const yNum = parseInt(t.replace(/\D/g, ""), 10);
        if (yNum > 1900 && yNum < 2100) year = yNum;
      }
      return new Date(year, month, 1);
    };

    const startDate = parseDate(parts[0]);
    const endDate = parseDate(parts[1]);

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    return Math.max(1, months);
  } catch {
    return 12;
  }
}

export default function Experience() {
  const { isKanrishaurus } = useTheme();
  const { data: experienceData, isLoading } = usePortfolioData("experience");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONGOING" | "COMPLETED">("ALL");
  const [selectedQuest, setSelectedQuest] = useState<QuestItem | null>(null);

  const QUESTS = useMemo(() => {
    return ((experienceData || []) as QuestItem[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [experienceData]);

  // Calculate Total Career EXP & Duration (Option 1: Total Duration in Months)
  const careerStats = useMemo(() => {
    let totalMonths = 0;
    let ongoingCount = 0;
    let completedCount = 0;

    QUESTS.forEach((q) => {
      const months = calculateExperienceMonths(q.period);
      totalMonths += months;
      if (q.period.toLowerCase().includes("present")) {
        ongoingCount++;
      } else {
        completedCount++;
      }
    });

    const totalExpPoints = totalMonths * 100;
    const monthsRemainingInYear = totalMonths % 12;
    const expPercentage = Math.floor((monthsRemainingInYear / 12) * 100);

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    const durationString = years > 0 ? `${years} Years ${remMonths} Months` : `${remMonths} Months`;

    return {
      level: Math.max(1, years),
      expPercentage,
      totalExpPoints,
      totalMonths,
      ongoingCount,
      completedCount,
      durationString,
      totalQuests: QUESTS.length
    };
  }, [QUESTS]);

  // Filtered Quests
  const filteredQuests = useMemo(() => {
    return QUESTS.filter((q) => {
      const matchesSearch =
        q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tech?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.description.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

      const isOngoing = q.period.toLowerCase().includes("present");
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ONGOING" && isOngoing) ||
        (statusFilter === "COMPLETED" && !isOngoing);

      return matchesSearch && matchesStatus;
    });
  }, [QUESTS, searchQuery, statusFilter]);

  // Lock background scroll when Quest Detail Modal is open
  useEffect(() => {
    if (selectedQuest) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedQuest]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedQuest(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-accent">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  // Next & Prev Quest navigation inside modal
  const currentQuestIdx = selectedQuest ? filteredQuests.findIndex((q) => q.id === selectedQuest.id) : -1;
  const handleNextQuest = () => {
    if (currentQuestIdx !== -1 && filteredQuests.length > 1) {
      const nextIdx = (currentQuestIdx + 1) % filteredQuests.length;
      setSelectedQuest(filteredQuests[nextIdx]);
    }
  };
  const handlePrevQuest = () => {
    if (currentQuestIdx !== -1 && filteredQuests.length > 1) {
      const prevIdx = (currentQuestIdx - 1 + filteredQuests.length) % filteredQuests.length;
      setSelectedQuest(filteredQuests[prevIdx]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 px-2 sm:px-4"
    >
      <SEO
        title="Quest Log | Experience"
        description="Explore the professional quest log and career journey of Brilliano Dhiya Ulhaq, featuring major campaigns in web development."
      />

      {/* Page Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-5xl text-accent text-shadow-pixel mb-3 uppercase flex items-center justify-center gap-3">
          <Sparkles className={cn("text-yellow-400", isKanrishaurus && "text-red-600")} />
          {isKanrishaurus ? "CONQUEST LOG" : "QUEST LOG"}
          <Sparkles className={cn("text-yellow-400", isKanrishaurus && "text-red-600")} />
        </h2>
        <p className="font-body text-xl md:text-2xl text-muted-foreground">
          {isKanrishaurus
            ? "Systems dismantled and territories acquired."
            : "Major campaigns and missions completed in the professional realm."}
        </p>
      </div>

      {/* SLEEK 4-COLUMN RPG STATS GRID (Matches Portfolio Page Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Box 1: LVL & Career Duration */}
        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/40 rounded flex items-center justify-center text-yellow-400 font-display text-xs shrink-0">
            <Trophy size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[8px] text-muted-foreground uppercase truncate">
              LVL {careerStats.level} CAREER
            </p>
            <p className="font-display text-xs text-yellow-400 truncate">
              {careerStats.durationString}
            </p>
          </div>
        </div>

        {/* Box 2: Campaigns Cleared */}
        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-400 font-display text-xs shrink-0">
            {careerStats.completedCount}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[8px] text-muted-foreground uppercase truncate">
              CLEARED QUESTS
            </p>
            <p className="font-display text-xs text-emerald-400 truncate">
              MISSION COMPLETED
            </p>
          </div>
        </div>

        {/* Box 3: Active Mission */}
        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center justify-center text-cyan-400 font-display text-xs shrink-0">
            {careerStats.ongoingCount}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[8px] text-muted-foreground uppercase truncate">
              ACTIVE MISSIONS
            </p>
            <p className="font-display text-xs text-cyan-400 truncate">
              ONGOING CAMPAIGN
            </p>
          </div>
        </div>

        {/* Box 4: Total EXP */}
        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 rounded flex items-center justify-center text-purple-400 font-display text-xs shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[8px] text-muted-foreground uppercase truncate">
              TOTAL EXP
            </p>
            <p className="font-display text-xs text-purple-400 truncate">
              {careerStats.totalExpPoints.toLocaleString()} PTS
            </p>
          </div>
        </div>
      </div>

      {/* COMPACT ANIMATED EXP BAR */}
      <div className="pixel-panel p-3 bg-black/40 border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display text-[8px] text-muted-foreground uppercase">
            CAREER EXP PROGRESS:
          </span>
          <span className="font-mono text-xs text-yellow-400 font-bold">
            {careerStats.expPercentage}%
          </span>
        </div>
        <div className="w-full flex-1 bg-black/80 h-3 rounded-full border border-white/20 p-0.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, careerStats.expPercentage)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-300 rounded-full"
          />
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-black/40 p-4 border-2 border-white/10 rounded-xl backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80 group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors"
          />
          <input
            type="text"
            placeholder="SEARCH COMPANY, POSITION, TECH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border-2 border-white/20 focus:border-accent rounded-lg py-2 pl-10 pr-8 font-display text-[10px] text-foreground placeholder:text-muted-foreground outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-display text-[8px] text-muted-foreground uppercase flex items-center gap-1">
            <Filter size={12} /> STATUS:
          </span>
          <div className="flex gap-1.5">
            {(["ALL", "ONGOING", "COMPLETED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  playButtonSound();
                }}
                className={cn(
                  "px-3 py-1 rounded text-[9px] font-display uppercase border transition-all cursor-pointer",
                  statusFilter === status
                    ? "bg-accent text-black border-accent font-bold shadow-md"
                    : "bg-background/80 text-muted-foreground border-white/10 hover:border-white/30"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                playButtonSound();
              }}
              className="text-[8px] font-display text-red-400 hover:underline flex items-center gap-1 ml-2"
              title="Reset Filters"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* QUEST CARDS GRID WITH CLICK HINT */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredQuests.map((quest, idx) => {
              const isOngoing = quest.period.toLowerCase().includes("present");
              return (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedQuest(quest);
                    playButtonSound();
                  }}
                  className="pixel-panel p-0 flex flex-col h-full overflow-hidden group hover:border-accent transition-all duration-300 bg-card/60 cursor-pointer shadow-xl relative hover:-translate-y-1"
                >
                  {/* Card Rank Header */}
                  <div className="bg-muted/40 border-b-4 border-white/20 p-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-accent">
                      <Briefcase size={14} className="flex-shrink-0 text-amber-400" />
                      <span className="font-display text-[9px] uppercase tracking-wider whitespace-nowrap font-bold">
                        RANK: {isKanrishaurus ? quest.rank_boss || "MINION" : quest.rank || "MEMBER"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span className="font-body text-base italic font-semibold text-gray-300">{quest.period}</span>
                    </div>
                  </div>

                  {/* Main Quest Content Preview */}
                  <div className="flex-grow p-5 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getImageUrl(quest.logo) ? (
                          <div className="w-9 h-9 rounded-lg bg-white border border-white/40 p-1 flex items-center justify-center shrink-0 shadow-sm">
                            <img
                              src={getImageUrl(quest.logo)!}
                              alt={quest.company}
                              className="w-full h-full object-contain rendering-pixelated"
                            />
                          </div>
                        ) : (
                          <Terminal size={18} className="flex-shrink-0 text-primary" />
                        )}
                        <h4 className="font-display text-lg text-secondary leading-tight break-words">
                          @{quest.company}
                        </h4>
                      </div>

                      <h3 className="font-display text-[10px] leading-relaxed text-foreground uppercase mb-3 opacity-90 font-bold">
                        {quest.position}
                      </h3>

                      {/* Objectives Cleared (All items displayed) */}
                      <div className="space-y-2 mb-3">
                        <div className="font-display text-[7px] text-muted-foreground uppercase">
                          OBJECTIVES CLEARED:
                        </div>
                        {quest.description.map((objective, oIdx) => (
                          <div key={oIdx} className="flex gap-2 group/obj">
                            <CheckCircle2
                              size={14}
                              className="text-green-500 flex-shrink-0 mt-0.5 group-hover/obj:scale-110 transition-transform"
                            />
                            <p className="font-body text-base text-foreground/80 leading-snug italic">
                              {objective}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Badge & Clickable Hint */}
                    <div className="mt-auto pt-3 border-t-2 border-white/5 flex items-center justify-between gap-4">
                      <div
                        className={cn(
                          "font-display text-[7.5px] animate-pulse whitespace-nowrap px-2 py-0.5 rounded border font-bold uppercase",
                          isOngoing
                            ? isKanrishaurus
                              ? "text-red-500 border-red-500/40 bg-red-950/60"
                              : "text-cyan-400 border-cyan-500/40 bg-cyan-950/60"
                            : isKanrishaurus
                            ? "text-red-700 border-red-800/40 bg-red-950/60"
                            : "text-green-400 border-green-500/40 bg-green-950/60"
                        )}
                      >
                        [ {isOngoing ? (isKanrishaurus ? "CURRENTLY_INVADING" : "ONGOING_MISSION") : (isKanrishaurus ? "TERRITORY_ACQUIRED" : "MISSION_COMPLETED")} ]
                      </div>

                      {/* Hover Visual Click Indicator (Without Inspect Button) */}
                      <div className="flex items-center gap-1 text-accent font-display text-[7.5px] uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
                        <span>CLICK TO OPEN QUEST LOG</span>
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Equipped Tech Footer Preview */}
                  {quest.tech && quest.tech.length > 0 && (
                    <div className="bg-background/50 p-3 border-t-2 border-white/10">
                      <div className="flex flex-wrap gap-1.5">
                        {quest.tech.slice(0, 5).map((item, tIdx) => (
                          <span
                            key={tIdx}
                            className="font-display text-[6.5px] bg-secondary/10 border border-secondary/40 text-secondary px-1.5 py-0.5 uppercase font-bold"
                          >
                            {item}
                          </span>
                        ))}
                        {quest.tech.length > 5 && (
                          <span className="font-display text-[6.5px] text-muted-foreground px-1 py-0.5">
                            +{quest.tech.length - 5} MORE
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="pixel-panel p-8 text-center bg-black/40 border-dashed border-white/20">
          <p className="font-display text-xs text-muted-foreground mb-2">NO QUESTS FOUND MATCHING FILTER</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              playButtonSound();
            }}
            className="pixel-btn py-1.5 px-4 bg-accent text-black font-display text-[9px]"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* RETRO WORK LANYARD BADGE PASS MODAL OVERLAY */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
          >
            <ReactBitsLanyard3D
              quest={selectedQuest}
              onClose={() => setSelectedQuest(null)}
              onNextQuest={handleNextQuest}
              onPrevQuest={handlePrevQuest}
              hasMultiple={filteredQuests.length > 1}
              currentIndex={currentQuestIdx}
              totalQuests={filteredQuests.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
