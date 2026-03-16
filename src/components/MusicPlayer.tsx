import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { usePortfolioData } from '@/hooks/use-portfolio-data';

export function MusicPlayer() {
  const { data: playlist } = usePortfolioData('playlist');
  const [location] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [vData, setVData] = useState<number[]>(new Array(12).fill(2));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<any>(null);
  const audioCtxRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  const currentTrack = playlist?.[currentIndex];

  // Sync ref with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Track state change effect - Ensure actual audio element follows isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle track changes
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  // Initialize Audio Engine once
  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current || !playlist) return;

    try {
      const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioCtxClass();
      const analyzer = audioCtx.createAnalyser();
      const gainNode = audioCtx.createGain();
      const source = audioCtx.createMediaElementSource(audioRef.current);
      
      source.connect(analyzer);
      analyzer.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      analyzer.fftSize = 64;
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      
      analyzerRef.current = analyzer;
      gainNodeRef.current = gainNode;
      sourceRef.current = source;
      audioCtxRef.current = audioCtx;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (analyzerRef.current) {
          if (isPlayingRef.current) {
            analyzerRef.current.getByteFrequencyData(dataArray);
            const samples = Array.from(dataArray.slice(0, 12)).map(v => Math.max(2, (v / 255) * 14));
            setVData(samples);
          } else {
            setVData(prev => prev.map(v => Math.max(2, v * 0.85))); // Decay in JS
          }
        }
        animationRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();

      return () => {
        // We don't close the context on playlist change anymore to avoid recreation errors
        // Cleanup visuals only
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    } catch (err) {
      console.warn('AudioContext failed:', err);
    }
  }, [playlist]); // Still depends on playlist to start when data arrives, but guarded by audioCtxRef

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.01);
    }
  }, [volume]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getRandomIndex = () => {
    if (!playlist || playlist.length <= 1) return currentIndex;
    let newIndex = currentIndex;
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * playlist.length);
    }
    return newIndex;
  };

  const nextTrack = () => {
    if (!playlist) return;
    let nextIndex;
    if (isShuffle) {
      nextIndex = getRandomIndex();
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!playlist) return;
    let prevIndex;
    if (isShuffle) {
      prevIndex = getRandomIndex();
    } else {
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (repeatMode === 'all') {
      nextTrack();
    } else {
      // none: stop if it's the last track
      if (currentIndex < playlist!.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Listen for global start event (from Splash screen)
  useEffect(() => {
    const handleStartEvent = async () => {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      setIsPlaying(true);
    };

    window.addEventListener('portfolio-start', handleStartEvent);
    return () => window.removeEventListener('portfolio-start', handleStartEvent);
  }, []);

  if (!playlist || playlist.length === 0) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.url ? `${import.meta.env.BASE_URL}${currentTrack.url.replace(/^\//, '')}` : ''}
        onEnded={handleEnded}
      />
      
      {location !== '/' && (
        <div className="fixed bottom-4 left-4 z-50">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pixel-panel p-2 flex items-center gap-3 bg-card/90 backdrop-blur-sm min-w-[280px] max-w-[320px]"
          >
            {/* Track Art / Icon */}
            <div className="relative w-10 h-10 border-2 border-white bg-black flex items-center justify-center overflow-hidden shrink-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentTrack?.id}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  src={currentTrack?.cover_url ? `${import.meta.env.BASE_URL}${currentTrack.cover_url.replace(/^\//, '')}` : ''}
                  className={cn("w-full h-full object-cover rendering-pixelated", isPlaying && "animate-[spin_8s_linear_infinite]")}
                />
              </AnimatePresence>
              {!currentTrack?.cover_url && <Music size={16} className="text-primary" />}
              <div className="absolute inset-0 border-2 border-black/20 pointer-events-none" />
            </div>

            {/* Info & Controls */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {/* Marquee Title */}
              <div className="overflow-hidden whitespace-nowrap bg-black/60 border border-white/10 px-1 py-0.5 h-5 flex items-center">
                <motion.div
                  animate={{ x: [0, -400] }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="font-display text-[8px] text-primary inline-block uppercase tracking-tighter"
                >
                  NOW PLAYING: {currentTrack?.title} • {currentTrack?.title} • {currentTrack?.title} • 
                </motion.div>
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={cn("p-0.5 transition-all outline-none", isShuffle ? "text-primary" : "text-muted-foreground hover:text-white")}
                    title="Shuffle"
                  >
                    <Shuffle size={10} />
                  </button>

                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={prevTrack}
                      className="p-0.5 hover:text-primary active:translate-y-0.5 transition-all outline-none"
                    >
                      <SkipBack size={12} fill="currentColor" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="pixel-btn bg-primary p-0.5 text-white border-2 border-white scale-75"
                    >
                      {isPlaying ? <Pause size={10} fill="white" /> : <Play size={10} fill="white" className="ml-0.5" />}
                    </button>
                    <button 
                      onClick={nextTrack}
                      className="p-0.5 hover:text-primary active:translate-y-0.5 transition-all outline-none"
                    >
                      <SkipForward size={12} fill="currentColor" />
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      if (repeatMode === 'none') setRepeatMode('all');
                      else if (repeatMode === 'all') setRepeatMode('one');
                      else setRepeatMode('none');
                    }}
                    className={cn("p-0.5 transition-all outline-none", repeatMode !== 'none' ? "text-primary" : "text-muted-foreground hover:text-white")}
                    title={`Repeat: ${repeatMode}`}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={10} /> : <Repeat size={10} />}
                  </button>
                </div>

                {/* REAL RECTIVE VISUALIZER (Widened) */}
                <div className="flex items-end gap-[1px] h-4 px-1.5 flex-1 justify-center opacity-90 overflow-hidden bg-black/20 py-0.5">
                  {vData.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 bg-accent/80 min-h-[1px] transition-[height] duration-75 ease-linear shadow-[0_0_4px_rgba(0,255,255,0.2)]"
                    />
                  ))}
                </div>

                {/* Volume Icon */}
                <div className="group relative shrink-0">
                  <Volume2 size={12} className="text-muted-foreground hover:text-white cursor-pointer" />
                  {/* Bridge container to fix hover gap */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 hidden group-hover:block z-50">
                    <div className="p-1.5 bg-black border-2 border-white pixel-corners shadow-xl">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 accent-primary cursor-pointer rotate-[270deg] origin-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Retro Details */}
            <div className="absolute top-1 right-1 flex gap-1">
              <div className={cn("w-1 h-1 rounded-full", isPlaying ? "bg-green-500 animate-pulse outline outline-1 outline-green-500/50" : "bg-red-500 opacity-50")} />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
