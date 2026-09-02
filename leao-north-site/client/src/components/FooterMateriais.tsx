/*
 * LEÃO NORTH — FooterMateriais (rodapé enxuto da frente "Leão Materiais")
 * Fase 20 — sem âncoras institucionais (Sobre/Serviços/Portfólio...): apenas
 * Logo, Redes Sociais e Direitos. Mantém o fundo escuro #060606 com dourado,
 * coerente com o restante do rodapé do site.
 */
import { Zap, Instagram, Facebook, Linkedin } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function FooterMateriais() {
  return (
    <footer style={{ background: "#060606" }} className="relative">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#F0B429]/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo / marca */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
            </div>
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
            Leão North Materiais · Cornélio Procópio - PR
          </p>
        </div>
      </div>
    </footer>
  );
}
