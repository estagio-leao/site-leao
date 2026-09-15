/*
 * LEÃO NORTH — FASE 37: Canais oficiais (fonte única das URLs)
 *
 * Antes desta fase, Instagram e Facebook viviam como placeholders ("#") dentro de
 * cada rodapé. Para os "futuros rodapés" (Service, Materiais e os que vierem),
 * todas as URLs de redes/canais passam a morar AQUI — um único ponto de manutenção.
 *
 * Decisão D1 da Fase 37: este módulo exporta APENAS strings (sem ícones/JSX), para
 * continuar sendo um arquivo de dados — cada componente monta o seu próprio array
 * `socialLinks` com os ícones que preferir (lucide-react + WhatsAppIcon.tsx).
 *
 * Ao adicionar um novo canal (ex.: LinkedIn), exporte a constante aqui e referencie
 * nos rodapés — nunca volte a escrever a URL solta no JSX.
 */

/** Instagram oficial da Leão North */
export const INSTAGRAM_URL = "https://www.instagram.com/leaonorth/";

/** Facebook oficial da Leão North */
export const FACEBOOK_URL = "https://www.facebook.com/leaonorth/";

/** WhatsApp do escritório — 55 43 99919-0467 (mesmo número do Navbar/WhatsAppButton) */
export const WHATSAPP_URL = "https://wa.me/5543999190467";
