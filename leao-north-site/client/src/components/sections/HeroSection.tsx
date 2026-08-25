/*
 * LEÃO NORTH — Hero Section
 * Design: Asymmetric layout, dark background, gold accents
 * Left: headline + CTAs | Right: premium electrical image with diagonal clip
 */
import { useEffect, useRef } from "react";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663679471714/7uCDftEx5Gn2oJRKUzBfKv/hero-electrical-M36v4H2JPJf8qyrYaiMEgd.webp";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-hero-item]");
    items.forEach((item, i) => {
      setTimeout(() => {
        (item as HTMLElement).style.opacity = "1";
        (item as HTMLElement).style.transform = "translateY(0)";
      }, 200 + i * 100);
    });
  }, []);

  const scrollToSection = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080808 0%, #0F0F0F 50%, #111111 100%)" }}
    >
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #F0B429 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gold diagonal accent line */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 40%, rgba(240,180,41,0.15) 100%)",
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-16 lg:pt-0 lg:pb-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen lg:min-h-0 lg:py-32">

          {/* Left: Content */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Badge */}
            <div
              data-hero-item
              style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
              className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-sm border border-[#F0B429]/30 bg-[#F0B429]/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B429] animate-pulse" />
              <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.15em] uppercase">
                Engenharia Elétrica Especializada
              </span>
            </div>

            {/* Headline */}
            <div
              data-hero-item
              style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
            >
              <h1 className="font-['Barlow_Condensed'] font-800 text-5xl lg:text-7xl xl:text-8xl leading-none text-white uppercase">
                Instalações{" "}
                <span className="text-gold-gradient">Elétricas</span>
                <br />
                com Qualidade
                <br />
                <span className="text-white/90">e Segurança</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              data-hero-item
              style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
              className="text-white/60 text-base lg:text-lg font-['DM_Sans'] leading-relaxed max-w-lg"
            >
              A Leão North oferece soluções elétricas inovadoras para projetos residenciais,
              comerciais e industriais — com engenheiro eletricista e técnicos especializados.
            </p>

            {/* CTA Buttons */}
            <div
              data-hero-item
              style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="https://wa.me/5543999190467"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-base uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[#F0B429]/20"
              >
                <Phone className="w-4 h-4" />
                Fale Conosco
              </a>
              <button
                onClick={() => scrollToSection("#servicos")}
                className="flex items-center justify-center gap-2.5 px-7 py-4 border border-white/20 text-white font-['Barlow_Condensed'] font-600 text-base uppercase tracking-wider rounded-sm hover:border-[#F0B429]/50 hover:text-[#F0B429] active:scale-[0.97] transition-all duration-200"
              >
                Ver Serviços
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div
              data-hero-item
              style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
              className="flex gap-8 pt-4 border-t border-white/10"
            >
              {[
                { value: "100+", label: "Projetos Realizados" },
                { value: "4.2★", label: "Avaliação Google" },
                { value: "NR-10", label: "Conformidade Total" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="font-['Barlow_Condensed'] font-700 text-2xl text-[#F0B429]">
                    {stat.value}
                  </span>
                  <span className="text-white/50 text-xs font-['DM_Sans'] tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div
            data-hero-item
            style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.8s cubic-bezier(0.23,1,0.32,1)" }}
            className="relative hidden lg:block"
          >
            {/* Gold border frame */}
            <div className="absolute -top-4 -right-4 w-full h-full border border-[#F0B429]/20 rounded-sm pointer-events-none z-10" />
            <div className="absolute -top-2 -right-2 w-full h-full border border-[#F0B429]/10 rounded-sm pointer-events-none z-10" />

            <div className="relative overflow-hidden rounded-sm" style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)" }}>
              <img
                src={HERO_IMG}
                alt="Engenheiro elétrico trabalhando em painel de controle"
                className="w-full h-[560px] object-cover"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#080808]/20" />
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-8 left-8 bg-[#080808]/90 border border-[#F0B429]/30 backdrop-blur-sm rounded-sm px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#F0B429]/10 flex items-center justify-center">
                <span className="text-[#F0B429] text-lg">⚡</span>
              </div>
              <div>
                <p className="text-white font-['Barlow_Condensed'] font-600 text-sm uppercase tracking-wide">
                  Engenheiro Eletricista
                </p>
                <p className="text-white/50 text-xs font-['DM_Sans']">
                  Equipe qualificada e certificada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollToSection("#sobre")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-[#F0B429] transition-colors duration-200 animate-bounce"
        aria-label="Rolar para baixo"
      >
        <span className="text-xs font-['DM_Sans'] tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </section>
  );
}
