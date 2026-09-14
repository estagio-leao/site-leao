/*
 * LEÃO NORTH — FASE 33: branding (logo dinâmica)
 * Fonte única da "logo oficial" para GateWay, Navbar, HeaderMateriais, Footers e
 * a aba Branding do painel. Uma requisição para todo o site (promise memoizada).
 *
 * Contrato do endpoint público (api/branding.php):
 *   { "existe": true,  "logo": "/uploads/branding/logo.png", "versao": 1789... }
 *   { "existe": false, "logo": null, "versao": 0 }
 *
 * Cache-busting: toda URL devolvida por urlLogoComVersao() leva ?v=<versao>, onde
 * "versao" é o filemtime do arquivo no servidor — trocar a logo no painel invalida
 * o cache do navegador automaticamente, SEM deploy.
 *
 * Fallback total: se a API falhar (PHP offline), o JSON vier inesperado ou não
 * houver logo cadastrada, resolvemos um Branding vazio e as telas mantêm o selo
 * dourado padrão (Zap/Package). Nenhuma tela quebra.
 */

const BASE = "http://localhost/leaonorth"; // mesmo padrão dos demais endpoints

export type Branding = {
  /** True apenas quando existe arquivo de logo no servidor */
  existe: boolean;
  /** Caminho relativo vindo da API (ex.: "/uploads/branding/logo.png") */
  logo: string | null;
  /** filemtime do arquivo — usado no cache-busting (?v=) */
  versao: number;
  /** URL absoluta da logo (sem query) ou null */
  url: string | null;
};

/** Estado vazio compartilhado (também é o estado inicial dos hooks) */
export const BRANDING_VAZIO: Branding = {
  existe: false,
  logo: null,
  versao: 0,
  url: null,
};

let cache: Promise<Branding> | null = null;

// Monta a URL absoluta respeitando caminhos já absolutos (http...) por segurança
function montarUrl(logo: string): string {
  return /^https?:\/\//i.test(logo) ? logo : `${BASE}${logo}`;
}

function normalizar(dados: unknown): Branding {
  if (!dados || typeof dados !== "object") return BRANDING_VAZIO;

  const d = dados as { existe?: unknown; logo?: unknown; versao?: unknown };
  const logo = typeof d.logo === "string" && d.logo.trim() !== "" ? d.logo.trim() : null;

  if (d.existe !== true || logo === null) return BRANDING_VAZIO;

  const versao = typeof d.versao === "number" && Number.isFinite(d.versao) ? d.versao : 0;

  return { existe: true, logo, versao, url: montarUrl(logo) };
}

/**
 * Busca o branding (memoizado). Use `forcar = true` para ignorar o cache.
 * Nunca rejeita: em qualquer falha resolve BRANDING_VAZIO.
 */
export function buscarBranding(forcar = false): Promise<Branding> {
  if (forcar) cache = null;
  if (cache) return cache;

  cache = fetch(`${BASE}/api/branding.php`)
    .then((res) => res.json())
    .then((dados) => normalizar(dados))
    .catch(() => BRANDING_VAZIO);

  return cache;
}

/** Invalida o cache em módulo (chamado após o upload no painel) */
export function limparCacheBranding(): void {
  cache = null;
}

/**
 * URL pronta para o <img>, já com cache-busting (?v=<versao>).
 * Retorna null quando não há logo cadastrada (usar o selo padrão).
 */
export function urlLogoComVersao(branding: Branding): string | null {
  if (!branding.existe || !branding.url) return null;
  return `${branding.url}?v=${branding.versao}`;
}
