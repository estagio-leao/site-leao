/*
 * LEÃO NORTH — FASE 36: CartContext (Carrinho de Orçamentos da frente Materiais)
 *
 * Estado global SEM Redux: Context API nativa + localStorage (cache de UX).
 * Montado UMA vez no App.tsx, envolvendo o Router — assim o carrinho sobrevive
 * à navegação entre /materiais, /materiais/grupo/:id e /materiais/:id.
 *
 * Regras (D-decisões da Fase 36):
 *   - item repetido SOMA a quantidade;
 *   - quantidade entre 1 e 99 (o "−" no mínimo não zera; a lixeira remove);
 *   - no máximo 30 itens distintos (protege o tamanho do JSON salvo no banco);
 *   - `img` é sempre caminho relativo validado por normalizarCaminhoImagem().
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MAX_ITENS,
  MAX_QTD,
  lerCarrinhoStorage,
  limparCarrinhoStorage,
  normalizarCaminhoImagem,
  salvarCarrinhoStorage,
  totalUnidades,
  type ItemCarrinho,
} from "@/lib/carrinho";

export type ResultadoAdicionar = "ok" | "limite";

type CartContextType = {
  itens: ItemCarrinho[];
  /** Soma das quantidades — usado no badge do header. */
  totalItens: number;
  /** Quantidade de linhas distintas no carrinho. */
  totalDistintos: number;
  aberto: boolean;
  adicionarItem: (item: Omit<ItemCarrinho, "qtd">, qtd?: number) => ResultadoAdicionar;
  alterarQuantidade: (id: number, delta: number) => void;
  definirQuantidade: (id: number, qtd: number) => void;
  removerItem: (id: number) => void;
  limpar: () => void;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  alternarCarrinho: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const clampQtd = (qtd: number) => Math.min(MAX_QTD, Math.max(1, Number(qtd) || 1));

export function CartProvider({ children }: { children: ReactNode }) {
  // Leitura preguiçosa: evita "flash" de carrinho vazio no primeiro render
  const [itens, setItens] = useState<ItemCarrinho[]>(() => lerCarrinhoStorage());
  const [aberto, setAberto] = useState(false);

  // Espelha no localStorage (falhas de quota/modo privado são silenciadas no helper)
  useEffect(() => {
    salvarCarrinhoStorage(itens);
  }, [itens]);

  const adicionarItem = useCallback(
    (item: Omit<ItemCarrinho, "qtd">, qtd = 1): ResultadoAdicionar => {
      const jaExiste = itens.some((i) => i.id === item.id);
      if (!jaExiste && itens.length >= MAX_ITENS) return "limite";

      setItens((atual) => {
        const existente = atual.find((i) => i.id === item.id);
        if (existente) {
          return atual.map((i) =>
            i.id === item.id ? { ...i, qtd: clampQtd(i.qtd + Math.max(1, qtd)) } : i
          );
        }
        return [
          ...atual,
          {
            id: Number(item.id),
            nome: item.nome,
            img: normalizarCaminhoImagem(item.img),
            espec: item.espec ?? null,
            qtd: clampQtd(qtd),
          },
        ];
      });

      return "ok";
    },
    [itens]
  );

  const definirQuantidade = useCallback((id: number, qtd: number) => {
    setItens((atual) => atual.map((i) => (i.id === id ? { ...i, qtd: clampQtd(qtd) } : i)));
  }, []);

  const alterarQuantidade = useCallback((id: number, delta: number) => {
    setItens((atual) =>
      atual.map((i) => (i.id === id ? { ...i, qtd: clampQtd(i.qtd + delta) } : i))
    );
  }, []);

  const removerItem = useCallback((id: number) => {
    setItens((atual) => atual.filter((i) => i.id !== id));
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
    limparCarrinhoStorage();
  }, []);

  const abrirCarrinho = useCallback(() => setAberto(true), []);
  const fecharCarrinho = useCallback(() => setAberto(false), []);
  const alternarCarrinho = useCallback(() => setAberto((v) => !v), []);

  const value = useMemo<CartContextType>(
    () => ({
      itens,
      totalItens: totalUnidades(itens),
      totalDistintos: itens.length,
      aberto,
      adicionarItem,
      alterarQuantidade,
      definirQuantidade,
      removerItem,
      limpar,
      abrirCarrinho,
      fecharCarrinho,
      alternarCarrinho,
    }),
    [
      itens,
      aberto,
      adicionarItem,
      alterarQuantidade,
      definirQuantidade,
      removerItem,
      limpar,
      abrirCarrinho,
      fecharCarrinho,
      alternarCarrinho,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
