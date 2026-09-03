/*
 * LEÃO NORTH — Contact Section
 * Design: Dark bg, form + info side by side, Google Maps embed
 */
import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { formatPhoneBR } from "@/lib/utils";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((r, i) => {
              setTimeout(() => {
                (r as HTMLElement).style.opacity = "1";
                (r as HTMLElement).style.transform = "translateY(0)";
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Enviando os dados de verdade para o backend em PHP
      const response = await fetch('http://localhost/leaonorth/api/contato.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState)
      });

      if (response.ok) {
        setSubmitted(true);
        // Limpa o formulário após envio
        setFormState({ name: "", phone: "", email: "", service: "", message: "" });
      } else {
        alert("Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  const inputClass = "w-full bg-[#111111] border border-white/10 rounded-sm px-4 py-3 text-white text-sm font-['DM_Sans'] placeholder-white/30 focus:outline-none focus:border-[#F0B429]/50 focus:ring-1 focus:ring-[#F0B429]/30 transition-all duration-200";

  // Fase 27 — embed genérico do Google Maps (sem API key) apontando para o endereço exato da empresa
  const MAPA_URL =
    "https://maps.google.com/maps?q=" +
    encodeURIComponent("R. Paraíba, 830 - Centro, Cornélio Procópio - PR") +
    "&t=&z=16&ie=UTF8&iwloc=B&output=embed";

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="py-24 lg:py-32 relative"
      style={{ background: "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="reveal flex items-center justify-center gap-3 mb-4"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
          >
            <div className="h-px w-12 bg-[#F0B429]" />
            <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
              Entre em Contato
            </span>
            <div className="h-px w-12 bg-[#F0B429]" />
          </div>
          <h2
            className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
          >
            Solicite seu{" "}
            <span className="text-gold-gradient">Orçamento</span>
          </h2>
          <p
            className="reveal text-white/50 text-base font-['DM_Sans'] mt-4 max-w-lg mx-auto"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 160ms" }}
          >
            Entre em contato conosco e receba uma proposta personalizada para o seu projeto elétrico.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          {/* Left: Contact Info */}
          <div className="flex flex-col gap-8">
            {/* Info cards */}
            {[
              {
                icon: MapPin,
                label: "Endereço",
                value: "R. Paraíba, 830 - Centro",
                sub: "Cornélio Procópio - PR",
              },
              {
                icon: Phone,
                label: "Telefone / WhatsApp",
                value: "(43) 99919-0467",
                sub: "Atendimento de seg. a sex.",
                href: "https://wa.me/5543999190467",
              },
              {
                icon: Mail,
                label: "E-mail",
                value: "contato@leaonorth.com.br",
                sub: "Resposta em até 24h",
                href: "mailto:contato@leaonorth.com.br",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className="reveal flex items-start gap-4"
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 100}ms`,
                }}
              >
                <div className="w-12 h-12 rounded-sm bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#F0B429]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.15em] uppercase mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-white font-['DM_Sans'] font-medium text-base hover:text-[#F0B429] transition-colors duration-200"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-white font-['DM_Sans'] font-medium text-base">{item.value}</p>
                  )}
                  <p className="text-white/40 text-sm font-['DM_Sans'] mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <div
              className="reveal"
              style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 300ms" }}
            >
              <a
                href="https://wa.me/5543999190467?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20instalação%20elétrica."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-sm font-['Barlow_Condensed'] font-700 text-base uppercase tracking-wider transition-all duration-200 active:scale-[0.97]"
                style={{ background: "#25D366", color: "#fff" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar pelo WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div
            className="reveal"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 200ms" }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px] p-8 rounded-sm border border-[#F0B429]/20 bg-[#F0B429]/5 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#F0B429]" />
                <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase">
                  Mensagem Enviada!
                </h3>
                <p className="text-white/60 text-sm font-['DM_Sans'] max-w-xs">
                  Obrigado pelo contato. Nossa equipe retornará em breve.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 border border-[#F0B429]/30 text-[#F0B429] font-['Barlow_Condensed'] font-600 text-sm uppercase tracking-wider rounded-sm hover:bg-[#F0B429]/10 transition-colors"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 p-8 rounded-sm border border-white/10 bg-[#0F0F0F]"
              >
                <h3 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase tracking-wide mb-2">
                  Solicitar Orçamento
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      className={inputClass}
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      placeholder="(00) 00000-0000"
                      className={inputClass}
                      value={formatPhoneBR(formState.phone)}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass}
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">
                    Tipo de Serviço
                  </label>
                  <select
                    className={inputClass}
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                  >
                    <option value="" disabled>Selecione o serviço</option>
                    <option value="residencial">Instalação Residencial</option>
                    <option value="comercial">Instalação Comercial</option>
                    <option value="industrial">Instalação Industrial</option>
                    <option value="projeto">Projeto Elétrico</option>
                    <option value="manutencao">Manutenção Elétrica</option>
                    <option value="quadro">Quadro Elétrico</option>
                    <option value="infraestrutura">Infraestrutura Elétrica</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Descreva seu projeto ou necessidade..."
                    className={`${inputClass} resize-none`}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2.5 py-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-base uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.97] transition-all duration-200 mt-2 shadow-lg shadow-[#F0B429]/20"
                >
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps */}
        <div
          className="reveal rounded-sm overflow-hidden border border-white/10"
          style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 300ms" }}
        >
          <iframe
            src={MAPA_URL}
            width="100%"
            height="380"
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Leão North — R. Paraíba, 830, Cornélio Procópio - PR"
          />
        </div>
      </div>
    </section>
  );
}
