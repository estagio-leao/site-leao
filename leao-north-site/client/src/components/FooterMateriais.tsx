/*
 * LEÃO NORTH — FooterMateriais (rodapé da frente "Leão Materiais")
 * Fase 20 — nasceu enxuto (marca + redes + direitos), sem âncoras institucionais.
 *
 * FASE 33 — Branding: a logo oficial (api/branding.php, cache-busting ?v=)
 * substitui o selo dourado; sem logo cadastrada o selo permanece (fallback).
 *
 * FASE 35 — dois ajustes pedidos pelo cliente, aplicados SOMENTE neste rodapé:
 *   1) o LinkedIn saiu e entrou o WhatsApp do escritório (mesmo padrão visual);
 *   2) a logo exibida aqui é a da frente **Service** (Leão North Service), e não
 *      a de Materiais — decisão de marca do rodapé (o HeaderMateriais continua
 *      usando `urlLogoMateriais`; o texto "Leão North / Materiais" permanece).
 *
 * FASE 37 — Padronização, redes sociais e orçamento (mantém tudo o que existia):
 *   1) o rodapé passou a ter o MESMO layout/peso do `Footer.tsx` da Service:
 *      grid de 4 colunas, `py-16`, títulos com divisor dourado e itens com o
 *      traço animado no hover (o LAYOUT enxuto de uma linha da Fase 20 foi
 *      substituído — nenhuma função foi removida);
 *   2) Coluna 1: logo CLICÁVEL (Link → portal "/"), selo Zap como fallback e um
 *      texto descritivo da Leão North Materiais Elétricos;
 *   3) Coluna 2: links rápidos + botão "Orçamento" que abre o carrinho (Fase 36)
 *      via CartContext, sem navegação;
 *   4) Coluna 3 (DINÂMICA): **Categorias de Produtos** vindas de
 *      `api/categorias.php` (mesmo padrão da coluna "Serviços" do rodapé da
 *      Service, Fase 35), com fallback local e MODO SEGURO se a API falhar;
 *      *(ordem ajustada a pedido do cliente: Links Rápidos antes das Categorias)*;
 *   5) Coluna 4: contato da frente Materiais (endereço, WhatsApp e o e-mail
 *      oficial contato@leaonorth.com.br);
 *   6) Instagram e Facebook deixaram de ser "#" e apontam para os perfis oficiais,
 *      vindos da fonte única `lib/redesSociais.ts` (decisão D1), todos externos.
 */
