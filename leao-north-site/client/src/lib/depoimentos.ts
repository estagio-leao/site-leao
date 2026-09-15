/*
 * LEÃO NORTH — FASE 35: depoimentos (tipos + normalização + formatação)
 *
 * O endpoint público api/depoimentos.php passou a responder um OBJETO com
 * metadados globais (métricas de TODOS os registros, inclusive visivel = 0):
 *
 *   {
 *     depoimentos: Depoimento[],  // apenas visíveis (default) ou só destaques (?destaque=1)
 *     total: number,              // quantidade retornada no filtro corrente
 *     totalGlobal: number,        // COUNT(*) de TODA a tabela
 *     mediaGlobal: number         // AVG(estrelas) de TODA a tabela, 1 casa decimal
 *   }
 *
 * Este módulo centraliza a leitura dessa resposta — inclusive com TOLERÂNCIA ao
 * formato LEGADO (array puro, usado até a Fase 34), evitando quebrar a UI com um
 * bundle/browser ainda em cache ou durante o rollout.
 */
import { useCallback, useEffect, useState } from "react";

/** Depoimento cru como vem da API. */
export type Depoimento = {
  id: number;
  nome: string;
  estrelas: number;
  texto?: string | null;
  visivel?: number | boolean;
  destaque?: number | boolean;
};

/** Metadados globais (toda a tabela `depoimentos`). */
export type MetricasDepoimentos = {
  /** Quantidade retornada no filtro corrente (visíveis ou destaques). */
  total: number;
  /** Quantidade de TODOS os depoimentos cadastrados. */
  totalGlobal: number;
  /** Média de estrelas de TODOS os depoimentos (1 casa decimal). */
  mediaGlobal: number;
};

export type RespostaDepoimentos = MetricasDepoimentos & {
  depoimentos: Depoimento[];
};

const BASE = "http://localhost/leaonorth";

/** Média local (fallback) com o mesmo arredondamento do backend. */
function mediaLocal(lista: Depoimento[]): number {
  if (lista.length === 0) return 0;
  const soma = lista.reduce((acc, d) => acc + Number(d?.estrelas ?? 0), 0);
  return Number((soma / lista.length).toFixed(1));
}

/**
 * Normaliza a resposta da API aceitando os DOIS formatos:
 * - Fase 35+ → objeto `{ depoimentos, total, totalGlobal, mediaGlobal }`
 * - Legado   → array puro (neste caso as métricas globais caem para o subconjunto)
 */
export function normalizarRespostaDepoimentos(json: any): RespostaDepoimentos {
  if (Array.isArray(json)) {
    const depoimentos = json as Depoimento[];
    return {
      depoimentos,
      total: depoimentos.length,
      totalGlobal: depoimentos.length,
      mediaGlobal: mediaLocal(depoimentos),
    };
  }

  const depoimentos: Depoimento[] = Array.isArray(json?.depoimentos) ? json.depoimentos : [];

  return {
    depoimentos,
    total: typeof json?.total === "number" ? json.total : depoimentos.length,
    totalGlobal:
      typeof json?.totalGlobal === "number" ? json.totalGlobal : depoimentos.length,
    mediaGlobal:
      typeof json?.mediaGlobal === "number" ? json.mediaGlobal : mediaLocal(depoimentos),
  };
}

/** Query string do filtro de curadoria (Fase 27). */
function queryDestaques(soDestaques: boolean): string {
  return soDestaques ? "?destaque=1" : "";
}

/** Busca os depoimentos na API e já devolve tudo normalizado. */
export async function buscarDepoimentos(
  soDestaques = false
): Promise<RespostaDepoimentos> {
  const url = `${BASE}/api/depoimentos.php${queryDestaques(soDestaques)}`;
  const resposta = await fetch(url);
  const json = await resposta.json();
  return normalizarRespostaDepoimentos(json);
}

/**
 * Hook de leitura (Fase 35) — evita duplicar o fetch + normalização nos
 * componentes TestimonialsSection (Home) e Depoimentos (página completa).
 */
export function useDepoimentos(soDestaques = false) {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [metricas, setMetricas] = useState<MetricasDepoimentos>({
    total: 0,
    totalGlobal: 0,
    mediaGlobal: 0,
  });
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    buscarDepoimentos(soDestaques)
      .then((resposta) => {
        setDepoimentos(resposta.depoimentos);
        setMetricas({
          total: resposta.total,
          totalGlobal: resposta.totalGlobal,
          mediaGlobal: resposta.mediaGlobal,
        });
      })
      .catch((erro) => console.error("Erro ao buscar depoimentos:", erro))
      .finally(() => setCarregando(false));
  }, [soDestaques]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { depoimentos, metricas, carregando };
}

/** Número → string pt-BR com 1 decimal ("4,3"); "—" quando não há avaliações. */
export function formatarMedia(media: number, totalGlobal: number): string {
  return totalGlobal > 0 ? Number(media).toFixed(1).replace(".", ",") : "—";
}

/** "1 avaliação" / "N avaliações" (pt-BR). */
export function rotuloAvaliacoes(total: number): string {
  return total === 1 ? "1 avaliação" : `${total} avaliações`;
}
