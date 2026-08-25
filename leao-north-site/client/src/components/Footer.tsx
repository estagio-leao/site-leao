/*
 * LEÃO NORTH — Footer Component
 * Design: Dark footer with gold accents, quick links, social media
 */
import { Zap, MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from "lucide-react";

const quickLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

const services = [
  "Instalações Residenciais",
  "Instalações Comerciais",
  "Instalações Industriais",
  "Projetos Elétricos",
  "Manutenção Elétrica",
  "Quadros Elétricos",
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
              <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-['Barlow_Condensed'] font-800 text-xl text-white tracking-wider uppercase">
                  Leão North
                </span>
                <span className="text-[10px] text-[#F0B429] tracking-[0.15em] uppercase font-['DM_Sans'] font-medium">
                  Engenharia Elétrica
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
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Serviços
            </h4>
            <div className="h-px w-8 bg-[#F0B429]/40" />
            <ul className="flex flex-col gap-2.5">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#servicos"
                    onClick={(e) => { e.preventDefault(); handleNavClick("#servicos"); }}
                    className="text-white/40 text-sm font-['DM_Sans'] hover:text-[#F0B429] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#F0B429] group-hover:w-4 transition-all duration-200" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="font-['Barlow_Condensed'] font-700 text-base text-white uppercase tracking-wider">
              Contato
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
                  href="https://wa.me/5543999190467"
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
            Engenharia Elétrica · Cornélio Procópio - PR
          </p>
        </div>
      </div>
    </footer>
  );
}
