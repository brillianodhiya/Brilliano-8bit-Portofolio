import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playButtonSound } from "@/lib/audio";
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Target,
  Zap,
  MousePointer2
} from "lucide-react";

// --- Constants ---
const ROWS = 12;
const COLS = 8;
const BUBBLE_RADIUS = 20;
const CANVAS_WIDTH = COLS * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
const CANVAS_HEIGHT = 500;
const COLORS = [
  '#00f2ff', // Cyan
  '#ff00f2', // Magenta
  '#7000ff', // Purple
  '#00ff22', // Neon Green
  '#ffbb00', // Gold
  '#ff3b3b'  // Red
];



type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  active: boolean;
};

export function BubbleBlast() {
  const [grid, setGrid] = useState<(string | null)[][]>(() => 
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [nextColor, setNextColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('bubble_highscore')) || 0);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [mousePos, setMousePos] = useState({ x: CANVAS_WIDTH / 2, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Audio placeholders
  const playPopSound = () => { /* Add pop sound logic here if available */ };

  // --- Grid Helpers ---
  const getBubbleCoords = (row: number, col: number) => {
    const isStaggered = row % 2 === 1;
    const x = col * BUBBLE_RADIUS * 2 + (isStaggered ? BUBBLE_RADIUS * 2 : BUBBLE_RADIUS);
    const y = row * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS; // 1.7 instead of 2 for tight hexagonal packing
    return { x, y };
  };

  const getGridFromCoords = (x: number, y: number) => {
    const row = Math.round((y - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 1.7));
    const isStaggered = row % 2 === 1;
    const col = Math.round((x - (isStaggered ? BUBBLE_RADIUS * 2 : BUBBLE_RADIUS)) / (BUBBLE_RADIUS * 2));
    return { row, col };
  };

  // --- Game Lifecycle ---
  const initGrid = useCallback(() => {
    const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < (r % 2 === 1 ? COLS - 1 : COLS); c++) {
        newGrid[r][c] = COLORS[Math.floor(Math.random() * (COLORS.length - 1))];
      }
    }
    setGrid(newGrid);
  }, []);

  const resetGame = () => {
    initGrid();
    setScore(0);
    setStatus('PLAYING');
    setProjectile(null);
    playButtonSound();
  };

  // --- Logic: Clustering & Gravity ---
  const getNeighbors = (row: number, col: number) => {
    const neighbors: { r: number, c: number }[] = [];
    const isStaggered = row % 2 === 1;

    // Direct Horizontal
    neighbors.push({ r: row, c: col - 1 }, { r: row, c: col + 1 });
    
    // Vertical (staggered logic)
    if (isStaggered) {
      neighbors.push(
        { r: row - 1, c: col }, { r: row - 1, c: col + 1 },
        { r: row + 1, c: col }, { r: row + 1, c: col + 1 }
      );
    } else {
      neighbors.push(
        { r: row - 1, c: col - 1 }, { r: row - 1, c: col },
        { r: row + 1, c: col - 1 }, { r: row + 1, c: col }
      );
    }

    return neighbors.filter(n => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS);
  };

  const findCluster = (currentGrid: (string | null)[][], row: number, col: number, color: string, visited: Set<string> = new Set()) => {
    const key = `${row},${col}`;
    if (visited.has(key) || currentGrid[row][col] !== color) return [];
    
    visited.add(key);
    const cluster = [{ r: row, c: col }];
    const neighbors = getNeighbors(row, col);

    for (const n of neighbors) {
      cluster.push(...findCluster(currentGrid, n.r, n.c, color, visited));
    }
    return cluster;
  };

  const findFloating = (currentGrid: (string | null)[][]) => {
    const connected = new Set<string>();
    const queue: { r: number, c: number }[] = [];

    // Start from top row
    for (let c = 0; c < COLS; c++) {
      if (currentGrid[0][c]) {
        queue.push({ r: 0, c: c });
        connected.add(`0,${c}`);
      }
    }

    while (queue.length > 0) {
      const { r, c } = queue.shift()!;
      const neighbors = getNeighbors(r, c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (currentGrid[n.r][n.c] && !connected.has(key)) {
          connected.add(key);
          queue.push(n);
        }
      }
    }

    const floating: { r: number, c: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r][c] && !connected.has(`${r},${c}`)) {
          floating.push({ r, c });
        }
      }
    }
    return floating;
  };

  // --- Shooting Mechanic ---
  const shoot = () => {
    if (projectile || status !== 'PLAYING') return;

    const angle = Math.atan2(mousePos.y - (CANVAS_HEIGHT - 30), mousePos.x - CANVAS_WIDTH / 2);
    const speed = 10;
    
    setProjectile({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: nextColor,
      active: true
    });

    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    playButtonSound();
  };

  // --- Animation Loop ---
  const update = useCallback(() => {
    if (!projectile || status !== 'PLAYING') return;

    let { x, y, vx, vy, color } = projectile;
    x += vx;
    y += vy;

    // Wall Reflection
    if (x < BUBBLE_RADIUS || x > CANVAS_WIDTH - BUBBLE_RADIUS) {
      vx *= -1;
      x = x < BUBBLE_RADIUS ? BUBBLE_RADIUS : CANVAS_WIDTH - BUBBLE_RADIUS;
    }

    // Collision Detection
    let collided = false;
    let targetPos = { row: -1, col: -1 };

    // Ceiling collision
    if (y < BUBBLE_RADIUS) {
      collided = true;
      targetPos = getGridFromCoords(x, BUBBLE_RADIUS);
    } else {
      // Neighbor collision
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) {
            const { x: bx, y: by } = getBubbleCoords(r, c);
            const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
            if (dist < BUBBLE_RADIUS * 1.8) {
              collided = true;
              targetPos = getGridFromCoords(x, y);
              break;
            }
          }
        }
        if (collided) break;
      }
    }

    if (collided) {
      let { row, col } = targetPos;
      
      // Safety: find nearest empty cell if target is occupied
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col]) {
        const neighbors = getNeighbors(row, col);
        let nearestEmpty = null;
        let minDist = Infinity;
        
        for (const n of neighbors) {
          if (!grid[n.r][n.c]) {
            const { x: nx, y: ny } = getBubbleCoords(n.r, n.c);
            const d = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
            if (d < minDist) {
              minDist = d;
              nearestEmpty = n;
            }
          }
        }
        if (nearestEmpty) {
          row = nearestEmpty.r;
          col = nearestEmpty.c;
        }
      }

      if (row >= 0 && row < ROWS && col >= 0 && col < COLS && !grid[row][col]) {
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = color;

        // Process Match-3
        const cluster = findCluster(newGrid, row, col, color);
        if (cluster.length >= 3) {
          cluster.forEach(({ r, c }) => { newGrid[r][c] = null; });
          const points = cluster.length * 10;
          setScore(s => {
            const newScore = s + points;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('bubble_highscore', newScore.toString());
            }
            return newScore;
          });
          
          // Drop orphans
          const floating = findFloating(newGrid);
          floating.forEach(({ r, c }) => { newGrid[r][c] = null; });
          const dropPoints = floating.length * 20;
          setScore(s => {
            const newScore = s + dropPoints;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('bubble_highscore', newScore.toString());
            }
            return newScore;
          });
          
          playPopSound();
        }

        setGrid(newGrid);
        setProjectile(null);

        // Game Over Check
        if (newGrid[ROWS - 1].some(c => c !== null)) {
          setStatus('GAMEOVER');
        }
      } else {
        setProjectile(null); // Safety
      }
    } else if (y < 0 || y > CANVAS_HEIGHT) {
      setProjectile(null);
    } else {
      setProjectile({ x, y, vx, vy, color, active: true });
    }
  }, [projectile, grid, status, findCluster, findFloating]);

  useEffect(() => {
    if (status === 'PLAYING') {
      const loop = () => {
        update();
        requestRef.current = requestAnimationFrame(loop);
      };
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [status, update]);

  // --- Rendering (Canvas) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Grid Bubbles
    grid.forEach((row, r) => {
      row.forEach((color, c) => {
        if (color) {
          const { x, y } = getBubbleCoords(r, c);
          drawBubble(ctx, x, y, color);
        }
      });
    });

    // Draw Projectile
    if (projectile) {
      drawBubble(ctx, projectile.x, projectile.y, projectile.color);
    }

    // Draw Aim Line
    if (status === 'PLAYING' && !projectile) {
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Shooter Base
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT + 20, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Current Bubble in Cannon
    if (!projectile) {
       drawBubble(ctx, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, nextColor);
    }

  }, [grid, projectile, mousePos, status, nextColor]);

  const drawBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
    
    // Glowing gradient
    const grad = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, BUBBLE_RADIUS);
    grad.addColorStop(0, 'white');
    grad.addColorStop(0.2, color);
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Outer glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // --- Input Handlers ---
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setMousePos({
      x: clientX - rect.left,
      y: Math.min(clientY - rect.top, CANVAS_HEIGHT - 60)
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 select-none">
      {/* HUD */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        <div className="pixel-panel p-2 bg-blue-500/10 border-blue-500/30 flex flex-col items-center">
          <span className="font-display text-[7px] text-blue-400 uppercase tracking-widest mb-1">Score</span>
          <span className="font-display text-xl">{score.toString().padStart(5, '0')}</span>
        </div>
        <div className="pixel-panel p-2 bg-purple-500/10 border-purple-500/30 flex flex-col items-center">
          <span className="font-display text-[7px] text-purple-400 uppercase tracking-widest mb-1">High Score</span>
          <span className="font-display text-xl">{highScore.toString().padStart(5, '0')}</span>
        </div>
        <div className="hidden md:flex pixel-panel p-2 bg-yellow-500/10 border-yellow-500/30 flex-col items-center">
          <span className="font-display text-[7px] text-yellow-400 uppercase tracking-widest mb-1">Next Link</span>
          <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: nextColor, border: `2px solid ${nextColor}55` }} />
        </div>
        <div className="hidden md:flex pixel-panel p-2 bg-cyan-500/10 border-cyan-500/30 flex-col items-center">
          <span className="font-display text-[7px] text-cyan-400 uppercase tracking-widest mb-1">Status</span>
          <span className="font-display text-[10px] text-cyan-300 mt-1 uppercase tracking-tighter">System_Active</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full">
        {/* Main Canvas Area */}
        <div className="relative group">
          <div className="pixel-panel p-1 bg-[#050505] border-4 border-blue-500/20 shadow-[0_0_50px_rgba(0,242,255,0.15)] overflow-hidden cursor-crosshair">
            <canvas 
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              onClick={shoot}
              className="touch-none"
            />
          </div>

          {/* Danger Line */}
          <div className="absolute bottom-[34px] left-1 right-1 h-px bg-red-500/30 border-t border-dashed border-red-500/50 pointer-events-none" />

          {/* Overlays */}
          <AnimatePresence>
            {status === 'START' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="pixel-panel p-8 bg-card border-blue-500 text-center">
                  <h3 className="font-display text-3xl text-blue-400 mb-6 tracking-tighter uppercase text-shadow-pixel">Bubble Blast</h3>
                  <p className="font-body text-xs text-muted-foreground mb-8 max-w-[200px] mx-auto italic">Match the neural patterns to prevent system overflow.</p>
                  <button onClick={() => { setStatus('PLAYING'); initGrid(); playButtonSound(); }} className="pixel-btn px-8 py-3 bg-blue-500 text-background flex items-center gap-3 mx-auto text-sm uppercase group">
                    <Play size={16} className="group-hover:scale-125 transition-transform" /> Initialize Pattern
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'GAMEOVER' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 p-6">
                <div className="pixel-panel p-8 border-destructive bg-card text-center shadow-2xl">
                  <RotateCcw size={48} className="text-destructive mx-auto mb-4 animate-spin-slow" />
                  <h2 className="font-display text-3xl text-destructive mb-2 uppercase">System Overflow</h2>
                  <p className="font-body text-xl mb-6 uppercase tracking-widest text-muted-foreground">Patterns Cleared: {score / 10}</p>
                  <button onClick={resetGame} className="pixel-btn px-8 py-3 bg-primary text-background text-sm flex items-center gap-2 mx-auto uppercase">
                    <Zap size={16} /> Re-Initialize
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Info & Instructions */}
        <div className="flex flex-col gap-6 w-full lg:w-48">
          <div className="pixel-panel p-4 bg-background/40 border-blue-500/20">
            <h4 className="font-display text-[8px] text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <MousePointer2 size={10} /> Interface_Guide
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 pixel-panel bg-blue-500/20 flex items-center justify-center">
                  <Target size={14} className="text-blue-400" />
                </div>
                <span className="font-body text-[10px] text-muted-foreground uppercase leading-tight">Aim with pointer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 pixel-panel bg-purple-500/20 flex items-center justify-center">
                  <Play size={14} className="text-purple-400 ml-0.5" />
                </div>
                <span className="font-body text-[10px] text-muted-foreground uppercase leading-tight">Click to transmit link</span>
              </div>
            </div>
          </div>

          <div className="pixel-panel p-4 bg-background/40 border-yellow-500/20">
             <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[8px] text-yellow-500 uppercase">Multi_Link</span>
                <span className="font-display text-[10px] text-yellow-200">X1.5</span>
             </div>
             <p className="font-body text-[9px] text-muted-foreground italic uppercase">Cluster chains &gt; 5 grant significant score amplification.</p>
          </div>

          <button 
            onClick={() => status === 'PLAYING' ? setStatus('PAUSED') : setStatus('PLAYING')}
            className="pixel-btn py-3 px-4 bg-secondary/10 border-secondary/30 flex items-center justify-center gap-2 text-xs uppercase text-secondary hover:bg-secondary/20"
          >
            {status === 'PAUSED' ? <Play size={14} /> : <Pause size={14} />}
            {status === 'PAUSED' ? "Resume_Sync" : "Pause_Sync"}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pixel-panel p-3 bg-card/30 border-white/5 w-full">
        <p className="font-body text-[10px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-4">
          <span>Match <span className="text-blue-400">3 Pattern Fragments</span> To Clear</span>
          <span className="text-white/20">|</span>
          <span>Beware the <span className="text-red-500">Critical Threshold</span> (Red Line)</span>
        </p>
      </div>
    </div>
  );
}
