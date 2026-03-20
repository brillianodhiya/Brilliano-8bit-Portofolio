import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { playButtonSound } from "@/lib/audio";
import { 
  RotateCcw, 
  Lightbulb, 
  Trophy, 
  Timer, 
  Brain,
  X,
  Play,
  Settings2
} from "lucide-react";

// --- Sudoku Logic Helpers ---

const GRID_SIZE = 9;
const BOX_SIZE = 3;

type SudokuGrid = (number | null)[][];

const createEmptyBoard = (): SudokuGrid => 
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const isValid = (board: SudokuGrid, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (board[row][x] === num) return false;
  }
  // Check column
  for (let x = 0; x < GRID_SIZE; x++) {
    if (board[x][col] === num) return false;
  }
  // Check 3x3 box
  const startRow = row - (row % BOX_SIZE);
  const startCol = col - (col % BOX_SIZE);
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

const solveSudoku = (board: SudokuGrid): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateSudoku = (difficulty: 'EASY' | 'MEDIUM' | 'HARD'): { solved: SudokuGrid, initial: SudokuGrid } => {
  const solved = createEmptyBoard();
  solveSudoku(solved);
  
  const initial = solved.map(row => [...row]);
  let attempts = difficulty === 'EASY' ? 35 : difficulty === 'MEDIUM' ? 45 : 55;
  
  while (attempts > 0) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (initial[row][col] !== null) {
      initial[row][col] = null;
      attempts--;
    }
  }
  
  return { solved, initial };
};

// --- Main Component ---

