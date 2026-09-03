/*
 * LEÃO NORTH — Painel Admin: Dashboard (Orquestrador) — Fase 26
 * Arquivo enxuto: checagem de token, Sidebar com setActiveTab e <main> que apenas
 * monta o componente da aba ativa. Todo o estado/CRUD vive nos componentes:
 *   - materiais/: AdminCategorias, AdminGrupos, AdminProdutos
 *   - service/:   AdminServicos, AdminPortfolio, AdminSocios
 *   - geral/:     AdminDepoimentos, AdminMensagens
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  LogOut, Mail, Star, FolderOpen, Package,
  Image as ImageIcon, Tag, Wrench, Users,
} from "lucide-react";

import AdminCategorias from "./materiais/AdminCategorias";
import AdminGrupos from "./materiais/AdminGrupos";
import AdminProdutos from "./materiais/AdminProdutos";
import AdminServicos from "./service/AdminServicos";
import AdminPortfolio from "./service/AdminPortfolio";
import AdminSocios from "./service/AdminSocios";
import AdminDepoimentos from "./geral/AdminDepoimentos";
import AdminMensagens from "./geral/AdminMensagens";

// Classe dos itens do menu lateral (Fase 16)
const sidebarItemClass = (tab: string, activeTab: string) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
    activeTab === tab
      ? "bg-[#F0B429]/10 text-[#F0B429]"
      : "text-white/60 hover:bg-white/5 hover:text-white"
  }`;

const sidebarSectionLabel = (label: string) => (
  <p className="px-4 pt-4 pb-1 text-[9px] tracking-[0.2em] uppercase text-white/30">{label}</p>
);

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      setLocation("/admin");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-[#050505] font-['DM_Sans'] flex">

      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#111111] border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase">
            Painel <span className="text-[#F0B429]">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* LEÃO MATERIAIS */}
          {sidebarSectionLabel("Leão Materiais")}
          <button onClick={() => setActiveTab("categorias")} className={sidebarItemClass("categorias", activeTab)}>
            <Tag className="w-5 h-5" /> Categorias
          </button>
          <button onClick={() => setActiveTab("grupos")} className={sidebarItemClass("grupos", activeTab)}>
            <FolderOpen className="w-5 h-5" /> Grupos
          </button>
          <button onClick={() => setActiveTab("produtos")} className={sidebarItemClass("produtos", activeTab)}>
            <Package className="w-5 h-5" /> Produtos
          </button>

          {/* LEÃO SERVICE */}
          {sidebarSectionLabel("Leão Service")}
          <button onClick={() => setActiveTab("servicos")} className={sidebarItemClass("servicos", activeTab)}>
            <Wrench className="w-5 h-5" /> Serviços
          </button>
          <button onClick={() => setActiveTab("portfolio")} className={sidebarItemClass("portfolio", activeTab)}>
            <ImageIcon className="w-5 h-5" /> Portfólio
          </button>
          <button onClick={() => setActiveTab("socios")} className={sidebarItemClass("socios", activeTab)}>
            <Users className="w-5 h-5" /> Sócios
          </button>
          <button onClick={() => setActiveTab("depoimentos")} className={sidebarItemClass("depoimentos", activeTab)}>
            <Star className="w-5 h-5" /> Depoimentos
          </button>

          {/* GERAL */}
          {sidebarSectionLabel("Geral")}
          <button onClick={() => setActiveTab("mensagens")} className={sidebarItemClass("mensagens", activeTab)}>
            <Mail className="w-5 h-5" /> Mensagens
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content — apenas monta a aba ativa */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {activeTab === "categorias"  && <AdminCategorias />}
        {activeTab === "grupos"      && <AdminGrupos />}
        {activeTab === "produtos"    && <AdminProdutos />}
        {activeTab === "servicos"    && <AdminServicos />}
        {activeTab === "portfolio"   && <AdminPortfolio />}
        {activeTab === "socios"      && <AdminSocios />}
        {activeTab === "depoimentos" && <AdminDepoimentos />}
        {activeTab === "mensagens"   && <AdminMensagens />}
      </main>
    </div>
  );
}
