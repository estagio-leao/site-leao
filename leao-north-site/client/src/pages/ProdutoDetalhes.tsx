/*
 * LEÃO NORTH — Produto Detalhes (página específica do produto)
 * Design: Light Theme (fundo claro) com destaques dourados da marca
 * Galeria de fotos (capa no índice 0), descrição com quebras de linha e CTA WhatsApp
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, ChevronRight, ArrowLeft, ZoomIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type ProdutoImagem = { caminho_imagem: string; is_capa: boolean | number };
type ProdutoInfo = { titulo: string; texto: string };

type Produto = {
  id: number;
  nome: string;
  especificacao: string | null;
  categoria: string | null;
  descricao: string | null;
  data_cadastro: string;
  imagens: ProdutoImagem[];
  informacoes: ProdutoInfo[];
};

const WHATSAPP_NUMERO = "5543999190467";

// Garante que a Capa fique sempre no índice 0 da galeria
const normalizarImagens = (imagens: ProdutoImagem[]): ProdutoImagem[] => [
  ...imagens.filter(i => i.is_capa === true || i.is_capa === 1),
  ...imagens.filter(i => !(i.is_capa === true || i.is_capa === 1)),
];

export default function ProdutoDetalhes() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0); // capa selecionada por padrão

  // Estados do efeito de zoom (Fase 10)
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // posição do mouse em % (0 a 100)

  useEffect(() => {
    setNaoEncontrado(false);
    setFotoAtiva(0);
    fetch("http://localhost/leaonorth/api/produtos.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const encontrado = data.find((p: Produto) => p.id === id) || null;
          setProduto(encontrado);
          if (!encontrado) setNaoEncontrado(true);
        } else {
          setNaoEncontrado(true);
        }
      })
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  const pageClass = "min-h-screen bg-slate-50 text-slate-900 font-['DM_Sans']";

  if (naoEncontrado) {
    return (
      <div className={`${pageClass} flex flex-col`} style={{ background: "#F8FAFC" }}>
        <Navbar variant="light" />
        <main className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="font-['Barlow_Condensed'] font-700 text-3xl uppercase">Produto não encontrado</h1>
          <Link href="/materiais" className="inline-flex items-center gap-2 mt-6 text-[#B8860B] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!produto) {
    return (
      <div className={`${pageClass} flex flex-col`} style={{ background: "#F8FAFC" }}>
        <Navbar variant="light" />
        <main className="container mx-auto px-4 lg:px-8 py-24 text-center text-slate-500">
          Carregando produto...
        </main>
        <Footer />
      </div>
    );
  }

  const imagens = normalizarImagens(produto.imagens || []);
  const total = imagens.length;
  const prevFoto = () => setFotoAtiva(i => (i - 1 + total) % total);
  const nextFoto = () => setFotoAtiva(i => (i + 1) % total);

  // Calcula a posição do mouse em % (0 a 100) para o transform-origin do zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };
  const whatsLink = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`)}`;

  return (
    <div className={pageClass} style={{ background: "#F8FAFC" }}>
      <Navbar variant="light" />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
        {/* Voltar */}
        <Link href="/materiais" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#B8860B] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* GALERIA */}
          <div>
            <div
              className="relative bg-white border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center p-6 h-[420px] cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {total > 0 ? (
                <img
                  src={`http://localhost/leaonorth${imagens[fotoAtiva].caminho_imagem}`}
                  alt={produto.nome}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: isZoomed ? "scale(2)" : "scale(1)",
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transition: "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
                    cursor: isZoomed ? "zoom-out" : "zoom-in",
                  }}
                />
              ) : (
                <span className="text-slate-400 text-sm">Sem imagem</span>
              )}

              {/* Ícone de lupa (indica que a foto é interativa) */}
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 pointer-events-none transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>

              {total > 1 && (
                <>
                  <button onClick={prevFoto} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-colors" title="Foto anterior">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextFoto} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-colors" title="Próxima foto">
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
                    className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-all ${i === fotoAtiva ? "border-[#F0B429]" : "border-transparent opacity-70 hover:opacity-100"}`}
                    title={`Foto ${i + 1}${i === 0 ? " (Capa)" : ""}`}
                  >
                    <img src={`http://localhost/leaonorth${img.caminho_imagem}`} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES DO PRODUTO */}
          <div>
            <span className="inline-block px-3 py-1 bg-[#F0B429]/10 border border-[#F0B429]/30 text-[#B8860B] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase rounded-sm">
              {produto.categoria || "Geral"}
            </span>
            <h1 className="font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl text-slate-900 uppercase mt-4">
              {produto.nome}
            </h1>

            {produto.especificacao && (
              <p className="text-slate-600 text-base font-['DM_Sans'] mt-3">{produto.especificacao}</p>
            )}

            {/* Descrição — preserva quebras de linha */}
            {produto.descricao && (
              <div className="mt-6">
                <h2 className="font-['Barlow_Condensed'] font-700 text-xl text-slate-900 uppercase">Descrição</h2>
                <p className="text-slate-700 text-sm font-['DM_Sans'] leading-relaxed whitespace-pre-line mt-2">
                  {produto.descricao}
                </p>
              </div>
            )}

            {/* Informações Adicionais */}
            {produto.informacoes && produto.informacoes.length > 0 && (
              <div className="mt-6">
                <h2 className="font-['Barlow_Condensed'] font-700 text-xl text-slate-900 uppercase">Informações Adicionais</h2>
                <div className="mt-3 border border-slate-200 rounded-sm overflow-hidden divide-y divide-slate-200 bg-white">
                  {produto.informacoes.map((info, i) => (
                    <div key={i} className="grid grid-cols-2">
                      <div className="px-4 py-3 bg-slate-50 text-slate-500 text-sm font-['DM_Sans'] font-medium">{info.titulo}</div>
                      <div className="px-4 py-3 text-slate-800 text-sm font-['DM_Sans']">{info.texto}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA WhatsApp GIGANTE */}
            <a
              href={whatsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-3 py-5 bg-[#25D366] text-white font-['Barlow_Condensed'] font-800 text-xl uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              Tenho Interesse
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
