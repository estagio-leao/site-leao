/*
 * LEÃO NORTH — FASE 36: Carrinho de Orçamentos (Materiais) — contratos e helpers
 *
 * Este módulo é compartilhado pelas DUAS pontas:
 *   - público: monta o documento do carrinho, fala com api/contato.php e gera o
 *     texto do WhatsApp;
 *   - painel:  lê o documento salvo na coluna `contatos.mensagem` (TEXT) e decide
 *     se renderiza a visão rica com (foto, quantidade e nome) ou o texto puro.
 *
 * CONTRATO (documento JSON salvo em `contatos.mensagem`):
 *   {
 *     "tipo": "carrinho",   // MARKER usado pelo AdminMensagens
 *     "versao": 1,
 *     "itens": [ { "id", "nome", "qtd", "img", "espec" } ]
 *   }
 *
 * ⚠️ O POST para api/contato.php envia `message` como STRING (JSON.stringify):
 * o backend faz bindParam direto dessa coluna, então objeto aninhado quebraria.
 */

/** Base das APIs/arquivos do projeto (padrão do repositório, XAMPP local). */
export const BASE = "http://localhost/leaonorth";

/** WhatsApp do escritório — mesmo número do Navbar/WhatsAppButton. */
export const WHATSAPP_MATERIAIS = "5543999190467";

/** Chave versionada do localStorage (uma v2 futura pode migrar sem quebrar). */
export const CARRINHO_STORAGE_KEY = "leaonorth:carrinho:v1";

/** Limites (espelhados na sanitização do api/contato.php). */
export const MAX_ITENS = 30;
export const MAX_QTD = 99;

export type ItemCarrinho = {
  id: number;
  nome: string;
  qtd: number;
  /** Caminho RELATIVO (/uploads/...) ou null — nunca URL absoluta. */
  img: string | null;
  espec?: string | null;
};

export type PayloadCarrinho = {
  tipo: "carrinho";
  versao: number;
  itens: ItemCarrinho[];
};

export type DadosCliente = {
  nome: string;
  telefone: string;
  email?: string;
};

/* ------------------------------------------------------------------ *
 * Imagens
 * ------------------------------------------------------------------ */

/**
 * Aceita SOMENTE caminhos locais de upload (`/uploads/...`).
 * Qualquer outro valor (URL externa, data:, javascript:) vira null — defesa
 * contra POST forjado tentando injetar conteúdo no painel.
 */
export function normalizarCaminhoImagem(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const caminho = valor.trim();
  if (!caminho.startsWith("/uploads/")) return null;
  return /^\/uploads\/[A-Za-z0-9._\-/]+$/.test(caminho) ? caminho : null;
}

/** Monta a URL final da imagem para exibição no site/painel. */
export function urlImagem(caminho: string | null | undefined): string | null {
  const seguro = normalizarCaminhoImagem(caminho);
  return seguro ? `${BASE}${seguro}` : null;
}

/* ------------------------------------------------------------------ *
 * Documento do carrinho
 * ------------------------------------------------------------------ */

/** Gera o documento a partir dos itens (aplicando os limites combinados). */
export function montarPayloadCarrinho(itens: ItemCarrinho[]): PayloadCarrinho {
  return {
    tipo: "carrinho",
    versao: 1,
    itens: itens.slice(0, MAX_ITENS).map((item) => ({
      id: Number(item.id),
      nome: String(item.nome).slice(0, 120),
      qtd: Math.min(MAX_QTD, Math.max(1, Number(item.qtd) || 1)),
      img: normalizarCaminhoImagem(item.img),
      espec: item.espec ? String(item.espec).slice(0, 120) : null,
    })),
  };
}

/** Documento → string (é isso que vai no campo `message` do POST). */
export function serializarCarrinho(itens: ItemCarrinho[]): string {
  return JSON.stringify(montarPayloadCarrinho(itens));
}

/**
 * String da coluna `mensagem` → documento do carrinho (ou null se for texto puro).
 * Robusto de propósito: qualquer falha de parse/shape cai no render atual.
 */
