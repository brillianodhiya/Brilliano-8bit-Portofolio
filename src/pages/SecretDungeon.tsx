import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Youtube, Wrench, Gamepad2, Dice6, Lock, ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { playButtonSound } from "@/lib/audio";
import { useAchievements } from "@/hooks/use-achievements";
import { SEO } from "@/components/SEO";
import { useLocation } from "wouter";

const YOUTUBE_CHANNELS = [
  { name: "Pyroseus", url: "https://www.youtube.com/@pyroseus", desc: "Deep dives into fascinating topics", icon: "https://yt3.googleusercontent.com/s_Y67lCkWjNpAuvmb-sdDaSCEanEqRvlodmIjyXyIierG53sZlF3_6fMUnfGl__HvrWQ5-bykQ=s160-c-k-c0x00ffffff-no-rj" },
  { name: "Windah Basudara", url: "https://www.youtube.com/@WindahBasudara", desc: "Gaming & entertainment legend", icon: "https://yt3.googleusercontent.com/ZM0JpQTkJn-wJ3OfOD_TLFPnI-uno1QrWz20JH_FBtWK1oUCq032OkHIHO4Rr27ul_czy8g6Xw=s160-c-k-c0x00ffffff-no-rj" },
  { name: "Dunia Alam", url: "https://www.youtube.com/@Dunia_Alam", desc: "Exploring the wonders of nature", icon: "https://yt3.googleusercontent.com/zOWCoAVPooIkU1xaeq5kehrPB9nUDek61Qy-3gTBDoczliryW30UIBC0yG7mJ6Nj5JSjll6Mgg=s160-c-k-c0x00ffffff-no-rj" },
  { name: "Belajar Dunia Purba", url: "https://www.youtube.com/@BelajarDuniaPurba", desc: "Journey into the prehistoric world", icon: "https://yt3.googleusercontent.com/ln6IaoBPZ5DLCMlrN3W-8aAZTNNfKcvx1M8auHw8eqoZFrNXdMhPe7wk2IZTmjs7tVq2q4SCl1o=s160-c-k-c0x00ffffff-no-rj" },
  { name: "Dea Afrizal", url: "https://www.youtube.com/@deaafrizal", desc: "Tech reviews & digital lifestyle", icon: "https://yt3.googleusercontent.com/cKwv2BRMNSuGr6TUtEDqqdcY59bRfbrMHK86BAoadMD1R5LRzG4O-6A5MplEhyqAIxXdV9yh=s160-c-k-c0x00ffffff-no-rj" },
  { name: "Fireship", url: "https://www.youtube.com/@Fireship", desc: "Fast-paced tech news & tutorials", icon: "https://yt3.googleusercontent.com/3fPNbkf_xPyCleq77ZhcxyeorY97NtMHVNUbaAON_RBDH9ydL4hJkjxC8x_4mpuopkB8oI7Ct6Y=s160-c-k-c0x00ffffff-no-rj" },
];

interface DungeonRoom {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  locked: boolean;
  content?: React.ReactNode;
}

