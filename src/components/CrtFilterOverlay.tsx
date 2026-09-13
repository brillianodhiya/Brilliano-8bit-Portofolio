import { useEffect, useState, ReactNode } from "react";

interface CrtFilterOverlayProps {
  children: ReactNode;
}

const CRT_STORAGE_KEY = "portfolio_crt_enabled";

export function CrtFilterOverlay({ children }: CrtFilterOverlayProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(CRT_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ enabled?: boolean }>) => {
      setIsEnabled((prev) => {
        const next = e.detail?.enabled !== undefined ? e.detail.enabled : !prev;
        localStorage.setItem(CRT_STORAGE_KEY, String(next));
        return next;
      });
    };

    window.addEventListener("portfolio_toggle_crt" as any, handleToggle);
    return () => {
      window.removeEventListener("portfolio_toggle_crt" as any, handleToggle);
    };
  }, []);

  return (
    <div className={`relative min-h-screen ${isEnabled ? "crt-screen-active" : ""}`}>
      {children}

      {/* CRT Overlay Effects */}
      {isEnabled && (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
          {/* Scanlines Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-75 animate-scanline" />

          {/* CRT Glass Tube Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.65)_100%)] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

          {/* Subtle Color Phosphor Glow */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] mix-blend-screen" />
        </div>
      )}
    </div>
  );
}

export function toggleCrtFilter(enabled?: boolean) {
  window.dispatchEvent(
    new CustomEvent("portfolio_toggle_crt", { detail: { enabled } })
  );
}
