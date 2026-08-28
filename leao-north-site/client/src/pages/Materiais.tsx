/*
 * LEÃO NORTH — Materiais Page (Catálogo de Produtos)
 * Design: Light Theme (fundo claro) com destaques dourados da marca
 * Fase 13 — Vitrine Agrupada:
 *   - Produtos com o mesmo `grupo` viram 1 único "Card de Grupo" (badge "X opções disponíveis" + "Ver Opções")
 *   - Produtos sem grupo (null/"") continuam como "Card de Produto" individual
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProdutoCard, { type Produto } from "@/components/ProdutoCard";

// Item da vitrine: 1 card de grupo OU 1 card de produto individual
type ItemVitrine =
  | { tipo: "grupo"; grupoId: number; nomeGrupo: string; variacoes: Produto[] }
  | { tipo: "produto"; produto: Produto };

// Card de Grupo: representa uma família inteira (ex.: "Painel de Led Quadrado")
function GrupoCard({ grupoId, nomeGrupo, variacoes }: { grupoId: number; nomeGrupo: string; variacoes: Produto[] }) {
  const capa = variacoes[0]?.grupo_capa; // Fase 19: capa OFICIAL do grupo (nativa do JSON)
  const rotaGrupo = `/materiais/grupo/${grupoId}`; // Fase 19: passa o ID na URL

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-[#F0B429]/40 transition-all">
      {/* Capa do grupo (imagem da 1ª variação) */}
      <div className="relative h-52 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
        {capa ? (
          <img
            src={`http://localhost/leaonorth${capa}`}
            alt={nomeGrupo}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-slate-400 text-sm">Sem imagem</span>
        )}
        {/* Badge: quantidade de opções disponíveis */}
        <span className="absolute top-2 left-2 bg-[#F0B429] text-[#080808] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          {variacoes.length} opções disponíveis
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-[#B8860B] text-[10px] tracking-widest uppercase font-medium">
          {variacoes[0]?.categoria_nome || "Geral"}
        </span>
        <h3 className="text-slate-900 font-['Barlow_Condensed'] font-700 text-xl mt-1">
          {nomeGrupo}
        </h3>
        <p className="text-slate-600 text-sm font-['DM_Sans'] mt-2 mb-4 flex-1">
          Escolha entre {variacoes.length} opção{variacoes.length > 1 ? "ões" : ""} deste grupo.
        </p>

        {/* Ação: Ver Opções → página de variações */}
        <Link
          href={rotaGrupo}
          className="flex items-center justify-center gap-2 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          Ver Opções
        </Link>
      </div>
    </div>
  );
}

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
      if (p.categoria_nome) unicas.add(p.categoria_nome);
    });
    return ["todos", ...Array.from(unicas)];
  }, [produtos]);

  // Filtro local por categoria (sem novo request à API)
  const produtosFiltrados = useMemo(
    () =>
      categoriaAtiva === "todos"
        ? produtos
        : produtos.filter((p) => p.categoria_nome === categoriaAtiva),
    [produtos, categoriaAtiva]
  );

  // Vitrine mista (Fase 13): agrupa produtos da mesma família em 1 Card de Grupo
  const itensVitrine = useMemo<ItemVitrine[]>(() => {
    const mapa = new Map<number, Produto[]>();
    const ordem: number[] = []; // ordem de primeira aparição de cada grupo
    const itens: ItemVitrine[] = [];

    for (const p of produtosFiltrados) {
      const gid = p.grupo_id; // Fase 19: agrupa por ID
      if (gid === null || gid === undefined) {
        // Produto sem grupo → card individual
        itens.push({ tipo: "produto", produto: p });
      } else {
        if (!mapa.has(gid)) {
          mapa.set(gid, []);
          ordem.push(gid);
        }
        mapa.get(gid)!.push(p);
      }
    }

    // Cada grupo vira 1 único card de grupo (na ordem de primeira aparição)
    for (const gid of ordem) {
      const variacoes = mapa.get(gid)!;
      itens.push({
        tipo: "grupo",
        grupoId: gid,
        nomeGrupo: variacoes[0]?.grupo_nome || "Grupo",
        variacoes,
      });
    }

    return itens;
  }, [produtosFiltrados]);

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
        ) : itensVitrine.length === 0 ? (
          <div className="text-center text-slate-400 py-16 border border-dashed border-slate-300 rounded-sm">
            {produtos.length === 0
              ? "Nenhum produto disponível no momento."
              : "Nenhum produto nesta categoria."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itensVitrine.map((item) =>
              item.tipo === "grupo" ? (
                <GrupoCard
                  key={`grupo-${item.grupoId}`}
                  grupoId={item.grupoId}
                  nomeGrupo={item.nomeGrupo}
                  variacoes={item.variacoes}
                />
              ) : (
                <ProdutoCard key={item.produto.id} produto={item.produto} />
              )
            )}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
