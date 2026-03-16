import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function VisitorCounter() {
  const [count, setCount] = useState(0);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('portfolio_page_visits')
        .select('count')
        .eq('id', 'total_visitors')
        .single();
      
      if (data) {
        setCount(data.count);
        setTimeout(() => setGlow(true), 500);
      }
    };
    
    fetchCount();
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', cursive",
        background: "rgba(10, 10, 46, 0.92)",
        border: "3px solid #ffd700",
        boxShadow: glow
          ? "0 0 14px #ffd700, inset 0 0 8px rgba(255,215,0,0.12), 4px 4px 0 #000"
          : "4px 4px 0 #000",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        minWidth: "110px",
        transition: "box-shadow 0.6s",
      }}
    >
      {/* Icon row */}
      <div style={{ fontSize: "18px", lineHeight: 1 }}>👥</div>

      {/* Counter */}
      <div
        style={{
          fontSize: "14px",
          color: "#ffd700",
          textShadow: glow ? "0 0 10px #ffd700" : "none",
          letterSpacing: "0.05em",
          transition: "text-shadow 0.6s",
        }}
      >
        {count.toLocaleString("en-US")}
      </div>

      {/* Label */}
      <div style={{ fontSize: "6px", color: "rgba(255,215,0,0.7)", letterSpacing: "0.1em" }}>
        ADVENTURERS
      </div>
      <div style={{ fontSize: "6px", color: "rgba(255,215,0,0.5)", letterSpacing: "0.1em" }}>
        VISITED
      </div>
    </div>
  );
}
