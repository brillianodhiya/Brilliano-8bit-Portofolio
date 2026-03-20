import { useState } from "react";
import { ArrowLeft, FileText, Download, Upload, Type, ShieldCheck, FileSearch } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function WorkshopPDF() {
  const [, navigate] = useLocation();
  const [pdfFile, setPdfFile] = useState<Uint8Array | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  
  const [fileName, setFileName] = useState("neural-manifesto");
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setPdfFile(uint8Array);
      
      const blob = new Blob([uint8Array.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      setIsProcessing(false);
      playButtonSound();
    }
  };

  const addAnnotation = async () => {
    if (!pdfFile || !annotationText) return;

    try {
      setIsProcessing(true);
      playButtonSound();

      const pdfDoc = await PDFDocument.load(pdfFile);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // Add text at a fixed position for now (bottom-right)
      firstPage.drawText(annotationText, {
        x: 50,
        y: height - 100,
        size: 30,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
      });

      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfFile(pdfBytes);
      setPdfUrl(url);
      setAnnotationText("");
    } catch (err) {
      console.error("PDF Annotation Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.download = `${fileName || 'neural-annotated'}.pdf`;
    link.href = pdfUrl.split('#')[0]; // Use the base URL without the hash
    link.click();
    playButtonSound();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-pixel p-4 md:p-10 flex flex-col gap-6">
      <SEO 
        title="Workshop: PDF Editor | Secret Dungeon"
        description="Load and annotate PDF manifestos with high-fidelity neural layers."
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
              <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text text-transparent italic tracking-tighter uppercase leading-none">
                PDF EDITOR
              </h1>
              <p className="text-[8px] text-gray-500 font-display tracking-[0.3em] mt-1">DOC_MANIFEST CONTROL V1.0</p>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Left: Controls */}
        <div className="lg:w-80 flex flex-col gap-6">
           <div className="pixel-panel p-6 bg-black/40 border-white/5 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-emerald-400 font-display text-[10px] tracking-widest border-b border-white/5 pb-4">
                 <ShieldCheck size={14} /> SECURITY CLEARANCE
              </div>

              <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">SIGNAL_NAME</label>
                  <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="manifesto-name"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-mono outline-none focus:border-emerald-500/50"
                  />
              </div>
              
              {!pdfFile ? (
                <label className="w-full h-40 pixel-panel border-dashed border-2 border-emerald-500/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-emerald-500/10 transition-all hover:border-emerald-500/40">
                   <Upload size={32} className="text-emerald-500" />
                   <p className="font-display text-[10px] text-emerald-500 tracking-widest">UPLOAD DOCUMENT</p>
                   <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-6">
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">ADD ANNOTATION LAYER</label>
                      <input 
                        type="text" 
                        value={annotationText}
                        onChange={(e) => setAnnotationText(e.target.value)}
                        placeholder="Neural text to inject..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-sans outline-none focus:border-emerald-500/50"
                      />
                      <button 
                        onClick={addAnnotation}
                        disabled={!annotationText || isProcessing}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-[10px] font-black tracking-widest transition-all mt-2 disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        <Type size={14} /> INJECT TEXT
                      </button>
                   </div>
                   
                   <div className="pt-6 border-t border-white/5">
                      <button 
                        onClick={downloadPDF}
                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-3"
                      >
                        <Download size={16} /> EXPORT_MANIFEST
                      </button>
                      <button 
                        onClick={() => { setPdfFile(null); setPdfUrl(null); }}
                        className="w-full mt-2 text-[8px] text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors font-black"
                      >
                        PURGE CURRENT BUFFER
                      </button>
                   </div>
                </div>
              )}
           </div>

           <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
              <FileSearch size={16} className="text-emerald-500 flex-shrink-0" />
              <p className="text-[8px] text-gray-500 leading-relaxed font-medium uppercase tracking-wider">
                This matrix allows for local neural annotation. Your documents are processed entirely within the neural link; no data is transmitted to external sinks.
              </p>
           </div>
        </div>

        {/* Right: Preview Area */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
           <div className="pixel-panel flex-grow bg-white/5 border-white/5 overflow-hidden flex flex-col p-4 shadow-2xl relative min-h-[50vh]">
              {!pdfUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                   <FileText size={80} className="mb-6" />
                   <p className="font-display text-sm tracking-[0.5em] uppercase">DOCUMENT_VACUUM_EMPTY</p>
                </div>
              ) : (
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full border-none rounded-xl bg-white"
                  title="PDF Preview"
                />
              )}
              
              <div className="absolute top-6 right-6 text-[8px] text-gray-600 font-display tracking-widest uppercase pointer-events-none drop-shadow-lg opacity-40">
                BUFF_00_MANIFEST_PREVIEW
              </div>
           </div>
           
           <div className="flex justify-between items-center text-[8px] text-gray-600 font-black tracking-[0.4em] px-2">
              <span>SECURITY_ENVOY: ACTIVE</span>
              <span>RENDER_ENGINE: PDF-LIB V1.17</span>
           </div>
        </div>
      </div>
    </div>
  );
}
