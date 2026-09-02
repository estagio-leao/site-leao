/*
 * LEÃO NORTH — HeaderMateriais (Header EXCLUSIVO da frente "Leão Materiais")
 * Fase 20 — Renderizado APENAS nas rotas /materiais, /materiais/grupo/:id e /materiais/:id.
 * NÃO herda o menu institucional (Sobre/Portfólio/Sócios...) — apenas:
 *   - Logo "Leão" (→ hub / Gateway)
 *   - Busca Global central (Enter → /materiais?q=<termo>; termo vazio → /materiais)
 *   - "Catálogo" (→ /materiais) e "Contato" (link direto WhatsApp)
 * Identidade: tema claro da frente Materiais com dourado #F0B429/#B8860B.
 */
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Search, X } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5543999190467";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function HeaderMateriais() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [termo, setTermo] = useState("");
  const [buscaMobileAberta, setBuscaMobileAberta] = useState(false);

  // Sincroniza o input com o ?q= da URL (ex.: /materiais?q=led preenche a barra).
  // Lê com a API nativa (window.location.search): o useLocation do wouter v3 retorna
  // apenas o pathname. Reage aos eventos disparados pelo wouter ao navegar.
  useEffect(() => {
    const sync = () => {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      setTermo(q);
    };
    sync(); // estado inicial (ex.: recarregar /materiais?q=led)
    window.addEventListener("popstate", sync);
    window.addEventListener("pushState", sync);
    window.addEventListener("replaceState", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("pushState", sync);
      window.removeEventListener("replaceState", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Busca GLOBAL: navega p/ /materiais?q=... (não filtra localmente)
  const enviarBusca = (e: FormEvent) => {
    e.preventDefault();
    const q = termo.trim();
    setLocation(q ? `/materiais?q=${encodeURIComponent(q)}` : "/materiais");
    setBuscaMobileAberta(false);
  };

  const inputClasses =
    "w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* Gold top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F0B429] to-transparent" />

      <nav className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 h-16 lg:h-20">
        {/* Logo → hub (/ = Gateway) */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-['Barlow_Condensed'] font-800 text-xl tracking-wider uppercase text-slate-900">
              Leão North
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase font-['DM_Sans'] font-medium text-[#B8860B]">
              Materiais
            </span>
          </div>
        </Link>

        {/* Busca Global — desktop (centro) */}
        <form
          onSubmit={enviarBusca}
          className="hidden lg:flex flex-1 min-w-0 justify-center px-4"
          role="search"
        >
          <div className="w-full max-w-xl flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-3 focus-within:border-[#F0B429] focus-within:ring-1 focus-within:ring-[#F0B429]/30 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar produtos, grupos ou especificações..."
                className={`${inputClasses} py-2.5`}
                aria-label="Buscar no catálogo"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-sm uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.97] transition-all duration-200"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Links essenciais — desktop (logo já aponta para a raiz "/") */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <Link
            href="/materiais"
            className="text-sm font-['DM_Sans'] font-medium uppercase tracking-wide text-slate-700 hover:text-[#B8860B] transition-colors duration-200"
          >
            Catálogo
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-sm uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.97] transition-all duration-200"
          >
            <WhatsAppIcon /> Contato
          </a>
        </div>

        {/* Ações mobile (busca + whatsapp — logo já aponta para a raiz "/") */}
        <div className="flex lg:hidden items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setBuscaMobileAberta((v) => !v)}
            aria-label="Buscar"
            className="p-2 text-slate-900 hover:text-[#B8860B] transition-colors"
          >
            {buscaMobileAberta ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contato via WhatsApp"
            className="p-2 text-[#25D366] hover:text-[#1EBE5A] transition-colors"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </nav>

      {/* Busca mobile (linha extra abaixo do header) */}
      {buscaMobileAberta && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
          <form onSubmit={enviarBusca} className="flex items-center gap-2" role="search">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-3 focus-within:border-[#F0B429]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar no catálogo..."
                className={`${inputClasses} py-2`}
                aria-label="Buscar no catálogo"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-sm uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
            >
              OK
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
