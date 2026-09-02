/*
 * LEÃO NORTH — About Section
 * Design: Dark bg, asymmetric layout, gold accents
 */
import { useEffect, useRef } from "react";
import { CheckCircle2, Award, Users, ShieldCheck } from "lucide-react";

const ABOUT_IMG = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800";

const highlights = [
  { icon: Award, text: "Engenheiro eletricista responsável técnico" },
  { icon: Users, text: "Técnicos em eletrotécnica especializados" },
  { icon: ShieldCheck, text: "Conformidade com NR-10 e normas ABNT" },
  { icon: CheckCircle2, text: "Projetos residenciais, comerciais e industriais" },
];

export default function AboutSection() {
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
      id="sobre"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 100%)" }}
    >
      {/* Decorative gold line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#F0B429]/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Image */}
          <div className="relative order-2 lg:order-1">
            <div
              className="reveal"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.7s cubic-bezier(0.23,1,0.32,1)" }}
            >
              {/* Decorative background square */}
              <div className="absolute -bottom-6 -left-6 w-full h-full bg-[#F0B429]/5 rounded-sm border border-[#F0B429]/10" />

              <div className="relative overflow-hidden rounded-sm">
                <img
                  src={ABOUT_IMG}
                  alt="Equipe de engenharia elétrica da Leão North"
                  className="w-full h-[420px] lg:h-[500px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/40 to-transparent" />
              </div>

              {/* Experience badge */}
              <div className="absolute -top-5 -right-5 bg-[#F0B429] rounded-sm px-5 py-4 text-center shadow-xl shadow-[#F0B429]/20">
                <span className="block font-['Barlow_Condensed'] font-800 text-3xl text-[#080808] leading-none">10+</span>
                <span className="block text-[#080808]/70 text-xs font-['DM_Sans'] font-medium uppercase tracking-wider mt-1">Anos de<br/>Experiência</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            {/* Section label */}
            <div
              className="reveal flex items-center gap-3"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              <div className="h-px w-12 bg-[#F0B429]" />
              <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
                Quem Somos
              </span>
            </div>

            <h2
              className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase leading-tight"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              Excelência em{" "}
              <span className="text-gold-gradient">Engenharia</span>
              <br />
              Elétrica
            </h2>

            <p
              className="reveal text-white/60 text-base lg:text-lg font-['DM_Sans'] leading-relaxed"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              A Leão North foi constituída para fornecer serviços de instalações elétricas de
              máxima qualidade, através de profissionais qualificados e especializados. Trabalhamos
              com soluções inovadoras, seguindo normas técnicas e legislações vigentes, garantindo
              confiabilidade e segurança em todos os serviços.
            </p>

            <p
              className="reveal text-white/60 text-base font-['DM_Sans'] leading-relaxed"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              Nossa equipe é composta por <strong className="text-white font-medium">engenheiro eletricista</strong> e{" "}
              <strong className="text-white font-medium">técnicos em eletrotécnica</strong> especializados, prontos
              para atender projetos de qualquer porte com máxima competência técnica.
            </p>

            {/* Highlights */}
            <ul className="flex flex-col gap-3 mt-2">
              {highlights.map((item, i) => (
                <li
                  key={i}
                  className="reveal flex items-center gap-3"
                  style={{ opacity: 0, transform: "translateY(24px)", transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 80}ms` }}
                >
                  <div className="w-8 h-8 rounded-sm bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-[#F0B429]" />
                  </div>
                  <span className="text-white/80 text-sm font-['DM_Sans']">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
