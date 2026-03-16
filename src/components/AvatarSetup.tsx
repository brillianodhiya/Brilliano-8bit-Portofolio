import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScore } from "@/hooks/use-score";
import { supabase } from "@/lib/supabaseClient";

const UNLOCK_SCORE = 10000;
const SKINS = [
  { id: 'cat', emoji: '🐱', name: 'Cat', idle: '/images/Cat Player/CAT_idle_1.gif', walk: '/images/Cat Player/CAT_walk_1.gif', size: 'w-12 h-12' },
  { id: 'demon', emoji: '😈', name: 'Demon', idle: '/images/Demon/Idle.gif', walk: '/images/Demon/Flying.gif', size: 'w-12 h-12' },
  { id: 'f_knight_1', emoji: '👸', name: 'F-Knight 1', idle: '/images/Female Knight/idle_KG_1.gif', walk: '/images/Female Knight/Walking_KG_1.gif', size: 'w-20 h-20' },
  { id: 'f_knight_2', emoji: '⚔️', name: 'F-Knight 2', idle: '/images/Female Knight 2/Idle_KG_2.gif', walk: '/images/Female Knight 2/Walking_KG_2.gif', size: 'w-20 h-20' },
  { id: 'knight', emoji: '🛡️', name: 'Knight', idle: '/images/Knight/Idle.gif', walk: '/images/Knight/Walk.gif', size: 'w-40 h-40' },
  { id: 'rex', emoji: '🦖', name: 'T-Rex' },
];

export function AvatarSetup() {
  const { score } = useScore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedSkin, setSelectedSkin] = useState(SKINS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(() => !!localStorage.getItem("portfolio_avatar_id"));

  useEffect(() => {
    if (isOpen) {
      setName(localStorage.getItem("portfolio_avatar_name") || "");
      setSelectedSkin(localStorage.getItem("portfolio_avatar_skin") || SKINS[0].id);
    }
  }, [isOpen]);

  const isLocked = score < UNLOCK_SCORE && !hasSaved;

  const handleSave = async () => {
    if (!name || !supabase) return;
    setIsSaving(true);
    const existingId = localStorage.getItem("portfolio_avatar_id");
    
    try {
      let result;
      if (existingId) {
        // Update existing
        result = await supabase
          .from('portfolio_avatars')
          .update({ 
            name, 
            skin: selectedSkin, 
            is_online: true, 
            is_facing_right: true,
            x_pos: Math.floor(Math.random() * 80) + 10 // Reset position on edit
          })
          .eq('id', existingId)
          .select()
          .single();
      } else {
        // Insert new
        result = await supabase
          .from('portfolio_avatars')
          .insert([{ 
            name, 
            skin: selectedSkin, 
            x_pos: Math.floor(Math.random() * 80) + 10, 
            is_online: true,
            is_facing_right: true
          }])
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) throw error;

      if (data) {
        localStorage.setItem("portfolio_avatar_id", data.id);
        localStorage.setItem("portfolio_avatar_name", name);
        localStorage.setItem("portfolio_avatar_skin", selectedSkin);
        
        // Dispatch custom event for instant reactivity in AvatarWorld
        window.dispatchEvent(new Event('portfolio_avatar_updated'));
        
        setHasSaved(true);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Error saving avatar:", err);
      alert("Failed to join world. Check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeave = async () => {
    const existingId = localStorage.getItem("portfolio_avatar_id");
    if (!existingId || !supabase) return;
    
    setIsSaving(true);
    try {
      await supabase
        .from('portfolio_avatars')
        .update({ is_online: false })
        .eq('id', existingId);
        
      localStorage.removeItem("portfolio_avatar_id");
      localStorage.removeItem("portfolio_avatar_name");
      localStorage.removeItem("portfolio_avatar_skin");
      
      window.dispatchEvent(new Event('portfolio_avatar_updated'));
      setHasSaved(false);
      setName("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error leaving world:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 left-4 z-40">
        <button
          onClick={() => !isLocked && setIsOpen(true)}
          disabled={isLocked && !hasSaved}
          className={`pixel-btn px-4 py-2 text-[10px] sm:text-xs min-w-[120px] ${
            isLocked ? "bg-gray-500 opacity-60 cursor-not-allowed" : "bg-accent text-accent-foreground"
          }`}
        >
          {hasSaved ? "EDIT AVATAR" : isLocked ? `🔒 ${score}/${UNLOCK_SCORE}` : "✨ SETUP AVATAR"}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pixel-panel p-6 w-full max-w-md bg-card"
            >
              <h2 className="text-xl mb-4 text-primary text-shadow-pixel">CHARACTER SETUP</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-2 text-muted-foreground uppercase">Hero Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 12))}
                    placeholder="ENTER NAME..."
                    className="w-full bg-background border-4 border-white p-3 font-display text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-muted-foreground uppercase">Choose Skin</label>
                  <div className="flex gap-2 flex-wrap">
                    {SKINS.map((skin) => (
                      <button
                        key={skin.id}
                        onClick={() => setSelectedSkin(skin.id)}
                        className={`p-2 border-4 flex items-center justify-center min-w-[70px] min-h-[70px] transition-all ${
                          selectedSkin === skin.id ? "border-primary bg-primary/20 scale-110" : "border-white/20 bg-background hover:border-white"
                        }`}
                      >
                        {skin.idle ? (
                          <div className="relative">
                            <img 
                              src={`${import.meta.env.BASE_URL}${skin.idle.slice(1)}`} 
                              alt={skin.name} 
                              className={`${skin.size || 'w-12 h-12'} object-contain pixelated relative z-10`}
                            />
                          </div>
                        ) : (
                          <span className="text-2xl">{skin.emoji}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !name}
                    className="pixel-btn flex-1 py-3 disabled:opacity-50 min-w-[140px]"
                  >
                    {isSaving ? "SAVING..." : hasSaved ? "UPDATE HERO" : "JOIN WORLD"}
                  </button>
                  
                  {hasSaved && (
                    <button
                      onClick={handleLeave}
                      disabled={isSaving}
                      className="pixel-btn pixel-btn-destructive flex-1 py-3 disabled:opacity-50 min-w-[140px]"
                    >
                      {isSaving ? "..." : "BATAL JOIN"}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="pixel-btn bg-background text-foreground border-white/40 px-6"
                  >
                    X
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
