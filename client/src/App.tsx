import React from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "./_core/hooks/useAuth.ts";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { Navigation } from "./components/Navigation.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { motion, AnimatePresence } from "motion/react";
import { AuroraHero } from "./components/ui/hero-2.tsx";

// Pages
import { Landing } from "./pages/Landing.tsx";
import { Home } from "./pages/Home.tsx";
import { ReportIssue } from "./pages/ReportIssue.tsx";
import { IssueMap } from "./pages/IssueMap.tsx";
import { IssueDetail } from "./pages/IssueDetail.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { AIInsights } from "./pages/AIInsights.tsx";
import { Leaderboard } from "./pages/Leaderboard.tsx";
import { OperationsConsole } from "./pages/OperationsConsole.tsx";
import { Demo } from "./pages/demo.tsx";
import { NotFound } from "./pages/NotFound.tsx";

import { Shield } from "lucide-react";

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-[#111111] space-y-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black tracking-tight text-[#111111]">
            CIVIMIND AI
          </h2>
          <p className="text-[11px] text-[#6B7280] font-medium tracking-wide">
            Authorizing session...
          </p>
        </div>
      </div>
    );
  }

  // If NOT authenticated, show the landing page at root, and redirect other paths to the authorization bypass
  if (!isAuthenticated) {
    if (location !== "/") {
      window.location.href = "/app-auth";
      return null;
    }
    return <Landing />;
  }

  return (
    <AuroraHero className="min-h-screen bg-white text-[#111111] flex flex-col justify-start items-stretch">
      <Navigation />
      <main className="max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-10 relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <Switch location={location}>
              <Route path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/report" component={ReportIssue} />
              <Route path="/map" component={IssueMap} />
              <Route path="/issue/:id" component={IssueDetail} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/insights" component={AIInsights} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/operations" component={OperationsConsole} />
              <Route path="/demo" component={Demo} />
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </main>
    </AuroraHero>
  );
}
