import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Copy, Check, Info, Code2 } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

const DEFAULT_CODE = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`;

const EXAMPLES = [
  { name: "Flowchart", code: DEFAULT_CODE },
  { name: "Sequence", code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!` },
  { name: "State", code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]` }
];

export default function WorkshopMermaid() {
  const [, navigate] = useLocation();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMermaidReady, setIsMermaidReady] = useState(false);

  useEffect(() => {
    // Load Mermaid from CDN for immediate availability
    if ((window as any).mermaid) {
      setIsMermaidReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      (window as any).mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });
      setIsMermaidReady(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup not strictly necessary but good practice
      // document.body.removeChild(script); 
    };
  }, []);

  const renderDiagram = async () => {
    if (!isMermaidReady || !(window as any).mermaid) return;

    try {
      setError(null);
      const { svg: renderedSvg } = await (window as any).mermaid.render('mermaid-svg-' + Date.now(), code);
      setSvg(renderedSvg);
    } catch (err: any) {
      console.error("Mermaid Render Error:", err);
      setError("Syntax error detected in diagram logic.");
      // Mermaid tends to leave error divs in the DOM, we may need to clean them up
      const errorDiv = document.getElementById('dmermaid-svg-' + Date.now());
      if (errorDiv) errorDiv.remove();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 500);
    return () => clearTimeout(timer);
  }, [code, isMermaidReady]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playButtonSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white font-pixel p-4 md:p-10 flex flex-col gap-6">
      <SEO 
        title="Workshop: Mermaid Viewer | Secret Dungeon"
        description="Render complex architectural diagrams and workflows using simple text strings."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-panel px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO DUNGEON
        </button>
        
        <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-4">
           <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none text-shadow-pixel">
                MERMAID VIEW
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1 uppercase">Logic Visualization Node</p>
           </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Editor Area */}
        <div className="flex flex-col gap-4">
          <div className="pixel-panel bg-black/40 p-4 flex flex-col gap-4">
             <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-display text-[10px] tracking-widest">
                   <Code2 size={14} /> SOURCE CONSTRUCT
                </div>
                <div className="flex gap-2">
                   {EXAMPLES.map(ex => (
                     <button
                        key={ex.name}
                        onClick={() => { setCode(ex.code); playButtonSound(); }}
                        className="text-[8px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded transition-all uppercase"
                     >
                       {ex.name}
                     </button>
                   ))}
                </div>
             </div>

             <textarea
               value={code}
               onChange={(e) => setCode(e.target.value)}
               className="w-full h-[50vh] bg-transparent font-mono text-sm p-4 outline-none resize-none spellcheck-false text-emerald-100/80 leading-relaxed"
               placeholder="Enter Mermaid syntax here..."
             />

             <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                  Auto-render active // Logic validation: {error ? 'FAIL' : 'PASS'}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyCode}
                    className="p-2 text-gray-400 hover:text-white transition-all rounded-lg"
                    title="Copy Code"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => { renderDiagram(); playButtonSound(); }}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black tracking-widest transition-all rounded-lg active:scale-95 shadow-lg shadow-emerald-900/20"
                  >
                    <Play size={12} fill="currentColor" /> FORCE RENDER
                  </button>
                </div>
             </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-3">
             <Info size={16} className="text-emerald-400 flex-shrink-0" />
             <p className="text-[9px] text-gray-400 leading-relaxed font-medium">
               Mermaid logic allows for rapid prototyping of systems. Use the tabs above to load templates for flowcharts, sequence diagrams, or state machines.
             </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col gap-4 overflow-hidden">
           <div className="pixel-panel flex-grow bg-white/5 border-white/5 overflow-auto flex items-center justify-center p-8 min-h-[40vh] relative group">
              {error ? (
                <div className="flex flex-col items-center gap-4 text-center">
                   <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                      <Code2 size={32} />
                   </div>
                   <p className="text-red-400 font-display text-xs tracking-widest uppercase">{error}</p>
                   <p className="text-[9px] text-red-500/60 max-w-xs lowercase">Check your syntax capitalization and arrow directions. Mermaid is highly sensitive to line breaks.</p>
                </div>
              ) : svg ? (
                <div 
                  className="w-full h-full flex items-center justify-center overflow-visible [&>svg]:max-w-full [&>svg]:h-auto transition-all duration-500"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="text-gray-600 font-display text-[10px] tracking-[0.5em] animate-pulse">INITIALIZING LOGIC...</div>
              )}
              
              <div className="absolute top-4 right-4 text-[8px] text-gray-600 font-black tracking-widest uppercase pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                 RENDER_TARGET_01
              </div>
           </div>

           <div className="p-4 bg-black/40 border border-white/5 rounded-2xl font-display text-[8px] text-gray-500 flex justify-between items-center opacity-60">
              <span className="tracking-[0.2em] capitalize">Output format: Vector Scalable Graphics (SVG)</span>
              <span className="tracking-[0.2em]">Neural Engine: Mermaid v10.x</span>
           </div>
        </div>
      </div>
    </div>
  );
}
