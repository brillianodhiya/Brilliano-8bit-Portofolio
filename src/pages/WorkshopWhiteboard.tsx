import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eraser, Pencil, Trash2, Download, MousePointer2 } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

const COLORS = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", 
  "#ff00ff", "#00ffff", "#ffa500", "#800080", "#a52a2a", "#808080"
];

const BRUSH_SIZES = [2, 5, 10, 20];

export default function WorkshopWhiteboard() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Set initial background
    context.fillStyle = "#1a0f0a";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = isEraser ? "#1a0f0a" : color;
    contextRef.current.lineWidth = brushSize;
  }, [color, brushSize, isEraser]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    let offsetX, offsetY;
    if (nativeEvent instanceof MouseEvent) {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      const rect = (nativeEvent.target as HTMLElement).getBoundingClientRect();
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    }

    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    let offsetX, offsetY;
    if (nativeEvent instanceof MouseEvent) {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      const rect = (nativeEvent.target as HTMLElement).getBoundingClientRect();
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    }

    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    playButtonSound();
    context.fillStyle = "#1a0f0a";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playButtonSound();
    const link = document.createElement("a");
    link.download = `dungeon-sketch-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-white font-pixel p-4 md:p-10 flex flex-col gap-6">
      <SEO 
        title="Workshop: Whiteboard | Secret Dungeon"
        description="An infinite drawing canvas for forbidden sketches and ancient diagrams."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-300 to-blue-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                WHITEBOARD
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1">NEURAL SKETCHPAD VER. ALPHA</p>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        {/* Toolbar */}
        <div className="lg:w-24 flex lg:flex-col gap-3">
          <div className="pixel-panel p-2 bg-black/40 flex lg:flex-col gap-2 flex-grow overflow-y-auto max-h-[60vh] lg:max-h-none">
             {COLORS.map((c) => (
               <button
                 key={c}
                 onClick={() => { setColor(c); setIsEraser(false); playButtonSound(); }}
                 className={cn(
                   "w-full aspect-square rounded-sm transition-all transform active:scale-90",
                   color === c && !isEraser ? "ring-2 ring-white scale-110 z-10" : "opacity-80 hover:opacity-100"
                 )}
                 style={{ backgroundColor: c }}
               />
             ))}
          </div>

          <div className="pixel-panel p-2 bg-black/40 flex lg:flex-col gap-2">
            <button
              onClick={() => { setIsEraser(false); playButtonSound(); }}
              className={cn(
                "p-3 rounded-sm transition-all",
                !isEraser ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-gray-500 hover:text-white"
              )}
              title="Pencil"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => { setIsEraser(true); playButtonSound(); }}
              className={cn(
                "p-3 rounded-sm transition-all",
                isEraser ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-gray-500 hover:text-white"
              )}
              title="Eraser"
            >
              <Eraser size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-3 text-gray-500 hover:text-red-400 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow flex flex-col gap-4 min-h-[60vh]">
          <div className="flex items-center justify-between text-[10px] text-gray-500 tracking-widest uppercase font-bold px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2"><MousePointer2 size={10} /> POS: READY</span>
              <span className="flex items-center gap-2 uppercase tracking-[0.2em]">{isEraser ? 'ERASER' : 'PENCIL'} ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
               {BRUSH_SIZES.map(s => (
                 <button 
                  key={s}
                  onClick={() => { setBrushSize(s); playButtonSound(); }}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center border transition-all",
                    brushSize === s ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 hover:border-white/30"
                  )}
                 >
                   <div style={{ width: s/2, height: s/2 }} className="bg-current rounded-full" />
                 </button>
               ))}
            </div>
          </div>

          <div className="flex-grow relative pixel-panel p-0 bg-black/50 border-white/5 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full h-full"
            />
            <div className="absolute top-4 right-4 pointer-events-none opacity-10">
               <div className="text-[60px] font-black italic">SKETCH</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-display text-[8px] text-gray-600 tracking-[0.4em]">ALPHA NEURAL CONSTRUCT V1.0</div>
            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] tracking-widest transition-all rounded-lg active:scale-95"
            >
              <Download size={14} /> EXPORT FRAGMENT (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
