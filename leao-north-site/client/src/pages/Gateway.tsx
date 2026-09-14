/*
 * LEÃO NORTH — Portal Gateway (Yin-Yang)
 * Split-screen: Service (escuro) à esquerda / Materiais (claro) à direita
 * Entrada animada (tw-animate-css) + hover com zoom e brilho dourado
 *
 * FASE 33.1 — Branding dinâmico (DUAS logos):
 *   - Cada frente tem a SUA logo oficial (Service / Materiais) cadastrada no painel
 *     (aba Configurações → Branding / Logos), via api/branding.php.
 *   - SEM logo cadastrada (ou API indisponível), o selo dourado original é mantido
 *     como fallback — nenhuma função foi removida.
 *   - As logos são PNG/JPG/WEBP com fundo TRANSPARENTE, exibidas sobre a cor do site.
 *   - Título do hemiciclo Service atualizado para "Instalações Elétricas" (Fase 33).
 */
import { Link } from "wouter";
import { Zap, Package } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

export default function Gateway() {
  const { urlLogoService, urlLogoMateriais } = useBranding();

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-['DM_Sans']">
      {/* ===== LADO SERVICE (ESCURO) ===== */}
      <Link
        href="/service"
        className="group relative flex-1 flex flex-col items-center justify-center text-center p-8 md:min-h-screen min-h-[55vh] bg-[#080808] text-white overflow-hidden"
      >
        {/* Anel dourado decorativo (aparece/brilha no hover) */}
        <div className="absolute w-72 h-72 rounded-full border border-[#F0B429]/10 transition-all duration-700 group-hover:border-[#F0B429]/40 group-hover:scale-110" />
        <div className="absolute w-72 h-72 rounded-full bg-[#F0B429]/0 group-hover:bg-[#F0B429]/5 transition-all duration-700 scale-0 group-hover:scale-100" />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center gap-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {urlLogoService ? (
            /* Logo transparente exibida sobre a cor do site (fundo escuro) */
            <div className="h-20 w-auto max-w-[240px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img src={urlLogoService} alt="Leão North Service" className="h-full w-auto max-w-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-sm bg-[#F0B429] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-[#080808]" strokeWidth={2.5} />
            </div>
          )}
          <span className="text-[#F0B429] text-xs tracking-[0.25em] uppercase font-medium">
            Leão North Service
          </span>
          <h1 className="font-['Barlow_Condensed'] font-800 text-4xl lg:text-6xl uppercase leading-tight">
            Instalações<br />
            Elétricas
          </h1>
          <p className="text-white/60 text-sm lg:text-base max-w-xs">
            Instalações elétricas residenciais, comerciais e industriais com excelência técnica.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors">
            Conhecer Serviços
          </span>
        </div>
      </Link>

      {/* ===== LADO MATERIAIS (CLARO) ===== */}
      <Link
        href="/materiais"
        className="group relative flex-1 flex flex-col items-center justify-center text-center p-8 md:min-h-screen min-h-[55vh] bg-[#F8FAFC] text-slate-900 overflow-hidden"
      >
        {/* Anel dourado decorativo */}
        <div className="absolute w-72 h-72 rounded-full border border-[#B8860B]/10 transition-all duration-700 group-hover:border-[#B8860B]/40 group-hover:scale-110" />
        <div className="absolute w-72 h-72 rounded-full bg-[#B8860B]/0 group-hover:bg-[#B8860B]/5 transition-all duration-700 scale-0 group-hover:scale-100" />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center gap-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
          {urlLogoMateriais ? (
            /* Logo transparente exibida sobre a cor do site (fundo claro) */
            <div className="h-20 w-auto max-w-[240px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img src={urlLogoMateriais} alt="Leão North Materiais Elétricos" className="h-full w-auto max-w-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-sm bg-[#F0B429] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Package className="w-8 h-8 text-[#080808]" strokeWidth={2.5} />
            </div>
          )}
          <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase font-medium">
            Leão North Materiais Elétricos
          </span>
          <h1 className="font-['Barlow_Condensed'] font-800 text-4xl lg:text-6xl uppercase leading-tight">
            Materiais<br />
            Elétricos
          </h1>
          <p className="text-slate-600 text-sm lg:text-base max-w-xs">
            Catálogo de produtos para seus projetos — venda casada com a garantia Leão North.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors">
            Ver Catálogo
          </span>
        </div>
      </Link>
    </div>
  );
}
