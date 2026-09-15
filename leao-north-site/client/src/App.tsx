import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
// FASE 36 — Carrinho de Orçamentos (frente Materiais)
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/CartDrawer";
import Gateway from "./pages/Gateway";              // ← Portal Gateway
import Service from "./pages/Service";
import Materiais from "./pages/Materiais";
import ProdutoDetalhes from "./pages/ProdutoDetalhes";
import GrupoVariacoes from "./pages/GrupoVariacoes";
import PortfolioDetalhes from "./pages/PortfolioDetalhes";
import SocioDetalhes from "./pages/SocioDetalhes";
import Depoimentos from "./pages/Depoimentos";

// Importações adicionadas para o Painel Administrativo
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      {/* Portal Gateway — primeira tela do domínio */}
      <Route path={"/"} component={Gateway} />
      <Route path={"/service"} component={Service} />
      {/* Fase 24 — páginas de detalhes da Leão Service */}
      <Route path={"/service/portfolio/:id"} component={PortfolioDetalhes} />
      <Route path={"/service/socio/:id"} component={SocioDetalhes} />
      {/* Fase 27 — página completa de depoimentos */}
      <Route path={"/service/depoimentos"} component={Depoimentos} />
      <Route path={"/materiais"} component={Materiais} />
      <Route path={"/materiais/grupo/:id"} component={GrupoVariacoes} />
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
          {/* FASE 36 — o provider fica acima do Router (o estado sobrevive à
              navegação) e o CartDrawer é montado UMA única vez na árvore, o que
              evita drawer duplicado por página e preserva o formulário digitado. */}
          <CartProvider>
            <Toaster />
            <Router />
            <CartDrawer />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;