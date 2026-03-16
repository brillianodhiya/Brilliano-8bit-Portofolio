import { useState, useEffect, useRef } from "react";

const DINO_W = 72;
const DINO_H = 82;
const SPEED = 1.5;
const JUMP_VEL = -13;
const GRAVITY = 0.6;
const GROUND_OFFSET = DINO_H + 8;

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
    0%   { transform: rotate(-16deg); }
    50%  { transform: rotate(16deg);  }
    100% { transform: rotate(-16deg); }
  }
  @keyframes legSwingR {
    0%   { transform: rotate(16deg);  }
    50%  { transform: rotate(-16deg); }
    100% { transform: rotate(16deg);  }
  }
  .dleg-l {
    transform-box: fill-box;
    transform-origin: 50% 0%;
    animation: legSwingL 0.36s linear infinite;
  }
  .dleg-r {
    transform-box: fill-box;
    transform-origin: 50% 0%;
    animation: legSwingR 0.36s linear infinite;
  }
  .dino-air .dleg-l,
  .dino-air .dleg-r {
    animation-play-state: paused;
    transform: rotate(0deg);
  }
`;

export function PixelDino() {
  const [x, setX] = useState(120);
  const [y, setY] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimer = useRef<ReturnType<typeof setTimeout>>();
  const state = useRef({ x: 120, dir: 1 as 1 | -1, y: 0, vy: 0, jumping: false });

  const handleClick = () => {
    if (!state.current.jumping) {
      state.current.jumping = true;
      state.current.vy = JUMP_VEL;
      setIsJumping(true);
    }
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
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
        viewBox="0 0 1670 1920"
        width={DINO_W}
        height={DINO_H}
        className={isJumping ? "dino-air" : ""}
        style={{ display: "block", filter: isJumping ? "brightness(1.25) drop-shadow(0 0 5px #00D4FF)" : "none", transition: "filter 0.1s" }}
      >
        {/* Body */}
        <path d="M0 0 C180.84 0 361.68 0 548 0 C548 30.03 548 60.06 548 91 C578.36 91 608.72 91 640 91 C640 211.78 640 332.56 640 457 C549.25 457 458.5 457 365 457 C365 487.03 365 517.06 365 548 C425.39 548 485.78 548 548 548 C548 578.03 548 608.06 548 639 C457.91 639 367.82 639 275 639 C275 699.06 275 759.12 275 821 C335.06 821 395.12 821 457 821 C457 881.39 457 941.78 457 1004 C426.64 1004 396.28 1004 365 1004 C365 973.97 365 943.94 365 913 C334.97 913 304.94 913 274 913 C274 973.06 274 1033.12 274 1095 C243.97 1095 213.94 1095 183 1095 C183 1125.36 183 1155.72 183 1187 C152.97 1187 122.94 1187 92 1187 C92 1277.09 92 1367.18 92 1460 C122.03 1460 152.06 1460 183 1460 C183 1490.36 183 1520.72 183 1552 C122.61 1552 62.22 1552 0 1552 C0 1491.94 0 1431.88 0 1370 C-30.03 1370 -60.06 1370 -91 1370 C-91 1339.64 -91 1309.28 -91 1278 C-121.03 1278 -151.06 1278 -182 1278 C-182 1308.36 -182 1338.72 -182 1370 C-212.03 1370 -242.06 1370 -273 1370 C-273 1400.03 -273 1430.06 -273 1461 C-303.36 1461 -333.72 1461 -365 1461 C-365 1491.03 -365 1521.06 -365 1552 C-334.97 1552 -304.94 1552 -274 1552 C-274 1582.03 -274 1612.06 -274 1643 C-334.06 1643 -394.12 1643 -456 1643 C-456 1522.55 -456 1402.1 -456 1278 C-486.03 1278 -516.06 1278 -547 1278 C-547 1247.97 -547 1217.94 -547 1187 C-577.36 1187 -607.72 1187 -639 1187 C-639 1156.97 -639 1126.94 -639 1096 C-669.36 1096 -699.72 1096 -731 1096 C-731 1065.97 -731 1035.94 -731 1005 C-761.03 1005 -791.06 1005 -822 1005 C-822 853.86 -822 702.72 -822 547 C-791.64 547 -761.28 547 -730 547 C-730 577.36 -730 607.72 -730 639 C-699.97 639 -669.94 639 -639 639 C-639 669.03 -639 699.06 -639 730 C-608.64 730 -578.28 730 -547 730 C-547 760.03 -547 790.06 -547 821 C-486.94 821 -426.88 821 -365 821 C-365 790.97 -365 760.94 -365 730 C-334.97 730 -304.94 730 -274 730 C-274 699.97 -274 669.94 -274 639 C-243.64 639 -213.28 639 -182 639 C-182 608.97 -182 578.94 -182 548 C-151.97 548 -121.94 548 -91 548 C-91 397.19 -91 246.38 -91 91 C-60.97 91 -30.94 91 0 91 C0 60.97 0 30.94 0 0 Z " fill="#2A2730" transform="translate(926,184)"/>
        {/* Arm */}
        <path d="M0 0 C30.03 0 60.06 0 91 0 C91 60.06 91 120.12 91 182 C60.97 182 30.94 182 0 182 C0 121.94 0 61.88 0 0 Z " fill="#2A2730" transform="translate(1292,1006)"/>
        {/* Eye */}
        <path d="M0 0 C30.36 0 60.72 0 92 0 C92 30.03 92 60.06 92 91 C61.64 91 31.28 91 0 91 C0 60.97 0 30.94 0 0 Z " fill="#EEEEEE" transform="translate(975,305)"/>
        {/* Pupil */}
        <path d="M0 0 C29.7 0 59.4 0 90 0 C90 29.7 90 59.4 90 90 C60.3 90 30.6 90 0 90 C0 60.3 0 30.6 0 0 Z " fill="#29262F" transform="translate(1201,641)"/>
        {/* Back/tail highlight */}
        <path d="M0 0 C30.36 0 60.72 0 92 0 C92 120.78 92 241.56 92 366 C-28.45 366 -148.9 366 -273 366 C-273 395.7 -273 425.4 -273 456 C-243.42589428 455.96038315 -243.42589428 455.96038315 -213.85180664 455.90991211 C-208.14343262 455.90539551 -208.14343262 455.90539551 -205.47459412 455.90455627 C-203.60296898 455.90301654 -201.73134486 455.89949102 -199.85972595 455.89442444 C-197.0315477 455.88714841 -194.20343029 455.88609253 -191.37524414 455.88647461 C-190.11591238 455.88107745 -190.11591238 455.88107745 -188.83113956 455.87557125 C-183.11402634 455.88597366 -183.11402634 455.88597366 -182 457 C-181.90480632 459.7998972 -181.87446056 462.57506174 -181.88647461 465.37524414 C-181.88632858 466.25321152 -181.88618256 467.13117889 -181.8860321 468.03575134 C-181.88673156 470.95224435 -181.89452545 473.86867433 -181.90234375 476.78515625 C-181.90420782 478.80154892 -181.90563177 480.81794204 -181.90663147 482.83433533 C-181.91045756 488.15265138 -181.92028861 493.4709403 -181.93133545 498.78924561 C-181.94154762 504.21170688 -181.94612867 509.63417252 -181.95117188 515.05664062 C-181.9619108 525.70443903 -181.97898831 536.35221726 -182 547 C-182.66 547 -183.32 547 -184 547 C-184.33 517.63 -184.66 488.26 -185 458 C-214.04 457.67 -243.08 457.34 -273 457 C-273 547.09 -273 637.18 -273 730 C-212.94 730 -152.88 730 -91 730 C-91 730.33 -91 730.66 -91 731 C-151.39 731 -211.78 731 -274 731 C-274 640.58 -274 550.16 -274 457 C-303.7 457 -333.4 457 -364 457 C-364 456.67 -364 456.34 -364 456 C-334.3 456 -304.6 456 -274 456 C-274 395.94 -274 335.88 -274 274 C-273.67 274 -273.34 274 -273 274 C-273 304.03 -273 334.06 -273 365 C-243.3 365 -213.6 365 -183 365 C-183 335.3 -183 305.6 -183 275 C-182.67 275 -182.34 275 -182 275 C-182 304.7 -182 334.4 -182 365 C-91.91 365 -1.82 365 91 365 C91 244.88 91 124.76 91 1 C60.97 1 30.94 1 0 1 C0 0.67 0 0.34 0 0 Z " fill="#646269" transform="translate(1474,275)"/>

        {/* LEFT LEG — animates with legSwingL */}
        <path
          className="dleg-l"
          d="M0 0 C0.33 0 0.66 0 1 0 C1 29.7 1 59.4 1 90 C31.03 90 61.06 90 92 90 C92 90.33 92 90.66 92 91 C61.97 91 31.94 91 1 91 C1 121.36 1 151.72 1 183 C-29.03 183 -59.06 183 -90 183 C-90 213.03 -90 243.06 -90 274 C-120.36 274 -150.72 274 -182 274 C-182 273.67 -182 273.34 -182 273 C-151.97 273 -121.94 273 -91 273 C-91 242.97 -91 212.94 -91 182 C-60.97 182 -30.94 182 0 182 C0 152.3 0 122.6 0 92 C-29.7 92 -59.4 92 -90 92 C-90 121.37 -90 150.74 -90 181 C-90.33 181 -90.66 181 -91 181 C-91 150.97 -91 120.94 -91 90 C-60.97 90 -30.94 90 0 90 C0 60.3 0 30.6 0 0 Z "
          fill="#57545B"
          transform="translate(743,1371)"
        />

        {/* RIGHT LEG — animates with legSwingR */}
        <path
          className="dleg-r"
          d="M0 0 C0.33 0 0.66 0 1 0 C1 29.7 1 59.4 1 90 C30.37 90 59.74 90 90 90 C90 90.66 90 91.32 90 92 C60.63 92 31.26 92 1 92 C1 182.09 1 272.18 1 365 C0.67 365 0.34 365 0 365 C0 304.94 0 244.88 0 183 C-30.03 183 -60.06 183 -91 183 C-91 182.67 -91 182.34 -91 182 C-60.97 182 -30.94 182 0 182 C0 152.3 0 122.6 0 92 C-30.03 92 -60.06 92 -91 92 C-88.4061371 89.4061371 -86.64092575 89.76411988 -83.10783958 89.7511425 C-81.86795753 89.76193683 -81.86795753 89.76193683 -80.60302734 89.77294922 C-79.72060175 89.77270815 -78.83817616 89.77246708 -77.92901039 89.7722187 C-75.0645512 89.77371487 -72.2003503 89.78896145 -69.3359375 89.8046875 C-67.57072068 89.80762699 -65.80550212 89.80966801 -64.0402832 89.81079102 C-57.48516227 89.8212892 -50.93007861 89.84921147 -44.375 89.875 C-29.73125 89.91625 -15.0875 89.9575 0 90 C0 60.3 0 30.6 0 0 Z "
          fill="#4C4A51"
          transform="translate(926,1371)"
        />

        {/* Front foot detail */}
        <path d="M0 0 C30.03 0 60.06 0 91 0 C91 29.7 91 59.4 91 90 C60.97 90 30.94 90 0 90 C0 60.3 0 30.6 0 0 Z " fill="#29262F" transform="translate(835,1463)"/>

        {/* Tail parts */}
        <path d="M0 0 C0.33 0 0.66 0 1 0 C1 60.06 1 120.12 1 182 C31.03 182 61.06 182 92 182 C92 182.33 92 182.66 92 183 C61.97 183 31.94 183 1 183 C1 273.09 1 363.18 1 456 C0.67 456 0.34 456 0 456 C0 395.94 0 335.88 0 274 C-29.37 274 -58.74 274 -89 274 C-89 273.67 -89 273.34 -89 273 C-59.63 273 -30.26 273 0 273 C0 243.3 0 213.6 0 183 C-29.37 183 -58.74 183 -89 183 C-89 182.67 -89 182.34 -89 182 C-59.63 182 -30.26 182 0 182 C0 121.94 0 61.88 0 0 Z " fill="#3F3C44" transform="translate(195,732)"/>
        <path d="M0 0 C0.33 0 0.66 0 1 0 C1.33 89.76 1.66 179.52 2 272 C31.04 272 60.08 272 90 272 C90.66 272.66 91.32 273.32 92 274 C61.97 274 31.94 274 1 274 C1 303.7 1 333.4 1 364 C0.67 364 0.34 364 0 364 C0 243.88 0 123.76 0 0 Z " fill="#33313A" transform="translate(196,915)"/>
      </svg>
    </div>
  );
}
