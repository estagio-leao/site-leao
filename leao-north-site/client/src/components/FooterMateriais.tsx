/*
 * LEÃO NORTH — FooterMateriais (rodapé enxuto da frente "Leão Materiais")
 * Fase 20 — sem âncoras institucionais (Sobre/Serviços/Portfólio...): apenas
 * Logo, Redes Sociais e Direitos. Mantém o fundo escuro #060606 com dourado,
 * coerente com o restante do rodapé do site.
 *
 * FASE 33 — Branding: a logo oficial (api/branding.php, cache-busting ?v=)
 * substitui o selo dourado; sem logo cadastrada o selo permanece (fallback).
 *
 * FASE 35 — dois ajustes pedidos pelo cliente, aplicados SOMENTE neste rodapé:
 *   1) o LinkedIn saiu e entrou o WhatsApp do escritório (mesmo padrão visual);
 *   2) a logo exibida aqui é a da frente **Service** (Leão North Service), e não
 *      a de Materiais — decisão de marca do rodapé (o HeaderMateriais continua
 *      usando `urlLogoMateriais`; o texto "Leão North / Materiais" permanece).
 */
import { type ComponentType } from "react";
import { Zap, Instagram, Facebook } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
// FASE 35 — ícone de marca do WhatsApp (o lucide-react não o possui)
import WhatsAppIcon from "@/components/WhatsAppIcon";

/** Número do escritório — 55 43 99919-0467 (mesmo usado no Navbar/WhatsAppButton) */
const WHATSAPP_URL = "https://wa.me/5543999190467";

type SocialLink = {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
  /** Abre em nova aba (links externos, como o WhatsApp) */
  externo?: boolean;
};

// FASE 35 — LinkedIn removido; WhatsApp do escritório adicionado.
const socialLinks: SocialLink[] = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: WhatsAppIcon, href: WHATSAPP_URL, label: "WhatsApp", externo: true },
];

export default function FooterMateriais() {
  // FASE 35 — no RODAPÉ a marca exibida é a da frente Service (pedido do cliente);
  // o HeaderMateriais segue com a logo de Materiais.
  const { urlLogoService } = useBranding(); // null = selo dourado padrão (fallback)

  return (
    <footer style={{ background: "#060606" }} className="relative">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#F0B429]/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo / marca */}
          <div className="flex items-center gap-2.5">
            {urlLogoService ? (
              /* FASE 35 — logo da frente Service (Leão North Service) sobre o
                 fundo escuro do rodapé; sem logo cadastrada, cai no selo dourado */
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
                Materiais
              </span>
            </div>
          </div>

          {/* Redes sociais */}
          <div className="flex items-center gap-3">
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
      </div>

      {/* Bottom bar — direitos */}
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
