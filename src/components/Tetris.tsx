import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { setArcadeMode } from "@/lib/nes-controller-state";

// --- Constants ---
const COLS = 10;
const ROWS = 20;
const INITIAL_SPEED = 800;
const MIN_SPEED = 100;

const TETROMINOS = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 'bg-cyan-400 border-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 'bg-blue-500 border-blue-600' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 'bg-orange-500 border-orange-600' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400 border-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'bg-green-500 border-green-600' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'bg-purple-500 border-purple-600' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'bg-red-500 border-red-600' },
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  pos: { x: number; y: number };
  tetromino: typeof TETROMINOS[TetrominoType];
  collided: boolean;
}

// --- Helper Functions ---
const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS) as TetrominoType[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};

export function Tetris() {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState(randomTetromino());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const panStartPos = useRef<{ x: number; y: number } | null>(null);
  const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * 100);

  // --- Game Logic ---
  const checkCollision = useCallback((piece: Piece, moveX = 0, moveY = 0, newShape?: number[][]) => {
    const shape = newShape || piece.tetromino.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = piece.pos.x + x + moveX;
          const newY = piece.pos.y + y + moveY;

          if (
            newX < 0 || 
            newX >= COLS || 
            newY >= ROWS || 
            (newY >= 0 && grid[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [grid]);

  const spawnPiece = useCallback(() => {
    const piece = {
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      tetromino: nextPiece,
      collided: false,
    };

    if (checkCollision(piece)) {
      setGameOver(true);
      setGameStarted(false);
    } else {
      setActivePiece(piece);
      setNextPiece(randomTetromino());
    }
  }, [nextPiece, checkCollision]);

  const rotate = useCallback((dir: number) => {
    if (!activePiece || paused || gameOver) return;

    const shape = activePiece.tetromino.shape;
    const newShape = shape[0].map((_, index) => shape.map(col => col[index]));
    if (dir > 0) newShape.forEach(row => row.reverse());
    else newShape.reverse();

    if (!checkCollision(activePiece, 0, 0, newShape)) {
      setActivePiece(prev => prev ? { ...prev, tetromino: { ...prev.tetromino, shape: newShape } } : null);
    }
  }, [activePiece, checkCollision, paused, gameOver]);

  const move = useCallback((dirX: number, dirY: number) => {
    if (!activePiece || paused || gameOver) return;

    if (!checkCollision(activePiece, dirX, dirY)) {
      setActivePiece(prev => prev ? { ...prev, pos: { x: prev.pos.x + dirX, y: prev.pos.y + dirY } } : null);
    } else if (dirY > 0) {
      // Piece landed
      const newGrid = [...grid.map(row => [...row])];
      activePiece.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0) {
              newGrid[gridY][gridX] = activePiece.tetromino.color;
            }
          }
        });
      });

      // Clear lines logic
      let clearedRows = 0;
      const finalGrid = newGrid.reduce((acc, row) => {
        if (row.every(cell => cell !== null)) {
          clearedRows++;
          acc.unshift(Array(COLS).fill(null));
        } else {
          acc.push(row);
        }
        return acc;
      }, [] as (string | null)[][]);

      if (clearedRows > 0) {
        setScore(prev => prev + (clearedRows * 100 * level));
        setLines(prev => prev + clearedRows);
        setLevel(Math.floor((lines + clearedRows) / 10) + 1);
        playButtonSound(); // Line clear sound shortcut
      }

      setGrid(finalGrid);
      spawnPiece();
    }
  }, [activePiece, checkCollision, grid, level, lines, spawnPiece, paused, gameOver]);

  const dropHandler = useCallback(() => {
    move(0, 1);
  }, [move]);

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || !gameStarted || paused) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': rotate(1); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [move, rotate, gameOver, gameStarted, paused]);

  useEffect(() => {
    setArcadeMode(true);
    return () => { setArcadeMode(false); };
  }, []);

  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      gameLoopRef.current = window.setInterval(dropHandler, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameStarted, paused, gameOver, dropHandler, speed]);

  const toggleFullscreen = () => {
    if (!boardRef.current) return;
    if (!document.fullscreenElement) {
      boardRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const startGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setGameStarted(true);
    setNextPiece(randomTetromino());
    spawnPiece();
  };

  const togglePause = () => setPaused(prev => !prev);

  // --- Rendering ---
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
        
        {/* Info Panels: Top row on mobile, Left column on md */}
        <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-full md:w-32 order-1 md:order-1 justify-center md:justify-start">
          <div className="pixel-panel p-2 md:p-3 bg-secondary/10 flex-1 md:flex-none min-w-[70px] overflow-hidden">
            <h4 className="font-display text-[6px] md:text-[8px] text-secondary mb-1 md:mb-2 whitespace-nowrap uppercase">Score</h4>
            <p className="font-display text-base md:text-lg truncate">{score.toLocaleString()}</p>
          </div>
          <div className="pixel-panel p-2 md:p-3 bg-accent/10 flex-1 md:flex-none min-w-[60px]">
            <h4 className="font-display text-[6px] md:text-[8px] text-accent mb-1 md:mb-2 uppercase">Lines</h4>
            <p className="font-display text-lg md:text-xl">{lines}</p>
          </div>
          <div className="pixel-panel p-2 md:p-3 bg-primary/10 flex-1 md:flex-none min-w-[60px]">
            <h4 className="font-display text-[6px] md:text-[8px] text-primary mb-1 md:mb-2 uppercase">Level</h4>
            <p className="font-display text-lg md:text-xl">{level}</p>
          </div>
        </div>

        {/* Center: Main Game Board */}
        <div className="relative order-2 md:order-2 mx-auto touch-none" ref={boardRef}>
          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm text-white/50 hover:text-white hover:border-white/30 transition-all z-30 flex items-center gap-2 text-[8px] uppercase tracking-widest"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>

          <motion.div 
            onPanStart={(_, info) => {
              if (gameOver || !gameStarted || paused) return;
              panStartPos.current = { x: info.point.x, y: info.point.y };
            }}
            onPan={(_, info) => {
              if (!panStartPos.current || gameOver || !gameStarted || paused) return;
              const dx = info.point.x - panStartPos.current.x;
              const dy = info.point.y - panStartPos.current.y;
              
              const threshold = 30;
              if (Math.abs(dx) > threshold) {
                move(dx > 0 ? 1 : -1, 0);
                panStartPos.current.x = info.point.x;
              }
              if (dy > threshold) {
                move(0, 1);
                panStartPos.current.y = info.point.y;
              }
            }}
            onTap={() => {
              if (gameOver || !gameStarted || paused) return;
              rotate(1);
            }}
            className="pixel-panel p-1 bg-[#1a1a1a] border-4 border-[#333] shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div 
              className="grid gap-px bg-[#222]" 
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, 
                width: 'min(75vw, 280px)', 
                maxWidth: '100%' 
              }}
            >
              {grid.map((row, y) => row.map((cell, x) => {
                // Check if active piece is here
                let colorClass = cell;
                if (activePiece && !paused) {
                  activePiece.tetromino.shape.forEach((pRow, py) => {
                    pRow.forEach((pValue, px) => {
                      if (pValue !== 0 && activePiece.pos.x + px === x && activePiece.pos.y + py === y) {
                        colorClass = activePiece.tetromino.color;
                      }
                    });
                  });
                }

                return (
                  <div 
                    key={`${x}-${y}`} 
                    className={cn(
                      "aspect-square w-full border-[1px] transition-colors duration-100",
                      colorClass || "bg-background/20 border-white/5",
                      colorClass && "shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.3)]"
                    )}
                  />
                );
              }))}
            </div>
          </motion.div>

          {/* Overlays */}
          <AnimatePresence>
            {!gameStarted && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-6 text-center z-10"
              >
                <div className="pixel-panel p-6 bg-card border-accent shadow-lg scale-110">
                  <h3 className="font-display text-2xl text-accent mb-4">ARCADE TETRIS</h3>
                  <button onClick={startGame} className="pixel-btn px-6 py-2 flex items-center gap-2 text-sm bg-accent text-background">
                    <Play size={14} /> INSERT COIN
                  </button>
                </div>
              </motion.div>
            )}

            {gameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-6 text-center z-20"
              >
                <div className="pixel-panel p-6 bg-card border-destructive shadow-2xl">
                  <h3 className="font-display text-3xl text-destructive mb-2">GAME OVER</h3>
                  <p className="font-body text-xl mb-4">SCORE: {score}</p>
                  <button onClick={startGame} className="pixel-btn px-8 py-3 flex items-center gap-2 text-sm bg-primary text-background">
                    <RotateCcw size={16} /> TRY AGAIN?
                  </button>
                </div>
              </motion.div>
            )}

            {paused && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/60 flex items-center justify-center z-10"
              >
                <div className="pixel-panel p-4 bg-card border-secondary">
                  <h3 className="font-display text-xl text-secondary">PAUSED</h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel: Next Piece + Controls */}
        <div className="flex flex-col gap-4 w-full md:w-40 order-3">
          
          <div className="pixel-panel p-3 bg-background/50 hidden md:block">
            <h4 className="font-display text-[8px] text-muted-foreground mb-2 text-center uppercase">Next</h4>
            <div className="grid grid-cols-4 gap-px bg-background/20 p-2 mx-auto" style={{ width: '60px' }}>
              {Array.from({ length: 4 }).map((_, y) => 
                Array.from({ length: 4 }).map((_, x) => {
                  const isPart = nextPiece.shape[y]?.[x] === 1;
                  return (
                    <div 
                      key={`${x}-${y}`} 
                      className={cn("aspect-square w-full", isPart ? nextPiece.color + " border" : "bg-transparent")}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Standard Controls (Reverted to original cluster but cleaner) */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 mx-auto">
              <div />
              <button onPointerDown={(e) => { e.stopPropagation(); rotate(1); }} className="pixel-btn p-3 flex justify-center bg-card active:scale-95 shadow-lg">
                <RotateCw size={18} />
              </button>
              <div />
              <button onPointerDown={(e) => { e.stopPropagation(); move(-1, 0); }} className="pixel-btn p-3 flex justify-center bg-card active:scale-95 shadow-lg">
                <ArrowLeft size={18} />
              </button>
              <button onPointerDown={(e) => { e.stopPropagation(); move(0, 1); }} className="pixel-btn p-3 flex justify-center bg-card active:scale-95 shadow-lg">
                <ArrowDown size={18} />
              </button>
              <button onPointerDown={(e) => { e.stopPropagation(); move(1, 0); }} className="pixel-btn p-3 flex justify-center bg-card active:scale-95 shadow-lg">
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex justify-center gap-2">
              <button 
                onClick={togglePause} 
                className="pixel-btn px-4 py-2 flex items-center justify-center gap-2 text-[8px] bg-secondary/20 hover:bg-secondary/40"
              >
                {paused ? <Play size={12} /> : <Pause size={12} />} 
                {paused ? "RESUME" : "PAUSE"}
              </button>
              
              <button 
                onClick={toggleFullscreen}
                className="pixel-btn p-2 md:hidden bg-accent/20"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Tips */}
      <div className="pixel-panel p-3 bg-card/30 border-white/5 w-full">
        <p className="font-body text-[10px] text-center text-muted-foreground">
          CONTROLS: Use <span className="text-secondary">Arrow Keys</span> or On-Screen Buttons to play
        </p>
      </div>
    </div>
  );
}
