import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playButtonSound } from "@/lib/audio";
import { 
  Trophy, 
  RotateCcw, 
  Zap,
  Star,
  Sparkles,
  Play
} from "lucide-react";

// --- Constants ---
const GRID_SIZE = 8;
const CANDY_TYPES = [
  { icon: '🍬', color: 'text-pink-400', shadow: 'shadow-pink-500/50' },
  { icon: '🍭', color: 'text-purple-400', shadow: 'shadow-purple-500/50' },
  { icon: '🍫', color: 'text-amber-600', shadow: 'shadow-amber-700/50' },
  { icon: '🍩', color: 'text-rose-400', shadow: 'shadow-rose-500/50' },
  { icon: '🧁', color: 'text-cyan-400', shadow: 'shadow-cyan-500/50' },
  { icon: '🍪', color: 'text-yellow-600', shadow: 'shadow-yellow-700/50' },
];

type Candy = {
  id: string;
  typeIndex: number;
};

export function CandyMatch() {
  const [board, setBoard] = useState<(Candy | null)[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('candy_highscore')) || 0);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [combo, setCombo] = useState(1);

  // --- Board Initialization ---
  const initBoard = useCallback(() => {
    const newBoard: (Candy | null)[][] = Array.from({ length: GRID_SIZE }, () => 
      Array.from({ length: GRID_SIZE }, () => ({
        id: Math.random().toString(36).substr(2, 9),
        typeIndex: Math.floor(Math.random() * CANDY_TYPES.length)
      }))
    );
    
    // Ensure no initial matches
    let hasMatches = true;
    while (hasMatches) {
      hasMatches = false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const horizontalMatch = c > 1 && 
            newBoard[r][c]?.typeIndex === newBoard[r][c-1]?.typeIndex && 
            newBoard[r][c]?.typeIndex === newBoard[r][c-2]?.typeIndex;
          const verticalMatch = r > 1 && 
            newBoard[r][c]?.typeIndex === newBoard[r-1][c]?.typeIndex && 
            newBoard[r][c]?.typeIndex === newBoard[r-2][c]?.typeIndex;
          
          if (horizontalMatch || verticalMatch) {
            newBoard[r][c] = {
              id: Math.random().toString(36).substr(2, 9),
              typeIndex: Math.floor(Math.random() * CANDY_TYPES.length)
            };
            hasMatches = true;
          }
        }
      }
    }
    setBoard(newBoard);
  }, []);

  const resetGame = () => {
    initBoard();
    setScore(0);
    setCombo(1);
    setStatus('PLAYING');
    playButtonSound();
  };

  // --- Match Logic ---
  const checkMatches = useCallback((currentBoard: (Candy | null)[][]) => {
    const matches: { r: number; c: number }[] = [];
    
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentBoard[r][c]?.typeIndex;
        if (type !== undefined && type === currentBoard[r][c+1]?.typeIndex && type === currentBoard[r][c+2]?.typeIndex) {
          matches.push({ r, c }, { r, c: c + 1 }, { r, c: c + 2 });
        }
      }
    }

    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentBoard[r][c]?.typeIndex;
        if (type !== undefined && type === currentBoard[r+1][c]?.typeIndex && type === currentBoard[r+2][c]?.typeIndex) {
          matches.push({ r, c }, { r: r + 1, c }, { r: r + 2, c });
        }
      }
    }

    return Array.from(new Set(matches.map(m => `${m.r},${m.c}`))).map(s => {
      const [r, c] = s.split(',').map(Number);
      return { r, c };
    });
  }, []);

  const processMatches = useCallback(async () => {
    const matches = checkMatches(board);
    if (matches.length === 0) {
      setIsProcessing(false);
      setCombo(1);
      return;
    }

    setIsProcessing(true);
    const newBoard = board.map(row => [...row]);
    
    // Clear matches
    matches.forEach(({ r, c }) => { newBoard[r][c] = null; });
    
    // Update Score
    const points = matches.length * 10 * combo;
    setScore(s => {
      const newScore = s + points;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('candy_highscore', newScore.toString());
      }
      return newScore;
    });
    setCombo(c => c + 1);
    
    // Refill logic (instant drop for now, framer-motion handles the visual drop)
    setTimeout(() => {
      const refilledBoard = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptySpots = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newBoard[r][c] === null) {
            emptySpots++;
          } else {
            refilledBoard[r + emptySpots][c] = newBoard[r][c];
          }
        }
        for (let r = 0; r < emptySpots; r++) {
          refilledBoard[r][c] = {
            id: Math.random().toString(36).substr(2, 9),
            typeIndex: Math.floor(Math.random() * CANDY_TYPES.length)
          };
        }
      }
      setBoard(refilledBoard);
    }, 400);
    
  }, [board, checkMatches, combo, highScore]);

  // --- Interaction Logic ---
  const handleTileClick = (r: number, c: number) => {
    if (isProcessing || status !== 'PLAYING') return;

    if (!selected) {
      setSelected({ r, c });
      playButtonSound();
    } else {
      const isAdjacent = 
        (Math.abs(selected.r - r) === 1 && selected.c === c) ||
        (Math.abs(selected.c - c) === 1 && selected.r === r);

      if (isAdjacent) {
        performSwap(selected.r, selected.c, r, c);
      } else {
        setSelected({ r, c });
      }
      playButtonSound();
    }
  };

  const performSwap = (r1: number, c1: number, r2: number, c2: number) => {
    setIsProcessing(true);
    const originalBoard = board.map(row => [...row]);
    const newBoard = board.map(row => [...row]);
    const temp = newBoard[r1][c1];
    if (newBoard[r1][c1] && newBoard[r2][c2]) {
      newBoard[r1][c1] = newBoard[r2][c2];
      newBoard[r2][c2] = temp;
    }

    const matches = checkMatches(newBoard);
    if (matches.length > 0) {
      setBoard(newBoard);
      setSelected(null);
    } else {
      // Show failed swap then revert
      setBoard(newBoard);
      setTimeout(() => {
        setBoard(originalBoard);
        setIsProcessing(false);
        setSelected(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (status === 'PLAYING') {
      const matches = checkMatches(board);
      if (matches.length > 0) {
        processMatches();
      } else {
        setIsProcessing(false);
      }
    }
  }, [board, checkMatches, processMatches, status]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 select-none">
      {/* HUD */}
      <div className="w-full flex justify-between items-end bg-pink-500/10 p-3 pixel-panel border-pink-500/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Star className="text-pink-500" size={16} />
            <span className="font-display text-[8px] text-pink-500 uppercase tracking-widest">Score</span>
          </div>
          <span className="font-display text-2xl text-foreground text-shadow-pixel">{score.toString().padStart(5, '0')}</span>
        </div>

        {combo > 1 && (
           <motion.div 
             initial={{ scale: 0 }} 
             animate={{ scale: 1 }} 
             className="flex flex-col items-center"
           >
             <span className="font-display text-[10px] text-yellow-500 uppercase animate-bounce">Combo!</span>
             <span className="font-display text-lg text-yellow-400">x{combo}</span>
           </motion.div>
        )}

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-yellow-500" size={16} />
            <span className="font-display text-[8px] text-yellow-500 uppercase tracking-widest">Best</span>
          </div>
          <span className="font-display text-2xl text-foreground text-shadow-pixel">{highScore.toString().padStart(5, '0')}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
        {/* Board Area */}
        <div className="relative mx-auto">
          <div className="pixel-panel p-2 bg-[#1a0a15] border-4 border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.15)] overflow-hidden">
            <div 
              className="grid gap-1 bg-black/40 p-1"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(85vw, 420px)',
                height: 'min(85vw, 420px)'
              }}
            >
              {board.map((row, r) => 
                row.map((candy, c) => (
                  <motion.div
                    key={candy?.id || `empty-${r}-${c}`}
                    layoutId={candy?.id}
                    onClick={() => handleTileClick(r, c)}
                    className={cn(
                      "aspect-square flex items-center justify-center text-2xl sm:text-3xl cursor-pointer rounded-lg transition-colors relative",
                      selected?.r === r && selected?.c === c ? "bg-pink-500/40 ring-2 ring-pink-500 shadow-lg" : "hover:bg-white/5",
                      !candy && "opacity-0"
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {candy && (
                      <span className={cn(CANDY_TYPES[candy.typeIndex].color, "drop-shadow-lg")}>
                        {CANDY_TYPES[candy.typeIndex].icon}
                      </span>
                    )}
                    
                    {/* Sparkle effect on match would go here */}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {status === 'START' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                <div className="pixel-panel p-8 bg-card border-pink-500 text-center max-w-xs">
                  <h3 className="font-display text-2xl text-pink-500 mb-4 tracking-tighter uppercase">CANDY_MATCH</h3>
                  <div className="flex justify-center gap-2 mb-6">
                    {CANDY_TYPES.slice(0, 4).map((t, i) => (
                        <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i*0.1}s` }}>{t.icon}</span>
                    ))}
                  </div>
                  <button onClick={() => { setStatus('PLAYING'); initBoard(); playButtonSound(); }} className="pixel-btn px-8 py-3 bg-pink-500 text-background flex items-center gap-3 mx-auto text-sm uppercase">
                    <Play size={16} /> Dig In
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'GAMEOVER' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 p-6">
                <div className="pixel-panel p-8 border-destructive bg-card text-center shadow-2xl">
                  <RotateCcw size={48} className="text-destructive mx-auto mb-4" />
                  <h2 className="font-display text-2xl text-destructive mb-2 uppercase">Sugar Crash</h2>
                  <p className="font-body text-xl mb-6 uppercase tracking-widest text-muted-foreground">Score: {score}</p>
                  <button onClick={resetGame} className="pixel-btn px-8 py-3 bg-primary text-background text-sm flex items-center gap-2 mx-auto uppercase">
                    <RotateCcw size={16} /> Re-Calculate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Area */}
        <div className="flex flex-col gap-6 w-full lg:w-48 order-last lg:order-none">
          <div className="pixel-panel p-4 bg-background/40 border-pink-500/20">
            <h4 className="font-display text-[8px] text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Sparkles size={10} /> Sweet_Intel
            </h4>
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <span className="font-body text-[8px] text-muted-foreground uppercase">Grid Sync</span>
                  <div className="w-12 h-1 bg-pink-500/20 rounded-full overflow-hidden">
                     <motion.div animate={{ width: isProcessing ? '100%' : '0%' }} className="h-full bg-pink-500" />
                  </div>
               </div>
               <p className="font-body text-[9px] text-muted-foreground italic uppercase leading-relaxed">
                  Swap candies to create links. Multi-match combos amplify neural satisfaction.
               </p>
            </div>
          </div>

          <div className="pixel-panel p-4 bg-background/40 border-yellow-500/20 relative overflow-hidden group">
             <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[8px] text-yellow-500 uppercase">Power_Up</span>
                <Zap size={10} className="text-yellow-500 animate-pulse" />
             </div>
             <p className="font-body text-[9px] text-muted-foreground uppercase">Coming Soon: Sugar Bombs & Rainbow Links.</p>
             <div className="absolute inset-0 bg-yellow-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </div>

          <button 
            onClick={resetGame}
            className="pixel-btn py-3 px-4 bg-secondary/10 border-secondary/30 flex items-center justify-center gap-2 text-xs uppercase text-secondary hover:bg-secondary/20"
          >
            <RotateCcw size={14} /> Reset_Board
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pixel-panel p-3 bg-card/30 border-white/5 w-full">
        <p className="font-body text-[10px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-4">
          <span>Match <span className="text-pink-400">3 or more</span> identical candies</span>
          <span className="text-white/20">|</span>
          <span>Click <span className="text-pink-400">Adjacents</span> to swap</span>
        </p>
      </div>
    </div>
  );
}

// Re-using the cn helper
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
