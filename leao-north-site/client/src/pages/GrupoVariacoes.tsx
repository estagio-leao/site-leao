/*
 * LEÃO NORTH — Grupo de Variações (página intermediária da vitrine)
 * Rota: /materiais/grupo/:id
 * Fase 19: busca os produtos, filtra por grupo_id (client-side) e exibe cada
 * variação com o ProdutoCard individual normal, com os nomes oficiais no header.
 * Fase 21: breadcrumb (Início > Catálogo > Categoria > Grupo) substitui o botão
 * "Voltar ao catálogo" — o próprio "Catálogo" da trilha já oferece o retorno.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";
import HeaderMateriais from "@/components/HeaderMateriais";
import FooterMateriais from "@/components/FooterMateriais";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProdutoCard, { type Produto } from "@/components/ProdutoCard";

export default function GrupoVariacoes() {
  const params = useParams<{ id: string }>();
  const grupoId = Number(params.id); // Fase 19: rota por ID (estável, sem encoding)

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost/leaonorth/api/produtos.php")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setProdutos([]);
          setNaoEncontrado(true);
          return;
        }
        // Filtro client-side (Fase 19): aproveita os dados já buscados, por grupo_id
        const filtrados = data.filter(
          (p: Produto) => Number(p.grupo_id) === grupoId
        );
        setProdutos(filtrados);
        setNaoEncontrado(filtrados.length === 0);
      })
      .catch(() => {
        setProdutos([]);
        setNaoEncontrado(true);
      })
      .finally(() => setLoading(false));
  }, [grupoId]);

  const categoria = !loading && !naoEncontrado ? produtos[0]?.categoria_nome : null;
  const grupo = !loading && !naoEncontrado ? produtos[0]?.grupo_nome : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['DM_Sans']" style={{ background: "#F8FAFC" }}>
      <HeaderMateriais />

      <main className="container mx-auto px-4 lg:px-8 pt-24 lg:pt-28 pb-10 lg:pb-14">
        {/* Fase 21 — Breadcrumb: Início > Catálogo > [Categoria] > [Grupo] */}
        <nav aria-label="Trilha de navegação" className="mb-8">
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
              <Link href="/materiais" className="hover:text-[#B8860B] transition-colors">
                Catálogo
              </Link>
            </li>
            {categoria && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </li>
                <li className="text-slate-700">{categoria}</li>
              </>
            )}
            {grupo && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </li>
                <li aria-current="page" className="text-slate-800 font-medium">
                  {grupo}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Header do grupo */}
        {!loading && !naoEncontrado && (
          <div className="mb-10 text-center">
            <span className="inline-flex items-center px-4 py-1.5 bg-[#F0B429]/10 border border-[#F0B429]/30 text-[#B8860B] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase rounded-sm">
              {produtos[0]?.categoria_nome || "Leão North Materiais"}
            </span>
            <h1 className="font-['Barlow_Condensed'] font-700 text-3xl lg:text-5xl text-slate-900 uppercase mt-4">
              {produtos[0]?.grupo_nome || "Grupo"}
            </h1>
            <p className="text-slate-600 text-sm lg:text-base font-['DM_Sans'] mt-3">
              {produtos.length} opção{produtos.length > 1 ? "ões" : ""} disponíve
              {produtos.length > 1 ? "is" : "l"} neste grupo.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-16">Carregando variações...</div>
        ) : naoEncontrado ? (
          <div className="text-center text-slate-400 py-16 border border-dashed border-slate-300 rounded-sm">
            Grupo não encontrado.
            <div className="mt-4">
              <Link href="/materiais" className="inline-flex items-center gap-2 text-[#B8860B] hover:underline">
                <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </main>

      <FooterMateriais />
      <WhatsAppButton />
    </div>
  );
}
