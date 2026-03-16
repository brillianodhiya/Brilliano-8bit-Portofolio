import { CheckSquare, CircleDashed } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const QUESTS = [
  { id: 1, text: "Build React App", completed: true },
  { id: 2, text: "Slay the CSS Dragon", completed: true },
  { id: 3, text: "Deploy to Production", completed: false },
  { id: 4, text: "Find the hidden easter egg", completed: false },
];

export function QuestTracker() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed top-24 right-4 z-40 hidden md:block w-64">
      <div 
        className="pixel-panel p-0 bg-opacity-90 backdrop-blur-sm cursor-pointer hover:border-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bg-primary p-2 border-b-4 border-white flex justify-between items-center">
          <span className="font-display text-[10px] text-primary-foreground text-shadow-pixel">ACTIVE QUESTS</span>
          <span className="font-display text-[10px] text-primary-foreground">{isOpen ? '▼' : '▲'}</span>
        </div>
        
        {isOpen && (
          <div className="p-3 space-y-3">
            {QUESTS.map((quest) => (
              <div key={quest.id} className="flex items-start gap-2">
                <div className="mt-1">
                  {quest.completed ? (
                    <CheckSquare size={14} className="text-accent" />
                  ) : (
                    <CircleDashed size={14} className="text-muted-foreground animate-spin" style={{animationDuration: '3s'}} />
                  )}
                </div>
                <span className={cn(
                  "font-body text-lg leading-tight",
                  quest.completed ? "text-muted-foreground line-through" : "text-foreground text-shadow-pixel"
                )}>
                  {quest.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
