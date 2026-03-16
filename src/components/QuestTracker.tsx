import { CheckSquare, CircleDashed, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/use-achievements";

const INITIAL_QUESTS = [
  { id: 1, text: "Build React App", completed: true },
  { id: 2, text: "Slay the CSS Dragon", completed: true },
  { id: 3, text: "Deploy to Production", completed: false },
  { 
    id: 4, 
    text: "Find the hidden easter egg", 
    completed: false,
    subAchievements: ["hidden_persona", "high_scorer", "legendary_hero", "reluctant_hero", "destiny_unavoidable", "music_skip", "dino_click", "dino_rawr"]
  },
];

export function QuestTracker() {
  const [isOpen, setIsOpen] = useState(true);
  const { achievements, subscribe } = useAchievements();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe(() => setTick(t => t + 1));
    return () => { unsubscribe(); };
  }, [subscribe]);

  const getQuestStatus = (quest: any) => {
    if (!quest.subAchievements) return quest.completed;
    return quest.subAchievements.every((id: string) => 
      achievements.find(a => a.id === id)?.unlocked
    );
  };

  return (
    <div className="fixed top-24 right-4 z-40 hidden md:block w-64">
      <div 
        className="pixel-panel p-0 bg-opacity-90 backdrop-blur-sm cursor-pointer hover:border-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bg-primary p-2 border-b-4 border-white flex justify-between items-center">
          <span className="font-display text-[10px] text-primary-foreground text-shadow-pixel uppercase">ACTIVE QUESTS</span>
          <span className="font-display text-[10px] text-primary-foreground">{isOpen ? '▼' : '▲'}</span>
        </div>
        
        {isOpen && (
          <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
            {INITIAL_QUESTS.map((quest) => {
              const isCompleted = getQuestStatus(quest);
              return (
                <div key={quest.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckSquare size={14} className="text-secondary" />
                      ) : (
                        <CircleDashed size={14} className="text-muted-foreground animate-spin" style={{animationDuration: '3s'}} />
                      )}
                    </div>
                    <span className={cn(
                      "font-body text-lg leading-tight",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground text-shadow-pixel"
                    )}>
                      {quest.text}
                    </span>
                  </div>
                  
                  {quest.subAchievements && (
                    <div className="ml-6 space-y-1 border-l-2 border-muted pl-3">
                      {quest.subAchievements.map((achId: string) => {
                        const ach = achievements.find(a => a.id === achId);
                        if (!ach) return null;
                        return (
                          <div key={achId} className="flex items-center gap-2">
                            {ach.unlocked ? (
                              <CheckSquare size={10} className="text-secondary" />
                            ) : (
                              <Circle size={10} className="text-muted-foreground" />
                            )}
                            <span className={cn(
                              "font-body text-sm",
                              ach.unlocked ? "text-muted-foreground line-through" : "text-muted-foreground/80"
                            )}>
                              {ach.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
