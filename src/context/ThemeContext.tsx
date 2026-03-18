import React, { createContext, useContext, useState, useEffect } from "react";
import { playButtonSound } from "@/lib/audio";

interface ThemeContextType {
  isDark: boolean;
  isKanrishaurus: boolean;
  toggleTheme: () => void;
  toggleKanrishaurus: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [isKanrishaurus, setIsKanrishaurus] = useState(false);

  useEffect(() => {
    // Load initial states
    const savedTheme = localStorage.getItem("portfolio_theme");
    const savedKMode = localStorage.getItem("kanrishaurus_mode") === "true";
    
    const initialDark = savedTheme !== "light";
    
    // If Kanrishaurus is persistent, it should force dark
    if (savedKMode) {
      setIsKanrishaurus(true);
      setIsDark(true);
      applyTheme(true, true);
    } else {
      setIsDark(initialDark);
      applyTheme(initialDark, false);
    }
  }, []);

  const applyTheme = (dark: boolean, kanrishaurus: boolean) => {
    const root = document.documentElement;
    
    // Handle Dark/Light
    if (dark || kanrishaurus) {
      root.classList.remove("light");
      root.classList.add("dark-mode");
    } else {
      root.classList.add("light");
      root.classList.remove("dark-mode");
    }

    // Handle Kanrishaurus Theme
    if (kanrishaurus) {
      root.classList.add("theme-red");
    } else {
      root.classList.remove("theme-red");
    }
  };

  const toggleTheme = () => {
    if (isKanrishaurus) return; // Prevent toggling light mode in boss mode
    
    playButtonSound();
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("portfolio_theme", next ? "dark" : "light");
    applyTheme(next, isKanrishaurus);
  };

  const toggleKanrishaurus = () => {
    const next = !isKanrishaurus;
    setIsKanrishaurus(next);
    localStorage.setItem("kanrishaurus_mode", String(next));
    
    // When entering Kanrishaurus, force dark mode
    if (next) {
      setIsDark(true);
      applyTheme(true, true);
    } else {
      // Return to previous theme or default dark
      const savedTheme = localStorage.getItem("portfolio_theme");
      const wasDark = savedTheme !== "light";
      setIsDark(wasDark);
      applyTheme(wasDark, false);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, isKanrishaurus, toggleTheme, toggleKanrishaurus }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
