import { supabase } from "./supabaseClient";

export interface ScoreEntry {
  id: string;
  player_name: string;
  game_id: string;
  score: number;
  created_at: string;
}

const LOCAL_STORAGE_SCORES_KEY = "portfolio_arcade_scores_local";

export async function fetchLeaderboardScores(gameId?: string, limit = 10): Promise<ScoreEntry[]> {
  try {
    if (supabase) {
      let query = supabase
        .from("portfolio_arcade_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(limit);

      if (gameId) {
        query = query.eq("game_id", gameId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ScoreEntry[];
      }
    }
  } catch (err) {
    console.warn("Supabase leaderboard query fallback to local state:", err);
  }

  // Local Storage Fallback
  const stored = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
  let localScores: ScoreEntry[] = stored ? JSON.parse(stored) : [
    { id: "1", player_name: "CYBER_HERO", game_id: "tetris", score: 12500, created_at: new Date().toISOString() },
    { id: "2", player_name: "PIXEL_MASTER", game_id: "snake", score: 8400, created_at: new Date().toISOString() },
    { id: "3", player_name: "RETRO_KING", game_id: "bubble", score: 6200, created_at: new Date().toISOString() },
    { id: "4", player_name: "NOVICE_BOT", game_id: "sudoku", score: 3100, created_at: new Date().toISOString() },
  ];

  if (gameId) {
    localScores = localScores.filter((s) => s.game_id === gameId);
  }

  return localScores.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function saveArcadeScore(gameId: string, score: number, playerName?: string): Promise<boolean> {
  const name = playerName || localStorage.getItem("portfolio_avatar_name") || "ANONYMOUS";
  const newEntry: ScoreEntry = {
    id: Math.random().toString(36).substring(2, 9),
    player_name: name,
    game_id: gameId,
    score: score,
    created_at: new Date().toISOString(),
  };

  // 1. Save to Local Storage
  const stored = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
  const localScores: ScoreEntry[] = stored ? JSON.parse(stored) : [];
  localScores.push(newEntry);
  localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(localScores));

  // 2. Save to Supabase if available
  if (supabase) {
    try {
      await supabase.from("portfolio_arcade_scores").insert([
        {
          player_name: name,
          game_id: gameId,
          score: score,
        },
      ]);
    } catch (e) {
      console.warn("Could not sync score to Supabase:", e);
    }
  }

  return true;
}

export function getVisitorLevel(totalScore: number): { level: number; rankTitle: string; progress: number } {
  const level = Math.floor(Math.sqrt(totalScore / 100)) + 1;
  const progress = Math.min(100, Math.floor(((totalScore % 500) / 500) * 100));

  let rankTitle = "LV 1 NOVICE";
  if (level > 20) rankTitle = "LV 99 PIXEL LEGEND";
  else if (level > 15) rankTitle = "ARCADE MASTER";
  else if (level > 10) rankTitle = "DUNGEON WARRIOR";
  else if (level > 5) rankTitle = "CHIPTUNE ADVENTURER";
  else if (level > 2) rankTitle = "8-BIT ROOKIE";

  return { level, rankTitle, progress };
}