export function parseCarrinho(mensagem: unknown): PayloadCarrinho | null {
  if (typeof mensagem !== "string") return null;
  const texto = mensagem.trim();
  if (!texto.startsWith("{")) return null; // atalho: não tenta parse em texto livre

  try {
    const doc = JSON.parse(texto);
    if (doc?.tipo !== "carrinho" || !Array.isArray(doc.itens) || doc.itens.length === 0) {
      return null;
    }

    const itens: ItemCarrinho[] = doc.itens
      .filter((i: any) => Number.isFinite(Number(i?.id)) && typeof i?.nome === "string")
      .map((i: any) => ({
        id: Number(i.id),
        nome: String(i.nome).slice(0, 120),
        qtd: Math.min(MAX_QTD, Math.max(1, Number(i.qtd) || 1)),
        img: normalizarCaminhoImagem(i.img),
        espec: typeof i?.espec === "string" && i.espec ? String(i.espec).slice(0, 120) : null,
      }));

    return itens.length
      ? { tipo: "carrinho", versao: Number(doc.versao) || 1, itens }
      : null;
  } catch {
    return null; // texto normal (ou JSON malformado) → mantém o <p> atual
  }
}

/* ------------------------------------------------------------------ *
 * Resumos / totais
 * ------------------------------------------------------------------ */

export const totalUnidades = (itens: ItemCarrinho[]): number =>
  itens.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);

/** "3 itens · 15 unidades" */
export const resumoItens = (itens: ItemCarrinho[]): string =>
  `${itens.length} ${itens.length === 1 ? "item" : "itens"} · ${totalUnidades(itens)} ${
    totalUnidades(itens) === 1 ? "unidade" : "unidades"
  }`;

/** Resumo curto para a coluna "Mensagem" da tabela do painel: "3 itens · 15 un." */
export const resumoCurto = (itens: ItemCarrinho[]): string =>
  `${itens.length} ${itens.length === 1 ? "item" : "itens"} · ${totalUnidades(itens)} un.`;

/** Resumo enviado na coluna `servico`: "Orçamento Materiais (3 itens)". */
export const resumoServico = (itens: ItemCarrinho[]): string =>
  `Orçamento Materiais (${itens.length} ${itens.length === 1 ? "item" : "itens"})`;

/* ------------------------------------------------------------------ *
 * WhatsApp
 * ------------------------------------------------------------------ */

/** Texto formatado (apenas texto, com os asteriscos do WhatsApp). */
export function textoWhatsApp(itens: ItemCarrinho[], dados: DadosCliente): string {
  const linhas = itens.map((item, i) => `${i + 1}. ${item.qtd}x ${item.nome}`);
  const total = totalUnidades(itens);

  return [
    "*Orçamento — Leão North Materiais*",
    `Cliente: ${dados.nome}`,
    `WhatsApp: ${dados.telefone}`,
    dados.email ? `E-mail: ${dados.email}` : "",
    "",
    ...linhas,
    "",
    `Total: ${total} ${total === 1 ? "unidade" : "unidades"} em ${itens.length} ${
      itens.length === 1 ? "item" : "itens"
    }.`,
  ]
    .filter((linha) => linha !== "")
    .join("\n");
}

/** Link do wa.me já com o orçamento formatado. */
export function linkWhatsAppOrcamento(itens: ItemCarrinho[], dados: DadosCliente): string {
  return `https://wa.me/${WHATSAPP_MATERIAIS}?text=${encodeURIComponent(
    textoWhatsApp(itens, dados)
  )}`;
}

/* ------------------------------------------------------------------ *
 * Persistência (localStorage) — só cache de UX; a verdade é o registro em `contatos`
 * ------------------------------------------------------------------ */

function itemValido(valor: any): valor is ItemCarrinho {
  return (
    valor &&
    Number.isFinite(Number(valor.id)) &&
    typeof valor.nome === "string" &&
    Number.isFinite(Number(valor.qtd))
  );
}

/** Lê o carrinho salvo, descartando silenciosamente qualquer dado corrompido. */
export function lerCarrinhoStorage(): ItemCarrinho[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CARRINHO_STORAGE_KEY);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(itemValido).slice(0, MAX_ITENS).map((item: any) => ({
      id: Number(item.id),
      nome: String(item.nome).slice(0, 120),
      qtd: Math.min(MAX_QTD, Math.max(1, Number(item.qtd) || 1)),
      img: normalizarCaminhoImagem(item.img),
      espec: typeof item.espec === "string" && item.espec ? String(item.espec) : null,
    }));
  } catch {
    return [];
  }
}

/** Grava o carrinho (modo privado/quota cheia não podem quebrar a aplicação). */
export function salvarCarrinhoStorage(itens: ItemCarrinho[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(itens));
  } catch {
    /* silencioso: o carrinho continua funcionando em memória */
  }
}

/** Remove o carrinho do storage (após envio bem-sucedido). */
export function limparCarrinhoStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CARRINHO_STORAGE_KEY);
  } catch {
    /* silencioso */
  }
}
