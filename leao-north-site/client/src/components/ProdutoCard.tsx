/*
 * LEÃO NORTH — ProdutoCard (componente compartilhado da vitrine de Materiais)
 * Extraído na Fase 13 (origem: pages/Materiais.tsx) para reuso em:
 *  - pages/Materiais.tsx        (vitrine mista: cards de grupo + cards individuais)
 *  - pages/GrupoVariacoes.tsx   (lista de variações de um grupo)
 * Card individual: mini-carrossel de imagens (capa no índice 0) + "Mais Detalhes" + "Tenho Interesse"
 */
import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ProdutoImagem = { caminho_imagem: string; is_capa: boolean | number };
export type ProdutoInfo = { titulo: string; texto: string };

export type Produto = {
  id: number;
  nome: string;
  grupo: string | null; // Fase 11: grupo/família (null = produto avulso)
  especificacao: string | null;
  categoria: string | null;
  descricao: string | null;
  data_cadastro: string;
  imagens: ProdutoImagem[];
  informacoes: ProdutoInfo[];
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

// Garante que a Capa fique sempre no índice 0 do carrossel
export const normalizarImagens = (imagens: ProdutoImagem[]): ProdutoImagem[] => [
  ...imagens.filter(i => i.is_capa === true || i.is_capa === 1),
  ...imagens.filter(i => !(i.is_capa === true || i.is_capa === 1)),
];

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const imagens = normalizarImagens(produto.imagens || []);
  const total = imagens.length;
  const [fotoIndex, setFotoIndex] = useState(0);

  const prevFoto = () => setFotoIndex(i => (i - 1 + total) % total);
  const nextFoto = () => setFotoIndex(i => (i + 1) % total);

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-[#F0B429]/40 transition-all">
      {/* Mini-carrossel */}
      <div className="relative h-52 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
        {total > 0 ? (
          <img
            src={`http://localhost/leaonorth${imagens[fotoIndex].caminho_imagem}`}
            alt={produto.nome}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-slate-400 text-sm">Sem imagem</span>
        )}

        {total > 1 && (
          <>
            <button
              onClick={prevFoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-colors"
              title="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextFoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-colors"
              title="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              {fotoIndex + 1}/{total}
            </span>
          </>
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

        {/* Ações: Mais Detalhes + Tenho Interesse lado a lado */}
        <div className="flex gap-2">
          <Link
            href={`/materiais/${produto.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[#F0B429]/50 text-[#B8860B] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#F0B429]/10 transition-colors"
          >
            Mais Detalhes
          </Link>
          <a
            href={montarLinkWhats(produto)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
          >
            <WhatsAppIcon /> Tenho Interesse
          </a>
        </div>
      </div>
    </div>
  );
}
