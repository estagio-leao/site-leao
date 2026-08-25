/*
 * LEÃO NORTH — Mission, Vision & Values Section
 * Design: Dark cards with gold borders, icon highlights
 */
import { useEffect, useRef } from "react";
import { Target, Eye, Heart } from "lucide-react";

const cards = [
  {
    icon: Target,
    title: "Missão",
    text: "Fornecer soluções elétricas seguras, eficientes e inovadoras, atendendo às necessidades dos nossos clientes com excelência técnica e compromisso total com a qualidade.",
    accent: "#F0B429",
  },
  {
    icon: Eye,
    title: "Visão",
    text: "Ser referência regional em instalações elétricas e engenharia elétrica, reconhecida pela qualidade dos serviços, pela inovação e pela confiança que transmitimos a cada projeto.",
    accent: "#F0B429",
  },
  {
    icon: Heart,
    title: "Valores",
    text: "Qualidade sem compromissos, segurança como prioridade absoluta, inovação constante nas soluções e compromisso genuíno com cada cliente e projeto que executamos.",
    accent: "#F0B429",
    values: ["Qualidade", "Segurança", "Inovação", "Compromisso"],
  },
];

export default function MissionSection() {
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
              }, i * 120);
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
      className="py-24 lg:py-32 relative"
      style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #111111 100%)" }}
    >
      {/* Gold diagonal accent */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(45deg, #F0B429 1px, transparent 1px), linear-gradient(-45deg, #F0B429 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="reveal flex items-center justify-center gap-3 mb-4"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
          >
            <div className="h-px w-12 bg-[#F0B429]" />
            <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
              Nossa Essência
            </span>
            <div className="h-px w-12 bg-[#F0B429]" />
          </div>
          <h2
            className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
          >
            Missão, Visão{" "}
            <span className="text-gold-gradient">&amp; Valores</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="reveal service-card group relative flex flex-col gap-5 p-8 rounded-sm border border-white/10 bg-[#0F0F0F]"
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 120}ms`,
              }}
            >
              {/* Top gold accent */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#F0B429]/40 to-transparent" />

              {/* Icon */}
              <div className="w-14 h-14 rounded-sm bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center group-hover:bg-[#F0B429]/15 transition-colors duration-250">
                <card.icon className="w-7 h-7 text-[#F0B429]" />
              </div>

              {/* Title */}
              <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase tracking-wide">
                {card.title}
              </h3>

              {/* Text */}
              <p className="text-white/60 text-sm font-['DM_Sans'] leading-relaxed flex-1">
                {card.text}
              </p>

              {/* Values tags */}
              {card.values && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {card.values.map((v) => (
                    <span
                      key={v}
                      className="px-3 py-1 rounded-sm bg-[#F0B429]/10 text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-wide border border-[#F0B429]/20"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
