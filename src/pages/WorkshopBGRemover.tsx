import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Scissors, Download, RefreshCcw, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { removeBackground } from "@imgly/background-removal";

export default function WorkshopBGRemover() {
  const [, navigate] = useLocation();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setProcessedImage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      playButtonSound();
    }
  };

  const processImage = async () => {
    if (!originalImage) return;

    try {
      setIsProcessing(true);
      setError(null);
      playButtonSound();

      const result = await (removeBackground as any)(originalImage, {
        progress: (_key: string, current: number, total: number) => {
          const p = Math.round((current / total) * 100);
          setProgress(p);
        },
        model: 'medium', // Balance between speed and quality
      });

      const url = URL.createObjectURL(result);
      setProcessedImage(url);
    } catch (err: any) {
      console.error("BG Removal Error:", err);
      setError("Failed to process neural extraction. Ensure the image is valid.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = `neural-extract-${Date.now()}.png`;
    link.href = processedImage;
    link.click();
    playButtonSound();
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-pixel p-4 md:p-10 flex flex-col gap-8">
      <SEO 
        title="Workshop: BG Remover | Secret Dungeon"
        description="High-fidelity neural background extraction for your digital assets."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-4 border-l-4 border-pink-500 pl-6">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-300 to-pink-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                BG REMOVER
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1 uppercase">Neural Extraction Matrix V1.0</p>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto w-full">
         {!originalImage ? (
           <motion.label 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-80 pixel-panel border-dashed border-2 border-pink-500/20 bg-pink-500/5 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-pink-500/10 transition-all hover:border-pink-500/40 group"
           >
              <div className="p-6 bg-pink-500/10 rounded-full group-hover:scale-110 transition-transform">
                <Upload size={48} className="text-pink-400" />
              </div>
              <div className="text-center">
                 <p className="font-display text-base text-pink-400 tracking-[0.3em]">UPLOAD SOURCE IMAGE</p>
                 <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest font-bold">PNG, JPG, or WEBP (Max 5MB Recommended)</p>
              </div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
           </motion.label>
         ) : (
           <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Original Preview */}
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between text-[10px] text-gray-500 font-black tracking-widest">
                    <span className="flex items-center gap-2"><ImageIcon size={12} /> SCAN_SOURCE_01</span>
                    <button onClick={() => setOriginalImage(null)} className="hover:text-pink-400 transition-colors uppercase">REPLACE</button>
                 </div>
                 <div className="pixel-panel flex-grow aspect-square bg-white/5 border-white/5 overflow-hidden p-0 relative group">
                    <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <span className="font-display text-[10px] tracking-widest bg-black px-4 py-2 border border-white/10 italic">ORIGINAL DATA</span>
                    </div>
                 </div>
              </div>

              {/* Extraction Result */}
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between text-[10px] text-gray-500 font-black tracking-widest">
                    <span className={cn(
                      "flex items-center gap-2",
                      processedImage ? "text-pink-400" : "text-gray-600"
                    )}>
                      {processedImage ? <CheckCircle2 size={12} /> : <Scissors size={12} />} 
                      {processedImage ? 'EXTRACTION_READY' : 'EXTRACTION_IDLE'}
                    </span>
                    {processedImage && (
                       <button onClick={downloadResult} className="text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors uppercase">
                        <Download size={10} /> EXPORT
                       </button>
                    )}
                 </div>
                 <div className={cn(
                   "pixel-panel flex-grow aspect-square transition-all relative overflow-hidden",
                   processedImage ? "bg-[#111] bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]" : "bg-black/40 border-dashed border-white/5"
                 )}>
                    {isProcessing ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center">
                         <div className="relative">
                            <RefreshCcw className="animate-spin text-pink-500" size={64} />
                            <div className="absolute inset-1 border-4 border-pink-500/20 rounded-full" />
                         </div>
                         <div className="space-y-4 w-full max-w-xs">
                            <div className="flex justify-between font-display text-[9px] text-pink-500 tracking-widest">
                               <span>NEURAL EXTRACTION</span>
                               <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-pink-500/10 rounded-full overflow-hidden border border-pink-500/20">
                               <motion.div 
                                className="h-full bg-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                               />
                            </div>
                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.3em]">Downloading model & processing pixels...</p>
                         </div>
                      </div>
                    ) : processedImage ? (
                      <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="w-full h-full object-contain animate-in fade-in zoom-in duration-500" 
                      />
                    ) : error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
                         <AlertCircle className="text-red-500" size={48} />
                         <p className="text-red-400 font-display text-xs tracking-widest uppercase">{error}</p>
                         <button 
                          onClick={processImage}
                          className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                         >
                           RETRY EXTRACTION
                         </button>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                         <button 
                          onClick={processImage}
                          className="px-12 py-5 bg-pink-600 hover:bg-pink-500 text-black font-display font-black text-xs tracking-widest rounded-3xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-950/20 flex items-center gap-3 group"
                         >
                           <Scissors size={18} className="group-hover:rotate-12 transition-transform" />
                           NEURAL EXTRACT
                         </button>
                         <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.4em]">INITIATE MATRIX DE-LAYERING</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* Footer Details */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full opacity-60">
        <div className="flex items-center gap-6">
           <div className="text-[8px] text-gray-600 tracking-[0.5em] font-bold uppercase">
             ALGORITHM: IMG-LY NEURAL V2 // {new Date().toLocaleTimeString()}
           </div>
        </div>
        <p className="text-[8px] text-gray-500 font-medium italic lowercase leading-none">
          "The matrix separates subject from void using high-fidelity edge calculations."
        </p>
      </div>
    </div>
  );
}
