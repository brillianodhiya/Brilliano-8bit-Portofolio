import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// Helper for dynamic level calculation
export function calculateLevel(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // Calculate EXP: percentage of year passed since last birthday
  const lastBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (lastBirthday > today) {
    lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
  }
  
  const nextBirthday = new Date(lastBirthday.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const totalMs = nextBirthday.getTime() - lastBirthday.getTime();
  const currentMs = today.getTime() - lastBirthday.getTime();
  const exp = Math.floor((currentMs / totalMs) * 100);

  return { level: age, exp };
}

export function usePortfolioData(table: string) {
  return useQuery({
    queryKey: ['portfolio', table],
    queryFn: async () => {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      let query = supabase.from(`portfolio_${table}`).select('*');
      
      // Only apply sorting to tables that have display_order column
      const tablesWithOrder = ['attributes', 'skills', 'projects', 'awards', 'education', 'gallery', 'experience'];
      if (tablesWithOrder.includes(table)) {
        query = query.order('display_order', { ascending: true });
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      return data;
    },
    enabled: !!supabase,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['portfolio', 'profile'],
    queryFn: async () => {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const { data, error } = await supabase
        .from('portfolio_profile')
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!supabase,
  });
}
