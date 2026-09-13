import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { subDays, format, startOfWeek, addDays } from "date-fns";
import { Diamond, Flame, Zap, Trophy, Box, LayoutGrid } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ActivitySkyline3D } from "@/components/3d/ActivitySkyline3D";
import { playButtonSound } from "@/lib/audio";

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

export function CommitGraph() {
  const { isKanrishaurus } = useTheme();
  const { data: logData } = usePortfolioData('activity_log');
  const [hovered, setHovered] = useState<{ count: number; date: string; x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Grid Data Matrix Memo
  const data = useMemo(() => {
    const activityMap: Record<string, number> = {};
    logData?.forEach((log: any) => {
      activityMap[log.date] = log.count;
    });

    const grid = [];
    const today = new Date();
    const startDate = startOfWeek(subDays(today, 364));

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const currentDate = addDays(startDate, w * 7 + d);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        week.push({
          count: activityMap[dateStr] || 0,
          date: dateStr
        });
      }
      grid.push(week);
    }
    return grid;
  }, [logData]);

  // 2. RPG Streak & Stats Memo
  const { currentStreak, longestStreak, totalXP } = useMemo(() => {
    if (!logData || logData.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalXP: 0 };
    }

    const activityMap: Record<string, number> = {};
    let total = 0;
    logData.forEach((log: any) => {
      activityMap[log.date] = log.count;
      total += log.count;
    });

    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      const count = activityMap[d] || 0;

      if (count > 0) {
        tempStreak++;
        if (i === current) current++;
        if (tempStreak > longest) longest = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak: current, longestStreak: longest, totalXP: total };
  }, [logData]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/20 border-black/40";
    
    if (isKanrishaurus) {
      if (count < 3) return "bg-[#4a0000] border-[#660000] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.05)]";
      if (count < 6) return "bg-[#800000] border-[#990000] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.05)]";
      if (count < 10) return "bg-[#b30000] border-[#cc0000] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.1)]";
      return "bg-[#ff0000] border-white shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.2)] animate-pulse";
    }

    if (count < 3) return "bg-[#0e4429] border-[#1b613b] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.1)]";
    if (count < 6) return "bg-[#006d32] border-[#26a641] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.1)]";
    if (count < 10) return "bg-[#26a641] border-[#39d353] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.2)]";
    return "bg-[#39d353] border-white shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.3)] animate-pulse"; 
  };

  const handleDayHover = (e: React.MouseEvent<HTMLDivElement>, item: { count: number; date: string }) => {
    if (!containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    
    setHovered({
      ...item,
      x: targetRect.left - parentRect.left + (targetRect.width / 2),
      y: targetRect.top - parentRect.top
    });
  };

  return (
    <div className="w-full flex flex-col gap-2 relative group" ref={containerRef}>
      {/* Sleek Compact Header Bar: Streaks & View Switcher */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-2 mb-1 border-b border-white/10">
        {/* Compact RPG Streaks & XP Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[8px]">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-950/40 border border-orange-500/40 rounded text-orange-300">
            <Flame size={10} className="text-orange-400 animate-pulse" />
            <span>STREAK: <strong className="text-white font-bold">{currentStreak}D</strong></span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-950/40 border border-amber-500/40 rounded text-amber-300">
            <Zap size={10} className="text-amber-400" />
            <span>MAX: <strong className="text-white font-bold">{longestStreak}D</strong></span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300">
            <Trophy size={10} className="text-emerald-400" />
            <span>TOTAL: <strong className="text-white font-bold">{totalXP} XP</strong></span>
          </div>
        </div>

        {/* Compact 2D vs 3D View Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/15">
          <button
            type="button"
            onClick={() => { playButtonSound(); setViewMode('2d'); }}
            className={cn(
              "px-2 py-0.5 font-mono text-[8px] font-bold rounded flex items-center gap-1 transition-all",
              viewMode === '2d'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <LayoutGrid size={10} /> 2D
          </button>

          <button
            type="button"
            onClick={() => { playButtonSound(); setViewMode('3d'); }}
            className={cn(
              "px-2 py-0.5 font-mono text-[8px] font-bold rounded flex items-center gap-1 transition-all",
              viewMode === '3d'
                ? "bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <Box size={10} /> 3D SKYLINE
          </button>
        </div>
      </div>

      {/* Main Graph Content: 2D Grid or 3D Voxel Skyline View */}
      {viewMode === '3d' ? (
        <ActivitySkyline3D gridData={data} className="w-full h-72 my-1" />
      ) : (
        <div className="w-full relative">
          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
          
          {/* TOOLTIP OVERLAY */}
          {hovered && (
            <div 
              className="absolute z-50 pointer-events-none flex flex-col items-center -translate-x-1/2 -translate-y-full mb-1 animate-in fade-in zoom-in-95 duration-100"
              style={{ 
                left: hovered.x, 
                top: hovered.y - 6,
              }}
            >
              <div className="bg-black text-white text-[10px] px-3 py-1.5 whitespace-nowrap border-2 border-white font-display shadow-[4px_4px_0px_rgba(0,0,0,1)] ring-1 ring-primary/30">
                {hovered.count} {isKanrishaurus ? "SOULS" : "XP"} [{hovered.date}]
              </div>
              <div className="w-2.5 h-2.5 bg-black border-r-2 border-b-2 border-white rotate-45 -mt-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
            </div>
          )}

          <div className="w-full overflow-x-auto py-3 custom-scrollbar scroll-smooth">
            <div className="flex gap-1.5 min-w-max p-1 relative">
              {data.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((item, dIdx) => (
                    <div 
                      key={`${wIdx}-${dIdx}`} 
                      className="relative"
                      onMouseEnter={(e) => handleDayHover(e, item)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div
                        className={cn(
                          "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 border-2 rounded-[2px] transition-all duration-300 relative cursor-help",
                          getColor(item.count)
                        )}
                      >
                        {item.count >= 10 && (
                          <div className="absolute inset-0 flex items-center justify-center animate-bounce pointer-events-none">
                            <Diamond size={8} className="text-primary fill-primary animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats & Legend Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground font-body text-[10px] mt-1 px-1 gap-2">
        <div className="flex items-center gap-2 bg-black/20 px-2 py-1 border border-white/10 rounded">
          <span className="opacity-100 uppercase text-[8px]">{isKanrishaurus ? "Corruption:" : "Rarity:"}</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 bg-muted/20 border border-black/40" title="No Activity" />
            <div className={cn("w-2.5 h-2.5 border", isKanrishaurus ? "bg-[#4a0000] border-[#660000]" : "bg-[#0e4429] border-[#1b613b]")} />
            <div className={cn("w-2.5 h-2.5 border", isKanrishaurus ? "bg-[#800000] border-[#990000]" : "bg-[#006d32] border-[#26a641]")} />
            <div className={cn("w-2.5 h-2.5 border", isKanrishaurus ? "bg-[#b30000] border-[#cc0000]" : "bg-[#26a641] border-[#39d353]")} />
            <div className={cn("w-2.5 h-2.5 border animate-pulse", isKanrishaurus ? "bg-[#ff0000] border-white" : "bg-[#39d353] border-white")} />
          </div>
          <span className="opacity-100 uppercase text-[8px]">{isKanrishaurus ? "Malevolence" : "Intensity"}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary animate-pulse">
            <Diamond size={10} className="fill-primary" />
            <span className="font-display text-[7px]">ELITE RADIANCE</span>
          </div>
          <div className="uppercase tracking-[0.15em] font-display text-[7px] border-b border-primary/30 pb-0.5">
            {totalXP} {isKanrishaurus ? "SOULS REAPED" : "CONTRIBUTIONS COLLECTED"}
          </div>
        </div>
      </div>
    </div>
  );
}
