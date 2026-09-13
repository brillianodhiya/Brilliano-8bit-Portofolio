import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { unlockAchievement } from "@/hooks/use-achievements";

interface Avatar {
  id: string;
  name: string;
  skin: string;
  x_pos: number;
  is_online: boolean;
  is_facing_right?: boolean;
  updated_at: string;
}

const SKIN_ASSETS: Record<string, { 
  emoji?: string, 
  idle?: string, 
  walk?: string,
  random?: string,
  baseFacing?: 'right' | 'left',
  size: string,
  offsetY?: string,
  nameOffset?: string
}> = {
  cat: { 
    idle: '/images/Cat Player/CAT_idle_1.gif',
    walk: '/images/Cat Player/CAT_walk_1.gif',
    baseFacing: 'right',
    size: 'w-12 h-12',
    offsetY: '0px',
    nameOffset: '0px'
  },
  demon: { 
    idle: '/images/Demon/Idle.gif',
    walk: '/images/Demon/Flying.gif',
    random: '/images/Demon/Random.gif',
    baseFacing: 'left',
    size: 'w-12 h-12',
    offsetY: '0px',
    nameOffset: '0px'
  },
  f_knight_1: { 
    idle: '/images/Female Knight/idle_KG_1.gif',
    walk: '/images/Female Knight/Walking_KG_1.gif',
    baseFacing: 'right',
    size: 'w-20 h-20',
    offsetY: '-8px',
    nameOffset: '10px'
  },
  f_knight_2: { 
    idle: '/images/Female Knight 2/Idle_KG_2.gif',
    walk: '/images/Female Knight 2/Walking_KG_2.gif',
    random: '/images/Female Knight 2/Random_Animation.gif',
    baseFacing: 'right',
    size: 'w-20 h-20',
    offsetY: '-8px',
    nameOffset: '10px'
  },
  knight: { 
    idle: '/images/Knight/Idle.gif',
    walk: '/images/Knight/Walk.gif',
    baseFacing: 'right',
    size: 'w-40 h-40',
    offsetY: '-48px',
    nameOffset: '40px'
  },
  rex: { emoji: '🦖', size: 'w-24 h-24', offsetY: '0px', nameOffset: '0px' },
};

// Safe walking bounds (34% to 86%) clear of MusicPlayer at bottom-left (0%-32%)
const MIN_WALK_X = 34;
const MAX_WALK_X = 86;

interface MotionState {
  currentX: number;
  isMoving: boolean;
  isFacingRight: boolean;
  moveDuration: number;
  isAction: boolean;
}

