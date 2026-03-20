import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Youtube, Music, Video, Search, ChevronRight, Zap, Globe, Shield, RefreshCcw } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

export default function WorkshopYouTube() {
  const [, navigate] = useLocation();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<{ title: string, author: string, thumbnail: string } | null>(null);
  const [step, setStep] = useState(0);

  const getYTId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const analyzeVideo = async () => {
    const videoId = getYTId(url);
    if (!videoId) return;
    
    setIsAnalyzing(true);
    setMetadata(null);
    setStep(0);
    playButtonSound();

    // Visual sequence
    setStep(1);
    
    try {
      // Pre-set thumbnail from direct YouTube image server
      const defaultMetadata = {
        title: "NEURAL_LINK_ID_" + videoId,
        author: "GLOBAL_SIGNAL",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };

      // Try to get real title via oEmbed
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(oembedUrl)}`);
      const data = await response.json();
      const parsed = JSON.parse(data.contents);
      
      setTimeout(() => setStep(2), 500);
      setTimeout(() => {
        setStep(4);
        setMetadata({
          title: parsed.title || defaultMetadata.title,
          author: parsed.author_name || defaultMetadata.author,
          thumbnail: defaultMetadata.thumbnail
        });
        setIsAnalyzing(false);
      }, 1200);
    } catch (err) {
      // Fallback
      setTimeout(() => {
        setStep(4);
        setMetadata({
          title: "FREQUENCE_FRAGMENT_" + videoId,
          author: "UNIDENTIFIED_SOURCE",
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        });
        setIsAnalyzing(false);
      }, 1000);
    }
  };

  const handleDownload = (format: 'mp3' | 'mp4') => {
    const videoId = getYTId(url);
    if (!videoId) return;

    playButtonSound();
    
    // Redirecting to reliable extraction nodes
    if (format === 'mp3') {
      window.open(`https://www.youtubepp.com/watch?v=${videoId}`, '_blank');
    } else {
      window.open(`https://y2mate.tools/en/youtube-to-mp4?q=${videoId}`, '_blank');
    }
  };

  const analysisSteps = [
    "INTERCEPTING SIGNAL...",
    "EXTRACTING METADATA...",
    "SPECTRAL ANALYZING...",
    "GENERATING DOWNLOAD HASH..."
  ];

  return (
    <div className="min-h-screen bg-[#110505] text-white font-pixel p-4 md:p-10 flex flex-col gap-8">
      <SEO 
        title="Workshop: YT Downloader | Secret Dungeon"
        description="Extract digital fragments from the global signal tower with neural precision."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-red-400 to-red-800 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                SIGNAL EXTRACTOR
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1 uppercase">YT QUANTUM DOWNLINK V1.0</p>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8">
        {/* URL Input Area */}
        <div className="w-full pixel-panel p-8 bg-black/40 border-white/5 flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
           
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                 <Globe size={20} className="animate-pulse" />
              </div>
              <div>
                 <p className="text-[10px] text-gray-500 font-black tracking-widest">GLOBAL FREQUENCY</p>
                 <p className="text-xs font-bold text-red-500/80 uppercase">Enter YouTube Source Locator</p>
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                 <input 
                   type="text" 
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://www.youtube.com/watch?v=..."
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-sans outline-none focus:border-red-500/40 focus:bg-red-500/5 transition-all"
                 />
                 <Youtube className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
              </div>
              <button
                onClick={analyzeVideo}
                disabled={isAnalyzing || !url}
                className="px-8 py-5 bg-red-600 hover:bg-red-500 text-black font-black text-xs tracking-widest rounded-2xl transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-3 active:scale-95 shadow-xl shadow-red-950/20"
              >
                {isAnalyzing ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} />}
                EXTRACT SIGNAL
              </button>
           </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full h-80 relative">
           <AnimatePresence mode="wait">
              {isAnalyzing ? (
                 <motion.div 
                   key="analyzing"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.1 }}
                   className="absolute inset-0 pixel-panel border-dashed border-red-500/20 flex flex-col items-center justify-center p-12 overflow-hidden"
                 >
                    <div className="relative mb-12">
                       <Zap size={64} className="text-red-500 animate-bounce" />
                       <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
                    </div>
                    
                    <div className="w-full max-w-sm space-y-4 text-center">
                       <p className="font-display text-xs text-red-500 tracking-[0.3em] font-black uppercase overflow-hidden whitespace-nowrap border-r-2 border-red-500 animate-typing w-fit mx-auto">
                          {analysisSteps[step - 1] || "INITIALIZING..."}
                       </p>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-red-600 shadow-[0_0_10px_#ef4444]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 4) * 100}%` }}
                          />
                       </div>
                    </div>
                    
                    {/* Background Noise Decal */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-mono text-[8px] leading-tight overflow-hidden p-4">
                       {Array(10).fill(0).map((_, i) => (
                         <div key={i} className="whitespace-nowrap">
                            {Math.random().toString(16).repeat(10)} 
                            EXTRACT_BUFFER_PART_{i}_INIT_VECTOR_LOADED
                            {Math.random().toString(16).repeat(10)}
                         </div>
                       ))}
                    </div>
                 </motion.div>
              ) : metadata ? (
                 <motion.div 
                   key="result"
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                 >
                    <div className="pixel-panel bg-black/80 aspect-video overflow-hidden p-0 relative group">
                       <img src={metadata.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                       <div className="absolute bottom-4 left-4">
                          <p className="text-[10px] text-red-500 font-black tracking-widest bg-black/80 px-2 py-1 inline-block border border-red-500/30">SIGNAL DETECTED</p>
                       </div>
                    </div>

                    <div className="flex flex-col gap-6">
                       <div className="space-y-2">
                          <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">IDENTIFIED SOURCE</p>
                          <h2 className="text-xl font-black text-white leading-tight uppercase line-clamp-2 tracking-tighter italic">{metadata.title}</h2>
                          <p className="text-xs text-red-500/60 font-medium">Transmitted by: {metadata.author}</p>
                       </div>

                       <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => handleDownload('mp3')}
                            className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-black border border-red-600/30 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest group shadow-lg shadow-red-950/20"
                          >
                            <Music size={16} className="group-hover:scale-110 transition-transform" /> 
                            EXTRACT NEURAL AUDIO (MP3)
                          </button>
                          <button 
                            onClick={() => handleDownload('mp4')}
                            className="w-full py-4 bg-white/5 hover:bg-white text-white/50 hover:text-black border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest group"
                          >
                            <Video size={16} className="group-hover:scale-110 transition-transform" /> 
                            EXTRACT VISUAL DATA (MP4)
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-10">
                    <ChevronRight size={64} className="text-white animate-pulse" />
                    <p className="font-display text-sm tracking-[0.5em] uppercase">Awaiting neural anchor...</p>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Security Disclaimer / Footer */}
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-8 px-4 opacity-40">
         <div className="flex items-center gap-4">
            <Shield size={16} className="text-red-500" />
            <p className="text-[8px] text-gray-400 font-black tracking-widest uppercase">END-TO-END NEURAL EXTRACTION // DATA PURGE ACTIVE</p>
         </div>
         <p className="text-[8px] text-gray-600 italic lowercase font-medium">
           "Digital fragments are transient. Respect the creators of the original pulse."
         </p>
      </div>
    </div>
  );
}

