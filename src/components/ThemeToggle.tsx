import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { isDark, isKanrishaurus, toggleTheme } = useTheme();

  if (isKanrishaurus) return (
    <div className="flex items-center gap-2 px-2 py-1 border-2 border-red-500 bg-black animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>
      <span className="text-red-500">HAZARD</span>
    </div>
  );

  return (
    <button
      onClick={toggleTheme}
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