export function AvatarWorld() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [motionStates, setMotionStates] = useState<Record<string, MotionState>>({});
  const [, setMyId] = useState<string | null>(() => localStorage.getItem("portfolio_avatar_id"));
  const activeTimeoutsRef = useRef<Record<string, NodeJS.Timeout[]>>({});

  const fetchAvatars = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('portfolio_avatars')
        .select('*')
        .eq('is_online', true)
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        setAvatars(data);
      }
    } catch (err) {
      console.warn("Could not fetch remote avatars:", err);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem("portfolio_avatar_id");
    setMyId(savedId);
    if (savedId) {
      unlockAchievement("legendary_hero");
    }

    const handleUpdate = () => {
      const newSavedId = localStorage.getItem("portfolio_avatar_id");
      setMyId(newSavedId);
      if (newSavedId) {
        unlockAchievement("legendary_hero");
      }
      fetchAvatars();
    };

    window.addEventListener('portfolio_avatar_updated', handleUpdate);
    fetchAvatars();
    
    if (supabase) {
      const channel = supabase
        .channel('avatar_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'portfolio_avatars' }, 
          () => fetchAvatars()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('portfolio_avatar_updated', handleUpdate);
      };
    }

    return () => {
      window.removeEventListener('portfolio_avatar_updated', handleUpdate);
    };
  }, []);

  // Combine remote DB avatars with saved local avatar (NO fake HERO fallback)
  const savedId = localStorage.getItem("portfolio_avatar_id");
  const localSkin = localStorage.getItem("portfolio_avatar_skin");
  const localName = localStorage.getItem("portfolio_avatar_name");

  const displayAvatars = [...avatars];
  
  if (savedId && localSkin && localName) {
    const existingIndex = displayAvatars.findIndex(a => a.id === savedId);
    if (existingIndex === -1) {
      displayAvatars.unshift({
        id: savedId,
        name: localName,
        skin: localSkin,
        x_pos: 50,
        is_online: true,
        is_facing_right: true,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Reactive motion engine with synchronized GIF state & position slide
  useEffect(() => {
    if (displayAvatars.length === 0) return;

    // Initialize motion state for any avatar starting at its DB x_pos (clamped)
    setMotionStates(prev => {
      const next = { ...prev };
      let updated = false;

      displayAvatars.forEach(avatar => {
        if (!next[avatar.id]) {
          updated = true;
          const initialX = Math.max(MIN_WALK_X, Math.min(MAX_WALK_X, avatar.x_pos || 50));
          next[avatar.id] = {
            currentX: initialX,
            isMoving: false,
            isFacingRight: avatar.is_facing_right ?? true,
            moveDuration: 4000,
            isAction: false,
          };
        }
      });

      return updated ? next : prev;
    });

    // Wandering loop running every 3.5s
    const timer = setInterval(() => {
      displayAvatars.forEach(avatar => {
        setMotionStates(prev => {
          const state = prev[avatar.id];
          if (!state || state.isMoving) return prev; // Skip if currently walking

          // 75% chance to wander to new target
          if (Math.random() < 0.75) {
            const currentX = state.currentX;
            const targetX = Math.floor(Math.random() * (MAX_WALK_X - MIN_WALK_X)) + MIN_WALK_X;
            const distance = Math.abs(targetX - currentX);

            if (distance < 6) return prev;

            const fRight = targetX > currentX;
            const duration = Math.max(3200, Math.min(7500, distance * 110));

            // Step 1: Immediately switch sprite to WALK GIF & flip facing direction
            const startState: MotionState = {
              ...state,
              isMoving: true,
              isFacingRight: fRight,
              moveDuration: duration,
              isAction: false,
            };

            // Step 2: Short 60ms delay before sliding left position (ensures GIF changes FIRST before sliding)
            const t1 = setTimeout(() => {
              setMotionStates(latest => {
                if (!latest[avatar.id]) return latest;
                return {
                  ...latest,
                  [avatar.id]: {
                    ...latest[avatar.id],
                    currentX: targetX,
                  }
                };
              });

              // Sync to DB if this is user's saved avatar
              if (avatar.id === savedId && supabase) {
                supabase
                  .from('portfolio_avatars')
                  .update({ 
                    x_pos: targetX, 
                    is_facing_right: fRight, 
                    updated_at: new Date().toISOString() 
                  })
                  .eq('id', savedId)
                  .then();
              }
            }, 60);

            // Step 3: Only switch BACK to idle AFTER position slide has 100% completed (duration + 150ms)
            const t2 = setTimeout(() => {
              setMotionStates(latest => {
                if (!latest[avatar.id]) return latest;
                return {
                  ...latest,
                  [avatar.id]: {
                    ...latest[avatar.id],
                    isMoving: false,
                  }
                };
              });

              // Random action gesture when standing idle
              if (SKIN_ASSETS[avatar.skin]?.random && Math.random() > 0.4) {
                setMotionStates(latest => {
                  if (!latest[avatar.id]) return latest;
                  return {
                    ...latest,
                    [avatar.id]: {
                      ...latest[avatar.id],
                      isAction: true,
                    }
                  };
                });
                const t3 = setTimeout(() => {
                  setMotionStates(latest => {
                    if (!latest[avatar.id]) return latest;
                    return {
                      ...latest,
                      [avatar.id]: {
                        ...latest[avatar.id],
                        isAction: false,
                      }
                    };
                  });
                }, 2500);
                
                if (!activeTimeoutsRef.current[avatar.id]) activeTimeoutsRef.current[avatar.id] = [];
                activeTimeoutsRef.current[avatar.id].push(t3);
              }
            }, duration + 150);

            if (!activeTimeoutsRef.current[avatar.id]) activeTimeoutsRef.current[avatar.id] = [];
            activeTimeoutsRef.current[avatar.id].push(t1, t2);

            return {
              ...prev,
              [avatar.id]: startState,
            };
          }

          return prev;
        });
      });
    }, 3500);

    return () => {
      clearInterval(timer);
      Object.values(activeTimeoutsRef.current).flatMap(ts => ts).forEach(clearTimeout);
    };
  }, [displayAvatars.map(a => a.id).join(",")]);

  // If no saved avatar and no remote avatars, display nothing (do NOT render fake HERO)
  if (displayAvatars.length === 0) return null;

  return (
    <div className="fixed bottom-[4px] inset-x-0 h-0 z-30 pointer-events-none">
      {displayAvatars.map((avatar) => {
        const isMe = avatar.id === savedId;
        const state = motionStates[avatar.id] || {
          currentX: Math.max(MIN_WALK_X, Math.min(MAX_WALK_X, avatar.x_pos || 50)),
          isMoving: false,
          isFacingRight: true,
          moveDuration: 4000,
          isAction: false,
        };

        const assets = SKIN_ASSETS[avatar.skin] || SKIN_ASSETS.cat;
        const baseFacing = assets.baseFacing || 'right';
        const shouldFlip = (baseFacing === 'right' && !state.isFacingRight) || (baseFacing === 'left' && state.isFacingRight);

        // Synchronized asset selection: ALWAYS use walk GIF while isMoving is true
        const currentAsset = state.isMoving 
          ? (assets.walk || assets.idle) 
          : (state.isAction && assets.random ? assets.random : (assets.idle || assets.walk));

        return (
          <div
            key={avatar.id}
            className="absolute"
            style={{
              left: `${state.currentX}%`,
              bottom: assets.offsetY || '0px',
              transform: 'translateX(-50%)',
              transition: state.isMoving ? `left ${state.moveDuration}ms linear` : 'none',
            }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="bg-black/80 px-2 py-0.5 rounded border border-white/30 mb-1 backdrop-blur-[2px] shadow-md"
                style={{ transform: `translateY(${assets.nameOffset || '0px'})` }}
              >
                <span className="text-[6px] text-white font-display uppercase tracking-widest whitespace-nowrap">
                  {avatar.name || "PLAYER"}
                </span>
              </div>
              {currentAsset ? (
                <img 
                  src={`${import.meta.env.BASE_URL}${currentAsset.slice(1)}`} 
                  className={`${assets.size} object-contain pixelated`}
                  style={{ 
                    transform: shouldFlip ? 'scaleX(-1)' : 'scaleX(1)',
                    filter: isMe ? 'drop-shadow(0 0 8px rgba(0,212,255,0.85))' : 'none',
                    imageRendering: 'pixelated'
                  }}
                  alt={avatar.skin}
                />
              ) : (
                <div className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                  {assets.emoji || '👤'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
