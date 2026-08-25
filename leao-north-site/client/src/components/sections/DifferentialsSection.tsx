/*
 * LEÃO NORTH — Differentials Section
 * Design: Dark bg with horizontal layout, large icons, gold accents
 */
import { useEffect, useRef } from "react";
import { Users, Headphones, Lightbulb, ShieldCheck, BookCheck } from "lucide-react";

const differentials = [
  {
    icon: Users,
    title: "Equipe Especializada",
    description: "Engenheiro eletricista e técnicos em eletrotécnica com formação e experiência comprovadas.",
    number: "01",
  },
  {
    icon: Headphones,
    title: "Atendimento Profissional",
    description: "Suporte dedicado em todas as etapas do projeto, do planejamento à entrega final.",
    number: "02",
  },
  {
    icon: Lightbulb,
    title: "Soluções Inovadoras",
    description: "Aplicamos as mais modernas tecnologias e metodologias em cada instalação elétrica.",
    number: "03",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Garantida",
    description: "Todos os serviços seguem rigorosos protocolos de segurança e normas técnicas vigentes.",
    number: "04",
  },
  {
    icon: BookCheck,
    title: "Conformidade com Normas",
    description: "Projetos e instalações em conformidade com ABNT NBR 5410, NR-10 e legislações aplicáveis.",
    number: "05",
  },
];

export default function DifferentialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 100%)" }}
    >
      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-['Barlow_Condensed'] font-800 text-[20vw] text-white/[0.015] uppercase select-none whitespace-nowrap"
        >
          DIFERENCIAIS
        </span>
      </div>

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
                Por Que Nos Escolher
              </span>
            </div>
            <h2
              className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase leading-tight"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
            >
              Nossos{" "}
              <span className="text-gold-gradient">Diferenciais</span>
            </h2>
          </div>
        </div>

        {/* Differentials list */}
        <div className="flex flex-col gap-px">
          {differentials.map((item, i) => (
            <div
              key={item.number}
              className="reveal group flex flex-col sm:flex-row sm:items-center gap-6 py-8 border-b border-white/10 hover:border-[#F0B429]/30 transition-colors duration-300 cursor-default"
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 100}ms`,
              }}
            >
              {/* Number */}
              <span className="font-['Barlow_Condensed'] font-800 text-5xl lg:text-6xl text-white/10 group-hover:text-[#F0B429]/20 transition-colors duration-300 leading-none w-20 flex-shrink-0">
                {item.number}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-sm bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F0B429]/20 transition-colors duration-250">
                <item.icon className="w-7 h-7 text-[#F0B429]" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase tracking-wide group-hover:text-[#F0B429] transition-colors duration-250 mb-2">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm font-['DM_Sans'] leading-relaxed max-w-xl">
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex w-10 h-10 rounded-sm border border-white/10 items-center justify-center group-hover:border-[#F0B429]/40 group-hover:bg-[#F0B429]/5 transition-all duration-250 flex-shrink-0">
                <span className="text-white/30 group-hover:text-[#F0B429] transition-colors duration-250 text-lg">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
