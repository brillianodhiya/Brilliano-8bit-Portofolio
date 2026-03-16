import { useState, useEffect, useCallback } from "react";
import { useScore } from "@/hooks/use-score";

interface Coin {
  id: number;
  x: number;
  y: number;
  type: "coin" | "star" | "gem";
  collected: boolean;
}

const SYMBOLS = { coin: "🪙", star: "⭐", gem: "💎" };
const SPAWN_INTERVAL = 3000;
const MAX_COINS = 8;

let nextId = 1;

function randomCoin(): Coin {
  const types: Coin["type"][] = ["coin", "star", "gem"];
  return {
    id: nextId++,
    x: 5 + Math.random() * 80,
    y: 10 + Math.random() * 60,
    type: types[Math.floor(Math.random() * types.length)],
    collected: false,
  };
}

const SCORES: Record<Coin["type"], number> = { coin: 10, star: 50, gem: 200 };

export function FloatingCoins() {
  const { score, addScore } = useScore();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [popups, setPopups] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => {
        if (prev.filter(c => !c.collected).length >= MAX_COINS) return prev;
        return [...prev.filter(c => !c.collected), randomCoin()];
      });
    }, SPAWN_INTERVAL);
    // Spawn a few immediately
    setCoins([randomCoin(), randomCoin(), randomCoin()]);
    return () => clearInterval(interval);
  }, []);

  const collect = useCallback((coin: Coin) => {
    const pts = SCORES[coin.type];
    addScore(pts);
    
    // Play collect sound
    const audio = new Audio(`${import.meta.env.BASE_URL}collect-coin.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});

    const popup = { id: Date.now(), x: coin.x, y: coin.y, val: pts };
    setPopups(prev => [...prev, popup]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== popup.id)), 1200);
    setTimeout(() => setCoins(prev => prev.filter(c => c.id !== coin.id)), 400);
  }, [score, addScore]);

  return (
    <>
      {/* Score display */}
      <div
        className="fixed top-24 left-4 z-40 hidden md:flex flex-col items-center gap-1 px-3 py-2 border-2 border-yellow-400/50 bg-background/80"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        <span className="text-yellow-400 text-[7px]">SCORE</span>
        <span className="text-white text-sm tabular-nums">{score.toLocaleString()}</span>
        <span className="text-yellow-400/60 text-[6px]">COLLECT!</span>
      </div>

      {/* Floating coins */}
      {coins.filter(c => !c.collected).map(coin => (
        <div
          key={coin.id}
          className="fixed z-40 cursor-pointer select-none"
          style={{
            left: `${coin.x}vw`,
            top: `${coin.y}vh`,
            fontSize: "24px",
            animation: "floatBob 2s ease-in-out infinite",
            filter: "drop-shadow(0 0 6px rgba(255,215,0,0.8))",
            transition: "transform 0.1s",
          }}
          onClick={() => collect(coin)}
          title={`+${SCORES[coin.type]} pts`}
        >
          {SYMBOLS[coin.type]}
        </div>
      ))}

      {/* Score popups */}
      {popups.map(p => (
        <div
          key={p.id}
          className="fixed z-50 pointer-events-none text-yellow-400 font-bold"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "11px",
            animation: "scoreFloat 1.2s ease-out forwards",
            textShadow: "2px 2px 0 #000",
          }}
        >
          +{p.val}
        </div>
      ))}

      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes scoreFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.3); opacity: 0; }
        }
      `}</style>
    </>
  );
}