export function Sudoku() {
  const [grid, setGrid] = useState<SudokuGrid>(createEmptyBoard());
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>(createEmptyBoard());
  const [solvedGrid, setSolvedGrid] = useState<SudokuGrid>(createEmptyBoard());
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [hints, setHints] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = useCallback((diff = difficulty) => {
    const { solved, initial } = generateSudoku(diff);
    setSolvedGrid(solved);
    setInitialGrid(initial.map(row => [...row]));
    setGrid(initial.map(row => [...row]));
    setDifficulty(diff);
    setSelected(null);
    setTimer(0);
    setIsWinner(false);
    setIsPaused(false);
    setHints(3);
    playButtonSound();
  }, [difficulty]);

  useEffect(() => {
    if (!isPaused && !isWinner) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, isWinner]);

  const handleCellClick = (r: number, c: number) => {
    if (isWinner || isPaused) return;
    setSelected({ r, c });
    playButtonSound();
  };

  const handleNumberInput = (num: number | null) => {
    if (!selected || isWinner || isPaused) return;
    const { r, c } = selected;
    if (initialGrid[r][c] !== null) return; // Cannot edit initial cells

    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);
    playButtonSound();

    // Check if board is full and correct
    const isFull = newGrid.every(row => row.every(cell => cell !== null));
    if (isFull) {
      const isCorrect = newGrid.every((row, ri) => 
        row.every((cell, ci) => cell === solvedGrid[ri][ci])
      );
      if (isCorrect) {
        setIsWinner(true);
        // Play victory sound or trigger achievement
      }
    }
  };

  const useHint = () => {
    if (!selected || hints <= 0 || isWinner || isPaused) return;
    const { r, c } = selected;
    if (grid[r][c] !== null) return;

    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = solvedGrid[r][c];
    setGrid(newGrid);
    setHints(prev => prev - 1);
    playButtonSound();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWinner || isPaused) return;

      // 1. Number Input (1-9)
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
        return;
      }

      // 2. Clear Input (Backspace / Delete / 0)
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(null);
        return;
      }

      // 3. Navigation (Arrows)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelected(prev => {
          if (!prev) return { r: 0, c: 0 };
          let { r, c } = prev;
          if (e.key === 'ArrowUp') r = (r - 1 + 9) % 9;
          if (e.key === 'ArrowDown') r = (r + 1) % 9;
          if (e.key === 'ArrowLeft') c = (c - 1 + 9) % 9;
          if (e.key === 'ArrowRight') c = (c + 1) % 9;
          return { r, c };
        });
        return;
      }

      // 4. Hint (H)
      if (e.key.toLowerCase() === 'h') {
        useHint();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, isWinner, isPaused, hints, handleNumberInput, useHint]);

  const getCellStatus = (r: number, c: number) => {
    const val = grid[r][c];
    const isInitial = initialGrid[r][c] !== null;
    const isSelected = selected?.r === r && selected?.c === c;
    const isRelated = selected && (selected.r === r || selected.c === c || 
      (Math.floor(selected.r / 3) === Math.floor(r / 3) && Math.floor(selected.c / 3) === Math.floor(c / 3)));
    const isSameNum = selected && grid[selected.r][selected.c] !== null && grid[selected.r][selected.c] === val;
    
    // Conflict check
    let hasConflict = false;
    if (val !== null && !isInitial) {
      // Temporarily null the current cell to check validity
      const tempGrid = grid.map(row => [...row]);
      tempGrid[r][c] = null;
      if (!isValid(tempGrid, r, c, val)) hasConflict = true;
    }

    return { isInitial, isSelected, isRelated, isSameNum, hasConflict };
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
      {/* Header Info */}
      <div className="w-full flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Brain className="text-accent" size={20} />
            <h3 className="font-display text-lg text-accent uppercase tracking-tighter">Logic Chamber</h3>
          </div>
          <p className="font-body text-xs text-muted-foreground italic">Solve the ancient number sequence</p>
        </div>

        <div className="flex gap-4">
          <div className="pixel-panel px-3 py-1 bg-secondary/10 flex items-center gap-2">
            <Timer size={14} className="text-secondary" />
            <span className="font-display text-sm whitespace-nowrap">{formatTime(timer)}</span>
          </div>
          <div className="pixel-panel px-3 py-1 bg-primary/10 flex items-center gap-2">
            <Trophy size={14} className="text-primary" />
            <span className="font-display text-[10px] uppercase">{difficulty}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
        {/* Sudoku Grid */}
        <div className="relative mx-auto">
          <div className="pixel-panel p-2 bg-card/60 backdrop-blur-md border-4 border-white/20 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-9 bg-muted/20 border-2 border-white/10">
              {grid.map((row, r) => row.map((cell, c) => {
                const { isInitial, isSelected, isRelated, isSameNum, hasConflict } = getCellStatus(r, c);
                
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    whileHover={!isPaused ? { scale: 1.05, zIndex: 10 } : {}}
                    whileTap={!isPaused ? { scale: 0.95 } : {}}
                    onClick={() => handleCellClick(r, c)}
                    className={cn(
                      "aspect-square w-8 sm:w-10 md:w-12 flex items-center justify-center cursor-pointer relative transition-all duration-200",
                      "font-display text-lg sm:text-xl",
                      "border-[0.5px] border-white/5",
                      // Subgrid borders
                      c % 3 === 2 && c !== 8 && "border-r-2 border-r-white/30",
                      r % 3 === 2 && r !== 8 && "border-b-2 border-b-white/30",
                      // States
                      isInitial ? "text-primary font-bold" : "text-foreground",
                      isSelected ? "bg-accent/40 scale-105 z-10 shadow-lg border-2 border-accent" : 
                      isSameNum ? "bg-accent/20" :
                      isRelated ? "bg-white/5" : "bg-transparent",
                      hasConflict && "text-destructive !bg-destructive/10 animate-pulse",
                      isPaused && "blur-[2px] pointer-events-none"
                    )}
                  >
                    {cell}
                  </motion.div>
                );
              }))}
            </div>
          </div>

          {/* Victory Overlay */}
          <AnimatePresence>
            {isWinner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6"
              >
                <div className="pixel-panel p-8 bg-background/90 backdrop-blur-xl border-4 border-accent text-center shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)]">
                  <Trophy size={64} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h2 className="font-display text-3xl text-accent mb-2">CHAMBER SOLVED</h2>
                  <p className="font-body text-lg text-muted-foreground mb-6">TIME: {formatTime(timer)}</p>
                  <button onClick={() => startNewGame()} className="pixel-btn px-8 py-3 bg-accent text-background text-sm flex items-center gap-2 mx-auto">
                    <Play size={16} /> REPLAY ARCADE
                  </button>
                </div>
              </motion.div>
            )}

            {isPaused && !isWinner && grid[0][0] !== null && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 bg-background/40 backdrop-blur-md flex items-center justify-center"
              >
                <button 
                  onClick={() => setIsPaused(false)}
                  className="pixel-panel p-6 border-secondary bg-card/80 hover:scale-110 transition-transform flex flex-col items-center gap-3 active:scale-95"
                >
                  <Play size={40} className="text-secondary" />
                  <span className="font-display text-sm text-secondary">RESUME GAME</span>
                </button>
              </motion.div>
            )}

            {!isWinner && grid[0][0] === null && (
              <motion.div className="absolute inset-0 z-40 bg-background/20 backdrop-blur-sm flex items-center justify-center">
                <button 
                  onClick={() => startNewGame('EASY')}
                  className="pixel-btn px-8 py-3 bg-primary text-sm flex items-center gap-2 animate-float"
                >
                  <Play size={16} /> INSERT COIN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Controls */}
        <div className="flex flex-col gap-6 w-full lg:w-48">
          {/* Numpad */}
          <div className="pixel-panel p-3 bg-background/40 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="aspect-square pixel-btn p-0 flex items-center justify-center text-lg font-display hover:bg-accent/20 active:scale-90"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumberInput(null)}
              className="col-span-1 lg:col-span-3 aspect-square lg:aspect-auto pixel-btn p-2 flex items-center justify-center text-xs font-display bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={useHint}
              disabled={hints <= 0 || !selected || isWinner || isPaused}
              className={cn(
                "pixel-btn py-3 px-4 flex items-center justify-between text-[10px] uppercase",
                hints > 0 ? "bg-secondary" : "bg-muted grayscale cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} /> HINT
              </div>
              <span className="font-display px-1.5 py-0.5 bg-black/20 rounded-sm">{hints}</span>
            </button>

            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="pixel-btn py-3 px-4 flex items-center gap-2 text-[10px] uppercase bg-card"
            >
              {isPaused ? <Play size={14} /> : <X size={14} />}
              {isPaused ? "RESUME" : "PAUSE"}
            </button>

            <div className="pixel-panel p-2 bg-background/20">
              <div className="flex items-center gap-2 mb-2 p-1 border-b border-white/10">
                <Settings2 size={12} className="text-muted-foreground" />
                <span className="font-display text-[8px] text-muted-foreground uppercase">Difficulty</span>
              </div>
              <div className="flex flex-col gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => startNewGame(d)}
                    className={cn(
                      "font-display text-[8px] py-1.5 px-3 border-2 transition-all",
                      difficulty === d ? "bg-accent text-background border-white" : "text-muted-foreground border-white/5 hover:border-white/20"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => startNewGame()}
              className="pixel-btn py-3 px-4 flex items-center gap-2 text-[10px] uppercase bg-destructive/80 mt-2"
            >
              <RotateCcw size={14} /> RESET CHAMBER
            </button>
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="pixel-panel p-3 bg-card/30 border-white/5 w-full">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-body text-[10px] text-muted-foreground uppercase">Initial Clue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/40 border border-accent" />
            <span className="font-body text-[10px] text-muted-foreground uppercase">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive/20 border border-destructive" />
            <span className="font-body text-[10px] text-muted-foreground uppercase">Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