export default function SecretDungeon() {
  const { isKanrishaurus } = useTheme();
  const { unlockAchievement } = useAchievements();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Automatically unlock the achievement when visiting the secret dungeon
    unlockAchievement("secret_dungeon");
  }, [unlockAchievement]);

  const rooms: DungeonRoom[] = [
    {
      id: "signal-tower",
      title: "SIGNAL TOWER",
      subtitle: "Channels that transmit forbidden knowledge",
      icon: <Youtube size={28} />,
      color: "text-red-400",
      border: "border-red-500",
      locked: false,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {YOUTUBE_CHANNELS.map((ch) => (
            <a
              key={ch.name}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playButtonSound}
              className="pixel-panel p-3 flex items-center gap-3 hover:border-red-400 transition-colors group bg-card/50"
            >
              <img src={ch.icon} alt={ch.name} className="w-10 h-10 flex-shrink-0 rounded-sm border-2 border-white/20 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-[9px] text-red-400 flex items-center gap-1 group-hover:text-red-300 transition-colors truncate">
                  {ch.name}
                  <ExternalLink size={9} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-body text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-2">{ch.desc}</p>
              </div>
            </a>
          ))}
        </div>
      ),
    },

    {
      id: "arcade",
      title: "ARCADE",
      subtitle: "Challenge ancient machines",
      icon: <Gamepad2 size={28} />,
      color: "text-green-400",
      border: "border-green-500",
      locked: false,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {[
            { id: 'tetris', name: 'TETRIS', icon: '🧱', desc: 'Classic block puzzle', path: '/arcade/tetris' },
            { id: 'sudoku', name: 'SUDOKU', icon: '🔢', desc: 'Logic-based numbers', path: '/arcade/sudoku' },
            { id: 'snake', name: 'SNAKE', icon: '🐍', desc: 'Retro snake eater', path: '/arcade/snake' },
            { id: 'bubble', name: 'BUBBLE BLAST', icon: '🫧', desc: 'Pop the colorful bubbles', path: '/arcade/bubble' },
            { id: 'match3', name: 'CANDY MATCH', icon: '🍬', desc: 'Sweet matching puzzle', path: '/arcade/match3', comingSoon: true },
            { id: 'shooter', name: 'SPACE SHOOTER', icon: '🚀', desc: 'Galactic combat', path: '/arcade/shooter', comingSoon: true },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => { if (!game.comingSoon) { navigate(game.path); playButtonSound(); } }}
              className={cn(
                "pixel-panel p-3 flex flex-col items-center text-center gap-2 transition-all group",
                game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-green-400 hover:bg-green-400/5 cursor-pointer"
              )}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{game.icon}</span>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-green-400">{game.name}</span>
                <span className="font-body text-[10px] text-muted-foreground leading-tight">{game.desc}</span>
              </div>
              {game.comingSoon && (
                <div className="font-display text-[6px] bg-muted/20 px-2 py-0.5 mt-1 border border-white/10 uppercase">
                  Coming Soon
                </div>
              )}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "workshop",
      title: "WORKSHOP",
      subtitle: "Ancient craftsman tools",
      icon: <Wrench size={28} />,
      color: "text-blue-400",
      border: "border-blue-500",
      locked: false,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {[
            { id: 'yt', name: 'YT DOWNLOADER', icon: '📥', desc: 'YouTube to MP3/Video', path: '/workshop/youtube' },
            { id: 'board', name: 'WHITEBOARD', icon: '🎨', desc: 'Infinite drawing canvas', path: '/workshop/whiteboard' },
            { id: 'color', name: 'COLOR PALETTE', icon: '🌈', desc: 'Design inspiration', path: '/workshop/color' },
            { id: 'mermaid', name: 'MERMAID VIEW', icon: '📊', desc: 'Diagram renderer', path: '/workshop/mermaid' },
            { id: 'bg', name: 'BG REMOVER', icon: '🖼️', desc: 'Remove image background', path: '/workshop/bg-remover' },
            { id: 'sprite', name: 'SPRITE CUTTER', icon: '✂️', desc: 'Sprite to GIF animator', path: '/workshop/sprite' },
            { id: 'pdf', name: 'PDF EDITOR', icon: '📄', desc: 'Edit and annotate PDFs', path: '/workshop/pdf' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => { navigate(tool.path); playButtonSound(); }}
              className="pixel-panel p-3 flex flex-col items-center text-center gap-2 transition-all group hover:border-blue-400 hover:bg-blue-400/5 cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{tool.icon}</span>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-blue-400">{tool.name}</span>
                <span className="font-body text-[10px] text-muted-foreground leading-tight">{tool.desc}</span>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "summon-gate",
      title: "SUMMON GATE",
      subtitle: "Roll the cosmic dice",
      icon: <Dice6 size={28} />,
      color: "text-purple-400",
      border: "border-purple-500",
      locked: false,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {[
            { id: 'uma', name: 'UMA MUSUME', icon: '🐎', desc: 'Summon legendary horse girls', path: '/summon/uma' },
            { id: 'girls', name: 'ANIME GIRLS', icon: '✨', desc: 'Summon beautiful anime girls', path: '/summon/girls' },
            { id: 'boys', name: 'ANIME BOYS', icon: '🔥', desc: 'Summon cool anime boys', path: '/summon/boys' },
            { id: 'collection', name: 'COLLECTION', icon: '🗃️', desc: 'View your neural inventory', path: '/secret-dungeon/collection' },
          ].map((summon) => (
            <button
              key={summon.id}
              onClick={() => { navigate(summon.path); playButtonSound(); }}
              className="pixel-panel p-4 flex flex-col items-center text-center gap-3 transition-all group hover:border-purple-400 hover:bg-purple-400/5 cursor-pointer"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">{summon.icon}</span>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-purple-400">{summon.name}</span>
                <span className="font-body text-[10px] text-muted-foreground leading-tight">{summon.desc}</span>
              </div>
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12"
    >
      <SEO
        title="Secret Dungeon | Hidden Chamber"
        description="You've discovered the secret dungeon! Explore hidden rooms filled with inspiration, tools, games, and gacha."
      />

      {/* Back button */}
      <button
        onClick={() => { navigate("/hub"); playButtonSound(); }}
        className="pixel-btn py-2 px-4 self-start flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={14} /> ESCAPE DUNGEON
      </button>

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-block mb-4"
        >
          <div className="pixel-panel p-4 bg-background/50 border-accent animate-pulse">
            <span className="text-4xl">🏰</span>
          </div>
        </motion.div>

        <h1 className={cn(
          "font-display text-3xl md:text-5xl text-shadow-pixel mb-3 flex items-center justify-center gap-3",
          isKanrishaurus ? "text-red-500" : "text-accent"
        )}>
          <Sparkles className="text-yellow-400" />
          {isKanrishaurus ? "FORBIDDEN CHAMBER" : "SECRET DUNGEON"}
          <Sparkles className="text-yellow-400" />
        </h1>

        <p className="font-body text-2xl text-muted-foreground italic">
          {isKanrishaurus
            ? "You dare enter the inner sanctum..."
            : "You've discovered a hidden passage! Explore the dungeon rooms below."}
        </p>

        <div className="font-display text-[8px] text-accent bg-accent/10 border border-accent/30 inline-block px-4 py-1 mt-4">
          🏆 ACHIEVEMENT UNLOCKED: SECRET DUNGEON DISCOVERED
        </div>
      </div>

      {/* Dungeon rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ 
              scale: 1.02, 
              rotateX: room.id === 'arcade' || room.id === 'signal-tower' ? 0.5 : 1, 
              rotateY: room.id === 'arcade' || room.id === 'signal-tower' ? 0.5 : 1,
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className={cn(
              "pixel-panel p-0 overflow-hidden flex flex-col transition-shadow hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]",
              room.locked && "opacity-60 grayscale cursor-not-allowed",
              !room.locked && (room.id === 'signal-tower' || room.id === 'arcade') && "md:col-span-2"
            )}
          >
            {/* Room header */}
            <div className={cn(
              "p-5 border-b-4 flex items-center justify-between",
              room.locked ? "border-gray-600" : "border-white",
              room.locked ? "bg-muted/20" : "bg-card/50"
            )}>
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ rotate: -10 }}
                  whileHover={{ rotate: 10 }}
                  className={cn(
                    "w-12 h-12 pixel-panel flex items-center justify-center shadow-lg",
                    room.locked ? "text-gray-500 border-gray-600" : room.color
                  )}
                >
                  {room.locked ? <Lock size={20} /> : room.icon}
                </motion.div>
                <div>
                  <h3 className={cn(
                    "font-display text-sm text-shadow-pixel tracking-widest",
                    room.locked ? "text-gray-500" : room.color
                  )}>
                    {room.title}
                  </h3>
                  <p className="font-body text-base text-muted-foreground italic">
                    {room.subtitle}
                  </p>
                </div>
              </div>
              {!room.locked && <Sparkles className="text-yellow-400 opacity-20 group-hover:opacity-100 transition-opacity" size={16} />}
            </div>

            {/* Room content */}
            <div className="p-4 flex-grow relative">
              {room.locked ? (
                <div className="h-32 flex flex-col items-center justify-center gap-3">
                  <Lock size={24} className="text-gray-600 opacity-20" />
                  <div className="font-display text-[8px] text-gray-500 border border-gray-600/30 px-3 py-1">
                    COMING SOON — UNDER CONSTRUCTION
                  </div>
                </div>
              ) : (
                <motion.div
                   drag={room.id === 'arcade' || room.id === 'workshop' ? "x" : false}
                   dragConstraints={{ left: -100, right: 100 }}
                   dragElastic={0.1}
                   className="cursor-grab active:cursor-grabbing"
                >
                   {room.content}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="text-center mt-8">
        <div className="inline-block pixel-panel border-accent p-4 animate-bounce">
          <p className="font-display text-[10px] text-accent">
            NEW ROOMS ARE BEING EXCAVATED... STAY TUNED!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
