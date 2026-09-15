/*
 * LEÃO NORTH — Footer Component
 * Design: Dark footer with gold accents, quick links, social media
 *
 * FASE 33 — Branding: a logo oficial (api/branding.php, com cache-busting ?v=)
 * substitui o selo dourado; sem logo cadastrada o selo permanece (fallback).
 * Copy: subtítulo da marca padronizado para "Instalações Elétricas" (nomenclatura legal).
 *
 * FASE 35 — Rodapé dinâmico e inteligente:
 *   - a coluna "Serviços" deixou de ser estática: lista o que está cadastrado em
 *     `servicos_categorias` (api/service/categorias.php), com fallback local que
 *     mantém a coluna preenchida enquanto a API carrega ou se ela falhar;
 *   - LinkedIn removido e WhatsApp do escritório (55 43 99919-0467) adicionado,
 *     no mesmo padrão visual/tamanho/hover;
 *   - âncoras: na landing /service rola suave até a seção; em subpáginas
 *     (/service/depoimentos, /service/socio/:id, /service/portfolio/:id) navega
 *     pelo router para /service#âncora e rola após o mount — ver lib/anchorScroll.ts.
 *
 * FASE 37 — Redes sociais reais:
 *   - Instagram e Facebook deixaram de ser placeholders ("#") e passaram a apontar
 *     para os perfis oficiais da Leão North;
 *   - os três canais (Instagram, Facebook e WhatsApp) vêm da fonte única
 *     `lib/redesSociais.ts` (decisão D1) e usam `externo: true`, que injeta
 *     target="_blank" + rel="noopener noreferrer" no spread condicional do JSX.
 *   - Nenhuma função foi removida (WhatsApp e LinkedIn-off seguem como na Fase 35).
 */
import { useEffect, useState, type ComponentType, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { navegarParaAncoraService, rolarParaAncora } from "@/lib/anchorScroll";
// FASE 35 — ícone de marca do WhatsApp (o lucide-react não o possui)
import WhatsAppIcon from "@/components/WhatsAppIcon";
// FASE 37 — canais oficiais em fonte única (Instagram/Facebook reais + WhatsApp)
import { FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/redesSociais";

const BASE = "http://localhost/leaonorth";
/* FASE 37 — a constante WHATSAPP_URL saiu daqui e agora vem de lib/redesSociais.ts */
/** Landing que contém todas as seções-âncora institucionais */
const LANDING_SERVICE = "/service";

// FASE 37 — ordem alinhada ao novo fluxo da landing: "Sócios" entra ANTES de
// "Portfólio" (mesma ordem do menu do Navbar). As âncoras NÃO mudaram — as seções
// mantêm os ids #socios e #portfolio — então nenhum link rápido quebra; a rolagem
// inteligente da Fase 35 (lib/anchorScroll.ts) continua valendo para todos eles.
const quickLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sócios", href: "#socios" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Orçamento", href: "#contato" },
];

// FASE 35 — Serviços/Categorias (servicos_categorias: id, nome, descricao)
type Servico = { id: number; nome: string; descricao?: string | null };

/**
 * Fallback local: mantém a coluna "Serviços" preenchida enquanto a API carrega
 * ou caso ela falhe (mesma filosofia da Fase 31 em ContactSection). A ordem
 * exibida é a do banco (por `id`), definida pelo admin — sem reordenação A–Z.
 */
const SERVICOS_FALLBACK: Servico[] = [
  { id: -1, nome: "Instalações Residenciais" },
  { id: -2, nome: "Instalações Comerciais" },
  { id: -3, nome: "Instalações Industriais" },
  { id: -4, nome: "Projetos Elétricos" },
  { id: -5, nome: "Manutenção Elétrica" },
  { id: -6, nome: "Quadros Elétricos" },
];

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
// noreferrer" — o mecanismo já existia no JSX abaixo e é reutilizado.
const socialLinks: SocialLink[] = [
  { icon: Instagram, href: INSTAGRAM_URL, label: "Instagram", externo: true },
  { icon: Facebook, href: FACEBOOK_URL, label: "Facebook", externo: true },
  { icon: WhatsAppIcon, href: WHATSAPP_URL, label: "WhatsApp", externo: true },
];

export default function Footer() {
  const { urlLogoService } = useBranding(); // Fase 33.1 — logo da frente Service (null = selo padrão)
  const [location, navigate] = useLocation(); // FASE 35 — decide o destino das âncoras
  const [servicos, setServicos] = useState<Servico[]>(SERVICOS_FALLBACK);

  // FASE 35 — as âncoras institucionais só existem na landing /service
  const estaNaLanding = location === LANDING_SERVICE;

  // FASE 35 — busca os serviços cadastrados (mesmo endpoint da seção /service)
  useEffect(() => {
    fetch(`${BASE}/api/service/categorias.php`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServicos(data);
      })
      .catch((error) => console.error("Erro ao buscar serviços para o rodapé:", error));
  }, []);

  /**
   * FASE 35 — href real do link: na landing é a própria âncora; fora dela aponta
   * para /service#âncora. Mantém "abrir em nova aba" e o comportamento sem JS.
   */
  const hrefAncora = (hash: string) => (estaNaLanding ? hash : `${LANDING_SERVICE}${hash}`);

  /** FASE 35 — clique: rola na landing ou navega pelo router e rola depois. */
  const handleAncora =
    (hash: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (estaNaLanding) {
        rolarParaAncora(hash);
      } else {
        navegarParaAncoraService(hash, navigate);
      }
    };

  return (
    <footer style={{ background: "#060606" }} className="relative">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#F0B429]/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              {urlLogoService ? (
                /* Logo transparente sobre o fundo escuro do rodapé */
                <div className="h-9 flex items-center justify-center">
                  <img
                    src={urlLogoService}
                    alt="Leão North Service"
                    className="h-full w-auto max-w-[160px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="font-['Barlow_Condensed'] font-800 text-xl text-white tracking-wider uppercase">
                  Leão North
                </span>
                <span className="text-[10px] text-[#F0B429] tracking-[0.15em] uppercase font-['DM_Sans'] font-medium">
                  Service
                </span>
              </div>
            </div>

            <p className="text-white/40 text-sm font-['DM_Sans'] leading-relaxed">
              Soluções elétricas inovadoras com qualidade, segurança e conformidade técnica para projetos de qualquer porte.
            </p>

            {/* Social Links */}
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

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Links Rápidos
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={hrefAncora(link.href)}
                    onClick={handleAncora(link.href)}
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services — FASE 35: lista dinâmica (servicos_categorias) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Serviços
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-2.5">
              {servicos.map((servico) => (
                <li key={servico.id}>
                  <a
                    href={hrefAncora("#servicos")}
                    onClick={handleAncora("#servicos")}
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    {servico.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Orçamento
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F0B429] mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm font-['DM_Sans'] leading-relaxed">
                  R. Paraíba, 830 - Centro<br />
                  Cornélio Procópio - PR
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F0B429] flex-shrink-0" />
                <a
                  /* FASE 37 — mesma constante usada pelas redes sociais do rodapé */
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
                  href="mailto:contato@leaonorth.com.br"
                  className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 break-all"
                >
                  contato@leaonorth.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-['DM_Sans'] text-center sm:text-left">
            © {new Date().getFullYear()} Leão North — Todos os direitos reservados.
          </p>
          <p className="text-white/25 text-xs font-['DM_Sans'] text-center sm:text-right">
            Instalações Elétricas · Cornélio Procópio - PR
          </p>
        </div>
      </div>
    </footer>
  );
}
