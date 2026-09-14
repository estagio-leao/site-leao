/*
 * LEÃO NORTH — FASE 33.1: branding (logos dinâmicas das duas frentes)
 * Fonte única das logos oficiais para Gateway, Navbar, HeaderMateriais, Footers e
 * a aba Branding do painel. Uma requisição para todo o site (promise memoizada).
 *
 * Contrato do endpoint público (api/branding.php):
 * {
 *   "service":   { "existe": true,  "logo": "/uploads/branding/logo-service.png",   "versao": 1789... },
 *   "materiais": { "existe": false, "logo": null, "versao": 0 }
 * }
 *
 * Cache-busting: toda URL devolvida por urlLogoComVersao() leva ?v=<versao>, onde
 * "versao" é o filemtime do arquivo no servidor — trocar a logo no painel invalida
 * o cache do navegador automaticamente, SEM deploy.
 *
 * Fallback total: se a API falhar (PHP offline), o JSON vier inesperado ou não
 * houver logo cadastrada, resolvemos uma frente vazia e as telas mantêm o selo
 * dourado padrão (Zap/Package). Nenhuma tela quebra.
 *
 * As logos são PNG/JPG/WEBP com fundo TRANSPARENTE e devem ser exibidas
 * diretamente sobre a cor do site (sem cartão branco de fundo).
 */

const BASE = "http://localhost/leaonorth"; // mesmo padrão dos demais endpoints

/** Informação de UMA frente (service ou materiais) */
export type LogoInfo = {
  /** True apenas quando existe arquivo de logo no servidor */
  existe: boolean;
  /** Caminho relativo vindo da API (ex.: "/uploads/branding/logo-service.png") */
  logo: string | null;
  /** filemtime do arquivo — usado no cache-busting (?v=) */
  versao: number;
  /** URL absoluta da logo (sem query) ou null */
  url: string | null;
};

export type Branding = {
  service: LogoInfo;
  materiais: LogoInfo;
};

/** Frente vazia compartilhada */
export const LOGO_VAZIA: LogoInfo = {
  existe: false,
  logo: null,
  versao: 0,
  url: null,
};

/** Estado vazio compartilhado (também é o estado inicial dos hooks) */
export const BRANDING_VAZIO: Branding = {
  service: LOGO_VAZIA,
  materiais: LOGO_VAZIA,
};

let cache: Promise<Branding> | null = null;

// Monta a URL absoluta respeitando caminhos já absolutos (http...) por segurança
function montarUrl(logo: string): string {
  return /^https?:\/\//i.test(logo) ? logo : `${BASE}${logo}`;
}

function normalizarLogo(dados: unknown): LogoInfo {
  if (!dados || typeof dados !== "object") return LOGO_VAZIA;

  const d = dados as { existe?: unknown; logo?: unknown; versao?: unknown };
  const logo = typeof d.logo === "string" && d.logo.trim() !== "" ? d.logo.trim() : null;

  if (d.existe !== true || logo === null) return LOGO_VAZIA;

  const versao = typeof d.versao === "number" && Number.isFinite(d.versao) ? d.versao : 0;

  return { existe: true, logo, versao, url: montarUrl(logo) };
}

function normalizar(dados: unknown): Branding {
  if (!dados || typeof dados !== "object") return BRANDING_VAZIO;

  const d = dados as { service?: unknown; materiais?: unknown };

  return {
    service: normalizarLogo(d.service),
    materiais: normalizarLogo(d.materiais),
  };
}

/**
 * Busca o branding das duas frentes (memoizado). Use `forcar = true` para ignorar
 * o cache. Nunca rejeita: em qualquer falha resolve BRANDING_VAZIO.
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
export function urlLogoComVersao(logo: LogoInfo): string | null {
  if (!logo.existe || !logo.url) return null;
  return `${logo.url}?v=${logo.versao}`;
}
