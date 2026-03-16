import { motion } from "framer-motion";
import { SkillTree } from "@/components/SkillTree";
import { useEffect } from "react";
import { useAchievements } from "@/hooks/use-achievements";

export default function Skills() {
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    unlockAchievement("skill_viewer");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-8"
    >
      <SkillTree />
    </motion.div>
  );
}
