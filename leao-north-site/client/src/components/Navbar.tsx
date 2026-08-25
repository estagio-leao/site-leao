/*
 * LEÃO NORTH — Navbar Component
 * Design: Tech Engineering Dark Gold
 * Fixed navbar with backdrop blur on scroll, gold accent line
 * Suporta variante "dark" (padrão) e "light" (usada na página Materiais)
 */
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

type NavbarProps = {
  variant?: "dark" | "light";
};

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Sócios", href: "#socios" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar({ variant = "dark" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = variant === "light";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Classes condicionais conforme a variante
  const headerClass = isLight
    ? scrolled
      ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
      : "bg-transparent"
    : scrolled
      ? "navbar-scrolled"
      : "bg-transparent";

  const linkClass = isLight
    ? "text-sm font-medium text-slate-700 hover:text-[#B8860B] transition-colors duration-200 tracking-wide uppercase font-['DM_Sans'] relative group"
    : "text-sm font-medium text-white/80 hover:text-[#F0B429] transition-colors duration-200 tracking-wide uppercase font-['DM_Sans'] relative group";

  const mobileMenuStyle = isLight
    ? { background: "rgba(255,255,255,0.98)", backdropFilter: "blur(16px)" }
    : { background: "rgba(8,8,8,0.97)", backdropFilter: "blur(16px)" };

  const mobileLinkClass = isLight
    ? "block py-3 px-4 text-slate-700 hover:text-[#B8860B] hover:bg-slate-100 rounded-sm transition-colors duration-200 font-['DM_Sans'] font-medium tracking-wide uppercase text-sm"
    : "block py-3 px-4 text-white/80 hover:text-[#F0B429] hover:bg-white/5 rounded-sm transition-colors duration-200 font-['DM_Sans'] font-medium tracking-wide uppercase text-sm";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
    >
      {/* Gold top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F0B429] to-transparent" />

      <nav className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a
          href="#inicio"
          onClick={(e) => { e.preventDefault(); handleNavClick("#inicio"); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-sm bg-[#F0B429] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-['Barlow_Condensed'] font-800 text-xl tracking-wider uppercase ${isLight ? "text-slate-900" : "text-white"}`}>
              Leão North
            </span>
            <span className={`text-[10px] tracking-[0.15em] uppercase font-['DM_Sans'] font-medium ${isLight ? "text-[#B8860B]" : "text-[#F0B429]"}`}>
              Engenharia Elétrica
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className={linkClass}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#F0B429] transition-all duration-200 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button Desktop */}
        <a
          href="#contato"
          onClick={(e) => { e.preventDefault(); handleNavClick("#contato"); }}
          className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-sm uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.97] transition-all duration-200"
        >
          Fale Conosco
        </a>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden p-2 transition-colors ${isLight ? "text-slate-900 hover:text-[#B8860B]" : "text-white hover:text-[#F0B429]"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={mobileMenuStyle}
      >
        <ul className={`flex flex-col py-4 px-4 gap-1 border-t ${isLight ? "border-[#F0B429]/30" : "border-[#F0B429]/10"}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className={mobileLinkClass}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#contato"
              onClick={(e) => { e.preventDefault(); handleNavClick("#contato"); }}
              className="block py-3 px-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-sm uppercase tracking-wider rounded-sm text-center hover:bg-[#FFD060] transition-colors"
            >
              Fale Conosco
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
