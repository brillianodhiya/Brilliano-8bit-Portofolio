import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { subDays, format, startOfWeek, addDays } from "date-fns";
import { Diamond } from "lucide-react";

// Generate activity grid based on real data
const WEEKS = 52;
const DAYS_PER_WEEK = 7;

export function CommitGraph() {
  const { data: logData } = usePortfolioData('activity_log');
  const [hovered, setHovered] = useState<{ count: number; date: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/20 border-black/40";
    if (count < 3) return "bg-[#0e4429] border-[#1b613b] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.1)]";
    if (count < 6) return "bg-[#006d32] border-[#26a641] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_rgba(255,255,255,0.1)]";
    if (count < 10) return "bg-[#26a641] border-[#39d353] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.2)]";
    return "bg-[#39d353] border-white shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.5),inset_2px_2px_0px_rgba(255,255,255,0.3)] animate-pulse"; 
  };

  const totalActivity = useMemo(() => {
    return logData?.reduce((acc: number, log: any) => acc + log.count, 0) || 0;
  }, [logData]);

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
    <div className="w-full relative group" ref={containerRef}>
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
      
      {/* TOOLTIP OVERLAY (Outside scroll container to prevent clipping) */}
      {hovered && (
        <div 
          className="absolute z-50 pointer-events-none flex flex-col items-center -translate-x-1/2 -translate-y-full mb-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: hovered.x, 
            top: hovered.y - 6,
          }}
        >
          <div className="bg-black text-white text-[10px] px-3 py-1.5 whitespace-nowrap border-2 border-white font-display shadow-[4px_4px_0px_rgba(0,0,0,1)] ring-1 ring-primary/30">
            {hovered.count} XP [{hovered.date}]
          </div>
          <div className="w-2.5 h-2.5 bg-black border-r-2 border-b-2 border-white rotate-45 -mt-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
        </div>
      )}

      <div className="w-full overflow-x-auto py-8 custom-scrollbar scroll-smooth">
        <div className="flex gap-1.5 min-w-max p-2 relative">
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

      <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground font-body text-[10px] mt-4 px-1 gap-4">
        <div className="flex items-center gap-3 bg-black/20 p-2 border-2 border-white/10 pixel-corners">
          <span className="opacity-60 uppercase text-[8px]">Rarity:</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-muted/20 border-2 border-black/40" title="No Activity" />
            <div className="w-3 h-3 bg-[#0e4429] border-2 border-[#1b613b]" title="Common" />
            <div className="w-3 h-3 bg-[#006d32] border-2 border-[#26a641]" title="Uncommon" />
            <div className="w-3 h-3 bg-[#26a641] border-2 border-[#39d353]" title="Rare" />
            <div className="w-3 h-3 bg-[#39d353] border-2 border-white animate-pulse" title="Legendary" />
          </div>
          <span className="opacity-60 uppercase text-[8px]">Intensity</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Diamond size={12} className="fill-primary" />
            <span className="font-display text-[8px]">ELITE RADIANCE</span>
          </div>
          <div className="uppercase tracking-[0.2em] font-display text-[8px] border-b-2 border-primary/30 pb-1">
            {totalActivity} CONTRIBUTIONS COLLECTED
          </div>
        </div>
      </div>
    </div>
  );
}