import { useEffect, useState, type ComponentType } from "react";
import { Link } from "wouter";
import { Zap, MapPin, Phone, Mail, Instagram, Facebook, ShoppingCart } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
// FASE 35 — ícone de marca do WhatsApp (o lucide-react não o possui)
import WhatsAppIcon from "@/components/WhatsAppIcon";
// FASE 36 — estado global do carrinho de orçamentos (abre o drawer pelo rodapé)
import { useCart } from "@/contexts/CartContext";
// FASE 37 — canais oficiais em fonte única (Instagram/Facebook reais + WhatsApp)
import { FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/redesSociais";

/** Base das APIs/arquivos do projeto (mesmo padrão dos demais componentes). */
const BASE = "http://localhost/leaonorth";

/** E-mail oficial que recebe os orçamentos (o mesmo usado em api/contato.php). */
const EMAIL_CONTATO = "contato@leaonorth.com.br";

type SocialLink = {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
  /** Abre em nova aba (links externos, como o WhatsApp) */
  externo?: boolean;
};

// FASE 35 — LinkedIn removido; WhatsApp do escritório adicionado.
// FASE 37 — Instagram e Facebook agora apontam para os perfis OFICIAIS da Leão
// North (antes eram "#"). `externo: true` abre em nova aba com rel="noopener
// noreferrer" — o mecanismo já existia no JSX e é reutilizado.
const socialLinks: SocialLink[] = [
  { icon: Instagram, href: INSTAGRAM_URL, label: "Instagram", externo: true },
  { icon: Facebook, href: FACEBOOK_URL, label: "Facebook", externo: true },
  { icon: WhatsAppIcon, href: WHATSAPP_URL, label: "WhatsApp", externo: true },
];

// FASE 37 — Categorias de produtos (categorias: id, nome)
type Categoria = { id: number; nome: string };

/**
 * Fallback local: mantém a coluna "Categorias de Produtos" preenchida ENQUANTO a
 * API carrega (mesma filosofia da Fase 35 no rodapé da Service). Se o fetch falhar,
 * o componente entra em MODO SEGURO e estes itens NÃO são exibidos — evita links
 * para categorias que podem não existir. A ordem exibida é a do banco
 * (`api/categorias.php` → ORDER BY nome ASC), definida pelo admin, sem reordenar.
 */
const CATEGORIAS_FALLBACK: Categoria[] = [
  { id: -1, nome: "Iluminação" },
  { id: -2, nome: "Fios e Cabos" },
  { id: -3, nome: "Quadros e Disjuntores" },
  { id: -4, nome: "Materiais de Instalação" },
];

// FASE 37 — Links rápidos da frente Materiais (navegação SPA pelo wouter)
const quickLinks = [
  { label: "Catálogo completo", href: "/materiais" },
  { label: "Instalações Elétricas (Service)", href: "/service" },
  { label: "Portal Leão North", href: "/" },
];

export default function FooterMateriais() {
  // FASE 35 — no RODAPÉ a marca exibida é a da frente Service (pedido do cliente);
  // o HeaderMateriais segue com a logo de Materiais.
  const { urlLogoService } = useBranding(); // null = selo dourado padrão (fallback)
  // FASE 36/37 — gatilho do carrinho de orçamentos (aberto sem sair da página)
  const { totalItens, alternarCarrinho } = useCart();

  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_FALLBACK);
  const [falhaCategorias, setFalhaCategorias] = useState(false);

  // FASE 37 — busca as categorias cadastradas pelo admin (mesmo endpoint da vitrine
  // e da sidebar). Se falhar/vazio → MODO SEGURO: apenas um link para o catálogo.
  useEffect(() => {
    fetch(`${BASE}/api/categorias.php`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategorias(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar categorias para o rodapé de Materiais:", error);
        setFalhaCategorias(true);
      });
  }, []);

  const modoSeguro = falhaCategorias || categorias.length === 0;

  return (
    <footer style={{ background: "#060606" }} className="relative">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#F0B429]/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Coluna 1 — Marca (logo clicável) + descrição + redes sociais */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            {/* FASE 37 — a marca virou link para o portal (mesmo destino da logo
                do HeaderMateriais); o selo dourado segue como fallback (Fase 33.1) */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Leão North Materiais Elétricos">
              {urlLogoService ? (
                /* FASE 35 — logo da frente Service (Leão North Service) sobre o
                   fundo escuro do rodapé; sem logo cadastrada, cai no selo dourado */
                <div className="h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <img
                    src={urlLogoService}
                    alt="Leão North Service"
                    className="h-full w-auto max-w-[160px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="font-['Barlow_Condensed'] font-800 text-xl text-white tracking-wider uppercase">
                  Leão North
                </span>
                <span className="text-[10px] text-[#F0B429] tracking-[0.15em] uppercase font-['DM_Sans'] font-medium">
                  Materiais
                </span>
              </div>
            </Link>

            {/* FASE 37 — texto descritivo da frente (copy sem termos de engenharia) */}
            <p className="text-white/40 text-sm font-['DM_Sans'] leading-relaxed">
              Leão North Materiais Elétricos: iluminação, fios e cabos, quadros, disjuntores e
              acessórios com procedência, pronta entrega e suporte técnico em Cornélio Procópio - PR.
            </p>

            {/* FASE 37 — redes sociais REAIS (Instagram/Facebook/WhatsApp), todas externas */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  {...(social.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="w-9 h-9 rounded-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2 — Links rápidos + Orçamento (abre o carrinho da Fase 36) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Links Rápidos
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* FASE 37 — Orçamento: abre o drawer do carrinho (mesmo gatilho do header) */}
              <li>
                <button
                  type="button"
                  onClick={alternarCarrinho}
                  className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                  <ShoppingCart className="w-4 h-4" />
                  Orçamento{totalItens > 0 ? ` (${totalItens})` : ""}
                </button>
              </li>

              {/* FASE 37 — WhatsApp do escritório (externo) */}
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                  <WhatsAppIcon className="w-4 h-4" />
                  Falar no WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3 — Categorias de Produtos (FASE 37: dinâmica, api/categorias.php) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Categorias de Produtos
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-2.5">
              {modoSeguro ? (
                /* MODO SEGURO — API fora do ar/vazia: um único destino válido */
                <li>
                  <Link
                    href="/materiais"
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    Ver catálogo completo
                  </Link>
                </li>
              ) : (
                categorias.map((categoria) => (
                  <li key={categoria.id}>
                    {/* FASE 37 (D3 · Opção A) — a busca global da vitrine casa
                        `categoria_nome`, então o ?q= filtra a categoria e ainda
                        preenche a barra de busca do HeaderMateriais */}
                    <Link
                      href={`/materiais?q=${encodeURIComponent(categoria.nome)}`}
                      className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                      {categoria.nome}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Coluna 4 — Contato (FASE 37, D4: padroniza com o rodapé da Service) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Contato
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F0B429] mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm font-['DM_Sans'] leading-relaxed">
                  R. Paraíba, 830 - Centro
                  <br />
                  Cornélio Procópio - PR
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F0B429] flex-shrink-0" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200"
                >
                  (43) 99919-0467
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F0B429] flex-shrink-0" />
                <a
                  href={`mailto:${EMAIL_CONTATO}`}
                  className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 break-all"
                >
                  {EMAIL_CONTATO}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar — direitos (textos preservados da Fase 20) */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs font-['DM_Sans'] text-center sm:text-left">
            © {new Date().getFullYear()} Leão North — Todos os direitos reservados.
          </p>
          <p className="text-white/25 text-xs font-['DM_Sans'] text-center sm:text-right">
            Leão North Materiais Elétricos · Cornélio Procópio - PR
          </p>
        </div>
      </div>
    </footer>
  );
}
