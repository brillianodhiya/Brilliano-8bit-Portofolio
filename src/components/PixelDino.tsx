import { useState, useEffect, useRef } from "react";
import { useAchievements } from "@/hooks/use-achievements";

const DINO_W = 90;
const DINO_H = 102;
const SPEED = 1.5;
const JUMP_VEL = -13;
const GRAVITY = 0.6;
const GROUND_OFFSET = 4;

const MESSAGES = [
  "RAWRR!",
  "Hire Brilliano!",
  "GG WP!",
  "404 not found",
  "git push!",
  "OP build!",
  "Click me again!",
  "LEVEL UP!",
];

const LEG_CSS = `
  @keyframes legSwingL {
    0%   { transform: rotate(-20deg); }
    50%  { transform: rotate(20deg);  }
    100% { transform: rotate(-20deg); }
  }
  @keyframes legSwingR {
    0%   { transform: rotate(20deg);  }
    50%  { transform: rotate(-20deg); }
    100% { transform: rotate(20deg);  }
  }
  .dleg-l {
    transform-box: fill-box;
    transform-origin: 50% 10%;
    animation: legSwingL 0.25s linear infinite;
  }
  .dleg-r {
    transform-box: fill-box;
    transform-origin: 50% 10%;
    animation: legSwingR 0.25s linear infinite;
  }
  .dino-air .dleg-l,
  .dino-air .dleg-r {
    animation-play-state: paused;
    transform: rotate(0deg);
  }
`;

export function PixelDino() {
  const { unlockAchievement } = useAchievements();
  const [x, setX] = useState(120);
  const [y, setY] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const state = useRef({ x: 120, dir: 1 as 1 | -1, y: 0, vy: 0, jumping: false });

  const handleClick = () => {
    if (!state.current.jumping) {
      state.current.jumping = true;
      state.current.vy = JUMP_VEL;
      setIsJumping(true);
    }
    unlockAchievement("dino_click");
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    if (msg === "RAWRR!") {
      unlockAchievement("dino_rawr");
    }
    setSpeech(msg);
    clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => setSpeech(null), 2200);
  };

  useEffect(() => {
    let id: number;
    const s = state.current;
    const loop = () => {
      const maxX = window.innerWidth - DINO_W - 10;
      s.x += SPEED * s.dir;
      if (s.x >= maxX) { s.x = maxX; s.dir = -1; }
      else if (s.x <= 10) { s.x = 10; s.dir = 1; }
      if (s.jumping) {
        s.vy += GRAVITY;
        s.y += s.vy;
        if (s.y >= 0) { s.y = 0; s.vy = 0; s.jumping = false; setIsJumping(false); }
      }
      setX(s.x);
      setY(s.y);
      setDir(s.dir);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: GROUND_OFFSET + (-y),
        left: x,
        zIndex: 45,
        cursor: "pointer",
        userSelect: "none",
        width: DINO_W,
        height: DINO_H,
        transform: `scaleX(${dir === -1 ? -1 : 1})`,
        transformOrigin: "center center",
      }}
      onClick={handleClick}
      title="Click me!"
    >
      <style>{LEG_CSS}</style>

      {/* Speech bubble */}
      {speech && (
        <div style={{
          position: "absolute",
          bottom: DINO_H + 6,
          left: "50%",
          transform: `translateX(-50%) scaleX(${dir === -1 ? -1 : 1})`,
          whiteSpace: "nowrap",
          background: "#fff",
          color: "#333",
          border: "2px solid #333",
          padding: "4px 8px",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "7px",
          boxShadow: "3px 3px 0 #333",
          pointerEvents: "none",
          zIndex: 50,
        }}>
          {speech}
          <span style={{
            position: "absolute", bottom: -8, left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "8px solid #333",
          }} />
        </div>
      )}

      {/* Inline SVG — legs get CSS animation classes */}
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 144 144"
        width={DINO_W}
        height={DINO_H}
        className={isJumping ? "dino-air" : ""}
        style={{ 
          display: "block", 
          filter: isJumping 
            ? "brightness(1.25) drop-shadow(0 0 4px #00D4FF)" 
            : "drop-shadow(0.5px 0.5px 0px white) drop-shadow(-0.5px -0.5px 0px white)",
          transition: "filter 0.1s" 
        }}
      >
        <g transform={`translate(${dir === -1 ? 0 : 0}, 0)`} stroke="white" strokeWidth="0.5" strokeLinejoin="round">
          {/* Main Body (excluding bottom leg-only parts) */}
          <path 
            d="M80,100L76,100L76,114L72,114L72,120L68,120L68,124L64,124L64,132L60,132L60,132L56,132L56,128L52,128L52,132L48,132L44,132L44,132L40,132L40,128L36,128L36,124L32,124L32,120L28,120L28,116L24,116L24,112L20,112L20,88L24,88L24,96L28,96L28,100L32,100L32,104L40,104L40,100L44,100L44,96L50,96L50,92L56,92L56,88L60,88L60,62L64,62L64,58L96,58L96,62L100,62L100,80L80,80L80,84L92,84L92,88L76,88L76,96L84,96L84,104L80,104L80,100ZM68,64L68,68L72,68L72,64L68,64Z" 
            fill="#00D4FF"
          />
          
          {/* Left Leg (Rear) */}
          <path 
            className="dleg-l"
            d="M40,128L40,144L48,144L48,140L44,140L44,136L48,136L48,132L40,132L40,128Z" 
            fill="#00D4FF"
          />
          
          {/* Right Leg (Front) */}
          <path 
            className="dleg-r"
            d="M60,132L60,144L68,144L68,140L64,140L64,124L60,124L60,132Z" 
            fill="#00D4FF"
          />
        </g>
      </svg>
    </div>
  );
}
