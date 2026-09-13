import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, FileText, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, Briefcase, Award, Cpu } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { usePortfolioData, useProfile, calculateLevel } from "@/hooks/use-portfolio-data";

interface RetroHandheldCvModalProps {
  onClose: () => void;
}

export function RetroHandheldCvModal({ onClose }: RetroHandheldCvModalProps) {
  const [activeTab, setActiveTab] = useState<"PDF" | "RPG">("PDF");
  const [rpgPageIndex, setRpgPageIndex] = useState(0);
  const [powerOn, setPowerOn] = useState(true);

  const { data: profile } = useProfile();
  const { data: expData } = usePortfolioData("experience");
  const { data: skillsData } = usePortfolioData("skills");
  const { data: awardsData } = usePortfolioData("awards");

  const birthDate = profile?.birth_date || "2000-08-24";
  const { level } = calculateLevel(birthDate);

  const cvPdfUrl = `${import.meta.env.BASE_URL}CV_Brilliano_Dhiya_Ulhaq_Developer.pdf`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playButtonSound();
        onClose();
      } else if (e.key === "ArrowLeft") {
        playButtonSound();
        setRpgPageIndex((prev) => (prev - 1 + 4) % 4);
      } else if (e.key === "ArrowRight") {
        playButtonSound();
        setRpgPageIndex((prev) => (prev + 1) % 4);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    playButtonSound();
    const link = document.createElement("a");
    link.href = cvPdfUrl;
    link.download = "CV_Brilliano_Dhiya_Ulhaq_Developer.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextPage = () => {
    playButtonSound();
    setRpgPageIndex((prev) => (prev + 1) % 4);
  };

  const handlePrevPage = () => {
    playButtonSound();
    setRpgPageIndex((prev) => (prev - 1 + 4) % 4);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-y-auto animate-in fade-in duration-200"
      onClick={() => {
        playButtonSound();
        onClose();
      }}
    >
      {/* 8-Bit Retro Top Right Close ESC Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          playButtonSound();
          onClose();
        }}
        className="fixed top-5 right-5 z-[100000] pixel-btn px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-display text-xs flex items-center gap-1.5 border-2 border-white shadow-[4px_4px_0px_#000000] cursor-pointer transition-transform active:translate-y-1"
        title="Close Handheld Console"
      >
        <X size={16} strokeWidth={3} />
        <span>ESC</span>
      </button>

      {/* GAMEBOY HANDHELD CONSOLE SHELL CONTAINER */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg md:max-w-xl bg-gradient-to-b from-indigo-950 via-slate-900 to-zinc-950 p-4 sm:p-6 rounded-[2.5rem] border-4 border-indigo-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col items-center gap-4 border-b-8 my-auto"
      >
        {/* Top Console Brand & Power Indicator */}
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div
              onClick={() => {
                playButtonSound();
                setPowerOn(!powerOn);
              }}
              className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-300 ${
                powerOn
                  ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse border border-emerald-200"
                  : "bg-zinc-700 border border-zinc-500"
              }`}
              title="Toggle Console Power"
            />
            <span className="font-mono text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
              {powerOn ? "POWER // ON" : "POWER // OFF"}
            </span>
          </div>

          <div className="font-display text-xs text-amber-400 text-shadow-pixel tracking-widest uppercase">
            GAME POCKET // CV-8000
          </div>
        </div>

        {/* LCD SCREEN FRAME BEZEL */}
        <div className="relative w-full bg-slate-950 rounded-2xl p-3 sm:p-4 border-4 border-indigo-950 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] flex flex-col items-center">
          {/* LCD Screen Display Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-black rounded-xl border-4 border-zinc-900 overflow-hidden flex flex-col justify-between p-2 sm:p-3 shadow-inner">
            {powerOn ? (
              <>
                {/* Mode Header */}
                <div className="w-full flex items-center justify-between border-b border-white/20 pb-1 z-20">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-300 font-bold">
                    <span>{activeTab === "PDF" ? "PDF PREVIEW MODE" : `HERO CARD [${rpgPageIndex + 1}/4]`}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playButtonSound();
                        setActiveTab("PDF");
                      }}
                      className={`px-2 py-0.5 font-mono text-[8px] rounded border transition-colors cursor-pointer ${
                        activeTab === "PDF"
                          ? "bg-primary text-black font-bold border-white"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => {
                        playButtonSound();
                        setActiveTab("RPG");
                      }}
                      className={`px-2 py-0.5 font-mono text-[8px] rounded border transition-colors cursor-pointer ${
                        activeTab === "RPG"
                          ? "bg-cyan-400 text-black font-bold border-white"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                      }`}
                    >
                      RPG DECK
                    </button>
                  </div>
                </div>

                {/* SCREEN CONTENT DISPLAY AREA */}
                <div className="relative w-full flex-1 my-1.5 overflow-hidden flex flex-col items-center justify-center z-20">
                  {activeTab === "PDF" ? (
                    <div className="w-full h-full relative rounded border border-white/20 overflow-hidden bg-zinc-900">
                      <iframe
                        src={`${cvPdfUrl}#toolbar=0&navpanes=0`}
                        title="CV PDF Preview"
                        className="w-full h-full border-0 bg-white"
                      />
                      <div className="absolute bottom-1 right-1 z-30">
                        <button
                          onClick={handleDownload}
                          className="pixel-btn px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-display text-[8px] flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Download size={10} />
                          <span>SAVE PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* RPG RESUME DECK SCREEN (4 PAGES) */
                    <div className="w-full h-full bg-zinc-950 p-2 sm:p-3 rounded border border-white/20 flex flex-col justify-between overflow-y-auto text-left custom-scrollbar">
                      {rpgPageIndex === 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-primary/40 pb-1">
                            <h4 className="font-display text-xs text-primary uppercase">
                              {profile?.full_name || "BRILLIANO DHIYA ULHAQ"}
                            </h4>
                            <span className="font-mono text-[9px] text-yellow-400 font-bold">LVL {level}</span>
                          </div>
                          <p className="font-mono text-[9px] text-cyan-300">
                            ROLE: Full-Stack Developer / Web Mage
                          </p>
                          <p className="font-mono text-[9px] text-zinc-300 leading-snug">
                            LOCATION: Cikarang / Jakarta, Indonesia
                          </p>
                          <p className="font-mono text-[9px] text-zinc-400 italic bg-zinc-900 p-1.5 rounded border border-zinc-800 mt-1">
                            "{profile?.bio || "Crafting digital experiences with pixel-perfect precision."}"
                          </p>
                          <div className="font-mono text-[8px] text-emerald-400 mt-1">
                            ● CONTACT: brillidhiya@gmail.com
                          </div>
                        </div>
                      )}

                      {rpgPageIndex === 1 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 text-primary font-display text-xs border-b border-primary/40 pb-1">
                            <Briefcase size={12} />
                            <span>QUEST LOG (EXPERIENCE)</span>
                          </div>
                          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                            {(expData || []).slice(0, 3).map((exp: any) => (
                              <div key={exp.id || exp.company} className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                                <div className="font-display text-[9px] text-yellow-300">{exp.position}</div>
                                <div className="font-mono text-[8px] text-zinc-400">@{exp.company} • {exp.period}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {rpgPageIndex === 2 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 text-cyan-400 font-display text-xs border-b border-cyan-500/40 pb-1">
                            <Cpu size={12} />
                            <span>EQUIPPED TECH SPELLS</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(skillsData || []).map((sk: any) => (
                              <span key={sk.id || sk.name} className="font-mono text-[8px] bg-indigo-950 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700">
                                {sk.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rpgPageIndex === 3 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 text-yellow-400 font-display text-xs border-b border-yellow-500/40 pb-1">
                            <Award size={12} />
                            <span>TROPHY & CREDENTIALS</span>
                          </div>
                          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                            {(awardsData || []).slice(0, 3).map((aw: any) => (
                              <div key={aw.id || aw.title} className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                                <div className="font-display text-[9px] text-white">{aw.title}</div>
                                <div className="font-mono text-[8px] text-yellow-400">@{aw.issuer} • {aw.date}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RPG Page Footer Nav */}
                      <div className="flex items-center justify-between border-t border-zinc-800 pt-1 mt-1 text-[8px] font-mono text-zinc-500">
                        <span>USE D-PAD [◄ / ►] TO FLIP</span>
                        <span className="text-primary font-bold">PAGE {rpgPageIndex + 1} OF 4</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CRT Glass Scanlines & Lens Glare Overlay */}
                <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-60" />
                <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-50" />
              </>
            ) : (
              /* POWER OFF SCREEN */
              <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-600 font-mono text-xs">
                <div>[ SCREEN STANDBY ]</div>
                <div className="text-[9px] mt-1 text-zinc-700">CLICK POWER LED TO TURN ON</div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS AREA: D-PAD, ACTION BUTTONS, AND SPEAKER */}
        <div className="w-full flex items-center justify-between px-3 sm:px-6 pt-2">
          {/* Left Side: D-Pad Cross */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            {/* D-Pad Container */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              {/* D-Pad Up */}
              <button
                type="button"
                onClick={handlePrevPage}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-primary text-zinc-300 border-2 border-zinc-600 rounded-t-md shadow-md flex items-center justify-center cursor-pointer transition-colors"
                title="D-Pad Up"
              >
                ▲
              </button>
              {/* D-Pad Down */}
              <button
                type="button"
                onClick={handleNextPage}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-primary text-zinc-300 border-2 border-zinc-600 rounded-b-md shadow-md flex items-center justify-center cursor-pointer transition-colors"
                title="D-Pad Down"
              >
                ▼
              </button>
              {/* D-Pad Left */}
              <button
                type="button"
                onClick={handlePrevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-primary text-zinc-300 border-2 border-zinc-600 rounded-l-md shadow-md flex items-center justify-center cursor-pointer transition-colors"
                title="D-Pad Left (Previous Page)"
              >
                ◄
              </button>
              {/* D-Pad Right */}
              <button
                type="button"
                onClick={handleNextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-primary text-zinc-300 border-2 border-zinc-600 rounded-r-md shadow-md flex items-center justify-center cursor-pointer transition-colors"
                title="D-Pad Right (Next Page)"
              >
                ►
              </button>
              {/* D-Pad Center Cap */}
              <div className="absolute inset-7 sm:inset-8 bg-zinc-900 border border-zinc-700 rounded-sm pointer-events-none" />
            </div>
          </div>

          {/* Right Side: Action Buttons A & B */}
          <div className="flex items-center gap-3 sm:gap-4 -rotate-12">
            {/* Button B */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  playButtonSound();
                  setActiveTab(activeTab === "PDF" ? "RPG" : "PDF");
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border-2 border-indigo-300 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center font-display text-xs cursor-pointer transition-transform"
                title="Button B: Toggle PDF/RPG View"
              >
                B
              </button>
              <span className="font-mono text-[8px] text-indigo-300 font-bold mt-1">MODE</span>
            </div>

            {/* Button A */}
            <div className="flex flex-col items-center -translate-y-3">
              <button
                type="button"
                onClick={handleDownload}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white border-2 border-red-300 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center font-display text-xs cursor-pointer transition-transform"
                title="Button A: Download CV PDF"
              >
                A
              </button>
              <span className="font-mono text-[8px] text-red-300 font-bold mt-1">LOOT</span>
            </div>
          </div>
        </div>

        {/* Bottom Select/Start Buttons & Speaker Grill */}
        <div className="w-full flex items-center justify-between px-6 pt-2 border-t border-indigo-900/60 mt-1">
          {/* Select & Start Pill Buttons */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center -rotate-12">
              <button
                type="button"
                onClick={() => {
                  playButtonSound();
                  setActiveTab("PDF");
                }}
                className="w-8 h-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full shadow-inner cursor-pointer"
                title="SELECT Button"
              />
              <span className="font-mono text-[7px] text-zinc-400 mt-0.5">SELECT</span>
            </div>

            <div className="flex flex-col items-center -rotate-12">
              <button
                type="button"
                onClick={handleDownload}
                className="w-8 h-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full shadow-inner cursor-pointer"
                title="START Button: Download PDF"
              />
              <span className="font-mono text-[7px] text-zinc-400 mt-0.5">START</span>
            </div>
          </div>

          {/* Direct Download PDF Button */}
          <button
            onClick={handleDownload}
            className="pixel-btn px-3 py-1.5 bg-accent text-black hover:bg-yellow-300 font-display text-[9px] flex items-center gap-1.5 border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-transform active:translate-y-0.5"
          >
            <Download size={12} />
            <span>DOWNLOAD CV.PDF</span>
          </button>

          {/* Speaker Grill Lines */}
          <div className="flex gap-1 items-center -rotate-45 opacity-60">
            <div className="w-1 h-6 bg-zinc-950 rounded-full border-r border-zinc-700" />
            <div className="w-1 h-6 bg-zinc-950 rounded-full border-r border-zinc-700" />
            <div className="w-1 h-6 bg-zinc-950 rounded-full border-r border-zinc-700" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
