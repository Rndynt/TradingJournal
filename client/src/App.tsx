import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/pages/dashboard";
import TradeEntry from "@/pages/trade-entry";
import TradeHistory from "@/pages/trade-history";
import Analytics from "@/pages/analytics";
import News from "@/pages/news";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/trade-entry" component={TradeEntry} />
      <Route path="/trade-entry/:id" component={TradeEntry} />
      <Route path="/history" component={TradeHistory} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/news" component={News} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden bg-dark-100 text-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
              <MobileHeader />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="p-6">
                  <Router />
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
