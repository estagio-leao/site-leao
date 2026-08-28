/*
 * LEÃO NORTH — Grupo de Variações (página intermediária da vitrine)
 * Rota: /materiais/grupo/:id
 * Fase 19: busca os produtos, filtra por grupo_id (client-side) e exibe cada
 * variação com o ProdutoCard individual normal, com os nomes oficiais no header.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['DM_Sans']" style={{ background: "#F8FAFC" }}>
      <Navbar variant="light" />

      <main className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
        {/* Voltar */}
        <Link
          href="/materiais"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#B8860B] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>

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

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
