import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import SettingsPage from "@/pages/settings";
import LogsPage from "@/pages/logs";
import HelpPage from "@/pages/help";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/logs" component={LogsPage} />
          <Route path="/help" component={HelpPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-discord-dark text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Router />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
