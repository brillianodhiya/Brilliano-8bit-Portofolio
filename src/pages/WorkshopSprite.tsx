import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Play, Pause, Scissors, Settings, ChevronRight, ChevronLeft, Download, RefreshCcw } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import gifshot from "gifshot";

export default function WorkshopSprite() {
  const [, navigate] = useLocation();
  const [image, setImage] = useState<string | null>(null);
  const [frameWidth, setFrameWidth] = useState(32);
  const [frameHeight, setFrameHeight] = useState(32);
  const [fps, setFps] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        const img = new Image();
        img.onload = () => {
          imgRef.current = img;
          const cols = Math.floor(img.width / frameWidth);
          const rows = Math.floor(img.height / frameHeight);
          setTotalFrames(cols * rows);
          setCurrentFrame(0);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      playButtonSound();
    }
  };

  const exportToGif = () => {
    if (!imgRef.current || totalFrames === 0) return;
    
    setIsExporting(true);
    playButtonSound();

    const img = imgRef.current;
    const cols = Math.floor(img.width / frameWidth);
    const framesData: string[] = [];

    // Create a temporary canvas for capturing frames at native size
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = frameWidth;
    tempCanvas.height = frameHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    for (let i = 0; i < totalFrames; i++) {
      const x = (i % cols) * frameWidth;
      const y = Math.floor(i / cols) * frameHeight;
      
      tempCtx.clearRect(0, 0, frameWidth, frameHeight);
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(img, x, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
      framesData.push(tempCanvas.toDataURL("image/png"));
    }

    gifshot.createGIF({
      images: framesData,
      gifWidth: frameWidth * 4, // Scale up for better visibility
      gifHeight: frameHeight * 4,
      interval: 1 / fps,
      numFrames: totalFrames,
      frameDuration: 1,
      sampleInterval: 10,
    }, (obj: any) => {
      if (!obj.error) {
        const link = document.createElement("a");
        link.download = `neural-sprite-${Date.now()}.gif`;
        link.href = obj.image;
        link.click();
      }
      setIsExporting(false);
    });
  };

  const animate = (time: number) => {
    if (!isPlaying) return;
    
    const delta = time - lastUpdateRef.current;
    if (delta > 1000 / fps) {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
      lastUpdateRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, totalFrames, fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = Math.floor(img.width / frameWidth);
    const x = (currentFrame % cols) * frameWidth;
    const y = Math.floor(currentFrame / cols) * frameHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false; // Keep it pixelated
    ctx.drawImage(img, x, y, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
  }, [currentFrame, frameWidth, frameHeight, image]);

  const updateDimensions = (w: number, h: number) => {
    setFrameWidth(w);
    setFrameHeight(h);
    if (imgRef.current) {
      const cols = Math.floor(imgRef.current.width / w);
      const rows = Math.floor(imgRef.current.height / h);
      setTotalFrames(cols * rows);
      setCurrentFrame(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1a1a] text-white font-pixel p-4 md:p-10 flex flex-col gap-8">
      <SEO 
        title="Workshop: Sprite Cutter | Secret Dungeon"
        description="Slice sprite sheets and preview pixel animations for your next dungeon crawl."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-4 border-l-4 border-orange-500 pl-6">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                SPRITE CUTTER
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1 uppercase">Animation Matrix V1.0</p>
           </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Configuration */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <div className="pixel-panel p-6 bg-black/40 border-white/5 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-orange-400 font-display text-[10px] tracking-widest border-b border-white/5 pb-4">
                 <Settings size={14} /> CONFIGURATION
              </div>
              
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-gray-500 tracking-widest">FRAME SIZE (W x H)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={frameWidth} 
                        onChange={(e) => updateDimensions(parseInt(e.target.value) || 1, frameHeight)}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-xs font-mono"
                      />
                      <input 
                        type="number" 
                        value={frameHeight} 
                        onChange={(e) => updateDimensions(frameWidth, parseInt(e.target.value) || 1)}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-xs font-mono"
                      />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-gray-500 tracking-widest">ANIMATION SPEED (FPS)</label>
                    <input 
                      type="range" 
                      min="1" max="60" 
                      value={fps} 
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                       <span>1 FPS</span>
                       <span className="text-orange-400 font-bold">{fps} FPS</span>
                       <span>60 FPS</span>
                    </div>
                 </div>
              </div>

              <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                 <p className="text-[9px] text-gray-400 leading-relaxed font-medium lowercase">
                   Upload your sprite sheet. The matrix will automatically calculate the frame sequence based on your input dimensions.
                 </p>
              </div>
           </div>

           <label className="pixel-panel p-8 bg-orange-500/10 border-orange-500/20 flex flex-col items-center gap-4 cursor-pointer hover:bg-orange-500/20 transition-all group">
              <Upload size={32} className="text-orange-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                 <p className="font-display text-[10px] text-orange-400 tracking-widest">UPLOAD SPRITE SHEET</p>
                 <p className="text-[8px] text-gray-500 mt-1 uppercase">PNG, JPG or WEBP Supported</p>
              </div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
           </label>
        </div>

        {/* Center: Sprite Sheet View */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="pixel-panel flex-grow bg-black/50 overflow-auto border-white/5 relative p-4 min-h-[40vh] group">
              {image ? (
                <div className="relative inline-block">
                   <img src={image} alt="Sprite sheet" className="max-w-none origin-top-left" style={{ imageRendering: 'pixelated' }} />
                   {/* Grid Overlay */}
                   <div 
                    className="absolute inset-0 pointer-events-none border border-cyan-500/30"
                    style={{ 
                      backgroundSize: `${frameWidth}px ${frameHeight}px`,
                      backgroundImage: 'linear-gradient(to right, rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.1) 1px, transparent 1px)'
                    }}
                   />
                   {/* Current Frame Highlight */}
                   <div 
                    className="absolute border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] z-10 transition-all"
                    style={{
                      width: frameWidth,
                      height: frameHeight,
                      left: (currentFrame % Math.floor((imgRef.current?.width || 1) / frameWidth)) * frameWidth,
                      top: Math.floor(currentFrame / Math.floor((imgRef.current?.width || 1) / frameWidth)) * frameHeight
                    }}
                   />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                   <Scissors size={64} className="mb-4" />
                   <p className="font-display text-xs tracking-[0.5em] uppercase">No active matrix</p>
                </div>
              )}
           </div>

           {/* Animation Preview & Playback */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel aspect-square bg-black/80 flex items-center justify-center overflow-hidden border-orange-500/30">
                 <canvas 
                   ref={canvasRef} 
                   width={128} height={128} 
                   className="w-full h-full object-contain"
                   style={{ imageRendering: 'pixelated' }}
                 />
              </div>

              <div className="md:col-span-2 pixel-panel bg-black/40 p-6 flex flex-col justify-between">
                 <div className="flex items-center justify-between mb-4">
                    <div>
                       <p className="text-[10px] text-gray-500 font-bold tracking-widest">TIMELINE SEQUENCE</p>
                       <p className="text-xl font-black text-orange-400 tracking-tighter">FRAME {currentFrame + 1} / {totalFrames || 0}</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => { playButtonSound(); setCurrentFrame(f => Math.max(0, f - 1)); }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                       >
                         <ChevronLeft size={20} />
                       </button>
                       <button 
                        onClick={() => { setIsPlaying(!isPlaying); playButtonSound(); }}
                        className="px-8 py-3 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition-all flex items-center gap-2"
                       >
                         {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                         <span className="font-display text-[12px] tracking-widest">{isPlaying ? 'STOP' : 'PLAY'}</span>
                       </button>
                       <button 
                        onClick={() => { playButtonSound(); setCurrentFrame(f => (f + 1) % (totalFrames || 1)); }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                       >
                         <ChevronRight size={20} />
                       </button>
                    </div>
                 </div>

                 <div className="w-full h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden p-0.5 relative">
                   <div 
                     className="h-full bg-orange-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                     style={{ width: `${((currentFrame + 1) / (totalFrames || 1)) * 100}%` }}
                   />
                 </div>

                  <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                     <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.3em]">Neural Anim-Core V1.0</p>
                     
                     <div className="flex gap-4">
                        <button 
                          onClick={exportToGif}
                          disabled={isExporting || totalFrames === 0}
                          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/30 rounded-xl text-[9px] font-black tracking-widest flex items-center gap-2 transition-all disabled:opacity-30"
                        >
                          {isExporting ? <RefreshCcw size={14} className="animate-spin" /> : <Download size={14} />}
                          {isExporting ? 'EXTRACTING...' : 'EXTRACT NEURAL GIF'}
                        </button>
                        <div className="flex items-center gap-2 text-[8px] text-orange-500/60 font-black uppercase">
                           <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                           Ready
                        </div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
