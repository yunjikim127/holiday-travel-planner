import React, { useEffect } from "react"; // ✅ React import 추가
import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TravelPlanner from "@/pages/travel-planner";
import NotFound from "@/pages/not-found";

// Google Analytics type declarations
declare global {
  interface Window {
    gtag: ((...args: any[]) => void) & {
      q?: any[];
    };
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TravelPlanner} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    try {
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-25L2MWVRVD";
      script.async = true;
      document.head.appendChild(script);
      
      // Initialize gtag
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'G-25L2MWVRVD');
    } catch (error) {
      console.warn('Google Analytics failed to load:', error);
    }
  }, []); // ✅ 최초 마운트 시 한 번만 실행

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

// Test deployment workflow - January 20, 2025
// Updated via Cursor -> GitHub -> Replit auto-deploy
