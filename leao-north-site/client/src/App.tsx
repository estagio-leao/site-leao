import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Importações adicionadas para o Painel Administrativo
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* Novas rotas do painel administrativo */}
      <Route path={"/admin"} component={Login} />
      <Route path={"/admin/dashboard"} component={Dashboard} />
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;