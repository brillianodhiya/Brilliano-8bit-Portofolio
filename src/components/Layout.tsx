import { ReactNode, useEffect } from "react";
import { Navigation } from "./Navigation";
import { QuestTracker } from "./QuestTracker";
import { AchievementToast } from "./AchievementToast";
import { PixelDino } from "./PixelDino";
import { KonamiEffect } from "./KonamiEffect";
import { FloatingCoins } from "./FloatingCoins";
import { VisitorCounter } from "./VisitorCounter";
import { AvatarWorld } from "./AvatarWorld";
import { AvatarSetup } from "./AvatarSetup";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isSplash = location === "/";

  // Check if we need to auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-[-1] pointer-events-none opacity-20"
           style={{
             backgroundImage: `url(${import.meta.env.BASE_URL}images/pixel-bg.png)`,
             backgroundRepeat: 'repeat',
             backgroundSize: '128px'
           }}
      />
      
      {!isSplash && <Navigation />}
      
      <main className={`relative flex-grow flex flex-col ${!isSplash ? 'pt-44 sm:pt-36 md:pt-28 pb-24 px-4 sm:px-6 md:px-8' : ''}`}>
        <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
          {children}
        </div>
      </main>

      {!isSplash && <QuestTracker />}
      {!isSplash && <FloatingCoins />}
      <AchievementToast />
      <KonamiEffect />

      {/* Pixel Ground Bar + Dino + Visitor Counter */}
      {!isSplash && (
        <>
          <AvatarWorld />
          <PixelDino />
          <AvatarSetup />

          {/* Visitor Counter — bottom right HUD */}
          <div 
            className="hidden md:block"
            style={{
              position: "fixed",
              bottom: 12,
              right: 12,
              zIndex: 46,
            }}
          >
            <VisitorCounter />
          </div>

          {/* Pixel ground line */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "repeating-linear-gradient(90deg, #fff 0px, #fff 8px, transparent 8px, transparent 16px)",
              zIndex: 44,
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
}
