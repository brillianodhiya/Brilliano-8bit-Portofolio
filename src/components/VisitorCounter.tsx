import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function VisitorCounter() {
  const [counts, setCounts] = useState({ visitors: 0, players: 0 });
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!supabase) return;
      
      const { data } = await supabase
        .from('portfolio_page_visits')
        .select('id, count');
      
      if (data) {
        const v = data.find(d => d.id === 'total_visitors')?.count || 0;
        const p = data.find(d => d.id === 'achievement_players')?.count || 0;
        setCounts({ visitors: v, players: p });
        setTimeout(() => setGlow(true), 500);
      }
    };
    
    fetchCounts();
    const channel = supabase
      ?.channel('counts_db_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portfolio_page_visits' }, fetchCounts)
      .subscribe();

    return () => { supabase?.removeChannel(channel!); };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', cursive",
        background: "rgba(10, 10, 46, 0.92)",
        border: "2px solid #ffd700",
        boxShadow: glow
          ? "0 0 10px #ffd700, inset 0 0 5px rgba(255,215,0,0.1), 3px 3px 0 #000"
          : "3px 3px 0 #000",
        padding: "4px 6px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "6px",
        width: "max-content",
        transition: "box-shadow 0.6s",
      }}
    >
      {/* Total Visitors */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}>
        <div style={{ fontSize: "12px", lineHeight: 1 }}>👥</div>
        <div style={{ fontSize: "9px", color: "#ffd700", textShadow: glow ? "0 0 10px #ffd700" : "none" }}>
          {counts.visitors.toLocaleString("en-US")}
        </div>
        <div style={{ fontSize: "4px", color: "rgba(255,215,0,0.7)", textAlign: "center" }}>
          VISITORS
        </div>
      </div>

      {/* Vertical Divider */}
      <div style={{ width: "1px", height: "14px", background: "rgba(255,215,0,0.2)" }} />

      {/* Achievement Players */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}>
        <div style={{ fontSize: "12px", lineHeight: 1 }}>🏆</div>
        <div style={{ fontSize: "9px", color: "#00D4FF", textShadow: glow ? "0 0 10px #00D4FF" : "none" }}>
          {counts.players.toLocaleString("en-US")}
        </div>
        <div style={{ fontSize: "4px", color: "rgba(0,212,255,0.7)", textAlign: "center" }}>
          HEROES
        </div>
      </div>
    </div>
  );
}
