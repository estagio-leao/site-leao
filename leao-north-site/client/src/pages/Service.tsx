/*
 * LEÃO NORTH — Service Page (ex-Home)
 * Design: Tech Engineering Dark Gold
 * Integrates: Hero, About, Mission, Services, Sócios, Portfolio, Differentials, Testimonials, Contact
 *
 * FASE 37 — Ordem das seções: **Sócios passou a vir ANTES do Portfólio** (pedido do
 * cliente), acompanhando o novo menu do Navbar e os Links Rápidos do rodapé.
 * As âncoras `#socios` e `#portfolio` NÃO mudaram (cada seção mantém o seu `id`),
 * portanto nenhum link interno/home quebra com a reordenação.
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import MissionSection from "@/components/sections/MissionSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import DifferentialsSection from "@/components/sections/DifferentialsSection";
import SociosSection from "@/components/sections/SociosSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Service() {
  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <MissionSection />
        <ServicesSection />
        {/* FASE 37 — Sócios ANTES do Portfólio (mesma ordem do menu do Navbar) */}
        <SociosSection />
        <PortfolioSection />
        <DifferentialsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
