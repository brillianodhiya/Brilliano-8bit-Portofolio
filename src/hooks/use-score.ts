import { useState, useEffect, useCallback } from "react";
import { unlockAchievement } from "./use-achievements";

const SCORE_KEY = "coin_score";

// Global state outside the hook
let globalScore = typeof window !== "undefined" 
  ? parseInt(localStorage.getItem(SCORE_KEY) || "0", 10) 
  : 0;

const listeners = new Set<(s: number) => void>();

export function useScore() {
  const [score, setScore] = useState(globalScore);

  useEffect(() => {
    // Initial check for milestone
    if (globalScore >= 10000) {
      unlockAchievement("high_scorer");
    }

    const l = (s: number) => setScore(s);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const addScore = useCallback((pts: number) => {
    globalScore += pts;
    localStorage.setItem(SCORE_KEY, String(globalScore));
    listeners.forEach(l => l(globalScore));
    
    // Milestone achievement
    if (globalScore >= 10000) {
      unlockAchievement("high_scorer");
    }
  }, []);

  return { score, addScore };
}
