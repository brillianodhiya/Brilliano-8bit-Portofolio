import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Target,
  X
} from "lucide-react";

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 5;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const getRandomPoint = (exclude: Point[] = []): Point => {
  let newPoint: Point;
  do {
    newPoint = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some(p => p.x === newPoint.x && p.y === newPoint.y));
  return newPoint;
};

export function Snake() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snake_highscore')) || 0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
    setFood(getRandomPoint());
    setDirection('UP');
    setNextDirection('UP');
    setStatus('START');
    setScore(0);
    setSpeed(INITIAL_SPEED);
    playButtonSound();
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };
      const currentDir = nextDirection;
      setDirection(currentDir);

      if (currentDir === 'UP') newHead.y -= 1;
      if (currentDir === 'DOWN') newHead.y += 1;
      if (currentDir === 'LEFT') newHead.x -= 1;
      if (currentDir === 'RIGHT') newHead.x += 1;

      // Check Collisions
      // 1. Walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setStatus('GAMEOVER');
        playButtonSound();
        return prevSnake;
      }

      // 2. Self
      if (prevSnake.some(p => p.x === newHead.x && p.y === newHead.y)) {
        setStatus('GAMEOVER');
        playButtonSound();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 3. Food
      if (newHead.x === food.x && head.y === food.y || (newHead.x === food.x && newHead.y === food.y)) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake_highscore', newScore.toString());
          }
          // Increase speed
          if (newScore % 50 === 0) setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
          return newScore;
        });
        setFood(getRandomPoint(newSnake));
        // Don't pop tail
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, nextDirection, highScore]);

  useEffect(() => {
    if (status === 'PLAYING') {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [status, moveSnake, speed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' && status !== 'START') return;
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      switch (key) {
        case 'arrowup': 
        case 'w':
          if (direction !== 'DOWN') setNextDirection('UP'); break;
        case 'arrowdown':
        case 's':
          if (direction !== 'UP') setNextDirection('DOWN'); break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'RIGHT') setNextDirection('LEFT'); break;
        case 'arrowright':
        case 'd':
          if (direction !== 'LEFT') setNextDirection('RIGHT'); break;
        case ' ': // Pause/Play
          if (status === 'START') setStatus('PLAYING');
          else if (status === 'PLAYING') setStatus('PAUSED');
          else if (status === 'PAUSED') setStatus('PLAYING');
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction, status]);

  const handleDPad = (dir: Direction) => {
    if (status !== 'PLAYING' && status !== 'START') return;
    if (status === 'START') setStatus('PLAYING');
    
    if (dir === 'UP' && direction !== 'DOWN') setNextDirection('UP');
    if (dir === 'DOWN' && direction !== 'UP') setNextDirection('DOWN');
    if (dir === 'LEFT' && direction !== 'RIGHT') setNextDirection('LEFT');
    if (dir === 'RIGHT' && direction !== 'LEFT') setNextDirection('RIGHT');
    playButtonSound();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
      {/* HUD */}
      <div className="w-full flex justify-between items-end bg-card/40 p-3 pixel-panel border-green-500/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-green-500" size={16} />
            <span className="font-display text-[8px] text-green-500 uppercase tracking-widest">Score</span>
          </div>
          <span className="font-display text-2xl text-foreground text-shadow-pixel">{score.toString().padStart(4, '0')}</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-yellow-500" size={16} />
            <span className="font-display text-[8px] text-yellow-500 uppercase tracking-widest">Record</span>
          </div>
          <span className="font-display text-2xl text-foreground text-shadow-pixel">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
        {/* Game Area */}
        <div className="relative mx-auto">
          <div className="pixel-panel p-1 bg-[#0a0a0a] border-4 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)] overflow-hidden">
            <div 
              className="grid bg-[#111]"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(85vw, 360px)',
                height: 'min(85vw, 360px)'
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(p => p.x === x && p.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div 
                    key={i} 
                    className={cn(
                      "w-full h-full border-[0.5px] border-white/5",
                      isSnake && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                      isHead && "bg-green-400 scale-110 z-10",
                      isFood && "bg-red-500 animate-pulse scale-90 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {status === 'START' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <div className="pixel-panel p-6 bg-card border-green-500 text-center animate-bounce">
                  <h3 className="font-display text-xl text-green-500 mb-4 tracking-tighter">SNAKE_EATER.EXE</h3>
                  <button onClick={() => setStatus('PLAYING')} className="pixel-btn px-6 py-2 bg-green-500 text-background flex items-center gap-2 mx-auto text-xs uppercase">
                    <Play size={14} /> Wake Up
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'PAUSED' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <button onClick={() => setStatus('PLAYING')} className="pixel-panel p-4 border-yellow-500 bg-card/90 flex flex-col items-center gap-2">
                  <Play size={32} className="text-yellow-500" />
                  <span className="font-display text-[10px] text-yellow-500 uppercase">Resynchronizing...</span>
                </button>
              </motion.div>
            )}

            {status === 'GAMEOVER' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 p-6">
                <div className="pixel-panel p-8 border-destructive bg-card text-center shadow-2xl">
                  <X size={48} className="text-destructive mx-auto mb-4" />
                  <h2 className="font-display text-2xl text-destructive mb-2 uppercase">Neural Static</h2>
                  <p className="font-body text-lg mb-6 uppercase tracking-widest text-muted-foreground">Score: {score}</p>
                  <button onClick={resetGame} className="pixel-btn px-8 py-3 bg-primary text-background text-sm flex items-center gap-2 mx-auto">
                    <RotateCcw size={16} /> Re-Initialize
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls - D-Pad */}
        <div className="flex flex-col gap-6 w-full md:w-48 order-last md:order-none">
          <div className="grid grid-cols-3 gap-2 mx-auto md:mx-0">
            <div />
            <button onClick={() => handleDPad('UP')} className="w-14 h-14 pixel-btn flex items-center justify-center bg-card shadow-lg active:scale-90 select-none">
              <ChevronUp size={24} />
            </button>
            <div />
            <button onClick={() => handleDPad('LEFT')} className="w-14 h-14 pixel-btn flex items-center justify-center bg-card shadow-lg active:scale-90 select-none">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setStatus(status === 'PLAYING' ? 'PAUSED' : 'PLAYING')} className="w-14 h-14 pixel-btn flex items-center justify-center bg-secondary/20 active:scale-90 select-none">
              {status === 'PLAYING' ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => handleDPad('RIGHT')} className="w-14 h-14 pixel-btn flex items-center justify-center bg-card shadow-lg active:scale-90 select-none">
              <ChevronRight size={24} />
            </button>
            <div />
            <button onClick={() => handleDPad('DOWN')} className="w-14 h-14 pixel-btn flex items-center justify-center bg-card shadow-lg active:scale-90 select-none">
              <ChevronDown size={24} />
            </button>
            <div />
          </div>

          <div className="pixel-panel p-4 bg-background/40 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="font-display text-[8px] text-muted-foreground uppercase">Sync Speed</span>
                <span className="font-display text-xs text-green-500">{(200 - speed).toString().padStart(3, '0')}</span>
             </div>
             <div className="w-full bg-muted/20 h-1 border border-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((200 - speed) / (200 - MIN_SPEED)) * 100}%` }}
                  className="h-full bg-green-500"
                />
             </div>
             <div className="flex items-center gap-2 mt-2">
                <Zap size={10} className="text-yellow-500 animate-pulse" />
                <span className="font-body text-[8px] text-muted-foreground italic">Consumption increases drift speed.</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pixel-panel p-3 bg-card/30 border-white/5 w-full">
        <p className="font-body text-[10px] text-center text-muted-foreground uppercase tracking-widest">
          Desktop: <span className="text-primary">ARROWS</span> or <span className="text-primary">WASD</span> | Mobile: <span className="text-primary">D-PAD</span> | Pause: <span className="text-primary">SPACE</span>
        </p>
      </div>
    </div>
  );
}
