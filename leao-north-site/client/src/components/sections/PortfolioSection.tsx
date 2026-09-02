/*
 * LEÃO NORTH — Portfolio Section
 * Fase 24: consumo de api/service/portfolio.php (projeto + imagens + capa).
 * Vitrine em "cards de projeto" com mini-carrossel (navegar ‹ › dentro do card);
 * clicar no card leva a /service/portfolio/:id.
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, ImageIcon, ZoomIn } from "lucide-react";

const BASE = "http://localhost/leaonorth";

type ProjetoImagem = { caminho_imagem: string; is_capa: boolean | number };

type Projeto = {
  id: number;
  servico_categoria_id: number | null;
  categoria_nome?: string | null;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  imagens: ProjetoImagem[];
  capa?: string | null;
};

// Mantém a Capa sempre no índice 0 do carrossel
const normalizarImagens = (imagens: ProjetoImagem[]): ProjetoImagem[] => [
  ...imagens.filter((i) => i.is_capa === true || i.is_capa === 1),
  ...imagens.filter((i) => !(i.is_capa === true || i.is_capa === 1)),
];

/* Card de projeto com mini-carrossel (estado interno por card) */
function ProjetoCard({ projeto }: { projeto: Projeto }) {
  const [, navigate] = useLocation();
  const imagens = normalizarImagens(projeto.imagens || []);
  const total = imagens.length;
  const [indice, setIndice] = useState(0);

  const irParaDetalhes = () => navigate(`/service/portfolio/${projeto.id}`);

  const prevFoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (total > 1) setIndice((i) => (i - 1 + total) % total);
  };

  const nextFoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (total > 1) setIndice((i) => (i + 1) % total);
  };

  return (
    <div
      onClick={irParaDetalhes}
      className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden group cursor-pointer flex flex-col h-full"
      title="Ver detalhes do projeto"
    >
      {/* Imagem com mini-carrossel */}
      <div className="relative h-56 overflow-hidden bg-[#080808]">
        {total > 0 ? (
          <img
            src={`${BASE}${imagens[indice].caminho_imagem}`}
            alt={`${projeto.titulo} — foto ${indice + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Setas ‹ › (clicar não navega — só troca a foto) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevFoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-[#F0B429] hover:text-[#080808] text-white rounded-full flex items-center justify-center transition-colors"
              title="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextFoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-[#F0B429] hover:text-[#080808] text-white rounded-full flex items-center justify-center transition-colors"
              title="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/60 text-white/90 text-[10px] font-['DM_Sans'] px-2 py-0.5 rounded-sm">
              {indice + 1}/{total}
            </span>
          </>
        )}

        {/* Dica de zoom/detalhes ao passar o mouse */}
        <div className="absolute top-3 right-3 w-9 h-9 bg-[#F0B429] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ZoomIn className="w-4 h-4 text-[#080808]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[#F0B429] text-[10px] font-['DM_Sans'] font-medium tracking-[0.15em] uppercase">
          {projeto.categoria_nome || "Sem categoria"} • {total} foto(s)
        </span>
        <h3 className="text-white font-['Barlow_Condensed'] font-600 text-xl uppercase mt-1 group-hover:text-[#F0B429] transition-colors">
          {projeto.titulo}
        </h3>
        {projeto.subtitulo && (
          <p className="text-white/50 text-sm font-['DM_Sans'] mt-1 leading-relaxed line-clamp-2">{projeto.subtitulo}</p>
        )}
      </div>
    </div>
  );
}

export default function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    // Busca os projetos reais (Fase 24 — api/service/portfolio.php)
    fetch(`${BASE}/api/service/portfolio.php`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setProjetos(data);
      })
      .catch((error) => console.error("Erro ao buscar portfólio:", error));

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
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

        {/* Grid de Cards de Projeto (mini-carrossel) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((projeto, i) => (
            <div
              key={projeto.id}
              className="reveal"
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 100}ms`,
              }}
            >
              <ProjetoCard projeto={projeto} />
            </div>
          ))}
          {projetos.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
              Nossos projetos estarão disponíveis em breve.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
