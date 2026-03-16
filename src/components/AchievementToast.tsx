import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";

export function AchievementToast() {
  const { recentUnlock, clearRecent, subscribe } = useAchievements();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, [subscribe]);

  return (
    <AnimatePresence>
      {recentUnlock && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed bottom-24 right-8 z-50 pointer-events-none"
        >
          <div className="pixel-panel flex items-center gap-4 p-4 border-secondary max-w-sm">
            <div className="bg-secondary text-secondary-foreground p-2 rounded-none border-2 border-white">
              <Trophy size={24} className="animate-bounce" />
            </div>
            <div>
              <h4 className="font-display text-xs text-secondary text-shadow-pixel">Achievement Unlocked!</h4>
              <p className="font-body text-xl mt-1">{recentUnlock.title}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
