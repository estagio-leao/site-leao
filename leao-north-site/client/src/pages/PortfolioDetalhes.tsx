/*
 * LEÃO NORTH — Portfolio Detalhes (página do projeto) — Fase 24
 * Rota: /service/portfolio/:id
 * Identidade escura (#080808). Galeria espelhando a UX de ProdutoDetalhes
 * (capa no índice 0, setas ‹ ›, miniaturas e zoom/lupa no desktop).
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, ChevronRight, ArrowLeft, ZoomIn, ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BASE = "http://localhost/leaonorth";
const WHATSAPP_NUMERO = "5543999190467";

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

// Garante que a Capa fique sempre no índice 0 da galeria
const normalizarImagens = (imagens: ProjetoImagem[]): ProjetoImagem[] => [
  ...imagens.filter((i) => i.is_capa === true || i.is_capa === 1),
  ...imagens.filter((i) => !(i.is_capa === true || i.is_capa === 1)),
];

export default function PortfolioDetalhes() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);

  // Estados do efeito de zoom/lupa (desktop)
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setNaoEncontrado(false);
    setFotoAtiva(0);
    fetch(`${BASE}/api/service/portfolio.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const encontrado = data.find((p: Projeto) => p.id === id) || null;
          setProjeto(encontrado);
          if (!encontrado) setNaoEncontrado(true);
        } else {
          setNaoEncontrado(true);
        }
      })
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const pageClass = "min-h-screen bg-[#080808] text-white font-['DM_Sans']";

  if (naoEncontrado) {
    return (
      <div className={`${pageClass} flex flex-col`}>
        <Navbar simple />
        <main className="container mx-auto px-4 lg:px-8 py-32 text-center">
          <h1 className="font-['Barlow_Condensed'] font-700 text-3xl uppercase text-white">
            Projeto não encontrado
          </h1>
          <Link href="/service" className="inline-flex items-center gap-2 mt-6 text-[#F0B429] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Voltar para a Leão Service
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className={`${pageClass} flex flex-col`}>
        <Navbar simple />
        <main className="container mx-auto px-4 lg:px-8 py-32 text-center text-white/50">
          Carregando projeto...
        </main>
        <Footer />
      </div>
    );
  }

  const imagens = normalizarImagens(projeto.imagens || []);
  const total = imagens.length;
  const prevFoto = () => setFotoAtiva((i) => (i - 1 + total) % total);
  const nextFoto = () => setFotoAtiva((i) => (i + 1) % total);
  const whatsLink = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
    `Olá! Gostaria de um orçamento para um projeto semelhante a: ${projeto.titulo}`
  )}`;

  return (
    <div className={`${pageClass} flex flex-col`}>
      <Navbar simple />

      <main className="container mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-10 lg:pb-14 flex-1">
        {/* Voltar */}
        <Link
          href="/service"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#F0B429] transition-colors mb-8 uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Leão Service
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* GALERIA */}
          <div>
            <div
              className="relative bg-[#111111] border border-white/10 rounded-sm overflow-hidden flex items-center justify-center h-[420px] cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {total > 0 ? (
                <img
                  src={`${BASE}${imagens[fotoAtiva].caminho_imagem}`}
                  alt={`${projeto.titulo} — foto ${fotoAtiva + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: isZoomed ? "scale(2)" : "scale(1)",
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transition: "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
                    cursor: isZoomed ? "zoom-out" : "zoom-in",
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Sem imagens</span>
                </div>
              )}

              {/* Ícone de lupa */}
              <div className="absolute top-3 right-3 w-9 h-9 bg-[#F0B429]/90 flex items-center justify-center text-[#080808] pointer-events-none transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>

              {total > 1 && (
                <>
                  <button
                    onClick={prevFoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-[#F0B429] hover:text-[#080808] text-white rounded-full flex items-center justify-center transition-colors"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextFoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-[#F0B429] hover:text-[#080808] text-white rounded-full flex items-center justify-center transition-colors"
                    title="Próxima foto"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {total > 1 && (
              <div className="flex gap-3 mt-4">
                {imagens.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoAtiva(i)}
                    className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-all ${i === fotoAtiva ? "border-[#F0B429]" : "border-transparent opacity-60 hover:opacity-100"}`}
                    title={`Foto ${i + 1}${i === 0 ? " (Capa)" : ""}`}
                  >
                    <img src={`${BASE}${img.caminho_imagem}`} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES DO PROJETO */}
          <div>
            <span className="inline-block px-3 py-1 bg-[#F0B429]/10 border border-[#F0B429]/30 text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase rounded-sm">
              {projeto.categoria_nome || "Sem categoria"}
            </span>
            <h1 className="font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl text-white uppercase mt-4">
              {projeto.titulo}
            </h1>

            {projeto.subtitulo && (
              <p className="text-[#F0B429]/90 text-base font-['DM_Sans'] mt-3">{projeto.subtitulo}</p>
            )}

            {projeto.descricao ? (
              <div className="mt-6">
                <h2 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase">Descrição</h2>
                <p className="text-white/70 text-sm font-['DM_Sans'] leading-relaxed whitespace-pre-line mt-2">
                  {projeto.descricao}
                </p>
              </div>
            ) : (
              <p className="text-white/40 text-sm font-['DM_Sans'] mt-6">
                Detalhes completos deste projeto podem ser solicitados pelo nosso time.
              </p>
            )}

            {/* CTA WhatsApp */}
            <a
              href={whatsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-3 py-5 bg-[#25D366] text-white font-['Barlow_Condensed'] font-800 text-xl uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
            >
              Solicitar Projeto Semelhante
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
