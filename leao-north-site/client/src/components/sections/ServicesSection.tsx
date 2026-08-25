/*
 * LEÃO NORTH — Services Section
 * Design: 7 service cards with gold hover effects
 */
import { useEffect, useRef } from "react";
import { Home, Building2, Factory, FileText, Wrench, LayoutGrid, Cable } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Instalações Residenciais",
    description: "Projetos e execução de instalações elétricas para residências, garantindo segurança e eficiência energética.",
    tag: "Residencial",
  },
  {
    icon: Building2,
    title: "Instalações Comerciais",
    description: "Soluções elétricas completas para estabelecimentos comerciais, lojas, escritórios e centros comerciais.",
    tag: "Comercial",
  },
  {
    icon: Factory,
    title: "Instalações Industriais",
    description: "Infraestrutura elétrica de alta capacidade para indústrias, com foco em confiabilidade e continuidade operacional.",
    tag: "Industrial",
  },
  {
    icon: FileText,
    title: "Projetos Elétricos",
    description: "Elaboração de projetos elétricos conforme normas ABNT, com laudo técnico e ART do engenheiro responsável.",
    tag: "Projetos",
  },
  {
    icon: Wrench,
    title: "Manutenção Elétrica",
    description: "Manutenção preventiva e corretiva de sistemas elétricos, minimizando riscos e aumentando a vida útil das instalações.",
    tag: "Manutenção",
  },
  {
    icon: LayoutGrid,
    title: "Quadros Elétricos",
    description: "Montagem, instalação e manutenção de quadros de distribuição e painéis elétricos industriais e comerciais.",
    tag: "Quadros",
  },
  {
    icon: Cable,
    title: "Infraestrutura Elétrica",
    description: "Instalação de eletrodutos, calhas, bandejas e toda infraestrutura necessária para sistemas elétricos robustos.",
    tag: "Infraestrutura",
  },
];

export default function ServicesSection() {
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
              }, i * 80);
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
          backgroundImage: `url("https://d2xsxph8kpxj0f.cloudfront.net/310519663679471714/7uCDftEx5Gn2oJRKUzBfKv/services-industrial-btyjLZBRaHagKwqMurmtt7.webp")`,
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

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <div
              key={service.title}
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
                  <service.icon className="w-6 h-6 text-[#F0B429]" />
                </div>
                <span className="text-[10px] text-[#F0B429]/60 font-['DM_Sans'] font-medium tracking-[0.15em] uppercase border border-[#F0B429]/20 px-2 py-0.5 rounded-sm">
                  {service.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase leading-tight group-hover:text-[#F0B429] transition-colors duration-250">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-white/50 text-sm font-['DM_Sans'] leading-relaxed flex-1">
                {service.description}
              </p>

              {/* Bottom accent */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <div className="w-4 h-px bg-[#F0B429]/40 group-hover:w-8 transition-all duration-250" />
                <span className="text-[#F0B429]/40 text-xs font-['DM_Sans'] group-hover:text-[#F0B429]/70 transition-colors duration-250">
                  Saiba mais
                </span>
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div
            className="reveal flex flex-col items-center justify-center gap-4 p-6 rounded-sm border border-[#F0B429]/30 bg-[#F0B429]/5 text-center cursor-pointer hover:bg-[#F0B429]/10 transition-all duration-250"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${services.length * 60}ms`,
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
