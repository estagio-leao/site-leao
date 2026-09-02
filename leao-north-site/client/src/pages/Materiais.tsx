/*
 * LEÃO NORTH — Materiais Page (Catálogo de Produtos)
 * Design: Light Theme (fundo claro) com destaques dourados da marca
 * Fase 13 — Vitrine Agrupada:
 *   - Produtos com o mesmo `grupo_id` viram 1 único "Card de Grupo" (capa oficial + "Ver Opções")
 *   - Produtos sem grupo continuam como "Card de Produto" individual
 * Fase 20 — UI/UX da Vitrine:
 *   - Header EXCLUSIVO HeaderMateriais (busca global + Início/Contato) e FooterMateriais enxuto
 *   - Busca Global lendo ?q= da URL (nome de produto/grupo + especificações + categoria)
 *   - Sidebar vertical de categorias (desktop sticky w-64) / Sheet off-canvas (mobile)
 * Fase 21 — Refinamentos de conversão e navegação:
 *   - Estado Vazio persuasivo ("máquina de vendas") com CTA grande de WhatsApp
 *   - Ordenação Padrão / A–Z / Z–A no topo do grid
 *   - Breadcrumbs (Início > Catálogo > Categoria)
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import HeaderMateriais from "@/components/HeaderMateriais";
import FooterMateriais from "@/components/FooterMateriais";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProdutoCard, { type Produto } from "@/components/ProdutoCard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Item da vitrine: 1 card de grupo OU 1 card de produto individual
type ItemVitrine =
  | { tipo: "grupo"; grupoId: number; nomeGrupo: string; variacoes: Produto[] }
  | { tipo: "produto"; produto: Produto };

// Categoria da sidebar: nome exibido + total de produtos
type Categoria = { nome: string; total: number };

// Ordenação do grid final (Padrão = ordem original de primeira aparição)
type Ordenacao = "padrao" | "az" | "za";

// Contato do escritório (WhatsApp)
const WHATSAPP_ESCRITORIO = "https://wa.me/5543999190467";

// Ícone do WhatsApp (mesmo SVG usado nos cards de produto e no header)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Normaliza para busca permissiva em PT-BR (ignora acentos e caixa alta)
// Nota: usa a faixa de combining diacritical marks (\u0300-\u036f) em vez de
// \p{Diacritic} para compatibilidade com o target default do `tsc --noEmit`.
const normalizar = (s: string): string =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Título usado na ordenação (grupo → nomeGrupo; produto → produto.nome)
const tituloItem = (item: ItemVitrine): string =>
  item.tipo === "grupo" ? item.nomeGrupo : item.produto.nome;

// Lista de categorias (sidebar desktop + Sheet mobile) — extraída p/ reuso
function ListaCategorias({
  categorias,
  ativa,
  onSelect,
}: {
  categorias: Categoria[];
  ativa: string;
  onSelect: (nome: string) => void;
}) {
  return (
    <ul className="flex flex-col">
      {categorias.map((cat) => {
        const isAtiva = cat.nome === ativa;
        return (
          <li key={cat.nome}>
            <button
              type="button"
              onClick={() => onSelect(cat.nome)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm rounded-sm border-l-2 transition-all duration-150 ${
                isAtiva
                  ? "bg-[#F0B429] text-[#080808] border-[#F0B429] font-['DM_Sans'] font-medium"
                  : "text-slate-600 border-transparent hover:text-[#B8860B] hover:bg-white hover:border-[#F0B429]/40"
              }`}
            >
              <span className="truncate">{cat.nome === "todos" ? "Todos" : cat.nome}</span>
              <span
                className={`text-xs shrink-0 tabular-nums ${
                  isAtiva ? "text-[#080808]/60" : "text-slate-400"
                }`}
              >
                {cat.total}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Card de Grupo: representa uma família inteira (ex.: "Painel de Led Quadrado")
function GrupoCard({ grupoId, nomeGrupo, variacoes }: { grupoId: number; nomeGrupo: string; variacoes: Produto[] }) {
  const capa = variacoes[0]?.grupo_capa; // Fase 19: capa OFICIAL do grupo (nativa do JSON)
  const rotaGrupo = `/materiais/grupo/${grupoId}`; // Fase 19: passa o ID na URL

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-[#F0B429]/40 transition-all">
      {/* Capa do grupo */}
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
  const [filtrosAbertos, setFiltrosAbertos] = useState(false); // Sheet mobile
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("padrao"); // Fase 21

  // Fase 20 — Busca Global via URL: lê ?q= com a API NATIVA (window.location.search).
  // Obs.: o useLocation do wouter v3 retorna APENAS o pathname (sem query string),
  // por isso não é possível extrair o ?q= da variável `location`.
  const [, setLocation] = useLocation();
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    // Sincroniza termoBusca com ?q= a cada mudança de URL (inclusive no mesmo path,
    // ex.: /materiais → /materiais?q=led), reagindo aos eventos que o wouter v3
    // dispara ao navegar (popstate / pushState / replaceState / hashchange).
    const sync = () => {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      setTermoBusca(q);
    };
    sync(); // estado inicial (ex.: recarregar /materiais?q=led)
    window.addEventListener("popstate", sync);
    window.addEventListener("pushState", sync);
    window.addEventListener("replaceState", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("pushState", sync);
      window.removeEventListener("replaceState", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

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

  // Categorias da sidebar (derivadas dos produtos já buscados — sem request extra):
  // "Todos" + categorias em ordem alfabética, com contagem estável (não muda ao filtrar).
  const categorias = useMemo<Categoria[]>(() => {
    const mapa = new Map<string, number>();
    produtos.forEach((p) => {
      const nome = p.categoria_nome || "Geral";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });
    const lista: Categoria[] = [];
    mapa.forEach((total, nome) => lista.push({ nome, total }));
    lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return [{ nome: "todos", total: produtos.length }, ...lista];
  }, [produtos]);

  const limparBusca = () => {
    setTermoBusca("");
    setLocation("/materiais");
  };

  // Fase 21 — breadcrumb "Catálogo": limpa busca E categoria (estado local), voltando à vitrine limpa
  const irParaCatalogoLimpo = () => {
    setCategoriaAtiva("todos");
    setTermoBusca("");
    setLocation("/materiais");
  };

  const selecionarCategoria = (nome: string) => {
    setCategoriaAtiva(nome);
    setFiltrosAbertos(false); // fecha o Sheet mobile ao escolher
  };

  // 1) Filtro por categoria (sidebar)
  const porCategoria = useMemo(
    () =>
      categoriaAtiva === "todos"
        ? produtos
        : produtos.filter((p) => (p.categoria_nome || "Geral") === categoriaAtiva),
    [produtos, categoriaAtiva]
  );

  // 2) Filtro por texto (?q=) — Nome do produto/grupo + Especificações + Categoria
  const produtosFiltrados = useMemo(() => {
    const t = normalizar(termoBusca.trim());
    if (!t) return porCategoria;
    return porCategoria.filter(
      (p) =>
        normalizar(p.nome).includes(t) ||
        normalizar(p.grupo_nome || "").includes(t) ||
        normalizar(p.especificacao || "").includes(t) ||
        normalizar(p.categoria_nome || "").includes(t)
    );
  }, [porCategoria, termoBusca]);

  // 3) Vitrine mista (Fases 13/19): agrupa produtos da mesma família em 1 Card de Grupo
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

  // Fase 21 — Ordenação do array FINAL (já agrupado): Padrão | A–Z | Z–A
  const itensOrdenados = useMemo<ItemVitrine[]>(() => {
    if (ordenacao === "padrao") return itensVitrine; // ordem original (primeira aparição)
    const copia = [...itensVitrine];
    copia.sort((a, b) => {
      const cmp = normalizar(tituloItem(a)).localeCompare(
        normalizar(tituloItem(b)),
        "pt-BR"
      );
      return ordenacao === "az" ? cmp : -cmp;
    });
    return copia;
  }, [itensVitrine, ordenacao]);

  // Fase 21 — CTA de venda: mensagem pré-preenchida no WhatsApp (com o termo buscado, se houver)
  const whatsAppVenda = `${WHATSAPP_ESCRITORIO}?text=${encodeURIComponent(
    termoBusca.trim()
      ? `Olá! Não encontrei "${termoBusca}" no catálogo da Leão Materiais. Vocês têm esse item?`
      : "Olá! Gostaria de saber mais sobre os materiais elétricos da Leão North."
  )}`;

  const temResultados = !loading && !erro && itensOrdenados.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['DM_Sans']" style={{ background: "#F8FAFC" }}>
      <HeaderMateriais />

      {/* BARRA DE TÍTULO (compacta — área útil maior para o catálogo) */}
      <section className="bg-white border-b border-slate-200 pt-20 lg:pt-24 pb-6">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Fase 21 — Breadcrumb: Início > Catálogo > [Categoria] */}
          <nav aria-label="Trilha de navegação" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-['DM_Sans'] text-slate-500">
              <li>
                <Link href="/" className="hover:text-[#B8860B] transition-colors">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </li>
              <li>
                <button
                  type="button"
                  onClick={irParaCatalogoLimpo}
                  className="hover:text-[#B8860B] transition-colors"
                >
                  Catálogo
                </button>
              </li>
              {categoriaAtiva !== "todos" && (
                <>
                  <li aria-hidden="true">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </li>
                  <li aria-current="page" className="text-slate-800 font-medium">
                    {categoriaAtiva}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[#B8860B] text-xs tracking-[0.2em] uppercase font-['DM_Sans'] font-medium">
                Leão North Materiais
              </span>
              <h1 className="font-['Barlow_Condensed'] font-700 text-3xl lg:text-4xl text-slate-900 uppercase mt-1">
                Catálogo de <span className="text-gold-gradient">Materiais</span>
              </h1>
            </div>
            {termoBusca.trim() && (
              <button
                onClick={limparBusca}
                className="inline-flex items-center gap-1.5 text-sm text-[#B8860B] hover:underline font-['DM_Sans']"
              >
                Limpar busca “{termoBusca}”
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATÁLOGO: sidebar + vitrine */}
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar de categorias — DESKTOP (sticky w-64) */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <h2 className="font-['Barlow_Condensed'] font-700 text-lg text-slate-900 uppercase tracking-wide mb-3">
                Categorias
              </h2>
              <ListaCategorias
                categorias={categorias}
                ativa={categoriaAtiva}
                onSelect={selecionarCategoria}
              />
            </div>
          </aside>

          {/* Conteúdo (grid) */}
          <div className="flex-1 min-w-0">
            {/* MOBILE: botão que abre o drawer de categorias (Sheet off-canvas) */}
            <div className="lg:hidden mb-6 flex items-center gap-3">
              <Sheet open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
                <SheetContent side="left" className="w-[82%] sm:max-w-xs bg-slate-50 border-slate-200">
                  <SheetHeader className="border-b border-slate-200 pb-3 mb-2">
                    <SheetTitle className="font-['Barlow_Condensed'] text-slate-900 uppercase tracking-wide">
                      Categorias
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6 overflow-y-auto">
                    <ListaCategorias
                      categorias={categorias}
                      ativa={categoriaAtiva}
                      onSelect={selecionarCategoria}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                type="button"
                variant="outline"
                onClick={() => setFiltrosAbertos(true)}
                className="flex-1 justify-start gap-2 border-slate-300 bg-white text-slate-700 shadow-sm hover:text-[#B8860B] hover:border-[#F0B429]/50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros / Categorias
              </Button>
            </div>

            {/* Barra: resumo de resultados + ordenação */}
            {!loading && !erro && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-sm text-slate-500 font-['DM_Sans']">
                  {termoBusca.trim()
                    ? `${itensOrdenados.length} resultado${itensOrdenados.length === 1 ? "" : "s"} para “${termoBusca}”`
                    : `${itensOrdenados.length} item(ns) em exibição`}
                </p>

                {/* Fase 21 — Ordenação Padrão / A–Z / Z–A */}
                {temResultados && (
                  <label className="inline-flex items-center gap-2 text-sm font-['DM_Sans'] text-slate-500">
                    <span className="uppercase tracking-wide text-xs">Ordenar</span>
                    <select
                      value={ordenacao}
                      onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                      className="bg-white border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#F0B429] cursor-pointer"
                    >
                      <option value="padrao">Padrão</option>
                      <option value="az">A–Z</option>
                      <option value="za">Z–A</option>
                    </select>
                  </label>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center text-slate-500 py-16">Carregando produtos...</div>
            ) : erro ? (
              <div className="text-center text-slate-500 py-16">Não foi possível carregar o catálogo.</div>
            ) : itensOrdenados.length === 0 ? (
              /* Fase 21 — Estado vazio inteligente ("máquina de vendas"): busca sem resultado OU categoria vazia */
              produtos.length === 0 ? (
                <div className="text-center text-slate-400 py-16 border border-dashed border-slate-300 rounded-sm">
                  Nenhum produto disponível no momento.
                </div>
              ) : (
                <div className="text-center px-4 py-16 border border-dashed border-[#F0B429]/40 rounded-sm bg-white">
                  <h2 className="font-['Barlow_Condensed'] font-700 text-2xl sm:text-3xl text-slate-900 uppercase">
                    Não encontrou o que precisava?
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base font-['DM_Sans'] mt-3 max-w-md mx-auto">
                    Trabalhamos com itens sob encomenda e possuímos um catálogo estendido em nossa loja.
                    {termoBusca.trim() && (
                      <span className="block mt-1 text-[#B8860B]">
                        Não achamos resultados para “{termoBusca}”.
                      </span>
                    )}
                  </p>
                  <a
                    href={whatsAppVenda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-white font-['Barlow_Condensed'] font-800 text-xl uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
                  >
                    <WhatsAppIcon /> Falar com um consultor
                  </a>
                  {termoBusca.trim() && (
                    <div className="mt-5">
                      <button
                        onClick={limparBusca}
                        className="text-[#B8860B] text-sm font-['DM_Sans'] hover:underline inline-flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Limpar busca
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {itensOrdenados.map((item) =>
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
          </div>
        </div>
      </main>

      <FooterMateriais />
      <WhatsAppButton />
    </div>
  );
}
