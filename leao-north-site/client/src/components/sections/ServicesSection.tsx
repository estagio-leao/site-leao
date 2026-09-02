/*
 * LEÃO NORTH — Services Section
 * Design: 7 service cards with gold hover effects
 * Fase 24: consumo dinâmico de api/service/categorias.php + dicionário de
 * ícones (Lucide) e badges curtos (tags), que não existem no banco.
 */
import { useEffect, useRef, useState } from "react";
import {
  Home, Building2, Factory, FileText, Wrench, LayoutGrid, Cable,
  type LucideIcon,
} from "lucide-react";

// Ícones por nome de serviço (fallback: Wrench) — apresentação, fora do banco
const ICONES_SERVICOS: Record<string, LucideIcon> = {
  "Instalações Residenciais": Home,
  "Instalações Comerciais": Building2,
  "Instalações Industriais": Factory,
  "Projetos Elétricos": FileText,
  "Manutenção Elétrica": Wrench,
  "Quadros Elétricos": LayoutGrid,
  "Infraestrutura Elétrica": Cable,
};
const ICONE_PADRAO: LucideIcon = Wrench;

// Badge curto por serviço (se não mapeado, não renderiza o badge)
const TAGS_SERVICOS: Record<string, string> = {
  "Instalações Residenciais": "Residencial",
  "Instalações Comerciais": "Comercial",
  "Instalações Industriais": "Industrial",
  "Projetos Elétricos": "Projetos",
  "Manutenção Elétrica": "Manutenção",
  "Quadros Elétricos": "Quadros",
  "Infraestrutura Elétrica": "Infraestrutura",
};

type Servico = { id: number; nome: string; descricao?: string | null };

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    // Busca os serviços/categorias reais (Fase 24)
    fetch("http://localhost/leaonorth/api/service/categorias.php")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setServicos(data);
      })
      .catch((error) => console.error("Erro ao buscar serviços:", error));

    // Reveal ao rolar (mesmo padrão das demais seções dinâmicas)
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((r, i) => {
              setTimeout(() => {
                (r as HTMLElement).style.opacity = "1";
                (r as HTMLElement).style.transform = "translateY(0)";
              }, i * 60);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="servicos"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #111111 0%, #0D0D0D 100%)" }}
    >
      {/* Background image subtle overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&q=80&w=2000")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <div
              className="reveal flex items-center gap-3 mb-4"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              <div className="h-px w-12 bg-[#F0B429]" />
              <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
                O Que Fazemos
              </span>
            </div>
            <h2
              className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase leading-tight"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
            >
              Nossos{" "}
              <span className="text-gold-gradient">Serviços</span>
            </h2>
          </div>
          <p
            className="reveal text-white/50 text-sm font-['DM_Sans'] max-w-sm leading-relaxed"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 160ms" }}
          >
            Soluções elétricas completas para todos os segmentos, executadas com máxima qualidade técnica.
          </p>
        </div>

        {/* Services Grid Dinâmico */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {servicos.map((servico, i) => {
            const Icone = ICONES_SERVICOS[servico.nome] ?? ICONE_PADRAO;
            const tag = TAGS_SERVICOS[servico.nome];
            return (
              <div
                key={servico.id}
                className="reveal service-card group relative flex flex-col gap-4 p-6 rounded-sm border border-white/10 bg-[#0F0F0F] cursor-default"
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 60}ms`,
                }}
              >
                {/* Top gold line on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0B429]/0 to-transparent group-hover:via-[#F0B429]/60 transition-all duration-300" />

                {/* Icon + Tag row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-sm bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center group-hover:bg-[#F0B429]/20 transition-colors duration-250">
                    <Icone className="w-6 h-6 text-[#F0B429]" />
                  </div>
                  {tag && (
                    <span className="text-[10px] text-[#F0B429]/60 font-['DM_Sans'] font-medium tracking-[0.15em] uppercase border border-[#F0B429]/20 px-2 py-0.5 rounded-sm">
                      {tag}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase leading-tight group-hover:text-[#F0B429] transition-colors duration-250">
                  {servico.nome}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm font-['DM_Sans'] leading-relaxed flex-1">
                  {servico.descricao}
                </p>

                {/* Bottom accent */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <div className="w-4 h-px bg-[#F0B429]/40 group-hover:w-8 transition-all duration-250" />
                  <span className="text-[#F0B429]/40 text-xs font-['DM_Sans'] group-hover:text-[#F0B429]/70 transition-colors duration-250">
                    Saiba mais
                  </span>
                </div>
              </div>
            );
          })}

          {servicos.length === 0 && (
            <div
              className="reveal col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              Serviços em breve.
            </div>
          )}

          {/* CTA Card */}
          <div
            className="reveal flex flex-col items-center justify-center gap-4 p-6 rounded-sm border border-[#F0B429]/30 bg-[#F0B429]/5 text-center cursor-pointer hover:bg-[#F0B429]/10 transition-all duration-250"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${servicos.length * 60}ms`,
            }}
            onClick={() => document.querySelector("#contato")?.scrollIntoView({ behavior: "smooth" })}
          >
            <div className="w-14 h-14 rounded-full border-2 border-[#F0B429]/40 flex items-center justify-center">
              <span className="text-[#F0B429] text-2xl">+</span>
            </div>
            <p className="font-['Barlow_Condensed'] font-600 text-lg text-[#F0B429] uppercase tracking-wide">
              Solicite um Orçamento
            </p>
            <p className="text-white/40 text-xs font-['DM_Sans']">
              Atendemos projetos de qualquer porte
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
