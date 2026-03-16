import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { MusicPlayer } from "@/components/MusicPlayer";
import Splash from "@/pages/Splash";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Education from "@/pages/Education";
import Certifications from "@/pages/Certifications";
import Gallery from "@/pages/Gallery";
import Skills from "@/pages/Skills";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

async function trackVisit() {
  if (!supabase) return;
  try {
    // Increment the 'total_visitors' count in Supabase
    const { data: current, error: fetchError } = await supabase
      .from('portfolio_page_visits')
      .select('count')
      .eq('id', 'total_visitors')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
      console.error("Error fetching visitor count:", fetchError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('portfolio_page_visits')
      .update({ count: (current?.count || 0) + 1 })
      .eq('id', 'total_visitors');

    if (updateError) {
      console.error("Error updating visitor count:", updateError.message);
    }
  } catch (err) {
    console.error("Failed to track visit:", err);
  }
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/hub" component={Home} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/education" component={Education} />
        <Route path="/certifications" component={Certifications} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/skills" component={Skills} />
        <Route component={NotFound} />
      </Switch>
      <MusicPlayer />
    </Layout>
  );
}

function App() {
  useEffect(() => {
    trackVisit();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
