/*
 * LEÃO NORTH — Testimonials Section
 * Design: Dark cards, star ratings, Google rating highlight, DB Fetch Integration
 */
import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-[#F0B429] text-[#F0B429]" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState("5,0");

  useEffect(() => {
    // Busca depoimentos reais do banco
    fetch('http://localhost/leaonorth/api/depoimentos.php')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTestimonials(data);
          if (data.length > 0) {
            const sum = data.reduce((acc, curr) => acc + curr.estrelas, 0);
            const avg = (sum / data.length).toFixed(1).replace(".", ",");
            setAverageRating(avg);
          }
        }
      })
      .catch(error => console.error("Erro ao buscar depoimentos:", error));

    // O observador agora vai encontrar o elemento perfeitamente no htdocs
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
      id="depoimentos"
      ref={sectionRef}
      // Alteração: Se não houver depoimentos, a seção inteira fica invisível via CSS sem quebrar o ciclo do React
      className={`py-24 lg:py-32 relative overflow-hidden ${testimonials.length === 0 ? "hidden" : ""}`}
      style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #111111 100%)" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="reveal flex items-center justify-center gap-3 mb-4"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
          >
            <div className="h-px w-12 bg-[#F0B429]" />
            <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
              O Que Dizem Sobre Nós
            </span>
            <div className="h-px w-12 bg-[#F0B429]" />
          </div>
          <h2
            className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
          >
            <span className="text-gold-gradient">Avaliações</span> dos Clientes
          </h2>
        </div>

        {/* Google Rating Banner */}
        <div
          className="reveal flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 p-8 rounded-sm border border-[#F0B429]/20 bg-[#F0B429]/5 max-w-2xl mx-auto"
          style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 160ms" }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase tracking-wide">Google</span>
            </div>
            <span className="text-white/40 text-xs font-['DM_Sans']">Avaliações curadas</span>
          </div>

          <div className="w-px h-16 bg-white/10 hidden sm:block" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="font-['Barlow_Condensed'] font-800 text-6xl text-[#F0B429] leading-none">{averageRating}</span>
              <div className="flex flex-col gap-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= parseFloat(averageRating.replace(',','.')) ? "fill-[#F0B429] text-[#F0B429]" : "text-white/20"}`} />
                  ))}
                </div>
                <span className="text-white/50 text-xs font-['DM_Sans']">Média de avaliações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid Dinâmico */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="reveal service-card group flex flex-col gap-4 p-6 rounded-sm border border-white/10 bg-[#0F0F0F]"
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 100}ms`,
              }}
            >
              <Quote className="w-6 h-6 text-[#F0B429]/30" />
              <StarRating rating={t.estrelas} />
              <p className="text-white/60 text-sm font-['DM_Sans'] leading-relaxed flex-1 italic">
                {t.texto ? `"${t.texto}"` : ""}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div className="w-10 h-10 rounded-sm bg-[#F0B429]/20 border border-[#F0B429]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-['Barlow_Condensed'] font-700 text-sm text-[#F0B429] uppercase">
                    {t.nome.substring(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-['DM_Sans'] font-medium text-sm">{t.nome}</p>
                  <p className="text-white/40 text-xs font-['DM_Sans']">Cliente</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}