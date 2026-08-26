import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Gateway from "./pages/Gateway";              // ← Portal Gateway
import Service from "./pages/Service";
import Materiais from "./pages/Materiais";
import ProdutoDetalhes from "./pages/ProdutoDetalhes";

// Importações adicionadas para o Painel Administrativo
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      {/* Portal Gateway — primeira tela do domínio */}
      <Route path={"/"} component={Gateway} />
      <Route path={"/service"} component={Service} />
      <Route path={"/materiais"} component={Materiais} />
      <Route path={"/materiais/:id"} component={ProdutoDetalhes} />

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