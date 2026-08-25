/*
 * LEÃO NORTH — Service Page (ex-Home)
 * Design: Tech Engineering Dark Gold
 * Integrates: Hero, About, Mission, Services, Portfolio, Differentials, Sócios, Testimonials, Contact
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
        <PortfolioSection />
        <DifferentialsSection />
        <SociosSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
