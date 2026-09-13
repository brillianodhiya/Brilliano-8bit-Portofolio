import { useEffect, useState } from "react";
import { Trophy, Medal, Star, RefreshCw } from "lucide-react";
import { fetchLeaderboardScores, getVisitorLevel, ScoreEntry } from "@/lib/leaderboard";
import { useScore } from "@/hooks/use-score";

export function ArcadeLeaderboard() {
  const { score: currentTotalScore } = useScore();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { level, rankTitle, progress } = getVisitorLevel(currentTotalScore);

  const loadScores = async () => {
    setIsLoading(true);
    const gameId = selectedGame === "all" ? undefined : selectedGame;
    const data = await fetchLeaderboardScores(gameId, 10);
    setScores(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadScores();
  }, [selectedGame]);

  return (
    <div className="pixel-panel p-6 bg-card/80 border-amber-500/40 shadow-xl">
      {/* Header & Visitor XP Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-display text-amber-400 flex items-center gap-2 text-shadow-pixel">
            <Trophy className="text-amber-400" size={20} /> GLOBAL ARCADE LEADERBOARD
          </h3>
          <p className="text-xs text-muted-foreground font-body">
            Compete with visitors and claim your place in the Pixel Hall of Fame
          </p>
        </div>

        <div className="pixel-panel p-3 bg-amber-500/10 border-amber-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center font-display text-amber-300 text-sm">
            {level}
          </div>
          <div>
            <div className="font-display text-[9px] text-amber-300 uppercase tracking-wider">
              YOUR RANK: {rankTitle}
            </div>
            <div className="w-32 h-2.5 bg-black/60 border border-amber-500/40 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Game Filters & Refresh */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "tetris", "snake", "bubble", "sudoku", "match3"].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`pixel-btn py-1 px-3 text-[9px] uppercase ${
                selectedGame === g ? "bg-amber-500 text-black font-bold" : "bg-muted text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <button
          onClick={loadScores}
          className="pixel-btn p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs"
          title="Refresh Scores"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {scores.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground font-mono">
            No scores recorded yet. Be the first hero!
          </div>
        ) : (
          scores.map((entry, idx) => {
            const isTop3 = idx < 3;
            const rankColors = ["text-amber-400 border-amber-400/50 bg-amber-500/10", "text-slate-300 border-slate-400/50 bg-slate-500/10", "text-amber-600 border-amber-700/50 bg-amber-900/10"];
            
            return (
              <div
                key={entry.id || idx}
                className={`pixel-panel p-3 flex items-center justify-between transition-transform hover:scale-[1.01] ${
                  isTop3 ? rankColors[idx] : "bg-card/40 border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="font-display text-xs w-6 text-center">
                    {idx === 0 ? <Medal size={16} className="text-amber-400 inline" /> : `#${idx + 1}`}
                  </div>
                  <div>
                    <span className="font-display text-xs tracking-wider uppercase">
                      {entry.player_name}
                    </span>
                    <span className="ml-2 font-mono text-[9px] text-muted-foreground uppercase">
                      [{entry.game_id}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-display text-xs text-amber-300">
                  <Star size={12} className="text-amber-400" />
                  {entry.score.toLocaleString()} PTS
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
