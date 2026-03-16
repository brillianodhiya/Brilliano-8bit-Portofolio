import { useState, useEffect } from "react";
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

export function AvatarWorld() {
  const [avatars, setAvatars] = useState<(Avatar & { prevX?: number, isFacingRight?: boolean, isAction?: boolean })[]>([]);
  const [localX, setLocalX] = useState<number | null>(null);
  const [localFacingRight, setLocalFacingRight] = useState(true);
  const [localAction, setLocalAction] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [myId, setMyId] = useState(() => localStorage.getItem("portfolio_avatar_id"));

  const fetchAvatars = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('portfolio_avatars')
      .select('*')
      .eq('is_online', true)
      .order('updated_at', { ascending: false })
      .limit(20);
    
    if (data) setAvatars(data);
  };

  // Watch for local updates via custom event
  useEffect(() => {
    // Check for existing avatar to unlock achievement
    const existingId = localStorage.getItem("portfolio_avatar_id");
    if (existingId) {
      unlockAchievement("legendary_hero");
    }

    const handleUpdate = () => {
      const newMyId = localStorage.getItem("portfolio_avatar_id");
      if (newMyId) {
        unlockAchievement("legendary_hero");
      }
      setMyId(newMyId);
      fetchAvatars();
    };

    window.addEventListener('portfolio_avatar_updated', handleUpdate);
    fetchAvatars();
    
    if (!supabase) return;

    const channel = supabase
      .channel('avatar_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'portfolio_avatars' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updated = payload.new as Avatar;
            setAvatars(prev => {
              const existing = prev.find(a => a.id === updated.id);
              
              // Only update prevX if position actually changed
              // This prevents idle animation during heartbeats while still sliding
              const hasMoved = existing && existing.x_pos !== updated.x_pos;
              const prevX = hasMoved ? existing.x_pos : (existing?.prevX ?? updated.x_pos);
              
              const withMeta = { 
                ...updated, 
                prevX: prevX,
                isFacingRight: updated.is_facing_right ?? existing?.is_facing_right ?? true
              };
              if (existing) return prev.map(a => a.id === updated.id ? withMeta : a);
              return [...prev, withMeta];
            });
          } else if (payload.eventType === 'DELETE') {
            setAvatars(prev => prev.filter(a => a.id !== (payload.old as Avatar).id));
          } else {
            fetchAvatars();
          }
        }
      )
      .subscribe();

    // Random Wander Logic for local player
    const wander = async () => {
      if (!myId || !supabase) return;
      
      const newX = Math.floor(Math.random() * 80) + 10;
      const fRight = newX > (localX ?? 50);
      setLocalFacingRight(fRight);
      
      // Sync direction change immediately before movement
      if (supabase) {
        await supabase
          .from('portfolio_avatars')
          .update({ is_facing_right: fRight, updated_at: new Date().toISOString() })
          .eq('id', myId);
      }

      // Small delay before moving to ensure flip happens first visually
      setTimeout(async () => {
        setLocalX(newX);
        setIsMoving(true);

        if (supabase) {
          await supabase
            .from('portfolio_avatars')
            .update({ 
              x_pos: newX, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', myId);
        }
      }, 100);
        
      // Stop moving after transition duration (approx 7.5s)
      setTimeout(() => setIsMoving(false), 7500);
      
      // Random action chance while idle
      const scheduleAction = () => {
        const skin = localStorage.getItem("portfolio_avatar_skin");
        if (skin && SKIN_ASSETS[skin]?.random && Math.random() > 0.5) {
          setLocalAction(true);
          setTimeout(() => setLocalAction(false), 3000); // Actions usually last ~3s
        }
      };
      
      const actionDelay = 1000 + Math.random() * 5000;
      setTimeout(scheduleAction, actionDelay);
      
      // Schedule next walk with random delay (15-40s) for a more realistic feel
      setTimeout(wander, 15000 + Math.random() * 25000);
    };

    const timeoutIdx = setTimeout(wander, 3000);

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('portfolio_avatar_updated', handleUpdate);
      clearTimeout(timeoutIdx);
    };
  }, [myId]);

  return (
    <div className="fixed bottom-[4px] inset-x-0 h-0 z-30 pointer-events-none">
      {avatars.map((avatar) => {
        const isMe = avatar.id === myId;
        const currentX = isMe && localX !== null ? localX : avatar.x_pos;
        
        // Use timestamp to determine if character is currently in its 8s walking transition
        // Increased to 8s to ensure animation doesn't stop too early
        const timeSinceUpdate = Date.now() - new Date(avatar.updated_at).getTime();
        const moving = isMe ? isMoving : (timeSinceUpdate < 7500); 
        
        const assets = SKIN_ASSETS[avatar.skin] || { emoji: '👤' };
        
        // Random action logic for others
        const isAction = isMe ? localAction : (avatar.isAction || (Math.random() < 0.005 && !moving));
        
        // Face direction logic
        const facingRight = isMe ? localFacingRight : (avatar.is_facing_right ?? true);
        const baseFacing = assets.baseFacing || 'right';
        const shouldFlip = (baseFacing === 'right' && !facingRight) || (baseFacing === 'left' && facingRight);

        return (
          <div
            key={avatar.id}
            className="absolute transition-all duration-[7500ms] ease-linear"
            style={{
              left: `${currentX}%`,
              bottom: assets.offsetY || '0px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="bg-black/60 px-2 py-0.5 rounded border border-white/20 mb-1 backdrop-blur-[1px]"
                style={{ transform: `translateY(${assets.nameOffset || '0px'})` }}
              >
                <span className="text-[6px] text-white font-display uppercase tracking-widest whitespace-nowrap">
                  {avatar.name || "UNNAMED"}
                </span>
              </div>
              {assets.idle || assets.walk ? (
                <img 
                  src={`${import.meta.env.BASE_URL}${(moving ? (assets.walk || assets.idle) : (isAction && assets.random ? assets.random : (assets.idle || assets.walk)))!.slice(1)}`} 
                  className={`${assets.size} object-contain pixelated`}
                  style={{ 
                    transform: shouldFlip ? 'scaleX(-1)' : 'scaleX(1)',
                    filter: isMe ? 'drop-shadow(0 0 8px rgba(0,212,255,0.6))' : 'none',
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
