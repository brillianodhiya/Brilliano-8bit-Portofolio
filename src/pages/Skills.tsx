import { motion } from "framer-motion";
import { SkillTree } from "@/components/SkillTree";
import { useEffect } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { SEO } from "@/components/SEO";

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
      <SEO 
        title="Skills | Tech Stack" 
        description="The technical skill tree of Brilliano Dhiya Ulhaq, including frontend, backend, and specialized developer tools." 
      />
      <SkillTree />
    </motion.div>
  );
}
