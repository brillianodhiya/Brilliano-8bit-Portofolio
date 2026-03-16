import { useState, useCallback, useEffect } from "react";
import { useKonami } from "@/hooks/use-konami";

export function KonamiEffect() {
  const [active, setActive] = useState(false);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);

  const trigger = useCallback(() => {
    setActive(true);
    // Spawn a burst of coins
    const burst = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setCoins(burst);
    setTimeout(() => {
      setActive(false);
      setCoins([]);
    }, 4000);
  }, []);

  useKonami(trigger);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Main message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div
          className="text-center animate-bounce"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          <div
            className="text-yellow-400 text-2xl md:text-4xl mb-4"
            style={{ textShadow: "4px 4px 0 #ff6b00, 8px 8px 0 #ff0000" }}
          >
            CHEAT CODE
          </div>
          <div
            className="text-white text-xl md:text-3xl"
            style={{ textShadow: "4px 4px 0 #00d4ff" }}
          >
            ACTIVATED!
          </div>
          <div className="text-green-400 text-sm mt-6 animate-pulse">
            ↑↑↓↓←→←→BA
          </div>
          <div className="text-yellow-300 text-xs mt-3">
            +9999 EXP ★ ULTRA MODE UNLOCKED
          </div>
        </div>
      </div>

      {/* Pixel coins burst */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute text-yellow-400 text-2xl"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            animation: "coinBurst 2s ease-out forwards",
            fontFamily: "monospace",
          }}
        >
          ★
        </div>
      ))}

      <style>{`
        @keyframes coinBurst {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0.5) rotate(360deg) translateY(-60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
