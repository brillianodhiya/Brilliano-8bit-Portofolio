import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useEffect, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";

// Lazy loading pages for better performance (Code Splitting)
const Splash = lazy(() => import("@/pages/Splash"));
const Home = lazy(() => import("@/pages/Home"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Education = lazy(() => import("@/pages/Education"));
const Certifications = lazy(() => import("@/pages/Certifications"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Skills = lazy(() => import("@/pages/Skills"));
const Experience = lazy(() => import("@/pages/Experience"));
const NotFound = lazy(() => import("@/pages/not-found"));

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

import { ThemeProvider } from "@/context/ThemeContext";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-background">
          <div className="font-display text-accent animate-pulse">LOADING_RESOURCES...</div>
        </div>
      }>
        <Switch>
          <Route path="/" component={Splash} />
          <Route path="/hub" component={Home} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/experience" component={Experience} />
          <Route path="/education" component={Education} />
          <Route path="/certifications" component={Certifications} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/skills" component={Skills} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
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
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
