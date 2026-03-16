import { useState, useEffect } from "react";
import { playButtonSound } from "@/lib/audio";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_theme");
    const dark = saved !== "light";
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  function applyTheme(dark: boolean) {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("light");
      root.classList.add("dark-mode");
    } else {
      root.classList.add("light");
      root.classList.remove("dark-mode");
    }
  }

  const toggle = () => {
    playButtonSound();
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("portfolio_theme", next ? "dark" : "light");
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="flex items-center gap-2 px-2 py-1 border-2 border-white/50 bg-card hover:border-white transition-colors"
      style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}
    >
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline text-foreground">
        {isDark ? "NIGHT" : "DAY"}
      </span>
      {/* Toggle track */}
      <div className="relative w-8 h-4 border-2 border-white/60 bg-background">
        <div
          className="absolute top-0 w-3 h-3 bg-yellow-400 transition-all duration-200"
          style={{ left: isDark ? "1px" : "calc(100% - 13px)" }}
        />
      </div>
    </button>
  );
}
