/*
 * LEÃO NORTH — Materiais Page (Catálogo de Produtos)
 * Design: Light Theme (fundo claro) com destaques dourados da marca
 * Sem scroll reveal nos cards — renderização direta
 */
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type Produto = {
  id: number;
  nome: string;
  especificacao: string | null;
  categoria: string | null;
  imagem: string | null;
  data_cadastro: string;
};

const WHATSAPP_NUMERO = "5543999190467";

const montarLinkWhats = (produto: Produto) => {
  const texto = `Olá! Tenho interesse no produto: ${produto.nome}`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Materiais() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todos");

  useEffect(() => {
    fetch("http://localhost/leaonorth/api/produtos.php")
      .then((res) => res.json())
      .then((data) => {
        // Blindagem: só salva se for lista válida (mesmo padrão do PortfolioSection)
        if (Array.isArray(data)) {
          setProdutos(data);
        } else {
          console.error("A API retornou um erro em vez de lista:", data);
          setProdutos([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos:", err);
        setProdutos([]);
        setErro(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Categorias únicas para os chips de filtro
  const categorias = useMemo(() => {
    const unicas = new Set<string>();
    produtos.forEach((p) => {
      if (p.categoria) unicas.add(p.categoria);
    });
    return ["todos", ...Array.from(unicas)];
  }, [produtos]);

  // Filtro local (sem novo request à API)
  const produtosFiltrados =
    categoriaAtiva === "todos"
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['DM_Sans']" style={{ background: "#F8FAFC" }}>
      <Navbar variant="light" />

      {/* HERO (simples e claro) */}
      <section className="bg-white border-b border-slate-200 pt-28 lg:pt-32 pb-16 lg:pb-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <span className="inline-flex items-center px-4 py-1.5 bg-[#F0B429]/10 border border-[#F0B429]/30 text-[#B8860B] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase rounded-sm">
            Leão North Materiais
          </span>
          <h1 className="font-['Barlow_Condensed'] font-700 text-4xl lg:text-6xl text-slate-900 uppercase mt-6">
            Materiais Elétricos de{" "}
            <span className="text-gold-gradient">Qualidade</span>
          </h1>
          <p className="text-slate-600 text-base lg:text-lg font-['DM_Sans'] mt-4 max-w-xl mx-auto">
            Produtos selecionados para seus projetos, com a garantia Leão North. Peça pelo WhatsApp e receba atendimento rápido.
          </p>
        </div>
      </section>

      {/* CATÁLOGO */}
      <main className="container mx-auto px-4 lg:px-8 py-14">
        {/* Chips de filtro por categoria */}
        {categorias.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {categorias.map((cat) => {
              const ativa = cat === categoriaAtiva;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-4 py-2 text-sm font-['DM_Sans'] font-medium uppercase tracking-wider rounded-sm border transition-all duration-200 ${
                    ativa
                      ? "bg-[#F0B429] text-[#080808] border-[#F0B429]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#F0B429]/40 hover:text-[#B8860B]"
                  }`}
                >
                  {cat === "todos" ? "Todos" : cat}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-16">Carregando produtos...</div>
        ) : erro ? (
          <div className="text-center text-slate-500 py-16">Não foi possível carregar o catálogo.</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center text-slate-400 py-16 border border-dashed border-slate-300 rounded-sm">
            {produtos.length === 0
              ? "Nenhum produto disponível no momento."
              : "Nenhum produto nesta categoria."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-[#F0B429]/40 transition-all"
              >
                <div className="h-52 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                  {produto.imagem ? (
                    <img
                      src={`http://localhost/leaonorth${produto.imagem}`}
                      alt={produto.nome}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-slate-400 text-sm">Sem imagem</span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[#B8860B] text-[10px] tracking-widest uppercase font-medium">
                    {produto.categoria || "Geral"}
                  </span>
                  <h3 className="text-slate-900 font-['Barlow_Condensed'] font-700 text-xl mt-1">
                    {produto.nome}
                  </h3>
                  {produto.especificacao && (
                    <p className="text-slate-600 text-sm font-['DM_Sans'] mt-2 mb-4 flex-1 line-clamp-2">
                      {produto.especificacao}
                    </p>
                  )}
                  <a
                    href={montarLinkWhats(produto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
                  >
                    <WhatsAppIcon />
                    Tenho Interesse
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
