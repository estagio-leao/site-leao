import { useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";

// TUDO DAQUI PARA BAIXO É NOVO OU MODIFICADO ATÉ O RETURN
export default function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightbox, setLightbox] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  // Novo useEffect com blindagem contra erros da API
  useEffect(() => {
    fetch('http://localhost/leaonorth/api/portfolio.php')
      .then(response => response.json())
      .then(data => {
        // Só salva se for uma lista válida, senão mantém array vazio
        if (Array.isArray(data)) {
          setPortfolioItems(data);
        } else {
          console.error("A API retornou um erro em vez de lista:", data);
          setPortfolioItems([]);
        }
      })
      .catch(error => {
        console.error("Erro ao buscar portfólio:", error);
        setPortfolioItems([]);
      });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // ... O RESTANTE DO CÓDIGO CONTINUA EXATAMENTE IGUAL AO ORIGINAL
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
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="py-24 lg:py-32 relative"
      style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #0A0A0A 100%)" }}
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
              Nossos Trabalhos
            </span>
            <div className="h-px w-12 bg-[#F0B429]" />
          </div>
          <h2
            className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
          >
            <span className="text-gold-gradient">Portfólio</span> de Projetos
          </h2>
          <p
            className="reveal text-white/50 text-base font-['DM_Sans'] mt-4 max-w-lg mx-auto"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 160ms" }}
          >
            Conheça alguns dos projetos executados com excelência técnica pela nossa equipe.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioItems.map((item, i) => (
            <div
              key={i}
              className={`reveal relative overflow-hidden rounded-sm cursor-pointer group ${item.size === "large" ? "col-span-2 lg:col-span-1 row-span-1" : ""
                } ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 100}ms`,
              }}
              onClick={() => setLightbox(item)}
            >
              <img
                src={`http://localhost/leaonorth${item.img}`}
                alt={item.title}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? "h-64 lg:h-full" : "h-48 lg:h-56"
                  }`}
                style={{ minHeight: i === 0 ? "300px" : undefined }}
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-[#080808]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.15em] uppercase">
                  {item.category}
                </span>
                <h3 className="text-white font-['Barlow_Condensed'] font-600 text-lg uppercase mt-1">
                  {item.title}
                </h3>
              </div>
              {/* Zoom icon */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-[#F0B429] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn className="w-4 h-4 text-[#080808]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-[#F0B429] rounded-sm flex items-center justify-center hover:bg-[#FFD060] transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-[#080808]" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`http://localhost/leaonorth${lightbox.img}`}
              alt={lightbox.title}
              className="w-full max-h-[80vh] object-contain rounded-sm"
            />
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.15em] uppercase border border-[#F0B429]/30 px-2 py-0.5 rounded-sm">
                {lightbox.category}
              </span>
              <h3 className="text-white font-['Barlow_Condensed'] font-600 text-xl uppercase">
                {lightbox.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
